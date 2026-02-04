import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Crown, Swords, Handshake, X, Music } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function SirenSociety({ siren, onClose }) {
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [podName, setPodName] = useState('');
  const [action, setAction] = useState(null);
  const [outcome, setOutcome] = useState('');

  const { data: allSirens = [] } = useQuery({
    queryKey: ['sirens'],
    queryFn: () => base44.entities.Siren.list()
  });

  const { data: pods = [] } = useQuery({
    queryKey: ['sirenPods'],
    queryFn: () => base44.entities.SirenPod.list()
  });

  const currentPod = pods.find(p => p.member_ids?.includes(siren.id));
  const otherSirens = allSirens.filter(s => s.id !== siren.id);

  const handleCreatePod = async () => {
    if (!podName.trim()) {
      alert('Enter a pod name');
      return;
    }

    try {
      await base44.entities.SirenPod.create({
        pod_name: podName.trim(),
        leader_id: siren.id,
        member_ids: [siren.id],
        territory: siren.territories_claimed?.[0] || 'Unclaimed Waters',
        pod_power: siren.voice_power || 50
      });

      await base44.entities.Siren.update(siren.id, {
        pod_id: podName.trim(),
        pod_rank: 'leader'
      });

      await base44.entities.NightLog.create({
        entry: `Created siren pod: ${podName.trim()}. Your influence grows.`,
        category: 'power',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();
      setCreating(false);
      setPodName('');
    } catch (e) {
      console.error('Failed to create pod:', e);
    }
  };

  const handleJoinPod = async (pod) => {
    setAction('joining');

    setTimeout(async () => {
      setOutcome(`You approached ${pod.pod_name}. Your voice harmonized with theirs. Accepted. You belong now.`);

      await base44.entities.SirenPod.update(pod.id, {
        member_ids: [...(pod.member_ids || []), siren.id],
        pod_power: (pod.pod_power || 50) + ((siren.voice_power || 50) / 10)
      });

      await base44.entities.Siren.update(siren.id, {
        pod_id: pod.id,
        pod_rank: 'singer'
      });

      await base44.entities.NightLog.create({
        entry: `Joined ${pod.pod_name}. No longer alone in the waters.`,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setAction(null);
        setOutcome('');
      }, 4000);
    }, 2000);
  };

  const handleChallenge = async (rivalSiren) => {
    setAction('challenging');

    setTimeout(async () => {
      const yourPower = (siren.voice_power || 50) + (siren.charm_level || 60);
      const theirPower = (rivalSiren.voice_power || 50) + (rivalSiren.charm_level || 60);
      const won = yourPower > theirPower || Math.random() > 0.5;

      if (won) {
        setOutcome(`Vocal duel with ${rivalSiren.name}. Your song overpowered theirs. Victory. Their territory is yours now.`);
        
        await base44.entities.Siren.update(siren.id, {
          voice_power: (siren.voice_power || 50) + 10,
          rival_sirens: [...(siren.rival_sirens || []), rivalSiren.id]
        });
      } else {
        setOutcome(`${rivalSiren.name}'s voice was stronger. Defeated. You retreated. Must grow stronger.`);
        
        await base44.entities.Siren.update(siren.id, {
          voice_power: (siren.voice_power || 50) + 2
        });
      }

      await base44.entities.NightLog.create({
        entry: won ? `Defeated ${rivalSiren.name} in vocal combat.` : `Lost to ${rivalSiren.name}. Need more training.`,
        category: 'power',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setAction(null);
        setOutcome('');
      }, 4000);
    }, 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-blue-950 to-indigo-950 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-blue-500/50"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Siren Society</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {outcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-black/40 rounded-xl p-4 mb-6 border border-cyan-500/30"
          >
            <p className="text-cyan-100 text-sm leading-relaxed">{outcome}</p>
          </motion.div>
        )}

        {/* Current Pod */}
        {currentPod ? (
          <div className="bg-black/40 rounded-xl p-4 mb-6 border border-cyan-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              <h3 className="text-white font-bold">{currentPod.pod_name}</h3>
            </div>
            <p className="text-gray-400 text-sm mb-2">Your rank: <span className="text-cyan-400 capitalize">{siren.pod_rank || 'member'}</span></p>
            <p className="text-gray-400 text-sm">Pod power: <span className="text-cyan-400">{currentPod.pod_power || 0}</span></p>
            <p className="text-gray-400 text-sm">Territory: <span className="text-cyan-400">{currentPod.territory}</span></p>
          </div>
        ) : (
          <div className="mb-6">
            {creating ? (
              <div className="bg-black/40 rounded-xl p-4 border border-cyan-500/30">
                <h3 className="text-white font-bold mb-4">Create Your Pod</h3>
                <input
                  type="text"
                  value={podName}
                  onChange={(e) => setPodName(e.target.value)}
                  placeholder="Pod name..."
                  className="w-full bg-gray-800 border border-cyan-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 mb-4"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setCreating(false)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePod}
                    disabled={!podName.trim()}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    Create
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="w-full bg-gradient-to-r from-cyan-900/60 to-blue-900/60 hover:from-cyan-900/80 hover:to-blue-900/80 border-2 border-cyan-500/50 rounded-xl py-4 px-6 flex items-center gap-3"
              >
                <Crown className="w-5 h-5 text-cyan-400" />
                <div className="text-left">
                  <h3 className="text-white font-medium">Create Your Pod</h3>
                  <p className="text-cyan-300 text-sm">Lead a group of sirens</p>
                </div>
              </button>
            )}
          </div>
        )}

        {/* Other Sirens */}
        {otherSirens.length > 0 && (
          <div>
            <h3 className="text-white font-bold mb-3">Other Sirens</h3>
            <div className="space-y-3">
              {otherSirens.map(s => (
                <div key={s.id} className="bg-black/40 rounded-xl p-4 border border-gray-600/30">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{s.name}</h4>
                    <span className="text-cyan-400 text-sm">Power: {s.voice_power || 50}</span>
                  </div>
                  <div className="flex gap-2">
                    {!currentPod && !s.pod_id && (
                      <button
                        onClick={() => handleChallenge(s)}
                        disabled={!!action}
                        className="flex-1 bg-red-900/60 hover:bg-red-900/80 border border-red-500/30 text-white px-3 py-2 rounded-lg text-sm transition-all disabled:opacity-50"
                      >
                        <Swords className="w-4 h-4 inline mr-1" />
                        Challenge
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        setOutcome(`You sang with ${s.name}. Voices harmonizing. Beautiful. Temporary alliance formed.`);
                        await base44.entities.NightLog.create({
                          entry: `Harmonized with ${s.name}. Brief alliance.`,
                          category: 'interaction',
                          intensity: 'moderate'
                        });
                        setTimeout(() => setOutcome(''), 3000);
                      }}
                      disabled={!!action}
                      className="flex-1 bg-purple-900/60 hover:bg-purple-900/80 border border-purple-500/30 text-white px-3 py-2 rounded-lg text-sm transition-all disabled:opacity-50"
                    >
                      <Music className="w-4 h-4 inline mr-1" />
                      Harmonize
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Pods */}
        {!currentPod && pods.length > 0 && (
          <div className="mt-6">
            <h3 className="text-white font-bold mb-3">Available Pods</h3>
            <div className="space-y-3">
              {pods.map(pod => (
                <button
                  key={pod.id}
                  onClick={() => handleJoinPod(pod)}
                  disabled={!!action}
                  className="w-full bg-gray-800/60 hover:bg-gray-700/60 border border-gray-600/30 hover:border-cyan-500/50 rounded-xl p-4 text-left transition-all disabled:opacity-50"
                >
                  <h4 className="text-white font-medium mb-1">{pod.pod_name}</h4>
                  <p className="text-gray-400 text-xs">Members: {pod.member_ids?.length || 0} • Power: {pod.pod_power || 0}</p>
                  <p className="text-gray-400 text-xs">Territory: {pod.territory}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}