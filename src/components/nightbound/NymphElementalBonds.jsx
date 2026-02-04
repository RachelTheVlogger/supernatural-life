import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Waves, Sparkles, Moon, Sun, Snowflake, Zap, Crown, Heart, Shield, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const WATER_ENTITIES = [
  {
    id: 'poseidon',
    name: 'Poseidon',
    title: 'God of the Sea',
    icon: Crown,
    color: 'from-blue-600 to-cyan-600',
    bondRequirement: 80,
    description: 'Ancient god of oceans. Commands tides and storms.',
    powers: ['Tsunami Strike', 'Ocean\'s Wrath', 'Tidal Mastery'],
    buffs: { water_purity: 20, nature_bond: 15, connection: 20 }
  },
  {
    id: 'nereid',
    name: 'Nereid',
    title: 'Sea Nymph Spirit',
    icon: Heart,
    color: 'from-teal-600 to-green-600',
    bondRequirement: 40,
    description: 'Gentle spirit of calm waters. Brings healing.',
    powers: ['Healing Waters', 'Peaceful Tides', 'Purification Wave'],
    buffs: { water_purity: 15, nature_bond: 10, purity: 10 }
  },
  {
    id: 'undine',
    name: 'Undine',
    title: 'Water Elemental',
    icon: Waves,
    color: 'from-cyan-600 to-blue-600',
    bondRequirement: 50,
    description: 'Pure water elemental. Shapeless. Ancient.',
    powers: ['Liquid Form', 'Water Manipulation', 'Flow State'],
    buffs: { connection: 15, nature_bond: 12, water_purity: 10 }
  },
  {
    id: 'selkie',
    name: 'Selkie',
    title: 'Seal Shapeshifter',
    icon: Sparkles,
    color: 'from-purple-600 to-pink-600',
    bondRequirement: 45,
    description: 'Mysterious seal folk. Masters of transformation.',
    powers: ['Seal Form', 'Underwater Breathing', 'Arctic Endurance'],
    buffs: { nature_bond: 15, trust: 10, desire: 8 }
  },
  {
    id: 'naiad',
    name: 'Naiad',
    title: 'Freshwater Spirit',
    icon: Sparkles,
    color: 'from-green-600 to-teal-600',
    bondRequirement: 35,
    description: 'Spirit of rivers and springs. Playful. Pure.',
    powers: ['River\'s Blessing', 'Spring Creation', 'Fresh Flow'],
    buffs: { purity: 12, nature_bond: 10, water_purity: 8 }
  },
  {
    id: 'kelpie',
    name: 'Kelpie',
    title: 'Dark Water Horse',
    icon: Moon,
    color: 'from-gray-600 to-slate-600',
    bondRequirement: 60,
    description: 'Mysterious water horse. Dangerous. Powerful.',
    powers: ['Shadow Swim', 'Drowning Curse', 'Dark Waters'],
    buffs: { corruption: 15, connection: 12, fear: 10 }
  },
  {
    id: 'leviathan',
    name: 'Leviathan',
    title: 'Ancient Sea Serpent',
    icon: Zap,
    color: 'from-indigo-600 to-purple-600',
    bondRequirement: 90,
    description: 'Primordial sea beast. Oldest. Most powerful.',
    powers: ['Abyssal Call', 'Serpent\'s Rage', 'Deep Terror'],
    buffs: { connection: 25, nature_bond: 20, fear: 15 }
  },
  {
    id: 'rusalka',
    name: 'Rusalka',
    title: 'Vengeful Water Spirit',
    icon: Moon,
    color: 'from-pink-600 to-red-600',
    bondRequirement: 55,
    description: 'Tragic spirit. Seductive. Dangerous.',
    powers: ['Lure Song', 'Water Curse', 'Vengeful Tide'],
    buffs: { desire: 15, corruption: 10, fear: 8 }
  },
  {
    id: 'aegir',
    name: 'Aegir',
    title: 'Norse Sea God',
    icon: Shield,
    color: 'from-blue-600 to-indigo-600',
    bondRequirement: 75,
    description: 'Norse god of ocean depths. Brewer of storms.',
    powers: ['Storm召唤', 'Ocean Fortress', 'Tidal Shield'],
    buffs: { connection: 18, nature_bond: 15, trust: 12 }
  },
  {
    id: 'mami_wata',
    name: 'Mami Wata',
    title: 'Water Goddess',
    icon: Crown,
    color: 'from-emerald-600 to-teal-600',
    bondRequirement: 70,
    description: 'African water deity. Beauty. Wealth. Power.',
    powers: ['Divine Beauty', 'Wealth Flow', 'Sacred Waters'],
    buffs: { desire: 18, connection: 15, water_purity: 12 }
  },
  {
    id: 'sedna',
    name: 'Sedna',
    title: 'Inuit Sea Goddess',
    icon: Snowflake,
    color: 'from-cyan-600 to-blue-600',
    bondRequirement: 65,
    description: 'Goddess of arctic seas. Controls marine life.',
    powers: ['Arctic Command', 'Ice Waters', 'Marine Communion'],
    buffs: { connection: 16, nature_bond: 14, purity: 10 }
  },
  {
    id: 'yemoja',
    name: 'Yemoja',
    title: 'Mother of Waters',
    icon: Heart,
    color: 'from-blue-600 to-purple-600',
    bondRequirement: 85,
    description: 'Yoruba river goddess. Mother. Nurturer. Protector.',
    powers: ['Mother\'s Embrace', 'Life Flow', 'Protective Tide'],
    buffs: { purity: 20, trust: 18, connection: 15 }
  }
];

export default function NymphElementalBonds({ nymph, onClose }) {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [selectedEntity, setSelectedEntity] = useState(null);

  const currentBonds = nymph.elemental_bonds || [];
  const natureLevel = nymph.nature_bond || 50;

  const handleFormBond = async (entity) => {
    setProcessing(true);
    setSelectedEntity(entity);

    setTimeout(async () => {
      const outcomes = {
        poseidon: `You dove deep. Impossibly deep. The ocean pressure should have crushed you. But then HE appeared. Poseidon. Ancient. Massive. Terrifying. Beautiful. "Little nymph," his voice was thunder underwater, "you seek my favor?" You bowed. He smiled. Trident glowed. Power flooded you. Ocean's blessing received.`,
        nereid: `You swam to the coral gardens. Other nereids were there. Dancing. Singing. They saw you. Circled you. "Sister," they called you. You danced with them. Their magic intertwined with yours. Gentle. Healing. Pure. You felt their acceptance. Their love. Bond formed through joy.`,
        undine: `You found the underwater cave. Impossibly dark. You entered. The water itself spoke. "We are water. You are water. No difference." The undine merged with you. For a moment you WERE water. Pure liquid. No form. No boundaries. Then separation. But changed. Forever.`,
        selkie: `You heard crying on the shore. A seal. But not a seal. They transformed. Human. Beautiful. Sad. "You understand," they said, touching your hand. "Being two things. Never fully one." You held them. Shared stories. Tears. The bond formed through understanding. Transformation recognized transformation.`,
        naiad: `You created a new spring. Fresh water bubbled up. A naiad emerged. Young. Playful. Giggling. "You made me!" They danced around you. Pure joy. Innocent. You laughed with them. Their purity infectious. The bond was effortless. Natural. Like breathing.`,
        kelpie: `The dark water horse emerged from fog. Eyes glowing. Dangerous. It circled you. Testing. You didn't run. Didn't fear. "I am darkness too," you told it. Truth. The kelpie bowed its head. Let you touch its mane. Cold. Wet. Power. Dark bond accepted.`,
        leviathan: `You descended to the abyssal plain. Darkness absolute. Then movement. MASSIVE. The leviathan. Ancient beyond measure. Its eye alone was bigger than you. It studied you. "You dare?" its voice vibrated the ocean. "Yes," you said. Small. Brave. It laughed. Approved. Primordial bond formed.`,
        rusalka: `You heard her singing. Sad. Beautiful. Drowning. You followed. She emerged from the lake. Dripping. Ethereal. "They wronged me," she whispered. "I understand," you said. And you did. Her pain. Her rage. Her seduction. She smiled. Cold. You smiled back. Kindred spirits.`,
        aegir: `The storm was impossible. Waves like mountains. You shouldn't have survived. Then you saw him. Aegir. Massive. Bearded. Laughing. "You challenge MY storm?" Thunder in his voice. "I am the storm," you replied. He roared with laughter. Respect earned. Nordic bond sealed with mead and thunder.`,
        mami_wata: `She appeared from the depths. Beautiful beyond description. Draped in jewels. Water serpent coiled around her. "You seek power?" she asked, knowing. "Yes," you admitted. She smiled. "Honest. I like that." Her blessing came with a price. But power always does. Divine bond formed.`,
        sedna: `The arctic waters were freezing. You shouldn't survive. But you called her name. Sedna rose. Massive. Ancient. Her hair was seaweed, her fingers were seals. "Why disturb me?" ice in her voice. "To learn," you said. She studied you. Long. Then nodded. Arctic wisdom shared.`,
        yemoja: `You cried by the river. She came. Mother. Protector. Yemoja. She held you like a child. "Little one," her voice was rivers flowing, "you are never alone." Her embrace was all water. All comfort. All love. You felt safe. Completely. Bond of mother and child.`
      };

      const text = outcomes[entity.id];
      setOutcome(text);

      // Add bond and apply buffs
      const newBonds = [...currentBonds, entity.id];
      const updates = {
        elemental_bonds: newBonds
      };

      // Apply buffs
      Object.keys(entity.buffs).forEach(stat => {
        updates[stat] = Math.min(100, (nymph[stat] || 0) + entity.buffs[stat]);
      });

      await base44.entities.WaterNymph.update(nymph.id, updates);

      await base44.entities.NightLog.create({
        entry: text,
        category: 'power',
        intensity: 'extreme'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
        setSelectedEntity(null);
      }, 6000);
    }, 3000);
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
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-teal-950 to-cyan-950 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-teal-500/50"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Elemental Bonds</h2>
            <p className="text-teal-300 text-sm">Form bonds with water spirits and deities</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Current Bonds */}
        {currentBonds.length > 0 && (
          <div className="mb-6">
            <h3 className="text-white font-bold mb-3">Your Bonds</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentBonds.map(bondId => {
                const entity = WATER_ENTITIES.find(e => e.id === bondId);
                if (!entity) return null;
                const Icon = entity.icon;
                return (
                  <div key={bondId} className={`bg-gradient-to-r ${entity.color} rounded-xl p-4 border-2 border-white/30`}>
                    <div className="flex items-start gap-3">
                      <Icon className="w-6 h-6 text-white flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-white font-bold">{entity.name}</h4>
                        <p className="text-white/80 text-xs">{entity.title}</p>
                        <div className="mt-2 space-y-1">
                          {entity.powers.map((power, i) => (
                            <div key={i} className="text-xs text-white/90 flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              {power}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Outcome Display */}
        <AnimatePresence>
          {outcome && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-black/60 rounded-xl p-6 mb-6 border border-teal-500/30"
            >
              <p className="text-teal-100 leading-relaxed">{outcome}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Available Entities */}
        <div>
          <h3 className="text-white font-bold mb-3">Available Bonds</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WATER_ENTITIES.map(entity => {
              const Icon = entity.icon;
              const isBonded = currentBonds.includes(entity.id);
              const canBond = natureLevel >= entity.bondRequirement && !isBonded;

              return (
                <div
                  key={entity.id}
                  className={`rounded-xl p-4 border-2 transition-all ${
                    isBonded 
                      ? 'bg-gray-800/40 border-gray-600/30 opacity-50'
                      : canBond
                        ? 'bg-black/40 border-teal-500/50 hover:border-teal-400 cursor-pointer'
                        : 'bg-black/20 border-gray-700/30 opacity-40'
                  }`}
                  onClick={() => canBond && !processing && handleFormBond(entity)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${entity.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-bold">{entity.name}</h4>
                      <p className="text-gray-400 text-xs">{entity.title}</p>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-3">{entity.description}</p>

                  <div className="space-y-2 mb-3">
                    <div className="text-xs text-teal-300">Powers Granted:</div>
                    {entity.powers.map((power, i) => (
                      <div key={i} className="text-xs text-gray-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {power}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className={`${canBond ? 'text-teal-400' : 'text-gray-500'}`}>
                      Requires: Nature Bond {entity.bondRequirement}
                    </span>
                    {isBonded && <span className="text-green-400">✓ Bonded</span>}
                    {!isBonded && !canBond && <span className="text-red-400">Locked</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {processing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 flex items-center justify-center bg-black/80 z-50"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl"
            >
              🌊
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}