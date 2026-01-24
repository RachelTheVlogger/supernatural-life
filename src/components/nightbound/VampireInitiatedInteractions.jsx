import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const VAMPIRE_ACTIONS = {
  all: [
    { id: 'vamp_corner', label: 'Corner you immediately', category: 'physical' },
    { id: 'vamp_fangs', label: 'Show your fangs', category: 'physical' },
    { id: 'vamp_bite_neck', label: 'Bite their neck', category: 'physical' },
    { id: 'vamp_pin_wall', label: 'Pin them to the wall', category: 'physical' },
    { id: 'vamp_eyes_glow', label: 'Eyes glow red', category: 'romantic' },
    { id: 'vamp_speed_move', label: 'Move with supernatural speed', category: 'physical' },
    { id: 'vamp_thrall', label: 'Try to thrall them', category: 'bdsm' },
    { id: 'vamp_whisper_dark', label: 'Whisper dark promises', category: 'romantic' },
    { id: 'vamp_blood_taste', label: 'Want to taste their blood', category: 'physical' },
    { id: 'vamp_claim', label: 'Claim them as yours', category: 'bdsm' },
    { id: 'vamp_tender', label: 'Be surprisingly tender', category: 'sweet' },
    { id: 'vamp_jealous', label: 'Show jealousy', category: 'romantic' },
    { id: 'vamp_protective', label: 'Become fiercely protective', category: 'sweet' },
    { id: 'vamp_confess', label: 'Confess feelings', category: 'romantic' },
    { id: 'vamp_seduce', label: 'Slowly seduce you', category: 'physical' },
    { id: 'vamp_dangerous', label: 'Show how dangerous you are', category: 'bdsm' },
    { id: 'vamp_vulnerable', label: 'Show vulnerability', category: 'sweet' },
    { id: 'vamp_dance', label: 'Dance with you', category: 'sweet' },
    { id: 'vamp_breath', label: 'Breathe against your neck', category: 'physical' },
    { id: 'vamp_possessive', label: 'Be possessive', category: 'bdsm' }
  ],
  romantic: [
    { id: 'vamp_eyes_glow', label: 'Eyes glow red', category: 'romantic' },
    { id: 'vamp_whisper_dark', label: 'Whisper dark promises', category: 'romantic' },
    { id: 'vamp_jealous', label: 'Show jealousy', category: 'romantic' },
    { id: 'vamp_confess', label: 'Confess feelings', category: 'romantic' }
  ],
  sweet: [
    { id: 'vamp_tender', label: 'Be surprisingly tender', category: 'sweet' },
    { id: 'vamp_protective', label: 'Become fiercely protective', category: 'sweet' },
    { id: 'vamp_vulnerable', label: 'Show vulnerability', category: 'sweet' },
    { id: 'vamp_dance', label: 'Dance with you', category: 'sweet' }
  ],
  physical: [
    { id: 'vamp_corner', label: 'Corner you immediately', category: 'physical' },
    { id: 'vamp_fangs', label: 'Show your fangs', category: 'physical' },
    { id: 'vamp_bite_neck', label: 'Bite their neck', category: 'physical' },
    { id: 'vamp_pin_wall', label: 'Pin them to the wall', category: 'physical' },
    { id: 'vamp_speed_move', label: 'Move with supernatural speed', category: 'physical' },
    { id: 'vamp_blood_taste', label: 'Want to taste their blood', category: 'physical' },
    { id: 'vamp_seduce', label: 'Slowly seduce you', category: 'physical' },
    { id: 'vamp_breath', label: 'Breathe against your neck', category: 'physical' }
  ],
  bdsm: [
    { id: 'vamp_thrall', label: 'Try to thrall them', category: 'bdsm' },
    { id: 'vamp_claim', label: 'Claim them as yours', category: 'bdsm' },
    { id: 'vamp_dangerous', label: 'Show how dangerous you are', category: 'bdsm' },
    { id: 'vamp_possessive', label: 'Be possessive', category: 'bdsm' }
  ]
};

export default function VampireInitiatedInteractions({ vampire, hunter, onClose }) {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');

  const categories = ['all', 'romantic', 'sweet', 'physical', 'bdsm'];
  const currentActions = VAMPIRE_ACTIONS[selectedCategory] || VAMPIRE_ACTIONS.all;

  const getVampireOutcomes = () => {
    return {
      vamp_corner: [
        `Before you can even process what's happening, ${vampire.vampire_name} moves with inhuman speed, cornering you. Their eyes glow crimson red as they lean in close. "Mine," they breathe.`,
        `You're suddenly pressed against the wall, ${vampire.vampire_name}'s body blocking any escape. Their presence is overwhelming—ancient, powerful, entirely focused on you.`,
        `${vampire.vampire_name} moves like liquid shadow, trapping you between their body and the wall. The air crackles with tension and hunger.`
      ],
      vamp_fangs: [
        `${vampire.vampire_name} smiles, and fangs extend slowly from their upper teeth. The movement is deliberate, a warning. A promise. Your heart races.`,
        `Their lips pull back to reveal pristine white fangs. Centuries of predation reflected in that single smile. You've never wanted something so dangerous.`,
        `Fangs slide down like a predator preparing to strike. The raw animal hunger in their eyes makes your knees weak.`
      ],
      vamp_bite_neck: [
        `${vampire.vampire_name}'s lips find your neck. Their fangs brush your skin—a warning before they bite. Not hard. Just enough to make you gasp.`,
        `You feel their fangs sink into your neck with shocking gentleness. The pleasure of it surprises you, mixing with the thrill of danger.`,
        `Their mouth finds your neck and they bite, careful not to draw much blood but enough to leave marks. Their claim on you.`
      ],
      vamp_eyes_glow: [
        `${vampire.vampire_name}'s eyes shift from their normal color to burning crimson. It's terrifying and beautiful. The hunger in that gaze unmakes you.`,
        `Their eyes begin to glow, the red intensifying with each moment they look at you. You feel completely seen. Completely desired.`,
        `The world seems to freeze as ${vampire.vampire_name}'s eyes turn blood red, staring directly into your soul.`
      ],
      vamp_speed_move: [
        `In a blink, ${vampire.vampire_name} is everywhere at once—their speed inhuman, terrifying, exhilarating. You're breathless.`,
        `They move faster than your eyes can follow, circling you with predatory grace. You've never been so aware of how outmatched you are.`,
        `One moment they're across the room, the next they're right in front of you. Their supernatural nature laid bare.`
      ],
      vamp_pin_wall: [
        `${vampire.vampire_name} pins you to the wall effortlessly, one hand around your throat—not choking, just possessive. Your pulse quickens.`,
        `You're pinned against the wall, utterly trapped by their strength. There's no escape, and somehow that thrills you.`,
        `With inhuman strength, ${vampire.vampire_name} presses you against the wall, making clear exactly what they are and how much power they have over you.`
      ],
      vamp_thrall: [
        `${vampire.vampire_name}'s gaze intensifies, and you feel their vampire power reaching for your mind. It's seductive, dangerous, impossible to resist.`,
        `Their voice becomes something other—hypnotic, commanding. You feel the compulsion pulling at your thoughts, your will.`,
        `${vampire.vampire_name} tries to slip into your mind, to bind you to them. For a moment, everything goes hazy.`
      ],
      vamp_whisper_dark: [
        `"I could keep you forever," ${vampire.vampire_name} whispers against your ear. "Make you forget the sunlight. Make you forget anything but me."`,
        `Their voice is velvet darkness as they whisper impossible things—eternity, bloodlust, surrender. You want to say yes to all of it.`,
        `"Let me have you," they breathe. "In every way. For as long as I want." The promise in their voice unmakes you.`
      ],
      vamp_blood_taste: [
        `${vampire.vampire_name}'s eyes lock on the pulse point in your neck. You can feel their hunger, raw and barely restrained. It's thrilling.`,
        `Their attention suddenly becomes laser-focused on your blood. The need in their expression is primal, barely controlled.`,
        `You watch their gaze drift to your neck, hungry. The predator looking at prey. Except you want to be caught.`
      ],
      vamp_claim: [
        `"You're mine," ${vampire.vampire_name} says with absolute certainty. They kiss you like they're branding you, like they're claiming every part of you.`,
        `The possession in their kiss is unmistakable. They're marking you as theirs, and you let them. You want to be theirs.`,
        `${vampire.vampire_name}'s claiming you with lips and teeth and an intensity that says this isn't temporary. You belong to them.`
      ],
      vamp_tender: [
        `Despite being a centuries-old predator, ${vampire.vampire_name}'s touch is surprisingly gentle. Tender. Like you're something precious.`,
        `${vampire.vampire_name} touches you like you're made of glass, with reverence and care. It's unexpected and heartbreaking.`,
        `Their touch is soft, almost reverent. They kiss you gently, carefully, like they're afraid of breaking you.`
      ],
      vamp_jealous: [
        `A flash of possessive anger crosses ${vampire.vampire_name}'s face. "Don't ever let anyone else touch you like this," they growl.`,
        `"You're mine," they say with an edge of danger. The jealousy radiating off them is intoxicating.`,
        `${vampire.vampire_name}'s eyes narrow dangerously. "Did anyone else...?" The jealousy is raw and real.`
      ],
      vamp_protective: [
        `${vampire.vampire_name} suddenly pulls you close, protective and fierce. "I won't let anyone hurt you. Ever," they vow.`,
        `In that moment, they're not a predator—they're your shelter. Their protective instinct is overwhelming.`,
        `${vampire.vampire_name} wraps around you like armor. Whatever threatens you will have to go through them first.`
      ],
      vamp_confess: [
        `"I'm in love with you," ${vampire.vampire_name} says quietly. "I've been for longer than you'd believe. Forgive me."`,
        `The vulnerability in their voice surprises you. A creature of the night, confessing feelings like a mortal.`,
        `"I can't exist without you anymore," they confess. The raw emotion in their ancient eyes breaks your heart.`
      ],
      vamp_seduce: [
        `${vampire.vampire_name} moves with deliberate seduction, slow and careful, making you feel every moment of anticipation.`,
        `Each touch is calculated to drive you mad with want. They know exactly what they're doing to you.`,
        `They seduce you slowly, deliberately, savoring every gasp and shiver they pull from you.`
      ],
      vamp_dangerous: [
        `${vampire.vampire_name} lets you see what they really are—ancient, powerful, perfectly capable of ending you. And you've never wanted anything more.`,
        `They flash their power like a threat and a promise. You're playing with something far beyond your understanding.`,
        `In this moment, you see the full extent of their supernatural nature. It should terrify you. Instead, you're magnetized.`
      ],
      vamp_vulnerable: [
        `For once, ${vampire.vampire_name} drops their perfect mask. You see the loneliness of centuries in their eyes.`,
        `They let you see their raw vulnerability—the weight of immortality, the fear of losing you.`,
        `Cracks appear in their armor. For a moment, they're not a powerful vampire—they're just someone afraid of being alone.`
      ],
      vamp_dance: [
        `${vampire.vampire_name} pulls you into a slow dance to music only they can hear. Graceful, sensual, intimate.`,
        `They sway with you, moving like they've been dancing with you for centuries. Maybe they have, in their dreams.`,
        `In their arms, you move together like you were made to fit. Slow. Perfect. Everything else fades away.`
      ],
      vamp_breath: [
        `${vampire.vampire_name}'s cool breath brushes your neck. They breathe you in like you're sustenance, nourishment, home.`,
        `You feel their breath against your skin—a reminder that they're real, they're here, they want you.`,
        `The contrast of their cool breath against your warm skin is electric. You tilt your head, giving them more access.`
      ],
      vamp_possessive: [
        `"No one else will ever have you like this," ${vampire.vampire_name} says, their possessiveness fierce and absolute.`,
        `Their hands grip you possessively, making clear to any invisible observer that you belong to them.`,
        `${vampire.vampire_name} marks you with kisses and touches, branding you as theirs. And you love it.`
      ]
    };
  };

  const selectRandomOutcome = (actionId) => {
    const outcomes = getVampireOutcomes();
    const outcomeList = outcomes[actionId];
    if (Array.isArray(outcomeList)) {
      return outcomeList[Math.floor(Math.random() * outcomeList.length)];
    }
    return outcomeList || 'A moment shared.';
  };

  const handleAction = async (action) => {
    setProcessing(true);

    setTimeout(async () => {
      try {
        const outcome = selectRandomOutcome(action.id);
        await base44.entities.NightLog.create({
          entry: `${vampire.vampire_name}: ${outcome}`,
          category: 'interaction',
          intensity: 'high'
        });

        setOutcome(outcome);
        queryClient.invalidateQueries();

        setTimeout(() => {
          setProcessing(false);
          setOutcome('');
        }, 6000);
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
          className="bg-gray-900 rounded-2xl p-8 max-w-md w-full text-center border-2 border-red-500/50"
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-200 text-lg leading-relaxed italic"
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
          <span className="text-4xl">🦇</span>
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
        className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-6 max-w-lg w-full border-2 border-red-500/50"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {vampire.vampire_name}
            </h2>
            <p className="text-gray-400">What do they do when you visit?</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
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
                  ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white'
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
              onClick={() => handleAction(action)}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl py-3 px-5 font-medium transition-all text-sm"
            >
              {action.label}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}