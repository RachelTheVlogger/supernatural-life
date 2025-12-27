import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users, Heart, MessageCircle, Calendar, Star, Coffee, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import ReputationSystem from './ReputationSystem';

export default function HumanSocialLife({ human, onClose }) {
  const [friends, setFriends] = useState([]);
  const [activeTab, setActiveTab] = useState('friends');
  const [showReputation, setShowReputation] = useState(false);
  const queryClient = useQueryClient();

  const generateFriend = () => {
    const names = ['Emma', 'Sarah', 'Jake', 'Alex', 'Morgan', 'Riley', 'Jordan', 'Taylor', 'Casey', 'Blake'];
    const personalities = ['supportive', 'party-animal', 'nerdy', 'dramatic', 'chill', 'gossipy', 'loyal', 'protective'];
    
    const friend = {
      id: Date.now(),
      name: names[Math.floor(Math.random() * names.length)],
      personality: personalities[Math.floor(Math.random() * personalities.length)],
      closeness: Math.floor(Math.random() * 30) + 20,
      trust: Math.floor(Math.random() * 40) + 30,
      loyalty: Math.floor(Math.random() * 40) + 30,
      knowsSecret: false,
      lastHangout: null,
      timesInvitedOver: 0,
      concernLevel: 0,
      hasGossiped: false
    };
    
    setFriends([...friends, friend]);
  };

  const inviteOver = async (friend) => {
    const obsessionLevel = human.obsession_level || 0;
    friend.timesInvitedOver += 1;
    friend.lastHangout = Date.now();

    const outcomes = [];

    if (friend.trust < 40) {
      outcomes.push({
        text: `${friend.name} came over but seemed uncomfortable.\n\n"Nice place," they said, but left early.\n\nThey don't trust you enough yet.`,
        closenessChange: 5,
        trustChange: 2
      });
    } else if (friend.closeness > 60 && friend.trust > 60) {
      outcomes.push(
        {
          text: `${friend.name} came over. You cooked together, watched movies.\n\nIt felt... normal. Like before.\n\n"I've missed this," they said.\n\nYou have too.`,
          closenessChange: 15,
          trustChange: 10,
          loyaltyChange: 8
        },
        {
          text: `Great night with ${friend.name}.\n\nYou laughed at old memories, talked about life.\n\nThey noticed something though. Photos on your wall.\n\n"Who's that?" they asked.\n\nYou changed the subject.`,
          closenessChange: 10,
          trustChange: -5,
          concernGain: 10
        }
      );
    } else {
      outcomes.push({
        text: `${friend.name} came over. You watched TV, ordered food.\n\nNice evening. Simple.\n\nThey're comfortable here now.`,
        closenessChange: 10,
        trustChange: 5,
        loyaltyChange: 3
      });
    }

    if (obsessionLevel > 70 && friend.timesInvitedOver > 2) {
      outcomes.push({
        text: `${friend.name} came over.\n\nSaw your obsession wall. Photos. Notes. Research.\n\n"What the FUCK is this?" they demanded.\n\nYou tried to explain. Couldn't.\n\nThey left. Fast.`,
        closenessChange: -30,
        trustChange: -40,
        loyaltyChange: -20,
        concernGain: 50,
        willGossip: friend.personality === 'gossipy'
      });
    }

    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    friend.closeness = Math.max(0, Math.min(100, friend.closeness + (outcome.closenessChange || 0)));
    friend.trust = Math.max(0, Math.min(100, friend.trust + (outcome.trustChange || 0)));
    friend.loyalty = Math.max(0, Math.min(100, friend.loyalty + (outcome.loyaltyChange || 0)));
    friend.concernLevel = Math.max(0, Math.min(100, friend.concernLevel + (outcome.concernGain || 0)));

    if (outcome.willGossip) {
      friend.hasGossiped = true;
    }

    await base44.entities.NightLog.create({
      entry: `${human.name} invited ${friend.name} over - ${outcome.text.split('\n')[0]}`,
      category: 'interaction',
      intensity: outcome.closenessChange < -20 ? 'significant' : 'subtle'
    });

    await base44.entities.Human.update(human.id, {
      danger_level: Math.max(0, (human.danger_level || 0) - 3)
    });

    queryClient.invalidateQueries();
    alert(outcome.text);
    setFriends([...friends]);
  };

  const hangOut = async (friend) => {
    const obsessionLevel = human.obsession_level || 0;
    const daysSinceLastHangout = friend.lastHangout ? Math.floor((Date.now() - friend.lastHangout) / (1000 * 60 * 60 * 24)) : 999;
    friend.lastHangout = Date.now();

    // Relationship decay if too long since last hangout
    if (daysSinceLastHangout > 14) {
      friend.closeness = Math.max(0, friend.closeness - 5);
      friend.trust = Math.max(0, friend.trust - 3);
    }

    const outcomes = [];

    if (obsessionLevel > 60) {
      outcomes.push(
        {
          text: `You hung out with ${friend.name}.\n\nBut you were distracted. Distant.\n\nThey noticed. "Are you okay? You've been... different lately."\n\nYou lied. Said you're fine.\n\nThey don't believe you.`,
          closenessChange: -10,
          trustChange: -8,
          concernGain: 15
        },
        {
          text: `${friend.name} tried to talk to you.\n\nBut you kept checking your phone. Looking around.\n\n"Who are you looking for?" they asked.\n\nYou couldn't answer.\n\nThey're worried about you.`,
          closenessChange: -15,
          trustChange: -10,
          concernGain: 20
        }
      );
    } else {
      outcomes.push(
        {
          text: `Great time with ${friend.name}!\n\nYou laughed. Talked. Felt normal.\n\nMaybe things can be okay.`,
          closenessChange: 15,
          trustChange: 10,
          loyaltyChange: 5
        },
        {
          text: `${friend.name} is a good friend.\n\nYou needed this. Normal human connection.\n\nIt helped. A little.`,
          closenessChange: 10,
          trustChange: 8,
          loyaltyChange: 3
        }
      );
    }

    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    friend.closeness = Math.max(0, Math.min(100, friend.closeness + (outcome.closenessChange || 0)));
    friend.trust = Math.max(0, Math.min(100, friend.trust + (outcome.trustChange || 0)));
    friend.loyalty = Math.max(0, Math.min(100, friend.loyalty + (outcome.loyaltyChange || 0)));
    friend.concernLevel = Math.max(0, Math.min(100, friend.concernLevel + (outcome.concernGain || 0)));

    // Gossipy friends might spread word about your behavior
    if (friend.personality === 'gossipy' && obsessionLevel > 50) {
      friend.hasGossiped = true;
    }

    await base44.entities.NightLog.create({
      entry: `${human.name} hung out with ${friend.name}${obsessionLevel > 60 ? ' - distracted and distant' : ' - had a good time'}`,
      category: 'interaction',
      intensity: 'subtle'
    });

    await base44.entities.Human.update(human.id, {
      danger_level: Math.max(0, (human.danger_level || 0) - 2)
    });

    queryClient.invalidateQueries();
    alert(outcome.text);
    setFriends([...friends]);
  };

  const confideIn = async (friend) => {
    const obsessionLevel = human.obsession_level || 0;

    if (friend.trust < 40) {
      alert(`${friend.name}'s trust is too low to confide in them.\n\nBuild your friendship more first.`);
      return;
    }

    if (obsessionLevel < 30) {
      alert(`You don't really have anything heavy to confide in ${friend.name} about.`);
      return;
    }

    const outcomes = [
      {
        text: `You confided in ${friend.name} about your... feelings.\n\n"I can't stop thinking about someone," you admitted.\n\n${friend.name} listened. Worried.\n\n"That doesn't sound healthy," they said gently.\n\nBut they don't understand. They CAN'T understand.`,
        closenessChange: 10,
        trustChange: 15,
        loyaltyChange: 5,
        knowsPartial: true
      },
      {
        text: `You told ${friend.name} about your obsession.\n\nNot everything. Not the vampire part.\n\nJust... how you can't stop thinking about them.\n\n"You need help," ${friend.name} said.\n\nYou don't want help. You want them.`,
        closenessChange: 5,
        trustChange: 8,
        knowsPartial: true
      }
    ];

    if (obsessionLevel > 70 && friend.closeness > 60 && friend.trust > 60) {
      outcomes.push({
        text: `You told ${friend.name} EVERYTHING.\n\nThe obsession. The stalking. The fantasies.\n\nThey looked horrified. Scared.\n\n"You need to stay away from them," they begged.\n\nBut you can't. You won't.`,
        closenessChange: -20,
        trustChange: -30,
        loyaltyChange: friend.personality === 'loyal' ? 10 : -20,
        knowsSecret: true,
        willGossip: friend.personality === 'gossipy',
        concernGain: 40
      });
    }

    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    friend.closeness = Math.max(0, Math.min(100, friend.closeness + (outcome.closenessChange || 0)));
    friend.trust = Math.max(0, Math.min(100, friend.trust + (outcome.trustChange || 0)));
    friend.loyalty = Math.max(0, Math.min(100, friend.loyalty + (outcome.loyaltyChange || 0)));
    friend.concernLevel = Math.max(0, Math.min(100, friend.concernLevel + (outcome.concernGain || 0)));
    
    if (outcome.knowsSecret) {
      friend.knowsSecret = true;
    }

    if (outcome.willGossip) {
      friend.hasGossiped = true;
    }

    await base44.entities.NightLog.create({
      entry: `${human.name} confided in ${friend.name} about their obsession${outcome.knowsSecret ? ' - told them everything' : ' - partial truth'}`,
      category: 'interaction',
      intensity: outcome.knowsSecret ? 'significant' : 'moderate'
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

        <div className="flex gap-3 mb-6">
          <button
            onClick={generateFriend}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-bold"
          >
            Meet New Friend
          </button>
          <button
            onClick={() => setShowReputation(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
          >
            <TrendingUp className="w-5 h-5" />
            Rep
          </button>
        </div>

        {friends.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No friends yet</p>
        ) : (
          <div className="space-y-3">
            {friends.map(friend => (
              <div key={friend.id} className={`border rounded-xl p-4 ${
                friend.hasGossiped ? 'bg-red-950/40 border-red-500/30' :
                friend.concernLevel > 60 ? 'bg-orange-950/40 border-orange-500/30' :
                'bg-gray-800/50 border-blue-500/30'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-white font-bold">{friend.name}</h4>
                    <p className="text-gray-400 text-sm capitalize">{friend.personality}</p>
                  </div>
                  <div className="text-right">
                    {friend.hasGossiped && <span className="text-red-400 text-xs block">💬 Gossiping</span>}
                    {friend.concernLevel > 70 && <span className="text-orange-400 text-xs block">😟 Very Concerned</span>}
                    {friend.knowsSecret && <span className="text-purple-400 text-xs block">Knows secret</span>}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-2 text-xs">
                  <div>
                    <p className="text-gray-400">Close</p>
                    <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                      <div style={{ width: `${friend.closeness}%` }} className="h-1.5 bg-blue-500 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400">Trust</p>
                    <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                      <div style={{ width: `${friend.trust}%` }} className="h-1.5 bg-purple-500 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400">Loyal</p>
                    <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                      <div style={{ width: `${friend.loyalty}%` }} className="h-1.5 bg-green-500 rounded-full" />
                    </div>
                  </div>
                </div>

                {friend.timesInvitedOver > 0 && (
                  <p className="text-gray-500 text-xs mb-2">Invited over {friend.timesInvitedOver}x</p>
                )}

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => hangOut(friend)}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs"
                  >
                    Hang Out
                  </button>
                  <button
                    onClick={() => inviteOver(friend)}
                    disabled={friend.trust < 30}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 text-white py-2 rounded-lg text-xs"
                  >
                    Invite
                  </button>
                  <button
                    onClick={() => confideIn(friend)}
                    disabled={friend.trust < 40}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white py-2 rounded-lg text-xs"
                  >
                    Confide
                  </button>
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