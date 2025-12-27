import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, DollarSign, Heart, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function ArtCommissions({ human, onClose }) {
  const [activeTab, setActiveTab] = useState('create');
  const [creating, setCreating] = useState(false);
  const [newArt, setNewArt] = useState({ type: 'portrait', title: '', price: 50 });
  const [vampireRequest, setVampireRequest] = useState(null);
  const queryClient = useQueryClient();

  const { data: vampires = [] } = useQuery({
    queryKey: ['vampireState'],
    queryFn: () => base44.entities.VampireState.list()
  });

  const vampire = vampires[0];

  const createArt = async () => {
    if (!newArt.title) return;
    setCreating(true);

    const artTypes = {
      portrait: ['charcoal portrait', 'oil painting', 'digital portrait', 'watercolor face'],
      fantasy: ['dark fantasy scene', 'mythical creature', 'magical landscape', 'ethereal figure'],
      abstract: ['abstract emotions', 'color study', 'expressionist piece', 'surreal vision']
    };

    const typeDesc = artTypes[newArt.type][Math.floor(Math.random() * artTypes[newArt.type].length)];
    const earnings = newArt.price + Math.floor(Math.random() * 30);

    await base44.entities.NightLog.create({
      entry: `${human.name} created art: "${newArt.title}" (${typeDesc}) - earned $${earnings}`,
      category: 'interaction',
      intensity: 'moderate'
    });

    await base44.entities.Human.update(human.id, {
      obsession_level: Math.min(100, (human.obsession_level || 0) + 5)
    });

    queryClient.invalidateQueries();
    setNewArt({ type: 'portrait', title: '', price: 50 });
    setCreating(false);
  };

  const checkCommissions = () => {
    if (!vampire) return;

    const requests = [
      {
        title: 'Paint me in the moonlight',
        desc: `${vampire.vampire_name} wants a portrait of themselves at night. They have an ethereal, dangerous beauty.`,
        pay: 200,
        obsession: 20
      },
      {
        title: 'Our eternal bond',
        desc: `${vampire.vampire_name} wants art of you and them together. Something intimate.`,
        pay: 300,
        obsession: 35
      },
      {
        title: 'My true nature',
        desc: `${vampire.vampire_name} wants you to capture their vampire form. Red eyes, fangs, power.`,
        pay: 250,
        obsession: 30,
        awareness: 40
      }
    ];

    setVampireRequest(requests[Math.floor(Math.random() * requests.length)]);
  };

  const acceptRequest = async () => {
    if (!vampireRequest) return;

    await base44.entities.Human.update(human.id, {
      awareness_level: Math.min(100, (human.awareness_level || 0) + (vampireRequest.awareness || 0)),
      obsession_level: Math.min(100, (human.obsession_level || 0) + vampireRequest.obsession),
      vampire_encounters: (human.vampire_encounters || 0) + 1
    });

    await base44.entities.NightLog.create({
      entry: `${human.name} accepted ${vampire.vampire_name}'s commission: "${vampireRequest.title}". They spent hours studying the vampire's features... (+$${vampireRequest.pay})`,
      category: 'interaction',
      intensity: 'significant'
    });

    queryClient.invalidateQueries();
    setVampireRequest(null);
    alert(`Commission complete! +$${vampireRequest.pay}\n\n"You captured me perfectly..." - ${vampire.vampire_name}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Palette className="w-8 h-8 text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Art Commissions</h2>
              <p className="text-gray-400 text-sm">Create & sell your artwork</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {vampireRequest ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-red-950/40 border-2 border-red-500/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🦇</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{vampireRequest.title}</h3>
                    <p className="text-red-300 text-sm">Commission from {vampire.vampire_name}</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-4">{vampireRequest.desc}</p>
                <div className="flex items-center justify-center gap-4 bg-green-950/40 border border-green-500/30 rounded-lg p-3">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <p className="text-white font-bold">${vampireRequest.pay} payment</p>
                </div>
              </div>

              {vampireRequest.awareness > 0 && (
                <div className="bg-yellow-950/40 border border-yellow-500/30 rounded-xl p-3">
                  <p className="text-yellow-300 text-sm text-center">
                    ⚠️ This commission will reveal supernatural truths (+{vampireRequest.awareness}% awareness)
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setVampireRequest(null)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl"
                >
                  Decline
                </button>
                <button
                  onClick={acceptRequest}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-bold"
                >
                  Accept Commission
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <div className="flex gap-2 border-b border-gray-700">
                <button
                  onClick={() => setActiveTab('create')}
                  className={`px-4 py-2 ${activeTab === 'create' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'}`}
                >
                  Create
                </button>
                <button
                  onClick={() => setActiveTab('commissions')}
                  className={`px-4 py-2 ${activeTab === 'commissions' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'}`}
                >
                  Commissions
                </button>
              </div>

              {activeTab === 'create' ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Art Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['portrait', 'fantasy', 'abstract'].map(type => (
                        <button
                          key={type}
                          onClick={() => setNewArt({ ...newArt, type })}
                          className={`py-2 rounded-lg capitalize ${
                            newArt.type === type
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-800 text-gray-400'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Art title..."
                    value={newArt.title}
                    onChange={(e) => setNewArt({ ...newArt, title: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-purple-500/30 focus:border-purple-500 focus:outline-none"
                  />

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Price: ${newArt.price}</label>
                    <input
                      type="range"
                      min="30"
                      max="200"
                      value={newArt.price}
                      onChange={(e) => setNewArt({ ...newArt, price: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <button
                    onClick={createArt}
                    disabled={!newArt.title || creating}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 text-white py-3 rounded-xl font-bold"
                  >
                    {creating ? 'Creating...' : '🎨 Create Artwork'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4">
                    <h3 className="text-white font-bold mb-2">Commission Info</h3>
                    <div className="space-y-1 text-sm text-gray-300">
                      <p>💰 Average pay: $50-200</p>
                      <p>⏱️ Time: Hours to complete</p>
                      <p>🎨 Types: Portraits, fantasy art, abstract</p>
                    </div>
                  </div>

                  {vampire && (
                    <button
                      onClick={checkCommissions}
                      className="w-full bg-red-950/40 border border-red-500/30 rounded-xl p-4 hover:bg-red-950/60 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <p className="text-white font-bold">🦇 Special Commission Request</p>
                          <p className="text-gray-400 text-sm">A mysterious client wants your art...</p>
                        </div>
                        <Sparkles className="w-6 h-6 text-red-400" />
                      </div>
                    </button>
                  )}

                  {!vampire && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No commission requests yet</p>
                      <p className="text-gray-600 text-sm mt-2">Keep creating art to attract clients</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}