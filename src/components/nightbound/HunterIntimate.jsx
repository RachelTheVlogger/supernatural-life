import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const INTIMATE_OPTIONS = [
  {
    id: 'tension',
    name: '😈 Sexual Tension',
    desc: 'Flirt dangerously with someone. Cross boundaries.',
    icon: '🔥',
    explicit: true
  },
  {
    id: 'passionate',
    name: '🌹 Passionate Encounter',
    desc: 'Intense physical intimacy. Fulfill desires.',
    icon: '💋',
    explicit: true
  },
  {
    id: 'roleplay',
    name: '🎭 Roleplay Scenario',
    desc: 'Act out fantasies. Both agree to the game.',
    icon: '👥',
    explicit: true
  },
  {
    id: 'seduce',
    name: '💅 Seduce Target',
    desc: 'Use seduction as a weapon. Manipulate through desire.',
    icon: '😏',
    explicit: true
  }
];

export default function HunterIntimate({ hunter, vampires }) {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');

  const validPartners = [
    ...vampires.filter(v => Math.random() > 0.6).map(v => ({
      id: v.id,
      name: v.vampire_name,
      type: 'vampire',
      icon: '🦇'
    }))
  ];

  const handleIntimate = async (type, partner) => {
    setProcessing(true);

    const outcomes = {
      tension: `${partner.name}... the sexual tension between you is undeniable. The hunt can wait for one night.`,
      passionate: `You and ${partner.name} gave in to desire. Passionate encounter. Both satisfied, both dangerous.`,
      roleplay: `You and ${partner.name} played the game. The roleplay was intense. Boundaries blurred.`,
      seduce: `${partner.name} couldn't resist. Seduction successful. They're vulnerable now.`
    };

    setTimeout(async () => {
      try {
        await base44.entities.NightLog.create({
          entry: `Hunter ${hunter.name}: ${type.toUpperCase()} with ${partner.name}. ${outcomes[type]}`,
          category: 'interaction',
          intensity: 'explicit'
        });

        setOutcome(outcomes[type]);
        queryClient.invalidateQueries();

        setTimeout(() => {
          setProcessing(false);
          setOutcome('');
          setSelectedType(null);
          setSelectedPartner(null);
        }, 4000);
      } catch (e) {
        console.error('Activity failed:', e);
        setProcessing(false);
      }
    }, 2000);
  };

  if (!selectedType) {
    return (
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 border border-pink-500/30 rounded-2xl p-6"
        >
          <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-400" />
            Intimate Encounters
          </h3>

          <div className="space-y-2">
            {INTIMATE_OPTIONS.map(option => (
              <button
                key={option.id}
                onClick={() => setSelectedType(option)}
                className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{option.name}</h4>
                    <p className="text-gray-400 text-sm">{option.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  if (processing && outcome) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-black/40 border border-pink-500/30 rounded-2xl p-12"
      >
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-gray-300 text-center italic"
        >
          "{outcome}"
        </motion.p>
      </motion.div>
    );
  }

  if (processing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-black/40 border border-pink-500/30 rounded-2xl p-12 text-center"
      >
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-gray-400"
        >
          ...
        </motion.p>
      </motion.div>
    );
  }

  const selectedTypeData = INTIMATE_OPTIONS.find(o => o.id === selectedType.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 border border-pink-500/30 rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white text-lg font-bold">{selectedTypeData.name}</h3>
        <button
          onClick={() => setSelectedType(null)}
          className="text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {validPartners.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">No available partners at the moment.</p>
          <button
            onClick={() => setSelectedType(null)}
            className="text-pink-400 hover:text-pink-300 text-sm"
          >
            ← Back
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-gray-400 text-sm mb-4">Choose a partner...</p>
          {validPartners.map(partner => (
            <button
              key={partner.id}
              onClick={() => handleIntimate(selectedTypeData.id, partner)}
              className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-left transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{partner.icon}</span>
                <div className="flex-1">
                  <h4 className="text-white font-medium">{partner.name}</h4>
                  <p className="text-gray-400 text-sm capitalize">{partner.type}</p>
                </div>
              </div>
            </button>
          ))}
          <button
            onClick={() => setSelectedType(null)}
            className="w-full text-gray-400 hover:text-white text-sm mt-4 py-2"
          >
            ← Back
          </button>
        </div>
      )}
    </motion.div>
  );
}