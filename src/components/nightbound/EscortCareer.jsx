import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, User, Shield, Star, AlertTriangle, Heart, MessageCircle, Phone, MapPin, CheckCircle, XCircle, Activity, Building } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import EscortExpanded from './EscortExpanded';
import HealthCheckup from './HealthCheckup';

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
  const [vettingClient, setVettingClient] = useState(null);
  const [emergencyContact, setEmergencyContact] = useState('');
  const [safetyTimer, setSafetyTimer] = useState(null);
  const [dangerousEncounter, setDangerousEncounter] = useState(null);
  const [blockedClients, setBlockedClients] = useState([]);
  const [showExpanded, setShowExpanded] = useState(false);
  const [showHealth, setShowHealth] = useState(false);
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

  const locationRisks = {
    'hotel': { risk: 10, safety: 'Public building, cameras, staff' },
    'apartment': { risk: 20, safety: 'Residential, some neighbors' },
    'his place': { risk: 40, safety: 'Unknown territory, isolated' },
    'your place': { risk: 15, safety: 'Your space, you control it' },
    'luxury penthouse': { risk: 25, safety: 'High security building' },
    'industrial area': { risk: 70, safety: 'Isolated, no witnesses' },
    'abandoned building': { risk: 90, safety: 'EXTREME DANGER' },
    'vehicle': { risk: 50, safety: 'Mobile, hard to escape' }
  };

  const generateClient = () => {
    // Reputation affects client quality
    const qualityBonus = reputation / 100;
    
    const clientTypes = [
      { type: 'businessman', age: '40s', personality: 'polite', danger: 10, tip: 50, verified: true },
      { type: 'young guy', age: '20s', personality: 'nervous', danger: 5, tip: 20, verified: true },
      { type: 'regular', age: '50s', personality: 'friendly', danger: 0, tip: 80, verified: true, reviews: 15 },
      { type: 'mysterious stranger', age: 'unknown', personality: 'intense', danger: 30, tip: 100, verified: false },
      { type: 'college student', age: '20s', personality: 'awkward', danger: 5, tip: 15, verified: false },
      { type: 'wealthy client', age: '30s', personality: 'demanding', danger: 15, tip: 150, verified: true },
      { type: 'first timer', age: '20s', personality: 'shy', danger: 8, tip: 25, verified: false }
    ];

    // Low reputation = more dangerous clients
    if (reputation < 30) {
      clientTypes.push(
        { type: 'sketchy guy', age: '30s', personality: 'aggressive', danger: 60, tip: 30, verified: false },
        { type: 'creep', age: '40s', personality: 'boundary-pusher', danger: 55, tip: 20, verified: false }
      );
    }

    // High reputation = better clients
    if (reputation > 70) {
      clientTypes.push(
        { type: 'celebrity', age: '30s', personality: 'charming', danger: 5, tip: 300, verified: true, reviews: 25 },
        { type: 'executive', age: '50s', personality: 'respectful', danger: 0, tip: 200, verified: true, reviews: 40 }
      );
    }

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
    const locations = Object.keys(locationRisks);
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    return {
      id: Date.now(),
      name: client.verified ? `${['John', 'Mike', 'David', 'Alex', 'Chris'][Math.floor(Math.random() * 5)]}` : `Client #${Math.floor(Math.random() * 999)}`,
      ...client,
      service: profile.type,
      rate: profile.rate * (1 + qualityBonus),
      location,
      locationRisk: locationRisks[location].risk,
      locationSafety: locationRisks[location].safety,
      time: ['afternoon', 'evening', 'late night'][Math.floor(Math.random() * 3)],
      messages: []
    };
  };

  const vetClient = async (client) => {
    setVettingClient(client);
    
    // Simulate background check
    setTimeout(() => {
      const redFlags = [];
      
      if (!client.verified) redFlags.push('No verified ID');
      if (client.danger > 40) redFlags.push('Concerning behavior patterns');
      if (client.locationRisk > 50) redFlags.push('High-risk location');
      if (client.reviews === 0) redFlags.push('No review history');
      
      setVettingClient({ ...client, redFlags, vetted: true });
    }, 1500);
  };

  const acceptBooking = () => {
    const newClient = generateClient();
    vetClient(newClient);
  };

  const confirmBooking = (client, accept) => {
    if (accept) {
      setBookings([...bookings, client]);
    }
    setVettingClient(null);
  };

  const blockClient = (clientId) => {
    setBlockedClients([...blockedClients, clientId]);
    setBookings(bookings.filter(b => b.id !== clientId));
  };

  const meetClient = (booking) => {
    setCurrentMeet(booking);
    
    // Start safety timer (2 hour default)
    setSafetyTimer(120);
    
    // Check for dangerous situation
    const totalRisk = booking.danger + booking.locationRisk;
    if (totalRisk > 70 && Math.random() > 0.5) {
      setTimeout(() => {
        triggerDangerousEncounter(booking);
      }, 3000);
    }
  };

  const triggerDangerousEncounter = (booking) => {
    const encounters = [
      {
        type: 'boundary_violation',
        text: `${booking.name} is pushing your boundaries.\n\nThey're getting aggressive. Not listening.\n\nWhat do you do?`,
        options: [
          { label: 'End session immediately', safe: true, pay: 0.3 },
          { label: 'Try to de-escalate', safe: false, pay: 0.7 },
          { label: 'Use panic button', safe: true, pay: 0 }
        ]
      },
      {
        type: 'location_trap',
        text: `The ${booking.location} feels wrong.\n\nDoor locked. Windows barred.\n\n${booking.name} is smiling.\n\n"Just us now."\n\nWhat do you do?`,
        options: [
          { label: 'Demand to leave NOW', safe: true, pay: 0 },
          { label: 'Try to talk your way out', safe: false, pay: 0.5 },
          { label: 'Call emergency contact', safe: true, pay: 0 }
        ]
      },
      {
        type: 'drugging_attempt',
        text: `${booking.name} offers you a drink.\n\nSomething feels off about it.\n\nThey're insistent. "Just one drink."\n\nWhat do you do?`,
        options: [
          { label: 'Refuse and leave', safe: true, pay: 0.2 },
          { label: 'Pretend to drink', safe: true, pay: 0.8 },
          { label: 'Accept the drink', safe: false, pay: 1 }
        ]
      },
      {
        type: 'multiple_people',
        text: `You arrive. ${booking.name} is there.\n\nSo are three others.\n\n"Hope you don't mind," they say.\n\nThis wasn't the arrangement.\n\nWhat do you do?`,
        options: [
          { label: 'Leave immediately', safe: true, pay: 0 },
          { label: 'Negotiate higher rate', safe: false, pay: 3 },
          { label: 'Call for backup', safe: true, pay: 0 }
        ]
      }
    ];

    setDangerousEncounter({
      ...encounters[Math.floor(Math.random() * encounters.length)],
      client: booking
    });
  };

  const handleDangerChoice = async (choice) => {
    const encounter = dangerousEncounter;
    const pay = Math.floor(currentMeet.rate * choice.pay);
    
    let resultText = '';
    let dangerGain = 0;
    let reputationChange = 0;

    if (choice.safe) {
      resultText = `You made the safe choice.\n\n${choice.label}.\n\nYou got out. ${pay > 0 ? `+$${pay}` : 'No pay, but you\'re safe.'}\n\n✓ Trust your instincts.`;
      reputationChange = 5;
      dangerGain = 0;
    } else {
      resultText = `You took the risk.\n\n${choice.label}.\n\nIt worked out... this time. +$${pay}\n\n⚠️ That could have gone very wrong.`;
      dangerGain = 20;
      reputationChange = -3;
    }

    setEarnings(prev => prev + pay);
    setReputation(prev => Math.max(0, Math.min(100, prev + reputationChange)));

    await base44.entities.Human.update(human.id, {
      danger_level: Math.min(100, (human.danger_level || 0) + dangerGain)
    });

    await base44.entities.NightLog.create({
      entry: `${human.name} (escort work) - dangerous situation: ${encounter.type}. ${resultText}`,
      category: 'interaction',
      intensity: 'significant'
    });

    queryClient.invalidateQueries();
    alert(resultText);
    setDangerousEncounter(null);
    setCurrentMeet(null);
    setBookings(bookings.filter(b => b.id !== currentMeet.id));
  };

  const usePanicButton = async () => {
    await base44.entities.NightLog.create({
      entry: `${human.name} used panic button during escort session with ${currentMeet.name}. Emergency contact alerted. Left immediately.`,
      category: 'interaction',
      intensity: 'significant'
    });

    await base44.entities.Human.update(human.id, {
      danger_level: Math.max(0, (human.danger_level || 0) - 10)
    });

    alert(`Panic button activated!\n\nEmergency contact called.\n\nYou left safely.\n\nNo payment but you're safe.`);
    
    blockClient(currentMeet.id);
    setCurrentMeet(null);
    setDangerousEncounter(null);
    queryClient.invalidateQueries();
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

        {/* Safety Alert */}
        {safetyTimer !== null && currentMeet && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-950/40 border border-green-500/30 rounded-xl p-3 mb-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-green-300 text-sm">Safety Timer: {Math.floor(safetyTimer / 60)}:{(safetyTimer % 60).toString().padStart(2, '0')}</span>
              </div>
              <button
                onClick={usePanicButton}
                className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-lg font-bold"
              >
                🚨 PANIC
              </button>
            </div>
          </motion.div>
        )}

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
          {vettingClient && !vettingClient.vetted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-6 text-center">
                <p className="text-white mb-2">Vetting client...</p>
                <p className="text-gray-400 text-sm">Running background check</p>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mt-4"
                />
              </div>
            </motion.div>
          ) : vettingClient && vettingClient.vetted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-gray-800/50 border border-purple-500/30 rounded-xl p-6">
                <h3 className="text-white font-bold text-xl mb-4">Client Vetting Report</h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white">{vettingClient.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Verified:</span>
                    <span className={vettingClient.verified ? 'text-green-400' : 'text-red-400'}>
                      {vettingClient.verified ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reviews:</span>
                    <span className="text-white">{vettingClient.reviews || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location:</span>
                    <span className="text-white capitalize">{vettingClient.location}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Location Risk:</span>
                    <span className={`font-bold ${
                      vettingClient.locationRisk > 60 ? 'text-red-400' :
                      vettingClient.locationRisk > 30 ? 'text-orange-400' :
                      'text-green-400'
                    }`}>
                      {vettingClient.locationRisk}%
                    </span>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-2">
                    <p className="text-gray-400 text-xs">{vettingClient.locationSafety}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Client Risk:</span>
                    <span className={`font-bold ${
                      vettingClient.danger > 40 ? 'text-red-400' :
                      vettingClient.danger > 20 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {vettingClient.danger}%
                    </span>
                  </div>
                </div>

                {vettingClient.redFlags && vettingClient.redFlags.length > 0 && (
                  <div className="bg-red-950/40 border border-red-500/30 rounded-lg p-3 mb-4">
                    <p className="text-red-300 font-bold text-sm mb-2">🚩 Red Flags:</p>
                    {vettingClient.redFlags.map((flag, i) => (
                      <p key={i} className="text-red-400 text-xs">• {flag}</p>
                    ))}
                  </div>
                )}

                <div className="bg-yellow-950/40 border border-yellow-500/30 rounded-lg p-3 mb-4">
                  <p className="text-yellow-300 text-sm text-center">
                    Total Risk: {vettingClient.danger + vettingClient.locationRisk}%
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => confirmBooking(vettingClient, false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-bold"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => confirmBooking(vettingClient, true)}
                    className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-3 rounded-xl font-bold"
                  >
                    Accept Booking
                  </button>
                </div>
              </div>
            </motion.div>
          ) : dangerousEncounter ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="bg-red-950/40 border-2 border-red-500/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                  <div>
                    <h3 className="text-white font-bold text-xl">⚠️ DANGER</h3>
                    <p className="text-red-300 text-sm">Critical situation</p>
                  </div>
                </div>
                
                <p className="text-white mb-6 whitespace-pre-line">{dangerousEncounter.text}</p>
                
                <div className="space-y-3">
                  {dangerousEncounter.options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleDangerChoice(option)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        option.safe 
                          ? 'bg-green-950/40 border-green-500/30 hover:bg-green-950/60' 
                          : 'bg-red-950/40 border-red-500/30 hover:bg-red-950/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={option.safe ? 'text-green-300' : 'text-red-300'}>
                          {option.safe ? '✓' : '⚠️'} {option.label}
                        </span>
                        {option.safe ? (
                          <Shield className="w-4 h-4 text-green-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={usePanicButton}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                🚨 EMERGENCY PANIC BUTTON
              </button>
            </motion.div>
          ) : currentMeet ? (
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

                {/* Location info */}
                <div className={`border rounded-lg p-3 mb-4 ${
                  currentMeet.locationRisk > 60 ? 'bg-red-950/40 border-red-500/30' :
                  currentMeet.locationRisk > 30 ? 'bg-orange-950/40 border-orange-500/30' :
                  'bg-green-950/40 border-green-500/30'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4" />
                    <p className="text-white text-sm font-bold">Location Safety</p>
                  </div>
                  <p className="text-gray-300 text-xs">{currentMeet.locationSafety}</p>
                </div>

                {/* Emergency Contact */}
                {emergencyContact && (
                  <div className="bg-blue-950/40 border border-blue-500/30 rounded-lg p-3 mb-4">
                    <p className="text-blue-300 text-sm">
                      ✓ Emergency contact on standby: {emergencyContact}
                    </p>
                  </div>
                )}

                {/* Panic button */}
                <button
                  onClick={usePanicButton}
                  className="w-full bg-red-900 hover:bg-red-800 text-white py-2 rounded-lg mb-4 font-bold flex items-center justify-center gap-2"
                >
                  🚨 Emergency - Leave Now
                </button>

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
              <div className="flex gap-2 border-b border-gray-700 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 py-2 whitespace-nowrap ${activeTab === 'profile' ? 'text-red-400 border-b-2 border-red-400' : 'text-gray-400'}`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`px-4 py-2 whitespace-nowrap ${activeTab === 'bookings' ? 'text-red-400 border-b-2 border-red-400' : 'text-gray-400'}`}
                >
                  Bookings ({bookings.length})
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`px-4 py-2 whitespace-nowrap ${activeTab === 'reviews' ? 'text-red-400 border-b-2 border-red-400' : 'text-gray-400'}`}
                >
                  Reviews
                </button>
              </div>

              {/* Quick action buttons */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => setShowExpanded(true)}
                  className="bg-purple-950/40 border border-purple-500/30 hover:bg-purple-950/60 rounded-xl p-3 flex items-center justify-center gap-2"
                >
                  <Building className="w-5 h-5 text-purple-400" />
                  <span className="text-white text-sm">Business</span>
                </button>
                <button
                  onClick={() => setShowHealth(true)}
                  className="bg-blue-950/40 border border-blue-500/30 hover:bg-blue-950/60 rounded-xl p-3 flex items-center justify-center gap-2"
                >
                  <Activity className="w-5 h-5 text-blue-400" />
                  <span className="text-white text-sm">Health</span>
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

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Emergency Contact</label>
                    <input
                      type="text"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      placeholder="Friend's phone number..."
                      className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-red-500/30 focus:border-red-500 focus:outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Someone who knows where you are</p>
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

                  {blockedClients.length > 0 && (
                    <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-3">
                      <p className="text-red-300 text-sm text-center">
                        🚫 {blockedClients.length} client{blockedClients.length > 1 ? 's' : ''} blocked
                      </p>
                    </div>
                  )}

                  <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4 mb-4">
                    <h4 className="text-white font-bold text-sm mb-2">💡 Reputation Effects</h4>
                    <div className="space-y-1 text-xs text-gray-300">
                      <p>• Higher reputation = better clients</p>
                      <p>• Lower reputation = more dangerous bookings</p>
                      <p>• Reviews affect booking frequency</p>
                      <p>• Safety choices matter</p>
                    </div>
                  </div>

                  <button
                    onClick={acceptBooking}
                    className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-4 rounded-xl font-bold"
                  >
                    🔍 Find New Client (Auto-Vet)
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

                          <div className="space-y-2 text-xs mb-3">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Verified ID:</span>
                              <span className={booking.verified ? 'text-green-400' : 'text-red-400'}>
                                {booking.verified ? '✓ Yes' : '✗ No'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Reviews:</span>
                              <span className="text-white">{booking.reviews || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Client Risk:</span>
                              <span className={`font-bold ${
                                booking.danger > 40 ? 'text-red-400' :
                                booking.danger > 20 ? 'text-yellow-400' :
                                'text-green-400'
                              }`}>
                                {booking.danger}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Location Risk:</span>
                              <span className={`font-bold ${
                                booking.locationRisk > 60 ? 'text-red-400' :
                                booking.locationRisk > 30 ? 'text-orange-400' :
                                'text-green-400'
                              }`}>
                                {booking.locationRisk}%
                              </span>
                            </div>
                          </div>

                          {(booking.danger + booking.locationRisk) > 70 && (
                            <div className="bg-red-950/40 border border-red-500/30 rounded-lg p-2 mb-3">
                              <p className="text-red-300 text-xs font-bold text-center">
                                ⚠️ HIGH RISK - Consider declining
                              </p>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <button
                              onClick={() => meetClient(booking)}
                              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-bold"
                            >
                              Meet
                            </button>
                            <button
                              onClick={() => blockClient(booking.id)}
                              className="bg-red-900 hover:bg-red-800 text-white px-4 py-3 rounded-xl"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
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

        {showExpanded && (
          <EscortExpanded
            human={human}
            onClose={() => setShowExpanded(false)}
            earnings={earnings}
            reputation={reputation}
            setEarnings={setEarnings}
            setReputation={setReputation}
          />
        )}

        {showHealth && (
          <HealthCheckup human={human} onClose={() => setShowHealth(false)} />
        )}
      </motion.div>
    </motion.div>
  );
}