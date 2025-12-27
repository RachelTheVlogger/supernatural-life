import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Heart, Eye } from 'lucide-react';

export default function DancingSlider({ gender, context = 'performance', vampireName, onFinish }) {
  const [intensity, setIntensity] = useState(0);
  const [performance, setPerformance] = useState(0);
  const [seduction, setSeduction] = useState(0);
  const [moveType, setMoveType] = useState('sway');
  const [audienceReaction, setAudienceReaction] = useState(0);

  useEffect(() => {
    const perf = Math.floor((intensity / 100) * 100);
    setPerformance(perf);
    setSeduction(Math.floor(intensity / 2) + Math.floor(Math.random() * 30));
    setAudienceReaction(Math.min(100, perf + Math.floor(Math.random() * 20)));
  }, [intensity]);

  const moves = gender === 'woman' ? [
    { id: 'sway', label: 'Hip Sway', desc: 'Slow, sensual hip movements' },
    { id: 'grind', label: 'Body Roll', desc: 'Full body waves, grinding motion' },
    { id: 'drop', label: 'Floor Work', desc: 'Drop down, crawl, tease' },
    { id: 'twerk', label: 'Bounce', desc: 'Fast, aggressive movements' },
    { id: 'pole', label: 'Pole Moves', desc: 'Spin, climb, upside down' }
  ] : [
    { id: 'sway', label: 'Body Sway', desc: 'Smooth body movements' },
    { id: 'grind', label: 'Hip Thrust', desc: 'Thrusting, grinding' },
    { id: 'floor', label: 'Floor Work', desc: 'Push-ups, body waves' },
    { id: 'jump', label: 'High Energy', desc: 'Jumping, aggressive moves' },
    { id: 'strip', label: 'Strip Tease', desc: 'Slow reveals' }
  ];

  const handleFinish = () => {
    onFinish({
      intensity,
      performance,
      seduction,
      moveType,
      audienceReaction
    });
  };

  const getMoan = () => {
    if (intensity < 20) return '';
    if (intensity < 40) return '💃';
    if (intensity < 60) return '🔥';
    if (intensity < 80) return '💋';
    return '🔥💋';
  };

  return (
    <div className="bg-gradient-to-br from-pink-900/40 to-purple-900/40 rounded-2xl p-6 border border-pink-500/30">
      <div className="mb-6">
        <h3 className="text-white text-xl font-bold mb-2">
          {context === 'stage' ? '🎤 Stage Performance' : '💃 Dance Performance'}
        </h3>
        <p className="text-gray-400 text-sm">
          {context === 'stage' ? 'The crowd is watching...' : 'Show them what you can do'}
        </p>
      </div>

      {/* Visual feedback - Swirly rope */}
      <div className="relative h-48 bg-black/40 rounded-xl mb-6 overflow-hidden">
        {/* Background pulse */}
        <motion.div
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 1 + (1 - intensity / 100), repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-t from-pink-600/30 via-purple-600/20 to-transparent"
        />
        
        {/* Particles */}
        <AnimatePresence>
          {intensity > 30 && (
            <>
              {[...Array(Math.floor(intensity / 15))].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0, y: 100 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                    y: [-50, -150],
                    x: Math.random() * 200 - 100
                  }}
                  transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
                  className="absolute bottom-0 left-1/2"
                >
                  <Flame className="w-4 h-4 text-pink-500" />
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
        
        {/* Swirly rope */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 200">
          <motion.path
            d={moveType === 'sway' ? 
              "M 150 0 Q 120 50 150 100 T 150 200" :
              moveType === 'grind' ?
              "M 150 0 Q 130 40 150 80 Q 170 120 150 160 Q 130 180 150 200" :
              moveType === 'drop' || moveType === 'floor' ?
              "M 150 0 L 150 80 Q 120 120 150 160 Q 180 180 150 200" :
              moveType === 'twerk' ?
              "M 150 0 Q 140 30 150 60 Q 160 90 150 120 Q 140 150 150 180 Q 160 190 150 200" :
              "M 150 0 Q 140 50 150 100 Q 160 150 150 200"
            }
            stroke="url(#rope-gradient)"
            strokeWidth={8 + intensity / 10}
            fill="none"
            strokeLinecap="round"
            animate={{
              d: moveType === 'sway' ? [
                "M 150 0 Q 120 50 150 100 T 150 200",
                "M 150 0 Q 180 50 150 100 T 150 200",
                "M 150 0 Q 120 50 150 100 T 150 200"
              ] : moveType === 'grind' ? [
                "M 150 0 Q 130 40 150 80 Q 170 120 150 160 Q 130 180 150 200",
                "M 150 0 Q 170 40 150 80 Q 130 120 150 160 Q 170 180 150 200",
                "M 150 0 Q 130 40 150 80 Q 170 120 150 160 Q 130 180 150 200"
              ] : moveType === 'drop' || moveType === 'floor' ? [
                "M 150 0 L 150 80 Q 120 120 150 160 Q 180 180 150 200",
                "M 150 0 L 150 80 Q 180 120 150 160 Q 120 180 150 200",
                "M 150 0 L 150 80 Q 120 120 150 160 Q 180 180 150 200"
              ] : moveType === 'twerk' ? [
                "M 150 0 Q 140 30 150 60 Q 160 90 150 120 Q 140 150 150 180 Q 160 190 150 200",
                "M 150 0 Q 160 30 150 60 Q 140 90 150 120 Q 160 150 150 180 Q 140 190 150 200",
                "M 150 0 Q 140 30 150 60 Q 160 90 150 120 Q 140 150 150 180 Q 160 190 150 200"
              ] : [
                "M 150 0 Q 140 50 150 100 Q 160 150 150 200",
                "M 150 0 Q 160 50 150 100 Q 140 150 150 200",
                "M 150 0 Q 140 50 150 100 Q 160 150 150 200"
              ]
            }}
            transition={{ 
              duration: intensity > 60 ? 0.4 : 0.8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <defs>
            <linearGradient id="rope-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity={0.8 + intensity / 500} />
              <stop offset="50%" stopColor="#a855f7" stopOpacity={1} />
              <stop offset="100%" stopColor="#ec4899" stopOpacity={0.8 + intensity / 500} />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Energy waves */}
        {intensity > 60 && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ 
                  duration: 2,
                  delay: i * 0.5,
                  repeat: Infinity,
                  repeatDelay: 0.5
                }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 w-20 h-20 border-2 border-pink-500 rounded-full"
              />
            ))}
          </>
        )}

        {intensity > 50 && vampireName && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-4 right-4"
          >
            <div className="flex items-center gap-2 bg-red-950/80 rounded-lg px-3 py-2">
              <Eye className="w-4 h-4 text-red-400" />
              <span className="text-red-300 text-sm">🦇 {vampireName} is watching</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Move selection */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        {moves.map(move => (
          <button
            key={move.id}
            onClick={() => setMoveType(move.id)}
            className={`p-3 rounded-lg text-left transition-all ${
              moveType === move.id
                ? 'bg-pink-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <p className="font-bold text-sm">{move.label}</p>
            <p className="text-xs opacity-75">{move.desc}</p>
          </button>
        ))}
      </div>

      {/* Vertical slider */}
      <div className="relative mb-6">
        <div className="flex items-center justify-center gap-4">
          <div className="text-right">
            <p className="text-pink-400 font-bold text-2xl">{getMoan()}</p>
            <p className="text-gray-400 text-xs">Intensity</p>
          </div>
          
          <div 
            className="relative h-64 w-20 bg-gray-800 rounded-full overflow-hidden cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const y = e.clientY - rect.top;
              const newIntensity = Math.round(100 - (y / rect.height) * 100);
              setIntensity(Math.max(0, Math.min(100, newIntensity)));
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              const rect = e.currentTarget.getBoundingClientRect();
              const y = touch.clientY - rect.top;
              const newIntensity = Math.round(100 - (y / rect.height) * 100);
              setIntensity(Math.max(0, Math.min(100, newIntensity)));
            }}
          >
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-pink-600 via-purple-600 to-red-600"
              style={{ height: `${intensity}%` }}
            />
            <div className="absolute inset-0 flex items-end justify-center pb-2 pointer-events-none">
              <span className="text-white font-bold text-sm">{intensity}%</span>
            </div>
          </div>

          <div className="text-left">
            <p className="text-white font-bold text-lg">{performance}%</p>
            <p className="text-gray-400 text-xs">Performance</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Seduction</span>
          <span className="text-pink-400 font-bold">{seduction}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Crowd Reaction</span>
          <span className="text-purple-400 font-bold">{audienceReaction}%</span>
        </div>
      </div>

      {/* Finish button */}
      <button
        onClick={handleFinish}
        disabled={intensity < 10}
        className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 text-white py-4 rounded-xl font-bold"
      >
        Finish Performance
      </button>

      {intensity > 70 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-pink-300 text-sm text-center mt-4 italic"
        >
          The crowd is going wild... 🔥
        </motion.p>
      )}
    </div>
  );
}