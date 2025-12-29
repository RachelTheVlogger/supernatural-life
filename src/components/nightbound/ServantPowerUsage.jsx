import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const POWER_ACTIONS = {
  'Enhanced Senses': [
    { id: 'track', label: 'Track Someone', desc: 'Follow their scent across the city' },
    { id: 'danger', label: 'Sense Danger', desc: 'Detect threats before they arrive' },
    { id: 'emotions', label: 'Read Room', desc: 'Feel everyone\'s emotional state' }
  ],
  'Super Speed': [
    { id: 'blur', label: 'Blur Movement', desc: 'Move too fast for human eyes' },
    { id: 'escape', label: 'Quick Escape', desc: 'Gone before they blink' },
    { id: 'hunt', label: 'Speed Hunt', desc: 'Chase down any prey' }
  ],
  'Super Strength': [
    { id: 'break', label: 'Break Objects', desc: 'Destroy barriers, locks, walls' },
    { id: 'intimidate', label: 'Show Force', desc: 'Display your power' },
    { id: 'protect', label: 'Defend Someone', desc: 'Your strength protects them' }
  ],
  'Compulsion': [
    { id: 'forget', label: 'Make Them Forget', desc: 'Erase their memories' },
    { id: 'obey', label: 'Command Obedience', desc: 'They do what you say' },
    { id: 'desire', label: 'Plant Desire', desc: 'Make them want you' }
  ],
  'Dream Walking': [
    { id: 'enter', label: 'Enter Their Dreams', desc: 'Visit while they sleep' },
    { id: 'nightmare', label: 'Create Nightmare', desc: 'Terrify them in sleep' },
    { id: 'message', label: 'Dream Message', desc: 'Communicate through dreams' }
  ],
  'Emotion Manipulation': [
    { id: 'calm', label: 'Induce Calm', desc: 'Make them peaceful' },
    { id: 'desire_boost', label: 'Amplify Desire', desc: 'Make them crave you' },
    { id: 'fear', label: 'Project Fear', desc: 'Terrify them instantly' }
  ],
  'Mind Reading': [
    { id: 'surface', label: 'Read Surface Thoughts', desc: 'Hear their current thoughts' },
    { id: 'secrets', label: 'Dig for Secrets', desc: 'Find what they hide' },
    { id: 'predict', label: 'Predict Actions', desc: 'Know what they\'ll do next' }
  ],
  'Telekinesis': [
    { id: 'move', label: 'Move Objects', desc: 'Control things with your mind' },
    { id: 'restrain', label: 'Restrain Someone', desc: 'Hold them in place' },
    { id: 'throw', label: 'Throw Objects', desc: 'Weapons fly at your command' }
  ],
  'Illusion Casting': [
    { id: 'appear', label: 'Change Appearance', desc: 'Look like someone else' },
    { id: 'scene', label: 'Create Scene', desc: 'Make them see what isn\'t there' },
    { id: 'invisible', label: 'Turn Invisible', desc: 'Vanish completely' }
  ],
  'Daylight Immunity': [
    { id: 'walk', label: 'Walk in Daylight', desc: 'No more hiding from the sun' },
    { id: 'sunbathe', label: 'Sunbathe', desc: 'Enjoy what was forbidden' },
    { id: 'surprise', label: 'Day Hunt', desc: 'No one expects vampires during day' }
  ]
};

export default function ServantPowerUsage({ servant, power, onClose }) {
  const queryClient = useQueryClient();
  const [using, setUsing] = useState(false);
  const [outcome, setOutcome] = useState('');

  const actions = POWER_ACTIONS[power] || [];

  const handleUsePower = async (action) => {
    setUsing(true);

    setTimeout(async () => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${servant.name} is a vampire with the power "${power}". They use it: ${action.label} - ${action.desc}. Write a vivid, detailed scene (150 words) showing:
1. How they activate the power - physical sensation, vampire energy
2. The effect in action - what it looks like, feels like, does
3. The outcome - success, consequences, their emotional response
4. How using vampire powers makes them feel about their immortal nature

Make it atmospheric and supernatural. ${servant.name} is ${servant.personality || 'mysterious'}, ${servant.gender || 'custom'} vampire.`,
        response_json_schema: {
          type: 'object',
          properties: {
            scene: { type: 'string' },
            power_growth: { type: 'number' },
            humanity_impact: { type: 'number' }
          }
        }
      });

      await base44.entities.Servant.update(servant.id, {
        vampire_power_level: Math.min(100, (servant.vampire_power_level || 0) + response.power_growth)
      });

      await base44.entities.NightLog.create({
        entry: `${servant.name} used ${power}: ${response.scene}`,
        category: 'power',
        intensity: 'moderate'
      });

      setOutcome(response.scene);
      queryClient.invalidateQueries();

      setTimeout(() => {
        setUsing(false);
        setOutcome('');
        onClose();
      }, 5000);
    }, 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-purple-950 to-indigo-950 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto relative border-2 border-purple-500/50"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-purple-300 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">⚡ {power}</h2>
        <p className="text-purple-300 text-sm mb-6">How will you use this power?</p>

        {outcome ? (
          <div className="bg-black/40 rounded-xl p-6 border border-purple-500/30">
            <p className="text-purple-100 text-sm leading-relaxed">{outcome}</p>
          </div>
        ) : using ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ scale: [1, 1.3, 1], rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              ⚡
            </motion.div>
            <p className="text-purple-400">Channeling power...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {actions.map(action => (
              <button
                key={action.id}
                onClick={() => handleUsePower(action)}
                className="w-full bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-xl p-4 text-left transition-all"
              >
                <p className="text-white font-medium mb-1">{action.label}</p>
                <p className="text-purple-300 text-xs">{action.desc}</p>
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}