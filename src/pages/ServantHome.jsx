import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { Sparkles, Home, MessageCircle, BookOpen, Coffee, Droplets, Shirt, Moon, Camera, Settings, Heart, User, Zap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import MangaCareer from '@/components/nightbound/MangaCareer';
import HobbiesSystem from '@/components/nightbound/HobbiesSystem';
import CareerSelector from '@/components/nightbound/CareerSelector';
import ServantDating from '@/components/nightbound/ServantDating';
import TattooStudio from '@/components/nightbound/TattooStudio';
import AuthorCareer from '@/components/nightbound/AuthorCareer';
import ServantWitchInteraction from '@/components/nightbound/ServantWitchInteraction';
import WitchServantInteraction from '@/components/nightbound/WitchServantInteraction';
import ServantFamilySystem from '@/components/nightbound/ServantFamilySystem';
import TurnedServantProgression from '@/components/nightbound/TurnedServantProgression';
import JournalSystem from '@/components/nightbound/JournalSystem';

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
  { id: 'hunt', label: 'Practice hunting', icon: Moon, duration: 3000, outcomes: [
    'Every heartbeat for miles. You hear them all. The hunger focuses your senses. Predator instincts awakened.',
    'Colors sharper. Sounds clearer. The world is ALIVE in ways you never knew. The hunt came naturally. Too naturally.',
    'You moved through shadows like silk. Every muscle responding perfectly. This body... it\'s not human anymore. It\'s better.'
  ]},
  { id: 'powers', label: 'Learn from your Sire', icon: Sparkles, duration: 2500, outcomes: [
    'Your sire showed you compulsion. You tried it on a stranger. Their eyes glazed over. "Yes," they whispered. Power intoxicates.',
    'Speed. Your sire taught you to blur. Now you move faster than human eyes can track. The world slows when you need it to.',
    'You practiced reading thoughts. Whispers of desires. Fears. Secrets. Their minds opening to you like books.'
  ]},
  { id: 'feed', label: 'Feed (heightened experience)', icon: Droplets, duration: 2000, outcomes: [
    'The first drop hit your tongue. EXPLOSION of taste. Life. Memory. Emotion. All flooding through you. Ecstasy.',
    'Their pulse against your lips. Every sensation amplified. The warmth. The surrender. You took what you needed. No guilt. Only hunger satisfied.',
    'Fed. The world sharpens impossibly more. Colors burst. Every nerve ending singing. This is what it means to be alive. Truly alive.'
  ]},
  { id: 'emotions', label: 'Process vampire emotions', icon: BookOpen, duration: 3000, outcomes: [
    'Everything feels MORE now. Joy is ecstasy. Anger is rage. Love is obsession. Your sire warned you: vampires feel everything deeper.',
    'You cried blood. The tears surprised you. Hot. Red. Your emotions don\'t work like before. They\'re primal now. Raw.',
    'Bloodlust surged. You fought it. Won. Barely. Your sire was right - control is everything. Lose it, lose yourself.'
  ]},
  { id: 'senses', label: 'Explore heightened senses', icon: Home, duration: 3500, outcomes: [
    'You stood in the rain. Each drop a symphony on your skin. You could track them individually. Smell the minerals in the water. Taste the sky.',
    'A whisper across the street. You heard every word. A perfume three blocks away. You knew the flower. Everything is VIVID now.',
    'Your sire\'s touch. Electric. Every nerve ending awakened. Even simple contact is overwhelming. Your body alive in ways flesh never was.'
  ]}
];

const getBusinessActivities = (servantCareer, vampireState) => {
  const activities = [];
  const isLiteMode = vampireState?.content_filter === 'lite';
  
  // Always show career selector/management
  const hasAnyCareers = servantCareer?.jewelry_business_active || servantCareer?.tattoo_business_active || servantCareer?.author_career_active || servantCareer?.manga_career_active;
  activities.push({ 
    id: 'choose_career', 
    label: hasAnyCareers ? '⚙️ Manage Careers' : '🎯 Choose Career', 
    icon: Sparkles, 
    duration: 0, 
    isModal: true 
  });
  
  // Show active career buttons
  if (servantCareer?.jewelry_business_active) {
    activities.push({ id: 'jewelry', label: '💎 Jewelry Business', icon: Sparkles, duration: 0, isModal: true });
  }
  
  if (servantCareer?.tattoo_business_active) {
    activities.push({ id: 'tattoo', label: '🎨 Tattoo Studio', icon: Sparkles, duration: 0, isModal: true });
  }
  
  if (servantCareer?.author_career_active) {
    activities.push({ id: 'author', label: '📚 Author Career', icon: BookOpen, duration: 0, isModal: true });
  }
  
  if (servantCareer?.manga_career_active) {
    activities.push({ id: 'manga_active', label: '📖 Manga Artist', icon: BookOpen, duration: 0, isModal: true });
  }
  
  if (!isLiteMode) {
    activities.push(
      { id: 'onlyfangs', label: 'OnlyFangs (adult content)', icon: Camera, duration: 0, isModal: true },
      { id: 'snapchat', label: 'Premium Snapchat', icon: MessageCircle, duration: 0, isModal: true }
    );
  }
  
  activities.push(
    { id: 'youtube', label: 'YouTube Channel', icon: Camera, duration: 0, isModal: true },
    { id: 'patreon', label: 'Patreon', icon: Coffee, duration: 0, isModal: true }
  );
  
  return activities;
};

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
  const [showManga, setShowManga] = useState(false);
  const [showHobbies, setShowHobbies] = useState(false);
  const [showCareerSelector, setShowCareerSelector] = useState(false);
  const [showDating, setShowDating] = useState(false);
  const [showTattoo, setShowTattoo] = useState(false);
  const [showAuthor, setShowAuthor] = useState(false);
  const [showWitchVisit, setShowWitchVisit] = useState(false);
  const [showWitchTalk, setShowWitchTalk] = useState(false);
  const [showFamily, setShowFamily] = useState(false);
  const [showProgression, setShowProgression] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  
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

  const { data: humans = [] } = useQuery({
    queryKey: ['humans'],
    queryFn: () => base44.entities.Human.list()
  });

  // Get current entity (servant or human)
  const currentServantId = servantId || (allServants.length > 0 ? allServants[0].id : (humans.length > 0 ? humans[0].id : null));
  const entity = allServants.find(s => s.id === currentServantId) || humans.find(h => h.id === currentServantId);
  
  const { data: vampireStates = [] } = useQuery({
    queryKey: ['vampireState'],
    queryFn: () => base44.entities.VampireState.list(),
    staleTime: 5000
  });

  const vampireState = vampireStates.length > 0 ? vampireStates[0] : null;

  const { data: witches = [] } = useQuery({
    queryKey: ['witches'],
    queryFn: () => base44.entities.Witch.list()
  });
  
  const { data: messages = [] } = useQuery({
    queryKey: ['messages', currentServantId],
    queryFn: () => base44.entities.Message.filter({ servant_id: currentServantId }, '-created_date'),
    enabled: !!currentServantId && !!servant,
    staleTime: 5000
  });
  
  const unreadMessages = messages.filter(m => !m.read && m.sender === 'vampire').length;
  
  const handleChore = async (chore) => {
    if (chore.isModal) {
      if (chore.id === 'dating') {
        setShowDating(true);
      } else if (chore.id === 'npc') {
        setShowNPCModal(true);
      } else if (chore.id === 'choose_career') {
        setShowCareerSelector(true);
      } else if (chore.id === 'jewelry') {
        setShowBusinessModal(true);
      } else if (chore.id === 'tattoo') {
        setShowTattoo(true);
      } else if (chore.id === 'author') {
        setShowAuthor(true);
      } else if (chore.id === 'onlyfangs') {
        setShowOnlyFangs(true);
      } else if (chore.id === 'youtube') {
        setShowYouTube(true);
      } else if (chore.id === 'patreon') {
        setShowPatreon(true);
      } else if (chore.id === 'snapchat') {
        setShowSnapchat(true);
      } else if (chore.id === 'manga') {
        setShowManga(true);
      } else if (chore.id === 'manga_active') {
        setShowManga(true);
      }
      return;
    }

    // Immediate feedback
    setDoingChore(chore.id);

    if (chore.id === 'restock') {
      const materials = ['silver', 'moonstone', 'onyx', 'obsidian', 'garnet', 'amethyst', 'chain', 'wire'];
      const toBuy = materials[Math.floor(Math.random() * materials.length)];
      const amount = Math.floor(Math.random() * 3) + 2;

      const inventory = await base44.entities.Inventory.filter({ servant_id: currentServantId });
      const existing = inventory.find(i => i.material === toBuy);
      
      if (existing) {
        await base44.entities.Inventory.update(existing.id, {
          quantity: existing.quantity + amount
        });
      } else {
        await base44.entities.Inventory.create({
          servant_id: currentServantId,
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
        await base44.entities.Servant.update(currentServantId, {
          relationship: Math.min((servant.relationship || 0) + relationshipGain, 100)
        });
      }
      
      await base44.entities.NightLog.create({
        entry: `${entity?.name}: ${outcome}`,
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
  
  if (!entity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }
  
  const businessActivities = getBusinessActivities(servantCareer, vampireState);
  const activities = entity.is_turned 
    ? [...VAMPIRE_ACTIVITIES, ...businessActivities] 
    : [...CHORES, ...businessActivities];
  
  return (
    <div className="min-h-screen p-4 md:p-6 pb-24 relative overflow-y-auto" style={{
      background: entity.is_turned 
        ? 'linear-gradient(to bottom, #4A0E0E 0%, #2D0A0A 50%, #1A0404 100%)'
        : 'linear-gradient(to bottom, #0a0a14 0%, #1a0a1a 50%, #0a0014 100%)'
    }}>
      
      {/* Blood drop particles for turned servants */}
      {entity.is_turned && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-3 bg-red-600/40 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-5%`,
              }}
              animate={{
                y: ['0vh', '110vh'],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "linear"
              }}
            />
          ))}
        </div>
      )}

      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-1">
          <h1 className={`text-3xl md:text-4xl font-bold ${entity.is_turned ? 'text-rose-100' : 'text-white'}`}>
            {entity.name}
          </h1>
          {vampireState?.time_of_day && (
            <span className="text-2xl">
              {vampireState.time_of_day === 'day' ? '☀️' : '🌙'}
            </span>
          )}
        </div>
        <p className={`text-sm capitalize ${entity.is_turned ? 'text-rose-300' : 'text-gray-400'}`}>
          {entity.is_turned ? '🩸 Vampire Progeny' : (servant ? `${servant.variant} servant` : 'Human')}
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
          <button
            onClick={() => setShowWitchVisit(true)}
            className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
          >
            Visit Witch
          </button>
          {witches.length > 0 && (
            <button
              onClick={() => setShowWitchTalk(true)}
              className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
            >
              Witch Talks to Servant
            </button>
          )}
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
          {servant && (
            <button
              onClick={() => navigate(createPageUrl(`Messages?servant=${currentServantId}`))}
              className="text-purple-400 hover:text-purple-300 text-sm transition-colors flex items-center gap-1"
            >
              <MessageCircle className="w-4 h-4" />
              Messages {unreadMessages > 0 && `(${unreadMessages})`}
            </button>
          )}
          <button
            onClick={() => setShowFamily(true)}
            className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            Family
          </button>
          <button
            onClick={() => setShowJournal(true)}
            className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
          >
            📖 Journal
          </button>
        </div>
      </motion.div>
      
      {/* Emotional state */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={`max-w-2xl mx-auto rounded-xl p-4 mb-6 relative z-10 ${
          entity.is_turned 
            ? 'bg-gradient-to-br from-rose-950/60 to-red-950/60 border border-rose-500/30' 
            : 'bg-gray-900'
        }`}
      >
        <p className={`text-sm italic text-center ${entity.is_turned ? 'text-rose-100' : 'text-gray-300'}`}>
          {entity.is_turned 
            ? 'Every sense heightened. Every emotion deeper. The hunger pulses through you like a second heartbeat. You are vampire.'
            : (servant ? "They're out hunting. You wait for them to return." : "Living your human life...")}
        </p>
        {entity.is_turned && servant && (
          <div className="mt-4">
            <button
              onClick={() => setShowProgression(true)}
              className="w-full bg-gradient-to-r from-rose-900/60 to-red-900/60 hover:from-rose-900/80 hover:to-red-900/80 border-2 border-rose-500/50 rounded-xl p-4 transition-colors mb-3"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-rose-100 font-bold">⚡ Vampire Training</h3>
                  <p className="text-rose-300 text-xs">Unlock powers • Progress to Elder</p>
                </div>
                <Zap className="w-6 h-6 text-rose-400" />
              </div>
            </button>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/30 rounded-lg p-2 border border-rose-500/20">
                <p className="text-rose-300 text-xs">Stage</p>
                <p className="text-rose-100 font-bold">
                  {(servant.vampire_stage || 1) === 1 ? '🩸 Newborn' : (servant.vampire_stage || 1) === 2 ? '🌙 Fledgling' : (servant.vampire_stage || 1) === 3 ? '⚡ Established' : '👑 Elder'}
                </p>
              </div>
              <div className="bg-black/30 rounded-lg p-2 border border-rose-500/20">
                <p className="text-rose-300 text-xs">Power Level</p>
                <p className="text-rose-100 font-bold">{servant.vampire_power_level || 0}/100</p>
              </div>
              <div className="bg-black/30 rounded-lg p-2 border border-rose-500/20">
                <p className="text-rose-300 text-xs">Nights as Vampire</p>
                <p className="text-rose-100 font-bold">{servant.nights_as_vampire || 0}</p>
              </div>
              <div className="bg-black/30 rounded-lg p-2 border border-rose-500/20">
                <p className="text-rose-300 text-xs">Sire Bond</p>
                <p className="text-rose-100 font-bold">{servant.relationship || 0}%</p>
              </div>
            </div>
          </div>
        )}
        {!entity.is_turned && servant && (
          <div className="mt-3 flex justify-between text-xs">
            <span className="text-gray-400">Bond with your sire:</span>
            <span className="text-purple-400">
              {servant.relationship || 0}%
            </span>
          </div>
        )}
      </motion.div>
      
      {/* Activities */}
      <div className="max-w-2xl mx-auto mb-8 relative z-10">
        <h2 className={`text-sm uppercase mb-4 ${entity.is_turned ? 'text-rose-300' : 'text-gray-400'}`}>
          {entity.is_turned ? 'Your vampire powers awaken' : 'What will you do?'}
        </h2>
        
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pb-4">
          <button
            onClick={() => setShowHobbies(true)}
            className="w-full bg-gradient-to-r from-pink-900/40 to-purple-900/40 hover:from-pink-900/60 hover:to-purple-900/60 border-2 border-pink-500/50 rounded-xl p-3 transition-all"
          >
            <span className="text-white font-medium">❤️ Hobbies & Time Together</span>
          </button>

        {activities.map((chore, i) => (
          <motion.button
            key={chore.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            onClick={() => handleChore(chore)}
            disabled={!!doingChore}
            className={`w-full rounded-xl py-4 px-6 flex items-center gap-3 shadow-lg touch-manipulation ${
              doingChore === chore.id ? 'opacity-70 scale-95' : ''
            } ${!!doingChore && doingChore !== chore.id ? 'opacity-30' : ''} ${
              entity.is_turned 
                ? 'bg-gradient-to-r from-rose-900/60 to-red-900/60 hover:from-rose-900/80 hover:to-red-900/80 border-2 border-rose-500/50 text-rose-100'
                : 'bitlife-btn'
            }`}
            style={entity.is_turned ? {
              transition: 'all 300ms ease'
            } : {}}
          >
            <chore.icon className="w-5 h-5" />
            <span className="text-base font-medium">
              {doingChore === chore.id ? 'Experiencing...' : chore.label}
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
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
            style={{
              background: entity.is_turned 
                ? 'radial-gradient(circle, rgba(139, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)'
                : 'rgba(0, 0, 0, 0.7)'
            }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 360]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-6xl"
            >
              {entity.is_turned ? '🩸' : '✨'}
            </motion.div>
            {entity.is_turned && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-1/3 text-rose-200 text-sm italic"
              >
                Senses awakening...
              </motion.p>
            )}
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
            <div className={`rounded-2xl p-6 max-w-md w-full text-center ${
              entity.is_turned 
                ? 'bg-gradient-to-br from-rose-950/90 to-red-950/90 border-2 border-rose-500/50'
                : 'bg-gray-900'
            }`}>
              <p className={`text-lg leading-relaxed ${entity.is_turned ? 'text-rose-100' : 'text-gray-300'}`}>
                {choreOutcome}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proactive Actions */}
      {servant && <ServantProactiveActions servant={servant} />}

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
            servant={allServants.find(s => s.id === currentServantId)}
            human={humans.find(h => h.id === currentServantId)}
            onClose={() => setShowCareerSelector(false)}
            onSelect={(careerType) => {
              setShowCareerSelector(false);
              if (careerType === 'jewelry') setShowBusinessModal(true);
              else if (careerType === 'tattoo') setShowTattoo(true);
              else if (careerType === 'author') setShowAuthor(true);
              else if (careerType === 'manga') setShowManga(true);
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
        {showWitchVisit && (
          <ServantWitchInteraction
            servant={servant}
            onClose={() => setShowWitchVisit(false)}
          />
        )}
        {showWitchTalk && witches[0] && (
          <WitchServantInteraction
            servant={servant}
            witch={witches[0]}
            onClose={() => setShowWitchTalk(false)}
          />
        )}
        {showFamily && vampireState && (
          <ServantFamilySystem
            servant={servant}
            vampireState={vampireState}
            onClose={() => setShowFamily(false)}
          />
        )}
        {showProgression && (
          <TurnedServantProgression
            servant={servant}
            onClose={() => setShowProgression(false)}
          />
        )}
        {showManga && (
          <MangaCareer
            servant={entity}
            onClose={() => setShowManga(false)}
          />
        )}
        {showHobbies && vampireState && (
          <HobbiesSystem
            servant={servant}
            vampireState={vampireState}
            onClose={() => setShowHobbies(false)}
          />
        )}
        {showJournal && (
          <JournalSystem
            servant={servant}
            onClose={() => setShowJournal(false)}
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