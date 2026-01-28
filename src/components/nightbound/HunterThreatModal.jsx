import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Eye, Sword, MessageCircle, Heart, Skull, Footprints, ShoppingCart, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import HunterEncounter from './HunterEncounter';
import HunterWeaponShop from './HunterWeaponShop';

export default function HunterThreatModal({ onClose, vampireState }) {
  const queryClient = useQueryClient();
  const [selectedHunter, setSelectedHunter] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [showNightWalk, setShowNightWalk] = useState(false);
  const [showWeaponShop, setShowWeaponShop] = useState(false);
  const [showSupernaturalInteraction, setShowSupernaturalInteraction] = useState(false);

  const { data: hunters = [], isLoading } = useQuery({
    queryKey: ['hunters'],
    queryFn: () => base44.entities.Hunter.list('-suspicion')
  });

  const [huntersInitialized, setHuntersInitialized] = React.useState(false);

  // Generate hunters based on exposure
  React.useEffect(() => {
    const initHunters = async () => {
      if (hunters.length === 0 && (vampireState.exposure_level || 0) > 20 && !huntersInitialized) {
        setHuntersInitialized(true);
        const namePool = [
          'Sarah Cross', 'Marcus Blade', 'Father Dominic', 'Dr. Helena Vale',
          'Agent Rivers', 'Sister Margaret', 'Detective Stone', 'Professor Harker',
          'Victor Kane', 'Isabella Hunt', 'Thomas Grey', 'Rachel Ashford'
        ];
        const specialties = ['tracker', 'researcher', 'combatant', 'infiltrator'];
        
        const existingNames = hunters.map(h => h.name);
        const availableNames = namePool.filter(n => !existingNames.includes(n));
        
        const hunterCount = Math.min(Math.floor((vampireState.exposure_level || 0) / 30), availableNames.length, 3);
        
        if (hunterCount > 0) {
          await Promise.all([...Array(hunterCount)].map((_, i) =>
            base44.entities.Hunter.create({
              name: availableNames[i],
              specialty: specialties[i % specialties.length],
              skill_level: Math.floor(Math.random() * 30) + 40,
              suspicion: Math.floor(Math.random() * 40) + 20,
              status: 'tracking'
            })
          ));
          queryClient.invalidateQueries(['hunters']);
        }
      }
    };
    
    initHunters();
  }, [hunters.length, vampireState.exposure_level, huntersInitialized, queryClient]);

  const handleAction = async (action) => {
    setProcessing(true);

    setTimeout(async () => {
      const success = Math.random() > 0.4;
      
      const outcomes = {
        evade: {
          success: ['You vanished into shadows. They lost your trail.', 'Evasion successful. They\'re confused.', 'You disappeared. They found nothing.'],
          fail: ['They tracked you home. Danger increased.', 'Evasion failed. They know more now.', 'They saw you. Suspicion deepened.']
        },
        confront: {
          success: ['You killed them. One less hunter.', 'Combat ended. They won\'t hunt again.', 'Dead hunter. Problem solved.'],
          fail: ['They wounded you. Barely escaped.', 'They\'re skilled. You fled.', 'Combat lost. You ran.']
        },
        seduce: {
          success: ['Seduced. Manipulated. They\'re yours now.', 'You turned their passion. They hunt with you now.', 'Recruited through pleasure. Effective.'],
          fail: ['Seduction failed. They saw through you.', 'Resistant to your charms. Dangerous.', 'They\'re too disciplined. Failed.']
        },
        frame: {
          success: ['Framed as insane. Discredited completely.', 'Evidence planted. They lost all credibility.', 'Framing successful. No one believes them.'],
          fail: ['Frame job failed. They exposed you more.', 'Backfired. More hunters coming.', 'Failed. Situation worse.']
        },
        date: {
          success: ['Forbidden romance blooming. They\'re conflicted. Hunter falling for vampire. Dangerous love.', 'You started dating them. Attraction undeniable. They question everything now.', 'Romance successful. They can\'t hunt you anymore. Love won.'],
          fail: ['They rejected you. Professional boundaries. Still hunting.', 'Romance attempt failed. They\'re more determined to kill you.', 'Attraction acknowledged but denied. Painful for both.']
        }
      };

      const result = success ? 'success' : 'fail';
      const outcomeText = outcomes[action][result][Math.floor(Math.random() * outcomes[action][result].length)];
      
      setOutcome(outcomeText);

      try {
        if (success) {
          if (action === 'confront' || action === 'seduce') {
            await base44.entities.Hunter.update(selectedHunter.id, {
              status: action === 'confront' ? 'dead' : 'recruited',
              suspicion: 0
            });
          } else if (action === 'date') {
            await base44.entities.Hunter.update(selectedHunter.id, {
              status: 'conflicted',
              suspicion: Math.max(0, selectedHunter.suspicion - 40)
            });
            
            await base44.entities.SupernaturalDate.create({
              vampire_id: vampireState.id,
              date_name: selectedHunter.name,
              date_type: 'hunter',
              gender: 'custom',
              personality: ['conflicted', 'dangerous'],
              relationship_level: 30,
              tension_level: 40,
              dangerous_attraction: true
            });
          } else {
            await base44.entities.Hunter.update(selectedHunter.id, {
              suspicion: Math.max(0, selectedHunter.suspicion - 30)
            });
          }
        } else {
          await base44.entities.Hunter.update(selectedHunter.id, {
            suspicion: Math.min(100, selectedHunter.suspicion + 20)
          });
          
          if (vampireState.id) {
            await base44.entities.VampireState.update(vampireState.id, {
              exposure_level: Math.min(100, (vampireState.exposure_level || 0) + 10)
            });
          }
        }
      } catch (e) {
        console.error('Failed to update hunter:', e);
      }

      await base44.entities.NightLog.create({
        entry: `Hunter ${selectedHunter.name}: ${outcomeText}`,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
        setSelectedHunter(null);
      }, 4000);
    }, 2000);
  };

  const specialtyIcons = {
    tracker: Target,
    researcher: Eye,
    combatant: Sword,
    infiltrator: Eye
  };

  return (
    <>
      {showWeaponShop && selectedHunter && (
        <HunterWeaponShop
          hunter={selectedHunter}
          onClose={() => setShowWeaponShop(false)}
          onPurchase={(weapon) => {
            base44.entities.NightLog.create({
              entry: `${selectedHunter.name} purchased ${weapon.name}.`,
              category: 'hunting',
              intensity: 'minor'
            });
          }}
        />
      )}
      {showNightWalk && (
        <HunterEncounter vampireState={vampireState} onClose={() => setShowNightWalk(false)} />
      )}
      {!showNightWalk && !showWeaponShop && !showSupernaturalInteraction && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Hunter Threats</h2>
        <p className="text-gray-400 text-sm mb-4">
          Exposure: {vampireState.exposure_level || 0}% {(vampireState.exposure_level || 0) < 20 && '(Low exposure - no hunters yet)'}
        </p>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => setShowNightWalk(true)}
            className="bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-xl p-3 transition-colors flex flex-col items-center gap-1"
          >
            <Footprints className="w-5 h-5 text-purple-400" />
            <span className="text-white text-xs font-medium">Night Walk</span>
          </button>
          <button
            onClick={() => setShowWeaponShop(true)}
            className="bg-yellow-900/40 hover:bg-yellow-900/60 border border-yellow-500/30 rounded-xl p-3 transition-colors flex flex-col items-center gap-1"
          >
            <ShoppingCart className="w-5 h-5 text-yellow-400" />
            <span className="text-white text-xs font-medium">Armory</span>
          </button>
          {hunters.length > 0 && (
            <button
              onClick={() => setShowSupernaturalInteraction(true)}
              className="col-span-2 bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 rounded-xl p-3 transition-colors flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5 text-red-400" />
              <span className="text-white text-xs font-medium">Hunt Supernatural</span>
            </button>
          )}
        </div>

        {hunters.length === 0 ? (
          <div className="text-center py-12">
            <Eye className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No active hunter threats. Keep it that way.</p>
            <p className="text-gray-500 text-sm mt-2">Be reckless to attract hunters...</p>
          </div>
        ) : !selectedHunter ? (
          <div className="space-y-3">
            {hunters.map(hunter => {
              const Icon = specialtyIcons[hunter.specialty];
              return (
                <button
                  key={hunter.id}
                  onClick={() => setSelectedHunter(hunter)}
                  className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-6 h-6 text-red-400 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-white font-bold">{hunter.name}</h3>
                      <p className="text-gray-400 text-sm capitalize">{hunter.specialty} • {hunter.status}</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Suspicion</span>
                          <span className="text-red-400">{hunter.suspicion}/100</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                          <div
                            style={{ width: `${hunter.suspicion}%` }}
                            className="h-1.5 bg-gradient-to-r from-orange-600 to-red-600 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : outcome ? (
          <div className="text-center py-12">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gray-300 text-lg"
            >
              {outcome}
            </motion.p>
          </div>
        ) : processing ? (
          <div className="text-center py-12">
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-gray-400"
            >
              ...
            </motion.p>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => setSelectedHunter(null)}
              className="text-gray-400 hover:text-white text-sm mb-4"
            >
              ← Back
            </button>

            <h3 className="text-white text-xl font-bold mb-4">{selectedHunter.name}</h3>

            <button
              onClick={() => handleAction('evade')}
              className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-xl p-4 text-left transition-colors"
            >
              <Eye className="w-5 h-5 text-blue-400 mb-2" />
              <h4 className="text-white font-medium">Evade & Hide</h4>
              <p className="text-gray-400 text-sm">Disappear. Lay low. Avoid confrontation.</p>
            </button>

            <button
              onClick={() => handleAction('confront')}
              className="w-full bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 rounded-xl p-4 text-left transition-colors"
            >
              <Skull className="w-5 h-5 text-red-400 mb-2" />
              <h4 className="text-white font-medium">Kill Them</h4>
              <p className="text-gray-400 text-sm">Direct confrontation. Permanent solution.</p>
            </button>

            <button
              onClick={() => handleAction('seduce')}
              className="w-full bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-xl p-4 text-left transition-colors"
            >
              <Heart className="w-5 h-5 text-purple-400 mb-2" />
              <h4 className="text-white font-medium">Seduce & Recruit</h4>
              <p className="text-gray-400 text-sm">Turn them. Make them yours instead.</p>
            </button>

            <button
              onClick={() => handleAction('date')}
              className="w-full bg-pink-900/40 hover:bg-pink-900/60 border border-pink-500/30 rounded-xl p-4 text-left transition-colors"
            >
              <Heart className="w-5 h-5 text-pink-400 mb-2" />
              <h4 className="text-white font-medium">Forbidden Romance</h4>
              <p className="text-gray-400 text-sm">Date them. Dangerous attraction. Hunter falling for vampire.</p>
            </button>

            <button
              onClick={() => handleAction('frame')}
              className="w-full bg-yellow-900/40 hover:bg-yellow-900/60 border border-yellow-500/30 rounded-xl p-4 text-left transition-colors"
            >
              <MessageCircle className="w-5 h-5 text-yellow-400 mb-2" />
              <h4 className="text-white font-medium">Frame as Insane</h4>
              <p className="text-gray-400 text-sm">Discredit them. No one will believe them.</p>
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
      )}
      {showWeaponShop && !selectedHunter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
          <motion.div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full">
            <p className="text-gray-400 mb-4">Select a hunter first to equip weapons.</p>
            <button
              onClick={() => setShowWeaponShop(false)}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
}