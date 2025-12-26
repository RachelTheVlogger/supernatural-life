import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Flame, Droplets, Wind, Skull, Heart, Zap, Moon, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import HerbGathering from '@/components/nightbound/HerbGathering';

const SPELLS = {
  elemental: [
    { name: 'Incendia', icon: '🔥', herbs: 'Bay leaves, cinnamon', power: 25, description: 'Ignite flames with a gesture', cost: 15, latin: 'Incendia' },
    { name: 'Aqueous', icon: '🌊', herbs: 'Vervain, moonwater', power: 30, description: 'Manipulate water', cost: 20, latin: 'Aqua Deflecto' },
    { name: 'Ventus', icon: '💨', herbs: 'Lavender, sage', power: 25, description: 'Control wind and air', cost: 18, latin: 'Phasmatos Ventus' },
    { name: 'Terra Motus', icon: '🪨', herbs: 'Rosemary, salt', power: 35, description: 'Shake the earth', cost: 30, latin: 'Phasmatos Tribum Terra' },
    { name: 'Pyro Burst', icon: '💥', herbs: 'Dragon\'s blood resin', power: 40, description: 'Explosive fire blast', cost: 35, latin: 'Incendia Maximus' }
  ],
  psychic: [
    { name: 'Telepathy', icon: '🧠', herbs: 'Mugwort, jasmine', power: 20, description: 'Read surface thoughts', cost: 20, latin: 'Phasmatos Matos' },
    { name: 'Mind Compulsion', icon: '💭', herbs: 'Wormwood, henbane', power: 45, description: 'Plant suggestions in mind', cost: 40, latin: 'Phasmatos Somnus' },
    { name: 'Memory Erase', icon: '🌫️', herbs: 'Forget-me-not, poppy', power: 50, description: 'Remove specific memories', cost: 45, latin: 'Phasmatos Tributum Obliviscar' },
    { name: 'Telekinesis', icon: '🌀', herbs: 'Dandelion, thistle', power: 30, description: 'Move objects with mind', cost: 25, latin: 'Motus' },
    { name: 'Pain Infliction', icon: '⚡', herbs: 'Nettle, thorns', power: 35, description: 'Cause intense pain', cost: 30, latin: 'Phasmatos Incendia' },
    { name: 'Aneurysm Spell', icon: '🩸', herbs: 'Black pepper, cayenne', power: 55, description: 'Burst blood vessels in brain', cost: 50, latin: 'Corporis Impetus Nocere' }
  ],
  necromancy: [
    { name: 'Spirit Communication', icon: '👻', herbs: 'Graveyard dirt, belladonna', power: 25, description: 'Speak with the dead', cost: 25, latin: 'Phasmatos Spiritum' },
    { name: 'Resurrection', icon: '🕊️', herbs: 'White sage, myrrh, blood', power: 80, description: 'Bring someone back to life', cost: 75, latin: 'Phasmatos Revertas' },
    { name: 'Expression Triangle', icon: '🔺', herbs: 'Human sacrifice', power: 90, description: 'Tap into dark Expression magic', cost: 85, latin: 'Expression Ritual' },
    { name: 'Ancestral Channeling', icon: '🌙', herbs: 'Bone dust, salt circle', power: 40, description: 'Draw power from ancestors', cost: 35, latin: 'Phasmatos Antiqua' },
    { name: 'Veil Manipulation', icon: '🌑', herbs: 'Moonstone, obsidian', power: 70, description: 'Lower veil between living and dead', cost: 65, latin: 'Clausus Velum' }
  ],
  protection: [
    { name: 'Boundary Spell', icon: '⭕', herbs: 'Salt, iron, vervain', power: 40, description: 'Create magical barrier', cost: 35, latin: 'Phasmatos Salves' },
    { name: 'Invitation Removal', icon: '🚫', herbs: 'Sage, salt circle', power: 35, description: 'Uninvite vampire from home', cost: 30, latin: 'Claudare Ianua' },
    { name: 'Daylight Amulet', icon: '☀️', herbs: 'Lapis lazuli, sunstone', power: 50, description: 'Enchant jewelry for daylight', cost: 45, latin: 'Phasmatos Solaris' },
    { name: 'Protection Circle', icon: '🔮', herbs: 'Salt, candles, blood', power: 30, description: 'Sacred protective circle', cost: 25, latin: 'Phasmatos Circumventus' },
    { name: 'Bennett Sealing Spell', icon: '🔒', herbs: 'Bennett blood, sage', power: 85, description: 'Powerful Bennett bloodline seal', cost: 80, latin: 'Phasmatos Bennett Sigillum' }
  ],
  divination: [
    { name: 'Locator Spell', icon: '🧭', herbs: 'Personal item, map, candles', power: 25, description: 'Find anyone, anywhere', cost: 20, latin: 'Phasmatos Tribum' },
    { name: 'Scrying', icon: '🔮', herbs: 'Crystal ball, mugwort', power: 30, description: 'See distant places/events', cost: 25, latin: 'Spectare' },
    { name: 'Prophecy Vision', icon: '👁️', herbs: 'Bay leaves, frankincense', power: 45, description: 'Glimpse possible futures', cost: 40, latin: 'Phasmatos Futurum' },
    { name: 'Blood Tracking', icon: '🩸', herbs: 'Blood sample, sage', power: 35, description: 'Track someone by their blood', cost: 30, latin: 'Sanguinem Invenire' }
  ],
  dark_magic: [
    { name: 'Desiccation Spell', icon: '💀', herbs: 'Vervain, nightshade', power: 60, description: 'Mummify a vampire', cost: 55, latin: 'Phasmatos Somnus' },
    { name: 'Link Spell', icon: '⛓️', herbs: 'Personal items, blood', power: 50, description: 'Link two beings together', cost: 45, latin: 'Ligare Sanguinem' },
    { name: 'Hellfire', icon: '🔥', herbs: 'Sulfur, black salt', power: 70, description: 'Summon infernal flames', cost: 65, latin: 'Ignis Infernalis' },
    { name: 'Curse of Pain', icon: '⚡', herbs: 'Thorns, graveyard dirt', power: 55, description: 'Inflict ongoing agony', cost: 50, latin: 'Maledictum Doloris' },
    { name: 'Expression Magic', icon: '🌑', herbs: 'Human sacrifice', power: 95, description: 'Forbidden dark power', cost: 90, latin: 'Expression words' }
  ]
};

const RITUALS = [
  { name: 'Full Moon Channeling', icon: '🌕', duration: 5000, powerBoost: 25, description: 'Draw power from the full moon', herbs: 'Moonstone, white candles, lunar water' },
  { name: 'Salt Circle Ritual', icon: '⭕', duration: 3000, powerBoost: 15, description: 'Create protective barrier', herbs: 'Sea salt, iron, vervain' },
  { name: 'Ancestral Invocation', icon: '👥', duration: 6000, powerBoost: 35, description: 'Channel power of dead witches', herbs: 'Bone ash, white sage, blood' },
  { name: 'Expression Triangle', icon: '🔺', duration: 8000, powerBoost: 50, description: 'Forbidden power ritual (DANGEROUS)', herbs: 'Three massacres worth of power' },
  { name: 'Cleansing Ritual', icon: '💫', duration: 4000, powerBoost: 10, description: 'Purify yourself and space', herbs: 'White sage, palo santo, salt' },
  { name: 'Blood Magic Ritual', icon: '🩸', duration: 5000, powerBoost: 30, description: 'Use blood to amplify spells', herbs: 'Your blood, black candles, obsidian' },
  { name: 'Boundary Spell', icon: '🚪', duration: 7000, powerBoost: 20, description: 'Trap vampires in a location', herbs: 'Salt line, Bennett magic, moonstone' }
];

export default function WitchHome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [castingSpell, setCastingSpell] = useState(null);
  const [performingRitual, setPerformingRitual] = useState(null);
  const [spellOutcome, setSpellOutcome] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('elemental');
  const [showSpellbook, setShowSpellbook] = useState(false);
  const [showVampireInteractions, setShowVampireInteractions] = useState(false);
  const [showHerbGathering, setShowHerbGathering] = useState(false);

  const { data: witches = [] } = useQuery({
    queryKey: ['witches'],
    queryFn: () => base44.entities.Witch.list()
  });

  const { data: vampireStates = [] } = useQuery({
    queryKey: ['vampireState'],
    queryFn: () => base44.entities.VampireState.list()
  });

  const { data: herbs = [] } = useQuery({
    queryKey: ['witchHerbs'],
    queryFn: async () => {
      if (!witches[0]) return [];
      return base44.entities.WitchHerb.filter({ witch_id: witches[0].id });
    },
    enabled: witches.length > 0
  });

  const witch = witches[0];
  const vampireState = vampireStates[0];

  // INFINITE spell generation based on power level
  const [generatedSpells, setGeneratedSpells] = React.useState({});
  const [generatingSpells, setGeneratingSpells] = React.useState(false);

  const getAvailableSpells = () => {
    const baseSpells = { ...SPELLS };
    const powerLevel = witch?.power_level || 80;

    // Base unlocks (82-98)
    if (powerLevel >= 82) {
      baseSpells.elemental = [...baseSpells.elemental,
        { name: 'Inferno Storm', icon: '🌋', herbs: 'Dragon\'s blood, sulfur', power: 70, description: 'Rain down meteoric fire', cost: 60, latin: 'Ignis Tempestas' }
      ];
      baseSpells.psychic = [...baseSpells.psychic,
        { name: 'Mind Control', icon: '🧠', herbs: 'Henbane, wormwood', power: 75, description: 'Complete control over mind', cost: 70, latin: 'Mentis Imperio' }
      ];
    }

    if (powerLevel >= 84) {
      baseSpells.elemental = [...baseSpells.elemental,
        { name: 'Lightning Strike', icon: '⚡', herbs: 'Storm water, iron', power: 65, description: 'Call lightning from sky', cost: 55, latin: 'Fulmen Caelum' }
      ];
      baseSpells.necromancy = [...baseSpells.necromancy,
        { name: 'Army of Dead', icon: '💀', herbs: 'Grave dirt, bones', power: 90, description: 'Raise multiple corpses', cost: 85, latin: 'Exercitus Mortuorum' }
      ];
    }

    if (powerLevel >= 86) {
      baseSpells.psychic = [...baseSpells.psychic,
        { name: 'Mass Hallucination', icon: '👁️', herbs: 'Nightshade, mugwort', power: 70, description: 'Make many see illusions', cost: 65, latin: 'Collective Visio' }
      ];
      baseSpells.dark_magic = [...baseSpells.dark_magic,
        { name: 'Soul Extraction', icon: '👻', herbs: 'Black candles, obsidian', power: 85, description: 'Rip soul from body', cost: 80, latin: 'Anima Evulsio' }
      ];
    }

    if (powerLevel >= 88) {
      baseSpells.elemental = [...baseSpells.elemental,
        { name: 'Volcanic Eruption', icon: '🔥', herbs: 'Lava rock, obsidian', power: 80, description: 'Cause volcanic destruction', cost: 75, latin: 'Vulcanus Eruptio' }
      ];
      baseSpells.necromancy = [...baseSpells.necromancy,
        { name: 'Death Wave', icon: '💀', herbs: 'Mass grave dirt', power: 85, description: 'Instant death in wide area', cost: 80, latin: 'Mors Unda' }
      ];
    }

    if (powerLevel >= 90) {
      baseSpells.elemental = [...baseSpells.elemental,
        { name: 'Elemental Fusion', icon: '🌪️', herbs: 'All elemental herbs', power: 95, description: 'Combine all elements', cost: 90, latin: 'Elementum Unio' }
      ];
      baseSpells.necromancy = [...baseSpells.necromancy,
        { name: 'True Resurrection', icon: '✨', herbs: 'Life essence, moonstone', power: 100, description: 'Fully restore someone to life', cost: 95, latin: 'Vita Restauratio' }
      ];
    }

    if (powerLevel >= 92) {
      baseSpells.dark_magic = [...baseSpells.dark_magic,
        { name: 'Reality Warp', icon: '🌀', herbs: 'Expression sacrifice', power: 100, description: 'Bend reality itself', cost: 95, latin: 'Realitas Mutatio' }
      ];
      baseSpells.psychic = [...baseSpells.psychic,
        { name: 'World Illusion', icon: '🌐', herbs: 'Ancient crystals', power: 95, description: 'Make everyone see false reality', cost: 90, latin: 'Mundus Illusio' }
      ];
    }

    if (powerLevel >= 94) {
      baseSpells.protection = [...baseSpells.protection,
        { name: 'Immortality Shield', icon: '✨', herbs: 'Phoenix ash, moonstone', power: 100, description: 'Become invulnerable temporarily', cost: 95, latin: 'Immortalitas Scutum' }
      ];
      baseSpells.divination = [...baseSpells.divination,
        { name: 'Omniscience', icon: '👁️', herbs: 'All-seeing crystal', power: 100, description: 'Know everything happening now', cost: 95, latin: 'Omniscientia' }
      ];
    }

    if (powerLevel >= 96) {
      baseSpells.elemental = [...baseSpells.elemental,
        { name: 'Apocalypse Storm', icon: '⛈️', herbs: 'End-times herbs', power: 100, description: 'Summon world-ending storm', cost: 98, latin: 'Apocalypsis Tempestas' }
      ];
    }

    if (powerLevel >= 98) {
      baseSpells.dark_magic = [...baseSpells.dark_magic,
        { name: 'God Killer', icon: '⚡', herbs: 'Divine sacrifice', power: 100, description: 'Kill immortal beings', cost: 99, latin: 'Deus Interfector' }
      ];
    }

    // INFINITE GENERATION: Add AI-generated spells for power > 100
    if (powerLevel > 100 && generatedSpells[powerLevel]) {
      Object.keys(generatedSpells[powerLevel]).forEach(category => {
        if (baseSpells[category]) {
          baseSpells[category] = [...baseSpells[category], ...generatedSpells[powerLevel][category]];
        }
      });
    }

    return baseSpells;
  };

  // Generate new spells when power exceeds 100
  React.useEffect(() => {
    if (!witch || witch.power_level <= 100 || generatedSpells[witch.power_level] || generatingSpells) return;

    const generateNewSpells = async () => {
      setGeneratingSpells(true);
      try {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `You are generating new ultra-powerful witch spells for a power level of ${witch.power_level}.
          
Generate 3 spells across different categories (elemental, psychic, necromancy, dark_magic, protection, divination).
Each spell should be more powerful than anything before. Power level ${witch.power_level} is godlike.

Return ONLY valid JSON in this exact format:
{
  "spells": [
    {
      "category": "elemental",
      "name": "Cosmic Inferno",
      "icon": "🌌",
      "herbs": "Stardust, cosmic ash",
      "power": ${witch.power_level},
      "description": "Summon fire from dying stars",
      "cost": ${Math.floor(witch.power_level * 0.95)},
      "latin": "Cosmicus Incendium"
    }
  ]
}

Make spells creative, powerful, and thematically appropriate for power level ${witch.power_level}.`,
          response_json_schema: {
            type: 'object',
            properties: {
              spells: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    category: { type: 'string' },
                    name: { type: 'string' },
                    icon: { type: 'string' },
                    herbs: { type: 'string' },
                    power: { type: 'number' },
                    description: { type: 'string' },
                    cost: { type: 'number' },
                    latin: { type: 'string' }
                  }
                }
              }
            }
          }
        });

        const categorized = {};
        response.spells.forEach(spell => {
          if (!categorized[spell.category]) categorized[spell.category] = [];
          categorized[spell.category].push(spell);
        });

        setGeneratedSpells(prev => ({
          ...prev,
          [witch.power_level]: categorized
        }));
      } catch (e) {
        console.error('Failed to generate spells:', e);
      }
      setGeneratingSpells(false);
    };

    generateNewSpells();
  }, [witch?.power_level, generatedSpells, generatingSpells]);

  const handleCastSpell = async (spell) => {
    if (!witch) return;
    if (witch.power_level < spell.cost) {
      alert(`Not enough power! Need ${spell.cost}, have ${witch.power_level}`);
      return;
    }

    setCastingSpell(spell);

    setTimeout(async () => {
      const success = Math.random() > 0.2;
      
      const outcomes = success ? [
        `${spell.name} cast successfully! Power surges through you.`,
        `The spell worked perfectly. ${spell.description}.`,
        `Magic flows naturally. ${spell.name} executed flawlessly.`,
        `Your power is growing. ${spell.name} was effortless.`
      ] : [
        `${spell.name} backfired! Power depleted.`,
        `The spell fizzled. Magic is unpredictable.`,
        `Lost control. ${spell.name} failed.`
      ];

      const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
      setSpellOutcome(outcome);

      const newPower = success 
        ? witch.power_level - spell.cost + 5
        : Math.max(0, witch.power_level - spell.cost - 10);

      await base44.entities.Witch.update(witch.id, {
        power_level: newPower
      });

      await base44.entities.NightLog.create({
        entry: `${witch.name} cast ${spell.name}. ${outcome}`,
        category: 'power',
        intensity: success ? 'moderate' : 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setCastingSpell(null);
        setSpellOutcome('');
      }, 3000);
    }, 2000);
  };

  const handleRitual = async (ritual) => {
    if (!witch) return;
    setPerformingRitual(ritual);

    setTimeout(async () => {
      const powerGain = ritual.powerBoost + Math.floor(Math.random() * 10);
      
      await base44.entities.Witch.update(witch.id, {
        power_level: witch.power_level + powerGain
      });

      await base44.entities.NightLog.create({
        entry: `${witch.name} performed ${ritual.name}. Power increased by ${powerGain}.`,
        category: 'power',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();
      setPerformingRitual(null);
    }, ritual.duration);
  };

  const handleVampireInteraction = async (type) => {
    if (!witch || !vampireState) return;

    setCastingSpell({ name: type, icon: '✨' });

    setTimeout(async () => {
      const interactions = {
        suppress: {
          outcome: 'Temporarily suppressed vampire abilities. They weakened.',
          relationshipChange: -15,
          dispositionChange: 'hostile'
        },
        help: {
          outcomes: [
            'You used healing magic to soothe their hunger. They looked at you with gratitude.',
            'Your magic eased their bloodlust. "Thank you," they whispered.',
            'You cast a calming spell. The beast inside them quieted.'
          ],
          relationshipChange: 15,
          hungerEffect: true
        },
        talk: {
          outcomes: [
            'You talked about magic and immortality. Two sides of the supernatural coin.',
            'Deep conversation. They understand the weight of power. So do you.',
            'You shared stories. Witches and vampires—not so different after all.'
          ],
          relationshipChange: 10
        },
        flirt: {
          outcomes: [
            'You teased them with magic. Sparks dancing between you. They smiled.',
            'Flirtatious magic. Enchantments and glances. Chemistry undeniable.',
            'The tension between witch and vampire. Electric. Dangerous. Perfect.'
          ],
          relationshipChange: 12
        },
        kiss: {
          outcomes: [
            'You kissed them. Magic and darkness colliding. Perfect.',
            'Witch lips on vampire lips. Supernatural. Intoxicating.',
            'You kissed deeply. They pulled you closer. No hesitation.'
          ],
          relationshipChange: 18
        },
        intimate: {
          outcomes: [
            'Witch and vampire. Bodies entwined. Magic surging with every touch.',
            'You made love under the moon. Power and darkness became one.',
            'Intimacy between supernatural beings. Overwhelming. Perfect.'
          ],
          relationshipChange: 25
        },
        ally: {
          outcomes: [
            'You offered an alliance. Witch and vampire together. They accepted.',
            'Alliance formed. Your powers combined. Unstoppable.',
            'You pledged to protect each other. Supernatural pact made.'
          ],
          relationshipChange: 20,
          dispositionChange: 'allied'
        }
      };

      const interaction = interactions[type];
      const outcome = interaction.outcomes 
        ? interaction.outcomes[Math.floor(Math.random() * interaction.outcomes.length)]
        : interaction.outcome;

      setSpellOutcome(outcome);

      // Update witch relationship
      const newRel = Math.max(-100, Math.min(100, (witch.relationship || 0) + interaction.relationshipChange));
      const updates = { relationship: newRel };

      if (interaction.dispositionChange) {
        updates.disposition = interaction.dispositionChange;
      } else if (newRel >= 60) {
        updates.disposition = 'allied';
      } else if (newRel >= 30) {
        updates.disposition = 'curious';
      } else if (newRel >= 0) {
        updates.disposition = 'neutral';
      } else if (newRel >= -30) {
        updates.disposition = 'wary';
      } else {
        updates.disposition = 'hostile';
      }

      if (type !== 'suppress') {
        updates.knows_vampire_secret = true;
      }

      await base44.entities.Witch.update(witch.id, updates);

      if (interaction.hungerEffect) {
        await base44.entities.VampireState.update(vampireState.id, {
          hunger_state: 'calm'
        });
      }

      await base44.entities.NightLog.create({
        entry: `${witch.name}: ${outcome}`,
        category: 'interaction',
        intensity: type === 'intimate' ? 'significant' : 'moderate'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setCastingSpell(null);
        setSpellOutcome('');
      }, 3000);
    }, 2500);
  };

  if (!witch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-950 to-black p-4">
        <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full text-center">
          <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">No Witch Found</h2>
          <p className="text-gray-400 mb-6">Encounter a witch in the Vampire Home first.</p>
          <button
            onClick={() => navigate(createPageUrl('VampireHome'))}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl"
          >
            Return to Vampire Home
          </button>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-purple-950 via-indigo-950 to-black">
      
      {/* Magic particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-300/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-6">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate(createPageUrl('VampireHome'))}
            className="text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => navigate(createPageUrl('Night'))}
            className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
          >
            Vampire View →
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">{witch.name}</h1>
            <p className="text-purple-300 capitalize">{witch.specialty} Witch</p>
            <p className={`text-sm mt-1 capitalize ${
              witch.disposition === 'hostile' ? 'text-red-400' :
              witch.disposition === 'allied' ? 'text-green-400' :
              'text-yellow-400'
            }`}>
              {witch.disposition}
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8"
          >
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-purple-900/30">
              <Sparkles className="w-6 h-6 text-purple-400 mb-2" />
              <p className="text-2xl font-bold text-white">{witch.power_level}</p>
              <p className="text-xs text-gray-400">Power Level</p>
            </div>

            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-purple-900/30">
              <Heart className="w-6 h-6 text-pink-400 mb-2" />
              <p className="text-2xl font-bold text-white">{witch.relationship || 0}</p>
              <p className="text-xs text-gray-400">Relationship</p>
            </div>

            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-purple-900/30">
              <Moon className="w-6 h-6 text-blue-400 mb-2" />
              <p className="text-2xl font-bold text-white capitalize">{witch.specialty}</p>
              <p className="text-xs text-gray-400">Specialty</p>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid md:grid-cols-4 gap-4 mb-8"
          >
            <button
              onClick={() => setShowApothecary(true)}
              className="bg-gradient-to-r from-green-900/40 to-teal-900/40 hover:from-green-900/60 hover:to-teal-900/60 border-2 border-green-500/50 rounded-xl p-6 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-4xl">🏪</span>
                <div className="text-left">
                  <h3 className="text-white font-bold">Apothecary</h3>
                  <p className="text-gray-400 text-sm">Sell potions to customers</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowFortuneTelling(true)}
              className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 hover:from-purple-900/60 hover:to-blue-900/60 border-2 border-purple-500/50 rounded-xl p-6 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-4xl">🔮</span>
                <div className="text-left">
                  <h3 className="text-white font-bold">Fortune Telling</h3>
                  <p className="text-gray-400 text-sm">Divination service</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowGrimoire(true)}
              className="bg-gradient-to-r from-red-900/40 to-orange-900/40 hover:from-red-900/60 hover:to-orange-900/60 border-2 border-red-500/50 rounded-xl p-6 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-4xl">📖</span>
                <div className="text-left">
                  <h3 className="text-white font-bold">Study Grimoire</h3>
                  <p className="text-gray-400 text-sm">Learn new spells</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowMoonRitual(true)}
              className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 hover:from-blue-900/60 hover:to-indigo-900/60 border-2 border-blue-500/50 rounded-xl p-6 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-4xl">🌕</span>
                <div className="text-left">
                  <h3 className="text-white font-bold">Moon Ritual</h3>
                  <p className="text-gray-400 text-sm">Power boost</p>
                </div>
              </div>
            </button>
          >
            <button
              onClick={() => setShowSpellbook(true)}
              className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 hover:from-purple-900/60 hover:to-pink-900/60 border-2 border-purple-500/50 rounded-xl p-6 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-4xl">📖</span>
                <div className="text-left">
                  <h3 className="text-white font-bold">Spellbook</h3>
                  <p className="text-gray-400 text-sm">Cast spells & magic</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowHerbGathering(true)}
              className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 hover:from-green-900/60 hover:to-emerald-900/60 border-2 border-green-500/50 rounded-xl p-6 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-4xl">🌿</span>
                <div className="text-left">
                  <h3 className="text-white font-bold">Herbs</h3>
                  <p className="text-gray-400 text-sm">{herbs.length} types collected</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowCurses(true)}
              className="bg-gradient-to-r from-red-900/40 to-black/40 hover:from-red-900/60 hover:to-black/60 border-2 border-red-500/50 rounded-xl p-6 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-4xl">💀</span>
                <div className="text-left">
                  <h3 className="text-white font-bold">Curse Someone</h3>
                  <p className="text-gray-400 text-sm">Dark magic</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowTeaching(true)}
              className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 hover:from-yellow-900/60 hover:to-orange-900/60 border-2 border-yellow-500/50 rounded-xl p-6 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-4xl">🎓</span>
                <div className="text-left">
                  <h3 className="text-white font-bold">Teach Servants Magic</h3>
                  <p className="text-gray-400 text-sm">Share your knowledge</p>
                </div>
              </div>
            </button>

            {vampireState && (
              <button
                onClick={() => setShowVampireInteractions(true)}
                disabled={castingSpell}
                className="bg-gradient-to-r from-red-900/40 to-purple-900/40 hover:from-red-900/60 hover:to-purple-900/60 border-2 border-red-500/50 rounded-xl p-6 transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-4xl">🦇</span>
                  <div className="text-left">
                    <h3 className="text-white font-bold">Interact with Vampire</h3>
                    <p className="text-gray-400 text-sm">
                      {(witch.relationship || 0) >= 50 ? 'Allies & lovers' : 
                       (witch.relationship || 0) >= 0 ? 'Build relationship' : 'Enemies'}
                    </p>
                  </div>
                </div>
              </button>
            )}

            <button
              onClick={async () => {
                const servants = await base44.entities.Servant.list();
                if (servants.length > 0) {
                  navigate(createPageUrl(`ServantHome?id=${servants[0].id}`));
                }
              }}
              className="bg-gradient-to-r from-pink-900/40 to-purple-900/40 hover:from-pink-900/60 hover:to-purple-900/60 border-2 border-pink-500/50 rounded-xl p-6 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-4xl">👤</span>
                <div className="text-left">
                  <h3 className="text-white font-bold">Visit Servant</h3>
                  <p className="text-gray-400 text-sm">Talk to vampire's human</p>
                </div>
              </div>
            </button>
          </motion.div>

          {/* Rituals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-white text-xl font-bold mb-4">Rituals</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {RITUALS.map(ritual => (
                <button
                  key={ritual.name}
                  onClick={() => handleRitual(ritual)}
                  disabled={performingRitual}
                  className="bg-gray-900/50 hover:bg-gray-800/50 border border-purple-800/30 rounded-xl p-4 text-left transition-all disabled:opacity-50"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{ritual.icon}</span>
                    <div>
                      <h3 className="text-white font-medium">{ritual.name}</h3>
                      <p className="text-gray-400 text-sm">{ritual.description}</p>
                    </div>
                  </div>
                  {ritual.herbs && (
                    <p className="text-green-400 text-xs mb-2">🌿 {ritual.herbs}</p>
                  )}
                  {ritual.powerBoost > 0 && (
                    <p className="text-purple-400 text-xs">+{ritual.powerBoost} power</p>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Spellbook Modal */}
      <AnimatePresence>
        {showSpellbook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
            onClick={() => setShowSpellbook(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
            >
              <button onClick={() => setShowSpellbook(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold text-white mb-4">
                Spellbook {generatingSpells && <span className="text-purple-400 text-sm ml-2">✨ Generating new spells...</span>}
              </h2>

              {/* Category Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {Object.keys(getAvailableSpells()).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm capitalize ${
                      selectedCategory === cat ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {cat.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Spells */}
              <div className="grid md:grid-cols-2 gap-3">
                {getAvailableSpells()[selectedCategory]?.map(spell => (
                  <button
                    key={spell.name}
                    onClick={() => {
                      setShowSpellbook(false);
                      handleCastSpell(spell);
                    }}
                    disabled={castingSpell || witch.power_level < spell.cost}
                    className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-all disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{spell.icon}</span>
                        <div>
                          <h3 className="text-white font-medium">{spell.name}</h3>
                          {spell.latin && <p className="text-purple-400 text-xs italic">{spell.latin}</p>}
                        </div>
                      </div>
                      <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded">
                        {spell.cost}⚡
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-1">{spell.description}</p>
                    {spell.herbs && (
                      <p className="text-green-400 text-xs">🌿 {spell.herbs}</p>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {(castingSpell || performingRitual) && !spellOutcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 360]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-center"
            >
              <span className="text-6xl">{castingSpell?.icon || performingRitual?.icon || '✨'}</span>
              <p className="text-purple-400 text-lg mt-4">
                {castingSpell ? `Casting ${castingSpell.name}...` : `Performing ${performingRitual?.name}...`}
              </p>
            </motion.div>
          </motion.div>
        )}

        {spellOutcome && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
          >
            <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full text-center border-2 border-purple-500/50">
              <p className="text-white text-lg">{spellOutcome}</p>
            </div>
          </motion.div>
        )}

        {showHerbGathering && (
          <HerbGathering
            witch={witch}
            onClose={() => setShowHerbGathering(false)}
          />
        )}

        {showVampireInteractions && vampireState && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
            onClick={() => setShowVampireInteractions(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto relative"
            >
              <button onClick={() => setShowVampireInteractions(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold text-white mb-2">Interact with {vampireState.vampire_name}</h2>
              <p className="text-gray-400 text-sm mb-6">
                Relationship: {witch.relationship || 0} • {witch.disposition}
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowVampireInteractions(false);
                    handleVampireInteraction('help');
                  }}
                  className="w-full bg-green-900/40 hover:bg-green-900/60 border border-green-500/30 rounded-xl p-4 text-left transition-colors"
                >
                  <h3 className="text-white font-medium mb-1">💚 Help with Hunger</h3>
                  <p className="text-gray-400 text-sm">Use magic to soothe their bloodlust</p>
                </button>

                <button
                  onClick={() => {
                    setShowVampireInteractions(false);
                    handleVampireInteraction('talk');
                  }}
                  className="w-full bg-blue-900/40 hover:bg-blue-900/60 border border-blue-500/30 rounded-xl p-4 text-left transition-colors"
                >
                  <h3 className="text-white font-medium mb-1">💬 Deep Talk</h3>
                  <p className="text-gray-400 text-sm">Supernatural beings understand each other</p>
                </button>

                {(witch.relationship || 0) >= 20 && (
                  <button
                    onClick={() => {
                      setShowVampireInteractions(false);
                      handleVampireInteraction('flirt');
                    }}
                    className="w-full bg-pink-900/40 hover:bg-pink-900/60 border border-pink-500/30 rounded-xl p-4 text-left transition-colors"
                  >
                    <h3 className="text-white font-medium mb-1">💖 Flirt</h3>
                    <p className="text-gray-400 text-sm">Magic and attraction spark</p>
                  </button>
                )}

                {(witch.relationship || 0) >= 30 && (
                  <button
                    onClick={() => {
                      setShowVampireInteractions(false);
                      handleVampireInteraction('kiss');
                    }}
                    className="w-full bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-xl p-4 text-left transition-colors"
                  >
                    <h3 className="text-white font-medium mb-1">💋 Kiss</h3>
                    <p className="text-gray-400 text-sm">Witch and vampire passion</p>
                  </button>
                )}

                {(witch.relationship || 0) >= 50 && (
                  <button
                    onClick={() => {
                      setShowVampireInteractions(false);
                      handleVampireInteraction('intimate');
                    }}
                    className="w-full bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 rounded-xl p-4 text-left transition-colors"
                  >
                    <h3 className="text-white font-medium mb-1">🔥 Be Intimate</h3>
                    <p className="text-gray-400 text-sm">Supernatural passion unleashed</p>
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowVampireInteractions(false);
                    handleVampireInteraction('ally');
                  }}
                  className="w-full bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-xl p-4 text-left transition-colors"
                >
                  <h3 className="text-white font-medium mb-1">🤝 Form Alliance</h3>
                  <p className="text-gray-400 text-sm">Witch and vampire united</p>
                </button>

                <button
                  onClick={() => {
                    setShowVampireInteractions(false);
                    handleVampireInteraction('suppress');
                  }}
                  className="w-full bg-gray-900/40 hover:bg-gray-900/60 border border-gray-500/30 rounded-xl p-4 text-left transition-colors"
                >
                  <h3 className="text-white font-medium mb-1">⚡ Suppress Powers (Hostile)</h3>
                  <p className="text-gray-400 text-sm">Weaken them—damages relationship</p>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}