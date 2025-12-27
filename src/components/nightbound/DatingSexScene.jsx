import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Flame } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function DatingSexScene({ human, match, onClose }) {
  const [stage, setStage] = useState('preferences');
  const [preferences, setPreferences] = useState({
    pace: null,
    dominance: null,
    intimacy: null
  });
  const [intensity, setIntensity] = useState(30);
  const [pleasure, setPleasure] = useState(0);
  const [touching, setTouching] = useState([]);
  const [currentAction, setCurrentAction] = useState(null);
  const [narrative, setNarrative] = useState([]);
  const [climaxing, setClimaxing] = useState(false);
  const queryClient = useQueryClient();

  const paceOptions = [
    { value: 'slow', label: 'Slow & Sensual', desc: 'Take your time, savor every moment' },
    { value: 'steady', label: 'Steady Rhythm', desc: 'Build it up gradually' },
    { value: 'fast', label: 'Fast & Intense', desc: 'Don\'t hold back' }
  ];

  const dominanceOptions = [
    { value: 'submit', label: 'Let Them Lead', desc: 'Give them control' },
    { value: 'equal', label: 'Equal Partners', desc: 'Share the experience' },
    { value: 'dominate', label: 'Take Control', desc: 'Show them what you want' }
  ];

  const intimacyOptions = [
    { value: 'emotional', label: 'Emotional Connection', desc: 'Make love, not just fuck' },
    { value: 'playful', label: 'Playful & Fun', desc: 'Laugh, tease, enjoy' },
    { value: 'primal', label: 'Raw & Primal', desc: 'Pure physical need' }
  ];

  const touchingOptions = {
    woman: ['kiss', 'breasts', 'clit', 'inside', 'ass', 'neck', 'thighs'],
    man: ['kiss', 'chest', 'dick', 'balls', 'ass', 'neck', 'thighs'],
    custom: ['kiss', 'chest', 'genitals', 'ass', 'neck', 'thighs']
  };

  const actionOptions = [
    { id: 'oral_give', label: `Go Down on ${match.name}`, intensity: 20 },
    { id: 'oral_receive', label: `${match.name} Goes Down on You`, intensity: 25 },
    { id: 'finger', label: 'Use Your Fingers', intensity: 15 },
    { id: 'penetration', label: 'Penetration', intensity: 30 },
    { id: 'mutual', label: 'Touch Each Other', intensity: 20 },
    { id: 'roleplay', label: 'Roleplay Fantasy', intensity: 25 },
    { id: 'toy', label: 'Use a Toy', intensity: 28 }
  ];

  const generateNarrative = (action) => {
    const texts = {
      oral_give: [
        `You kiss down ${match.name}'s body. Slowly. Teasingly.\n\nThey gasp when you reach your destination.\n\n"Don't stop," they whisper.`,
        `Your mouth on them. Tongue working. They taste incredible.\n\n${match.name} moans your name. Fingers in your hair.`,
        `You look up at ${match.name} while pleasuring them.\n\nTheir eyes roll back. "Fuck... yes..."`,
        `Taking your time. Making them squirm. Beg.\n\n${match.name} is trembling. "I'm so close..."`
      ],
      oral_receive: [
        `${match.name} pushes you back. Kisses down your body.\n\nOh god. Their mouth.\n\n"You taste so good," they murmur.`,
        `${match.name}'s tongue. Fuck. You can't think straight.\n\nYour hips buck up. They hold you down. In control.`,
        `They know exactly what they're doing. Where to touch. How to move.\n\n"That's it," ${match.name} says. "Let go."`,
        `You're close already. Too good. Too much.\n\n${match.name} doesn't stop. Doesn't slow down.`
      ],
      finger: [
        `Your fingers inside ${match.name}. Curling. Finding that spot.\n\n"Right there," they gasp. "Don't stop."`,
        `Fingering them while kissing their neck. They're so wet/hard.\n\n${match.name} rocks against your hand. Desperate.`,
        `Two fingers. Then three. ${match.name} takes it all.\n\n"More," they beg. Always wanting more.`
      ],
      penetration: [
        `You slide inside ${match.name}. Both of you gasping.\n\nPerfect fit. Perfect feeling.\n\n"Move," they whisper. "Please move."`,
        `Thrusting into ${match.name}. Deep. Steady rhythm.\n\nTheir nails drag down your back. "Harder."`,
        `${match.name} on top. Riding you. Taking what they want.\n\nYou watch them. Hands on their hips. Guiding.`,
        `Face to face. Eye contact. Intimate and intense.\n\n"I've wanted this," ${match.name} confesses between kisses.`
      ],
      mutual: [
        `Touching each other everywhere. Hands exploring.\n\n${match.name} strokes you while you finger them.\n\nBoth getting close.`,
        `You jerk each other off. Kissing. Moaning into each other's mouths.\n\n"Come with me," ${match.name} whispers.`,
        `Grinding against each other. Friction. Heat. Desperation.\n\nNo penetration needed. This is enough.`
      ],
      roleplay: [
        `${match.name} plays along with your fantasy. Gets into character.\n\nIt's hot. It's fun. It's exactly what you needed.`,
        `"Tell me what you want," ${match.name} purrs in character.\n\nYou're so turned on you can barely speak.`
      ],
      toy: [
        `${match.name} uses a toy on you. Watches your reactions.\n\n"You look so hot like this," they say.\n\nThe vibrations are overwhelming.`,
        `You use a toy on ${match.name}. They're shaking.\n\n"Don't stop," they beg. "I'm almost there."`,
        `Toy between both of you. Shared pleasure.\n\n${match.name} kisses you while you both get off on it.`
      ]
    };

    const selected = texts[action.id];
    return selected[Math.floor(Math.random() * selected.length)];
  };

  const handleAction = (action) => {
    setCurrentAction(action);
    const newIntensity = Math.min(100, intensity + action.intensity);
    const pleasureGain = action.intensity + (preferences.pace === 'fast' ? 10 : preferences.pace === 'slow' ? 5 : 7);
    
    setIntensity(newIntensity);
    setPleasure(prev => Math.min(100, prev + pleasureGain));
    setNarrative(prev => [...prev, generateNarrative(action)]);
    
    setTimeout(() => setCurrentAction(null), 2000);
  };

  const handleClimax = async () => {
    setClimaxing(true);

    const intensityBonus = Math.floor(intensity / 10);
    const chemistryGain = 20 + intensityBonus;
    const obsessionReduction = match.isSpecial ? 20 + intensityBonus : 5;

    const climaxTexts = {
      emotional: [
        `You come together. ${match.name} holding you close.\n\n"That was... wow," they whisper.\n\nYou feel connected. Really connected.\n\nFor the first time in forever, you're not thinking about anyone else.`,
        `Orgasm hits you both. Eye contact. Intimacy.\n\n${match.name} kisses you through it. Tender. Real.\n\nThis is what you've been missing.\n\nThis is what real connection feels like.`
      ],
      playful: [
        `You both come laughing. Happy. Satisfied.\n\n"That was fun," ${match.name} grins.\n\nYou agree. It was fun. Easy. Natural.\n\nNo obsession. No darkness. Just... good.`,
        `Climax together giggling. Can't stop smiling.\n\n${match.name} flops next to you. "Again?"\n\nYou're not thinking about them. The vampire.\n\nYou're just here. Present. Happy.`
      ],
      primal: [
        `Raw, intense orgasm. Both of you gasping.\n\n${match.name} collapses against you. Satisfied.\n\n"Fuck," is all they can say.\n\nYou needed this. Physical. Real. Human.`,
        `You come hard. ${match.name} right after.\n\nPure physical release. No thoughts. Just sensation.\n\nThe vampire's hold on you... it's weaker now.\n\nThis was real. This was yours.`
      ]
    };

    const climaxText = climaxTexts[preferences.intimacy][Math.floor(Math.random() * climaxTexts[preferences.intimacy].length)];

    await base44.entities.NightLog.create({
      entry: `${human.name} slept with ${match.name}. It was ${preferences.pace}, ${preferences.dominance}, ${preferences.intimacy}. They both came. ${match.isSpecial ? 'The vampire obsession weakened.' : 'It was good.'}`,
      category: 'interaction',
      intensity: match.isSpecial ? 'significant' : 'moderate'
    });

    if (match.isSpecial) {
      await base44.entities.Human.update(human.id, {
        obsession_level: Math.max(0, (human.obsession_level || 0) - obsessionReduction)
      });
    }

    queryClient.invalidateQueries();

    setTimeout(() => {
      alert(climaxText);
      onClose(chemistryGain);
    }, 1000);
  };

  useEffect(() => {
    if (pleasure >= 100 && !climaxing) {
      handleClimax();
    }
  }, [pleasure, climaxing]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95"
      onClick={(e) => {
        if (e.target === e.currentTarget && !climaxing) {
          onClose(0);
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-gradient-to-br from-pink-900/40 to-purple-900/40 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-pink-500/30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-pink-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">With {match.name}</h2>
              <p className="text-gray-400 text-sm">
                {match.isSpecial && '✨ Something special...'}
              </p>
            </div>
          </div>
          {!climaxing && stage === 'preferences' && (
            <button onClick={() => onClose(0)} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {stage === 'preferences' ? (
            <motion.div
              key="prefs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4">
                <p className="text-white text-center mb-2">
                  "{match.name} looks at you. "What do you like?""
                </p>
                <p className="text-gray-400 text-sm text-center">Tell them your preferences</p>
              </div>

              <div>
                <h3 className="text-white font-bold mb-3">Pace</h3>
                <div className="space-y-2">
                  {paceOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setPreferences({ ...preferences, pace: opt.value })}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        preferences.pace === opt.value
                          ? 'bg-pink-600 border-pink-400 text-white'
                          : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:border-pink-500/50'
                      }`}
                    >
                      <p className="font-medium">{opt.label}</p>
                      <p className="text-sm opacity-70">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-white font-bold mb-3">Dynamic</h3>
                <div className="space-y-2">
                  {dominanceOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setPreferences({ ...preferences, dominance: opt.value })}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        preferences.dominance === opt.value
                          ? 'bg-purple-600 border-purple-400 text-white'
                          : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:border-purple-500/50'
                      }`}
                    >
                      <p className="font-medium">{opt.label}</p>
                      <p className="text-sm opacity-70">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-white font-bold mb-3">Vibe</h3>
                <div className="space-y-2">
                  {intimacyOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setPreferences({ ...preferences, intimacy: opt.value })}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        preferences.intimacy === opt.value
                          ? 'bg-red-600 border-red-400 text-white'
                          : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:border-red-500/50'
                      }`}
                    >
                      <p className="font-medium">{opt.label}</p>
                      <p className="text-sm opacity-70">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {preferences.pace && preferences.dominance && preferences.intimacy && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setStage('action')}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold"
                >
                  Start 🔥
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="action"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Pleasure meter */}
              <div className="bg-gray-900/50 border border-pink-500/30 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-pink-400 font-bold">Pleasure</span>
                  <span className="text-white font-bold">{pleasure}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
                  <motion.div
                    animate={{ width: `${pleasure}%` }}
                    className="h-full bg-gradient-to-r from-pink-500 via-red-500 to-purple-500"
                  />
                </div>
              </div>

              {/* Intensity slider */}
              <div className="bg-gray-900/50 border border-purple-500/30 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-purple-400 font-bold flex items-center gap-2">
                    <Flame className="w-5 h-5" />
                    Intensity
                  </span>
                  <span className="text-white font-bold">{intensity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={intensity}
                  onChange={(e) => setIntensity(parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-800 rounded-lg appearance-none cursor-pointer slider-pink"
                />
                <style>{`
                  .slider-pink::-webkit-slider-thumb {
                    appearance: none;
                    width: 24px;
                    height: 24px;
                    background: linear-gradient(135deg, #ec4899, #8b5cf6);
                    cursor: pointer;
                    border-radius: 50%;
                  }
                `}</style>
              </div>

              {/* Latest narrative */}
              {narrative.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-pink-950/40 border border-pink-500/30 rounded-xl p-4"
                >
                  <p className="text-white whitespace-pre-line text-center">
                    {narrative[narrative.length - 1]}
                  </p>
                </motion.div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                {actionOptions.map(action => (
                  <button
                    key={action.id}
                    onClick={() => handleAction(action)}
                    disabled={currentAction !== null}
                    className="w-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white p-4 rounded-xl text-left font-medium transition-all"
                  >
                    {action.label}
                  </button>
                ))}
              </div>

              {pleasure >= 80 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleClimax}
                  disabled={climaxing}
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-5 rounded-xl font-bold text-xl disabled:opacity-50"
                >
                  {climaxing ? 'Climaxing...' : 'Climax Together 💦'}
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}