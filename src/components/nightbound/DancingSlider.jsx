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

      {/* Visual feedback */}
      <div className="relative h-40 bg-black/40 rounded-xl mb-6 overflow-hidden">
        <AnimatePresence>
          {intensity > 20 && (
            <>
              {[...Array(Math.floor(intensity / 10))].map((_, i) => (
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
                  <Flame className="w-6 h-6 text-pink-500" />
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ 
              scale: [1, 1 + intensity / 100, 1],
              rotate: [0, intensity / 10, 0, -intensity / 10, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl"
          >
            💃
          </motion.div>
        </div>

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
          
          <div className="relative h-64 w-20">
            <input
              type="range"
              min="0"
              max="100"
              value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              style={{ 
                WebkitAppearance: 'slider-vertical',
                writingMode: 'bt-lr',
                appearance: 'slider-vertical'
              }}
            />
            <div className="absolute inset-0 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-pink-600 via-purple-600 to-red-600"
                style={{ height: `${intensity}%` }}
              />
            </div>
            <div className="absolute inset-0 flex items-end justify-center pb-2">
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