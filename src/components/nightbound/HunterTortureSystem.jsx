import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Skull, Zap, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const TORTURE_METHODS = [
  {
    id: 'sunlight',
    name: 'Sunlight Exposure',
    description: 'Force them into direct sunlight. Painful. Cruel.',
    damage: 15,
    trauma: 8,
    morality: -20,
    icon: '☀️',
    duration: 2,
    brutal: true
  },
  {
    id: 'silver',
    name: 'Silver Chains',
    description: 'Bind them with silver. It burns. They scream.',
    damage: 12,
    trauma: 10,
    morality: -15,
    icon: '⛓️',
    duration: 2,
    brutal: true
  },
  {
    id: 'starvation',
    name: 'Blood Starvation',
    description: 'Deny them blood. Watch the hunger consume them.',
    damage: 8,
    trauma: 12,
    morality: -18,
    icon: '🩸',
    duration: 3,
    brutal: false
  },
  {
    id: 'holy',
    name: 'Holy Water',
    description: 'Splash them with holy water. Watch it sear their skin.',
    damage: 10,
    trauma: 9,
    morality: -16,
    icon: '💧',
    duration: 2,
    brutal: true
  },
  {
    id: 'crosses',
    name: 'Cross Restraint',
    description: 'Pin them to a cross. Psychologically devastating.',
    damage: 5,
    trauma: 15,
    morality: -22,
    icon: '✝️',
    duration: 3,
    brutal: true
  },
  {
    id: 'interrogate',
    name: 'Interrogation',
    description: 'Ask questions. They answer, or suffer consequences.',
    damage: 3,
    trauma: 6,
    morality: -8,
    icon: '🔍',
    duration: 2,
    brutal: false
  },
  {
    id: 'needle',
    name: 'Wooden Stakes',
    description: 'Small stakes. Not through the heart. Just pain.',
    damage: 14,
    trauma: 13,
    morality: -25,
    icon: '🪵',
    duration: 2,
    brutal: true
  },
  {
    id: 'isolation',
    name: 'Sensory Isolation',
    description: 'Lock them away in total darkness. No stimulation. No escape.',
    damage: 2,
    trauma: 11,
    morality: -12,
    icon: '🔒',
    duration: 4,
    brutal: false
  }
];

const PERSUASION_REPLIES = [
  {
    approach: 'mercy',
    text: "Please. I've never hurt you. Why are you doing this? Is this who you are now?",
    empathy: 15,
    bonus: 'Triggers guilt'
  },
  {
    approach: 'reason',
    text: 'You became a hunter to protect people, right? But this isn\'t protection. This is vengeance. That\'s different.',
    logic: 15,
    bonus: 'Questions your motives'
  },
  {
    approach: 'seduction',
    text: 'I could show you things. Pleasures you\'ve never imagined. Why waste time hurting me when we could...',
    temptation: 15,
    bonus: 'Offers forbidden desire'
  },
  {
    approach: 'threat',
    text: 'You think you\'re winning? I have friends. Powerful ones. They will find you.',
    fear: -15,
    bonus: 'Intimidates you'
  },
  {
    approach: 'truth',
    text: 'You know I\'m not a monster. Not really. You\'ve seen me. The person beneath the hunger.',
    connection: 15,
    bonus: 'Reminds you of bond'
  },
  {
    approach: 'despair',
    text: 'Go ahead. I\'ve survived worse. You can\'t break what\'s already broken. All you\'ll do is prove you\'re a monster.',
    challenge: 15,
    bonus: 'Dares your cruelty'
  }
];

export default function HunterTortureSystem({ hunter, vampire, onClose }) {
  const queryClient = useQueryClient();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [persuasionAttempt, setPersuasionAttempt] = useState(null);
  const [chosenApproach, setChosenApproach] = useState(null);
  const [outcome, setOutcome] = useState('');
  const [resisted, setResisted] = useState(false);
  const [result, setResult] = useState('');

  const handleTorture = async (method) => {
    setSelectedMethod(method);
    setProcessing(true);
    setPersuasionAttempt(Math.random() > 0.5 ? PERSUASION_REPLIES[Math.floor(Math.random() * PERSUASION_REPLIES.length)] : null);

    setTimeout(() => {
      setProcessing(false);
    }, 2000);
  };

  const handleChooseTorture = async () => {
    setProcessing(true);
    setChosenApproach(null);

    try {
      const moralityChange = selectedMethod.morality;
      const newMorality = Math.max(0, (hunter.humanity || 50) + moralityChange);
      
      // Update hunter
      await base44.entities.Hunter.update(hunter.id, {
        humanity: newMorality,
        suspicion: Math.min(100, (hunter.suspicion || 0) + 5)
      });

      // Log the torture
      let logEntry = `${hunter.name} tortured ${vampire.vampire_name} using ${selectedMethod.name}. `;
      if (moralityChange < -20) {
        logEntry += 'Humanity slipping. The line between hunter and monster blurs.';
      } else if (moralityChange < -10) {
        logEntry += 'A cruel necessity. Or just cruelty?';
      } else {
        logEntry += 'Justified. Necessary. Or so you tell yourself.';
      }

      await base44.entities.NightLog.create({
        entry: logEntry,
        category: 'conflict',
        intensity: selectedMethod.brutal ? 'extreme' : 'high'
      });

      setResult(`Humanity: ${Math.round(newMorality)}%`);
      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setSelectedMethod(null);
        setOutcome('');
        onClose();
      }, 3000);
    } catch (e) {
      console.error('Torture failed:', e);
      setProcessing(false);
    }
  };

  const handleResistPersuasion = async () => {
    setResisted(true);
    setOutcome(`You ignore their pleas. ${selectedMethod.name} begins in earnest. Their screams echo.`);
    
    setTimeout(() => {
      handleChooseTorture();
    }, 2000);
  };

  const handleYieldToPersuasion = async () => {
    setProcessing(true);

    try {
      // Minor humanity gain for showing mercy
      const newMorality = Math.min(100, (hunter.humanity || 50) + 10);
      
      await base44.entities.Hunter.update(hunter.id, {
        humanity: newMorality
      });

      await base44.entities.NightLog.create({
        entry: `${hunter.name} was going to torture ${vampire.vampire_name}, but... they couldn't. The words reached something human inside. Mercy granted. Or weakness shown?`,
        category: 'interaction',
        intensity: 'significant'
      });

      setOutcome(`You lower your weapon. Their words hit too close. Humanity: ${newMorality}%`);
      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setSelectedMethod(null);
        onClose();
      }, 3000);
    } catch (e) {
      console.error('Persuasion acceptance failed:', e);
      setProcessing(false);
    }
  };

  if (processing && outcome) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="bg-gray-900 rounded-2xl p-8 max-w-md w-full text-center border-2 border-red-500/50"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-200 text-lg leading-relaxed italic"
          >
            {outcome}
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  if (selectedMethod && persuasionAttempt && !resisted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-8 max-w-lg w-full border-2 border-purple-500/50"
        >
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-6 h-6 text-purple-400" />
              <h3 className="text-2xl font-bold text-white">{vampire.vampire_name} Pleads</h3>
            </div>
            <div className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-6 mb-6">
              <p className="text-purple-200 text-lg italic leading-relaxed mb-3">"{persuasionAttempt.text}"</p>
              <p className="text-purple-400 text-sm">{persuasionAttempt.bonus}</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleResistPersuasion}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-4 rounded-xl transition-all"
            >
              <Skull className="w-5 h-5 inline mr-2" />
              Ignore and Torture Anyway
            </button>
            <button
              onClick={handleYieldToPersuasion}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-4 rounded-xl transition-all"
            >
              <Heart className="w-5 h-5 inline mr-2" />
              Show Mercy
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  if (selectedMethod && !processing && resisted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-8 max-w-lg w-full border-2 border-red-500/50"
        >
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-red-200 mb-4">{selectedMethod.name}</h3>
            <div className="bg-red-950/30 border border-red-500/30 rounded-lg p-6 mb-6">
              <p className="text-red-100 text-lg italic mb-4">{selectedMethod.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-red-400">Damage</p>
                  <p className="text-red-200 font-bold text-xl">{selectedMethod.damage}</p>
                </div>
                <div>
                  <p className="text-red-400">Trauma</p>
                  <p className="text-red-200 font-bold text-xl">{selectedMethod.trauma}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-red-400">Humanity Cost</p>
                  <p className="text-red-200 font-bold">{selectedMethod.morality}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleChooseTorture}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-4 rounded-xl transition-all"
            >
              <Zap className="w-5 h-5 inline mr-2" />
              Proceed with Torture
            </button>
            <button
              onClick={() => {
                setSelectedMethod(null);
                setResisted(false);
              }}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-xl transition-all"
            >
              Back
            </button>
          </div>

          <p className="text-gray-400 text-xs mt-4 text-center">
            ⚠️ This will reduce your humanity significantly.
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto border-2 border-red-500/50"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-red-200 flex items-center gap-2 mb-1">
              <AlertTriangle className="w-6 h-6" />
              Torture {vampire.vampire_name}
            </h2>
            <p className="text-gray-400 text-sm">Choose your method. They will try to stop you.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {TORTURE_METHODS.map(method => (
            <motion.button
              key={method.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => handleTorture(method)}
              className={`border-2 rounded-xl p-4 text-left transition-all ${
                method.brutal
                  ? 'bg-red-950/40 hover:bg-red-950/60 border-red-500/50'
                  : 'bg-gray-800/40 hover:bg-gray-800/60 border-gray-600/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{method.icon}</span>
                <div className="flex-1">
                  <h4 className="text-white font-bold mb-1">{method.name}</h4>
                  <p className="text-gray-400 text-xs mb-2">{method.description}</p>
                  <div className="flex gap-2 text-xs">
                    <span className="text-red-400">Damage: {method.damage}</span>
                    <span className="text-orange-400">Trauma: {method.trauma}</span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <p className="text-gray-400 text-xs text-center">
          Each method will test your humanity. Some may be harder to endure than others.
        </p>
      </motion.div>
    </motion.div>
  );
}