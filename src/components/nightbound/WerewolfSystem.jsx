import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Users, Zap, Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const PACKS = ['Moonlight Pack', 'Shadow Fangs', 'Blood Howlers', 'Lone Wolves'];

export default function WerewolfSystem({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [interacting, setInteracting] = useState(null);
  const [outcome, setOutcome] = useState('');

  const { data: werewolves = [] } = useQuery({
    queryKey: ['werewolves'],
    queryFn: () => base44.entities.Werewolf.list()
  });

  const handleEncounter = async () => {
    setInteracting('encounter');
    
    setTimeout(async () => {
      const name = ['Marcus', 'Luna', 'Kai', 'Raven', 'Ash'][Math.floor(Math.random() * 5)];
      const pack = PACKS[Math.floor(Math.random() * PACKS.length)];
      
      await base44.entities.Werewolf.create({
        name: name,
        pack_name: pack,
        rank: ['alpha', 'beta', 'omega'][Math.floor(Math.random() * 3)],
        relationship: Math.floor(Math.random() * 40) - 50,
        transformation_control: Math.floor(Math.random() * 100),
        alliance_status: 'enemy'
      });
      
      setOutcome(`You encountered ${name} from the ${pack}. Werewolf scent. Hostile energy.`);
      
      await base44.entities.NightLog.create({
        entry: `Werewolf encounter: ${name}. The ancient rivalry continues.`,
        category: 'interaction',
        intensity: 'moderate'
      });
      
      queryClient.invalidateQueries();
      setTimeout(() => {
        setInteracting(null);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  const handleInteract = async (werewolf, type) => {
    setInteracting(werewolf.id);
    
    setTimeout(async () => {
      let relationshipChange = 0;
      let newStatus = werewolf.alliance_status;
      let message = '';
      
      if (type === 'fight') {
        const vampireWins = Math.random() > 0.4;
        relationshipChange = vampireWins ? -20 : -30;
        message = vampireWins ? `You overpowered ${werewolf.name}. Vampire superiority proven.` 
                              : `${werewolf.name} nearly killed you. Werewolves are dangerous.`;
      } else if (type === 'negotiate') {
        const success = Math.random() > 0.5;
        relationshipChange = success ? 15 : -5;
        if (success && werewolf.relationship >= 30) {
          newStatus = 'truce';
        }
        message = success ? `Negotiation succeeded. Temporary peace with ${werewolf.name}.`
                         : `${werewolf.name} rejected your offer. The war continues.`;
      } else if (type === 'ally') {
        if (werewolf.relationship >= 50) {
          newStatus = 'ally';
          relationshipChange = 25;
          message = `Alliance formed with ${werewolf.name}. Vampire and werewolf united.`;
        } else {
          relationshipChange = -10;
          message = `${werewolf.name} doesn't trust you enough yet.`;
        }
      }
      
      await base44.entities.Werewolf.update(werewolf.id, {
        relationship: Math.max(-100, Math.min(100, werewolf.relationship + relationshipChange)),
        alliance_status: newStatus,
        knows_about_vampire: true
      });
      
      setOutcome(message);
      
      await base44.entities.NightLog.create({
        entry: message,
        category: 'interaction',
        intensity: type === 'fight' ? 'significant' : 'moderate'
      });
      
      queryClient.invalidateQueries();
      setTimeout(() => {
        setInteracting(null);
        setOutcome('');
      }, 3000);
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
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">🐺 Werewolf Territory</h2>
        <p className="text-gray-400 text-sm mb-6">Ancient enemies. Possible allies.</p>

        <button
          onClick={handleEncounter}
          disabled={interacting}
          className="w-full bg-gradient-to-r from-orange-900/40 to-yellow-900/40 hover:from-orange-900/60 hover:to-yellow-900/60 border-2 border-orange-500/50 rounded-xl p-4 mb-6 transition-all disabled:opacity-50"
        >
          <div className="flex items-center gap-3">
            <Moon className="w-6 h-6 text-orange-400" />
            <div className="text-left">
              <h3 className="text-white font-bold">Encounter Werewolf</h3>
              <p className="text-gray-400 text-sm">Find werewolves in the wild</p>
            </div>
          </div>
        </button>

        {werewolves.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No werewolves encountered yet</p>
        ) : (
          <div className="space-y-3">
            {werewolves.map(werewolf => (
              <div key={werewolf.id} className="bg-gray-800 rounded-xl p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-white font-bold">{werewolf.name}</h3>
                    <p className="text-gray-400 text-sm capitalize">{werewolf.rank} • {werewolf.pack_name}</p>
                    <p className={`text-xs mt-1 capitalize ${
                      werewolf.alliance_status === 'ally' ? 'text-green-400' :
                      werewolf.alliance_status === 'truce' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {werewolf.alliance_status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-purple-400 text-sm">Rel: {werewolf.relationship}</p>
                    <p className="text-gray-500 text-xs">Control: {werewolf.transformation_control}%</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleInteract(werewolf, 'fight')}
                    disabled={interacting}
                    className="flex-1 bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 rounded-lg py-2 text-sm transition-colors disabled:opacity-50"
                  >
                    Fight
                  </button>
                  <button
                    onClick={() => handleInteract(werewolf, 'negotiate')}
                    disabled={interacting}
                    className="flex-1 bg-blue-900/40 hover:bg-blue-900/60 border border-blue-500/30 text-blue-300 rounded-lg py-2 text-sm transition-colors disabled:opacity-50"
                  >
                    Negotiate
                  </button>
                  <button
                    onClick={() => handleInteract(werewolf, 'ally')}
                    disabled={interacting || werewolf.relationship < 50}
                    className="flex-1 bg-green-900/40 hover:bg-green-900/60 border border-green-500/30 text-green-300 rounded-lg py-2 text-sm transition-colors disabled:opacity-50"
                  >
                    Ally
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {outcome && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80"
            >
              <div className="bg-gray-900 rounded-xl p-6 max-w-md text-center border-2 border-orange-500/50">
                <p className="text-white text-lg">{outcome}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}