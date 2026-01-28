import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Wrench, Shield, Eye, Target, Heart, Sparkles, TrendingUp, Lock, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const FACILITIES = {
  armory: {
    name: 'Armory',
    icon: Target,
    color: 'red',
    maxLevel: 5,
    benefits: [
      { level: 1, cost: 100, desc: '+5% combat effectiveness', benefit: 'combat_5' },
      { level: 2, cost: 250, desc: '+10% damage, weapon crafting', benefit: 'combat_10' },
      { level: 3, cost: 500, desc: '+15% damage, silver weapons', benefit: 'combat_15' },
      { level: 4, cost: 1000, desc: '+25% damage, stake crafting', benefit: 'combat_25' },
      { level: 5, cost: 2000, desc: '+40% damage, master arsenal', benefit: 'combat_40' }
    ]
  },
  research_lab: {
    name: 'Research Lab',
    icon: Eye,
    color: 'blue',
    maxLevel: 5,
    benefits: [
      { level: 1, cost: 150, desc: 'Basic vampire research', benefit: 'research_basic' },
      { level: 2, cost: 300, desc: '+25% XP from missions', benefit: 'xp_25' },
      { level: 3, cost: 600, desc: '+50% XP, weakness detection', benefit: 'xp_50' },
      { level: 4, cost: 1200, desc: '+75% XP, blood analysis', benefit: 'xp_75' },
      { level: 5, cost: 2500, desc: '+100% XP, cure research', benefit: 'xp_100' }
    ]
  },
  training_room: {
    name: 'Training Room',
    icon: TrendingUp,
    color: 'green',
    maxLevel: 5,
    benefits: [
      { level: 1, cost: 120, desc: '+5 skill level cap', benefit: 'skill_5' },
      { level: 2, cost: 280, desc: '+10 skill level, faster training', benefit: 'skill_10' },
      { level: 3, cost: 550, desc: '+15 skill level, advanced drills', benefit: 'skill_15' },
      { level: 4, cost: 1100, desc: '+20 skill level, elite training', benefit: 'skill_20' },
      { level: 5, cost: 2200, desc: '+30 skill level, master hunter', benefit: 'skill_30' }
    ]
  },
  medical_bay: {
    name: 'Medical Bay',
    icon: Heart,
    color: 'pink',
    maxLevel: 5,
    benefits: [
      { level: 1, cost: 100, desc: 'Basic first aid', benefit: 'heal_basic' },
      { level: 2, cost: 250, desc: 'Faster recovery from injuries', benefit: 'heal_fast' },
      { level: 3, cost: 500, desc: 'Antivenom production', benefit: 'antivenom' },
      { level: 4, cost: 1000, desc: 'Blood transfusion equipment', benefit: 'transfusion' },
      { level: 5, cost: 2000, desc: 'Full trauma center', benefit: 'trauma' }
    ]
  },
  defense: {
    name: 'Defense Systems',
    icon: Shield,
    color: 'purple',
    maxLevel: 5,
    benefits: [
      { level: 1, cost: 200, desc: 'Basic locks & alarms', benefit: 'defense_basic' },
      { level: 2, cost: 400, desc: 'Reinforced doors, UV lights', benefit: 'defense_uv' },
      { level: 3, cost: 800, desc: 'Motion sensors, traps', benefit: 'defense_traps' },
      { level: 4, cost: 1500, desc: 'Automated defenses', benefit: 'defense_auto' },
      { level: 5, cost: 3000, desc: 'Impenetrable fortress', benefit: 'defense_fortress' }
    ]
  },
  surveillance: {
    name: 'Surveillance',
    icon: Eye,
    color: 'yellow',
    maxLevel: 5,
    benefits: [
      { level: 1, cost: 150, desc: 'Security cameras', benefit: 'surv_cameras' },
      { level: 2, cost: 300, desc: 'City-wide monitoring', benefit: 'surv_city' },
      { level: 3, cost: 600, desc: 'Thermal imaging', benefit: 'surv_thermal' },
      { level: 4, cost: 1200, desc: 'Satellite access', benefit: 'surv_satellite' },
      { level: 5, cost: 2500, desc: 'Real-time vampire tracking', benefit: 'surv_realtime' }
    ]
  }
};

const AESTHETICS = [
  { id: 'military', name: 'Military', icon: '🪖', desc: 'Tactical and functional' },
  { id: 'modern', name: 'Modern', icon: '🏢', desc: 'Sleek and minimalist' },
  { id: 'gothic', name: 'Gothic', icon: '🏰', desc: 'Dark and dramatic' },
  { id: 'industrial', name: 'Industrial', icon: '⚙️', desc: 'Raw and mechanical' },
  { id: 'minimalist', name: 'Minimalist', icon: '⬜', desc: 'Clean and simple' }
];

const DECORATIONS = [
  { id: 'trophy_wall', name: 'Trophy Wall', cost: 50, icon: '🏆' },
  { id: 'weapon_display', name: 'Weapon Display', cost: 75, icon: '⚔️' },
  { id: 'research_board', name: 'Research Board', cost: 60, icon: '📋' },
  { id: 'vampire_skull', name: 'Vampire Skull', cost: 100, icon: '💀' },
  { id: 'ancient_texts', name: 'Ancient Texts', cost: 80, icon: '📚' },
  { id: 'holy_symbols', name: 'Holy Symbols', cost: 70, icon: '✝️' }
];

export default function SafeHouseManagement({ hunter, onClose }) {
  const queryClient = useQueryClient();
  const [view, setView] = useState('facilities'); // 'facilities', 'aesthetics'
  const [processing, setProcessing] = useState(false);

  const { data: safeHouse } = useQuery({
    queryKey: ['safeHouse', hunter.id],
    queryFn: async () => {
      const houses = await base44.entities.SafeHouse.filter({ hunter_id: hunter.id });
      if (houses.length === 0) {
        return await base44.entities.SafeHouse.create({ hunter_id: hunter.id });
      }
      return houses[0];
    }
  });

  const handleUpgrade = async (facilityKey, level) => {
    const facility = FACILITIES[facilityKey];
    const upgrade = facility.benefits.find(b => b.level === level);
    
    if ((hunter.experience || 0) < upgrade.cost) {
      alert(`Need ${upgrade.cost} experience points`);
      return;
    }

    setProcessing(true);
    try {
      const newExp = (hunter.experience || 0) - upgrade.cost;
      const updateKey = `${facilityKey}_level`;
      
      await Promise.all([
        base44.entities.SafeHouse.update(safeHouse.id, {
          [updateKey]: level,
          total_investment: (safeHouse.total_investment || 0) + upgrade.cost
        }),
        base44.entities.Hunter.update(hunter.id, { experience: newExp }),
        base44.entities.NightLog.create({
          entry: `Upgraded ${facility.name} to level ${level}. ${upgrade.desc}`,
          category: 'hunting',
          intensity: 'significant'
        })
      ]);

      queryClient.invalidateQueries(['safeHouse']);
      queryClient.invalidateQueries(['hunters']);
    } catch (e) {
      console.error('Failed to upgrade:', e);
    }
    setProcessing(false);
  };

  const handleChangeAesthetic = async (aesthetic) => {
    setProcessing(true);
    try {
      await base44.entities.SafeHouse.update(safeHouse.id, { aesthetic });
      queryClient.invalidateQueries(['safeHouse']);
    } catch (e) {
      console.error('Failed to change aesthetic:', e);
    }
    setProcessing(false);
  };

  const handleAddDecoration = async (decoration) => {
    if ((hunter.experience || 0) < decoration.cost) {
      alert(`Need ${decoration.cost} experience points`);
      return;
    }

    const currentDecorations = safeHouse.decorations || [];
    if (currentDecorations.includes(decoration.id)) {
      alert('Already placed');
      return;
    }

    setProcessing(true);
    try {
      await Promise.all([
        base44.entities.SafeHouse.update(safeHouse.id, {
          decorations: [...currentDecorations, decoration.id]
        }),
        base44.entities.Hunter.update(hunter.id, {
          experience: (hunter.experience || 0) - decoration.cost
        })
      ]);
      queryClient.invalidateQueries(['safeHouse']);
      queryClient.invalidateQueries(['hunters']);
    } catch (e) {
      console.error('Failed to add decoration:', e);
    }
    setProcessing(false);
  };

  if (!safeHouse) return null;

  const totalLevel = Object.keys(FACILITIES).reduce((sum, key) => {
    return sum + (safeHouse[`${key}_level`] || 0);
  }, 0);

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
        className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-gray-800"
      >
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Safe House</h2>
            <p className="text-gray-400">Level {totalLevel} Base • {safeHouse.total_investment || 0} Total Investment</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-black/40 border border-blue-500/30 rounded-lg p-4">
            <Home className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-gray-400 text-xs mb-1">Facility Level</p>
            <p className="text-white text-2xl font-bold">{totalLevel}</p>
          </div>
          <div className="bg-black/40 border border-green-500/30 rounded-lg p-4">
            <Wrench className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-gray-400 text-xs mb-1">Available XP</p>
            <p className="text-white text-2xl font-bold">{hunter.experience || 0}</p>
          </div>
          <div className="bg-black/40 border border-purple-500/30 rounded-lg p-4">
            <Sparkles className="w-5 h-5 text-purple-400 mb-2" />
            <p className="text-gray-400 text-xs mb-1">Decorations</p>
            <p className="text-white text-2xl font-bold">{(safeHouse.decorations || []).length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setView('facilities')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              view === 'facilities' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Facilities
          </button>
          <button
            onClick={() => setView('aesthetics')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              view === 'aesthetics' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Aesthetics
          </button>
        </div>

        <AnimatePresence mode="wait">
          {view === 'facilities' && (
            <motion.div
              key="facilities"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {Object.entries(FACILITIES).map(([key, facility]) => {
                const Icon = facility.icon;
                const currentLevel = safeHouse[`${key}_level`] || 0;
                const nextUpgrade = facility.benefits.find(b => b.level === currentLevel + 1);

                return (
                  <div key={key} className="bg-black/40 border border-gray-700 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 bg-${facility.color}-600 rounded-lg flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg">{facility.name}</h3>
                          <p className="text-gray-400 text-sm">Level {currentLevel} / {facility.maxLevel}</p>
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-${facility.color}-600`}
                          style={{ width: `${(currentLevel / facility.maxLevel) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                      {facility.benefits.map(benefit => {
                        const isUnlocked = currentLevel >= benefit.level;
                        const isNext = currentLevel + 1 === benefit.level;

                        return (
                          <div
                            key={benefit.level}
                            className={`rounded-lg p-3 text-center ${
                              isUnlocked ? `bg-${facility.color}-950/50 border border-${facility.color}-500/50` :
                              isNext ? 'bg-gray-800 border border-gray-600' :
                              'bg-gray-900 border border-gray-800 opacity-50'
                            }`}
                          >
                            <div className="flex justify-center mb-2">
                              {isUnlocked ? (
                                <CheckCircle className={`w-5 h-5 text-${facility.color}-400`} />
                              ) : (
                                <Lock className="w-5 h-5 text-gray-600" />
                              )}
                            </div>
                            <p className="text-white text-xs font-bold mb-1">Level {benefit.level}</p>
                            <p className="text-gray-400 text-xs">{benefit.desc}</p>
                            {isNext && (
                              <button
                                onClick={() => handleUpgrade(key, benefit.level)}
                                disabled={processing || (hunter.experience || 0) < benefit.cost}
                                className={`mt-2 w-full bg-${facility.color}-600 hover:bg-${facility.color}-700 text-white text-xs py-1 rounded disabled:opacity-50`}
                              >
                                {benefit.cost} XP
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {view === 'aesthetics' && (
            <motion.div
              key="aesthetics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Theme Selection */}
              <div className="bg-black/40 border border-gray-700 rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-4">Base Aesthetic</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {AESTHETICS.map(aesthetic => (
                    <button
                      key={aesthetic.id}
                      onClick={() => handleChangeAesthetic(aesthetic.id)}
                      disabled={processing}
                      className={`p-4 rounded-xl transition-all ${
                        safeHouse.aesthetic === aesthetic.id
                          ? 'bg-purple-600 border-2 border-purple-400'
                          : 'bg-gray-800 border-2 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-4xl mb-2">{aesthetic.icon}</div>
                      <p className="text-white font-bold text-sm">{aesthetic.name}</p>
                      <p className="text-gray-400 text-xs">{aesthetic.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Decorations */}
              <div className="bg-black/40 border border-gray-700 rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-4">Decorations</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {DECORATIONS.map(decoration => {
                    const isPlaced = (safeHouse.decorations || []).includes(decoration.id);
                    return (
                      <button
                        key={decoration.id}
                        onClick={() => !isPlaced && handleAddDecoration(decoration)}
                        disabled={processing || isPlaced}
                        className={`p-4 rounded-xl transition-all ${
                          isPlaced
                            ? 'bg-green-950/50 border-2 border-green-500'
                            : 'bg-gray-800 border-2 border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className="text-3xl mb-2">{decoration.icon}</div>
                        <p className="text-white font-bold text-sm">{decoration.name}</p>
                        <p className={`text-xs mt-1 ${isPlaced ? 'text-green-400' : 'text-gray-400'}`}>
                          {isPlaced ? 'Placed' : `${decoration.cost} XP`}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}