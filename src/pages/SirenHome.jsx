import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Waves, Music, Droplets, Users, Heart, Zap, Eye } from 'lucide-react';

const SIREN_POWERS = [
  { id: 'hypnotic_song', name: 'Hypnotic Song', icon: Music, unlockAt: 0 },
  { id: 'seductive_voice', name: 'Seductive Voice', icon: Heart, unlockAt: 20 },
  { id: 'water_manipulation', name: 'Water Manipulation', icon: Waves, unlockAt: 40 },
  { id: 'drowning_kiss', name: 'Drowning Kiss', icon: Droplets, unlockAt: 60 },
  { id: 'tidal_emotions', name: 'Tidal Emotions', icon: Eye, unlockAt: 80 },
  { id: 'aquatic_form', name: 'Aquatic Form', icon: Waves, unlockAt: 100 }
];

export default function SirenHome() {
  const queryClient = useQueryClient();
  const [showAction, setShowAction] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [initialized, setInitialized] = useState(false);

  const { data: sirens = [] } = useQuery({
    queryKey: ['sirens'],
    queryFn: () => base44.entities.Siren.list()
  });

  const siren = sirens[0];

  React.useEffect(() => {
    const initSiren = async () => {
      if (sirens.length === 0 && !initialized) {
        setInitialized(true);
        const names = ['Marina', 'Coral', 'Nerissa', 'Oceana', 'Lorelei'];
        const personalities = ['seductive', 'mysterious', 'playful', 'dangerous', 'haunting'];
        await base44.entities.Siren.create({
          name: names[Math.floor(Math.random() * names.length)],
          personality: [personalities[Math.floor(Math.random() * personalities.length)]],
          voice_power: 50,
          water_affinity: 50,
          charm_level: 60
        });
        queryClient.invalidateQueries(['sirens']);
      }
    };
    initSiren();
  }, [sirens.length, initialized, queryClient]);

  const handleSing = async () => {
    setProcessing(true);
    setShowAction('sing');

    setTimeout(async () => {
      const outcomes = [
        'Your voice echoed across the water. Haunting. Beautiful. People stopped to listen.',
        'You sang. Hypnotic melody. They came closer, unable to resist.',
        'Song of the siren. They\'re mesmerized. Under your spell now.',
        'Your voice called to them. Irresistible. They followed willingly.'
      ];

      const result = outcomes[Math.floor(Math.random() * outcomes.length)];
      setOutcome(result);

      await base44.entities.Siren.update(siren.id, {
        songs_sung: (siren.songs_sung || 0) + 1,
        voice_power: Math.min((siren.voice_power || 50) + 2, 100)
      });

      await base44.entities.NightLog.create({
        entry: result,
        category: 'power',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
        setShowAction(null);
      }, 3000);
    }, 2000);
  };

  const handleLure = async () => {
    setProcessing(true);
    setShowAction('lure');

    setTimeout(async () => {
      const outcomes = [
        'You lured someone to the water. They came willingly. Seduced by your voice.',
        'Another victim. They couldn\'t resist. Your power grows.',
        'You called them. They followed. Drowning in your beauty.',
        'Lured them close. So close. They\'re yours now. Completely.'
      ];

      const result = outcomes[Math.floor(Math.random() * outcomes.length)];
      setOutcome(result);

      await base44.entities.Siren.update(siren.id, {
        victims_lured: (siren.victims_lured || 0) + 1,
        charm_level: Math.min((siren.charm_level || 60) + 3, 100)
      });

      await base44.entities.NightLog.create({
        entry: result,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
        setShowAction(null);
      }, 3000);
    }, 2000);
  };

  const handleTransform = async () => {
    setProcessing(true);
    setShowAction('transform');

    setTimeout(async () => {
      const isAquatic = !siren.aquatic_form;
      const result = isAquatic 
        ? 'You dove into the water. Legs merged. Tail formed. Aquatic form embraced.'
        : 'You emerged from the water. Tail split. Legs returned. Human form restored.';
      
      setOutcome(result);

      await base44.entities.Siren.update(siren.id, {
        aquatic_form: isAquatic
      });

      await base44.entities.NightLog.create({
        entry: result,
        category: 'transformation',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
        setShowAction(null);
      }, 3000);
    }, 2000);
  };

  if (!siren) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-950 to-cyan-950 p-4">
        <p className="text-gray-400">No siren found...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-cyan-950 p-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Waves className="w-8 h-8 text-cyan-400" />
            {siren.name}
          </h1>
          <p className="text-cyan-300">Siren of the Deep</p>
        </div>

        {/* Stats */}
        <div className="bg-gray-900/50 rounded-2xl p-6 mb-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Voice Power</span>
                <span className="text-cyan-400">{siren.voice_power}/100</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  style={{ width: `${siren.voice_power}%` }}
                  className="h-2 rounded-full bg-gradient-to-r from-cyan-600 to-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Charm Level</span>
                <span className="text-pink-400">{siren.charm_level}/100</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  style={{ width: `${siren.charm_level}%` }}
                  className="h-2 rounded-full bg-gradient-to-r from-pink-600 to-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Victims Lured</p>
                <p className="text-white text-2xl font-bold">{siren.victims_lured || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Songs Sung</p>
                <p className="text-white text-2xl font-bold">{siren.songs_sung || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {processing || outcome ? (
          <div className="bg-gray-900/50 rounded-2xl p-12 text-center">
            {processing ? (
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-cyan-400"
              >
                ...
              </motion.p>
            ) : (
              <p className="text-gray-300 leading-relaxed">{outcome}</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleSing}
              className="w-full bg-gradient-to-r from-cyan-900/60 to-blue-900/60 hover:from-cyan-900/80 hover:to-blue-900/80 border-2 border-cyan-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
            >
              <Music className="w-5 h-5 text-cyan-400" />
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">Sing Your Song</h3>
                <p className="text-cyan-300 text-sm">Hypnotic melody. Lure them closer.</p>
              </div>
            </button>

            <button
              onClick={handleLure}
              className="w-full bg-gradient-to-r from-purple-900/60 to-pink-900/60 hover:from-purple-900/80 hover:to-pink-900/80 border-2 border-purple-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
            >
              <Heart className="w-5 h-5 text-pink-400" />
              <div className="flex-1 text-left">
                <h3 className="text-white font-medium">Lure Someone</h3>
                <p className="text-pink-300 text-sm">Seduce. Enchant. Make them yours.</p>
              </div>
            </button>

            {(siren.water_affinity || 0) >= 50 && (
              <button
                onClick={handleTransform}
                className="w-full bg-gradient-to-r from-blue-900/60 to-teal-900/60 hover:from-blue-900/80 hover:to-teal-900/80 border-2 border-blue-500/50 rounded-xl py-4 px-6 flex items-center gap-3 transition-all"
              >
                <Waves className="w-5 h-5 text-blue-400" />
                <div className="flex-1 text-left">
                  <h3 className="text-white font-medium">
                    {siren.aquatic_form ? 'Return to Human Form' : 'Transform to Aquatic Form'}
                  </h3>
                  <p className="text-blue-300 text-sm">
                    {siren.aquatic_form ? 'Walk on land again.' : 'Embrace the ocean.'}
                  </p>
                </div>
              </button>
            )}
          </div>
        )}

        {/* Powers */}
        <div className="bg-gray-900/50 rounded-2xl p-6 mt-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Siren Powers
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {SIREN_POWERS.map(power => {
              const Icon = power.icon;
              const unlocked = (siren.voice_power || 0) >= power.unlockAt;
              return (
                <div
                  key={power.id}
                  className={`p-3 rounded-lg border ${
                    unlocked 
                      ? 'bg-cyan-900/30 border-cyan-500/30' 
                      : 'bg-gray-800/30 border-gray-700/30'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-1 ${unlocked ? 'text-cyan-400' : 'text-gray-600'}`} />
                  <p className={`text-xs ${unlocked ? 'text-white' : 'text-gray-600'}`}>
                    {power.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}