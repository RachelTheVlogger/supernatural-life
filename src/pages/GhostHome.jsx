import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ghost as GhostIcon, Eye, Zap, Heart, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const GHOST_ACTIONS = [
  { id: 'haunt', label: 'Haunt Location', power: 5, desc: 'Make your presence known' },
  { id: 'possess', label: 'Possess Someone', power: 10, desc: 'Take control of a body' },
  { id: 'poltergeist', label: 'Poltergeist Activity', power: 8, desc: 'Move objects violently' },
  { id: 'manifest', label: 'Full Manifestation', power: 15, desc: 'Become visible and solid' },
  { id: 'investigate', label: 'Investigate Death', power: 3, desc: 'Seek truth about your end' },
  { id: 'move_on', label: 'Attempt to Move On', power: 0, desc: 'Find peace', special: 'Business resolved' }
];

export default function GhostHome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');

  const { data: ghosts = [] } = useQuery({
    queryKey: ['ghosts'],
    queryFn: () => base44.entities.Ghost.list()
  });

  const ghost = ghosts[0];

  const handleAction = async (action) => {
    if (!ghost) return;
    setProcessing(true);

    setTimeout(async () => {
      const newPower = Math.min(100, (ghost.spectral_power || 20) + action.power);

      const updates = {
        spectral_power: newPower,
        possession_attempts: (ghost.possession_attempts || 0) + (action.id === 'possess' ? 1 : 0),
        manifestation_strength: Math.min(100, (ghost.manifestation_strength || 30) + (action.id === 'manifest' ? 5 : 0))
      };

      if (action.id === 'investigate') {
        const progress = Math.random();
        if (progress > 0.7) {
          updates.ready_to_move_on = true;
        }
      }

      await base44.entities.Ghost.update(ghost.id, updates);

      const outcomes = {
        haunt: ['Lights flickered. Objects moved. They know you\'re here now.', 'Cold spots spread through the building. Your domain marked.', 'Footsteps echoed in empty halls. Your presence undeniable.'],
        possess: ['You slipped into their body. Flesh again. Temporary but real.', 'Their consciousness suppressed. You controlled their limbs. Living once more.', 'Possession complete. You wore them like a suit. Strange freedom.'],
        poltergeist: ['Furniture flew. Glass shattered. Rage given form.', 'Objects obeyed your will. Chaos incarnate. They fled screaming.', 'Telekinetic fury. You threw everything. Destruction therapeutic.'],
        manifest: ['You became solid. Visible. Almost alive. They saw you clearly.', 'Full materialization achieved. You walked through walls no more. Real.', 'Spectral form solidified. You touched physical world. Almost human.'],
        investigate: ['You uncovered truth about your death. Pieces falling together.', 'New evidence found. Your killer\'s name surfaces. Justice soon.', 'Memories flooding back. How you died. Why you\'re trapped.'],
        move_on: ['Light appeared. Warmth. Peace. You stepped toward it...', 'Unfinished business complete. You can rest now. Finally.', 'The veil thinned. Beyond called. You answered. Free at last.']
      };

      setOutcome(outcomes[action.id][Math.floor(Math.random() * outcomes[action.id].length)]);

      await base44.entities.NightLog.create({
        entry: `${ghost.name}: ${outcomes[action.id][0]}`,
        category: 'spectral',
        intensity: action.id === 'move_on' ? 'extreme' : 'significant'
      });

      if (action.id === 'move_on' && ghost.ready_to_move_on) {
        setTimeout(async () => {
          await base44.entities.Ghost.delete(ghost.id);
          queryClient.invalidateQueries();
          navigate(createPageUrl('Home'));
        }, 3000);
      }

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  if (!ghost) {
    return (
      <div className="min-h-screen bg-black p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No ghost found</p>
          <button
            onClick={() => navigate(createPageUrl('Home'))}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6 pb-32">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-bold text-gray-100 mb-2">{ghost.name}</h1>
        <p className="text-gray-400 text-sm mb-8">👻 Ghost • Haunting {ghost.haunting_location || 'unknown'}</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          <div className="bg-gray-900/60 border border-gray-600/30 rounded-lg p-4">
            <Eye className="w-5 h-5 text-gray-400 mb-2" />
            <p className="text-gray-400 text-xs">Manifestation</p>
            <p className="text-white text-2xl font-bold">{ghost.manifestation_strength}%</p>
          </div>
          <div className="bg-gray-900/60 border border-purple-600/30 rounded-lg p-4">
            <Zap className="w-5 h-5 text-purple-400 mb-2" />
            <p className="text-purple-400 text-xs">Spectral Power</p>
            <p className="text-white text-2xl font-bold">{ghost.spectral_power}%</p>
          </div>
          <div className="bg-gray-900/60 border border-blue-600/30 rounded-lg p-4">
            <Heart className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-blue-400 text-xs">Unfinished Business</p>
            <p className="text-white text-sm">{ghost.ready_to_move_on ? '✓ Resolved' : 'Pending'}</p>
          </div>
        </div>

        {/* Actions */}
        <AnimatePresence mode="wait">
          {outcome ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-900/60 rounded-xl p-8 text-center border border-gray-600/30"
            >
              <p className="text-gray-100 text-lg leading-relaxed">{outcome}</p>
            </motion.div>
          ) : processing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <GhostIcon className="w-12 h-12 text-gray-400 mx-auto" />
              </motion.div>
              <p className="text-gray-400 mt-4">Manifesting...</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {GHOST_ACTIONS.map((action, i) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleAction(action)}
                  disabled={action.special && !ghost.ready_to_move_on}
                  className="w-full bg-gradient-to-r from-gray-900/80 to-gray-950/80 hover:from-gray-800/80 hover:to-gray-900/80 border-2 border-gray-600/50 rounded-xl py-4 px-6 disabled:opacity-50"
                >
                  <div className="flex justify-between items-center">
                    <div className="text-left">
                      <p className="text-white font-bold">{action.label}</p>
                      <p className="text-gray-400 text-xs">{action.desc}</p>
                    </div>
                    {action.power > 0 && (
                      <div className="text-right text-xs">
                        <p className="text-purple-400">+{action.power} Power</p>
                      </div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}