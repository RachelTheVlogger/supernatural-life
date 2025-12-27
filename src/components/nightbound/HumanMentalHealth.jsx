import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Brain, Activity, Heart, Moon } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function HumanMentalHealth({ human, onClose }) {
  const [mentalHealth, setMentalHealth] = useState(60);
  const [stress, setStress] = useState(40);
  const [therapy, setTherapy] = useState(false);
  const queryClient = useQueryClient();

  const getMentalHealthStatus = () => {
    if (mentalHealth > 80) return { text: 'Thriving', color: 'text-green-400' };
    if (mentalHealth > 60) return { text: 'Stable', color: 'text-blue-400' };
    if (mentalHealth > 40) return { text: 'Struggling', color: 'text-yellow-400' };
    if (mentalHealth > 20) return { text: 'Crisis', color: 'text-orange-400' };
    return { text: 'Breaking', color: 'text-red-400' };
  };

  const doActivity = async (activity) => {
    let mentalGain = 0;
    let stressChange = 0;
    let outcome = '';

    switch (activity) {
      case 'therapy':
        mentalGain = 15;
        stressChange = -20;
        outcome = `Therapy session.\n\nYou talked about the anxiety. The fear. The things you can't explain.\n\nThe therapist listened. It helped.\n\n+15 mental health\n-20 stress`;
        setTherapy(true);
        
        // Therapy helps with obsession too
        if ((human.obsession_level || 0) > 0) {
          await base44.entities.Human.update(human.id, {
            obsession_level: Math.max(0, (human.obsession_level || 0) - 8)
          });
        }
        break;
      case 'meditation':
        mentalGain = 8;
        stressChange = -15;
        outcome = `You meditated for 20 minutes.\n\nQuieted your mind. Breathed deeply.\n\nThe thoughts quieted. For a moment.\n\n+8 mental health\n-15 stress`;
        break;
      case 'exercise':
        mentalGain = 10;
        stressChange = -10;
        outcome = `You worked out. Hard.\n\nPushed your body. Sweat. Burned.\n\nEndorphins flooded in. You feel... better.\n\n+10 mental health\n-10 stress`;
        break;
      case 'journal':
        mentalGain = 5;
        stressChange = -8;
        outcome = `You wrote in your journal.\n\nPut the chaos on paper. The fear. The confusion.\n\nSeeing it written down helps. Somehow.\n\n+5 mental health\n-8 stress`;
        break;
      case 'sleep':
        mentalGain = 12;
        stressChange = -12;
        outcome = `You actually slept. Full 8 hours.\n\nNo nightmares. No tossing and turning.\n\nYou woke up... refreshed.\n\n+12 mental health\n-12 stress`;
        break;
    }

    setMentalHealth(prev => Math.min(100, prev + mentalGain));
    setStress(prev => Math.max(0, prev + stressChange));

    await base44.entities.NightLog.create({
      entry: `${human.name} focused on mental health: ${activity}`,
      category: 'interaction',
      intensity: 'subtle'
    });

    queryClient.invalidateQueries();
    alert(outcome);
  };

  const status = getMentalHealthStatus();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-2xl p-6 max-w-md w-full max-h-[85vh] overflow-y-auto border border-indigo-500/30"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-indigo-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Mental Health</h2>
              <p className="text-gray-400 text-sm">Take care of yourself</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status */}
        <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Mental Health</span>
            <span className={`font-bold ${status.color}`}>{mentalHealth}% - {status.text}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 mb-4">
            <div
              style={{ width: `${mentalHealth}%` }}
              className="h-3 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"
            />
          </div>

          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Stress Level</span>
            <span className={`font-bold ${stress > 70 ? 'text-red-400' : stress > 40 ? 'text-yellow-400' : 'text-green-400'}`}>
              {stress}%
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3">
            <div
              style={{ width: `${stress}%` }}
              className="h-3 bg-gradient-to-r from-green-500 to-red-500 rounded-full"
            />
          </div>
        </div>

        {mentalHealth < 40 && (
          <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-3 mb-4">
            <p className="text-red-300 text-sm text-center">
              ⚠️ Your mental health is suffering. Seek help.
            </p>
          </div>
        )}

        {/* Activities */}
        <div className="space-y-3">
          <button
            onClick={() => doActivity('therapy')}
            className="w-full bg-purple-950/40 border border-purple-500/30 hover:bg-purple-950/60 rounded-xl p-4 text-left"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-purple-400" />
                <span className="text-white font-bold">Therapy Session</span>
              </div>
              {therapy && <span className="text-green-400 text-xs">✓ In therapy</span>}
            </div>
            <p className="text-gray-400 text-sm">Talk to a professional</p>
            <p className="text-green-400 text-xs mt-1">+15 mental health, -20 stress</p>
          </button>

          <button
            onClick={() => doActivity('meditation')}
            className="w-full bg-blue-950/40 border border-blue-500/30 hover:bg-blue-950/60 rounded-xl p-4 text-left"
          >
            <div className="flex items-center gap-3 mb-1">
              <Activity className="w-5 h-5 text-blue-400" />
              <span className="text-white font-bold">Meditation</span>
            </div>
            <p className="text-gray-400 text-sm">Quiet your mind</p>
            <p className="text-green-400 text-xs mt-1">+8 mental health, -15 stress</p>
          </button>

          <button
            onClick={() => doActivity('exercise')}
            className="w-full bg-red-950/40 border border-red-500/30 hover:bg-red-950/60 rounded-xl p-4 text-left"
          >
            <div className="flex items-center gap-3 mb-1">
              <Heart className="w-5 h-5 text-red-400" />
              <span className="text-white font-bold">Exercise</span>
            </div>
            <p className="text-gray-400 text-sm">Physical activity helps</p>
            <p className="text-green-400 text-xs mt-1">+10 mental health, -10 stress</p>
          </button>

          <button
            onClick={() => doActivity('journal')}
            className="w-full bg-indigo-950/40 border border-indigo-500/30 hover:bg-indigo-950/60 rounded-xl p-4 text-left"
          >
            <div className="flex items-center gap-3 mb-1">
              <Moon className="w-5 h-5 text-indigo-400" />
              <span className="text-white font-bold">Journal</span>
            </div>
            <p className="text-gray-400 text-sm">Write your thoughts</p>
            <p className="text-green-400 text-xs mt-1">+5 mental health, -8 stress</p>
          </button>

          <button
            onClick={() => doActivity('sleep')}
            className="w-full bg-purple-950/40 border border-purple-500/30 hover:bg-purple-950/60 rounded-xl p-4 text-left"
          >
            <div className="flex items-center gap-3 mb-1">
              <Moon className="w-5 h-5 text-purple-400" />
              <span className="text-white font-bold">Proper Sleep</span>
            </div>
            <p className="text-gray-400 text-sm">Rest fully for once</p>
            <p className="text-green-400 text-xs mt-1">+12 mental health, -12 stress</p>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}