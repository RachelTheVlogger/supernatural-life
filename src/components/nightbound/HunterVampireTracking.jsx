import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Heart, Crosshair, MapPin, Clock, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import HunterVampireInteraction from './HunterVampireInteraction';

const TRACKING_ACTIONS = [
  { id: 'follow', label: 'Follow them secretly', bond: 5, risk: 30 },
  { id: 'observe', label: 'Observe from distance', bond: 3, risk: 10 },
  { id: 'interact', label: 'Approach them directly', bond: 10, risk: 50 },
  { id: 'gift', label: 'Leave anonymous gift', bond: 8, risk: 5 },
  { id: 'protect', label: 'Protect them from threat', bond: 15, risk: 40 },
  { id: 'talk', label: 'Strike up conversation', bond: 12, risk: 25 }
];

export default function HunterVampireTracking({ hunter, vampire, onClose }) {
  const queryClient = useQueryClient();
  const [tracking, setTracking] = useState(false);
  const [outcome, setOutcome] = useState(null);
  const [showInteraction, setShowInteraction] = useState(false);
  const [relationship, setRelationship] = useState(vampire.hunter_relationship || 0);

  const handleTrackingAction = async (action) => {
    setTracking(true);
    
    const success = Math.random() * 100 > action.risk;
    const bondGain = success ? action.bond : Math.floor(action.bond / 2);
    const newRelationship = Math.min(100, relationship + bondGain);
    
    const outcomes = {
      follow: success 
        ? `You tailed ${vampire.vampire_name} through the city. They didn't notice you. You learned their feeding patterns and favorite locations.`
        : `${vampire.vampire_name} noticed you following them. They gave you a knowing look but didn't attack. Interesting.`,
      observe: success
        ? `You watched ${vampire.vampire_name} from afar. They seem... lonely. Not the monster you expected.`
        : `${vampire.vampire_name} sensed your presence. They looked directly at your hiding spot and smiled. Did they... want to be watched?`,
      interact: success
        ? `You approached ${vampire.vampire_name} directly. To your surprise, they didn't attack. You had a civil conversation. There's something here.`
        : `${vampire.vampire_name} was defensive when you approached. But they didn't hurt you. They just... left. There's humanity in them.`,
      gift: success
        ? `You left a bottle of rare blood at their usual spot. Later, you saw them find it. They looked around, searching for you. Was that gratitude?`
        : `${vampire.vampire_name} found your gift. They seem confused but... touched. They kept it.`,
      protect: success
        ? `Another hunter was about to strike ${vampire.vampire_name}. You intervened. They looked at you with genuine surprise and... something else. Gratitude? Trust?`
        : `You tried to protect ${vampire.vampire_name} but they handled the threat themselves. Still, they noticed your intent. They nodded at you before disappearing.`,
      talk: success
        ? `You struck up a conversation with ${vampire.vampire_name}. They were wary at first, but you talked about everything except hunting. You found common ground.`
        : `${vampire.vampire_name} was suspicious of your friendly approach. But they didn't refuse. You talked briefly. It's a start.`
    };

    setOutcome({
      text: outcomes[action.id],
      success,
      bondGain,
      newRelationship
    });

    try {
      await base44.entities.VampireState.update(vampire.id, {
        hunter_relationship: newRelationship
      });

      await base44.entities.NightLog.create({
        entry: `${hunter.name} tracked ${vampire.vampire_name}. ${outcomes[action.id]}`,
        category: 'interaction',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();
    } catch (e) {
      console.error('Failed to update relationship:', e);
    }

    setTimeout(() => {
      setTracking(false);
      setRelationship(newRelationship);
    }, 3000);
  };

  const handleMoveIn = async () => {
    if (relationship < 70) return;

    const confirmed = confirm(`Ask ${vampire.vampire_name} to live with you? This is a big step. They'll become your roommate and you'll share a life together.`);
    if (!confirmed) return;

    try {
      await base44.entities.VampireState.update(vampire.id, {
        living_with_hunter: true,
        hunter_relationship: relationship
      });

      await base44.entities.NightLog.create({
        entry: `${vampire.vampire_name} moved in with ${hunter.name}. A hunter and vampire, living together. The world has never seen this before.`,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();
      onClose();
    } catch (e) {
      console.error('Failed to move vampire in:', e);
    }
  };

  if (showInteraction) {
    return (
      <HunterVampireInteraction
        hunter={hunter}
        vampire={vampire}
        onClose={() => {
          setShowInteraction(false);
          queryClient.invalidateQueries();
        }}
      />
    );
  }

  if (outcome) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-purple-500/50"
        >
          <p className="text-purple-200 text-lg leading-relaxed mb-6">{outcome.text}</p>
          
          <div className="bg-purple-950/30 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Relationship:</span>
              <span className="text-purple-400 font-bold">+{outcome.bondGain}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <motion.div
                initial={{ width: `${relationship}%` }}
                animate={{ width: `${outcome.newRelationship}%` }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
              />
            </div>
            <p className="text-gray-500 text-sm mt-2 text-center">
              {outcome.newRelationship}%
            </p>
          </div>

          <button
            onClick={() => setOutcome(null)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg"
          >
            Continue
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl p-6 max-w-2xl w-full border border-gray-800 my-8"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Tracking {vampire.vampire_name}</h2>
            <p className="text-gray-400 text-sm">Build trust or prepare for confrontation</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Relationship Bar */}
        <div className="bg-black/40 border border-purple-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Relationship</span>
            <span className="text-purple-400 font-bold">{relationship}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3">
            <div
              style={{ width: `${relationship}%` }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all"
            />
          </div>
          {relationship >= 70 && (
            <p className="text-green-400 text-sm mt-2">💚 Strong bond formed - special options available</p>
          )}
        </div>

        {/* Tracking Actions */}
        <div className="space-y-3 mb-6">
          <h3 className="text-white font-bold mb-3">Tracking Actions</h3>
          {TRACKING_ACTIONS.map((action) => (
            <button
              key={action.id}
              onClick={() => handleTrackingAction(action)}
              disabled={tracking}
              className="w-full bg-gradient-to-r from-purple-900/60 to-purple-950/60 hover:from-purple-900/80 hover:to-purple-950/80 border border-purple-700/50 rounded-xl p-4 transition-all disabled:opacity-50 touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">{action.label}</span>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-green-400">+{action.bond} bond</span>
                  <span className="text-red-400">{action.risk}% risk</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Special Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setShowInteraction(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium touch-manipulation"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            Confront Them
          </button>
          {relationship >= 70 && !vampire.living_with_hunter && (
            <button
              onClick={handleMoveIn}
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white py-3 rounded-lg font-medium touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              💕 Ask to Live Together
            </button>
          )}
          {vampire.living_with_hunter && (
            <div className="bg-green-950/40 border border-green-500/30 rounded-lg p-3 text-center col-span-2">
              <p className="text-green-400 text-sm">✓ Living together</p>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg touch-manipulation"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          Stop Tracking
        </button>
      </motion.div>
    </motion.div>
  );
}