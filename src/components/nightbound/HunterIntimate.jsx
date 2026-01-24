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
    { id: 'whisper_threats', label: 'Whisper degrading things in their ear', category: 'romantic' },
    { id: 'breathe', label: 'Breathe them in like a drug', category: 'romantic' },
    { id: 'surrender', label: 'Let them take control', category: 'romantic' },
    { id: 'corner', label: 'Corner them and close in', category: 'physical' },
    { id: 'dominance', label: 'Show them your true dominance', category: 'bdsm' },
    { id: 'risk', label: 'Risk getting caught together', category: 'activity' },
    { id: 'hunt_together', label: 'Hunt together that night', category: 'activity' },
    { id: 'aftercare', label: 'Aftercare and comfort', category: 'romantic' },
    { id: 'safeword', label: 'Establish safe words', category: 'bdsm' }
  ],
  romantic: [
    { id: 'whisper_threats', label: 'Whisper degrading things in their ear', category: 'romantic' },
    { id: 'breathe', label: 'Breathe them in like a drug', category: 'romantic' },
    { id: 'claim_mouth', label: 'Claim their mouth completely', category: 'romantic' },
    { id: 'neck_tongue', label: 'Run your tongue along their neck', category: 'romantic' },
    { id: 'surrender', label: 'Let them take control', category: 'romantic' },
    { id: 'aftercare', label: 'Aftercare and comfort', category: 'romantic' }
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
    { id: 'watch', label: 'Make them watch you', category: 'bdsm' },
    { id: 'safeword', label: 'Establish safe words', category: 'bdsm' }
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

    const getOutcomes = (vampireGender) => ({
      kiss_hard: `You slammed them against the wall, your mouth claiming theirs. Hard. Desperate. Fucking them with your tongue like it was your only purpose. They matched your intensity, hands gripping your shirt like they'd die without you.`,
      trail: `Your fingers traced slowly down their chest, across their stomach, lower. Every touch made them shudder. You stopped just short of their pussy or cock. Control. That's the power play.`,
      push_bed: `You pushed them back onto the bed. They landed hard, eyes wild, waiting. "Let me see that gorgeous body," you whispered, moving between their legs.`,
      straddle: `You straddled their body, keeping them pinned with your weight. They tried to touch you and you grabbed their wrist. "Not yet." The anticipation was destroying them.`,
      grip_throat: `You wrapped your hand around their throat, fingers pressing just enough. Not to hurt. To possess. To remind them exactly who was in control. They tilted their head back, exposing themselves completely to you.`,
      neck_tongue: `You ran your tongue along the curve of their neck, slow and deliberate. They gasped, their whole body trembling. You bit down hard enough to mark them. That's how you claimed what was yours.`,
      knees: `You pulled them down to their knees in front of you. "Look at me." Eyes up, and they obeyed instantly. "You want my cock?" you asked. They nodded desperately.`,
      from_behind: `You took them from behind, hands gripping their hips hard enough to leave bruises. Raw. Primal. No rhythm but what you wanted. "You take it so good," you growled.`,
      watch: `You made them watch as you stroked yourself slowly. "You see what you do to me?" Every inch of them focused on you. They were soaked and you hadn't even touched them yet.`,
      bind_control: `You bound their wrists with leather. They tested the restraints, pulling against them, and smiled up at you. "I'm all yours," they breathed. You grabbed their chin. "That's right, you're mine."`,
      taste: `You tasted every inch of them. Tongue on their skin, working your way down. Their back arched off the bed. When you got between their legs, they came just from you looking at them. "Patience," you whispered against their skin.`,
      beg: `You brought them to the edge over and over. Stop. Back up. Edge again. "Please, please, I need you inside me," they begged. "I know what you need," you said, refusing to give it to them. "Beg harder."`,
      wall: `You pressed them hard against the wall, your body crushing theirs. No gentleness. No mercy. Just raw fucking need. You filled them completely and they came immediately, unable to handle the intensity of you.`,
      claim_mouth: `You claimed their mouth completely. Deep. Possessive. Your tongue fucking theirs like you were claiming ownership. When you pulled away, they were gasping. "Mine," you whispered. They nodded, eyes glazed over.`,
      mark: `You marked their skin with your lips and teeth. Neck. Chest. Thighs. Anywhere that would show. "Let everyone know who you belong to," you whispered. They spread their legs wider, desperate for more.`,
      whisper_threats: `You whispered dirty things into their ear while your hand moved between their legs. "You're such a slut for me, aren't you?" "Yes, only for you." Your fingers moved faster. "Come for me." And they did.`,
      breathe: `You breathed them in like a drug you were addicted to. Their skin, their scent, the way they sounded when you touched them. One taste would never be enough. You'd need this cock or pussy again and again.`,
      surrender: `You let them take control. Gave yourself over completely, something you never did. And they knew it. Used it. Fucked you raw like they'd been waiting for this moment. You came harder than you ever had.`,
      corner: `You cornered them, moving in slowly. They had their back to the wall, nowhere to run. You dropped to your knees. "I want to taste you," you said. They came the moment your tongue touched their clit or the tip of their cock.`,
      dominance: `You showed them exactly what you were capable of. Flipped them over. Held them down. Made them take what you gave them. "Say my name," you commanded. "Again." They were yours completely.`,
      risk: `You pulled them into a dark corner, knowing people could walk by any second. The danger made everything hotter. You fucked them fast and hard while keeping one hand over their mouth so they wouldn't scream.`,
      hunt_together: `You hunted together that night. The kill sent adrenaline and bloodlust through your veins. When you finally had them alone, all that predatory energy exploded. You fucked them like the hunt itself was inside you.`,
      aftercare: `After the intensity faded, you held them close. "Are you okay? Do you need water?" You brushed their hair back gently, pressed soft kisses to their forehead. "You were perfect," you whispered. They melted into you, completely safe.`,
      safeword: `"Red means stop, yellow means slow down, green means more," you said, making sure they understood. "Always," they promised. You had rules. You had trust. And that made everything hotter.`
    });

    const outcomes = getOutcomes();

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
        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
          {currentActions.map(action => (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => handleAction(action, validPartners[0] || { name: 'them' })}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl py-3 px-5 font-medium transition-all text-sm"
            >
              {action.label}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}