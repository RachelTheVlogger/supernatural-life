import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Shield, BookOpen, Scroll, Zap, MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function VampireCouncilModal({ onClose, vampireState }) {
  const queryClient = useQueryClient();
  const [selectedMember, setSelectedMember] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');

  const { data: council = [] } = useQuery({
    queryKey: ['council'],
    queryFn: () => base44.entities.VampireCouncil.list()
  });

  // Ensure exactly 3 council members
  React.useEffect(() => {
    const initCouncil = async () => {
      if (council.length === 0) {
        const members = [
          { name: 'Elder Magdalena', position: 'elder', favor: 50 },
          { name: 'Viktor the Enforcer', position: 'enforcer', favor: 40 },
          { name: 'Isabeau the Diplomat', position: 'diplomat', favor: 60 }
        ];

        await Promise.all(members.map(m => 
          base44.entities.VampireCouncil.create({
            council_member_name: m.name,
            position: m.position,
            favor: m.favor,
            can_grant_boons: true
          })
        ));
        queryClient.invalidateQueries(['council']);
      } else if (council.length > 3) {
        const toDelete = council.slice(3);
        await Promise.all(toDelete.map(m => base44.entities.VampireCouncil.delete(m.id).catch(() => {})));
        queryClient.invalidateQueries(['council']);
      }
    };
    
    initCouncil();
  }, [council.length, queryClient]);

  const handleRequestBoon = async (boonType) => {
    setProcessing(true);

    const boons = {
      power: 'They granted you an ancient power technique. Your abilities grow.',
      protection: 'The council offers protection. Hunters will fear their wrath.',
      territory: 'They granted you rights to the downtown district. Expand freely.',
      knowledge: 'Ancient secrets shared. You understand vampirism deeper.'
    };

    setTimeout(async () => {
      const success = selectedMember.favor > 60;
      
      if (success) {
        setOutcome(boons[boonType]);
        
        try {
          await base44.entities.VampireCouncil.update(selectedMember.id, {
            favor: selectedMember.favor - 20,
            last_contacted: new Date().toISOString()
          });
        } catch (e) {
          // Entity might have been cleaned up, refresh list
          queryClient.invalidateQueries(['council']);
        }

        if (boonType === 'power' && vampireState.id) {
          const newPowers = ['Council Blessing', 'Ancient Technique', 'Elder\'s Gift'];
          const randomPower = newPowers[Math.floor(Math.random() * newPowers.length)];
          
          try {
            await base44.entities.VampireState.update(vampireState.id, {
              unlocked_powers: [...(vampireState.unlocked_powers || []), randomPower]
            });
          } catch (e) {
            // State update failed, continue
          }
          }

          await base44.entities.NightLog.create({
          entry: `${selectedMember.council_member_name}: ${boons[boonType]}`,
          category: 'power',
          intensity: 'significant'
          });
          } else {
          setOutcome('They denied your request. Your favor is too low. Earn their respect first.');
          }

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
        setSelectedMember(null);
      }, 4000);
    }, 2000);
  };

  const positionIcons = {
    elder: Crown,
    enforcer: Shield,
    diplomat: MessageCircle,
    archivist: BookOpen
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

        <h2 className="text-2xl font-bold text-white mb-2">The Council</h2>
        <p className="text-gray-400 text-sm mb-6">Ancient vampires who rule from shadows. Respect them. Fear them.</p>

        {!selectedMember ? (
          <div className="space-y-3">
            {council.map(member => {
              const Icon = positionIcons[member.position];
              return (
                <button
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-6 h-6 text-purple-400 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-white font-bold">{member.council_member_name}</h3>
                      <p className="text-gray-400 text-sm capitalize">{member.position}</p>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Favor</span>
                          <span className="text-white">{member.favor}/100</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                          <div
                            style={{ width: `${member.favor}%` }}
                            className="h-1.5 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : outcome ? (
          <div className="text-center py-12">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gray-300 text-lg"
            >
              {outcome}
            </motion.p>
          </div>
        ) : processing ? (
          <div className="text-center py-12">
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-gray-400"
            >
              ...
            </motion.p>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => setSelectedMember(null)}
              className="text-gray-400 hover:text-white text-sm mb-4"
            >
              ← Back
            </button>

            <h3 className="text-white text-xl font-bold mb-4">{selectedMember.council_member_name}</h3>
            <p className="text-gray-400 mb-4">Favor: {selectedMember.favor}/100 {selectedMember.favor < 60 && '(Need 60+ to request boons)'}</p>

            <button
              onClick={() => handleRequestBoon('power')}
              className="w-full bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-xl p-4 text-left transition-colors"
            >
              <Zap className="w-5 h-5 text-purple-400 mb-2" />
              <h4 className="text-white font-medium">Request Power Boon</h4>
              <p className="text-gray-400 text-sm">Learn an ancient technique. Unlock new power.</p>
            </button>

            <button
              onClick={() => handleRequestBoon('protection')}
              className="w-full bg-blue-900/40 hover:bg-blue-900/60 border border-blue-500/30 rounded-xl p-4 text-left transition-colors"
            >
              <Shield className="w-5 h-5 text-blue-400 mb-2" />
              <h4 className="text-white font-medium">Request Protection</h4>
              <p className="text-gray-400 text-sm">Council protection from hunters and rivals.</p>
            </button>

            <button
              onClick={() => handleRequestBoon('territory')}
              className="w-full bg-yellow-900/40 hover:bg-yellow-900/60 border border-yellow-500/30 rounded-xl p-4 text-left transition-colors"
            >
              <Crown className="w-5 h-5 text-yellow-400 mb-2" />
              <h4 className="text-white font-medium">Request Territory Rights</h4>
              <p className="text-gray-400 text-sm">Official claim to new hunting grounds.</p>
            </button>

            <button
              onClick={() => handleRequestBoon('knowledge')}
              className="w-full bg-green-900/40 hover:bg-green-900/60 border border-green-500/30 rounded-xl p-4 text-left transition-colors"
            >
              <BookOpen className="w-5 h-5 text-green-400 mb-2" />
              <h4 className="text-white font-medium">Request Ancient Knowledge</h4>
              <p className="text-gray-400 text-sm">Secrets of the old ones. Wisdom of centuries.</p>
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}