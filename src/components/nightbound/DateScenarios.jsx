import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Zap, AlertCircle } from 'lucide-react';

// Date scenarios with branching dialogue
export const VAMPIRE_DATE_SCENARIOS = [
  {
    id: 'rooftop_night',
    title: 'Moonlit Rooftop',
    description: 'A secret meeting high above the city',
    baseScene: 'You meet on a secluded rooftop overlooking the sleeping city. The night wind carries the scent of blood and danger.',
    branches: [
      {
        choice: 'Pull them close and kiss them',
        tension: 10,
        intimacy: 15,
        relationship: 5,
        outcomes: [
          'They respond eagerly, hands tangling in your hair.',
          'They hesitate, then kiss you with restrained passion.',
          'They pull away, eyes gleaming with dangerous attraction.'
        ]
      },
      {
        choice: 'Share a dark secret about yourself',
        tension: -5,
        intimacy: 10,
        relationship: 15,
        outcomes: [
          'Their eyes widen. They open up in return.',
          'They listen intently, drawing closer with understanding.',
          'They reveal something equally dark. You understand each other.'
        ]
      },
      {
        choice: 'Seduce them with your power',
        tension: 15,
        intimacy: 20,
        relationship: -5,
        outcomes: [
          'They fight your compulsion, desire warring with will.',
          'They surrender completely to your influence.',
          'They match your power with their own, creating electric tension.'
        ]
      }
    ]
  },
  {
    id: 'hunt_together',
    title: 'Hunt as One',
    description: 'Stalk prey through the dark streets',
    baseScene: 'You hunt together through the city shadows. The thrill of the chase bonds you.',
    branches: [
      {
        choice: 'Hunt the same prey',
        tension: 12,
        intimacy: 12,
        relationship: 8,
        outcomes: [
          'You coordinate perfectly, like predators of the same breed.',
          'Competitive hunger flares between you—exciting and dangerous.',
          'Your bloodlust mirrors theirs. The hunt becomes foreplay.'
        ]
      },
      {
        choice: 'Protect them from a threat',
        tension: -8,
        intimacy: 8,
        relationship: 18,
        outcomes: [
          'They realize you care. Vulnerability softens their eyes.',
          'They see your power and respect deepens into attraction.',
          'Their gratitude turns into passionate need.'
        ]
      },
      {
        choice: 'Create a rival for their attention',
        tension: 20,
        intimacy: 5,
        relationship: -10,
        outcomes: [
          'Jealousy ignites. They claim you right there in the shadows.',
          'Anger flares. They hunt with furious intensity.',
          'They leave you behind, proving they don\'t need you.'
        ]
      }
    ]
  },
  {
    id: 'secret_meeting',
    title: 'Hidden Sanctuary',
    description: 'An intimate moment away from danger',
    baseScene: 'You\'ve created a secret sanctuary—a place only you two know about.',
    branches: [
      {
        choice: 'Be completely vulnerable',
        tension: -10,
        intimacy: 18,
        relationship: 20,
        outcomes: [
          'They see the real you. Love blooms in their eyes.',
          'Your vulnerability awakens their protective instinct.',
          'They mirror your openness. True connection forms.'
        ]
      },
      {
        choice: 'Demand their complete loyalty',
        tension: 8,
        intimacy: 5,
        relationship: -8,
        outcomes: [
          'They resist. Your need to control creates distance.',
          'They submit, but resentment lurks beneath.',
          'Power struggle erupts into passionate dominance.'
        ]
      },
      {
        choice: 'Share your blood with them',
        tension: 5,
        intimacy: 25,
        relationship: 12,
        outcomes: [
          'The bond deepens. They taste eternity through you.',
          'They\'re overwhelmed by the intimate connection.',
          'Your blood becomes their addiction. They need more.'
        ]
      }
    ]
  },
  {
    id: 'forbidden_meeting',
    title: 'Enemy Territory',
    description: 'Meeting where you shouldn\'t be',
    baseScene: 'You meet in forbidden territory—dangerous and thrilling.',
    branches: [
      {
        choice: 'Risk exposure together',
        tension: 18,
        intimacy: 14,
        relationship: 16,
        outcomes: [
          'The danger excites you both. Adrenaline fuels passion.',
          'You feel alive together, danger be damned.',
          'Shared risk creates unbreakable bond.'
        ]
      },
      {
        choice: 'Suggest they leave the conflict behind for you',
        tension: -2,
        intimacy: 8,
        relationship: 12,
        outcomes: [
          'They\'re torn. Love wars with loyalty.',
          'They refuse to abandon their cause.',
          'They\'d do it, but you both know it\'s impossible.'
        ]
      },
      {
        choice: 'Propose an alliance against common enemies',
        tension: 2,
        intimacy: 6,
        relationship: 14,
        outcomes: [
          'Strategic partnership becomes something more.',
          'They see you as a true equal and ally.',
          'Power + desire = intoxicating combination.'
        ]
      }
    ]
  },
  {
    id: 'dawn_vigil',
    title: 'Before the Sunrise',
    description: 'Racing against the dawn',
    baseScene: 'You have only hours before sunrise separates you. Time is running out.',
    branches: [
      {
        choice: 'Make love desperately, as if it\'s your last night',
        tension: 12,
        intimacy: 30,
        relationship: 8,
        outcomes: [
          'Passion burns like wildfire. You consume each other.',
          'Urgency strips away all pretense. Pure need and desire.',
          'Morning finds you tangled together, refusing to separate.'
        ]
      },
      {
        choice: 'Just talk and be present',
        tension: -8,
        intimacy: 16,
        relationship: 22,
        outcomes: [
          'Intimate conversation bonds you more than physical touch.',
          'They see how much they truly mean to you.',
          'These quiet hours become your most precious.'
        ]
      },
      {
        choice: 'Plan something dangerous for when night falls again',
        tension: 16,
        intimacy: 6,
        relationship: 10,
        outcomes: [
          'Adrenaline and planning energy replace physical intimacy.',
          'They\'re energized by your ambition and vision.',
          'You become partners in crime and chaos.'
        ]
      }
    ]
  }
];

export const SIREN_DATE_SCENARIOS = [
  {
    id: 'ocean_call',
    title: 'The Ocean\'s Call',
    description: 'Lure them to the water\'s edge',
    baseScene: 'You sing by the shore. Your voice calls to something primal within them. The ocean surrounds you both.',
    branches: [
      {
        choice: 'Sing to entrance them completely',
        tension: 14,
        intimacy: 16,
        relationship: 4,
        outcomes: [
          'They\'re hypnotized by your voice. Resistance melts away.',
          'They stumble toward you, helpless against your song.',
          'Your power over them is absolute and intoxicating.'
        ]
      },
      {
        choice: 'Let them hear the real you beneath the magic',
        tension: -6,
        intimacy: 14,
        relationship: 18,
        outcomes: [
          'They fall for your authentic self, not your power.',
          'Vulnerability shines through. They\'re moved by your truth.',
          'Real connection forms beneath the enchantment.'
        ]
      },
      {
        choice: 'Pull them into the water with you',
        tension: 10,
        intimacy: 18,
        relationship: 6,
        outcomes: [
          'You transform. They discover what you really are.',
          'In the water, you\'re equals. Power shifts.',
          'Aquatic intimacy transcends human limits.'
        ]
      }
    ]
  },
  {
    id: 'siren_song_night',
    title: 'Song of Devotion',
    description: 'A private performance for them alone',
    baseScene: 'You sing only for them. A song never heard by mortal ears before.',
    branches: [
      {
        choice: 'Sing a love song raw and vulnerable',
        tension: -8,
        intimacy: 22,
        relationship: 20,
        outcomes: [
          'They\'re moved to tears. Your heart is on display.',
          'They realize you\'ve never been this honest with anyone.',
          'Your voice becomes your greatest vulnerability.'
        ]
      },
      {
        choice: 'Sing a song of seduction and power',
        tension: 16,
        intimacy: 20,
        relationship: 0,
        outcomes: [
          'Pure desire radiates from both of you.',
          'They\'re pulled into your world of enchantment.',
          'You maintain complete control. They love it.'
        ]
      },
      {
        choice: 'Invite them to sing with you',
        tension: -4,
        intimacy: 12,
        relationship: 16,
        outcomes: [
          'Their voice harmonizes with yours. Magical.',
          'Duet becomes intimate connection of souls.',
          'You realize they have their own power too.'
        ]
      }
    ]
  },
  {
    id: 'dangerous_allure',
    title: 'Dangerous Game',
    description: 'Seduce someone you shouldn\'t',
    baseScene: 'You\'ve chosen someone forbidden. The danger thrums between you.',
    branches: [
      {
        choice: 'Seduce them openly, damn the consequences',
        tension: 22,
        intimacy: 18,
        relationship: 0,
        outcomes: [
          'They risk everything for one night with you.',
          'Consequences be damned. Desire wins.',
          'You become their beautiful, dangerous obsession.'
        ]
      },
      {
        choice: 'Prove you\'re more than just seduction',
        tension: -6,
        intimacy: 10,
        relationship: 14,
        outcomes: [
          'They see past the allure to the person beneath.',
          'Real emotion develops alongside attraction.',
          'They choose you for you, not your power.'
        ]
      },
      {
        choice: 'Team up against those who disapprove',
        tension: 8,
        intimacy: 8,
        relationship: 12,
        outcomes: [
          'Forbidden love becomes a shared rebellion.',
          'You\'re allies against the world.',
          'Partnership + passion = powerful bond.'
        ]
      }
    ]
  },
  {
    id: 'siren_truth',
    title: 'Reveal Your Nature',
    description: 'Show them what you truly are',
    baseScene: 'You decide to trust them with the truth about what you are.',
    branches: [
      {
        choice: 'Transform and show them your tail',
        tension: 6,
        intimacy: 16,
        relationship: 14,
        outcomes: [
          'They\'re awed by your true form.',
          'Fear and fascination war in their eyes.',
          'Acceptance of your nature cements love.'
        ]
      },
      {
        choice: 'Admit how many you\'ve lured and loved',
        tension: -8,
        intimacy: 4,
        relationship: -10,
        outcomes: [
          'They\'re hurt by your past conquests.',
          'Jealousy and possessiveness flare.',
          'Trust fractures under the weight of truth.'
        ]
      },
      {
        choice: 'Tell them you\'re choosing them over your nature',
        tension: -10,
        intimacy: 18,
        relationship: 24,
        outcomes: [
          'They\'re overwhelmed by your sacrifice.',
          'Love becomes real, not just magic.',
          'You\'re no longer predator and prey—equals.'
        ]
      }
    ]
  },
  {
    id: 'siren_storm',
    title: 'Storm of Passion',
    description: 'Let the elements and emotions collide',
    baseScene: 'A storm rages. Lightning splits the sky. Raw power surrounds you both.',
    branches: [
      {
        choice: 'Merge with the storm, become one with nature',
        tension: 14,
        intimacy: 20,
        relationship: 8,
        outcomes: [
          'You\'re god-like together. Elemental passion.',
          'They touch you as the world fractures around you.',
          'Primal and transcendent at once.'
        ]
      },
      {
        choice: 'Protect them from the storm\'s fury',
        tension: -6,
        intimacy: 12,
        relationship: 16,
        outcomes: [
          'You shield them with your body and power.',
          'Their trust in you deepens.',
          'Tender moments within chaos.'
        ]
      },
      {
        choice: 'Let the storm rage while you take them passionately',
        tension: 18,
        intimacy: 24,
        relationship: 4,
        outcomes: [
          'You\'re both consumed by desire and chaos.',
          'The world burns around your passion.',
          'Wild, untamed, unforgettable.'
        ]
      }
    ]
  }
];

export const NYMPH_DATE_SCENARIOS = [
  {
    id: 'sacred_spring',
    title: 'At the Sacred Spring',
    description: 'Share your created sanctuary',
    baseScene: 'You\'ve created a sacred spring together. Magic hums in the air. This place is yours alone.',
    branches: [
      {
        choice: 'Bathe together in the healing waters',
        tension: -8,
        intimacy: 18,
        relationship: 16,
        outcomes: [
          'The water glows as you touch. Pure magic.',
          'Vulnerable and beautiful together.',
          'Connection goes beyond the physical.'
        ]
      },
      {
        choice: 'Make love by the spring\'s edge',
        tension: 6,
        intimacy: 22,
        relationship: 10,
        outcomes: [
          'Nature blooms around you as passion peaks.',
          'Your bodies sink into soft moss and flowers.',
          'The spring itself seems to celebrate your union.'
        ]
      },
      {
        choice: 'Bind yourselves to this place eternally',
        tension: -10,
        intimacy: 14,
        relationship: 24,
        outcomes: [
          'You merge with the land itself. Inseparable.',
          'This spring is now a monument to your love.',
          'Forever isn\'t long enough to explore this bond.'
        ]
      }
    ]
  },
  {
    id: 'forest_communion',
    title: 'Forest Communion',
    description: 'Speak with nature together',
    baseScene: 'The forest welcomes you both. Animals gather. Trees whisper your names.',
    branches: [
      {
        choice: 'Show them the language of the forest',
        tension: -6,
        intimacy: 12,
        relationship: 18,
        outcomes: [
          'They learn to hear what you hear.',
          'Awe and wonder fill their eyes.',
          'You\'re not alone in your magic anymore.'
        ]
      },
      {
        choice: 'Summon creatures to witness your love',
        tension: 4,
        intimacy: 16,
        relationship: 12,
        outcomes: [
          'Deer, birds, and spirits gather to watch.',
          'You feel nature\'s approval and blessing.',
          'Love becomes a sacred ceremony.'
        ]
      },
      {
        choice: 'Demand they prove their devotion to nature as you do',
        tension: 10,
        intimacy: 6,
        relationship: -4,
        outcomes: [
          'They struggle to match your connection.',
          'Distance grows. Can they ever truly understand?',
          'Your nature may be too much for them.'
        ]
      }
    ]
  },
  {
    id: 'moonlight_healing',
    title: 'Healing Touch',
    description: 'Heal their deepest wounds',
    baseScene: 'Under moonlight, you place your hands on their wounds—physical and emotional.',
    branches: [
      {
        choice: 'Heal them completely with your touch',
        tension: -12,
        intimacy: 16,
        relationship: 20,
        outcomes: [
          'They\'re whole again. Tears of gratitude flow.',
          'Love becomes devotion in their eyes.',
          'You\'ve given them their life back.'
        ]
      },
      {
        choice: 'Make healing erotic and intimate',
        tension: 8,
        intimacy: 20,
        relationship: 12,
        outcomes: [
          'Healing and pleasure become indistinguishable.',
          'Every touch both mends and ignites.',
          'Recovery has never felt so good.'
        ]
      },
      {
        choice: 'Require them to give you something in return',
        tension: 12,
        intimacy: 4,
        relationship: -8,
        outcomes: [
          'They feel the debt. Resentment festers.',
          'Love becomes transaction.',
          'Generosity dies. Power remains.'
        ]
      }
    ]
  },
  {
    id: 'nymph_garden_creation',
    title: 'Growing Together',
    description: 'Create an underwater garden as one',
    baseScene: 'Together you plant magic in the deep. Gardens bloom at your command.',
    branches: [
      {
        choice: 'Create something beautiful together',
        tension: -8,
        intimacy: 14,
        relationship: 20,
        outcomes: [
          'Your combined magic creates wonders.',
          'You\'re co-creators of something lasting.',
          'Beauty born from partnership.'
        ]
      },
      {
        choice: 'Make it a monument to your domination of nature',
        tension: 12,
        intimacy: 8,
        relationship: -6,
        outcomes: [
          'They realize you see them as just another tool.',
          'Nature itself seems to recoil from your pride.',
          'Power without love creates only ruins.'
        ]
      },
      {
        choice: 'Let them lead. Follow their vision',
        tension: -10,
        intimacy: 12,
        relationship: 18,
        outcomes: [
          'They discover their own latent power.',
          'Respect deepens into love.',
          'Equals creating something neither could alone.'
        ]
      }
    ]
  },
  {
    id: 'mist_form_dance',
    title: 'Dance of Forms',
    description: 'Transform together and dance as spirits',
    baseScene: 'You both dissolve into mist. Formless, you dance through the night sky.',
    branches: [
      {
        choice: 'Merge completely—become one mist',
        tension: -6,
        intimacy: 24,
        relationship: 22,
        outcomes: [
          'Your essences intertwine. Boundaries dissolve.',
          'Intimacy transcends physical form.',
          'Two souls becoming one.'
        ]
      },
      {
        choice: 'Chase and play, a dance of predator and prey',
        tension: 14,
        intimacy: 14,
        relationship: 8,
        outcomes: [
          'Excitement and danger fuel your dance.',
          'You\'re both hunter and hunted.',
          'Game becomes foreplay.'
        ]
      },
      {
        choice: 'Show them places in the sky mortals never see',
        tension: -4,
        intimacy: 12,
        relationship: 16,
        outcomes: [
          'They see the world through your eyes.',
          'Wonder and gratitude shine from them.',
          'You\'ve given them magic they\'ll never forget.'
        ]
      }
    ]
  }
];

export default function DateScenarios({ scenario, onChoice, onClose }) {
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showOutcome, setShowOutcome] = useState(false);
  const [outcome, setOutcome] = useState('');

  const handleChoice = (choice) => {
    setSelectedChoice(choice);
    const outcomeText = choice.outcomes[Math.floor(Math.random() * choice.outcomes.length)];
    setOutcome(outcomeText);
    setShowOutcome(true);

    setTimeout(() => {
      onChoice(choice);
      setShowOutcome(false);
      setSelectedChoice(null);
    }, 4000);
  };

  if (!scenario) return null;

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
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {!showOutcome ? (
          <>
            <h2 className="text-2xl font-bold text-white mb-2">{scenario.title}</h2>
            <p className="text-gray-400 text-sm mb-6">{scenario.description}</p>

            <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
              <p className="text-gray-300 leading-relaxed italic">{scenario.baseScene}</p>
            </div>

            <div className="space-y-3">
              {scenario.branches.map((choice, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleChoice(choice)}
                  disabled={selectedChoice !== null}
                  className="w-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg p-4 text-left transition-all border border-gray-700 hover:border-purple-500/50"
                >
                  <p className="text-white font-medium mb-2">{choice.choice}</p>
                  <div className="flex gap-4 text-xs">
                    <div className={`flex items-center gap-1 ${choice.tension > 0 ? 'text-red-400' : 'text-blue-400'}`}>
                      <Zap className="w-3 h-3" />
                      Tension {choice.tension > 0 ? '+' : ''}{choice.tension}
                    </div>
                    <div className={`flex items-center gap-1 ${choice.intimacy > 0 ? 'text-pink-400' : 'text-gray-400'}`}>
                      <Heart className="w-3 h-3" />
                      Intimacy {choice.intimacy > 0 ? '+' : ''}{choice.intimacy}
                    </div>
                    <div className={`flex items-center gap-1 ${choice.relationship > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                      <Heart className="w-3 h-3" />
                      Relationship {choice.relationship > 0 ? '+' : ''}{choice.relationship}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <p className="text-gray-300 leading-relaxed text-lg">{outcome}</p>
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-purple-400 text-sm"
              >
                ...
              </motion.p>
            </motion.div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}