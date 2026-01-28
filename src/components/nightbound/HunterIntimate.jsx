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
    { id: 'safeword', label: 'Establish safe words', category: 'bdsm' },
    { id: 'gentle_kiss', label: 'Kiss them softly', category: 'sweet' },
    { id: 'hold_close', label: 'Hold them close', category: 'sweet' },
    { id: 'whisper_love', label: 'Whisper sweet things', category: 'sweet' },
    { id: 'forehead_kiss', label: 'Kiss their forehead', category: 'sweet' },
    { id: 'slow_dance', label: 'Dance together slowly', category: 'sweet' },
    { id: 'fingers_intertwine', label: 'Intertwine your fingers', category: 'sweet' }
  ],
  romantic: [
   { id: 'gentle_kiss', label: 'Kiss them softly', category: 'romantic' },
   { id: 'hold_close', label: 'Hold them close', category: 'romantic' },
   { id: 'whisper_love', label: 'Whisper sweet things', category: 'romantic' },
   { id: 'aftercare', label: 'Aftercare and comfort', category: 'romantic' }
  ],
  sweet: [
    { id: 'gentle_kiss', label: 'Kiss them softly', category: 'sweet' },
    { id: 'hold_close', label: 'Hold them close', category: 'sweet' },
    { id: 'whisper_love', label: 'Whisper sweet things', category: 'sweet' },
    { id: 'forehead_kiss', label: 'Kiss their forehead', category: 'sweet' },
    { id: 'slow_dance', label: 'Dance together slowly', category: 'sweet' },
    { id: 'fingers_intertwine', label: 'Intertwine your fingers', category: 'sweet' }
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
   { id: 'safeword', label: 'Establish safe words', category: 'bdsm' },
   { id: 'whisper_threats', label: 'Whisper degrading things in their ear', category: 'bdsm' }
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

export default function HunterIntimate({ hunter, vampires = [], onClose }) {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');

  const validPartners = (vampires || []).map(v => ({
    id: v?.id,
    name: v?.vampire_name || 'Unknown',
    type: 'vampire',
    icon: '🦇',
    gender: v?.gender || 'custom'
  }));

  const categories = ['all', 'romantic', 'sweet', 'physical', 'bdsm', 'social', 'activity'];

  // Filter explicit content in lite mode
  const filterExplicit = vampires[0]?.content_filter === 'lite';
  const currentActions = (INTIMATE_ACTIONS[selectedCategory] || INTIMATE_ACTIONS.all)
    .filter(action => !filterExplicit || !['bdsm', 'physical'].includes(action.category));

  const handleAction = async (action, partner) => {
    setProcessing(true);
    setSelectedAction(action);

    const vampireGender = partner.gender || 'custom';
    const genitalReference = vampireGender === 'woman' ? 'pussy' : 'cock';
    const stimulation = vampireGender === 'woman' ? 'clit' : 'cock';

    const getOutcomes = () => {
      const outcomes = {
        kiss_hard: [
          `You slammed them against the wall, your mouth claiming theirs. Hard. Desperate. Fucking them with your tongue like it was your only purpose. They matched your intensity, hands gripping your shirt like they'd die without you.`,
          `Your lips crashed into theirs with force. No finesse, just raw need. They pulled you closer, teeth grazing your lip as they kissed back with equal ferocity.`,
          `You pinned them and kissed them like your life depended on it. Deep, consuming, until they couldn't breathe. When you finally pulled back, they were completely wrecked.`
        ],
        trail: [
          `Your fingers traced slowly down their chest, across their stomach, lower. Every touch made them shudder. You stopped just short of their ${genitalReference}. Control. That's the power play.`,
          `You dragged your fingertips down their body agonizingly slow. They gasped at each touch, arching toward you. "Patience," you murmured against their skin.`,
          `Your hands explored every inch of them. Down their spine, across their ribs, lower. They trembled beneath your touch, completely at your mercy.`
        ],
        gentle_kiss: [
          `You leaned in slowly, giving them time to meet you halfway. Your kiss was soft, tender, full of affection. They sighed into you, their hand finding yours. No urgency. Just connection.`,
          `Your lips met theirs gently, a butterfly-soft touch that made their heart race. When you pulled back, they were smiling, eyes closed.`,
          `You kissed them like they were the most precious thing in the world. Slow. Careful. Full of care. They melted into you completely.`
        ],
        hold_close: [
          `You wrapped your arms around them and just held them. No words. No demands. Just the warmth of being close to someone you cared about. They rested their head on your chest, listening to your heartbeat.`,
          `You pulled them into your arms and held them tight against your chest. They fit perfectly there. You could feel them relax, all tension melting away.`,
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
           `You took them from behind, filling their ${genitalReference} completely. They gasped and pressed back against you, surrendering to the angle that let you go so deep. Their moans were desperate, wrecked.`,
           `From behind, you could see their entire body respond to you. They pressed back, taking you deeper into their ${genitalReference}, completely lost in the sensation. The sounds they made were absolutely intoxicating.`,
           `You pulled them close from behind, driving into them relentlessly. They dropped their head back against your shoulder, completely undone, your name the only word they could manage.`
         ],
         taste: [
           `You tasted every inch of them, taking your time. Your mouth traveled down their body, finding their ${genitalReference} and teasing it mercilessly while they writhed beneath you, gasping out breathless pleas. You didn't stop. Not yet.`,
           `You kissed your way down their body, sucking marks into their skin as you went. When you reached their ${genitalReference}, you worked the ${stimulation} with your tongue. They were already shaking, already desperate.`,
           `You explored them with your mouth like you had all the time in the world. Your tongue found their ${genitalReference} and every whimper told you exactly what they wanted. You gave it to them—slowly, deliberately, until they were begging.`
         ],
         mark: [
           `You marked them everywhere—their neck, their shoulders, their inner thighs. Showing the world they belonged to you. By the time you were done, they were covered in evidence of what you'd done and dripping with arousal.`,
           `You sucked marks into their skin and then moved between their legs to mark their ${genitalReference} with your mouth too. They arched into you, moaning your name, their ${genitalReference} swollen and glistening. Completely wrecked.`,
           `Dark marks bloomed across their skin. You traced the bruises with your tongue, making them shudder. When you spread their legs and marked their inner thighs, they gasped. "Don't stop," they begged breathlessly.`
         ],
         watch: [
           `You made them watch as you took pleasure from them. The power of having their eyes on you while you used them was intoxicating. They were transfixed, unable to look away.`,
           `"Watch me," you commanded, and they obeyed, eyes dark and hungry. They watched every move, every touch, completely undone by the sight of you.`,
           `You made them watch while their ${genitalReference} was completely exposed to you, glistening. The embarrassment mixed with desire in their eyes was everything.`
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
           `You fucked them against the wall, filling their ${genitalReference} completely. They came hard, legs shaking, completely wrecked.`
         ]
         };

      return outcomes;
    };

    const getVampireOutcomes = () => {
      const outcomes = {
        kiss_hard: [
          `They pulled you close and kissed you like they owned you. Deep. Claiming. You melted into them completely.`,
          `Their mouth found yours with urgency. Desperate. Hungry. You gave yourself over to them entirely.`,
          `They kissed you senseless, leaving you breathless and wanting more. Their control was absolute.`
        ],
        gentle_kiss: [
          `They leaned in slowly and kissed you with unexpected tenderness. Soft. Careful. Like you mattered.`,
          `Their lips brushed yours gently, reverently. A kiss that felt like a promise.`,
          `They kissed your cheek softly, then your lips, each touch full of care and affection.`
        ],
        hold_close: [
          `They wrapped their arms around you and held you like they never wanted to let go. You felt completely safe.`,
          `They pulled you against them, and you fit perfectly there. Their heartbeat matching yours.`,
          `They held you close, their fingers gently stroking your back. Complete and utter comfort.`
        ],
        whisper_love: [
          `"You're everything to me," they whispered against your hair. You felt tears forming.`,
          `They whispered tender things that made your heart ache. Truths only you would ever hear.`,
          `"I'm so deeply in love with you," they breathed into your ear. The vulnerability in their voice broke you.`
        ],
        forehead_kiss: [
          `They kissed your forehead softly, tenderly. A gesture that held so much emotion.`,
          `Their lips brushed your forehead, lingering. You felt completely cherished.`,
          `They pressed a gentle kiss to your forehead, grounding you in the moment.`
        ],
        slow_dance: [
          `They swayed with you, no music needed. Just their body against yours, moving as one.`,
          `They held you and moved with you slowly, completely lost in each other.`,
          `They danced with you like you were the only person in the world that mattered.`
        ],
        fingers_intertwine: [
          `They laced their fingers with yours, squeezing gently. A silent promise of forever.`,
          `Their fingers found yours and intertwined perfectly. So simple. So everything.`,
          `They linked your hands together, and it felt like the most intimate thing in the world.`
        ]
      };
      return outcomes;
    };

    const selectRandomOutcome = (actionId, isPerspective = 'hunter') => {
      const outcomes = isPerspective === 'vampire' ? getVampireOutcomes() : getOutcomes();
      const outcomeList = outcomes[actionId];
      const action = INTIMATE_ACTIONS.all.find(a => a.id === actionId);
      const isSweet = action?.category === 'sweet' || action?.category === 'romantic';
      
      if (Array.isArray(outcomeList)) {
        return outcomeList[Math.floor(Math.random() * outcomeList.length)];
      }
      return outcomeList || (isSweet ? 'A moment shared.' : '');
    };

    setTimeout(async () => {
      try {
        const hunterOutcome = selectRandomOutcome(action.id, 'hunter');
        await base44.entities.NightLog.create({
          entry: `${hunter.name}: ${hunterOutcome}`,
          category: 'interaction',
          intensity: 'high'
        });

        setOutcome(hunterOutcome);
        queryClient.invalidateQueries();

        setTimeout(() => {
          setProcessing(false);
          setOutcome('');
          setSelectedAction(null);
          setSelectedPartner(null);
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
            <p className="text-gray-400">What will you do?</p>
          </div>
          <button onClick={onClose || (() => window.history.back())} className="text-gray-400 hover:text-white">
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