import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MessageCircle, Eye, Hand, Sparkles, Zap, Coffee, Music, Book, Utensils, Wine, Flame, Moon, Droplets, Wind, Smile, Lock, Star, Skull, Crown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import PowerUsage from './PowerUsage';
import TitleSelection from './TitleSelection';

const getVariantModifier = (variant, category) => {
  const modifiers = {
    devoted: { physical: 1.2, social: 1.3, activity: 1.1, power: 1.0 },
    defiant: { physical: 0.8, social: 0.9, activity: 1.0, power: 0.7 },
    dreamer: { physical: 1.0, social: 1.1, activity: 1.3, power: 1.2 }
  };
  return modifiers[variant]?.[category] || 1.0;
};

const getVariantFlavor = (variant, tier, obsessionStage) => {
  const flavors = {
    devoted: {
      low: [' Their eyes never leave you.', ' They look at you with pure devotion.', ' Every moment with you is sacred to them.'],
      mid: [' They exist to please you.', ' Your happiness is their purpose.', ' They worship you.'],
      high: [' They are utterly yours.', ' Complete surrender. Complete devotion.', ' Nothing exists but you.']
    },
    defiant: {
      low: [' They hate how much they want this.', ' Conflicted. Resistant. Yet here.', ' Their pride wars with their desire.'],
      mid: [' The fight is leaving them.', ' Resistance crumbling.', ' They\'re losing themselves in you.'],
      high: [' All defiance gone. Only need remains.', ' They have surrendered completely.', ' You broke them. They thank you for it.']
    },
    dreamer: {
      low: [' They seem distant, somewhere else.', ' Reality blurs around them.', ' Lost in their own world.'],
      mid: [' Time doesn\'t work right around you.', ' They drift between worlds.', ' You\'re the only real thing.'],
      high: [' They exist in your shadow now.', ' Reality is just a dream. You are truth.', ' Completely untethered. Floating.']
    }
  };
  
  const flavorSet = flavors[variant]?.[tier] || flavors.devoted.low;
  return flavorSet[Math.floor(Math.random() * flavorSet.length)];
};

const TURNED_VAMPIRE_INTERACTIONS = {
  vampireFeed: {
    icon: Droplets,
    label: 'Feed together',
    category: 'vampire',
    tier: 1,
    gains: [20, 35],
    outcomes: {
      mid: ['You hunted together. Blood shared. Primal connection.', 'Two vampires. One prey. Intimate violence.', 'You fed side by side. Their hunger matched yours.'],
      high: ['You bit them while they fed. Ecstasy doubled. Perfect.', 'Feeding became foreplay. Blood and lust intertwined.', 'You shared the kill. The bond deepened impossibly.']
    }
  },
  vampireSex: {
    icon: Flame,
    label: 'Vampire intimacy',
    category: 'vampire',
    tier: 1,
    minRelationship: 50,
    gains: [25, 40],
    outcomes: {
      mid: ['Vampire bodies. Supernatural stamina. Hours passed like moments.', 'They felt everything deeper now. Every touch electric.', 'Turned. Heightened senses. The pleasure was overwhelming.'],
      high: ['Two immortals. Endless night. Consuming passion.', 'You fucked like vampires. Wild. Dangerous. Perfect.', 'Supernatural pleasure. You broke furniture. Neither noticed.', 'They felt everything infinitely more. Screamed your name for hours.']
    }
  },
  vampireHunt: {
    icon: Moon,
    label: 'Hunt together',
    category: 'vampire',
    tier: 1,
    gains: [15, 25],
    outcomes: {
      mid: ['You stalked prey together. Teaching them your ways.', 'Two predators in the night. Perfectly synchronized.', 'They moved like you now. Supernatural. Deadly.'],
      high: ['You hunted as one. No words needed. Perfect unity.', 'Twin shadows. The city was yours together.', 'They\'ve become your perfect hunting companion.']
    }
  }
};

const INTERACTIONS = {
  // Physical - Tier 1 (Always available)
  touch: {
    icon: Hand,
    label: 'Touch them',
    category: 'physical',
    tier: 1,
    gains: [5, 10],
    outcomes: {
      low: ['You brushed their hand. They flinched but didn\'t pull away.', 'Your fingers traced their jaw. Their breath caught.', 'You held their face. They closed their eyes.'],
      mid: ['You pulled them close. They leaned into you.', 'Your hand in their hair. They sighed softly.', 'You touched their neck. Their pulse quickened.'],
      high: ['They pressed against you, trembling.', 'You held them. They melted into your touch.', 'Your hands on their skin. They whispered your name.']
    }
  },
  kiss: {
    icon: Heart,
    label: 'Kiss them',
    category: 'physical',
    tier: 1,
    gains: [8, 15],
    outcomes: {
      low: [
        'A soft kiss. Hesitant. They stayed still.', 
        'You kissed them gently. They tensed, then relaxed.', 
        'Your lips on theirs. Brief. Careful.',
        'You leaned in slowly. They closed their eyes. A moment.',
        'Soft pressure. Their lips parted slightly. Testing.',
        'You pulled back. They followed. Wanting more.'
      ],
      mid: [
        'You kissed them deeply. They responded eagerly.', 
        'They kissed you back with need.', 
        'Long, slow kiss. They didn\'t want it to end.',
        'Your tongue traced their lips. They gasped softly.',
        'Deeper. Hungrier. They pressed against you.',
        'You tasted them. Sweet. Wanting. Yours.'
      ],
      high: [
        'Desperate kisses. Hands everywhere. Breathless.', 
        'You devoured them. They surrendered completely.', 
        'They kissed you like drowning, like breathing.',
        'Consuming. You bit their lip. They moaned.',
        'Your hand in their hair, pulling. They whimpered.',
        'You kissed down their neck. They trembled.'
      ]
    }
  },
  cuddle: {
    icon: Smile,
    label: 'Cuddle',
    category: 'physical',
    tier: 1,
    gains: [6, 12],
    outcomes: {
      low: ['You held them carefully. They were stiff at first.', 'They leaned against you hesitantly.', 'Awkward closeness. Slowly relaxing.'],
      mid: ['They curled into you. Perfect fit.', 'You wrapped around them. They sighed contentedly.', 'Warmth. Safety. They didn\'t want to move.'],
      high: ['Tangled together. No separation. Pure comfort.', 'They nuzzled into your neck. Utterly at peace.', 'Hours passed. Neither of you noticed.']
    }
  },
  tease: {
    icon: Flame,
    label: 'Tease them',
    category: 'physical',
    tier: 1,
    gains: [7, 13],
    outcomes: {
      low: [
        'Your hand on their thigh under the table. They froze.',
        'You traced your fingers up their leg. Nobody else noticed.',
        'A whisper in their ear. Something dangerous. They blushed.',
        'Your hand moved slowly. They gripped the table.',
        'You touched them where no one could see. They gasped softly.'
      ],
      mid: [
        'Your hand moved higher. They bit their lip.',
        'You teased them in public. They tried to stay composed.',
        'Your fingers traced patterns. They were shaking.',
        'You whispered exactly what you\'d do later. They shivered.',
        'Touching them where others can\'t see. They leaned closer.'
      ],
      high: [
        'The danger of it thrilled them. Nobody noticed but you.',
        'Public place. Secret touch. They loved the risk.',
        'You teased them until they begged to leave. Now.',
        'Your touch worked its magic. Silent. Intense.',
        'The thrill of secrecy. They couldn\'t get enough.'
      ]
    }
  },
  makeout: {
    icon: Flame,
    label: 'Make out',
    category: 'physical',
    tier: 2,
    minRelationship: 30,
    gains: [12, 20],
    outcomes: {
      mid: ['Heated kisses. Exploring hands. Growing intensity.', 'You pushed them against the wall. They gasped.', 'Breathless. Flushed. Wanting more.'],
      high: ['Consuming passion. You couldn\'t get close enough.', 'They pulled you down. Desperate. Hungry.', 'Time stopped. Only sensation remained.']
    }
  },
  intimate: {
    icon: Sparkles,
    label: 'Be intimate',
    category: 'physical',
    tier: 2,
    minRelationship: 40,
    gains: [15, 25],
    outcomes: {
      mid: [
        'Skin on skin. Careful. Tender. They trusted you completely.', 
        'You undressed them slowly. They watched you with dark eyes.', 
        'Bodies intertwined. Time disappeared.',
        'Your hands explored. They arched into your touch.',
        'Clothes discarded. Bare skin against yours. Warm.',
        'You laid them down gently. They pulled you closer.',
        'Fingers tracing every curve. They shivered.',
        'You kissed down their body. Soft sounds escaping them.'
      ],
      high: [
        'Wild. Consuming. You took everything they offered.', 
        'They begged. You obliged. Perfect surrender.', 
        'Afterwards, they stayed in your arms. Utterly content.',
        'You fucked them slowly, deeply. They moaned your name.',
        'They came undone beneath you, trembling, gasping.',
        'Your name on their lips. Over and over.',
        'You made them beg for more. They did. Eagerly.',
        'Intense. Raw. Primal. They loved every second.',
        'You took them hard. They screamed. Perfect.',
        'Bodies slick with sweat. Breathless. Satisfied.',
        'You pinned them down. They loved it.',
        'Every thrust deeper. They cried out.',
        'You owned them completely in that moment.'
      ]
    }
  },
  bite: {
    icon: Droplets,
    label: 'Bite (feed)',
    category: 'physical',
    tier: 2,
    minRelationship: 20,
    gains: [10, 18],
    outcomes: {
      low: ['You bit carefully. They whimpered but stayed still.', 'Your fangs pierced skin. They trembled.', 'You fed. They gasped. Fear mixed with something else.'],
      mid: ['You bit. They moaned softly. Pleasure and pain.', 'They offered their neck willingly. You drank deep.', 'Your fangs sank in. They shuddered with pleasure.'],
      high: ['They begged you to bite. You obliged. Ecstasy.', 'You fed. They came undone beneath you.', 'Feeding became intimacy. They craved your bite.']
    }
  },
  dominate: {
    icon: Flame,
    label: 'Dominate them',
    category: 'physical',
    tier: 3,
    minRelationship: 60,
    gains: [20, 30],
    outcomes: {
      mid: [
        'You commanded. They obeyed instantly.', 
        'On their knees. Eyes up. Waiting for orders.', 
        'You told them exactly how to please you. They did.',
        'Control absolute. They surrendered willingly.',
        'Your hand in their hair. Guiding. Commanding.',
        'You pushed them to the edge. Made them wait.',
        'They begged permission. You made them earn it.'
      ],
      high: [
        'Complete submission. They lived to serve you.', 
        'You fucked their throat. They took it all.', 
        'Marks on their neck. Your hands. Your ownership.',
        'You used them exactly how you wanted. Perfect.',
        'They came only when you allowed it. Total control.',
        'You spanked them until they cried. Then fucked them hard.',
        'Collar around their neck. Leash in your hand. Yours.',
        'You choked them while fucking them. They loved it.',
        'You slapped them. They thanked you. Begged for more.',
        'Tied up. Helpless. Completely at your mercy.',
        'You edged them for hours. They broke beautifully.',
        'Your cum on their face. They wore it proudly.',
        'You degraded them. They got wetter for it.',
        'Rough. Brutal. Perfect. They came screaming.',
        'You made them crawl. Beg. Earn every touch.'
      ]
    }
  },
  submit: {
    icon: Heart,
    label: 'Let them dominate',
    category: 'physical',
    tier: 3,
    minRelationship: 60,
    gains: [20, 30],
    outcomes: {
      mid: [
        'You gave them control. They took it eagerly.',
        'They pushed you down. Took what they wanted.',
        'For once, you surrendered. It felt good.',
        'They commanded you. You obeyed. Strange. Thrilling.',
        'Their hands exploring you. In charge now.',
        'You let them lead. They surprised you.',
        'They rode you hard. Taking their pleasure.'
      ],
      high: [
        'They used you for their pleasure. You loved it.',
        'They sat on your face. You worshipped them.',
        'Complete role reversal. They owned you tonight.',
        'They fucked you. Hard. You were theirs.',
        'Your pleasure second. Theirs first. Perfect.',
        'They marked you. Claimed you. Possessed you.',
        'You were their toy tonight. Willing. Eager.',
        'They edged you mercilessly. Made you beg.',
        'Tied down by them. Vulnerable. Trusting.',
        'They took everything they wanted. You gave it.',
        'Power exchange complete. Beautiful surrender.',
        'They rode you until you couldn\'t take more.',
        'Your safe word ready. Never needed. Perfect trust.',
        'They pushed your limits. You let them.',
        'Dominated completely. You craved more.'
      ]
    }
  },
  worship: {
    icon: Star,
    label: 'Let them worship you',
    category: 'physical',
    tier: 4,
    minRelationship: 70,
    gains: [25, 35],
    outcomes: {
      mid: [
        'They worshipped your body. Every inch. Devoted.', 
        'On their knees. Serving you. Perfect submission.', 
        'They treated you like a god. You allowed it.',
        'Their mouth on you. Eager. Worshipful.',
        'They kissed every part of you. Reverently.',
        'You sat back. They served. Perfect.',
        'Their tongue on you. Devoted. Tireless.',
        'They pleasured you for hours. No complaints.'
      ],
      high: [
        'Hours of worship. They existed only to please you.', 
        'Complete devotion. Your pleasure was their religion.', 
        'They served you endlessly. You took everything.',
        'Their tongue worked tirelessly. Only your pleasure mattered.',
        'You came in their mouth. They swallowed gratefully.',
        'They begged to please you again. And again.',
        'You used their mouth for your pleasure. They loved it.',
        'On their knees for hours. Never complaining.',
        'Your pleasure was everything. They lived for it.',
        'You finished on them. They wore it proudly.',
        'They sucked you until you couldn\'t stand.',
        'Their mouth was yours. They gave it freely.',
        'You fucked their face. They thanked you.',
        'They worshipped your cock with their tongue.',
        'Every drop swallowed. Grateful. Eager.'
      ]
    }
  },
  breeding: {
    icon: Flame,
    label: 'Breed them',
    category: 'physical',
    tier: 4,
    minRelationship: 75,
    gains: [30, 40],
    outcomes: {
      mid: [
        'You came deep inside. They begged for it.',
        'Claiming them completely. Filled. Owned.',
        'They wanted your seed. You gave it.',
        'Breeding them. Primal. Perfect.',
        'They clenched around you. Taking everything.',
        'You finished inside. They moaned in pleasure.'
      ],
      high: [
        'You bred them over and over. Insatiable.',
        'Every drop inside. They wanted to carry you.',
        'Primal need to fill them. You did. Repeatedly.',
        'They begged to be bred. You obliged thoroughly.',
        'Cum dripping from them. You pushed it back in.',
        'You owned them. Claimed them. Bred them.',
        'They came just from you filling them up.',
        'Multiple loads. All inside. Thoroughly bred.',
        'You made them beg for your cum. Then gave it.',
        'Breeding kink satisfied. They were yours now.',
        'You pumped them full. They loved every second.',
        'Your seed deep inside where it belongs.',
        'They felt you pulsing. Filling. Claiming.',
        'Bred properly. Thoroughly. Completely.',
        'You didn\'t pull out. Never would again.'
      ]
    }
  },
  publicUse: {
    icon: Flame,
    label: 'Use them publicly',
    category: 'physical',
    tier: 4,
    minRelationship: 80,
    gains: [25, 35],
    outcomes: {
      mid: [
        'Restroom stall. Public place. Quick and dirty.',
        'Against the alley wall. Anyone could see.',
        'Your hand over their mouth. Silencing moans.',
        'The thrill of being caught. They loved it.'
      ],
      high: [
        'You fucked them in the club bathroom. Music pounding.',
        'Bent over in the parking garage. Cars passing.',
        'They sucked you off under the table. Others nearby.',
        'Public sex. The ultimate thrill. They came hard.',
        'You took them in the changing room. Risky. Perfect.',
        'Exhibitionism satisfied. They wanted more.',
        'The danger made it better. Both of you knew it.'
      ]
    }
  },
  edging: {
    icon: Heart,
    label: 'Edge them',
    category: 'physical',
    tier: 3,
    minRelationship: 65,
    gains: [18, 28],
    outcomes: {
      mid: [
        'You brought them to the edge. Stopped. Again.',
        'Begging. Pleading. You denied them.',
        'Control absolute. Their pleasure yours to give.',
        'So close. Not yet. You decided when.'
      ],
      high: [
        'Hours of edging. They were sobbing.',
        'Denied over and over. Broken beautifully.',
        'When you finally let them cum, they screamed.',
        'Complete control. They came when allowed.',
        'Edged until they couldn\'t form words.',
        'The release was earth-shattering. Worth the wait.',
        'You broke them with denial. Perfect.',
        'They thanked you for the torture.'
      ]
    }
  },
  bdsm: {
    icon: Flame,
    label: 'BDSM scene',
    category: 'physical',
    tier: 4,
    minRelationship: 70,
    gains: [30, 40],
    outcomes: {
      mid: [
        'Ropes. Restraints. Complete surrender.',
        'Bound and blindfolded. At your mercy.',
        'Flogger. Paddle. Marks blooming.',
        'Pain and pleasure blurred together.'
      ],
      high: [
        'Full BDSM scene. Safe words ready. Never needed.',
        'You used them completely. They loved it.',
        'Suspended. Helpless. Trusting absolutely.',
        'Wax. Ice. Sensation play. Overwhelmed.',
        'They endured for you. Perfect submission.',
        'Aftercare as important as the scene.',
        'Beautiful marks. Evidence of trust.',
        'Subspace achieved. Floating. Perfect.',
        'You owned every part of them tonight.',
        'Safe. Sane. Consensual. Intense.'
      ]
    }
  },
  degradation: {
    icon: Skull,
    label: 'Degrade them',
    category: 'physical',
    tier: 4,
    minRelationship: 75,
    gains: [20, 30],
    outcomes: {
      mid: [
        'You called them your slut. They moaned.',
        'Degrading words. They got wetter.',
        'You made them say what they are. They obeyed.',
        'Humiliation kink satisfied.'
      ],
      high: [
        'You degraded them thoroughly. They thanked you.',
        'Called them your whore. Your toy. Your pet.',
        'They came from the degradation alone.',
        'You spit in their mouth. They swallowed.',
        'Treated like an object. They loved it.',
        'Verbal degradation. Physical use. Perfect.',
        'You made them beg to be degraded more.',
        'Your filthy slut. They wore the title proudly.',
        'Degraded and used. Exactly what they needed.',
        'They knew their place. Beneath you.'
      ]
    }
  },
  exhibition: {
    icon: Eye,
    label: 'Make them perform',
    category: 'physical',
    tier: 4,
    minRelationship: 70,
    gains: [25, 35],
    outcomes: {
      mid: [
        'You made them strip. Slowly. For you.',
        'They touched themselves. You watched.',
        'Performance. Seduction. Just for you.',
        'Your eyes on them. That was enough.'
      ],
      high: [
        'They performed for you. Every fantasy acted out.',
        'Strip tease. Lap dance. Complete devotion.',
        'You directed every move. They obeyed perfectly.',
        'They masturbated while you watched. Intense.',
        'Your personal show. They gave everything.',
        'Performed like a professional. Just for you.',
        'Exhibition kink satisfied. They felt seen.',
        'You made them cum while performing. Beautiful.'
      ]
    }
  },
  orgasmControl: {
    icon: Zap,
    label: 'Control their orgasms',
    category: 'physical',
    tier: 3,
    minRelationship: 68,
    gains: [22, 32],
    outcomes: {
      mid: [
        'They could only cum with permission.',
        'You controlled every orgasm. Total power.',
        'Denied. Allowed. Denied. Your choice.',
        'They begged for release. You decided.'
      ],
      high: [
        'Orgasm control absolute. They came on command.',
        'You trained them. Now they need permission.',
        'Multiple orgasms granted. Then denied.',
        'They couldn\'t cum without you anymore.',
        'Control so complete they felt it always.',
        'You owned their pleasure completely.',
        'Permission granted. They shattered.',
        'Denied for days. The release was explosive.'
      ]
    }
  },
  collar: {
    icon: Heart,
    label: 'Put a collar on them',
    category: 'physical',
    tier: 4,
    minRelationship: 80,
    gains: [30, 40],
    outcomes: {
      mid: [
        'You fastened the collar. They wore it proudly.',
        'Leather around their neck. Your mark.',
        'The collar was beautiful. So were they.',
        'They touched it reverently. Your claim.'
      ],
      high: [
        'Collared. Owned. They belonged to you completely.',
        'The collar never comes off. Ever.',
        'They traced the collar. Your property.',
        'Everyone would know they were taken. Yours.',
        'Permanent collar. Permanent ownership.',
        'They kissed your hand after you collared them.',
        'Your name engraved on the collar. Perfect.',
        'Collared and claimed. Absolutely yours.'
      ]
    }
  },
  train: {
    icon: Zap,
    label: 'Train them',
    category: 'physical',
    tier: 3,
    minRelationship: 65,
    gains: [20, 30],
    outcomes: {
      mid: [
        'Training session. They learned quickly.',
        'You taught them how you like it. They obeyed.',
        'Position training. They held it perfectly.',
        'Obedience training. Getting better each time.'
      ],
      high: [
        'Fully trained. They anticipated your needs.',
        'Perfect obedience. Perfect submission.',
        'They knew exactly how to please you now.',
        'Training complete. Your perfect servant.',
        'Pavlovian response. They got wet at your command.',
        'You could control them with a look now.',
        'Trained to orgasm on command. Incredible.',
        'They were perfectly conditioned. Yours.'
      ]
    }
  },
  punish: {
    icon: Flame,
    label: 'Punish them',
    category: 'physical',
    tier: 3,
    minRelationship: 60,
    gains: [18, 28],
    outcomes: {
      mid: [
        'They misbehaved. Punishment required.',
        'Spanking. Counting. Apologizing.',
        'Punishment earned. Punishment given.',
        'They took it well. Learned their lesson.'
      ],
      high: [
        'Severe punishment. They needed it.',
        'Tears. Apologies. Forgiveness. Complete.',
        'You punished them thoroughly. They thanked you.',
        'Bruises as reminders. Beautiful.',
        'Punishment was intense. They came anyway.',
        'They loved being punished by you.',
        'Discipline maintained. Order restored.',
        'The punishment was the reward.'
      ]
    }
  },
  service: {
    icon: Heart,
    label: 'Make them service you',
    category: 'physical',
    tier: 4,
    minRelationship: 75,
    gains: [25, 35],
    outcomes: {
      mid: [
        'They serviced you eagerly. Devoted.',
        'Their mouth. Your pleasure. Perfect service.',
        'Service rendered. Excellently.',
        'They existed to serve. They did it well.'
      ],
      high: [
        'Hours of service. No complaints. Perfect.',
        'They serviced you until you couldn\'t take more.',
        'Expert service. Trained well. Rewarded.',
        'Their purpose was your pleasure. They fulfilled it.',
        'Service was worship. Worship was love.',
        'They begged to serve you more. Insatiable.',
        'Perfect service deserved rewards. You gave them.',
        'They were born to serve you. Natural.'
      ]
    }
  },
  multiple: {
    icon: Flame,
    label: 'Make them cum multiple times',
    category: 'physical',
    tier: 4,
    minRelationship: 70,
    gains: [25, 35],
    outcomes: {
      mid: [
        'Once. Twice. Three times. They lost count.',
        'Multiple orgasms. They were shaking.',
        'You didn\'t stop. Kept going. Overwhelming.',
        'So many orgasms they could barely speak.'
      ],
      high: [
        'Orgasm after orgasm. Endless. Perfect.',
        'They begged you to stop. You didn\'t.',
        'Multiple orgasms until they broke. Beautiful.',
        'Overstimulated. Crying. Still cumming.',
        'You made them cum until they passed out.',
        'Record broken. New personal best.',
        'Their body was yours to use endlessly.',
        'Multiple orgasms were just the beginning.'
      ]
    }
  },
  Marathon: {
    icon: Flame,
    label: 'All night session',
    category: 'physical',
    tier: 4,
    minRelationship: 80,
    gains: [35, 45],
    outcomes: {
      mid: [
        'Hours passed. Still going. Tireless.',
        'All night. Every position. Exhausting.',
        'Marathon session. Endurance tested.',
        'Dawn approached. Neither stopped.'
      ],
      high: [
        'All night. Relentless. Insatiable. Perfect.',
        'The sun rose. You were still fucking them.',
        'Hours blurred together. Pure sensation.',
        'Marathon sex. They couldn\'t walk after.',
        'All night session. They passed out twice.',
        'Supernatural stamina. Human limits exceeded.',
        'The night belonged to you both. Completely.',
        'When you finally stopped, they couldn\'t move.'
      ]
    }
  },
  bondage: {
    icon: Lock,
    label: 'Bind them',
    category: 'physical',
    tier: 4,
    minRelationship: 75,
    gains: [22, 32],
    outcomes: {
      mid: [
        'Ropes. Knots. Helpless. Beautiful.',
        'Bound tight. Couldn\'t move. Trusted you.',
        'Bondage art. They were the canvas.',
        'Tied up. Vulnerable. Yours.'
      ],
      high: [
        'Complex bondage. Shibari. Art and restraint.',
        'Bound completely. Helpless. Loving it.',
        'You tied them up and used them for hours.',
        'Bondage so tight they couldn\'t even squirm.',
        'Rope marks stayed for days. Reminders.',
        'They floated in the restraints. Subspace.',
        'Bound. Helpless. Perfectly safe with you.',
        'The bondage was meditation. Beautiful surrender.'
      ]
    }
  },
  
  // Social - Tier 1
  talk: {
    icon: MessageCircle,
    label: 'Talk deeply',
    category: 'social',
    tier: 1,
    gains: [10, 18],
    outcomes: {
      low: ['You asked about their life before. They spoke quietly.', 'They told you about their fears. You listened.', 'Conversation in low voices. Building trust.'],
      mid: ['They opened up about everything. You understood them.', 'You shared pieces of yourself. They treasured it.', 'Deep conversation until dawn approached.'],
      high: ['You talked about forever. They said yes.', 'No words needed anymore. You just know.', 'They confessed everything. You already knew.']
    }
  },
  joke: {
    icon: Smile,
    label: 'Joke around',
    category: 'social',
    tier: 1,
    gains: [5, 10],
    outcomes: {
      low: ['You made them smile. Small victory.', 'They laughed softly. Walls lowering.', 'Playful banter. They relaxed.'],
      mid: ['Genuine laughter. Their eyes lit up.', 'You teased them. They blushed and smiled.', 'Joy. Lightness. Connection.'],
      high: ['Inside jokes. Your private language.', 'They laughed until tears came. Beautiful.', 'You made them forget everything but this moment.']
    }
  },
  compliment: {
    icon: Heart,
    label: 'Compliment',
    category: 'social',
    tier: 1,
    gains: [4, 8],
    outcomes: {
      low: ['You praised them. They looked away, uncertain.', 'They didn\'t believe you. Yet.', 'Your words made them blush slightly.'],
      mid: ['You told them they\'re beautiful. They glowed.', 'Your compliment hit deep. They needed to hear it.', 'They smiled. Genuine. Pleased.'],
      high: ['Your words made them melt. They know you mean it.', 'You see them completely. They feel treasured.', 'Every compliment feels like worship to them now.']
    }
  },
  confess: {
    icon: Heart,
    label: 'Confess feelings',
    category: 'social',
    tier: 2,
    minRelationship: 50,
    gains: [20, 30],
    outcomes: {
      mid: ['You told them what they mean to you. They cried.', 'Your confession changed everything. They said it back.', 'Words hung between you. Sacred.'],
      high: ['I love you. They already knew. They feel it too.', 'You laid your heart bare. They held it carefully.', 'Forever pledged. Bonds deepened.']
    }
  },
  shareSecret: {
    icon: MessageCircle,
    label: 'Share a secret',
    category: 'social',
    tier: 3,
    minRelationship: 60,
    gains: [15, 25],
    outcomes: {
      mid: ['You told them something you never tell anyone.', 'A secret shared. The bond deepened.', 'They held your secret carefully. Sacred.'],
      high: ['Complete honesty. No more walls between you.', 'You told them everything. They understood.', 'Secrets exchanged. Total trust.']
    }
  },
  promise: {
    icon: Heart,
    label: 'Make a promise',
    category: 'social',
    tier: 4,
    minRelationship: 70,
    gains: [20, 35],
    outcomes: {
      mid: ['You promised them forever. You meant it.', 'A vow made. Unbreakable.', 'Your promise hung in the air. Sacred.'],
      high: ['Forever pledged. Nothing could break this.', 'You swore eternity. They believed you.', 'An eternal promise. Binding.']
    }
  },
  
  // Activity - Tier 1
  observe: {
    icon: Eye,
    label: 'Watch them',
    category: 'activity',
    tier: 1,
    gains: [3, 7],
    outcomes: {
      low: ['You watched them move. They noticed. Looked away.', 'They tried not to meet your eyes. Failed.', 'You studied them. They pretended not to notice.'],
      mid: ['You watched them. They smiled, shy but pleased.', 'They moved for you. Wanting to be seen.', 'Your gaze followed them everywhere. They liked it.'],
      high: ['They performed for your eyes alone.', 'You looked at them like prey. They offered themselves.', 'They existed to be watched by you. Nothing else mattered.']
    }
  },
  coffee: {
    icon: Coffee,
    label: 'Share a drink',
    category: 'activity',
    tier: 1,
    gains: [5, 10],
    outcomes: {
      low: ['You poured them wine. They sipped carefully.', 'Drinks together. Comfortable silence.', 'They watched you over the rim of their glass.'],
      mid: ['You shared wine. Intimate. Relaxed.', 'They got tipsy. Looser. More honest.', 'Drinks led to confessions. Barriers dropped.'],
      high: ['You fed them wine from your lips. Intoxicating.', 'Drunk on you more than alcohol.', 'The drink was just an excuse to be close.']
    }
  },
  music: {
    icon: Music,
    label: 'Listen to music',
    category: 'activity',
    tier: 1,
    gains: [6, 11],
    outcomes: {
      low: ['Music played. You sat together. Peaceful.', 'They hummed along softly.', 'Shared silence. Shared sound.'],
      mid: ['They rested their head on you. Music surrounded you both.', 'You swayed together gently.', 'The music said what words couldn\'t.'],
      high: ['You danced slowly. Bodies pressed together.', 'Music became your heartbeat. Synchronized.', 'Lost in sound. Lost in each other.']
    }
  },
  read: {
    icon: Book,
    label: 'Read together',
    category: 'activity',
    tier: 2,
    gains: [7, 13],
    outcomes: {
      low: ['You read aloud. They listened.', 'Books between you. Safe distance.', 'They watched you read. Mesmerized.'],
      mid: ['You read poetry. They understood every word meant them.', 'Sharing stories. Sharing worlds.', 'They laid their head on your shoulder while you read.'],
      high: ['Words became foreplay. You didn\'t finish the book.', 'You quoted passages. They quoted back. Your language.', 'Reading forgotten. You memorized each other instead.']
    }
  },
  cook: {
    icon: Utensils,
    label: 'Cook for them',
    category: 'activity',
    tier: 2,
    gains: [8, 14],
    outcomes: {
      low: ['You prepared food. They ate quietly.', 'Your effort showed. They appreciated it.', 'Care expressed through cooking.'],
      mid: ['You cooked. They watched you work. Intimate.', 'They helped. Working together. Laughter.', 'You fed them directly. They closed their eyes.'],
      high: ['Cooking became seduction. Every gesture intentional.', 'They licked your fingers. Food forgotten.', 'Nourishment of body and soul.']
    }
  },
  stargaze: {
    icon: Moon,
    label: 'Stargaze',
    category: 'activity',
    tier: 2,
    gains: [9, 16],
    outcomes: {
      low: ['You looked at stars together. Quiet companionship.', 'They pointed out constellations.', 'Night sky. Shared wonder.'],
      mid: ['They moved closer. Stars reflected in their eyes.', 'You talked about infinity. They held your hand.', 'Under the stars, barriers dissolved.'],
      high: ['They said the stars were nothing compared to you.', 'You kissed under moonlight. Perfect moment.', 'The universe witnessed your connection.']
    }
  },
  travel: {
    icon: Wind,
    label: 'Travel together',
    category: 'activity',
    tier: 3,
    minRelationship: 50,
    gains: [12, 20],
    outcomes: {
      mid: ['You explored the city together. New places. New memories.', 'Adventure shared. The bond grew.', 'Traveling side by side. The world felt smaller.'],
      high: ['You disappeared together for days. Just the two of you.', 'The world became your playground together.', 'Every journey brought you closer.']
    }
  },
  ritual: {
    icon: Moon,
    label: 'Perform a ritual',
    category: 'activity',
    tier: 4,
    minRelationship: 65,
    gains: [15, 25],
    outcomes: {
      mid: ['An ancient ritual performed together. Sacred.', 'Blood and moonlight. The ritual bonded you.', 'Magic flowed between you. Powerful.'],
      high: ['The ritual completed. You became one.', 'Eternal binding through ancient magic.', 'Power surged. The bond became supernatural.']
    }
  },
  
  // Vampire powers (requires unlocked powers)
  usePower: {
    icon: Zap,
    label: 'Use Power',
    category: 'power',
    tier: 1,
    special: true,
    gains: [0, 0]
  },
  
  setTitle: {
    icon: Crown,
    label: 'Set your title',
    category: 'power',
    tier: 1,
    special: true,
    gains: [0, 0]
  },
  
  // Dark option
  kill: {
    icon: Skull,
    label: 'Kill them',
    category: 'power',
    tier: 1,
    minRelationship: 0,
    gains: [0, 0],
    outcomes: {
      low: ['You drained them completely. They collapsed. Dead.', 'Their life ended in your arms. Quick. Final.', 'You killed them. No hesitation. No remorse.']
    }
  }
};

export default function DirectInteraction({ servant, vampireState, onClose }) {
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [interactionType, setInteractionType] = useState('');
  const [showPowers, setShowPowers] = useState(false);
  const [showTitleSelection, setShowTitleSelection] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const queryClient = useQueryClient();
  
  const { data: interactionProgress = [] } = useQuery({
    queryKey: ['interactionProgress'],
    queryFn: () => base44.entities.InteractionProgress.list()
  });
  
  const getRelationshipTier = (rel) => {
    if (rel >= 60) return 'high';
    if (rel >= 30) return 'mid';
    return 'low';
  };

  const addTitleToOutcome = (outcome) => {
    const title = vampireState.preferred_title;
    if (!title) return outcome;
    
    const titleVariations = [
      `, ${title}`,
      `, ${title}.`,
      ` ${title}.`,
      ` Yes, ${title}.`,
      ` ${title}...`,
      ` Please, ${title}.`
    ];
    
    // Add title to some sentences
    if (Math.random() > 0.5) {
      return outcome + titleVariations[Math.floor(Math.random() * titleVariations.length)];
    }
    return outcome;
  };
  
  const handleInteraction = async (type) => {
    if (type === 'usePower') {
      setShowPowers(true);
      return;
    }
    
    if (type === 'setTitle') {
      setShowTitleSelection(true);
      return;
    }
    
    if (type === 'kill') {
      if (!confirm(`Kill ${servant.name}? This cannot be undone.`)) {
        return;
      }
    }
    
    setProcessing(true);
    setInteractionType(type);
    
    const interaction = INTERACTIONS[type];
    const rel = servant.relationship || 0;
    const tier = getRelationshipTier(rel);
    
    const outcomes = interaction.outcomes[tier] || interaction.outcomes.low;
    const baseOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    
    // Add variant-specific flavor
    const variantFlavor = getVariantFlavor(servant.variant, tier, servant.obsession_stage);
    let outcome = baseOutcome + variantFlavor;
    
    // Add title if set
    outcome = addTitleToOutcome(outcome);
    
    setOutcome(outcome);
    
    setTimeout(async () => {
      const [min, max] = interaction.gains;
      const baseGain = Math.floor(Math.random() * (max - min + 1)) + min;
      
      // Apply variant modifier
      const modifier = getVariantModifier(servant.variant, interaction.category);
      const relationshipGain = Math.round(baseGain * modifier);
      const newRel = Math.min((servant.relationship || 0) + relationshipGain, 100);
      
      // Update emotional state based on variant and new relationship
      const emotionalStates = {
        devoted: ['shy', 'longing', 'devoted', 'worshipful', 'transcendent'],
        defiant: ['conflicted', 'resistant', 'surrendering', 'accepting', 'bound'],
        dreamer: ['distant', 'drifting', 'fading', 'ethereal', 'dissolved']
      };
      const stateIndex = Math.min(Math.floor(newRel / 20), 4);
      const newEmotionalState = emotionalStates[servant.variant][stateIndex];
      
      await base44.entities.Servant.update(servant.id, {
        relationship: newRel,
        obsession_stage: Math.min(Math.floor(newRel / 20) + 1, 5),
        emotional_state: newEmotionalState,
        last_interaction: new Date().toISOString()
      });
      
      // Determine humanity impact of interaction
      let humanityChange = 0;
      if (interaction.category === 'social') humanityChange = 1; // Positive interactions
      else if (['bite', 'intimate'].includes(type) && rel < 40) humanityChange = -2; // Forcing intimacy
      
      // Update vampire state with humanity
      if (humanityChange !== 0 && vampireState.id) {
        const newHumanity = Math.max(0, Math.min(100, (vampireState.humanity ?? 50) + humanityChange));
        let moral_path = 'balanced';
        if (newHumanity >= 75) moral_path = 'humane';
        else if (newHumanity >= 25) moral_path = 'balanced';
        else if (newHumanity >= 10) moral_path = 'ruthless';
        else moral_path = 'monster';
        
        await base44.entities.VampireState.update(vampireState.id, {
          humanity: newHumanity,
          moral_path: moral_path
        });
      }
      
      await base44.entities.NightLog.create({
        entry: `With ${servant.name}: ${outcome}`,
        category: 'interaction',
        intensity: ['intimate', 'makeout', 'bite'].includes(type) ? 'significant' : 'moderate'
      });
      
      // Update interaction progress for unlocking new tiers
      const category = interaction.category;
      if (category !== 'power') {
        const categoryProgress = interactionProgress.find(p => p.category === category);
        if (categoryProgress) {
          const newTimesUsed = categoryProgress.times_used + 1;
          const newTier = Math.floor(newTimesUsed / 5) + 1; // Unlock new tier every 5 uses
          await base44.entities.InteractionProgress.update(categoryProgress.id, {
            times_used: newTimesUsed,
            unlocked_tier: newTier
          });
        } else {
          await base44.entities.InteractionProgress.create({
            category: category,
            times_used: 1,
            unlocked_tier: 1
          });
        }
      }

      // Update quest progress
      const quests = await base44.entities.Quest.filter({ servant_id: servant.id });
      const activeQuest = quests.find(q => !q.completed);
      if (activeQuest) {
        const progress = activeQuest.progress || {};
        const newCount = (progress.interact || 0) + 1;
        await base44.entities.Quest.update(activeQuest.id, {
          progress: { ...progress, interact: newCount }
        });
      }

      queryClient.invalidateQueries();

      // If killed, delete the servant and create a new one
      if (type === 'kill') {
        await base44.entities.Servant.delete(servant.id);

        // Create a new servant after a delay
        setTimeout(async () => {
          const names = [
            'Ash', 'River', 'Sage', 'Rowan', 'Quinn', 'Jade', 'Raven', 'Storm',
            'Alex', 'Blake', 'Eden', 'Gray', 'Haven', 'Indigo', 'Jules', 'Kai',
            'Morgan', 'Nova', 'Onyx', 'Phoenix', 'Rain', 'Shadow', 'Sky', 'Wren',
            'Ember', 'Luna', 'Atlas', 'Iris', 'Orion', 'Lyra', 'Cedar'
          ];
          const variants = ['devoted', 'defiant', 'dreamer'];
          const emotionalStates = ['curious', 'wary', 'distant'];

          await base44.entities.Servant.create({
            name: names[Math.floor(Math.random() * names.length)],
            variant: variants[Math.floor(Math.random() * variants.length)],
            obsession_stage: 1,
            emotional_state: emotionalStates[Math.floor(Math.random() * emotionalStates.length)]
          });

          queryClient.invalidateQueries();
        }, 2000);

        setTimeout(() => {
          onClose();
        }, 3000);
        return;
      }

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
        setInteractionType('');
      }, 5000);
      }, 2000);
      };
  
  const rel = servant.relationship || 0;

  // Get unlocked tiers for each category
  const getUnlockedTier = (category) => {
    const progress = interactionProgress.find(p => p.category === category);
    return progress?.unlocked_tier || 1;
  };

  // Combine interactions - add vampire interactions if servant is turned
  const allInteractions = servant.is_turned 
    ? { ...INTERACTIONS, ...TURNED_VAMPIRE_INTERACTIONS }
    : INTERACTIONS;

  const categories = servant.is_turned 
    ? ['all', 'vampire', 'physical', 'social', 'activity', 'power']
    : ['all', 'physical', 'social', 'activity', 'power'];

  // Filter by category only (show locked interactions too)
  const filteredInteractions = Object.entries(allInteractions).filter(([key, interaction]) => {
    // Category filter
    if (selectedCategory !== 'all' && interaction.category !== selectedCategory) {
      return false;
    }

    return true;
  });
  
  return (
    <>
      <AnimatePresence>
        {showPowers && (
          <PowerUsage
            servant={servant}
            vampireState={vampireState}
            onClose={() => setShowPowers(false)}
            onPowerUsed={() => {
              setShowPowers(false);
              queryClient.invalidateQueries();
              onClose();
            }}
          />
        )}
        {showTitleSelection && (
          <TitleSelection
            vampireState={vampireState}
            servant={servant}
            onClose={() => {
              setShowTitleSelection(false);
              queryClient.invalidateQueries(['vampireState']);
            }}
          />
        )}
      </AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-md w-full relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-2">
          {servant.name}
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          They're here with you. What will you do?
        </p>
        
        {/* Category filter with tier display */}
        {!outcome && !processing && (
          <div className="mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
              {categories.map(cat => {
                const unlockedTier = getUnlockedTier(cat);
                const progress = interactionProgress.find(p => p.category === cat);
                const timesUsed = progress?.times_used || 0;
                const nextTierAt = unlockedTier * 5;

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors relative ${
                      selectedCategory === cat 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                      {cat !== 'all' && cat !== 'power' && (
                        <span className="bg-black/30 px-1.5 py-0.5 rounded text-[10px]">
                          T{unlockedTier}
                        </span>
                      )}
                    </div>
                    {cat !== 'all' && cat !== 'power' && selectedCategory === cat && (
                      <div className="mt-1 text-[10px] text-purple-200">
                        {timesUsed}/{nextTierAt} to T{unlockedTier + 1}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
        {outcome ? (
          <div className="text-center py-12 relative overflow-hidden">
            {/* Animated particles based on interaction type */}
            {interactionType === 'kiss' && [...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                initial={{ 
                  x: '50%', 
                  y: '50%',
                  opacity: 1,
                  scale: 0 
                }}
                animate={{ 
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100 - 50}%`,
                  opacity: 0,
                  scale: 1.5
                }}
                transition={{ 
                  duration: 2 + Math.random(),
                  delay: Math.random() * 0.5,
                  ease: 'easeOut'
                }}
              >
                ❤️
              </motion.div>
            ))}
            
            {interactionType === 'intimate' && [...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-xl"
                initial={{ 
                  x: '50%', 
                  y: '100%',
                  opacity: 1 
                }}
                animate={{ 
                  x: `${Math.random() * 100}%`,
                  y: '-20%',
                  opacity: 0
                }}
                transition={{ 
                  duration: 3 + Math.random() * 2,
                  delay: Math.random(),
                  ease: 'easeOut'
                }}
              >
                {['🔥', '💋', '✨'][Math.floor(Math.random() * 3)]}
              </motion.div>
            ))}
            
            {interactionType === 'touch' && [...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-xl"
                initial={{ 
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  opacity: 0,
                  scale: 0
                }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{ 
                  duration: 2,
                  delay: Math.random() * 2,
                  repeat: Infinity
                }}
              >
                ✨
              </motion.div>
            ))}
            
            {interactionType === 'observe' && [...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-xl"
                initial={{ 
                  x: '50%',
                  y: '50%',
                  opacity: 1,
                  scale: 0.5
                }}
                animate={{ 
                  x: `${50 + Math.cos(i * Math.PI / 4) * 40}%`,
                  y: `${50 + Math.sin(i * Math.PI / 4) * 40}%`,
                  opacity: 0,
                  scale: 1
                }}
                transition={{ 
                  duration: 1.5,
                  delay: i * 0.1,
                  ease: 'easeOut'
                }}
              >
                👁️
              </motion.div>
            ))}
            
            {interactionType === 'talk' && [...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-sm"
                initial={{ 
                  x: `${20 + Math.random() * 60}%`,
                  y: '100%',
                  opacity: 0
                }}
                animate={{ 
                  y: '-10%',
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 3,
                  delay: Math.random() * 2,
                  ease: 'linear'
                }}
              >
                💬
              </motion.div>
            ))}
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gray-300 text-lg relative z-10"
            >
              {outcome}
            </motion.p>
          </div>
        ) : processing ? (
          <div className="text-center py-12">
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-gray-400"
            >
              ...
            </motion.p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {filteredInteractions.map(([key, interaction]) => {
              const unlockedTier = getUnlockedTier(interaction.category);
              const isLocked = interaction.tier && interaction.tier > unlockedTier;
              const relDisabled = interaction.minRelationship && rel < interaction.minRelationship;
              const disabled = isLocked || relDisabled;
              const Icon = interaction.icon;
              const isNew = interaction.tier && interaction.tier === unlockedTier;

              return (
                <button
                  key={key}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled) handleInteraction(key);
                  }}
                  disabled={disabled}
                  className={`bitlife-btn w-full rounded-xl py-3 flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed text-sm relative ${
                    isNew ? 'ring-2 ring-yellow-400' : ''
                  } ${isLocked ? 'bg-gray-800 hover:bg-gray-800' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{interaction.label}</span>
                  {isNew && <span className="text-xs text-yellow-400 ml-auto">NEW!</span>}
                  {isLocked && <span className="text-xs text-gray-500 ml-auto flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Tier {interaction.tier}
                  </span>}
                  {!isLocked && relDisabled && <span className="text-xs ml-auto">({interaction.minRelationship}+)</span>}
                  {!isLocked && interaction.tier && (
                    <span className="text-[10px] text-gray-500 absolute bottom-1 right-2">
                      T{interaction.tier}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
    </>
  );
}