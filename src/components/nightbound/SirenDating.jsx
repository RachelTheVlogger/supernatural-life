import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Heart, Waves, Moon, Target, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const BEING_TYPES = [
  { id: 'vampire', label: 'Vampire', icon: Moon, color: 'red' },
  { id: 'human', label: 'Human', icon: Target, color: 'yellow' },
  { id: 'siren', label: 'Siren', icon: Waves, color: 'cyan' },
  { id: 'hunter', label: 'Hunter', icon: Zap, color: 'orange' }
];

const DATE_ACTIVITIES = [
  'Moonlit swim together',
  'Sing a duet',
  'Dance on the water',
  'Share secrets by the shore',
  'Underwater adventure',
  'Watch stars from the waves',
  'Seduce them with your voice',
  'Playful water games',
  'Intimate conversation',
  'Dangerous game of chase'
];

export default function SirenDating({ siren, onClose }) {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(null);
  const [creating, setCreating] = useState(false);
  const [dating, setDating] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [currentScenario, setCurrentScenario] = useState(null);

  const { data: dates = [] } = useQuery({
    queryKey: ['sirenDates', siren?.id],
    queryFn: async () => {
      if (!siren?.id) return [];
      return await base44.entities.SupernaturalDate.filter({ date_name: `siren_${siren.id}` });
    },
    enabled: !!siren?.id
  });

  const handleCreateDate = async (type) => {
    setCreating(true);

    setTimeout(async () => {
      const names = ['Adrian', 'Luna', 'Dante', 'Selene', 'Marcus', 'Raven', 'Viktor', 'Morgana'];
      const personalities = ['mysterious', 'seductive', 'protective', 'adventurous', 'passionate'];
      
      try {
        await base44.entities.SupernaturalDate.create({
          vampire_id: siren.id,
          date_name: names[Math.floor(Math.random() * names.length)],
          date_type: type.id,
          gender: 'custom',
          personality: [
            personalities[Math.floor(Math.random() * personalities.length)],
            personalities[Math.floor(Math.random() * personalities.length)]
          ],
          relationship_level: 0,
          tension_level: 50,
          dangerous_attraction: type.id === 'hunter'
        });

        await base44.entities.NightLog.create({
          entry: `You met a ${type.label}. Their eyes met yours. The water shimmered. Something begins.`,
          category: 'interaction',
          intensity: 'moderate'
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
      const success = Math.random() > 0.2;
      const relationshipGain = success ? Math.floor(Math.random() * 15) + 10 : -10;

      const successOutcomes = [
        `${activity} with ${selectedDate.date_name}. They were mesmerized by you. Your voice, your beauty. Irresistible.`,
        `Perfect moment. ${selectedDate.date_name} fell deeper. You felt their heart racing. Connection undeniable.`,
        `${selectedDate.date_name} opened up to you. Your spell working perfectly. They're yours now.`
      ];

      const failOutcomes = [
        `${selectedDate.date_name} resisted your charm. Pulled away. You felt the rejection.`,
        `Something went wrong. ${selectedDate.date_name} saw through your seduction. Barriers up.`,
        `${selectedDate.date_name} turned cold. Your power weakening against their will.`
      ];

      const result = success ? successOutcomes[Math.floor(Math.random() * successOutcomes.length)] : failOutcomes[Math.floor(Math.random() * failOutcomes.length)];
      setOutcome(result);

      try {
        await base44.entities.SupernaturalDate.update(selectedDate.id, {
          relationship_level: Math.max(0, Math.min(100, (selectedDate.relationship_level || 0) + relationshipGain)),
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
      const outcomes = [
        `Underwater embrace with ${selectedDate.date_name}. Bodies entwined. Water churning around you. Pure ocean magic.`,
        `${selectedDate.date_name} surrendered to you completely. Your voice, your touch. They're lost in the depths of desire.`,
        `Intimate with ${selectedDate.date_name} beneath the waves. Transcendent. Perfect. They're yours forever.`,
        `${selectedDate.date_name} moved against you. The water a witness to your passion. Siren's power at its peak.`
      ];

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
          <Heart className="w-6 h-6 text-cyan-400" />
          Siren Romance
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Seduce. Enchant. Make them yours. Your voice is irresistible.
        </p>

        {creating || dating ? (
          <div className="text-center py-12">
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-gray-400"
            >
              {creating ? 'Fate brings someone...' : '...'}
            </motion.p>
          </div>
        ) : outcome ? (
          <div className="text-center py-12">
            <p className="text-gray-300 leading-relaxed">{outcome}</p>
          </div>
        ) : !selectedDate ? (
          <>
            <h3 className="text-white font-medium mb-3">Your Lovers</h3>
            
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
                        <Icon className={`w-6 h-6 text-${type?.color || 'cyan'}-400 mt-1`} />
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{date.date_name}</h4>
                          <p className="text-gray-400 text-sm capitalize">
                            {date.date_type} • {date.relationship_status || 'casual'}
                          </p>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                            <div>
                              <p className="text-gray-500">Romance</p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                                  <div
                                    style={{ width: `${date.relationship_level || 0}%` }}
                                    className="h-1.5 bg-cyan-500 rounded-full"
                                  />
                                </div>
                                <span className="text-cyan-400 w-8">{date.relationship_level || 0}</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-500">Intimacy</p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                                  <div
                                    style={{ width: `${date.intimacy_level || 0}%` }}
                                    className="h-1.5 bg-blue-500 rounded-full"
                                  />
                                </div>
                                <span className="text-blue-400 w-8">{date.intimacy_level || 0}</span>
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

            <h3 className="text-white font-medium mb-3">Enchant Someone New</h3>
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
              className="text-cyan-400 hover:text-cyan-300 text-sm mb-3"
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
              onClick={() => setCurrentScenario(SIREN_DATE_SCENARIOS[Math.floor(Math.random() * SIREN_DATE_SCENARIOS.length)])}
              className="w-full bg-gradient-to-r from-cyan-900/60 to-teal-900/60 hover:from-cyan-900/80 hover:to-teal-900/80 border-2 border-cyan-500/50 rounded-xl py-4 px-4 transition-colors text-white font-medium mb-3"
            >
              🌊 Interactive Date Scenario
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
                className="w-full bg-cyan-900/60 hover:bg-cyan-900/80 border-2 border-cyan-500/50 rounded-xl p-4 transition-colors mt-4"
              >
                <Heart className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                <p className="text-white font-medium text-center">Be Intimate</p>
                <p className="text-cyan-300 text-xs text-center mt-1">Surrender to passion beneath the waves.</p>
              </button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}