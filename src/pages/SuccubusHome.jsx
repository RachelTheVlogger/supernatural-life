import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Moon, Sparkles, Zap, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import SuccubusVampireInteraction from '@/components/nightbound/SuccubusVampireInteraction';

const ACTIONS = [
  { id: 'seduce', label: 'Seduce Mortal', icon: '💋', duration: 3000 },
  { id: 'dream', label: 'Enter Dreams', icon: '😴', duration: 4000 },
  { id: 'shapeshift', label: 'Change Form', icon: '✨', duration: 2000 },
  { id: 'contract', label: 'Make Soul Contract', icon: '📜', duration: 5000 },
  { id: 'feed', label: 'Drain Energy', icon: '⚡', duration: 3000 },
  { id: 'realm', label: 'Travel Between Realms', icon: '🌀', duration: 4000 },
  { id: 'charm_aura', label: 'Emit Charm Aura', icon: '💫', duration: 2500 },
  { id: 'mind_control', label: 'Mind Control', icon: '🧠', duration: 4500 },
  { id: 'lust_magic', label: 'Cast Lust Spell', icon: '🔮', duration: 3500 },
  { id: 'soul_read', label: 'Read Desires', icon: '👁️', duration: 3000 },
  { id: 'pleasure_curse', label: 'Curse with Pleasure', icon: '😈', duration: 4000 },
  { id: 'wings', label: 'Manifest Wings', icon: '🦋', duration: 2000 },
  { id: 'kiss_death', label: 'Kiss of Death', icon: '💀', duration: 5000 },
  { id: 'enslave', label: 'Enslave Soul', icon: '⛓️', duration: 4500 },
  { id: 'telepathy', label: 'Seduce from Distance', icon: '📡', duration: 3000 },
  { id: 'pleasure_wave', label: 'Wave of Ecstasy', icon: '🌊', duration: 3500 },
  { id: 'beauty_curse', label: 'Curse of Beauty', icon: '✨', duration: 4000 },
  { id: 'love_poison', label: 'Poison with Love', icon: '💉', duration: 3500 },
  { id: 'desire_harvest', label: 'Harvest Desires', icon: '🌾', duration: 4000 },
  { id: 'soul_mate', label: 'False Soulmate Bond', icon: '💞', duration: 5000 },
  { id: 'dream_prison', label: 'Trap in Dream', icon: '🔒', duration: 4500 },
  { id: 'addiction', label: 'Create Addiction', icon: '💊', duration: 4000 }
];

export default function SuccubusHome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [acting, setActing] = useState(null);
  const [outcome, setOutcome] = useState('');
  const [showVampireInteraction, setShowVampireInteraction] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);

  const { data: succubi = [] } = useQuery({
    queryKey: ['succubi'],
    queryFn: () => base44.entities.Succubus.list()
  });

  const { data: vampireStates = [] } = useQuery({
    queryKey: ['vampireState'],
    queryFn: () => base44.entities.VampireState.list()
  });

  const succubus = succubi[0];
  const vampire = vampireStates[0];
  const isDaytime = vampire?.time_of_day === 'day';

  const handleAction = async (action) => {
    if (!succubus) return;
    
    setActing(action.id);
    
    setTimeout(async () => {
      let result = '';
      const updates = {};
      
      switch(action.id) {
        case 'seduce':
          updates.target_count = (succubus.target_count || 0) + 1;
          updates.energy_collected = (succubus.energy_collected || 0) + Math.floor(Math.random() * 50) + 20;
          result = 'Mortal seduced. Their desire feeds you.';
          break;
        case 'dream':
          updates.dream_walking_mastery = Math.min(100, (succubus.dream_walking_mastery || 0) + 5);
          updates.energy_collected = (succubus.energy_collected || 0) + Math.floor(Math.random() * 30);
          result = 'You walked through their dreams. Sweet nightmares.';
          break;
        case 'shapeshift':
          updates.shapeshifting_level = Math.min(100, (succubus.shapeshifting_level || 0) + 3);
          updates.current_form = ['ethereal', 'alluring', 'dangerous', 'innocent'][Math.floor(Math.random() * 4)];
          result = `Form shifted to: ${updates.current_form}`;
          break;
        case 'contract':
          updates.contracts_made = (succubus.contracts_made || 0) + 1;
          updates.energy_collected = (succubus.energy_collected || 0) + 200;
          result = 'Soul contract sealed. Their essence is yours forever.';
          break;
        case 'feed':
          updates.energy_collected = (succubus.energy_collected || 0) + Math.floor(Math.random() * 80) + 40;
          updates.charm_level = Math.min(100, (succubus.charm_level || 0) + 2);
          result = 'Life force drained. You feel stronger.';
          break;
        case 'realm':
          const realms = ['mortal', 'dream', 'between'];
          const currentIdx = realms.indexOf(succubus.realm || 'mortal');
          updates.realm = realms[(currentIdx + 1) % realms.length];
          result = `Traveled to the ${updates.realm} realm`;
          break;
        case 'charm_aura':
          updates.charm_level = Math.min(100, (succubus.charm_level || 0) + 4);
          updates.energy_collected = (succubus.energy_collected || 0) + 30;
          result = 'Charm aura radiates. All around you are drawn in.';
          break;
        case 'mind_control':
          updates.target_count = (succubus.target_count || 0) + 1;
          updates.energy_collected = (succubus.energy_collected || 0) + 100;
          result = 'Their mind is yours. Complete control achieved.';
          break;
        case 'lust_magic':
          updates.charm_level = Math.min(100, (succubus.charm_level || 0) + 6);
          updates.energy_collected = (succubus.energy_collected || 0) + 60;
          result = 'Lust spell cast. Desire consumes them.';
          break;
        case 'soul_read':
          updates.dream_walking_mastery = Math.min(100, (succubus.dream_walking_mastery || 0) + 4);
          result = 'You see their deepest desires. Secrets revealed.';
          break;
        case 'pleasure_curse':
          updates.contracts_made = (succubus.contracts_made || 0) + 1;
          updates.energy_collected = (succubus.energy_collected || 0) + 150;
          result = 'Cursed with eternal pleasure. They are bound to you.';
          break;
        case 'wings':
          updates.shapeshifting_level = Math.min(100, (succubus.shapeshifting_level || 0) + 5);
          result = 'Demonic wings unfurl. Your true form revealed.';
          break;
        case 'kiss_death':
          updates.contracts_made = (succubus.contracts_made || 0) + 1;
          updates.energy_collected = (succubus.energy_collected || 0) + 300;
          result = 'Your kiss drains their life. Sweet death.';
          break;
        case 'enslave':
          updates.target_count = (succubus.target_count || 0) + 1;
          updates.energy_collected = (succubus.energy_collected || 0) + 200;
          result = 'Soul enslaved. They exist only to serve you.';
          break;
        case 'telepathy':
          updates.charm_level = Math.min(100, (succubus.charm_level || 0) + 5);
          updates.energy_collected = (succubus.energy_collected || 0) + 50;
          result = 'Seduction across miles. Distance means nothing.';
          break;
        case 'pleasure_wave':
          updates.charm_level = Math.min(100, (succubus.charm_level || 0) + 7);
          updates.energy_collected = (succubus.energy_collected || 0) + 80;
          result = 'Wave of pleasure spreads. Everyone affected.';
          break;
        case 'beauty_curse':
          updates.target_count = (succubus.target_count || 0) + 1;
          updates.charm_level = Math.min(100, (succubus.charm_level || 0) + 6);
          result = 'Cursed to see only you. Obsession begins.';
          break;
        case 'love_poison':
          updates.contracts_made = (succubus.contracts_made || 0) + 1;
          updates.energy_collected = (succubus.energy_collected || 0) + 120;
          result = 'Love becomes poison. They are yours forever.';
          break;
        case 'desire_harvest':
          updates.energy_collected = (succubus.energy_collected || 0) + 150;
          result = 'Desires harvested. Power flows through you.';
          break;
        case 'soul_mate':
          updates.contracts_made = (succubus.contracts_made || 0) + 1;
          updates.energy_collected = (succubus.energy_collected || 0) + 250;
          result = 'False bond created. They believe you are their destiny.';
          break;
        case 'dream_prison':
          updates.dream_walking_mastery = Math.min(100, (succubus.dream_walking_mastery || 0) + 8);
          updates.energy_collected = (succubus.energy_collected || 0) + 100;
          result = 'Trapped in eternal dream. They will never wake.';
          break;
        case 'addiction':
          updates.target_count = (succubus.target_count || 0) + 1;
          updates.energy_collected = (succubus.energy_collected || 0) + 180;
          result = 'Addicted to you. They cannot resist anymore.';
          break;
      }
      
      await base44.entities.Succubus.update(succubus.id, updates);
      await base44.entities.NightLog.create({
        entry: `${succubus.name}: ${result}`,
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

  if (!succubus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-950 via-purple-950 to-red-950 p-6">
        <div className="text-center">
          <h2 className="text-white text-2xl mb-4">No Succubus Found</h2>
          <button
            onClick={async () => {
              await base44.entities.Succubus.create({
                name: 'Lilith',
                charm_level: 70,
                energy_collected: 0,
                realm: 'mortal'
              });
              queryClient.invalidateQueries();
            }}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-xl"
          >
            Become Succubus
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ 
      background: isDaytime 
        ? 'linear-gradient(to bottom right, #FFB6C1, #FFC0CB, #FFD4E5)' 
        : 'linear-gradient(to bottom right, #500724, #5A0A3D, #4A0E24)' 
    }}>
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate(createPageUrl('Night'))} className={`${isDaytime ? 'text-gray-700 hover:text-gray-900' : 'text-white/60 hover:text-white'}`}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        {vampire && (
          <button
            onClick={() => navigate(createPageUrl('VampireHome'))}
            className={`${isDaytime ? 'text-pink-700 hover:text-pink-900' : 'text-pink-400 hover:text-pink-300'} text-sm transition-colors`}
          >
            Talk to Vampire
          </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className={`text-4xl font-bold ${isDaytime ? 'text-pink-900' : 'text-pink-300'}`}>{succubus.name}</h1>
            <button onClick={() => setShowNameInput(true)} className={`text-2xl hover:scale-110 transition-transform ${isDaytime ? 'text-pink-700' : 'text-pink-400'}`}>
              ✏️
            </button>
          </div>
          <p className={`${isDaytime ? 'text-pink-800' : 'text-pink-100'} text-sm`}>Succubus • {succubus.realm} realm</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className={`${isDaytime ? 'bg-white/70 border-pink-300/50' : 'bg-black/40 border-pink-500/30'} rounded-xl p-4 border`}>
            <Heart className="w-6 h-6 text-pink-400 mb-2" />
            <p className={`text-2xl font-bold ${isDaytime ? 'text-gray-800' : 'text-white'}`}>{succubus.charm_level}</p>
            <p className={`text-xs ${isDaytime ? 'text-pink-700' : 'text-pink-300'}`}>Charm</p>
          </div>
          <div className={`${isDaytime ? 'bg-white/70 border-purple-300/50' : 'bg-black/40 border-purple-500/30'} rounded-xl p-4 border`}>
            <Zap className="w-6 h-6 text-purple-400 mb-2" />
            <p className={`text-2xl font-bold ${isDaytime ? 'text-gray-800' : 'text-white'}`}>{succubus.energy_collected}</p>
            <p className={`text-xs ${isDaytime ? 'text-purple-700' : 'text-purple-300'}`}>Energy</p>
          </div>
          <div className={`${isDaytime ? 'bg-white/70 border-red-300/50' : 'bg-black/40 border-red-500/30'} rounded-xl p-4 border`}>
            <Sparkles className="w-6 h-6 text-red-400 mb-2" />
            <p className={`text-2xl font-bold ${isDaytime ? 'text-gray-800' : 'text-white'}`}>{succubus.target_count}</p>
            <p className={`text-xs ${isDaytime ? 'text-red-700' : 'text-red-300'}`}>Seduced</p>
          </div>
          <div className={`${isDaytime ? 'bg-white/70 border-pink-300/50' : 'bg-black/40 border-pink-500/30'} rounded-xl p-4 border`}>
            <Moon className="w-6 h-6 text-pink-400 mb-2" />
            <p className={`text-2xl font-bold ${isDaytime ? 'text-gray-800' : 'text-white'}`}>{succubus.contracts_made}</p>
            <p className={`text-xs ${isDaytime ? 'text-pink-700' : 'text-pink-300'}`}>Contracts</p>
          </div>
        </div>

        {vampire && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setShowVampireInteraction(true)}
            className="w-full bg-gradient-to-r from-pink-900/60 to-purple-900/60 hover:from-pink-900/80 hover:to-purple-900/80 border-2 border-pink-500/50 rounded-xl py-4 px-6 mb-4 flex items-center justify-center gap-3 transition-all"
          >
            <span className="text-2xl">💋🦇</span>
            <span className="text-white font-medium">Interact with Vampire</span>
          </motion.button>
        )}

        <div className="space-y-3">
          {ACTIONS.map((action, i) => (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleAction(action)}
              disabled={!!acting}
              className="w-full bg-gradient-to-r from-pink-900/60 to-purple-900/60 hover:from-pink-900/80 hover:to-purple-900/80 border-2 border-pink-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all disabled:opacity-50"
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
            <div className="bg-pink-900 rounded-xl p-6 text-center">
              <p className="text-white text-lg">{outcome}</p>
            </div>
          </motion.div>
        )}

        {showVampireInteraction && vampire && (
          <SuccubusVampireInteraction
            succubus={succubus}
            vampire={vampire}
            onClose={() => setShowVampireInteraction(false)}
          />
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
                defaultValue={succubus.name}
                onKeyPress={async (e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    await base44.entities.Succubus.update(succubus.id, { name: e.target.value.trim() });
                    queryClient.invalidateQueries();
                    setShowNameInput(false);
                  }
                }}
                className="w-full bg-gray-800 border border-pink-500/30 rounded-lg px-4 py-3 text-white mb-4"
                autoFocus
              />
              <button
                onClick={async (e) => {
                  const input = e.target.parentElement.querySelector('input');
                  if (input.value.trim()) {
                    await base44.entities.Succubus.update(succubus.id, { name: input.value.trim() });
                    queryClient.invalidateQueries();
                    setShowNameInput(false);
                  }
                }}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg"
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