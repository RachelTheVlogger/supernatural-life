import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Heart, Zap, Moon, Gift, BookOpen, Wand2, Home } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function WitchDeepInteractions({ witch, vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [activeAction, setActiveAction] = useState(null);

  const getPronouns = () => {
    return vampireState.gender === 'woman' ? { subject: 'she', object: 'her', possessive: 'her' } 
      : vampireState.gender === 'custom' ? { subject: 'they', object: 'them', possessive: 'their' }
      : { subject: 'he', object: 'him', possessive: 'his' };
  };

  const p = getPronouns();

  const deepActions = [
    {
      id: 'deep_talk',
      icon: MessageCircle,
      label: 'Deep Conversation',
      color: 'from-blue-900/60 to-cyan-900/60',
      borderColor: 'border-blue-500/30',
      relGain: [8, 15],
      outcomes: [
        `You and ${witch.name} talk for hours. About mortality. Immortality. Magic. ${p.subject} tells you about ${p.possessive} childhood. The first spell. The awakening. You share your human memories. The night you died. The night you were reborn. Understanding deepens between you.`,
        `"Do you ever regret it?" ${witch.name} asks. You think. "Becoming a vampire? Sometimes." ${p.subject} nods. "Magic cursed me too. But I'd choose it again." You hold ${p.possessive} hand. "Me too." Silence. Comfortable. Complete.`,
        `${witch.name} confesses fears. "What if my coven finds out about us?" You pull ${p.object} close. "Let them try to take you." ${p.subject} relaxes. Safe in your arms. You'd burn the world for ${p.object}.`,
        `Late night philosophy. ${witch.name}: "You drink blood to live. I drain life for power. Are we so different?" You kiss ${p.possessive} forehead. "We're monsters together. That's all that matters."`
      ]
    },
    {
      id: 'romance',
      icon: Heart,
      label: 'Romantic Moment',
      color: 'from-pink-900/60 to-red-900/60',
      borderColor: 'border-pink-500/30',
      relGain: [10, 20],
      outcomes: [
        `${witch.name} lights candles with magic. Rose petals appear. "Romantic enough?" ${p.subject} teases. You pull ${p.object} into a kiss. Slow. Deep. Perfect. Clothes fall away. Magic tingles on your skin. You make love surrounded by floating petals.`,
        `You surprise ${witch.name} with blood wine. ${p.subject} surprises you with enchanted chocolate. You feed each other. Giggling. Flirting. It escalates. Always does. You take ${p.object} right there. Kitchen counter. Passionate. Wild.`,
        `Moonlit bath together. ${witch.name} enchants the water. Glowing. Warm. You wash ${p.possessive} hair. ${p.subject} washes yours. Intimate. Tender. Then ${p.subject} straddles you in the water. Need in ${p.possessive} eyes. You give ${p.object} everything.`,
        `${witch.name} creates an illusion. Your human life. Your first meeting. "I wish I knew you then," ${p.subject} says. You kiss ${p.object}. "You know me now. That's enough." ${p.subject} smiles. Pulls you to bed. Shows you how much that means.`
      ]
    },
    {
      id: 'magic_practice',
      icon: Wand2,
      label: 'Practice Magic Together',
      color: 'from-purple-900/60 to-violet-900/60',
      borderColor: 'border-purple-500/30',
      relGain: [5, 12],
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
      outcomes: [
        `You hunt as a team. ${witch.name} uses magic to track prey. You use vampire speed to catch them. Perfect coordination. You feed. ${p.subject} watches. "Beautiful," ${p.subject} whispers. ${p.subject} understands you completely.`,
        `Hunting at midnight. ${witch.name} casts confusion on your target. They don't resist. Don't scream. Just... accept. You drink deeply. ${p.subject} holds you after. "My predator," ${p.subject} murmurs. Pride. Love. Acceptance.`,
        `Double hunt. You take a human. ${witch.name} drains someone's life force for magic. Side by side. Feeding. Living. When done, you kiss. Tasting death on each other's lips. Perfect.`,
        `${witch.name} uses location spell. Finds someone alone. Vulnerable. You go together. Make it quick. Merciful. On the way home, ${p.subject} holds your hand. "We take care of each other." Always.`
      ]
    },
    {
      id: 'gift',
      icon: Gift,
      label: 'Exchange Gifts',
      color: 'from-yellow-900/60 to-amber-900/60',
      borderColor: 'border-yellow-500/30',
      relGain: [7, 16],
      outcomes: [
        `You gift ${witch.name} an ancient grimoire. Found in a vampire vault. ${p.possessive} eyes light up. "This is... priceless." ${p.subject} throws arms around you. "Thank you. Thank you." Worth every risk.`,
        `${witch.name} gives you a blood crystal. "It stores blood for emergencies," ${p.subject} explains. Practical. Thoughtful. Perfect. You kiss ${p.object}. "You always think of me." "${p.subject === 'they' ? 'They always think' : p.subject === 'she' ? 'She always thinks' : 'He always thinks'} of you," ${p.subject} corrects.`,
        `Surprise exchange. You made ${witch.name} jewelry from vampire bones. ${p.subject} made you a talisman from witch herbs. Both beautiful. Both meaningful. You wear them always.`,
        `${witch.name} enchants your coffin. "Sweet dreams guaranteed," ${p.subject} promises. You pull ${p.object} into the coffin. "Stay." ${p.subject} does. You don't sleep. You don't need to.`
      ]
    },
    {
      id: 'domestic',
      icon: Home,
      label: 'Domestic Life',
      color: 'from-green-900/60 to-emerald-900/60',
      borderColor: 'border-green-500/30',
      relGain: [4, 10],
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
      outcomes: [
        `You teach ${witch.name} about vampire weaknesses. How to protect you. ${p.subject} listens intently. Takes notes. "I'll keep you safe," ${p.subject} vows. You believe ${p.object}.`,
        `Vampire history lesson. You tell ${witch.name} about the ancient ones. The first vampires. ${p.subject}'s fascinated. "You're part of something eternal," ${p.subject} breathes. ${p.subject} gets it.`,
        `Blood magic. You show ${witch.name} how vampires use blood differently than witches. ${p.subject} experiments. Creates new hybrid spells. "We're making history," ${p.subject} says. You are.`,
        `You share your sire's teachings with ${witch.name}. Secret knowledge. Forbidden to outsiders. But ${p.subject}'s not an outsider. ${p.subject}'s yours. ${p.subject} treasures every word.`
      ]
    }
  ];

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
        <p className="text-purple-300 text-sm mb-4">Deep interactions • Relationship: {witch.relationship || 0}%</p>

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
                  setProcessing(true);
                  setActiveAction(action.id);
                  
                  setTimeout(async () => {
                    const result = action.outcomes[Math.floor(Math.random() * action.outcomes.length)];
                    setOutcome(result);
                    
                    const relGain = Math.floor(Math.random() * (action.relGain[1] - action.relGain[0] + 1)) + action.relGain[0];
                    await base44.entities.Witch.update(witch.id, {
                      relationship: Math.min(100, (witch.relationship || 0) + relGain),
                      last_encounter: new Date().toISOString()
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
                    <p className="text-gray-300 text-xs">+{action.relGain[0]}-{action.relGain[1]} relationship</p>
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
    </motion.div>
  );
}