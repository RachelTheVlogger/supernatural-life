import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Zap, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const VAMPIRE_POWERS = [
  { name: 'Enhanced Senses', stage: 1, power: 0 },
  { name: 'Super Speed', stage: 1, power: 10 },
  { name: 'Super Strength', stage: 1, power: 15 },
  { name: 'Compulsion', stage: 2, power: 30 },
  { name: 'Dream Walking', stage: 2, power: 40 },
  { name: 'Emotion Manipulation', stage: 2, power: 50 },
  { name: 'Mind Reading', stage: 3, power: 60 },
  { name: 'Telekinesis', stage: 3, power: 70 },
  { name: 'Illusion Casting', stage: 3, power: 80 },
  { name: 'Daylight Immunity', stage: 4, power: 90 }
];

const TRAINING_ACTIONS = [
  { id: 'hunt', label: 'Hunt with Sire', power: 5, nights: 1, desc: 'Learn predator instincts' },
  { id: 'feed', label: 'Practice Controlled Feeding', power: 3, nights: 1, desc: 'Don\'t kill the prey' },
  { id: 'speed', label: 'Speed Training', power: 4, nights: 1, desc: 'Blur through shadows' },
  { id: 'strength', label: 'Test Your Strength', power: 4, nights: 1, desc: 'Break things. Carefully.' },
  { id: 'compulsion', label: 'Practice Compulsion', power: 6, nights: 1, desc: 'Bend minds to your will' },
  { id: 'meditate', label: 'Meditate on Power', power: 3, nights: 1, desc: 'Feel the vampire within' }
];

export default function TurnedServantProgression({ servant, onClose }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [training, setTraining] = useState(false);
  const [outcome, setOutcome] = useState('');

  const stage = servant.vampire_stage || 1;
  const power = servant.vampire_power_level || 0;
  const nights = servant.nights_as_vampire || 0;
  const unlockedPowers = servant.unlocked_powers || [];

  const availablePowers = VAMPIRE_POWERS.filter(p => p.stage <= stage && p.power <= power);
  const lockedPowers = VAMPIRE_POWERS.filter(p => p.stage > stage || p.power > power);

  const getStageProgress = () => {
    if (stage === 1) return { next: 'Fledgling', required: 25 };
    if (stage === 2) return { next: 'Established', required: 50 };
    if (stage === 3) return { next: 'Elder', required: 75 };
    return { next: 'Max', required: 100 };
  };

  const { next, required } = getStageProgress();

  const handleTrain = async (action) => {
    setTraining(true);

    setTimeout(async () => {
      const newPower = Math.min(power + action.power, 100);
      const newNights = nights + action.nights;

      // Check for stage advancement
      let newStage = stage;
      if (newPower >= 25 && stage === 1) newStage = 2;
      if (newPower >= 50 && stage === 2) newStage = 3;
      if (newPower >= 75 && stage === 3) newStage = 4;

      // Auto-unlock powers at thresholds
      const newUnlocked = [...unlockedPowers];
      VAMPIRE_POWERS.forEach(p => {
        if (p.power <= newPower && p.stage <= newStage && !newUnlocked.includes(p.name)) {
          newUnlocked.push(p.name);
        }
      });

      await base44.entities.Servant.update(servant.id, {
        vampire_power_level: newPower,
        vampire_stage: newStage,
        nights_as_vampire: newNights,
        unlocked_powers: newUnlocked
      });

      // Give snake familiar if first training session (newly turned vampire)
      if (nights === 0) {
        const snakeTypes = ['shadow', 'venom', 'blood', 'nightmare'];
        const randomType = snakeTypes[Math.floor(Math.random() * snakeTypes.length)];
        const snakeNames = {
          shadow: ['Eclipse', 'Umbra', 'Nox', 'Shade'],
          venom: ['Viper', 'Toxin', 'Fang', 'Poison'],
          blood: ['Crimson', 'Ruby', 'Scarlet', 'Sanguis'],
          nightmare: ['Phantom', 'Terror', 'Dread', 'Fear']
        };
        const randomName = snakeNames[randomType][Math.floor(Math.random() * snakeNames[randomType].length)];
        
        await base44.entities.SnakeFamiliar.create({
          vampire_id: servant.id,
          custom_name: randomName,
          type: randomType,
          bond_level: 20,
          power_level: 15,
          loyalty: 70,
          hunger: 40,
          missions_completed: 0,
          size: 'small',
          unlocked_abilities: []
        });

        msg += `\n\n🐍 A snake familiar appears! ${randomName} is now yours.`;
      }

      const messages = {
        hunt: [
          'You hunted beside your sire. Their movements fluid. Yours clumsy. But improving.',
          'The hunt came naturally. Predator instincts awakening. You felt alive.',
          'Blood on your lips. The prey escaped. Your sire smiled. "You\'re learning."'
        ],
        feed: [
          'You fed but stopped before death. Control. Your sire nodded approval.',
          'The human walked away dazed. Alive. You\'re getting better at this.',
          'Controlled feeding. No bodies. No evidence. Your sire is proud.'
        ],
        speed: [
          'You blurred through the night. Faster than before. The world a smear.',
          'Your sire raced you. You lost. But you were close. So close.',
          'Speed is becoming natural. You move like shadow. Like death.'
        ],
        strength: [
          'You snapped a steel bar. Your sire raised an eyebrow. Impressed.',
          'Strength surging. You lifted a car. Barely strained. Power intoxicates.',
          'You broke the dummy. And the wall behind it. Oops.'
        ],
        compulsion: [
          'You looked into human eyes. "Forget." They did. Power absolute.',
          'Compulsion works now. Their minds open. Malleable. Yours to command.',
          'You made them dance. Made them sing. Made them forget. Perfect.'
        ],
        meditate: [
          'You felt the vampire within. Ancient. Powerful. Growing.',
          'Meditation deepened your connection. The beast and the mind becoming one.',
          'You understand now. You\'re not cursed. You\'re evolved.'
        ]
      };

      let msg = messages[action.id][Math.floor(Math.random() * messages[action.id].length)];

      if (newStage > stage) {
        msg += `\n\n🎉 You advanced to ${next}!`;
      }

      if (newUnlocked.length > unlockedPowers.length) {
        const newPower = newUnlocked.find(p => !unlockedPowers.includes(p));
        msg += `\n\n✨ New power unlocked: ${newPower}!`;
      }

      setOutcome(msg);

      await base44.entities.NightLog.create({
        entry: `${servant.name} trained: ${msg}`,
        category: 'power',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setTraining(false);
        setOutcome('');
      }, 4000);
    }, 2000);
  };

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
        className="bg-gradient-to-br from-rose-950 to-red-950 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative border-2 border-rose-500/50"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-rose-300 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-rose-100 mb-2">🩸 Vampire Progression</h2>
        <p className="text-rose-300 text-sm mb-6">{servant.name}'s path to power</p>

        <button
          onClick={() => {
            onClose();
            navigate(createPageUrl(`ServantSnake?id=${servant.id}`));
          }}
          className="w-full bg-gradient-to-r from-green-900/60 to-emerald-900/60 hover:from-green-900/80 hover:to-emerald-900/80 border-2 border-green-500/50 rounded-xl p-4 mb-6 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-green-100 font-bold">🐍 Snake Familiar</h3>
              <p className="text-green-300 text-xs">Adopt and bond with your serpent</p>
            </div>
          </div>
        </button>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-black/30 rounded-lg p-3 border border-rose-500/30">
            <p className="text-rose-400 text-xs">Stage</p>
            <p className="text-rose-100 font-bold">
              {stage === 1 ? '🩸 Newborn' : stage === 2 ? '🌙 Fledgling' : stage === 3 ? '⚡ Established' : '👑 Elder'}
            </p>
            {stage < 4 && <p className="text-rose-300 text-xs mt-1">Next: {next} at {required} power</p>}
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-rose-500/30">
            <p className="text-rose-400 text-xs">Power Level</p>
            <p className="text-rose-100 font-bold">{power}/100</p>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-rose-500/30">
            <p className="text-rose-400 text-xs">Nights as Vampire</p>
            <p className="text-rose-100 font-bold">{nights}</p>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-rose-500/30">
            <p className="text-rose-400 text-xs">Powers Unlocked</p>
            <p className="text-rose-100 font-bold">{unlockedPowers.length}/{VAMPIRE_POWERS.length}</p>
          </div>
        </div>

        {outcome ? (
          <div className="bg-black/40 rounded-xl p-6 border border-rose-500/30 mb-6">
            <p className="text-rose-100 text-base leading-relaxed whitespace-pre-line">{outcome}</p>
          </div>
        ) : training ? (
          <div className="text-center py-8">
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-rose-300"
            >
              Training...
            </motion.p>
          </div>
        ) : (
          <>
            {/* Training Actions */}
            <div className="mb-6">
              <h3 className="text-rose-200 font-bold mb-3">Training</h3>
              <div className="grid grid-cols-2 gap-2">
                {TRAINING_ACTIONS.map(action => (
                  <button
                    key={action.id}
                    onClick={() => handleTrain(action)}
                    className="bg-rose-900/40 hover:bg-rose-900/60 border border-rose-500/30 rounded-lg p-3 text-left transition-colors"
                  >
                    <p className="text-rose-100 font-medium text-sm">{action.label}</p>
                    <p className="text-rose-300 text-xs mt-1">{action.desc}</p>
                    <p className="text-rose-400 text-xs mt-1">+{action.power} power</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Unlocked Powers */}
            {availablePowers.length > 0 && (
              <div className="mb-6">
                <h3 className="text-rose-200 font-bold mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Unlocked Powers
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {availablePowers.map(p => (
                    <div
                      key={p.name}
                      className={`rounded-lg p-3 border ${
                        unlockedPowers.includes(p.name)
                          ? 'bg-rose-500/20 border-rose-400'
                          : 'bg-black/20 border-rose-500/20'
                      }`}
                    >
                      <p className="text-rose-100 text-sm font-medium">{p.name}</p>
                      <p className="text-rose-300 text-xs">Stage {p.stage}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Locked Powers */}
            {lockedPowers.length > 0 && (
              <div>
                <h3 className="text-rose-200 font-bold mb-3 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Locked Powers
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {lockedPowers.map(p => (
                    <div
                      key={p.name}
                      className="bg-black/40 border border-rose-900/30 rounded-lg p-3 opacity-50"
                    >
                      <p className="text-rose-300 text-sm font-medium">{p.name}</p>
                      <p className="text-rose-400 text-xs">
                        Requires: Stage {p.stage}, {p.power} power
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}