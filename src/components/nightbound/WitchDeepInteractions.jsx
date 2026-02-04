import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Heart, Zap, Moon, Gift, BookOpen, Wand2, Home, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function WitchDeepInteractions({ witch, vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [activeAction, setActiveAction] = useState(null);
  const [showServiceMenu, setShowServiceMenu] = useState(false);
  const [showAlignmentChoice, setShowAlignmentChoice] = useState(false);

  const getPronouns = () => {
    return vampireState.gender === 'woman' ? { subject: 'she', object: 'her', possessive: 'her' } 
      : vampireState.gender === 'custom' ? { subject: 'they', object: 'them', possessive: 'their' }
      : { subject: 'he', object: 'him', possessive: 'his' };
  };

  const p = getPronouns();

  const BDSM_PREFERENCES = [
    { id: 'bondage', label: 'Bondage', icon: '🔗', color: 'text-purple-400' },
    { id: 'discipline', label: 'Discipline', icon: '⚡', color: 'text-red-400' },
    { id: 'dominance', label: 'Dominance', icon: '👑', color: 'text-amber-400' },
    { id: 'submission', label: 'Submission', icon: '🙏', color: 'text-blue-400' },
    { id: 'sadism', label: 'Sadism', icon: '🔥', color: 'text-orange-400' },
    { id: 'masochism', label: 'Masochism', icon: '💔', color: 'text-pink-400' },
    { id: 'sensory_play', label: 'Sensory Play', icon: '👁️', color: 'text-cyan-400' },
    { id: 'roleplay', label: 'Roleplay', icon: '🎭', color: 'text-violet-400' }
  ];

  const [showBDSMModal, setShowBDSMModal] = React.useState(false);

  const handleMagicalService = () => {
    setShowServiceMenu(true);
  };

  const handleAlignmentTalk = () => {
    setShowAlignmentChoice(true);
  };

  const handleMagicalGift = async () => {
    setProcessing(true);
    
    setTimeout(async () => {
      const alignment = witch.alignment || 'grey';
      const outcomes = getAlignmentDialogue().gift_magic;
      const result = outcomes[Math.floor(Math.random() * outcomes.length)];
      
      setOutcome(result);
      
      await base44.entities.Witch.update(witch.id, {
        relationship: Math.min(100, (witch.relationship || 0) + 12),
        items_crafted: [...(witch.items_crafted || []), `Gift (${alignment})`]
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
      }, 5000);
    }, 2000);
  };

  const performMagicalService = async (service) => {
    setShowServiceMenu(false);
    setProcessing(true);
    
    setTimeout(async () => {
      const result = service.outcome;
      setOutcome(result);
      
      await base44.entities.Witch.update(witch.id, {
        magical_favors_owed: Math.max(0, (witch.magical_favors_owed || 0) - 1),
        items_crafted: [...(witch.items_crafted || []), service.item]
      });
      
      if (service.vampireEffect && vampireState?.id) {
        await base44.entities.VampireState.update(vampireState.id, service.vampireEffect);
      }
      
      await base44.entities.NightLog.create({
        entry: result,
        category: 'interaction',
        intensity: 'moderate'
      });
      
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 5000);
    }, 3000);
  };

  const changeAlignment = async (newAlignment) => {
    setShowAlignmentChoice(false);
    setProcessing(true);
    
    setTimeout(async () => {
      const alignmentText = {
        light: `${witch.name} chooses the path of light. "No more darkness. I'll use magic to heal, protect, nurture." ${p.possessive} eyes glow with pure energy. You feel... hopeful. Maybe you can be better too.`,
        grey: `${witch.name} chooses balance. "Light and dark. Both have their place." ${p.subject} understands nuance. Complexity. Neither saint nor demon. Just... witch. Perfect.`,
        dark: `${witch.name} embraces darkness. "Power at any cost," ${p.subject} whispers. ${p.possessive} eyes turn black for a moment. You feel the corruption. It's intoxicating. Dangerous. You love it.`
      };
      
      setOutcome(alignmentText[newAlignment]);
      
      const corruptionChange = newAlignment === 'dark' ? 30 : newAlignment === 'light' ? -30 : 0;
      
      await base44.entities.Witch.update(witch.id, {
        alignment: newAlignment,
        corruption_level: Math.max(0, Math.min(100, (witch.corruption_level || 0) + corruptionChange)),
        relationship: Math.min(100, (witch.relationship || 0) + 8)
      });
      
      await base44.entities.NightLog.create({
        entry: alignmentText[newAlignment],
        category: 'power',
        intensity: 'significant'
      });
      
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 5000);
    }, 2000);
  };

  const handleBoundariesTalk = () => {
    setProcessing(true);
    
    setTimeout(async () => {
      const text = `You and ${witch.name} sit down for a serious conversation. "Before we go further," you say, "we need to talk about boundaries. Consent. What we're both comfortable with." ${p.subject} nods, appreciating your care. You discuss limits, desires, safe words. "I feel safe with you," ${p.subject} says. Trust deepened.`;
      
      setOutcome(text);
      
      await base44.entities.Witch.update(witch.id, {
        boundaries_discussed: true,
        trust: Math.min(100, (witch.trust || 30) + 20),
        relationship: Math.min(100, (witch.relationship || 0) + 15)
      });
      
      await base44.entities.NightLog.create({
        entry: text,
        category: 'interaction',
        intensity: 'significant'
      });
      
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 5000);
    }, 2000);
  };

  const handleIntimateExploration = () => {
    setProcessing(true);
    
    setTimeout(async () => {
      const alignment = witch.alignment || 'grey';
      
      const explorations = {
        light: [
          `${witch.name} guides you gently. "Tell me if anything's too much," ${p.subject} whispers. Soft restraints. Feathers. Ice. Pleasure building slowly. Safe. Consensual. Perfect. You both explore boundaries with care and love.`,
          `"I want to try something," ${witch.name} says shyly. ${p.subject} shows you ${p.possessive} fantasies. Gentle dominance. You take control with tenderness. "Yes," ${p.subject} gasps. "Just like that." Trust makes it beautiful.`,
          `Sensory magic. ${witch.name} heightens every nerve ending. Blindfold. You can only feel. Every touch electric. "Do you trust me?" ${p.subject} asks. "Completely," you breathe. Surrender. Bliss.`
        ],
        grey: [
          `${witch.name} suggests trying power exchange. Sometimes ${p.subject} leads. Sometimes you do. The dance of dominance and submission. Both enjoying the intensity. "We're good together," ${p.subject} pants. You agree completely.`,
          `Experimentation. ${witch.name} uses magic to enhance sensations. Light bondage. Teasing. Edge play. Safe words established. You push boundaries together, carefully. Trust and desire spiraling higher.`,
          `"I want you to take control," ${witch.name} whispers. Or sometimes, "Let me dominate you tonight." The versatility thrilling. Both enjoying different dynamics. Perfect balance.`
        ],
        dark: [
          `${witch.name}'s darker desires emerge. "I want you to hurt me," ${p.subject} breathes. "Just enough." Pain and pleasure mixing. Careful boundaries. Safe words. But pushing limits. Dark. Intense. Raw.`,
          `Blood magic during sex. ${witch.name} cuts ${p.possessive} palm. You drink. The intimacy extreme. Pain. Pleasure. Magic. All one. "More," ${p.subject} demands. You oblige.`,
          `Complete surrender. ${witch.name} gives you total control. Or takes it. Rough. Demanding. Marks left behind. "Mine," ${p.subject} growls. Possessive. Intense. Perfect for you both.`
        ]
      };
      
      const outcomes = explorations[alignment];
      const text = outcomes[Math.floor(Math.random() * outcomes.length)];
      
      setOutcome(text);
      
      const preferences = ['power_exchange', 'sensory_play', 'light_bondage', alignment === 'dark' ? 'blood_play' : null].filter(Boolean);
      
      await base44.entities.Witch.update(witch.id, {
        intimacy_level: Math.min(100, (witch.intimacy_level || 0) + 20),
        desire: Math.min(100, (witch.desire || 20) + 15),
        relationship: Math.min(100, (witch.relationship || 0) + 18),
        bdsm_preferences: [...new Set([...(witch.bdsm_preferences || []), preferences[Math.floor(Math.random() * preferences.length)]])]
      });
      
      await base44.entities.NightLog.create({
        entry: text,
        category: 'interaction',
        intensity: 'extreme'
      });
      
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 6000);
    }, 2000);
  };

  const getAlignmentDialogue = () => {
    const alignment = witch.alignment || 'grey';
    
    if (alignment === 'light') {
      return {
        deep_talk: [
          `You and ${witch.name} talk for hours. ${p.subject} speaks of redemption. "Even vampires can choose light," ${p.subject} says. You're not sure you believe it. But ${p.subject} does. That matters.`,
          `${witch.name} tells you about healing magic. How it saved ${p.possessive} soul. "You could learn too," ${p.subject} offers. "Balance the darkness with light." You consider it.`,
          `"Magic is a gift," ${witch.name} says. "It should heal, protect, nurture." You think about blood. Death. "Can darkness and light coexist?" ${p.subject} takes your hand. "We're trying, aren't we?"`,
          `${witch.name} confesses: "My coven thinks vampires are evil. But you're not. You're trying." ${p.subject} sees the good in you. Even when you don't.`
        ],
        gift_magic: [
          `${witch.name} offers you a blessed amulet. "Protection from your own darkness," ${p.subject} explains. Light magic hums against your skin. Strange. But comforting.`,
          `"I made you something," ${witch.name} says shyly. A potion. "It'll make feeding... less violent. More humane." ${p.subject} cares about your humanity. Your soul.`,
          `${witch.name} enchants your home with peace wards. "You deserve tranquility," ${p.subject} says. The darkness in your apartment feels... lighter. Because of ${p.object}.`
        ],
        romance: [
          `${witch.name} creates flowers with magic. They bloom in your hands. "Beauty for someone beautiful," ${p.subject} whispers. You kiss ${p.object} softly. Pure. Innocent. Perfect.`,
          `"I'm falling for you," ${witch.name} confesses. "Even knowing what you are. Maybe because of it." You hold ${p.object} close. "I don't deserve you." "${p.subject} gets to decide that," ${p.subject} smiles.`,
          `Gentle magic surrounds you. ${witch.name}'s love made visible. Light and shadow dancing together. ${p.subject} makes you believe you can be better. For ${p.object}.`
        ]
      };
    } else if (alignment === 'dark') {
      return {
        deep_talk: [
          `${witch.name} talks about forbidden magic. Expression. Dark rituals. "We could be gods together," ${p.subject} whispers. The temptation is real. Dangerous. Thrilling.`,
          `"Light witches are weak," ${witch.name} spits. "Power requires sacrifice. Blood. Death. You understand that." You do. Too well.`,
          `${witch.name} confesses: "I've killed with magic. Dozens. Does that scare you?" You laugh. "I'm a vampire. I've killed hundreds." ${p.subject} grins. "We're perfect for each other."`,
          `Dark magic discussion. ${witch.name} shows you forbidden spells. "We could reshape reality," ${p.subject} breathes. "Take what we want. Rule this world." The darkness calls.`
        ],
        gift_magic: [
          `${witch.name} gives you a cursed dagger. "Kills anything. Even immortals." ${p.subject}'s eyes gleam. "Use it well." The darkness in ${p.object} matches yours.`,
          `"Blood magic requires blood," ${witch.name} says. Hands you a vial. "Demon blood. Makes you... stronger. Darker." You drink it. Power surges. ${p.subject} watches hungrily.`,
          `${witch.name} places a hex on your enemies. "They'll suffer for hurting you," ${p.subject} promises. Dark magic. Protective. Possessive. Perfect.`
        ],
        romance: [
          `${witch.name} kisses you violently. Magic crackling. "I want to consume you," ${p.subject} gasps. "And be consumed." You oblige. Dark. Intense. Overwhelming.`,
          `"We're monsters," ${witch.name} whispers while undressing you. "Might as well enjoy it." No pretense of goodness. Just raw desire. Darkness. Truth.`,
          `Blood magic ritual during sex. ${witch.name} cuts ${p.possessive} palm. You cut yours. Hands clasped. Blood mixing. Magic and lust spiraling. You both come screaming incantations.`
        ]
      };
    } else { // grey
      return {
        deep_talk: [
          `You and ${witch.name} talk for hours. About mortality. Immortality. Magic. ${p.subject} tells you about ${p.possessive} childhood. The first spell. The awakening. You share your human memories. The night you died. The night you were reborn. Understanding deepens between you.`,
          `"Do you ever regret it?" ${witch.name} asks. You think. "Becoming a vampire? Sometimes." ${p.subject} nods. "Magic cursed me too. But I'd choose it again." You hold ${p.possessive} hand. "Me too." Silence. Comfortable. Complete.`,
          `${witch.name} confesses fears. "What if my coven finds out about us?" You pull ${p.object} close. "Let them try to take you." ${p.subject} relaxes. Safe in your arms. You'd burn the world for ${p.object}.`,
          `Late night philosophy. ${witch.name}: "You drink blood to live. I drain life for power. Are we so different?" You kiss ${p.possessive} forehead. "We're monsters together. That's all that matters."`
        ],
        gift_magic: [
          `${witch.name} offers you an enchanted ring. "It'll hide your vampire aura from hunters," ${p.subject} explains. Practical. Thoughtful. You kiss ${p.object} in thanks.`,
          `"I brewed something for you," ${witch.name} says. A potion. "Controls the hunger. A bit." ${p.subject} cares. Wants to help. You're grateful.`,
          `${witch.name} enchants your windows. "The sun won't hurt you inside now," ${p.subject} says. Small gift. Huge impact. Freedom.`
        ],
        romance: [
          `${witch.name} lights candles with magic. Rose petals appear. "Romantic enough?" ${p.subject} teases. You pull ${p.object} into a kiss. Slow. Deep. Perfect.`,
          `You and ${witch.name} under the moon. Magic and darkness entwined. ${p.subject} whispers "I love you" between kisses. You say it back. Mean it.`,
          `Intimacy with ${witch.name}. Magic tingles on your skin. ${p.subject} knows exactly how to touch you. Supernatural connection. Perfect understanding.`
        ]
      };
    }
  };

  const alignmentDialogue = getAlignmentDialogue();

  const getAvailableActions = () => {
    const trust = witch.trust || 30;
    const fear = witch.fear || 40;
    const desire = witch.desire || 20;
    const intimacy = witch.intimacy_level || 0;
    const isLiteMode = vampireState?.content_filter === 'lite';

    const actions = [
      {
        id: 'deep_talk',
        icon: MessageCircle,
        label: 'Deep Conversation',
        color: 'from-blue-900/60 to-cyan-900/60',
        borderColor: 'border-blue-500/30',
        relGain: [8, 15],
        statChanges: { trust: [5, 10], fear: [-3, -1] },
        outcomes: alignmentDialogue.deep_talk
      },
      {
        id: 'reassure',
        icon: Heart,
        label: 'Reassure Them',
        color: 'from-green-900/60 to-emerald-900/60',
        borderColor: 'border-green-500/30',
        relGain: [6, 12],
        statChanges: { trust: [8, 15], fear: [-8, -3] },
        outcomes: [
          `You hold ${witch.name} close. "I won't hurt you. I promise." ${p.subject} relaxes. "I believe you," ${p.subject} whispers. Trust growing.`,
          `${witch.name} looks scared. You cup ${p.possessive} face. "You're safe with me. Always." ${p.subject} exhales. Relief. Trust.`,
          `"I know what I am," you say softly. "But I choose to be better. For you." ${witch.name} kisses you. "I trust you."`
        ]
      }
    ];

    // Unlock vulnerable moment if fear is low and trust is high
    if (trust >= 50 && fear <= 30) {
      actions.push({
        id: 'vulnerable',
        icon: Heart,
        label: 'Share Vulnerability',
        color: 'from-indigo-900/60 to-purple-900/60',
        borderColor: 'border-indigo-500/30',
        relGain: [10, 18],
        statChanges: { trust: [12, 20], desire: [5, 10] },
        outcomes: [
          `You tell ${witch.name} your deepest fears. Death. Loneliness. Losing ${p.object}. ${p.subject} listens. Holds you. "I'm here," ${p.subject} promises. Connection deepens.`,
          `${witch.name} shares ${p.possessive} trauma. Magic that went wrong. People ${p.subject} hurt. You don't judge. You understand. Both broken. Both trying.`,
          `Raw honesty. You show ${witch.name} the monster inside. The hunger. The darkness. ${p.subject} doesn't run. "I see you. All of you. And I'm staying."`
        ]
      });
    }

    // Flirting and desire actions
    if (trust >= 30) {
      actions.push({
        id: 'flirt',
        icon: Sparkles,
        label: 'Flirt Playfully',
        color: 'from-pink-900/60 to-rose-900/60',
        borderColor: 'border-pink-500/30',
        relGain: [5, 10],
        statChanges: { desire: [8, 15] },
        outcomes: [
          `You tease ${witch.name} with words. ${p.subject} blushes. Laughs. The tension delicious. "You're trouble," ${p.subject} says. But ${p.subject} loves it.`,
          `Magic and flirtation. ${witch.name} makes sparks dance between you. You catch one. "Playing with fire?" You grin. "Always."`,
          `Heated glances. Double meanings. ${witch.name}'s breath catches. "Stop it," ${p.subject} whispers, not meaning it. The desire palpable.`
        ]
      });
    }

    // Boundaries discussion - unlocks intimate options
    if (trust >= 60 && desire >= 50 && !witch.boundaries_discussed) {
      actions.push({
        id: 'boundaries',
        icon: MessageCircle,
        label: 'Discuss Boundaries',
        color: 'from-blue-900/60 to-purple-900/60',
        borderColor: 'border-blue-500/30',
        relGain: [8, 12],
        statChanges: { trust: [15, 25] },
        special: true
      });
    }

    // Intimate options - only if boundaries discussed
    if (witch.boundaries_discussed && trust >= 70 && desire >= 60) {
      if (!isLiteMode) {
        actions.push({
          id: 'intimate_explore',
          icon: Heart,
          label: 'Explore Together',
          color: 'from-red-900/60 to-pink-900/60',
          borderColor: 'border-red-500/30',
          relGain: [12, 20],
          statChanges: { desire: [10, 20], intimacy: [15, 25] },
          special: true
        });
      } else {
        actions.push({
          id: 'romance',
          icon: Heart,
          label: 'Romantic Moment',
          color: 'from-pink-900/60 to-red-900/60',
          borderColor: 'border-pink-500/30',
          relGain: [10, 20],
          statChanges: { desire: [8, 15], intimacy: [10, 15] },
          outcomes: alignmentDialogue.romance
        });
      }
    }

    // Always available actions
    actions.push(
      {
        id: 'alignment_talk',
        icon: Moon,
        label: 'Discuss Magic Path',
        color: 'from-indigo-900/60 to-violet-900/60',
        borderColor: 'border-indigo-500/30',
        relGain: [6, 12],
        special: true
      },
      {
        id: 'magic_practice',
        icon: Wand2,
        label: 'Practice Magic Together',
        color: 'from-purple-900/60 to-violet-900/60',
        borderColor: 'border-purple-500/30',
        relGain: [5, 12],
        statChanges: { trust: [3, 8], desire: [2, 5] },
        outcomes: [
          `${witch.name} teaches you protective charms. You're surprisingly good. "Natural talent," ${p.subject} says. "Or good teacher," you counter. ${p.subject} blushes. Adorable.`,
          `Spell practice. You channel vampire power. ${witch.name} channels witch magic. Combined, you create something NEW. Neither vampire nor witch magic. Something unique to you two. Bonded power.`,
          `${witch.name} shows you scrying. "Think of someone," ${p.subject} instructs. You think of ${p.object}. The water shows ${witch.name} smiling. "Sap," ${p.subject} teases. But ${p.subject}'s smiling too.`,
          `Advanced magic lesson. ${witch.name} summons elemental fire. You control it with your mind. Together, you're unstoppable. ${p.subject} looks at you with awe. "We're powerful together." Yes. You are.`
        ]
      },
      {
        id: 'hunt_together',
        icon: Moon,
        label: 'Hunt Together',
        color: 'from-red-900/60 to-rose-900/60',
        borderColor: 'border-red-500/30',
        relGain: [6, 14],
        statChanges: { trust: [5, 10], fear: [-5, -2] },
        outcomes: [
          `You hunt as a team. ${witch.name} uses magic to track prey. You use vampire speed to catch them. Perfect coordination. You feed. ${p.subject} watches. "Beautiful," ${p.subject} whispers. ${p.subject} understands you completely.`,
          `Hunting at midnight. ${witch.name} casts confusion on your target. They don't resist. Don't scream. Just... accept. You drink deeply. ${p.subject} holds you after. "My predator," ${p.subject} murmurs. Pride. Love. Acceptance.`,
          `Double hunt. You take a human. ${witch.name} drains someone's life force for magic. Side by side. Feeding. Living. When done, you kiss. Tasting death on each other's lips. Perfect.`,
          `${witch.name} uses location spell. Finds someone alone. Vulnerable. You go together. Make it quick. Merciful. On the way home, ${p.subject} holds your hand. "We take care of each other." Always.`
        ]
      },
      {
        id: 'request_service',
        icon: Zap,
        label: 'Request Magical Service',
        color: 'from-emerald-900/60 to-teal-900/60',
        borderColor: 'border-emerald-500/30',
        relGain: [5, 10],
        special: true
      },
      {
        id: 'gift',
        icon: Gift,
        label: 'Exchange Gifts',
        color: 'from-yellow-900/60 to-amber-900/60',
        borderColor: 'border-yellow-500/30',
        relGain: [7, 16],
        statChanges: { trust: [5, 10], desire: [3, 7] },
        outcomes: [
          `You gift ${witch.name} an ancient grimoire. Found in a vampire vault. ${p.possessive} eyes light up. "This is... priceless." ${p.subject} throws arms around you. "Thank you. Thank you." Worth every risk.`,
          `${witch.name} gives you a blood crystal. "It stores blood for emergencies," ${p.subject} explains. Practical. Thoughtful. Perfect. You kiss ${p.object}. "You always think of me." "${p.subject === 'they' ? 'They always think' : p.subject === 'she' ? 'She always thinks' : 'He always thinks'} of you," ${p.subject} corrects.`,
          `Surprise exchange. You made ${witch.name} jewelry from vampire bones. ${p.subject} made you a talisman from witch herbs. Both beautiful. Both meaningful. You wear them always.`,
          `${witch.name} enchants your coffin. "Sweet dreams guaranteed," ${p.subject} promises. You pull ${p.object} into the coffin. "Stay." ${p.subject} does. You don't sleep. You don't need to.`
        ]
      },
      {
        id: 'gift_magic',
        icon: Wand2,
        label: 'Receive Magical Gift',
        color: 'from-purple-900/60 to-pink-900/60',
        borderColor: 'border-purple-500/30',
        relGain: [10, 18],
        special: true
      },
      {
        id: 'domestic',
        icon: Home,
        label: 'Domestic Life',
        color: 'from-green-900/60 to-emerald-900/60',
        borderColor: 'border-green-500/30',
        relGain: [4, 10],
        statChanges: { trust: [3, 6], desire: [2, 5] },
        outcomes: [
          `Cleaning day. ${witch.name} uses magic. You use vampire speed. Done in minutes. Then you collapse on the couch together. Laughing. This is... domestic bliss. Supernatural edition.`,
          `${witch.name} cooks dinner for ${p.object}self. Blood for you. You sit together. Talking about nothing. Everything. Normal couple things. Except you're not normal. You're perfect.`,
          `Decorating the house. ${witch.name} wants mystical aesthetic. You want gothic. Compromise: mystical gothic. It works. Everything works with ${p.object}.`,
          `Quiet evening. ${witch.name} reads grimoires. You read vampire history. Feet touching under the blanket. Comfortable silence. This is home now.`
        ]
      },
      {
        id: 'teach_witch',
        icon: BookOpen,
        label: 'Share Vampire Knowledge',
        color: 'from-red-900/60 to-purple-900/60',
        borderColor: 'border-red-500/30',
        relGain: [8, 14],
        statChanges: { trust: [8, 15], fear: [-5, -2] },
        outcomes: [
          `You teach ${witch.name} about vampire weaknesses. How to protect you. ${p.subject} listens intently. Takes notes. "I'll keep you safe," ${p.subject} vows. You believe ${p.object}.`,
          `Vampire history lesson. You tell ${witch.name} about the ancient ones. The first vampires. ${p.subject}'s fascinated. "You're part of something eternal," ${p.subject} breathes. ${p.subject} gets it.`,
          `Blood magic. You show ${witch.name} how vampires use blood differently than witches. ${p.subject} experiments. Creates new hybrid spells. "We're making history," ${p.subject} says. You are.`,
          `You share your sire's teachings with ${witch.name}. Secret knowledge. Forbidden to outsiders. But ${p.subject}'s not an outsider. ${p.subject}'s yours. ${p.subject} treasures every word.`
        ]
      }
    );

    return actions;
  };

  const deepActions = getAvailableActions();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-purple-950 to-pink-950 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative border-2 border-purple-500/50"
      >
        <h2 className="text-2xl font-bold text-white mb-2">Living with {witch.name}</h2>
        <p className="text-purple-300 text-sm mb-2">Relationship: {witch.relationship || 0}% • {witch.alignment || 'grey'} witch</p>
        
        {/* Relationship Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-black/40 rounded-lg p-2 border border-blue-500/20">
            <p className="text-blue-400 text-xs">Trust</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                <div style={{ width: `${witch.trust || 30}%` }} className="h-1.5 bg-blue-500 rounded-full" />
              </div>
              <span className="text-white text-xs w-8">{witch.trust || 30}</span>
            </div>
          </div>
          <div className="bg-black/40 rounded-lg p-2 border border-red-500/20">
            <p className="text-red-400 text-xs">Fear</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                <div style={{ width: `${witch.fear || 40}%` }} className="h-1.5 bg-red-500 rounded-full" />
              </div>
              <span className="text-white text-xs w-8">{witch.fear || 40}</span>
            </div>
          </div>
          <div className="bg-black/40 rounded-lg p-2 border border-pink-500/20">
            <p className="text-pink-400 text-xs">Desire</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                <div style={{ width: `${witch.desire || 20}%` }} className="h-1.5 bg-pink-500 rounded-full" />
              </div>
              <span className="text-white text-xs w-8">{witch.desire || 20}</span>
            </div>
          </div>
        </div>

        {outcome ? (
          <div className="py-8 px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 rounded-xl p-6 border border-purple-500/30"
            >
              <p className="text-purple-100 text-base leading-relaxed">{outcome}</p>
            </motion.div>
          </div>
        ) : processing ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ rotate: { duration: 2, repeat: Infinity, ease: 'linear' }, scale: { duration: 1, repeat: Infinity } }}
              className="text-6xl mb-4"
            >
              ✨
            </motion.div>
            <p className="text-purple-300">Interacting...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {deepActions.map(action => (
              <button
                key={action.id}
                onClick={async () => {
                  if (action.special) {
                    if (action.id === 'request_service') {
                      handleMagicalService();
                    } else if (action.id === 'alignment_talk') {
                      handleAlignmentTalk();
                    } else if (action.id === 'gift_magic') {
                      handleMagicalGift();
                    } else if (action.id === 'boundaries') {
                      handleBoundariesTalk();
                    } else if (action.id === 'intimate_explore') {
                      handleIntimateExploration();
                    }
                    return;
                  }
                  
                  setProcessing(true);
                  setActiveAction(action.id);
                  
                  setTimeout(async () => {
                    const result = action.outcomes[Math.floor(Math.random() * action.outcomes.length)];
                    setOutcome(result);
                    
                    const relGain = Math.floor(Math.random() * (action.relGain[1] - action.relGain[0] + 1)) + action.relGain[0];
                    
                    const updates = {
                      relationship: Math.min(100, (witch.relationship || 0) + relGain),
                      last_encounter: new Date().toISOString()
                    };
                    
                    // Apply stat changes
                    if (action.statChanges) {
                      if (action.statChanges.trust) {
                        const trustChange = Math.floor(Math.random() * (action.statChanges.trust[1] - action.statChanges.trust[0] + 1)) + action.statChanges.trust[0];
                        updates.trust = Math.max(0, Math.min(100, (witch.trust || 30) + trustChange));
                      }
                      if (action.statChanges.fear) {
                        const fearChange = Math.floor(Math.random() * (action.statChanges.fear[1] - action.statChanges.fear[0] + 1)) + action.statChanges.fear[0];
                        updates.fear = Math.max(0, Math.min(100, (witch.fear || 40) + fearChange));
                      }
                      if (action.statChanges.desire) {
                        const desireChange = Math.floor(Math.random() * (action.statChanges.desire[1] - action.statChanges.desire[0] + 1)) + action.statChanges.desire[0];
                        updates.desire = Math.max(0, Math.min(100, (witch.desire || 20) + desireChange));
                      }
                      if (action.statChanges.intimacy) {
                        const intimacyChange = Math.floor(Math.random() * (action.statChanges.intimacy[1] - action.statChanges.intimacy[0] + 1)) + action.statChanges.intimacy[0];
                        updates.intimacy_level = Math.max(0, Math.min(100, (witch.intimacy_level || 0) + intimacyChange));
                      }
                    }
                    
                    await base44.entities.Witch.update(witch.id, updates);

                    await base44.entities.NightLog.create({
                      entry: result,
                      category: 'interaction',
                      intensity: 'significant'
                    });

                    queryClient.invalidateQueries();

                    setTimeout(() => {
                      setProcessing(false);
                      setOutcome('');
                      setActiveAction(null);
                    }, 5000);
                  }, 2000);
                }}
                disabled={processing}
                className={`bg-gradient-to-r ${action.color} border ${action.borderColor} rounded-xl p-4 text-left transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100`}
              >
                <div className="flex items-start gap-3">
                  <action.icon className="w-6 h-6 text-white flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-bold text-sm mb-1">{action.label}</h4>
                    <p className="text-gray-300 text-xs">
                      {action.special ? (action.id === 'alignment_talk' ? `Current: ${witch.alignment || 'grey'}` : 'Special interaction') : `+${action.relGain[0]}-${action.relGain[1]} relationship`}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-6 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors"
        >
          Back
        </button>
      </motion.div>

      {/* Magical Services Menu */}
      <AnimatePresence>
        {showServiceMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90"
            onClick={() => setShowServiceMenu(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full max-h-[85vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold text-white mb-4">Request Magical Service</h3>
              <p className="text-gray-400 text-sm mb-6">
                {witch.name} can craft magical items or perform services for you.
              </p>

              {[
                { 
                  item: 'Daylight Ring', 
                  icon: '☀️', 
                  outcome: `${witch.name} spends hours enchanting a ring. Lapis lazuli glowing with magic. "This will let you walk in sunlight," ${p.subject} says. You slip it on. Freedom.`,
                  vampireEffect: { can_walk_in_daylight: true }
                },
                {
                  item: 'Blood Suppression Charm',
                  icon: '🩸',
                  outcome: `${witch.name} creates a charm. "Wear this. It'll reduce your bloodlust." Magic pulses. The hunger... quieter. Not gone, but manageable. "Thank you," you whisper.`,
                  vampireEffect: { hunger_state: 'calm' }
                },
                {
                  item: 'Vampire Detection Ward',
                  icon: '🔮',
                  outcome: `${witch.name} casts a detection ward around your home. "You'll know if hunters approach," ${p.subject} explains. Protection. ${p.subject} keeps you safe.`,
                  vampireEffect: { exposure_level: Math.max(0, vampireState.exposure_level - 15) }
                },
                {
                  item: 'Memory Modification Spell',
                  icon: '🌫️',
                  outcome: `${witch.name} performs memory magic on a witness. "They won't remember seeing you feed," ${p.subject} assures. Tracks covered. Crisis averted.`,
                  vampireEffect: { exposure_level: Math.max(0, vampireState.exposure_level - 20) }
                },
                {
                  item: 'Power Amplification Ritual',
                  icon: '⚡',
                  outcome: `${witch.name} channels magic into you. Witch power flowing into vampire veins. Your abilities surge. Temporary boost. Incredible. "Use it well," ${p.subject} says, exhausted.`,
                  vampireEffect: { vampire_power_level: Math.min(100, (vampireState.vampire_power_level || 0) + 15) }
                },
                {
                  item: 'Healing Potion',
                  icon: '💚',
                  outcome: `${witch.name} brews a healing potion. "For when you're hurt," ${p.subject} says. You drink. Warmth spreads. Wounds closing. ${p.subject} cares so much.`,
                  vampireEffect: { humanity: Math.min(100, (vampireState.humanity || 50) + 10) }
                }
              ].map(service => (
                <button
                  key={service.item}
                  onClick={() => performMagicalService(service)}
                  className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors mb-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{service.icon}</span>
                    <div>
                      <h4 className="text-white font-medium mb-1">{service.item}</h4>
                      <p className="text-gray-400 text-xs">Magical service</p>
                    </div>
                  </div>
                </button>
              ))}
            </motion.div>
          </motion.div>
        )}

        {showAlignmentChoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90"
            onClick={() => setShowAlignmentChoice(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-white mb-4">Discuss {witch.name}'s Path</h3>
              <p className="text-gray-400 text-sm mb-6">
                Current alignment: <span className="text-purple-400 capitalize">{witch.alignment || 'grey'}</span>
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => changeAlignment('light')}
                  className="w-full bg-gradient-to-r from-blue-900/60 to-cyan-900/60 hover:from-blue-900/80 hover:to-cyan-900/80 border border-blue-500/30 rounded-xl p-4 text-left transition-all"
                >
                  <h4 className="text-white font-bold mb-1">✨ Path of Light</h4>
                  <p className="text-gray-400 text-xs">Healing, protection, redemption. Pure magic.</p>
                </button>

                <button
                  onClick={() => changeAlignment('grey')}
                  className="w-full bg-gradient-to-r from-purple-900/60 to-indigo-900/60 hover:from-purple-900/80 hover:to-indigo-900/80 border border-purple-500/30 rounded-xl p-4 text-left transition-all"
                >
                  <h4 className="text-white font-bold mb-1">🌙 Path of Balance</h4>
                  <p className="text-gray-400 text-xs">Light and dark. Both necessary. Neutral magic.</p>
                </button>

                <button
                  onClick={() => changeAlignment('dark')}
                  className="w-full bg-gradient-to-r from-red-900/60 to-black/60 hover:from-red-900/80 hover:to-black/80 border border-red-500/30 rounded-xl p-4 text-left transition-all"
                >
                  <h4 className="text-white font-bold mb-1">🔥 Path of Darkness</h4>
                  <p className="text-gray-400 text-xs">Curses, blood magic, power at any cost. Forbidden magic.</p>
                </button>
              </div>

              <button
                onClick={() => setShowAlignmentChoice(false)}
                className="w-full mt-4 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}