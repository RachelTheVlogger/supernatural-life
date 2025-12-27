import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, User, Shield, Star, AlertTriangle, Heart, MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function EscortCareer({ human, onClose }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    name: human.name,
    age: 25,
    type: 'full-service',
    rate: 200,
    description: '',
    availability: 'evenings',
    boundaries: []
  });
  const [bookings, setBookings] = useState([]);
  const [currentMeet, setCurrentMeet] = useState(null);
  const [earnings, setEarnings] = useState(0);
  const [reputation, setReputation] = useState(50);
  const [reviews, setReviews] = useState([]);
  const queryClient = useQueryClient();

  const { data: vampires = [] } = useQuery({
    queryKey: ['vampireState'],
    queryFn: () => base44.entities.VampireState.list()
  });

  const vampire = vampires[0];

  const serviceTypes = [
    { value: 'full-service', label: 'Full Service', rate: 200 },
    { value: 'girlfriend', label: 'Girlfriend Experience', rate: 300 },
    { value: 'companionship', label: 'Companionship Only', rate: 150 },
    { value: 'dinner-date', label: 'Dinner Date', rate: 250 },
    { value: 'overnight', label: 'Overnight', rate: 800 }
  ];

  const boundaryOptions = [
    'No kissing',
    'Condoms required',
    'No anal',
    'Outcall only',
    'Incall only',
    'No photos',
    'No rough play',
    'Safe word required'
  ];

  const generateClient = () => {
    const clientTypes = [
      { type: 'businessman', age: '40s', personality: 'polite', danger: 10, tip: 50 },
      { type: 'young guy', age: '20s', personality: 'nervous', danger: 5, tip: 20 },
      { type: 'regular', age: '50s', personality: 'friendly', danger: 0, tip: 80 },
      { type: 'mysterious stranger', age: 'unknown', personality: 'intense', danger: 30, tip: 100 },
      { type: 'college student', age: '20s', personality: 'awkward', danger: 5, tip: 15 }
    ];

    // Vampire client possibility
    if (vampire && Math.random() > 0.7) {
      return {
        id: Date.now(),
        name: vampire.vampire_name,
        type: 'mysterious stranger',
        age: 'ageless',
        personality: 'magnetic',
        danger: 80,
        isVampire: true,
        service: profile.type,
        rate: profile.rate,
        location: 'luxury penthouse',
        time: 'late night'
      };
    }

    const client = clientTypes[Math.floor(Math.random() * clientTypes.length)];
    return {
      id: Date.now(),
      name: `Client #${Math.floor(Math.random() * 999)}`,
      ...client,
      service: profile.type,
      rate: profile.rate,
      location: ['hotel', 'apartment', 'his place', 'your place'][Math.floor(Math.random() * 4)],
      time: ['afternoon', 'evening', 'late night'][Math.floor(Math.random() * 3)]
    };
  };

  const acceptBooking = () => {
    const newClient = generateClient();
    setBookings([...bookings, newClient]);
  };

  const meetClient = (booking) => {
    setCurrentMeet(booking);
  };

  const finishMeet = async (outcome) => {
    const pay = currentMeet.rate + (outcome === 'good' ? currentMeet.tip : outcome === 'bad' ? -50 : 0);
    const safetyRisk = currentMeet.danger;

    let resultText = '';
    let obsessionGain = 5;
    let dangerGain = 0;
    let awarenessGain = 0;

    if (currentMeet.isVampire) {
      if (outcome === 'good') {
        resultText = `The session with ${currentMeet.name} was... intoxicating.\n\nTheir touch was cold. Their gaze hungry.\n\n"You're special," they whispered. "I want to see you again."\n\nThey paid triple. +$${pay * 3}`;
        obsessionGain = 30;
        awarenessGain = 20;
        dangerGain = 15;
        setEarnings(prev => prev + (pay * 3));

        await base44.entities.Human.update(human.id, {
          vampire_encounters: (human.vampire_encounters || 0) + 1,
          romance_with_vampire: vampire.id
        });
      } else {
        resultText = `${currentMeet.name} was... unsettling.\n\nTheir eyes never left yours. Their touch too cold.\n\nYou finished early. They didn't seem disappointed.\n\n"Until next time," they smiled.\n\n+$${pay}`;
        obsessionGain = 15;
        awarenessGain = 25;
        dangerGain = 20;
        setEarnings(prev => prev + pay);
      }
    } else {
      if (outcome === 'good') {
        resultText = `Session went well. ${currentMeet.name} was ${currentMeet.personality}.\n\nProfessional. Safe. Good tipper.\n\n+$${pay}`;
        setEarnings(prev => prev + pay);
        setReputation(prev => Math.min(100, prev + 5));
      } else if (outcome === 'bad') {
        resultText = `Session was rough. ${currentMeet.name} crossed boundaries.\n\nYou had to leave early. Took less pay.\n\n+$${pay}\n\n⚠️ Be careful out there.`;
        setEarnings(prev => prev + pay);
        dangerGain = safetyRisk;
        setReputation(prev => Math.max(0, prev - 5));
      } else {
        resultText = `Average session. ${currentMeet.name} was ${currentMeet.personality}.\n\nNothing special. Got paid.\n\n+$${pay}`;
        setEarnings(prev => prev + pay);
      }
    }

    // Add review
    const review = {
      client: currentMeet.name,
      rating: outcome === 'good' ? 5 : outcome === 'bad' ? 2 : 3,
      comment: outcome === 'good' ? 'Great experience!' : outcome === 'bad' ? 'Rough...' : 'It was fine',
      isVampire: currentMeet.isVampire
    };
    setReviews([review, ...reviews.slice(0, 9)]);

    await base44.entities.Human.update(human.id, {
      obsession_level: Math.min(100, (human.obsession_level || 0) + obsessionGain),
      awareness_level: Math.min(100, (human.awareness_level || 0) + awarenessGain),
      danger_level: Math.min(100, (human.danger_level || 0) + dangerGain)
    });

    await base44.entities.NightLog.create({
      entry: `${human.name} met with ${currentMeet.name} (escort work) - ${resultText}`,
      category: 'interaction',
      intensity: currentMeet.isVampire ? 'significant' : 'moderate'
    });

    queryClient.invalidateQueries();
    setBookings(bookings.filter(b => b.id !== currentMeet.id));
    alert(resultText);
    setCurrentMeet(null);
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
        className="bg-gradient-to-br from-red-900/30 to-pink-900/30 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-red-500/30"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Escort Work</h2>
              <p className="text-gray-400 text-sm">Private companionship services</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-green-950/40 border border-green-500/30 rounded-xl p-3 text-center">
            <DollarSign className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-white font-bold">${earnings}</p>
            <p className="text-gray-400 text-xs">Earned</p>
          </div>
          <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-3 text-center">
            <Star className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-white font-bold">{reputation}/100</p>
            <p className="text-gray-400 text-xs">Reputation</p>
          </div>
          <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-3 text-center">
            <User className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-white font-bold">{bookings.length}</p>
            <p className="text-gray-400 text-xs">Bookings</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {currentMeet ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className={`rounded-xl p-6 border-2 ${
                currentMeet.isVampire ? 'bg-red-950/40 border-red-500/50' : 'bg-purple-950/40 border-purple-500/50'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-white font-bold text-xl">{currentMeet.name}</h3>
                    <p className="text-gray-400 capitalize">{currentMeet.type} • {currentMeet.age}</p>
                  </div>
                  {currentMeet.isVampire && <span className="text-3xl">🦇</span>}
                </div>

                <div className="space-y-2 mb-4 text-sm text-gray-300">
                  <p>📍 Location: {currentMeet.location}</p>
                  <p>🕐 Time: {currentMeet.time}</p>
                  <p>💼 Service: {currentMeet.service}</p>
                  <p className="text-green-400 font-bold">💰 Rate: ${currentMeet.rate}</p>
                </div>

                {currentMeet.isVampire && (
                  <div className="bg-yellow-950/40 border border-yellow-500/30 rounded-lg p-3 mb-4">
                    <p className="text-yellow-300 text-sm">
                      ⚠️ Something feels... different about this client. Their energy is magnetic. Dangerous.
                    </p>
                  </div>
                )}

                {currentMeet.danger > 20 && !currentMeet.isVampire && (
                  <div className="bg-orange-950/40 border border-orange-500/30 rounded-lg p-3 mb-4">
                    <p className="text-orange-300 text-sm">
                      ⚠️ Danger Level: {currentMeet.danger}% - Be cautious
                    </p>
                  </div>
                )}

                <p className="text-white mb-4">How did the session go?</p>
                
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => finishMeet('good')}
                    className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold"
                  >
                    ✓ Good
                  </button>
                  <button
                    onClick={() => finishMeet('okay')}
                    className="bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-bold"
                  >
                    ~ Okay
                  </button>
                  <button
                    onClick={() => finishMeet('bad')}
                    className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold"
                  >
                    ✗ Bad
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <div className="flex gap-2 border-b border-gray-700">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 py-2 ${activeTab === 'profile' ? 'text-red-400 border-b-2 border-red-400' : 'text-gray-400'}`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`px-4 py-2 ${activeTab === 'bookings' ? 'text-red-400 border-b-2 border-red-400' : 'text-gray-400'}`}
                >
                  Bookings ({bookings.length})
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`px-4 py-2 ${activeTab === 'reviews' ? 'text-red-400 border-b-2 border-red-400' : 'text-gray-400'}`}
                >
                  Reviews
                </button>
              </div>

              {activeTab === 'profile' ? (
                <div className="space-y-4">
                  <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-4">
                    <h3 className="text-white font-bold mb-2">💼 Your Escort Profile</h3>
                    <p className="text-gray-300 text-sm">Set your services, rates, and boundaries</p>
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Display Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-red-500/30 focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Service Type</label>
                    <div className="space-y-2">
                      {serviceTypes.map(service => (
                        <button
                          key={service.value}
                          onClick={() => setProfile({ ...profile, type: service.value, rate: service.rate })}
                          className={`w-full text-left p-3 rounded-lg ${
                            profile.type === service.value
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-800 text-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span>{service.label}</span>
                            <span className="text-green-400">${service.rate}/hr</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Your Rate</label>
                    <input
                      type="number"
                      value={profile.rate}
                      onChange={(e) => setProfile({ ...profile, rate: parseInt(e.target.value) })}
                      className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-red-500/30 focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Description</label>
                    <textarea
                      value={profile.description}
                      onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                      rows={3}
                      placeholder="About you, what you offer..."
                      className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-red-500/30 focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Boundaries (select all that apply)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {boundaryOptions.map(boundary => (
                        <button
                          key={boundary}
                          onClick={() => {
                            if (profile.boundaries.includes(boundary)) {
                              setProfile({ ...profile, boundaries: profile.boundaries.filter(b => b !== boundary) });
                            } else {
                              setProfile({ ...profile, boundaries: [...profile.boundaries, boundary] });
                            }
                          }}
                          className={`text-sm py-2 px-3 rounded-lg ${
                            profile.boundaries.includes(boundary)
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-800 text-gray-400'
                          }`}
                        >
                          {boundary}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-yellow-950/40 border border-yellow-500/30 rounded-xl p-3">
                    <p className="text-yellow-300 text-xs text-center flex items-center justify-center gap-2">
                      <Shield className="w-4 h-4" />
                      Always prioritize your safety. Meet in public first, trust your instincts.
                    </p>
                  </div>
                </div>
              ) : activeTab === 'bookings' ? (
                <div className="space-y-4">
                  <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4">
                    <h3 className="text-white font-bold mb-2">📅 Available Bookings</h3>
                    <p className="text-gray-300 text-sm">Accept clients and meet for sessions</p>
                  </div>

                  <button
                    onClick={acceptBooking}
                    className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-4 rounded-xl font-bold"
                  >
                    🔍 Find New Client
                  </button>

                  {bookings.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No active bookings</p>
                  ) : (
                    <div className="space-y-3">
                      {bookings.map(booking => (
                        <div
                          key={booking.id}
                          className={`rounded-xl p-4 border ${
                            booking.isVampire ? 'bg-red-950/40 border-red-500/50' : 'bg-gray-800/50 border-purple-500/30'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="text-white font-bold">{booking.name}</h4>
                              <p className="text-gray-400 text-sm capitalize">{booking.type}</p>
                            </div>
                            {booking.isVampire && <span className="text-2xl">🦇</span>}
                          </div>

                          <div className="space-y-1 text-sm text-gray-300 mb-3">
                            <p>📍 {booking.location}</p>
                            <p>🕐 {booking.time}</p>
                            <p className="text-green-400 font-bold">💰 ${booking.rate}</p>
                          </div>

                          {booking.danger > 20 && (
                            <div className="bg-orange-950/40 border border-orange-500/30 rounded-lg p-2 mb-3">
                              <p className="text-orange-300 text-xs flex items-center gap-2">
                                <AlertTriangle className="w-3 h-3" />
                                Danger: {booking.danger}%
                              </p>
                            </div>
                          )}

                          <button
                            onClick={() => meetClient(booking)}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-bold"
                          >
                            Meet Client
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4">
                    <h3 className="text-white font-bold mb-2">⭐ Client Reviews</h3>
                    <p className="text-gray-300 text-sm">Your reputation matters</p>
                  </div>

                  {reviews.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No reviews yet</p>
                  ) : (
                    <div className="space-y-3">
                      {reviews.map((review, i) => (
                        <div
                          key={i}
                          className={`rounded-xl p-4 ${
                            review.isVampire ? 'bg-red-950/40 border border-red-500/30' : 'bg-gray-800/50 border border-purple-500/30'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-white font-bold">{review.client}</p>
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, j) => (
                                <Star
                                  key={j}
                                  className={`w-4 h-4 ${
                                    j < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-300 text-sm">{review.comment}</p>
                          {review.isVampire && (
                            <p className="text-red-400 text-xs mt-2">🦇 Special client</p>
                          )}
                        </div>
                      ))}
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