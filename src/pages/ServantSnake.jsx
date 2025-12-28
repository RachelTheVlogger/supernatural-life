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
  const [showCareAssistant, setShowCareAssistant] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showSocial, setShowSocial] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [communityTrends, setCommunityTrends] = useState(null);

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

  // Check for urgent care needs
  React.useEffect(() => {
    if (!snake) return;
    
    const urgentNeeds = [];
    if ((snake.hunger || 30) > 80) urgentNeeds.push('🍖 Snake is very hungry!');
    if ((snake.health || 100) < 30) urgentNeeds.push('🩹 Snake health is critical!');
    if ((snake.happiness || 50) < 20) urgentNeeds.push('😢 Snake is very unhappy!');
    
    setNotifications(urgentNeeds);
  }, [snake]);

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

  const handleCareAction = async (action) => {
    setInteracting(action);

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
        setInteracting(null);
        setOutcome('');
      }, 4500);
    }, 2000);
  };

  const getAISuggestions = async () => {
    setLoadingAI(true);
    setShowCareAssistant(true);

    try {
      const snakeInfo = `Snake: ${snake.custom_name}
Type: ${snake.type}
Gender: ${snake.gender}
Mood: ${snake.mood}
Hunger: ${snake.hunger || 30}%
Happiness: ${snake.happiness || 50}%
Health: ${snake.health || 100}%
Bond Level: ${snake.bond_level}%
Power Level: ${snake.power_level}%
Size: ${snake.size}
Age: ${snake.age_days || 0} days
Personality Traits: ${(snake.personality_traits || []).join(', ') || 'None yet'}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert snake care AI assistant for magical vampire snake familiars. Based on this snake's current status, provide detailed personalized care recommendations:

${snakeInfo}

Provide recommendations in this exact JSON format:
{
  "feeding": {
    "timing": "string - when to feed",
    "type": "string - what to feed",
    "notes": "string - additional feeding tips"
  },
  "cleaning": {
    "schedule": "string - cleaning schedule",
    "priority": "string - low/medium/high/urgent",
    "tips": "string - cleaning tips"
  },
  "enrichment": {
    "activities": ["string array - 3 specific activities for this snake"],
    "frequency": "string - how often"
  },
  "health": {
    "concerns": "string - any health concerns",
    "recommendations": "string - health recommendations"
  },
  "mood": {
    "analysis": "string - mood analysis",
    "tips": "string - how to improve mood"
  }
}`,
        response_json_schema: {
          type: 'object',
          properties: {
            feeding: {
              type: 'object',
              properties: {
                timing: { type: 'string' },
                type: { type: 'string' },
                notes: { type: 'string' }
              }
            },
            cleaning: {
              type: 'object',
              properties: {
                schedule: { type: 'string' },
                priority: { type: 'string' },
                tips: { type: 'string' }
              }
            },
            enrichment: {
              type: 'object',
              properties: {
                activities: { type: 'array', items: { type: 'string' } },
                frequency: { type: 'string' }
              }
            },
            health: {
              type: 'object',
              properties: {
                concerns: { type: 'string' },
                recommendations: { type: 'string' }
              }
            },
            mood: {
              type: 'object',
              properties: {
                analysis: { type: 'string' },
                tips: { type: 'string' }
              }
            }
          }
        }
      });

      setAiSuggestions(result);
    } catch (e) {
      console.error('AI suggestions failed:', e);
      setOutcome('AI assistant temporarily unavailable');
      setTimeout(() => setOutcome(''), 2000);
    }

    setLoadingAI(false);
  };

  const handleSocialAction = async (action, targetSnake) => {
    setInteracting(action);

    setTimeout(async () => {
      let message = '';
      let rewardBond = 0;
      let rewardPower = 0;

      switch (action) {
        case 'visit':
          message = `${snake.custom_name} visited ${targetSnake.custom_name}. They circled each other curiously. New friendship forming.`;
          rewardBond = 3;
          break;
        case 'playdate':
          message = `Playdate! ${snake.custom_name} and ${targetSnake.custom_name} played together. Chasing tails. Mock battles. Fun bonding time.`;
          rewardBond = 8;
          rewardPower = 4;
          break;
        case 'duel':
          const winner = Math.random() > 0.5 ? snake.custom_name : targetSnake.custom_name;
          message = `Friendly duel! ${snake.custom_name} vs ${targetSnake.custom_name}. ${winner} won! Both learned valuable combat skills.`;
          rewardPower = 10;
          rewardBond = 5;
          break;
        case 'like':
          message = `You left appreciation for ${targetSnake.custom_name}. The owner will be pleased.`;
          break;
      }

      if (rewardBond || rewardPower) {
        await base44.entities.SnakeFamiliar.update(snake.id, {
          bond_level: Math.min(100, snake.bond_level + rewardBond),
          power_level: Math.min(100, snake.power_level + rewardPower)
        });
      }

      await base44.entities.NightLog.create({
        entry: message,
        category: 'interaction',
        intensity: 'moderate'
      });

      setOutcome(message);
      queryClient.invalidateQueries();

      setTimeout(() => {
        setInteracting(null);
        setOutcome('');
      }, 4000);
    }, 2000);
  };

  const getCommunityTrends = async () => {
    setLoadingAI(true);

    try {
      const topSnakes = allSnakes.slice(0, 10);
      const avgPower = allSnakes.reduce((sum, s) => sum + (s.power_level || 0), 0) / allSnakes.length;
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are analyzing snake familiar training trends across the vampire community. Based on this data, provide insights:

Total Snakes: ${allSnakes.length}
Average Power Level: ${avgPower.toFixed(1)}
Top Snake Types: ${topSnakes.map(s => s.type).join(', ')}
Popular Patterns: ${topSnakes.map(s => s.pattern).join(', ')}

Provide analysis in this JSON format:
{
  "popular_training": "string - most effective training methods being used",
  "type_meta": "string - which snake types are performing best and why",
  "optimal_strategy": "string - recommended strategy for new snake owners",
  "power_tips": ["string array - 3 specific tips to increase power level"],
  "community_insights": "string - interesting trends or patterns in the data"
}`,
        response_json_schema: {
          type: 'object',
          properties: {
            popular_training: { type: 'string' },
            type_meta: { type: 'string' },
            optimal_strategy: { type: 'string' },
            power_tips: { type: 'array', items: { type: 'string' } },
            community_insights: { type: 'string' }
          }
        }
      });

      setCommunityTrends(result);
      setShowSocial(true);
    } catch (e) {
      console.error('Community trends failed:', e);
    }

    setLoadingAI(false);
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

    // Mix parent traits
    const inheritType = Math.random() > 0.5 ? snake.type : mate.type;
    const inheritPattern = Math.random() > 0.5 ? snake.pattern : mate.pattern;
    const inheritEyeColor = Math.random() > 0.5 ? snake.eye_color : mate.eye_color;
    const inheritGender = Math.random() > 0.5 ? 'male' : 'female';
    
    // Combine personality traits
    const combinedTraits = [...new Set([...(snake.personality_traits || []), ...(mate.personality_traits || [])])];
    const inheritedTraits = combinedTraits.slice(0, 2);
    
    // Average stats with some randomness
    const avgPower = Math.floor((snake.power_level + mate.power_level) / 2) + Math.floor(Math.random() * 20 - 10);
    const avgBond = Math.floor((snake.bond_level + mate.bond_level) / 2);
    
    // Generate cute baby name
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

    // Mark parents as not ready to breed again
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
    setSelectedMate(null);
    setOutcome(`🐍 ${babyEmoji} A baby snake! ${offspringName} hatched - ${inheritGender} ${inheritType} with ${inheritPattern} scales and ${inheritEyeColor} eyes! Looks just like the parents! SO CUTE!`);
    
    setTimeout(() => setOutcome(''), 6000);
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
        consume: `${snake.custom_name} feeds on their nightmares. Growing stronger from their terror.`
      };

      const result = outcomes[ability.id] || `${snake.custom_name} used ${ability.name}!`;

      if (!(snake.unlocked_abilities || []).includes(ability.name)) {
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
            <h1 className="text-3xl font-bold text-white mb-2">{snake.custom_name}</h1>
            <p className="text-gray-400 capitalize">{SNAKE_TYPES.find(s => s.type === snake.type)?.name}</p>
            <p className="text-sm capitalize" style={{
              background: getPatternColor(snake.pattern, getSnakeBaseColor(snake.type)),
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold'
            }}>
              {snake.eye_color} {snake.pattern.replace('_', ' ')} pattern
            </p>
            
            {/* Urgent Care Notifications */}
            {notifications.length > 0 && (
              <div className="mt-3 space-y-2">
                {notifications.map((notif, i) => (
                  <div key={i} className="bg-red-900/60 border-2 border-red-500 rounded-lg p-2 text-red-100 text-sm font-medium animate-pulse">
                    {notif}
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-2 mt-3 flex-wrap">
              {snakes.length < 5 && (
                <button
                  onClick={() => navigate(createPageUrl(`ServantSnake?id=${servantId}`))}
                  className="px-4 py-2 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white transition-all text-sm"
                >
                  + Adopt Another Snake
                </button>
              )}
              <button
                onClick={() => setCarrying(!carrying)}
                className={`flex-1 px-6 py-2 rounded-lg font-medium transition-all ${
                  carrying 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                {carrying ? '🐍 Carrying with you' : 'Leave snake here'}
              </button>
              <button
                onClick={() => {
                  setCustomName(snake.custom_name);
                  setSelectedGender(snake.gender);
                  setSelectedPattern(snake.pattern);
                  setSelectedEyeColor(snake.eye_color);
                  setShowAdoptModal(true);
                }}
                className="px-6 py-2 rounded-lg font-medium bg-purple-600 hover:bg-purple-700 text-white transition-all"
              >
                ✏️ Customize
              </button>
              <button
                onClick={() => setShowBreeding(true)}
                className="px-4 py-2 rounded-lg font-medium bg-pink-600 hover:bg-pink-700 text-white transition-all text-sm"
              >
                💕 Breed
              </button>
              <button
                onClick={getAISuggestions}
                className="px-4 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all text-sm"
              >
                🤖 AI Care
              </button>
              <button
                onClick={() => setShowSocial(true)}
                className="px-4 py-2 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-all text-sm"
              >
                👥 Social
              </button>
              <button
                onClick={() => setShowLeaderboard(true)}
                className="px-4 py-2 rounded-lg font-medium bg-yellow-600 hover:bg-yellow-700 text-white transition-all text-sm"
              >
                🏆 Leaderboard
              </button>
            </div>
            {carrying && (
              <p className="text-green-400 text-xs mt-2">Your snake is coiled around your arm, ready to assist</p>
            )}
          </motion.div>

          {/* Care Stats */}
          <div className="bg-black/40 rounded-xl p-4 mb-6 border border-gray-700">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              🩺 Care Status
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-gray-400 text-xs mb-1">Hunger</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div style={{ width: `${snake.hunger || 30}%` }} className={`h-2 rounded-full ${(snake.hunger || 30) > 70 ? 'bg-red-500' : (snake.hunger || 30) > 40 ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  </div>
                  <span className="text-white text-xs">{snake.hunger || 30}%</span>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Happiness</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div style={{ width: `${snake.happiness || 50}%` }} className={`h-2 rounded-full ${(snake.happiness || 50) < 30 ? 'bg-red-500' : (snake.happiness || 50) < 60 ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  </div>
                  <span className="text-white text-xs">{snake.happiness || 50}%</span>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Health</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div style={{ width: `${snake.health || 100}%` }} className={`h-2 rounded-full ${(snake.health || 100) < 40 ? 'bg-red-500' : (snake.health || 100) < 70 ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  </div>
                  <span className="text-white text-xs">{snake.health || 100}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Snake Display */}
          <div className={`rounded-xl p-6 mb-6 border-2 relative overflow-hidden`} style={{
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
            {/* Animated overlay for iridescent */}
            {snake.pattern === 'iridescent' && (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 animate-pulse" />
            )}

            {/* Background Scene */}
            <div className="absolute top-2 right-2 text-4xl opacity-30">
              {snake.favorite_spot === 'rock' && '🪨'}
              {snake.favorite_spot === 'water_bowl' && '💧'}
              {snake.favorite_spot === 'heated_stone' && '🔥'}
              {snake.favorite_spot === 'nest' && '🌿'}
              {snake.favorite_spot === 'perch' && '🌙'}
            </div>

            <div className="relative z-10">
              {/* Snake Visualization with Size */}
              <div className="text-center mb-4">
                <div className="relative inline-block">
                  {/* Eye Glow Effect */}
                  <div 
                    className="absolute inset-0 blur-xl opacity-60"
                    style={{
                      background: `radial-gradient(circle, ${snake.eye_color} 0%, transparent 70%)`,
                      filter: 'blur(20px)'
                    }}
                  />
                  
                  {/* Size-based display */}
                  <div className="relative">
                    
                    {snake.size === 'small' && (
                      <div className="text-6xl relative z-10">
                        {EVOLUTION_PATHS[snake.type][getEvolutionStage(snake.power_level) - 1].emoji}
                      </div>
                    )}
                    {snake.size === 'medium' && (
                      <div className="text-8xl relative z-10">
                        {EVOLUTION_PATHS[snake.type][getEvolutionStage(snake.power_level) - 1].emoji}
                      </div>
                    )}
                    {snake.size === 'large' && (
                      <div className="flex items-center gap-2 relative z-10">
                        <div className="text-9xl">
                          {EVOLUTION_PATHS[snake.type][getEvolutionStage(snake.power_level) - 1].emoji}
                        </div>
                        <div className="text-4xl opacity-70">
                          {EVOLUTION_PATHS[snake.type][getEvolutionStage(snake.power_level) - 1].emoji}
                        </div>
                      </div>
                    )}
                    {snake.size === 'massive' && (
                      <div className="text-[10rem] leading-none relative z-10">
                        {EVOLUTION_PATHS[snake.type][getEvolutionStage(snake.power_level) - 1].emoji}
                      </div>
                    )}
                  </div>



                  {/* Accessories */}
                  {snake.accessories && snake.accessories.length > 0 && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-1">
                      {snake.accessories.includes('crown') && <span className="text-xl">👑</span>}
                      {snake.accessories.includes('collar') && <span className="text-xl">📿</span>}
                      {snake.accessories.includes('jewelry') && <span className="text-xl">💎</span>}
                    </div>
                  )}

                  {/* Battle Scars */}
                  {snake.scars && snake.scars.length > 0 && (
                    <div className="absolute -bottom-2 -left-2 flex gap-1">
                      {snake.scars.slice(0, 3).map((scar, i) => (
                        <span key={i} className="text-sm">⚔️</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Position State */}
                <div className="mt-2 text-sm text-gray-300">
                  {snake.position === 'coiled' && '🔵 Coiled (Defensive)'}
                  {snake.position === 'stretched' && '🟢 Stretched (Alert)'}
                  {snake.position === 'wrapped' && '🟡 Wrapped Around Arm'}
                  {snake.position === 'hiding' && '🟣 Hiding'}
                  {snake.position === 'sleeping' && '⚫ Sleeping'}
                </div>

                {/* Mood Indicator - separate from face */}
                <div className="mt-3 flex items-center justify-center gap-2 text-lg">
                  <span className="text-gray-400 text-xs">Mood:</span>
                  {snake.mood === 'content' && <span>😊💫</span>}
                  {snake.mood === 'playful' && <span>😄✨</span>}
                  {snake.mood === 'aggressive' && <span>😠💢</span>}
                  {snake.mood === 'sleepy' && <span>😴💤</span>}
                  {snake.mood === 'affectionate' && <span>🥰💕</span>}
                  {snake.mood === 'curious' && <span>🤔💭</span>}
                  <span className="text-gray-300 text-xs capitalize">({snake.mood})</span>
                </div>
              </div>

              {/* Visual Traits */}
              <div className="bg-black/30 rounded-lg p-3 mb-4 border border-green-500/20">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-gray-400 text-xs">Gender</p>
                    <p className="text-white font-bold">{snake.gender === 'male' ? '♂️' : '♀️'} {snake.gender}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Pattern</p>
                    <p className="text-white font-bold capitalize flex items-center justify-center gap-1">
                      {snake.pattern === 'striped' && '━'}
                      {snake.pattern === 'spotted' && '•'}
                      {snake.pattern === 'iridescent' && '✨'}
                      {snake.pattern === 'scales_of_night' && '🌑'}
                      {snake.pattern.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Eyes</p>
                    <p className="text-white font-bold capitalize flex items-center justify-center gap-1">
                      <span style={{ color: snake.eye_color }}>●</span>
                      {snake.eye_color}
                    </p>
                  </div>
                </div>
                {snake.parent_ids && snake.parent_ids.length > 0 && (
                  <p className="text-purple-300 text-xs mt-2 text-center">
                    🧬 Offspring of breeding pair
                  </p>
                )}
              </div>
            
            <div className="mb-4">
              <p className="text-gray-400 text-xs mb-1">Evolution Stage {getEvolutionStage(snake.power_level)}/3</p>
              <p className="text-white text-lg font-bold">
                {EVOLUTION_PATHS[snake.type][getEvolutionStage(snake.power_level) - 1].name}
              </p>
              {getEvolutionStage(snake.power_level) < 3 && (
                <div className="mt-2">
                  <p className="text-purple-300 text-xs mb-1">Next: {EVOLUTION_PATHS[snake.type][getEvolutionStage(snake.power_level)].name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{EVOLUTION_PATHS[snake.type][getEvolutionStage(snake.power_level) - 1].emoji}</span>
                    <span className="text-white">→</span>
                    <span className="text-3xl">{EVOLUTION_PATHS[snake.type][getEvolutionStage(snake.power_level)].emoji}</span>
                    <span className="text-gray-400 text-xs">at {getEvolutionStage(snake.power_level) === 1 ? '40' : '70'} power</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-400 text-xs">Bond</p>
                <p className="text-white text-xl font-bold">{snake.bond_level}%</p>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-1 overflow-hidden">
                  <div style={{ width: `${snake.bond_level}%` }} className="h-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full shadow-lg shadow-pink-500/50" />
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Power</p>
                <p className="text-white text-xl font-bold">{snake.power_level}%</p>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-1 overflow-hidden">
                  <div style={{ width: `${snake.power_level}%` }} className="h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-lg shadow-purple-500/50" />
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Loyalty</p>
                <p className="text-white text-xl font-bold">{snake.loyalty}%</p>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-1 overflow-hidden">
                  <div style={{ width: `${snake.loyalty}%` }} className="h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg shadow-green-500/50" />
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Missions</p>
                <p className="text-white text-xl font-bold flex items-center gap-1">
                  {snake.missions_completed} {snake.missions_completed >= 10 && '🏆'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Happiness</p>
                <p className="text-white text-xl font-bold flex items-center gap-1">
                  {snake.happiness || 50}% {(snake.happiness || 50) >= 80 && '😊'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Health</p>
                <p className="text-white text-xl font-bold flex items-center gap-1">
                  {snake.health || 100}% {(snake.health || 100) < 50 && '🩹'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div className="bg-gray-800 rounded-lg p-2">
                <p className="text-gray-400 text-xs">Mood</p>
                <p className="text-white capitalize text-sm">{snake.mood || 'content'}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-2">
                <p className="text-gray-400 text-xs">Breeding Ready</p>
                <p className={`font-bold text-sm ${snake.breeding_ready ? 'text-green-400' : 'text-gray-400'}`}>
                  {snake.breeding_ready ? '✓ Yes' : '✗ No'}
                </p>
              </div>
            </div>
              <div className="bg-gray-800 rounded-lg p-3 mb-3">
                <p className="text-gray-400 text-xs mb-1">Size</p>
                <p className="text-white capitalize">{snake.size}</p>
              </div>

              {/* Abilities Section */}
              <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-lg p-4">
                <h3 className="text-purple-200 font-bold mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Unlocked Abilities
                </h3>
                <div className="space-y-2">
                  {(snake.unlocked_abilities || EVOLUTION_PATHS[snake.type][0].abilities).map((ability, i) => (
                    <div key={i} className="bg-black/30 rounded-lg p-2 border border-purple-500/20">
                      <p className="text-purple-100 text-sm font-medium">✨ {ability}</p>
                    </div>
                  ))}
                </div>
                {getEvolutionStage(snake.power_level) < 3 && (
                  <p className="text-purple-300 text-xs mt-3">
                    Next evolution at {getEvolutionStage(snake.power_level) === 1 ? '40' : '70'} power
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Care Actions */}
          <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-2 border-blue-500/50 rounded-xl p-4 mb-6">
            <h3 className="text-blue-200 font-bold mb-3">🩺 Daily Care</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleCareAction('feed_meal')}
                disabled={interacting === 'feed_meal' || (snake.hunger || 30) < 20}
                className={`border border-orange-500/30 rounded-lg p-3 text-white text-sm font-medium transition-all ${
                  interacting === 'feed_meal' ? 'bg-orange-600 scale-95' : 'bg-orange-900/60 hover:bg-orange-900/80'
                } disabled:opacity-50`}
              >
                🍖 Feed Meal
              </button>
              <button
                onClick={() => handleCareAction('give_water')}
                disabled={interacting === 'give_water'}
                className={`border border-blue-500/30 rounded-lg p-3 text-white text-sm font-medium transition-all ${
                  interacting === 'give_water' ? 'bg-blue-600 scale-95' : 'bg-blue-900/60 hover:bg-blue-900/80'
                } disabled:opacity-50`}
              >
                💧 Fresh Water
              </button>
              <button
                onClick={() => handleCareAction('clean_enclosure')}
                disabled={interacting === 'clean_enclosure'}
                className={`border border-green-500/30 rounded-lg p-3 text-white text-sm font-medium transition-all ${
                  interacting === 'clean_enclosure' ? 'bg-green-600 scale-95' : 'bg-green-900/60 hover:bg-green-900/80'
                } disabled:opacity-50`}
              >
                🧹 Clean
              </button>
              <button
                onClick={() => handleCareAction('health_check')}
                disabled={interacting === 'health_check'}
                className={`border border-purple-500/30 rounded-lg p-3 text-white text-sm font-medium transition-all ${
                  interacting === 'health_check' ? 'bg-purple-600 scale-95' : 'bg-purple-900/60 hover:bg-purple-900/80'
                } disabled:opacity-50`}
              >
                🩺 Health Check
              </button>
              <button
                onClick={() => handleCareAction('enrichment')}
                disabled={interacting === 'enrichment'}
                className={`border border-pink-500/30 rounded-lg p-3 text-white text-sm font-medium transition-all col-span-2 ${
                  interacting === 'enrichment' ? 'bg-pink-600 scale-95' : 'bg-pink-900/60 hover:bg-pink-900/80'
                } disabled:opacity-50`}
              >
                🎾 Enrichment Activity
              </button>
            </div>
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
                <h3 className="text-white font-bold mb-3">Special Abilities</h3>
                {SNAKE_ABILITIES[snake.type].map(ability => {
                  const unlocked = snake.bond_level >= ability.reqBond;
                  const alreadyUnlocked = (snake.unlocked_abilities || []).includes(ability.name);

                  return (
                    <button
                      key={ability.id}
                      onClick={() => unlocked && handleUseAbility(ability)}
                      disabled={!unlocked}
                      className={`w-full rounded-lg p-3 text-left transition-colors mb-2 ${
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
                          {alreadyUnlocked && <span className="text-green-400 text-xs">✓ Unlocked</span>}
                          {!unlocked && <span className="text-gray-500 text-xs">Bond {ability.reqBond}</span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
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

      {/* AI Care Assistant Modal */}
      <AnimatePresence>
        {showCareAssistant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
            onClick={() => setShowCareAssistant(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto border-2 border-blue-500/50"
            >
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                🤖 AI Care Assistant
              </h2>

              {loadingAI ? (
                <div className="text-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="text-6xl mb-4"
                  >
                    🤖
                  </motion.div>
                  <p className="text-blue-400">Analyzing {snake.custom_name}'s needs...</p>
                </div>
              ) : aiSuggestions ? (
                <div className="space-y-4">
                  {/* Feeding */}
                  <div className="bg-orange-900/40 border border-orange-500/30 rounded-lg p-4">
                    <h3 className="text-orange-200 font-bold mb-2 flex items-center gap-2">
                      🍖 Feeding Recommendations
                    </h3>
                    <p className="text-gray-300 text-sm mb-2"><strong>Timing:</strong> {aiSuggestions.feeding.timing}</p>
                    <p className="text-gray-300 text-sm mb-2"><strong>Type:</strong> {aiSuggestions.feeding.type}</p>
                    <p className="text-gray-400 text-xs">{aiSuggestions.feeding.notes}</p>
                  </div>

                  {/* Cleaning */}
                  <div className="bg-green-900/40 border border-green-500/30 rounded-lg p-4">
                    <h3 className="text-green-200 font-bold mb-2 flex items-center gap-2">
                      🧹 Cleaning Schedule
                    </h3>
                    <p className="text-gray-300 text-sm mb-2"><strong>Schedule:</strong> {aiSuggestions.cleaning.schedule}</p>
                    <p className="text-gray-300 text-sm mb-2">
                      <strong>Priority:</strong> 
                      <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${
                        aiSuggestions.cleaning.priority === 'urgent' ? 'bg-red-600' :
                        aiSuggestions.cleaning.priority === 'high' ? 'bg-orange-600' :
                        aiSuggestions.cleaning.priority === 'medium' ? 'bg-yellow-600' :
                        'bg-blue-600'
                      }`}>
                        {aiSuggestions.cleaning.priority}
                      </span>
                    </p>
                    <p className="text-gray-400 text-xs">{aiSuggestions.cleaning.tips}</p>
                  </div>

                  {/* Enrichment */}
                  <div className="bg-purple-900/40 border border-purple-500/30 rounded-lg p-4">
                    <h3 className="text-purple-200 font-bold mb-2 flex items-center gap-2">
                      🎾 Enrichment Activities
                    </h3>
                    <p className="text-gray-300 text-sm mb-2"><strong>Frequency:</strong> {aiSuggestions.enrichment.frequency}</p>
                    <ul className="space-y-1">
                      {aiSuggestions.enrichment.activities.map((activity, i) => (
                        <li key={i} className="text-gray-300 text-sm">• {activity}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Health */}
                  <div className="bg-red-900/40 border border-red-500/30 rounded-lg p-4">
                    <h3 className="text-red-200 font-bold mb-2 flex items-center gap-2">
                      🩺 Health Analysis
                    </h3>
                    <p className="text-gray-300 text-sm mb-2"><strong>Concerns:</strong> {aiSuggestions.health.concerns}</p>
                    <p className="text-gray-400 text-xs">{aiSuggestions.health.recommendations}</p>
                  </div>

                  {/* Mood */}
                  <div className="bg-pink-900/40 border border-pink-500/30 rounded-lg p-4">
                    <h3 className="text-pink-200 font-bold mb-2 flex items-center gap-2">
                      😊 Mood & Wellbeing
                    </h3>
                    <p className="text-gray-300 text-sm mb-2"><strong>Analysis:</strong> {aiSuggestions.mood.analysis}</p>
                    <p className="text-gray-400 text-xs">{aiSuggestions.mood.tips}</p>
                  </div>
                </div>
              ) : null}

              <button
                onClick={() => setShowCareAssistant(false)}
                className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Social Features Modal */}
      <AnimatePresence>
        {showSocial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
            onClick={() => setShowSocial(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto border-2 border-indigo-500/50"
            >
              <h2 className="text-2xl font-bold text-white mb-4">👥 Snake Community</h2>

              {/* Community Trends Button */}
              <button
                onClick={getCommunityTrends}
                disabled={loadingAI}
                className="w-full mb-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium"
              >
                {loadingAI ? '🤖 Analyzing...' : '🤖 Get Community Trends & Training Tips'}
              </button>

              {communityTrends && (
                <div className="bg-purple-900/40 border border-purple-500/30 rounded-lg p-4 mb-4">
                  <h3 className="text-purple-200 font-bold mb-3">📊 Community Analysis</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-purple-300 font-medium mb-1">Popular Training Methods:</p>
                      <p className="text-gray-300">{communityTrends.popular_training}</p>
                    </div>
                    <div>
                      <p className="text-purple-300 font-medium mb-1">Type Meta:</p>
                      <p className="text-gray-300">{communityTrends.type_meta}</p>
                    </div>
                    <div>
                      <p className="text-purple-300 font-medium mb-1">Optimal Strategy:</p>
                      <p className="text-gray-300">{communityTrends.optimal_strategy}</p>
                    </div>
                    <div>
                      <p className="text-purple-300 font-medium mb-1">Power Tips:</p>
                      <ul className="space-y-1">
                        {communityTrends.power_tips.map((tip, i) => (
                          <li key={i} className="text-gray-300">• {tip}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-purple-300 font-medium mb-1">Community Insights:</p>
                      <p className="text-gray-300">{communityTrends.community_insights}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Snakes */}
              <h3 className="text-white font-bold mb-3">Other Snakes</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {allSnakes.filter(s => s.id !== snake.id).map(otherSnake => (
                  <div key={otherSnake.id} className="bg-gray-800/60 border border-indigo-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-white font-bold">{otherSnake.custom_name}</p>
                        <p className="text-gray-400 text-sm capitalize">
                          {otherSnake.gender === 'male' ? '♂️' : '♀️'} {otherSnake.type} • {otherSnake.pattern}
                        </p>
                        <p className="text-purple-300 text-xs">Power: {otherSnake.power_level}</p>
                      </div>
                      <div className="text-4xl">
                        {EVOLUTION_PATHS[otherSnake.type][getEvolutionStage(otherSnake.power_level) - 1].emoji}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSocialAction('visit', otherSnake)}
                        disabled={!!interacting}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm"
                      >
                        👋 Visit
                      </button>
                      <button
                        onClick={() => handleSocialAction('playdate', otherSnake)}
                        disabled={!!interacting}
                        className="flex-1 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm"
                      >
                        🎾 Playdate
                      </button>
                      <button
                        onClick={() => handleSocialAction('duel', otherSnake)}
                        disabled={!!interacting}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm"
                      >
                        ⚔️ Duel
                      </button>
                      <button
                        onClick={() => handleSocialAction('like', otherSnake)}
                        disabled={!!interacting}
                        className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm"
                      >
                        ❤️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setShowSocial(false);
                  setCommunityTrends(null);
                }}
                className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leaderboard Modal */}
      <AnimatePresence>
        {showLeaderboard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
            onClick={() => setShowLeaderboard(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto border-2 border-yellow-500/50"
            >
              <h2 className="text-2xl font-bold text-white mb-4">🏆 Snake Leaderboard</h2>

              {/* Top Snakes by Power */}
              <div className="space-y-3">
                {allSnakes
                  .sort((a, b) => (b.power_level || 0) - (a.power_level || 0))
                  .slice(0, 10)
                  .map((topSnake, index) => (
                    <div 
                      key={topSnake.id} 
                      className={`rounded-lg p-4 border-2 ${
                        topSnake.id === snake.id ? 'bg-yellow-900/60 border-yellow-500' : 'bg-gray-800/60 border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-3xl font-bold" style={{
                          color: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#6b7280'
                        }}>
                          #{index + 1}
                        </div>
                        <div className="text-4xl">
                          {EVOLUTION_PATHS[topSnake.type][getEvolutionStage(topSnake.power_level) - 1].emoji}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-bold flex items-center gap-2">
                            {topSnake.custom_name}
                            {topSnake.id === snake.id && <span className="text-yellow-400 text-sm">(You!)</span>}
                          </p>
                          <p className="text-gray-400 text-sm capitalize">{topSnake.type} • {topSnake.size}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-yellow-400 font-bold text-xl">{topSnake.power_level}</p>
                          <p className="text-gray-400 text-xs">Power</p>
                        </div>
                      </div>
                      <div className="mt-2 flex gap-4 text-xs text-gray-400">
                        <span>Bond: {topSnake.bond_level}</span>
                        <span>Missions: {topSnake.missions_completed}</span>
                        <span>Stage: {getEvolutionStage(topSnake.power_level)}/3</span>
                      </div>
                    </div>
                  ))}
              </div>

              <button
                onClick={() => setShowLeaderboard(false)}
                className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}