import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Waves, Music, Droplets, Users, Heart, Zap, Eye, Sparkles, Edit2, Map, Anchor, Shield, MessageCircle, Fish } from 'lucide-react';
import SirenDating from '@/components/nightbound/SirenDating';
import SirenPowerTree from '@/components/nightbound/SirenPowerTree';
import SirenProgression from '@/components/nightbound/SirenProgression';
import SirenTerritory from '@/components/nightbound/SirenTerritory';
import SirenSociety from '@/components/nightbound/SirenSociety';
import SirenUnderwater from '@/components/nightbound/SirenUnderwater';
import SirenVictims from '@/components/nightbound/SirenVictims';
import SirenNymphInteraction from '@/components/nightbound/SirenNymphInteraction';
import SirenRomance from '@/components/nightbound/SirenRomance';

const BASE_POWERS = [
  'Hypnotic Song', 'Seductive Voice', 'Water Breathing', 'Enhanced Beauty',
  'Water Manipulation', 'Echo Location', 'Drowning Kiss', 'Tidal Emotions',
  'Aquatic Form', 'Mind Control', 'Storm Calling', 'Siren Scream',
  'Water Teleport', 'Memory Wash', 'Mass Charm', 'Tsunami Summon',
  'Illusion Casting', 'Water Healing', 'Eternal Youth', 'Ocean Communion',
  "Poseidon's Blessing", 'Deep Sea Form', 'Whirlpool Creation', 'Soul Singing',
  'Water Clone', 'Moon Tide Control', 'Kraken Summoning', 'Oceanic Avatar',
  'Mythic Form', 'Voice of Atlantis', 'Nymph Summoning'
];

const POWER_PREFIXES = ['Enhanced', 'Greater', 'Supreme', 'Divine', 'Ancient', 'Primal', 'Mythic', 'Eternal', 'Cosmic', 'Abyssal'];
const POWER_SUFFIXES = ['Mastery', 'Dominion', 'Ascension', 'Perfection', 'Transcendence', 'Apotheosis'];

const generateSirenPowers = (maxLevel) => {
  const powers = [];
  const icons = [Music, Heart, Droplets, Waves, Eye, Zap];
  
  BASE_POWERS.forEach((baseName, i) => {
    powers.push({ 
      id: `power_${i}`, 
      name: baseName, 
      icon: icons[i % icons.length], 
      unlockAt: i * 5 
    });
  });
  
  // Generate infinite powers beyond base
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

export default function SirenHome() {
  const queryClient = useQueryClient();
  const [showAction, setShowAction] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [showDating, setShowDating] = useState(false);
  const [sirenName, setSirenName] = useState('');
  const [sirenGender, setSirenGender] = useState('woman');
  const [sirenSexuality, setSirenSexuality] = useState('bisexual');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [showTerritory, setShowTerritory] = useState(false);
  const [showSociety, setShowSociety] = useState(false);
  const [showUnderwater, setShowUnderwater] = useState(false);
  const [showVictims, setShowVictims] = useState(false);
  const [showNymphInteraction, setShowNymphInteraction] = useState(false);
  const [showRomance, setShowRomance] = useState(false);

  const { data: sirens = [] } = useQuery({
    queryKey: ['sirens'],
    queryFn: () => base44.entities.Siren.list()
  });

  const urlParams = new URLSearchParams(window.location.search);
  const sirenId = urlParams.get('id');
  const siren = sirenId ? sirens.find(s => s.id === sirenId) : sirens[0];
  
  const SIREN_POWERS = React.useMemo(() => 
    generateSirenPowers(siren?.voice_power || 50), 
    [siren?.voice_power]
  );

  const { data: nymphs = [] } = useQuery({
    queryKey: ['water-nymphs', siren?.id],
    queryFn: async () => {
      if (!siren?.id) return [];
      return await base44.entities.WaterNymph.filter({ siren_id: siren.id });
    },
    enabled: !!siren?.id
  });

  React.useEffect(() => {
    if (sirens.length > 0) {
      setInitialized(true);
    }
  }, [sirens.length]);

  const handleCreateSiren = async () => {
    if (!sirenName.trim()) {
      alert('Please enter a name');
      return;
    }

    try {
      await base44.entities.Siren.create({
        name: sirenName.trim(),
        gender: sirenGender,
        sexuality: sirenSexuality,
        personality: ['seductive'],
        voice_power: 50,
        water_affinity: 50,
        charm_level: 60,
        unlocked_powers: ['Hypnotic Song']
      });

      queryClient.invalidateQueries();
      setShowCreateModal(false);
      setSirenName('');
      setSirenGender('woman');
      setSirenSexuality('bisexual');
    } catch (e) {
      console.error('Failed to create siren:', e);
    }
  };

  const handleSing = async () => {
    setProcessing(true);
    setShowAction('sing');

    setTimeout(async () => {
      const outcomes = [
        'Your voice echoed across the water. Haunting. Beautiful. People stopped to listen.',
        'You sang. Hypnotic melody. They came closer, unable to resist.',
        'Song of the siren. They\'re mesmerized. Under your spell now.',
        'Your voice called to them. Irresistible. They followed willingly.'
      ];

      const result = outcomes[Math.floor(Math.random() * outcomes.length)];
      setOutcome(result);

      const newVoicePower = (siren.voice_power || 50) + 2;
      const newUnlocked = [...(siren.unlocked_powers || ['Hypnotic Song'])];
      
      SIREN_POWERS.forEach(power => {
        if (newVoicePower >= power.unlockAt && !newUnlocked.includes(power.name)) {
          newUnlocked.push(power.name);
        }
      });

      await base44.entities.Siren.update(siren.id, {
        songs_sung: (siren.songs_sung || 0) + 1,
        voice_power: newVoicePower,
        unlocked_powers: newUnlocked
      });

      await base44.entities.NightLog.create({
        entry: result,
        category: 'power',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
        setShowAction(null);
      }, 3000);
    }, 2000);
  };

  const handleLure = async () => {
    setProcessing(true);
    setShowAction('lure');

    setTimeout(async () => {
      const outcomes = [
        'You lured someone to the water. They came willingly. Seduced by your voice.',
        'Another victim. They couldn\'t resist. Your power grows.',
        'You called them. They followed. Drowning in your beauty.',
        'Lured them close. So close. They\'re yours now. Completely.'
      ];

      const result = outcomes[Math.floor(Math.random() * outcomes.length)];
      setOutcome(result);

      const newCharm = (siren.charm_level || 60) + 3;
      const newVoice = (siren.voice_power || 50) + 1;
      const newUnlocked = [...(siren.unlocked_powers || ['Hypnotic Song'])];
      
      SIREN_POWERS.forEach(power => {
        if (newVoice >= power.unlockAt && !newUnlocked.includes(power.name)) {
          newUnlocked.push(power.name);
        }
      });

      await base44.entities.Siren.update(siren.id, {
        victims_lured: (siren.victims_lured || 0) + 1,
        charm_level: newCharm,
        voice_power: newVoice,
        unlocked_powers: newUnlocked
      });

      await base44.entities.NightLog.create({
        entry: result,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
        setShowAction(null);
      }, 3000);
    }, 2000);
  };

  const handleTransform = async () => {
    setProcessing(true);
    setShowAction('transform');

    setTimeout(async () => {
      const isAquatic = !siren.aquatic_form;
      const result = isAquatic 
        ? 'You dove into the water. Pain. Pleasure. Your legs fused together. Bones reshaping. Scales erupting. TAIL. You flicked it. Power surged. Aquatic form complete. You belong to the ocean now.'
        : 'You crawled onto shore. Your tail tingled. Split. Agony. Ecstasy. Scales receded. LEGS. You stood. Wobbly. Human form restored. You can walk among them again.';
      
      setOutcome(result);

      await base44.entities.Siren.update(siren.id, {
        aquatic_form: isAquatic,
        transformation_mastery: Math.min(100, (siren.transformation_mastery || 30) + 5)
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
        setShowAction(null);
      }, 4000);
    }, 3000);
  };

  const handleRenameSiren = async () => {
    if (!newName.trim()) {
      alert('Please enter a name');
      return;
    }

    try {
      await base44.entities.Siren.update(siren.id, {
        name: newName.trim()
      });

      queryClient.invalidateQueries();
      setShowRenameModal(false);
    } catch (e) {
      console.error('Failed to rename siren:', e);
    }
  };

  const handleSummonNymph = async () => {
    setProcessing(true);
    setShowAction('summon');

    setTimeout(async () => {
      const nymphNames = ['Naida', 'Thalassa', 'Maris', 'Undine', 'Cascade', 'Pearl', 'Rivena', 'Brooklynn'];
      const name = nymphNames[Math.floor(Math.random() * nymphNames.length)];
      
      await base44.entities.WaterNymph.create({
        siren_id: siren.id,
        name: name,
        loyalty: 100,
        power_level: Math.floor((siren.voice_power || 50) / 10),
        tasks_completed: 0
      });

      setOutcome(`${name} emerged from the water. A water nymph. Loyal. Obedient. Yours to command.`);

      await base44.entities.NightLog.create({
        entry: `Summoned water nymph ${name}. Your servants grow.`,
        category: 'power',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
        setShowAction(null);
      }, 3000);
    }, 2000);
  };

  const navigate = useNavigate();

  if (!siren) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-950 to-cyan-950 p-4">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No siren found</p>
          <button
            onClick={() => navigate(createPageUrl('Home'))}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg"
          >
            Create Siren
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 pb-24 transition-all duration-1000 ${
      siren.aquatic_form 
        ? 'bg-gradient-to-b from-indigo-950 via-blue-950 to-cyan-950' 
        : 'bg-gradient-to-b from-blue-950 to-cyan-950'
    }`}>
      {/* Particle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {siren.aquatic_form ? (
          // Bubble particles for aquatic form
          [...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-cyan-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: `-5%`,
              }}
              animate={{
                y: [0, -window.innerHeight * 1.1],
                opacity: [0, 0.6, 0],
                scale: [0.5, 1.2, 0.8]
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut"
              }}
            />
          ))
        ) : (
          // Sparkle particles for human form
          [...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-pink-400/40 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0, 1.5, 0]
              }}
              transition={{
                duration: 2 + Math.random() * 2,
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
            <Waves className="w-8 h-8 text-cyan-400" />
            {siren.name}
            <button
              onClick={() => {
                setNewName(siren.name);
                setShowRenameModal(true);
              }}
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          </h1>
          <p className="text-cyan-300 mb-3">Siren of the Deep</p>
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className={`text-xs px-3 py-1 rounded-full ${
              siren.aquatic_form 
                ? 'bg-blue-900/60 text-blue-300 border border-blue-500/50' 
                : 'bg-gray-800/60 text-gray-300 border border-gray-500/50'
            }`}>
              {siren.aquatic_form ? '🐚 Aquatic Form (Tail)' : '🚶 Human Form (Legs)'}
            </span>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
          >
            + Create Another Siren
          </button>
        </div>

        {/* Stats */}
        <div className="bg-gray-900/50 rounded-2xl p-6 mb-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Voice Power</span>
                <span className="text-cyan-400">{siren.voice_power || 0}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  style={{ width: `${Math.min(((siren.voice_power || 0) / 250) * 100, 100)}%` }}
                  className="h-2 rounded-full bg-gradient-to-r from-cyan-600 to-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Charm Level</span>
                <span className="text-pink-400">{siren.charm_level || 0}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  style={{ width: `${Math.min(((siren.charm_level || 0) / 250) * 100, 100)}%` }}
                  className="h-2 rounded-full bg-gradient-to-r from-pink-600 to-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Victims Lured</p>
                <p className="text-white text-2xl font-bold">{siren.victims_lured || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Songs Sung</p>
                <p className="text-white text-2xl font-bold">{siren.songs_sung || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {processing || outcome ? (
          <div className="bg-gray-900/50 rounded-2xl p-12 text-center">
            {processing ? (
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-cyan-400"
              >
                ...
              </motion.p>
            ) : (
              <p className="text-gray-300 leading-relaxed">{outcome}</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Always Available */}
            <button
              onClick={handleSing}
              className="w-full bg-gradient-to-r from-cyan-900/60 to-blue-900/60 hover:from-cyan-900/80 hover:to-blue-900/80 border-2 border-cyan-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
            >
              <Music className="w-5 h-5 text-cyan-400" />
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">Sing Your Song</h3>
                <p className="text-cyan-300 text-sm">Hypnotic melody. Lure them closer.</p>
              </div>
            </button>

            {(siren.water_affinity || 0) >= 50 && (
              <button
                onClick={handleTransform}
                className="w-full bg-gradient-to-r from-blue-900/60 to-teal-900/60 hover:from-blue-900/80 hover:to-teal-900/80 border-2 border-blue-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
              >
                <Waves className="w-5 h-5 text-blue-400" />
                <div className="flex-1 text-left">
                  <h3 className="text-white font-medium">
                    {siren.aquatic_form ? 'Return to Human Form' : 'Transform to Aquatic Form'}
                  </h3>
                  <p className="text-blue-300 text-sm">
                    {siren.aquatic_form ? 'Walk on land again.' : 'Embrace the ocean.'}
                  </p>
                </div>
              </button>
            )}

            {/* Human Form Only - Can interact on land */}
            {!siren.aquatic_form && (
              <>
                <button
                  onClick={() => setShowRomance(true)}
                  className="w-full bg-gradient-to-r from-red-900/60 to-pink-900/60 hover:from-red-900/80 hover:to-pink-900/80 border-2 border-red-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
                >
                  <Heart className="w-5 h-5 text-red-400" />
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-medium">Deep Romance</h3>
                    <p className="text-pink-300 text-sm">Intimate connection and intimacy.</p>
                  </div>
                </button>

                <button
                  onClick={handleLure}
                  className="w-full bg-gradient-to-r from-purple-900/60 to-pink-900/60 hover:from-purple-900/80 hover:to-pink-900/80 border-2 border-purple-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
                >
                  <Heart className="w-5 h-5 text-pink-400" />
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-medium">Lure Someone (Land)</h3>
                    <p className="text-pink-300 text-sm">Walk among humans. Seduce them.</p>
                  </div>
                </button>

                <button
                  onClick={() => setShowVictims(true)}
                  className="w-full bg-gradient-to-r from-purple-900/60 to-pink-900/60 hover:from-purple-900/80 hover:to-pink-900/80 border-2 border-purple-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
                >
                  <Heart className="w-5 h-5 text-pink-400" />
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-medium">Devoted Followers</h3>
                    <p className="text-pink-300 text-sm">Manage enchanted humans.</p>
                  </div>
                </button>

                <button
                  onClick={() => setShowDating(true)}
                  className="w-full bg-gradient-to-r from-pink-900/60 to-red-900/60 hover:from-pink-900/80 hover:to-red-900/80 border-2 border-pink-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
                >
                  <Heart className="w-5 h-5 text-pink-400" />
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-medium">Romance & Dating</h3>
                    <p className="text-pink-300 text-sm">Find love on land.</p>
                  </div>
                </button>
              </>
            )}

            {/* Aquatic Form Only - Ocean powers */}
            {siren.aquatic_form && (
              <>
                <button
                  onClick={async () => {
                    setProcessing(true);
                    setTimeout(async () => {
                      const outcomes = [
                        'You dove impossibly deep. Pressure meant nothing. Darkness revealed secrets. Ancient power found.',
                        'Abyssal dive. You swam where light never reaches. Creatures of the deep bowed. You are apex predator here.',
                        'Deep ocean exploration. Your tail propelled you faster. Stronger. Free. This is your true element.'
                      ];
                      const result = outcomes[Math.floor(Math.random() * outcomes.length)];
                      setOutcome(result);
                      await base44.entities.Siren.update(siren.id, {
                        voice_power: (siren.voice_power || 50) + 8,
                        water_affinity: (siren.water_affinity || 50) + 5
                      });
                      await base44.entities.NightLog.create({
                        entry: result,
                        category: 'power',
                        intensity: 'significant'
                      });
                      queryClient.invalidateQueries();
                      setTimeout(() => {
                        setProcessing(false);
                        setOutcome('');
                      }, 4000);
                    }, 2500);
                  }}
                  className="w-full bg-gradient-to-r from-blue-900/60 to-indigo-900/60 hover:from-blue-900/80 hover:to-indigo-900/80 border-2 border-blue-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
                >
                  <Waves className="w-5 h-5 text-blue-400" />
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-medium">Deep Dive (Aquatic Only)</h3>
                    <p className="text-blue-300 text-sm">Explore the abyss.</p>
                  </div>
                </button>

                <button
                  onClick={() => setShowUnderwater(true)}
                  className="w-full bg-gradient-to-r from-blue-900/60 to-indigo-900/60 hover:from-blue-900/80 hover:to-indigo-900/80 border-2 border-blue-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
                >
                  <Anchor className="w-5 h-5 text-blue-400" />
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-medium">Underwater Exploration</h3>
                    <p className="text-blue-300 text-sm">Find shipwrecks, temples.</p>
                  </div>
                </button>

                <button
                  onClick={async () => {
                    setProcessing(true);
                    setTimeout(async () => {
                      const outcomes = [
                        'Your voice echoed through the ocean. Every creature heard. Some came. Dolphins. Sharks. Whales. They obey your song now.',
                        'You sang underwater. The ocean amplified it. Fish schooled around you. Enchanted. Your aquatic army grows.',
                        'Song of the deep. Creatures emerged. Ancient. Powerful. They recognized you as kin. Pledged loyalty.'
                      ];
                      const result = outcomes[Math.floor(Math.random() * outcomes.length)];
                      setOutcome(result);
                      
                      const newAlly = ['Dolphin Pod', 'Great White Shark', 'Humpback Whale', 'Giant Squid', 'Manta Ray'][Math.floor(Math.random() * 5)];
                      await base44.entities.Siren.update(siren.id, {
                        ocean_allies: [...(siren.ocean_allies || []), newAlly],
                        voice_power: (siren.voice_power || 50) + 6
                      });
                      await base44.entities.NightLog.create({
                        entry: result,
                        category: 'power',
                        intensity: 'significant'
                      });
                      queryClient.invalidateQueries();
                      setTimeout(() => {
                        setProcessing(false);
                        setOutcome('');
                      }, 4000);
                    }, 2500);
                  }}
                  className="w-full bg-gradient-to-r from-teal-900/60 to-cyan-900/60 hover:from-teal-900/80 hover:to-cyan-900/80 border-2 border-teal-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
                >
                  <Fish className="w-5 h-5 text-teal-400" />
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-medium">Command Sea Creatures</h3>
                    <p className="text-teal-300 text-sm">Bond with ocean life.</p>
                  </div>
                </button>

                <button
                  onClick={() => setShowSociety(true)}
                  className="w-full bg-gradient-to-r from-indigo-900/60 to-purple-900/60 hover:from-indigo-900/80 hover:to-purple-900/80 border-2 border-indigo-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
                >
                  <Users className="w-5 h-5 text-indigo-400" />
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-medium">Siren Society</h3>
                    <p className="text-indigo-300 text-sm">Meet other sirens.</p>
                  </div>
                </button>

                <button
                  onClick={() => setShowNymphInteraction(true)}
                  className="w-full bg-gradient-to-r from-teal-900/60 to-green-900/60 hover:from-teal-900/80 hover:to-green-900/80 border-2 border-teal-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
                >
                  <Droplets className="w-5 h-5 text-teal-400" />
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-medium">Interact with Nymphs</h3>
                    <p className="text-teal-300 text-sm">Underwater meetings.</p>
                  </div>
                </button>
              </>
            )}

            {/* Both Forms */}
            <button
              onClick={() => setShowTerritory(true)}
              className="w-full bg-gradient-to-r from-yellow-900/60 to-amber-900/60 hover:from-yellow-900/80 hover:to-amber-900/80 border-2 border-yellow-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
            >
              <Map className="w-5 h-5 text-yellow-400" />
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">Ocean Territories</h3>
                <p className="text-yellow-300 text-sm">Claim your domain.</p>
              </div>
            </button>
          </div>
        )}

        {/* Progression System */}
        <div className="mt-6">
          <SirenProgression siren={siren} />
        </div>

        <AnimatePresence>
          {showDating && siren && (
            <SirenDating siren={siren} onClose={() => setShowDating(false)} />
          )}
          {showTerritory && siren && (
            <SirenTerritory siren={siren} onClose={() => setShowTerritory(false)} />
          )}
          {showSociety && siren && (
            <SirenSociety siren={siren} onClose={() => setShowSociety(false)} />
          )}
          {showUnderwater && siren && (
            <SirenUnderwater siren={siren} onClose={() => setShowUnderwater(false)} />
          )}
          {showVictims && siren && (
            <SirenVictims siren={siren} onClose={() => setShowVictims(false)} />
          )}
          {showNymphInteraction && siren && (
            <SirenNymphInteraction siren={siren} onClose={() => setShowNymphInteraction(false)} />
          )}
          {showRomance && siren && (
            <SirenRomance siren={siren} onClose={() => setShowRomance(false)} />
          )}
          </AnimatePresence>

        {/* Rename Siren Modal */}
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
              <h2 className="text-2xl font-bold text-white mb-6">Rename Siren</h2>

              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New name..."
                className="w-full bg-gray-800 border border-cyan-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 mb-6 focus:outline-none focus:border-cyan-500"
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
                  onClick={handleRenameSiren}
                  disabled={!newName.trim()}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Rename
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Create Siren Modal */}
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
              <h2 className="text-2xl font-bold text-white mb-6">Create New Siren</h2>

              <div className="space-y-4">
                <input
                  type="text"
                  value={sirenName}
                  onChange={(e) => setSirenName(e.target.value)}
                  placeholder="Siren name..."
                  className="w-full bg-gray-800 border border-cyan-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  autoFocus
                />

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Gender</label>
                  <div className="space-y-2">
                    {['woman', 'man', 'custom'].map(g => (
                      <button
                        key={g}
                        onClick={() => setSirenGender(g)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                          sirenGender === g
                            ? 'bg-cyan-600 text-white'
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
                    value={sirenSexuality}
                    onChange={(e) => setSirenSexuality(e.target.value)}
                    className="w-full bg-gray-800 border border-cyan-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
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
                    onClick={handleCreateSiren}
                    disabled={!sirenName.trim()}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
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