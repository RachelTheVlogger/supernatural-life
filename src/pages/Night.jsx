import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Users, BookOpen, Eye, Zap, Home, Moon, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import FeedingModal from '@/components/nightbound/FeedingModal';
import ServantsList from '@/components/nightbound/ServantsList';
import NightLogView from '@/components/nightbound/NightLogView';
import HuntingModal from '@/components/nightbound/HuntingModal';
import PowersModal from '@/components/nightbound/PowersModal';
import AdvanceNight from '@/components/nightbound/AdvanceNight';
import NPCInteraction from '@/components/nightbound/NPCInteraction';
import TutorialSystem from '@/components/nightbound/TutorialSystem';
import HospitalJob from '@/components/nightbound/HospitalJob';

export default function Night() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeModal, setActiveModal] = useState(null);
  const [selectedServant, setSelectedServant] = useState(null);
  const [showTutorial, setShowTutorial] = useState(null);
  
  // Fetch vampire state
  const { data: vampireStates = [], isLoading: vampireLoading } = useQuery({
    queryKey: ['vampireState'],
    queryFn: () => base44.entities.VampireState.list()
  });
  
  const vampireState = vampireStates[0];
  
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
  
  // Check if first time playing
  const { data: completedTutorials = [] } = useQuery({
    queryKey: ['tutorials'],
    queryFn: () => base44.entities.Tutorial.list()
  });
  
  // Ensure only one servant exists at a time
  const [servantsInitialized, setServantsInitialized] = useState(false);
  
  // Redirect to home if no vampire exists
  useEffect(() => {
    const checkAndRedirect = async () => {
      const states = await base44.entities.VampireState.list();
      if (states.length === 0) {
        navigate(createPageUrl('Home'), { replace: true });
      }
    };
    checkAndRedirect();
  }, [navigate]);
  
  useEffect(() => {
    // Show welcome tutorial if no tutorials have been completed
    if (completedTutorials.length === 0 && vampireState) {
      setShowTutorial('welcome');
    }
  }, [completedTutorials.length, vampireState]);
  
  if (vampireLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }
  
  if (!vampireState) {
    return null;
  }
  
  // Random name generator with duplicate checking
  const generateRandomName = (existingNames = []) => {
    const names = [
      'Ash', 'River', 'Sage', 'Rowan', 'Quinn', 'Jade', 'Raven', 'Storm',
      'Alex', 'Blake', 'Eden', 'Gray', 'Haven', 'Indigo', 'Jules', 'Kai',
      'Morgan', 'Nova', 'Onyx', 'Phoenix', 'Rain', 'Shadow', 'Sky', 'Wren',
      'Ash', 'Ember', 'Luna', 'Atlas', 'Iris', 'Orion', 'Lyra', 'Cedar'
    ];
    
    // Filter out already used names
    const availableNames = names.filter(name => !existingNames.includes(name));
    
    // If all names are taken, add a number suffix
    if (availableNames.length === 0) {
      const baseName = names[Math.floor(Math.random() * names.length)];
      let counter = 2;
      let newName = `${baseName} ${counter}`;
      while (existingNames.includes(newName)) {
        counter++;
        newName = `${baseName} ${counter}`;
      }
      return newName;
    }
    
    return availableNames[Math.floor(Math.random() * availableNames.length)];
  };
  
  useEffect(() => {
    // Delete extra servants if more than one exists
    if (servants.length > 1 && !servantsInitialized) {
      setServantsInitialized(true);
      // Keep the first one, delete the rest
      const toDelete = servants.slice(1);
      Promise.all(toDelete.map(s => base44.entities.Servant.delete(s.id)))
        .then(() => queryClient.invalidateQueries(['servants']));
    } else if (servants.length === 0 && !servantsInitialized) {
      setServantsInitialized(true);
      const variants = ['devoted', 'defiant', 'dreamer'];
      const emotionalStates = ['curious', 'wary', 'distant'];
      const randomVariant = variants[Math.floor(Math.random() * variants.length)];
      const randomState = emotionalStates[Math.floor(Math.random() * emotionalStates.length)];
      
      base44.entities.Servant.create({
        name: generateRandomName([]),
        variant: randomVariant,
        obsession_stage: 1,
        emotional_state: randomState
      }).then(() => queryClient.invalidateQueries(['servants']));
    }
  }, [servants.length, servantsInitialized]);
  
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
    { icon: Zap, label: 'Powers', modal: 'powers' },
    { icon: Users, label: 'Town People', modal: 'npcs' },
    { icon: Home, label: 'Hospital Shift', modal: 'hospital' },
    { icon: BookOpen, label: 'Night Log', modal: 'log' },
    { icon: Moon, label: 'Advance Night', modal: 'advance' }
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
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
          NIGHTBOUND
        </h1>
        <p className="text-sm text-gray-400">
          Night {vampireState.nights_passed}
        </p>

        <div className="flex gap-4 justify-center mt-4">
          <button
            onClick={() => navigate(createPageUrl('Home'))}
            className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2"
          >
            <Moon className="w-4 h-4" />
            Main Menu
          </button>
          <button
            onClick={() => navigate(createPageUrl('VampireHome'))}
            className="text-purple-400 hover:text-purple-300 transition-colors text-sm flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Your House
          </button>
        </div>
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
        {activeModal === 'advance' && (
          <AdvanceNight
            vampireState={vampireState}
            onClose={() => setActiveModal(null)}
          />
        )}
        {activeModal === 'npcs' && (
          <NPCInteraction
            onClose={() => setActiveModal(null)}
            viewMode="vampire"
          />
        )}
        {activeModal === 'hospital' && (
          <HospitalJob
            vampireState={vampireState}
            onClose={() => setActiveModal(null)}
          />
        )}
        </AnimatePresence>

            {/* Tutorial */}
            {showTutorial && (
            <TutorialSystem
            tutorialId={showTutorial}
            onComplete={() => setShowTutorial(null)}
            onSkip={() => setShowTutorial(null)}
            />
            )}
            </div>
            );
            }