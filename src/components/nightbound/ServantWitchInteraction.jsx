import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Heart, MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const SPECIALTIES = {
  elemental: { icon: '🌊', name: 'Elemental Magic', color: 'blue' },
  psychic: { icon: '🔮', name: 'Psychic Magic', color: 'purple' },
  necromancy: { icon: '💀', name: 'Necromancy', color: 'green' },
  healing: { icon: '✨', name: 'Healing Magic', color: 'pink' },
  dark_magic: { icon: '🌑', name: 'Dark Magic', color: 'red' }
};

export default function ServantWitchInteraction({ servant, onClose }) {
  const queryClient = useQueryClient();
  const [interacting, setInteracting] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [selectedWitch, setSelectedWitch] = useState(null);

  const { data: witches = [] } = useQuery({
    queryKey: ['witches'],
    queryFn: () => base44.entities.Witch.list('-created_date')
  });

  const handleInteraction = async (action) => {
    if (!selectedWitch) return;
    setInteracting(true);

    const messages = {
      visit: [
        `You visit ${selectedWitch.name}'s shop. Crystals and herbs everywhere.`,
        `${selectedWitch.name} greets you warmly. "Come in, ${servant.name}."`,
        `Her shop smells like incense and old books. Comforting.`
      ],
      chat: [
        `You talk about magic and the supernatural. ${selectedWitch.name} is patient.`,
        `"Being around vampires changes you," she says. You nod.`,
        `Deep conversation. She understands what you're going through.`
      ],
      learn: [
        `${selectedWitch.name} shows you a simple spell. Your fingers tingle.`,
        `"You have potential," she says. "Magic recognizes magic."`,
        `She teaches you protection basics. Just in case.`
      ],
      help: [
        `You help organize her herbs. She appreciates the company.`,
        `${selectedWitch.name} lets you assist with a ritual. You feel the power.`,
        `Working together in the shop. It feels... right.`
      ],
      flirt: [
        `You compliment her magic. ${selectedWitch.name} blushes slightly.`,
        `"Careful," she teases. "I'm not as tame as I look."`,
        `The attraction is there. Witch and vampire's human. Complicated.`
      ],
      confide: [
        `You tell ${selectedWitch.name} about the vampire. She listens.`,
        `"Being bound to darkness... I understand more than you think."`,
        `She shares her own struggles. You're not so different.`
      ],
      ask_protection: [
        `"Protection? From what?" She grows serious.`,
        `${selectedWitch.name} gives you a charmed necklace. "This will help."`,
        `She teaches you a warding spell. "Just in case."`
      ],
      gift: [
        `You bring her rare herbs. Her eyes light up.`,
        `"This is perfect, thank you!" ${selectedWitch.name} beams.`,
        `Your gift impresses her. Relationship deepens.`
      ]
    };

    setTimeout(async () => {
      let relChange = 0;
      let newOutcome = '';

      if (action === 'visit') {
        relChange = 8;
        newOutcome = messages.visit[Math.floor(Math.random() * messages.visit.length)];
      } else if (action === 'chat') {
        relChange = 12;
        newOutcome = messages.chat[Math.floor(Math.random() * messages.chat.length)];
      } else if (action === 'learn') {
        if (selectedWitch.relationship < 30) {
          newOutcome = `${selectedWitch.name} shakes her head. "Not yet. Prove yourself first."`;
        } else {
          relChange = 20;
          newOutcome = messages.learn[Math.floor(Math.random() * messages.learn.length)];
        }
      } else if (action === 'help') {
        relChange = 15;
        newOutcome = messages.help[Math.floor(Math.random() * messages.help.length)];
      } else if (action === 'flirt') {
        if (selectedWitch.relationship < 20) {
          relChange = -5;
          newOutcome = `${selectedWitch.name} seems uncomfortable. Too soon.`;
        } else {
          relChange = 10;
          newOutcome = messages.flirt[Math.floor(Math.random() * messages.flirt.length)];
        }
      } else if (action === 'confide') {
        relChange = 18;
        newOutcome = messages.confide[Math.floor(Math.random() * messages.confide.length)];
      } else if (action === 'ask_protection') {
        relChange = 10;
        newOutcome = messages.ask_protection[Math.floor(Math.random() * messages.ask_protection.length)];
      } else if (action === 'gift') {
        relChange = 15;
        newOutcome = messages.gift[Math.floor(Math.random() * messages.gift.length)];
      }

      await base44.entities.Witch.update(selectedWitch.id, {
        relationship: Math.max(-100, Math.min(100, selectedWitch.relationship + relChange)),
        last_encounter: new Date().toISOString()
      });

      const servantRelBonus = Math.floor(Math.random() * 5) + 3;
      await base44.entities.Servant.update(servant.id, {
        relationship: Math.min(100, (servant.relationship || 0) + servantRelBonus)
      });

      await base44.entities.NightLog.create({
        entry: `${servant.name} visited ${selectedWitch.name}. ${newOutcome}`,
        category: 'interaction',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();
      setOutcome(newOutcome);

      setTimeout(() => {
        setInteracting(false);
        setOutcome('');
        setSelectedWitch(null);
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
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-8 h-8 text-purple-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Visit Witches</h2>
            <p className="text-gray-400 text-sm">As {servant.name}</p>
          </div>
        </div>

        {!selectedWitch && !interacting && (
          <>
            {witches.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">No witches encountered yet.</p>
                <p className="text-gray-500 text-sm">The vampire needs to meet witches first.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {witches.map(witch => (
                  <div key={witch.id} className="bg-gray-800 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-white font-bold text-lg">{witch.name}</h3>
                        <p className="text-gray-400 text-sm">{SPECIALTIES[witch.specialty].name}</p>
                      </div>
                      <span className="text-3xl">{SPECIALTIES[witch.specialty].icon}</span>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Relationship</span>
                        <span className="text-white">{witch.relationship}/100</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          style={{ width: `${Math.max(0, (witch.relationship + 100) / 2)}%` }} 
                          className={`h-2 rounded-full ${
                            witch.relationship > 50 ? 'bg-green-500' :
                            witch.relationship > 0 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`} 
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedWitch(witch)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg"
                    >
                      Visit {witch.name}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {selectedWitch && !interacting && !outcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="bg-gray-800 rounded-xl p-6 text-center mb-4">
              <span className="text-6xl mb-4 block">{SPECIALTIES[selectedWitch.specialty].icon}</span>
              <h3 className="text-white text-2xl font-bold mb-2">{selectedWitch.name}</h3>
              <p className="text-gray-400 text-sm capitalize">{selectedWitch.disposition}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleInteraction('visit')}
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm"
              >
                Visit Shop
              </button>
              <button
                onClick={() => handleInteraction('chat')}
                className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-sm"
              >
                Chat
              </button>
              <button
                onClick={() => handleInteraction('help')}
                className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-sm"
              >
                Offer Help
              </button>
              <button
                onClick={() => handleInteraction('confide')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm"
              >
                Confide
              </button>
              {selectedWitch.relationship >= 20 && (
                <button
                  onClick={() => handleInteraction('flirt')}
                  className="bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-xl text-sm"
                >
                  Flirt
                </button>
              )}
              {selectedWitch.relationship >= 30 && (
                <button
                  onClick={() => handleInteraction('learn')}
                  className="bg-purple-700 hover:bg-purple-800 text-white py-3 rounded-xl text-sm"
                >
                  Learn Magic
                </button>
              )}
              <button
                onClick={() => handleInteraction('gift')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-xl text-sm"
              >
                Bring Gift
              </button>
              <button
                onClick={() => handleInteraction('ask_protection')}
                className="bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl text-sm"
              >
                Ask Protection
              </button>
            </div>

            <button
              onClick={() => setSelectedWitch(null)}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg"
            >
              Back
            </button>
          </motion.div>
        )}

        {(interacting || outcome) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            {interacting && (
              <>
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="text-6xl mb-4"
                >
                  ✨
                </motion.div>
                <p className="text-gray-400">Interacting...</p>
              </>
            )}
            {outcome && (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
              >
                <p className="text-white text-lg">{outcome}</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}