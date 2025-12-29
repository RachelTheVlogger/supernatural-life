import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Users, Droplets, Eye, Shield, Skull, Brain, Zap, Heart, Flame, Crown, Ghost } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const BLOODLINES = ['Crimson', 'Shadow', 'Ancient', 'Eternal', 'Celestial'];
const NAMES = ['Elena', 'Katherine', 'Alex', 'Jordan', 'Riley', 'Morgan', 'Taylor', 'Casey', 'Quinn', 'Avery'];

export default function DoppelgangerSystem({ vampireState, onClose }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searching, setSearching] = useState(false);
  const [searchOutcome, setSearchOutcome] = useState('');
  const [acting, setActing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [selectedDoppelganger, setSelectedDoppelganger] = useState(null);

  const { data: doppelgangers = [] } = useQuery({
    queryKey: ['doppelgangers'],
    queryFn: () => base44.entities.Doppelganger.list()
  });

  const handleSearch = async () => {
    setSearching(true);

    setTimeout(async () => {
      const chance = Math.random();
      
      if (chance < 0.3) {
        // Found a doppelganger!
        const bloodline = BLOODLINES[Math.floor(Math.random() * BLOODLINES.length)];
        const name = NAMES[Math.floor(Math.random() * NAMES.length)];
        
        const newDoppelganger = await base44.entities.Doppelganger.create({
          name,
          bloodline,
          power_level: 100,
          relationship_vampire: 0,
          is_aware: false,
          is_vampire: false,
          times_bled: 0,
          location: 'discovered',
          hunted_by: []
        });

        await base44.entities.NightLog.create({
          entry: `You found a doppelgänger: ${name} of the ${bloodline} bloodline. Their blood pulses with ancient power.`,
          category: 'power',
          intensity: 'significant'
        });

        queryClient.invalidateQueries(['doppelgangers']);
        setSearchOutcome(`Found ${name}! A ${bloodline} bloodline doppelgänger. Rare. Powerful.`);
      } else {
        setSearchOutcome('No doppelgängers found. They are exceptionally rare...');
      }

      setTimeout(() => {
        setSearching(false);
        setSearchOutcome('');
      }, 3000);
    }, 2000);
  };

  const handleAction = async (action, doppelganger) => {
    setActing(true);

    setTimeout(async () => {
      let message = '';
      let humanityChange = 0;

      if (action === 'impersonate') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.max((doppelganger.relationship_vampire || 0) - 25, -100)
        });

        const impersonations = [
          `You pretended to be ${doppelganger.name}. Lived their life for a week. Met their friends. Their family. Slept with their partner. Ruined everything. When you revealed yourself, the betrayal in their eyes was delicious.`,
          `You impersonated ${doppelganger.name} perfectly. Same face. Same voice. Destroyed their reputation. Made enemies in their name. They came back to a life in ruins. "That wasn't me!" Nobody believes them.`,
          `You became ${doppelganger.name}. Stole their identity completely. Got them fired. Broke up with their lover for them. They watched from the shadows, helpless. You smiled at them. "Thanks for the life."`
        ];
        message = impersonations[Math.floor(Math.random() * impersonations.length)];
        humanityChange = -10;
      } else if (action === 'steal_life') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.max((doppelganger.relationship_vampire || 0) - 35, -100)
        });

        const thefts = [
          `You took everything. Their apartment - yours now. Their job - you charmed the boss. Their friends - convinced them ${doppelganger.name} was crazy. Their lover - seduced them in their bed. ${doppelganger.name} has NOTHING left.`,
          `Systematic destruction. You stole their identity piece by piece. Bank account drained. Lease canceled. Relationships poisoned. ${doppelganger.name} became a ghost in their own life. You're living their dream.`,
          `You didn't just impersonate. You REPLACED them. Everyone thinks YOU are the real one now. ${doppelganger.name} tries to explain. "I'm me!" But you have their memories. Their face. Who's the copy?`
        ];
        message = thefts[Math.floor(Math.random() * thefts.length)];
        humanityChange = -15;
      } else if (action === 'possess') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.max((doppelganger.relationship_vampire || 0) - 40, -100),
          is_aware: true
        });

        const possessions = [
          `You forced your consciousness into ${doppelganger.name}'s body. They screamed inside their own mind. Trapped. You lived as them for MONTHS. Did terrible things. When you left, they remembered everything. Couldn't wash the violation away.`,
          `Body possession. You pushed ${doppelganger.name}'s soul aside. Took control. Used their body however you wanted. They felt everything but controlled nothing. When you released them, they collapsed sobbing.`,
          `You possessed ${doppelganger.name} and made them hurt people they love. Used their hands to destroy. Their voice to lie. When you left, the guilt remained. They'll never forgive themselves.`
        ];
        message = possessions[Math.floor(Math.random() * possessions.length)];
        humanityChange = -20;
      } else if (action === 'gaslighting') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.max((doppelganger.relationship_vampire || 0) - 15, -100)
        });

        const gaslights = [
          `You made ${doppelganger.name} doubt everything. "That never happened." "You're remembering wrong." "You're going crazy." You rewrote their reality. Now they don't trust their own memories.`,
          `You convinced ${doppelganger.name} that they're the doppelganger and YOU'RE the original. They believe it now. Identity crisis complete.`,
          `Gaslighting as art. You made ${doppelganger.name} question their sanity. Moved belongings. Denied conversations. They think they're losing their mind. Came to YOU for help.`
        ];
        message = gaslights[Math.floor(Math.random() * gaslights.length)];
        humanityChange = -8;
      } else if (action === 'rivalry') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: (doppelganger.relationship_vampire || 0) - 20
        });

        const rivalries = [
          `You challenged ${doppelganger.name}. Who's better? You won. Every time. Proved you're superior. They hate you. Good. Hate keeps them obsessed with beating you.`,
          `Competition. You stole their achievements. Did everything they did, but BETTER. They got promoted? You got promoted HIGHER. Constantly one-upping them.`,
          `Everything's a competition. Every victory yours. Every failure theirs. ${doppelganger.name} is consumed with beating you. They never will.`
        ];
        message = rivalries[Math.floor(Math.random() * rivalries.length)];
        humanityChange = -5;
      } else if (action === 'steal_love') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.max((doppelganger.relationship_vampire || 0) - 30, -100)
        });

        const thefts = [
          `${doppelganger.name} had someone they loved. HAD. You seduced them. Stole them. Made them forget the original. Now they're yours. ${doppelganger.name} watched helpless.`,
          `You targeted their lover specifically. Seduction. Better everything. They left ${doppelganger.name} for you. "You're what I thought they were." Replaced.`,
          `Same face. Better personality. You took their partner easily. Now addicted to you. ${doppelganger.name} lost them forever.`
        ];
        message = thefts[Math.floor(Math.random() * thefts.length)];
        humanityChange = -12;
      } else if (action === 'frame') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.max((doppelganger.relationship_vampire || 0) - 25, -100)
        });

        const frames = [
          `You committed crimes wearing ${doppelganger.name}'s face. Murder. Theft. All caught on camera. All blamed on them. They're arrested. You visit them in jail. Smile through the glass.`,
          `You framed ${doppelganger.name} for YOUR kills. Every witness saw their face. Police hunting THEM. They're running. Terrified. You? Safe.`,
          `Perfect frame job. Planted evidence everywhere. They're wanted. Hunted. Ruined. You took their life and gave them your crimes.`
        ];
        message = frames[Math.floor(Math.random() * frames.length)];
        humanityChange = -14;
      } else if (action === 'ruin') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.max((doppelganger.relationship_vampire || 0) - 45, -100)
        });

        const ruins = [
          `Total destruction. Career sabotaged. Relationships poisoned. Reputation demolished. Family turned against them. They have NOTHING. You did this methodically. Completely.`,
          `You didn't just ruin their life. You made them ruin it themselves. Compelled them to destroy everything while conscious but unable to stop. Everyone thinks they went insane.`,
          `Systematic annihilation. You spent months destroying every good thing. Watched them spiral. Then you appeared. "I can make it stop. Obey me." They agreed. You own them.`
        ];
        message = ruins[Math.floor(Math.random() * ruins.length)];
        humanityChange = -18;
      } else if (action === 'jealousy') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.min((doppelganger.relationship_vampire || 0) + 15, 100)
        });

        const jealousies = [
          `You flaunted your vampire life. Powers. Immortality. Everything ${doppelganger.name} doesn't have. Made them watch you seduce people effortlessly. They're consumed with envy.`,
          `You made ${doppelganger.name} jealous of their own face. "I wear it better, don't I?" Same appearance. Different lives. They hate not being you.`,
          `You lived ${doppelganger.name}'s dream life in front of them. Everything they wanted. You have it. The jealousy eats them alive.`
        ];
        message = jealousies[Math.floor(Math.random() * jealousies.length)];
        humanityChange = -6;
      } else if (action === 'obsess') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.min((doppelganger.relationship_vampire || 0) + 40, 100)
        });

        const obsessions = [
          `You made yourself irresistible to ${doppelganger.name}. Vampire charm. Manipulation. Now they think about you constantly. Can't eat. Can't sleep. Only you. Obsession complete.`,
          `You created twisted dependency. Saved them. Hurt them. Saved them again. Now ${doppelganger.name} is OBSESSED. Addicted to the chaos you bring.`,
          `Mind games until ${doppelganger.name} became consumed with you. Every thought. You became their entire world. Obsession is control.`
        ];
        message = obsessions[Math.floor(Math.random() * obsessions.length)];
        humanityChange = -8;
      } else if (action === 'cure') {
        if (doppelganger.is_vampire) {
          await base44.entities.Doppelganger.update(doppelganger.id, {
            is_vampire: false,
            power_level: 50,
            relationship_vampire: Math.max((doppelganger.relationship_vampire || 0) - 50, -100)
          });

          message = `You FORCED the cure down their throat. Made them human again. They BEGGED to stay vampire. Screamed. Fought. You held them down. Watched their fangs retract. Humanity restored. Against their will.`;
          humanityChange = -12;
        } else {
          message = `They're already human. The cure would do nothing.`;
        }
      } else if (action === 'blood') {
        const powerGain = Math.floor(20 + (doppelganger.power_level / 5));
        
        await base44.entities.Doppelganger.update(doppelganger.id, {
          times_bled: doppelganger.times_bled + 1,
          power_level: Math.max(doppelganger.power_level - 10, 20)
        });

        if (vampireState) {
          await base44.entities.VampireState.update(vampireState.id, {
            vampire_power_level: Math.min(vampireState.vampire_power_level + powerGain, 100)
          });
        }

        message = `Their blood is PURE POWER. Ancient. Intoxicating. +${powerGain} vampire power. You feel invincible.`;
        humanityChange = -5;
      } else if (action === 'turn') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          is_vampire: true,
          power_level: 150
        });

        message = `You turned the doppelganger. Their vampire form is TERRIFYING. Unnaturally powerful. This changes everything.`;
        humanityChange = -10;
      } else if (action === 'bond') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.min((doppelganger.relationship_vampire || 0) + 30, 100)
        });

        message = `You spent time with ${doppelganger.name}. Really talked. Shared stories. They see you as a friend now. Understanding grows.`;
        humanityChange = 5;
      } else if (action === 'save') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.min((doppelganger.relationship_vampire || 0) + 25, 100),
          protected_by: vampireState.id
        });

        message = `Hunters came for ${doppelganger.name}. You slaughtered them all. Blood everywhere. They watched you kill for them. They owe you their life now.`;
        humanityChange = 8;
      } else if (action === 'sacrifice') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.min((doppelganger.relationship_vampire || 0) + 50, 100),
          protected_by: vampireState.id
        });

        message = `You took a hunter's blade meant for ${doppelganger.name}. Your blood. Their life. They saw you bleed for them. They'll never forget.`;
        humanityChange = 10;
      } else if (action === 'protect') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          protected_by: vampireState?.id,
          relationship_vampire: Math.min((doppelganger.relationship_vampire || 0) + 30, 100)
        });

        message = `You vowed to protect ${doppelganger.name}. Every supernatural creature will come for them. You against the world.`;
        humanityChange = 5;
      } else if (action === 'seduce') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.min((doppelganger.relationship_vampire || 0) + 35, 100)
        });

        message = `You seduced ${doppelganger.name}. Slow. Deliberate. Vampire charm overwhelmed them. They couldn't resist. Now they crave your touch.`;
        humanityChange = -1;
      } else if (action === 'gift') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.min((doppelganger.relationship_vampire || 0) + 20, 100)
        });

        message = `You gave ${doppelganger.name} something precious. Their eyes lit up. They feel special. Chosen. The gift bonds you.`;
        humanityChange = 3;
      } else if (action === 'test') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          power_level: Math.min((doppelganger.power_level || 100) + 15, 150)
        });

        message = `You tested ${doppelganger.name}'s limits. Pushed them hard. They discovered new strength. Grew more powerful from it.`;
        humanityChange = -2;
      } else if (action === 'stalk') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.max((doppelganger.relationship_vampire || 0) - 5, -100)
        });

        message = `You watched ${doppelganger.name} sleep. Followed them everywhere. They sense someone watching but see nothing. Paranoia sets in.`;
        humanityChange = -3;
      } else if (action === 'manipulate') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: (doppelganger.relationship_vampire || 0) + 10,
          is_aware: false
        });

        message = `You compelled ${doppelganger.name}. Made them forget suspicions. Orchestrated events. Made yourself their hero. They trust you completely now.`;
        humanityChange = -5;
      } else if (action === 'torment') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.max((doppelganger.relationship_vampire || 0) - 15, -100)
        });

        message = `You appeared in ${doppelganger.name}'s dreams. Every night. Their nightmares now have your face. Psychological torture.`;
        humanityChange = -8;
      } else if (action === 'abandon') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.max((doppelganger.relationship_vampire || 0) - 35, -100),
          protected_by: null
        });

        message = `You left ${doppelganger.name}. No explanation. No goodbye. They waited. You never came back. The hurt in their eyes was real.`;
        humanityChange = -6;
      } else if (action === 'reveal') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          is_aware: true,
          relationship_vampire: (doppelganger.relationship_vampire || 0) - 20
        });

        message = `You told ${doppelganger.name} the truth. They're a shadow. A copy. Destined to die for supernatural purposes. They look at you with horror.`;
        humanityChange = 0;
      }

      if (humanityChange !== 0 && vampireState) {
        await base44.entities.VampireState.update(vampireState.id, {
          humanity: Math.max(0, Math.min(100, vampireState.humanity + humanityChange))
        });
      }

      await base44.entities.NightLog.create({
        entry: message,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();
      setOutcome(message);
      
      setTimeout(() => {
        setActing(false);
        setOutcome('');
        setSelectedDoppelganger(null);
      }, 4000);
    }, 2000);
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">👥 Doppelgängers</h2>
        <p className="text-gray-400 text-sm mb-6">Supernatural doubles. Their blood is ancient power. Elena and Katherine energy.</p>

        {!selectedDoppelganger ? (
          <>
            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={searching}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-medium py-4 rounded-xl mb-6 transition-all"
            >
              <Search className="w-5 h-5 inline mr-2" />
              {searching ? 'Searching...' : 'Search for Doppelgänger'}
            </button>

            {searchOutcome && (
              <div className="bg-purple-900/40 border border-purple-500/30 rounded-xl p-4 mb-6">
                <p className="text-purple-200">{searchOutcome}</p>
              </div>
            )}

            {/* Discovered Doppelgangers */}
            {doppelgangers.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-white font-bold mb-3">Discovered Doppelgängers ({doppelgangers.length})</h3>
                {doppelgangers.map(d => (
                  <div key={d.id} className="bg-gray-800 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-white font-bold text-lg">{d.name}</h4>
                        <p className="text-purple-400 text-sm">{d.bloodline} Bloodline</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-xs">Power: {d.power_level}%</p>
                        <p className="text-gray-400 text-xs">Bond: {d.relationship_vampire || 0}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedDoppelganger(d)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors"
                    >
                      Interact
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : outcome ? (
          <div className="py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 rounded-xl p-6 border border-purple-500/30"
            >
              <p className="text-gray-300 text-base leading-relaxed">{outcome}</p>
            </motion.div>
          </div>
        ) : acting ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              👥
            </motion.div>
            <p className="text-purple-400">Processing...</p>
          </div>
        ) : (
          <>
            <button
              onClick={() => setSelectedDoppelganger(null)}
              className="text-gray-400 hover:text-white text-sm mb-4"
            >
              ← Back
            </button>

            <div className="bg-gray-800 rounded-xl p-6 mb-6">
              <h3 className="text-white text-2xl font-bold mb-2">{selectedDoppelganger.name}</h3>
              <p className="text-purple-400 mb-4">{selectedDoppelganger.bloodline} Bloodline</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400">Form</p>
                  <p className="text-white">{selectedDoppelganger.is_vampire ? '🦇 Vampire' : '👤 Human'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Power</p>
                  <p className="text-white">{selectedDoppelganger.power_level}%</p>
                </div>
                <div>
                  <p className="text-gray-400">Aware</p>
                  <p className="text-white">{selectedDoppelganger.is_aware ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Bond</p>
                  <p className="text-white">{selectedDoppelganger.relationship_vampire || 0}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
              {/* VAMPIRE ACTIONS */}
              {!selectedDoppelganger.is_vampire && (
                <>
                  <button
                    onClick={() => handleAction('blood', selectedDoppelganger)}
                    className="w-full bg-gradient-to-r from-red-900/60 to-red-950/60 hover:from-red-900/80 hover:to-red-950/80 border-2 border-red-500/50 rounded-xl py-4 text-white"
                  >
                    <Droplets className="w-5 h-5 inline mr-2" />
                    Drink Their Blood
                  </button>
                  <button
                    onClick={() => handleAction('turn', selectedDoppelganger)}
                    className="w-full bg-gradient-to-r from-purple-900/60 to-purple-950/60 hover:from-purple-900/80 hover:to-purple-950/80 border-2 border-purple-500/50 rounded-xl py-4 text-white"
                  >
                    <Skull className="w-5 h-5 inline mr-2" />
                    Turn Into Vampire
                  </button>
                </>
              )}
              {selectedDoppelganger.is_vampire && (
                <button
                  onClick={() => handleAction('cure', selectedDoppelganger)}
                  className="w-full bg-gradient-to-r from-blue-900/60 to-cyan-950/60 hover:from-blue-900/80 hover:to-cyan-950/80 border-2 border-blue-500/50 rounded-xl py-4 text-white"
                >
                  <Zap className="w-5 h-5 inline mr-2" />
                  Force The Cure On Them
                </button>
              )}

              {/* ELENA/KATHERINE PSYCHOLOGICAL WARFARE */}
              <button
                onClick={() => handleAction('impersonate', selectedDoppelganger)}
                className="w-full bg-gradient-to-r from-indigo-900/60 to-purple-950/60 hover:from-indigo-900/80 hover:to-purple-950/80 border-2 border-indigo-500/50 rounded-xl py-4 text-white"
              >
                <Users className="w-5 h-5 inline mr-2" />
                Impersonate Them
              </button>
              <button
                onClick={() => handleAction('steal_life', selectedDoppelganger)}
                className="w-full bg-gradient-to-r from-purple-900/60 to-pink-950/60 hover:from-purple-900/80 hover:to-pink-950/80 border-2 border-purple-500/50 rounded-xl py-4 text-white"
              >
                <Skull className="w-5 h-5 inline mr-2" />
                Steal Their Entire Life
              </button>
              <button
                onClick={() => handleAction('possess', selectedDoppelganger)}
                className="w-full bg-gradient-to-r from-red-900/60 to-purple-950/60 hover:from-red-900/80 hover:to-purple-950/80 border-2 border-red-500/50 rounded-xl py-4 text-white"
              >
                <Brain className="w-5 h-5 inline mr-2" />
                Possess Their Body
              </button>
              <button
                onClick={() => handleAction('steal_love', selectedDoppelganger)}
                className="w-full bg-gradient-to-r from-pink-900/60 to-red-950/60 hover:from-pink-900/80 hover:to-red-950/80 border-2 border-pink-500/50 rounded-xl py-4 text-white"
              >
                <Heart className="w-5 h-5 inline mr-2" />
                Steal Their Lover
              </button>
              <button
                onClick={() => handleAction('frame', selectedDoppelganger)}
                className="w-full bg-gradient-to-r from-yellow-900/60 to-orange-950/60 hover:from-yellow-900/80 hover:to-orange-950/80 border-2 border-yellow-500/50 rounded-xl py-4 text-white"
              >
                <Skull className="w-5 h-5 inline mr-2" />
                Frame Them For Crimes
              </button>
              <button
                onClick={() => handleAction('ruin', selectedDoppelganger)}
                className="w-full bg-gradient-to-r from-red-900/60 to-black/80 hover:from-red-900/80 hover:to-black border-2 border-red-700/50 rounded-xl py-4 text-red-300"
              >
                <Skull className="w-5 h-5 inline mr-2" />
                Completely Ruin Them
              </button>
              <button
                onClick={() => handleAction('gaslighting', selectedDoppelganger)}
                className="w-full bg-gradient-to-r from-gray-900/60 to-purple-950/60 hover:from-gray-900/80 hover:to-purple-950/80 border-2 border-gray-500/50 rounded-xl py-4 text-white"
              >
                <Eye className="w-5 h-5 inline mr-2" />
                Gaslight Them
              </button>
              <button
                onClick={() => handleAction('rivalry', selectedDoppelganger)}
                className="w-full bg-gradient-to-r from-orange-900/60 to-red-950/60 hover:from-orange-900/80 hover:to-red-950/80 border-2 border-orange-500/50 rounded-xl py-4 text-white"
              >
                <Flame className="w-5 h-5 inline mr-2" />
                Compete With Them
              </button>
              <button
                onClick={() => handleAction('jealousy', selectedDoppelganger)}
                className="w-full bg-gradient-to-r from-green-900/60 to-emerald-950/60 hover:from-green-900/80 hover:to-emerald-950/80 border-2 border-green-500/50 rounded-xl py-4 text-white"
              >
                <Zap className="w-5 h-5 inline mr-2" />
                Make Them Jealous
              </button>
              <button
                onClick={() => handleAction('obsess', selectedDoppelganger)}
                className="w-full bg-gradient-to-r from-pink-900/60 to-purple-950/60 hover:from-pink-900/80 hover:to-purple-950/80 border-2 border-pink-500/50 rounded-xl py-4 text-white"
              >
                <Heart className="w-5 h-5 inline mr-2" />
                Make Them Obsessed
              </button>

              {/* POSITIVE INTERACTIONS */}
              <button
                onClick={() => handleAction('bond', selectedDoppelganger)}
                className="w-full bg-gradient-to-r from-blue-900/60 to-cyan-950/60 hover:from-blue-900/80 hover:to-cyan-950/80 border-2 border-cyan-500/50 rounded-xl py-4 text-white"
              >
                <Heart className="w-5 h-5 inline mr-2" />
                Bond With Them
              </button>
              <button
                onClick={() => handleAction('save', selectedDoppelganger)}
                className="w-full bg-gradient-to-r from-green-900/60 to-green-950/60 hover:from-green-900/80 hover:to-green-950/80 border-2 border-green-500/50 rounded-xl py-4 text-white"
              >
                <Shield className="w-5 h-5 inline mr-2" />
                Save From Danger
              </button>
              <button
                onClick={() => handleAction('sacrifice', selectedDoppelganger)}
                className="w-full bg-gradient-to-r from-yellow-900/60 to-yellow-950/60 hover:from-yellow-900/80 hover:to-yellow-950/80 border-2 border-yellow-500/50 rounded-xl py-4 text-white"
              >
                <Crown className="w-5 h-5 inline mr-2" />
                Sacrifice For Them
              </button>
              <button
                onClick={() => handleAction('protect', selectedDoppelganger)}
                className="w-full bg-gradient-to-r from-blue-900/60 to-blue-950/60 hover:from-blue-900/80 hover:to-blue-950/80 border-2 border-blue-500/50 rounded-xl py-4 text-white"
              >
                <Shield className="w-5 h-5 inline mr-2" />
                Vow Protection
              </button>
              <button
                onClick={() => handleAction('seduce', selectedDoppelganger)}
                className="w-full bg-gradient-to-r from-rose-900/60 to-pink-950/60 hover:from-rose-900/80 hover:to-pink-950/80 border-2 border-rose-500/50 rounded-xl py-4 text-rose-300"
              >
                <Flame className="w-5 h-5 inline mr-2" />
                Seduce Them
              </button>
              <button
                onClick={() => handleAction('gift', selectedDoppelganger)}
                className="w-full bg-gradient-to-r from-pink-900/60 to-pink-950/60 hover:from-pink-900/80 hover:to-pink-950/80 border-2 border-pink-500/50 rounded-xl py-4 text-white"
              >
                <Heart className="w-5 h-5 inline mr-2" />
                Give Gift
              </button>
              <button
                onClick={() => handleAction('test', selectedDoppelganger)}
                className="w-full bg-gradient-to-r from-orange-900/60 to-orange-950/60 hover:from-orange-900/80 hover:to-orange-950/80 border-2 border-orange-500/50 rounded-xl py-4 text-white"
              >
                <Zap className="w-5 h-5 inline mr-2" />
                Test Their Limits
              </button>

              {/* DARK INTERACTIONS */}
              <button
                onClick={() => handleAction('stalk', selectedDoppelganger)}
                className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl py-4 text-white"
              >
                <Eye className="w-5 h-5 inline mr-2" />
                Stalk Them
              </button>
              <button
                onClick={() => handleAction('manipulate', selectedDoppelganger)}
                className="w-full bg-gradient-to-r from-purple-950/60 to-purple-950/80 hover:from-purple-950/80 hover:to-purple-950/100 border-2 border-purple-600/40 rounded-xl py-4 text-purple-400"
              >
                <Eye className="w-5 h-5 inline mr-2" />
                Compel & Manipulate
              </button>
              <button
                onClick={() => handleAction('torment', selectedDoppelganger)}
                className="w-full bg-gradient-to-r from-red-950/60 to-red-950/80 hover:from-red-950/80 hover:to-red-950/100 border-2 border-red-600/40 rounded-xl py-4 text-red-400"
              >
                <Skull className="w-5 h-5 inline mr-2" />
                Torment Them
              </button>
              <button
                onClick={() => handleAction('abandon', selectedDoppelganger)}
                className="w-full bg-gradient-to-r from-gray-900/60 to-gray-950/60 hover:from-gray-900/80 hover:to-gray-950/80 border-2 border-gray-600/40 rounded-xl py-4 text-gray-400"
              >
                <Ghost className="w-5 h-5 inline mr-2" />
                Abandon Them
              </button>
              {!selectedDoppelganger.is_aware && (
                <button
                  onClick={() => handleAction('reveal', selectedDoppelganger)}
                  className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl py-4 text-white"
                >
                  <Eye className="w-5 h-5 inline mr-2" />
                  Tell Them The Truth
                </button>
              )}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}