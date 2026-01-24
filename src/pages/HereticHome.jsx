import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Wand2, Droplet, Zap, Heart, Edit2, Plus, BookOpen, Moon } from 'lucide-react';

export default function HereticHome() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [hereticName, setHereticName] = useState('');
  const [hereticGender, setHereticGender] = useState('custom');
  const [hereticSexuality, setHereticSexuality] = useState('bisexual');

  const { data: heretics = [] } = useQuery({
    queryKey: ['heretics'],
    queryFn: () => base44.entities.Heretic.list()
  });

  const urlParams = new URLSearchParams(window.location.search);
  const hereticId = urlParams.get('id');
  const heretic = hereticId ? heretics.find(h => h.id === hereticId) : heretics[0];

  const handleCreateHeretic = async () => {
    if (!hereticName.trim()) {
      alert('Please enter a name');
      return;
    }

    try {
      await base44.entities.Heretic.create({
        name: hereticName.trim(),
        gender: hereticGender,
        sexuality: hereticSexuality,
        vampire_power: 40,
        witch_power: 40,
        balance: 50,
        transformation_stage: 1
      });

      queryClient.invalidateQueries();
      setShowCreateModal(false);
      setHereticName('');
    } catch (e) {
      console.error('Failed to create heretic:', e);
    }
  };

  const handleRenameHeretic = async () => {
    if (!newName.trim()) {
      alert('Please enter a name');
      return;
    }

    try {
      await base44.entities.Heretic.update(heretic.id, {
        name: newName.trim()
      });

      queryClient.invalidateQueries();
      setShowRenameModal(false);
    } catch (e) {
      console.error('Failed to rename heretic:', e);
    }
  };

  const handleCastSpell = async () => {
    setProcessing(true);

    setTimeout(async () => {
      const spells = [
        'You wove magic and blood together. Dark power surged through you.',
        'Incantation spoken. Your blood flowed with arcane energy. The spell manifested.',
        'Vampire strength and witch magic merged. The spell was irresistible.'
      ];

      setOutcome(spells[Math.floor(Math.random() * spells.length)]);

      const newWitchPower = Math.min((heretic.witch_power || 40) + 2, 100);
      const newConflict = Math.max((heretic.conflict_level || 0) - 1, 0);

      await base44.entities.Heretic.update(heretic.id, {
        witch_power: newWitchPower,
        spells_cast: (heretic.spells_cast || 0) + 1,
        magic_reserves: Math.max((heretic.magic_reserves || 50) - 15, 0),
        conflict_level: newConflict
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  const handleFeed = async () => {
    setProcessing(true);

    setTimeout(async () => {
      const outcomes = [
        'Blood flowed. The hunger was quelled. Strength coursed through you.',
        'You fed. Power surged. The vampire in you awakened.',
        'The thirst was satisfied. You felt invincible.'
      ];

      setOutcome(outcomes[Math.floor(Math.random() * outcomes.length)]);

      const newVampirePower = Math.min((heretic.vampire_power || 40) + 3, 100);

      await base44.entities.Heretic.update(heretic.id, {
        vampire_power: newVampirePower,
        feedings: (heretic.feedings || 0) + 1,
        blood_hunger: Math.max((heretic.blood_hunger || 0) - 30, 0)
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  const handlePerformRitual = async () => {
    setProcessing(true);

    setTimeout(async () => {
      const rituals = [
        'Moon energy and vampire essence merged. The ritual was powerful.',
        'Blood circled the altar. Magic answered. The ritual succeeded.',
        'Darkness and moonlight danced together. Ancient power awakened.'
      ];

      setOutcome(rituals[Math.floor(Math.random() * rituals.length)]);

      const newWitchPower = Math.min((heretic.witch_power || 40) + 3, 100);
      const newVampirePower = Math.min((heretic.vampire_power || 40) + 2, 100);

      await base44.entities.Heretic.update(heretic.id, {
        witch_power: newWitchPower,
        vampire_power: newVampirePower,
        rituals_performed: (heretic.rituals_performed || 0) + 1,
        magic_reserves: Math.min((heretic.magic_reserves || 50) + 20, 100)
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
      const isTransformed = !heretic.is_transformed;
      const result = isTransformed
        ? 'Your form shifted. Vampire fangs emerged. Arcane symbols glowed on your skin. Hybrid.'
        : 'The transformation receded. You returned to normal appearance.';

      setOutcome(result);

      await base44.entities.Heretic.update(heretic.id, {
        is_transformed: isTransformed,
        transformation_stage: Math.min((heretic.transformation_stage || 1) + (isTransformed ? 1 : 0), 5)
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  const handleBalanceShift = async (towards) => {
    setProcessing(true);

    setTimeout(async () => {
      const currentBalance = heretic.balance || 50;
      let newBalance = currentBalance;

      if (towards === 'vampire') {
        newBalance = Math.max(currentBalance - 10, 0);
        setOutcome('You embraced your vampire nature. The hunger grew stronger.');
      } else {
        newBalance = Math.min(currentBalance + 10, 100);
        setOutcome('You embraced your witch nature. Magic flowed through you.');
      }

      const conflict = Math.abs(newBalance - 50);

      await base44.entities.Heretic.update(heretic.id, {
        balance: newBalance,
        conflict_level: Math.max((heretic.conflict_level || 0) + conflict, 0)
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  if (!heretic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-950 to-gray-950 p-4">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No heretic found</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
          >
            Create Heretic
          </button>
        </div>
      </div>
    );
  }

  const vampirePercentage = heretic.balance || 50;
  const witchPercentage = 100 - vampirePercentage;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 to-gray-950 p-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <Wand2 className="w-12 h-12 text-purple-400" />
            </motion.div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            {heretic.name}
            <button
              onClick={() => {
                setNewName(heretic.name);
                setShowRenameModal(true);
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          </h1>
          <p className="text-purple-300 mb-3">Heretic • Half Vampire, Half Witch</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            <Plus className="w-4 h-4" /> Create New Heretic
          </button>
        </div>

        {/* Dual Power Stats */}
        {!processing && !outcome && (
        <div className="bg-gradient-to-r from-purple-900/60 to-gray-900/60 rounded-2xl p-6 mb-6 border-2 border-purple-500/30">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2 text-white/80">
                <span className="flex items-center gap-1"><Droplet className="w-4 h-4" /> Vampire Power</span>
                <span>{heretic.vampire_power || 40}/100</span>
              </div>
              <div className="w-full bg-black/30 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((heretic.vampire_power || 40), 100)}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-3 rounded-full bg-red-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2 text-white/80">
                <span className="flex items-center gap-1"><Wand2 className="w-4 h-4" /> Witch Power</span>
                <span>{heretic.witch_power || 40}/100</span>
              </div>
              <div className="w-full bg-black/30 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((heretic.witch_power || 40), 100)}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-3 rounded-full bg-purple-400"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-purple-500/30">
              <div className="flex justify-between text-sm mb-2 text-white/80">
                <span className="flex items-center gap-1"><Moon className="w-4 h-4" /> Balance</span>
                <span>{vampirePercentage.toFixed(0)}% Vampire / {witchPercentage.toFixed(0)}% Witch</span>
              </div>
              <div className="w-full bg-black/30 rounded-full h-3 flex">
                <div
                  style={{ width: `${vampirePercentage}%` }}
                  className="h-3 rounded-l-full bg-red-600 transition-all"
                />
                <div
                  style={{ width: `${witchPercentage}%` }}
                  className="h-3 rounded-r-full bg-purple-600 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="text-center bg-black/30 rounded-lg p-3">
                <p className="text-white/60 text-xs">Blood Hunger</p>
                <p className="text-white text-lg font-bold">{heretic.blood_hunger || 0}/100</p>
              </div>
              <div className="text-center bg-black/30 rounded-lg p-3">
                <p className="text-white/60 text-xs">Magic Reserves</p>
                <p className="text-white text-lg font-bold">{heretic.magic_reserves || 50}/100</p>
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
              onClick={handleCastSpell}
              className="w-full bg-gradient-to-r from-purple-900/60 to-indigo-900/60 hover:from-purple-900/80 hover:to-indigo-900/80 border-2 border-purple-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all text-left"
            >
              <Wand2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-white font-medium">Cast Spell</h3>
                <p className="text-purple-300 text-sm">Weave magic and power together.</p>
              </div>
            </button>

            <button
              onClick={handleFeed}
              className="w-full bg-gradient-to-r from-red-900/60 to-crimson-900/60 hover:from-red-900/80 hover:to-crimson-900/80 border-2 border-red-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all text-left"
            >
              <Droplet className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-white font-medium">Feed</h3>
                <p className="text-red-300 text-sm">Satisfy the vampire hunger.</p>
              </div>
            </button>

            <button
              onClick={handlePerformRitual}
              className="w-full bg-gradient-to-r from-indigo-900/60 to-purple-900/60 hover:from-indigo-900/80 hover:to-purple-900/80 border-2 border-indigo-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all text-left"
            >
              <BookOpen className="w-5 h-5 text-indigo-400 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-white font-medium">Perform Ritual</h3>
                <p className="text-indigo-300 text-sm">Moon magic and blood combined.</p>
              </div>
            </button>

            <button
              onClick={handleTransform}
              className="w-full bg-gradient-to-r from-fuchsia-900/60 to-pink-900/60 hover:from-fuchsia-900/80 hover:to-pink-900/80 border-2 border-fuchsia-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all text-left"
            >
              <Zap className="w-5 h-5 text-fuchsia-400 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-white font-medium">
                  {heretic.is_transformed ? 'Return to Normal' : 'Hybrid Transformation'}
                </h3>
                <p className="text-fuchsia-300 text-sm">
                  {heretic.is_transformed ? 'Revert to human form.' : 'Become your true hybrid self.'}
                </p>
              </div>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleBalanceShift('vampire')}
                className="bg-gradient-to-r from-red-900/60 to-red-800/60 hover:from-red-900/80 hover:to-red-800/80 border-2 border-red-500/50 rounded-xl py-4 px-4 flex items-center justify-center gap-2 transition-all"
              >
                <Droplet className="w-4 h-4 text-red-400" />
                <div className="text-left">
                  <h4 className="text-white font-medium text-sm">Embrace Vampire</h4>
                  <p className="text-red-300 text-xs">Hunger grows</p>
                </div>
              </button>

              <button
                onClick={() => handleBalanceShift('witch')}
                className="bg-gradient-to-r from-purple-900/60 to-purple-800/60 hover:from-purple-900/80 hover:to-purple-800/80 border-2 border-purple-500/50 rounded-xl py-4 px-4 flex items-center justify-center gap-2 transition-all"
              >
                <Wand2 className="w-4 h-4 text-purple-400" />
                <div className="text-left">
                  <h4 className="text-white font-medium text-sm">Embrace Witch</h4>
                  <p className="text-purple-300 text-xs">Magic flows</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="bg-gray-900/50 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-purple-400" />
            Heretic Journey
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Spells Cast</p>
              <p className="text-white text-lg font-bold">{heretic.spells_cast || 0}</p>
            </div>
            <div>
              <p className="text-gray-400">Feedings</p>
              <p className="text-white text-lg font-bold">{heretic.feedings || 0}</p>
            </div>
            <div>
              <p className="text-gray-400">Rituals</p>
              <p className="text-white text-lg font-bold">{heretic.rituals_performed || 0}</p>
            </div>
            <div>
              <p className="text-gray-400">Stage</p>
              <p className="text-white text-lg font-bold">{heretic.transformation_stage || 1}/5</p>
            </div>
          </div>
        </div>

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
              <h2 className="text-2xl font-bold text-white mb-6">Rename Heretic</h2>
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
                  onClick={handleRenameHeretic}
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
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-purple-500/30"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Create New Heretic</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  value={hereticName}
                  onChange={(e) => setHereticName(e.target.value)}
                  placeholder="Heretic name..."
                  className="w-full bg-gray-800 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  autoFocus
                />

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Gender</label>
                  <div className="space-y-2">
                    {['man', 'woman', 'custom'].map(g => (
                      <button
                        key={g}
                        onClick={() => setHereticGender(g)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                          hereticGender === g
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
                    onClick={handleCreateHeretic}
                    disabled={!hereticName.trim()}
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