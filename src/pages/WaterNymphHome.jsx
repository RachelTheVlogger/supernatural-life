import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Droplets, Sparkles, Heart, Waves, Eye, Zap, Shield, Moon, Flower, Fish, Gem, Home, Users, Wind, CloudRain, Edit2, TreePine } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import NymphDating from '@/components/nightbound/NymphDating';
import NymphPowerTree from '@/components/nightbound/NymphPowerTree';
import NymphProgression from '@/components/nightbound/NymphProgression';
import NymphSanctuary from '@/components/nightbound/NymphSanctuary';
import NymphHealing from '@/components/nightbound/NymphHealing';
import WaterFamiliars from '@/components/nightbound/WaterFamiliars';
import SirenNymphInteraction from '@/components/nightbound/SirenNymphInteraction';
import NymphElementalBonds from '@/components/nightbound/NymphElementalBonds';
import NymphRomance from '@/components/nightbound/NymphRomance';

const BASE_POWERS = [
  'Water Breathing', 'Nature Bond', 'Healing Touch', 'Plant Growth',
  'Animal Speech', 'Water Walking', 'Moonlight Aura', 'Spring Creation',
  'Weather Sense', 'Purification', 'Shape Water', 'Mist Form',
  'Rapid Healing', 'Nature Shield', 'Water Portal', 'Storm Calling',
  'Ocean Communion', 'Life Bloom', 'Sacred Ground', 'Tide Control',
  'Forest Whisper', 'Crystal Growth', 'River Dance', 'Deep Dive',
  'Eternal Youth', 'Nature\'s Wrath', 'Tsunami Summon', 'Gaia\'s Blessing',
  'Elemental Form', 'World Tree Connection', 'Nature\'s Avatar'
];

const POWER_PREFIXES = ['Enhanced', 'Greater', 'Supreme', 'Divine', 'Ancient', 'Primal', 'Mythic', 'Eternal', 'Cosmic', 'Sacred'];
const POWER_SUFFIXES = ['Mastery', 'Dominion', 'Ascension', 'Perfection', 'Transcendence', 'Apotheosis'];

const generateNymphPowers = (maxLevel) => {
  const powers = [];
  const icons = [Droplets, Heart, Flower, Shield, Sparkles, Waves];
  
  BASE_POWERS.forEach((baseName, i) => {
    powers.push({ 
      id: `power_${i}`, 
      name: baseName, 
      icon: icons[i % icons.length], 
      unlockAt: i * 5 
    });
  });
  
  let level = BASE_POWERS.length * 5;
  while (level <= maxLevel + 50) {
    const prefix = POWER_PREFIXES[Math.floor(level / 50) % POWER_PREFIXES.length];
    const base = BASE_POWERS[Math.floor(Math.random() * BASE_POWERS.length)];
    const suffix = level % 100 === 0 ? ` ${POWER_SUFFIXES[Math.floor(level / 100) % POWER_SUFFIXES.length]}` : '';
    powers.push({
      id: `power_${level}`,
      name: `${prefix} ${base}${suffix}`,
      icon: icons[Math.floor(Math.random() * icons.length)],
      unlockAt: level
    });
    level += 5;
  }
  
  return powers;
};

export default function WaterNymphHome() {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [showPowers, setShowPowers] = useState(false);
  const [showDating, setShowDating] = useState(false);
  const [nymphName, setNymphName] = useState('');
  const [nymphGender, setNymphGender] = useState('woman');
  const [nymphSexuality, setNymphSexuality] = useState('bisexual');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [showSanctuary, setShowSanctuary] = useState(false);
  const [showHealing, setShowHealing] = useState(false);
  const [showFamiliars, setShowFamiliars] = useState(false);
  const [showSirenInteraction, setShowSirenInteraction] = useState(false);
  const [showElementalBonds, setShowElementalBonds] = useState(false);
  const [showRomance, setShowRomance] = useState(false);

  const { data: nymphs = [] } = useQuery({
    queryKey: ['waterNymphs'],
    queryFn: () => base44.entities.WaterNymph.list()
  });

  const urlParams = new URLSearchParams(window.location.search);
  const nymphId = urlParams.get('id');
  const nymph = nymphId ? nymphs.find(n => n.id === nymphId) : nymphs[0];
  
  const NYMPH_POWERS = React.useMemo(() => 
    generateNymphPowers(nymph?.nature_bond || 50), 
    [nymph?.nature_bond]
  );

  const { data: companions = [] } = useQuery({
    queryKey: ['nymph-companions', nymph?.id],
    queryFn: async () => {
      if (!nymph?.id) return [];
      // Using a simple array in nymph entity for now
      return nymph.companions || [];
    },
    enabled: !!nymph?.id
  });

  React.useEffect(() => {
    if (nymphs.length > 0) {
      setInitialized(true);
    }
  }, [nymphs.length]);

  const handleRenameNymph = async () => {
    if (!newName.trim()) {
      alert('Please enter a name');
      return;
    }

    try {
      await base44.entities.WaterNymph.update(nymph.id, {
        name: newName.trim()
      });

      queryClient.invalidateQueries();
      setShowRenameModal(false);
    } catch (e) {
      console.error('Failed to rename nymph:', e);
    }
  };

  const handleCreateNymph = async () => {
    if (!nymphName.trim()) {
      alert('Please enter a name');
      return;
    }

    try {
      await base44.entities.WaterNymph.create({
        name: nymphName.trim(),
        gender: nymphGender,
        sexuality: nymphSexuality,
        nature_bond: 50,
        water_purity: 100,
        unlocked_powers: ['Water Breathing']
      });

      queryClient.invalidateQueries();
      setShowCreateModal(false);
      setNymphName('');
      setNymphGender('woman');
      setNymphSexuality('bisexual');
    } catch (e) {
      console.error('Failed to create nymph:', e);
    }
  };

  const handleHealWaters = async () => {
    setProcessing(true);

    setTimeout(async () => {
      const outcomes = [
        'You purified the water. Clean. Clear. Life returns.',
        'Your touch healed the stream. Fish returned. Plants bloomed.',
        'Corruption cleansed. The water flows pure again.'
      ];

      setOutcome(outcomes[Math.floor(Math.random() * outcomes.length)]);

      const newBond = (nymph.nature_bond || 50) + 2;
      const newUnlocked = [...(nymph.unlocked_powers || ['Water Breathing'])];
      
      NYMPH_POWERS.forEach(power => {
        if (newBond >= power.unlockAt && !newUnlocked.includes(power.name)) {
          newUnlocked.push(power.name);
        }
      });

      await base44.entities.WaterNymph.update(nymph.id, {
        water_purity: Math.min((nymph.water_purity || 100) + 5, 100),
        nature_bond: newBond,
        unlocked_powers: newUnlocked
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  const handleBefriend = async () => {
    setProcessing(true);

    setTimeout(async () => {
      const creatures = ['deer', 'otter', 'swan', 'dragonfly', 'frog'];
      const creature = creatures[Math.floor(Math.random() * creatures.length)];
      
      setOutcome(`A ${creature} approached. You bonded. Nature recognizes you.`);

      const newBond = (nymph.nature_bond || 50) + 3;
      const newUnlocked = [...(nymph.unlocked_powers || ['Water Breathing'])];
      
      NYMPH_POWERS.forEach(power => {
        if (newBond >= power.unlockAt && !newUnlocked.includes(power.name)) {
          newUnlocked.push(power.name);
        }
      });

      await base44.entities.WaterNymph.update(nymph.id, {
        creatures_befriended: (nymph.creatures_befriended || 0) + 1,
        nature_bond: newBond,
        unlocked_powers: newUnlocked
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  const handleDance = async () => {
    setProcessing(true);

    setTimeout(async () => {
      setOutcome('You danced by the water. Moonlight reflected. Magic flowed through you.');

      await base44.entities.WaterNymph.update(nymph.id, {
        nature_bond: (nymph.nature_bond || 50) + 4,
        moonlight_dances: (nymph.moonlight_dances || 0) + 1
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  const handleProtectTerritory = async () => {
    setProcessing(true);

    setTimeout(async () => {
      const outcomes = [
        'You marked your territory. Sacred waters. Protected grounds. Nature knows you.',
        'Territory claimed. The forest recognizes your presence. Animals feel safe here.',
        'You established your domain. These waters are yours now. Protected. Guarded.'
      ];

      setOutcome(outcomes[Math.floor(Math.random() * outcomes.length)]);

      await base44.entities.WaterNymph.update(nymph.id, {
        territory_protected: true,
        nature_bond: (nymph.nature_bond || 50) + 5
      });

      await base44.entities.NightLog.create({
        entry: 'Territory established. Sacred grounds protected.',
        category: 'power',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  const handleGrowPlants = async () => {
    setProcessing(true);

    setTimeout(async () => {
      const plants = ['lilies', 'lotus flowers', 'water reeds', 'moss', 'ferns'];
      const plant = plants[Math.floor(Math.random() * plants.length)];
      
      setOutcome(`You touched the earth. ${plant} bloomed instantly. Life responds to you.`);

      await base44.entities.WaterNymph.update(nymph.id, {
        nature_bond: (nymph.nature_bond || 50) + 3
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  const handleSummonRain = async () => {
    setProcessing(true);

    setTimeout(async () => {
      setOutcome('You called to the sky. Clouds gathered. Rain fell gently. Nature answered.');

      const newBond = (nymph.nature_bond || 50) + 3;
      const newUnlocked = [...(nymph.unlocked_powers || ['Water Breathing'])];
      
      NYMPH_POWERS.forEach(power => {
        if (newBond >= power.unlockAt && !newUnlocked.includes(power.name)) {
          newUnlocked.push(power.name);
        }
      });

      await base44.entities.WaterNymph.update(nymph.id, {
        water_purity: Math.min((nymph.water_purity || 100) + 3, 100),
        nature_bond: newBond,
        unlocked_powers: newUnlocked
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  const handleHealAnimal = async () => {
    setProcessing(true);

    setTimeout(async () => {
      const animals = ['injured deer', 'wounded bird', 'sick otter', 'hurt fox', 'dying swan'];
      const animal = animals[Math.floor(Math.random() * animals.length)];
      
      setOutcome(`You found ${animal}. Your touch healed. Life restored. Grateful eyes looked back.`);

      const newBond = (nymph.nature_bond || 50) + 4;
      const newUnlocked = [...(nymph.unlocked_powers || ['Water Breathing'])];
      
      NYMPH_POWERS.forEach(power => {
        if (newBond >= power.unlockAt && !newUnlocked.includes(power.name)) {
          newUnlocked.push(power.name);
        }
      });

      await base44.entities.WaterNymph.update(nymph.id, {
        nature_bond: newBond,
        unlocked_powers: newUnlocked
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  const handleFindTreasure = async () => {
    setProcessing(true);

    setTimeout(async () => {
      const treasures = ['ancient pearl', 'glowing shell', 'water crystal', 'moon stone', 'silver scale'];
      const treasure = treasures[Math.floor(Math.random() * treasures.length)];
      
      setOutcome(`You dove deep. Found ${treasure}. The water gifts you treasures.`);

      await base44.entities.WaterNymph.update(nymph.id, {
        treasures_found: (nymph.treasures_found || 0) + 1
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  const handleCreateGarden = async () => {
    setProcessing(true);

    setTimeout(async () => {
      setOutcome('You planted seeds underwater. Magic flowed. Gardens bloomed beneath the surface.');

      await base44.entities.WaterNymph.update(nymph.id, {
        underwater_gardens: (nymph.underwater_gardens || 0) + 1,
        nature_bond: (nymph.nature_bond || 50) + 5
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  const handleSaveHuman = async () => {
    setProcessing(true);

    setTimeout(async () => {
      const outcomes = [
        'Someone was drowning. You pulled them to shore. They gasped. Alive. They saw you.',
        'You rescued a swimmer. Saved their life. They stared in wonder. What are you?',
        'Drowning human. You dove. Brought them to safety. Your secret revealed to one more.'
      ];

      setOutcome(outcomes[Math.floor(Math.random() * outcomes.length)]);

      await base44.entities.WaterNymph.update(nymph.id, {
        humans_saved: (nymph.humans_saved || 0) + 1,
        nature_bond: (nymph.nature_bond || 50) + 3
      });

      await base44.entities.NightLog.create({
        entry: 'Saved a human from drowning. Your legend grows.',
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  const handleTransform = async () => {
    setProcessing(true);

    setTimeout(async () => {
      const isMist = !nymph.mist_form;
      const result = isMist 
        ? 'Your body tingled. Cells separating. Becoming vapor. You dissolved into mist. No weight. No form. Just essence. Pure water vapor. Consciousness without flesh. You drifted. Free. Formless. Ethereal. Perfect.'
        : 'You concentrated. Mist particles drawn together. Coalescing. Solidifying. Flesh reformed. Bones materialized. BODY. You were solid again. Physical. Grounded. Real. But you remember being formless. Miss it already.';
      
      setOutcome(result);

      await base44.entities.WaterNymph.update(nymph.id, {
        mist_form: isMist,
        nature_bond: (nymph.nature_bond || 50) + 3
      });

      await base44.entities.NightLog.create({
        entry: result,
        category: 'transformation',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 4000);
    }, 3000);
  };

  const handleMeetNymph = async () => {
    setProcessing(true);

    setTimeout(async () => {
      const nymphNames = ['Laurel', 'Willow', 'Ivy', 'Fern', 'Dahlia', 'Violet'];
      const name = nymphNames[Math.floor(Math.random() * nymphNames.length)];
      
      setOutcome(`You met ${name}. Another water nymph. Kindred spirit. Friend found.`);

      const currentCompanions = nymph.companions || [];
      await base44.entities.WaterNymph.update(nymph.id, {
        companions: [...currentCompanions, { name, type: 'nymph', bond: 50 }],
        nymphs_met: (nymph.nymphs_met || 0) + 1
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  const handleCreateSpring = async () => {
    setProcessing(true);

    setTimeout(async () => {
      setOutcome('You touched barren ground. Water bubbled up. A new spring born. Sacred waters flow.');

      await base44.entities.WaterNymph.update(nymph.id, {
        springs_created: (nymph.springs_created || 0) + 1,
        nature_bond: (nymph.nature_bond || 50) + 6
      });

      await base44.entities.NightLog.create({
        entry: 'Created a sacred spring. Your power grows.',
        category: 'power',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  const navigate = useNavigate();

  if (!nymph) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-950 to-green-950 p-4">
          <div className="text-center">
            <p className="text-gray-400 mb-4">No nymph found</p>
            <button
              onClick={() => navigate(createPageUrl('Home'))}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg"
            >
              Create Nymph
            </button>
          </div>
        </div>
      );
    }

  return (
    <div className={`min-h-screen p-4 pb-24 transition-all duration-1000 ${
      nymph.mist_form 
        ? 'bg-gradient-to-b from-slate-900 via-gray-900 to-slate-950' 
        : 'bg-gradient-to-b from-teal-950 to-green-950'
    }`}>
      {/* Particle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {nymph.mist_form ? (
          // Mist/fog particles
          [...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-gray-400/20 rounded-full blur-xl"
              style={{
                width: `${30 + Math.random() * 60}px`,
                height: `${30 + Math.random() * 60}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{
                duration: 6 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut"
              }}
            />
          ))
        ) : (
          // Nature sparkles for solid form
          [...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-green-400/40 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0, 1.5, 0],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-teal-400" />
            {nymph.name}
            <button
              onClick={() => {
                setNewName(nymph.name);
                setShowRenameModal(true);
              }}
              className="text-teal-400 hover:text-teal-300 transition-colors"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          </h1>
          <p className="text-teal-300 mb-3">Water Nymph</p>
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className={`text-xs px-3 py-1 rounded-full ${
              nymph.mist_form 
                ? 'bg-gray-700/60 text-gray-300 border border-gray-500/50' 
                : 'bg-green-900/60 text-green-300 border border-green-500/50'
            }`}>
              {nymph.mist_form ? '💨 Mist Form' : '🌸 Solid Form'}
            </span>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors"
          >
            + Create Another Nymph
          </button>
        </div>

        {/* Stats */}
        <div className="bg-gray-900/50 rounded-2xl p-6 mb-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Nature Bond</span>
                <span className="text-green-400">{nymph.nature_bond || 0}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  style={{ width: `${Math.min(((nymph.nature_bond || 0) / 200) * 100, 100)}%` }}
                  className="h-2 rounded-full bg-gradient-to-r from-green-600 to-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Water Purity</p>
                <p className="text-white text-2xl font-bold">{nymph.water_purity || 0}%</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Creatures</p>
                <p className="text-white text-2xl font-bold">{nymph.creatures_befriended || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Humans Saved</p>
                <p className="text-white text-2xl font-bold">{nymph.humans_saved || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Treasures</p>
                <p className="text-white text-2xl font-bold">{nymph.treasures_found || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Gardens</p>
                <p className="text-white text-2xl font-bold">{nymph.underwater_gardens || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Springs</p>
                <p className="text-white text-2xl font-bold">{nymph.springs_created || 0}</p>
              </div>
            </div>

            {/* Elemental Bonds Display */}
            {nymph.elemental_bonds && nymph.elemental_bonds.length > 0 && (
              <div className="mt-4 pt-4 border-t border-teal-500/20">
                <p className="text-teal-300 text-xs mb-2">Elemental Bonds ({nymph.elemental_bonds.length})</p>
                <div className="flex flex-wrap gap-2">
                  {nymph.elemental_bonds.slice(0, 3).map((bondId, i) => {
                    const bondNames = {
                      poseidon: '🔱 Poseidon',
                      nereid: '💚 Nereid',
                      undine: '💧 Undine',
                      selkie: '🦭 Selkie',
                      naiad: '🌊 Naiad',
                      kelpie: '🐴 Kelpie',
                      leviathan: '🐉 Leviathan',
                      rusalka: '👻 Rusalka',
                      aegir: '⚡ Aegir',
                      mami_wata: '👑 Mami Wata',
                      sedna: '❄️ Sedna',
                      yemoja: '💙 Yemoja'
                    };
                    return (
                      <span key={i} className="px-2 py-1 bg-indigo-900/60 text-indigo-300 text-xs rounded-full border border-indigo-500/30">
                        {bondNames[bondId] || bondId}
                      </span>
                    );
                  })}
                  {nymph.elemental_bonds.length > 3 && (
                    <span className="px-2 py-1 bg-gray-800/60 text-gray-300 text-xs rounded-full">
                      +{nymph.elemental_bonds.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {processing || outcome ? (
          <div className="bg-gray-900/50 rounded-2xl p-12 text-center">
            {processing ? (
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-teal-400"
              >
                ...
              </motion.p>
            ) : (
              <p className="text-gray-300 leading-relaxed">{outcome}</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleHealWaters}
              className="w-full bg-gradient-to-r from-blue-900/60 to-teal-900/60 hover:from-blue-900/80 hover:to-teal-900/80 border-2 border-blue-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
            >
              <Droplets className="w-5 h-5 text-blue-400" />
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">Heal the Waters</h3>
                <p className="text-blue-300 text-sm">Purify. Cleanse. Restore nature.</p>
              </div>
            </button>

            <button
              onClick={handleBefriend}
              className="w-full bg-gradient-to-r from-green-900/60 to-emerald-900/60 hover:from-green-900/80 hover:to-emerald-900/80 border-2 border-green-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
            >
              <Heart className="w-5 h-5 text-green-400" />
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">Befriend Creatures</h3>
                <p className="text-green-300 text-sm">Connect with nature's children.</p>
              </div>
            </button>

            <button
              onClick={handleDance}
              className="w-full bg-gradient-to-r from-teal-900/60 to-cyan-900/60 hover:from-teal-900/80 hover:to-cyan-900/80 border-2 border-teal-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
            >
              <Sparkles className="w-5 h-5 text-teal-400" />
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">Moonlight Dance</h3>
                <p className="text-teal-300 text-sm">Dance by the water. Feel the magic.</p>
              </div>
            </button>

            {!nymph.territory_protected && (
              <button
                onClick={handleProtectTerritory}
                className="w-full bg-gradient-to-r from-emerald-900/60 to-green-900/60 hover:from-emerald-900/80 hover:to-green-900/80 border-2 border-emerald-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
              >
                <Shield className="w-5 h-5 text-emerald-400" />
                <div className="flex-1 text-left">
                  <h3 className="text-white font-medium">Protect Territory</h3>
                  <p className="text-emerald-300 text-sm">Claim your sacred grounds.</p>
                </div>
              </button>
            )}

            <button
              onClick={handleGrowPlants}
              className="w-full bg-gradient-to-r from-green-900/60 to-lime-900/60 hover:from-green-900/80 hover:to-lime-900/80 border-2 border-green-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
            >
              <Flower className="w-5 h-5 text-green-400" />
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">Grow Plants</h3>
                <p className="text-green-300 text-sm">Make nature bloom.</p>
              </div>
            </button>

            <button
              onClick={handleSummonRain}
              className="w-full bg-gradient-to-r from-blue-900/60 to-indigo-900/60 hover:from-blue-900/80 hover:to-indigo-900/80 border-2 border-blue-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
            >
              <CloudRain className="w-5 h-5 text-blue-400" />
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">Summon Rain</h3>
                <p className="text-blue-300 text-sm">Call the waters from above.</p>
              </div>
            </button>

            <button
              onClick={handleHealAnimal}
              className="w-full bg-gradient-to-r from-pink-900/60 to-rose-900/60 hover:from-pink-900/80 hover:to-rose-900/80 border-2 border-pink-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
            >
              <Heart className="w-5 h-5 text-pink-400" />
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">Heal Animal</h3>
                <p className="text-pink-300 text-sm">Restore life with your touch.</p>
              </div>
            </button>

            <button
              onClick={handleFindTreasure}
              className="w-full bg-gradient-to-r from-yellow-900/60 to-amber-900/60 hover:from-yellow-900/80 hover:to-amber-900/80 border-2 border-yellow-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
            >
              <Gem className="w-5 h-5 text-yellow-400" />
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">Find Treasure</h3>
                <p className="text-yellow-300 text-sm">Dive deep for gifts.</p>
              </div>
            </button>

            <button
              onClick={handleCreateGarden}
              className="w-full bg-gradient-to-r from-lime-900/60 to-green-900/60 hover:from-lime-900/80 hover:to-green-900/80 border-2 border-lime-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
            >
              <Flower className="w-5 h-5 text-lime-400" />
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">Create Underwater Garden</h3>
                <p className="text-lime-300 text-sm">Plant magic beneath waves.</p>
              </div>
            </button>

            <button
              onClick={handleSaveHuman}
              className="w-full bg-gradient-to-r from-cyan-900/60 to-blue-900/60 hover:from-cyan-900/80 hover:to-blue-900/80 border-2 border-cyan-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
            >
              <Users className="w-5 h-5 text-cyan-400" />
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">Save Drowning Human</h3>
                <p className="text-cyan-300 text-sm">Rescue those in danger.</p>
              </div>
            </button>

            {(nymph.nature_bond || 0) >= 30 && (
              <button
                onClick={handleTransform}
                className="w-full bg-gradient-to-r from-gray-900/60 to-slate-900/60 hover:from-gray-900/80 hover:to-slate-900/80 border-2 border-gray-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
              >
                <Wind className="w-5 h-5 text-gray-400" />
                <div className="flex-1 text-left">
                  <h3 className="text-white font-medium">
                    {nymph.mist_form ? 'Become Solid' : 'Transform to Mist'}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {nymph.mist_form ? 'Return to form.' : 'Dissolve into vapor.'}
                  </p>
                </div>
              </button>
            )}

            <button
              onClick={handleMeetNymph}
              className="w-full bg-gradient-to-r from-purple-900/60 to-pink-900/60 hover:from-purple-900/80 hover:to-pink-900/80 border-2 border-purple-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
            >
              <Users className="w-5 h-5 text-purple-400" />
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">Meet Other Nymphs</h3>
                <p className="text-purple-300 text-sm">Find your kindred spirits.</p>
              </div>
            </button>

            <button
              onClick={handleCreateSpring}
              className="w-full bg-gradient-to-r from-cyan-900/60 to-teal-900/60 hover:from-cyan-900/80 hover:to-teal-900/80 border-2 border-cyan-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
            >
              <Waves className="w-5 h-5 text-cyan-400" />
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">Create Sacred Spring</h3>
                <p className="text-cyan-300 text-sm">Birth new waters.</p>
              </div>
            </button>

            <button
              onClick={() => setShowSanctuary(true)}
              className="w-full bg-gradient-to-r from-green-900/60 to-emerald-900/60 hover:from-green-900/80 hover:to-emerald-900/80 border-2 border-green-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
            >
              <TreePine className="w-5 h-5 text-green-400" />
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">Nature Sanctuaries</h3>
                <p className="text-green-300 text-sm">Build sacred grounds.</p>
              </div>
            </button>

            <button
              onClick={() => setShowHealing(true)}
              className="w-full bg-gradient-to-r from-blue-900/60 to-cyan-900/60 hover:from-blue-900/80 hover:to-cyan-900/80 border-2 border-blue-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
            >
              <Heart className="w-5 h-5 text-blue-400" />
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">Healing Services</h3>
                <p className="text-blue-300 text-sm">Heal supernaturals.</p>
              </div>
            </button>

            <button
              onClick={() => setShowSirenInteraction(true)}
              className="w-full bg-gradient-to-r from-purple-900/60 to-cyan-900/60 hover:from-purple-900/80 hover:to-cyan-900/80 border-2 border-purple-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
            >
              <Waves className="w-5 h-5 text-purple-400" />
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">Meet Sirens</h3>
                <p className="text-purple-300 text-sm">Ally or compete.</p>
              </div>
            </button>

            <button
              onClick={() => setShowElementalBonds(true)}
              className="w-full bg-gradient-to-r from-indigo-900/60 to-purple-900/60 hover:from-indigo-900/80 hover:to-purple-900/80 border-2 border-indigo-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
            >
              <Zap className="w-5 h-5 text-indigo-400" />
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">Elemental Bonds</h3>
                <p className="text-indigo-300 text-sm">Connect with water deities.</p>
              </div>
            </button>

            <button
              onClick={() => setShowRomance(true)}
              className="w-full bg-gradient-to-r from-green-900/60 to-emerald-900/60 hover:from-green-900/80 hover:to-emerald-900/80 border-2 border-green-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
            >
              <Heart className="w-5 h-5 text-green-400" />
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">Deep Romance</h3>
                <p className="text-green-300 text-sm">Intimate progression.</p>
              </div>
            </button>

            <button
              onClick={async () => {
                if (confirm(`End ${nymph.name}'s story? This will permanently delete them from the game. This cannot be undone.`)) {
                  await base44.entities.WaterNymph.delete(nymph.id);
                  await base44.entities.NightLog.create({
                    entry: `${nymph.name} dissolved into mist. Returned to nature. Gone forever.`,
                    category: 'interaction',
                    intensity: 'extreme'
                  });
                  queryClient.invalidateQueries();
                  navigate(createPageUrl('Home'));
                }
              }}
              className="w-full bg-gradient-to-r from-gray-900/60 to-black/60 hover:from-gray-900/80 hover:to-black/80 border-2 border-gray-600/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
            >
              <div className="text-2xl">💀</div>
              <div className="flex-1 text-left">
                <h3 className="text-gray-400 font-medium">Sacrifice Yourself</h3>
                <p className="text-gray-500 text-sm">Return to nature. Forever.</p>
              </div>
            </button>
          </div>
        )}

            {/* Powers Modal */}
            {/* Powers Tree - Moved here instead of modal */}

            {/* Progression System */}
            <div className="mt-6">
              <NymphProgression nymph={nymph} />
            </div>

            <AnimatePresence>
              {showDating && nymph && (
                <NymphDating nymph={nymph} onClose={() => setShowDating(false)} />
              )}
              {showSanctuary && nymph && (
                <NymphSanctuary nymph={nymph} onClose={() => setShowSanctuary(false)} />
              )}
              {showHealing && nymph && (
                <NymphHealing nymph={nymph} onClose={() => setShowHealing(false)} />
              )}
              {showFamiliars && nymph && (
                <WaterFamiliars nymph={nymph} onClose={() => setShowFamiliars(false)} />
              )}
              {showSirenInteraction && nymph && (
                <SirenNymphInteraction siren={{ id: 'temp', name: nymph.name, isNymph: true }} onClose={() => setShowSirenInteraction(false)} />
              )}
              {showElementalBonds && nymph && (
                <NymphElementalBonds nymph={nymph} onClose={() => setShowElementalBonds(false)} />
              )}
              {showRomance && nymph && (
                <NymphRomance nymph={nymph} onClose={() => setShowRomance(false)} />
              )}
            </AnimatePresence>

            {/* Rename Nymph Modal */}
            {showRenameModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
                onClick={() => setShowRenameModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-gray-900 rounded-2xl p-6 max-w-md w-full"
                >
                  <h2 className="text-2xl font-bold text-white mb-6">Rename Nymph</h2>

                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="New name..."
                    className="w-full bg-gray-800 border border-teal-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 mb-6 focus:outline-none focus:border-teal-500"
                    autoFocus
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowRenameModal(false)}
                      className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRenameNymph}
                      disabled={!newName.trim()}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      Rename
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Create Nymph Modal */}
            {showCreateModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
                onClick={() => setShowCreateModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-gray-900 rounded-2xl p-6 max-w-md w-full"
                >
                  <h2 className="text-2xl font-bold text-white mb-6">Create New Nymph</h2>

                  <div className="space-y-4">
                    <input
                      type="text"
                      value={nymphName}
                      onChange={(e) => setNymphName(e.target.value)}
                      placeholder="Nymph name..."
                      className="w-full bg-gray-800 border border-teal-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                      autoFocus
                    />

                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">Gender</label>
                      <div className="space-y-2">
                        {['woman', 'man', 'custom'].map(g => (
                          <button
                            key={g}
                            onClick={() => setNymphGender(g)}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                              nymphGender === g
                                ? 'bg-teal-600 text-white'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                          >
                            {g.charAt(0).toUpperCase() + g.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">Sexuality</label>
                      <select
                        value={nymphSexuality}
                        onChange={(e) => setNymphSexuality(e.target.value)}
                        className="w-full bg-gray-800 border border-teal-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
                      >
                        {['straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'asexual'].map(s => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setShowCreateModal(false)}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateNymph}
                        disabled={!nymphName.trim()}
                        className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
            </motion.div>
            </div>
            );
            }