import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Users, BookOpen, Eye, Zap, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import FeedingModal from '@/components/nightbound/FeedingModal';
import ServantsList from '@/components/nightbound/ServantsList';
import NightLogView from '@/components/nightbound/NightLogView';
import HuntingModal from '@/components/nightbound/HuntingModal';
import PowersModal from '@/components/nightbound/PowersModal';

export default function Night() {
  const queryClient = useQueryClient();
  const [activeModal, setActiveModal] = useState(null);
  const [selectedServant, setSelectedServant] = useState(null);
  
  // Fetch vampire state
  const { data: vampireStates = [] } = useQuery({
    queryKey: ['vampireState'],
    queryFn: () => base44.entities.VampireState.list()
  });
  
  const vampireState = vampireStates[0] || {
    hunger_state: 'calm',
    emotional_mode: 'feeling',
    unlocked_powers: [],
    nights_passed: 0
  };
  
  // Fetch servants
  const { data: servants = [] } = useQuery({
    queryKey: ['servants'],
    queryFn: () => base44.entities.Servant.list('-last_interaction')
  });
  
  // Fetch recent logs
  const { data: logs = [] } = useQuery({
    queryKey: ['logs'],
    queryFn: () => base44.entities.NightLog.list('-created_date', 10)
  });
  
  // Initialize vampire state if doesn't exist
  useEffect(() => {
    if (vampireStates.length === 0) {
      base44.entities.VampireState.create({
        hunger_state: 'calm',
        emotional_mode: 'feeling',
        unlocked_powers: [],
        nights_passed: 0
      }).then(() => queryClient.invalidateQueries(['vampireState']));
    }
  }, [vampireStates.length]);
  
  // Random name generator
  const generateRandomName = () => {
    const names = [
      'Ash', 'River', 'Sage', 'Rowan', 'Quinn', 'Jade', 'Raven', 'Storm',
      'Alex', 'Blake', 'Eden', 'Gray', 'Haven', 'Indigo', 'Jules', 'Kai',
      'Morgan', 'Nova', 'Onyx', 'Phoenix', 'Rain', 'Shadow', 'Sky', 'Wren'
    ];
    return names[Math.floor(Math.random() * names.length)];
  };
  
  // Create initial servants if none exist
  const [servantsInitialized, setServantsInitialized] = useState(false);
  
  useEffect(() => {
    if (servants.length === 0 && !servantsInitialized) {
      setServantsInitialized(true);
      const initialServants = [
        { name: generateRandomName(), variant: 'devoted', obsession_stage: 1, emotional_state: 'curious' },
        { name: generateRandomName(), variant: 'defiant', obsession_stage: 1, emotional_state: 'wary' },
        { name: generateRandomName(), variant: 'dreamer', obsession_stage: 1, emotional_state: 'distant' }
      ];
      
      Promise.all(
        initialServants.map(s => base44.entities.Servant.create(s))
      ).then(() => queryClient.invalidateQueries(['servants']));
    }
  }, [servants.length, servantsInitialized]);
  
  const hungerColor = {
    sated: 'rgba(60, 20, 20, 0.6)',
    calm: 'rgba(80, 0, 0, 0.6)',
    lingering: 'rgba(120, 0, 0, 0.7)',
    heightened: 'rgba(160, 0, 0, 0.8)',
    restless: 'rgba(200, 0, 0, 0.9)'
  }[vampireState.hunger_state];
  
  const navigate = useNavigate();
  
  const actions = [
    { icon: Droplets, label: 'Feed', modal: 'feeding' },
    { icon: Users, label: 'Servants', modal: 'servants' },
    { icon: Eye, label: 'Hunt', modal: 'hunting' },
    { icon: Zap, label: 'Powers', modal: 'powers' },
    { icon: BookOpen, label: 'Night Log', modal: 'log' }
  ];
  
  return (
    <div className="min-h-screen relative p-4 md:p-6">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
          NIGHTBOUND
        </h1>
        <p className="text-sm text-gray-400">
          Night {vampireState.nights_passed}
        </p>
        
        <button
          onClick={() => navigate(createPageUrl('VampireHome'))}
          className="mt-4 text-purple-400 hover:text-purple-300 transition-colors text-sm flex items-center gap-2 mx-auto"
        >
          <Home className="w-4 h-4" />
          Return to your sanctuary
        </button>
      </motion.div>
      
      {/* Action buttons - Bitlife style */}
      <div className="max-w-2xl mx-auto space-y-3 mb-8">
        {actions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            onClick={() => setActiveModal(action.modal)}
            className="bitlife-btn w-full rounded-xl py-4 px-6 flex items-center gap-3 shadow-lg"
          >
            <action.icon className="w-5 h-5" />
            <span className="text-base font-medium">{action.label}</span>
          </motion.button>
        ))}
      </div>
      
      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="max-w-2xl mx-auto bg-gray-900 rounded-xl p-4 space-y-2"
      >
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Hunger:</span>
          <span className="text-white capitalize">{vampireState.hunger_state}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Mode:</span>
          <button
            onClick={async () => {
              if (vampireState.id) {
                await base44.entities.VampireState.update(vampireState.id, {
                  emotional_mode: vampireState.emotional_mode === 'feeling' ? 'ruthless' : 'feeling'
                });
                queryClient.invalidateQueries(['vampireState']);
              }
            }}
            className="text-purple-400 hover:text-purple-300 transition-colors capitalize"
          >
            {vampireState.emotional_mode} ⚡
          </button>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Powers:</span>
          <span className="text-white">{vampireState.unlocked_powers?.length || 0}</span>
        </div>
      </motion.div>
      
      {/* Recent log entries */}
      {logs.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="max-w-2xl mx-auto mt-6 bg-gray-900 rounded-xl p-4"
        >
          <h3 className="text-gray-400 text-xs uppercase mb-3">Recent Events</h3>
          <div className="space-y-2">
            {logs.slice(0, 3).map((log) => (
              <p key={log.id} className="text-gray-300 text-sm">
                {log.entry}
              </p>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Modals */}
      <AnimatePresence>
        {activeModal === 'feeding' && (
          <FeedingModal 
            onClose={() => setActiveModal(null)}
            vampireState={vampireState}
          />
        )}
        {activeModal === 'servants' && (
          <ServantsList
            onClose={() => setActiveModal(null)}
            servants={servants}
            vampireState={vampireState}
          />
        )}
        {activeModal === 'hunting' && (
          <HuntingModal
            onClose={() => setActiveModal(null)}
            vampireState={vampireState}
            servants={servants}
          />
        )}
        {activeModal === 'powers' && (
          <PowersModal
            onClose={() => setActiveModal(null)}
            vampireState={vampireState}
          />
        )}
        {activeModal === 'log' && (
          <NightLogView
            onClose={() => setActiveModal(null)}
            logs={logs}
          />
        )}
      </AnimatePresence>
    </div>
  );
}