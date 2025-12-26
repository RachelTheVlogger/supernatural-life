import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, MapPin, Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const LOCATIONS = [
  { id: 'window', label: 'Outside their window', intensity: 'high', time: 'night' },
  { id: 'cafe', label: 'At the cafe they frequent', intensity: 'low', time: 'any' },
  { id: 'work', label: 'Near their workplace', intensity: 'medium', time: 'day' },
  { id: 'gym', label: 'At their gym', intensity: 'medium', time: 'evening' },
  { id: 'home', label: 'On their street', intensity: 'high', time: 'night' },
  { id: 'park', label: 'In the park they walk through', intensity: 'low', time: 'day' },
  { id: 'bar', label: 'At the bar they drink at', intensity: 'medium', time: 'night' },
  { id: 'route', label: 'Follow their commute route', intensity: 'medium', time: 'any' }
];

const NAMES = ['Alex', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Avery', 'Taylor', 'Quinn', 'Sam', 'Dakota', 'Rowan', 'Sage'];

const PERSONALITIES = [
  { type: 'oblivious', awareness_mult: 0.5, enjoyment_mult: 1.2, desc: 'Never notices anything' },
  { type: 'perceptive', awareness_mult: 1.5, enjoyment_mult: 1.0, desc: 'Catches everything' },
  { type: 'thrill-seeker', awareness_mult: 1.0, enjoyment_mult: 2.0, desc: 'Loves the danger' },
  { type: 'paranoid', awareness_mult: 1.8, enjoyment_mult: 0.3, desc: 'Always looking over shoulder' },
  { type: 'lonely', awareness_mult: 1.0, enjoyment_mult: 1.5, desc: 'Craves any attention' }
];

const JOBS = ['barista', 'nurse', 'teacher', 'artist', 'writer', 'dancer', 'bartender', 'librarian'];

const STALKING_METHODS = [
  { id: 'observe', label: 'Watch from afar', risk: 'low', awareness: 5, desc: 'They look for you' },
  { id: 'show', label: 'Let them see you', risk: 'medium', awareness: 15, desc: 'They smile when they spot you' },
  { id: 'closer', label: 'Get closer', risk: 'high', awareness: 20, desc: 'They slow down for you' },
  { id: 'exchange', label: 'Exchange glances', risk: 'low', awareness: 10, obsession_boost: 10, desc: 'Eye contact that lingers' },
  { id: 'gift', label: 'Accept their gift', risk: 'medium', awareness: 12, obsession_boost: 15, desc: 'They left something for you' },
  { id: 'follow', label: 'Walk same route', risk: 'low', awareness: 8, desc: 'They take the long way home hoping you\'ll follow' }
];

export default function StalkingSystem({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [stalking, setStalking] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [finding, setFinding] = useState(false);
  const [viewingDetails, setViewingDetails] = useState(null);
  const [evidenceCollected, setEvidenceCollected] = useState([]);
  const [consequence, setConsequence] = useState(null);

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
      const personality = PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
      const job = JOBS[Math.floor(Math.random() * JOBS.length)];
      
      await base44.entities.StalkTarget.create({
        name,
        gender: genders[Math.floor(Math.random() * genders.length)],
        vampire_id: vampireState.id,
        awareness: Math.floor(Math.random() * 30) + 20,
        enjoyment: Math.floor(Math.random() * 40) + 40,
        fear_vs_thrill: Math.floor(Math.random() * 30) + 60,
        obsession: Math.floor(Math.random() * 25) + 15
      });

      const meetingStories = [
        `${name} noticed you first. They've been leaving their curtains open. Taking the long way home. Making themselves visible. Hoping.`,
        `You've seen ${name} around. They always look your way. Smile. Wait. They want you to approach. They're ready.`,
        `${name} asked about you. "The one who's always in the shadows," they said. They know. And they like it.`,
        `You caught ${name} staring. They didn't look away. Bit their lip. Moved closer. An invitation. Crystal clear.`,
        `${name} started going to places they think you'll be. Coffee shop at midnight. Empty park. They're hunting you as much as you're hunting them.`
      ];

      await base44.entities.NightLog.create({
        entry: meetingStories[Math.floor(Math.random() * meetingStories.length)],
        category: 'observation',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();
      setFinding(false);
    }, 3000);
  };

  const handleStalk = async (method) => {
    setStalking(true);
    
    setTimeout(async () => {
      const baseAwareness = method.awareness || 8;
      const awarenessGain = Math.floor(baseAwareness * (selectedTarget.personality_mult || 1));
      const enjoymentGain = Math.floor((Math.random() * 10 + 5) * (selectedTarget.enjoyment_mult || 1));
      const thrillShift = Math.floor(Math.random() * 5) + 2;
      const obsessionGain = (method.obsession_boost || Math.floor(Math.random() * 8) + 2);

      const newAwareness = Math.min(100, selectedTarget.awareness + awarenessGain);
      const newEnjoyment = Math.min(100, selectedTarget.enjoyment + enjoymentGain);
      const newObsession = Math.min(100, selectedTarget.obsession + obsessionGain);
      const newThrill = Math.min(100, selectedTarget.fear_vs_thrill + thrillShift);
      
      const randomLocation = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

      // Generate outcome based on method and target state - MUTUAL DYNAMIC
      let result = '';
      
      if (method.id === 'show') {
        const shows = [
          `You let ${selectedTarget.name} see you clearly at ${randomLocation.label}. Their eyes lit up. They waved. Actually waved. Like they'd been waiting for you to show yourself.`,
          `${selectedTarget.name} spotted you ${randomLocation.label}. Stopped walking. Smiled. Mouthed "finally." They've been hoping you'd reveal yourself.`,
          `You stepped into the light ${randomLocation.label}. ${selectedTarget.name} saw you. Their whole face changed. Relief. Joy. "There you are," they breathed.`
        ];
        result = shows[Math.floor(Math.random() * shows.length)];
      } else if (method.id === 'exchange') {
        const exchanges = [
          `Your eyes met ${randomLocation.label}. ${selectedTarget.name} held your gaze. Neither of you looked away. The moment stretched. Electric.`,
          `${selectedTarget.name} locked eyes with you ${randomLocation.label}. Smiled. Didn't look away. The message was clear: they want you to keep watching.`,
          `Eye contact ${randomLocation.label}. ${selectedTarget.name} bit their lip. Looked you up and down. Deliberate. Inviting. They know exactly what they're doing.`
        ];
        result = exchanges[Math.floor(Math.random() * exchanges.length)];
      } else if (method.id === 'gift') {
        const gifts = [
          `${selectedTarget.name} left a note for you. "I know you're watching. I like it. Meet me?" They're making the first move.`,
          `A gift at your usual spot. From ${selectedTarget.name}. "For my shadow," the note read. They're playing along.`,
          `${selectedTarget.name} left something meaningful. A token. An invitation. They want you to know they're interested.`
        ];
        result = gifts[Math.floor(Math.random() * gifts.length)];
        setEvidenceCollected(prev => [...prev, `Gift from ${selectedTarget.name}`]);
      } else if (method.id === 'closer') {
        const closers = [
          `You moved closer. ${selectedTarget.name} turned. Smiled. Didn't back away. "I was hoping you'd come closer," they said softly.`,
          `Close enough to touch. ${selectedTarget.name} stayed still. Waiting. "I like knowing you're watching me," they whispered.`,
          `You approached. ${selectedTarget.name}'s breath quickened. Excitement, not fear. "Don't stop," they said. "Please."`
        ];
        result = closers[Math.floor(Math.random() * closers.length)];
      } else if (method.id === 'follow') {
        const follows = [
          `${selectedTarget.name} took the scenic route. Walking slowly. Looking back. Making sure you were following. They want you there.`,
          `They walked their usual path. But slower. Pausing at corners. Giving you time to catch up. This is intentional.`,
          `${selectedTarget.name} kept looking back. Not scared. Checking you're still there. They'd be disappointed if you weren't.`
        ];
        result = follows[Math.floor(Math.random() * follows.length)];
      } else {
        const outcomes = [
          `${selectedTarget.name} positioned themselves where you could see them best. They know you're watching. They're performing for you.`,
          `You watched. ${selectedTarget.name} stretched. Moved deliberately. Every motion designed to catch your eye. They know their audience.`,
          `${selectedTarget.name} glanced toward the shadows. Toward you. Smiled to themselves. They like being your focus.`,
          `They're putting on a show. ${selectedTarget.name} knows you're there. Every movement is for you. They crave your attention.`,
          `${selectedTarget.name} looked directly at your hiding spot. Winked. They can't see you clearly, but they know you're there. And they like it.`
        ];
        result = outcomes[Math.floor(Math.random() * outcomes.length)];
      }

      await base44.entities.StalkTarget.update(selectedTarget.id, {
        awareness: newAwareness,
        enjoyment: newEnjoyment,
        obsession: newObsession,
        fear_vs_thrill: newThrill,
        times_watched: selectedTarget.times_watched + 1,
        last_stalk_location: randomLocation.label,
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
    }, 2500);
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

      // Delete the stalk target
      await base44.entities.StalkTarget.delete(selectedTarget.id);
      
      setOutcome(meetOutcome + '\n\nWhat happens next?');
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        setStalking(false);
        setOutcome('');
        setSelectedTarget(null);
      }, 5000);
    }, 2000);
  };

  const handleConvertToServant = async () => {
    if (!selectedTarget) return;
    setStalking(true);

    setTimeout(async () => {
      const variants = ['devoted', 'defiant', 'dreamer'];
      const randomVariant = variants[Math.floor(Math.random() * variants.length)];

      await base44.entities.Servant.create({
        name: selectedTarget.name,
        gender: selectedTarget.gender,
        variant: randomVariant,
        obsession_stage: 2,
        relationship: selectedTarget.obsession,
        emotional_state: 'obsessed'
      });

      await base44.entities.StalkTarget.delete(selectedTarget.id);

      await base44.entities.NightLog.create({
        entry: `${selectedTarget.name} became yours. From watched to willing. From target to servant. The obsession bloomed perfectly.`,
        category: 'interaction',
        intensity: 'significant'
      });

      setOutcome(`${selectedTarget.name} is now your servant. Their obsession transformed into devotion.`);
      queryClient.invalidateQueries();

      setTimeout(() => {
        setStalking(false);
        setOutcome('');
        setSelectedTarget(null);
      }, 4000);
    }, 2000);
  };

  const handleConvertToDonor = async () => {
    if (!selectedTarget) return;
    setStalking(true);

    setTimeout(async () => {
      const arrangements = ['thrill-seeker', 'addicted', 'devoted'];
      const bloodTypes = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

      await base44.entities.Donor.create({
        name: selectedTarget.name,
        gender: selectedTarget.gender,
        blood_type: bloodTypes[Math.floor(Math.random() * bloodTypes.length)],
        arrangement: arrangements[Math.floor(Math.random() * arrangements.length)],
        willingness: selectedTarget.enjoyment,
        trust: selectedTarget.obsession,
        knows_truth: true
      });

      await base44.entities.StalkTarget.delete(selectedTarget.id);

      await base44.entities.NightLog.create({
        entry: `${selectedTarget.name} agreed to feed you. From stalked to willing donor. They offered their neck without hesitation.`,
        category: 'feeding',
        intensity: 'significant'
      });

      setOutcome(`${selectedTarget.name} is now your donor. They want to be consumed by you.`);
      queryClient.invalidateQueries();

      setTimeout(() => {
        setStalking(false);
        setOutcome('');
        setSelectedTarget(null);
      }, 4000);
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

        <h2 className="text-2xl font-bold text-white mb-2">👁️ Mutual Obsession</h2>
        <p className="text-gray-400 text-sm mb-6">They want your attention as much as you want to give it. A game you both play.</p>

        {!selectedTarget && !outcome && !viewingDetails && (
          <>
            <button
              onClick={handleFindTarget}
              disabled={finding}
              className="w-full bg-gradient-to-r from-purple-900/40 to-red-900/40 hover:from-purple-900/60 hover:to-red-900/60 border-2 border-purple-500/50 rounded-xl p-4 mb-6 transition-all disabled:opacity-50 text-white font-medium"
            >
              {finding ? 'Searching the city...' : 'Find Someone to Watch'}
            </button>

            {evidenceCollected.length > 0 && (
              <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4 mb-4">
                <h4 className="text-purple-300 text-sm font-medium mb-2">📸 Evidence Collected</h4>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {evidenceCollected.slice(-5).map((ev, i) => (
                    <p key={i} className="text-gray-400 text-xs">• {ev}</p>
                  ))}
                </div>
              </div>
            )}

            {targets.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No one to stalk yet. Find your first target.</p>
            ) : (
              <div className="space-y-3">
                {targets.map(target => (
                  <div key={target.id} className="bg-gray-800 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-white font-bold">{target.name}</h3>
                        <p className="text-gray-400 text-sm capitalize">{target.gender}</p>
                      </div>
                      <div className="flex gap-2">
                        {target.wants_to_meet && (
                          <span className="text-xs bg-pink-900/50 text-pink-300 px-2 py-1 rounded">
                            Wants you
                          </span>
                        )}
                        {target.knows_its_you && (
                          <span className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded">
                            Knows it's you
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
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

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedTarget(target)}
                        className="flex-1 bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-lg py-2 text-purple-300 text-sm"
                      >
                        Stalk
                      </button>
                      <button
                        onClick={() => setViewingDetails(target)}
                        className="flex-1 bg-gray-900/40 hover:bg-gray-800 border border-gray-500/30 rounded-lg py-2 text-gray-300 text-sm"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {selectedTarget && !outcome && (
          <div>
            <button 
              onClick={() => setSelectedTarget(null)}
              className="text-purple-400 hover:text-purple-300 text-sm mb-4"
            >
              ← Back
            </button>

            <div className="bg-gray-800 rounded-xl p-4 mb-6">
              <h3 className="text-white font-bold text-lg mb-2">{selectedTarget.name}</h3>
              <p className="text-gray-400 text-sm mb-3">
                {selectedTarget.knows_its_you 
                  ? "They know exactly who you are. And they keep coming back for more." 
                  : "They sense you watching. They're hoping you'll reveal yourself."}
              </p>
              {selectedTarget.wants_to_meet && (
                <p className="text-pink-400 text-sm mb-3">
                  They're ready. They want to stop playing and finally meet you face to face.
                </p>
              )}
              <div className="bg-purple-950/40 rounded-lg p-3 border border-purple-500/20">
                <p className="text-purple-300 text-xs mb-1">Their Interest Level</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div style={{ width: `${selectedTarget.obsession || 0}%` }} className="bg-gradient-to-r from-pink-500 to-red-500 h-2 rounded-full" />
                  </div>
                  <span className="text-red-400 font-bold">{selectedTarget.obsession || 0}%</span>
                </div>
              </div>
            </div>

            <h4 className="text-white text-sm font-medium mb-3">How will you interact?</h4>
            <div className="space-y-2 mb-6">
              {STALKING_METHODS.map(method => (
                <button
                  key={method.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStalk(method);
                  }}
                  className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-3 text-left transition-all touch-manipulation active:bg-gray-600"
                >
                  <div className="flex justify-between items-start pointer-events-none">
                    <div>
                      <span className="text-white text-sm font-medium block mb-1">{method.label}</span>
                      <p className="text-gray-500 text-xs">{method.desc}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      method.risk === 'high' ? 'bg-pink-900/40 text-pink-300' :
                      method.risk === 'medium' ? 'bg-purple-900/40 text-purple-300' :
                      'bg-gray-700 text-gray-300'
                    }`}>
                      {method.risk === 'high' ? 'intimate' : method.risk === 'medium' ? 'bold' : 'subtle'}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {selectedTarget.wants_to_meet && selectedTarget.obsession > 70 && (
              <>
                <button
                  onClick={handleMeet}
                  className="w-full bg-gradient-to-r from-pink-900/60 to-red-900/60 hover:from-pink-900/80 hover:to-red-900/80 border-2 border-pink-500/50 rounded-xl p-4 transition-all mb-3"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Heart className="w-5 h-5" />
                    <span className="text-white font-medium">Finally Meet Them</span>
                  </div>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleConvertToServant}
                    className="bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-lg py-3 text-purple-300 text-sm"
                  >
                    Make Servant
                  </button>
                  <button
                    onClick={handleConvertToDonor}
                    className="bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 rounded-lg py-3 text-red-300 text-sm"
                  >
                    Make Donor
                  </button>
                </div>
              </>
            )}
          </div>
        )}



        {viewingDetails && (
          <div>
            <button 
              onClick={() => setViewingDetails(null)}
              className="text-purple-400 hover:text-purple-300 text-sm mb-4"
            >
              ← Back
            </button>

            <div className="bg-gray-800 rounded-xl p-4 mb-4">
              <h3 className="text-white font-bold text-xl mb-3">{viewingDetails.name}</h3>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-gray-500 text-xs">Gender</p>
                    <p className="text-white capitalize">{viewingDetails.gender}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Times Watched</p>
                    <p className="text-white">{viewingDetails.times_watched}</p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-500 text-xs mb-1">Awareness Level</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div style={{ width: `${viewingDetails.awareness}%` }} className="bg-purple-500 h-2 rounded-full" />
                    </div>
                    <span className="text-purple-400">{viewingDetails.awareness}%</span>
                  </div>
                </div>

                <div>
                  <p className="text-gray-500 text-xs mb-1">Enjoyment</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div style={{ width: `${viewingDetails.enjoyment}%` }} className="bg-pink-500 h-2 rounded-full" />
                    </div>
                    <span className="text-pink-400">{viewingDetails.enjoyment}%</span>
                  </div>
                </div>

                <div>
                  <p className="text-gray-500 text-xs mb-1">Obsession</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div style={{ width: `${viewingDetails.obsession}%` }} className="bg-red-500 h-2 rounded-full" />
                    </div>
                    <span className="text-red-400">{viewingDetails.obsession}%</span>
                  </div>
                </div>

                <div>
                  <p className="text-gray-500 text-xs mb-1">Fear vs Thrill</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-300">Fear</span>
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div style={{ width: `${viewingDetails.fear_vs_thrill}%` }} className="bg-gradient-to-r from-blue-500 to-pink-500 h-2 rounded-full" />
                    </div>
                    <span className="text-xs text-pink-300">Thrill</span>
                  </div>
                </div>

                {viewingDetails.last_stalk_location && (
                  <div>
                    <p className="text-gray-500 text-xs">Last Location</p>
                    <p className="text-white">{viewingDetails.last_stalk_location}</p>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-700">
                  <p className="text-gray-400 text-xs mb-2">How They Feel:</p>
                  <p className="text-gray-300 text-sm">
                    {viewingDetails.obsession > 80 ? '💖 Desperately wants to be with you' :
                     viewingDetails.obsession > 60 ? '❤️ Actively seeking your attention' :
                     viewingDetails.obsession > 40 ? '💕 Hoping you notice them' :
                     viewingDetails.obsession > 20 ? '💗 Intrigued by you' :
                     '💙 Just starting to notice you'}
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    {viewingDetails.enjoyment > 80 ? 'Loves every moment of this game' :
                     viewingDetails.enjoyment > 60 ? 'Really enjoying the attention' :
                     viewingDetails.enjoyment > 40 ? 'Finding it exciting' :
                     'Still warming up to it'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedTarget(viewingDetails)}
              className="w-full bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-lg py-3 text-white mb-2"
            >
              Stalk Them
            </button>
          </div>
        )}

        {stalking && !consequence && (
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

        {consequence && (
          <div className="py-8 bg-red-950/40 border-2 border-red-500/50 rounded-xl p-6">
            <h4 className="text-red-300 font-bold text-lg mb-3">⚠️ Consequences</h4>
            <p className="text-gray-300 text-center leading-relaxed">{consequence}</p>
          </div>
        )}

        {outcome && !consequence && (
          <div className="py-8">
            <p className="text-gray-300 text-center leading-relaxed whitespace-pre-line">{outcome}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}