import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Heart } from 'lucide-react';

export default function MasturbationSlider({ onFinish, gender = 'custom', vampireWatching = false }) {
  const [intensity, setIntensity] = useState(0);
  const [edging, setEdging] = useState(false);
  const [particles, setParticles] = useState([]);
  const [particleId, setParticleId] = useState(0);
  const [moans, setMoans] = useState([]);
  const [lastIntensity, setLastIntensity] = useState(0);
  const [edgeCount, setEdgeCount] = useState(0);
  const [desperationLevel, setDesperationLevel] = useState(0);

  const getMoanText = (level, isEdging, isDecreasing, wasHigh) => {
    // Frustrated gasping/whimpering when pulling back at any intensity
    if (isDecreasing && level > 10) {
      return [
        'nnngh...!',
        'ahh... ahh...',
        '*whimper*',
        'hahh... hahh...',
        'mmnngh...',
        '*gasp*',
        'ahhn...',
        '*frustrated whimper*',
        'nngh... nngh...',
        '*breathless gasp*',
        'ahh...!',
        '*desperate whimper*'
      ];
    }
    
    // Context-aware desperate edging moans
    if (isEdging && level > 60) {
      const desperate = vampireWatching ? [
        'PLEASE LET ME...!',
        'CAN I CUM PLEASE?!',
        'I\'LL DO ANYTHING!',
        'PLEASE I NEED IT!',
        'LET ME FINISH PLEASE!'
      ] : [
        'OH GOD I CAN\'T...!',
        'I NEED TO CUM SO BAD!',
        'FUCK I\'M RIGHT THERE!',
        'I\'M GONNA EXPLODE!',
        'I CAN\'T HOLD IT!'
      ];
      return desperate;
    }
    
    // Gender-specific moans
    const isMale = gender === 'man';
    const isFemale = gender === 'woman';
    
    if (level < 20) {
      return isMale ? ['mmm...', 'ahh...', 'fuck...'] : 
             isFemale ? ['mmm...', 'oh...', 'ahhn...'] : 
             ['mmm...', 'ah...', 'oh...'];
    }
    
    if (level < 40) {
      return isMale ? ['fuck yeah...', 'mmm...', 'god...', 'ahh...'] : 
             isFemale ? ['yes...', 'mmm...', 'ahhn...', 'oh god...'] : 
             ['mmm...', 'ahh...', 'yes...', 'god...'];
    }
    
    if (level < 60) {
      return isMale ? ['shit...', 'fuck...', 'so good...', 'yeah...'] : 
             isFemale ? ['ohhh yes...', 'fuck...', 'right there...', 'more...'] : 
             ['ohhh...', 'fuck...', 'yes...', 'ahh...', 'more...'];
    }
    
    if (level < 80) {
      return isMale ? ['FUCK...', 'YES...', 'SHIT...', 'SO CLOSE...'] : 
             isFemale ? ['OH GOD...', 'YES YES...', 'FUCK...', 'DON\'T STOP...'] : 
             ['FUCK...', 'YES...', 'OH GOD...', 'AHHH...', 'DON\'T STOP...'];
    }
    
    return isMale ? ['FUCK YES!', 'GONNA CUM!', 'OH FUCK!', 'AHHH!'] : 
           isFemale ? ['OH FUCK!', 'I\'M CUMMING!', 'YES YES YES!', 'AHHHHH!'] : 
           ['FUCK YES!', 'OH FUCK!', 'I\'M SO CLOSE!', 'AHHHHH!', 'YES YES YES!'];
  };

  useEffect(() => {
    if (intensity > 10) {
      const interval = setInterval(() => {
        const shouldSpawn = Math.random() < (intensity / 100);
        if (shouldSpawn) {
          const newParticle = {
            id: particleId,
            type: Math.random() > 0.5 ? 'heart' : 'flame',
            x: Math.random() * 80 + 10,
            delay: 0
          };
          setParticles(prev => [...prev.slice(-15), newParticle]);
          setParticleId(prev => prev + 1);
        }
      }, intensity > 70 ? 100 : intensity > 50 ? 200 : 400);
      
      return () => clearInterval(interval);
    }
  }, [intensity, particleId]);

  // Show moans as slider moves
  const handleSliderChange = (value) => {
    const isDecreasing = value < lastIntensity;
    const wasHigh = lastIntensity > 60;
    
    setIntensity(value);
    setLastIntensity(value);
    
    // Add moan immediately on movement
    if (value > 10 || isDecreasing) {
      const moanList = getMoanText(value, edging, isDecreasing, wasHigh);
      const randomMoan = moanList[Math.floor(Math.random() * moanList.length)];
      const newMoan = { id: Date.now() + Math.random(), text: randomMoan };
      setMoans(prev => [...prev.slice(-6), newMoan]);
    }
  };

  useEffect(() => {
    if (intensity > 20) {
      const interval = setInterval(() => {
        const isDecreasing = intensity < lastIntensity;
        const wasHigh = lastIntensity > 60;
        const moanList = getMoanText(intensity, edging, false, false);
        const randomMoan = moanList[Math.floor(Math.random() * moanList.length)];
        const newMoan = { id: Date.now() + Math.random(), text: randomMoan };
        setMoans(prev => [...prev.slice(-6), newMoan]);
      }, edging && intensity > 60 ? 300 : intensity > 70 ? 400 : intensity > 50 ? 800 : 1200);
      
      return () => clearInterval(interval);
    }
  }, [intensity, edging, lastIntensity]);

  const handleFinish = () => {
    setIntensity(100);
    setTimeout(() => {
      onFinish(edging ? 'edged' : 'finished', edgeCount, desperationLevel);
    }, 1000);
  };

  // Visual effects based on intensity
  const screenShake = intensity > 80 ? (Math.sin(Date.now() / 50) * 2) : 0;
  const blurAmount = intensity > 70 ? Math.min((intensity - 70) / 30, 1) * 3 : 0;
  const colorIntensity = intensity / 100;

  return (
    <div 
      className="relative bg-gradient-to-b from-pink-950/60 to-purple-950/60 rounded-2xl p-8 border-2 border-pink-500/50 overflow-hidden min-h-[500px]"
      style={{
        transform: `translate(${screenShake}px, ${screenShake}px)`,
        filter: `blur(${blurAmount}px)`,
        boxShadow: `0 0 ${20 + colorIntensity * 40}px rgba(236, 72, 153, ${colorIntensity * 0.6})`
      }}
    >
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <AnimatePresence>
          {particles.map(particle => (
            <motion.div
              key={particle.id}
              initial={{ y: '100%', x: `${particle.x}%`, opacity: 1, scale: 0.5 }}
              animate={{ y: '-20%', opacity: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="absolute bottom-0"
            >
              {particle.type === 'heart' ? (
                <Heart className="w-6 h-6 text-pink-400 fill-pink-400" />
              ) : (
                <Flame className="w-6 h-6 text-orange-400 fill-orange-400" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Moaning text overlay */}
      <div className="absolute top-4 left-0 right-0 flex flex-col items-center gap-1 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {moans.slice(-3).map((moan, i) => (
            <motion.p
              key={moan.id}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1 - (i * 0.3), y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`font-bold text-center ${
                intensity > 70 ? 'text-3xl text-pink-300' : 
                intensity > 50 ? 'text-2xl text-pink-400' : 
                'text-xl text-pink-500'
              }`}
              style={{ textShadow: '0 0 10px rgba(236, 72, 153, 0.5)' }}
            >
              {moan.text}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full pt-20">
        <motion.div
          animate={{ 
            scale: 1 + (intensity / 100) * 0.3,
            rotate: Math.sin(Date.now() / 200) * (intensity / 10)
          }}
          className="text-8xl mb-8"
        >
          {intensity > 80 ? '💦' : intensity > 60 ? '🔥' : intensity > 40 ? '💕' : intensity > 20 ? '💗' : '💖'}
        </motion.div>

        <div className="w-full max-w-md mb-6">
          <div className="flex justify-between text-white mb-2">
            <span className="text-sm">Intensity</span>
            <span className="font-bold text-lg">{intensity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="95"
            value={intensity}
            onChange={(e) => handleSliderChange(parseInt(e.target.value))}
            className="w-full h-3 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-pink-500 [&::-webkit-slider-thumb]:to-purple-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
            style={{
              background: `linear-gradient(to right, #ec4899 0%, #a855f7 ${intensity}%, #374151 ${intensity}%, #374151 100%)`
            }}
          />
        </div>

        {/* Desperation meter */}
        {desperationLevel > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 w-full max-w-md"
          >
            <div className="flex justify-between text-xs text-pink-400 mb-1">
              <span>Desperation</span>
              <span>{desperationLevel}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <motion.div 
                animate={{ width: `${desperationLevel}%` }}
                className="h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
              />
            </div>
          </motion.div>
        )}

        <div className="flex gap-3 mb-4">
          <button
            onClick={() => {
              setEdging(!edging);
              if (!edging) {
                setEdgeCount(prev => prev + 1);
                setDesperationLevel(prev => Math.min(100, prev + 20));
              }
            }}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              edging 
                ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {edging ? `⚡ Edging... (${edgeCount}x)` : 'Edge'}
          </button>
          
          <button
            onClick={handleFinish}
            disabled={intensity < 50}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              intensity >= 50
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            💦 Finish
          </button>
        </div>

        {intensity > 70 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="text-pink-400 font-bold text-lg"
          >
            {vampireWatching && edging ? 'Waiting for permission...' : 
             edging ? `Holding back... so close... (${edgeCount}x)` : 
             'Almost there...'}
          </motion.p>
        )}

        {vampireWatching && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-purple-400 text-sm italic mt-2"
          >
            They're watching you...
          </motion.p>
        )}

        {intensity < 50 && (
          <p className="text-gray-500 text-sm">Need 50% to finish</p>
        )}
      </div>
    </div>
  );
}