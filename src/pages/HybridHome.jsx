import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, Moon, Skull } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const ACTIONS = [
  { id: 'feed_blood', label: 'Feed on Blood', icon: '🩸', duration: 3000 },
  { id: 'shift_wolf', label: 'Transform to Wolf', icon: '🐺', duration: 2500 },
  { id: 'compel', label: 'Vampire Compulsion', icon: '👁️', duration: 3500 },
  { id: 'pack_howl', label: 'Alpha Howl', icon: '🌙', duration: 3000 },
  { id: 'super_speed', label: 'Hybrid Speed', icon: '⚡', duration: 2000 },
  { id: 'daywalker', label: 'Walk in Daylight', icon: '☀️', duration: 1500 },
  { id: 'healing', label: 'Rapid Regeneration', icon: '💚', duration: 4000 },
  { id: 'sire', label: 'Create Another Hybrid', icon: '🔄', duration: 6000 }
];

export default function HybridHome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [acting, setActing] = useState(null);
  const [outcome, setOutcome] = useState('');

  const { data: hybrids = [] } = useQuery({
    queryKey: ['hybrids'],
    queryFn: () => base44.entities.Hybrid.list()
  });

  const { data: vampireStates = [] } = useQuery({
    queryKey: ['vampireState'],
    queryFn: () => base44.entities.VampireState.list()
  });

  const { data: werewolves = [] } = useQuery({
    queryKey: ['playerWerewolves'],
    queryFn: () => base44.entities.PlayerWerewolf.list()
  });

  const hybrid = hybrids[0];
  const canBecomeHybrid = vampireStates.length > 0 && werewolves.length > 0;

  const handleBecomeHybrid = async () => {
    const vampire = vampireStates[0];
    const werewolf = werewolves[0];

    await base44.entities.Hybrid.create({
      name: vampire.vampire_name,
      hybrid_type: 'vampire_werewolf',
      vampire_power: 50,
      werewolf_power: 50,
      transformation_mastery: 40,
      hybrid_abilities: ['daywalker', 'super_strength', 'rapid_healing']
    });

    await base44.entities.NightLog.create({
      entry: `${vampire.vampire_name} merged with their wolf side. A hybrid is born.`,
      category: 'power',
      intensity: 'intense'
    });

    queryClient.invalidateQueries();
  };

  const handleAction = async (action) => {
    if (!hybrid) return;
    
    setActing(action.id);
    
    setTimeout(async () => {
      let result = '';
      const updates = {};
      
      switch(action.id) {
        case 'feed_blood':
          updates.vampire_power = Math.min(100, (hybrid.vampire_power || 0) + 3);
          updates.kills = (hybrid.kills || 0) + 1;
          result = 'Blood feeds both sides. Vampire and wolf satisfied.';
          break;
        case 'shift_wolf':
          updates.werewolf_power = Math.min(100, (hybrid.werewolf_power || 0) + 4);
          updates.transformation_mastery = Math.min(100, (hybrid.transformation_mastery || 0) + 2);
          result = 'Wolf form unleashed. Stronger than any pure breed.';
          break;
        case 'compel':
          updates.vampire_power = Math.min(100, (hybrid.vampire_power || 0) + 2);
          result = 'Mind bent to your will. Hybrid compulsion is absolute.';
          break;
        case 'pack_howl':
          updates.werewolf_power = Math.min(100, (hybrid.werewolf_power || 0) + 3);
          result = 'Your howl commands both wolf and vampire alike.';
          break;
        case 'super_speed':
          updates.transformation_mastery = Math.min(100, (hybrid.transformation_mastery || 0) + 3);
          result = 'Moving faster than either species could alone.';
          break;
        case 'daywalker':
          updates.vampire_power = Math.min(100, (hybrid.vampire_power || 0) + 5);
          result = 'Sun no longer burns. The ultimate advantage.';
          break;
        case 'healing':
          updates.werewolf_power = Math.min(100, (hybrid.werewolf_power || 0) + 4);
          updates.transformation_mastery = Math.min(100, (hybrid.transformation_mastery || 0) + 2);
          result = 'Wounds close instantly. Hybrid regeneration is unmatched.';
          break;
        case 'sire':
          const newAbilities = [...(hybrid.hybrid_abilities || [])];
          if (!newAbilities.includes('sire_hybrids')) {
            newAbilities.push('sire_hybrids');
          }
          updates.hybrid_abilities = newAbilities;
          result = 'Another hybrid created. Your bloodline grows.';
          break;
      }
      
      await base44.entities.Hybrid.update(hybrid.id, updates);
      await base44.entities.NightLog.create({
        entry: `${hybrid.name}: ${result}`,
        category: 'power',
        intensity: 'intense'
      });
      
      setOutcome(result);
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        setActing(null);
        setOutcome('');
      }, 2500);
    }, action.duration);
  };

  if (!hybrid && !canBecomeHybrid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-950 via-purple-950 to-orange-950 p-6">
        <div className="text-center">
          <h2 className="text-white text-2xl mb-4">Become a Hybrid</h2>
          <p className="text-gray-300 mb-6">You need to be both a vampire and a werewolf first</p>
          <button
            onClick={() => navigate(createPageUrl('Night'))}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl"
          >
            Return to Night
          </button>
        </div>
      </div>
    );
  }

  if (!hybrid && canBecomeHybrid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-950 via-purple-950 to-orange-950 p-6">
        <div className="text-center">
          <h2 className="text-white text-2xl mb-4">The Merge</h2>
          <p className="text-gray-300 mb-6">Unite vampire and werewolf. Become something more.</p>
          <button
            onClick={handleBecomeHybrid}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 py-4 rounded-xl text-lg font-bold"
          >
            Become Hybrid
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-purple-950 to-orange-950 p-6">
      <button onClick={() => navigate(createPageUrl('Night'))} className="text-white/60 hover:text-white mb-6">
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-300 mb-2">{hybrid.name}</h1>
          <p className="text-purple-100 text-sm capitalize">Vampire-Werewolf Hybrid</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-black/40 rounded-xl p-4 border border-red-500/30">
            <Skull className="w-6 h-6 text-red-400 mb-2" />
            <p className="text-2xl font-bold text-white">{hybrid.vampire_power}</p>
            <p className="text-xs text-red-300">Vampire</p>
          </div>
          <div className="bg-black/40 rounded-xl p-4 border border-orange-500/30">
            <Moon className="w-6 h-6 text-orange-400 mb-2" />
            <p className="text-2xl font-bold text-white">{hybrid.werewolf_power}</p>
            <p className="text-xs text-orange-300">Werewolf</p>
          </div>
          <div className="bg-black/40 rounded-xl p-4 border border-purple-500/30">
            <Zap className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-white">{hybrid.transformation_mastery}</p>
            <p className="text-xs text-purple-300">Mastery</p>
          </div>
          <div className="bg-black/40 rounded-xl p-4 border border-gray-500/30">
            <Skull className="w-6 h-6 text-gray-400 mb-2" />
            <p className="text-2xl font-bold text-white">{hybrid.kills}</p>
            <p className="text-xs text-gray-300">Kills</p>
          </div>
        </div>

        <div className="space-y-3">
          {ACTIONS.map((action, i) => (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleAction(action)}
              disabled={!!acting}
              className="w-full bg-gradient-to-r from-red-900/60 to-orange-900/60 hover:from-red-900/80 hover:to-orange-900/80 border-2 border-purple-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all disabled:opacity-50"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-white font-medium">{acting === action.id ? 'In progress...' : action.label}</span>
            </motion.button>
          ))}
        </div>

        {outcome && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 flex items-center justify-center bg-black/80 p-4"
          >
            <div className="bg-purple-900 rounded-xl p-6 text-center">
              <p className="text-white text-lg">{outcome}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}