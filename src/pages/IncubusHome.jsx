import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Skull, Moon, Flame, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const ACTIONS = [
  { id: 'hunt', label: 'Hunt for Prey', icon: '🎯', duration: 3000 },
  { id: 'nightmare', label: 'Create Nightmare', icon: '👹', duration: 4000 },
  { id: 'disguise', label: 'Change Disguise', icon: '🎭', duration: 2000 },
  { id: 'pact', label: 'Seal Dark Pact', icon: '📿', duration: 5000 },
  { id: 'essence', label: 'Steal Essence', icon: '💀', duration: 3000 },
  { id: 'shadow', label: 'Walk in Shadows', icon: '🌑', duration: 4000 },
  { id: 'terror_aura', label: 'Radiate Terror', icon: '😱', duration: 2500 },
  { id: 'possess', label: 'Possess Victim', icon: '👤', duration: 5000 },
  { id: 'dark_magic', label: 'Cast Dark Curse', icon: '🔥', duration: 3500 },
  { id: 'soul_devour', label: 'Devour Soul', icon: '👻', duration: 4500 },
  { id: 'pain_curse', label: 'Curse with Pain', icon: '⚡', duration: 4000 },
  { id: 'horns', label: 'Manifest Horns', icon: '😈', duration: 2000 }
];

export default function IncubusHome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [acting, setActing] = useState(null);
  const [outcome, setOutcome] = useState('');

  const { data: incubi = [] } = useQuery({
    queryKey: ['incubi'],
    queryFn: () => base44.entities.Incubus.list()
  });

  const incubus = incubi[0];

  const handleAction = async (action) => {
    if (!incubus) return;
    
    setActing(action.id);
    
    setTimeout(async () => {
      let result = '';
      const updates = {};
      
      switch(action.id) {
        case 'hunt':
          updates.victims = (incubus.victims || 0) + 1;
          updates.essence_gathered = (incubus.essence_gathered || 0) + Math.floor(Math.random() * 60) + 30;
          result = 'Prey captured. Their fear tastes sweet.';
          break;
        case 'nightmare':
          updates.nightmare_control = Math.min(100, (incubus.nightmare_control || 0) + 5);
          updates.essence_gathered = (incubus.essence_gathered || 0) + Math.floor(Math.random() * 40);
          result = 'Nightmare woven. They will not sleep soundly.';
          break;
        case 'disguise':
          updates.illusion_mastery = Math.min(100, (incubus.illusion_mastery || 0) + 3);
          updates.disguise = ['charming', 'mysterious', 'threatening', 'trustworthy'][Math.floor(Math.random() * 4)];
          result = `Disguise changed to: ${updates.disguise}`;
          break;
        case 'pact':
          updates.pacts_sealed = (incubus.pacts_sealed || 0) + 1;
          updates.essence_gathered = (incubus.essence_gathered || 0) + 250;
          result = 'Dark pact sealed. Their soul is bound to you.';
          break;
        case 'essence':
          updates.essence_gathered = (incubus.essence_gathered || 0) + Math.floor(Math.random() * 100) + 50;
          updates.seduction_power = Math.min(100, (incubus.seduction_power || 0) + 2);
          result = 'Essence stolen. Power grows.';
          break;
        case 'shadow':
          const domains = ['mortal_world', 'dreamscape', 'shadows'];
          const currentIdx = domains.indexOf(incubus.domain || 'mortal_world');
          updates.domain = domains[(currentIdx + 1) % domains.length];
          result = `Traveled to the ${updates.domain}`;
          break;
        case 'terror_aura':
          updates.seduction_power = Math.min(100, (incubus.seduction_power || 0) + 4);
          updates.essence_gathered = (incubus.essence_gathered || 0) + 40;
          result = 'Terror radiates from you. Fear feeds your power.';
          break;
        case 'possess':
          updates.victims = (incubus.victims || 0) + 1;
          updates.essence_gathered = (incubus.essence_gathered || 0) + 120;
          result = 'Body possessed. You control their every move.';
          break;
        case 'dark_magic':
          updates.illusion_mastery = Math.min(100, (incubus.illusion_mastery || 0) + 6);
          updates.essence_gathered = (incubus.essence_gathered || 0) + 70;
          result = 'Dark curse unleashed. Suffering spreads.';
          break;
        case 'soul_devour':
          updates.pacts_sealed = (incubus.pacts_sealed || 0) + 1;
          updates.essence_gathered = (incubus.essence_gathered || 0) + 200;
          result = 'Soul devoured. Their existence is erased.';
          break;
        case 'pain_curse':
          updates.nightmare_control = Math.min(100, (incubus.nightmare_control || 0) + 5);
          updates.essence_gathered = (incubus.essence_gathered || 0) + 90;
          result = 'Cursed with eternal pain. They will never forget you.';
          break;
        case 'horns':
          updates.illusion_mastery = Math.min(100, (incubus.illusion_mastery || 0) + 5);
          result = 'Demonic horns emerge. Your true nature revealed.';
          break;
      }
      
      await base44.entities.Incubus.update(incubus.id, updates);
      await base44.entities.NightLog.create({
        entry: `${incubus.name}: ${result}`,
        category: 'interaction',
        intensity: 'moderate'
      });
      
      setOutcome(result);
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        setActing(null);
        setOutcome('');
      }, 2500);
    }, action.duration);
  };

  if (!incubus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-red-950 to-black p-6">
        <div className="text-center">
          <h2 className="text-white text-2xl mb-4">No Incubus Found</h2>
          <button
            onClick={async () => {
              await base44.entities.Incubus.create({
                name: 'Asmodeus',
                seduction_power: 70,
                essence_gathered: 0,
                domain: 'mortal_world'
              });
              queryClient.invalidateQueries();
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl"
          >
            Become Incubus
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-red-950 to-black p-6">
      <button onClick={() => navigate(createPageUrl('Night'))} className="text-white/60 hover:text-white mb-6">
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-300 mb-2">{incubus.name}</h1>
          <p className="text-red-100 text-sm">Incubus • {incubus.domain}</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-black/40 rounded-xl p-4 border border-red-500/30">
            <Flame className="w-6 h-6 text-red-400 mb-2" />
            <p className="text-2xl font-bold text-white">{incubus.seduction_power}</p>
            <p className="text-xs text-red-300">Seduction</p>
          </div>
          <div className="bg-black/40 rounded-xl p-4 border border-purple-500/30">
            <Zap className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-white">{incubus.essence_gathered}</p>
            <p className="text-xs text-purple-300">Essence</p>
          </div>
          <div className="bg-black/40 rounded-xl p-4 border border-gray-500/30">
            <Skull className="w-6 h-6 text-gray-400 mb-2" />
            <p className="text-2xl font-bold text-white">{incubus.victims}</p>
            <p className="text-xs text-gray-300">Victims</p>
          </div>
          <div className="bg-black/40 rounded-xl p-4 border border-red-500/30">
            <Moon className="w-6 h-6 text-red-400 mb-2" />
            <p className="text-2xl font-bold text-white">{incubus.pacts_sealed}</p>
            <p className="text-xs text-red-300">Pacts</p>
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
              className="w-full bg-gradient-to-r from-red-900/60 to-gray-900/60 hover:from-red-900/80 hover:to-gray-900/80 border-2 border-red-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all disabled:opacity-50"
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
            <div className="bg-red-900 rounded-xl p-6 text-center">
              <p className="text-white text-lg">{outcome}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}