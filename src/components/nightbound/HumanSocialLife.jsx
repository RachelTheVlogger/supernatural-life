import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users, Heart, MessageCircle, Calendar, Star, Coffee } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function HumanSocialLife({ human, onClose }) {
  const [friends, setFriends] = useState([]);
  const [activeTab, setActiveTab] = useState('friends');
  const queryClient = useQueryClient();

  const generateFriend = () => {
    const names = ['Emma', 'Sarah', 'Jake', 'Alex', 'Morgan', 'Riley', 'Jordan'];
    const personalities = ['supportive', 'party-animal', 'nerdy', 'dramatic', 'chill', 'gossipy'];
    
    const friend = {
      id: Date.now(),
      name: names[Math.floor(Math.random() * names.length)],
      personality: personalities[Math.floor(Math.random() * personalities.length)],
      closeness: Math.floor(Math.random() * 30) + 20,
      trust: Math.floor(Math.random() * 40) + 30,
      knowsSecret: false,
      lastHangout: null
    };
    
    setFriends([...friends, friend]);
  };

  const inviteOver = async (friend) => {
    friend.closeness = Math.min(100, friend.closeness + 15);
    friend.lastHangout = Date.now();

    const outcomes = [
      `${friend.name} came over to your apartment.\n\nYou cooked dinner together. Laughed. Watched movies.\n\nIt felt normal. Safe. Like old times.\n\n+15 closeness`,
      `${friend.name} spent the evening at your place.\n\nYou talked for hours. About life. Dreams. Fears.\n\nThey noticed you seem... different lately.\n\n+15 closeness`,
      `Movie night with ${friend.name}.\n\nPizza. Wine. Comfort.\n\nFor a few hours, you forgot about everything else.\n\n+15 closeness`,
      `${friend.name} came over unexpectedly.\n\n"I was worried about you," they said.\n\nYou talked. Really talked. It helped.\n\n+15 closeness`
    ];

    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];

    await base44.entities.NightLog.create({
      entry: `${human.name} invited ${friend.name} over to their apartment`,
      category: 'interaction',
      intensity: 'subtle'
    });

    await base44.entities.Human.update(human.id, {
      danger_level: Math.max(0, (human.danger_level || 0) - 3)
    });

    queryClient.invalidateQueries();
    alert(outcome);
    setFriends([...friends]);
  };

  const hangOut = async (friend) => {
    const activities = ['coffee', 'movies', 'dinner', 'bar', 'shopping', 'gaming'];
    const activity = activities[Math.floor(Math.random() * activities.length)];
    
    friend.closeness = Math.min(100, friend.closeness + Math.floor(Math.random() * 10) + 5);
    friend.lastHangout = Date.now();
    
    // Chance they notice something's different
    const noticeChance = (human.awareness_level || 0) / 100;
    const noticed = Math.random() < noticeChance * 0.5;
    
    let outcome = `You went ${activity === 'coffee' ? 'for coffee' : activity === 'movies' ? 'to the movies' : `out for ${activity}`} with ${friend.name}.\n\n`;
    
    if (noticed && !friend.knowsSecret) {
      outcome += `${friend.name} noticed you're... different lately.\n\n"Are you okay?" they asked. "You seem distracted."\n\nThey're starting to notice something's off.`;
      friend.trust -= 5;
    } else {
      outcome += `Had a great time. Laughed. Talked. Normal life stuff.\n\nIt felt good to be... normal.`;
    }
    
    outcome += `\n\n+${friend.closeness - Math.floor(friend.closeness * 0.9)} closeness`;
    
    await base44.entities.NightLog.create({
      entry: `${human.name} hung out with friend ${friend.name} - ${activity}`,
      category: 'interaction',
      intensity: 'subtle'
    });
    
    await base44.entities.Human.update(human.id, {
      danger_level: Math.max(0, (human.danger_level || 0) - 2)
    });
    
    queryClient.invalidateQueries();
    alert(outcome);
    setFriends([...friends]);
  };

  const confideIn = async (friend) => {
    if (friend.trust < 70) {
      alert(`${friend.name}'s trust is too low to confide in them.\n\nBuild your friendship more first.`);
      return;
    }
    
    const outcomes = [
      {
        text: `You told ${friend.name} about the... strangeness.\n\nThe things you've seen. The people who aren't people.\n\n"You're scaring me," they said.\n\nBut they listened.`,
        reaction: 'supportive',
        trustChange: 10
      },
      {
        text: `${friend.name} thinks you're losing it.\n\n"You need help," they said. "Professional help."\n\nThey're worried. About you. Your sanity.`,
        reaction: 'concerned',
        trustChange: -15
      },
      {
        text: `"I believe you," ${friend.name} said quietly.\n\n"I've seen things too. Felt things."\n\nYou're not alone.`,
        reaction: 'believer',
        trustChange: 20
      }
    ];
    
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    friend.knowsSecret = true;
    friend.trust = Math.max(0, Math.min(100, friend.trust + outcome.trustChange));
    
    await base44.entities.NightLog.create({
      entry: `${human.name} confided in ${friend.name} about the supernatural - Reaction: ${outcome.reaction}`,
      category: 'interaction',
      intensity: 'moderate'
    });
    
    queryClient.invalidateQueries();
    alert(outcome.text);
    setFriends([...friends]);
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
        className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-blue-500/30"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Social Life</h2>
              <p className="text-gray-400 text-sm">Friends and relationships</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4 mb-6">
          <h3 className="text-white font-bold mb-2">👥 Your Social Circle</h3>
          <p className="text-gray-300 text-sm">Maintain friendships to stay grounded</p>
        </div>

        <button
          onClick={generateFriend}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-bold mb-6"
        >
          Meet New Friend
        </button>

        {friends.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No friends yet</p>
        ) : (
          <div className="space-y-3">
            {friends.map(friend => (
              <div key={friend.id} className="bg-gray-800/50 border border-blue-500/30 rounded-xl p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-white font-bold">{friend.name}</h4>
                    <p className="text-gray-400 text-sm capitalize">{friend.personality}</p>
                  </div>
                  {friend.knowsSecret && <span className="text-purple-400 text-xs">Knows your secret</span>}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <p className="text-gray-400">Closeness</p>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                      <div
                        style={{ width: `${friend.closeness}%` }}
                        className="h-2 bg-blue-500 rounded-full"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400">Trust</p>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                      <div
                        style={{ width: `${friend.trust}%` }}
                        className="h-2 bg-purple-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => hangOut(friend)}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-bold"
                  >
                    Hang Out
                  </button>
                  <button
                    onClick={() => inviteOver(friend)}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-bold"
                  >
                    Invite Over
                  </button>
                  {friend.trust >= 70 && !friend.knowsSecret && (
                    <button
                      onClick={() => confideIn(friend)}
                      className="col-span-2 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-bold"
                    >
                      Confide In
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {showReputation && (
        <ReputationSystem
          human={human}
          friends={friends}
          matches={[]}
          onClose={() => setShowReputation(false)}
        />
      )}
    </motion.div>
  );
}