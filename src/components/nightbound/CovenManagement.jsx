import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users, Crown, Shield, UserPlus, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function CovenManagement({ onClose, vampireState, servants }) {
  const queryClient = useQueryClient();
  const [recruiting, setRecruiting] = useState(false);

  const { data: covenMembers = [] } = useQuery({
    queryKey: ['coven'],
    queryFn: () => base44.entities.CovenMember.list()
  });

  const turnedServants = servants.filter(s => s.is_turned);
  const availableToRecruit = turnedServants.filter(s => 
    !covenMembers.find(c => c.vampire_id === s.id)
  );

  const handleRecruit = async (servant, role) => {
    await base44.entities.CovenMember.create({
      vampire_id: servant.id,
      role: role,
      loyalty: servant.relationship || 50,
      power_contribution: Math.floor(servant.unlocked_powers?.length * 10) || 10
    });

    if (vampireState.id) {
      await base44.entities.VampireState.update(vampireState.id, {
        coven_size: covenMembers.length + 1
      });
    }

    await base44.entities.NightLog.create({
      entry: `${servant.name} joined your coven as ${role}. Your power grows.`,
      category: 'power',
      intensity: 'significant'
    });

    queryClient.invalidateQueries();
    setRecruiting(false);
  };

  const totalPower = covenMembers.reduce((sum, m) => sum + (m.power_contribution || 0), 0);

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
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Your Coven</h2>
        <p className="text-gray-400 text-sm mb-4">
          Size: {covenMembers.length} • Total Power: {totalPower}
        </p>

        {!recruiting ? (
          <>
            {availableToRecruit.length > 0 && (
              <button
                onClick={() => setRecruiting(true)}
                className="w-full mb-4 bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white font-medium py-3 rounded-xl transition-all"
              >
                <UserPlus className="w-5 h-5 inline mr-2" />
                Recruit New Member
              </button>
            )}

            {covenMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No coven yet. Turn servants into vampires to recruit them.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {covenMembers.map(member => {
                  const servant = servants.find(s => s.id === member.vampire_id);
                  const roleIcons = {
                    lieutenant: Crown,
                    enforcer: Shield,
                    recruiter: Users,
                    advisor: Zap
                  };
                  const Icon = roleIcons[member.role];

                  return (
                    <div key={member.id} className="bg-gray-800 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Icon className="w-6 h-6 text-purple-400 mt-1" />
                        <div className="flex-1">
                          <h3 className="text-white font-bold">{servant?.name || 'Unknown'}</h3>
                          <p className="text-gray-400 text-sm capitalize">{member.role}</p>
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Loyalty</span>
                              <span className="text-purple-400">{member.loyalty}/100</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Power</span>
                              <span className="text-yellow-400">{member.power_contribution}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => setRecruiting(false)}
              className="text-gray-400 hover:text-white text-sm mb-4"
            >
              ← Back
            </button>

            <h3 className="text-white text-lg font-bold mb-4">Choose a vampire and their role</h3>

            {availableToRecruit.map(servant => (
              <div key={servant.id} className="bg-gray-800 rounded-xl p-4">
                <h4 className="text-white font-medium mb-3">{servant.name}</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleRecruit(servant, 'lieutenant')}
                    className="bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 text-white py-2 rounded text-sm"
                  >
                    👑 Lieutenant
                  </button>
                  <button
                    onClick={() => handleRecruit(servant, 'enforcer')}
                    className="bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 text-white py-2 rounded text-sm"
                  >
                    🛡️ Enforcer
                  </button>
                  <button
                    onClick={() => handleRecruit(servant, 'recruiter')}
                    className="bg-blue-900/40 hover:bg-blue-900/60 border border-blue-500/30 text-white py-2 rounded text-sm"
                  >
                    👥 Recruiter
                  </button>
                  <button
                    onClick={() => handleRecruit(servant, 'advisor')}
                    className="bg-green-900/40 hover:bg-green-900/60 border border-green-500/30 text-white py-2 rounded text-sm"
                  >
                    ⚡ Advisor
                  </button>
                </div>
              </div>
            ))}

            {availableToRecruit.length === 0 && (
              <p className="text-gray-400 text-center py-8">All turned vampires are already in your coven.</p>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}