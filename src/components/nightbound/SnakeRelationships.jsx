import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Heart, Swords, Users, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const RELATIONSHIP_TYPES = [
  { id: 'friend', label: 'Friend', icon: '🤝', color: 'text-green-400', description: 'Cooperative and supportive' },
  { id: 'rival', label: 'Rival', icon: '⚔️', color: 'text-red-400', description: 'Competitive, pushes each other' },
  { id: 'lover', label: 'Mate', icon: '💕', color: 'text-pink-400', description: 'Bonded pair, breed together' },
  { id: 'mentor', label: 'Mentor/Student', icon: '📚', color: 'text-blue-400', description: 'One teaches, one learns' },
  { id: 'enemy', label: 'Enemy', icon: '💢', color: 'text-orange-400', description: 'Hostile, avoid each other' },
  { id: 'neutral', label: 'Neutral', icon: '😐', color: 'text-gray-400', description: 'Indifferent' }
];

export default function SnakeRelationships({ snake, allSnakes, onClose }) {
  const queryClient = useQueryClient();
  const [selectedSnake, setSelectedSnake] = useState(null);
  const [interacting, setInteracting] = useState(false);
  const [outcome, setOutcome] = useState('');

  // Get or create relationship data
  const getRelationship = (targetSnakeId) => {
    if (!snake.relationships) return null;
    return snake.relationships.find(r => r.snakeId === targetSnakeId);
  };

  const handleSetRelationship = async (targetSnake, relationshipType) => {
    setInteracting(true);

    setTimeout(async () => {
      const existing = getRelationship(targetSnake.id);
      const newRelationships = snake.relationships || [];
      
      if (existing) {
        const updated = newRelationships.map(r => 
          r.snakeId === targetSnake.id 
            ? { ...r, type: relationshipType, strength: (r.strength || 50) + 10 }
            : r
        );
        await base44.entities.SnakeFamiliar.update(snake.id, {
          relationships: updated
        });
      } else {
        await base44.entities.SnakeFamiliar.update(snake.id, {
          relationships: [...newRelationships, {
            snakeId: targetSnake.id,
            type: relationshipType,
            strength: 50
          }]
        });
      }

      // Update target snake too
      const targetRelationships = targetSnake.relationships || [];
      const targetExisting = targetRelationships.find(r => r.snakeId === snake.id);
      
      if (targetExisting) {
        const updated = targetRelationships.map(r => 
          r.snakeId === snake.id 
            ? { ...r, type: relationshipType, strength: (r.strength || 50) + 10 }
            : r
        );
        await base44.entities.SnakeFamiliar.update(targetSnake.id, {
          relationships: updated
        });
      } else {
        await base44.entities.SnakeFamiliar.update(targetSnake.id, {
          relationships: [...targetRelationships, {
            snakeId: snake.id,
            type: relationshipType,
            strength: 50
          }]
        });
      }

      const typeInfo = RELATIONSHIP_TYPES.find(r => r.id === relationshipType);
      setOutcome(`${snake.custom_name} and ${targetSnake.custom_name} are now ${typeInfo.label.toLowerCase()}s. ${typeInfo.description}`);

      await base44.entities.NightLog.create({
        entry: `${snake.custom_name} and ${targetSnake.custom_name} formed a ${relationshipType} bond.`,
        category: 'interaction',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setInteracting(false);
        setOutcome('');
        setSelectedSnake(null);
      }, 3000);
    }, 1500);
  };

  const otherSnakes = allSnakes.filter(s => s.id !== snake.id);

  return (
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
        className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-emerald-500/50"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">🐍 {snake.custom_name}'s Relationships</h2>
        <p className="text-gray-400 text-sm mb-6">Define how your snake relates to other snakes</p>

        {outcome ? (
          <div className="py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-900/40 border border-emerald-500/30 rounded-xl p-6 text-center"
            >
              <p className="text-emerald-200 text-lg">{outcome}</p>
            </motion.div>
          </div>
        ) : interacting ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.3, 1] }}
              transition={{ rotate: { duration: 2, repeat: Infinity, ease: 'linear' }, scale: { duration: 1, repeat: Infinity } }}
              className="text-6xl mb-4"
            >
              🐍🐍
            </motion.div>
            <p className="text-emerald-400">Forming bond...</p>
          </div>
        ) : !selectedSnake ? (
          <div className="space-y-3">
            {otherSnakes.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No other snakes to form relationships with</p>
            ) : (
              otherSnakes.map(otherSnake => {
                const relationship = getRelationship(otherSnake.id);
                const relType = relationship ? RELATIONSHIP_TYPES.find(r => r.id === relationship.type) : null;
                
                return (
                  <button
                    key={otherSnake.id}
                    onClick={() => setSelectedSnake(otherSnake)}
                    className="w-full bg-gray-800 hover:bg-gray-700 border border-emerald-500/30 rounded-xl p-4 text-left transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-bold">{otherSnake.custom_name}</h4>
                        <p className="text-gray-400 text-sm capitalize">{otherSnake.type} • {otherSnake.gender}</p>
                        {relationship && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-2xl">{relType.icon}</span>
                            <span className={`${relType.color} text-sm font-medium`}>
                              {relType.label} • {relationship.strength}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        ) : (
          <div>
            <div className="bg-gray-800 rounded-xl p-4 mb-4">
              <h3 className="text-white font-bold mb-2">Setting relationship with:</h3>
              <div className="flex items-center gap-3">
                <span className="text-4xl">🐍</span>
                <div>
                  <p className="text-white font-bold">{selectedSnake.custom_name}</p>
                  <p className="text-gray-400 text-sm capitalize">{selectedSnake.type}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {RELATIONSHIP_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => handleSetRelationship(selectedSnake, type.id)}
                  className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-xl p-4 text-left transition-all hover:scale-105"
                >
                  <div className="text-3xl mb-2">{type.icon}</div>
                  <h4 className={`${type.color} font-bold text-sm mb-1`}>{type.label}</h4>
                  <p className="text-gray-500 text-xs">{type.description}</p>
                </button>
              ))}
            </div>

            <button
              onClick={() => setSelectedSnake(null)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg"
            >
              Back
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}