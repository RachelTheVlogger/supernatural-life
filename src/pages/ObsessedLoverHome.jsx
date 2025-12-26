import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Eye, Droplets, AlertTriangle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function ObsessedLoverHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [showingTruth, setShowingTruth] = useState(false);
  const [helping, setHelping] = useState(false);
  const [outcome, setOutcome] = useState('');

  const urlParams = new URLSearchParams(location.search);
  const loverId = urlParams.get('id');

  const { data: lovers = [] } = useQuery({
    queryKey: ['obsessedLovers'],
    queryFn: () => base44.entities.ObsessedLover.list()
  });

  const lover = lovers.find(l => l.id === loverId) || lovers[0];

  const { data: killers = [] } = useQuery({
    queryKey: ['serialKillers'],
    queryFn: () => base44.entities.SerialKiller.list()
  });

  const killer = killers.find(k => k.id === lover?.killer_id);

  const { data: victims = [] } = useQuery({
    queryKey: ['victims'],
    queryFn: () => base44.entities.Victim.filter({ killer_id: killer?.id })
  });

  if (!lover || !killer) {
    navigate(createPageUrl('Home'));
    return null;
  }

  const handleDiscoverTruth = async () => {
    setShowingTruth(true);
    
    setTimeout(async () => {
      await base44.entities.ObsessedLover.update(lover.id, {
        knows_truth: true,
        obsession_stage: Math.min(5, lover.obsession_stage + 1),
        devotion: Math.min(100, lover.devotion + 30)
      });

      await base44.entities.NightLog.create({
        entry: `${lover.name} discovered the truth. They know what ${killer.killer_name} is. And they still love them.`,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();
      setShowingTruth(false);
    }, 3000);
  };

  const handleHelp = async (action) => {
    setHelping(true);

    const actions = {
      coverup: {
        text: 'You cleaned up the evidence. Wiped down surfaces. Made it disappear. For them.',
        guilt: 20,
        devotion: 15,
        boundary: 'cleanup_crew'
      },
      alibi: {
        text: 'You lied to the police. Said they were with you. Looked them in the eye. Protected them.',
        guilt: 15,
        devotion: 20,
        boundary: 'lookout_only'
      },
      lookout: {
        text: 'You stood watch. Texted them when it was clear. Enabled them. You\'re complicit now.',
        guilt: 25,
        devotion: 25,
        boundary: 'lookout_only'
      },
      dispose: {
        text: 'You helped dispose of the body. Your hands touched death. For love. You\'re in this now.',
        guilt: 40,
        devotion: 30,
        boundary: 'cleanup_crew'
      }
    };

    const chosen = actions[action];
    setOutcome(chosen.text);

    setTimeout(async () => {
      await base44.entities.ObsessedLover.update(lover.id, {
        crimes_helped_with: lover.crimes_helped_with + 1,
        guilt_level: Math.min(100, lover.guilt_level + chosen.guilt),
        devotion: Math.min(100, lover.devotion + chosen.devotion),
        boundaries: chosen.boundary,
        mental_state: lover.guilt_level + chosen.guilt > 70 ? 'unhinged' : lover.guilt_level + chosen.guilt > 40 ? 'conflicted' : 'stable'
      });

      await base44.entities.SerialKiller.update(killer.id, {
        suspicion_level: Math.max(0, killer.suspicion_level - 10)
      });

      await base44.entities.NightLog.create({
        entry: `${lover.name}: ${chosen.text}`,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();
      
      setTimeout(() => {
        setHelping(false);
        setOutcome('');
      }, 4000);
    }, 2000);
  };

  const getMentalStateColor = () => {
    switch(lover.mental_state) {
      case 'stable': return 'text-green-400';
      case 'denial': return 'text-yellow-400';
      case 'conflicted': return 'text-orange-400';
      case 'unhinged': return 'text-red-400';
      case 'gone': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-pink-950 to-black p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => navigate(createPageUrl('SerialKillerHome'))} className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={() => navigate(createPageUrl('SerialKillerHome'))}
            className="text-red-400 hover:text-red-300 text-sm"
          >
            Switch to Killer →
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{lover.name}</h1>
          <p className="text-pink-400">Obsessed with {killer.killer_name}</p>
          <p className={`text-sm ${getMentalStateColor()} capitalize mt-1`}>{lover.mental_state}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-pink-950/40 border border-pink-500/30 rounded-xl p-4">
            <Heart className="w-6 h-6 text-pink-400 mb-2" />
            <p className="text-2xl font-bold text-white">{lover.devotion}%</p>
            <p className="text-xs text-gray-400">Devotion</p>
          </div>
          <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4">
            <Droplets className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-white">{lover.guilt_level}%</p>
            <p className="text-xs text-gray-400">Guilt</p>
          </div>
          <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-4">
            <Eye className="w-6 h-6 text-red-400 mb-2" />
            <p className="text-2xl font-bold text-white">{lover.crimes_helped_with}</p>
            <p className="text-xs text-gray-400">Crimes</p>
          </div>
          <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-4">
            <AlertTriangle className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-white capitalize">{lover.obsession_stage}/5</p>
            <p className="text-xs text-gray-400">Obsession</p>
          </div>
        </div>

        {/* Discover Truth */}
        {!lover.knows_truth && lover.devotion >= 40 && (
          <button
            onClick={handleDiscoverTruth}
            disabled={showingTruth}
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-800 text-white font-bold py-4 rounded-xl mb-6 disabled:opacity-50"
          >
            {showingTruth ? 'Discovering...' : '🔍 Discover The Truth'}
          </button>
        )}

        {/* Help Actions */}
        {lover.knows_truth && !helping && !outcome && (
          <div className="space-y-4 mb-6">
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h3 className="text-white text-xl font-bold mb-4">How Will You Help?</h3>
              <div className="grid gap-3">
                <button
                  onClick={() => handleHelp('coverup')}
                  className="bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 rounded-xl p-4 text-left"
                >
                  <h4 className="text-white font-medium mb-1">🧹 Clean Up Evidence</h4>
                  <p className="text-gray-400 text-sm">Make it disappear</p>
                </button>

                <button
                  onClick={() => handleHelp('alibi')}
                  className="bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-xl p-4 text-left"
                >
                  <h4 className="text-white font-medium mb-1">🤥 Provide Alibi</h4>
                  <p className="text-gray-400 text-sm">Lie to the police</p>
                </button>

                <button
                  onClick={() => handleHelp('lookout')}
                  className="bg-orange-900/40 hover:bg-orange-900/60 border border-orange-500/30 rounded-xl p-4 text-left"
                >
                  <h4 className="text-white font-medium mb-1">👁️ Be Lookout</h4>
                  <p className="text-gray-400 text-sm">Watch while they work</p>
                </button>

                <button
                  onClick={() => handleHelp('dispose')}
                  className="bg-gray-900/40 hover:bg-gray-900/60 border border-gray-500/30 rounded-xl p-4 text-left"
                  disabled={lover.boundaries === 'will_not_kill'}
                >
                  <h4 className="text-white font-medium mb-1">💀 Help Dispose Body</h4>
                  <p className="text-gray-400 text-sm">Cross the ultimate line</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Relationship Status */}
        <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
          <h3 className="text-white font-bold mb-3">Your Relationship</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Knows Truth:</span>
              <span className={lover.knows_truth ? 'text-red-400' : 'text-gray-500'}>
                {lover.knows_truth ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Boundaries:</span>
              <span className="text-white capitalize">{lover.boundaries.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Would Turn Them In:</span>
              <span className={lover.would_turn_them_in ? 'text-red-400' : 'text-green-400'}>
                {lover.would_turn_them_in ? 'Yes' : 'Never'}
              </span>
            </div>
          </div>
        </div>

        {/* Their Kills */}
        {lover.knows_truth && victims.length > 0 && (
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="text-white font-bold mb-3">You Know About</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {victims.map(victim => (
                <div key={victim.id} className="bg-gray-700 rounded-lg p-3">
                  <p className="text-white font-medium">{victim.victim_name}</p>
                  <p className="text-gray-400 text-xs">{victim.location}</p>
                  {victim.lover_involvement !== 'none' && (
                    <p className="text-pink-400 text-xs mt-1">You: {victim.lover_involvement.replace(/_/g, ' ')}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {showingTruth && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            >
              <motion.div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full text-center">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                  <Eye className="w-24 h-24 text-red-500 mx-auto mb-4" />
                </motion.div>
                <p className="text-white text-lg">You found the trophies. You know what they are. What they've done.</p>
                <p className="text-pink-400 text-lg mt-4">And you love them anyway.</p>
              </motion.div>
            </motion.div>
          )}

          {outcome && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            >
              <motion.div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full text-center">
                <p className="text-white text-lg leading-relaxed">{outcome}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}