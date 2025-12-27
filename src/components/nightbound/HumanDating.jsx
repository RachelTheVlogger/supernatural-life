import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Heart, MessageCircle, Calendar, AlertTriangle, Flame, TrendingUp, Home } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DatingSexScene from './DatingSexScene';
import ReputationSystem from './ReputationSystem';
import DateAtApartment from './DateAtApartment';

export default function HumanDating({ human, onClose }) {
  const [matches, setMatches] = useState([]);
  const [currentDate, setCurrentDate] = useState(null);
  const [showSexScene, setShowSexScene] = useState(false);
  const [activeDate, setActiveDate] = useState(null);
  const [showReputation, setShowReputation] = useState(false);
  const [showApartmentDate, setShowApartmentDate] = useState(false);
  const [activeTab, setActiveTab] = useState('matches');
  const queryClient = useQueryClient();

  const { data: vampires = [] } = useQuery({
    queryKey: ['vampireState'],
    queryFn: () => base44.entities.VampireState.list()
  });

  const vampire = vampires[0];
  const obsessedWithVampire = vampire && (human.obsession_level || 0) > 50;

  const generateMatch = () => {
    const names = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Sam', 'Blake', 'Charlie', 'Avery'];
    const personalities = ['sweet', 'funny', 'intense', 'chill', 'nerdy', 'adventurous', 'mysterious'];
    
    // Rare chance to meet someone truly special
    const isSpecial = Math.random() > 0.85;
    
    const match = {
      id: Date.now(),
      name: names[Math.floor(Math.random() * names.length)],
      personality: personalities[Math.floor(Math.random() * personalities.length)],
      attraction: isSpecial ? Math.floor(Math.random() * 20) + 75 : Math.floor(Math.random() * 30) + 40,
      connection: isSpecial ? Math.floor(Math.random() * 20) + 75 : Math.floor(Math.random() * 30) + 40,
      trust: isSpecial ? Math.floor(Math.random() * 20) + 60 : Math.floor(Math.random() * 30) + 35,
      loyalty: isSpecial ? Math.floor(Math.random() * 20) + 60 : Math.floor(Math.random() * 30) + 35,
      dates: 0,
      interested: true,
      isSpecial: isSpecial,
      canBreakObsession: isSpecial,
      concernLevel: 0,
      lastDate: null,
      timesInvitedOver: 0
    };
    
    setMatches([...matches, match]);

    if (isSpecial) {
      alert(`You matched with ${match.name}.\n\nSomething about them feels... different.\n\nSpecial.`);
    }
  };

  const goOnDate = async (match) => {
    setCurrentDate(match);
    match.dates += 1;
    match.lastDate = new Date().toISOString();

    // Minimal decay even with obsession
    if (obsessedWithVampire && !match.isSpecial && Math.random() > 0.5) {
      match.trust = Math.max(0, match.trust - 1);
    }

    const outcomes = [];

    if (obsessedWithVampire && !match.isSpecial) {
      outcomes.push(
        {
          text: `Date with ${match.name}.\n\nThey're nice. Attractive. Normal.\n\nBut you can't stop thinking about ${vampire.vampire_name}.\n\nYou're comparing everything. Everyone.\n\n${match.name} notices you're distracted but stays patient.`,
          attractionChange: 5,
          connectionChange: 8,
          trustChange: 5,
          concernGain: 5
        },
        {
          text: `${match.name} made you laugh despite everything.\n\nFor a moment, you forgot about ${vampire.vampire_name}.\n\nJust a moment. But it was nice.\n\nThey held your hand. You didn't pull away.`,
          attractionChange: 12,
          connectionChange: 15,
          trustChange: 10,
          loyaltyChange: 8
        },
        {
          text: `You tried to focus on ${match.name}.\n\nThey're sweet. Understanding. Patient.\n\nMaybe this could work. Maybe you can move on.`,
          attractionChange: 15,
          connectionChange: 18,
          trustChange: 12,
          loyaltyChange: 10
        }
      );
    } else if (obsessedWithVampire && match.isSpecial) {
      // Special person can break through obsession
      outcomes.push(
        {
          text: `Date with ${match.name}.\n\nYou expected to think about ${vampire.vampire_name}.\n\nBut... you didn't.\n\n${match.name} made you laugh. Really laugh.\n\nFor the first time in weeks, you felt... present.\n\nMaybe there's hope.`,
          attractionChange: 25,
          connectionChange: 30,
          trustChange: 20,
          loyaltyChange: 15,
          obsessionReduction: 10
        },
        {
          text: `Something about ${match.name}...\n\nThey kissed you and it felt RIGHT.\n\nNot empty. Not wrong. Real.\n\nYou thought about ${vampire.vampire_name} less tonight.\n\nMaybe... maybe you can move on.`,
          attractionChange: 30,
          connectionChange: 35,
          trustChange: 25,
          loyaltyChange: 20,
          obsessionReduction: 15
        }
      );
    } else {
      outcomes.push(
        {
          text: `Great date with ${match.name}!\n\nYou laughed. Connected. They kissed you goodnight.\n\nIt felt... nice. Real.\n\nMaybe this could be something.`,
          attractionChange: 20,
          connectionChange: 25,
          trustChange: 18,
          loyaltyChange: 15
        },
        {
          text: `${match.name} is amazing.\n\nYou talked for hours. Lost track of time.\n\nThey make you forget about... everything else.\n\nYou want to see them again.`,
          attractionChange: 28,
          connectionChange: 32,
          trustChange: 22,
          loyaltyChange: 18
        },
        {
          text: `Date was good.\n\n${match.name} is nice. Sweet. Attentive.\n\nThe chemistry is building.\n\nYou want to see them again.`,
          attractionChange: 15,
          connectionChange: 15,
          trustChange: 12,
          loyaltyChange: 10
        }
      );
    }

    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    match.attraction = Math.max(0, Math.min(100, match.attraction + outcome.attractionChange));
    match.connection = Math.max(0, Math.min(100, match.connection + outcome.connectionChange));
    match.trust = Math.max(0, Math.min(100, match.trust + (outcome.trustChange || 0)));
    match.loyalty = Math.max(0, Math.min(100, match.loyalty + (outcome.loyaltyChange || 0)));
    match.concernLevel = Math.max(0, Math.min(100, match.concernLevel + (outcome.concernGain || 0)));

    if (match.attraction < 10 || match.connection < 10) {
      match.interested = false;
    }

    // Special person can reduce vampire obsession
    if (outcome.obsessionReduction && vampire) {
      await base44.entities.Human.update(human.id, {
        obsession_level: Math.max(0, (human.obsession_level || 0) - outcome.obsessionReduction)
      });
    }

    await base44.entities.NightLog.create({
      entry: `${human.name} went on date with ${match.name}${obsessedWithVampire ? ` - distracted by thoughts of ${vampire.vampire_name}` : ''}`,
      category: 'interaction',
      intensity: 'moderate'
    });

    if (obsessedWithVampire) {
      await base44.entities.Human.update(human.id, {
        obsession_level: Math.min(100, (human.obsession_level || 0) + 5)
      });
    }

    queryClient.invalidateQueries();
    alert(outcome.text);
    setCurrentDate(null);
    setMatches([...matches]);
  };

  const getRelationshipStage = (match) => {
    const avgScore = (match.attraction + match.connection + match.trust + match.loyalty) / 4;
    if (avgScore >= 80) return { stage: 'Soulmates', color: 'text-pink-400', icon: '💞' };
    if (avgScore >= 65) return { stage: 'In Love', color: 'text-red-400', icon: '❤️' };
    if (avgScore >= 50) return { stage: 'Dating', color: 'text-purple-400', icon: '💕' };
    if (avgScore >= 35) return { stage: 'Romantic Interest', color: 'text-pink-300', icon: '💗' };
    return { stage: 'Getting to Know', color: 'text-gray-400', icon: '💭' };
  };

  const specialMatches = matches.filter(m => (m.attraction + m.connection) / 2 >= 50 && m.interested);

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
        className="bg-gradient-to-br from-pink-900/30 to-red-900/30 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-pink-500/30"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-pink-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Dating</h2>
              <p className="text-gray-400 text-sm">Try to move on... or fail trying</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {obsessedWithVampire && (
          <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-bold">Obsession Warning</h3>
            </div>
            <p className="text-purple-300 text-sm">
              You're obsessed with {vampire.vampire_name}. Dating others will be... difficult.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('relationships')}
            className={`px-4 py-2 font-bold ${activeTab === 'relationships' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400'}`}
          >
            Relationships ({specialMatches.length})
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-4 py-2 font-bold ${activeTab === 'matches' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-400'}`}
          >
            All Matches ({matches.length})
          </button>
        </div>

        {activeTab === 'relationships' ? (
          <>
            <div className="bg-pink-950/40 border border-pink-500/30 rounded-xl p-4 mb-6">
              <h3 className="text-white font-bold mb-2">💞 Your Relationships</h3>
              <p className="text-gray-300 text-sm">People you're close with</p>
            </div>

            {specialMatches.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No close relationships yet</p>
                <button
                  onClick={() => setActiveTab('matches')}
                  className="text-pink-400 hover:text-pink-300"
                >
                  Find someone special →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {specialMatches.map(match => {
                  const relationshipStage = getRelationshipStage(match);
                  return (
                    <div key={match.id} className={`rounded-xl p-5 border-2 ${
                      match.isSpecial ? 'bg-gradient-to-br from-pink-950/60 to-purple-950/60 border-pink-400/50' :
                      'bg-gray-800/50 border-pink-500/40'
                    }`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-white font-bold text-lg flex items-center gap-2">
                            {match.name}
                            {match.isSpecial && <span className="text-yellow-400">✨</span>}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`${relationshipStage.color} text-sm font-bold`}>
                              {relationshipStage.icon} {relationshipStage.stage}
                            </span>
                            <span className="text-gray-500 text-xs">• {match.dates} dates</span>
                          </div>
                          <p className="text-gray-400 text-xs mt-1 capitalize">{match.personality}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Attraction</p>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div style={{ width: `${match.attraction}%` }} className="h-2 bg-pink-500 rounded-full" />
                          </div>
                          <p className="text-white text-xs mt-1">{match.attraction}%</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Connection</p>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div style={{ width: `${match.connection}%` }} className="h-2 bg-red-500 rounded-full" />
                          </div>
                          <p className="text-white text-xs mt-1">{match.connection}%</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Trust</p>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div style={{ width: `${match.trust}%` }} className="h-2 bg-blue-500 rounded-full" />
                          </div>
                          <p className="text-white text-xs mt-1">{match.trust}%</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Loyalty</p>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div style={{ width: `${match.loyalty}%` }} className="h-2 bg-green-500 rounded-full" />
                          </div>
                          <p className="text-white text-xs mt-1">{match.loyalty}%</p>
                        </div>
                      </div>

                      {match.timesInvitedOver > 0 && (
                        <div className="bg-purple-950/40 border border-purple-500/30 rounded-lg p-2 mb-3">
                          <p className="text-purple-300 text-xs text-center">
                            🏠 They've been to your place {match.timesInvitedOver}x
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => goOnDate(match)}
                          className="bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg text-sm font-bold"
                        >
                          Go Out
                        </button>
                        <button
                          onClick={() => {
                            setActiveDate(match);
                            setShowApartmentDate(true);
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1"
                        >
                          <Home className="w-4 h-4" />
                          Invite Over
                        </button>
                      </div>

                      {match.attraction >= 70 && match.connection >= 70 && (
                        <button
                          onClick={() => {
                            setActiveDate(match);
                            setShowSexScene(true);
                          }}
                          className="w-full mt-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1"
                        >
                          <Flame className="w-4 h-4" />
                          Be Intimate
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="bg-pink-950/40 border border-pink-500/30 rounded-xl p-4 mb-6">
              <h3 className="text-white font-bold mb-2">💕 Dating Pool</h3>
              <p className="text-gray-300 text-sm">Maybe you can find someone... normal</p>
            </div>

            <div className="flex gap-3 mb-6">
              <button
                onClick={generateMatch}
                className="flex-1 bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white py-3 rounded-xl font-bold"
              >
                Find Match
              </button>
              <button
                onClick={() => setShowReputation(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
              >
                <TrendingUp className="w-5 h-5" />
                Rep
              </button>
            </div>

            {matches.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No matches yet</p>
            ) : (
              <div className="space-y-3">
                {matches.map(match => (
              <div key={match.id} className={`rounded-xl p-4 border ${
                match.isSpecial ? 'bg-gradient-to-br from-pink-950/60 to-purple-950/60 border-pink-400/50' :
                match.interested ? 'bg-gray-800/50 border-pink-500/30' : 'bg-red-950/40 border-red-500/30'
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-white font-bold flex items-center gap-2">
                      {match.name}
                      {match.isSpecial && <span className="text-yellow-400">✨</span>}
                    </h4>
                    <p className="text-gray-400 text-sm capitalize">{match.personality}</p>
                    {match.isSpecial && (
                      <p className="text-pink-400 text-xs mt-1">Something special about them...</p>
                    )}
                  </div>
                  {!match.interested && <span className="text-red-400 text-xs">Lost interest</span>}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div>
                    <p className="text-gray-400">Attraction</p>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                      <div style={{ width: `${match.attraction}%` }} className="h-2 bg-pink-500 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400">Connection</p>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                      <div style={{ width: `${match.connection}%` }} className="h-2 bg-red-500 rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <p className="text-gray-400">Trust</p>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                      <div style={{ width: `${match.trust}%` }} className="h-2 bg-blue-500 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400">Loyalty</p>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                      <div style={{ width: `${match.loyalty}%` }} className="h-2 bg-green-500 rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between text-xs mb-3">
                  <span className="text-gray-400">Dates: {match.dates}</span>
                  {match.concernLevel > 50 && <span className="text-orange-400">😟 Concerned</span>}
                  {match.timesInvitedOver > 0 && <span className="text-gray-500">Invited {match.timesInvitedOver}x</span>}
                </div>

                {match.interested ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => goOnDate(match)}
                        className="flex-1 bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg text-sm font-bold"
                      >
                        Go On Date
                      </button>
                      {match.trust >= 50 && match.dates >= 1 && (
                        <button
                          onClick={() => {
                            setActiveDate(match);
                            setShowApartmentDate(true);
                          }}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1"
                        >
                          <Home className="w-4 h-4" />
                          Invite Over
                        </button>
                      )}
                    </div>
                    {match.attraction >= 70 && match.connection >= 70 && match.dates >= 1 && (
                      <button
                        onClick={() => {
                          setActiveDate(match);
                          setShowSexScene(true);
                        }}
                        className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1"
                      >
                        <Flame className="w-4 h-4" />
                        Get Intimate
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-red-400 text-sm text-center">They're not interested anymore</p>
                )}
                </div>
              ))}
              </div>
              )}
              </>
              )}
              </motion.div>

              {showSexScene && activeDate && (
        <DatingSexScene
          human={human}
          match={activeDate}
          onClose={(chemistryGain) => {
            setShowSexScene(false);
            if (chemistryGain > 0) {
              const updatedMatch = {
                ...activeDate,
                attraction: Math.min(100, activeDate.attraction + chemistryGain),
                connection: Math.min(100, activeDate.connection + chemistryGain)
              };
              setMatches(matches.map(m => m.id === activeDate.id ? updatedMatch : m));
            }
            setActiveDate(null);
          }}
        />
      )}

      {showReputation && (
        <ReputationSystem
          human={human}
          friends={[]}
          matches={matches}
          onClose={() => setShowReputation(false)}
        />
      )}

      {showApartmentDate && activeDate && (
        <DateAtApartment
          human={human}
          match={activeDate}
          onClose={(gains) => {
            setShowApartmentDate(false);
            if (gains.attractionGain) {
              const updatedMatch = {
                ...activeDate,
                attraction: Math.min(100, activeDate.attraction + (gains.attractionGain || 0)),
                connection: Math.min(100, activeDate.connection + (gains.connectionGain || 0)),
                trust: Math.min(100, activeDate.trust + (gains.trustGain || 0)),
                loyalty: Math.min(100, activeDate.loyalty + (gains.loyaltyGain || 0)),
                timesInvitedOver: (activeDate.timesInvitedOver || 0) + 1
              };
              setMatches(matches.map(m => m.id === activeDate.id ? updatedMatch : m));
            }
            setActiveDate(null);
          }}
        />
      )}
    </motion.div>
  );
}