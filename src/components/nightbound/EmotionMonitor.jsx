import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Activity, Heart, Zap, Brain } from 'lucide-react';

export default function EmotionMonitor({ entity, onClose }) {
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [heartRate, setHeartRate] = useState(72);
  const [intensity, setIntensity] = useState(50);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeartRate(prev => Math.max(60, Math.min(120, prev + (Math.random() - 0.5) * 10)));
      setIntensity(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 20)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const emotions = [
    { id: 'love', label: 'Love', color: 'text-pink-400', bg: 'bg-pink-500', icon: Heart },
    { id: 'desire', label: 'Desire', color: 'text-red-400', bg: 'bg-red-500', icon: Zap },
    { id: 'fear', label: 'Fear', color: 'text-purple-400', bg: 'bg-purple-500', icon: Brain },
    { id: 'excitement', label: 'Excitement', color: 'text-yellow-400', bg: 'bg-yellow-500', icon: Zap },
    { id: 'calm', label: 'Calm', color: 'text-blue-400', bg: 'bg-blue-500', icon: Activity },
    { id: 'obsessed', label: 'Obsessed', color: 'text-fuchsia-400', bg: 'bg-fuchsia-500', icon: Brain }
  ];

  const currentEmotionData = emotions.find(e => e.id === currentEmotion) || emotions[0];
  const Icon = currentEmotionData.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 max-w-2xl w-full border border-blue-500/30"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Emotion Monitor</h2>
              <p className="text-gray-400 text-sm">Real-time biometric tracking</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-black/60 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">Current State</h3>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 60 / heartRate, repeat: Infinity }}
              >
                <Icon className={`w-8 h-8 ${currentEmotionData.color}`} />
              </motion.div>
            </div>
            <p className={`text-3xl font-bold ${currentEmotionData.color} mb-6`}>
              {currentEmotionData.label}
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Heart Rate</span>
                  <span className="text-white font-bold">{Math.round(heartRate)} BPM</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-red-500"
                    animate={{ width: `${(heartRate / 120) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Emotional Intensity</span>
                  <span className="text-white font-bold">{Math.round(intensity)}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${currentEmotionData.bg}`}
                    animate={{ width: `${intensity}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Bond Level</span>
                  <span className="text-white font-bold">{entity.relationship || 0}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: `${entity.relationship || 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {emotions.map(emotion => {
              const EmIcon = emotion.icon;
              return (
                <button
                  key={emotion.id}
                  onClick={() => setCurrentEmotion(emotion.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    currentEmotion === emotion.id
                      ? `border-${emotion.color.replace('text-', '')} ${emotion.bg}/20`
                      : 'border-gray-700 bg-gray-800/50'
                  }`}
                >
                  <EmIcon className={`w-6 h-6 ${emotion.color} mx-auto mb-2`} />
                  <p className={`text-sm ${currentEmotion === emotion.id ? emotion.color : 'text-gray-400'}`}>
                    {emotion.label}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="bg-blue-950/30 border border-blue-500/30 rounded-xl p-4">
            <p className="text-blue-300 text-sm">
              💡 <span className="font-bold">Neural scan active:</span> Monitoring {entity.name}'s emotional state in real-time
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}