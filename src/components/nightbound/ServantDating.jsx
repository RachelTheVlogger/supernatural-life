import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MessageCircle, User, Home } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const MATCH_TYPES = {
  potential_servant: { label: 'Potential Servant', icon: '💜', risk: 'low' },
  feeding_target: { label: 'Feeding Target', icon: '🩸', risk: 'medium' },
  normal_human: { label: 'Normal Person', icon: '💙', risk: 'none' },
  hunter: { label: 'Hunter (Disguised)', icon: '🗡️', risk: 'high' },
  witch: { label: 'Witch', icon: '✨', risk: 'medium' }
};

export default function ServantDating({ servant, vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [swiping, setSwiping] = useState(false);
  const [chatting, setChatting] = useState(null);
  const [meetingUp, setMeetingUp] = useState(false);
  const [outcome, setOutcome] = useState('');

  const { data: matches = [] } = useQuery({
    queryKey: ['dating-matches', servant.id],
    queryFn: () => base44.entities.DatingMatch.filter({ servant_id: servant.id }, '-created_date')
  });

  const activeMatches = matches.filter(m => !m.brought_home);

  const handleSwipe = async () => {
    setSwiping(true);

    const names = ['Alex', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Sam', 'Taylor', 'Dakota'];
    const types = Object.keys(MATCH_TYPES);
    const weights = [40, 20, 30, 5, 5]; // potential servant 40%, feeding 20%, normal 30%, hunter 5%, witch 5%
    
    let rand = Math.random() * 100;
    let matchType = 'normal_human';
    let cumulative = 0;
    for (let i = 0; i < types.length; i++) {
      cumulative += weights[i];
      if (rand < cumulative) {
        matchType = types[i];
        break;
      }
    }

    setTimeout(async () => {
      await base44.entities.DatingMatch.create({
        servant_id: servant.id,
        match_name: names[Math.floor(Math.random() * names.length)],
        match_type: matchType,
        interest_level: Math.floor(Math.random() * 30) + 60
      });

      queryClient.invalidateQueries(['dating-matches']);
      setSwiping(false);
    }, 1500);
  };

  const handleChat = async (match) => {
    setChatting(match);

    const messages = {
      potential_servant: [
        "You're different from everyone else I've met...",
        "I feel like I can tell you anything.",
        "There's something mysterious about you.",
        "I've never felt this drawn to someone before."
      ],
      feeding_target: [
        "Want to meet up tonight? 😏",
        "You look amazing in your photos.",
        "I'm looking for something... intense.",
        "Let's skip the small talk."
      ],
      normal_human: [
        "Hey! How's your day going?",
        "What do you like to do for fun?",
        "Your profile caught my eye!",
        "Want to grab coffee sometime?"
      ],
      hunter: [
        "So what do you do at night?",
        "Do you believe in supernatural things?",
        "I'd love to see where you live.",
        "Tell me about the people you spend time with."
      ],
      witch: [
        "I sense something unique about you.",
        "The energy in your photos is... unusual.",
        "Do you feel it too? This connection?",
        "I know things. About the darkness."
      ]
    };

    setTimeout(async () => {
      const interest = Math.min(100, match.interest_level + Math.floor(Math.random() * 15) + 10);
      
      await base44.entities.DatingMatch.update(match.id, {
        chat_messages: match.chat_messages + 1,
        interest_level: interest
      });

      const msg = messages[match.match_type][Math.floor(Math.random() * messages[match.match_type].length)];
      setOutcome(`${match.match_name}: "${msg}"\n\nInterest: ${interest}%`);

      queryClient.invalidateQueries(['dating-matches']);

      setTimeout(() => {
        setChatting(null);
        setOutcome('');
      }, 2500);
    }, 1000);
  };

  const handleMeetUp = async (match) => {
    if (match.interest_level < 70) {
      alert(`${match.match_name} isn't interested enough yet. Keep chatting!`);
      return;
    }

    setMeetingUp(true);

    setTimeout(async () => {
      await base44.entities.DatingMatch.update(match.id, {
        met_in_person: true
      });

      const outcomes = {
        potential_servant: `${servant.name} brought ${match.match_name} home. They met you. Something clicked. They're curious about your world now.`,
        feeding_target: `${servant.name} brought ${match.match_name} home. You fed on them. They left dazed, confused, with no memory of what happened.`,
        normal_human: `${servant.name} brought ${match.match_name} home for a normal date. They left happy but none the wiser about your secret.`,
        hunter: `${match.match_name} revealed themselves as a hunter! They tried to stake you. Barely escaped. Exposure level increased.`,
        witch: `${match.match_name} is a witch. She sensed your nature immediately. The conversation got... interesting.`
      };

      const result = outcomes[match.match_type];

      if (match.match_type === 'potential_servant') {
        await base44.entities.PotentialServant.create({
          name: match.match_name,
          met_through_servant_id: servant.id,
          personality: 'curious',
          curiosity_level: 60,
          knows_about_vampires: false
        });
      } else if (match.match_type === 'feeding_target') {
        const hungerStates = ['sated', 'calm', 'lingering', 'heightened', 'restless'];
        const currentIndex = hungerStates.indexOf(vampireState.hunger_state);
        const newIndex = Math.max(0, currentIndex - 2);
        
        await base44.entities.VampireState.update(vampireState.id, {
          hunger_state: hungerStates[newIndex],
          last_feed: new Date().toISOString()
        });
      } else if (match.match_type === 'hunter') {
        await base44.entities.VampireState.update(vampireState.id, {
          exposure_level: Math.min(100, (vampireState.exposure_level || 0) + 15)
        });
      } else if (match.match_type === 'witch') {
        const names = match.match_name;
        const specialties = ['elemental', 'psychic', 'necromancy', 'healing', 'dark_magic'];
        
        await base44.entities.Witch.create({
          name: names,
          power_level: Math.floor(Math.random() * 20) + 75,
          specialty: specialties[Math.floor(Math.random() * specialties.length)],
          disposition: 'curious',
          knows_vampire_secret: true
        });
      }

      await base44.entities.DatingMatch.update(match.id, {
        brought_home: true,
        outcome: result
      });

      await base44.entities.NightLog.create({
        entry: result,
        category: 'interaction',
        intensity: match.match_type === 'hunter' ? 'significant' : 'moderate'
      });

      queryClient.invalidateQueries();
      setOutcome(result);

      setTimeout(() => {
        setMeetingUp(false);
        setOutcome('');
      }, 4000);
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
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-8 h-8 text-pink-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Dating App</h2>
            <p className="text-gray-400 text-sm">{servant.name}'s matches</p>
          </div>
        </div>

        {!chatting && !meetingUp && !outcome && (
          <>
            <button
              onClick={handleSwipe}
              disabled={swiping}
              className="w-full bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 disabled:from-gray-700 disabled:to-gray-700 text-white font-medium py-4 rounded-xl mb-6 disabled:opacity-50"
            >
              {swiping ? 'Swiping...' : '💕 Swipe for Matches'}
            </button>

            <div className="space-y-3">
              {activeMatches.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No matches yet. Start swiping!</p>
              ) : (
                activeMatches.map(match => (
                  <div key={match.id} className="bg-gray-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{MATCH_TYPES[match.match_type].icon}</span>
                        <div>
                          <h3 className="text-white font-bold">{match.match_name}</h3>
                          <p className="text-gray-400 text-sm">Interest: {match.interest_level}%</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{match.chat_messages} msgs</span>
                    </div>

                    <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                      <div 
                        style={{ width: `${match.interest_level}%` }} 
                        className="h-2 bg-pink-500 rounded-full" 
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleChat(match)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Chat
                      </button>
                      <button
                        onClick={() => handleMeetUp(match)}
                        disabled={match.interest_level < 70}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Home className="w-4 h-4" />
                        {match.interest_level < 70 ? 'Need 70%' : 'Meet Up'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {(chatting || meetingUp || outcome) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            {chatting && !outcome && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  💬
                </motion.div>
                <p className="text-gray-400">Messaging...</p>
              </>
            )}
            {meetingUp && !outcome && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  🚗
                </motion.div>
                <p className="text-gray-400">Meeting up...</p>
              </>
            )}
            {outcome && (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-gray-800 rounded-xl p-6"
              >
                <p className="text-white text-lg whitespace-pre-line">{outcome}</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}