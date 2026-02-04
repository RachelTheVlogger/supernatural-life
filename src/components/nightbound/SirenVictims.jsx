import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, Trash2, MessageCircle, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function SirenVictims({ siren, onClose }) {
  const queryClient = useQueryClient();
  const [action, setAction] = useState(null);
  const [outcome, setOutcome] = useState('');
  const [selectedFollower, setSelectedFollower] = useState(null);

  const followers = siren.devoted_followers || [];

  const handleLureNew = async () => {
    setAction('luring');

    setTimeout(async () => {
      const names = ['Marcus', 'Sophia', 'Elias', 'Isabella', 'Adrian', 'Luna', 'Theo', 'Maya'];
      const occupations = ['sailor', 'artist', 'poet', 'musician', 'writer', 'wanderer', 'dreamer'];
      
      const name = names[Math.floor(Math.random() * names.length)];
      const occupation = occupations[Math.floor(Math.random() * occupations.length)];

      setOutcome(`Your song reached the shore. ${name} heard it. ${occupation} by trade. They followed your voice. Can't leave now. Won't leave. Devoted. Yours.`);

      const newFollower = {
        name,
        occupation,
        devotion: 80,
        lured_date: new Date().toISOString(),
        tasks_completed: 0,
        intimacy: 0
      };

      await base44.entities.Siren.update(siren.id, {
        devoted_followers: [...followers, newFollower],
        victims_lured: (siren.victims_lured || 0) + 1,
        charm_level: (siren.charm_level || 60) + 2
      });

      await base44.entities.NightLog.create({
        entry: `Lured ${name} to your waters. They're yours now.`,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setAction(null);
        setOutcome('');
      }, 4000);
    }, 2500);
  };

  const handleInteract = async (follower, interactionType) => {
    setAction('interacting');

    setTimeout(async () => {
      const interactions = {
        talk: [
          `${follower.name} tells you about their life on land. You listen. Pretend to care. But really, you just like the sound of their devotion.`,
          `"I'd do anything for you," ${follower.name} says. You know. They're enchanted. Bound to you. It's intoxicating.`,
          `${follower.name} brought you gifts from shore. Trying to please you. They always try. You smile. They beam with joy.`
        ],
        command: [
          `You commanded ${follower.name} to bring you treasure. They obeyed instantly. Returned with pearls. Gold. Anything for you.`,
          `"Sing for me," you ordered. ${follower.name} sang. Badly. But earnestly. Devotion is beautiful, even when the voice isn't.`,
          `You sent ${follower.name} on an errand. They went without question. Came back. Eager for the next task. Perfect servant.`
        ],
        deepen: [
          `You sang to ${follower.name} again. Deepening the enchantment. They're completely yours now. Soul, mind, body. Everything.`,
          `${follower.name} stared into your eyes. Hypnotized further. "I love you," they whispered. The magic talking. Or is it? You don't care.`,
          `You wove stronger magic around ${follower.name}. They'll never leave now. Never want to. Bound forever.`
        ]
      };

      const text = interactions[interactionType][Math.floor(Math.random() * interactions[interactionType].length)];
      setOutcome(text);

      const followerIndex = followers.findIndex(f => f.name === follower.name);
      const updatedFollowers = [...followers];
      
      if (interactionType === 'deepen') {
        updatedFollowers[followerIndex] = {
          ...follower,
          devotion: Math.min(100, follower.devotion + 10),
          intimacy: Math.min(100, (follower.intimacy || 0) + 15)
        };
      } else if (interactionType === 'command') {
        updatedFollowers[followerIndex] = {
          ...follower,
          tasks_completed: (follower.tasks_completed || 0) + 1
        };
      }

      await base44.entities.Siren.update(siren.id, {
        devoted_followers: updatedFollowers
      });

      await base44.entities.NightLog.create({
        entry: text,
        category: 'interaction',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();
      setSelectedFollower(null);

      setTimeout(() => {
        setAction(null);
        setOutcome('');
      }, 4000);
    }, 2000);
  };

  const handleRelease = async (follower) => {
    if (!confirm(`Release ${follower.name} from your enchantment? They'll leave forever.`)) return;

    const updatedFollowers = followers.filter(f => f.name !== follower.name);

    await base44.entities.Siren.update(siren.id, {
      devoted_followers: updatedFollowers
    });

    await base44.entities.NightLog.create({
      entry: `Released ${follower.name}. They're free now. They'll forget you. Eventually.`,
      category: 'interaction',
      intensity: 'moderate'
    });

    queryClient.invalidateQueries();
    setSelectedFollower(null);
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
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-indigo-950 to-purple-950 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-purple-500/50"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Devoted Followers</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {outcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-black/40 rounded-xl p-4 mb-6 border border-purple-500/30"
          >
            <p className="text-purple-100 text-sm leading-relaxed">{outcome}</p>
          </motion.div>
        )}

        {!selectedFollower && (
          <>
            <button
              onClick={handleLureNew}
              disabled={!!action}
              className="w-full bg-gradient-to-r from-pink-900/60 to-purple-900/60 hover:from-pink-900/80 hover:to-purple-900/80 border-2 border-pink-500/50 rounded-xl py-4 px-6 flex items-center gap-3 mb-6 transition-all disabled:opacity-50"
            >
              <Heart className="w-5 h-5 text-pink-400" />
              <div className="text-left">
                <h3 className="text-white font-medium">Lure New Follower</h3>
                <p className="text-pink-300 text-sm">Enchant someone new</p>
              </div>
            </button>

            {followers.length > 0 ? (
              <div>
                <h3 className="text-white font-bold mb-3">Your Enchanted ({followers.length})</h3>
                <div className="space-y-3">
                  {followers.map((f, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedFollower(f)}
                      className="w-full bg-black/40 hover:bg-black/60 rounded-xl p-4 border border-purple-500/30 transition-all text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">{f.name}</h4>
                          <p className="text-gray-400 text-xs capitalize">{f.occupation} • Devotion: {f.devotion}%</p>
                          <p className="text-gray-400 text-xs">Tasks: {f.tasks_completed || 0} • Intimacy: {f.intimacy || 0}%</p>
                        </div>
                        <Heart className="w-5 h-5 text-pink-400" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No followers yet. Sing your song to lure them.</p>
            )}
          </>
        )}

        {selectedFollower && (
          <div>
            <button
              onClick={() => setSelectedFollower(null)}
              className="text-gray-400 hover:text-white mb-4 text-sm"
            >
              ← Back to all followers
            </button>

            <div className="bg-black/40 rounded-xl p-6 border border-purple-500/30 mb-6">
              <h3 className="text-white font-bold text-xl mb-2">{selectedFollower.name}</h3>
              <p className="text-gray-400 text-sm capitalize mb-4">{selectedFollower.occupation}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Devotion:</span>
                  <span className="text-pink-400">{selectedFollower.devotion}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tasks Completed:</span>
                  <span className="text-cyan-400">{selectedFollower.tasks_completed || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Intimacy:</span>
                  <span className="text-purple-400">{selectedFollower.intimacy || 0}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleInteract(selectedFollower, 'talk')}
                disabled={!!action}
                className="w-full bg-blue-900/60 hover:bg-blue-900/80 border border-blue-500/30 rounded-xl py-3 px-4 flex items-center gap-3 transition-all disabled:opacity-50"
              >
                <MessageCircle className="w-5 h-5 text-blue-400" />
                <span className="text-white">Talk with Them</span>
              </button>

              <button
                onClick={() => handleInteract(selectedFollower, 'command')}
                disabled={!!action}
                className="w-full bg-purple-900/60 hover:bg-purple-900/80 border border-purple-500/30 rounded-xl py-3 px-4 flex items-center gap-3 transition-all disabled:opacity-50"
              >
                <Users className="w-5 h-5 text-purple-400" />
                <span className="text-white">Command a Task</span>
              </button>

              <button
                onClick={() => handleInteract(selectedFollower, 'deepen')}
                disabled={!!action}
                className="w-full bg-pink-900/60 hover:bg-pink-900/80 border border-pink-500/30 rounded-xl py-3 px-4 flex items-center gap-3 transition-all disabled:opacity-50"
              >
                <Heart className="w-5 h-5 text-pink-400" />
                <span className="text-white">Deepen Enchantment</span>
              </button>

              <button
                onClick={() => handleRelease(selectedFollower)}
                disabled={!!action}
                className="w-full bg-red-900/60 hover:bg-red-900/80 border border-red-500/30 rounded-xl py-3 px-4 flex items-center gap-3 transition-all disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5 text-red-400" />
                <span className="text-white">Release from Enchantment</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}