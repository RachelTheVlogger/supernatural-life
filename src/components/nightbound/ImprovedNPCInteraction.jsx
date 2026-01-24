import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DialogueTree from './DialogueTree';
import RelationshipMeter from './RelationshipMeter';
import { getDialogueTree } from './dialogueTrees';

export default function ImprovedNPCInteraction({ characterStats = {} }) {
  const queryClient = useQueryClient();
  const [showInteraction, setShowInteraction] = useState(false);
  const [selectedNPC, setSelectedNPC] = useState(null);
  const [showDialogue, setShowDialogue] = useState(false);

  const { data: npcs = [] } = useQuery({
    queryKey: ['npcs'],
    queryFn: () => base44.entities.NPC.list()
  });

  const handleDialogueChoice = async (outcome) => {
    if (!selectedNPC) return;

    const newRelationship = Math.min(
      Math.max((selectedNPC.relationship || 50) + (outcome.relationshipChange || 0), 0),
      100
    );

    await base44.entities.NPC.update(selectedNPC.id, {
      relationship: newRelationship,
      last_interaction: new Date().toISOString()
    });

    queryClient.invalidateQueries(['npcs']);
    setShowDialogue(false);
    setSelectedNPC(null);

    // Log the interaction
    if (outcome.storyProgress) {
      await base44.entities.NightLog.create({
        entry: `Dialogue: ${selectedNPC.name}. Story progress: ${outcome.storyProgress}`,
        category: 'interaction',
        intensity: 'moderate'
      });
    }
  };

  const getCharacterStatsForDialogue = () => {
    return {
      charm_level: characterStats.charm_level || 50,
      voice_power: characterStats.voice_power || 50,
      magic_level: characterStats.magic_level || 50,
      vampire_power_level: characterStats.vampire_power_level || 50,
      relationship: selectedNPC?.relationship || 50
    };
  };

  if (!showInteraction) {
    return (
      <button
        onClick={() => setShowInteraction(true)}
        className="w-full bg-gradient-to-r from-purple-900/60 to-pink-900/60 hover:from-purple-900/80 hover:to-pink-900/80 border-2 border-purple-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
      >
        <MessageCircle className="w-5 h-5 text-pink-400" />
        <div className="flex-1 text-left">
          <h3 className="text-white font-medium">NPC Interactions</h3>
          <p className="text-pink-300 text-sm">Meet characters, build relationships</p>
        </div>
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/90 p-4"
      onClick={() => setShowInteraction(false)}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">NPC Interactions</h2>
          <button
            onClick={() => {
              setShowInteraction(false);
              setSelectedNPC(null);
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!selectedNPC ? (
          <div className="space-y-3">
            {npcs.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No NPCs found. They will appear as you explore.</p>
            ) : (
              npcs.map(npc => (
                <motion.button
                  key={npc.id}
                  onClick={() => setSelectedNPC(npc)}
                  whileHover={{ scale: 1.02 }}
                  className="w-full bg-gray-800/50 hover:bg-gray-800 rounded-xl p-4 text-left transition-all border border-gray-700/50 hover:border-purple-500/50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-bold text-lg">{npc.name}</h3>
                      <p className="text-gray-400 text-sm capitalize">{npc.personality || 'Unknown'} • {npc.occupation || 'Unknown'}</p>
                    </div>
                    <span className="text-xs bg-purple-900/30 text-purple-300 px-3 py-1 rounded-full">
                      {npc.location || 'Unknown'}
                    </span>
                  </div>
                  
                  <RelationshipMeter 
                    relationship={npc.relationship || 50}
                    maxRelationship={100}
                    compact={true}
                  />
                </motion.button>
              ))
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <button
              onClick={() => setSelectedNPC(null)}
              className="text-purple-400 hover:text-purple-300 text-sm mb-4 transition-colors"
            >
              ← Back to List
            </button>

            <h3 className="text-2xl font-bold text-white mb-2">{selectedNPC.name}</h3>
            <p className="text-gray-400 mb-6 capitalize">
              {selectedNPC.personality} • {selectedNPC.occupation}
            </p>

            <RelationshipMeter 
              relationship={selectedNPC.relationship || 50}
              maxRelationship={100}
            />

            <div className="mt-6">
              <p className="text-gray-400 text-sm mb-3">
                {selectedNPC.knows_vampire_secret 
                  ? 'They know your secret.' 
                  : 'They don\'t know what you are... yet.'}
              </p>
              
              <button
                onClick={() => setShowDialogue(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Start Conversation
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {showDialogue && selectedNPC && (
          <DialogueTree
            dialogue={getDialogueTree(selectedNPC.personality)}
            characterStats={getCharacterStatsForDialogue()}
            onChoice={handleDialogueChoice}
            onClose={() => setShowDialogue(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}