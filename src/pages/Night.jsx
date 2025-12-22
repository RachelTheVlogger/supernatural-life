import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Droplets, Users, BookOpen, Eye } from 'lucide-react';
import FeedingModal from '@/components/nightbound/FeedingModal';
import ServantsList from '@/components/nightbound/ServantsList';
import NightLogView from '@/components/nightbound/NightLogView';
import HuntingModal from '@/components/nightbound/HuntingModal';

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
  
  // Create initial servants if none exist
  useEffect(() => {
    if (servants.length === 0) {
      const initialServants = [
        { name: 'Elena', variant: 'devoted', obsession_stage: 1, emotional_state: 'curious' },
        { name: 'Marcus', variant: 'defiant', obsession_stage: 1, emotional_state: 'wary' },
        { name: 'Iris', variant: 'dreamer', obsession_stage: 1, emotional_state: 'distant' }
      ];
      
      Promise.all(
        initialServants.map(s => base44.entities.Servant.create(s))
      ).then(() => queryClient.invalidateQueries(['servants']));
    }
  }, [servants.length]);
  
  const hungerColor = {
    sated: 'rgba(60, 20, 20, 0.6)',
    calm: 'rgba(80, 0, 0, 0.6)',
    lingering: 'rgba(120, 0, 0, 0.7)',
    heightened: 'rgba(160, 0, 0, 0.8)',
    restless: 'rgba(200, 0, 0, 0.9)'
  }[vampireState.hunger_state];
  
  const actions = [
    { icon: Droplets, label: 'Feed', modal: 'feeding' },
    { icon: Users, label: 'Servants', modal: 'servants' },
    { icon: Eye, label: 'Hunt', modal: 'hunting' },
    { icon: BookOpen, label: 'Night Log', modal: 'log' }
  ];
  
  return (
    <div className="min-h-screen relative p-6 md:p-12">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h1 
          className="text-4xl md:text-6xl font-light tracking-widest text-red-100/80 mb-2"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          NIGHTBOUND
        </h1>
        <p className="text-sm tracking-wider text-red-200/40 uppercase">
          Night {vampireState.nights_passed}
        </p>
      </motion.div>
      
      {/* Hunger ambiance */}
      <motion.div
        className="fixed inset-0 pointer-events-none -z-10"
        animate={{
          background: `radial-gradient(circle at 50% 50%, ${hungerColor} 0%, transparent 70%)`
        }}
        transition={{ duration: 2 }}
      />
      
      {/* Action circles */}
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-12">
        {actions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveModal(action.modal)}
            className="glass rounded-2xl p-8 transition-slow hover:bg-red-950/30 flex flex-col items-center gap-3"
          >
            <action.icon className="w-8 h-8 text-red-100/60" strokeWidth={1} />
            <span className="text-red-100/70 text-sm tracking-widest uppercase">
              {action.label}
            </span>
          </motion.button>
        ))}
      </div>
      
      {/* Recent log entries */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="max-w-2xl mx-auto glass rounded-xl p-6"
      >
        <h3 className="text-red-100/50 text-xs tracking-widest uppercase mb-4">
          Recent Moments
        </h3>
        <div className="space-y-3">
          {logs.slice(0, 3).map((log, i) => (
            <motion.p
              key={log.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 + i * 0.2 }}
              className="text-red-100/70 text-sm leading-relaxed italic"
            >
              {log.entry}
            </motion.p>
          ))}
          {logs.length === 0 && (
            <p className="text-red-100/40 text-sm italic">
              The night is still young.
            </p>
          )}
        </div>
      </motion.div>
      
      {/* Emotional mode toggle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        whileHover={{ opacity: 0.8 }}
        className="fixed bottom-6 right-6 text-xs tracking-widest text-red-100/40 uppercase transition-slow"
        onClick={async () => {
          if (vampireState.id) {
            await base44.entities.VampireState.update(vampireState.id, {
              emotional_mode: vampireState.emotional_mode === 'feeling' ? 'ruthless' : 'feeling'
            });
            queryClient.invalidateQueries(['vampireState']);
          }
        }}
      >
        {vampireState.emotional_mode === 'feeling' ? 'Feeling' : 'Ruthless'}
      </motion.button>
      
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
          />
        )}
        {activeModal === 'hunting' && (
          <HuntingModal
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