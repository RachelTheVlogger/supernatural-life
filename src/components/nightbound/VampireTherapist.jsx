import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Eye, Zap, DollarSign } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const CLIENT_PROBLEMS = [
  { name: 'Lilith Hart', issue: 'Trust issues and intimacy fears', severity: 'severe', payment: 200, special: true },
  { name: 'Sarah Chen', issue: 'Anxiety about career change', severity: 'moderate', payment: 150 },
  { name: 'Marcus Williams', issue: 'Depression after breakup', severity: 'severe', payment: 180 },
  { name: 'Emma Rodriguez', issue: 'Work-life balance stress', severity: 'mild', payment: 120 },
  { name: 'David Park', issue: 'Traumatic childhood memories', severity: 'severe', payment: 200 },
  { name: 'Lisa Thompson', issue: 'Social anxiety disorder', severity: 'moderate', payment: 160 }
];

const THERAPY_APPROACHES = [
  { id: 'ethical', label: 'Professional Therapy', desc: 'Help them through conversation and expertise', humanity: 5, icon: Brain },
  { id: 'read', label: 'Read Their Mind', desc: 'Use powers to understand their deepest fears', humanity: -3, icon: Eye },
  { id: 'compel', label: 'Compel Happiness', desc: 'Force them to forget their problems', humanity: -10, icon: Zap },
  { id: 'feed', label: 'Feed During Session', desc: 'Use therapy as hunting ground', humanity: -15, icon: '🩸' }
];

export default function VampireTherapist({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [sessionActive, setSessionActive] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [selectedApproach, setSelectedApproach] = useState(null);
  const [outcome, setOutcome] = useState('');
  const [processing, setProcessing] = useState(false);

  if (!vampireState) {
    return null;
  }

  const startSession = (client) => {
    setCurrentClient(client);
    setSessionActive(true);
    setSelectedApproach(null);
    setOutcome('');
  };

  const handleApproach = async (approach) => {
    if (processing) return;
    setSelectedApproach(approach.id);
    setProcessing(true);

    setTimeout(async () => {
      const outcomes = {
        ethical: [
          `You helped ${currentClient.name} work through their ${currentClient.issue}. They left feeling understood. You feel good about your work.`,
          `Genuine breakthrough. ${currentClient.name} cried tears of relief. They'll recommend you to friends.`,
          `Professional session. ${currentClient.name} made progress on their ${currentClient.issue}. Honest work feels rare these days.`
        ],
        read: [
          `You saw everything. Their fears, desires, secrets. You knew exactly what to say. They think you're a genius. Your humanity dims.`,
          `Reading their mind revealed trauma they haven't told anyone. You helped them... but you violated their privacy. The power is intoxicating.`,
          `Mind reading made this easy. Too easy. ${currentClient.name} is amazed by your insight. You feel nothing.`
        ],
        compel: [
          `You compelled them to feel happy. They left smiling, problems forgotten. But the issues remain buried. You monster.`,
          `"You're cured!" they said, walking out in a daze. You removed symptoms, not causes. This is wrong.`,
          `Compulsion is efficient. ${currentClient.name} believes they're fixed. You've created a temporary illusion. Your humanity slips.`
        ],
        feed: [
          `You fed while they cried. Used their vulnerability. Compelled them to forget both problems and bite marks. You're a predator in therapist's clothing.`,
          `Therapy ended with them on your couch, drained. You took their blood and memories. This is who you are now.`,
          `The session was just foreplay. You fed, compelled, sent them home. They'll return, addicted to the "relief" you provide.`
        ]
      };

      const outcomeText = outcomes[approach.id][Math.floor(Math.random() * outcomes[approach.id].length)];
      setOutcome(outcomeText);

      // Update vampire state
      const newHumanity = Math.max(0, Math.min(100, vampireState.humanity + approach.humanity));
      await base44.entities.VampireState.update(vampireState.id, {
        humanity: newHumanity
      });

      // Log the session
      await base44.entities.NightLog.create({
        entry: `Therapy session with ${currentClient.name}: ${outcomeText}`,
        category: 'interaction',
        intensity: approach.humanity < 0 ? 'significant' : 'moderate'
      });

      queryClient.invalidateQueries(['vampireState']);

      setTimeout(() => {
        setProcessing(false);
        setSessionActive(false);
        setCurrentClient(null);
      }, 4000);
    }, 2000);
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
        className="bg-gradient-to-b from-gray-900 to-black rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto relative border-2 border-blue-900/50"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-8 h-8 text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Dr. Nate Cross</h2>
            <p className="text-gray-400 text-sm">Licensed therapist. Vampire. Complicated.</p>
          </div>
        </div>

        {!sessionActive ? (
          <div className="space-y-4">
            <div className="bg-blue-950/30 rounded-xl p-4 border border-blue-800/30">
              <p className="text-blue-300 text-sm mb-2">💡 Dr. Nate Cross - Your Story</p>
              <p className="text-gray-300 text-sm">
                Licensed therapist. You help people by day, feed by night. Then Lilith Hart walked into your office.
                A year of stolen glances. Professional boundaries tested. The attraction unbearable. You both finally gave in.
                Sexual. Passionate. Consuming. She asked for eternity. You turned her. Now she's yours forever... or is she?
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-white font-medium">Your Humanity</h3>
                <span className={`font-bold ${vampireState.humanity > 60 ? 'text-green-400' : vampireState.humanity > 30 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {vampireState.humanity}/100
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${vampireState.humanity > 60 ? 'bg-green-500' : vampireState.humanity > 30 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${vampireState.humanity}%` }}
                />
              </div>
            </div>

            <h3 className="text-white font-bold text-lg">Today's Clients</h3>
            <div className="space-y-3">
              {CLIENT_PROBLEMS.map(client => (
                <button
                  key={client.name}
                  onClick={() => startSession(client)}
                  className={`w-full rounded-xl p-4 text-left transition-all ${
                    client.special 
                      ? 'bg-gradient-to-r from-pink-900/40 to-red-900/40 hover:from-pink-900/60 hover:to-red-900/60 border-2 border-pink-500/50'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-white font-medium">{client.name}</h4>
                      {client.special && <p className="text-pink-400 text-xs">Your lover. Now vampire.</p>}
                    </div>
                    <span className="text-green-400 text-sm">${client.payment}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{client.issue}</p>
                  <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                    client.severity === 'severe' ? 'bg-red-900/30 text-red-300' :
                    client.severity === 'moderate' ? 'bg-yellow-900/30 text-yellow-300' :
                    'bg-green-900/30 text-green-300'
                  }`}>
                    {client.severity}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {!outcome ? (
              <>
                <div className="bg-blue-950/30 rounded-xl p-4 border border-blue-800/30">
                  <h3 className="text-white font-bold mb-2">{currentClient.name}</h3>
                  <p className="text-gray-300 text-sm mb-2">"{currentClient.issue}"</p>
                  <p className="text-blue-300 text-xs">Session fee: ${currentClient.payment}</p>
                </div>

                <h4 className="text-white font-medium">Choose Your Approach</h4>
                <div className="space-y-3">
                  {THERAPY_APPROACHES.map(approach => {
                    const Icon = typeof approach.icon === 'string' ? null : approach.icon;
                    return (
                      <button
                        key={approach.id}
                        onClick={() => handleApproach(approach)}
                        disabled={processing}
                        className={`w-full rounded-xl p-4 text-left transition-all ${
                          approach.humanity < 0 
                            ? 'bg-red-900/30 hover:bg-red-900/50 border-2 border-red-500/30'
                            : 'bg-green-900/30 hover:bg-green-900/50 border-2 border-green-500/30'
                        } disabled:opacity-50`}
                      >
                        <div className="flex items-start gap-3">
                          {Icon ? <Icon className="w-5 h-5 text-white mt-1" /> : <span className="text-2xl">{approach.icon}</span>}
                          <div className="flex-1">
                            <h5 className="text-white font-medium mb-1">{approach.label}</h5>
                            <p className="text-gray-400 text-sm">{approach.desc}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <span className={`text-xs ${approach.humanity > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                Humanity {approach.humanity > 0 ? '+' : ''}{approach.humanity}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-800 rounded-xl p-6 text-center"
              >
                <p className="text-gray-300 leading-relaxed">{outcome}</p>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}