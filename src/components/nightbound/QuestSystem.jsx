import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Circle, ChevronRight, Star, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient, useQuery } from '@tanstack/react-query';

// Quest definitions by servant variant
export const QUEST_LIBRARY = {
  devoted: {
    key: 'devoted_devotion',
    title: 'Unwavering Devotion',
    description: 'A journey of complete surrender',
    stages: [
      {
        title: 'First Offering',
        description: 'Your devoted servant wishes to prove their worth.',
        objectives: [
          { type: 'feed', count: 3, text: 'Feed from them 3 times' },
          { type: 'relationship', value: 25, text: 'Reach bond level 25' }
        ],
        narrative: 'They approach you hesitantly. "I want to be useful to you. Please, let me serve."',
        choices: [
          { text: 'Accept their offering', outcome: 'gentle' },
          { text: 'Demand more devotion', outcome: 'harsh' }
        ],
        reward: { type: 'ability', name: 'Willing Vessel', description: 'Feeding from them is more satisfying' }
      },
      {
        title: 'Breaking Point',
        description: 'They are willing to sacrifice everything.',
        objectives: [
          { type: 'teach', count: 5, text: 'Teach them 5 times' },
          { type: 'relationship', value: 50, text: 'Reach bond level 50' }
        ],
        narrative: 'Their eyes shine with unshed tears. "I would give up my entire life for you. Just say the word."',
        choices: [
          { text: 'Acknowledge their sacrifice', outcome: 'kind' },
          { text: 'Test their limits further', outcome: 'cruel' }
        ],
        reward: { type: 'passive', name: 'Unbreakable Bond', description: 'Their devotion prevents relationship decay' }
      },
      {
        title: 'Final Vow',
        description: 'The ultimate act of devotion.',
        objectives: [
          { type: 'relationship', value: 80, text: 'Reach bond level 80' },
          { type: 'nights', value: 30, text: 'Survive 30 nights together' }
        ],
        narrative: 'They kneel before you. "I am ready. Turn me. Make me yours forever. I want nothing else."',
        choices: [
          { text: 'Grant them eternity', outcome: 'turn' },
          { text: 'Keep them mortal', outcome: 'refuse' }
        ],
        reward: { type: 'power', name: 'Eternal Servant', description: 'Unlocks "Perfect Thrall" evolution path' }
      }
    ]
  },
  defiant: {
    key: 'defiant_struggle',
    title: 'The Beautiful Struggle',
    description: 'Resistance that deepens into obsession',
    stages: [
      {
        title: 'First Crack',
        description: 'Their defiance is weakening.',
        objectives: [
          { type: 'message', count: 10, text: 'Exchange 10 messages' },
          { type: 'relationship', value: 30, text: 'Reach bond level 30' }
        ],
        narrative: 'They glare at you, but their voice wavers. "I hate that I keep coming back. What have you done to me?"',
        choices: [
          { text: 'Embrace their conflict', outcome: 'gentle' },
          { text: 'Break them faster', outcome: 'force' }
        ],
        reward: { type: 'ability', name: 'Sweet Resistance', description: 'Their defiance makes interactions more rewarding' }
      },
      {
        title: 'Surrender',
        description: 'They stop fighting.',
        objectives: [
          { type: 'feed', count: 5, text: 'Feed from them 5 times' },
          { type: 'relationship', value: 60, text: 'Reach bond level 60' }
        ],
        narrative: 'They close their eyes, defeated. "Fine. You win. I\'m yours. Are you happy now?"',
        choices: [
          { text: 'Show mercy in victory', outcome: 'merciful' },
          { text: 'Revel in their submission', outcome: 'triumphant' }
        ],
        reward: { type: 'passive', name: 'Conquered Will', description: 'They can never truly leave you' }
      },
      {
        title: 'Twisted Love',
        description: 'Resistance becomes devotion.',
        objectives: [
          { type: 'relationship', value: 85, text: 'Reach bond level 85' },
          { type: 'goout', count: 3, text: 'Take them out 3 times' }
        ],
        narrative: 'They look at you with tears and a smile. "I hate you. I love you. I don\'t know anymore. Just don\'t let me go."',
        choices: [
          { text: 'Make them eternal', outcome: 'turn' },
          { text: 'Keep the tension alive', outcome: 'refuse' }
        ],
        reward: { type: 'power', name: 'Broken Beauty', description: 'Unlocks "Commanding Presence" evolution earlier' }
      }
    ]
  },
  dreamer: {
    key: 'dreamer_fade',
    title: 'Fading into Shadow',
    description: 'Reality dissolves into you',
    stages: [
      {
        title: 'First Dream',
        description: 'They are losing touch with reality.',
        objectives: [
          { type: 'message', count: 8, text: 'Exchange 8 messages' },
          { type: 'relationship', value: 25, text: 'Reach bond level 25' }
        ],
        narrative: 'Their eyes are distant. "I dreamed of you again. Or was that real? I can\'t remember anymore."',
        choices: [
          { text: 'Guide them deeper', outcome: 'encourage' },
          { text: 'Pull them back to reality', outcome: 'ground' }
        ],
        reward: { type: 'ability', name: 'Dream Walker', description: 'Their messages become more poetic and revealing' }
      },
      {
        title: 'Between Worlds',
        description: 'They exist more in shadow than light.',
        objectives: [
          { type: 'teach', count: 4, text: 'Teach them 4 times' },
          { type: 'relationship', value: 55, text: 'Reach bond level 55' }
        ],
        narrative: 'They speak softly. "The world feels thin now. You\'re the only solid thing. Everything else is just... smoke."',
        choices: [
          { text: 'Become their anchor', outcome: 'anchor' },
          { text: 'Let them drift further', outcome: 'release' }
        ],
        reward: { type: 'passive', name: 'Ethereal Bond', description: 'They gain mystical insights and visions' }
      },
      {
        title: 'Complete Eclipse',
        description: 'They are ready to leave reality behind.',
        objectives: [
          { type: 'relationship', value: 90, text: 'Reach bond level 90' },
          { type: 'feed', count: 7, text: 'Feed from them 7 times' }
        ],
        narrative: 'They smile serenely. "There\'s nothing left for me in the waking world. Take me with you. Forever."',
        choices: [
          { text: 'Bring them into darkness', outcome: 'turn' },
          { text: 'Let them remain ethereal', outcome: 'refuse' }
        ],
        reward: { type: 'power', name: 'Shadow Companion', description: 'Unlocks "Veil of Darkness" evolution earlier' }
      }
    ]
  }
};

export default function QuestSystem({ servant, vampireState, onClose }) {
  if (!servant || !vampireState) {
    return null;
  }

  const [activeQuest, setActiveQuest] = useState(null);
  const [makingChoice, setMakingChoice] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: quests = [] } = useQuery({
    queryKey: ['quests', servant.id],
    queryFn: () => base44.entities.Quest.filter({ servant_id: servant.id })
  });

  const questData = QUEST_LIBRARY[servant.variant];
  const servantQuest = quests.find(q => q.quest_key === questData?.key);
  const currentStage = servantQuest?.stage || 0;
  const isCompleted = servantQuest?.completed || false;
  
  const checkObjectives = (stage, servant, vampireState) => {
    const progress = servantQuest?.progress || {};
    
    return stage.objectives.map(obj => {
      if (obj.type === 'relationship') {
        return { ...obj, current: servant.relationship || 0, completed: (servant.relationship || 0) >= obj.value };
      }
      if (obj.type === 'nights') {
        return { ...obj, current: vampireState.nights_passed || 0, completed: (vampireState.nights_passed || 0) >= obj.value };
      }
      if (obj.type === 'feed' || obj.type === 'teach' || obj.type === 'message' || obj.type === 'goout') {
        const current = progress[obj.type] || 0;
        return { ...obj, current, completed: current >= obj.count };
      }
      return { ...obj, current: 0, completed: false };
    });
  };
  
  const handleStartQuest = async () => {
    await base44.entities.Quest.create({
      servant_id: servant.id,
      quest_key: questData.key,
      stage: 1,
      progress: {},
      choices_made: []
    });
    queryClient.invalidateQueries(['quests']);
  };
  
  const handleMakeChoice = async (choice, stageIndex) => {
    setMakingChoice(true);
    
    setTimeout(async () => {
      const newChoices = [...(servantQuest.choices_made || []), choice.outcome];
      const isLastStage = stageIndex === questData.stages.length - 1;
      
      // Handle rewards
      const stage = questData.stages[stageIndex];
      if (stage.reward) {
        await base44.entities.NightLog.create({
          entry: `Quest reward unlocked: ${stage.reward.name} - ${stage.reward.description}`,
          category: 'interaction',
          intensity: 'significant'
        });
        
        // If it's a power reward, unlock it
        if (stage.reward.type === 'power') {
          const currentPowers = vampireState.unlocked_powers || [];
          if (!currentPowers.includes(stage.reward.name)) {
            await base44.entities.VampireState.update(vampireState.id, {
              unlocked_powers: [...currentPowers, stage.reward.name]
            });
            queryClient.invalidateQueries(['vampireState']);
          }
        }
      }
      
      // Handle turn choice
      if (choice.outcome === 'turn' && !servant.is_turned) {
        await base44.entities.Servant.update(servant.id, {
          is_turned: true,
          obsession_stage: 5
        });
      }
      
      // Update quest
      await base44.entities.Quest.update(servantQuest.id, {
        stage: isLastStage ? stageIndex + 1 : stageIndex + 2,
        completed: isLastStage,
        choices_made: newChoices,
        progress: {}
      });
      
      queryClient.invalidateQueries(['quests']);
      queryClient.invalidateQueries(['servants']);
      queryClient.invalidateQueries(['logs']);
      
      setMakingChoice(false);
      setActiveQuest(null);
    }, 1500);
  };
  
  if (!questData) return null;
  
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
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto relative"
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
        
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-8 h-8 text-purple-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">{questData.title}</h2>
            <p className="text-gray-400 text-sm">{questData.description}</p>
          </div>
        </div>
        
        {!servantQuest || currentStage === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-300 mb-6">Begin {servant.name}'s personal journey?</p>
            <button
              onClick={handleStartQuest}
              className="bitlife-btn px-8 py-3 rounded-xl"
            >
              Start Quest
            </button>
          </div>
        ) : isCompleted ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-white text-xl font-bold mb-2">Quest Complete</h3>
            <p className="text-gray-400">You have completed {servant.name}'s journey.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questData.stages.map((stage, i) => {
              const stageNum = i + 1;
              const isCurrentStage = stageNum === currentStage;
              const isPastStage = stageNum < currentStage;
              const isFutureStage = stageNum > currentStage;
              
              const objectives = isCurrentStage ? checkObjectives(stage, servant, vampireState) : [];
              const allCompleted = objectives.every(o => o.completed);
              
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`border rounded-xl p-4 ${
                    isPastStage
                      ? 'bg-green-950/20 border-green-800/50'
                      : isCurrentStage
                      ? 'bg-purple-950/20 border-purple-800/50'
                      : 'bg-gray-800/20 border-gray-700/50 opacity-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {isPastStage ? (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      ) : isCurrentStage ? (
                        <Circle className="w-6 h-6 text-purple-400" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-bold">Stage {stageNum}: {stage.title}</h4>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{stage.description}</p>
                      
                      {isCurrentStage && (
                        <>
                          <div className="space-y-2 mb-4">
                            {objectives.map((obj, j) => (
                              <div key={j} className="flex items-center gap-2 text-sm">
                                {obj.completed ? (
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Circle className="w-4 h-4 text-gray-500" />
                                )}
                                <span className={obj.completed ? 'text-green-300' : 'text-gray-400'}>
                                  {obj.text}
                                  {obj.count && ` (${obj.current}/${obj.count})`}
                                  {obj.value && ` (${obj.current}/${obj.value})`}
                                </span>
                              </div>
                            ))}
                          </div>
                          
                          {allCompleted && !activeQuest && (
                            <button
                              onClick={() => setActiveQuest(i)}
                              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              <span>Continue Quest</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                      
                      {isPastStage && stage.reward && (
                        <div className="bg-black/40 rounded-lg p-3 border border-green-900/30">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="text-green-300 text-sm font-medium">{stage.reward.name}</span>
                          </div>
                          <p className="text-gray-400 text-xs mt-1">{stage.reward.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
      
      {/* Choice Modal */}
      <AnimatePresence>
        {activeQuest !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/80"
            onClick={() => !makingChoice && setActiveQuest(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full mx-4"
            >
              {makingChoice ? (
                <div className="text-center py-8">
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <p className="text-gray-400">Processing choice...</p>
                  </motion.div>
                </div>
              ) : (
                <>
                  <p className="text-gray-300 leading-relaxed mb-6 italic">
                    "{questData.stages[activeQuest].narrative}"
                  </p>
                  
                  <div className="space-y-3">
                    {questData.stages[activeQuest].choices.map((choice, i) => (
                      <button
                        key={i}
                        onClick={() => handleMakeChoice(choice, activeQuest)}
                        className="w-full bg-purple-950/30 hover:bg-purple-950/50 border border-purple-800/50 rounded-xl p-4 text-left transition-all"
                      >
                        <p className="text-white">{choice.text}</p>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}