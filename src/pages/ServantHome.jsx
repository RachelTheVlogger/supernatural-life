import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Home, MessageCircle, BookOpen, Coffee, Droplets, Shirt, Moon, Camera, ShoppingBag, Settings, Heart, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import BusinessManagement from '@/components/nightbound/BusinessManagement';
import NPCInteraction from '@/components/nightbound/NPCInteraction';
import ServantAutomationSettings from '@/components/nightbound/ServantAutomationSettings';
import ServantProactiveActions from '@/components/nightbound/ServantProactiveActions';
import OnlyFangsManagement from '@/components/nightbound/OnlyFangsManagement';
import ServantInteractions from '@/components/nightbound/ServantInteractions';
import YouTubeCareer from '@/components/nightbound/YouTubeCareer';
import PatreonManager from '@/components/nightbound/PatreonManager';
import SnapchatPremium from '@/components/nightbound/SnapchatPremium';
import CareerSelector from '@/components/nightbound/CareerSelector';
import ServantDating from '@/components/nightbound/ServantDating';
import TattooStudio from '@/components/nightbound/TattooStudio';
import AuthorCareer from '@/components/nightbound/AuthorCareer';

const CHORES = [
  { id: 'dating', label: 'Dating App', icon: Heart, duration: 0, isModal: true },
  { id: 'npc', label: 'Chat with Friends', icon: User, duration: 0, isModal: true },
  { id: 'clean', label: 'Clean the rooms', icon: Sparkles, duration: 2000, outcomes: ['You tidied the bedroom. Everything feels peaceful.', 'You dusted the shelves. The space feels lighter.', 'You organized their belongings with care.'] },
  { id: 'prepare', label: 'Prepare their space', icon: Home, duration: 2000, outcomes: ['You arranged fresh linens. The bed smells like night air.', 'You lit candles around the room. Shadows dance.', 'You set out their things exactly how they like them.'] },
  { id: 'study', label: 'Study their books', icon: BookOpen, duration: 2500, outcomes: ['You read about the old ways. Some things make sense now.', 'Their books are strange. Beautiful. Terrifying.', 'You found a page marked for you. Your name written in the margin.'] },
  { id: 'tea', label: 'Brew tea', icon: Coffee, duration: 1500, outcomes: ['You made tea. Waiting for them to return.', 'The tea grows cold. They\'re still out.', 'You saved some for when they come back.'] },
  { id: 'bathe', label: 'Draw a bath', icon: Droplets, duration: 2000, outcomes: ['You prepared a bath for them. Rose petals floating.', 'Hot water. Steam. You wonder if they\'ll invite you to stay.', 'The bath is ready. You hope they notice.'] },
  { id: 'wardrobe', label: 'Tend their wardrobe', icon: Shirt, duration: 2000, outcomes: ['You brushed their clothes. Your fingers traced the fabric they wear.', 'Everything folded perfectly. You breathed in their scent.', 'You repaired a tear in their sleeve. Small ways to care for them.'] },
  { id: 'wait', label: 'Wait by the window', icon: Moon, duration: 3000, outcomes: ['You watched the night. Waiting. Always waiting.', 'Every shadow could be them returning.', 'The hours pass differently when they\'re gone.'] }
];

const VAMPIRE_ACTIVITIES = [
  { id: 'hunt', label: 'Practice hunting', icon: Moon, duration: 3000, outcomes: ['You stalked through shadows. Instinct taking over. Natural.', 'The hunt came easily. Too easily. This is who you are now.', 'Predator instincts sharpened. The night is yours.'] },
  { id: 'powers', label: 'Test new abilities', icon: Sparkles, duration: 2500, outcomes: ['Your abilities grow stronger. Supernatural. Intoxicating.', 'Testing your limits. There seem to be none.', 'Power surges through you. You\'re becoming something more.'] },
  { id: 'feed', label: 'Feed (hunger management)', icon: Droplets, duration: 2000, outcomes: ['The hunger quiets. For now. It always returns.', 'Blood. Life. You took what you needed. No guilt.', 'Fed. Sated. The world feels sharper now.'] },
  { id: 'meditate', label: 'Control the bloodlust', icon: BookOpen, duration: 3000, outcomes: ['You centered yourself. The beast quiets. Control maintained.', 'Bloodlust contained. Barely. This is your new reality.', 'You find peace in the darkness. It\'s easier each time.'] },
  { id: 'explore', label: 'Explore the night', icon: Home, duration: 3500, outcomes: ['The city at night. Your domain now. Everything has changed.', 'You moved through darkness like you were born to it. Maybe you were.', 'The night embraced you. You embraced it back.'] }
];

const BUSINESS_ACTIVITIES = [
  { id: 'manage', label: 'Choose Career / Manage Business', icon: Sparkles, duration: 0, isModal: true },
  { id: 'onlyfangs', label: 'OnlyFangs (adult content)', icon: Camera, duration: 0, isModal: true },
  { id: 'youtube', label: 'YouTube Channel', icon: Camera, duration: 0, isModal: true },
  { id: 'patreon', label: 'Patreon', icon: Coffee, duration: 0, isModal: true },
  { id: 'snapchat', label: 'Premium Snapchat', icon: MessageCircle, duration: 0, isModal: true }
];

export default function ServantHome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [doingChore, setDoingChore] = useState(null);
  const [choreOutcome, setChoreOutcome] = useState('');
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [showNPCModal, setShowNPCModal] = useState(false);
  const [showAutomationSettings, setShowAutomationSettings] = useState(false);
  const [showOnlyFangs, setShowOnlyFangs] = useState(false);
  const [showServantInteractions, setShowServantInteractions] = useState(false);
  const [showYouTube, setShowYouTube] = useState(false);
  const [showPatreon, setShowPatreon] = useState(false);
  const [showSnapchat, setShowSnapchat] = useState(false);
  const [showCareerSelector, setShowCareerSelector] = useState(false);
  const [showDating, setShowDating] = useState(false);
  const [showTattoo, setShowTattoo] = useState(false);
  const [showAuthor, setShowAuthor] = useState(false);
  
  const urlParams = new URLSearchParams(window.location.search);
  const servantId = urlParams.get('id');
  
  const { data: career = [] } = useQuery({
    queryKey: ['career', servantId],
    queryFn: () => base44.entities.ServantCareer.filter({ servant_id: servantId }),
    enabled: !!servantId
  });
  
  const servantCareer = career[0];

  // Redirect to Night if no servant ID or invalid ID
  useEffect(() => {
    const checkGameState = async () => {
      const states = await base44.entities.VampireState.list();
      if (states.length === 0) {
        navigate(createPageUrl('Home'), { replace: true });
        return;
      }
      
      if (!servantId || servantId === 'null' || servantId === 'undefined') {
        navigate(createPageUrl('Night'), { replace: true });
      }
    };
    checkGameState();
  }, [navigate, servantId]);
  
  const { data: servant } = useQuery({
    queryKey: ['servant', servantId],
    queryFn: async () => {
      try {
        const servants = await base44.entities.Servant.list();
        return servants.find(s => s.id === servantId);
      } catch (e) {
        console.error('Failed to fetch servant:', e);
        return null;
      }
    },
    enabled: !!servantId && servantId !== 'null' && servantId !== 'undefined',
    retry: 2
  });

  const { data: allServants = [] } = useQuery({
    queryKey: ['servants'],
    queryFn: () => base44.entities.Servant.list()
  });
  
  const { data: vampireStates = [] } = useQuery({
    queryKey: ['vampireState'],
    queryFn: () => base44.entities.VampireState.list(),
    staleTime: 5000
  });

  const vampireState = vampireStates.length > 0 ? vampireStates[0] : null;
  
  const { data: messages = [] } = useQuery({
    queryKey: ['messages', servantId],
    queryFn: () => base44.entities.Message.filter({ servant_id: servantId }, '-created_date'),
    enabled: !!servantId,
    staleTime: 5000
  });
  
  const unreadMessages = messages.filter(m => !m.read && m.sender === 'vampire').length;
  
  const handleChore = async (chore) => {
    if (chore.isModal) {
      if (chore.id === 'dating') {
        setShowDating(true);
      } else if (chore.id === 'npc') {
        setShowNPCModal(true);
      } else if (chore.id === 'manage') {
        if (!servantCareer || (!servantCareer.jewelry_business_active && !servantCareer.tattoo_business_active && !servantCareer.author_career_active)) {
          setShowCareerSelector(true);
        } else if (servantCareer.jewelry_business_active) {
          setShowBusinessModal(true);
        } else if (servantCareer.tattoo_business_active) {
          setShowTattoo(true);
        } else if (servantCareer.author_career_active) {
          setShowAuthor(true);
        }
      } else if (chore.id === 'onlyfangs') {
        setShowOnlyFangs(true);
      } else if (chore.id === 'youtube') {
        setShowYouTube(true);
      } else if (chore.id === 'patreon') {
        setShowPatreon(true);
      } else if (chore.id === 'snapchat') {
        setShowSnapchat(true);
      }
      return;
    }

    // Immediate feedback
    setDoingChore(chore.id);

    if (chore.id === 'restock') {
      const materials = ['silver', 'moonstone', 'onyx', 'obsidian', 'garnet', 'amethyst', 'chain', 'wire'];
      const toBuy = materials[Math.floor(Math.random() * materials.length)];
      const amount = Math.floor(Math.random() * 3) + 2;

      const inventory = await base44.entities.Inventory.filter({ servant_id: servantId });
      const existing = inventory.find(i => i.material === toBuy);
      
      if (existing) {
        await base44.entities.Inventory.update(existing.id, {
          quantity: existing.quantity + amount
        });
      } else {
        await base44.entities.Inventory.create({
          servant_id: servantId,
          material: toBuy,
          quantity: amount
        });
      }
    }
    
    setTimeout(async () => {
      const outcome = chore.outcomes[Math.floor(Math.random() * chore.outcomes.length)];
      setChoreOutcome(outcome);
      
      // Small relationship gain from doing chores
      const relationshipGain = Math.floor(Math.random() * 3) + 2; // 2-4
      if (servant) {
        await base44.entities.Servant.update(servantId, {
          relationship: Math.min((servant.relationship || 0) + relationshipGain, 100)
        });
      }
      
      await base44.entities.NightLog.create({
        entry: `${servant?.name}: ${outcome}`,
        category: 'interaction',
        intensity: 'subtle'
      });


      
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        setDoingChore(null);
        setChoreOutcome('');
      }, 3000);
    }, chore.duration);
  };
  
  if (!servant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }
  
  const activities = servant.is_turned 
    ? [...VAMPIRE_ACTIVITIES, ...BUSINESS_ACTIVITIES] 
    : [...CHORES, ...BUSINESS_ACTIVITIES];
  
  return (
    <div className="min-h-screen p-4 md:p-6 relative overflow-hidden">

      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 relative z-10"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
          {servant.name}
        </h1>
        <p className="text-sm capitalize text-gray-400">
          {servant.is_turned ? '🦇 Vampire' : `${servant.variant} servant`}
        </p>
        
        <div className="flex gap-3 justify-center mt-4 flex-wrap">
          <button
            onClick={() => setShowAutomationSettings(true)}
            className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-1"
          >
            <Settings className="w-4 h-4" />
            Automation
          </button>
          <button
            onClick={() => setShowNPCModal(true)}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Town People
          </button>
          {allServants.length > 1 && (
            <button
              onClick={() => setShowServantInteractions(true)}
              className="text-pink-400 hover:text-pink-300 text-sm transition-colors"
            >
              Talk to Other Servants
            </button>
          )}
          <button
            onClick={() => navigate(createPageUrl('VampireHome'))}
            className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
          >
            Switch to Vampire →
          </button>
          <button
            onClick={() => navigate(createPageUrl(`Messages?servant=${servantId}`))}
            className="text-purple-400 hover:text-purple-300 text-sm transition-colors flex items-center gap-1"
          >
            <MessageCircle className="w-4 h-4" />
            Messages {unreadMessages > 0 && `(${unreadMessages})`}
          </button>
        </div>
      </motion.div>
      
      {/* Emotional state */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl mx-auto rounded-xl p-4 mb-6 relative z-10 bg-gray-900"
      >
        <p className="text-gray-300 text-sm italic text-center">
          {servant.is_turned 
            ? 'The night is yours. The hunger never truly leaves. But you are no longer prey.'
            : "They're out hunting. You wait for them to return."}
        </p>
        <div className="mt-3 flex justify-between text-xs">
          <span className="text-gray-400">Bond with them:</span>
          <span className="text-purple-400">
            {servant.relationship || 0}%
          </span>
        </div>
      </motion.div>
      
      {/* Activities */}
      <div className="max-w-2xl mx-auto mb-8 relative z-10">
        <h2 className="text-sm uppercase mb-4 text-gray-400">
          {servant.is_turned ? 'What will you do tonight?' : 'What will you do?'}
        </h2>
        
        <div className="space-y-3 max-h-[55vh] overflow-y-auto">
        {activities.map((chore, i) => (
          <motion.button
            key={chore.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            onClick={(e) => {
              e.stopPropagation();
              handleChore(chore);
            }}
            disabled={!!doingChore}
            className={`w-full rounded-xl py-4 px-6 flex items-center gap-3 shadow-lg touch-manipulation active:scale-95 active:opacity-90 ${
              doingChore === chore.id ? 'opacity-70 scale-95' : 'bitlife-btn'
            } ${!!doingChore && doingChore !== chore.id ? 'opacity-30' : ''}`}
          >
            <chore.icon className="w-5 h-5" />
            <span className="text-base font-medium">
              {doingChore === chore.id ? 'Working on it...' : chore.label}
            </span>
          </motion.button>
        ))}
        </div>
      </div>
      
      {/* Loading overlay for activities */}
      <AnimatePresence>
        {doingChore && !choreOutcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 360]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-6xl"
            >
              {servant.is_turned ? '🦇' : '✨'}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Outcome display */}
      <AnimatePresence>
        {choreOutcome && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
          >
            <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full text-center">
              <p className="text-gray-300 text-lg">{choreOutcome}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proactive Actions */}
      <ServantProactiveActions servant={servant} />

      {/* Modals */}
      <AnimatePresence>
        {showBusinessModal && (
          <BusinessManagement
            servant={servant}
            onClose={() => setShowBusinessModal(false)}
          />
        )}
        {showNPCModal && (
          <NPCInteraction
            onClose={() => setShowNPCModal(false)}
            viewMode="servant"
          />
        )}
        {showAutomationSettings && (
          <ServantAutomationSettings
            servant={servant}
            onClose={() => setShowAutomationSettings(false)}
          />
        )}
        {showOnlyFangs && vampireState && (
          <OnlyFangsManagement
            servant={servant}
            vampireState={vampireState}
            onClose={() => setShowOnlyFangs(false)}
          />
        )}
        {showServantInteractions && vampireState && (
          <ServantInteractions
            servants={allServants}
            vampireState={vampireState}
            currentServant={servant}
            onClose={() => setShowServantInteractions(false)}
          />
        )}
        {showYouTube && vampireState && (
          <YouTubeCareer
            servant={servant}
            vampireState={vampireState}
            onClose={() => setShowYouTube(false)}
          />
        )}
        {showPatreon && (
          <PatreonManager
            servant={servant}
            onClose={() => setShowPatreon(false)}
          />
        )}
        {showSnapchat && vampireState && (
          <SnapchatPremium
            servant={servant}
            vampireState={vampireState}
            onClose={() => setShowSnapchat(false)}
          />
        )}
        {showCareerSelector && (
          <CareerSelector
            servant={servant}
            onClose={() => setShowCareerSelector(false)}
            onSelect={(careerType) => {
              setShowCareerSelector(false);
              if (careerType === 'jewelry') setShowBusinessModal(true);
              else if (careerType === 'tattoo') setShowTattoo(true);
              else if (careerType === 'author') setShowAuthor(true);
            }}
          />
        )}
        {showTattoo && (
          <TattooStudio
            servant={servant}
            onClose={() => setShowTattoo(false)}
          />
        )}
        {showAuthor && (
          <AuthorCareer
            servant={servant}
            onClose={() => setShowAuthor(false)}
          />
        )}
        {showDating && vampireState && (
          <ServantDating
            servant={servant}
            vampireState={vampireState}
            onClose={() => setShowDating(false)}
          />
        )}
        {!vampireState && (showOnlyFangs || showServantInteractions || showYouTube || showSnapchat || showDating) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          >
            <div className="bg-gray-900 rounded-xl p-6 text-center">
              <p className="text-white">Loading game state...</p>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
    </div>
  );
}