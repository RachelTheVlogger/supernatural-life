import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Heart, Eye, Skull, Wind, Droplets, Moon, Flame, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function VampireSnakeFamiliar({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [outcome, setOutcome] = useState('');
  const [interacting, setInteracting] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [showNaming, setShowNaming] = useState(false);
  const [snakeName, setSnakeName] = useState('');

  const { data: snakes = [] } = useQuery({
    queryKey: ['snakeFamiliars'],
    queryFn: async () => {
      try {
        return await base44.entities.SnakeFamiliar.list();
      } catch (e) {
        return [];
      }
    }
  });

  const mySnake = snakes.find(s => s.vampire_id === vampireState.id);

  const snakeTypes = [
    { id: 'shadow', name: 'Shadow Serpent', power: 'Invisibility & Spying', icon: '🐍', color: 'from-gray-900 to-black' },
    { id: 'venom', name: 'Venom Viper', power: 'Paralytic Bite & Poison', icon: '🐍', color: 'from-green-900 to-emerald-900' },
    { id: 'blood', name: 'Blood Python', power: 'Blood Tracking & Sensing', icon: '🐍', color: 'from-red-900 to-rose-900' },
    { id: 'nightmare', name: 'Nightmare Cobra', power: 'Fear & Mind Games', icon: '🐍', color: 'from-purple-900 to-violet-900' }
  ];

  const getAbilities = () => {
    if (!mySnake) return [];
    
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

    return baseAbilities[mySnake.type] || [];
  };

  const handleGetSnake = async (type) => {
    const snake = snakeTypes.find(s => s.id === type);
    setSnakeName(snake.name);
    setShowNaming(true);
  };

  const handleConfirmSnake = async (type) => {
    setInteracting(true);
    setShowNaming(false);

    try {
      await base44.entities.SnakeFamiliar.create({
        vampire_id: vampireState.id,
        custom_name: snakeName,
        type: type,
        bond_level: 10,
        power_level: 20,
        loyalty: 50,
        hunger: 30,
        missions_completed: 0,
        size: 'small',
        unlocked_abilities: []
      });

      await base44.entities.NightLog.create({
        entry: `${snakeName} slithered from the shadows. Your familiar. Your spy. Your weapon.`,
        category: 'power',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();
      setOutcome(`${snakeName} is now yours. Feed it blood. Train it. Use it.`);

      setTimeout(() => {
        setInteracting(false);
        setOutcome('');
      }, 3000);
    } catch (e) {
      console.error('Failed to create snake:', e);
      setInteracting(false);
    }
  };

  const handleInteraction = async (action) => {
    setInteracting(true);
    setCurrentAction(action);

    setTimeout(async () => {
      let result = '';
      let bondChange = 0;
      let powerChange = 0;
      const updates = {};

      switch (action) {
        case 'feed':
          result = `You fed ${mySnake.custom_name} vampire blood. Its eyes glow crimson. Power courses through its scales.`;
          bondChange = Math.floor(Math.random() * 8) + 5;
          powerChange = Math.floor(Math.random() * 12) + 8;
          updates.hunger = Math.max(0, (mySnake.hunger || 50) - 40);
          updates.bond_level = Math.min(100, (mySnake.bond_level || 0) + bondChange);
          updates.power_level = Math.min(100, (mySnake.power_level || 0) + powerChange);
          
          // Size growth
          if (mySnake.power_level >= 80 && mySnake.size !== 'massive') {
            updates.size = 'massive';
            result += ` ${mySnake.custom_name} grows MASSIVE. Coils thicker than your body.`;
          } else if (mySnake.power_level >= 60 && mySnake.size === 'medium') {
            updates.size = 'large';
            result += ` ${mySnake.custom_name} grows larger. More powerful.`;
          } else if (mySnake.power_level >= 30 && mySnake.size === 'small') {
            updates.size = 'medium';
            result += ` ${mySnake.custom_name} is growing. No longer small.`;
          }
          break;

        case 'train':
          result = `Training session. ${mySnake.custom_name} learns to strike faster, hide better. A perfect predator.`;
          bondChange = Math.floor(Math.random() * 5) + 3;
          powerChange = Math.floor(Math.random() * 10) + 6;
          updates.bond_level = Math.min(100, (mySnake.bond_level || 0) + bondChange);
          updates.power_level = Math.min(100, (mySnake.power_level || 0) + powerChange);
          break;

        case 'spy':
          const spyResults = [
            `${mySnake.custom_name} returns. Saw a hunter planning an ambush. You avoid the trap.`,
            `The serpent brings information. A rival vampire's weakness. Useful.`,
            `Your snake spied on the witch. She knows you're watching. She smiled.`,
            `${mySnake.custom_name} tracked a human. Found their home. Their routine. Their vulnerability.`,
            `Your familiar discovered a secret vampire meeting. Political intrigue.`,
            `${mySnake.custom_name} witnessed a supernatural ritual. Strange magic.`
          ];
          result = spyResults[Math.floor(Math.random() * spyResults.length)];
          updates.missions_completed = (mySnake.missions_completed || 0) + 1;
          break;

        case 'hunt':
          result = `${mySnake.custom_name} hunted. Brought back a paralyzed victim. Fresh blood for you.`;
          updates.missions_completed = (mySnake.missions_completed || 0) + 1;
          updates.hunger = Math.min(100, (mySnake.hunger || 30) + 25);
          await base44.entities.VampireState.update(vampireState.id, {
            hunger_state: 'sated'
          });
          break;

        case 'bond':
          result = `You and ${mySnake.custom_name} share blood. Minds linking. You feel what it feels. See what it sees. Perfect symbiosis.`;
          bondChange = Math.floor(Math.random() * 15) + 10;
          updates.bond_level = Math.min(100, (mySnake.bond_level || 0) + bondChange);
          updates.loyalty = Math.min(100, (mySnake.loyalty || 50) + 8);
          break;

        case 'cuddle':
          result = `${mySnake.custom_name} coils around you. Cool scales against your skin. Comforting. You stroke its head gently.`;
          bondChange = Math.floor(Math.random() * 8) + 6;
          updates.bond_level = Math.min(100, (mySnake.bond_level || 0) + bondChange);
          break;

        case 'talk':
          const talkResults = [
            `You speak to ${mySnake.custom_name}. It understands. Hisses softly in response. Communication beyond words.`,
            `${mySnake.custom_name} curls around your arm. You discuss your plans. It seems to agree.`,
            `Whispered secrets to your snake. It keeps them all. Loyal. Forever.`,
            `${mySnake.custom_name} tells you things. Visions. Warnings. Prophecies only serpents know.`
          ];
          result = talkResults[Math.floor(Math.random() * talkResults.length)];
          bondChange = Math.floor(Math.random() * 6) + 4;
          updates.bond_level = Math.min(100, (mySnake.bond_level || 0) + bondChange);
          break;

        case 'guard':
          result = `${mySnake.custom_name} guards your lair. Nothing enters unseen. Perfect sentinel.`;
          updates.missions_completed = (mySnake.missions_completed || 0) + 1;
          updates.loyalty = Math.min(100, (mySnake.loyalty || 50) + 5);
          break;

        case 'venom':
          result = `${mySnake.custom_name} produces venom. Potent. Deadly. You collect it in a vial. Useful.`;
          updates.missions_completed = (mySnake.missions_completed || 0) + 1;
          break;

        case 'shed':
          result = `${mySnake.custom_name} sheds its skin. Perfect scales. You collect them—magical material for rituals and crafting.`;
          updates.missions_completed = (mySnake.missions_completed || 0) + 1;
          if (mySnake.power_level >= 50) {
            result += ` The shed skin GLOWS. Powerful magic infused.`;
          }
          break;

        case 'prophecy':
          const prophecies = [
            `${mySnake.custom_name} hisses warnings. Danger approaches. A hunter is close.`,
            `Your snake sees the future. A rival vampire plots against you. Be ready.`,
            `${mySnake.custom_name}'s eyes glow. Vision: someone close will betray you soon.`,
            `Serpent prophecy: Blood will be spilled tonight. Not yours. Not if you're careful.`,
            `${mySnake.custom_name} senses opportunity. A powerful artifact nearby. Hidden.`,
            `Vision from your familiar: The witch thinks of you. Dreams of you.`
          ];
          result = prophecies[Math.floor(Math.random() * prophecies.length)];
          updates.missions_completed = (mySnake.missions_completed || 0) + 1;
          break;

        case 'steal':
          const stolenItems = [
            `${mySnake.custom_name} returns with a wallet. Cash inside. Easy money.`,
            `Your snake stole a phone. Messages reveal secrets. Blackmail material.`,
            `${mySnake.custom_name} brings you keys. Someone's home is now accessible.`,
            `Stolen: jewelry. Expensive. Your snake is a perfect thief.`,
            `${mySnake.custom_name} took someone's ID. Their identity. Their life. Yours to use.`,
            `Your familiar stole medical records. Private information. Leverage.`
          ];
          result = stolenItems[Math.floor(Math.random() * stolenItems.length)];
          updates.missions_completed = (mySnake.missions_completed || 0) + 1;
          break;

        case 'mark':
          result = `${mySnake.custom_name} marks your territory. Venom traces on boundaries. Other supernaturals know: this place is YOURS.`;
          updates.missions_completed = (mySnake.missions_completed || 0) + 1;
          updates.loyalty = Math.min(100, (mySnake.loyalty || 50) + 6);
          break;

        case 'merge':
          result = `${mySnake.custom_name} merges with you. Coils INSIDE your body. You feel its power. Its senses. Two beings, one consciousness.`;
          bondChange = Math.floor(Math.random() * 20) + 15;
          powerChange = Math.floor(Math.random() * 15) + 10;
          updates.bond_level = Math.min(100, (mySnake.bond_level || 0) + bondChange);
          updates.power_level = Math.min(100, (mySnake.power_level || 0) + powerChange);
          await base44.entities.VampireState.update(vampireState.id, {
            vampire_power_level: Math.min(100, (vampireState.vampire_power_level || 0) + 5)
          });
          break;

        case 'hibernate':
          result = `${mySnake.custom_name} enters hibernation. Deep sleep. Healing. Growing. Will awaken stronger.`;
          powerChange = Math.floor(Math.random() * 25) + 20;
          updates.power_level = Math.min(100, (mySnake.power_level || 0) + powerChange);
          updates.hunger = Math.max(0, (mySnake.hunger || 30) - 50);
          break;
      }

      await base44.entities.SnakeFamiliar.update(mySnake.id, updates);

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

  const handleUseAbility = async (ability) => {
    setInteracting(true);
    setCurrentAction('ability_' + ability.id);

    setTimeout(async () => {
      const abilityResults = {
        invisible: `${mySnake.custom_name} vanishes completely. Perfect invisibility. Spying made effortless.`,
        teleport: `${mySnake.custom_name} melts into shadows. Reappears miles away. Shadow travel mastered.`,
        duplicate: `${mySnake.custom_name} splits into THREE serpents. Shadow clones. All obey you.`,
        merge: `${mySnake.custom_name} becomes pure shadow. Formless. Impossible to detect or harm.`,
        
        paralyze: `${mySnake.custom_name} strikes! Victim frozen instantly. Helpless. Yours.`,
        hallucinate: `Venom-induced visions. The victim sees horrors. Screams. ${mySnake.custom_name} watches.`,
        control: `${mySnake.custom_name}'s venom rewrites minds. The victim obeys your every command now.`,
        acidic: `${mySnake.custom_name} spits acid. Metal melts. Stone dissolves. Nothing stops it.`,
        
        track: `${mySnake.custom_name} tastes the air. Found them. Blood scent leads straight to your target.`,
        drain: `${mySnake.custom_name} drains a victim completely. Every drop. Brings it back to you.`,
        share: `Blood link activated. ${mySnake.custom_name}'s meal flows directly into your veins. Instant feeding.`,
        resurrect: `${mySnake.custom_name} breathes blood magic into a corpse. They gasp. Alive again. Miracle.`,
        
        fear: `${mySnake.custom_name} projects pure terror. Victims flee screaming. Primal fear unleashed.`,
        dream: `${mySnake.custom_name} enters their dreams. Nightmares shaped by serpent whispers.`,
        madness: `${mySnake.custom_name}'s eyes lock onto theirs. Sanity shatters. They're broken now.`,
        consume: `${mySnake.custom_name} feeds on their nightmares. Growing stronger from their terror.`
      };

      const result = abilityResults[ability.id] || `${mySnake.custom_name} used ${ability.name}!`;

      // Add to unlocked if not already
      if (!mySnake.unlocked_abilities?.includes(ability.name)) {
        await base44.entities.SnakeFamiliar.update(mySnake.id, {
          unlocked_abilities: [...(mySnake.unlocked_abilities || []), ability.name]
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

        <h2 className="text-2xl font-bold text-white mb-2">Vampire Snake Familiar</h2>
        <p className="text-gray-400 text-sm mb-6">
          A serpent bound to you. Your spy. Your weapon. Your companion.
        </p>

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
        ) : !mySnake ? (
          <div className="space-y-3">
            <p className="text-gray-300 mb-4">Choose your serpent familiar:</p>
            {snakeTypes.map(snake => (
              <button
                key={snake.id}
                onClick={() => handleGetSnake(snake.id)}
                className={`w-full bg-gradient-to-r ${snake.color} border border-green-500/30 rounded-xl p-4 text-left hover:opacity-90 transition-opacity`}
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
        ) : (
          <div>
            {/* Snake Header */}
            <div className="bg-black/40 rounded-xl p-4 mb-4 border border-green-500/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-5xl">🐍</span>
                  <div>
                    <h3 className="text-white font-bold text-xl">{mySnake.custom_name}</h3>
                    <p className="text-gray-400 text-sm capitalize">{mySnake.type} • {mySnake.size}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNaming(true)}
                  className="text-purple-400 hover:text-purple-300 text-sm"
                >
                  Rename
                </button>
              </div>
            </div>

            {/* Snake Stats */}
            <div className="bg-black/40 rounded-xl p-4 mb-6 border border-green-500/30">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-gray-400 text-xs">Bond Level</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div style={{ width: `${mySnake.bond_level}%` }} className="h-2 bg-green-500 rounded-full" />
                    </div>
                    <span className="text-white text-xs">{mySnake.bond_level}</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Power Level</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div style={{ width: `${mySnake.power_level}%` }} className="h-2 bg-red-500 rounded-full" />
                    </div>
                    <span className="text-white text-xs">{mySnake.power_level}</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Loyalty</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div style={{ width: `${mySnake.loyalty}%` }} className="h-2 bg-purple-500 rounded-full" />
                    </div>
                    <span className="text-white text-xs">{mySnake.loyalty}</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Hunger</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div style={{ width: `${mySnake.hunger}%` }} className="h-2 bg-orange-500 rounded-full" />
                    </div>
                    <span className="text-white text-xs">{mySnake.hunger}</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-400 text-xs">Missions: {mySnake.missions_completed || 0} • Abilities: {mySnake.unlocked_abilities?.length || 0}</p>
            </div>

            {/* Basic Interactions */}
            <div className="space-y-2 mb-6">
              <h3 className="text-white font-bold mb-3">Basic Interactions</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleInteraction('feed')}
                  className="bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 rounded-lg p-3 text-center transition-colors"
                >
                  <Skull className="w-5 h-5 text-red-400 mx-auto mb-1" />
                  <p className="text-white text-xs font-medium">Feed Blood</p>
                </button>

                <button
                  onClick={() => handleInteraction('train')}
                  className="bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-lg p-3 text-center transition-colors"
                >
                  <Zap className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                  <p className="text-white text-xs font-medium">Train</p>
                </button>

                <button
                  onClick={() => handleInteraction('spy')}
                  className="bg-blue-900/40 hover:bg-blue-900/60 border border-blue-500/30 rounded-lg p-3 text-center transition-colors"
                >
                  <Eye className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                  <p className="text-white text-xs font-medium">Spy</p>
                </button>

                <button
                  onClick={() => handleInteraction('hunt')}
                  className="bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 rounded-lg p-3 text-center transition-colors"
                >
                  <Skull className="w-5 h-5 text-red-400 mx-auto mb-1" />
                  <p className="text-white text-xs font-medium">Hunt</p>
                </button>

                <button
                  onClick={() => handleInteraction('bond')}
                  className="bg-green-900/40 hover:bg-green-900/60 border border-green-500/30 rounded-lg p-3 text-center transition-colors"
                >
                  <Heart className="w-5 h-5 text-green-400 mx-auto mb-1" />
                  <p className="text-white text-xs font-medium">Bond</p>
                </button>

                <button
                  onClick={() => handleInteraction('cuddle')}
                  className="bg-pink-900/40 hover:bg-pink-900/60 border border-pink-500/30 rounded-lg p-3 text-center transition-colors"
                >
                  <Heart className="w-5 h-5 text-pink-400 mx-auto mb-1" />
                  <p className="text-white text-xs font-medium">Cuddle</p>
                </button>

                <button
                  onClick={() => handleInteraction('talk')}
                  className="bg-cyan-900/40 hover:bg-cyan-900/60 border border-cyan-500/30 rounded-lg p-3 text-center transition-colors"
                >
                  <Moon className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                  <p className="text-white text-xs font-medium">Talk</p>
                </button>

                <button
                  onClick={() => handleInteraction('guard')}
                  className="bg-indigo-900/40 hover:bg-indigo-900/60 border border-indigo-500/30 rounded-lg p-3 text-center transition-colors"
                >
                  <Zap className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                  <p className="text-white text-xs font-medium">Guard</p>
                </button>

                <button
                  onClick={() => handleInteraction('venom')}
                  className="bg-green-900/40 hover:bg-green-900/60 border border-green-500/30 rounded-lg p-3 text-center transition-colors"
                >
                  <Droplets className="w-5 h-5 text-green-400 mx-auto mb-1" />
                  <p className="text-white text-xs font-medium">Harvest Venom</p>
                </button>

                <button
                  onClick={() => handleInteraction('shed')}
                  className="bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-lg p-3 text-center transition-colors"
                >
                  <Sparkles className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                  <p className="text-white text-xs font-medium">Shed Skin</p>
                </button>

                <button
                  onClick={() => handleInteraction('prophecy')}
                  className="bg-blue-900/40 hover:bg-blue-900/60 border border-blue-500/30 rounded-lg p-3 text-center transition-colors"
                >
                  <Eye className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                  <p className="text-white text-xs font-medium">See Prophecy</p>
                </button>

                <button
                  onClick={() => handleInteraction('steal')}
                  className="bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 rounded-lg p-3 text-center transition-colors"
                >
                  <Skull className="w-5 h-5 text-red-400 mx-auto mb-1" />
                  <p className="text-white text-xs font-medium">Steal</p>
                </button>

                <button
                  onClick={() => handleInteraction('mark')}
                  className="bg-orange-900/40 hover:bg-orange-900/60 border border-orange-500/30 rounded-lg p-3 text-center transition-colors"
                >
                  <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                  <p className="text-white text-xs font-medium">Mark Territory</p>
                </button>

                <button
                  onClick={() => handleInteraction('merge')}
                  disabled={mySnake.bond_level < 70}
                  className={`rounded-lg p-3 text-center transition-colors ${
                    mySnake.bond_level >= 70
                      ? 'bg-pink-900/40 hover:bg-pink-900/60 border border-pink-500/30'
                      : 'bg-gray-800/40 border border-gray-600/30 opacity-50'
                  }`}
                >
                  <Heart className="w-5 h-5 text-pink-400 mx-auto mb-1" />
                  <p className="text-white text-xs font-medium">Merge {mySnake.bond_level < 70 && '(70)'}</p>
                </button>

                <button
                  onClick={() => handleInteraction('hibernate')}
                  className="bg-gray-900/40 hover:bg-gray-900/60 border border-gray-500/30 rounded-lg p-3 text-center transition-colors"
                >
                  <Moon className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-white text-xs font-medium">Hibernate</p>
                </button>
              </div>
            </div>

            {/* Special Abilities */}
            <div className="space-y-2">
              <h3 className="text-white font-bold mb-3">Special Abilities</h3>
              {getAbilities().map(ability => {
                const unlocked = mySnake.bond_level >= ability.reqBond;
                const hasUsed = mySnake.unlocked_abilities?.includes(ability.name);

                return (
                  <button
                    key={ability.id}
                    onClick={() => unlocked && handleUseAbility(ability)}
                    disabled={!unlocked}
                    className={`w-full rounded-lg p-3 text-left transition-colors ${
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
                        {hasUsed && <span className="text-green-400 text-xs">✓ Used</span>}
                        {!unlocked && <span className="text-gray-500 text-xs">Bond {ability.reqBond}</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Naming Modal */}
        {showNaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/90 flex items-center justify-center p-4 rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-white text-xl font-bold mb-4">Name Your Snake</h3>
              <input
                type="text"
                value={snakeName}
                onChange={(e) => setSnakeName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && snakeName.trim()) {
                    const selectedType = snakeTypes.find(s => s.name === snakeName.split(' ')[0] + ' ' + snakeName.split(' ')[1]);
                    if (mySnake) {
                      base44.entities.SnakeFamiliar.update(mySnake.id, { custom_name: snakeName.trim() });
                      queryClient.invalidateQueries();
                      setShowNaming(false);
                    } else {
                      handleConfirmSnake(snakeTypes[0].id);
                    }
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
                    if (snakeName.trim()) {
                      if (mySnake) {
                        base44.entities.SnakeFamiliar.update(mySnake.id, { custom_name: snakeName.trim() });
                        queryClient.invalidateQueries();
                        setShowNaming(false);
                      } else {
                        const selectedType = snakeTypes.find(s => s.name.includes('Shadow')) ? 'shadow' : 'venom';
                        handleConfirmSnake(selectedType);
                      }
                    }
                  }}
                  disabled={!snakeName.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white py-2 rounded-lg"
                >
                  Confirm
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}