import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users, Zap, Heart, Swords } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function WolfPackDynamics({ werewolf, onClose }) {
  const queryClient = useQueryClient();
  const [interacting, setInteracting] = useState(false);
  const [outcome, setOutcome] = useState('');

  const { data: packMembers = [] } = useQuery({
    queryKey: ['packMembers'],
    queryFn: async () => {
      try {
        return await base44.entities.PackMember.list();
      } catch (e) {
        return [];
      }
    }
  });

  const myPack = packMembers.filter(m => m.pack_id === werewolf.id);

  const handleCreatePack = async () => {
    setInteracting(true);

    setTimeout(async () => {
      // Generate 3 pack members
      const names = ['Marcus', 'Luna', 'Kai', 'Sage', 'Raven', 'Storm'];
      const roles = ['beta', 'warrior', 'scout'];

      for (let i = 0; i < 3; i++) {
        await base44.entities.PackMember.create({
          pack_id: werewolf.id,
          name: names[Math.floor(Math.random() * names.length)],
          role: roles[i],
          loyalty: Math.floor(Math.random() * 30) + 40,
          strength: Math.floor(Math.random() * 40) + 30,
          relationship: Math.floor(Math.random() * 20) + 20
        });
      }

      await base44.entities.PlayerWerewolf.update(werewolf.id, {
        pack_status: 'alpha'
      });

      await base44.entities.NightLog.create({
        entry: 'You formed a pack. Wolves answered your call. You are Alpha now.',
        category: 'interaction',
        intensity: 'significant'
      });

      setOutcome('Your pack is formed. Three wolves. Loyal. Strong. Yours to command.');
      queryClient.invalidateQueries();

      setTimeout(() => {
        setInteracting(false);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  const handlePackAction = async (action, member = null) => {
    setInteracting(true);

    setTimeout(async () => {
      let result = '';

      switch (action) {
        case 'hunt':
          result = `The pack hunts together. Coordinated. Deadly. You bring down prey as one.`;
          for (const m of myPack) {
            await base44.entities.PackMember.update(m.id, {
              loyalty: Math.min(100, (m.loyalty || 50) + 3)
            });
          }
          break;

        case 'train':
          result = `Training session. The pack grows stronger. Faster. More disciplined.`;
          if (member) {
            await base44.entities.PackMember.update(member.id, {
              strength: Math.min(100, (member.strength || 30) + Math.floor(Math.random() * 10) + 5)
            });
          }
          break;

        case 'challenge':
          if (member) {
            const success = Math.random() > 0.3;
            if (success) {
              result = `${member.name} challenged you. You won. Dominance reasserted. They submit.`;
              await base44.entities.PackMember.update(member.id, {
                loyalty: Math.min(100, (member.loyalty || 50) + 10),
                relationship: Math.max(0, (member.relationship || 50) - 5)
              });
            } else {
              result = `${member.name} challenged you. The fight was close. They respect your strength now.`;
              await base44.entities.PackMember.update(member.id, {
                loyalty: Math.min(100, (member.loyalty || 50) + 5),
                relationship: Math.min(100, (member.relationship || 50) + 5)
              });
            }
          }
          break;

        case 'bond':
          if (member) {
            result = `You and ${member.name} run together. Just the two of you. Trust deepens.`;
            await base44.entities.PackMember.update(member.id, {
              relationship: Math.min(100, (member.relationship || 50) + Math.floor(Math.random() * 10) + 5),
              loyalty: Math.min(100, (member.loyalty || 50) + 5)
            });
          }
          break;

        case 'howl':
          result = `The pack howls together. Ancient song. Primal bond. Unity under the moon.`;
          for (const m of myPack) {
            await base44.entities.PackMember.update(m.id, {
              loyalty: Math.min(100, (m.loyalty || 50) + 5)
            });
          }
          break;
      }

      await base44.entities.NightLog.create({
        entry: result,
        category: 'interaction',
        intensity: 'moderate'
      });

      setOutcome(result);
      queryClient.invalidateQueries();

      setTimeout(() => {
        setInteracting(false);
        setOutcome('');
      }, 3500);
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
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-orange-950 to-amber-950 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative border-2 border-orange-500/50"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Pack Dynamics</h2>
        <p className="text-orange-300 text-sm mb-6">
          {werewolf.pack_status === 'alpha' ? 'Lead your pack. Your wolves. Your family.' : 'Form a pack. Become Alpha.'}
        </p>

        {outcome ? (
          <div className="py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 rounded-xl p-6 border border-orange-500/30"
            >
              <p className="text-orange-100 text-base leading-relaxed">{outcome}</p>
            </motion.div>
          </div>
        ) : interacting ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="text-6xl">🐺</div>
            </motion.div>
          </div>
        ) : myPack.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-300 mb-6">You have no pack. Lone wolf. But that can change.</p>
            <button
              onClick={handleCreatePack}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-xl"
            >
              Form a Pack
            </button>
          </div>
        ) : (
          <div>
            {/* Pack Actions */}
            <div className="space-y-2 mb-6">
              <button
                onClick={() => handlePackAction('hunt')}
                className="w-full bg-orange-900/40 hover:bg-orange-900/60 border border-orange-500/30 rounded-lg p-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="text-white font-medium">Pack Hunt</p>
                    <p className="text-gray-400 text-xs">Hunt together as one</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handlePackAction('howl')}
                className="w-full bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-lg p-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-white font-medium">Howl Together</p>
                    <p className="text-gray-400 text-xs">Strengthen pack bonds</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Pack Members */}
            <h3 className="text-white font-bold mb-3">Your Pack</h3>
            <div className="space-y-3">
              {myPack.map(member => (
                <div key={member.id} className="bg-black/40 rounded-xl p-4 border border-orange-500/30">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-white font-bold">{member.name}</h4>
                      <p className="text-gray-400 text-xs capitalize">{member.role}</p>
                    </div>
                    <span className="text-2xl">🐺</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div>
                      <p className="text-gray-400 text-xs">Loyalty</p>
                      <p className="text-white text-sm font-medium">{member.loyalty}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Strength</p>
                      <p className="text-white text-sm font-medium">{member.strength}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Bond</p>
                      <p className="text-white text-sm font-medium">{member.relationship}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handlePackAction('train', member)}
                      className="bg-blue-900/40 hover:bg-blue-900/60 border border-blue-500/30 rounded-lg py-2 text-xs text-white"
                    >
                      Train
                    </button>
                    <button
                      onClick={() => handlePackAction('bond', member)}
                      className="bg-pink-900/40 hover:bg-pink-900/60 border border-pink-500/30 rounded-lg py-2 text-xs text-white"
                    >
                      Bond
                    </button>
                    <button
                      onClick={() => handlePackAction('challenge', member)}
                      className="bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 rounded-lg py-2 text-xs text-white"
                    >
                      Challenge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}