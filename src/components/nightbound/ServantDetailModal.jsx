import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Zap, Users, Heart, MapPin, Sparkles, MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import LocationVisit from './LocationVisit';
import RelationshipEvent from './RelationshipEvent';
import QuestSystem from './QuestSystem';
import DirectInteraction from './DirectInteraction';
import FriendsSystem from './FriendsSystem';
import NPCInteraction from './NPCInteraction';
import DateOutingModal from './DateOutingModal';
import ServantTraining from './ServantTraining';

const TEACHING_TOPICS = [
  'Explaining restraint',
  'Showing how to listen to hunger',
  'Demonstrating stillness',
  'Allowing them to observe feeding',
  'Practicing control together'
];

const RELATIONSHIP_LEVELS = [
  { min: 0, max: 20, label: 'Wary', color: 'text-gray-400' },
  { min: 21, max: 40, label: 'Curious', color: 'text-blue-400' },
  { min: 41, max: 60, label: 'Trusting', color: 'text-green-400' },
  { min: 61, max: 80, label: 'Devoted', color: 'text-purple-400' },
  { min: 81, max: 100, label: 'Bound', color: 'text-red-400' }
];

const getRelationshipLevel = (value) => {
  return RELATIONSHIP_LEVELS.find(level => value >= level.min && value <= level.max) || RELATIONSHIP_LEVELS[0];
};

const getRelationshipDialogue = (servant) => {
  const rel = servant.relationship || 0;
  if (rel < 20) {
    return `They watch you with uncertain eyes.`;
  } else if (rel < 40) {
    return `They are beginning to understand you.`;
  } else if (rel < 60) {
    return `They trust you completely.`;
  } else if (rel < 80) {
    return `They would do anything for you.`;
  } else {
    return `Their soul is bound to yours.`;
  }
};

const LOCATIONS = [
  { name: 'Night walk through the city', outcomes: ['You walked together in silence.', 'They stayed close to you.', 'The night felt different with them beside you.'] },
  { name: 'Visit an abandoned building', outcomes: ['You explored together. They trusted you completely.', 'They followed you without question.', 'You shared the darkness.'] },
  { name: 'Go to a rooftop', outcomes: ['You watched the city together.', 'They leaned against you.', 'Time passed differently up there.'] },
  { name: 'Walk through the forest', outcomes: ['You moved between trees together.', 'They felt safer with you.', 'The forest accepted you both.'] },
  { name: 'Visit a cemetery', outcomes: ['You stood among the graves together.', 'They understood you better now.', 'Death felt less foreign to them.'] }
];

export default function ServantDetailModal({ servant, vampireState, onClose }) {
  const [teaching, setTeaching] = useState(false);
  const [turning, setTurning] = useState(false);
  const [goingOut, setGoingOut] = useState(false);
  const [showLocations, setShowLocations] = useState(false);
  const [visitingLocation, setVisitingLocation] = useState(null);
  const [locationOutcome, setLocationOutcome] = useState('');
  const [relationshipMilestone, setRelationshipMilestone] = useState(null);
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [feeding, setFeeding] = useState(false);
  const [showInteractions, setShowInteractions] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showTownPeople, setShowTownPeople] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [showTraining, setShowTraining] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch quests for this servant
  const { data: quests = [] } = useQuery({
    queryKey: ['quests', servant.id],
    queryFn: () => base44.entities.Quest.filter({ servant_id: servant.id })
  });
  
  const activeQuest = quests.find(q => !q.completed);
  
  const checkRelationshipMilestone = (oldRel, newRel) => {
    const milestones = [20, 40, 60, 80, 100];
    for (const milestone of milestones) {
      if (oldRel < milestone && newRel >= milestone) {
        return milestone;
      }
    }
    return null;
  };
  
  const updateQuestProgress = async (type) => {
    if (activeQuest && !activeQuest.completed) {
      const progress = activeQuest.progress || {};
      const newCount = (progress[type] || 0) + 1;
      await base44.entities.Quest.update(activeQuest.id, {
        progress: { ...progress, [type]: newCount }
      });
      queryClient.invalidateQueries(['quests']);
    }
  };
  
  const handleTeach = async () => {
    setTeaching(true);
    
    setTimeout(async () => {
      const topic = TEACHING_TOPICS[Math.floor(Math.random() * TEACHING_TOPICS.length)];
      const newProgress = (servant.teaching_progress || 0) + 1;
      const relationshipGain = Math.floor(Math.random() * 5) + 5; // 5-9
      const oldRel = servant.relationship || 0;
      const newRel = Math.min(oldRel + relationshipGain, 100);
      
      await base44.entities.Servant.update(servant.id, {
        teaching_progress: newProgress,
        obsession_stage: Math.min(servant.obsession_stage + (newProgress % 3 === 0 ? 1 : 0), 5),
        relationship: newRel
      });
      
      await updateQuestProgress('teach');
      
      const milestone = checkRelationshipMilestone(oldRel, newRel);
      if (milestone) {
        setRelationshipMilestone(milestone);
      }
      
      await base44.entities.NightLog.create({
        entry: `You taught them about ${topic.toLowerCase()}. Your fingers brushed their skin as you demonstrated. They watched you intently.`,
        category: 'teaching',
        intensity: 'moderate'
      });
      
      // Chance to unlock teaching power
      if (Math.random() < 0.3 && !vampireState.unlocked_powers?.includes('Patient Teacher')) {
        const updatedPowers = [...(vampireState.unlocked_powers || []), 'Patient Teacher'];
        await base44.entities.VampireState.update(vampireState.id, {
          unlocked_powers: updatedPowers
        });
        
        await base44.entities.NightLog.create({
          entry: 'Through teaching, you discovered: Patient Teacher',
          category: 'power',
          intensity: 'significant'
        });
      }
      
      queryClient.invalidateQueries(['servants']);
      queryClient.invalidateQueries(['vampireState']);
      queryClient.invalidateQueries(['logs']);
      setTeaching(false);
      onClose();
    }, 2000);
  };
  
  const handleTurn = async () => {
    setTurning(true);
    
    setTimeout(async () => {
      // Assign powers based on variant
      const variantPowers = {
        devoted: ['Blood Bond', 'Heightened Reflexes', 'Subtle Influence'],
        defiant: ['Supernatural Strength', 'Veil of Darkness', 'Commanding Presence'],
        dreamer: ['Mist Form', 'Silent Movement', 'Shared Senses']
      };
      
      const servantPowers = variantPowers[servant.variant] || variantPowers.devoted;
      
      await base44.entities.Servant.update(servant.id, {
        is_turned: true,
        obsession_stage: 5,
        unlocked_powers: servantPowers
      });
      
      await base44.entities.NightLog.create({
        entry: `You turned ${servant.name}. Blood on their lips. Last mortal breath. Powers awakened: ${servantPowers.join(', ')}. Forever bound.`,
        category: 'interaction',
        intensity: 'significant'
      });
      
      // Turning is a major decision - humanity impact
      const humanityChange = servant.relationship >= 80 ? -5 : -10;
      const newHumanity = Math.max(0, Math.min(100, (vampireState.humanity ?? 50) + humanityChange));
      let moral_path = 'balanced';
      if (newHumanity >= 75) moral_path = 'humane';
      else if (newHumanity >= 25) moral_path = 'balanced';
      else if (newHumanity >= 10) moral_path = 'ruthless';
      else moral_path = 'monster';
      
      // Unlock turning power
      const updatedPowers = [...(vampireState.unlocked_powers || [])];
      if (!updatedPowers.includes('The Gift')) {
        updatedPowers.push('The Gift');
      }
      
      await base44.entities.VampireState.update(vampireState.id, {
        unlocked_powers: updatedPowers,
        humanity: newHumanity,
        moral_path: moral_path
      });
      
      queryClient.invalidateQueries(['servants']);
      queryClient.invalidateQueries(['vampireState']);
      queryClient.invalidateQueries(['logs']);
      setTurning(false);
      onClose();
    }, 3000);
  };
  
  const handleFeedOn = async () => {
    setFeeding(true);
    
    setTimeout(async () => {
      const relationshipGain = Math.floor(Math.random() * 8) + 7; // 7-14
      const oldRel = servant.relationship || 0;
      const newRel = Math.min(oldRel + relationshipGain, 100);
      
      await updateQuestProgress('feed');
      
      let feedingText = `You fed. They trembled but did not pull away, breath catching in their throat.`;
      if (newRel >= 80) {
        feedingText = `You fed. They offered themselves willingly, pressing closer, a soft sound escaping their lips.`;
      } else if (newRel >= 60) {
        feedingText = `You fed. They leaned into your touch, fingers curling against your skin, trusting completely.`;
      } else if (newRel >= 40) {
        feedingText = `You fed. They stayed still, accepting, their heartbeat quickening beneath your lips.`;
      }
      
      await base44.entities.NightLog.create({
        entry: feedingText,
        category: 'feeding',
        intensity: 'moderate'
      });
      
      await base44.entities.Servant.update(servant.id, {
        obsession_stage: Math.min(servant.obsession_stage + 1, 5),
        relationship: newRel
      });
      
      const milestone = checkRelationshipMilestone(oldRel, newRel);
      if (milestone) {
        setRelationshipMilestone(milestone);
      }
      
      // Update hunger state
      await base44.entities.VampireState.update(vampireState.id, {
        hunger_state: 'sated',
        last_feed: new Date().toISOString()
      });
      
      // Chance to unlock feeding power
      if (Math.random() < 0.25 && !vampireState.unlocked_powers?.includes('Gentle Touch')) {
        const updatedPowers = [...(vampireState.unlocked_powers || []), 'Gentle Touch'];
        await base44.entities.VampireState.update(vampireState.id, {
          unlocked_powers: updatedPowers
        });
      }
      
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        setFeeding(false);
        onClose();
      }, 4000);
    }, 1500);
  };
  
  const handleGoOut = async (location) => {
    const outcome = location.outcomes[Math.floor(Math.random() * location.outcomes.length)];
    setLocationOutcome(outcome);
    setVisitingLocation(location);
    setShowLocations(false);
    
    await updateQuestProgress('goout');
    
    // Log and update in background
    setTimeout(async () => {
      const relationshipGain = Math.floor(Math.random() * 7) + 8; // 8-14
      
      await base44.entities.NightLog.create({
        entry: `${location.name}: ${outcome}`,
        category: 'interaction',
        intensity: 'moderate'
      });
      
      await base44.entities.Servant.update(servant.id, {
        obsession_stage: Math.min(servant.obsession_stage + 1, 5),
        relationship: Math.min((servant.relationship || 0) + relationshipGain, 100)
      });
      
      // Chance to unlock exploration power
      if (Math.random() < 0.2 && !vampireState.unlocked_powers?.includes('Shared Journey')) {
        const updatedPowers = [...(vampireState.unlocked_powers || []), 'Shared Journey'];
        await base44.entities.VampireState.update(vampireState.id, {
          unlocked_powers: updatedPowers
        });
      }
      
      queryClient.invalidateQueries();
    }, 3000);
  };
  
  const handleCloseLocation = () => {
    setVisitingLocation(null);
    onClose();
  };
  
  return (
    <>
      <AnimatePresence>
        {relationshipMilestone && (
          <RelationshipEvent
            milestone={relationshipMilestone}
            servantName={servant.name}
            onClose={() => {
              setRelationshipMilestone(null);
              queryClient.invalidateQueries(['servants']);
            }}
          />
        )}
        
        {visitingLocation && (
          <LocationVisit
            location={visitingLocation}
            servantName={servant.name}
            outcome={locationOutcome}
            onClose={handleCloseLocation}
          />
        )}
        
        {showQuestModal && (
          <QuestSystem
            servant={servant}
            vampireState={vampireState}
            onClose={() => {
              setShowQuestModal(false);
              queryClient.invalidateQueries(['servants']);
            }}
          />
        )}
        
        {showInteractions && (
          <DirectInteraction
            servant={servant}
            vampireState={vampireState}
            onClose={() => {
              setShowInteractions(false);
              queryClient.invalidateQueries(['servants']);
            }}
          />
        )}
        
        {showFriends && (
          <FriendsSystem
            servant={servant}
            onClose={() => {
              setShowFriends(false);
              queryClient.invalidateQueries(['servants']);
            }}
          />
        )}
        
        {showTownPeople && (
          <NPCInteraction
            onClose={() => setShowTownPeople(false)}
            viewMode="servant"
            servant={servant}
          />
        )}
        
        {showDate && (
          <DateOutingModal
            servant={servant}
            vampireState={vampireState}
            onClose={() => setShowDate(false)}
          />
        )}
        
        {showTraining && (
          <ServantTraining
            servant={servant}
            onClose={() => setShowTraining(false)}
          />
        )}
      </AnimatePresence>
      
      {!visitingLocation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90"
          onClick={onClose}
        >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-md w-full relative"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10 touch-manipulation p-2"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-2 pr-8 break-words">
          {servant.name}
        </h2>
        <p className="text-gray-400 text-sm capitalize">
          {servant.variant} · Stage {servant.obsession_stage}
        </p>
        
        {/* Quest indicator */}
        {activeQuest && !activeQuest.completed && (
          <div className="mt-4 bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/50 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <div>
                  <p className="text-white text-xs font-medium">Active Quest</p>
                  <p className="text-gray-400 text-xs">Stage {activeQuest.stage}</p>
                </div>
              </div>
              <button
                onClick={() => setShowQuestModal(true)}
                className="text-purple-400 hover:text-purple-300 text-xs font-medium transition-colors"
              >
                View →
              </button>
            </div>
          </div>
        )}
        
        {/* Relationship display */}
        <div className="mt-3 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Bond</span>
            <span className={`text-sm font-medium ${getRelationshipLevel(servant.relationship || 0).color}`}>
              {getRelationshipLevel(servant.relationship || 0).label}
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${servant.relationship || 0}%` }}
              transition={{ duration: 0.5 }}
              className="h-2 rounded-full bg-gradient-to-r from-purple-600 to-red-500"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 italic">
            {getRelationshipDialogue(servant)}
          </p>
        </div>
        
        {feeding ? (
          <div className="text-center py-12 relative overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-3xl"
                initial={{ 
                  x: '50%', 
                  y: '50%',
                  opacity: 1,
                  scale: 0 
                }}
                animate={{ 
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100 - 50}%`,
                  opacity: 0,
                  scale: 2
                }}
                transition={{ 
                  duration: 2 + Math.random(),
                  delay: Math.random() * 0.5,
                  ease: 'easeOut'
                }}
              >
                ❤️
              </motion.div>
            ))}
            
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={`drop-${i}`}
                className="absolute text-2xl"
                initial={{ 
                  x: `${Math.random() * 100}%`, 
                  y: '0%',
                  opacity: 1 
                }}
                animate={{ 
                  y: '100%',
                  opacity: 0
                }}
                transition={{ 
                  duration: 2 + Math.random(),
                  delay: Math.random() * 0.8,
                  ease: 'linear'
                }}
              >
                💧
              </motion.div>
            ))}
            
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-red-400 relative z-10"
            >
              Feeding...
            </motion.p>
          </div>
        ) : teaching || turning || goingOut ? (
          <div className="text-center py-12">
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-gray-400"
            >
              {teaching ? 'Teaching...' : turning ? 'Turning...' : '...'}
            </motion.p>
          </div>
        ) : showLocations ? (
          <div className="space-y-3">
            <p className="text-gray-400 text-sm mb-4">Where will you go?</p>
            {LOCATIONS.map((location, i) => (
              <button
                key={i}
                onClick={() => handleGoOut(location)}
                className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
              >
                <p className="text-white text-sm">{location.name}</p>
              </button>
            ))}
            <button
              onClick={() => setShowLocations(false)}
              className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl py-3 text-gray-400 transition-colors"
            >
              Back
            </button>
          </div>
        ) : (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowInteractions(true);
              }}
              className="w-full bg-gradient-to-r from-pink-900/40 to-purple-900/40 hover:from-pink-900/60 hover:to-purple-900/60 border-2 border-pink-500/50 rounded-xl py-4 flex items-center justify-center gap-2 transition-all"
            >
              <Heart className="w-5 h-5 text-pink-400" />
              <span className="text-white font-medium">Interact with {servant.name}</span>
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowFriends(true);
              }}
              className="w-full bg-gradient-to-r from-blue-900/40 to-cyan-900/40 hover:from-blue-900/60 hover:to-cyan-900/60 border-2 border-blue-500/50 rounded-xl py-4 flex items-center justify-center gap-2 transition-all"
            >
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">{servant.name}'s Friends</span>
            </button>
            
            {!activeQuest && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQuestModal(true);
                }}
                className="w-full bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-2 border-purple-500/50 rounded-xl py-3 flex items-center justify-center gap-2 transition-all hover:from-purple-900/50 hover:to-pink-900/50"
              >
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="text-white font-medium">Begin Their Quest</span>
              </button>
            )}
            
            {!servant.is_turned && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFeedOn();
                }}
                className="bitlife-btn w-full rounded-xl py-4 flex items-center gap-3"
              >
                <Heart className="w-5 h-5" />
                <span>Feed on them</span>
              </button>
            )}
            
            {servant.is_turned && (
              <div className="bg-red-900/30 border border-red-800/50 rounded-xl p-4 mb-2">
                <p className="text-red-300 text-sm text-center">
                  They are vampire now. Cold skin against yours. They hunt beside you as an equal.
                </p>
              </div>
            )}

            {servant.training_specialization && servant.training_specialization !== 'none' && (
              <div className="bg-purple-900/30 border border-purple-800/50 rounded-xl p-3 mb-2">
                <p className="text-purple-300 text-sm text-center capitalize">
                  Specialized in: {servant.training_specialization}
                </p>
              </div>
            )}

            {(!servant.training_specialization || servant.training_specialization === 'none') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTraining(true);
                }}
                className="bitlife-btn w-full rounded-xl py-4 flex items-center gap-3"
              >
                <Zap className="w-5 h-5" />
                <span>Specialize their training</span>
              </button>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleTeach();
              }}
              className="bitlife-btn w-full rounded-xl py-4 flex items-center gap-3"
            >
              <BookOpen className="w-5 h-5" />
              <span>Teach them</span>
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDate(true);
              }}
              className="bitlife-btn w-full rounded-xl py-4 flex items-center gap-3"
            >
              <MapPin className="w-5 h-5" />
              <span>Take them on a date</span>
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTownPeople(true);
              }}
              className="bitlife-btn w-full rounded-xl py-4 flex items-center gap-3"
            >
              <Users className="w-5 h-5" />
              <span>Introduce to Town People</span>
            </button>
            
            {!servant.is_turned && servant.obsession_stage >= 4 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleTurn();
                }}
                className="w-full bg-red-900 hover:bg-red-800 text-white rounded-xl py-4 flex items-center gap-3 transition-colors"
              >
                <Zap className="w-5 h-5" />
                <span>Turn them</span>
              </button>
            )}
            
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <p className="text-gray-400 text-sm">
                Teaching progress: {servant.teaching_progress || 0}
              </p>
            </div>
          </div>
        )}
      </motion.div>
        </motion.div>
      )}
    </>
  );
}