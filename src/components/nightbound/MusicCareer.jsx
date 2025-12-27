import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Music, DollarSign, Users, Heart, Flame } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function MusicCareer({ human, onClose }) {
  const [activeTab, setActiveTab] = useState('create');
  const [creating, setCreating] = useState(false);
  const [performing, setPerforming] = useState(false);
  const [newSong, setNewSong] = useState({ title: '', genre: 'pop', vibe: 'upbeat' });
  const [performanceOutcome, setPerformanceOutcome] = useState(null);
  const [vampireEvent, setVampireEvent] = useState(null);
  const queryClient = useQueryClient();

  const { data: vampires = [] } = useQuery({
    queryKey: ['vampireState'],
    queryFn: () => base44.entities.VampireState.list()
  });

  const vampire = vampires[0];

  const createSong = async () => {
    if (!newSong.title) return;
    setCreating(true);

    const earnings = Math.floor(Math.random() * 100) + 50;
    const streams = Math.floor(Math.random() * 5000) + 1000;

    await base44.entities.NightLog.create({
      entry: `${human.name} released "${newSong.title}" (${newSong.genre}) - ${streams} streams, earned $${earnings}`,
      category: 'interaction',
      intensity: 'moderate'
    });

    await base44.entities.Human.update(human.id, {
      obsession_level: Math.min(100, (human.obsession_level || 0) + 3)
    });

    queryClient.invalidateQueries();
    setNewSong({ title: '', genre: 'pop', vibe: 'upbeat' });
    setCreating(false);
  };

  const performLive = async () => {
    setPerforming(true);

    const venues = ['small bar', 'coffee shop', 'club', 'concert hall', 'underground venue'];
    const venue = venues[Math.floor(Math.random() * venues.length)];
    const crowd = Math.floor(Math.random() * 200) + 20;
    const tips = Math.floor(Math.random() * 150) + 50;

    const outcomes = [
      `You performed at a ${venue}. ${crowd} people showed up. The energy was electric. You lost yourself in the music. Earned $${tips} in tips.`,
      `Show at ${venue} went amazing. ${crowd} people singing along. Some recorded it. Posted online. You're gaining followers. +$${tips}`,
      `Performed at ${venue}. ${crowd} in the crowd. Someone in the back watched you the entire set. Never looked away. Intense. Earned $${tips}.`,
      `Show at ${venue} was packed. ${crowd} people. The vibe was dark. Perfect. Some people in the crowd seemed... different. Too perfect. +$${tips}`
    ];

    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];

    // Vampire might attend
    if (vampire && Math.random() > 0.6) {
      setVampireEvent({
        text: `After the show, ${vampire.vampire_name} approached you backstage.\n\n"You have talent," they said. "I've been watching you perform."\n\nTheir presence was magnetic. Dangerous.\n\n"I'd like to support your career. Personally."`,
        pay: 300
      });
    } else {
      setPerformanceOutcome(outcome);
    }

    await base44.entities.Human.update(human.id, {
      awareness_level: Math.min(100, (human.awareness_level || 0) + 5),
      obsession_level: Math.min(100, (human.obsession_level || 0) + 8)
    });

    await base44.entities.NightLog.create({
      entry: `${human.name} performed live: ${outcome}`,
      category: 'interaction',
      intensity: 'moderate'
    });

    queryClient.invalidateQueries();
    setPerforming(false);
  };

  const acceptVampirePatron = async () => {
    await base44.entities.Human.update(human.id, {
      awareness_level: Math.min(100, (human.awareness_level || 0) + 20),
      obsession_level: Math.min(100, (human.obsession_level || 0) + 30),
      vampire_encounters: (human.vampire_encounters || 0) + 1,
      romance_with_vampire: vampire.id
    });

    await base44.entities.NightLog.create({
      entry: `${human.name} accepted ${vampire.vampire_name} as their patron. The vampire will fund their music career... for a price. Their connection deepens.`,
      category: 'interaction',
      intensity: 'significant'
    });

    queryClient.invalidateQueries();
    setVampireEvent(null);
    alert(`${vampire.vampire_name} is now your patron! +$${vampireEvent.pay}\n\n"I'll be at every show," they whispered.`);
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
        className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-indigo-500/30"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Music className="w-8 h-8 text-indigo-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Music Career</h2>
              <p className="text-gray-400 text-sm">Create songs • Perform live</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {vampireEvent ? (
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
                    <h3 className="text-white font-bold text-lg">Vampire Patron Offer</h3>
                    <p className="text-red-300 text-sm">From {vampire.vampire_name}</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-4 whitespace-pre-line">{vampireEvent.text}</p>
                <div className="flex items-center justify-center gap-4 bg-green-950/40 border border-green-500/30 rounded-lg p-3">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <p className="text-white font-bold">${vampireEvent.pay} upfront payment</p>
                </div>
              </div>

              <div className="bg-yellow-950/40 border border-yellow-500/30 rounded-xl p-3">
                <p className="text-yellow-300 text-sm text-center">
                  ⚠️ Accepting means they'll be at every show. Watching. Obsessed with you.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setVampireEvent(null)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl"
                >
                  Decline
                </button>
                <button
                  onClick={acceptVampirePatron}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white py-3 rounded-xl font-bold"
                >
                  Accept Patron
                </button>
              </div>
            </motion.div>
          ) : performanceOutcome ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-6">
                <p className="text-white text-center mb-4">{performanceOutcome}</p>
              </div>
              <button
                onClick={() => setPerformanceOutcome(null)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl"
              >
                Continue
              </button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <div className="flex gap-2 border-b border-gray-700">
                <button
                  onClick={() => setActiveTab('create')}
                  className={`px-4 py-2 ${activeTab === 'create' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}
                >
                  Create
                </button>
                <button
                  onClick={() => setActiveTab('perform')}
                  className={`px-4 py-2 ${activeTab === 'perform' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}
                >
                  Perform
                </button>
              </div>

              {activeTab === 'create' ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Song title..."
                    value={newSong.title}
                    onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-indigo-500/30 focus:border-indigo-500 focus:outline-none"
                  />

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Genre</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['pop', 'rock', 'indie', 'electronic', 'dark', 'alternative'].map(genre => (
                        <button
                          key={genre}
                          onClick={() => setNewSong({ ...newSong, genre })}
                          className={`py-2 rounded-lg capitalize text-sm ${
                            newSong.genre === genre
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-800 text-gray-400'
                          }`}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Vibe</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['upbeat', 'melancholy', 'dark', 'dreamy'].map(vibe => (
                        <button
                          key={vibe}
                          onClick={() => setNewSong({ ...newSong, vibe })}
                          className={`py-2 rounded-lg capitalize ${
                            newSong.vibe === vibe
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-800 text-gray-400'
                          }`}
                        >
                          {vibe}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={createSong}
                    disabled={!newSong.title || creating}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 text-white py-3 rounded-xl font-bold"
                  >
                    {creating ? 'Creating...' : '🎵 Release Song'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4">
                    <h3 className="text-white font-bold mb-2">Live Performances</h3>
                    <div className="space-y-1 text-sm text-gray-300">
                      <p>🎤 Venues: Bars, clubs, concert halls</p>
                      <p>💰 Earnings: $50-200 per show</p>
                      <p>👥 Build your fanbase</p>
                      <p>⚠️ Night shows attract... unusual crowds</p>
                    </div>
                  </div>

                  {vampire && (
                    <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4">
                      <p className="text-purple-300 text-sm text-center">
                        🦇 Vampires are drawn to artists. They might attend your shows...
                      </p>
                    </div>
                  )}

                  <button
                    onClick={performLive}
                    disabled={performing}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 text-white py-4 rounded-xl font-bold"
                  >
                    {performing ? 'Performing...' : '🎸 Perform Live Show'}
                  </button>
                </div>
              )}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}