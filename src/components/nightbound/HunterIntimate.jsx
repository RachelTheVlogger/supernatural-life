import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const INTIMATE_ACTIONS = {
  all: [
    { id: 'kiss_hard', label: 'Pin them and kiss them hard', category: 'physical' },
    { id: 'trail', label: 'Trail fingers down their body', category: 'physical' },
    { id: 'push_bed', label: 'Push them onto the bed', category: 'physical' },
    { id: 'straddle', label: 'Straddle them', category: 'physical' },
    { id: 'grip_throat', label: 'Grip their throat', category: 'physical' },
    { id: 'neck_tongue', label: 'Run your tongue along their neck', category: 'physical' },
    { id: 'knees', label: 'Push them to their knees', category: 'physical' },
    { id: 'from_behind', label: 'Take them from behind', category: 'physical' },
    { id: 'watch', label: 'Make them watch you', category: 'physical' },
    { id: 'bind_control', label: 'Bind them and take control', category: 'bdsm' },
    { id: 'taste', label: 'Taste every inch of them', category: 'physical' },
    { id: 'beg', label: 'Make them beg for you', category: 'physical' },
    { id: 'wall', label: 'Take them against the wall', category: 'physical' },
    { id: 'claim_mouth', label: 'Claim their mouth completely', category: 'physical' },
    { id: 'mark', label: 'Mark every part of them', category: 'physical' },
    { id: 'whisper_threats', label: 'Whisper dangerous things in their ear', category: 'romantic' },
    { id: 'breathe', label: 'Breathe them in like a drug', category: 'romantic' },
    { id: 'surrender', label: 'Let them take control', category: 'romantic' },
    { id: 'corner', label: 'Corner them and close in', category: 'physical' },
    { id: 'dominance', label: 'Show them your true dominance', category: 'bdsm' },
    { id: 'risk', label: 'Risk getting caught together', category: 'activity' },
    { id: 'hunt_together', label: 'Hunt together that night', category: 'activity' }
  ],
  romantic: [
    { id: 'whisper_threats', label: 'Whisper dangerous things in their ear', category: 'romantic' },
    { id: 'breathe', label: 'Breathe them in like a drug', category: 'romantic' },
    { id: 'claim_mouth', label: 'Claim their mouth completely', category: 'romantic' },
    { id: 'neck_tongue', label: 'Run your tongue along their neck', category: 'romantic' },
    { id: 'surrender', label: 'Let them take control', category: 'romantic' }
  ],
  physical: [
    { id: 'kiss_hard', label: 'Pin them and kiss them hard', category: 'physical' },
    { id: 'trail', label: 'Trail fingers down their body', category: 'physical' },
    { id: 'push_bed', label: 'Push them onto the bed', category: 'physical' },
    { id: 'straddle', label: 'Straddle them', category: 'physical' },
    { id: 'grip_throat', label: 'Grip their throat', category: 'physical' },
    { id: 'neck_tongue', label: 'Run your tongue along their neck', category: 'physical' },
    { id: 'from_behind', label: 'Take them from behind', category: 'physical' },
    { id: 'taste', label: 'Taste every inch of them', category: 'physical' },
    { id: 'wall', label: 'Take them against the wall', category: 'physical' },
    { id: 'mark', label: 'Mark every part of them', category: 'physical' },
    { id: 'corner', label: 'Corner them and close in', category: 'physical' }
  ],
  bdsm: [
    { id: 'knees', label: 'Push them to their knees', category: 'bdsm' },
    { id: 'bind_control', label: 'Bind them and take control', category: 'bdsm' },
    { id: 'beg', label: 'Make them beg for you', category: 'bdsm' },
    { id: 'dominance', label: 'Show them your true dominance', category: 'bdsm' },
    { id: 'grip_throat', label: 'Grip their throat', category: 'bdsm' },
    { id: 'watch', label: 'Make them watch you', category: 'bdsm' }
  ],
  social: [
    { id: 'claim_mouth', label: 'Claim their mouth publicly', category: 'social' },
    { id: 'risk', label: 'Risk getting caught together', category: 'social' },
    { id: 'mark', label: 'Mark them where everyone can see', category: 'social' }
  ],
  activity: [
    { id: 'risk', label: 'Risk getting caught together', category: 'activity' },
    { id: 'hunt_together', label: 'Hunt together that night', category: 'activity' },
    { id: 'corner', label: 'Corner prey together', category: 'activity' }
  ]
};

export default function HunterIntimate({ hunter, vampires }) {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');

  const validPartners = vampires.map(v => ({
    id: v.id,
    name: v.vampire_name,
    type: 'vampire',
    icon: '🦇'
  }));

  const categories = ['all', 'romantic', 'physical', 'bdsm', 'social', 'activity'];
  const currentActions = INTIMATE_ACTIONS[selectedCategory] || INTIMATE_ACTIONS.all;

  const handleAction = async (action, partner) => {
    setProcessing(true);
    setSelectedAction(action);

    const outcomes = {
      kiss_hard: `You pinned them against the wall, your mouth claiming theirs. Hard. Desperate. They matched your intensity perfectly.`,
      trail: `Your fingers traced slowly down their chest, across their stomach. Every touch made them shudder. Control in your hands.`,
      push_bed: `You pushed them back onto the bed. They landed hard, eyes wide, waiting for what comes next.`,
      straddle: `You moved over them, straddling their body. Power and vulnerability rolled into one perfect moment.`,
      grip_throat: `You wrapped your hand around their throat gently. Not to hurt. To possess. To claim. They surrendered completely.`,
      neck_tongue: `You ran your tongue along the curve of their neck. They gasped. The hunger in you intensified.`,
      knees: `You pulled them down to their knees. Eyes up, looking at you. The power dynamic shifted entirely in your favor.`,
      from_behind: `You took them from behind, hands gripping their hips. Raw. Primal. Everything the hunt demanded.`,
      watch: `You made them watch as you undressed yourself slowly. Anticipation built between you like electricity.`,
      bind_control: `You bound their wrists with leather. They tested the restraints and smiled. Complete trust. Complete surrender.`,
      taste: `You tasted every inch of their skin. Lips trailing everywhere. They trembled beneath you, lost completely.`,
      beg: `You brought them to the edge over and over until they begged. Your name became a prayer.`,
      wall: `You pressed them against the wall, your body against theirs. Rough. Intense. No gentleness left.`,
      claim_mouth: `You claimed their mouth completely, deep and possessive. This was about ownership now. They were yours.`,
      mark: `You marked their skin with your lips and teeth. Visible reminders that they belonged to you.`,
      whisper_threats: `You whispered dark, dangerous things into their ear. Threats wrapped in desire. They shivered and pulled you closer.`,
      breathe: `You breathed them in like a drug you were addicted to. One taste would never be enough.`,
      surrender: `You let them take control. Gave yourself over completely. The vulnerability was intoxicating.`,
      corner: `You cornered them, moving in slowly. Nowhere to run. Nowhere to hide. Just you and the moment.`,
      dominance: `You showed them exactly what you were capable of. Pure dominance. Pure power. They loved every second.`,
      risk: `You pulled them into a dark corner, knowing people could catch you at any moment. The danger made it hotter.`,
      hunt_together: `You hunted together that night. The kill made you both wild. When you finally had them alone, all that predatory energy exploded.`
    };

    setTimeout(async () => {
      try {
        await base44.entities.NightLog.create({
          entry: `${hunter.name}: ${outcomes[action.id] || 'An intimate moment shared.'}`,
          category: 'interaction',
          intensity: 'high'
        });

        setOutcome(outcomes[action.id] || 'A moment shared.');
        queryClient.invalidateQueries();

        setTimeout(() => {
          setProcessing(false);
          setOutcome('');
          setSelectedAction(null);
          setSelectedPartner(null);
        }, 3000);
      } catch (e) {
        console.error('Activity failed:', e);
        setProcessing(false);
      }
    }, 1500);
  };

  if (processing && outcome) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gray-900 rounded-2xl p-8 max-w-md w-full text-center border-2 border-purple-500/50"
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-purple-200 text-lg leading-relaxed italic"
          >
            {outcome}
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  if (processing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      >
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }}>
          <span className="text-4xl">💜</span>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-6 max-w-lg w-full border-2 border-purple-500/50"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {validPartners[0]?.name || 'Intimate Encounter'}
            </h2>
            <p className="text-gray-400">They're here with you. What will you do?</p>
          </div>
          <button className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Actions Grid */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto">
          {currentActions.map(action => (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => handleAction(action, validPartners[0] || { name: 'them' })}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl py-4 px-6 font-medium transition-all flex items-center gap-3 group"
            >
              <span className="text-xl group-hover:scale-125 transition-transform">{action.icon}</span>
              {action.label}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}