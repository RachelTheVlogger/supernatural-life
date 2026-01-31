import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Play, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PersonalitySelector from '@/components/nightbound/PersonalitySelector';

export default function Home() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [characterName, setCharacterName] = useState('');
  const [characterGender, setCharacterGender] = useState('man');
  const [characterSexuality, setCharacterSexuality] = useState('bisexual');
  const [characterPersonality, setCharacterPersonality] = useState(['charming']);
  const [showIntro, setShowIntro] = useState(false);
  const [introStep, setIntroStep] = useState(0);
  const [selectedType, setSelectedType] = useState(null);
  const [showCleanup, setShowCleanup] = useState(false);
  
  const { data: vampireStates = [] } = useQuery({
    queryKey: ['vampireState'],
    queryFn: async () => {
      try {
        return await base44.entities.VampireState.list();
      } catch (e) {
        console.error('Failed to fetch vampire state:', e);
        return [];
      }
    },
    retry: 2
  });

  const { data: witches = [] } = useQuery({
    queryKey: ['witches'],
    queryFn: () => base44.entities.Witch.list()
  });

  const { data: sirens = [] } = useQuery({
    queryKey: ['sirens'],
    queryFn: () => base44.entities.Siren.list()
  });

  const { data: waterNymphs = [] } = useQuery({
    queryKey: ['waterNymphs'],
    queryFn: () => base44.entities.WaterNymph.list()
  });

  const { data: hunters = [] } = useQuery({
    queryKey: ['hunters'],
    queryFn: () => base44.entities.Hunter.list()
  });

  const { data: werewolves = [] } = useQuery({
    queryKey: ['werewolves'],
    queryFn: () => base44.entities.Werewolf.list()
  });

  const { data: demons = [] } = useQuery({
    queryKey: ['demons'],
    queryFn: () => base44.entities.Demon.list()
  });

  const { data: angels = [] } = useQuery({
    queryKey: ['angels'],
    queryFn: () => base44.entities.Angel.list()
  });

  const { data: ghosts = [] } = useQuery({
    queryKey: ['ghosts'],
    queryFn: () => base44.entities.Ghost.list()
  });

  const { data: necromancers = [] } = useQuery({
    queryKey: ['necromancers'],
    queryFn: () => base44.entities.Necromancer.list()
  });

  const { data: shapeshifters = [] } = useQuery({
    queryKey: ['shapeshifters'],
    queryFn: () => base44.entities.Shapeshifter.list()
  });


  
  const existingGame = vampireStates.length > 0 || witches.length > 0 || sirens.length > 0 || waterNymphs.length > 0 || hunters.length > 0 || werewolves.length > 0 || demons.length > 0 || angels.length > 0 || ghosts.length > 0 || necromancers.length > 0 || shapeshifters.length > 0;
  
  const startNewGame = async () => {
    if (!characterName.trim()) {
      alert('Please enter a name');
      return;
    }
    
    if (selectedType === 'vampire') {
      await base44.entities.VampireState.create({
        vampire_name: characterName.trim(),
        gender: characterGender,
        sexuality: characterSexuality,
        personality: characterPersonality,
        job: 'Night Shift Nurse',
        hunger_state: 'calm',
        emotional_mode: 'feeling',
        vampire_stage: 2,
        vampire_power_level: 25,
        unlocked_powers: ['Enhanced Senses', 'Compulsion'],
        nights_passed: 0,
        current_date: new Date().toISOString(),
        humanity: 50,
        moral_path: 'balanced',
        time_of_day: 'night'
      });
      queryClient.invalidateQueries();
      navigate(createPageUrl('Night'));
    } else if (selectedType === 'witch') {
      await base44.entities.Witch.create({
        name: characterName.trim(),
        gender: characterGender,
        sexuality: characterSexuality,
        personality: characterPersonality,
        magic_level: 20,
        moon_phase: 'waxing',
        unlocked_spells: ['Herb Knowledge', 'Moon Reading']
      });
      queryClient.invalidateQueries();
      navigate(createPageUrl('WitchHome'));
    } else if (selectedType === 'siren') {
      await base44.entities.Siren.create({
        name: characterName.trim(),
        gender: characterGender,
        sexuality: characterSexuality,
        personality: characterPersonality,
        voice_power: 50,
        water_affinity: 50,
        charm_level: 60
      });
      queryClient.invalidateQueries();
      navigate(createPageUrl('SirenHome'));
    } else if (selectedType === 'nymph') {
       await base44.entities.WaterNymph.create({
         name: characterName.trim(),
         gender: characterGender,
         sexuality: characterSexuality,
         nature_bond: 50,
         water_purity: 100,
         unlocked_powers: ['Water Breathing']
       });
       queryClient.invalidateQueries();
       navigate(createPageUrl('WaterNymphHome'));
     } else if (selectedType === 'hunter') {
        await base44.entities.Hunter.create({
          name: characterName.trim(),
          specialty: 'combatant',
          skill_level: 50,
          suspicion: 0,
          status: 'tracking'
        });
        queryClient.invalidateQueries();
        navigate(createPageUrl('HunterHome'));
      } else if (selectedType === 'werewolf') {
        await base44.entities.Werewolf.create({
          name: characterName.trim(),
          gender: characterGender,
          moon_phase: 'waxing',
          pack_rank: 'omega',
          transformation_control: 30
        });
        queryClient.invalidateQueries();
        navigate(createPageUrl('WerewolfHome'));
      } else if (selectedType === 'demon') {
        await base44.entities.Demon.create({
          name: characterName.trim(),
          demon_type: 'lesser_demon',
          corruption_level: 50,
          souls_collected: 0
        });
        queryClient.invalidateQueries();
        navigate(createPageUrl('DemonHome'));
      } else if (selectedType === 'angel') {
        await base44.entities.Angel.create({
          name: characterName.trim(),
          angel_type: 'guardian',
          grace: 100,
          divine_power: 50
        });
        queryClient.invalidateQueries();
        navigate(createPageUrl('AngelHome'));
      } else if (selectedType === 'ghost') {
        await base44.entities.Ghost.create({
          name: characterName.trim(),
          unfinished_business: 'Unknown',
          manifestation_strength: 30
        });
        queryClient.invalidateQueries();
        navigate(createPageUrl('GhostHome'));
      } else if (selectedType === 'necromancer') {
        await base44.entities.Necromancer.create({
          name: characterName.trim(),
          gender: characterGender,
          death_magic_level: 30,
          undead_army_size: 0
        });
        queryClient.invalidateQueries();
        navigate(createPageUrl('NecromancerHome'));
      } else if (selectedType === 'shapeshifter') {
        await base44.entities.Shapeshifter.create({
          true_name: characterName.trim(),
          transformation_speed: 30,
          identity_stability: 80
        });
        queryClient.invalidateQueries();
        navigate(createPageUrl('ShapeshifterHome'));
      }
       };
  
  const handleContinue = () => {
    if (vampireStates.length > 0) navigate(createPageUrl('Night'));
    else if (witches.length > 0) navigate(createPageUrl('WitchHome'));
    else if (sirens.length > 0) navigate(createPageUrl('SirenHome'));
    else if (waterNymphs.length > 0) navigate(createPageUrl('WaterNymphHome'));
    else if (werewolves.length > 0) navigate(createPageUrl('WerewolfHome'));
    else if (demons.length > 0) navigate(createPageUrl('DemonHome'));
    else if (angels.length > 0) navigate(createPageUrl('AngelHome'));
    else if (ghosts.length > 0) navigate(createPageUrl('GhostHome'));
    else if (necromancers.length > 0) navigate(createPageUrl('NecromancerHome'));
    else if (shapeshifters.length > 0) navigate(createPageUrl('ShapeshifterHome'));
    else if (hunters.length > 0) {
      const firstHunter = hunters[0];
      if (firstHunter.is_turned) {
        navigate(createPageUrl(`Night?hunter=${firstHunter.id}`));
      } else {
        navigate(createPageUrl(`HunterHome?id=${firstHunter.id}`));
      }
    }
  };

  const getAllDuplicates = () => {
    const allCharacters = [
      ...vampireStates.map(v => ({ id: v.id, name: v.vampire_name, type: 'Vampire', entity: v })),
      ...witches.map(w => ({ id: w.id, name: w.name, type: 'Witch', entity: w })),
      ...sirens.map(s => ({ id: s.id, name: s.name, type: 'Siren', entity: s })),
      ...waterNymphs.map(n => ({ id: n.id, name: n.name, type: 'Nymph', entity: n }))
    ];

    const duplicates = {};
    allCharacters.forEach(char => {
      const key = `${char.name.toLowerCase()}-${char.type}`;
      if (!duplicates[key]) duplicates[key] = [];
      duplicates[key].push(char);
    });

    return Object.values(duplicates).filter(group => group.length > 1);
  };

  const handleDeleteCharacter = async (character) => {
    const entityMap = {
      'Vampire': base44.entities.VampireState,
      'Witch': base44.entities.Witch,
      'Siren': base44.entities.Siren,
      'Nymph': base44.entities.WaterNymph
    };
    
    try {
      await entityMap[character.type].delete(character.id);
      queryClient.invalidateQueries();
    } catch (e) {
      console.error('Failed to delete character:', e);
    }
  };

  const duplicateGroups = getAllDuplicates();
  
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center"
         style={{ background: 'linear-gradient(to bottom, #0a0a14 0%, #1a0a1a 50%, #0a0014 100%)' }}>
      
      {/* Ambient particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-red-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: 4 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 text-center max-w-xl w-full px-6">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <Moon className="w-24 h-24 text-red-400 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-12 tracking-wider">SUPERNATURAL LIFE</h1>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="space-y-4"
        >
          {existingGame ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleContinue();
                }}
                className="w-full bg-gradient-to-r from-red-900/60 to-purple-900/60 hover:from-red-900/80 hover:to-purple-900/80 border-2 border-red-500/50 rounded-xl py-4 text-white font-medium text-lg transition-all flex items-center justify-center gap-3"
              >
                <Play className="w-5 h-5" />
                Continue Game
              </button>

              {/* Character Selection Menu */}
              <div className="bg-gray-900/60 border border-purple-500/30 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-3">Your Characters:</p>
                <div className="space-y-2">
                  {vampireStates.map(v => (
                    <button
                      key={v.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(createPageUrl('Night'));
                      }}
                      className="w-full bg-gray-800/50 hover:bg-gray-700 rounded-lg p-3 text-left transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🦇</span>
                        <div>
                          <p className="text-white font-medium">{v.vampire_name}</p>
                          <p className="text-gray-400 text-xs">Vampire</p>
                        </div>
                      </div>
                    </button>
                  ))}
                  {witches.map(w => (
                    <button
                      key={w.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(createPageUrl('WitchHome'));
                      }}
                      className="w-full bg-gray-800/50 hover:bg-gray-700 rounded-lg p-3 text-left transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">✨</span>
                        <div>
                          <p className="text-white font-medium">{w.name}</p>
                          <p className="text-gray-400 text-xs">Witch</p>
                        </div>
                      </div>
                    </button>
                  ))}
                  {sirens.map(s => (
                    <button
                      key={s.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(createPageUrl('SirenHome'));
                      }}
                      className="w-full bg-gray-800/50 hover:bg-gray-700 rounded-lg p-3 text-left transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🌊</span>
                        <div>
                          <p className="text-white font-medium">{s.name}</p>
                          <p className="text-gray-400 text-xs">Siren</p>
                        </div>
                      </div>
                    </button>
                  ))}
                  {waterNymphs.map(n => (
                    <button
                      key={n.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(createPageUrl('WaterNymphHome'));
                      }}
                      className="w-full bg-gray-800/50 hover:bg-gray-700 rounded-lg p-3 text-left transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">💧</span>
                        <div>
                          <p className="text-white font-medium">{n.name}</p>
                          <p className="text-gray-400 text-xs">Water Nymph</p>
                        </div>
                      </div>
                    </button>
                  ))}
                  {hunters.map(h => (
                    <button
                      key={h.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (h.is_turned) {
                          navigate(createPageUrl(`Night?hunter=${h.id}`));
                        } else {
                          navigate(createPageUrl(`HunterHome?id=${h.id}`));
                        }
                      }}
                      className="w-full bg-gray-800/50 hover:bg-gray-700 rounded-lg p-3 text-left transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{h.is_turned ? '🦇' : '🎯'}</span>
                        <div>
                          <p className="text-white font-medium">{h.name}</p>
                          <p className="text-gray-400 text-xs">{h.is_turned ? 'Vampire' : 'Hunter'}</p>
                        </div>
                      </div>
                    </button>
                  ))}

                  </div>
                  </div>

              {/* Cleanup & Lite Mode */}
              {duplicateGroups.length > 0 && (
                <button
                  onClick={() => setShowCleanup(true)}
                  className="w-full bg-red-900/60 hover:bg-red-900/80 border-2 border-red-500/50 rounded-xl py-4 text-white font-medium text-sm transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Duplicates ({duplicateGroups.length} groups)
                </button>
              )}

              {vampireStates.length > 0 && (
                <div className="bg-gray-900/60 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">Lite Mode</p>
                      <p className="text-gray-400 text-xs">Less explicit content</p>
                    </div>
                    <button
                      onClick={async () => {
                        const currentMode = vampireStates[0].content_filter;
                        const newMode = currentMode === 'lite' ? 'full' : 'lite';
                        await base44.entities.VampireState.update(vampireStates[0].id, {
                          content_filter: newMode
                        });
                        queryClient.invalidateQueries(['vampireState']);
                      }}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        vampireStates[0]?.content_filter === 'lite'
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {vampireStates[0]?.content_filter === 'lite' ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : null}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIntroStep(0);
              setShowIntro(true);
            }}
            className="w-full bg-gradient-to-r from-purple-900/60 to-red-900/60 hover:from-purple-900/80 hover:to-red-900/80 border-2 border-purple-500/50 rounded-xl py-4 text-white font-medium text-lg transition-all flex items-center justify-center gap-3"
          >
            <Moon className="w-5 h-5" />
            New Game
          </button>

          {/* DLC Creatures Section */}
          <div className="bg-gray-900/60 border border-purple-500/30 rounded-xl p-4 mt-4">
            <p className="text-purple-400 text-center text-sm font-bold mb-3">🎮 DLC Creatures (Free)</p>
            <button
              onClick={() => { setSelectedType('werewolf'); setIntroStep(1); setShowIntro(true); }}
              className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-3 text-center transition-all"
            >
              <span className="text-2xl block mb-1">🐺</span>
              <p className="text-white text-xs font-medium">Werewolf</p>
            </button>
          </div>

        </motion.div>
        

      </div>

      {/* Intro Popup */}
      {showIntro && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-b from-gray-900 to-black rounded-2xl p-8 max-w-lg w-full border-2 border-red-900/50"
          >
            {introStep === 0 && (
              <>
                <h2 className="text-2xl font-bold text-white mb-4">Choose Your Path</h2>
                <p className="text-gray-400 text-sm mb-6">What supernatural being will you become?</p>
                <div className="space-y-3 mb-6 max-h-[60vh] overflow-y-auto">
                  <button
                    onClick={() => { setSelectedType('vampire'); setIntroStep(1); }}
                    className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg py-4 px-4 text-left transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🦇</span>
                      <div>
                        <span className="font-medium text-white block">Vampire</span>
                        <p className="text-sm text-gray-400">Blood, power, eternal night</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => { setSelectedType('witch'); setIntroStep(1); }}
                    className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg py-4 px-4 text-left transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">✨</span>
                      <div>
                        <span className="font-medium text-white block">Witch</span>
                        <p className="text-sm text-gray-400">Magic, herbs, lunar rituals</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => { setSelectedType('siren'); setIntroStep(1); }}
                    className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg py-4 px-4 text-left transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🌊</span>
                      <div>
                        <span className="font-medium text-white block">Siren</span>
                        <p className="text-sm text-gray-400">Voice, seduction, ocean's call</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => { setSelectedType('nymph'); setIntroStep(1); }}
                    className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg py-4 px-4 text-left transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">💧</span>
                      <div>
                        <span className="font-medium text-white block">Water Nymph</span>
                        <p className="text-sm text-gray-400">Nature, healing, purity</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => { setSelectedType('hunter'); setIntroStep(1); }}
                    className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg py-4 px-4 text-left transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🎯</span>
                      <div>
                        <span className="font-medium text-white block">Hunter</span>
                        <p className="text-sm text-gray-400">Combat, tracking, weapons</p>
                      </div>
                    </div>
                  </button>
                  <div className="w-full bg-gray-900/80 border-2 border-purple-500/50 rounded-lg py-3 px-4 my-4">
                    <p className="text-purple-400 text-center text-sm font-bold">🎮 DLC Creatures (Free)</p>
                  </div>
                  <button
                    onClick={() => { setSelectedType('werewolf'); setIntroStep(1); }}
                    className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg py-4 px-4 text-left transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🐺</span>
                      <div>
                        <span className="font-medium text-white block">Werewolf</span>
                        <p className="text-sm text-gray-400">Moon, transformation, primal rage</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => { setSelectedType('demon'); setIntroStep(1); }}
                    className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg py-4 px-4 text-left transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">😈</span>
                      <div>
                        <span className="font-medium text-white block">Demon</span>
                        <p className="text-sm text-gray-400">Souls, contracts, corruption</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => { setSelectedType('angel'); setIntroStep(1); }}
                    className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg py-4 px-4 text-left transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">😇</span>
                      <div>
                        <span className="font-medium text-white block">Angel</span>
                        <p className="text-sm text-gray-400">Divine, healing, grace</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => { setSelectedType('ghost'); setIntroStep(1); }}
                    className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg py-4 px-4 text-left transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">👻</span>
                      <div>
                        <span className="font-medium text-white block">Ghost</span>
                        <p className="text-sm text-gray-400">Haunt, possess, unfinished business</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => { setSelectedType('necromancer'); setIntroStep(1); }}
                    className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg py-4 px-4 text-left transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">💀</span>
                      <div>
                        <span className="font-medium text-white block">Necromancer</span>
                        <p className="text-sm text-gray-400">Undead, death magic, souls</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => { setSelectedType('shapeshifter'); setIntroStep(1); }}
                    className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg py-4 px-4 text-left transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🦎</span>
                      <div>
                        <span className="font-medium text-white block">Shapeshifter</span>
                        <p className="text-sm text-gray-400">Identity, infiltration, transformation</p>
                      </div>
                    </div>
                  </button>

                  </div>
              </>
            )}

            {introStep === 1 && (
              <>
                <h2 className="text-2xl font-bold text-white mb-4">What is your name?</h2>
                <input
                  type="text"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && characterName.trim() && setIntroStep(2)}
                  placeholder="Your name..."
                  className="w-full bg-gray-900 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 mb-6 focus:outline-none focus:border-red-500"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setIntroStep(0)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 rounded-lg py-3 text-white transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setIntroStep(2)}
                    disabled={!characterName.trim()}
                    className="flex-1 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 rounded-lg py-3 text-white font-medium transition-all disabled:opacity-50"
                  >
                    Continue
                  </button>
                </div>
              </>
            )}

            {introStep === 2 && (
              <>
                <h2 className="text-2xl font-bold text-white mb-4">Your identity</h2>
                <p className="text-purple-300 text-sm mb-4">How do you see yourself?</p>
                <div className="space-y-3 mb-6">
                  {selectedType !== 'nymph' ? (
                    <>
                      <button
                        onClick={() => setCharacterGender('man')}
                        className={`w-full rounded-lg py-4 px-4 text-left transition-all ${
                          characterGender === 'man' 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        <span className="font-medium">Man</span>
                        <p className="text-sm opacity-80">He/Him</p>
                      </button>
                      <button
                        onClick={() => setCharacterGender('woman')}
                        className={`w-full rounded-lg py-4 px-4 text-left transition-all ${
                          characterGender === 'woman' 
                            ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white' 
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        <span className="font-medium">Woman</span>
                        <p className="text-sm opacity-80">She/Her</p>
                      </button>
                      <button
                        onClick={() => setCharacterGender('custom')}
                        className={`w-full rounded-lg py-4 px-4 text-left transition-all ${
                          characterGender === 'custom' 
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        <span className="font-medium">Custom</span>
                        <p className="text-sm opacity-80">They/Them</p>
                      </button>
                      </>
                      ) : (
                        <>
                          <button
                            onClick={() => setCharacterGender('woman')}
                            className={`w-full rounded-lg py-4 px-4 text-left transition-all ${
                              characterGender === 'woman' 
                                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white' 
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                          >
                            <span className="font-medium">Woman</span>
                            <p className="text-sm opacity-80">She/Her</p>
                          </button>
                          <button
                            onClick={() => setCharacterGender('man')}
                            className={`w-full rounded-lg py-4 px-4 text-left transition-all ${
                              characterGender === 'man' 
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                          >
                            <span className="font-medium">Man</span>
                            <p className="text-sm opacity-80">He/Him</p>
                          </button>
                        </>
                      )}
                </div>
                <button
                  onClick={() => setIntroStep(3)}
                  className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 rounded-lg py-3 text-white font-medium transition-all"
                >
                  Continue
                </button>
              </>
            )}

            {introStep === 3 && (
              <>
                <h2 className="text-2xl font-bold text-white mb-4">Your sexuality</h2>
                <p className="text-purple-300 text-sm mb-4">Who are you attracted to?</p>
                <div className="space-y-2 mb-6 max-h-[50vh] overflow-y-auto">
                  {[
                    { value: 'straight', label: 'Straight', desc: 'Attracted to opposite gender' },
                    { value: 'gay', label: 'Gay', desc: 'Men attracted to men' },
                    { value: 'lesbian', label: 'Lesbian', desc: 'Women attracted to women' },
                    { value: 'bisexual', label: 'Bisexual', desc: 'Attracted to two or more genders' },
                    { value: 'pansexual', label: 'Pansexual', desc: 'Attracted to all genders' },
                    { value: 'asexual', label: 'Asexual', desc: 'Little to no sexual attraction' },
                    { value: 'questioning', label: 'Questioning', desc: 'Still figuring it out' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setCharacterSexuality(option.value)}
                      className={`w-full rounded-lg py-3 px-4 text-left transition-all ${
                        characterSexuality === option.value 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <span className="font-medium">{option.label}</span>
                      <p className="text-sm opacity-80">{option.desc}</p>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIntroStep(2)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 rounded-lg py-3 text-white transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setIntroStep(4)}
                    className="flex-1 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 rounded-lg py-3 text-white font-medium transition-all"
                  >
                    Continue
                  </button>
                </div>
              </>
            )}

            {introStep === 4 && selectedType === 'siren' && (
               <>
                 <h2 className="text-2xl font-bold text-white mb-4">Ready to begin?</h2>
                 <p className="text-cyan-300 text-sm mb-6">Your journey as a siren awaits.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIntroStep(3)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 rounded-lg py-3 text-white transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={startNewGame}
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-lg py-3 text-white font-medium transition-all"
                  >
                    Begin
                  </button>
                </div>
              </>
            )}

            {introStep === 4 && selectedType !== 'nymph' && selectedType !== 'siren' && selectedType !== 'hunter' && (
              <>
                <h2 className="text-2xl font-bold text-white mb-4">Your personality</h2>
                <p className="text-purple-300 text-sm mb-4">Who are you at your core?</p>
                <div className="mb-6">
                  <PersonalitySelector
                    selected={characterPersonality}
                    onSelect={setCharacterPersonality}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIntroStep(3)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 rounded-lg py-3 text-white transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={startNewGame}
                    className="flex-1 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 rounded-lg py-3 text-white font-medium transition-all"
                  >
                    Begin
                  </button>
                </div>
                </>
                )}

                {introStep === 4 && selectedType === 'hunter' && (
                  <>
                    <h2 className="text-2xl font-bold text-white mb-4">Ready to begin?</h2>
                    <p className="text-orange-300 text-sm mb-6">Your hunt for the supernatural begins.</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setIntroStep(3)}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 rounded-lg py-3 text-white transition-all"
                      >
                        Back
                      </button>
                      <button
                        onClick={startNewGame}
                        className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-lg py-3 text-white font-medium transition-all"
                      >
                        Begin
                      </button>
                    </div>
                  </>
                )}

                {introStep === 3 && ['werewolf', 'demon', 'angel', 'ghost', 'necromancer', 'shapeshifter'].includes(selectedType) && (
                  <>
                    <h2 className="text-2xl font-bold text-white mb-4">Ready to begin?</h2>
                    <p className="text-purple-300 text-sm mb-6">Your supernatural journey awaits.</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setIntroStep(2)}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 rounded-lg py-3 text-white transition-all"
                      >
                        Back
                      </button>
                      <button
                        onClick={startNewGame}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg py-3 text-white font-medium transition-all"
                      >
                        Begin
                      </button>
                    </div>
                  </>
                )}

            {selectedType === 'nymph' && introStep === 3 && (
                    <>
                    <h2 className="text-2xl font-bold text-white mb-4">Ready to begin?</h2>
                    <p className="text-teal-300 text-sm mb-6">Your journey as a water nymph awaits.</p>
                <div className="space-y-2 mb-6 max-h-[50vh] overflow-y-auto">
                  {[
                    { value: 'straight', label: 'Straight', desc: 'Attracted to opposite gender' },
                    { value: 'gay', label: 'Gay', desc: 'Men attracted to men' },
                    { value: 'lesbian', label: 'Lesbian', desc: 'Women attracted to women' },
                    { value: 'bisexual', label: 'Bisexual', desc: 'Attracted to two or more genders' },
                    { value: 'pansexual', label: 'Pansexual', desc: 'Attracted to all genders' },
                    { value: 'asexual', label: 'Asexual', desc: 'Little to no sexual attraction' },
                    { value: 'questioning', label: 'Questioning', desc: 'Still figuring it out' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setCharacterSexuality(option.value)}
                      className={`w-full rounded-lg py-3 px-4 text-left transition-all ${
                        characterSexuality === option.value 
                          ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white' 
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <span className="font-medium">{option.label}</span>
                      <p className="text-sm opacity-80">{option.desc}</p>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIntroStep(2)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 rounded-lg py-3 text-white transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={startNewGame}
                    className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 rounded-lg py-3 text-white font-medium transition-all"
                  >
                    Begin
                  </button>
                </div>
                </>
                )}
                </motion.div>
                </motion.div>
                )}

                {/* Cleanup Modal */}
                {showCleanup && (
                <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
                onClick={() => setShowCleanup(false)}
                >
                <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-900 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
                >
                <h2 className="text-2xl font-bold text-white mb-6">Delete Duplicates</h2>
                <div className="space-y-4 mb-6">
                {duplicateGroups.map((group, idx) => (
                <div key={idx} className="bg-gray-800 rounded-lg p-4">
                  <p className="text-white font-medium mb-3">
                    {group[0].name} ({group[0].type})
                  </p>
                  <div className="space-y-2">
                    {group.map(char => (
                      <button
                        key={char.id}
                        onClick={() => {
                          handleDeleteCharacter(char);
                          setShowCleanup(false);
                        }}
                        className="w-full text-left bg-red-900/60 hover:bg-red-900/80 px-3 py-2 rounded text-sm text-gray-300 transition-all flex items-center justify-between"
                      >
                        <span>
                          {char.entity.created_date && new Date(char.entity.created_date).toLocaleDateString()}
                        </span>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>
                ))}
                </div>
                <button
                onClick={() => setShowCleanup(false)}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg"
                >
                Done
                </button>
                </motion.div>
                </motion.div>
                )}
                </div>
                );
                }