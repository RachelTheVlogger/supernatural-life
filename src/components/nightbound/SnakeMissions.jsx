import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Target, Eye, Skull, Shield, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const MISSIONS = [
  {
    id: 'recon',
    name: 'Reconnaissance Mission',
    icon: Eye,
    difficulty: 'easy',
    duration: 'short',
    powerReq: 20,
    description: 'Scout a location and report back',
    successRewards: { bond: 5, power: 3, info: true },
    failurePenalty: { health: -10 },
    outcomes: {
      success: [
        'returned with valuable intel. Saw rival vampires meeting. You know their plans now.',
        'spied on hunters. Found their base. Marked the location. Dangerous but useful.',
        'scouted the witch coven. They\'re planning something. You\'re prepared.',
        'followed a suspicious human. They\'re trafficking. You have leverage now.'
      ],
      failure: [
        'got spotted. Had to flee. Mission failed but survived.',
        'lost the target. Returned empty-handed. Disappointing.',
        'encountered a ward. Magical trap. Barely escaped. Needs more training.'
      ]
    }
  },
  {
    id: 'assassination',
    name: 'Assassination',
    icon: Skull,
    difficulty: 'hard',
    duration: 'medium',
    powerReq: 50,
    description: 'Eliminate a target silently',
    successRewards: { bond: 10, power: 8, scar: true },
    failurePenalty: { health: -30, bond: -5 },
    outcomes: {
      success: [
        'struck from the shadows. Target dead before they hit the ground. Perfect kill. Clean. Professional.',
        'used venom. Victim paralyzed, then dead. No witnesses. Your familiar is a natural assassin.',
        'strangled them silently. Coils around throat. Life draining away. Mission complete.',
        'ambushed perfectly. One strike. Fatal. Your snake returns bloodied but victorious.'
      ],
      failure: [
        'attacked but target escaped. Wounded but alive. They know someone\'s after them now.',
        'got injured in the fight. Came back bleeding. You tend to the wounds. Mission failed.',
        'hesitated. Couldn\'t make the kill. Your familiar isn\'t ready for this yet.'
      ]
    }
  },
  {
    id: 'protection',
    name: 'Guard Duty',
    icon: Shield,
    difficulty: 'medium',
    duration: 'long',
    powerReq: 35,
    description: 'Protect someone or something',
    successRewards: { bond: 8, loyalty: 10, power: 4 },
    failurePenalty: { loyalty: -10, health: -20 },
    outcomes: {
      success: [
        'guarded your lair all night. Nothing got through. Perfect sentinel.',
        'protected a servant from danger. Attacked the threat. Saved them. Your familiar is loyal.',
        'stood watch over your coffin during day. Fought off an intruder. You\'re safe because of your snake.',
        'defended your territory. Multiple threats. All repelled. Your familiar is formidable.'
      ],
      failure: [
        'tried to protect but was overpowered. Injured. Guilt in its eyes. You reassure it.',
        'fell asleep on duty. Nothing happened, but still... disappointed in itself.',
        'got distracted. Let someone slip past. You\'re not mad. Just... need better training.'
      ]
    }
  },
  {
    id: 'theft',
    name: 'Heist Mission',
    icon: Target,
    difficulty: 'medium',
    duration: 'medium',
    powerReq: 40,
    description: 'Steal something valuable',
    successRewards: { bond: 7, power: 5, loot: true },
    failurePenalty: { heat: 20, health: -15 },
    outcomes: {
      success: [
        'infiltrated a hunter\'s home. Stole their weapons. Now you have them. Turned the tables.',
        'broke into a rival vampire\'s lair. Took their artifact. They\'ll be furious. You don\'t care.',
        'stole magical items from a witch. Dangerous. Thrilling. Your snake enjoys this.',
        'robbed a blood bank. Fresh supply secured. Perfect crime. No witnesses.'
      ],
      failure: [
        'triggered an alarm. Had to abort. Came back empty. At least it survived.',
        'got caught in a trap. You had to rescue it. Mission abandoned.',
        'stole the wrong thing. Worthless. Your snake tried though.'
      ]
    }
  },
  {
    id: 'chaos',
    name: 'Create Chaos',
    icon: Zap,
    difficulty: 'easy',
    duration: 'short',
    powerReq: 25,
    description: 'Cause mayhem and confusion',
    successRewards: { bond: 6, power: 4, reputation: 5 },
    failurePenalty: { heat: 15 },
    outcomes: {
      success: [
        'released plague rats in rival territory. Chaos. Disease. They\'re weakened now.',
        'sabotaged hunter equipment. Their weapons malfunction. You have the advantage.',
        'spread rumors. Misinformation. Confusion in the vampire community. You profit.',
        'poisoned a water supply. Not fatal, just... disruptive. Your snake is delightfully evil.'
      ],
      failure: [
        'chaos backfired. Created problems for YOU. Oops.',
        'got too enthusiastic. Drew too much attention. Heat increased.',
        'mission went sideways. Your snake is fine but... messy. Very messy.'
      ]
    }
  }
];

export default function SnakeMissions({ snake, onClose }) {
  const queryClient = useQueryClient();
  const [selectedMission, setSelectedMission] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');

  const handleMission = async (mission) => {
    setSelectedMission(mission);
    setProcessing(true);

    setTimeout(async () => {
      const successChance = ((snake.power_level || 0) / 100) * 0.5 + ((snake.loyalty || 50) / 100) * 0.3 + 0.2;
      const success = Math.random() < successChance;

      const results = success ? mission.outcomes.success : mission.outcomes.failure;
      const result = results[Math.floor(Math.random() * results.length)];
      const fullOutcome = `${snake.custom_name} ${result}`;

      const updates = {};

      if (success) {
        updates.bond_level = Math.min(100, (snake.bond_level || 0) + mission.successRewards.bond);
        updates.power_level = Math.min(100, (snake.power_level || 0) + mission.successRewards.power);
        if (mission.successRewards.loyalty) {
          updates.loyalty = Math.min(100, (snake.loyalty || 0) + mission.successRewards.loyalty);
        }
        updates.missions_completed = (snake.missions_completed || 0) + 1;

        if (mission.successRewards.scar && Math.random() > 0.7) {
          const scarNames = ['Battle Scar', 'Claw Mark', 'Burn Scar', 'Bite Mark', 'Trophy Wound'];
          updates.scars = [...(snake.scars || []), scarNames[Math.floor(Math.random() * scarNames.length)]];
        }
      } else {
        if (mission.failurePenalty.health) {
          updates.health = Math.max(0, (snake.health || 100) + mission.failurePenalty.health);
        }
        if (mission.failurePenalty.bond) {
          updates.bond_level = Math.max(0, (snake.bond_level || 0) + mission.failurePenalty.bond);
        }
        if (mission.failurePenalty.loyalty) {
          updates.loyalty = Math.max(0, (snake.loyalty || 0) + mission.failurePenalty.loyalty);
        }
      }

      await base44.entities.SnakeFamiliar.update(snake.id, updates);

      await base44.entities.NightLog.create({
        entry: fullOutcome,
        category: 'power',
        intensity: success ? 'significant' : 'moderate'
      });

      setOutcome(`${success ? '✅ SUCCESS' : '❌ FAILURE'}\n\n${fullOutcome}`);
      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
        setSelectedMission(null);
      }, 5000);
    }, 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-emerald-500/50"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">🎯 Missions for {snake.custom_name}</h2>
        <p className="text-gray-400 text-sm mb-2">
          Power: {snake.power_level}/100 • Loyalty: {snake.loyalty}/100
        </p>
        <p className="text-emerald-400 text-xs mb-6">
          Missions completed: {snake.missions_completed || 0}
        </p>

        {outcome ? (
          <div className="py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/60 border border-emerald-500/30 rounded-xl p-6"
            >
              <p className="text-emerald-200 text-lg whitespace-pre-line leading-relaxed">{outcome}</p>
            </motion.div>
          </div>
        ) : processing ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ 
                x: [-50, 50, -50],
                rotate: [0, 360]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              🐍
            </motion.div>
            <p className="text-emerald-400">Mission in progress...</p>
            <p className="text-gray-500 text-sm mt-2">{selectedMission?.name}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {MISSIONS.map(mission => {
              const canDo = (snake.power_level || 0) >= mission.powerReq;
              const MissionIcon = mission.icon;
              
              return (
                <button
                  key={mission.id}
                  onClick={() => canDo && handleMission(mission)}
                  disabled={!canDo}
                  className={`w-full border-2 rounded-xl p-4 text-left transition-all ${
                    canDo 
                      ? 'bg-emerald-900/40 hover:bg-emerald-900/60 border-emerald-500/50 hover:scale-105' 
                      : 'bg-gray-800/40 border-gray-600/30 opacity-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <MissionIcon className={`w-8 h-8 flex-shrink-0 ${canDo ? 'text-emerald-400' : 'text-gray-600'}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-bold">{mission.name}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          mission.difficulty === 'easy' ? 'bg-green-600' :
                          mission.difficulty === 'medium' ? 'bg-yellow-600' :
                          'bg-red-600'
                        } text-white`}>
                          {mission.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{mission.description}</p>
                      <div className="flex gap-3 text-xs">
                        <span className={canDo ? 'text-emerald-400' : 'text-red-400'}>
                          Req: {mission.powerReq} power
                        </span>
                        <span className="text-gray-500">
                          Duration: {mission.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}