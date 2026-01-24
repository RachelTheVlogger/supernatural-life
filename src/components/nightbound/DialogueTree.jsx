import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, Heart, AlertCircle } from 'lucide-react';

export default function DialogueTree({ 
  dialogue, 
  characterStats = {}, 
  onChoice, 
  onClose 
}) {
  const [currentNode, setCurrentNode] = useState(dialogue.nodes[dialogue.startNodeId]);
  const [nodeHistory, setNodeHistory] = useState([dialogue.nodes[dialogue.startNodeId]]);
  const [selectedOption, setSelectedOption] = useState(null);

  const evaluateSkillCheck = (check) => {
    if (!check) return true;
    const statValue = characterStats[check.stat] || 0;
    return statValue >= check.difficulty;
  };

  const handleChoiceClick = (option) => {
    const skillPassed = evaluateSkillCheck(option.skillCheck);
    
    // Always go to the node, but skill check affects which outcome we get
    const nextNodeId = skillPassed ? option.nextNode : (option.failureNode || option.nextNode);
    const nextNode = dialogue.nodes[nextNodeId];

    if (!nextNode) {
      // Dialogue ended
      if (onChoice) {
        onChoice({
          relationshipChange: option.relationshipChange || 0,
          storyProgress: option.storyProgress,
          skillChecked: !!option.skillCheck,
          skillPassed
        });
      }
      setCurrentNode(null);
      return;
    }

    setSelectedOption({ ...option, skillPassed });
    setTimeout(() => {
      setCurrentNode(nextNode);
      setNodeHistory([...nodeHistory, nextNode]);
      setSelectedOption(null);
    }, 800);
  };

  const canChooseOption = (option) => {
    if (option.requiresRelationship) {
      return characterStats.relationship >= option.requiresRelationship;
    }
    return true;
  };

  if (!currentNode) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gray-900 rounded-2xl p-8 max-w-md text-center"
        >
          <h3 className="text-xl font-bold text-white mb-3">Dialogue Ended</h3>
          <p className="text-gray-400 mb-6">The conversation has concluded.</p>
          <button
            onClick={onClose}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-purple-500/30"
      >
        {/* Character Name */}
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          {dialogue.characterName}
          <span className="text-sm text-gray-400">• {dialogue.characterType}</span>
        </h2>

        {/* Dialogue Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 rounded-lg p-6 mb-6 border border-gray-700/50"
        >
          <p className="text-gray-200 leading-relaxed text-lg italic">
            "{currentNode.text}"
          </p>
        </motion.div>

        {/* Recent Choice Feedback */}
        {selectedOption && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`mb-6 p-4 rounded-lg border ${
              selectedOption.skillPassed
                ? 'bg-green-900/20 border-green-500/30'
                : 'bg-red-900/20 border-red-500/30'
            }`}
          >
            <p className={`text-sm font-medium ${
              selectedOption.skillPassed ? 'text-green-300' : 'text-red-300'
            }`}>
              {selectedOption.skillPassed ? '✓ Skill Check Passed' : '✗ Skill Check Failed'}
            </p>
          </motion.div>
        )}

        {/* Options */}
        <div className="space-y-3 mb-6">
          <p className="text-gray-400 text-sm mb-3">Choose your response:</p>
          <AnimatePresence>
            {currentNode.options.map((option, idx) => {
              const isAvailable = canChooseOption(option);
              const hasSkillCheck = !!option.skillCheck;
              const skillWillPass = evaluateSkillCheck(option.skillCheck);

              return (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => isAvailable && handleChoiceClick(option)}
                  disabled={!isAvailable}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    !isAvailable
                      ? 'bg-gray-800/30 border-gray-700/30 cursor-not-allowed opacity-50'
                      : 'bg-gray-800/50 border-gray-700/50 hover:border-purple-500/50 hover:bg-gray-800 cursor-pointer'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-white font-medium">{option.text}</p>
                      {option.requiresRelationship && (
                        <p className="text-xs text-gray-500 mt-1">
                          Requires relationship ≥ {option.requiresRelationship}
                        </p>
                      )}
                      {hasSkillCheck && (
                        <p className={`text-xs mt-1 flex items-center gap-1 ${
                          skillWillPass ? 'text-green-400' : 'text-orange-400'
                        }`}>
                          <Zap className="w-3 h-3" />
                          {option.skillCheck.stat} check (Difficulty: {option.skillCheck.difficulty})
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {option.relationshipChange > 0 && (
                        <div className="flex items-center gap-1 text-xs text-pink-400">
                          <Heart className="w-3 h-3" />
                          +{option.relationshipChange}
                        </div>
                      )}
                      {option.relationshipChange < 0 && (
                        <div className="flex items-center gap-1 text-xs text-red-400">
                          <AlertCircle className="w-3 h-3" />
                          {option.relationshipChange}
                        </div>
                      )}
                      {isAvailable && <ArrowRight className="w-4 h-4 text-purple-400" />}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-300 text-sm transition-colors"
        >
          Close Dialogue
        </button>
      </motion.div>
    </motion.div>
  );
}