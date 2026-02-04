import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Heart, Droplets, Zap, BookOpen } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const VAMPIRE_INTERACTIONS = [
  { id: 'feed_together', label: 'Hunt and feed together', category: 'bonding', xp: 10 },
  { id: 'blood_exchange', label: 'Exchange blood intimately', category: 'intimate', xp: 15 },
  { id: 'share_power', label: 'Share vampire power', category: 'bonding', xp: 20 },
  { id: 'merged_hunt', label: 'Merged consciousness hunt', category: 'intimate', xp: 25 },
  { id: 'eternal_bond', label: 'Strengthen eternal bond', category: 'bonding', xp: 15 },
  { id: 'vampire_passion', label: 'Vampire passion (no limits)', category: 'intimate', xp: 20 },
  { id: 'teach_me', label: 'Teach me your ways', category: 'training', xp: 0 },
  { id: 'bloodlust_control', label: 'Learn bloodlust control', category: 'training', xp: 30 },
  { id: 'advanced_feeding', label: 'Advanced feeding techniques', category: 'training', xp: 25 },
  { id: 'power_mastery', label: 'Master vampire powers', category: 'training', xp: 35 },
  { id: 'kiss_hard', label: 'Pin them and kiss them hard', category: 'physical', xp: 8 },
  { id: 'trail', label: 'Trail fingers down their body', category: 'physical', xp: 10 },
  { id: 'push_bed', label: 'Push them onto the bed', category: 'physical', xp: 12 },
  { id: 'straddle', label: 'Straddle them', category: 'physical', xp: 12 },
  { id: 'grip_throat', label: 'Grip their throat', category: 'physical', xp: 15 },
  { id: 'neck_tongue', label: 'Run your tongue along their neck', category: 'physical', xp: 10 },
  { id: 'knees', label: 'Push them to their knees', category: 'bdsm', xp: 18 },
  { id: 'from_behind', label: 'Take them from behind', category: 'physical', xp: 20 },
  { id: 'watch', label: 'Make them watch you', category: 'bdsm', xp: 15 },
  { id: 'bind_control', label: 'Bind them and take control', category: 'bdsm', xp: 20 },
  { id: 'taste', label: 'Taste every inch of them', category: 'physical', xp: 18 },
  { id: 'beg', label: 'Make them beg for you', category: 'bdsm', xp: 15 },
  { id: 'wall', label: 'Take them against the wall', category: 'physical', xp: 20 },
  { id: 'claim_mouth', label: 'Claim their mouth completely', category: 'physical', xp: 12 },
  { id: 'mark', label: 'Mark every part of them', category: 'physical', xp: 15 },
  { id: 'breathe', label: 'Breathe them in like a drug', category: 'romantic', xp: 10 },
  { id: 'corner', label: 'Corner them and close in', category: 'physical', xp: 12 },
  { id: 'dominance', label: 'Show them your true dominance', category: 'bdsm', xp: 22 },
  { id: 'risk', label: 'Risk getting caught together', category: 'activity', xp: 10 },
  { id: 'hunt_together', label: 'Hunt together that night', category: 'activity', xp: 15 },
  { id: 'aftercare', label: 'Aftercare and comfort', category: 'romantic', xp: 8 },
  { id: 'safeword', label: 'Establish safe words', category: 'bdsm', xp: 5 },
  { id: 'gentle_kiss', label: 'Kiss them softly', category: 'sweet', xp: 8 },
  { id: 'hold_close', label: 'Hold them close', category: 'sweet', xp: 8 },
  { id: 'whisper_love', label: 'Whisper sweet things', category: 'sweet', xp: 10 },
  { id: 'forehead_kiss', label: 'Kiss their forehead', category: 'sweet', xp: 8 },
  { id: 'slow_dance', label: 'Dance together slowly', category: 'sweet', xp: 10 },
  { id: 'fingers_intertwine', label: 'Intertwine your fingers', category: 'sweet', xp: 8 }
];

const TRAINING_LESSONS = {
  bloodlust_control: {
    outcomes: [
      'Your sire pins you down as the bloodlust threatens to take over. "Control it," they whisper. "Don\'t let it control you." Slowly, you breathe. The red fades from your vision.',
      'The human\'s pulse pounds in your ears. Your sire\'s hand on your shoulder steadies you. "Feed, but stop. You can do this." You do. The human lives.',
      'Bloodlust surges through you. Your sire grips your chin, forcing you to meet their eyes. "You are not a monster. You are more." The hunger quiets.'
    ]
  },
  advanced_feeding: {
    outcomes: [
      'Your sire teaches you to feed without killing. To take just enough. To leave no trace. "This is how we survive undetected," they explain.',
      'You learn to compel the human to forget. To make them enjoy the feeding. Your sire smiles proudly. "Now you\'re thinking like a vampire."',
      'The technique is precise. A bite that brings pleasure, not pain. Your sire demonstrates, then watches as you try. "Perfect," they praise.'
    ]
  },
  power_mastery: {
    outcomes: [
      'Your sire demonstrates supernatural speed. You try. Fail. Try again. Suddenly, you\'re moving like liquid shadow. They grin. "There it is."',
      'Power flows between you as your sire guides you. You feel the ancient strength awakening. This is what you were meant to become.',
      'Your sire pushes you, testing your limits. You break through. Strength you never imagined. "You\'re a natural," they admit.'
    ]
  }
};

const INTIMATE_OUTCOMES = {
  kiss_hard: [
    `You slammed them against the wall, your mouth claiming theirs. Hard. Desperate. Fucking them with your tongue like it was your only purpose. They matched your intensity, hands gripping your shirt like they'd die without you.`,
    `Your lips crashed into theirs with force. No finesse, just raw need. They pulled you closer, teeth grazing your lip as they kissed back with equal ferocity.`,
    `You pinned them and kissed them like your life depended on it. Deep, consuming, until they couldn't breathe. When you finally pulled back, they were completely wrecked.`
  ],
  trail: [
    `Your fingers traced slowly down their chest, across their stomach, lower. Every touch made them shudder. You stopped just short of their GENITAL. Control. That's the power play.`,
    `You dragged your fingertips down their body agonizingly slow. They gasped at each touch, arching toward you. "Patience," you murmured against their skin.`,
    `Your hands explored every inch of them. Down their spine, across their ribs, lower. They trembled beneath your touch, completely at your mercy.`
  ],
  gentle_kiss: [
    `You leaned in slowly, giving them time to meet you halfway. Your kiss was soft, tender, full of affection. They sighed into you, their hand finding yours. No urgency. Just connection.`,
    `Your lips met theirs gently, a butterfly-soft touch that made their heart race. When you pulled back, they were smiling, eyes closed.`,
    `You kissed them like they were the most precious thing in the world. Slow. Careful. Full of care. They melted into you completely.`
  ],
  hold_close: [
    `You wrapped your arms around them and just held them. No words. No demands. Just the warmth of being close. They rested their head on your chest. Perfect.`,
    `You pulled them into your arms and held them tight. They fit perfectly there. You could feel them relax, all tension melting away.`,
    `You held them close, not wanting to let go. They nestled against you, safe. Wanted. Loved. This was everything.`
  ],
  whisper_love: [
    `You brushed a strand of hair from their face and whispered things only they could hear. Sweet things. True things. They looked up at you with vulnerable eyes and smiled. This was just as intimate as anything else.`,
    `"I love the way you look at me," you whispered. "The way you make me feel." They blushed, hiding their face against your neck.`,
    `You whispered tender things against their hair. Promises. Affirmations. Things you meant with your whole heart. They squeezed you tighter.`
  ],
  forehead_kiss: [
    `You tilted their chin up gently and pressed a soft kiss to their forehead. You could feel them relax against you. It was such a simple gesture, but it meant everything.`,
    `You kissed their forehead softly, lingering there. They closed their eyes, peaceful. Safe. Completely yours.`,
    `Your lips brushed against their forehead tenderly. They sighed in contentment, pressing closer to you.`
  ],
  slow_dance: [
    `You swayed together slowly in the quiet, no music but the sound of your breathing. Their head rested on your shoulder, your hand on their back. Time stopped in this moment.`,
    `You held them close and moved slowly together, no rhythm but your heartbeats. Just existing in this moment with them.`,
    `You danced with them like no one else was watching. Their arms wrapped around your neck, completely lost in you.`
  ],
  fingers_intertwine: [
    `You reached for their hand and let your fingers intertwine with theirs. You could feel their pulse match yours as you held them. Simple. Perfect. Everything you needed.`,
    `Your fingers found theirs and wove together naturally. They squeezed gently, a silent promise.`,
    `You linked your fingers with theirs. Just that. Just connection. And it was enough.`
  ],
  push_bed: [
    `You pushed them back onto the bed. They landed hard, eyes wild, waiting. "Let me see that gorgeous body," you whispered, moving between their legs.`,
    `You shoved them onto the bed and they bounced, eyes gleaming. "Your turn," they said with a smirk.`,
    `You pushed them back and they dragged you down on top of them. This was going to be fun.`
  ],
  grip_throat: [
    `You wrapped your hand around their throat, not squeezing hard—just enough. Possession. Control. They gasped, their body arching, eyes going dark with need. "Mine," you growled, and they whimpered.`,
    `Your fingers tightened around their throat and they tilted their head back, completely exposed to you. Vulnerable. Trusting. You felt them shudder as you traced your thumb along their jawline.`,
    `You gripped their throat and pulled them close, forcing them to meet your eyes. They were breathing hard, pupils dilated, completely surrendered to you. Power had never felt so intoxicating.`
  ],
  knees: [
    `You pressed them down to their knees in front of you. The submission in that position alone had them shaking. "Look at me," you commanded, and when they did, you saw the hunger in their eyes.`,
    `You guided them to their knees, their body now positioned beneath you. They looked up at you with desperate eyes, waiting for your next move. The power was absolutely intoxicating.`,
    `On their knees before you, completely vulnerable and willing. You tilted their chin up, forcing them to hold your gaze. This was what dominance looked like.`
  ],
  bind_control: [
    `You tied their wrists with deliberate care, making sure they could still feel everything. The helplessness in their eyes made your blood burn. "Let me take care of you," you whispered, and they nodded, completely trusting.`,
    `Bound and at your mercy, they tested the restraints, finding them secure. A small smile played on their lips. They wanted this. They wanted you in complete control.`,
    `You restrained them, taking your time with each knot. When you finally stepped back, they were trembling with anticipation. "What are you going to do to me?" they asked breathlessly.`
  ],
  dominance: [
    `You took control completely. Every touch, every movement was a statement: you owned them in this moment. They responded to your dominance by surrendering completely, their body responsive to every demand.`,
    `You showed them exactly what your power looked like. Not cruel, but absolute. They broke under your control in the best way, gasping your name as you claimed them.`,
    `You commanded the space, the moment, their body. Every word was an order they wanted to obey. The satisfaction of their complete submission was almost overwhelming.`
  ],
  straddle: [
    `You straddled them, your body pressed against theirs. They reached up immediately, hands exploring your back, pulling you closer. You rocked against them slowly, deliberately, making them wait.`,
    `You pinned them with your weight, your knees on either side of their hips. They groaned at the sensation, pressing up slightly, trying to get closer. "Patience," you murmured, holding them in place.`,
    `Straddling them gave you complete control. You could see every expression, feel every reaction. When you started moving, they lost their composure completely, hands gripping your thighs.`
  ],
  from_behind: [
    `You took them from behind, filling their GENITAL completely. They gasped and pressed back against you, surrendering to the angle that let you go so deep. Their moans were desperate, wrecked.`,
    `From behind, you could see their entire body respond to you. They pressed back, taking you deeper into their GENITAL, completely lost in the sensation. The sounds they made were absolutely intoxicating.`,
    `You pulled them close from behind, driving into them relentlessly. They dropped their head back against your shoulder, completely undone, your name the only word they could manage.`
  ],
  taste: [
    `You tasted every inch of them, taking your time. Your mouth traveled down their body, finding their GENITAL and teasing it mercilessly while they writhed beneath you, gasping out breathless pleas. You didn't stop. Not yet.`,
    `You kissed your way down their body, sucking marks into their skin as you went. When you reached their GENITAL, you worked the STIMULATION with your tongue. They were already shaking, already desperate.`,
    `You explored them with your mouth like you had all the time in the world. Your tongue found their GENITAL and every whimper told you exactly what they wanted. You gave it to them—slowly, deliberately, until they were begging.`
  ],
  mark: [
    `You marked them everywhere—their neck, their shoulders, their inner thighs. Showing the world they belonged to you. By the time you were done, they were covered in evidence of what you'd done and dripping with arousal.`,
    `You sucked marks into their skin and then moved between their legs to mark their GENITAL with your mouth too. They arched into you, moaning your name, their GENITAL swollen and glistening. Completely wrecked.`,
    `Dark marks bloomed across their skin. You traced the bruises with your tongue, making them shudder. When you spread their legs and marked their inner thighs, they gasped. "Don't stop," they begged breathlessly.`
  ],
  watch: [
    `You made them watch as you took pleasure from them. The power of having their eyes on you while you used them was intoxicating. They were transfixed, unable to look away.`,
    `"Watch me," you commanded, and they obeyed, eyes dark and hungry. They watched every move, every touch, completely undone by the sight of you.`,
    `You made them watch while their GENITAL was completely exposed to you, glistening. The embarrassment mixed with desire in their eyes was everything.`
  ],
  beg: [
    `You brought them right to the edge and stopped, making them beg for it. "Please," they gasped, completely desperate. You loved the power of making them ask for what they needed.`,
    `You made them beg for your touch. By the time you gave it to them, they were incoherent, completely wrecked.`,
    `"Beg for it," you demanded. They did, breathlessly, completely undone. The desperation in their voice was everything.`
  ],
  corner: [
    `You cornered them against the wall, trapping them between you and the hard surface. Nowhere to go. Completely at your mercy.`,
    `You backed them into a corner, your body blocking any escape. The desperation in their eyes was everything. "Please," they whispered.`,
    `Trapped between you and the corner, they had no choice but to take what you gave them. Desperate and needy.`
  ],
  wall: [
    `You slammed them against the wall and took them hard. The desperation, the urgency, the way they gasped your name—it was all too much.`,
    `Against the wall, you had complete control. Every thrust was deliberate. They clawed at you, completely undone.`,
    `You fucked them against the wall, filling their GENITAL completely. They came hard, legs shaking, completely wrecked.`
  ],
  neck_tongue: [
    `You ran your tongue along their neck, feeling their pulse race beneath your lips. They shuddered, tilting their head to give you more access.`,
    `Your tongue traced the line of their throat slowly. They whimpered, hands gripping your shoulders.`,
    `You licked their neck with deliberate slowness, tasting their skin. They gasped, completely vulnerable.`
  ],
  claim_mouth: [
    `You claimed their mouth completely, kissing them until they couldn't think. Deep, consuming, absolute.`,
    `Your mouth dominated theirs, tongue exploring every inch. They surrendered completely.`,
    `You kissed them like you owned them. Because in this moment, you did.`
  ],
  breathe: [
    `You breathed them in like a drug, your face buried in their neck. They were intoxicating.`,
    `You inhaled their scent deeply, completely addicted. They were everything.`,
    `You breathed them in like you couldn't get enough. And you couldn't.`
  ],
  aftercare: [
    `You held them gently afterward, stroking their hair. "You did so well," you murmured. They smiled, completely content.`,
    `You wrapped them in warmth and comfort after, checking in softly. They nestled against you, safe.`,
    `Aftercare was just as important. You held them close, whispering reassurances. They were perfect.`
  ],
  safeword: [
    `"What's your safeword?" you asked gently. They thought, then told you. Trust established.`,
    `You discussed boundaries and safewords together. Communication. Trust. Safety. All essential.`,
    `"Red means stop," they said. You nodded. "Always," you promised.`
  ],
  risk: [
    `You pulled them into a semi-public space, the risk of being caught making everything more intense.`,
    `The danger of discovery added electricity to every touch. They gasped, "Someone might see."`,
    `You didn't care who might see. You needed them now. The risk made it better.`
  ],
  hunt_together: [
    `You hunted side by side that night, two predators moving as one. The shared kill was intoxicating.`,
    `Together you stalked prey through the darkness. Partners. Equals. Perfect synchronization.`,
    `The hunt together was foreplay. By the time you caught your prey, you were ready for each other.`
  ]
};

export default function TurnedHunterVampireInteraction({ hunter, vampire, onClose }) {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'bonding', 'intimate', 'training', 'romantic', 'sweet', 'physical', 'bdsm', 'activity'];
  const currentActions = selectedCategory === 'all' 
    ? VAMPIRE_INTERACTIONS 
    : VAMPIRE_INTERACTIONS.filter(a => a.category === selectedCategory);

  const handleAction = async (action) => {
    setProcessing(true);

    setTimeout(async () => {
      try {
        let message = '';
        
        const vampireGender = vampire.gender || 'custom';
        const genitalReference = vampireGender === 'woman' ? 'pussy' : 'cock';
        const stimulation = vampireGender === 'woman' ? 'clit' : 'cock';

        if (action.category === 'training') {
          const lessons = TRAINING_LESSONS[action.id];
          if (lessons) {
            message = lessons.outcomes[Math.floor(Math.random() * lessons.outcomes.length)];
          } else {
            message = `${vampire.vampire_name} teaches you the ways of vampires. You learn quickly, your hunter instincts adapting to this new existence.`;
          }
        } else if (INTIMATE_OUTCOMES[action.id]) {
          const outcomes = INTIMATE_OUTCOMES[action.id];
          message = outcomes[Math.floor(Math.random() * outcomes.length)]
            .replace(/GENITAL/g, genitalReference)
            .replace(/STIMULATION/g, stimulation);
        } else if (action.category === 'intimate') {
          const intimateOutcomes = [
            `You and ${vampire.vampire_name} feed together, your fangs in the same victim. The shared experience is overwhelming. Electric. You feel closer than ever.`,
            `Blood exchange with your sire is unlike anything else. Their ancient blood mingles with yours. Power. Connection. Unity.`,
            `Your bodies move together with supernatural grace. Two vampires, perfectly in sync. The passion is intense, primal, endless.`,
            `${vampire.vampire_name} bites your neck as you bite theirs. Blood flowing between you. Ecstasy beyond mortal understanding.`
          ];
          message = intimateOutcomes[Math.floor(Math.random() * intimateOutcomes.length)];
        } else {
          const bondingOutcomes = [
            `You hunt side by side with ${vampire.vampire_name}. Moving as one. Predators together. The bond between sire and progeny strengthens.`,
            `${vampire.vampire_name} shares their power with you. Ancient energy flowing into your being. You feel yourself growing stronger.`,
            `The eternal bond deepens. You understand now why vampires mate for life. This connection transcends everything.`
          ];
          message = bondingOutcomes[Math.floor(Math.random() * bondingOutcomes.length)];
        }

        await base44.entities.Hunter.update(hunter.id, {
          experience: (hunter.experience || 0) + action.xp,
          vampire_power_level: Math.min(100, (hunter.vampire_power_level || 0) + Math.floor(action.xp / 5))
        });

        await base44.entities.VampireState.update(vampire.id, {
          hunter_relationship: Math.min(100, (vampire.hunter_relationship || 0) + 5)
        });

        await base44.entities.NightLog.create({
          entry: message,
          category: 'interaction',
          intensity: 'high'
        });

        setOutcome(message);
        queryClient.invalidateQueries();

        setTimeout(() => {
          setProcessing(false);
          setOutcome('');
        }, 5000);
      } catch (e) {
        console.error('Interaction failed:', e);
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
        className="bg-gradient-to-br from-gray-900 to-red-950 rounded-2xl p-6 max-w-lg w-full border-2 border-red-500/50 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Vampire Bond
            </h2>
            <p className="text-gray-400 text-sm">With your sire, {vampire.vampire_name}</p>
            <p className="text-red-400 text-xs mt-1">Bond: {vampire.hunter_relationship || 0}% • XP: {hunter.experience || 0}</p>
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
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {cat === 'all' ? '🔮 All' : 
               cat === 'bonding' ? '❤️ Bonding' : 
               cat === 'intimate' ? '💋 Intimate' : 
               cat === 'training' ? '📖 Training' :
               cat === 'romantic' ? '💕 Romantic' :
               cat === 'sweet' ? '🌸 Sweet' :
               cat === 'physical' ? '🔥 Physical' :
               cat === 'bdsm' ? '⛓️ BDSM' : '🎯 Activity'}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {currentActions.map(action => (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => handleAction(action)}
              className="w-full bg-gradient-to-r from-red-600/80 to-red-700/80 hover:from-red-600 hover:to-red-700 text-white rounded-xl py-3 px-5 font-medium transition-all text-sm text-left"
            >
              <div className="flex items-center justify-between">
                <span>{action.label}</span>
                {action.xp > 0 && (
                  <span className="text-xs bg-black/30 px-2 py-1 rounded">+{action.xp} XP</span>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-black/40 rounded-lg border border-red-500/30">
          <p className="text-red-200 text-sm">
            Your sire can teach you control, technique, and power. Train with them to master your vampire nature.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}