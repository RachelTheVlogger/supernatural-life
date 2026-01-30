import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Eye, Zap, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const SHIFTER_ACTIONS = [
  { id: 'learn', label: 'Study New Form', forms: 1, speed: 5, desc: 'Memorize someone\'s appearance' },
  { id: 'shift', label: 'Transform', speed: 8, desc: 'Become someone else' },
  { id: 'infiltrate', label: 'Infiltrate Organization', speed: 10, desc: 'Go undercover' },
  { id: 'memories', label: 'Absorb Memories', memory: 10, desc: 'Steal their experiences' },
  { id: 'meditate', label: 'Remember True Self', stability: 15, desc: 'Don\'t lose yourself' },
  { id: 'perfect', label: 'Perfect Mimicry', speed: 15, desc: 'Flawless transformation' }
];

export default function ShapeshifterHome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [showForms, setShowForms] = useState(false);

  const { data: shapeshifters = [] } = useQuery({
    queryKey: ['shapeshifters'],
    queryFn: () => base44.entities.Shapeshifter.list()
  });

  const shifter = shapeshifters[0];

  const handleAction = async (action) => {
    if (!shifter) return;
    setProcessing(true);

    setTimeout(async () => {
      const newSpeed = Math.min(100, (shifter.transformation_speed || 30) + (action.speed || 0));
      const newMemory = Math.min(100, (shifter.memory_absorption || 20) + (action.memory || 0));
      const newStability = Math.min(100, (shifter.identity_stability || 80) + (action.stability || 0));

      const updates = {
        transformation_speed: newSpeed,
        memory_absorption: newMemory,
        identity_stability: newStability,
        infiltrations_completed: (shifter.infiltrations_completed || 0) + (action.id === 'infiltrate' ? 1 : 0)
      };

      if (action.id === 'learn') {
        const names = ['Dr. Sarah Chen', 'Officer Marcus', 'CEO Elena Park', 'Professor David'];
        const newForm = {
          name: names[Math.floor(Math.random() * names.length)],
          occupation: 'professional',
          access_level: Math.floor(Math.random() * 100)
        };
        updates.forms_memorized = [...(shifter.forms_memorized || []), newForm];
        updates.current_form = newForm.name;
      }

      await base44.entities.Shapeshifter.update(shifter.id, updates);

      const outcomes = {
        learn: ['You studied them. Every detail memorized. You could be them.', 'Face. Voice. Mannerisms. All copied. New identity acquired.', 'Perfect replication. You are them now. Nobody will know.'],
        shift: ['Bones cracked. Skin rippled. You became someone else entirely.', 'Transformation complete. New face in mirror. Unrecognizable.', 'Your true form dissolved. New identity manifested. Seamless.'],
        infiltrate: ['You walked in as them. Nobody questioned. Access granted.', 'Perfect disguise. High security breached. They trusted the face.', 'Infiltration successful. Secrets yours. They never suspected.'],
        memories: ['Their memories flooded your mind. You know everything they know.', 'Experiences absorbed. You lived their life in seconds.', 'Memory theft complete. Their past yours. Knowledge is power.'],
        meditate: ['You remembered your real face. Your name. Still you.', 'Grounded yourself. Identity stable. Not lost in masks.', 'True self reinforced. You choose who you are.'],
        perfect: ['Transformation instantaneous. Perfect copy. No flaws detected.', 'Mimicry absolute. Even DNA matches. Undetectable.', 'You became them completely. Perfection achieved.']
      };

      setOutcome(outcomes[action.id][Math.floor(Math.random() * outcomes[action.id].length)]);

      await base44.entities.NightLog.create({
        entry: `${shifter.true_name}: ${outcomes[action.id][0]}`,
        category: 'transformation',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  if (!shifter) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-950 to-black p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No shapeshifter found</p>
          <button
            onClick={() => navigate(createPageUrl('Home'))}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-950 via-black to-cyan-950 p-6 pb-32">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-bold text-green-100 mb-2">{shifter.true_name}</h1>
        <p className="text-green-300 text-sm mb-2">🦎 Shapeshifter</p>
        <p className="text-cyan-400 text-xs mb-8">Currently: {shifter.current_form || 'True Form'}</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <button
            onClick={() => setShowForms(true)}
            className="bg-black/40 border border-green-500/30 rounded-lg p-4 hover:bg-black/60 transition-colors"
          >
            <Users className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-green-400 text-xs">Forms Memorized</p>
            <p className="text-white text-2xl font-bold">{shifter.forms_memorized?.length || 0}</p>
          </button>
          <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-4">
            <Zap className="w-5 h-5 text-cyan-400 mb-2" />
            <p className="text-cyan-400 text-xs">Shift Speed</p>
            <p className="text-white text-2xl font-bold">{shifter.transformation_speed}%</p>
          </div>
          <div className="bg-black/40 border border-blue-500/30 rounded-lg p-4">
            <Eye className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-blue-400 text-xs">Memory Absorption</p>
            <p className="text-white text-2xl font-bold">{shifter.memory_absorption}%</p>
          </div>
          <div className="bg-black/40 border border-purple-500/30 rounded-lg p-4">
            <Heart className="w-5 h-5 text-purple-400 mb-2" />
            <p className="text-purple-400 text-xs">Identity Stability</p>
            <p className="text-white text-2xl font-bold">{shifter.identity_stability}%</p>
          </div>
        </div>

        {/* Actions */}
        <AnimatePresence mode="wait">
          {outcome ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-black/60 rounded-xl p-8 text-center border border-green-500/30"
            >
              <p className="text-green-100 text-lg leading-relaxed">{outcome}</p>
            </motion.div>
          ) : processing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Users className="w-12 h-12 text-green-400 mx-auto" />
              </motion.div>
              <p className="text-green-300 mt-4">Shifting...</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {SHIFTER_ACTIONS.map((action, i) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleAction(action)}
                  className="w-full bg-gradient-to-r from-green-900/60 to-green-950/60 hover:from-green-900/80 hover:to-green-950/80 border-2 border-green-500/50 rounded-xl py-4 px-6"
                >
                  <div className="flex justify-between items-center">
                    <div className="text-left">
                      <p className="text-white font-bold">{action.label}</p>
                      <p className="text-green-300 text-xs">{action.desc}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Forms Modal */}
      {showForms && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
          onClick={() => setShowForms(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Memorized Forms</h3>
              <button onClick={() => setShowForms(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {shifter.forms_memorized?.map((form, i) => (
                <button
                  key={i}
                  onClick={async () => {
                    await base44.entities.Shapeshifter.update(shifter.id, { current_form: form.name });
                    queryClient.invalidateQueries();
                    setShowForms(false);
                  }}
                  className={`w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-left transition-colors ${
                    shifter.current_form === form.name ? 'ring-2 ring-green-500' : ''
                  }`}
                >
                  <p className="text-white font-bold">{form.name}</p>
                  <p className="text-gray-400 text-sm">{form.occupation} • Access: {form.access_level}%</p>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}