import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Eye, Hand, Sparkles, Zap, Coffee, Music, Book, Utensils, Wine, Flame, Moon, Droplets, Wind, Smile, Lock, Star, Skull, Crown, MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import PowerUsage from './PowerUsage';
import TitleSelection from './TitleSelection';
import MasturbationSlider from './MasturbationSlider';

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
  feedOnEachOther: {
    icon: Droplets,
    label: 'Feed on each other',
    category: 'vampire',
    gains: [25, 40],
    outcomes: {
      mid: ['You bit them. They bit you back. Vampire blood. Electric. Intimate.', 'Feeding on another vampire. The taste was different. Ancient. Powerful.', 'You drank from each other. Twin ecstasy. The bond deepened.'],
      high: ['Vampire on vampire. You fed from each other simultaneously. Pure intimacy. Overwhelming.', 'You bit their neck while they bit yours. Feeding loop. Pleasure infinite.', 'Trading blood. Ancient ritual. You became one being for a moment.', 'Feeding on each other until you both collapsed. Entwined. Sated. Perfect.']
    }
  },
  vampireFeed: {
    icon: Droplets,
    label: 'Feed together (hunt)',
    category: 'vampire',
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
    gains: [15, 25],
    outcomes: {
      mid: ['You stalked prey together. Teaching them your ways.', 'Two predators in the night. Perfectly synchronized.', 'They moved like you now. Supernatural. Deadly.'],
      high: ['You hunted as one. No words needed. Perfect unity.', 'Twin shadows. The city was yours together.', 'They\'ve become your perfect hunting companion.']
    }
  },
  vampireBiteDuringsex: {
    icon: Droplets,
    label: 'Bite while fucking',
    category: 'vampire',
    gains: [30, 45],
    outcomes: {
      mid: ['You fucked them deep. Bit their neck mid-thrust. They screamed. Vampire ecstasy.', 'Feeding and fucking. Primal. Perfect. They came hard.', 'You bit them while inside them. Blood and pleasure mixed. Overwhelming.'],
      high: ['Deep inside them. Fangs in their neck. Both sensations peaked. They shattered.', 'You fucked and fed simultaneously. Vampire intimacy perfected. Complete.', 'Biting while thrusting. Blood flowing. They came screaming your name. Twice.', 'Supernatural fucking. Vampire biting. They couldn\'t tell where one pleasure ended and another began.']
    }
  },
  vampireRoughFuck: {
    icon: Flame,
    label: 'Fuck with vampire strength',
    category: 'vampire',
    gains: [35, 50],
    outcomes: {
      mid: ['Supernatural strength. You fucked them harder than humanly possible.', 'Vampire stamina. Hours. Relentless. They took it all.', 'No holding back. Full vampire force. They loved every second.'],
      high: ['You fucked them with full vampire strength. Destroyed the bed. Worth it.', 'Supernatural fucking. They screamed. The neighbors heard. You didn\'t care.', 'Vampire speed and strength combined. Pounded them into oblivion. Perfect.', 'You broke furniture. Left marks. Fucked for hours straight. Immortal stamina.', 'So rough the headboard cracked. Neither of you stopped. Vampire bodies can take it.']
    }
  },
  vampireBloodPlay: {
    icon: Droplets,
    label: 'Blood play (explicit)',
    category: 'vampire',
    gains: [28, 40],
    outcomes: {
      mid: ['You cut yourself. Let them drink while you touched them. Intimate.', 'Blood play. Feeding. Pleasure. Lines blurred. Beautiful.', 'Your blood on their tongue. Your hand between their legs. Ecstasy.'],
      high: ['You fed them your blood while making them cum. Simultaneous. Perfect.', 'Blood play intensified. Feeding. Fucking. Bleeding. All at once. Overwhelming.', 'Your blood made them come. The taste. The power. The intimacy. Complete.', 'You bit your wrist. Fed them while they rode you. Screaming. Perfect vampire intimacy.']
    }
  },
  vampireSpeedFuck: {
    icon: Wind,
    label: 'Fuck at vampire speed',
    category: 'vampire',
    gains: [32, 45],
    outcomes: {
      mid: ['Vampire speed fucking. Blur fast. They couldn\'t keep up. Tried anyway.', 'You moved faster than human. They felt everything. Overwhelmed. Perfect.', 'Speed fucking. Supernatural. They came before they could process it.'],
      high: ['Vampire speed. You fucked them so fast they lost count of orgasms.', 'Blur speed fucking. They screamed. Came. Screamed again. Couldn\'t stop.', 'Supernatural velocity. Pounding them at inhuman speed. They shattered completely.', 'You fucked them faster than possible. Multiple orgasms. Lost count. Vampire perfection.']
    }
  },
  vampireWallFuck: {
    icon: Flame,
    label: 'Pin them to wall (vampire strength)',
    category: 'vampire',
    gains: [30, 42],
    outcomes: {
      mid: ['Vampire strength. Pinned them to the wall effortlessly. Fucked standing.', 'You held them up with one hand. Fucked them against the wall. Supernatural.', 'Wall fucking with vampire strength. They felt weightless. Completely yours.'],
      high: ['Slammed them against the wall. Vampire strength. Fucked them hard. They loved it.', 'Held them up effortlessly. Pinned. Fucked deep. Supernatural strength on display.', 'Wall fucking. You didn\'t break a sweat. They came screaming. Vampire power.', 'Pressed them to the wall so hard it cracked. Kept fucking. Immortal bodies don\'t break.']
    }
  },
  vampireMarathon: {
    icon: Moon,
    label: 'All night vampire fucking',
    category: 'vampire',
    gains: [40, 55],
    outcomes: {
      mid: ['Vampire stamina. You fucked for hours. Neither tired. Perfect.', 'All night session. Supernatural endurance. They lost count of orgasms.', 'Dawn approached. Still fucking. Vampire bodies don\'t quit.'],
      high: ['Fucked from dusk till dawn. Vampire stamina is limitless. Neither wanted to stop.', 'Hours blurred together. Came dozens of times. Vampire marathon sex achieved.', 'All night. Every position. Multiple times. Sun rose. You kept going. Immortal.', 'Marathon vampire fucking. Lost track of time. Lost track of orgasms. Perfect.', 'You fucked for six hours straight. No breaks. No exhaustion. Just endless pleasure.']
    }
  },
  vampireBiteMark: {
    icon: Skull,
    label: 'Mark them permanently',
    category: 'vampire',
    gains: [35, 48],
    outcomes: {
      mid: ['You bit them deep. Marking bite. Permanent scar. Yours forever.', 'Vampire bite that won\'t heal. Permanent mark. Everyone will know they\'re claimed.', 'You marked them. Deep bite. Eternal scar. Property marked.'],
      high: ['Permanent vampire bite. Deep scar. Visible always. Your eternal claim.', 'You bit them so deep the mark will never fade. Permanent ownership displayed.', 'Marking bite complete. Scar eternal. They wear your claim proudly. Forever.', 'The bite scarred perfectly. Everyone knows they\'re yours. Forever marked. Perfect.']
    }
  },
  vampireDoubleFeeding: {
    icon: Droplets,
    label: 'Feed on each other simultaneously',
    category: 'vampire',
    gains: [38, 50],
    outcomes: {
      mid: ['You bit each other at the same time. Vampire blood exchanged. Intimate beyond words.', 'Simultaneous feeding. Your blood. Their blood. Mixed. Powerful.', 'Double bite. Both feeding. Connection absolute. Overwhelming.'],
      high: ['Feeding on each other while fucking. Blood and pleasure and power. Transcendent.', 'You came while drinking their blood. They came while drinking yours. Simultaneous. Perfect.', 'Double feeding during sex. You both came at the exact moment. Vampire intimacy perfected.', 'Biting each other. Fucking deep. Blood flowing. Both came screaming. Ultimate vampire intimacy.']
    }
  },
  vampireRace: {
    icon: Wind,
    label: 'Race through the city',
    category: 'vampire',
    gains: [20, 30],
    outcomes: {
      mid: ['You raced through the streets. Blur speed. They kept up. Almost.', 'Rooftop to rooftop. They\'re learning. Getting faster.', 'You pushed them to their limits. Supernatural speed unleashed.'],
      high: ['You raced at full speed. They matched you. Exhilarating.', 'Two blurs through the night. Nothing could catch you.', 'Racing together. Wind in your faces. Laughing. Alive. Immortal.', 'They beat you to the destination. Grinning. You\'re proud.']
    }
  },
  vampireSpar: {
    icon: Flame,
    label: 'Spar (vampire combat)',
    category: 'vampire',
    gains: [18, 28],
    outcomes: {
      mid: ['You sparred. Vampire strength against vampire strength.', 'They\'re getting stronger. You pushed them harder.', 'Combat training. They held their own. Impressive.'],
      high: ['Full force sparring. Supernatural speed and strength unleashed.', 'You fought like equals. Exhilarating. Intense. Perfect.', 'They pinned you. Then you pinned them. Back and forth. Beautiful.', 'Sparring became rough play. Biting. Wrestling. Intense.']
    }
  },
  vampireTelekinesis: {
    icon: Zap,
    label: 'Practice powers together',
    category: 'vampire',
    gains: [22, 32],
    outcomes: {
      mid: ['You practiced compulsion together. Mind games. Getting stronger.', 'Teaching them advanced powers. They\'re a quick learner.', 'Power training. Your abilities growing together.'],
      high: ['You linked minds. Shared thoughts. Intimate beyond words.', 'Practiced powers until dawn. Exhausted. Powerful. Complete.', 'Your combined powers created something new. Overwhelming.', 'You felt their power surge. Matching yours. Equal. Perfect.']
    }
  },
  vampireCompulsion: {
    icon: Eye,
    label: 'Compel each other (play)',
    category: 'vampire',
    gains: [25, 35],
    outcomes: {
      mid: ['You tried to compel them. They resisted. The sire bond protected.', 'Playful compulsion attempts. Testing boundaries. Fun.', 'They tried to compel you. Adorable attempt. You smiled.'],
      high: ['Compulsion play. "Kiss me." They obeyed willingly, grinning.', 'You compelled them to tell the truth. They confessed everything.', 'Power games. Compulsion. Control. Surrender. Intoxicating.', 'They compelled you jokingly. You played along. Trust absolute.']
    }
  },
  vampireDaylight: {
    icon: Sparkles,
    label: 'Watch sunrise together',
    category: 'vampire',
    gains: [30, 40],
    outcomes: {
      mid: ['Protected by daylight rings. You watched dawn together. Beautiful.', 'First sunrise as vampires. Safe. Together. Magical.', 'Dawn broke. You didn\'t burn. They held your hand. Wonder.'],
      high: ['Sunrise together. Impossible before. Now possible. Everything changed.', 'Dawn. You kissed in the light. Vampires touching sun. Miraculous.', 'First time seeing them in daylight. Breathtaking. Worth everything.', 'You danced in the sunrise. Vampires defying nature. Together.']
    }
  },
  vampireEternity: {
    icon: Heart,
    label: 'Talk about forever',
    category: 'vampire',
    gains: [35, 45],
    outcomes: {
      mid: ['You talked about eternity. They said "with you, forever."', 'Immortality discussed. The weight of forever. Together though.', 'They asked "will you tire of me?" Never. Impossible.'],
      high: ['Forever pledged. Not human promises. Vampire eternity. Real.', '"We have centuries together." They smiled. "Not enough."', 'You promised them forever. Immortal love. Unbreakable.', 'Eternity stretched ahead. Neither of you afraid. Together always.']
    }
  },
  vampireNest: {
    icon: Moon,
    label: 'Build a nest together',
    category: 'vampire',
    gains: [28, 38],
    outcomes: {
      mid: ['You prepared a safe sleeping place. Vampire nest. Shared.', 'Building your lair together. Dark. Safe. Yours.', 'They helped fortify the nest. Home. Finally.'],
      high: ['Your nest complete. Dark. Secure. Perfect for two vampires.', 'You sleep entwined during the day. Safe. Together. Home.', 'The nest became your sanctuary. Your fortress. Your paradise.', 'Sleeping together in darkness. No vulnerability. Only peace.']
    }
  },
  vampireBond: {
    icon: Droplets,
    label: 'Strengthen the blood bond',
    category: 'vampire',
    gains: [30, 45],
    outcomes: {
      mid: ['Blood exchanged. The sire bond deepened. Connection stronger.', 'You fed them your blood again. Ancient power shared.', 'The bond pulsed between you. Vampire connection. Supernatural.'],
      high: ['Blood bond absolute. You felt what they felt. One being. Two bodies.', 'You could sense them always. Distance meaningless. Connected forever.', 'The bond became everything. Sire and progeny. Beyond that. Mates.', 'Vampire bond completed. Neither could exist without the other now.']
    }
  },
  vampireTeach: {
    icon: Book,
    label: 'Teach them vampire history',
    category: 'vampire',
    gains: [20, 30],
    outcomes: {
      mid: ['You told them about the old ones. Ancient vampires. History.', 'Teaching them the ways. Vampire culture. Tradition. Laws.', 'They learned about your past. Centuries of life shared.'],
      high: ['You told them everything. Every century. Every kill. Every love before them.', 'Vampire history became shared history. Your past. Their future.', 'They understood now. What you are. What they\'ve become. Beautiful.', 'You taught them the old language. Dead tongue. Alive between you.']
    }
  },
  vampireDominance: {
    icon: Flame,
    label: 'Assert sire dominance',
    category: 'vampire',
    gains: [25, 40],
    outcomes: {
      mid: ['You asserted yourself. Sire above progeny. They submitted.', 'Dominance play. Vampire hierarchy. They obeyed their sire.', 'You reminded them who turned them. Who owns them. Yours.'],
      high: ['Complete sire dominance. They couldn\'t resist. Biology. Bond. Power.', 'You commanded with sire authority. They obeyed instantly. Perfect.', 'Vampire dominance. Primal. Supernatural. Absolute. They loved it.', 'Sire bond at full force. Control complete. They wanted it. Begged for it.']
    }
  }
};

const INTERACTIONS = {
  // Physical - Tier 1 (Always available)
  touch: {
    icon: Hand,
    label: 'Touch them',
    category: 'physical',
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
        'Desperate kisses. Hands grabbing, pulling. You felt them trembling, gasping into your mouth.', 
        'You devoured them. Teeth catching their lip, tongue deep. They surrendered, whimpering.', 
        'They kissed you like drowning, like breathing. Desperate sounds escaping between kisses.',
        'Consuming. You bit their lip hard. They moaned loud, pressing harder against you.',
        'Your hand fisted in their hair, pulling their head back. They whimpered, exposing their throat.',
        'You kissed down their neck, feeling their pulse racing. They trembled, skin hot under your lips.'
      ]
    }
  },
  cuddle: {
    icon: Smile,
    label: 'Cuddle',
    category: 'physical',
    gains: [6, 12],
    outcomes: {
      low: ['You held them carefully. They were stiff at first.', 'They leaned against you hesitantly.', 'Awkward closeness. Slowly relaxing.'],
      mid: ['They curled into you. Perfect fit.', 'You wrapped around them. They sighed contentedly.', 'Warmth. Safety. They didn\'t want to move.'],
      high: ['Tangled together. No separation. Pure comfort.', 'They nuzzled into your neck. Utterly at peace.', 'Hours passed. Neither of you noticed.']
    }
  },
  approachBehind: {
    icon: Wind,
    label: 'Approach from behind',
    category: 'physical',
    gains: [8, 14],
    outcomes: {
      low: [
        'You stepped behind them silently. They gasped when you touched their shoulders.',
        'Your arms wrapped around them from behind. They froze, then relaxed.',
        'You pressed against their back. They leaned into you hesitantly.',
        'Behind them suddenly. Your breath on their neck. They shivered.'
      ],
      mid: [
        'You came up behind them. Arms around their waist. They melted back against you.',
        'Your chest pressed to their back. They sighed contentedly, fitting perfectly.',
        'Behind them without warning. Your hands on their hips. They pressed back.',
        'You pulled them back against you. They tilted their head, exposing their neck.'
      ],
      high: [
        'You appeared behind them. Arms tight around their waist. They moaned softly, grinding back.',
        'Your body pressed flush against their back. They arched, wanting more contact.',
        'Behind them. Your hands roaming. They leaned back, giving you everything.',
        'You pulled them hard against you. They felt your desire. Ground back eagerly.'
      ]
    }
  },
  neckKissBehind: {
    icon: Heart,
    label: 'Kiss their neck from behind',
    category: 'physical',
    gains: [12, 20],
    outcomes: {
      low: [
        'Behind them. Your lips brushed their neck. They stiffened.',
        'You kissed their neck from behind. Gentle. They held their breath.',
        'Your mouth on their neck. Behind them. They trembled slightly.',
        'Soft neck kisses from behind. They didn\'t pull away.',
        'You pressed a kiss to their neck. They stood very still.'
      ],
      mid: [
        'Behind them. Your lips on their neck. They gasped, head tilting.',
        'You kissed their neck softly from behind. They shivered, leaning back into you.',
        'Neck kisses from behind. Slow. Deliberate. They moaned softly.',
        'Your mouth on their neck. Behind them. They trembled, exposing more skin.',
        'You pressed kisses up their neck from behind. They went weak in your arms.'
      ],
      high: [
        'Behind them. Lips on their neck. Teeth grazing. They moaned loudly, grinding back against you.',
        'You bit their neck gently from behind. They gasped "Yes" and pressed harder back.',
        'Kissing their neck. Behind them. Your hands wandering. They begged "Don\'t stop."',
        'Your teeth scraped their neck. Behind them. They whimpered, completely yours.',
        'Neck kisses became bites. Behind them. They came undone, moaning your name.',
        'You kissed and bit their neck while pressed against their back. They trembled, overwhelmed.'
      ]
    }
  },
  whisperDirty: {
    icon: MessageCircle,
    label: 'Whisper dirty things',
    category: 'physical',
    gains: [14, 22],
    outcomes: {
      low: [
        'You whispered something dark in their ear. They froze.',
        'Your breath on their neck. Dirty words. They shivered nervously.',
        'You told them what you wanted. Whispered. They blushed deep.',
        'Filthy whispers. They looked away, uncertain.',
        'Your voice low in their ear. They tensed, but stayed.'
      ],
      mid: [
        'You whispered what you wanted to do to them. They shivered.',
        'Behind them. Your mouth at their ear. "You\'re mine." They whimpered.',
        'You described exactly how you\'d take them. They trembled.',
        'Dirty words whispered. They blushed, breathing harder.',
        'Your voice in their ear. Filthy promises. They pressed back against you.'
      ],
      high: [
        'Behind them. You whispered "I\'m going to fuck you so hard." They moaned, grinding back.',
        'Your mouth at their ear. "You\'re going to take every inch." They whimpered "Please."',
        'You described exactly how you\'d use them. Filthy detail. They were trembling, wet.',
        '"I want to bend you over right here." They gasped "Yes, please, yes."',
        'Whispered all the dirty things you\'d do. They came just from your words.',
        'Behind them. "You\'re my perfect little slut." They moaned "Yours. Only yours."',
        '"I\'m going to fill you up completely." They begged "Please, I need it."',
        'Filthy promises in their ear. They were shaking, desperate, begging.'
      ]
    }
  },
  behindSeduction: {
    icon: Flame,
    label: 'Seduce from behind',
    category: 'physical',
    gains: [18, 28],
    outcomes: {
      low: [
        'Behind them. Your hands on their shoulders. They tensed.',
        'You pressed against their back carefully. They stayed still.',
        'Behind them. Soft touches. They didn\'t resist.',
        'Your body close to theirs from behind. Tentative. New.'
      ],
      mid: [
        'Behind them. Hands roaming. Lips on their neck. Dirty words whispered. They melted.',
        'You pressed against them from behind. Kissing. Touching. Whispering. Perfect.',
        'Your body against theirs. Neck kisses. Wandering hands. They surrendered completely.',
        'Behind them. Every touch deliberate. Every word filthy. They were yours.'
      ],
      high: [
        'Behind them. One hand in their hair, pulling their head back. The other between their legs. "You\'re so wet for me." They moaned loudly.',
        'Pressed against their back. Kissing their neck. Hand sliding down. "I can feel how much you want this." They ground back desperately.',
        'You pulled them against you from behind. Neck bites. Roaming hands. "You\'re going to cum for me right here." They did.',
        'Behind them. Your hand cupping them through their clothes. "So fucking wet." They whimpered, legs shaking.',
        'Neck kisses. Dirty whispers. Your hand between their thighs. "Such a good girl, so wet for me." They came.',
        'You pinned them forward from behind. Hand down their pants. Filthy words in their ear. They came hard, crying out.',
        'Behind them. Biting their neck. Fingers inside them. "Cum for me." They obeyed immediately, shaking.',
        'Pressed flush behind them. One hand on their throat, the other working between their legs. They came sobbing your name.'
      ]
    }
  },
  roughBehind: {
    icon: Flame,
    label: 'Take them from behind (rough)',
    category: 'physical',
    gains: [25, 35],
    outcomes: {
      mid: [
        'Bent them forward from behind. Rough. Urgent. They took it eagerly.',
        'You grabbed their hips from behind. Pulled them back. They moaned.',
        'From behind. Hard and fast. They braced themselves, loving it.',
        'Rough taking from behind. They pushed back, meeting every thrust.'
      ],
      high: [
        'Bent them over. From behind. Your hand in their hair, pulling. Fucked them hard. They screamed.',
        'You pushed them forward. Entered from behind. Rough. Deep. They begged for more.',
        'From behind. One hand on their hip, one hand around their throat. Pounded into them. Perfect.',
        'Bent them over the counter. Fucked them from behind. Rough and desperate. They loved every second.',
        'Behind them. Your hand gripping their hair. Pulling them back onto your cock. They moaned with each thrust.',
        'You took them from behind. Hard. Spanking them. They cried out "Yes! Harder!"',
        'From behind. Deep and rough. Your hand between their shoulder blades, holding them down. Claimed completely.',
        'Bent forward. From behind. Brutal pace. They came screaming, clenching around you.',
        'You grabbed their hips. Pulled them back onto you. From behind. They took you so deep, moaning.',
        'Behind them. Rough fucking. Spanking their ass. Dirty words in their ear. They came hard.'
      ]
    }
  },
  tease: {
    icon: Flame,
    label: 'Tease them',
    category: 'physical',
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
        'Wild. Consuming. You buried yourself deep inside them, feeling them clench around you.', 
        'They begged to be filled. You obliged, pushing deep. Perfect surrender.', 
        'Afterwards, they stayed in your arms. Your cum leaking from them. Utterly content.',
        'You fucked them slowly, deeply. Each thrust made them moan your name, nails digging into your back.',
        'They came undone beneath you, trembling, gasping. You felt them pulsing, clenching tight around your cock.',
        'Your name on their lips. Over and over. Each thrust punching it out of them.',
        'You made them beg for more. They did. Eagerly. "Please, fuck me harder."',
        'Intense. Raw. Primal. Skin slapping, their moans filling the room. They loved every second.',
        'You took them hard and fast. They screamed, body arching. Perfect.',
        'Bodies slick with sweat. Breathless. You felt them trembling, sensitive and thoroughly used.',
        'You pinned them down, wrists above their head. They loved being held down, fucked deep.',
        'Every thrust deeper, harder. They cried out each time you bottomed out inside them.',
        'You owned them completely. Every inch of you buried inside. They were yours.'
      ]
    }
  },
  bite: {
    icon: Droplets,
    label: 'Bite (feed)',
    category: 'physical',
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
    category: 'bdsm',
    gains: [20, 30],
    getDynamicOutcomes: (vampireGender) => {
      const isFemale = vampireGender === 'female';
      return {
        mid: [
          'You commanded. They obeyed instantly.', 
          'On their knees. Eyes up. Waiting for orders.', 
          'You told them exactly how to please you. They did.',
          'Control absolute. They surrendered willingly.',
          'Your hand in their hair. Guiding. Commanding.',
          'You pushed them to the edge. Made them wait.',
          'They begged permission. You made them earn it.'
        ],
        high: isFemale ? [
          'Complete submission. You used them exactly how you wanted. They took everything willingly.',
          'You sat on their face. Made them lick deep. They gagged but didn\'t pull away. Took it all.',
          'Marks on their neck from your hands. Bruises blooming. Your ownership visible.',
          'You used them roughly. Pushed them down, rode their face hard. Perfect.',
          'They came only when you allowed it. "Please, can I cum?" Total control.',
          'You spanked them until they cried. Red handprints on their ass. Then rode them hard while they whimpered.',
          'Collar around their neck. Leash in your hand. You pulled it tight while grinding on them. Yours.',
          'You choked them while riding their face. Their eyes rolled back, tongue working. They loved it.',
          'You slapped their face. They moaned "Thank you." Begged for more. Again.',
          'Tied up tight. Helpless. Legs spread. Completely at your mercy. You used them thoroughly.',
          'You edged them for hours. Brought them close, denied them. They broke, sobbing, begging.',
          'You came on their face. Dripping down. They wore it proudly, didn\'t wipe it off.',
          'You degraded them. Called them your whore. They got visibly wetter, pussy dripping.',
          'Rough. Intense. You used them relentlessly. They came screaming your name.',
          'You made them crawl on hands and knees. Beg properly. Earn every touch, every pleasure.'
        ] : [
          'Complete submission. You fucked them exactly how you wanted. They took everything willingly.',
          'You fucked their throat deep. They gagged, tears streaming, but didn\'t pull away. Took it all.',
          'Marks on their neck from your hands. Bruises blooming. Your ownership visible.',
          'You used them roughly. Bent them over, grabbed their hips, fucked them hard. Perfect.',
          'They came only when you allowed it. "Please, can I cum?" Total control.',
          'You spanked them until they cried. Red handprints on their ass. Then fucked them hard while they whimpered.',
          'Collar around their neck. Leash in your hand. You pulled it tight while fucking them from behind. Yours.',
          'You choked them while fucking them deep. Their eyes rolled back, body tightening. They loved it.',
          'You slapped their face. They moaned "Thank you." Begged for more. Again.',
          'Tied up tight. Helpless. Legs spread. Completely at your mercy. You used them thoroughly.',
          'You edged them for hours. Brought them close, denied them. They broke, sobbing, begging.',
          'Your cum painted their face. Dripping from their lips. They wore it proudly, didn\'t wipe it off.',
          'You degraded them. Called them your whore. They got visibly wetter, pussy dripping.',
          'Rough. Brutal. You pounded into them relentlessly. They came screaming your name.',
          'You made them crawl on hands and knees. Beg properly. Earn every touch, every thrust.'
        ]
      };
    }
  },
  submit: {
    icon: Heart,
    label: 'Let them dominate',
    category: 'bdsm',
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
    category: 'bdsm',
    gains: [25, 35],
    getDynamicOutcomes: (vampireGender) => {
      const isFemale = vampireGender === 'female';
      return {
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
        high: isFemale ? [
          'Hours of worship. They licked, sucked, kissed every inch of you. Existed only to please you.',
          'Complete devotion. They worshipped your body with tongue and lips. Your pleasure was their religion.',
          'They served you endlessly. Mouth on you for hours. You took everything, came multiple times.',
          'Their tongue worked tirelessly on your pussy. Skilled, devoted. Only your pleasure mattered.',
          'You came on their face. They licked you clean gratefully, worshipping your wetness.',
          'They begged to please you again. "Please let me taste you again." And again.',
          'You used their mouth for your pleasure. Grabbed their head, rode their face. They loved it.',
          'On their knees for hours. Licking, sucking, worshipping. Never complaining.',
          'Your pleasure was everything. They lived for the taste of you, your wetness on their tongue.',
          'You came on their tongue. Multiple times. They savored every drop, eager for more.',
          'They ate you out until you couldn\'t stand. Legs shaking, vision blurring. Perfect.',
          'Their mouth was yours. Tongue working, lips sucking. They gave it freely.',
          'You sat on their face. Rode it roughly. They thanked you after, face wet with you.',
          'They worshipped your pussy with their tongue. Every inch licked, kissed, sucked.',
          'Every drop licked up. Not a bit wasted. Grateful. Eager for more.'
        ] : [
          'Hours of worship. They licked, sucked, kissed every inch of you. Existed only to please you.',
          'Complete devotion. They worshipped your body with tongue and lips. Your pleasure was their religion.',
          'They served you endlessly. Mouth on you for hours. You took everything, came multiple times.',
          'Their tongue worked tirelessly on your cock. Skilled, devoted. Only your pleasure mattered.',
          'You came deep in their mouth. They swallowed every drop gratefully, licking you clean.',
          'They begged to please you again. "Please let me taste you again." And again.',
          'You used their mouth for your pleasure. Grabbed their head, fucked their throat. They loved it.',
          'On their knees for hours. Sucking, licking, worshipping. Never complaining.',
          'Your pleasure was everything. They lived for the taste of you, the feel of you in their mouth.',
          'You finished on their face. Cum dripping down. They wore it proudly, smiling.',
          'They sucked you until you couldn\'t stand. Legs shaking, vision blurring. Perfect.',
          'Their mouth was yours. Throat open, tongue working. They gave it freely.',
          'You fucked their face roughly. Hands in their hair. They thanked you after, voice hoarse.',
          'They worshipped your cock with their tongue. Every inch licked, kissed, sucked.',
          'Every drop swallowed. Not a bit wasted. Grateful. Eager for more.'
        ]
      };
    }
  },
  breeding: {
    icon: Flame,
    label: 'Breed them',
    category: 'physical',
    gains: [30, 40],
    getDynamicOutcomes: (vampireGender) => {
      const isFemale = vampireGender === 'female';
      return {
        mid: isFemale ? [
          'You strapped on. Took them deep. They begged for it.',
          'Claiming them completely. Filled. Owned.',
          'They wanted you inside. You gave it.',
          'Fucking them with your strap. Primal. Perfect.',
          'They clenched around the toy. Taking everything.',
          'You pounded into them. They moaned in pleasure.'
        ] : [
          'You came deep inside. They begged for it.',
          'Claiming them completely. Filled. Owned.',
          'They wanted your seed. You gave it.',
          'Breeding them. Primal. Perfect.',
          'They clenched around you. Taking everything.',
          'You finished inside. They moaned in pleasure.'
        ],
        high: isFemale ? [
          'You fucked them with the strap for hours. Round after round. Insatiable.',
          'Every inch buried deep inside. They wanted you. Begged for it.',
          'Primal need to fill them completely. You did. Repeatedly. So wet.',
          'They begged to be fucked. "Please, fill me up." You obliged thoroughly.',
          'So wet from taking your strap. You kept going, fucking them again.',
          'You owned them. Claimed them. Fucked them deep with your cock. They were yours.',
          'They came just from feeling the strap pulse inside them. No other touch needed.',
          'Multiple rounds. All deep inside. Thoroughly fucked, trembling.',
          'You made them beg for it. "Please fuck me." Then gave it, filling them.',
          'Strap-on kink satisfied. Your toy deep in them. They were yours now, completely.',
          'You pounded into them. They moaned feeling each thrust. Loved every second.',
          'Your strap buried deep inside where it belongs. Filling them completely.',
          'They felt you thrusting, strap working inside them. Filling. Claiming. Owning.',
          'Fucked properly. Thoroughly. Completely. Pussy full.',
          'You didn\'t pull out. Stayed buried deep, grinding. Never wanted to stop.'
        ] : [
          'You bred them over and over. Round after round, filling them up. Insatiable.',
          'Every drop pumped deep inside. They wanted to carry your seed. Begged for it.',
          'Primal need to fill them completely. You did. Repeatedly. Cum dripping out between rounds.',
          'They begged to be bred. "Please, fill me up. I need your cum inside me." You obliged thoroughly.',
          'Cum dripping from their pussy. You pushed it back in with your fingers, then fucked them again.',
          'You owned them. Claimed them. Bred them deep. They were marked as yours.',
          'They came just from feeling you pulse inside them, filling them up. No other touch needed.',
          'Multiple loads. All pumped deep inside. Thoroughly bred, cum leaking from them.',
          'You made them beg for your cum. "Please cum inside me." Then gave it, filling them.',
          'Breeding kink satisfied. Your seed deep in them. They were yours now, completely.',
          'You pumped them full of cum. They moaned feeling each pulse. Loved every second.',
          'Your seed pumped deep inside where it belongs. Filling them completely.',
          'They felt you pulsing, cock throbbing inside them. Filling. Claiming. Breeding.',
          'Bred properly. Thoroughly. Completely. Pussy full of your cum.',
          'You didn\'t pull out. Stayed buried deep, pumping them full. Never would again.'
        ]
      };
    }
  },
  publicUse: {
    icon: Flame,
    label: 'Use them publicly',
    category: 'physical',
    gains: [25, 35],
    outcomes: {
      mid: [
        'Restroom stall. Public place. Quick and dirty.',
        'Against the alley wall. Anyone could see.',
        'Your hand over their mouth. Silencing moans.',
        'The thrill of being caught. They loved it.'
      ],
      high: [
        'You fucked them hard in the club bathroom. Music pounding. They tried to stay quiet, failed.',
        'Bent them over in the parking garage. Fucked them fast. Cars passing nearby, could be seen.',
        'They sucked you off under the table. Others nearby talking. You stayed composed, they swallowed.',
        'Public sex. The ultimate thrill. Risk of being caught. They came hard, biting down to stay quiet.',
        'You took them in the changing room. Hand over their mouth. Quick, rough. Risky. Perfect.',
        'Exhibitionism satisfied. The thrill of it. They wanted more, wetter from the danger.',
        'The danger made it better. Could be caught. Made them cum harder. Both of you knew it.'
      ]
    }
  },
  edging: {
    icon: Heart,
    label: 'Edge them',
    category: 'bdsm',
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
    category: 'bdsm',
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
    label: 'Degrade them (verbal)',
    category: 'bdsm',
    gains: [20, 30],
    getDynamicOutcomes: (servantName) => {
      const maleNames = ['alex', 'ash', 'blake', 'gray', 'kai', 'phoenix', 'river', 'rowan', 'sage', 'storm', 'atlas', 'orion', 'cedar'];
      const isMale = maleNames.some(name => servantName?.toLowerCase().includes(name));
      const term = isMale ? 'slut' : 'slut';
      const toy = isMale ? 'toy' : 'toy';

      return {
        mid: [
          'You called them your slut. They moaned.',
          'Degrading words. They got wetter.',
          'You made them say what they are. They obeyed.',
          'Humiliation kink satisfied.',
          '"You\'re such a whore for me." They nodded eagerly.',
          '"My little fucktoy." They whimpered with need.'
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
          'They knew their place. Beneath you.',
          '"Beg like the desperate slut you are." They did.',
          '"You\'re nothing but a hole for me." They came.',
          'Called them a cum dump. They thanked you.',
          '"My dirty little whore." Perfect obedience.'
        ]
      };
    },
    },
  praise: {
    icon: Star,
    label: 'Praise them',
    category: 'bdsm',
    gains: [15, 25],
    getDynamicOutcomes: (servantName) => {
      const maleNames = ['alex', 'ash', 'blake', 'gray', 'kai', 'phoenix', 'river', 'rowan', 'sage', 'storm', 'atlas', 'orion', 'cedar'];
      const isMale = maleNames.some(name => servantName?.toLowerCase().includes(name));
      const term = isMale ? 'boy' : 'girl';
      const Term = isMale ? 'Boy' : 'Girl';

      return {
        mid: [
          `"Good ${term}." They melted at your words.`,
          '"You\'re doing so well." They beamed.',
          `"Such a good ${term} for me." Pride in their eyes.`,
          'Praise made them glow. Beautiful.',
          '"Perfect. Just perfect." They blushed.'
        ],
        high: [
          `"Good ${term}. My perfect good ${term}." They trembled.`,
          `"Such a good ${term}. I\'m so proud of you." Tears.`,
          'Praised them thoroughly. They lived for it.',
          '"You\'re being so good for me." They melted.',
          'They craved your approval. You gave it.',
          `"My good ${term}. Always so good." Pure devotion.`,
          `"Good ${term}. The best ${term}." They worshipped you.`,
          'Praise was their drug. You their dealer.',
          '"You make me so happy." They glowed.',
          `"Perfect obedience. Good ${term}." Euphoric.`
        ]
      };
    }
  },
  exhibition: {
    icon: Eye,
    label: 'Make them perform',
    category: 'physical',
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
    category: 'bdsm',
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
    category: 'bdsm',
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
    category: 'bdsm',
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
    category: 'bdsm',
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
    category: 'bdsm',
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
  safeword: {
    icon: Heart,
    label: 'Establish safe word',
    category: 'bdsm',
    gains: [15, 20],
    outcomes: {
      mid: [
        'You discussed boundaries. Safe word chosen. Trust established.',
        '"Red means stop. Always." They nodded, grateful.',
        'Communication. Consent. The foundation of everything.',
        'Safe word in place. Now you could explore safely.'
      ],
      high: [
        'Safe word established. Complete trust. They knew you\'d always stop.',
        '"You\'ll always listen to my safe word?" "Always." Relief flooded them.',
        'Boundaries clear. Safe word ready. Now the real play could begin.',
        'They felt safer knowing they had control. Paradoxically more willing to surrender.',
        'Safe word discussion deepened trust immeasurably.',
        'Communication made everything possible. Safe. Consensual. Perfect.'
      ]
    }
  },
  aftercare: {
    icon: Heart,
    label: 'Aftercare',
    category: 'bdsm',
    gains: [20, 30],
    outcomes: {
      mid: [
        'You held them close. Soft words. Water. Blankets.',
        'Aftercare was sacred. You tended to them carefully.',
        'They came down slowly in your arms. Safe.',
        'You checked in. "Are you okay?" They nodded, content.'
      ],
      high: [
        'Aftercare was essential. You held them for hours. Praised them. Loved them.',
        'Gentle touches. Water. Chocolate. Blankets. Everything they needed.',
        'You cared for them completely. The scene wasn\'t over until aftercare was done.',
        'They curled into you. Coming down. Grounded by your presence.',
        'Aftercare made them feel treasured. Valued. More than just play.',
        'You cleaned them. Fed them. Held them. Perfect care.',
        'The vulnerability after. You protected it. Honored it.',
        'Aftercare was when they felt most loved. You never rushed it.'
      ]
    }
  },
  negotiate: {
    icon: MessageCircle,
    label: 'Negotiate scene',
    category: 'bdsm',
    gains: [12, 18],
    outcomes: {
      mid: [
        'You discussed what you both wanted. Limits. Desires.',
        'Negotiation made everything explicit. Clear. Safe.',
        'Hard limits identified. Fantasies shared. Ready to play.',
        'Communication before play. Responsible. Necessary.'
      ],
      high: [
        'Thorough negotiation. Every detail discussed. Consent enthusiastic.',
        'They told you their deepest fantasies. You listened carefully.',
        'Limits respected. Desires honored. Communication perfect.',
        'Negotiation was foreplay. Anticipation building.',
        'You planned the scene together. Collaborative. Exciting.',
        'Clear consent given for everything. Now you could explore freely.'
      ]
    }
  },
  
  // CASUAL DOMINANCE - Live-in dom/sub dynamics
  morningRoutine: {
    icon: Coffee,
    label: 'Morning routine (dom)',
    category: 'activity',
    gains: [10, 15],
    outcomes: {
      mid: [
        'They woke you with gentle touches. Obedient.',
        'Prepared your coffee exactly how you like it.',
        'Knelt beside the bed until you acknowledged them.',
        'Morning service. A daily ritual.'
      ],
      high: [
        'Woke you with their mouth. Perfect start.',
        'They waited naked and kneeling. Good.',
        'Morning inspection. They presented themselves.',
        'Coffee. Breakfast. Worship. Daily devotion.',
        'They asked permission to speak. Granted.',
        'Morning protocol maintained. Perfect.'
      ]
    }
  },
  positionTraining: {
    icon: Hand,
    label: 'Position training',
    category: 'activity',
    gains: [15, 20],
    outcomes: {
      mid: [
        'Taught them proper kneeling position.',
        'Present position practiced. Getting better.',
        'They held position for minutes. Improving.',
        'Protocol training. Essential.'
      ],
      high: [
        'Perfect positions. Every time. Trained well.',
        'They could hold positions for hours now.',
        'Presentation position automatic. Natural.',
        'Position training complete. Muscle memory.',
        'You called a position. They assumed it instantly.',
        'Living furniture training. They didn\'t move.'
      ]
    }
  },
  dailyInspection: {
    icon: Eye,
    label: 'Daily inspection',
    category: 'activity',
    gains: [12, 18],
    outcomes: {
      mid: [
        'Daily inspection. They stood still. Examined.',
        'You checked them over. Approved.',
        'Inspection routine. They knew the drill.',
        'Examined thoroughly. Nothing hidden from you.'
      ],
      high: [
        'Full inspection. They spread. Presented. Perfect.',
        'Daily check. Collar. Body. Mind. All yours.',
        'Inspection found them wet. Always ready.',
        'They lived for your approval during inspection.',
        'Examined every inch. Your property. Maintained.',
        'Inspection ritual. Vulnerability. Trust. Complete.'
      ]
    }
  },
  casualUse: {
    icon: Flame,
    label: 'Casual use',
    category: 'physical',
    gains: [18, 25],
    outcomes: {
      mid: [
        'Bent them over the counter. Casual. Natural.',
        'Used them while cooking dinner. Multitasking.',
        'They were watching TV. You used them. Continued.',
        'Free use established. They loved it.'
      ],
      high: [
        'Casual use anytime anywhere. Their favorite.',
        'Mid-conversation you used them. Kept talking.',
        'They were yours to use. Always. No questions.',
        'Fucked them while they did dishes. Perfect.',
        'Free use lifestyle. They were always available.',
        'Used them then went back to reading. Normal.',
        'Casual dominance. Constant. Natural. Right.'
      ]
    }
  },
  servicePosition: {
    icon: Heart,
    label: 'Service position (kneel)',
    category: 'activity',
    gains: [10, 15],
    outcomes: {
      mid: [
        'Pointed. They knelt immediately. Good.',
        'Service position. They assumed it. Waited.',
        'You sat. They knelt at your feet. Natural.',
        'Kneeling was their place. They knew it.'
      ],
      high: [
        'They knelt without being told anymore.',
        'Service position automatic. Perfect training.',
        'Kneeling at your feet. Their favorite place.',
        'You gestured. They dropped. No hesitation.',
        'Service position maintained for hours. Beautiful.',
        'They lived at your feet now. Belonged there.'
      ]
    }
  },
  
  // SUB PERFORMING ACTS ON DOM
  worshipDom: {
    icon: Heart,
    label: 'Make them worship you',
    category: 'physical',
    gains: [20, 28],
    outcomes: {
      mid: [
        'They worshipped your body. Every inch.',
        'Kisses trailing everywhere. Reverent.',
        'They worshipped you like a god. Fitting.',
        'Body worship. You deserved it.'
      ],
      high: [
        'They worshipped you for hours. Devoted.',
        'Every part of you received attention. Perfect.',
        'Body worship was their meditation. Holy.',
        'They kissed. Licked. Worshipped. Completely.',
        'Worship was prayer. You were their religion.',
        'They lived to worship you. Purpose fulfilled.'
      ]
    }
  },
  oralService: {
    icon: Flame,
    label: 'Receive oral service',
    category: 'physical',
    gains: [22, 30],
    getDynamicOutcomes: (vampireGender) => {
      const isFemale = vampireGender === 'female';
      return {
        mid: [
          'They serviced you with their mouth. Skilled.',
          'On their knees. Serving. Obedient.',
          'Oral service rendered. Excellent.',
          'Their mouth was yours to use. They knew it.'
        ],
        high: isFemale ? [
          'Expert oral service. Trained perfectly. Their tongue worked you skillfully, no hesitation.',
          'They ate you out for hours. Worshipped your pussy with their mouth. No complaints.',
          'Tongue training paid off. They licked you perfectly. Impressive technique.',
          'Their mouth was yours. They offered it eagerly, tongue ready, lips soft.',
          'Oral service until you were satisfied. They kept going until you came. Multiple times.',
          'They lived to please you with their mouth. Licked you eagerly, lovingly.',
          'You rode their face thoroughly. Grabbed their head, used their tongue. They thanked you after.',
          'Their mouth was your property. Used it whenever you wanted. They loved it.'
        ] : [
          'Expert oral service. Trained perfectly. Took you deep, no gagging, skillful tongue work.',
          'They sucked you for hours. Worshipped your cock with their mouth. No complaints.',
          'Deepthroat training paid off. They took you all the way down. Impressive, nose pressed to you.',
          'Their throat was yours. They offered it eagerly, opening wide, relaxing their throat.',
          'Oral service until you were satisfied. They kept going until you came. Completely.',
          'They lived to please you with their mouth. Sucked you eagerly, lovingly.',
          'Facefucked them thoroughly. Grabbed their head, used their throat. They thanked you after.',
          'Their mouth was your property. Used it whenever you wanted. They loved it.'
        ]
      };
    }
  },
  massageDom: {
    icon: Hand,
    label: 'Demand massage',
    category: 'activity',
    gains: [10, 15],
    outcomes: {
      mid: [
        'They massaged you. Skilled hands. Relaxing.',
        'Full body massage. You needed it. They gave it.',
        'Massage service. Part of their duties.',
        'They worked out every knot. Perfect.'
      ],
      high: [
        'Massage with a happy ending. Obviously.',
        'They massaged you for hours. Service.',
        'Expert massage. Trained well. Rewarded.',
        'Massage turned into more. As planned.',
        'They massaged. You relaxed. They served.',
        'Service massage. Their pleasure was your pleasure.'
      ]
    }
  },
  rideDom: {
    icon: Flame,
    label: 'Make them ride you',
    category: 'physical',
    gains: [25, 35],
    getDynamicOutcomes: (vampireGender) => {
      const isFemale = vampireGender === 'female';
      return {
        mid: [
          'They rode you. Hard. Fast. Desperate.',
          'Rode until their legs gave out. Beautiful.',
          'They did all the work. You watched.',
          'Riding you was their privilege.'
        ],
        high: isFemale ? [
          'They rode your thigh for hours. Grinding desperately. Came multiple times, kept going, insatiable.',
          'They rode your fingers until their legs gave out. Thighs shaking, exhausted, satisfied.',
          'Perfect rhythm. Bodies trained to please you. Rode your hand just how you like it.',
          'Rode your fingers desperately. "Please let me keep going." Begged to continue even when spent.',
          'They came from riding you. Again. Again. Each orgasm making them clench tight around your fingers.',
          'Riding was worship. They gave everything, bodies grinding, taking what you gave.',
          'You didn\'t move. Just watched them work. They did all the work, fucking themselves on your fingers. Perfect.',
          'Rode until exhaustion. Legs trembling. Still tried to continue, couldn\'t get enough.'
        ] : [
          'Rode you for hours. Bouncing on your cock. Came multiple times, kept going, insatiable.',
          'They rode you until their legs gave out. Thighs shaking, exhausted, satisfied.',
          'Perfect rhythm. Bodies trained to please you. Rode you just how you like it.',
          'Rode you desperately. "Please let me keep going." Begged to continue even when spent.',
          'They came from riding you. Again. Again. Each orgasm making them clench tight around you.',
          'Riding was worship. They gave everything, bodies bouncing, taking you deep.',
          'You didn\'t move. Just watched them work. They did all the work, fucking themselves on you. Perfect.',
          'Rode until exhaustion. Legs trembling. Still tried to continue, couldn\'t get enough.'
        ]
      };
    }
  },
  dressUp: {
    icon: Sparkles,
    label: 'Make them dress for you',
    category: 'activity',
    gains: [12, 18],
    outcomes: {
      mid: [
        'You chose their outfit. They wore it proudly.',
        'Dressed them how you wanted. Perfect.',
        'Lingerie. Your choice. They modeled.',
        'They dressed to please you. Only you.'
      ],
      high: [
        'Dressed them like a doll. Your doll.',
        'You controlled their wardrobe completely now.',
        'They wore only what you approved. Always.',
        'Outfit selected. Presented for approval. Perfect.',
        'Dressed them. Undressed them. Controlled.',
        'Your preferences became their style. Complete.'
      ]
    }
  },
  beg: {
    icon: MessageCircle,
    label: 'Make them beg',
    category: 'physical',
    gains: [18, 25],
    outcomes: {
      mid: [
        'You made them beg. They did. Beautifully.',
        'Begging was required. They complied.',
        'They begged for permission. Granted. Eventually.',
        'Begging showed proper respect. Good.'
      ],
      high: [
        'They begged so prettily. You made them continue.',
        'Begging became natural. Automatic. Right.',
        'Made them beg for hours. Then denied them.',
        'They begged. Cried. Pleaded. Finally allowed.',
        'Beautiful begging. Desperate. Sincere. Perfect.',
        'They knew to beg. Never had to remind them.',
        'Begging was their love language now.'
      ]
    }
  },
  
  // Social - Tier 1
  talk: {
    icon: MessageCircle,
    label: 'Talk deeply',
    category: 'social',
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
    gains: [20, 35],
    outcomes: {
      mid: ['You promised them forever. You meant it.', 'A vow made. Unbreakable.', 'Your promise hung in the air. Sacred.'],
      high: ['Forever pledged. Nothing could break this.', 'You swore eternity. They believed you.', 'An eternal promise. Binding.']
    }
  },
  
  // Sweet & Romantic - Tier 1
  holdHands: {
    icon: Heart,
    label: 'Hold hands',
    category: 'romantic',
    gains: [5, 10],
    outcomes: {
      low: ['You reached for their hand. They let you.', 'Fingers intertwined. Simple. Sweet.', 'Hand in hand. A small gesture. Meaningful.'],
      mid: ['You held hands. They squeezed yours gently.', 'Walking together. Hands clasped. Perfect.', 'Their hand fit perfectly in yours.'],
      high: ['You held hands. They pulled you closer.', 'Hand in hand. Like it was always meant to be.', 'Your hands together. Inseparable.']
    }
  },
  forehead: {
    icon: Heart,
    label: 'Kiss their forehead',
    category: 'romantic',
    gains: [6, 12],
    outcomes: {
      low: ['You kissed their forehead softly. They smiled.', 'A gentle forehead kiss. Tender.', 'You pressed your lips to their forehead. Sweet.'],
      mid: ['Forehead kiss. They closed their eyes. Peaceful.', 'You kissed their forehead. They sighed contentedly.', 'A soft kiss to their forehead. They melted.'],
      high: ['You kissed their forehead. They whispered "I love you."', 'Forehead kiss. Pure affection. Pure love.', 'You kissed their forehead tenderly. Everything felt right.']
    }
  },
  slowDance: {
    icon: Music,
    label: 'Slow dance',
    category: 'romantic',
    gains: [8, 15],
    outcomes: {
      low: ['You pulled them close for a slow dance. Awkward but sweet.', 'Dancing slowly. Learning each other\'s rhythm.', 'You swayed together. Getting closer.'],
      mid: ['Slow dancing. Your bodies moved as one.', 'You held them close. Dancing in the moonlight.', 'Swaying together. Lost in the moment.'],
      high: ['Slow dance. Perfect synchronicity. Pure romance.', 'Dancing together. Time stopped. Just you two.', 'You held them close, dancing. Nothing else existed.']
    }
  },
  breakfast: {
    icon: Coffee,
    label: 'Make breakfast',
    category: 'romantic',
    gains: [7, 13],
    outcomes: {
      low: ['You made them breakfast. They appreciated it.', 'Morning surprise. Pancakes and coffee.', 'You cooked for them. Sweet gesture.'],
      mid: ['Breakfast in bed. They woke up smiling.', 'You made their favorite. They kissed you.', 'Morning together. Breakfast. Perfect.'],
      high: ['You made breakfast. They said it was the sweetest thing.', 'Morning routine. Together. Like a real couple.', 'Breakfast made with love. They felt it.']
    }
  },

  movieNight: {
    icon: Smile,
    label: 'Movie night',
    category: 'romantic',
    gains: [6, 11],
    outcomes: {
      low: ['Movie night. You sat together.', 'Watching a movie. Comfortable silence.', 'Film playing. You focused on each other more.'],
      mid: ['Movie night. Cuddled up together.', 'You didn\'t watch much of the movie. Too distracted.', 'Cozy movie night. They fell asleep on you.'],
      high: ['Movie forgotten. You couldn\'t stop kissing.', 'Movie night turned into cuddles and kisses.', 'The movie played. You made your own memories.']
    }
  },
  surprise: {
    icon: Sparkles,
    label: 'Surprise them',
    category: 'romantic',
    gains: [10, 18],
    outcomes: {
      low: ['You surprised them with flowers. They blushed.', 'Small surprise. Big smile.', 'You left them a note. They loved it.'],
      mid: ['Surprise date. They were thrilled.', 'You planned something special. Perfect.', 'Surprise gift. They were speechless.'],
      high: ['Your surprise made them cry happy tears.', 'Perfect surprise. They said you\'re incredible.', 'Romantic surprise. They\'ll never forget it.']
    }
  },
  massage: {
    icon: Hand,
    label: 'Give massage',
    category: 'romantic',
    gains: [8, 14],
    outcomes: {
      low: ['You massaged their shoulders. They relaxed.', 'Gentle massage. Caring touch.', 'You rubbed their back. Soothing.'],
      mid: ['Massage. They melted under your hands.', 'You massaged them. Intimate. Caring.', 'Gentle touches. Relaxation. Connection.'],
      high: ['Massage turned into tender kisses everywhere.', 'You massaged them. Pure love in every touch.', 'They said your touch heals them.']
    }
  },
  picnic: {
    icon: Utensils,
    label: 'Midnight picnic',
    category: 'romantic',
    gains: [11, 19],
    outcomes: {
      low: ['Midnight picnic. Simple. Nice.', 'You laid out food under the moon.', 'Picnic together. Getting to know each other.'],
      mid: ['Perfect midnight picnic. Romantic.', 'Under the moon. Food. Laughter. Kisses.', 'Picnic date. They said it was magical.'],
      high: ['Best date ever. They called it perfect.', 'Midnight picnic. They said they\'re falling for you.', 'Romantic picnic. Everything felt right.']
    }
  },
  letter: {
    icon: MessageCircle,
    label: 'Write love letter',
    category: 'romantic',
    gains: [12, 20],
    outcomes: {
      low: ['You wrote them a letter. They read it carefully.', 'Love letter. Simple words. True feelings.', 'You expressed yourself in writing. They kept it.'],
      mid: ['Your letter made them emotional.', 'Love letter. They said it was beautiful.', 'You poured your heart out. They felt it.'],
      high: ['Your letter made them cry. Happy tears.', 'They said your letter was the most beautiful thing.', 'Love letter. They\'ll treasure it forever.']
    }
  },

  // Activity - Tier 1
  observe: {
    icon: Eye,
    label: 'Watch them',
    category: 'activity',
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
    gains: [9, 16],
    outcomes: {
      low: ['You looked at stars together. Quiet companionship.', 'They pointed out constellations.', 'Night sky. Shared wonder.'],
      mid: ['They moved closer. Stars reflected in their eyes.', 'You talked about infinity. They held your hand.', 'Under the stars, barriers dissolved.'],
      high: ['They said the stars were nothing compared to you.', 'You kissed under moonlight. Perfect moment.', 'The universe witnessed your connection.']
    }
  },
  bourbon: {
    icon: Wine,
    label: 'Drink bourbon (cope)',
    category: 'activity',
    gains: [4, 8],
    outcomes: {
      low: [
        'You poured bourbon. Drank it neat. The burn distracted from the hunger. Barely.',
        'Bourbon. Glass after glass. They watched you. "You okay?" Not really.',
        'You drank to dull the cravings. It worked. Sort of. For now.'
      ],
      mid: [
        'Bourbon became a ritual. Pour. Drink. Resist. They didn\'t ask why you needed it.',
        'You drank bourbon instead of blood. Healthier? Debatable. Necessary? Absolutely.',
        'The bottle emptied. The hunger remained. But quieter. Manageable. Almost.'
      ],
      high: [
        'Bourbon was your anchor. Your control. They understood. Didn\'t judge. Stayed.',
        'You drank bourbon for hours. Talking. Laughing. Almost forgot you were a monster.',
        'The cravings screamed. The bourbon whispered. You listened to the bourbon. This time.'
      ]
    },
    special: true
  },
  travel: {
    icon: Wind,
    label: 'Travel together',
    category: 'activity',
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
    special: true,
    gains: [0, 0]
  },
  
  setTitle: {
    icon: Crown,
    label: 'Set your title',
    category: 'power',
    special: true,
    gains: [0, 0]
  },

  setBoundaries: {
    icon: MessageCircle,
    label: 'Discuss boundaries',
    category: 'social',
    special: true,
    gains: [0, 0]
  },

  setIdentity: {
    icon: Heart,
    label: 'Discuss their identity',
    category: 'social',
    special: true,
    gains: [0, 0]
  },
  
  videocall: {
    icon: Eye,
    label: 'Video call (watch them)',
    category: 'social',
    gains: [15, 25],
    outcomes: {
      mid: ['Video call. You watched them touch themselves. They were shy at first.', 'They stripped for you on camera. Distance made it exciting.', 'Video call intimacy. New kind of connection.'],
      high: ['You watched them masturbate on video call. They came for you. Perfect.', 'Video call. You told them exactly what to do. They obeyed. Hot.', 'Long distance pleasure. They came while you watched. Beautiful.']
    }
  },
  sexting: {
    icon: MessageCircle,
    label: 'Sext with them',
    category: 'social',
    gains: [12, 20],
    outcomes: {
      mid: ['Dirty texts back and forth. They sent photos. You responded.', 'Sexting session. Words became foreplay. Intense.', 'Text after text. Building tension. They were touching themselves.'],
      high: ['Sexting intensified. They sent videos. You came together over text.', 'Dirty messages. Photos. Videos. They came while texting you.', 'Sexting until late. They begged you to come over. You did.']
    }
  },

  // Dark/Vampire options
  turn: {
    icon: Droplets,
    label: 'Turn them into a vampire',
    category: 'power',
    gains: [0, 0],
    outcomes: {
      mid: ['You drained them to the edge of death. Fed them your blood. The transformation began.', 'Dying in your arms. You cut your wrist. Made them drink. Changed forever.', 'You turned them. They screamed. Then went silent. Then woke up different.'],
      high: ['You turned them willingly. They begged for it. Now they\'re yours eternally.', 'The transformation complete. They opened their eyes. Red. Hungry. Vampire.', 'You made them immortal. Forever bound. Forever yours.']
    },
    isTurn: true
  },
  kill: {
    icon: Skull,
    label: 'Kill them',
    category: 'power',
    gains: [0, 0],
    outcomes: {
      low: ['You drained them completely. They collapsed. Dead.', 'Their life ended in your arms. Quick. Final.', 'You killed them. No hesitation. No remorse.']
    },
    isKill: true
  }
};

export default function DirectInteraction({ servant, vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [interactionType, setInteractionType] = useState('');
  const [showPowers, setShowPowers] = useState(false);
  const [showTitleSelection, setShowTitleSelection] = useState(false);
  const [showBoundaries, setShowBoundaries] = useState(false);
  const [showIdentity, setShowIdentity] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [liteMode, setLiteMode] = useState(vampireState?.content_filter === 'lite');
  const [showSlider, setShowSlider] = useState(false);
  const [sliderType, setSliderType] = useState(null);
  
  // Always call hooks in the same order - never conditionally
  const { data: interactionProgress = [] } = useQuery({
    queryKey: ['interactionProgress'],
    queryFn: () => base44.entities.InteractionProgress.list()
  });

  if (!vampireState) {
    return null;
  }

  const isVampFemale = vampireState.gender === 'woman';
  
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
  
  const generateNewInteractions = async (category, tier) => {
    await base44.entities.NightLog.create({
      entry: `Your ${category} interactions evolved. New possibilities unlocked at Tier ${tier}.`,
      category: 'interaction',
      intensity: 'moderate'
    });
  };
  
  const sliderInteractions = [
    'intimate', 'dominate', 'worship', 'breeding', 'edging', 'bdsm', 'orgasmControl', 
    'oralService', 'rideDom', 'multiple', 'Marathon', 'vampireSex', 'vampireBiteDuringsex',
    'vampireRoughFuck', 'vampireSpeedFuck', 'vampireWallFuck', 'vampireMarathon',
    'roughBehind', 'behindSeduction', 'publicUse', 'casualUse', 'service', 'vampireDoubleFeeding',
    'tease', 'makeout', 'exhibition', 'vampireBloodPlay', 'vampireRace', 'vampireSpar',
    'videocall', 'sexting'
  ];

  const handleInteraction = async (type) => {
    if (type === 'usePower') {
      setShowPowers(true);
      return;
    }
    
    if (type === 'setTitle') {
      setShowTitleSelection(true);
      return;
    }

    if (type === 'setBoundaries') {
      setShowBoundaries(true);
      return;
    }

    if (type === 'setIdentity') {
      setShowIdentity(true);
      return;
    }

    // Check if interaction should use slider
    if (sliderInteractions.includes(type) && !liteMode) {
      setSliderType(type);
      setShowSlider(true);
      return;
    }
    
    if (type === 'turn') {
      if (servant.is_turned) {
        alert('They\'re already a vampire.');
        return;
      }
      if (!confirm(`Turn ${servant.name} into a vampire? This cannot be undone.`)) {
        return;
      }
    }
    
    if (type === 'kill') {
      if (!confirm(`Kill ${servant.name}? This cannot be undone.`)) {
        return;
      }
    }
    
    setProcessing(true);
    setInteractionType(type);
    
    // Get interaction from combined interactions (handles turned vampires)
    const allInteractions = servant.is_turned 
      ? { ...INTERACTIONS, ...TURNED_VAMPIRE_INTERACTIONS }
      : INTERACTIONS;
    
    const interaction = allInteractions[type];
    if (!interaction) {
      console.error('Unknown interaction type:', type);
      setProcessing(false);
      return;
    }

    const rel = servant.relationship || 0;
    const tier = getRelationshipTier(rel);
    
    // Handle dynamic outcomes for gender-specific interactions
    let outcomes;
    if (interaction.getDynamicOutcomes) {
      const dynamicOutcomes = ['worship', 'oralService', 'rideDom', 'dominate', 'breeding'].includes(type) 
        ? interaction.getDynamicOutcomes(vampireState.gender) 
        : interaction.getDynamicOutcomes(servant.name);
      outcomes = dynamicOutcomes?.[tier] || dynamicOutcomes?.mid || dynamicOutcomes?.low;
    } else if (interaction.outcomes) {
      outcomes = interaction.outcomes[tier] || interaction.outcomes.mid || interaction.outcomes.low;
    }

    if (!outcomes || outcomes.length === 0) {
      console.error('No outcomes found for interaction:', type);
      setProcessing(false);
      return;
    }

    const baseOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    
    // Add title if set
    let outcome = addTitleToOutcome(baseOutcome);
    
    setOutcome(outcome);
    
    setTimeout(async () => {
      // Bourbon as a coping mechanism. Rarely works. Often fails. Temptation wins.
      if (type === 'bourbon' && vampireState.id) {
        const effectiveness = Math.random();

        if (effectiveness > 0.85) {
          // Rarely works - brief respite
          const hungerStates = ['restless', 'heightened', 'lingering', 'calm', 'sated'];
          const currentIndex = hungerStates.indexOf(vampireState.hunger_state);
          if (currentIndex < hungerStates.length - 1) {
            await base44.entities.VampireState.update(vampireState.id, {
              hunger_state: hungerStates[currentIndex + 1]
            });
            setOutcome(outcome + ' The bourbon helped. For now. It won\'t last.');
          }
        } else if (effectiveness > 0.45) {
          // Does nothing - just delaying the inevitable
          setOutcome(outcome + ' The bourbon did nothing. The hunger remains. You\'re fooling yourself.');
        } else {
          // Usually makes it worse - temptation intensifies
          const hungerStates = ['sated', 'calm', 'lingering', 'heightened', 'restless'];
          const currentIndex = hungerStates.indexOf(vampireState.hunger_state);
          if (currentIndex < hungerStates.length - 1) {
            await base44.entities.VampireState.update(vampireState.id, {
              hunger_state: hungerStates[currentIndex + 1]
            });
            setOutcome(outcome + ' The bourbon backfired. The hunger intensified. You\'re losing control.');
          }
        }
      }

      const [min, max] = interaction.gains;
      const baseGain = Math.floor(Math.random() * (max - min + 1)) + min;

      // Apply variant modifier
      const modifier = getVariantModifier(servant.variant, interaction.category);
      const relationshipGain = Math.round(baseGain * modifier);
      const newRel = Math.min((servant.relationship || 0) + relationshipGain, 100);
      
      try {
        // Update emotional state based on variant and new relationship
        const emotionalStates = {
          devoted: ['shy', 'longing', 'devoted', 'worshipful', 'transcendent'],
          defiant: ['conflicted', 'resistant', 'surrendering', 'accepting', 'bound'],
          dreamer: ['distant', 'drifting', 'fading', 'ethereal', 'dissolved']
        };
        const stateIndex = Math.min(Math.floor(newRel / 20), 4);
        const newEmotionalState = emotionalStates[servant.variant][stateIndex];
        
        // Reduce/eliminate jealousy gain for physical interactions if boundaries allow
        let jealousyGain = 0;
        if (['physical', 'bdsm'].includes(interaction.category) && !['open', 'no-strings'].includes(servant.boundaries)) {
          jealousyGain = Math.floor(Math.random() * 5) + 2;
        }
        
        await base44.entities.Servant.update(servant.id, {
          relationship: newRel,
          obsession_stage: Math.min(Math.floor(newRel / 20) + 1, 5),
          emotional_state: newEmotionalState,
          last_interaction: new Date().toISOString(),
          jealousy_level: Math.min((servant.jealousy_level || 0) + jealousyGain, 100)
        });
      } catch (e) {
        console.error('Failed to update servant:', e);
      }
      
      // Determine humanity impact of interaction
      let humanityChange = 0;
      if (interaction.category === 'social') humanityChange = 1; // Positive interactions
      else if (['bite', 'intimate'].includes(type) && rel < 40) humanityChange = -2; // Forcing intimacy
      
      // Update vampire state with humanity
      try {
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
      } catch (e) {
        console.error('Failed to update humanity:', e);
      }
      
      await base44.entities.NightLog.create({
        entry: `With ${servant.name}: ${outcome}`,
        category: 'interaction',
        intensity: ['intimate', 'makeout', 'bite'].includes(type) ? 'significant' : 'moderate'
      });
      
      // Tier system removed - no progression tracking needed

      // Update quest progress
      try {
        const quests = await base44.entities.Quest.filter({ servant_id: servant.id });
        const activeQuest = quests.find(q => !q.completed);
        if (activeQuest) {
          const progress = activeQuest.progress || {};
          const newCount = (progress.interact || 0) + 1;
          await base44.entities.Quest.update(activeQuest.id, {
            progress: { ...progress, interact: newCount }
          });
        }
      } catch (e) {
        console.error('Failed to update quest:', e);
      }

      queryClient.invalidateQueries();

      // If turned, mark as vampire and create blood bond
      if (type === 'turn') {
        try {
          const preTurnRel = servant.relationship || 0;
          
          // Update servant to vampire
          await base44.entities.Servant.update(servant.id, {
            is_turned: true,
            pre_turn_relationship: preTurnRel,
            vampire_stage: 1,
            vampire_power_level: Math.floor(preTurnRel / 2), // Higher pre-turn relationship = stronger starting power
            nights_as_vampire: 0,
            unlocked_powers: preTurnRel >= 50 ? ['Enhanced Senses'] : [],
            teaching_progress: 0
          });
          
          // Create blood bond - strength based on human feelings before turn
          const bondStrength = Math.min(100, preTurnRel + 20); // Pre-turn love creates stronger bond
          await base44.entities.BloodBond.create({
            sire_id: vampireState.id,
            progeny_id: servant.id,
            bond_strength: bondStrength,
            bloodline: vampireState.family_bloodline || `House of ${vampireState.vampire_name}`,
            shared_powers: vampireState.unlocked_powers?.slice(0, 2) || [],
            can_compel: true,
            turns_made: 0
          });
          
          const bondDesc = bondStrength >= 80 
            ? 'The sire bond is absolute. Their human love became eternal devotion.'
            : bondStrength >= 50
            ? 'A strong sire bond formed. Their feelings before death anchored deep.'
            : 'A sire bond exists, but weaker. They didn\'t know you well enough as human.';
          
          await base44.entities.NightLog.create({
            entry: `You turned ${servant.name}. They're a vampire now. Immortal. Bound to you forever.\n\n${bondDesc}`,
            category: 'interaction',
            intensity: 'significant'
          });
          
          queryClient.invalidateQueries();
        } catch (e) {
          console.error('Failed to turn servant:', e);
        }
        
        setTimeout(() => {
          onClose();
        }, 5000);
        return;
      }

      // If killed, delete the servant and create a new one
      if (type === 'kill') {
        try {
          await base44.entities.Servant.delete(servant.id);

          // Track ripper kill if in ripper mode
          if (vampireState.emotional_mode === 'ruthless' && vampireState.id) {
            const ripperKills = (vampireState.ripper_kills || 0) + 1;
            await base44.entities.VampireState.update(vampireState.id, {
              ripper_kills: ripperKills
            });
          }

          // Create a new servant after a delay
          setTimeout(async () => {
            const names = [
              'Ash', 'River', 'Sage', 'Rowan', 'Quinn', 'Jade', 'Raven', 'Storm',
              'Blake', 'Eden', 'Gray', 'Haven', 'Indigo', 'Jules', 'Kai',
              'Morgan', 'Nova', 'Onyx', 'Phoenix', 'Rain', 'Shadow', 'Sky', 'Wren',
              'Ember', 'Luna', 'Atlas', 'Iris', 'Orion', 'Lyra', 'Cedar', 'Dante',
              'Celeste', 'Zephyr', 'Vesper', 'Sable', 'Crimson', 'Nyx', 'Aspen'
            ];
            const variants = ['devoted', 'defiant', 'dreamer'];
            const emotionalStates = ['curious', 'wary', 'distant'];
            const genders = ['man', 'woman', 'custom'];
            const sexualities = ['straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'asexual', 'questioning'];
            const jobs = [
              'Night Club Bartender',
              'Tattoo Artist',
              'Night Security Guard',
              'Museum Curator',
              'Mortuary Assistant',
              'Librarian',
              'Underground Music Venue Manager',
              'Vintage Shop Owner',
              'Late Night Radio Host',
              'Graveyard Groundskeeper'
            ];

            // Check for existing servant names to avoid duplicates
            const existingServants = await base44.entities.Servant.list();
            const existingNames = existingServants.map(s => s.name);
            const availableNames = names.filter(n => !existingNames.includes(n));
            
            const newName = availableNames.length > 0 
              ? availableNames[Math.floor(Math.random() * availableNames.length)]
              : names[Math.floor(Math.random() * names.length)];

            await base44.entities.Servant.create({
              name: newName,
              gender: genders[Math.floor(Math.random() * genders.length)],
              sexuality: sexualities[Math.floor(Math.random() * sexualities.length)],
              job: jobs[Math.floor(Math.random() * jobs.length)],
              variant: variants[Math.floor(Math.random() * variants.length)],
              obsession_stage: 1,
              emotional_state: emotionalStates[Math.floor(Math.random() * emotionalStates.length)]
            });

            queryClient.invalidateQueries();
          }, 2000);
        } catch (e) {
          console.error('Failed to kill servant:', e);
        }

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

  // Tier system removed - all interactions available

  // Combine interactions - add vampire interactions if servant is turned
  const allInteractions = servant.is_turned 
    ? { ...INTERACTIONS, ...TURNED_VAMPIRE_INTERACTIONS }
    : INTERACTIONS;

  const categories = servant.is_turned 
    ? ['all', 'romantic', 'vampire', 'physical', 'bdsm', 'social', 'activity', 'power']
    : ['all', 'romantic', 'physical', 'bdsm', 'social', 'activity', 'power'];

  // Explicit interactions to hide in lite mode
  const explicitInteractions = [
    'dominate', 'submit', 'worship', 'breeding', 'publicUse', 'edging', 'bdsm',
    'degradation', 'orgasmControl', 'collar', 'train', 'punish', 'bondage',
    'morningRoutine', 'positionTraining', 'dailyInspection', 'casualUse', 'servicePosition',
    'worshipDom', 'oralService', 'massageDom', 'rideDom', 'dressUp', 'beg',
    'vampireSex', 'vampireBiteDuringsex', 'vampireRoughFuck', 'vampireBloodPlay',
    'vampireSpeedFuck', 'vampireWallFuck', 'vampireMarathon', 'vampireBiteMark',
    'vampireDoubleFeeding', 'vampireDominance', 'roughBehind', 'whisperDirty',
    'behindSeduction', 'multiple', 'Marathon', 'service'
  ];

  // Filter by category and lite mode
  const filteredInteractions = Object.entries(allInteractions).filter(([key, interaction]) => {
    // Category filter
    if (selectedCategory !== 'all' && interaction.category !== selectedCategory) {
      return false;
    }

    // Lite mode filter - hide explicit interactions
    if (liteMode && explicitInteractions.includes(key)) {
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
        {showBoundaries && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90"
            onClick={() => setShowBoundaries(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full relative"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBoundaries(false);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold text-white mb-4">Set Boundaries</h2>
              <p className="text-gray-400 text-sm mb-6">
                Discuss what kind of relationship you have with {servant.name}
              </p>

              <div className="space-y-3">
                <button
                  onClick={async () => {
                    try {
                      await base44.entities.Servant.update(servant.id, { boundaries: 'exclusive' });
                      await base44.entities.NightLog.create({
                        entry: `You and ${servant.name} agreed to be exclusive. They're yours alone.`,
                        category: 'interaction',
                        intensity: 'moderate'
                      });
                      queryClient.invalidateQueries();
                      setShowBoundaries(false);
                    } catch (e) {
                      console.error('Failed to set boundaries:', e);
                    }
                  }}
                  className="w-full bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 rounded-xl p-4 text-left transition-colors"
                >
                  <h3 className="text-white font-medium mb-1">💍 Exclusive</h3>
                  <p className="text-gray-400 text-sm">They're yours alone. No sharing. They'll be jealous of others.</p>
                </button>

                <button
                  onClick={async () => {
                    try {
                      await base44.entities.Servant.update(servant.id, { boundaries: 'open' });
                      await base44.entities.NightLog.create({
                        entry: `You and ${servant.name} agreed to an open relationship. Sharing is allowed.`,
                        category: 'interaction',
                        intensity: 'moderate'
                      });
                      queryClient.invalidateQueries();
                      setShowBoundaries(false);
                    } catch (e) {
                      console.error('Failed to set boundaries:', e);
                    }
                  }}
                  className="w-full bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-xl p-4 text-left transition-colors"
                >
                  <h3 className="text-white font-medium mb-1">💜 Open Relationship</h3>
                  <p className="text-gray-400 text-sm">Sharing is okay. No jealousy. You can have others.</p>
                </button>

                <button
                  onClick={async () => {
                    try {
                      await base44.entities.Servant.update(servant.id, { boundaries: 'no-strings' });
                      await base44.entities.NightLog.create({
                        entry: `You and ${servant.name} agreed it's casual. No strings attached.`,
                        category: 'interaction',
                        intensity: 'subtle'
                      });
                      queryClient.invalidateQueries();
                      setShowBoundaries(false);
                    } catch (e) {
                      console.error('Failed to set boundaries:', e);
                    }
                  }}
                  className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-xl p-4 text-left transition-colors"
                >
                  <h3 className="text-white font-medium mb-1">🌙 No Strings</h3>
                  <p className="text-gray-400 text-sm">Casual. No expectations. Just fun.</p>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showIdentity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90"
            onClick={() => setShowIdentity(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full relative max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowIdentity(false);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold text-white mb-2">Set Identity</h2>
              <p className="text-gray-400 text-sm mb-4">
                Help {servant.name} express who they are
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-white font-medium mb-2 block">Gender</label>
                  <div className="space-y-2">
                    {[
                      { value: 'man', label: 'Man' },
                      { value: 'woman', label: 'Woman' },
                      { value: 'custom', label: 'Custom' }
                    ].map(g => (
                      <button
                        key={g.value}
                        onClick={async () => {
                         try {
                           await base44.entities.Servant.update(servant.id, { gender: g.value });
                           queryClient.invalidateQueries();
                         } catch (e) {
                           console.error('Failed to update gender:', e);
                         }
                        }}
                        className={`w-full rounded-lg py-3 px-4 text-left transition-colors ${
                          servant.gender === g.value 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-white font-medium mb-2 block">Pronouns</label>
                  <div className="space-y-2">
                    {[
                      { value: 'he/him', label: 'He/Him' },
                      { value: 'she/her', label: 'She/Her' },
                      { value: 'they/them', label: 'They/Them' },
                      { value: 'any', label: 'Any Pronouns' }
                    ].map(p => (
                      <button
                        key={p.value}
                        onClick={async () => {
                         try {
                           await base44.entities.Servant.update(servant.id, { pronouns: p.value });
                           queryClient.invalidateQueries();
                         } catch (e) {
                           console.error('Failed to update pronouns:', e);
                         }
                        }}
                        className={`w-full rounded-lg py-2 px-3 text-left transition-colors text-sm ${
                          servant.pronouns === p.value 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-white font-medium mb-2 block">Sexuality</label>
                  <div className="space-y-2">
                    {[
                      { value: 'straight', label: 'Straight' },
                      { value: 'gay', label: 'Gay' },
                      { value: 'lesbian', label: 'Lesbian' },
                      { value: 'bisexual', label: 'Bisexual' },
                      { value: 'pansexual', label: 'Pansexual' },
                      { value: 'asexual', label: 'Asexual' },
                      { value: 'questioning', label: 'Questioning' }
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={async () => {
                         try {
                           await base44.entities.Servant.update(servant.id, { sexuality: option.value });
                           await base44.entities.NightLog.create({
                             entry: `${servant.name} opened up about their sexuality. They're ${option.label.toLowerCase()}.`,
                             category: 'interaction',
                             intensity: 'moderate'
                           });
                           queryClient.invalidateQueries();
                         } catch (e) {
                           console.error('Failed to update sexuality:', e);
                         }
                        }}
                        className={`w-full rounded-lg py-2 px-3 text-left transition-colors text-sm ${
                          servant.sexuality === option.value 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setShowIdentity(false)}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors mt-4"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showSlider && sliderType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/95"
            onClick={() => {
              setShowSlider(false);
              setSliderType(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-lg w-full"
            >
              <MasturbationSlider
                gender={servant.gender}
                context={sliderType === 'videocall' ? 'videocall' : sliderType === 'sexting' ? 'sexting' : 'vampire'}
                onFinish={async (edgeType, edgeCount, desperationLevel, bodyPart, touchingMultiple) => {
                  setShowSlider(false);
                  setSliderType(null);
                  
                  // Process the interaction with bonus for edging
                  const interaction = allInteractions[sliderType];
                  const rel = servant.relationship || 0;
                  const tier = getRelationshipTier(rel);
                  
                  let outcomes;
                  if (interaction.getDynamicOutcomes) {
                    const dynamicOutcomes = ['worship', 'oralService', 'rideDom', 'dominate', 'breeding'].includes(sliderType) 
                      ? interaction.getDynamicOutcomes(vampireState.gender) 
                      : interaction.getDynamicOutcomes(servant.name);
                    outcomes = dynamicOutcomes?.[tier] || dynamicOutcomes?.mid || dynamicOutcomes?.low;
                  } else if (interaction.outcomes) {
                    outcomes = interaction.outcomes[tier] || interaction.outcomes.mid || interaction.outcomes.low;
                  }

                  let baseOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
                  
                  // Add body part specifics - sex positions include both orgasms
                  const bodyPartText = bodyPart === 'ride' ? (servant.gender === 'woman' ? 
                    '\n\nThey rode you hard, bouncing, taking you deep. Moaning loudly. You both came together, crying out.' :
                    '\n\nThey rode them desperately. Grinding. Fucking. You both came, shaking.') :
                                      bodyPart === 'thrust' ? (servant.gender === 'woman' ?
                    '\n\nThey pounded into them hard. Deep thrusts. Both moaning. You both came together, trembling.' :
                    '\n\nYou thrust into them relentlessly. Hard. Deep. Both of you came, gasping.') :
                                      bodyPart === 'oral' ? '\n\nTheir mouth worked perfectly. You both were lost in pleasure. They made you cum hard.' :
                                      bodyPart === 'receive' ? '\n\nYour tongue worked them. They came in your mouth, moaning. You both satisfied.' :
                                      bodyPart === 'receive_oral' ? '\n\nThey sucked you perfectly. You came hard. They swallowed, both satisfied.' :
                                      bodyPart === 'penetrate' ? '\n\nYou penetrated them deep. Both moaning. Came together, bodies shaking.' :
                                      bodyPart === 'mutual' ? '\n\nPleasuring each other simultaneously. Both came at once. Perfect.' :
                                      bodyPart === 'clit' ? '\n\nYou watched them rub their clit in circles. Faster. Harder. So wet. They came for you.' :
                                      bodyPart === 'dick' ? '\n\nYou watched them stroke their hard cock. Grip tight. Up and down. They came hard.' :
                                      bodyPart === 'breasts' ? '\n\nThey pinched and played with their nipples. Moaning. Getting so hard.' :
                                      bodyPart === 'fingers' ? '\n\nFingers deep inside themselves. Two, then three. Fucking themselves. Came hard for you.' :
                                      bodyPart === 'balls' ? '\n\nPlaying with their balls while stroking. Squeezing. So full. Came everywhere.' :
                                      bodyPart === 'dildo' ? '\n\nFucking themselves with a dildo. Deep. Hard. Came so hard.' :
                                      bodyPart === 'vibrator' ? '\n\nVibrator buzzing. So intense. They came shaking.' :
                                      bodyPart === 'fleshlight' ? '\n\nFucking their fleshlight hard. Tight. Came filling it.' :
                                      bodyPart === 'oral_toy' ? '\n\nOral toy sucking. Felt so real. Came hard.' :
                                      bodyPart === 'toy' ? '\n\nUsing a toy. Felt amazing. Came intensely.' :
                                      touchingMultiple ? (servant.gender === 'woman' ? '\n\nRubbing their clit while playing with their tits. Both spots at once. They came hard, shaking.' :
                                                         servant.gender === 'man' ? '\n\nStroking their dick while squeezing their balls. Everything at once. Came explosively.' :
                                                         '\n\nTouching everywhere. Multiple spots. Too much sensation. Came hard.') : '';
                  
                  // Add edging flavor
                  const intensityText = edgeCount > 3 ? '\n\nYou made them edge over and over. Shaking. Desperate. Begging. Finally allowed.' : 
                                       edgeCount > 1 ? '\n\nEdged multiple times. Building. Building. Finally released.' : 
                                       edgeType === 'edged' ? '\n\nEdged them. Made them wait. Denied. Then finally allowed.' : '';
                  
                  if (bodyPartText || intensityText) {
                    baseOutcome += bodyPartText + intensityText;
                  }
                  
                  const finalOutcome = addTitleToOutcome(baseOutcome);
                  setOutcome(finalOutcome);
                  setProcessing(true);

                  setTimeout(async () => {
                    const [min, max] = interaction.gains;
                    const baseGain = Math.floor(Math.random() * (max - min + 1)) + min;
                    const edgeBonus = edgeType === 'edged' ? Math.floor(baseGain * 0.5) : 0;
                    const desperationBonus = Math.floor(desperationLevel / 20);
                    const edgeCountBonus = edgeCount * 2;
                    const modifier = getVariantModifier(servant.variant, interaction.category);
                    const relationshipGain = Math.round((baseGain + edgeBonus + desperationBonus + edgeCountBonus) * modifier);
                    const newRel = Math.min((servant.relationship || 0) + relationshipGain, 100);

                    const emotionalStates = {
                      devoted: ['shy', 'longing', 'devoted', 'worshipful', 'transcendent'],
                      defiant: ['conflicted', 'resistant', 'surrendering', 'accepting', 'bound'],
                      dreamer: ['distant', 'drifting', 'fading', 'ethereal', 'dissolved']
                    };
                    const stateIndex = Math.min(Math.floor(newRel / 20), 4);
                    const newEmotionalState = emotionalStates[servant.variant][stateIndex];
                    
                    let jealousyGain = 0;
                    if (['physical', 'bdsm'].includes(interaction.category) && !['open', 'no-strings'].includes(servant.boundaries)) {
                      jealousyGain = Math.floor(Math.random() * 5) + 2;
                    }
                    
                    await base44.entities.Servant.update(servant.id, {
                      relationship: newRel,
                      obsession_stage: Math.min(Math.floor(newRel / 20) + 1, 5),
                      emotional_state: newEmotionalState,
                      last_interaction: new Date().toISOString(),
                      jealousy_level: Math.min((servant.jealousy_level || 0) + jealousyGain, 100)
                    });

                    await base44.entities.NightLog.create({
                      entry: `With ${servant.name}: ${finalOutcome}`,
                      category: 'interaction',
                      intensity: 'significant'
                    });

                    queryClient.invalidateQueries();

                    setTimeout(() => {
                      setProcessing(false);
                      setOutcome('');
                      setInteractionType('');
                    }, 5000);
                  }, 2000);
                }}
              />
            </motion.div>
          </motion.div>
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
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10 touch-manipulation p-2"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-2">
          {servant.name}
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          They're here with you. What will you do?
        </p>

        {/* Lite Mode Toggle */}
        <div className="mb-4 flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
          <div>
            <p className="text-white text-sm font-medium">Lite Mode</p>
            <p className="text-gray-400 text-xs">Less explicit interactions</p>
          </div>
          <button
            onClick={async () => {
              try {
                const newMode = !liteMode;
                setLiteMode(newMode);
                await base44.entities.VampireState.update(vampireState.id, {
                  content_filter: newMode ? 'lite' : 'full'
                });
                queryClient.invalidateQueries(['vampireState']);
              } catch (e) {
                console.error('Failed to toggle lite mode:', e);
              }
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              liteMode 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            {liteMode ? 'ON' : 'OFF'}
          </button>
        </div>
        
        {/* Category filter */}
        {!outcome && !processing && (
          <div className="mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors touch-manipulation ${
                    selectedCategory === cat 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-800 text-gray-400 active:bg-gray-700'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
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
          <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-2">
            {filteredInteractions.map(([key, interaction]) => {
              const Icon = interaction.icon;

              return (
                <button
                  key={key}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInteraction(key);
                  }}
                  className="bitlife-btn w-full rounded-xl py-3 flex items-center gap-3 text-sm"
                >
                  <Icon className="w-4 h-4" />
                  <span>{interaction.label}</span>
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