import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Zap, Moon, Sparkles, Target, Flame } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DateScenarios, { VAMPIRE_DATE_SCENARIOS } from './DateScenarios';

const BEING_TYPES = [
  { id: 'vampire', label: 'Vampire', icon: Moon, color: 'red' },
  { id: 'witch', label: 'Witch', icon: Sparkles, color: 'purple' },
  { id: 'hunter', label: 'Hunter', icon: Target, color: 'orange' },
  { id: 'werewolf', label: 'Werewolf', icon: Flame, color: 'yellow' },
  { id: 'demon', label: 'Demon', icon: Zap, color: 'red' },
  { id: 'angel', label: 'Angel', icon: Sparkles, color: 'blue' }
];

const DATE_ACTIVITIES = [
  'Midnight rooftop meeting',
  'Hunt together',
  'Share blood',
  'Forbidden territory exploration',
  'Discuss supernatural politics',
  'Test each other\'s powers',
  'Watch sunrise (dangerous)',
  'Infiltrate human event together',
  'Passionate night together',
  'Secret hideout encounter',
  'Dangerous flirtation',
  'Heated argument turned intimate'
];

export default function SupernaturalDating({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(null);
  const [creating, setCreating] = useState(false);
  const [dating, setDating] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [currentScenario, setCurrentScenario] = useState(null);

  const { data: dates = [] } = useQuery({
    queryKey: ['supernaturalDates', vampireState?.id],
    queryFn: async () => {
      if (!vampireState?.id) return [];
      return await base44.entities.SupernaturalDate.filter({ vampire_id: vampireState.id });
    },
    enabled: !!vampireState?.id
  });

  const { data: hunters = [] } = useQuery({
    queryKey: ['hunters'],
    queryFn: () => base44.entities.Hunter.list()
  });

  const { data: witches = [] } = useQuery({
    queryKey: ['witches'],
    queryFn: () => base44.entities.Witch.list()
  });

  const handleCreateDate = async (type) => {
    setCreating(true);

    setTimeout(async () => {
      const names = ['Adrian', 'Luna', 'Dante', 'Selene', 'Marcus', 'Raven', 'Viktor', 'Morgana'];
      const personalities = ['dangerous', 'seductive', 'mysterious', 'powerful', 'conflicted'];
      
      try {
        const isDangerous = type.id === 'hunter' || type.id === 'werewolf';
        
        await base44.entities.SupernaturalDate.create({
          vampire_id: vampireState.id,
          date_name: names[Math.floor(Math.random() * names.length)],
          date_type: type.id,
          gender: 'custom',
          personality: [
            personalities[Math.floor(Math.random() * personalities.length)],
            personalities[Math.floor(Math.random() * personalities.length)]
          ],
          relationship_level: 0,
          tension_level: isDangerous ? 30 : 70,
          dangerous_attraction: isDangerous
        });

        await base44.entities.NightLog.create({
          entry: `You met a ${type.id}. Attraction instant. Dangerous. Forbidden. This could be deadly or divine.`,
          category: 'interaction',
          intensity: 'significant'
        });

        queryClient.invalidateQueries();
      } catch (e) {
        console.error('Failed to create date:', e);
      }

      setCreating(false);
    }, 2000);
  };

  const handleDate = async (activity) => {
    setDating(true);

    setTimeout(async () => {
      const success = Math.random() > (selectedDate.dangerous_attraction ? 0.3 : 0.1);
      const relationshipGain = success ? Math.floor(Math.random() * 15) + 10 : -10;

      const successOutcomes = [
        `${activity} with ${selectedDate.date_name}. Chemistry undeniable. You're both drawn deeper.`,
        `Perfect date. ${selectedDate.date_name} opened up. Barriers falling. Connection intensifying.`,
        `${selectedDate.date_name} revealed their true self. You did the same. Dangerous intimacy.`
      ];

      const failOutcomes = [
        `Date went wrong. ${selectedDate.date_name} pulled away. Tension increased. Conflict brewing.`,
        `Disagreement. ${selectedDate.date_name} reminded you why this is forbidden. Distance growing.`,
        `Almost attacked each other. ${selectedDate.date_name} stormed off. Relationship strained.`
      ];

      const result = success ? successOutcomes[Math.floor(Math.random() * successOutcomes.length)] : failOutcomes[Math.floor(Math.random() * failOutcomes.length)];
      setOutcome(result);

      try {
        await base44.entities.SupernaturalDate.update(selectedDate.id, {
          relationship_level: Math.max(0, Math.min(100, (selectedDate.relationship_level || 0) + relationshipGain)),
          tension_level: Math.max(0, Math.min(100, (selectedDate.tension_level || 50) + (success ? 10 : -15))),
          dates_completed: (selectedDate.dates_completed || 0) + 1,
          intimacy_level: success ? Math.min((selectedDate.intimacy_level || 0) + 5, 100) : selectedDate.intimacy_level,
          last_date: new Date().toISOString()
        });

        await base44.entities.NightLog.create({
          entry: result,
          category: 'interaction',
          intensity: success ? 'moderate' : 'subtle'
        });

        queryClient.invalidateQueries();
      } catch (e) {
        console.error('Date failed:', e);
      }

      setTimeout(() => {
        setDating(false);
        setOutcome('');
        setSelectedDate(null);
      }, 4000);
    }, 2500);
  };

  const handleIntimacy = async () => {
    setDating(true);

    setTimeout(async () => {
      const hunterOutcomes = [
        `Sex with ${selectedDate.date_name}. Enemy becoming lover. Weapons discarded. Bodies entwined. Hunter's hands exploring vampire skin. Forbidden. Perfect. Deadly.`,
        `${selectedDate.date_name} pinned you against the wall. Hunter. Vampire. Predator. Prey. Lines blurred. Clothes torn. Pure animal passion.`,
        `You fucked ${selectedDate.date_name} like the world was ending. Every touch dangerous. Every kiss deadly. Hunter riding vampire. Impossible. Addictive.`,
        `${selectedDate.date_name} took you roughly. Hunter claiming vampire. You let them. Needed them. Supernatural heat between enemies turned lovers.`
      ];

      const generalOutcomes = [
        `Intimacy with ${selectedDate.date_name}. Supernatural. Overwhelming. Powers intertwined. Dangerous bliss. Bodies pressed together. Gasping. Claiming.`,
        `You crossed the line with ${selectedDate.date_name}. Physical and mystical. Can't go back now. Every touch electric. Every moan sacred.`,
        `${selectedDate.date_name} in your arms. Two powerful beings. Vulnerable. Exposed. Perfect. Skin against skin. Power against power.`,
        `Sex with ${selectedDate.date_name}. Raw. Supernatural. Perfect. Your bodies moving together. Powers amplifying pleasure. Transcendent.`
      ];

      const isHunter = selectedDate.date_type === 'hunter';
      const outcomes = isHunter ? hunterOutcomes : generalOutcomes;
      const result = outcomes[Math.floor(Math.random() * outcomes.length)];
      setOutcome(result);

      try {
        await base44.entities.SupernaturalDate.update(selectedDate.id, {
          intimacy_level: 100,
          relationship_level: Math.min((selectedDate.relationship_level || 0) + 20, 100),
          relationship_status: 'serious'
        });

        await base44.entities.NightLog.create({
          entry: result,
          category: 'interaction',
          intensity: 'significant'
        });

        queryClient.invalidateQueries();
      } catch (e) {
        console.error('Intimacy failed:', e);
      }

      setTimeout(() => {
        setDating(false);
        setOutcome('');
        setSelectedDate(null);
      }, 4000);
    }, 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Heart className="w-6 h-6 text-pink-400" />
          Supernatural Dating
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Date other supernatural beings. Vampires, witches, hunters. Forbidden romance. Dangerous attraction.
        </p>

        {creating || dating ? (
          <div className="text-center py-12">
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-gray-400"
            >
              {creating ? 'Meeting someone new...' : '...'}
            </motion.p>
          </div>
        ) : outcome ? (
          <div className="text-center py-12">
            <p className="text-gray-300 leading-relaxed">{outcome}</p>
          </div>
        ) : !selectedDate ? (
          <>
            <h3 className="text-white font-medium mb-3">Your Supernatural Relationships</h3>
            
            {dates.length > 0 && (
              <div className="space-y-3 mb-6">
                {dates.map(date => {
                  const type = BEING_TYPES.find(t => t.id === date.date_type);
                  const Icon = type?.icon || Heart;
                  
                  return (
                    <button
                      key={date.id}
                      onClick={() => setSelectedDate(date)}
                      className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`w-6 h-6 text-${type?.color || 'pink'}-400 mt-1`} />
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{date.date_name}</h4>
                          <p className="text-gray-400 text-sm capitalize">
                            {date.date_type} • {date.relationship_status || 'casual'}
                          </p>
                          {date.dangerous_attraction && (
                            <span className="text-red-400 text-xs">⚠️ Dangerous attraction</span>
                          )}
                          <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                            <div>
                              <p className="text-gray-500">Romance</p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                                  <div
                                    style={{ width: `${date.relationship_level || 0}%` }}
                                    className="h-1.5 bg-pink-500 rounded-full"
                                  />
                                </div>
                                <span className="text-pink-400 w-8">{date.relationship_level || 0}</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-500">Intimacy</p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                                  <div
                                    style={{ width: `${date.intimacy_level || 0}%` }}
                                    className="h-1.5 bg-purple-500 rounded-full"
                                  />
                                </div>
                                <span className="text-purple-400 w-8">{date.intimacy_level || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <h3 className="text-white font-medium mb-3">Meet Someone New</h3>
            <div className="grid grid-cols-2 gap-2">
              {BEING_TYPES.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => handleCreateDate(type)}
                    className={`bg-${type.color}-900/40 hover:bg-${type.color}-900/60 border border-${type.color}-500/30 rounded-xl p-3 text-center transition-colors`}
                  >
                    <Icon className={`w-6 h-6 text-${type.color}-400 mx-auto mb-2`} />
                    <p className="text-white text-sm">{type.label}</p>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => setSelectedDate(null)}
              className="text-pink-400 hover:text-pink-300 text-sm mb-3"
            >
              ← Back
            </button>

            <h3 className="text-white font-medium mb-3">{selectedDate.date_name}</h3>

            <div className="bg-gray-800 rounded-xl p-4 mb-4">
              <p className="text-gray-400 text-sm mb-2">
                Dates: {selectedDate.dates_completed || 0} • Status: {selectedDate.relationship_status || 'casual'}
              </p>
              <p className="text-gray-300 text-sm capitalize">
                Personality: {selectedDate.personality?.join(', ')}
              </p>
            </div>

            <h4 className="text-white text-sm font-medium mb-2">Date Activities</h4>
            <button
              onClick={() => setCurrentScenario(VAMPIRE_DATE_SCENARIOS[Math.floor(Math.random() * VAMPIRE_DATE_SCENARIOS.length)])}
              className="w-full bg-gradient-to-r from-purple-900/60 to-pink-900/60 hover:from-purple-900/80 hover:to-pink-900/80 border-2 border-purple-500/50 rounded-xl py-4 px-4 transition-colors text-white font-medium mb-3"
            >
              💕 Interactive Date Scenario
            </button>

            <p className="text-gray-400 text-xs mb-2">Or select a quick activity:</p>
            {DATE_ACTIVITIES.map((activity, i) => (
              <button
                key={i}
                onClick={() => handleDate(activity)}
                className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-3 text-left transition-colors text-white text-sm"
              >
                {activity}
              </button>
            ))}

            {(selectedDate.relationship_level || 0) > 40 && (
              <button
                onClick={handleIntimacy}
                className="w-full bg-pink-900/60 hover:bg-pink-900/80 border-2 border-pink-500/50 rounded-xl p-4 transition-colors mt-4"
              >
                <Heart className="w-5 h-5 text-pink-400 mx-auto mb-2" />
                <p className="text-white font-medium text-center">Be Intimate</p>
                <p className="text-pink-300 text-xs text-center mt-1">
                  {selectedDate.date_type === 'hunter' ? 'Enemy. Lover. Both.' : 'Cross the line together.'}
                </p>
              </button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}