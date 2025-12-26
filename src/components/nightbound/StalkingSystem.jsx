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
  { id: 'observe', label: 'Just watch', risk: 'low', awareness: 5 },
  { id: 'photo', label: 'Take photos', risk: 'medium', awareness: 10 },
  { id: 'approach', label: 'Get closer', risk: 'high', awareness: 15 },
  { id: 'leave_gift', label: 'Leave anonymous gift', risk: 'medium', awareness: 8, obsession_boost: 10 },
  { id: 'follow_home', label: 'Follow them home', risk: 'very_high', awareness: 20 },
  { id: 'letter', label: 'Leave a letter', risk: 'low', awareness: 12, obsession_boost: 15 }
];

export default function StalkingSystem({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [stalking, setStalking] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [finding, setFinding] = useState(false);
  const [viewingDetails, setViewingDetails] = useState(null);
  const [selectingMethod, setSelectingMethod] = useState(null);
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
      
      const target = await base44.entities.StalkTarget.create({
        name,
        gender: genders[Math.floor(Math.random() * genders.length)],
        vampire_id: vampireState.id,
        awareness: Math.floor(Math.random() * 20),
        enjoyment: Math.floor(Math.random() * 30) + 10,
        fear_vs_thrill: Math.floor(Math.random() * 50) + 25,
        obsession: 0
      });

      // Create initial backstory using LLM
      try {
        const backstory = await base44.integrations.Core.InvokeLLM({
          prompt: `Generate a brief 2-3 sentence backstory for ${name}, a ${personality.type} ${job}. Make it slightly mysterious and interesting for a vampire stalking them. No JSON, just the text.`
        });

        await base44.entities.NightLog.create({
          entry: `You found ${name}. ${backstory}`,
          category: 'observation',
          intensity: 'moderate'
        });
      } catch (e) {
        await base44.entities.NightLog.create({
          entry: `You found ${name}, a ${personality.type} ${job}. Something about them... you need to watch them.`,
          category: 'observation',
          intensity: 'moderate'
        });
      }

      queryClient.invalidateQueries();
      setFinding(false);
    }, 3000);
  };

  const handleStalk = async (location, method) => {
    setStalking(true);
    
    setTimeout(async () => {
      const intensity = LOCATIONS.find(l => l.id === location.id).intensity;
      const baseAwareness = method.awareness || (intensity === 'high' ? 15 : intensity === 'medium' ? 8 : 3);
      const awarenessGain = Math.floor(baseAwareness * (selectedTarget.personality_mult || 1));
      const enjoymentGain = Math.floor((Math.random() * 10 + 5) * (selectedTarget.enjoyment_mult || 1));
      const thrillShift = Math.floor(Math.random() * 5) + 2;
      const obsessionGain = (method.obsession_boost || Math.floor(Math.random() * 8) + 2);

      const newAwareness = Math.min(100, selectedTarget.awareness + awarenessGain);
      const newEnjoyment = Math.min(100, selectedTarget.enjoyment + enjoymentGain);
      const newObsession = Math.min(100, selectedTarget.obsession + obsessionGain);
      const newThrill = Math.min(100, selectedTarget.fear_vs_thrill + thrillShift);

      // Check for consequences (getting caught, police, etc)
      const caught = method.risk === 'very_high' && Math.random() > 0.7;
      const policeCalled = newAwareness > 80 && selectedTarget.fear_vs_thrill < 40 && Math.random() > 0.6;

      if (caught || policeCalled) {
        const consequenceOutcomes = caught ? [
          `${selectedTarget.name} saw you clearly. Their face went pale. They started running. You vanished before they could scream. Exposure risk increased.`,
          `You got too close. ${selectedTarget.name} turned suddenly. "Who are you?!" they shouted. People looked. You had to leave. Fast.`,
          `Caught. ${selectedTarget.name} took a photo. Your face. Evidence. This could be a problem.`
        ] : [
          `${selectedTarget.name} called the police. "Someone's following me." You heard the whole conversation. Time to lay low.`,
          `Police patrol increased in the area. ${selectedTarget.name} filed a report. Your hunting grounds are compromised.`,
          `A restraining order. ${selectedTarget.name} got one. Legally, you can't be near them. That won't stop you.`
        ];

        const result = consequenceOutcomes[Math.floor(Math.random() * consequenceOutcomes.length)];
        
        await base44.entities.VampireState.update(vampireState.id, {
          exposure_level: Math.min(100, (vampireState.exposure_level || 0) + (caught ? 15 : 10))
        });

        setConsequence(result);
        
        await base44.entities.NightLog.create({
          entry: result,
          category: 'observation',
          intensity: 'significant'
        });

        queryClient.invalidateQueries();
        
        setTimeout(() => {
          setStalking(false);
          setConsequence(null);
          setSelectedTarget(null);
        }, 5000);
        return;
      }

      // Generate outcome based on method and target state
      let result = '';
      
      if (method.id === 'photo') {
        const photos = [
          `You captured ${selectedTarget.name} through the lens. Sleeping. Peaceful. Beautiful. You saved the photo. Evidence of your obsession.`,
          `Click. ${selectedTarget.name} framed perfectly. They'll never know this photo exists. Only you will treasure it.`,
          `The photo came out perfect. ${selectedTarget.name} mid-laugh. You caught a moment they don't know you witnessed.`
        ];
        result = photos[Math.floor(Math.random() * photos.length)];
        setEvidenceCollected(prev => [...prev, `Photo: ${selectedTarget.name} at ${location.label}`]);
      } else if (method.id === 'leave_gift') {
        const gifts = [
          `You left flowers at their door. No note. They'll wonder. They'll think about you all day.`,
          `A small gift. Anonymous. ${selectedTarget.name} found it. Touched it. Smiled. They like the mystery.`,
          `You left something meaningful. ${selectedTarget.name} held it close. Confused. Intrigued. Hooked.`
        ];
        result = gifts[Math.floor(Math.random() * gifts.length)];
      } else if (method.id === 'letter') {
        const letters = [
          `"I watch you. I see you. You're beautiful when you don't know you're being seen." They read it three times. Kept it.`,
          `Your letter was poetic. Obsessive. Perfect. ${selectedTarget.name} pressed it to their chest. They're falling for the mystery.`,
          `Words from shadow. ${selectedTarget.name} read your letter by candlelight. Their hands trembled. Excitement or fear? Both.`
        ];
        result = letters[Math.floor(Math.random() * letters.length)];
      } else if (method.id === 'approach') {
        const approaches = [
          `You got close enough to smell them. ${selectedTarget.name} shivered. Spun around. You were already gone. A ghost.`,
          `Your shadow touched theirs. ${selectedTarget.name} froze. Felt your presence. Didn't run. Just stood there. Waiting.`,
          `Close. So close. ${selectedTarget.name}'s breath caught. "I know you're there," they whispered. But they didn't call for help.`
        ];
        result = approaches[Math.floor(Math.random() * approaches.length)];
      } else if (method.id === 'follow_home') {
        const follows = [
          `You followed ${selectedTarget.name} home. Every turn. Every street. Now you know where they sleep. Perfect.`,
          `They walked. You followed. ${selectedTarget.name} looked back twice. Saw nothing. But you were there. Always there.`,
          `All the way home. ${selectedTarget.name} paused at their door. Looked into the darkness. Looking for you. Almost hoping.`
        ];
        result = follows[Math.floor(Math.random() * follows.length)];
      } else {
        const outcomes = {
          low: [
            `You watched ${selectedTarget.name} ${location.label}. They seemed relaxed. Happy, even. Like they knew you were there.`,
            `${selectedTarget.name} smiled to themselves. As if they sensed your presence and liked it.`,
            `You observed from a distance. ${selectedTarget.name} looked around, hopeful. Searching for you.`
          ],
          medium: [
            `You followed ${selectedTarget.name} ${location.label}. They paused. Looked over their shoulder. Smiled slightly.`,
            `${selectedTarget.name} walked slower than usual. Giving you time to watch. They know. They want this.`,
            `You stayed close. ${selectedTarget.name} touched their neck absently. Thinking of you.`
          ],
          high: [
            `You stood ${location.label} watching ${selectedTarget.name}. They turned. Looked right at you. Didn't scream. Just... stared back.`,
            `${selectedTarget.name} saw you ${location.label}. Their breath caught. Not fear. Excitement. They left their curtains open.`,
            `Your eyes met. ${selectedTarget.name} didn't move away. They moved closer. Pressed their hand to the window.`
          ]
        };
        result = outcomes[intensity][Math.floor(Math.random() * outcomes[intensity].length)];
      }

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
        setSelectingMethod(null);
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

        <h2 className="text-2xl font-bold text-white mb-2">👁️ Stalking</h2>
        <p className="text-gray-400 text-sm mb-6">They don't mind being watched. In fact, they crave it.</p>

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

        {selectedTarget && !outcome && !selectingMethod && (
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
                  onClick={() => setSelectingMethod(loc)}
                  className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-3 text-left transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-400" />
                      <span className="text-white text-sm">{loc.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs">{loc.time}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        loc.intensity === 'high' ? 'bg-red-900/40 text-red-300' :
                        loc.intensity === 'medium' ? 'bg-yellow-900/40 text-yellow-300' :
                        'bg-green-900/40 text-green-300'
                      }`}>
                        {loc.intensity} risk
                      </span>
                    </div>
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

                <div className="grid grid-cols-2 gap-2 mb-3">
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

            <button
              onClick={() => setSelectedTarget(null)}
              className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg py-2 text-gray-300 text-sm"
            >
              Back
            </button>
          </div>
        )}

        {selectingMethod && !outcome && (
          <div>
            <button 
              onClick={() => setSelectingMethod(null)}
              className="text-purple-400 hover:text-purple-300 text-sm mb-4"
            >
              ← Back
            </button>

            <div className="bg-gray-800 rounded-xl p-4 mb-4">
              <h3 className="text-white font-bold mb-1">{selectingMethod.label}</h3>
              <p className="text-gray-400 text-sm">{selectedTarget.name} will be here. How will you approach?</p>
            </div>

            <div className="space-y-2">
              {STALKING_METHODS.map(method => (
                <button
                  key={method.id}
                  onClick={() => handleStalk(selectingMethod, method)}
                  className={`w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-3 text-left transition-all ${
                    method.risk === 'very_high' ? 'border-2 border-red-500/30' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm">{method.label}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      method.risk === 'very_high' ? 'bg-red-900/60 text-red-200' :
                      method.risk === 'high' ? 'bg-orange-900/40 text-orange-300' :
                      method.risk === 'medium' ? 'bg-yellow-900/40 text-yellow-300' :
                      'bg-green-900/40 text-green-300'
                    }`}>
                      {method.risk} risk
                    </span>
                  </div>
                </button>
              ))}
            </div>
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
                  <p className="text-gray-400 text-xs mb-2">Current State:</p>
                  <p className="text-gray-300 text-sm">
                    {viewingDetails.obsession > 80 ? '💖 Completely obsessed with you' :
                     viewingDetails.obsession > 60 ? '❤️ Can\'t stop thinking about you' :
                     viewingDetails.obsession > 40 ? '💕 Very interested in you' :
                     viewingDetails.obsession > 20 ? '💗 Curious about you' :
                     '💙 Barely aware of you'}
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