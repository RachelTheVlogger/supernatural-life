import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Skull, Moon, Flame, Zap, X } from 'lucide-react';
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
  { id: 'horns', label: 'Manifest Horns', icon: '😈', duration: 2000 },
  { id: 'fear_feast', label: 'Feast on Fear', icon: '👹', duration: 3500 },
  { id: 'soul_shatter', label: 'Shatter Soul', icon: '💥', duration: 5000 },
  { id: 'torment', label: 'Eternal Torment', icon: '🔥', duration: 4500 },
  { id: 'madness', label: 'Drive to Madness', icon: '🌀', duration: 4000 },
  { id: 'blood_rage', label: 'Blood Rage', icon: '🩸', duration: 3000 },
  { id: 'death_touch', label: 'Touch of Death', icon: '☠️', duration: 4500 },
  { id: 'nightmare_realm', label: 'Create Nightmare Realm', icon: '🌑', duration: 5000 },
  { id: 'corrupt', label: 'Corrupt Innocence', icon: '🖤', duration: 4000 },
  { id: 'shadow_army', label: 'Summon Shadow Army', icon: '👥', duration: 5500 },
  { id: 'despair', label: 'Induce Despair', icon: '😢', duration: 3500 }
];

export default function IncubusHome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [acting, setActing] = useState(null);
  const [outcome, setOutcome] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  const { data: incubi = [] } = useQuery({
    queryKey: ['incubi'],
    queryFn: () => base44.entities.Incubus.list()
  });

  const { data: vampireStates = [] } = useQuery({
    queryKey: ['vampireState'],
    queryFn: () => base44.entities.VampireState.list()
  });

  const incubus = incubi[0];
  const vampire = vampireStates[0];
  const isDaytime = vampire?.time_of_day === 'day';

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
        case 'fear_feast':
          updates.essence_gathered = (incubus.essence_gathered || 0) + 140;
          updates.seduction_power = Math.min(100, (incubus.seduction_power || 0) + 5);
          result = 'Fear consumed. Terror makes you stronger.';
          break;
        case 'soul_shatter':
          updates.victims = (incubus.victims || 0) + 1;
          updates.essence_gathered = (incubus.essence_gathered || 0) + 300;
          result = 'Soul shattered into fragments. They cease to exist.';
          break;
        case 'torment':
          updates.pacts_sealed = (incubus.pacts_sealed || 0) + 1;
          updates.essence_gathered = (incubus.essence_gathered || 0) + 200;
          result = 'Eternal torment inflicted. Their suffering is endless.';
          break;
        case 'madness':
          updates.nightmare_control = Math.min(100, (incubus.nightmare_control || 0) + 7);
          updates.essence_gathered = (incubus.essence_gathered || 0) + 110;
          result = 'Sanity destroyed. Madness takes hold.';
          break;
        case 'blood_rage':
          updates.seduction_power = Math.min(100, (incubus.seduction_power || 0) + 6);
          updates.essence_gathered = (incubus.essence_gathered || 0) + 90;
          result = 'Blood rage unleashed. Violence feeds you.';
          break;
        case 'death_touch':
          updates.victims = (incubus.victims || 0) + 1;
          updates.essence_gathered = (incubus.essence_gathered || 0) + 250;
          result = 'Touch of death delivered. Life extinguished instantly.';
          break;
        case 'nightmare_realm':
          updates.nightmare_control = Math.min(100, (incubus.nightmare_control || 0) + 10);
          updates.essence_gathered = (incubus.essence_gathered || 0) + 180;
          result = 'Nightmare realm created. They are trapped forever.';
          break;
        case 'corrupt':
          updates.victims = (incubus.victims || 0) + 1;
          updates.essence_gathered = (incubus.essence_gathered || 0) + 160;
          result = 'Innocence corrupted. Darkness spreads through them.';
          break;
        case 'shadow_army':
          updates.pacts_sealed = (incubus.pacts_sealed || 0) + 1;
          updates.essence_gathered = (incubus.essence_gathered || 0) + 220;
          result = 'Shadow army summoned. Your forces grow.';
          break;
        case 'despair':
          updates.nightmare_control = Math.min(100, (incubus.nightmare_control || 0) + 6);
          updates.essence_gathered = (incubus.essence_gathered || 0) + 100;
          result = 'Despair takes root. All hope is lost.';
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
    <div className="min-h-screen p-6" style={{ 
      background: isDaytime 
        ? 'linear-gradient(to bottom right, #FFB6B6, #FFA5A5, #FFD4D4)' 
        : 'linear-gradient(to bottom right, #1a0a0a, #3d0a0a, #000000)' 
    }}>
      <button onClick={() => navigate(createPageUrl('Night'))} className={`${isDaytime ? 'text-gray-700 hover:text-gray-900' : 'text-white/60 hover:text-white'} mb-6`}>
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className={`text-4xl font-bold ${isDaytime ? 'text-red-900' : 'text-red-300'}`}>{incubus.name}</h1>
            <button onClick={() => setShowNameInput(true)} className={`text-2xl hover:scale-110 transition-transform ${isDaytime ? 'text-red-700' : 'text-red-400'}`}>
              ✏️
            </button>
          </div>
          <p className={`${isDaytime ? 'text-red-800' : 'text-red-100'} text-sm`}>Incubus • {incubus.domain}</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className={`${isDaytime ? 'bg-white/70 border-red-300/50' : 'bg-black/40 border-red-500/30'} rounded-xl p-4 border`}>
            <Flame className="w-6 h-6 text-red-400 mb-2" />
            <p className={`text-2xl font-bold ${isDaytime ? 'text-gray-800' : 'text-white'}`}>{incubus.seduction_power}</p>
            <p className={`text-xs ${isDaytime ? 'text-red-700' : 'text-red-300'}`}>Seduction</p>
          </div>
          <div className={`${isDaytime ? 'bg-white/70 border-purple-300/50' : 'bg-black/40 border-purple-500/30'} rounded-xl p-4 border`}>
            <Zap className="w-6 h-6 text-purple-400 mb-2" />
            <p className={`text-2xl font-bold ${isDaytime ? 'text-gray-800' : 'text-white'}`}>{incubus.essence_gathered}</p>
            <p className={`text-xs ${isDaytime ? 'text-purple-700' : 'text-purple-300'}`}>Essence</p>
          </div>
          <div className={`${isDaytime ? 'bg-white/70 border-gray-300/50' : 'bg-black/40 border-gray-500/30'} rounded-xl p-4 border`}>
            <Skull className="w-6 h-6 text-gray-400 mb-2" />
            <p className={`text-2xl font-bold ${isDaytime ? 'text-gray-800' : 'text-white'}`}>{incubus.victims}</p>
            <p className={`text-xs ${isDaytime ? 'text-gray-700' : 'text-gray-300'}`}>Victims</p>
          </div>
          <div className={`${isDaytime ? 'bg-white/70 border-red-300/50' : 'bg-black/40 border-red-500/30'} rounded-xl p-4 border`}>
            <Moon className="w-6 h-6 text-red-400 mb-2" />
            <p className={`text-2xl font-bold ${isDaytime ? 'text-gray-800' : 'text-white'}`}>{incubus.pacts_sealed}</p>
            <p className={`text-xs ${isDaytime ? 'text-red-700' : 'text-red-300'}`}>Pacts</p>
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

        {showNameInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
            onClick={() => setShowNameInput(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full"
            >
              <button onClick={() => setShowNameInput(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-white mb-4">Change Name</h2>
              <input
                type="text"
                defaultValue={incubus.name}
                onKeyPress={async (e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    await base44.entities.Incubus.update(incubus.id, { name: e.target.value.trim() });
                    queryClient.invalidateQueries();
                    setShowNameInput(false);
                  }
                }}
                className="w-full bg-gray-800 border border-red-500/30 rounded-lg px-4 py-3 text-white mb-4"
                autoFocus
              />
              <button
                onClick={async (e) => {
                  const input = e.target.parentElement.querySelector('input');
                  if (input.value.trim()) {
                    await base44.entities.Incubus.update(incubus.id, { name: input.value.trim() });
                    queryClient.invalidateQueries();
                    setShowNameInput(false);
                  }
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg"
              >
                Save
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}