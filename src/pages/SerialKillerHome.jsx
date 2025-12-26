import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Skull, Eye, Droplets, AlertTriangle, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import KillerLoverInteraction from '@/components/nightbound/KillerLoverInteraction';

const HUNTING_LOCATIONS = [
  { name: 'Dark Alley', risk: 20, success: 80 },
  { name: 'Nightclub', risk: 40, success: 70 },
  { name: 'Their Home', risk: 60, success: 90 },
  { name: 'Random Encounter', risk: 30, success: 60 }
];

const METHODS = [
  { name: 'Quick & Clean', control: 10, evidence: 20 },
  { name: 'Take Your Time', control: -20, evidence: 60 },
  { name: 'Make It Look Like Accident', control: 5, evidence: 10 },
  { name: 'Leave Your Signature', control: -10, evidence: 80 }
];

export default function SerialKillerHome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [hunting, setHunting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [huntingOutcome, setHuntingOutcome] = useState('');
  const [viewingTrophies, setViewingTrophies] = useState(false);
  const [showInteraction, setShowInteraction] = useState(false);

  const { data: killers = [], isLoading } = useQuery({
    queryKey: ['serialKillers'],
    queryFn: () => base44.entities.SerialKiller.list()
  });

  const killer = killers[0];

  const { data: lovers = [] } = useQuery({
    queryKey: ['obsessedLovers'],
    queryFn: () => base44.entities.ObsessedLover.filter({ killer_id: killer?.id }),
    enabled: !!killer
  });

  const { data: victims = [] } = useQuery({
    queryKey: ['victims'],
    queryFn: () => base44.entities.Victim.filter({ killer_id: killer?.id }),
    enabled: !!killer
  });

  const { data: investigations = [] } = useQuery({
    queryKey: ['investigations'],
    queryFn: () => base44.entities.Investigation.filter({ killer_id: killer?.id }),
    enabled: !!killer
  });

  const activeInvestigation = investigations[0];

  React.useEffect(() => {
    const initKiller = async () => {
      if (!isLoading && killers.length === 0) {
        const names = ['Marcus', 'Ethan', 'Noah', 'Olivia', 'Sophia', 'Emma'];
        const name = names[Math.floor(Math.random() * names.length)];
        
        const newKiller = await base44.entities.SerialKiller.create({
          killer_name: name,
          gender: 'custom',
          sexuality: 'bisexual',
          method: 'knife',
          victim_type: 'Random targets',
          kill_count: 0,
          suspicion_level: 0,
          control_level: 50,
          trophy_count: 0,
          signature: 'Clean. Methodical. No pattern.',
          active_investigation: false,
          media_attention: 0,
          urge_level: 40,
          days_since_kill: 0
        });
        
        const loverNames = ['Jordan', 'Alex', 'Casey', 'Riley', 'Morgan', 'Taylor'];
        const loverName = loverNames[Math.floor(Math.random() * loverNames.length)];
        
        await base44.entities.ObsessedLover.create({
          name: loverName,
          gender: 'custom',
          sexuality: 'bisexual',
          killer_id: newKiller.id,
          obsession_stage: 1,
          knows_truth: false,
          devotion: 30,
          crimes_helped_with: 0,
          boundaries: 'will_not_kill',
          mental_state: 'stable',
          guilt_level: 0,
          would_turn_them_in: false
        });
        
        queryClient.invalidateQueries();
      }
    };
    
    initKiller();
  }, [killers, isLoading, queryClient]);

  if (isLoading || !killer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  const handleHunt = async () => {
    if (!selectedLocation || !selectedMethod) return;
    
    setHunting(true);
    
    setTimeout(async () => {
      const location = HUNTING_LOCATIONS.find(l => l.name === selectedLocation);
      const method = METHODS.find(m => m.name === selectedMethod);
      
      const success = Math.random() * 100 < location.success;
      
      if (success) {
        const victimNames = ['Sarah Chen', 'Marcus Johnson', 'Emma Rodriguez', 'David Kim', 'Lisa Martinez', 'James Wilson'];
        const trophies = ['their ring', 'a lock of hair', 'their watch', 'their necklace', 'their phone', 'their photo'];
        const locations = ['an abandoned warehouse', 'the woods', 'their apartment', 'a hotel room', 'the basement'];
        
        const victimName = victimNames[Math.floor(Math.random() * victimNames.length)];
        const trophy = trophies[Math.floor(Math.random() * trophies.length)];
        const killLocation = locations[Math.floor(Math.random() * locations.length)];
        
        await base44.entities.Victim.create({
          victim_name: victimName,
          killer_id: killer.id,
          method: killer.method,
          location: killLocation,
          trophy_taken: trophy,
          body_found: false,
          evidence_left: method.evidence > 50 ? ['DNA', 'Footprints', 'Weapon'] : method.evidence > 20 ? ['Footprints'] : [],
          time_to_discovery: Math.floor(Math.random() * 7) + 1,
          lover_involvement: 'none'
        });
        
        const newSuspicion = Math.min(100, killer.suspicion_level + (location.risk * 0.3) + (method.evidence * 0.2));
        const newControl = Math.max(0, Math.min(100, killer.control_level + method.control));
        const newUrge = Math.max(0, killer.urge_level - 50);
        
        await base44.entities.SerialKiller.update(killer.id, {
          kill_count: killer.kill_count + 1,
          trophy_count: killer.trophy_count + 1,
          suspicion_level: newSuspicion,
          control_level: newControl,
          urge_level: newUrge,
          days_since_kill: 0,
          media_attention: killer.kill_count >= 3 ? Math.min(100, killer.media_attention + 15) : killer.media_attention
        });
        
        if (killer.kill_count + 1 >= 3 && !activeInvestigation) {
          const detectiveNames = ['Det. Sarah Morgan', 'Det. James Carter', 'Det. Elena Rodriguez', 'Det. Marcus Wright'];
          await base44.entities.Investigation.create({
            killer_id: killer.id,
            lead_detective: detectiveNames[Math.floor(Math.random() * detectiveNames.length)],
            evidence_collected: [],
            suspicion_level: 10,
            status: 'active',
            suspects: [],
            profile_accuracy: 0
          });
        }
        
        const outcomes = [
          `You found ${victimName} at ${selectedLocation}. It was perfect. You took ${trophy}. The urge is satisfied. For now.`,
          `${victimName} never saw it coming. ${selectedLocation} was the perfect hunting ground. You kept ${trophy} as a memento.`,
          `The kill was clean. ${victimName} is gone. ${trophy} is yours now. You feel... alive.`,
          `${selectedLocation}. ${victimName}. ${trophy}. Another one for the collection. The beast is fed.`
        ];
        
        setHuntingOutcome(outcomes[Math.floor(Math.random() * outcomes.length)]);
        
        await base44.entities.NightLog.create({
          entry: `Kill #${killer.kill_count + 1}: ${victimName}. Location: ${killLocation}. Trophy: ${trophy}.`,
          category: 'interaction',
          intensity: 'significant'
        });
      } else {
        setHuntingOutcome('They got away. You were sloppy. The urge burns stronger now.');
        
        await base44.entities.SerialKiller.update(killer.id, {
          suspicion_level: Math.min(100, killer.suspicion_level + location.risk),
          urge_level: Math.min(100, killer.urge_level + 20),
          control_level: Math.max(0, killer.control_level - 10)
        });
      }
      
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        setHunting(false);
        setHuntingOutcome('');
        setSelectedLocation(null);
        setSelectedMethod(null);
      }, 5000);
    }, 3000);
  };

  const getUrgeColor = () => {
    if (killer.urge_level > 80) return 'from-red-600 to-red-900';
    if (killer.urge_level > 50) return 'from-orange-600 to-red-600';
    if (killer.urge_level > 30) return 'from-yellow-600 to-orange-600';
    return 'from-green-600 to-yellow-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-red-950 to-black p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => navigate(createPageUrl('VampireHome'))} className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          {lovers.length > 0 && (
            <button 
              onClick={() => navigate(createPageUrl(`ObsessedLoverHome?id=${lovers[0].id}`))}
              className="text-pink-400 hover:text-pink-300 text-sm"
            >
              Switch to Lover →
            </button>
          )}
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{killer.killer_name}</h1>
          {killer.nickname && <p className="text-red-400 text-lg">"{killer.nickname}"</p>}
          <p className="text-gray-400 capitalize">{killer.method} killer</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-4">
            <Skull className="w-6 h-6 text-red-400 mb-2" />
            <p className="text-2xl font-bold text-white">{killer.kill_count}</p>
            <p className="text-xs text-gray-400">Victims</p>
          </div>
          <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4">
            <Eye className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-white">{killer.suspicion_level}%</p>
            <p className="text-xs text-gray-400">Suspicion</p>
          </div>
          <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-4">
            <Droplets className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-white">{killer.control_level}%</p>
            <p className="text-xs text-gray-400">Control</p>
          </div>
          <div className="bg-orange-950/40 border border-orange-500/30 rounded-xl p-4">
            <AlertTriangle className="w-6 h-6 text-orange-400 mb-2" />
            <p className="text-2xl font-bold text-white">{killer.media_attention}%</p>
            <p className="text-xs text-gray-400">Media</p>
          </div>
        </div>

        {/* Urge Meter */}
        <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-white font-medium">The Urge</span>
            <span className="text-white">{killer.urge_level}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4">
            <motion.div 
              className={`h-4 rounded-full bg-gradient-to-r ${getUrgeColor()}`}
              animate={{ width: `${killer.urge_level}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-gray-400 text-xs mt-2">
            {killer.urge_level > 80 ? 'Overwhelming. You need to kill. Now.' :
             killer.urge_level > 50 ? 'Building. It won\'t be long now.' :
             killer.urge_level > 30 ? 'Present. You can still control it.' :
             'Dormant. For now.'}
          </p>
        </div>

        {/* Investigation Warning */}
        {activeInvestigation && activeInvestigation.suspicion_level > 40 && (
          <div className="bg-red-900/40 border-2 border-red-500 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h3 className="text-red-300 font-bold">ACTIVE INVESTIGATION</h3>
            </div>
            <p className="text-gray-300 text-sm">{activeInvestigation.lead_detective} is getting close. Evidence: {activeInvestigation.evidence_collected.length}</p>
          </div>
        )}

        {/* Hunt Section */}
        {!hunting && !huntingOutcome && (
          <div className="space-y-4 mb-6">
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h3 className="text-white text-xl font-bold mb-4">The Hunt</h3>
              
              <div className="mb-4">
                <label className="text-gray-400 text-sm mb-2 block">Location</label>
                <div className="grid grid-cols-2 gap-2">
                  {HUNTING_LOCATIONS.map(loc => (
                    <button
                      key={loc.name}
                      onClick={() => setSelectedLocation(loc.name)}
                      className={`p-3 rounded-lg transition-all ${
                        selectedLocation === loc.name 
                          ? 'bg-red-600 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <p className="font-medium">{loc.name}</p>
                      <p className="text-xs">Risk: {loc.risk}%</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-gray-400 text-sm mb-2 block">Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {METHODS.map(method => (
                    <button
                      key={method.name}
                      onClick={() => setSelectedMethod(method.name)}
                      className={`p-3 rounded-lg text-left transition-all ${
                        selectedMethod === method.name 
                          ? 'bg-red-600 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <p className="font-medium text-sm">{method.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleHunt}
                disabled={!selectedLocation || !selectedMethod || killer.urge_level < 30}
                className="w-full bg-gradient-to-r from-red-600 to-red-900 hover:from-red-700 hover:to-red-950 disabled:from-gray-700 disabled:to-gray-800 text-white font-bold py-4 rounded-xl disabled:opacity-50"
              >
                {killer.urge_level < 30 ? 'Urge Too Low' : 'BEGIN HUNT'}
              </button>
            </div>
          </div>
        )}

        {/* Interaction with Lover */}
        {lovers.length > 0 && (
          <button
            onClick={() => setShowInteraction(true)}
            className="w-full bg-gradient-to-r from-red-900/40 to-pink-900/40 border-2 border-pink-500/50 rounded-xl p-4 text-left hover:from-red-900/60 hover:to-pink-900/60 transition-all mb-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold">❤️ Interact with {lovers[0].name}</h3>
                <p className="text-gray-400 text-sm">Obsessive love • Devotion: {lovers[0].devotion}%</p>
              </div>
              <Heart className="w-6 h-6 text-pink-400" />
            </div>
          </button>
        )}

        {/* Trophies */}
        <button
          onClick={() => setViewingTrophies(true)}
          className="w-full bg-purple-950/40 border border-purple-500/30 rounded-xl p-4 text-left hover:bg-purple-950/60 transition-all mb-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold">Trophy Collection</h3>
              <p className="text-gray-400 text-sm">{killer.trophy_count} items</p>
            </div>
            <span className="text-3xl">🏆</span>
          </div>
        </button>

        {/* Victims List */}
        {victims.length > 0 && (
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="text-white font-bold mb-3">Your Work</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {victims.map(victim => (
                <div key={victim.id} className="bg-gray-700 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-medium">{victim.victim_name}</p>
                      <p className="text-gray-400 text-xs">{victim.location}</p>
                    </div>
                    {!victim.body_found && <span className="text-green-400 text-xs">Undiscovered</span>}
                    {victim.body_found && <span className="text-red-400 text-xs">Found</span>}
                  </div>
                  <p className="text-gray-500 text-xs mt-1">Trophy: {victim.trophy_taken}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hunting Outcome */}
        <AnimatePresence>
          {hunting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            >
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                <Skull className="w-24 h-24 text-red-500" />
              </motion.div>
            </motion.div>
          )}

          {huntingOutcome && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            >
              <motion.div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full text-center">
                <p className="text-white text-lg leading-relaxed">{huntingOutcome}</p>
              </motion.div>
            </motion.div>
          )}

          {showInteraction && lovers.length > 0 && (
            <KillerLoverInteraction
              killer={killer}
              lover={lovers[0]}
              onClose={() => setShowInteraction(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}