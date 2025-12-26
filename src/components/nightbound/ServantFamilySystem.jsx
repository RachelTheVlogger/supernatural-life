import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const RELATIONS = ['parent', 'sibling', 'child', 'spouse', 'ex'];

export default function ServantFamilySystem({ servant, vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [interacting, setInteracting] = useState(null);

  const { data: family = [] } = useQuery({
    queryKey: ['family', servant.id],
    queryFn: async () => {
      const existing = await base44.entities.ServantFamily.filter({ servant_id: servant.id });
      if (existing.length === 0) {
        // Generate initial family
        const names = ['Sarah', 'Michael', 'Emma', 'David', 'Lisa'];
        const newMember = await base44.entities.ServantFamily.create({
          servant_id: servant.id,
          member_name: names[Math.floor(Math.random() * names.length)],
          relationship_type: RELATIONS[Math.floor(Math.random() * RELATIONS.length)],
          concern_level: Math.floor(Math.random() * 30),
          relationship_with_vampire: -40
        });
        return [newMember];
      }
      return existing;
    }
  });

  const handleInteract = async (member, type) => {
    setInteracting(member.id);
    
    setTimeout(async () => {
      let concernChange = 0;
      let relationChange = 0;
      let message = '';
      
      if (type === 'meet') {
        const success = vampireState.humanity >= 50;
        relationChange = success ? 20 : -20;
        concernChange = success ? -10 : 20;
        message = success 
          ? `Met ${member.member_name}. They seem... cautiously okay with you.`
          : `${member.member_name} is deeply suspicious. This didn't go well.`;
        
        await base44.entities.ServantFamily.update(member.id, {
          knows_secret: true
        });
      } else if (type === 'compel') {
        relationChange = -30;
        message = `You compelled ${member.member_name} to forget. Dark. Effective.`;
        
        await base44.entities.ServantFamily.update(member.id, {
          knows_secret: false,
          concern_level: 0
        });
      } else if (type === 'bond') {
        if (member.relationship_with_vampire >= 30) {
          relationChange = 25;
          concernChange = -30;
          message = `${member.member_name} accepts you. Family bond formed.`;
        } else {
          message = `${member.member_name} isn't ready to trust you yet.`;
        }
      }
      
      await base44.entities.ServantFamily.update(member.id, {
        concern_level: Math.max(0, Math.min(100, member.concern_level + concernChange)),
        relationship_with_vampire: Math.max(-100, Math.min(100, member.relationship_with_vampire + relationChange)),
        last_contact: new Date().toISOString()
      });
      
      // Check for intervention
      if (member.concern_level > 70 && !member.intervention_attempted) {
        await base44.entities.ServantFamily.update(member.id, {
          intervention_attempted: true
        });
        
        message += ` WARNING: ${member.member_name} is planning an intervention!`;
      }
      
      await base44.entities.NightLog.create({
        entry: `${servant.name}'s ${member.relationship_type}: ${message}`,
        category: 'interaction',
        intensity: member.intervention_attempted ? 'significant' : 'moderate'
      });
      
      queryClient.invalidateQueries();
      setInteracting(null);
    }, 2000);
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
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">👨‍👩‍👧 {servant.name}'s Family</h2>
        <p className="text-gray-400 text-sm mb-6">Mortals who notice something's wrong</p>

        {family.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No family discovered yet</p>
        ) : (
          <div className="space-y-3">
            {family.map(member => (
              <div key={member.id} className="bg-gray-800 rounded-xl p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-white font-bold">{member.member_name}</h3>
                    <p className="text-gray-400 text-sm capitalize">{servant.name}'s {member.relationship_type}</p>
                    {member.knows_secret && <p className="text-red-400 text-xs mt-1">👁️ Knows the secret</p>}
                    {member.intervention_attempted && (
                      <p className="text-orange-400 text-xs mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Intervention planned!
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${member.relationship_with_vampire >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      Rel: {member.relationship_with_vampire}
                    </p>
                    <p className={`text-xs ${member.concern_level > 50 ? 'text-orange-400' : 'text-gray-500'}`}>
                      Concern: {member.concern_level}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleInteract(member, 'meet')}
                    disabled={interacting || member.knows_secret}
                    className="flex-1 bg-blue-900/40 hover:bg-blue-900/60 border border-blue-500/30 text-blue-300 rounded-lg py-2 text-sm transition-colors disabled:opacity-50"
                  >
                    Meet Them
                  </button>
                  {member.knows_secret && (
                    <>
                      <button
                        onClick={() => handleInteract(member, 'bond')}
                        disabled={interacting}
                        className="flex-1 bg-green-900/40 hover:bg-green-900/60 border border-green-500/30 text-green-300 rounded-lg py-2 text-sm transition-colors disabled:opacity-50"
                      >
                        Build Trust
                      </button>
                      <button
                        onClick={() => handleInteract(member, 'compel')}
                        disabled={interacting}
                        className="flex-1 bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 rounded-lg py-2 text-sm transition-colors disabled:opacity-50"
                      >
                        Compel
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}