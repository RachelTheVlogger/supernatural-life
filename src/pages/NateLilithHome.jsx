import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Brain, ShoppingBag, Home, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const NATE_CLIENTS = [
  { name: 'Sarah Chen', issue: 'Anxiety about career change', severity: 'moderate', payment: 150 },
  { name: 'Marcus Williams', issue: 'Depression after breakup', severity: 'severe', payment: 180 },
  { name: 'Emma Rodriguez', issue: 'Work-life balance stress', severity: 'mild', payment: 120 },
  { name: 'David Park', issue: 'Traumatic childhood memories', severity: 'severe', payment: 200 },
  { name: 'Lisa Thompson', issue: 'Social anxiety disorder', severity: 'moderate', payment: 160 }
];

const THERAPY_APPROACHES = [
  { id: 'ethical', label: 'Professional Therapy', desc: 'Help them genuinely', humanity: 5 },
  { id: 'read', label: 'Read Their Mind', desc: 'Use vampire powers', humanity: -3 },
  { id: 'compel', label: 'Compel Happiness', desc: 'Force them to feel better', humanity: -10 },
  { id: 'feed', label: 'Feed During Session', desc: 'Use therapy as hunting', humanity: -15 }
];

const SHOP_ACTIVITIES = [
  { id: 'serve', label: 'Help Customers', desc: 'Be friendly and helpful', pay: 80 },
  { id: 'restock', label: 'Restock Shelves', desc: 'Organize inventory', pay: 60 },
  { id: 'charm', label: 'Charm Customers', desc: 'Use vampire allure', pay: 120 },
  { id: 'feed', label: 'Feed in Storage', desc: 'Quick bite in the back', pay: 100 }
];

export default function NateLilithHome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeCharacter, setActiveCharacter] = useState('nate'); // 'nate' or 'lilith'
  const [workMode, setWorkMode] = useState(null); // 'therapy' or 'shop'
  const [currentClient, setCurrentClient] = useState(null);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [outcome, setOutcome] = useState('');
  const [processing, setProcessing] = useState(false);

  // Fetch or create couple state
  const { data: coupleData } = useQuery({
    queryKey: ['nateLilithState'],
    queryFn: async () => {
      const existing = await base44.entities.VampireState.filter({ vampire_name: 'Nate Cross' });
      if (existing.length > 0) return existing[0];
      
      // Create initial state
      const created = await base44.entities.VampireState.create({
        vampire_name: 'Nate Cross',
        gender: 'man',
        sexuality: 'bisexual',
        job: 'Therapist',
        humanity: 60,
        vampire_stage: 2,
        vampire_power_level: 30,
        unlocked_powers: ['Enhanced Senses', 'Compulsion', 'Mind Reading'],
        emotional_mode: 'feeling',
        time_of_day: 'day'
      });
      return created;
    }
  });

  const { data: lilithData } = useQuery({
    queryKey: ['lilithState'],
    queryFn: async () => {
      const existing = await base44.entities.Servant.filter({ name: 'Lilith Hart' });
      if (existing.length > 0) return existing[0];
      
      const created = await base44.entities.Servant.create({
        name: 'Lilith Hart',
        gender: 'woman',
        sexuality: 'bisexual',
        job: 'Shop Worker (9am-5pm)',
        variant: 'devoted',
        obsession_stage: 5,
        relationship: 100,
        is_turned: true,
        vampire_stage: 2,
        vampire_power_level: 25,
        unlocked_powers: ['Enhanced Senses', 'Compulsion'],
        emotional_state: 'reverent',
        boundaries: 'exclusive'
      });
      return created;
    }
  });

  const handleTherapySession = async (client, approach) => {
    setProcessing(true);
    
    const outcomes = {
      ethical: `You helped ${client.name} work through their ${client.issue}. Professional and genuine.`,
      read: `You read ${client.name}'s mind. Knew exactly what to say. They're amazed by your insight.`,
      compel: `You compelled ${client.name} to feel happy. Problems buried, not solved. Quick fix.`,
      feed: `You fed on ${client.name} during the session. Erased their memory. Dark but satisfying.`
    };

    setTimeout(async () => {
      setOutcome(outcomes[approach.id]);
      
      const newHumanity = Math.max(0, Math.min(100, coupleData.humanity + approach.humanity));
      await base44.entities.VampireState.update(coupleData.id, { humanity: newHumanity });
      
      await base44.entities.NightLog.create({
        entry: `Nate: ${outcomes[approach.id]}`,
        category: 'interaction',
        intensity: approach.humanity < 0 ? 'significant' : 'moderate'
      });
      
      queryClient.invalidateQueries(['nateLilithState']);
      
      setTimeout(() => {
        setProcessing(false);
        setWorkMode(null);
        setCurrentClient(null);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  const handleShopActivity = async (activity) => {
    setProcessing(true);
    
    const outcomes = {
      serve: 'Lilith helped customers with a warm smile. Day shift went smoothly.',
      restock: 'Lilith restocked shelves efficiently. Vampire strength makes it easy.',
      charm: 'Lilith used her natural vampire allure. Customers bought way more than planned.',
      feed: 'Lilith fed quickly in the storage room. A delivery guy. Compelled and forgotten.'
    };

    setTimeout(async () => {
      setOutcome(outcomes[activity.id]);
      
      await base44.entities.NightLog.create({
        entry: `Lilith: ${outcomes[activity.id]} Earned $${activity.pay}.`,
        category: 'interaction',
        intensity: activity.id === 'feed' ? 'significant' : 'moderate'
      });
      
      queryClient.invalidateQueries(['lilithState']);
      
      setTimeout(() => {
        setProcessing(false);
        setWorkMode(null);
        setCurrentActivity(null);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  if (!coupleData || !lilithData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(createPageUrl('VampireHome'))}
          className="text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Nate & Lilith</h1>
          <p className="text-gray-400">Living together. Both vampires. Both complicated.</p>
        </div>

        {/* Character Selection */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setActiveCharacter('nate')}
            className={`rounded-xl p-6 transition-all ${
              activeCharacter === 'nate'
                ? 'bg-blue-600 border-2 border-blue-400'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <Brain className="w-8 h-8 text-white mx-auto mb-2" />
            <h3 className="text-white font-bold">Dr. Nate Cross</h3>
            <p className="text-gray-300 text-sm">Therapist</p>
            <p className="text-blue-300 text-xs mt-2">Humanity: {coupleData.humanity}/100</p>
          </button>

          <button
            onClick={() => setActiveCharacter('lilith')}
            className={`rounded-xl p-6 transition-all ${
              activeCharacter === 'lilith'
                ? 'bg-pink-600 border-2 border-pink-400'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <ShoppingBag className="w-8 h-8 text-white mx-auto mb-2" />
            <h3 className="text-white font-bold">Lilith Hart</h3>
            <p className="text-gray-300 text-sm">Shop Worker</p>
            <p className="text-pink-300 text-xs mt-2">Bond: {lilithData.relationship}/100</p>
          </button>
        </div>

        {/* Actions */}
        {!workMode && !processing && (
          <div className="space-y-4">
            {activeCharacter === 'nate' && (
              <>
                <button
                  onClick={() => setWorkMode('therapy')}
                  className="w-full bg-blue-900/40 hover:bg-blue-900/60 border-2 border-blue-500/50 rounded-xl p-6 text-left transition-all"
                >
                  <h3 className="text-white text-lg font-bold mb-2">See a Patient</h3>
                  <p className="text-gray-400 text-sm">Professional therapy... or something darker</p>
                </button>

                <button
                  onClick={async () => {
                    const newTime = coupleData.time_of_day === 'day' ? 'night' : 'day';
                    await base44.entities.VampireState.update(coupleData.id, { time_of_day: newTime });
                    queryClient.invalidateQueries(['nateLilithState']);
                  }}
                  className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-xl p-4 text-left transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white">
                      {coupleData.time_of_day === 'day' ? 'End Work Day' : 'Start Work Day'}
                    </span>
                    {coupleData.time_of_day === 'day' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-purple-400" />}
                  </div>
                </button>
              </>
            )}

            {activeCharacter === 'lilith' && (
              <>
                <button
                  onClick={() => setWorkMode('shop')}
                  className="w-full bg-pink-900/40 hover:bg-pink-900/60 border-2 border-pink-500/50 rounded-xl p-6 text-left transition-all"
                >
                  <h3 className="text-white text-lg font-bold mb-2">Work at the Shop</h3>
                  <p className="text-gray-400 text-sm">9am to 5pm shift. Vampires make good retail workers.</p>
                </button>

                <button
                  className="w-full bg-purple-900/40 hover:bg-purple-900/60 border-2 border-purple-500/50 rounded-xl p-6 text-left transition-all"
                >
                  <h3 className="text-white text-lg font-bold mb-2">Spend Time with Nate</h3>
                  <p className="text-gray-400 text-sm">Your sire. Your lover. Your everything.</p>
                </button>
              </>
            )}
          </div>
        )}

        {/* Therapy Session */}
        {workMode === 'therapy' && !currentClient && !processing && (
          <div className="space-y-4">
            <h3 className="text-white text-xl font-bold">Today's Patients</h3>
            {NATE_CLIENTS.map(client => (
              <button
                key={client.name}
                onClick={() => setCurrentClient(client)}
                className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-medium">{client.name}</h4>
                    <p className="text-gray-400 text-sm">{client.issue}</p>
                  </div>
                  <span className="text-green-400 text-sm">${client.payment}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {currentClient && !outcome && (
          <div className="space-y-4">
            <div className="bg-blue-950/30 rounded-xl p-4 border border-blue-800/30">
              <h3 className="text-white font-bold mb-2">{currentClient.name}</h3>
              <p className="text-gray-300 text-sm">"{currentClient.issue}"</p>
            </div>

            <h4 className="text-white font-medium">Choose Your Approach</h4>
            {THERAPY_APPROACHES.map(approach => (
              <button
                key={approach.id}
                onClick={() => handleTherapySession(currentClient, approach)}
                disabled={processing}
                className={`w-full rounded-xl p-4 text-left transition-all ${
                  approach.humanity < 0 
                    ? 'bg-red-900/30 hover:bg-red-900/50 border-2 border-red-500/30'
                    : 'bg-green-900/30 hover:bg-green-900/50 border-2 border-green-500/30'
                }`}
              >
                <h5 className="text-white font-medium mb-1">{approach.label}</h5>
                <p className="text-gray-400 text-sm">{approach.desc}</p>
                <span className={`text-xs mt-2 inline-block ${approach.humanity > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  Humanity {approach.humanity > 0 ? '+' : ''}{approach.humanity}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Shop Work */}
        {workMode === 'shop' && !outcome && !processing && (
          <div className="space-y-4">
            <h3 className="text-white text-xl font-bold">Shop Activities</h3>
            {SHOP_ACTIVITIES.map(activity => (
              <button
                key={activity.id}
                onClick={() => handleShopActivity(activity)}
                className={`w-full rounded-xl p-4 text-left transition-all ${
                  activity.id === 'feed'
                    ? 'bg-red-900/30 hover:bg-red-900/50 border-2 border-red-500/30'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-white font-medium mb-1">{activity.label}</h5>
                    <p className="text-gray-400 text-sm">{activity.desc}</p>
                  </div>
                  <span className="text-green-400 text-sm">${activity.pay}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Outcome Display */}
        <AnimatePresence>
          {outcome && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 text-center mt-8"
            >
              <p className="text-gray-300 leading-relaxed">{outcome}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}