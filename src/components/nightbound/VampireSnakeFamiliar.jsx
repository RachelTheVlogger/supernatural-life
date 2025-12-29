import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Heart, Eye, Skull, Wind, Droplets, Moon, Flame, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import SnakePersonality from './SnakePersonality';
import SnakeRelationships from './SnakeRelationships';
import SnakeMissions from './SnakeMissions';

// Snake Card Component
function SnakeCard({ snake, vampireState, onInteraction, onCareAction, onUseAbility, onBreed, onPlayDate, onCustomize, onDelete, onShowProgression, interacting, currentAction, getEvolutionStage, getAbilities, EVOLUTION_PATHS }) {
  const getSnakeBaseColor = (type) => {
    const colors = {
      shadow: '#4b5563',
      venom: '#10b981',
      blood: '#ef4444',
      nightmare: '#a855f7'
    };
    return colors[type] || '#6b7280';
  };

  const abilities = getAbilities(snake);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 border-2 relative"
      style={{
        borderColor: getSnakeBaseColor(snake.type),
        borderWidth: '3px',
      }}
    >
      {/* Visual Snake Display */}
      <div className={`rounded-xl p-6 mb-4 border-2 relative overflow-hidden`} style={{
        borderColor: getSnakeBaseColor(snake.type),
        borderWidth: '3px',
        background: snake.pattern === 'iridescent'
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)'
          : snake.pattern === 'striped'
          ? `repeating-linear-gradient(90deg, ${getSnakeBaseColor(snake.type)} 0px, ${getSnakeBaseColor(snake.type)} 40px, rgba(255,255,255,0.15) 40px, rgba(255,255,255,0.15) 80px)`
          : snake.pattern === 'spotted'
          ? `radial-gradient(circle, rgba(255,255,255,0.2) 8px, transparent 8px), linear-gradient(135deg, ${getSnakeBaseColor(snake.type)}, ${getSnakeBaseColor(snake.type)})`
          : snake.pattern === 'scales_of_night'
          ? `conic-gradient(from 0deg at 50% 50%, ${getSnakeBaseColor(snake.type)} 0deg 30deg, rgba(0,0,0,0.4) 30deg 60deg, ${getSnakeBaseColor(snake.type)} 60deg 90deg, rgba(0,0,0,0.4) 90deg 120deg, ${getSnakeBaseColor(snake.type)} 120deg 150deg, rgba(0,0,0,0.4) 150deg 180deg, ${getSnakeBaseColor(snake.type)} 180deg 210deg, rgba(0,0,0,0.4) 210deg 240deg, ${getSnakeBaseColor(snake.type)} 240deg 270deg, rgba(0,0,0,0.4) 270deg 300deg, ${getSnakeBaseColor(snake.type)} 300deg 330deg, rgba(0,0,0,0.4) 330deg 360deg)`
          : `linear-gradient(135deg, ${getSnakeBaseColor(snake.type)}, ${getSnakeBaseColor(snake.type)})`,
        backgroundSize: snake.pattern === 'spotted' ? '50px 50px, 100% 100%' : 'auto'
      }}>
        <div className="relative z-10">
          <div className="text-center mb-3">
            <div 
              className="text-7xl mb-2"
              style={{
                filter: `drop-shadow(0 0 ${EVOLUTION_PATHS[snake.type][getEvolutionStage(snake.power_level) - 1].shadowGlow || EVOLUTION_PATHS[snake.type][getEvolutionStage(snake.power_level) - 1].toxicGlow || EVOLUTION_PATHS[snake.type][getEvolutionStage(snake.power_level) - 1].bloodGlow || EVOLUTION_PATHS[snake.type][getEvolutionStage(snake.power_level) - 1].nightmareGlow || EVOLUTION_PATHS[snake.type][getEvolutionStage(snake.power_level) - 1].voidGlow || EVOLUTION_PATHS[snake.type][getEvolutionStage(snake.power_level) - 1].acidGlow || EVOLUTION_PATHS[snake.type][getEvolutionStage(snake.power_level) - 1].dragonGlow || EVOLUTION_PATHS[snake.type][getEvolutionStage(snake.power_level) - 1].basiliskGlow ? '12px' : '0px'} ${EVOLUTION_PATHS[snake.type][getEvolutionStage(snake.power_level) - 1].emojiColor})`,
                color: EVOLUTION_PATHS[snake.type][getEvolutionStage(snake.power_level) - 1].emojiColor
              }}
            >
              🐍
            </div>
          </div>
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-white font-bold text-xl flex items-center gap-2">
                {snake.custom_name}
                <span 
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ 
                    backgroundColor: snake.eye_color === 'gold' ? '#fbbf24' : snake.eye_color === 'silver' ? '#d1d5db' : snake.eye_color,
                    boxShadow: `0 0 6px ${snake.eye_color === 'gold' ? '#fbbf24' : snake.eye_color === 'silver' ? '#d1d5db' : snake.eye_color}`
                  }}
                />
              </h3>
              <div className="flex gap-2">
               <button onClick={(e) => { e.stopPropagation(); onCustomize(); }} className="text-purple-400 hover:text-purple-300 text-sm px-2 py-1 touch-manipulation">✏️</button>
               <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-red-400 hover:text-red-300 text-sm px-2 py-1 touch-manipulation">🗑️</button>
              </div>
            </div>
            <p className="text-gray-400 text-sm capitalize flex items-center gap-2">
              <span className={`${snake.gender === 'male' ? 'text-blue-400' : 'text-pink-400'} font-bold text-lg`}>
                {snake.gender === 'male' ? '♂️' : '♀️'}
              </span>
              {snake.type} • {snake.size} • {snake.mood === 'content' ? '😌' : snake.mood === 'playful' ? '😄' : snake.mood === 'aggressive' ? '😠' : snake.mood === 'sleepy' ? '😴' : snake.mood === 'affectionate' ? '🥰' : '🤔'} {snake.mood}
            </p>
            <p className="text-purple-300 text-sm mt-1">
              {EVOLUTION_PATHS[snake.type][getEvolutionStage(snake.power_level) - 1].name}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-3 flex-wrap">
            <button onClick={(e) => { e.stopPropagation(); setPersonalitySnake(snake); setShowPersonality(true); }} className="px-3 py-1 rounded-lg font-medium bg-cyan-600 hover:bg-cyan-700 text-white transition-all text-xs touch-manipulation">🎭 Personality</button>
            <button onClick={(e) => { e.stopPropagation(); setRelationshipSnake(snake); setShowRelationships(true); }} className="px-3 py-1 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-all text-xs touch-manipulation">🤝 Relations</button>
            <button onClick={(e) => { e.stopPropagation(); setMissionSnake(snake); setShowMissions(true); }} className="px-3 py-1 rounded-lg font-medium bg-orange-600 hover:bg-orange-700 text-white transition-all text-xs touch-manipulation">🎯 Missions</button>
            <button onClick={(e) => { e.stopPropagation(); onBreed(); }} className="px-3 py-1 rounded-lg font-medium bg-pink-600 hover:bg-pink-700 text-white transition-all text-xs touch-manipulation">💕 Breed</button>
            <button onClick={(e) => { e.stopPropagation(); onPlayDate(); }} className="px-3 py-1 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all text-xs touch-manipulation">🎮 Play Date</button>
            <button onClick={(e) => { e.stopPropagation(); onShowProgression(); }} className="px-3 py-1 rounded-lg font-medium bg-purple-600 hover:bg-purple-700 text-white transition-all text-xs touch-manipulation">⚡ Evolution</button>
          </div>
        </div>
      </div>

      {/* Snake Stats */}
      <div className="bg-black/40 rounded-xl p-4 mb-4 border border-green-500/30">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-gray-400 text-xs">Bond: {snake.bond_level}</p>
            <div className="bg-gray-700 rounded-full h-2"><div style={{ width: `${snake.bond_level}%` }} className="h-2 bg-green-500 rounded-full" /></div>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Power: {snake.power_level}</p>
            <div className="bg-gray-700 rounded-full h-2"><div style={{ width: `${snake.power_level}%` }} className="h-2 bg-red-500 rounded-full" /></div>
          </div>
        </div>
      </div>

      {/* Basic Actions - Compact */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button 
          onClick={(e) => { 
            e.preventDefault();
            e.stopPropagation(); 
            if (!interacting) onInteraction('feed', snake); 
          }} 
          disabled={interacting} 
          className="bg-red-900/40 border border-red-500/30 rounded-lg p-3 text-xs text-white touch-manipulation active:bg-red-900/60 disabled:opacity-50"
        >
          🩸 Feed
        </button>
        <button 
          onClick={(e) => { 
            e.preventDefault();
            e.stopPropagation(); 
            if (!interacting) onInteraction('train', snake); 
          }} 
          disabled={interacting} 
          className="bg-purple-900/40 border border-purple-500/30 rounded-lg p-3 text-xs text-white touch-manipulation active:bg-purple-900/60 disabled:opacity-50"
        >
          ⚡ Train
        </button>
        <button 
          onClick={(e) => { 
            e.preventDefault();
            e.stopPropagation(); 
            if (!interacting) onInteraction('bond', snake); 
          }} 
          disabled={interacting} 
          className="bg-green-900/40 border border-green-500/30 rounded-lg p-3 text-xs text-white touch-manipulation active:bg-green-900/60 disabled:opacity-50"
        >
          💚 Bond
        </button>
      </div>

      {/* Special Abilities - Compact */}
      {abilities.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-white font-bold text-sm">Special Abilities</h4>
          <div className="grid grid-cols-2 gap-2">
            {abilities.slice(0, 4).map(ability => {
              const unlocked = snake.bond_level >= ability.reqBond;
              return (
                <button
                  key={ability.id}
                  onClick={(e) => { e.stopPropagation(); unlocked && onUseAbility(ability, snake); }}
                  disabled={!unlocked}
                  className={`rounded-lg p-2 text-xs transition-colors touch-manipulation ${
                    unlocked 
                      ? 'bg-gradient-to-r from-green-900/40 to-emerald-900/40 hover:from-green-900/60 hover:to-emerald-900/60 border border-green-500/30 text-white' 
                      : 'bg-gray-800/40 border border-gray-600/30 opacity-50 text-gray-500'
                  }`}
                >
                  <span className="block text-lg mb-1">{ability.icon}</span>
                  {ability.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

const EVOLUTION_PATHS = {
  shadow: [
    { stage: 1, name: 'Shadow Hatchling', abilities: ['Blend with Shadows'], emoji: '🐍', emojiColor: '#9CA3AF', color: 'from-gray-700 to-gray-900' },
    { stage: 2, name: 'Umbral Serpent', abilities: ['Blend with Shadows', 'Shadow Step'], emoji: '🐍', emojiColor: '#4B5563', shadowGlow: true, color: 'from-gray-800 to-black' },
    { stage: 3, name: 'Void Wyrm', abilities: ['Blend with Shadows', 'Shadow Step', 'Darkness Manipulation', 'Phase Through Walls'], emoji: '🐍', emojiColor: '#000000', voidGlow: true, color: 'from-black to-purple-950' }
  ],
  venom: [
    { stage: 1, name: 'Venom Hatchling', abilities: ['Toxic Bite'], emoji: '🐍', emojiColor: '#10B981', color: 'from-green-700 to-green-900' },
    { stage: 2, name: 'Poison Serpent', abilities: ['Toxic Bite', 'Paralysis Venom'], emoji: '🐍', emojiColor: '#059669', toxicGlow: true, color: 'from-green-800 to-emerald-950' },
    { stage: 3, name: 'Death Adder', abilities: ['Toxic Bite', 'Paralysis Venom', 'Acidic Spit', 'Plague Breath'], emoji: '🐍', emojiColor: '#047857', acidGlow: true, color: 'from-emerald-950 to-green-950' }
  ],
  blood: [
    { stage: 1, name: 'Blood Hatchling', abilities: ['Blood Scent'], emoji: '🐍', emojiColor: '#EF4444', color: 'from-red-700 to-red-900' },
    { stage: 2, name: 'Crimson Serpent', abilities: ['Blood Scent', 'Healing Blood'], emoji: '🐍', emojiColor: '#DC2626', bloodGlow: true, color: 'from-red-800 to-rose-950' },
    { stage: 3, name: 'Sanguis Drake', abilities: ['Blood Scent', 'Healing Blood', 'Blood Control', 'Life Drain'], emoji: '🐍', emojiColor: '#991B1B', dragonGlow: true, color: 'from-rose-950 to-red-950' }
  ],
  nightmare: [
    { stage: 1, name: 'Nightmare Hatchling', abilities: ['Induce Fear'], emoji: '🐍', emojiColor: '#A855F7', color: 'from-purple-700 to-purple-900' },
    { stage: 2, name: 'Terror Serpent', abilities: ['Induce Fear', 'Nightmare Vision'], emoji: '🐍', emojiColor: '#9333EA', nightmareGlow: true, color: 'from-purple-800 to-indigo-950' },
    { stage: 3, name: 'Dread Basilisk', abilities: ['Induce Fear', 'Nightmare Vision', 'Mind Break', 'Petrifying Gaze'], emoji: '🐍', emojiColor: '#7C3AED', basiliskGlow: true, color: 'from-indigo-950 to-purple-950' }
  ]
};

export default function VampireSnakeFamiliar({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [outcome, setOutcome] = useState('');
  const [interacting, setInteracting] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [showNaming, setShowNaming] = useState(false);
  const [snakeName, setSnakeName] = useState('');
  const [showAdoptModal, setShowAdoptModal] = useState(false);
  const [adoptingType, setAdoptingType] = useState(null);
  const [customName, setCustomName] = useState('');
  const [selectedGender, setSelectedGender] = useState('male');
  const [selectedPattern, setSelectedPattern] = useState('solid');
  const [selectedEyeColor, setSelectedEyeColor] = useState('red');
  const [showBreeding, setShowBreeding] = useState(false);
  const [selectedSnakeIndex, setSelectedSnakeIndex] = useState(0);
  const [showPlayDate, setShowPlayDate] = useState(false);
  const [playDateOutcome, setPlayDateOutcome] = useState('');
  const [showProgression, setShowProgression] = useState(false);
  const [showSnakeSocial, setShowSnakeSocial] = useState(false);
  const [activeTab, setActiveTab] = useState('snakes');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isAdopting, setIsAdopting] = useState(false);
  const [showPersonality, setShowPersonality] = useState(false);
  const [showRelationships, setShowRelationships] = useState(false);
  const [showMissions, setShowMissions] = useState(false);
  const [personalitySnake, setPersonalitySnake] = useState(null);
  const [relationshipSnake, setRelationshipSnake] = useState(null);
  const [missionSnake, setMissionSnake] = useState(null);

  const { data: snakes = [], isLoading: snakesLoading } = useQuery({
    queryKey: ['snakeFamiliars'],
    queryFn: async () => {
      try {
        return await base44.entities.SnakeFamiliar.filter({ vampire_id: vampireState.id });
      } catch (e) {
        return [];
      }
    }
  });

  React.useEffect(() => {
    if (!snakesLoading) {
      setTimeout(() => setIsInitialLoading(false), 1500);
    }
  }, [snakesLoading]);

  const { data: allSnakes = [] } = useQuery({
    queryKey: ['allSnakeFamiliars'],
    queryFn: () => base44.entities.SnakeFamiliar.list()
  });

  const { data: allVampireSnakes = [] } = useQuery({
    queryKey: ['allVampireSnakes'],
    queryFn: async () => {
      const servantSnakes = await base44.entities.SnakeFamiliar.list();
      return servantSnakes;
    }
  });

  // Reset index if it's out of bounds
  React.useEffect(() => {
    if (selectedSnakeIndex >= snakes.length && snakes.length > 0) {
      setSelectedSnakeIndex(0);
    }
  }, [snakes.length, selectedSnakeIndex]);

  const mySnake = snakes[selectedSnakeIndex] || snakes[0];

  const getEvolutionStage = (power) => {
    if (power >= 70) return 3;
    if (power >= 40) return 2;
    return 1;
  };

  const snakeTypes = [
    { id: 'shadow', name: 'Shadow Serpent', power: 'Invisibility & Spying', icon: '🐍', color: 'from-gray-900 to-black' },
    { id: 'venom', name: 'Venom Viper', power: 'Paralytic Bite & Poison', icon: '🐍', color: 'from-green-900 to-emerald-900' },
    { id: 'blood', name: 'Blood Python', power: 'Blood Tracking & Sensing', icon: '🐍', color: 'from-red-900 to-rose-900' },
    { id: 'nightmare', name: 'Nightmare Cobra', power: 'Fear & Mind Games', icon: '🐍', color: 'from-purple-900 to-violet-900' }
  ];

  const getAbilities = (snake) => {
    if (!snake) return [];
    
    const baseAbilities = {
      shadow: [
        { id: 'invisible', name: 'Turn Invisible', icon: '👁️‍🗨️', reqBond: 20, desc: 'Snake becomes completely invisible' },
        { id: 'teleport', name: 'Shadow Jump', icon: '🌑', reqBond: 40, desc: 'Teleport through shadows' },
        { id: 'duplicate', name: 'Shadow Clone', icon: '👥', reqBond: 60, desc: 'Create shadow duplicates' },
        { id: 'merge', name: 'Become Shadow', icon: '🌫️', reqBond: 80, desc: 'Transform into living shadow' }
      ],
      venom: [
        { id: 'paralyze', name: 'Paralyzing Bite', icon: '💉', reqBond: 20, desc: 'Immobilize victims instantly' },
        { id: 'hallucinate', name: 'Venom Dreams', icon: '🌀', reqBond: 40, desc: 'Cause vivid hallucinations' },
        { id: 'control', name: 'Venom Control', icon: '🧠', reqBond: 60, desc: 'Control poisoned victims' },
        { id: 'acidic', name: 'Acidic Venom', icon: '💧', reqBond: 80, desc: 'Venom melts through anything' }
      ],
      blood: [
        { id: 'track', name: 'Blood Tracker', icon: '🩸', reqBond: 20, desc: 'Track anyone by blood scent' },
        { id: 'drain', name: 'Blood Drain', icon: '💀', reqBond: 40, desc: 'Drain victims completely' },
        { id: 'share', name: 'Blood Link', icon: '🔗', reqBond: 60, desc: 'Share blood with you instantly' },
        { id: 'resurrect', name: 'Blood Revival', icon: '❤️', reqBond: 80, desc: 'Revive the recently dead' }
      ],
      nightmare: [
        { id: 'fear', name: 'Project Fear', icon: '😱', reqBond: 20, desc: 'Make victims terrified' },
        { id: 'dream', name: 'Enter Dreams', icon: '💭', reqBond: 40, desc: 'Invade sleeping minds' },
        { id: 'madness', name: 'Induce Madness', icon: '🌀', reqBond: 60, desc: 'Drive victims insane' },
        { id: 'consume', name: 'Consume Nightmares', icon: '🌑', reqBond: 80, desc: 'Feed on terror itself' }
      ]
    };

    return baseAbilities[snake.type] || [];
  };

  const getPatternColor = (pattern, baseColor) => {
    const patternColors = {
      solid: baseColor,
      striped: `linear-gradient(90deg, ${baseColor} 50%, rgba(255,255,255,0.2) 50%)`,
      spotted: `radial-gradient(circle, rgba(255,255,255,0.3) 20%, ${baseColor} 20%)`,
      iridescent: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
      scales_of_night: `linear-gradient(135deg, ${baseColor} 0%, rgba(0,0,0,0.8) 50%, ${baseColor} 100%)`
    };
    return patternColors[pattern] || baseColor;
  };

  const getSnakeBaseColor = (type) => {
    const colors = {
      shadow: '#4b5563',
      venom: '#10b981',
      blood: '#ef4444',
      nightmare: '#a855f7'
    };
    return colors[type] || '#6b7280';
  };

  const handleAdopt = async () => {
    if (!customName || !customName.trim()) {
      setOutcome('Please enter a name for your snake');
      setTimeout(() => setOutcome(''), 2000);
      return;
    }

    if (isAdopting) return;

    const editingSnake = snakes[selectedSnakeIndex];
    
    if (editingSnake && !adoptingType) {
      setIsAdopting(true);
      await base44.entities.SnakeFamiliar.update(editingSnake.id, {
        custom_name: customName.trim(),
        gender: selectedGender,
        pattern: selectedPattern,
        eye_color: selectedEyeColor
      });

      queryClient.invalidateQueries();
      setShowAdoptModal(false);
      setCustomName('');
      setAdoptingType(null);
      setIsAdopting(false);
      return;
    }

    setIsAdopting(true);
    await base44.entities.SnakeFamiliar.create({
      vampire_id: vampireState.id,
      custom_name: customName.trim(),
      gender: selectedGender,
      type: adoptingType,
      pattern: selectedPattern,
      eye_color: selectedEyeColor,
      bond_level: 10,
      power_level: 20,
      loyalty: 50,
      hunger: 30,
      happiness: 50,
      health: 100,
      mood: 'content',
      position: 'coiled',
      missions_completed: 0,
      unlocked_abilities: EVOLUTION_PATHS[adoptingType][0].abilities,
      size: 'small',
      age_days: 0,
      favorite_spot: 'rock',
      accessories: [],
      scars: [],
      breeding_ready: false,
      parent_ids: [],
      personality_traits: []
    });

    await base44.entities.NightLog.create({
      entry: `${customName} slithered from the shadows. Your familiar. Your spy. Your weapon.`,
      category: 'power',
      intensity: 'significant'
    });

    queryClient.invalidateQueries();
    setShowAdoptModal(false);
    setCustomName('');
    setSelectedGender('male');
    setSelectedPattern('solid');
    setSelectedEyeColor('red');
    setAdoptingType(null);
    setActiveTab('snakes');
    setIsAdopting(false);
  };

  const handlePlayDate = async (mate) => {
    const snake = snakes[selectedSnakeIndex];
    if (!snake) return;
    
    setShowPlayDate(false);
    setInteracting(true);
    setCurrentAction('playdate');

    setTimeout(async () => {
      try {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Two vampire snake familiars have a play date. Snake 1: ${snake.custom_name} (${snake.type}, ${snake.gender}, ${snake.personality_traits?.join(', ') || 'mysterious'}). Snake 2: ${mate.custom_name} (${mate.type}, ${mate.gender}, ${mate.personality_traits?.join(', ') || 'mysterious'}). Write a vivid, detailed scene of their social interaction. Are they playful? Competitive? Affectionate? Do they fight or bond? 150 words. Make it engaging and snake-like.`,
          response_json_schema: {
            type: 'object',
            properties: {
              scene: { type: 'string' },
              bond_change_1: { type: 'number' },
              bond_change_2: { type: 'number' },
              relationship: { type: 'string', enum: ['rivals', 'friends', 'lovers', 'neutral', 'enemies'] }
            }
          }
        });

        await base44.entities.SnakeFamiliar.update(snake.id, {
          bond_level: Math.min(100, (snake.bond_level || 0) + response.bond_change_1),
          happiness: Math.min(100, (snake.happiness || 50) + 10)
        });

        await base44.entities.SnakeFamiliar.update(mate.id, {
          bond_level: Math.min(100, (mate.bond_level || 0) + response.bond_change_2),
          happiness: Math.min(100, (mate.happiness || 50) + 10)
        });

        setPlayDateOutcome(`${response.scene}\n\n🐍 Relationship: ${response.relationship}\n${snake.custom_name}: ${response.bond_change_1 > 0 ? '+' : ''}${response.bond_change_1} bond\n${mate.custom_name}: ${response.bond_change_2 > 0 ? '+' : ''}${response.bond_change_2} bond`);

        await base44.entities.NightLog.create({
          entry: `${snake.custom_name} and ${mate.custom_name} had a play date. ${response.relationship}.`,
          category: 'interaction',
          intensity: 'moderate'
        });

        queryClient.invalidateQueries();
      } catch (e) {
        const fallbackScenes = [
          `${snake.custom_name} and ${mate.custom_name} coil around each other. Testing strength. ${snake.custom_name} is faster. ${mate.custom_name} is stronger. They hiss playfully. This is bonding. Snake style.`,
          `The two serpents meet. Cautious at first. Then ${mate.custom_name} flicks tongue at ${snake.custom_name}. A game begins. Chase through shadows. They're having fun. Pure reptilian joy.`,
          `${snake.custom_name} shows off abilities. ${mate.custom_name} watches. Impressed. They exchange knowledge. Snake wisdom passed between them. A friendship forming.`
        ];
        setPlayDateOutcome(fallbackScenes[Math.floor(Math.random() * fallbackScenes.length)]);
        
        await base44.entities.SnakeFamiliar.update(snake.id, {
          bond_level: Math.min(100, (snake.bond_level || 0) + 5),
          happiness: Math.min(100, (snake.happiness || 50) + 10)
        });
        await base44.entities.SnakeFamiliar.update(mate.id, {
          bond_level: Math.min(100, (mate.bond_level || 0) + 5),
          happiness: Math.min(100, (mate.happiness || 50) + 10)
        });
        queryClient.invalidateQueries();
      }

      setTimeout(() => {
        setInteracting(false);
        setCurrentAction(null);
        setPlayDateOutcome('');
      }, 5000);
    }, 2000);
  };

  const handleBreed = async (mate) => {
    const snake = snakes[selectedSnakeIndex];
    if (!snake) return;
    
    if (snake.bond_level < 60 || snake.loyalty < 60 || mate.bond_level < 60 || mate.loyalty < 60) {
      setOutcome('Both snakes need 60+ bond and loyalty to breed safely.');
      setTimeout(() => setOutcome(''), 3000);
      return;
    }

    if (!snake.breeding_ready || !mate.breeding_ready) {
      setOutcome('One or both snakes are not ready to breed yet.');
      setTimeout(() => setOutcome(''), 3000);
      return;
    }

    const inheritType = Math.random() > 0.5 ? snake.type : mate.type;
    const inheritPattern = Math.random() > 0.5 ? snake.pattern : mate.pattern;
    const inheritEyeColor = Math.random() > 0.5 ? snake.eye_color : mate.eye_color;
    const inheritGender = Math.random() > 0.5 ? 'male' : 'female';
    
    const combinedTraits = [...new Set([...(snake.personality_traits || []), ...(mate.personality_traits || [])])];
    const inheritedTraits = combinedTraits.slice(0, 2);
    
    const avgPower = Math.floor((snake.power_level + mate.power_level) / 2) + Math.floor(Math.random() * 20 - 10);
    const avgBond = Math.floor((snake.bond_level + mate.bond_level) / 2);
    
    const babyPrefixes = ['Little', 'Baby', 'Mini', 'Tiny'];
    const parentName = snake.custom_name.split(' ')[0];
    const offspringName = `${babyPrefixes[Math.floor(Math.random() * babyPrefixes.length)]} ${parentName}`;

    await base44.entities.SnakeFamiliar.create({
      vampire_id: vampireState.id,
      custom_name: offspringName,
      gender: inheritGender,
      type: inheritType,
      pattern: inheritPattern,
      eye_color: inheritEyeColor,
      bond_level: Math.max(10, avgBond - 30),
      power_level: Math.max(15, avgPower),
      loyalty: 30,
      hunger: 50,
      happiness: 70,
      health: 100,
      mood: 'curious',
      position: 'coiled',
      missions_completed: 0,
      unlocked_abilities: EVOLUTION_PATHS[inheritType][0].abilities,
      size: 'small',
      age_days: 0,
      favorite_spot: 'nest',
      accessories: [],
      scars: [],
      breeding_ready: false,
      parent_ids: [snake.id, mate.id],
      personality_traits: inheritedTraits
    });

    await base44.entities.SnakeFamiliar.update(snake.id, { breeding_ready: false });
    await base44.entities.SnakeFamiliar.update(mate.id, { breeding_ready: false });

    const babyEmoji = EVOLUTION_PATHS[inheritType][0].emoji;
    
    await base44.entities.NightLog.create({
      entry: `${babyEmoji} ${snake.custom_name} and ${mate.custom_name} had a baby! ${offspringName} was born - a tiny ${inheritGender} ${inheritType} with ${inheritPattern} pattern and ${inheritEyeColor} eyes. Adorable!`,
      category: 'interaction',
      intensity: 'significant'
    });

    queryClient.invalidateQueries();
    setShowBreeding(false);
    setOutcome(`🐍 ${babyEmoji} A baby snake! ${offspringName} hatched - ${inheritGender} ${inheritType} with ${inheritPattern} scales and ${inheritEyeColor} eyes! Looks just like the parents! SO CUTE!`);
    
    setTimeout(() => setOutcome(''), 6000);
  };

  const handleCareAction = async (action, targetSnake) => {
    const snake = targetSnake || snakes[selectedSnakeIndex];
    if (!snake) return;
    
    setInteracting(true);
    setCurrentAction(action);

    setTimeout(async () => {
      let updates = {};
      let message = '';

      switch (action) {
        case 'feed_meal':
          const feedOutcomes = [
            `You prepare fresh meat for ${snake.custom_name}. The snake approaches cautiously. Sniffs. Then strikes! Teeth sink into flesh. Eating slowly. Savoring each bite. You watch fondly as your familiar feeds. When finished, ${snake.custom_name} coils contentedly, belly full. A satisfied hiss. The bond between you grows.`,
            `Feeding time. ${snake.custom_name} hasn't eaten in days. You can see the hunger in those glowing eyes. You offer the meal. The serpent lunges—FAST. Powerful jaws clamp down. Swallowing methodically. You stroke its scales as it eats. "Good," you whisper. The snake's tail wraps around your wrist. Grateful.`,
            `${snake.custom_name} is RAVENOUS. You present the food. Your familiar's eyes lock onto it. Predator mode activated. The strike is lightning-quick. A blur of scales and fangs. Minutes pass as the snake consumes its prey. Finally sated, ${snake.custom_name} slides over to you. Presses its head against your palm. Thank you.`
          ];
          updates.hunger = Math.max(0, (snake.hunger || 30) - 50);
          updates.happiness = Math.min(100, (snake.happiness || 50) + 5);
          message = feedOutcomes[Math.floor(Math.random() * feedOutcomes.length)];
          break;

        case 'give_water':
          const waterOutcomes = [
            `You fill ${snake.custom_name}'s water bowl with fresh, cool water. The snake glides over immediately. Dips its snout in. Drinks for a long time—must have been thirsty. You watch the rhythmic movements of its throat. When done, the serpent looks up at you. Eyes brighter. More alert. Refreshed. It flicks its tongue gratefully.`,
            `Time for fresh water. ${snake.custom_name} watches as you clean the old bowl, refill it. The water glistens. Your familiar approaches and begins drinking. Slow. Deliberate. You sit beside it. Run your hand along its scales. The snake continues drinking, completely at ease with your presence. Trust.`,
            `${snake.custom_name} hasn't had water in a while. You notice the dryness in its scales. Quickly, you bring fresh water. The snake drinks DEEPLY. Relief visible in every movement. After, it coils in the water dish—just resting there. Cool and comfortable. You smile. Taking care of your familiar feels right.`
          ];
          updates.happiness = Math.min(100, (snake.happiness || 50) + 10);
          updates.health = Math.min(100, (snake.health || 100) + 3);
          message = waterOutcomes[Math.floor(Math.random() * waterOutcomes.length)];
          break;

        case 'clean_enclosure':
          const cleanOutcomes = [
            `Cleaning time. You remove ${snake.custom_name} gently, place it on your shoulder. It watches curiously as you work. Scrubbing. Wiping. Replacing bedding. Everything fresh and new. When you return your familiar to its space, it immediately explores. Sliding over every surface. Inspecting your work. Then coils in its favorite spot. Content. You did well.`,
            `The enclosure needs cleaning. ${snake.custom_name} is NOT happy about being moved. Hisses at you. Stubborn serpent. But you persist. Clean every corner. Disinfect. Replace substrate. Add new enrichment items. When finished, you return the snake. It explores suspiciously... then settles. Admits (silently) that this is better. You win.`,
            `You begin the cleaning ritual. ${snake.custom_name} helps—sort of. Follows you around. Gets in the way. Investigates every tool. You laugh. "I'm trying to clean FOR you," you say. The snake doesn't care. Just wants to be involved. Eventually you finish. Sparkling clean. The serpent coils up immediately. Happy. You suspect it appreciates the effort more than it shows.`
          ];
          updates.health = Math.min(100, (snake.health || 100) + 8);
          updates.happiness = Math.min(100, (snake.happiness || 50) + 12);
          message = cleanOutcomes[Math.floor(Math.random() * cleanOutcomes.length)];
          break;

        case 'health_check':
          const healthOutcomes = [
            `Health inspection. You examine ${snake.custom_name} carefully. Eyes—clear and bright. Scales—smooth, no damage. Mouth—check for infections. Teeth sharp. Perfectly healthy. You run your hands along the entire length of its body. Checking for injuries. Bumps. Anything unusual. All good. ${snake.custom_name} tolerates the examination patiently. Trusts you completely. When done, you give it a treat. "Perfect health," you announce. The snake seems pleased.`,
            `Vet check time. ${snake.custom_name} is NOT cooperating. Squirming. Hiding its head. "Come on," you coax. Finally manage to examine it properly. Temperature normal. Breathing good. No signs of illness. Just being dramatic. You discover a small scratch though—probably from training. You clean it carefully. Apply healing salve. ${snake.custom_name} hisses but holds still. Knows you're helping. After, it nuzzles against you. Apology accepted.`,
            `You notice ${snake.custom_name} moving slower today. Concerned, you do a thorough health assessment. Check its weight—good. Skin elasticity—fine. Then you find it: preparing to shed. That explains everything. You increase humidity. Add a rough surface for shedding. Make sure water is fresh. Your familiar will need extra care during this time. You stay close. Monitoring. Supportive. This is what it means to care for your serpent.`
          ];
          updates.health = Math.min(100, (snake.health || 100) + 15);
          updates.happiness = Math.min(100, (snake.happiness || 50) + 5);
          message = healthOutcomes[Math.floor(Math.random() * healthOutcomes.length)];
          break;

        case 'enrichment':
          const enrichmentOutcomes = [
            `Enrichment day! You set up an obstacle course for ${snake.custom_name}. Tubes to explore. Branches to climb. Hidden treats. The snake investigates everything. Curious. Excited. You watch as it navigates each challenge. Problem-solving. Learning. This is good for its mind AND body. When done, ${snake.custom_name} returns to you. Tired but happy. Mental stimulation achieved. You can see the intelligence in those eyes. Your familiar is THRIVING.`,
            `Time to shake things up. ${snake.custom_name} has been bored. You rearrange its entire enclosure. New layout. New hiding spots. Add textures it hasn't felt before. Release the snake back in. It IMMEDIATELY starts exploring. Every corner. Every surface. Tongue flicking constantly. Taking it all in. Hours pass. Your familiar is completely engaged. This is what it needed. Variety. Challenge. You make a mental note to do this more often.`,
            `You bring ${snake.custom_name} to a new room. Let it explore freely under supervision. The snake is FASCINATED. New smells. New sounds. Different temperature. It investigates cautiously at first, then with growing confidence. Climbs furniture. Hides in corners. Tests boundaries. You guide it gently. Keep it safe. This exposure to new environments builds confidence. Makes your familiar more adaptable. Stronger. After an hour, you return it to its enclosure. ${snake.custom_name} seems... bigger somehow. More worldly. Enrichment success.`
          ];
          updates.happiness = Math.min(100, (snake.happiness || 50) + 20);
          updates.mood = 'playful';
          updates.bond_level = Math.min(100, (snake.bond_level || 0) + 5);
          message = enrichmentOutcomes[Math.floor(Math.random() * enrichmentOutcomes.length)];
          break;
      }

      await base44.entities.SnakeFamiliar.update(snake.id, updates);
      setOutcome(message);

      await base44.entities.NightLog.create({
        entry: message,
        category: 'interaction',
        intensity: 'subtle'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setInteracting(false);
        setCurrentAction(null);
        setOutcome('');
      }, 4500);
    }, 2000);
  };

  const handleInteraction = async (action, targetSnake) => {
    const snake = targetSnake || snakes[selectedSnakeIndex];
    if (!snake) return;
    
    setInteracting(true);
    setCurrentAction(action);

    setTimeout(async () => {
      let result = '';
      let bondChange = 0;
      let powerChange = 0;
      const updates = {};

      switch (action) {
        case 'feed':
          result = `You fed ${snake.custom_name} vampire blood. Its eyes glow crimson. Power courses through its scales.`;
          bondChange = Math.floor(Math.random() * 8) + 5;
          powerChange = Math.floor(Math.random() * 12) + 8;
          updates.hunger = Math.max(0, (snake.hunger || 50) - 40);
          updates.bond_level = Math.min(100, (snake.bond_level || 0) + bondChange);
          updates.power_level = Math.min(100, (snake.power_level || 0) + powerChange);
          
          // Size growth
          if (snake.power_level >= 80 && snake.size !== 'massive') {
            updates.size = 'massive';
            result += ` ${snake.custom_name} grows MASSIVE. Coils thicker than your body.`;
          } else if (snake.power_level >= 60 && snake.size === 'medium') {
            updates.size = 'large';
            result += ` ${snake.custom_name} grows larger. More powerful.`;
          } else if (snake.power_level >= 30 && snake.size === 'small') {
            updates.size = 'medium';
            result += ` ${snake.custom_name} is growing. No longer small.`;
          }
          break;

        case 'train':
          result = `Training session. ${snake.custom_name} learns to strike faster, hide better. A perfect predator.`;
          bondChange = Math.floor(Math.random() * 5) + 3;
          powerChange = Math.floor(Math.random() * 10) + 6;
          updates.bond_level = Math.min(100, (snake.bond_level || 0) + bondChange);
          updates.power_level = Math.min(100, (snake.power_level || 0) + powerChange);
          break;

        case 'spy':
          const spyResults = [
            `${snake.custom_name} returns. Saw a hunter planning an ambush. You avoid the trap.`,
            `The serpent brings information. A rival vampire's weakness. Useful.`,
            `Your snake spied on the witch. She knows you're watching. She smiled.`,
            `${snake.custom_name} tracked a human. Found their home. Their routine. Their vulnerability.`,
            `Your familiar discovered a secret vampire meeting. Political intrigue.`,
            `${snake.custom_name} witnessed a supernatural ritual. Strange magic.`
          ];
          result = spyResults[Math.floor(Math.random() * spyResults.length)];
          updates.missions_completed = (snake.missions_completed || 0) + 1;
          break;

        case 'hunt':
          result = `${snake.custom_name} hunted. Brought back a paralyzed victim. Fresh blood for you.`;
          updates.missions_completed = (snake.missions_completed || 0) + 1;
          updates.hunger = Math.min(100, (snake.hunger || 30) + 25);
          await base44.entities.VampireState.update(vampireState.id, {
            hunger_state: 'sated'
          });
          break;

        case 'bond':
          result = `You and ${snake.custom_name} share blood. Minds linking. You feel what it feels. See what it sees. Perfect symbiosis.`;
          bondChange = Math.floor(Math.random() * 15) + 10;
          updates.bond_level = Math.min(100, (snake.bond_level || 0) + bondChange);
          updates.loyalty = Math.min(100, (snake.loyalty || 50) + 8);
          break;

        case 'cuddle':
          result = `${snake.custom_name} coils around you. Cool scales against your skin. Comforting. You stroke its head gently.`;
          bondChange = Math.floor(Math.random() * 8) + 6;
          updates.bond_level = Math.min(100, (snake.bond_level || 0) + bondChange);
          break;

        case 'talk':
          const talkResults = [
            `You speak to ${snake.custom_name}. It understands. Hisses softly in response. Communication beyond words.`,
            `${snake.custom_name} curls around your arm. You discuss your plans. It seems to agree.`,
            `Whispered secrets to your snake. It keeps them all. Loyal. Forever.`,
            `${snake.custom_name} tells you things. Visions. Warnings. Prophecies only serpents know.`
          ];
          result = talkResults[Math.floor(Math.random() * talkResults.length)];
          bondChange = Math.floor(Math.random() * 6) + 4;
          updates.bond_level = Math.min(100, (snake.bond_level || 0) + bondChange);
          break;

        case 'guard':
          result = `${snake.custom_name} guards your lair. Nothing enters unseen. Perfect sentinel.`;
          updates.missions_completed = (snake.missions_completed || 0) + 1;
          updates.loyalty = Math.min(100, (snake.loyalty || 50) + 5);
          break;

        case 'venom':
          result = `${snake.custom_name} produces venom. Potent. Deadly. You collect it in a vial. Useful.`;
          updates.missions_completed = (snake.missions_completed || 0) + 1;
          break;

        case 'shed':
          result = `${snake.custom_name} sheds its skin. Perfect scales. You collect them—magical material for rituals and crafting.`;
          updates.missions_completed = (snake.missions_completed || 0) + 1;
          if (snake.power_level >= 50) {
            result += ` The shed skin GLOWS. Powerful magic infused.`;
          }
          break;

        case 'prophecy':
          const prophecies = [
            `${snake.custom_name} hisses warnings. Danger approaches. A hunter is close.`,
            `Your snake sees the future. A rival vampire plots against you. Be ready.`,
            `${snake.custom_name}'s eyes glow. Vision: someone close will betray you soon.`,
            `Serpent prophecy: Blood will be spilled tonight. Not yours. Not if you're careful.`,
            `${snake.custom_name} senses opportunity. A powerful artifact nearby. Hidden.`,
            `Vision from your familiar: The witch thinks of you. Dreams of you.`
          ];
          result = prophecies[Math.floor(Math.random() * prophecies.length)];
          updates.missions_completed = (snake.missions_completed || 0) + 1;
          break;

        case 'steal':
          const stolenItems = [
            `${snake.custom_name} returns with a wallet. Cash inside. Easy money.`,
            `Your snake stole a phone. Messages reveal secrets. Blackmail material.`,
            `${snake.custom_name} brings you keys. Someone's home is now accessible.`,
            `Stolen: jewelry. Expensive. Your snake is a perfect thief.`,
            `${snake.custom_name} took someone's ID. Their identity. Their life. Yours to use.`,
            `Your familiar stole medical records. Private information. Leverage.`
          ];
          result = stolenItems[Math.floor(Math.random() * stolenItems.length)];
          updates.missions_completed = (snake.missions_completed || 0) + 1;
          break;

        case 'mark':
          result = `${snake.custom_name} marks your territory. Venom traces on boundaries. Other supernaturals know: this place is YOURS.`;
          updates.missions_completed = (snake.missions_completed || 0) + 1;
          updates.loyalty = Math.min(100, (snake.loyalty || 50) + 6);
          break;

        case 'merge':
          result = `${snake.custom_name} merges with you. Coils INSIDE your body. You feel its power. Its senses. Two beings, one consciousness.`;
          bondChange = Math.floor(Math.random() * 20) + 15;
          powerChange = Math.floor(Math.random() * 15) + 10;
          updates.bond_level = Math.min(100, (snake.bond_level || 0) + bondChange);
          updates.power_level = Math.min(100, (snake.power_level || 0) + powerChange);
          await base44.entities.VampireState.update(vampireState.id, {
            vampire_power_level: Math.min(100, (vampireState.vampire_power_level || 0) + 5)
          });
          break;

        case 'hibernate':
          result = `${snake.custom_name} enters hibernation. Deep sleep. Healing. Growing. Will awaken stronger.`;
          powerChange = Math.floor(Math.random() * 25) + 20;
          updates.power_level = Math.min(100, (snake.power_level || 0) + powerChange);
          updates.hunger = Math.max(0, (snake.hunger || 30) - 50);
          break;
      }

      // Check for evolution
      const oldStage = getEvolutionStage(snake.power_level);
      const newStage = getEvolutionStage(updates.power_level || snake.power_level);

      if (newStage > oldStage) {
        const evolutionPath = EVOLUTION_PATHS[snake.type];
        const currentEvolution = evolutionPath[newStage - 1];
        updates.unlocked_abilities = currentEvolution.abilities;
        result += `\n\n🐍 EVOLUTION! ${snake.custom_name} evolved into ${currentEvolution.name}! New abilities unlocked!`;
      }

      await base44.entities.SnakeFamiliar.update(snake.id, updates);

      await base44.entities.NightLog.create({
      entry: result,
      category: 'interaction',
      intensity: 'moderate'
      });

      setOutcome(result);
      queryClient.invalidateQueries();

      setTimeout(() => {
        setInteracting(false);
        setCurrentAction(null);
        setOutcome('');
      }, 3500);
    }, 2000);
  };

  const handleUseAbility = async (ability, targetSnake) => {
    const snake = targetSnake || snakes[selectedSnakeIndex];
    if (!snake) return;
    
    setInteracting(true);
    setCurrentAction('ability_' + ability.id);

    setTimeout(async () => {
      const abilityResults = {
        invisible: `${snake.custom_name} vanishes completely. Perfect invisibility. Spying made effortless.`,
        teleport: `${snake.custom_name} melts into shadows. Reappears miles away. Shadow travel mastered.`,
        duplicate: `${snake.custom_name} splits into THREE serpents. Shadow clones. All obey you.`,
        merge: `${snake.custom_name} becomes pure shadow. Formless. Impossible to detect or harm.`,
        
        paralyze: `${snake.custom_name} strikes! Victim frozen instantly. Helpless. Yours.`,
        hallucinate: `Venom-induced visions. The victim sees horrors. Screams. ${snake.custom_name} watches.`,
        control: `${snake.custom_name}'s venom rewrites minds. The victim obeys your every command now.`,
        acidic: `${snake.custom_name} spits acid. Metal melts. Stone dissolves. Nothing stops it.`,
        
        track: `${snake.custom_name} tastes the air. Found them. Blood scent leads straight to your target.`,
        drain: `${snake.custom_name} drains a victim completely. Every drop. Brings it back to you.`,
        share: `Blood link activated. ${snake.custom_name}'s meal flows directly into your veins. Instant feeding.`,
        resurrect: `${snake.custom_name} breathes blood magic into a corpse. They gasp. Alive again. Miracle.`,
        
        fear: `${snake.custom_name} projects pure terror. Victims flee screaming. Primal fear unleashed.`,
        dream: `${snake.custom_name} enters their dreams. Nightmares shaped by serpent whispers.`,
        madness: `${snake.custom_name}'s eyes lock onto theirs. Sanity shatters. They're broken now.`,
        consume: `${snake.custom_name} feeds on their nightmares. Growing stronger from their terror.`
      };

      const result = abilityResults[ability.id] || `${snake.custom_name} used ${ability.name}!`;

      if (!snake.unlocked_abilities?.includes(ability.name)) {
        await base44.entities.SnakeFamiliar.update(snake.id, {
          unlocked_abilities: [...(snake.unlocked_abilities || []), ability.name]
        });
      }

      await base44.entities.NightLog.create({
        entry: result,
        category: 'power',
        intensity: 'significant'
      });

      setOutcome(result);
      queryClient.invalidateQueries();

      setTimeout(() => {
        setInteracting(false);
        setCurrentAction(null);
        setOutcome('');
      }, 3500);
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
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative border-2 border-green-500/50"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">🐍 Snake Familiar</h2>
        <p className="text-gray-400 text-sm mb-4">
          A serpent bound to you. Your spy. Your weapon. Your companion.
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('snakes')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'snakes'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            My Snakes {snakes.length > 0 && `(${snakes.length})`}
          </button>
          <button
            onClick={() => setActiveTab('adopt')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'adopt'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            + Adopt New
          </button>
        </div>

        {/* Initial Loading Animation */}
        {isInitialLoading ? (
          <div className="text-center py-16">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.3, 1]
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                scale: { duration: 1.5, repeat: Infinity }
              }}
              className="text-8xl mb-4"
            >
              🐍
            </motion.div>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-green-400"
            >
              Summoning your familiar...
            </motion.p>
          </div>
        ) : (
          <>
        {/* All Snakes Display */}
        {activeTab === 'snakes' && snakes.length > 0 && (
          <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-2">
            {snakes.map((snake, index) => (
              <SnakeCard 
                key={snake.id}
                snake={snake}
                vampireState={vampireState}
                onInteraction={handleInteraction}
                onCareAction={handleCareAction}
                onUseAbility={handleUseAbility}
                onBreed={() => {
                  setSelectedSnakeIndex(index);
                  setShowBreeding(true);
                }}
                onPlayDate={() => {
                  setSelectedSnakeIndex(index);
                  setShowPlayDate(true);
                }}
                onCustomize={() => {
                  setSelectedSnakeIndex(index);
                  setCustomName(snake.custom_name);
                  setSelectedGender(snake.gender);
                  setSelectedPattern(snake.pattern);
                  setSelectedEyeColor(snake.eye_color);
                  setShowAdoptModal(true);
                }}
                onDelete={async () => {
                  if (confirm(`Release ${snake.custom_name}? This cannot be undone.`)) {
                    await base44.entities.SnakeFamiliar.delete(snake.id);
                    await base44.entities.NightLog.create({
                      entry: `${snake.custom_name} was released back into the wild. The bond severed.`,
                      category: 'interaction',
                      intensity: 'moderate'
                    });
                    queryClient.invalidateQueries();
                  }
                }}
                onShowProgression={() => {
                  setSelectedSnakeIndex(index);
                  setShowProgression(true);
                }}
                interacting={interacting}
                currentAction={currentAction}
                getEvolutionStage={getEvolutionStage}
                getAbilities={getAbilities}
                EVOLUTION_PATHS={EVOLUTION_PATHS}
              />
            ))}
          </div>
        )}

        {outcome ? (
          <div className="py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 rounded-xl p-6 border border-green-500/30"
            >
              <p className="text-green-100 text-base leading-relaxed">{outcome}</p>
            </motion.div>
          </div>
        ) : interacting ? (
          <div className="text-center py-12">
            {currentAction === 'feed_meal' && (
              <motion.div>
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  🐍
                </motion.div>
                <motion.div
                  animate={{ y: [-20, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-4xl"
                >
                  🍖
                </motion.div>
                <p className="text-orange-400 mt-4">Feeding meal...</p>
              </motion.div>
            )}
            {currentAction === 'give_water' && (
              <motion.div>
                <div className="text-6xl mb-4">🐍</div>
                <motion.div
                  animate={{ y: [0, 20], opacity: [1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-4xl"
                >
                  💧
                </motion.div>
                <p className="text-blue-400 mt-4">Giving water...</p>
              </motion.div>
            )}
            {currentAction === 'clean_enclosure' && (
              <motion.div>
                <motion.div
                  animate={{ x: [-20, 20, -20] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  🐍
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-4xl"
                >
                  🧹
                </motion.div>
                <p className="text-green-400 mt-4">Cleaning...</p>
              </motion.div>
            )}
            {currentAction === 'health_check' && (
              <motion.div>
                <div className="text-6xl mb-4">🐍</div>
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-4xl"
                >
                  🩺
                </motion.div>
                <p className="text-purple-400 mt-4">Health check...</p>
              </motion.div>
            )}
            {currentAction === 'enrichment' && (
              <motion.div>
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  🐍
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-4xl"
                >
                  🎾
                </motion.div>
                <p className="text-pink-400 mt-4">Enrichment...</p>
              </motion.div>
            )}
            {currentAction === 'feed' && (
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <div className="text-6xl mb-4">🐍</div>
                <motion.div
                  animate={{ y: [-20, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-4xl"
                >
                  🩸
                </motion.div>
                <p className="text-red-400 mt-4">Feeding...</p>
              </motion.div>
            )}
            {currentAction === 'train' && (
              <motion.div>
                <motion.div
                  animate={{ x: [-30, 30, -30], rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  🐍
                </motion.div>
                <div className="flex justify-center gap-4">
                  <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>⚡</motion.div>
                  <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.3 }}>💪</motion.div>
                </div>
                <p className="text-purple-400 mt-4">Training...</p>
              </motion.div>
            )}
            {currentAction === 'spy' && (
              <motion.div>
                <motion.div
                  animate={{ opacity: [1, 0.3, 1], scale: [1, 0.8, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  🐍
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-4xl"
                >
                  👁️
                </motion.div>
                <p className="text-blue-400 mt-4">Spying...</p>
              </motion.div>
            )}
            {currentAction === 'hunt' && (
              <motion.div>
                <motion.div
                  animate={{ x: [-50, 50], y: [0, -20, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  🐍
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 0.8, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-4xl"
                >
                  🎯
                </motion.div>
                <p className="text-red-400 mt-4">Hunting prey...</p>
              </motion.div>
            )}
            {currentAction === 'bond' && (
              <motion.div>
                <div className="flex justify-center items-center gap-4 mb-4">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-6xl"
                  >
                    🐍
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-4xl"
                  >
                    💚
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                    className="text-6xl"
                  >
                    🧛
                  </motion.div>
                </div>
                <p className="text-green-400">Bonding deeply...</p>
              </motion.div>
            )}
            {currentAction === 'cuddle' && (
              <motion.div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  🐍
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl"
                >
                  💕
                </motion.div>
                <p className="text-pink-400 mt-4">Cuddling...</p>
              </motion.div>
            )}
            {currentAction === 'talk' && (
              <motion.div>
                <div className="text-6xl mb-4">🐍</div>
                <motion.div
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-2xl"
                >
                  💭 💬 💭
                </motion.div>
                <p className="text-cyan-400 mt-4">Communicating...</p>
              </motion.div>
            )}
            {currentAction === 'guard' && (
              <motion.div>
                <motion.div
                  animate={{ x: [-20, 20, -20] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  🐍
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-4xl"
                >
                  🛡️
                </motion.div>
                <p className="text-indigo-400 mt-4">Guarding...</p>
              </motion.div>
            )}
            {currentAction === 'venom' && (
              <motion.div>
                <div className="text-6xl mb-4">🐍</div>
                <motion.div
                  animate={{ y: [0, 20], opacity: [1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-4xl"
                >
                  💧
                </motion.div>
                <p className="text-green-400 mt-4">Extracting venom...</p>
              </motion.div>
            )}
            {currentAction === 'shed' && (
              <motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  🐍
                </motion.div>
                <motion.div
                  animate={{ scale: [0.5, 1.2], opacity: [0, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-4xl"
                >
                  ✨
                </motion.div>
                <p className="text-purple-400 mt-4">Shedding skin...</p>
              </motion.div>
            )}
            {currentAction === 'prophecy' && (
              <motion.div>
                <div className="text-6xl mb-4">🐍</div>
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl"
                >
                  🔮
                </motion.div>
                <p className="text-blue-400 mt-4">Receiving vision...</p>
              </motion.div>
            )}
            {currentAction === 'steal' && (
              <motion.div>
                <motion.div
                  animate={{ x: [-30, 30, -30], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  🐍
                </motion.div>
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl"
                >
                  💰
                </motion.div>
                <p className="text-red-400 mt-4">Stealing...</p>
              </motion.div>
            )}
            {currentAction === 'mark' && (
              <motion.div>
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  🐍
                </motion.div>
                <motion.div
                  animate={{ scale: [0.8, 1.3, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-4xl"
                >
                  🔥
                </motion.div>
                <p className="text-orange-400 mt-4">Marking territory...</p>
              </motion.div>
            )}
            {currentAction === 'merge' && (
              <motion.div>
                <motion.div
                  animate={{ scale: [1, 0.5], opacity: [1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  🐍
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl"
                >
                  🧛
                </motion.div>
                <p className="text-pink-400 mt-4">Merging consciousness...</p>
              </motion.div>
            )}
            {currentAction === 'hibernate' && (
              <motion.div>
                <motion.div
                  animate={{ opacity: [1, 0.3, 1], scale: [1, 0.9, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  🐍
                </motion.div>
                <div className="text-4xl">💤</div>
                <p className="text-gray-400 mt-4">Hibernating...</p>
              </motion.div>
            )}
            {currentAction === 'playdate' && (
              <motion.div>
                {!playDateOutcome ? (
                  <>
                    <motion.div
                      animate={{ x: [-20, 20, -20], rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-6xl mb-4"
                    >
                      🐍🐍
                    </motion.div>
                    <p className="text-blue-400 mt-4">Play date in progress...</p>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="text-6xl mb-4">🐍💕🐍</div>
                    <p className="text-blue-300 text-base whitespace-pre-line px-4">{playDateOutcome}</p>
                  </motion.div>
                )}
              </motion.div>
            )}
            {currentAction === 'breeding' && (
              <motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  🐍💕🐍
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-4xl"
                >
                  🥚
                </motion.div>
                <p className="text-pink-400 mt-4">Creating new life...</p>
              </motion.div>
            )}
            {currentAction?.startsWith('ability_') && (
              <motion.div>
                <motion.div
                  animate={{ scale: [1, 1.5, 1], rotate: [0, 360] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  🐍
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-5xl"
                >
                  ⚡✨⚡
                </motion.div>
                <p className="text-purple-400 mt-4">Using special ability...</p>
              </motion.div>
            )}
            {!currentAction && (
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <div className="text-6xl">🐍</div>
              </motion.div>
            )}
          </div>
        ) : activeTab === 'snakes' && snakes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🐍</div>
            <p className="text-gray-400 mb-4">No snakes yet</p>
            <button
              onClick={() => setActiveTab('adopt')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Adopt Your First Snake
            </button>
          </div>
        ) : activeTab === 'adopt' ? (
          <div className="space-y-3">
            <p className="text-gray-300 mb-4">Choose your serpent familiar:</p>
            {snakes.length >= 5 && (
              <div className="bg-yellow-900/40 border border-yellow-500/50 rounded-lg p-3 mb-4">
                <p className="text-yellow-200 text-sm">Maximum 5 snakes reached</p>
              </div>
            )}
            {snakeTypes.map(snake => (
              <button
                key={snake.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setAdoptingType(snake.id);
                  setShowAdoptModal(true);
                }}
                disabled={snakes.length >= 5}
                className={`w-full bg-gradient-to-r ${snake.color} border border-green-500/30 rounded-xl p-4 text-left hover:opacity-90 transition-opacity touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{snake.icon}</span>
                    <div>
                      <h4 className="text-white font-bold">{snake.name}</h4>
                      <p className="text-gray-400 text-sm">{snake.power}</p>
                    </div>
                  </div>
                  <Zap className="w-5 h-5 text-green-400" />
                </div>
              </button>
            ))}
          </div>
        ) : null}
        </>
        )}

        {/* Naming Modal */}
        <AnimatePresence>
          {showNaming && mySnake && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[60]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full">
                <h3 className="text-white text-xl font-bold mb-4">Name Your Snake</h3>
                <input
                  type="text"
                  value={customName || ''}
                  onChange={(e) => setCustomName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && customName && customName.trim()) {
                      base44.entities.SnakeFamiliar.update(mySnake.id, { custom_name: customName.trim() });
                      queryClient.invalidateQueries();
                      setShowNaming(false);
                      setCustomName('');
                    }
                  }}
                  className="w-full bg-gray-800 border border-green-500/30 rounded-lg px-4 py-3 text-white mb-4"
                  placeholder="Name your serpent..."
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowNaming(false)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (customName && customName.trim()) {
                        base44.entities.SnakeFamiliar.update(mySnake.id, { custom_name: customName.trim() });
                        queryClient.invalidateQueries();
                        setShowNaming(false);
                        setCustomName('');
                      }
                    }}
                    disabled={!customName || !customName.trim()}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white py-2 rounded-lg"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Adoption Customization Modal */}
        <AnimatePresence>
          {showAdoptModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[60]"
              onClick={() => setShowAdoptModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 max-w-md w-full border-2 border-green-500/50"
              >
                <h2 className="text-2xl font-bold text-white mb-4">{!adoptingType ? 'Customize Snake' : 'Customize Your Snake'}</h2>

                <div className="mb-4">
                  <label className="text-gray-400 text-sm mb-2 block">Name</label>
                  <input
                    type="text"
                    value={customName || ''}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Enter snake name..."
                    className="w-full bg-gray-800 border border-green-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500"
                    autoFocus
                  />
                </div>

                <div className="mb-4">
                  <label className="text-gray-400 text-sm mb-2 block">Gender</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedGender('male')}
                      className={`py-3 rounded-lg font-medium transition-all ${
                        selectedGender === 'male'
                          ? 'bg-blue-600 text-white border-2 border-blue-400'
                          : 'bg-gray-800 text-gray-400 border border-gray-700'
                      }`}
                    >
                      ♂️ Male
                    </button>
                    <button
                      onClick={() => setSelectedGender('female')}
                      className={`py-3 rounded-lg font-medium transition-all ${
                        selectedGender === 'female'
                          ? 'bg-pink-600 text-white border-2 border-pink-400'
                          : 'bg-gray-800 text-gray-400 border border-gray-700'
                      }`}
                    >
                      ♀️ Female
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-gray-400 text-sm mb-2 block">Scale Pattern</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['solid', 'striped', 'spotted', 'iridescent', 'scales_of_night'].map(pattern => (
                      <button
                        key={pattern}
                        onClick={() => setSelectedPattern(pattern)}
                        className={`py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                          selectedPattern === pattern
                            ? 'bg-green-600 text-white border-2 border-green-400'
                            : 'bg-gray-800 text-gray-400 border border-gray-700'
                        }`}
                      >
                        {pattern.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="text-gray-400 text-sm mb-2 block">Eye Color</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['red', 'gold', 'green', 'purple', 'blue', 'silver'].map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedEyeColor(color)}
                        className={`py-2 rounded-lg text-sm font-medium capitalize transition-all`}
                        style={selectedEyeColor === color ? {
                          backgroundColor: color === 'gold' ? '#ca8a04' : color === 'silver' ? '#6b7280' : color,
                          borderWidth: '2px',
                          borderColor: color === 'gold' ? '#fbbf24' : color === 'silver' ? '#9ca3af' : color,
                          color: 'white'
                        } : {
                          backgroundColor: '#1f2937',
                          color: '#9ca3af',
                          border: '1px solid #374151'
                        }}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAdoptModal(false)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdopt}
                    disabled={!customName || !customName.trim() || isAdopting}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-all"
                  >
                    {isAdopting ? 'Adopting...' : !adoptingType ? 'Save Changes' : 'Adopt Snake'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Evolution Progression Modal */}
        <AnimatePresence>
          {showProgression && snakes[selectedSnakeIndex] && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[60] overflow-y-auto"
              onClick={() => setShowProgression(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border-2 border-purple-500/50"
              >
                <button onClick={() => setShowProgression(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold text-white mb-2">⚡ Evolution Path</h2>
                <p className="text-gray-400 text-sm mb-6">{snakes[selectedSnakeIndex].custom_name}'s transformation journey</p>

                {/* Current Stage Overview */}
                <div className="bg-gradient-to-br from-purple-900/60 to-violet-900/60 border-2 border-purple-500/50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-white font-bold text-lg">
                        {EVOLUTION_PATHS[snakes[selectedSnakeIndex].type][getEvolutionStage(snakes[selectedSnakeIndex].power_level) - 1].name}
                      </h3>
                      <p className="text-purple-300 text-sm">Stage {getEvolutionStage(snakes[selectedSnakeIndex].power_level)} of 3</p>
                    </div>
                    <div className="text-5xl">
                      {EVOLUTION_PATHS[snakes[selectedSnakeIndex].type][getEvolutionStage(snakes[selectedSnakeIndex].power_level) - 1].emoji}
                    </div>
                  </div>
                  <div className="bg-black/40 rounded-lg p-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Power Level</span>
                      <span>{snakes[selectedSnakeIndex].power_level}/100</span>
                    </div>
                    <div className="bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-violet-500 h-3 rounded-full transition-all"
                        style={{ width: `${snakes[selectedSnakeIndex].power_level}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Evolution Stages */}
                <div className="space-y-4">
                  {EVOLUTION_PATHS[snakes[selectedSnakeIndex].type].map((stage, index) => {
                    const isCurrentStage = getEvolutionStage(snakes[selectedSnakeIndex].power_level) === stage.stage;
                    const isCompleted = getEvolutionStage(snakes[selectedSnakeIndex].power_level) > stage.stage;
                    const isLocked = getEvolutionStage(snakes[selectedSnakeIndex].power_level) < stage.stage;
                    
                    return (
                      <div 
                        key={stage.stage}
                        className={`rounded-xl p-4 border-2 transition-all ${
                          isCurrentStage 
                            ? 'bg-gradient-to-br from-purple-900/60 to-violet-900/60 border-purple-400 shadow-lg shadow-purple-500/20' 
                            : isCompleted
                            ? 'bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500/50'
                            : 'bg-gray-900/40 border-gray-600/30 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-white font-bold">{stage.name}</h4>
                              {isCompleted && <span className="text-green-400 text-xs">✓ Completed</span>}
                              {isCurrentStage && <span className="text-purple-400 text-xs">• Current</span>}
                            </div>
                            <p className="text-gray-400 text-xs">
                              {stage.stage === 1 ? 'Power: 0-39' : stage.stage === 2 ? 'Power: 40-69' : 'Power: 70+'}
                            </p>
                          </div>
                          <div className="text-4xl">{stage.emoji}</div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-gray-300 text-sm font-medium">Abilities:</p>
                          <div className="flex flex-wrap gap-2">
                            {stage.abilities.map((ability, i) => (
                              <span 
                                key={i} 
                                className={`text-xs px-3 py-1 rounded-full ${
                                  isCompleted || isCurrentStage
                                    ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30'
                                    : 'bg-gray-800/60 text-gray-500 border border-gray-600/30'
                                }`}
                              >
                                {ability}
                              </span>
                            ))}
                          </div>
                        </div>

                        {isLocked && (
                          <div className="mt-3 bg-black/40 rounded-lg p-2 text-center">
                            <p className="text-gray-500 text-xs">
                              Reach power level {stage.stage === 2 ? '40' : '70'} to unlock
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => setShowProgression(false)}
                  className="w-full mt-6 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Play Date Modal */}
        <AnimatePresence>
          {showPlayDate && snakes[selectedSnakeIndex] && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[60] overflow-y-auto"
              onClick={() => setShowPlayDate(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border-2 border-blue-500/50"
              >
                <h2 className="text-2xl font-bold text-white mb-4">🎮 Snake Play Date</h2>
                
                <p className="text-gray-400 mb-4">Select a playmate for {snakes[selectedSnakeIndex].custom_name}</p>
                
                <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border border-blue-500/30 rounded-lg p-4 mb-4">
                  <p className="text-blue-300 text-sm mb-2">Your Snake:</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold">{snakes[selectedSnakeIndex].custom_name}</p>
                      <p className="text-gray-300 text-sm">
                        {snakes[selectedSnakeIndex].gender === 'male' ? '♂️' : '♀️'} {snakes[selectedSnakeIndex].type}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {allSnakes
                    .filter(s => s.id !== snakes[selectedSnakeIndex].id)
                    .map(mate => (
                      <button
                        key={mate.id}
                        onClick={() => handlePlayDate(mate)}
                        className="w-full bg-gradient-to-r from-blue-900/60 to-purple-900/60 hover:from-blue-900/80 hover:to-purple-900/80 border-2 border-blue-500/50 rounded-xl p-4 text-left transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-bold">{mate.custom_name}</p>
                            <p className="text-gray-300 text-sm">
                              {mate.gender === 'male' ? '♂️' : '♀️'} {mate.type}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  
                  {allSnakes.filter(s => s.id !== snakes[selectedSnakeIndex].id).length === 0 && (
                    <div className="bg-gray-800/40 border border-gray-600/30 rounded-lg p-4">
                      <p className="text-gray-400 text-center">No other snakes available for play date.</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowPlayDate(false)}
                  className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Breeding Modal */}
        <AnimatePresence>
          {showBreeding && snakes[selectedSnakeIndex] && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[60] overflow-y-auto"
              onClick={() => setShowBreeding(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border-2 border-pink-500/50"
              >
                <h2 className="text-2xl font-bold text-white mb-4">💕 Snake Breeding</h2>
                
                {snakes[selectedSnakeIndex].bond_level < 60 || snakes[selectedSnakeIndex].loyalty < 60 ? (
                  <div className="bg-red-900/40 border border-red-500/50 rounded-lg p-4 mb-4">
                    <p className="text-red-200">Your snake needs 60+ bond and loyalty to breed safely</p>
                  </div>
                ) : !snakes[selectedSnakeIndex].breeding_ready ? (
                  <div className="bg-yellow-900/40 border border-yellow-500/50 rounded-lg p-4 mb-4">
                    <p className="text-yellow-200">Your snake is not ready to breed yet</p>
                    <button
                      onClick={async () => {
                        await base44.entities.SnakeFamiliar.update(snakes[selectedSnakeIndex].id, { breeding_ready: true });
                        queryClient.invalidateQueries();
                      }}
                      className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg"
                    >
                      Mark as Ready
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-400 mb-4">Select a mate for {snakes[selectedSnakeIndex].custom_name}</p>
                    
                    <div className="bg-gradient-to-br from-pink-900/40 to-purple-900/40 border border-pink-500/30 rounded-lg p-4 mb-4">
                      <p className="text-pink-300 text-sm mb-2">Your Snake:</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-bold">{snakes[selectedSnakeIndex].custom_name}</p>
                          <p className="text-gray-300 text-sm">
                            {snakes[selectedSnakeIndex].gender === 'male' ? '♂️' : '♀️'} {snakes[selectedSnakeIndex].type} • {snakes[selectedSnakeIndex].pattern} • {snakes[selectedSnakeIndex].eye_color} eyes
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Bond: {snakes[selectedSnakeIndex].bond_level}</p>
                          <p className="text-sm text-gray-400">Power: {snakes[selectedSnakeIndex].power_level}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {allSnakes
                        .filter(s => s.id !== snakes[selectedSnakeIndex].id && s.breeding_ready && s.bond_level >= 60 && s.loyalty >= 60)
                        .map(mate => (
                          <button
                            key={mate.id}
                            onClick={() => handleBreed(mate)}
                            className="w-full bg-gradient-to-r from-purple-900/60 to-pink-900/60 hover:from-purple-900/80 hover:to-pink-900/80 border-2 border-purple-500/50 rounded-xl p-4 text-left transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-white font-bold">{mate.custom_name}</p>
                                <p className="text-gray-300 text-sm">
                                  {mate.gender === 'male' ? '♂️' : '♀️'} {mate.type} • {mate.pattern} • {mate.eye_color} eyes
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-400">Bond: {mate.bond_level}</p>
                                <p className="text-sm text-gray-400">Power: {mate.power_level}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      
                      {allSnakes.filter(s => s.id !== snakes[selectedSnakeIndex].id && s.breeding_ready && s.bond_level >= 60 && s.loyalty >= 60).length === 0 && (
                        <div className="bg-gray-800/40 border border-gray-600/30 rounded-lg p-4">
                          <p className="text-gray-400 text-center">No suitable mates available. Snakes need 60+ bond, loyalty, and must be marked as breeding ready.</p>
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-900/40 border border-blue-500/30 rounded-lg p-4 mt-4">
                      <p className="text-blue-200 text-sm">
                        <strong>Breeding Info:</strong> Offspring will inherit traits from both parents including type, pattern, eye color, and personality.
                      </p>
                    </div>
                  </>
                )}

                <button
                  onClick={() => setShowBreeding(false)}
                  className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg"
                >
                  Close
                </button>
                </motion.div>
                </motion.div>
                )}
                </AnimatePresence>

                {/* Deep System Modals */}
                {showPersonality && personalitySnake && (
                <SnakePersonality 
                snake={personalitySnake}
                onClose={() => {
                setShowPersonality(false);
                setPersonalitySnake(null);
                }}
                />
                )}

                {showRelationships && relationshipSnake && (
                <SnakeRelationships
                snake={relationshipSnake}
                allSnakes={allSnakes}
                onClose={() => {
                setShowRelationships(false);
                setRelationshipSnake(null);
                }}
                />
                )}

                {showMissions && missionSnake && (
                <SnakeMissions
                snake={missionSnake}
                onClose={() => {
                setShowMissions(false);
                setMissionSnake(null);
                }}
                />
                )}
                </motion.div>
                </motion.div>
                );
                }