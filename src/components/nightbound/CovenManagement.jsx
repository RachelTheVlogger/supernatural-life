import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function CovenManagement({ vampireState, servants, onClose }) {
  const queryClient = useQueryClient();
  
  const { data: covenMembers = [] } = useQuery({
    queryKey: ['coven-members'],
    queryFn: () => base44.entities.CovenMember.list()
  });

  // Include turned servants in coven
  const turnedServants = servants?.filter(s => s.is_turned) || [];
  const allCovenMembers = [
    ...turnedServants.map(s => ({
      id: s.id,
      name: s.name,
      type: 'progeny',
      vampire_stage: s.vampire_stage || 1,
      vampire_power_level: s.vampire_power_level || 0,
      relationship: s.relationship || 0
    })),
    ...covenMembers
  ];

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

        <div className="flex items-center gap-3 mb-6">
          <Users className="w-8 h-8 text-purple-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Coven Management</h2>
            <p className="text-gray-400 text-sm">Your vampire family</p>
          </div>
        </div>

        {allCovenMembers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No coven members yet. Turn servants into vampires to build your coven.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allCovenMembers.map(member => (
              <div key={member.id} className="bg-gray-800 rounded-xl p-4 border border-purple-500/30">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white font-bold">{member.name}</h3>
                    <p className="text-purple-400 text-sm">
                      {member.type === 'progeny' ? '🦇 Your Progeny' : 'Coven Member'}
                    </p>
                  </div>
                  {member.type === 'progeny' && (
                    <div className="text-right text-xs">
                      <p className="text-gray-400">Stage {member.vampire_stage}</p>
                      <p className="text-gray-400">Bond: {member.relationship}%</p>
                    </div>
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