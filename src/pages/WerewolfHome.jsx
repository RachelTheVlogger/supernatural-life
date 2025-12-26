import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Moon, Zap, Users, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const ACTIONS = [
  { id: 'hunt', label: 'Hunt in the Wild', icon: '🐺', duration: 3000 },
  { id: 'transform', label: 'Shift Form', icon: '🌕', duration: 2000 },
  { id: 'howl', label: 'Howl at the Moon', icon: '🌙', duration: 2500 },
  { id: 'territory', label: 'Mark Territory', icon: '🏔️', duration: 4000 },
  { id: 'recruit', label: 'Recruit Pack Member', icon: '👥', duration: 5000 },
  { id: 'train', label: 'Train Control', icon: '⚡', duration: 3500 }
];

export default function WerewolfHome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [acting, setActing] = useState(null);
  const [outcome, setOutcome] = useState('');

  const { data: werewolves = [] } = useQuery({
    queryKey: ['playerWerewolves'],
    queryFn: () => base44.entities.PlayerWerewolf.list()
  });

  const werewolf = werewolves[0];

  const handleAction = async (action) => {
    if (!werewolf) return;
    
    setActing(action.id);
    
    setTimeout(async () => {
      let result = '';
      const updates = {};
      
      switch(action.id) {
        case 'hunt':
          updates.kills = (werewolf.kills || 0) + 1;
          updates.wolf_strength = Math.min(100, (werewolf.wolf_strength || 0) + 3);
          result = 'The hunt was successful. Blood on your claws.';
          break;
        case 'transform':
          const forms = ['human', 'hybrid', 'wolf'];
          const currentIdx = forms.indexOf(werewolf.current_form || 'human');
          updates.current_form = forms[(currentIdx + 1) % forms.length];
          updates.transformation_control = Math.min(100, (werewolf.transformation_control || 0) + 2);
          result = `Shifted to ${updates.current_form} form`;
          break;
        case 'howl':
          updates.pack_members = (werewolf.pack_members || 0) + (Math.random() > 0.7 ? 1 : 0);
          result = 'Your howl echoes through the night. Others may hear.';
          break;
        case 'territory':
          updates.territory_size = (werewolf.territory_size || 0) + Math.floor(Math.random() * 10) + 5;
          result = 'Territory expanded. This land is yours.';
          break;
        case 'recruit':
          updates.pack_members = (werewolf.pack_members || 0) + 1;
          if (werewolf.pack_members >= 5 && werewolf.pack_rank === 'lone_wolf') {
            updates.pack_rank = 'alpha';
            result = 'Pack member recruited. You are now an Alpha!';
          } else {
            result = 'New wolf joins your pack.';
          }
          break;
        case 'train':
          updates.transformation_control = Math.min(100, (werewolf.transformation_control || 0) + 5);
          updates.moon_sensitivity = Math.max(0, (werewolf.moon_sensitivity || 80) - 3);
          result = 'Control strengthened. The beast obeys.';
          break;
      }
      
      await base44.entities.PlayerWerewolf.update(werewolf.id, updates);
      await base44.entities.NightLog.create({
        entry: `${werewolf.name}: ${result}`,
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

  if (!werewolf) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-950 via-gray-900 to-amber-950 p-6">
        <div className="text-center">
          <h2 className="text-white text-2xl mb-4">No Werewolf Found</h2>
          <button
            onClick={async () => {
              await base44.entities.PlayerWerewolf.create({
                name: 'Fenrir',
                pack_rank: 'lone_wolf',
                transformation_control: 40,
                current_form: 'human'
              });
              queryClient.invalidateQueries();
            }}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl"
          >
            Become Werewolf
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-950 via-gray-900 to-amber-950 p-6">
      <button onClick={() => navigate(createPageUrl('Night'))} className="text-white/60 hover:text-white mb-6">
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-300 mb-2">{werewolf.name}</h1>
          <p className="text-orange-100 text-sm capitalize">{werewolf.pack_rank} • {werewolf.current_form} form</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-black/40 rounded-xl p-4 border border-orange-500/30">
            <Zap className="w-6 h-6 text-orange-400 mb-2" />
            <p className="text-2xl font-bold text-white">{werewolf.wolf_strength}</p>
            <p className="text-xs text-orange-300">Strength</p>
          </div>
          <div className="bg-black/40 rounded-xl p-4 border border-amber-500/30">
            <Moon className="w-6 h-6 text-amber-400 mb-2" />
            <p className="text-2xl font-bold text-white">{werewolf.transformation_control}</p>
            <p className="text-xs text-amber-300">Control</p>
          </div>
          <div className="bg-black/40 rounded-xl p-4 border border-red-500/30">
            <Users className="w-6 h-6 text-red-400 mb-2" />
            <p className="text-2xl font-bold text-white">{werewolf.pack_members}</p>
            <p className="text-xs text-red-300">Pack Size</p>
          </div>
          <div className="bg-black/40 rounded-xl p-4 border border-green-500/30">
            <MapPin className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-2xl font-bold text-white">{werewolf.territory_size}</p>
            <p className="text-xs text-green-300">Territory</p>
          </div>
        </div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate(createPageUrl('HybridHome'))}
          className="w-full bg-gradient-to-r from-purple-900/60 to-red-900/60 hover:from-purple-900/80 hover:to-red-900/80 border-2 border-purple-500/50 rounded-xl py-4 px-6 mb-4 flex items-center justify-center gap-3 transition-all"
        >
          <span className="text-2xl">🔄</span>
          <span className="text-white font-medium">Become Hybrid</span>
        </motion.button>

        <div className="space-y-3">
          {ACTIONS.map((action, i) => (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleAction(action)}
              disabled={!!acting}
              className="w-full bg-gradient-to-r from-orange-900/60 to-amber-900/60 hover:from-orange-900/80 hover:to-amber-900/80 border-2 border-orange-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all disabled:opacity-50"
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
            <div className="bg-orange-900 rounded-xl p-6 text-center">
              <p className="text-white text-lg">{outcome}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}