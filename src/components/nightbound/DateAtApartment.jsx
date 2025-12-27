import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Flame, Moon, Coffee } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function DateAtApartment({ human, match, onClose }) {
  const [stage, setStage] = useState('invite');
  const [vibe, setVibe] = useState(0);
  const [actions, setActions] = useState([]);
  const [stayingOver, setStayingOver] = useState(false);
  const queryClient = useQueryClient();

  const apartmentActions = [
    { id: 'cook_together', label: '👨‍🍳 Cook Dinner Together', vibe: 15, intimacy: 10 },
    { id: 'wine', label: '🍷 Share Wine', vibe: 12, intimacy: 8 },
    { id: 'movie_couch', label: '📺 Movie on the Couch', vibe: 10, intimacy: 12 },
    { id: 'massage', label: '💆 Give Them a Massage', vibe: 20, intimacy: 25 },
    { id: 'shower_together', label: '🚿 Shower Together', vibe: 30, intimacy: 40 },
    { id: 'make_out_couch', label: '💋 Make Out on Couch', vibe: 25, intimacy: 35 },
    { id: 'bedroom', label: '🛏️ Lead to Bedroom', vibe: 35, intimacy: 50 },
    { id: 'oral_give', label: '👅 Go Down on Them', vibe: 40, intimacy: 60 },
    { id: 'oral_receive', label: '😋 Ask Them to Go Down', vibe: 38, intimacy: 58 },
    { id: 'mutual_touch', label: '🤝 Touch Each Other', vibe: 35, intimacy: 55 },
    { id: 'penetration', label: '🔥 Sex', vibe: 50, intimacy: 70 },
    { id: 'rough', label: '⚡ Get Rough', vibe: 45, intimacy: 65 },
    { id: 'slow_sensual', label: '🌙 Slow & Sensual', vibe: 42, intimacy: 68 },
    { id: 'multiple_rounds', label: '🔁 Go Again', vibe: 40, intimacy: 50, requiresPrevious: 'penetration' }
  ];

  const getNarrative = (action) => {
    const narratives = {
      cook_together: [
        `You cook together. ${match.name} wraps their arms around you from behind while you chop vegetables.\n\n"This is nice," they whisper.\n\nYou agree.`,
        `Making pasta together. ${match.name} feeds you a taste. Fingers linger on your lips.\n\nThe tension is building.`
      ],
      wine: [
        `You share wine on the couch. Sitting close.\n\n${match.name}'s hand on your thigh.\n\n"I'm glad I came over," they say.`,
        `Second glass of wine. You're both tipsy. Giggling.\n\n${match.name} leans in. "You're really attractive, you know that?"`
      ],
      movie_couch: [
        `Movie playing but neither of you are watching.\n\n${match.name} cuddles into you. Hand creeping under your shirt.\n\n"Fuck the movie," they whisper.`,
        `You're not paying attention to the screen.\n\n${match.name}'s lips on your neck. Hand sliding down.`
      ],
      massage: [
        `Your hands on ${match.name}'s back. Working out tension.\n\nThey moan softly. "That feels amazing."\n\nYour hands drift lower.`,
        `Massaging ${match.name}. They're basically purring.\n\n"Don't stop," they breathe.\n\nYou don't plan to.`
      ],
      shower_together: [
        `Hot water. Steam. ${match.name}'s body pressed against yours.\n\nHands everywhere. Slippery. Intimate.\n\n"I want you," they gasp.`,
        `Shower sex is awkward but hot.\n\n${match.name} against the wall. Water running over both of you.\n\nFuck, they're beautiful.`
      ],
      make_out_couch: [
        `You're on top of ${match.name} on the couch.\n\nKissing deeply. Hands exploring.\n\nThey grind up against you. Desperate.`,
        `Making out turns heated fast.\n\n${match.name} pulls your shirt off. Lips on your chest.\n\n"Bedroom?" they ask breathlessly.`
      ],
      bedroom: [
        `You lead ${match.name} to your bedroom.\n\nThey push you onto the bed. Climb on top.\n\n"I've been wanting this," they admit.`,
        `In your bedroom now. ${match.name} looking at you with hunger.\n\n"Come here," you say.\n\nThey do.`
      ],
      oral_give: [
        `You go down on ${match.name}. Take your time.\n\nTheir hands in your hair. Hips bucking.\n\n"Fuck, yes," they moan.\n\nYou're good at this.`,
        `Your mouth on them. Tongue working.\n\n${match.name} tastes incredible.\n\nThey're close already. You can tell.`
      ],
      oral_receive: [
        `${match.name} goes down on you. Holy fuck.\n\nThey know what they're doing.\n\nYour hands grip the sheets. Can't think straight.`,
        `Their mouth. Their tongue. Oh god.\n\n${match.name} looks up at you while doing it.\n\nThat eye contact. You're so close.`
      ],
      mutual_touch: [
        `You touch each other. Stroking. Exploring.\n\nBoth getting off. Watching each other.\n\n"You're so hot," ${match.name} breathes.`,
        `Jerking each other off. Kissing. Moaning into each other's mouths.\n\n"Come for me," ${match.name} whispers.`
      ],
      penetration: [
        `You fuck ${match.name}. They feel incredible.\n\nPerfect rhythm. Perfect fit.\n\n"Harder," they beg.`,
        `${match.name} rides you. Takes what they want.\n\nYou watch them. Hands on their hips.\n\nGod, they're beautiful like this.`,
        `Deep inside ${match.name}. Both of you gasping.\n\nThis feels RIGHT. Real.\n\nNo thoughts of anyone else.`
      ],
      rough: [
        `You pin ${match.name} down. Fuck them hard.\n\nThey love it. Nails in your back.\n\n"Don't stop," they gasp. "Don't you dare stop."`,
        `Rough and desperate. ${match.name} against the wall.\n\nBoth of you lost in it. Pure need.`
      ],
      slow_sensual: [
        `Slow, deep thrusts. Eye contact. Intimate.\n\n${match.name} touches your face. "This is perfect," they whisper.\n\nYou agree.`,
        `Making love, not just fucking.\n\n${match.name} moans your name softly.\n\nEvery movement deliberate. Meaningful.`
      ],
      multiple_rounds: [
        `"Again?" ${match.name} grins.\n\n"Again," you confirm.\n\nRound two is even better.`,
        `You thought you were done. But ${match.name} has other ideas.\n\n"I'm not finished with you yet," they purr.\n\nNeither are you.`
      ]
    };

    const selected = narratives[action.id] || [`${action.label} with ${match.name}.`];
    return selected[Math.floor(Math.random() * selected.length)];
  };

  const doAction = (action) => {
    if (action.requiresPrevious && !actions.includes(action.requiresPrevious)) {
      return;
    }

    const narrative = getNarrative(action);
    setVibe(prev => Math.min(100, prev + action.vibe));
    setActions([...actions, action.id]);
    
    alert(narrative);
  };

  const stayOver = async () => {
    setStayingOver(true);

    const morningTexts = [
      `You wake up next to ${match.name}.\n\nMorning light. Tangled sheets. Their arm around you.\n\n"Morning," they smile sleepily.\n\nThis feels... right.`,
      `${match.name} is still asleep. You watch them.\n\nPeaceful. Beautiful. Real.\n\nNo vampire thoughts. Just this moment.`,
      `Morning sex. Slow. Lazy. Perfect.\n\n${match.name} kisses you after. "Can I stay over again sometime?"\n\nYou want them to.`,
      `You make breakfast together. Steal kisses while cooking.\n\n${match.name}: "Last night was incredible."\n\nYou agree. It really was.`
    ];

    const morningText = morningTexts[Math.floor(Math.random() * morningTexts.length)];

    await base44.entities.NightLog.create({
      entry: `${human.name} had ${match.name} stay over. They had sex, spent the night together. It was intimate. Real. ${match.isSpecial ? 'Vampire obsession weakened significantly.' : ''}`,
      category: 'interaction',
      intensity: match.isSpecial ? 'significant' : 'moderate'
    });

    if (match.isSpecial) {
      await base44.entities.Human.update(human.id, {
        obsession_level: Math.max(0, (human.obsession_level || 0) - 15)
      });
    }

    queryClient.invalidateQueries();
    alert(morningText);
    onClose({
      attractionGain: 25,
      connectionGain: 30,
      trustGain: 20,
      loyaltyGain: 25
    });
  };

  const endNight = async (stayOver) => {
    if (stayOver && vibe >= 70) {
      stayOver();
    } else {
      const endTexts = vibe >= 70 ? [
        `${match.name} kisses you goodbye at the door.\n\n"Tonight was amazing," they say.\n\n"Same time next week?"\n\nYou're smiling. Really smiling.`,
        `"I should go," ${match.name} says reluctantly.\n\nOne more kiss. Then another.\n\n"Text me when you get home?" you ask.\n\nThey will.`
      ] : [
        `${match.name} leaves. It was... okay.\n\n"Thanks for having me over," they say politely.\n\nNot quite the connection you hoped for.`,
        `The evening was fine. Just fine.\n\n${match.name} seems disappointed.\n\nMaybe needed more chemistry.`
      ];

      await base44.entities.NightLog.create({
        entry: `${human.name} had ${match.name} over. Vibe: ${vibe}/100. ${vibe >= 70 ? 'Great chemistry.' : 'Okay evening.'}`,
        category: 'interaction',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();
      alert(endTexts[Math.floor(Math.random() * endTexts.length)]);
      onClose({
        attractionGain: vibe >= 70 ? 15 : 5,
        connectionGain: vibe >= 70 ? 18 : 5,
        trustGain: vibe >= 70 ? 12 : 3,
        loyaltyGain: vibe >= 70 ? 10 : 2
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95"
      onClick={(e) => e.target === e.currentTarget && onClose({})}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-gradient-to-br from-pink-900/40 to-red-900/40 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-pink-500/30"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-pink-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">{match.name} at Your Place</h2>
              <p className="text-gray-400 text-sm">Your apartment</p>
            </div>
          </div>
          <button onClick={() => onClose({})} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vibe meter */}
        <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-purple-400 font-bold flex items-center gap-2">
              <Flame className="w-5 h-5" />
              Vibe
            </span>
            <span className="text-white font-bold">{vibe}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3">
            <div
              style={{ width: `${vibe}%` }}
              className="h-3 bg-gradient-to-r from-pink-500 via-red-500 to-purple-500 rounded-full"
            />
          </div>
          {vibe >= 70 && (
            <p className="text-pink-400 text-xs text-center mt-2">🔥 Great chemistry!</p>
          )}
        </div>

        <AnimatePresence mode="wait">
          {stage === 'invite' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-gray-800/50 border border-pink-500/30 rounded-xl p-4 mb-4">
                <p className="text-white text-center">
                  "{match.name} comes over. You close the door.\n\nThe apartment feels smaller. More intimate.\n\n"Nice place," they say.\n\nYou pour drinks. What now?"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {apartmentActions.map(action => {
                  const locked = action.requiresPrevious && !actions.includes(action.requiresPrevious);
                  return (
                    <button
                      key={action.id}
                      onClick={() => doAction(action)}
                      disabled={locked}
                      className={`p-4 rounded-xl text-left transition-all ${
                        actions.includes(action.id) 
                          ? 'bg-green-950/40 border-2 border-green-500/30 text-green-400' 
                          : locked
                          ? 'bg-gray-900/30 border border-gray-700 text-gray-600 cursor-not-allowed'
                          : 'bg-gray-800/50 border-2 border-pink-500/30 text-white hover:bg-gray-700/50'
                      }`}
                    >
                      <p className="font-medium text-sm">{action.label}</p>
                      {actions.includes(action.id) && (
                        <p className="text-xs text-green-400 mt-1">✓ Done</p>
                      )}
                    </button>
                  );
                })}
              </div>

              {vibe >= 40 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-3 mt-6"
                >
                  <button
                    onClick={() => endNight(false)}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl"
                  >
                    They Go Home
                  </button>
                  {vibe >= 70 && (
                    <button
                      onClick={stayOver}
                      className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                      <Moon className="w-5 h-5" />
                      Ask Them to Stay Over
                    </button>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}