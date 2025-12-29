import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Zap, Crown, Flame, Skull, Shield, Eye } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const EVOLUTION_STAGES = [
  {
    stage: 1,
    name: 'Dormant Shadow',
    description: 'Unaware. Powerless. Just a copy.',
    powerReq: 0,
    relationReq: 0,
    icon: '👤',
    abilities: ['None']
  },
  {
    stage: 2,
    name: 'Awakened Echo',
    description: 'They sense something is different. Power stirs.',
    powerReq: 50,
    relationReq: 20,
    icon: '👁️',
    abilities: ['Sense Doppelgängers', 'Supernatural Awareness']
  },
  {
    stage: 3,
    name: 'Resonant Twin',
    description: 'They can mimic supernatural abilities. Shapeshifting begins.',
    powerReq: 80,
    relationReq: 40,
    icon: '🌀',
    abilities: ['Minor Shapeshifting', 'Ability Mimicry', 'Enhanced Healing']
  },
  {
    stage: 4,
    name: 'Paradox Being',
    description: 'Reality bends around them. They exist in multiple states.',
    powerReq: 120,
    relationReq: 60,
    icon: '✨',
    abilities: ['Full Shapeshifting', 'Phase Through Reality', 'Mirror Magic']
  },
  {
    stage: 5,
    name: 'Original Anomaly',
    description: 'They transcended being a copy. Now they\'re something NEW.',
    powerReq: 150,
    relationReq: 80,
    icon: '🌟',
    abilities: ['Create Copies', 'Reality Manipulation', 'Immortality', 'Bloodline Mastery']
  }
];

const EVOLUTION_PATHS = [
  {
    id: 'guardian',
    name: 'Guardian Path',
    icon: Shield,
    color: 'from-blue-600 to-blue-800',
    description: 'Evolve them into a protector',
    requirements: { relationship: 60, humanity: 60 },
    outcome: 'They evolved into a Guardian. Devoted. Powerful. They will protect you with their life.',
    abilities: ['Impenetrable Defense', 'Shield Others', 'Healing Aura']
  },
  {
    id: 'shadow',
    name: 'Shadow Path',
    icon: Eye,
    color: 'from-purple-600 to-purple-800',
    description: 'Evolve them into a spy',
    requirements: { relationship: 30, power: 100 },
    outcome: 'They evolved into a Shadow. Perfect infiltrator. They can become anyone.',
    abilities: ['Perfect Mimicry', 'Invisibility', 'Memory Reading']
  },
  {
    id: 'weapon',
    name: 'Weapon Path',
    icon: Skull,
    color: 'from-red-600 to-red-800',
    description: 'Evolve them into a killer',
    requirements: { relationship: -20, power: 120 },
    outcome: 'They evolved into a Weapon. Pure destruction. They kill without hesitation.',
    abilities: ['Lethal Touch', 'Blood Explosion', 'Death Sense']
  },
  {
    id: 'sovereign',
    name: 'Sovereign Path',
    icon: Crown,
    color: 'from-yellow-600 to-orange-600',
    description: 'Evolve them into a leader',
    requirements: { relationship: 80, power: 130 },
    outcome: 'They evolved into a Sovereign. Majestic. Powerful. They command other doppelgängers.',
    abilities: ['Doppelgänger Control', 'Mass Shapeshifting', 'Royal Presence']
  },
  {
    id: 'chaos',
    name: 'Chaos Path',
    icon: Flame,
    color: 'from-pink-600 to-red-600',
    description: 'Evolve them into pure chaos',
    requirements: { relationship: -40, power: 140, humanity: 20 },
    outcome: 'They evolved into Chaos. Unstable. Dangerous. Reality breaks around them.',
    abilities: ['Reality Distortion', 'Unpredictable Powers', 'Madness Aura']
  },
  {
    id: 'ascended',
    name: 'Ascended Path',
    icon: Zap,
    color: 'from-cyan-600 to-blue-600',
    description: 'Transcend doppelgänger nature entirely',
    requirements: { relationship: 100, power: 150, humanity: 80 },
    outcome: 'They ASCENDED. No longer a copy. A true original. Something the world has never seen.',
    abilities: ['Original Existence', 'Create Reality', 'True Immortality', 'Omnipresence']
  }
];

export default function DoppelgangerEvolution({ doppelganger, vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');

  const getCurrentStage = () => {
    const power = doppelganger.power_level || 0;
    const relation = doppelganger.relationship_vampire || 0;
    
    for (let i = EVOLUTION_STAGES.length - 1; i >= 0; i--) {
      if (power >= EVOLUTION_STAGES[i].powerReq && relation >= EVOLUTION_STAGES[i].relationReq) {
        return EVOLUTION_STAGES[i];
      }
    }
    return EVOLUTION_STAGES[0];
  };

  const canEvolve = (path) => {
    const power = doppelganger.power_level || 0;
    const relation = doppelganger.relationship_vampire || 0;
    const humanity = vampireState?.humanity || 50;

    return (
      (!path.requirements.relationship || relation >= path.requirements.relationship) &&
      (!path.requirements.power || power >= path.requirements.power) &&
      (!path.requirements.humanity || humanity >= path.requirements.humanity)
    );
  };

  const handleEvolve = async (path) => {
    setProcessing(true);

    setTimeout(async () => {
      await base44.entities.Doppelganger.update(doppelganger.id, {
        evolution_path: path.id,
        power_level: 150,
        is_evolved: true,
        unlocked_abilities: path.abilities
      });

      await base44.entities.NightLog.create({
        entry: path.outcome,
        category: 'power',
        intensity: 'major'
      });

      queryClient.invalidateQueries();
      setOutcome(path.outcome);

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
        onClose();
      }, 5000);
    }, 3000);
  };

  const currentStage = getCurrentStage();

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
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-yellow-500/50"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">⚡ Doppelgänger Evolution</h2>
        <p className="text-gray-400 text-sm mb-6">
          Guide their transformation. Shape what they become.
        </p>

        {/* Current Stage */}
        <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-2 border-purple-500/50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-white font-bold text-lg">{currentStage.name}</h3>
              <p className="text-purple-300 text-sm">Stage {currentStage.stage} of 5</p>
            </div>
            <div className="text-5xl">{currentStage.icon}</div>
          </div>
          <p className="text-gray-300 text-sm mb-3">{currentStage.description}</p>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Power: {doppelganger.power_level || 0}/150</span>
              </div>
              <div className="bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(((doppelganger.power_level || 0) / 150) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Relationship: {doppelganger.relationship_vampire || 0}/100</span>
              </div>
              <div className="bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(Math.max((doppelganger.relationship_vampire || 0), 0), 100)}%` }}
                />
              </div>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-gray-400 text-xs mb-1">Current Abilities:</p>
            <div className="flex flex-wrap gap-2">
              {currentStage.abilities.map((ability, i) => (
                <span key={i} className="text-xs px-2 py-1 bg-purple-950/60 text-purple-300 rounded-full">
                  {ability}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Evolution Paths */}
        {outcome ? (
          <div className="py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/60 border border-yellow-500/30 rounded-xl p-6"
            >
              <p className="text-yellow-100 text-base leading-relaxed">{outcome}</p>
            </motion.div>
          </div>
        ) : processing ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ scale: [1, 1.3, 1], rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              ⚡
            </motion.div>
            <p className="text-yellow-400">Evolution in progress...</p>
          </div>
        ) : doppelganger.is_evolved ? (
          <div className="bg-green-900/40 border border-green-500/50 rounded-xl p-6 text-center">
            <Crown className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h3 className="text-white font-bold text-lg mb-2">Already Evolved</h3>
            <p className="text-gray-300 text-sm mb-3">
              Path: {doppelganger.evolution_path}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {doppelganger.unlocked_abilities?.map((ability, i) => (
                <span key={i} className="text-xs px-3 py-1 bg-green-950/60 text-green-300 rounded-full">
                  {ability}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-white font-bold mb-3">Choose Evolution Path:</h3>
            {EVOLUTION_PATHS.map(path => {
              const Icon = path.icon;
              const eligible = canEvolve(path);
              
              return (
                <button
                  key={path.id}
                  onClick={() => eligible && handleEvolve(path)}
                  disabled={!eligible}
                  className={`w-full bg-gradient-to-r ${path.color} ${!eligible ? 'opacity-50' : 'hover:scale-105'} border-2 ${eligible ? 'border-white/50' : 'border-gray-600/30'} rounded-xl p-4 text-left transition-all disabled:cursor-not-allowed`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-6 h-6 text-white mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-white font-bold mb-1">{path.name}</h4>
                      <p className="text-gray-100 text-sm mb-2">{path.description}</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {path.abilities.map((ability, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-black/30 text-white rounded-full">
                            {ability}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-white/80">
                        Requirements: 
                        {path.requirements.relationship !== undefined && ` Relation ${path.requirements.relationship}+`}
                        {path.requirements.power !== undefined && ` Power ${path.requirements.power}+`}
                        {path.requirements.humanity !== undefined && ` Humanity ${path.requirements.humanity}+`}
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