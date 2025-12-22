import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users, MessageCircle, Gift, Coffee, Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const INTERACTION_OPTIONS = {
  chat: { icon: MessageCircle, label: 'Chat', relGain: [3, 8] },
  compliment: { icon: Heart, label: 'Compliment', relGain: [5, 10] },
  gift: { icon: Gift, label: 'Give a gift', relGain: [10, 15] },
  coffee: { icon: Coffee, label: 'Get coffee', relGain: [4, 9] }
};

export default function NPCInteraction({ onClose, viewMode }) {
  const queryClient = useQueryClient();
  const [selectedNPC, setSelectedNPC] = useState(null);
  const [outcome, setOutcome] = useState('');
  const [processing, setProcessing] = useState(false);

  const { data: npcs = [] } = useQuery({
    queryKey: ['npcs'],
    queryFn: () => base44.entities.NPC.list()
  });

  const handleInteract = async (npc, actionKey) => {
    setProcessing(true);
    const action = INTERACTION_OPTIONS[actionKey];
    
    setTimeout(async () => {
      const [min, max] = action.relGain;
      const gain = Math.floor(Math.random() * (max - min + 1)) + min;
      
      const relationshipKey = viewMode === 'vampire' ? 'relationship_vampire' : 'relationship_servant';
      const newRel = Math.min((npc[relationshipKey] || 50) + gain, 100);
      
      const outcomes = {
        chat: [`You talked with ${npc.name}. They seem more comfortable around you.`, `${npc.name} opened up a bit. The conversation was nice.`],
        compliment: [`${npc.name} blushed at your words.`, `Your compliment made ${npc.name} smile.`],
        gift: [`${npc.name} was touched by your gift.`, `You gave ${npc.name} something special. They were grateful.`],
        coffee: [`You shared coffee with ${npc.name}. Simple moments matter.`, `${npc.name} enjoyed the coffee date.`]
      };
      
      setOutcome(outcomes[actionKey][Math.floor(Math.random() * outcomes[actionKey].length)]);
      
      await base44.entities.NPC.update(npc.id, {
        [relationshipKey]: newRel,
        [`last_interaction_${viewMode}`]: new Date().toISOString()
      });
      
      await base44.entities.NightLog.create({
        entry: `NPC interaction: ${outcomes[actionKey][0]}`,
        category: 'social',
        intensity: 'subtle'
      });
      
      queryClient.invalidateQueries(['npcs']);
      
      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
        setSelectedNPC(null);
      }, 3000);
    }, 1500);
  };

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
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Users className="w-6 h-6" />
          People Around Town
        </h2>

        {npcs.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No one around right now...</p>
        ) : (
          <div className="space-y-3">
            {npcs.map((npc) => (
              <div
                key={npc.id}
                className="bg-gray-800 rounded-xl p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-white font-medium">{npc.name}</h3>
                    <p className="text-gray-400 text-sm">{npc.occupation} · {npc.location}</p>
                    <p className="text-gray-500 text-xs capitalize mt-1">{npc.personality}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-purple-400 text-sm">
                      {viewMode === 'vampire' ? npc.relationship_vampire : npc.relationship_servant}/100
                    </p>
                  </div>
                </div>

                {selectedNPC?.id === npc.id && outcome ? (
                  <p className="text-gray-300 text-sm italic">{outcome}</p>
                ) : processing && selectedNPC?.id === npc.id ? (
                  <p className="text-gray-400 text-sm">...</p>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(INTERACTION_OPTIONS).map(([key, action]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectedNPC(npc);
                          handleInteract(npc, key);
                        }}
                        disabled={processing}
                        className="bg-purple-950/30 hover:bg-purple-950/50 text-purple-300 text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        <action.icon className="w-3 h-3" />
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}