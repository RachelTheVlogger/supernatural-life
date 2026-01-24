import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Droplets, Plus, X, Trash2, Heart, AlertTriangle } from 'lucide-react';

const BLOOD_TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export default function CattleManagement({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [selectedCattle, setSelectedCattle] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [feeding, setFeeding] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [newName, setNewName] = useState('');
  const [newBloodType, setNewBloodType] = useState('O+');
  const [newQuality, setNewQuality] = useState('average');

  const { data: cattle = [] } = useQuery({
    queryKey: ['cattle', vampireState?.id],
    queryFn: async () => {
      if (!vampireState?.id) return [];
      return await base44.entities.Cattle.filter({ vampire_id: vampireState.id });
    },
    enabled: !!vampireState?.id
  });

  const handleAddCattle = async () => {
    if (!newName.trim()) return;

    try {
      await base44.entities.Cattle.create({
        vampire_id: vampireState.id,
        name: newName.trim(),
        blood_type: newBloodType,
        quality: newQuality,
        location: 'Hidden location'
      });

      queryClient.invalidateQueries(['cattle']);
      setNewName('');
      setNewBloodType('O+');
      setNewQuality('average');
      setShowAdd(false);
    } catch (e) {
      console.error('Failed to add cattle:', e);
    }
  };

  const handleFeed = async (cattleItem) => {
    if (!cattleItem.is_alive) {
      setOutcome(`${cattleItem.name} is dead. You'll need to dispose of them.`);
      return;
    }

    setFeeding(true);
    setSelectedCattle(cattleItem);

    setTimeout(async () => {
      try {
        const qualityMultiplier = { poor: 0.5, average: 1, good: 1.5, premium: 2 };
        const satisfaction = 20 * (qualityMultiplier[cattleItem.quality] || 1);

        const feedOutcomes = [
          `You fed on ${cattleItem.name}. Fresh, warm blood. Hunger sated.`,
          `${cattleItem.name} submitted without resistance. Their blood was delicious.`,
          `Perfect feeding from ${cattleItem.name}. You felt renewed.`,
          `${cattleItem.name} whimpered as you drank. Quality sustenance.`
        ];

        setOutcome(feedOutcomes[Math.floor(Math.random() * feedOutcomes.length)]);

        const newHealth = Math.max((cattleItem.health || 100) - 20, 0);
        const newDisposition = newHealth < 30 ? 'fearful' : 'nervous';

        await base44.entities.Cattle.update(cattleItem.id, {
          health: newHealth,
          times_fed_on: (cattleItem.times_fed_on || 0) + 1,
          last_fed_on: new Date().toISOString(),
          disposition: newDisposition,
          is_alive: newHealth > 0
        });

        if (vampireState?.id) {
          await base44.entities.VampireState.update(vampireState.id, {
            hunger_state: 'sated',
            last_feed: new Date().toISOString()
          });
        }

        await base44.entities.NightLog.create({
          entry: `Fed on cattle: ${cattleItem.name}. ${setOutcome ? 'Health: ' + newHealth : ''}`,
          category: 'feeding',
          intensity: 'moderate'
        });

        queryClient.invalidateQueries();
      } catch (e) {
        console.error('Failed to feed:', e);
      }

      setTimeout(() => {
        setFeeding(false);
        setOutcome('');
        setSelectedCattle(null);
      }, 3000);
    }, 2000);
  };

  const handleDispose = async (cattleItem) => {
    if (!window.confirm(`Dispose of ${cattleItem.name}?`)) return;

    try {
      await base44.entities.Cattle.delete(cattleItem.id);
      queryClient.invalidateQueries(['cattle']);
    } catch (e) {
      console.error('Failed to dispose:', e);
    }
  };

  const aliveCattle = cattle.filter(c => c.is_alive);
  const deadCattle = cattle.filter(c => !c.is_alive);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-red-500/30"
      >
        <div className="sticky top-0 bg-gray-900 border-b border-red-500/30 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Droplets className="w-6 h-6 text-red-400" />
              Cattle Management
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {feeding || outcome ? (
            <div className="text-center py-12">
              {feeding ? (
                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-red-400"
                >
                  Feeding...
                </motion.p>
              ) : (
                <p className="text-gray-300">{outcome}</p>
              )}
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-xs">Alive</p>
                  <p className="text-white text-2xl font-bold">{aliveCattle.length}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-xs">Dead</p>
                  <p className="text-white text-2xl font-bold">{deadCattle.length}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-xs">Total</p>
                  <p className="text-white text-2xl font-bold">{cattle.length}</p>
                </div>
              </div>

              {/* Add Cattle */}
              {!showAdd ? (
                <button
                  onClick={() => setShowAdd(true)}
                  className="w-full bg-red-900/60 hover:bg-red-900/80 border border-red-500/50 rounded-lg p-3 text-white font-medium mb-6 flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Acquire Cattle
                </button>
              ) : (
                <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-red-500/30">
                  <h3 className="text-white font-medium mb-3">New Cattle</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Name..."
                      className="w-full bg-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 text-sm"
                    />
                    <select
                      value={newBloodType}
                      onChange={(e) => setNewBloodType(e.target.value)}
                      className="w-full bg-gray-700 rounded px-3 py-2 text-white text-sm"
                    >
                      {BLOOD_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <select
                      value={newQuality}
                      onChange={(e) => setNewQuality(e.target.value)}
                      className="w-full bg-gray-700 rounded px-3 py-2 text-white text-sm"
                    >
                      <option value="poor">Poor Quality</option>
                      <option value="average">Average Quality</option>
                      <option value="good">Good Quality</option>
                      <option value="premium">Premium Quality</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddCattle}
                        disabled={!newName.trim()}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setShowAdd(false)}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Alive Cattle */}
              {aliveCattle.length > 0 && (
                <>
                  <h3 className="text-white font-bold mb-3">Active Livestock</h3>
                  <div className="space-y-2 mb-6">
                    {aliveCattle.map(c => (
                      <motion.div
                        key={c.id}
                        className="bg-gray-800 rounded-lg p-3 border border-red-500/20 hover:border-red-500/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="text-white font-medium">{c.name}</h4>
                            <p className="text-gray-400 text-xs">{c.blood_type} • {c.quality} • Fed {c.times_fed_on}x</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded capitalize ${
                            c.disposition === 'fearful' ? 'bg-red-900 text-red-300' :
                            c.disposition === 'resistant' ? 'bg-orange-900 text-orange-300' :
                            'bg-yellow-900 text-yellow-300'
                          }`}>
                            {c.disposition}
                          </span>
                        </div>
                        <div className="mb-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Health</span>
                            <span className="text-white">{c.health}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div
                              style={{ width: `${c.health}%` }}
                              className="h-1.5 rounded-full bg-red-500"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleFeed(c)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                          >
                            Feed
                          </button>
                          <button
                            onClick={() => handleDispose(c)}
                            className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded text-xs transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}

              {/* Dead Cattle */}
              {deadCattle.length > 0 && (
                <>
                  <h3 className="text-gray-400 font-bold mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Expired ({deadCattle.length})
                  </h3>
                  <div className="space-y-2">
                    {deadCattle.map(c => (
                      <div key={c.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-gray-400 line-through">{c.name}</h4>
                            <p className="text-gray-500 text-xs">Dead • {c.blood_type}</p>
                          </div>
                          <button
                            onClick={() => handleDispose(c)}
                            className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {cattle.length === 0 && (
                <div className="text-center py-12">
                  <Droplets className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No cattle acquired yet</p>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}