import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Heart, Zap, Droplets, Moon, Shield, Eye, Sword, Sparkles } from 'lucide-react';

const SNAKE_TYPES = [
  { type: 'shadow', name: 'Shadow Serpent', color: 'from-gray-900 to-black', ability: 'Stealth and illusions' },
  { type: 'venom', name: 'Venom Viper', color: 'from-purple-900 to-pink-900', ability: 'Poison and paralysis' },
  { type: 'blood', name: 'Blood Python', color: 'from-red-900 to-rose-900', ability: 'Blood magic enhancement' },
  { type: 'nightmare', name: 'Nightmare Cobra', color: 'from-indigo-900 to-purple-900', ability: 'Fear and mind control' }
];

const EVOLUTION_PATHS = {
  shadow: [
    { stage: 1, name: 'Shadow Hatchling', abilities: ['Blend with Shadows'], emoji: '🐍', color: 'from-gray-700 to-gray-900' },
    { stage: 2, name: 'Umbral Serpent', abilities: ['Blend with Shadows', 'Shadow Step'], emoji: '🐍✨', color: 'from-gray-800 to-black' },
    { stage: 3, name: 'Void Wyrm', abilities: ['Blend with Shadows', 'Shadow Step', 'Darkness Manipulation', 'Phase Through Walls'], emoji: '🐍🌑', color: 'from-black to-purple-950' }
  ],
  venom: [
    { stage: 1, name: 'Venom Hatchling', abilities: ['Toxic Bite'], emoji: '🐍', color: 'from-green-700 to-green-900' },
    { stage: 2, name: 'Poison Serpent', abilities: ['Toxic Bite', 'Paralysis Venom'], emoji: '🐍💚', color: 'from-green-800 to-emerald-950' },
    { stage: 3, name: 'Death Adder', abilities: ['Toxic Bite', 'Paralysis Venom', 'Acidic Spit', 'Plague Breath'], emoji: '🐍☠️', color: 'from-emerald-950 to-green-950' }
  ],
  blood: [
    { stage: 1, name: 'Blood Hatchling', abilities: ['Blood Scent'], emoji: '🐍', color: 'from-red-700 to-red-900' },
    { stage: 2, name: 'Crimson Serpent', abilities: ['Blood Scent', 'Healing Blood'], emoji: '🐍❤️', color: 'from-red-800 to-rose-950' },
    { stage: 3, name: 'Sanguis Drake', abilities: ['Blood Scent', 'Healing Blood', 'Blood Control', 'Life Drain'], emoji: '🐍🩸', color: 'from-rose-950 to-red-950' }
  ],
  nightmare: [
    { stage: 1, name: 'Nightmare Hatchling', abilities: ['Induce Fear'], emoji: '🐍', color: 'from-purple-700 to-purple-900' },
    { stage: 2, name: 'Terror Serpent', abilities: ['Induce Fear', 'Nightmare Vision'], emoji: '🐍💜', color: 'from-purple-800 to-indigo-950' },
    { stage: 3, name: 'Dread Basilisk', abilities: ['Induce Fear', 'Nightmare Vision', 'Mind Break', 'Petrifying Gaze'], emoji: '🐍👁️', color: 'from-indigo-950 to-purple-950' }
  ]
};

const BASIC_INTERACTIONS = [
  { id: 'feed', label: 'Feed Blood', icon: Droplets },
  { id: 'train', label: 'Train Powers', icon: Zap },
  { id: 'spy', label: 'Spy Mission', icon: Eye },
  { id: 'hunt', label: 'Hunt Together', icon: Moon },
  { id: 'bond', label: 'Deep Bond', icon: Heart },
  { id: 'cuddle', label: 'Cuddle', icon: Heart },
  { id: 'talk', label: 'Talk to Snake', icon: Heart },
  { id: 'guard', label: 'Guard Duty', icon: Shield },
  { id: 'venom', label: 'Harvest Venom', icon: Droplets },
  { id: 'shed', label: 'Collect Shed Skin', icon: Sparkles },
  { id: 'prophecy', label: 'Seek Prophecy', icon: Eye },
  { id: 'steal', label: 'Steal Items', icon: Sword },
  { id: 'mark', label: 'Mark Territory', icon: Zap },
  { id: 'merge', label: 'Merge Consciousness', icon: Heart, reqBond: 70 },
  { id: 'hibernate', label: 'Hibernate', icon: Moon }
];

const SNAKE_ABILITIES = {
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

// Enhanced abilities from drugs/plants (available when unlocked)
const ENHANCED_ABILITIES = [
  { id: 'blood_rage', name: 'Blood Rage', icon: '🔥', desc: 'Temporary strength boost from blood fury' },
  { id: 'time_dilation', name: 'Time Dilation', icon: '⏰', desc: 'Slow perceived time' },
  { id: 'reality_warp', name: 'Reality Warp', icon: '🌀', desc: 'Bend reality' },
  { id: 'inferno_scales', name: 'Inferno Scales', icon: '🔥', desc: 'Burning scales' },
  { id: 'void_step', name: 'Void Step', icon: '⚫', desc: 'Void teleportation' },
  { id: 'bloom_shield', name: 'Bloom Shield', icon: '🌸', desc: 'Blood petal barrier' },
  { id: 'shadow_bind', name: 'Shadow Bind', icon: '🌿', desc: 'Shadow vine trap' },
  { id: 'lunar_empowerment', name: 'Lunar Empowerment', icon: '🌙', desc: 'Night power surge' },
  { id: 'root_strike', name: 'Root Strike', icon: '🌱', desc: 'Blood root attack' },
  { id: 'toxic_cloud', name: 'Toxic Cloud', icon: '☁️', desc: 'Poison vapor' },
  { id: 'enhanced_senses', name: 'Enhanced Senses', icon: '👁️', desc: 'Heightened perception' }
];

export default function ServantSnake() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [interacting, setInteracting] = useState(null);
  const [outcome, setOutcome] = useState('');
  const [showAdopt, setShowAdopt] = useState(false);
  const [carrying, setCarrying] = useState(false);
  const [showBreeding, setShowBreeding] = useState(false);
  const [selectedMate, setSelectedMate] = useState(null);
  const [showAdoptModal, setShowAdoptModal] = useState(false);
  const [adoptingType, setAdoptingType] = useState(null);
  const [customName, setCustomName] = useState('');
  const [selectedGender, setSelectedGender] = useState('male');
  const [selectedPattern, setSelectedPattern] = useState('solid');
  const [selectedEyeColor, setSelectedEyeColor] = useState('red');
  const [showNaming, setShowNaming] = useState(false);

  const urlParams = new URLSearchParams(location.search);
  const servantId = urlParams.get('id');

  const { data: servants = [] } = useQuery({
    queryKey: ['servants'],
    queryFn: () => base44.entities.Servant.list()
  });

  const servant = servants.find(s => s.id === servantId);

  const { data: snakes = [] } = useQuery({
    queryKey: ['snakeFamiliars', servantId],
    queryFn: () => base44.entities.SnakeFamiliar.filter({ vampire_id: servantId }),
    enabled: !!servantId
  });

  const { data: allSnakes = [] } = useQuery({
    queryKey: ['allSnakeFamiliars'],
    queryFn: () => base44.entities.SnakeFamiliar.list()
  });

  const [selectedSnakeIndex, setSelectedSnakeIndex] = useState(0);
  const snake = snakes[selectedSnakeIndex] || snakes[0];

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
    if (!customName.trim()) {
      setOutcome('Please enter a name for your snake');
      setTimeout(() => setOutcome(''), 2000);
      return;
    }

    // If snake exists, update it instead of creating
    if (snake) {
      await base44.entities.SnakeFamiliar.update(snake.id, {
        custom_name: customName.trim(),
        gender: selectedGender,
        pattern: selectedPattern,
        eye_color: selectedEyeColor
      });

      await base44.entities.NightLog.create({
        entry: `${servant.name} customized their snake familiar. New appearance: ${selectedGender} ${selectedPattern} pattern with ${selectedEyeColor} eyes.`,
        category: 'interaction',
        intensity: 'subtle'
      });

      queryClient.invalidateQueries();
      setShowAdoptModal(false);
      setCustomName('');
      return;
    }

    await base44.entities.SnakeFamiliar.create({
      vampire_id: servantId,
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
      unlocked_abilities: [],
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
      entry: `${servant.name} adopted ${customName}, a ${SNAKE_TYPES.find(s => s.type === adoptingType).name}. A familiar bond begins.`,
      category: 'interaction',
      intensity: 'significant'
    });

    queryClient.invalidateQueries();
    setShowAdoptModal(false);
    setCustomName('');
    setSelectedGender('male');
    setSelectedPattern('solid');
    setSelectedEyeColor('red');
  };

  const handleBreed = async (mate) => {
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

    setInteracting('breeding');

    setTimeout(async () => {
      try {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Two vampire snake familiars are breeding. Parent 1: ${snake.custom_name} (${snake.type}, ${snake.gender}, ${snake.pattern} pattern, ${snake.eye_color} eyes, power ${snake.power_level}, traits: ${(snake.personality_traits || []).join(', ') || 'none'}). Parent 2: ${mate.custom_name} (${mate.type}, ${mate.gender}, ${mate.pattern} pattern, ${mate.eye_color} eyes, power ${mate.power_level}, traits: ${(mate.personality_traits || []).join(', ') || 'none'}). Generate offspring genetics and description. Be creative with inheritance - can be hybrid type, unique patterns, etc. Name should be baby-themed or combine parent names.`,
          response_json_schema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              gender: { type: 'string', enum: ['male', 'female'] },
              type: { type: 'string', enum: ['shadow', 'venom', 'blood', 'nightmare'] },
              pattern: { type: 'string', enum: ['solid', 'striped', 'spotted', 'iridescent', 'scales_of_night'] },
              eye_color: { type: 'string', enum: ['red', 'gold', 'green', 'purple', 'blue', 'silver'] },
              personality_traits: { type: 'array', items: { type: 'string' } },
              birth_description: { type: 'string' },
              special_mutation: { type: 'string' }
            }
          }
        });

        const avgPower = Math.floor((snake.power_level + mate.power_level) / 2) + Math.floor(Math.random() * 20 - 10);
        const avgBond = Math.floor((snake.bond_level + mate.bond_level) / 2);

        await base44.entities.SnakeFamiliar.create({
          vampire_id: servantId,
          custom_name: response.name,
          gender: response.gender,
          type: response.type,
          pattern: response.pattern,
          eye_color: response.eye_color,
          bond_level: Math.max(10, avgBond - 30),
          power_level: Math.max(15, avgPower),
          loyalty: 30,
          hunger: 50,
          happiness: 70,
          health: 100,
          mood: 'curious',
          position: 'coiled',
          missions_completed: 0,
          unlocked_abilities: EVOLUTION_PATHS[response.type][0].abilities,
          size: 'small',
          age_days: 0,
          favorite_spot: 'nest',
          accessories: [],
          scars: [],
          breeding_ready: false,
          parent_ids: [snake.id, mate.id],
          personality_traits: response.personality_traits || []
        });

        await base44.entities.SnakeFamiliar.update(snake.id, { breeding_ready: false });
        await base44.entities.SnakeFamiliar.update(mate.id, { breeding_ready: false });

        const babyEmoji = EVOLUTION_PATHS[response.type][0].emoji;
        
        await base44.entities.NightLog.create({
          entry: `${babyEmoji} ${response.name} was born! Parents: ${snake.custom_name} & ${mate.custom_name}. ${response.birth_description}`,
          category: 'interaction',
          intensity: 'significant'
        });

        queryClient.invalidateQueries();
        setShowBreeding(false);
        setSelectedMate(null);
        setOutcome(`🐍 ${babyEmoji} ${response.birth_description}\n\n${response.name} - ${response.gender} ${response.type}\n${response.pattern} scales, ${response.eye_color} eyes\nTraits: ${response.personality_traits?.join(', ') || 'none'}\n${response.special_mutation ? `\n✨ Mutation: ${response.special_mutation}` : ''}`);
        
        setTimeout(() => {
          setInteracting(null);
          setOutcome('');
        }, 7000);
      } catch (e) {
        // Fallback breeding
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
          vampire_id: servantId,
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
          entry: `${babyEmoji} ${snake.custom_name} and ${mate.custom_name} had a baby! ${offspringName} was born.`,
          category: 'interaction',
          intensity: 'significant'
        });

        queryClient.invalidateQueries();
        setShowBreeding(false);
        setSelectedMate(null);
        setOutcome(`🐍 ${babyEmoji} A baby snake! ${offspringName} hatched - ${inheritGender} ${inheritType} with ${inheritPattern} scales and ${inheritEyeColor} eyes!`);
        
        setTimeout(() => {
          setInteracting(null);
          setOutcome('');
        }, 6000);
      }
    }, 2000);
  };

  const getEvolutionStage = (power) => {
    if (power >= 70) return 3;
    if (power >= 40) return 2;
    return 1;
  };

  const handleBasicInteraction = async (actionId) => {
    setInteracting(actionId);

    setTimeout(async () => {
      let result = '';
      let bondChange = 0;
      let powerChange = 0;
      const updates = {};

      switch (actionId) {
        case 'feed':
          result = `You fed ${snake.custom_name} vampire blood. Its eyes glow crimson. Power courses through its scales.`;
          bondChange = Math.floor(Math.random() * 8) + 5;
          powerChange = Math.floor(Math.random() * 12) + 8;
          updates.hunger = Math.max(0, (snake.hunger || 50) - 40);
          updates.bond_level = Math.min(100, (snake.bond_level || 0) + bondChange);
          updates.power_level = Math.min(100, (snake.power_level || 0) + powerChange);
          
          // Size growth
          if (updates.power_level >= 80 && snake.size !== 'massive') {
            updates.size = 'massive';
            result += ` ${snake.custom_name} grows MASSIVE. Coils thicker than your body.`;
          } else if (updates.power_level >= 60 && snake.size === 'medium') {
            updates.size = 'large';
            result += ` ${snake.custom_name} grows larger. More powerful.`;
          } else if (updates.power_level >= 30 && snake.size === 'small') {
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
          if ((snake.power_level || 0) >= 50) {
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
        result += `\n\n🐍 EVOLUTION! Your snake evolved into ${currentEvolution.name}! New abilities unlocked!`;
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
        setInteracting(null);
        setOutcome('');
      }, 3500);
    }, 2000);
  };

  const handleUseAbility = async (ability) => {
    setInteracting('ability_' + ability.id);

    setTimeout(async () => {
      const outcomes = {
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
        consume: `${snake.custom_name} feeds on their nightmares. Growing stronger from their terror.`,
        
        blood_rage: `${snake.custom_name}'s body surges with blood fury! Super strength!`,
        time_dilation: `${snake.custom_name} slows time. Combat in slow motion.`,
        reality_warp: `${snake.custom_name} bends reality. Illusions everywhere.`,
        inferno_scales: `${snake.custom_name}'s scales ignite! Touch = burn.`,
        void_step: `${snake.custom_name} tears through the void. Instant teleport.`,
        bloom_shield: `${snake.custom_name} summons blood petal barrier.`,
        shadow_bind: `${snake.custom_name} extends shadow vines. Enemies trapped.`,
        lunar_empowerment: `${snake.custom_name} channels moonlight. Power surge!`,
        root_strike: `${snake.custom_name} summons blood roots. Impaling strike.`,
        toxic_cloud: `${snake.custom_name} exhales poison vapor. Cloud spreads.`,
        enhanced_senses: `${snake.custom_name}'s senses sharpen impossibly. Sees all.`
      };

      const result = outcomes[ability.id] || `${snake.custom_name} used ${ability.name}!`;

      await base44.entities.NightLog.create({
        entry: result,
        category: 'power',
        intensity: 'significant'
      });

      setOutcome(result);
      queryClient.invalidateQueries();

      setTimeout(() => {
        setInteracting(null);
        setOutcome('');
      }, 3500);
    }, 2000);
  };

  if (!servant || !servant.is_turned) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Only vampire servants can have snake familiars</p>
          <button
            onClick={() => navigate(createPageUrl('Night'))}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
          >
            Return
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-24" style={{
      background: 'linear-gradient(to bottom, #0f1419 0%, #1a0e1a 50%, #0a0014 100%)'
    }}>
      <button
        onClick={() => navigate(createPageUrl(`ServantHome?id=${servantId}`))}
        className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Snake Selector if multiple */}
      {snakes.length > 1 && (
        <div className="max-w-2xl mx-auto mb-6">
          <div className="bg-gray-900/60 rounded-xl p-4 border border-purple-500/30">
            <h3 className="text-white font-bold mb-3">Your Snakes</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {snakes.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSnakeIndex(i)}
                  className={`flex-shrink-0 rounded-lg p-3 border-2 transition-all ${
                    selectedSnakeIndex === i
                      ? 'bg-purple-600 border-purple-400 scale-105'
                      : 'bg-gray-800 border-gray-600 hover:border-purple-500'
                  }`}
                >
                  <div className="text-3xl mb-1">
                    {EVOLUTION_PATHS[s.type][getEvolutionStage(s.power_level) - 1].emoji}
                  </div>
                  <p className="text-white text-xs font-medium">{s.custom_name}</p>
                  <p className="text-gray-400 text-xs">{s.type}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {snakes.length === 0 ? (
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-2">🐍 Adopt Snake Familiar</h1>
            <p className="text-gray-400">Choose your serpent companion</p>
          </motion.div>

          <div className="space-y-4">
            {SNAKE_TYPES.map((type, i) => (
              <motion.button
                key={type.type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => {
                  setAdoptingType(type.type);
                  setShowAdoptModal(true);
                }}
                className={`w-full bg-gradient-to-r ${type.color} border-2 border-green-500/50 rounded-xl p-6 text-left hover:scale-105 transition-transform`}
              >
                <h3 className="text-white text-xl font-bold mb-2">{type.name}</h3>
                <p className="text-gray-300 text-sm">{type.ability}</p>
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="text-8xl mb-4">
              {EVOLUTION_PATHS[snake.type][getEvolutionStage(snake.power_level) - 1].emoji}
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <h1 className="text-white font-bold text-xl">{snake.custom_name}</h1>
                <p className="text-gray-400 text-sm capitalize">{snake.type} • {snake.size}</p>
                <p className="text-purple-300 text-sm mt-1">
                  {EVOLUTION_PATHS[snake.type][getEvolutionStage(snake.power_level) - 1].name}
                </p>
                {getEvolutionStage(snake.power_level) < 3 && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-400">Next evolution:</span>
                    <span className="text-2xl">{EVOLUTION_PATHS[snake.type][getEvolutionStage(snake.power_level)].emoji}</span>
                    <span className="text-xs text-purple-400">at {getEvolutionStage(snake.power_level) === 1 ? '40' : '70'} power</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowNaming(true)}
                className="text-purple-400 hover:text-purple-300 text-sm"
              >
                Rename
              </button>
            </div>
          </motion.div>

          {/* Snake Stats */}
          <div className="bg-black/40 rounded-xl p-4 mb-6 border border-green-500/30">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-gray-400 text-xs">Bond Level</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div style={{ width: `${snake.bond_level}%` }} className="h-2 bg-green-500 rounded-full" />
                  </div>
                  <span className="text-white text-xs">{snake.bond_level}</span>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Power Level</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div style={{ width: `${snake.power_level}%` }} className="h-2 bg-red-500 rounded-full" />
                  </div>
                  <span className="text-white text-xs">{snake.power_level}</span>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Loyalty</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div style={{ width: `${snake.loyalty}%` }} className="h-2 bg-purple-500 rounded-full" />
                  </div>
                  <span className="text-white text-xs">{snake.loyalty}</span>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Hunger</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div style={{ width: `${snake.hunger}%` }} className="h-2 bg-orange-500 rounded-full" />
                  </div>
                  <span className="text-white text-xs">{snake.hunger}</span>
                </div>
              </div>
            </div>
            <p className="text-gray-400 text-xs">Missions: {snake.missions_completed || 0} • Abilities: {snake.unlocked_abilities?.length || 0}</p>
          </div>

          {!outcome ? (
            <div className="space-y-6">
              {/* Basic Interactions */}
              <div>
                <h3 className="text-white font-bold mb-3">Basic Interactions</h3>
                <div className="grid grid-cols-2 gap-2">
                  {BASIC_INTERACTIONS.map((action) => {
                    const ActionIcon = action.icon;
                    const disabled = !!interacting || (action.reqBond && snake.bond_level < action.reqBond);
                    
                    return (
                      <button
                        key={action.id}
                        onClick={() => handleBasicInteraction(action.id)}
                        disabled={disabled}
                        className={`border rounded-lg p-3 text-center transition-colors ${
                          disabled
                            ? 'bg-gray-800/40 border-gray-600/30 opacity-50'
                            : 'bg-green-900/40 hover:bg-green-900/60 border-green-500/30'
                        }`}
                      >
                        <ActionIcon className="w-5 h-5 text-white mx-auto mb-1" />
                        <p className="text-white text-xs font-medium">{action.label}</p>
                        {action.reqBond && snake.bond_level < action.reqBond && (
                          <p className="text-xs text-gray-400 mt-1">({action.reqBond})</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Special Abilities */}
              <div>
                <h3 className="text-white font-bold mb-3">Special Abilities (Infinite Use)</h3>
                <div className="space-y-2">
                  {SNAKE_ABILITIES[snake.type].map(ability => {
                    const unlocked = snake.bond_level >= ability.reqBond;

                    return (
                      <button
                        key={ability.id}
                        onClick={() => unlocked && !interacting && handleUseAbility(ability)}
                        disabled={!unlocked || !!interacting}
                        className={`w-full rounded-lg p-3 text-left transition-all active:scale-95 ${
                          unlocked 
                            ? 'bg-gradient-to-r from-green-900/40 to-emerald-900/40 hover:from-green-900/60 hover:to-emerald-900/60 border border-green-500/30' 
                            : 'bg-gray-800/40 border border-gray-600/30 opacity-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{ability.icon}</span>
                            <div>
                              <h4 className="text-white font-medium">{ability.name}</h4>
                              <p className="text-gray-400 text-xs">{ability.desc}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {!unlocked && <span className="text-gray-500 text-xs">Bond {ability.reqBond}</span>}
                          </div>
                        </div>
                      </button>
                    );
                  })}

                  {/* Enhanced Abilities (if any unlocked) */}
                  {ENHANCED_ABILITIES.filter(ea => (snake.unlocked_abilities || []).includes(ea.name)).map(ability => (
                    <button
                      key={ability.id}
                      onClick={() => !interacting && handleUseAbility(ability)}
                      disabled={!!interacting}
                      className="w-full rounded-lg p-3 text-left transition-all active:scale-95 bg-gradient-to-r from-purple-900/40 to-pink-900/40 hover:from-purple-900/60 hover:to-pink-900/60 border border-purple-500/30"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{ability.icon}</span>
                          <div>
                            <h4 className="text-white font-medium">{ability.name}</h4>
                            <p className="text-gray-400 text-xs">{ability.desc}</p>
                          </div>
                        </div>
                        <span className="text-purple-300 text-xs">ENHANCED</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 rounded-2xl p-6 text-center"
            >
              <p className="text-gray-300 text-lg leading-relaxed">{outcome}</p>
            </motion.div>
          )}
        </div>
      )}

      {/* Adoption Customization Modal */}
      <AnimatePresence>
        {showAdoptModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90"
            onClick={() => setShowAdoptModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 max-w-md w-full border-2 border-green-500/50"
            >
              <h2 className="text-2xl font-bold text-white mb-4">{snake ? 'Customize Snake' : 'Customize Your Snake'}</h2>

              {/* Name Input */}
              <div className="mb-4">
                <label className="text-gray-400 text-sm mb-2 block">Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Enter snake name..."
                  className="w-full bg-gray-800 border border-green-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500"
                  autoFocus
                />
              </div>

              {/* Gender Selection */}
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

              {/* Pattern Selection */}
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

              {/* Eye Color Selection */}
              <div className="mb-6">
                <label className="text-gray-400 text-sm mb-2 block">Eye Color</label>
                <div className="grid grid-cols-3 gap-2">
                  {['red', 'gold', 'green', 'purple', 'blue', 'silver'].map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedEyeColor(color)}
                      className={`py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                        selectedEyeColor === color
                          ? `bg-${color === 'red' ? 'red' : color === 'gold' ? 'yellow' : color === 'silver' ? 'gray' : color}-600 text-white border-2 border-${color === 'red' ? 'red' : color === 'gold' ? 'yellow' : color === 'silver' ? 'gray' : color}-400`
                          : 'bg-gray-800 text-gray-400 border border-gray-700'
                      }`}
                      style={selectedEyeColor === color ? {
                        backgroundColor: color === 'gold' ? '#ca8a04' : color === 'silver' ? '#6b7280' : color,
                        borderColor: color === 'gold' ? '#fbbf24' : color === 'silver' ? '#9ca3af' : color
                      } : {}}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAdoptModal(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdopt}
                  disabled={!customName.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-all"
                >
                  {snake ? 'Save Changes' : 'Adopt Snake'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breeding Modal */}
      <AnimatePresence>
        {showBreeding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
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
              
              {snake.bond_level < 60 || snake.loyalty < 60 ? (
                <div className="bg-red-900/40 border border-red-500/50 rounded-lg p-4 mb-4">
                  <p className="text-red-200">Your snake needs 60+ bond and loyalty to breed safely</p>
                </div>
              ) : !snake.breeding_ready ? (
                <div className="bg-yellow-900/40 border border-yellow-500/50 rounded-lg p-4 mb-4">
                  <p className="text-yellow-200">Your snake is not ready to breed yet</p>
                  <button
                    onClick={async () => {
                      await base44.entities.SnakeFamiliar.update(snake.id, { breeding_ready: true });
                      queryClient.invalidateQueries();
                    }}
                    className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg"
                  >
                    Mark as Ready
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-gray-400 mb-4">Select a mate for {snake.custom_name}</p>
                  
                  {/* Your Snake Info */}
                  <div className="bg-gradient-to-br from-pink-900/40 to-purple-900/40 border border-pink-500/30 rounded-lg p-4 mb-4">
                    <p className="text-pink-300 text-sm mb-2">Your Snake:</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-bold">{snake.custom_name}</p>
                        <p className="text-gray-300 text-sm">
                          {snake.gender === 'male' ? '♂️' : '♀️'} {snake.type} • {snake.pattern} • {snake.eye_color} eyes
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Bond: {snake.bond_level}</p>
                        <p className="text-sm text-gray-400">Power: {snake.power_level}</p>
                      </div>
                    </div>
                  </div>

                  {/* Available Mates */}
                  <div className="space-y-3">
                    {allSnakes
                      .filter(s => s.id !== snake.id && s.breeding_ready && s.bond_level >= 60 && s.loyalty >= 60)
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
                              {mate.personality_traits && mate.personality_traits.length > 0 && (
                                <p className="text-purple-300 text-xs mt-1">
                                  Traits: {mate.personality_traits.join(', ')}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-400">Bond: {mate.bond_level}</p>
                              <p className="text-sm text-gray-400">Power: {mate.power_level}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    
                    {allSnakes.filter(s => s.id !== snake.id && s.breeding_ready && s.bond_level >= 60 && s.loyalty >= 60).length === 0 && (
                      <div className="bg-gray-800/40 border border-gray-600/30 rounded-lg p-4">
                        <p className="text-gray-400 text-center">No suitable mates available. Snakes need 60+ bond, loyalty, and must be marked as breeding ready.</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-900/40 border border-blue-500/30 rounded-lg p-4 mt-4">
                    <p className="text-blue-200 text-sm">
                      <strong>Breeding Info:</strong> Offspring will inherit traits from both parents including type, pattern, eye color, and personality. Stats will be averaged with some variation.
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

      {/* Naming Modal */}
      <AnimatePresence>
        {showNaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-white text-xl font-bold mb-4">Name Your Snake</h3>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && customName.trim()) {
                    base44.entities.SnakeFamiliar.update(snake.id, { custom_name: customName.trim() });
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
                    if (customName.trim()) {
                      base44.entities.SnakeFamiliar.update(snake.id, { custom_name: customName.trim() });
                      queryClient.invalidateQueries();
                      setShowNaming(false);
                      setCustomName('');
                    }
                  }}
                  disabled={!customName.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white py-2 rounded-lg"
                >
                  Confirm
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}