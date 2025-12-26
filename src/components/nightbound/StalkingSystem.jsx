import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, MapPin, Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const LOCATIONS = [
  { id: 'window', label: 'Outside their window', intensity: 'high' },
  { id: 'cafe', label: 'At the cafe they frequent', intensity: 'low' },
  { id: 'work', label: 'Near their workplace', intensity: 'medium' },
  { id: 'gym', label: 'At their gym', intensity: 'medium' },
  { id: 'home', label: 'On their street', intensity: 'high' },
  { id: 'park', label: 'In the park they walk through', intensity: 'low' }
];

const NAMES = ['Alex', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Avery', 'Taylor', 'Quinn'];

export default function StalkingSystem({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [stalking, setStalking] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [finding, setFinding] = useState(false);

  const { data: targets = [] } = useQuery({
    queryKey: ['stalkTargets', vampireState?.id],
    queryFn: async () => {
      if (!vampireState?.id) return [];
      return await base44.entities.StalkTarget.filter({ vampire_id: vampireState.id });
    },
    enabled: !!vampireState?.id
  });

  const handleFindTarget = async () => {
    if (!vampireState?.id) return;
    
    setFinding(true);
    
    setTimeout(async () => {
      const name = NAMES[Math.floor(Math.random() * NAMES.length)];
      const genders = ['man', 'woman', 'custom'];
      
      await base44.entities.StalkTarget.create({
        name,
        gender: genders[Math.floor(Math.random() * genders.length)],
        vampire_id: vampireState.id,
        awareness: Math.floor(Math.random() * 30),
        enjoyment: Math.floor(Math.random() * 40) + 20,
        fear_vs_thrill: Math.floor(Math.random() * 60) + 20
      });

      await base44.entities.NightLog.create({
        entry: `You found ${name}. Something about them... you need to watch them.`,
        category: 'observation',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();
      setFinding(false);
    }, 2000);
  };

  const handleStalk = async (location) => {
    setStalking(true);
    
    setTimeout(async () => {
      const intensity = LOCATIONS.find(l => l.id === location.id).intensity;
      const awarenessGain = intensity === 'high' ? 15 : intensity === 'medium' ? 8 : 3;
      const enjoymentGain = Math.floor(Math.random() * 10) + 5;
      const thrillShift = Math.floor(Math.random() * 5) + 2;

      const newAwareness = Math.min(100, selectedTarget.awareness + awarenessGain);
      const newEnjoyment = Math.min(100, selectedTarget.enjoyment + enjoymentGain);
      const newObsession = Math.min(100, selectedTarget.obsession + Math.floor(Math.random() * 8) + 2);
      const newThrill = Math.min(100, selectedTarget.fear_vs_thrill + thrillShift);

      const outcomes = {
        low: [
          `You watched ${selectedTarget.name} ${location.label}. They seemed relaxed. Happy, even. Like they knew you were there.`,
          `${selectedTarget.name} smiled to themselves while ${location.label}. As if they sensed your presence and liked it.`,
          `You observed ${selectedTarget.name} from a distance. They looked around, hopeful. Searching for you.`
        ],
        medium: [
          `You followed ${selectedTarget.name} ${location.label}. They paused. Looked over their shoulder. Smiled slightly.`,
          `${selectedTarget.name} walked slower than usual. Giving you time to watch. They know. They want this.`,
          `You stayed close while ${selectedTarget.name} was ${location.label}. They touched their neck absently. Thinking of you.`
        ],
        high: [
          `You stood ${location.label} watching ${selectedTarget.name}. They turned. Looked right at you. Didn't scream. Just... stared back.`,
          `${selectedTarget.name} saw you ${location.label}. Their breath caught. Not fear. Excitement. They left their curtains open.`,
          `Your eyes met through the glass. ${selectedTarget.name} didn't move away. They moved closer. Pressed their hand to the window.`
        ]
      };

      const result = outcomes[intensity][Math.floor(Math.random() * outcomes[intensity].length)];

      await base44.entities.StalkTarget.update(selectedTarget.id, {
        awareness: newAwareness,
        enjoyment: newEnjoyment,
        obsession: newObsession,
        fear_vs_thrill: newThrill,
        times_watched: selectedTarget.times_watched + 1,
        last_stalk_location: location.label,
        knows_its_you: newAwareness > 70 ? true : selectedTarget.knows_its_you,
        wants_to_meet: newObsession > 60 ? true : selectedTarget.wants_to_meet
      });

      await base44.entities.NightLog.create({
        entry: result,
        category: 'observation',
        intensity: 'moderate'
      });

      setOutcome(result);
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        setStalking(false);
        setOutcome('');
        setSelectedTarget(null);
      }, 4000);
    }, 2000);
  };

  const handleMeet = async () => {
    setStalking(true);
    
    setTimeout(async () => {
      const meetOutcome = `You step from the shadows. ${selectedTarget.name} turns. "I knew it was you," they whisper. "I've been waiting." Their obsession matches yours. This is no longer stalking. This is mutual.`;

      await base44.entities.NightLog.create({
        entry: meetOutcome,
        category: 'interaction',
        intensity: 'significant'
      });

      // Could convert to Servant or Donor here
      await base44.entities.StalkTarget.delete(selectedTarget.id);
      
      setOutcome(meetOutcome);
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        setStalking(false);
        setOutcome('');
        setSelectedTarget(null);
      }, 5000);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={() => !stalking && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        {!stalking && (
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}

        <h2 className="text-2xl font-bold text-white mb-2">👁️ Stalking</h2>
        <p className="text-gray-400 text-sm mb-6">They don't mind being watched. In fact, they crave it.</p>

        {!selectedTarget && !outcome && (
          <>
            <button
              onClick={handleFindTarget}
              disabled={finding}
              className="w-full bg-gradient-to-r from-purple-900/40 to-red-900/40 hover:from-purple-900/60 hover:to-red-900/60 border-2 border-purple-500/50 rounded-xl p-4 mb-6 transition-all disabled:opacity-50"
            >
              {finding ? 'Searching...' : 'Find Someone to Watch'}
            </button>

            {targets.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No one to stalk yet. Find your first target.</p>
            ) : (
              <div className="space-y-3">
                {targets.map(target => (
                  <button
                    key={target.id}
                    onClick={() => setSelectedTarget(target)}
                    className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-white font-bold">{target.name}</h3>
                        <p className="text-gray-400 text-sm capitalize">{target.gender}</p>
                      </div>
                      {target.wants_to_meet && (
                        <span className="text-xs bg-pink-900/50 text-pink-300 px-2 py-1 rounded">
                          Wants to meet
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">Awareness</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                            <div style={{ width: `${target.awareness}%` }} className="bg-purple-500 h-1.5 rounded-full" />
                          </div>
                          <span className="text-purple-400 w-8">{target.awareness}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500">Enjoyment</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                            <div style={{ width: `${target.enjoyment}%` }} className="bg-pink-500 h-1.5 rounded-full" />
                          </div>
                          <span className="text-pink-400 w-8">{target.enjoyment}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500">Obsession</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                            <div style={{ width: `${target.obsession}%` }} className="bg-red-500 h-1.5 rounded-full" />
                          </div>
                          <span className="text-red-400 w-8">{target.obsession}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500">Times Watched</p>
                        <p className="text-white font-medium">{target.times_watched}</p>
                      </div>
                    </div>

                    {target.last_stalk_location && (
                      <p className="text-gray-500 text-xs mt-2">Last seen: {target.last_stalk_location}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {selectedTarget && !outcome && (
          <div>
            <div className="bg-gray-800 rounded-xl p-4 mb-6">
              <h3 className="text-white font-bold text-lg mb-2">{selectedTarget.name}</h3>
              <p className="text-gray-400 text-sm mb-3">
                {selectedTarget.knows_its_you 
                  ? "They know it's you watching them." 
                  : "They sense someone watching. They don't know it's you yet."}
              </p>
              {selectedTarget.wants_to_meet && (
                <p className="text-pink-400 text-sm mb-3">
                  Their obsession is high. They want to finally meet you.
                </p>
              )}
            </div>

            <h4 className="text-white text-sm font-medium mb-3">Where will you watch them?</h4>
            <div className="space-y-2 mb-6">
              {LOCATIONS.map(loc => (
                <button
                  key={loc.id}
                  onClick={() => handleStalk(loc)}
                  className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-3 text-left transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-400" />
                      <span className="text-white text-sm">{loc.label}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      loc.intensity === 'high' ? 'bg-red-900/40 text-red-300' :
                      loc.intensity === 'medium' ? 'bg-yellow-900/40 text-yellow-300' :
                      'bg-green-900/40 text-green-300'
                    }`}>
                      {loc.intensity} risk
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {selectedTarget.wants_to_meet && (
              <button
                onClick={handleMeet}
                className="w-full bg-gradient-to-r from-pink-900/60 to-red-900/60 hover:from-pink-900/80 hover:to-red-900/80 border-2 border-pink-500/50 rounded-xl p-4 transition-all mb-3"
              >
                <div className="flex items-center justify-center gap-2">
                  <Heart className="w-5 h-5" />
                  <span className="text-white font-medium">Finally Meet Them</span>
                </div>
              </button>
            )}

            <button
              onClick={() => setSelectedTarget(null)}
              className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg py-2 text-gray-300 text-sm"
            >
              Back
            </button>
          </div>
        )}

        {stalking && (
          <div className="py-16 text-center">
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Eye className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <p className="text-gray-400">Watching...</p>
            </motion.div>
          </div>
        )}

        {outcome && (
          <div className="py-8">
            <p className="text-gray-300 text-center leading-relaxed">{outcome}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}