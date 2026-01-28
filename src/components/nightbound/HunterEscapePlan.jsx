import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle, Plane } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const ESCAPE_ROUTES = [
  {
    id: 'disappear',
    title: 'Disappear Without a Trace',
    description: 'Leave everything behind. New identities, new city, new life.',
    prepTime: 'Fast (2 days)',
    risk: 'Getting caught at borders, loss of hunter career',
    reward: 'Freedom, complete bond, new beginning',
    bondGain: 30
  },
  {
    id: 'fake_death',
    title: 'Fake Your Death',
    description: 'Stage your death as a hunter killed in action. Easier to disappear after.',
    prepTime: 'Medium (1 week)',
    risk: 'Elaborate deception, hunter investigation',
    reward: 'Clean break, presumed dead, safer escape',
    bondGain: 25
  },
  {
    id: 'go_underground',
    title: 'Join Underground Vampire Society',
    description: 'Leave the hunter life, become part of their hidden world.',
    prepTime: 'Long (2 weeks)',
    risk: 'Losing human contacts, becoming hunted yourself',
    reward: 'Secret society protection, vampire knowledge',
    bondGain: 35
  },
  {
    id: 'slow_retreat',
    title: 'Gradually Fade Away',
    description: 'Slowly resign, move out of state, maintain cover story.',
    prepTime: 'Very Long (1 month)',
    risk: 'Suspicion builds, could be discovered anytime',
    reward: 'Less risky, maintains some normalcy',
    bondGain: 15
  }
];

export default function HunterEscapePlan({ hunter, vampire, onClose }) {
  const queryClient = useQueryClient();
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEscape = async (route) => {
    setLoading(true);
    try {
      if (vampire.id) {
        await base44.entities.VampireState.update(vampire.id, {
          hunter_relationship: Math.min(100, (vampire.hunter_relationship || 0) + route.bondGain),
          living_with_hunter: true // Solidify the living together status
        });
      }

      await base44.entities.NightLog.create({
        entry: `${hunter.name} and ${vampire.vampire_name} made the ultimate choice: "${route.title}". They escaped together to start anew. A new chapter begins...`,
        category: 'escape',
        intensity: 'climactic'
      });

      queryClient.invalidateQueries();
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (e) {
      console.error('Failed to execute escape plan:', e);
    }
    setLoading(false);
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
        className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl p-8 max-w-3xl w-full border border-gray-800 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Plane className="w-6 h-6 text-red-500" />
            Escape Plans
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-400 mb-6 text-sm">The hunters are closing in. It's time to leave. Choose your escape.</p>

        {!selectedRoute ? (
          <div className="space-y-3">
            {ESCAPE_ROUTES.map(route => (
              <button
                key={route.id}
                onClick={() => setSelectedRoute(route)}
                className="w-full p-4 rounded-lg border border-red-500/30 bg-red-950/20 hover:bg-red-950/40 transition-all text-left"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-bold">{route.title}</h3>
                  <span className="text-red-400 text-xs font-bold">{route.prepTime}</span>
                </div>
                <p className="text-gray-300 text-sm mb-2">{route.description}</p>
                <div className="flex justify-between text-xs">
                  <span className="text-red-400">Risk: {route.risk}</span>
                  <span className="text-green-400">Bond: +{route.bondGain}%</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-red-950/30 border border-red-500/30 rounded-lg p-6">
              <h3 className="text-white text-xl font-bold mb-4">{selectedRoute.title}</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-gray-400 text-xs mb-1">DESCRIPTION</p>
                  <p className="text-white">{selectedRoute.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">PREP TIME</p>
                    <p className="text-white font-medium">{selectedRoute.prepTime}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">RISK LEVEL</p>
                    <p className="text-red-400 font-medium">EXTREME</p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-xs mb-1">RISKS</p>
                  <p className="text-red-300">{selectedRoute.risk}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-xs mb-1">REWARDS</p>
                  <p className="text-green-300">{selectedRoute.reward}</p>
                </div>
              </div>

              {!confirmed ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmed(true)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors font-bold"
                  >
                    I'm Ready to Escape
                  </button>
                  <button
                    onClick={() => setSelectedRoute(null)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                  >
                    Back
                  </button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <p className="text-yellow-400 text-sm font-medium">⚠️ This is a point of no return. Are you absolutely certain?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEscape(selectedRoute)}
                      disabled={loading}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 rounded-lg transition-colors font-bold text-lg"
                    >
                      {loading ? 'ESCAPING...' : 'YES, ESCAPE NOW'}
                    </button>
                    <button
                      onClick={() => setConfirmed(false)}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors font-bold"
                    >
                      Wait, I Changed My Mind
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}