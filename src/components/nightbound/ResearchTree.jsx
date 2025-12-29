import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, Zap, Beaker, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const RESEARCH_TREE = {
  strains: [
    { 
      id: 'euphoric_mist', 
      name: 'Euphoric Mist', 
      cost: 25,
      requires: [],
      potency: 6,
      effects: 'gentle waves of bliss. Colors vibrate softly. Everything feels right.',
      price: 350,
      addictiveness: 55
    },
    { 
      id: 'shadow_extract', 
      name: 'Shadow Extract', 
      cost: 35,
      requires: ['euphoric_mist'],
      potency: 8,
      effects: 'darkness becomes tangible. You move through shadows. Time becomes optional.',
      price: 600,
      addictiveness: 75
    },
    { 
      id: 'celestial_nectar', 
      name: 'Celestial Nectar', 
      cost: 50,
      requires: ['shadow_extract'],
      potency: 9,
      effects: 'ascension. You touch the divine. See beyond mortality. Become infinite.',
      price: 850,
      addictiveness: 88
    }
  ],
  plants: [
    { 
      id: 'duskblossom', 
      name: 'Duskblossom', 
      type: 'duskblossom',
      cost: 20,
      requires: [],
      description: 'Blooms at twilight. Absorbs fading light. Creates visionary strains.',
      growTime: 3,
      baseYield: 6
    },
    { 
      id: 'vein_orchid', 
      name: 'Vein Orchid', 
      type: 'vein_orchid',
      cost: 30,
      requires: ['duskblossom'],
      description: 'Petals pulse like veins. Feeds on vampire essence. Extremely potent.',
      growTime: 5,
      baseYield: 4
    },
    { 
      id: 'void_lily', 
      name: 'Void Lily', 
      type: 'void_lily',
      cost: 45,
      requires: ['vein_orchid'],
      description: 'Grows in absolute darkness. Consumes light. Creates reality-bending compounds.',
      growTime: 7,
      baseYield: 3
    }
  ],
  upgrades: [
    {
      id: 'auto_harvester',
      name: 'Auto Harvester',
      cost: 40,
      requires: [],
      desc: 'Automated plant harvesting system',
      benefit: 'Plants auto-harvest when ready'
    },
    {
      id: 'purity_filter',
      name: 'Purity Filter',
      cost: 35,
      requires: [],
      desc: 'Advanced filtration for cleaner product',
      benefit: 'All strains +15% price, -10% addictiveness'
    },
    {
      id: 'quantum_mixer',
      name: 'Quantum Mixer',
      cost: 60,
      requires: ['auto_harvester', 'purity_filter'],
      desc: 'Molecular-level mixing technology',
      benefit: 'Hybrids get +2 potency, unlock legendary quality'
    }
  ]
};

export default function ResearchTree({ operation, onClose }) {
  const queryClient = useQueryClient();
  const [unlocking, setUnlocking] = useState(null);
  const [category, setCategory] = useState('strains');

  const unlockedResearch = operation?.underworld_connections || [];
  const researchPoints = operation?.research_points || 0;

  const isUnlocked = (itemId) => unlockedResearch.some(r => r.includes(itemId));
  
  const canUnlock = (item) => {
    if (researchPoints < item.cost) return false;
    if (item.requires.length === 0) return true;
    return item.requires.every(req => unlockedResearch.some(r => r.includes(req)));
  };

  const handleUnlock = async (item) => {
    if (!canUnlock(item)) return;
    
    setUnlocking(item.id);

    setTimeout(async () => {
      // Unlock the research
      await base44.entities.DrugOperation.update(operation.id, {
        research_points: researchPoints - item.cost,
        underworld_connections: [...unlockedResearch, `Research: ${item.name} (${item.id})`]
      });

      // If it's a strain, create it
      if (category === 'strains') {
        await base44.entities.BloodDrug.create({
          strain_name: item.name,
          potency: item.potency,
          quantity: 5,
          price_per_dose: item.price,
          effects: item.effects,
          addictiveness: item.addictiveness,
          quality: 'premium'
        });
      }

      await base44.entities.NightLog.create({
        entry: `Researched: ${item.name}. New ${category === 'strains' ? 'strain' : category === 'plants' ? 'plant' : 'upgrade'} unlocked!`,
        category: 'power',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();
      setUnlocking(null);
    }, 2000);
  };

  const renderItem = (item) => {
    const unlocked = isUnlocked(item.id);
    const canBeUnlocked = canUnlock(item);
    const locked = !unlocked && !canBeUnlocked;

    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl p-4 border-2 transition-all ${
          unlocked ? 'bg-green-900/40 border-green-500/50' :
          canBeUnlocked ? 'bg-purple-900/40 border-purple-500/50' :
          'bg-gray-900/40 border-gray-600/30 opacity-60'
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-white font-bold">{item.name}</h4>
              {unlocked && <CheckCircle className="w-4 h-4 text-green-400" />}
              {locked && <Lock className="w-4 h-4 text-gray-500" />}
            </div>
            <p className="text-gray-400 text-sm mb-2">
              {item.effects || item.description || item.desc}
            </p>
            {item.benefit && (
              <p className="text-purple-300 text-xs">✨ {item.benefit}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Cost: <span className="text-cyan-400 font-bold">{item.cost} RP</span>
          </div>
          {!unlocked && (
            <button
              onClick={() => handleUnlock(item)}
              disabled={!canBeUnlocked || unlocking === item.id}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                canBeUnlocked
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {unlocking === item.id ? 'Unlocking...' : 'Research'}
            </button>
          )}
        </div>

        {item.requires.length > 0 && !unlocked && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-500 mb-1">Requires:</p>
            <div className="flex gap-2 flex-wrap">
              {item.requires.map(req => {
                const reqUnlocked = isUnlocked(req);
                return (
                  <span 
                    key={req}
                    className={`text-xs px-2 py-1 rounded ${
                      reqUnlocked ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'
                    }`}
                  >
                    {reqUnlocked ? '✓' : '✗'} {req.replace('_', ' ')}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <div className="bg-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Beaker className="w-5 h-5 text-cyan-400" />
            <h3 className="text-white font-bold">Research Points</h3>
          </div>
          <span className="text-cyan-400 text-2xl font-bold">{researchPoints}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            style={{ width: `${Math.min(100, researchPoints)}%` }}
            className="h-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
          />
        </div>
        <p className="text-gray-500 text-xs mt-2">
          Earn RP: Experiment, harvest plants, create hybrids
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setCategory('strains')}
          className={`flex-1 py-2 rounded-lg font-medium ${
            category === 'strains' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
          }`}
        >
          🧪 Strains
        </button>
        <button
          onClick={() => setCategory('plants')}
          className={`flex-1 py-2 rounded-lg font-medium ${
            category === 'plants' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'
          }`}
        >
          🌿 Plants
        </button>
        <button
          onClick={() => setCategory('upgrades')}
          className={`flex-1 py-2 rounded-lg font-medium ${
            category === 'upgrades' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
          }`}
        >
          ⚡ Upgrades
        </button>
      </div>

      <div className="space-y-3 max-h-[50vh] overflow-y-auto">
        {RESEARCH_TREE[category].map(item => renderItem(item))}
      </div>
    </motion.div>
  );
}