import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Zap, Users, Target, Home, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const MOON_PHASES = [
  { name: 'new', emoji: '🌑', power: 0.5, control: 1.2 },
  { name: 'waxing', emoji: '🌒', power: 0.8, control: 1.0 },
  { name: 'full', emoji: '🌕', power: 2.0, control: 0.3 },
  { name: 'waning', emoji: '🌘', power: 0.7, control: 1.1 }
];

const WEREWOLF_ACTIONS = [
  { id: 'hunt', label: 'Hunt in Wolf Form', power: 10, rage: 15, desc: 'Embrace the beast' },
  { id: 'control', label: 'Practice Control', power: 5, rage: -10, desc: 'Master the transformation' },
  { id: 'pack', label: 'Run with Pack', power: 8, rage: 5, desc: 'Bond with pack' },
  { id: 'territory', label: 'Mark Territory', power: 6, rage: 10, desc: 'Expand your domain' },
  { id: 'meditate', label: 'Embrace Humanity', power: 3, rage: -15, desc: 'Remember who you were' },
  { id: 'challenge', label: 'Challenge Alpha', power: 15, rage: 30, desc: 'Fight for dominance', special: 'Not alpha' }
];

export default function WerewolfHome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [showMoonPhase, setShowMoonPhase] = useState(false);

  const { data: werewolves = [] } = useQuery({
    queryKey: ['werewolves'],
    queryFn: () => base44.entities.Werewolf.list()
  });

  const { data: packs = [] } = useQuery({
    queryKey: ['werewolfPacks'],
    queryFn: () => base44.entities.WerewolfPack.list()
  });

  const werewolf = werewolves[0];
  const myPack = packs.find(p => p.member_ids?.includes(werewolf?.id));

  const handleAction = async (action) => {
    if (!werewolf) return;
    setProcessing(true);

    const currentPhase = MOON_PHASES.find(p => p.name === werewolf.moon_phase);
    const powerGain = Math.round(action.power * currentPhase.power);
    const rageChange = Math.round(action.rage * currentPhase.control);

    setTimeout(async () => {
      const newRage = Math.max(0, Math.min(100, (werewolf.beast_rage || 50) + rageChange));
      const newControl = Math.min(100, (werewolf.transformation_control || 30) + (action.id === 'control' ? 5 : 0));

      await base44.entities.Werewolf.update(werewolf.id, {
        beast_rage: newRage,
        transformation_control: newControl,
        nights_as_wolf: (werewolf.nights_as_wolf || 0) + 1,
        kills_in_wolf_form: (werewolf.kills_in_wolf_form || 0) + (action.id === 'hunt' ? 1 : 0)
      });

      const outcomes = {
        hunt: ['Blood on your snout. The prey never saw you coming. Beast satisfied.', 'You tore through the forest. Predator unleashed. The wolf sang.', 'Moonlight on fur. Hot blood. The hunt eternal.'],
        control: ['You shifted back before killing. Control growing. Human still inside.', 'Breathe. Focus. The beast obeyed. You are still you.', 'Wolf and human, one being. Balance achieved.'],
        pack: ['Howls echoed. The pack ran as one. Brotherhood in blood.', 'You ran alongside them. Pack bond strengthening. Never alone.', 'The pack hunted together. Coordinated. Deadly. Family.'],
        territory: ['Territory marked. Other packs retreated. This land is yours.', 'Boundaries expanded. The pack\'s domain grows. Power consolidated.', 'Scent marked every tree. Message clear: Stay out.'],
        meditate: ['You remembered your human life. The beast quieted. Still you.', 'Humanity flickering. You held onto it. Not just animal.', 'The curse doesn\'t define you. You define the curse.'],
        challenge: ['Teeth and claws. Blood spilled. You won. You are alpha now.', 'The old alpha bowed. Pack is yours. Dominance absolute.', 'Victory. The pack howled your name. You lead now.']
      };

      setOutcome(outcomes[action.id][Math.floor(Math.random() * outcomes[action.id].length)]);

      await base44.entities.NightLog.create({
        entry: `${werewolf.name}: ${outcomes[action.id][0]}`,
        category: 'transformation',
        intensity: action.id === 'challenge' ? 'extreme' : 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  if (!werewolf) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No werewolf found</p>
          <button
            onClick={() => navigate(createPageUrl('Home'))}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const currentPhase = MOON_PHASES.find(p => p.name === werewolf.moon_phase);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-orange-950 to-black p-6 pb-32">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-orange-100">{werewolf.name}</h1>
            <p className="text-orange-300 text-sm mt-1">
              🐺 {werewolf.pack_rank === 'alpha' ? 'Alpha' : werewolf.pack_rank === 'beta' ? 'Beta' : werewolf.pack_rank === 'omega' ? 'Omega' : 'Lone Wolf'}
            </p>
          </div>
        </div>

        {/* Moon Phase */}
        <button
          onClick={() => setShowMoonPhase(true)}
          className="w-full bg-black/40 border border-yellow-500/30 rounded-xl p-4 mb-6 hover:bg-black/60 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Current Moon</p>
              <p className="text-white font-bold text-xl">{currentPhase.emoji} {werewolf.moon_phase}</p>
            </div>
            <div className="text-right">
              <p className="text-yellow-400 text-sm">Power: {currentPhase.power}x</p>
              <p className="text-blue-400 text-sm">Control: {currentPhase.control}x</p>
            </div>
          </div>
        </button>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-black/40 border border-orange-500/30 rounded-lg p-4">
            <p className="text-orange-400 text-xs">Beast Rage</p>
            <p className="text-white text-2xl font-bold">{werewolf.beast_rage}%</p>
          </div>
          <div className="bg-black/40 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-400 text-xs">Control</p>
            <p className="text-white text-2xl font-bold">{werewolf.transformation_control}%</p>
          </div>
          <div className="bg-black/40 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 text-xs">Kills</p>
            <p className="text-white text-2xl font-bold">{werewolf.kills_in_wolf_form}</p>
          </div>
          <div className="bg-black/40 border border-purple-500/30 rounded-lg p-4">
            <p className="text-purple-400 text-xs">Humanity</p>
            <p className="text-white text-2xl font-bold">{werewolf.humanity}%</p>
          </div>
        </div>

        {/* Actions */}
        <AnimatePresence mode="wait">
          {outcome ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-black/60 rounded-xl p-8 text-center border border-orange-500/30"
            >
              <p className="text-orange-100 text-lg leading-relaxed">{outcome}</p>
            </motion.div>
          ) : processing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Moon className="w-12 h-12 text-orange-400 mx-auto" />
              </motion.div>
              <p className="text-orange-300 mt-4">Transforming...</p>
            </motion.div>
          ) : (
            <motion.div className="space-y-3">
              {WEREWOLF_ACTIONS.map((action, i) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleAction(action)}
                  className="w-full bg-gradient-to-r from-orange-900/60 to-orange-950/60 hover:from-orange-900/80 hover:to-orange-950/80 border-2 border-orange-500/50 rounded-xl py-4 px-6 flex items-center gap-3"
                >
                  <Zap className="w-5 h-5 text-orange-300" />
                  <div className="flex-1 text-left">
                    <p className="text-white font-bold">{action.label}</p>
                    <p className="text-orange-300 text-xs">{action.desc}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="text-orange-400">+{action.power} Power</p>
                    <p className="text-red-400">{action.rage > 0 ? '+' : ''}{action.rage} Rage</p>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Moon Phase Selector */}
      {showMoonPhase && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
          onClick={() => setShowMoonPhase(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 rounded-2xl p-6 max-w-md w-full"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Change Moon Phase</h3>
              <button onClick={() => setShowMoonPhase(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {MOON_PHASES.map(phase => (
                <button
                  key={phase.name}
                  onClick={async () => {
                    await base44.entities.Werewolf.update(werewolf.id, { moon_phase: phase.name });
                    queryClient.invalidateQueries();
                    setShowMoonPhase(false);
                  }}
                  className={`w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-left transition-colors ${
                    werewolf.moon_phase === phase.name ? 'ring-2 ring-yellow-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold">{phase.emoji} {phase.name}</p>
                      <p className="text-gray-400 text-sm">Power: {phase.power}x • Control: {phase.control}x</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}