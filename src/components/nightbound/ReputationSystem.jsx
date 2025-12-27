import React from 'react';
import { motion } from 'framer-motion';
import { X, MessageCircle, AlertTriangle, Users } from 'lucide-react';

export default function ReputationSystem({ human, friends, matches, onClose }) {
  const calculateReputation = () => {
    let score = 50; // Base neutral reputation
    
    // Friends who gossip hurt reputation
    const gossipingFriends = friends.filter(f => f.hasGossiped);
    score -= gossipingFriends.length * 15;
    
    // High concern friends affect reputation
    const concernedFriends = friends.filter(f => f.concernLevel > 60);
    score -= concernedFriends.length * 8;
    
    // Dating partners who are concerned
    const concernedMatches = matches.filter(m => m.concernLevel > 60);
    score -= concernedMatches.length * 10;
    
    // Loyal friends boost reputation
    const loyalFriends = friends.filter(f => f.loyalty > 70);
    score += loyalFriends.length * 5;
    
    // Vampire obsession affects how others see you
    const obsessionLevel = human.obsession_level || 0;
    if (obsessionLevel > 80) {
      score -= 20;
    } else if (obsessionLevel > 50) {
      score -= 10;
    }
    
    return Math.max(0, Math.min(100, score));
  };

  const reputation = calculateReputation();
  const gossipingFriends = friends.filter(f => f.hasGossiped);
  const concernedPeople = [...friends, ...matches].filter(p => p.concernLevel > 50);

  const getReputationStatus = () => {
    if (reputation > 75) return { text: 'Well-Liked', color: 'text-green-400', bg: 'bg-green-950/40', border: 'border-green-500/30' };
    if (reputation > 50) return { text: 'Normal', color: 'text-blue-400', bg: 'bg-blue-950/40', border: 'border-blue-500/30' };
    if (reputation > 30) return { text: 'Concerning', color: 'text-orange-400', bg: 'bg-orange-950/40', border: 'border-orange-500/30' };
    return { text: 'Worrying', color: 'text-red-400', bg: 'bg-red-950/40', border: 'border-red-500/30' };
  };

  const status = getReputationStatus();

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
        className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-indigo-500/30"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Social Reputation</h2>
              <p className="text-gray-400 text-sm">How others see you</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reputation Score */}
        <div className={`${status.bg} border ${status.border} rounded-xl p-6 mb-6`}>
          <div className="text-center mb-4">
            <h3 className={`text-3xl font-bold ${status.color} mb-2`}>{reputation}/100</h3>
            <p className={`${status.color} font-medium`}>{status.text}</p>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-4">
            <div
              style={{ width: `${reputation}%` }}
              className={`h-4 rounded-full ${
                reputation > 75 ? 'bg-green-500' :
                reputation > 50 ? 'bg-blue-500' :
                reputation > 30 ? 'bg-orange-500' :
                'bg-red-500'
              }`}
            />
          </div>
        </div>

        {/* Gossip Section */}
        {gossipingFriends.length > 0 && (
          <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="w-5 h-5 text-red-400" />
              <h3 className="text-white font-bold">💬 Active Gossip</h3>
            </div>
            <p className="text-red-300 text-sm mb-3">
              People are talking about your strange behavior...
            </p>
            <div className="space-y-2">
              {gossipingFriends.map(friend => (
                <div key={friend.id} className="bg-red-900/30 rounded-lg p-2">
                  <p className="text-red-400 text-sm">
                    <span className="font-bold">{friend.name}</span> is spreading rumors about your obsession
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Concerned People */}
        {concernedPeople.length > 0 && (
          <div className="bg-orange-950/40 border border-orange-500/30 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <h3 className="text-white font-bold">😟 People Are Worried</h3>
            </div>
            <p className="text-orange-300 text-sm mb-3">
              {concernedPeople.length} {concernedPeople.length === 1 ? 'person is' : 'people are'} concerned about you
            </p>
            <div className="space-y-2">
              {concernedPeople.slice(0, 5).map(person => (
                <div key={person.id} className="bg-orange-900/30 rounded-lg p-2">
                  <p className="text-orange-400 text-sm">
                    <span className="font-bold">{person.name}</span> - Concern level: {person.concernLevel}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reputation Effects */}
        <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4">
          <h3 className="text-white font-bold mb-3">Effects</h3>
          <div className="space-y-2 text-sm">
            {reputation > 75 && (
              <p className="text-green-400">✓ People trust you and enjoy your company</p>
            )}
            {reputation < 40 && (
              <>
                <p className="text-red-400">✗ New relationships will be harder to form</p>
                <p className="text-red-400">✗ People question your behavior</p>
                <p className="text-red-400">✗ Friends may distance themselves</p>
              </>
            )}
            {gossipingFriends.length > 2 && (
              <p className="text-red-400">✗ Rumors are spreading through your social circle</p>
            )}
            {(human.obsession_level || 0) > 70 && (
              <p className="text-orange-400">⚠ Your obsession is becoming noticeable to others</p>
            )}
          </div>
        </div>

        {/* Tips */}
        {reputation < 50 && (
          <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-4 mt-4">
            <h3 className="text-blue-400 font-bold mb-2">How to Improve</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Spend more quality time with friends</li>
              <li>• Be present during social interactions</li>
              <li>• Reduce your vampire obsession</li>
              <li>• Build trust and loyalty with people who care about you</li>
              <li>• Avoid actions that make people gossip</li>
            </ul>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}