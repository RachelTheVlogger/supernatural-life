import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Flame, Brain, Heart, Droplet, Dna, Edit2, Plus } from 'lucide-react';
import MutantProgression from '@/components/nightbound/MutantProgression';
import MutantPowerTree from '@/components/nightbound/MutantPowerTree';
import { MutantAnimationWrapper } from '@/components/nightbound/MutantAnimations';
import MutantAppearanceCustomizer from '@/components/nightbound/MutantAppearanceCustomizer';
import MutantAestheticsShop from '@/components/nightbound/MutantAestheticsShop';

const MUTANT_TYPE_INFO = {
  feral: { icon: Zap, label: 'Feral', color: 'from-red-600 to-orange-600' },
  psychic: { icon: Brain, label: 'Psychic', color: 'from-purple-600 to-pink-600' },
  elemental: { icon: Flame, label: 'Elemental', color: 'from-blue-600 to-cyan-600' },
  healer: { icon: Heart, label: 'Healer', color: 'from-green-600 to-emerald-600' },
  enhanced: { icon: Zap, label: 'Enhanced', color: 'from-yellow-600 to-amber-600' },
  shapeshifter: { icon: Dna, label: 'Shapeshifter', color: 'from-indigo-600 to-violet-600' },
  toxic: { icon: Droplet, label: 'Toxic', color: 'from-green-700 to-lime-600' }
};

export default function MutantHome() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [mutantName, setMutantName] = useState('');
  const [mutantType, setMutantType] = useState('enhanced');
  const [mutantGender, setMutantGender] = useState('custom');
  const [mutantSexuality, setMutantSexuality] = useState('bisexual');

  const { data: mutants = [] } = useQuery({
    queryKey: ['mutants'],
    queryFn: () => base44.entities.Mutant.list()
  });

  const urlParams = new URLSearchParams(window.location.search);
  const mutantId = urlParams.get('id');
  const mutant = mutantId ? mutants.find(m => m.id === mutantId) : mutants[0];

  const typeInfo = MUTANT_TYPE_INFO[mutant?.mutant_type] || MUTANT_TYPE_INFO.enhanced;
  const TypeIcon = typeInfo.icon;

  const handleCreateMutant = async () => {
    if (!mutantName.trim()) {
      alert('Please enter a name');
      return;
    }

    try {
      await base44.entities.Mutant.create({
        name: mutantName.trim(),
        gender: mutantGender,
        sexuality: mutantSexuality,
        mutant_type: mutantType,
        power_level: 30,
        mutation_stability: 50,
        transformation_stage: 1,
        unlocked_powers: []
      });

      queryClient.invalidateQueries();
      setShowCreateModal(false);
      setMutantName('');
    } catch (e) {
      console.error('Failed to create mutant:', e);
    }
  };

  const handleRenameMutant = async () => {
    if (!newName.trim()) {
      alert('Please enter a name');
      return;
    }

    try {
      await base44.entities.Mutant.update(mutant.id, {
        name: newName.trim()
      });

      queryClient.invalidateQueries();
      setShowRenameModal(false);
    } catch (e) {
      console.error('Failed to rename mutant:', e);
    }
  };

  const handleActivateMutation = async () => {
    setProcessing(true);

    setTimeout(async () => {
      const outcomes = [
        'Your powers surge. The mutation activates. You feel unstoppable.',
        'Energy courses through you. Your mutant abilities awaken and intensify.',
        'Control achieved. Your mutation responds to your will perfectly.'
      ];

      setOutcome(outcomes[Math.floor(Math.random() * outcomes.length)]);

      const newPower = Math.min((mutant.power_level || 30) + 3, 100);
      const newUnlocked = [...(mutant.unlocked_powers || [])];
      
      if (newPower % 10 === 0 && newUnlocked.length < 15) {
        newUnlocked.push(`Power Level ${newPower}`);
      }

      await base44.entities.Mutant.update(mutant.id, {
        power_level: newPower,
        mutations_activated: (mutant.mutations_activated || 0) + 1,
        unlocked_powers: newUnlocked
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  const handleTransform = async () => {
    setProcessing(true);

    setTimeout(async () => {
      const isTransformed = !mutant.is_transformed;
      const result = isTransformed
        ? 'Your body shifts. Muscles expand. Your true form emerges.'
        : 'Your form stabilizes. The transformation recedes. You return to normal.';

      setOutcome(result);

      await base44.entities.Mutant.update(mutant.id, {
        is_transformed: isTransformed,
        transformation_count: isTransformed ? (mutant.transformation_count || 0) + 1 : mutant.transformation_count
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  const handleIncreasePower = async () => {
    setProcessing(true);

    setTimeout(async () => {
      setOutcome('Your mutation grows stronger. The transformation deepens.');

      await base44.entities.Mutant.update(mutant.id, {
        power_level: Math.min((mutant.power_level || 30) + 5, 100),
        mutation_stability: Math.min((mutant.mutation_stability || 50) + 2, 100)
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  if (!mutant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-950 to-gray-900 p-4">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No mutant found</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
          >
            Create Mutant
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 p-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-8">
          <MutantAnimationWrapper mutantType={mutant.mutant_type}>
            <div className="inline-block">
              <TypeIcon className="w-12 h-12 text-white mx-auto mb-4" />
            </div>
          </MutantAnimationWrapper>

          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            {mutant.name}
            <button
              onClick={() => {
                setNewName(mutant.name);
                setShowRenameModal(true);
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          </h1>
          <p className="text-gray-400 mb-3">{typeInfo.label} Mutant</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            <Plus className="w-4 h-4" /> Create New Mutant
          </button>
        </div>

        {/* Stats */}
        <div className={`bg-gradient-to-r ${typeInfo.color} rounded-2xl p-6 mb-6 shadow-lg`}>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2 text-white/80">
                <span>Mutation Power</span>
                <span>{mutant.power_level || 0}/100</span>
              </div>
              <div className="w-full bg-black/30 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((mutant.power_level || 0), 100)}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-3 rounded-full bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2 text-white/80">
                <span>Stability</span>
                <span>{mutant.mutation_stability || 50}/100</span>
              </div>
              <div className="w-full bg-black/30 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((mutant.mutation_stability || 50), 100)}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-3 rounded-full bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4">
              <div className="text-center bg-black/30 rounded-lg p-3">
                <p className="text-white/60 text-xs">Transformations</p>
                <p className="text-white text-xl font-bold">{mutant.transformation_count || 0}</p>
              </div>
              <div className="text-center bg-black/30 rounded-lg p-3">
                <p className="text-white/60 text-xs">Activations</p>
                <p className="text-white text-xl font-bold">{mutant.mutations_activated || 0}</p>
              </div>
              <div className="text-center bg-black/30 rounded-lg p-3">
                <p className="text-white/60 text-xs">Stage</p>
                <p className="text-white text-xl font-bold">{mutant.transformation_stage || 1}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {processing || outcome ? (
          <div className="bg-gray-900/50 rounded-2xl p-12 text-center mb-6">
            {processing ? (
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-purple-400"
              >
                ...
              </motion.p>
            ) : (
              <p className="text-gray-300 leading-relaxed">{outcome}</p>
            )}
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            <button
              onClick={handleActivateMutation}
              className="w-full bg-gradient-to-r from-purple-900/60 to-pink-900/60 hover:from-purple-900/80 hover:to-pink-900/80 border-2 border-purple-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all text-left"
            >
              <Zap className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-white font-medium">Activate Mutation</h3>
                <p className="text-purple-300 text-sm">Unleash your powers.</p>
              </div>
            </button>

            <button
              onClick={handleTransform}
              className="w-full bg-gradient-to-r from-blue-900/60 to-cyan-900/60 hover:from-blue-900/80 hover:to-cyan-900/80 border-2 border-blue-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all text-left"
            >
              <Dna className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-white font-medium">
                  {mutant.is_transformed ? 'Return to Normal' : 'Full Transformation'}
                </h3>
                <p className="text-cyan-300 text-sm">
                  {mutant.is_transformed ? 'Revert to human form.' : 'Embrace your true nature.'}
                </p>
              </div>
            </button>

            <button
              onClick={handleIncreasePower}
              className="w-full bg-gradient-to-r from-orange-900/60 to-red-900/60 hover:from-orange-900/80 hover:to-red-900/80 border-2 border-orange-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all text-left"
            >
              <Flame className="w-5 h-5 text-orange-400 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-white font-medium">Increase Power</h3>
                <p className="text-orange-300 text-sm">Train and strengthen your mutation.</p>
              </div>
            </button>
          </div>
        )}

        {/* Progression */}
        <MutantProgression mutant={mutant} />

        {/* Power Tree */}
        <MutantPowerTree mutant={mutant} />

        {/* Rename Modal */}
        {showRenameModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setShowRenameModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-purple-500/30"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Rename Mutant</h2>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New name..."
                className="w-full bg-gray-800 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 mb-6 focus:outline-none focus:border-purple-500"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRenameModal(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRenameMutant}
                  disabled={!newName.trim()}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Rename
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-purple-500/30 max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Create New Mutant</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  value={mutantName}
                  onChange={(e) => setMutantName(e.target.value)}
                  placeholder="Mutant name..."
                  className="w-full bg-gray-800 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  autoFocus
                />

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Mutant Type</label>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {Object.entries(MUTANT_TYPE_INFO).map(([key, info]) => (
                      <button
                        key={key}
                        onClick={() => setMutantType(key)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                          mutantType === key
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {info.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Gender</label>
                  <div className="space-y-2">
                    {['man', 'woman', 'custom'].map(g => (
                      <button
                        key={g}
                        onClick={() => setMutantGender(g)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                          mutantGender === g
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateMutant}
                    disabled={!mutantName.trim()}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    Create
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}