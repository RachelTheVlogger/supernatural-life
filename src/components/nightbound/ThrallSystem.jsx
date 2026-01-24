import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Eye, Users, Target, MessageCircle, Skull, Shield, Zap, Heart, Droplets, Gift, Brain, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ThrallLoyalty from './ThrallLoyalty';
import ThrallArmy from './ThrallArmy';

const MISSIONS = [
  { id: 'spy', label: 'Spy on Someone', icon: Eye, duration: 2, risk: 'medium', roleRequired: 'spy' },
  { id: 'infiltrate', label: 'Infiltrate Organization', icon: Users, duration: 3, risk: 'high', roleRequired: 'spy' },
  { id: 'guard', label: 'Guard Location', icon: Shield, duration: 1, risk: 'low', roleRequired: 'guard' },
  { id: 'messenger', label: 'Deliver Message', icon: MessageCircle, duration: 1, risk: 'low', roleRequired: 'messenger' },
  { id: 'assassinate', label: 'Eliminate Target', icon: Skull, duration: 2, risk: 'high', roleRequired: 'assassin' },
  { id: 'seduce', label: 'Seduce Target', icon: Heart, duration: 2, risk: 'medium', roleRequired: 'seducer' },
  { id: 'sabotage', label: 'Sabotage Operation', icon: Zap, duration: 3, risk: 'high', roleRequired: 'saboteur' }
];

const THRALL_ACTIONS = [
  { id: 'reinforce', label: 'Reinforce Control', desc: 'Break their mind further. Restore control.', icon: Zap },
  { id: 'extract', label: 'Extract Information', desc: 'Force them to reveal everything they know.', icon: Eye },
  { id: 'use', label: 'Use Them', desc: 'They exist to serve your desires. No resistance.', icon: Heart },
  { id: 'feed', label: 'Feed on Them', desc: 'Drain their blood. They won\'t resist.', icon: Droplets },
  { id: 'gift', label: 'Send as Gift', desc: 'Give them to ally or rival for favors.', icon: Gift },
  { id: 'memories', label: 'Implant False Memories', desc: 'Rewrite their past. Make them believe lies.', icon: Brain },
  { id: 'condition', label: 'Condition Response', desc: 'Train them to crave servitude. Increase loyalty.', icon: Sparkles },
  { id: 'bait', label: 'Use as Bait', desc: 'Sacrifice them to lure enemies.', icon: Target },
  { id: 'dispose', label: 'Dispose of Thrall', desc: 'Kill them. They served their purpose.', icon: Skull }
];

export default function ThrallSystem({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [selectedThrall, setSelectedThrall] = useState(null);
  const [creating, setCreating] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [showLoyalty, setShowLoyalty] = useState(false);
  const [showArmy, setShowArmy] = useState(false);
  const [showRoles, setShowRoles] = useState(false);

  const { data: thralls = [] } = useQuery({
    queryKey: ['thralls', vampireState?.id],
    queryFn: async () => {
      if (!vampireState?.id) return [];
      return await base44.entities.Thrall.filter({ vampire_id: vampireState.id });
    },
    enabled: !!vampireState?.id
  });

  const { data: npcs = [] } = useQuery({
    queryKey: ['npcs'],
    queryFn: () => base44.entities.NPC.list()
  });

  const handleAssignRole = async (thrallId, role) => {
    try {
      const roleSkills = {
        spy: { stealth: 3, deception: 3, observation: 3 },
        assassin: { combat: 3, stealth: 4, precision: 3 },
        guard: { combat: 4, awareness: 3, loyalty: 4 },
        seducer: { charm: 4, deception: 3, persuasion: 3 },
        messenger: { speed: 3, memory: 3, discretion: 3 },
        saboteur: { technical: 3, stealth: 3, explosives: 3 }
      };

      await base44.entities.Thrall.update(thrallId, {
        role: role,
        skills: roleSkills[role] || {}
      });

      queryClient.invalidateQueries();
      setShowRoles(false);
    } catch (e) {
      console.error('Failed to assign role:', e);
    }
  };

  const handleCreateThrall = async (npc) => {
    setCreating(true);

    setTimeout(async () => {
      try {
        await base44.entities.Thrall.create({
          name: npc.name,
          vampire_id: vampireState.id,
          gender: 'custom',
          control_level: 100,
          loyalty: 50,
          rebellion: 0,
          previous_occupation: npc.occupation,
          assigned_mission: 'none',
          useful_connections: [npc.location]
        });

        await base44.entities.NPC.delete(npc.id);

        await base44.entities.NightLog.create({
          entry: `You broke ${npc.name}'s mind completely. Free will erased. Thrall created. Perfect obedience.`,
          category: 'power',
          intensity: 'significant'
        });

        queryClient.invalidateQueries();
      } catch (e) {
        console.error('Failed to create thrall:', e);
      }

      setCreating(false);
      setOutcome('');
    }, 2000);
  };

  const handleAssignMission = async (mission) => {
    setAssigning(true);

    const missionAtmosphere = {
      spy: [
        'They slip into shadows, becoming one with darkness. Eyes and ears in the night.',
        'Their footsteps are silent. They blend into crowds. Nothing escapes their notice.',
        'The city becomes their hunting ground. They watch. They listen. They report back.',
        'They move through the streets unseen, invisible threads in your spider web.'
      ],
      infiltrate: [
        'They walk through locked doors. Your control is their key. They go where you send them.',
        'Deepcover begins. They become someone new. A ghost in the machine.',
        'They disappear into enemy territory. Days pass. You wait for reports.',
        'They are your agent in the darkness. Embedded. Waiting for your command.'
      ],
      guard: [
        'They take position. Vigilant. Unwavering. Nothing gets past them.',
        'The location is now under watch. Your thrall stands sentinel, unblinking.',
        'They settle into place, ready to strike at anything that threatens you.',
        'A silent guardian. Obedient. Lethal if needed. Perfect protection.'
      ],
      messenger: [
        'They leave immediately, your words burning in their controlled mind.',
        'The message is theirs to carry. They will not fail you.',
        'They disappear into the night to deliver your words to waiting ears.',
        'Off they go, your puppet on invisible strings, delivering your will.'
      ],
      assassinate: [
        'They grip the weapon you gave them. The target is marked. They will not stop.',
        'A killer awakes. Your thrall becomes an instrument of death.',
        'They set out into the darkness with one purpose: eliminate the target.',
        'The hunt begins. Your thrall is the predator. The target, the prey.'
      ],
      seduce: [
        'They prepare themselves. Charm activated. They know exactly what to do.',
        'They are your weapon of seduction. Irresistible. Unstoppable.',
        'Off into the night to wrap someone around your finger through them.',
        'Your thrall becomes desire incarnate. The target will not resist.'
      ],
      sabotage: [
        'Chaos is their tool. They know exactly where to strike.',
        'They move through the target location, planting seeds of destruction.',
        'The operation crumbles under their careful sabotage. Perfect execution.',
        'They dismantle plans with surgical precision. Nothing left but ruins.'
      ]
    };

    const missionSuccess = {
      spy: [
        '${name} returns with valuable intelligence. Enemy positions. Secret dealings. All revealed to you.',
        'Intelligence confirmed. ${name} saw everything. Heard everything. Perfect surveillance.',
        '${name}\'s report comes back. The information is gold. You know their every move.'
      ],
      infiltrate: [
        '${name} has embedded themselves. They are one of them now. Your spy in their ranks.',
        'Deep cover successful. ${name} sends back reports from inside. You are invisible to them.',
        '${name} is now one of them. Your influence spreads like poison through their organization.'
      ],
      guard: [
        'Nothing approaches undetected. ${name} reports all clear. Your location is safe.',
        '${name} stood watch through the night. Nothing threatens you. Your property is secure.',
        'Perfect vigil maintained. Your location is impregnable. ${name} is an excellent guardian.'
      ],
      messenger: [
        'The message was delivered perfectly. ${name} returns, mission complete.',
        '${name} carried your words to their destination. The recipient now understands.',
        'Your will has been communicated. ${name} has served their purpose admirably.'
      ],
      assassinate: [
        'The target is dead. ${name} returns from the darkness, their work complete. Blood on their hands. Your will executed.',
        '${name} succeeded. The target breathes no more. One less problem in your world.',
        'Mission accomplished. The target is eliminated. ${name} has proven their worth as a killer.'
      ],
      seduce: [
        'The target is wrapped around ${name}\'s finger. Perfectly compromised. Information flows freely.',
        '${name} has them entranced. The target reveals secrets willingly. Control achieved.',
        'Complete seduction. The target is yours now, through ${name}. They will do anything you ask.'
      ],
      sabotage: [
        'The operation is in chaos. ${name}\'s sabotage was flawless. Perfectly orchestrated destruction.',
        'Everything falls apart. ${name} executed the plan perfectly. Their rivals are now helpless.',
        'Beautiful destruction. ${name}\'s sabotage cripples the operation. They never saw it coming.'
      ]
    };

    const missionFailure = {
      spy: [
        '${name} was spotted. The mark was alert. They escaped before getting the information you needed.',
        'The surveillance failed. ${name} could not get close enough. The target moved before they could observe.',
        '${name} was careless. The security was tighter than expected. They escaped with nothing.'
      ],
      infiltrate: [
        '${name} was discovered. Barely escaped with their life. The deep cover is blown.',
        'Security detected the infiltration. ${name} had to flee. The operation is compromised.',
        '${name}\'s cover was thin. They were exposed too quickly. Retreat was necessary.'
      ],
      guard: [
        'Intruders got past ${name}. Your security was breached. Your thrall failed to stop them.',
        '${name} was overwhelmed. Too many enemies. Your location was infiltrated on their watch.',
        'The guard duty failed. ${name} could not stop what came. Your sanctuary was violated.'
      ],
      messenger: [
        '${name} lost the message. A fight broke out. The delivery never happened.',
        'The recipient was not found. ${name} searched but could not locate them. The message went undelivered.',
        'Ambushed en route. ${name} barely escaped. The message was lost in the chaos.'
      ],
      assassinate: [
        'The target escaped. ${name}\'s attack failed. Your enemy lives to see another night.',
        '${name} could not land the killing blow. The target was faster. Stronger. More prepared.',
        'The assassination attempt failed. ${name} had to retreat. The target remains alive.'
      ],
      seduce: [
        'The target rejected ${name}. They saw through the seduction. The compromise failed.',
        '${name}\'s charms did not work. The target was unaffected. No secrets were gained.',
        'The seduction attempt backfired. The target became suspicious. The opportunity is lost.'
      ],
      sabotage: [
        '${name} was caught mid-sabotage. They escaped but the plan is exposed.',
        'Security stopped the sabotage before it could spread. ${name} retreated with minimal damage done.',
        'The target anticipated the sabotage. ${name}\'s work was for nothing. The operation continues.'
      ]
    };

    setTimeout(async () => {
      const loyalty = selectedThrall.loyalty || 50;
      const successBase = mission.risk === 'high' ? 0.4 : mission.risk === 'medium' ? 0.2 : 0.1;
      const loyaltyBonus = loyalty / 100;
      const success = Math.random() > (successBase - loyaltyBonus);

      try {
        const atmosphereText = missionAtmosphere[mission.id]?.[Math.floor(Math.random() * 4)] || 'Mission assigned.';
        const missionName = mission.label.toLowerCase();
        const atmosphereProcessed = atmosphereText.replace('${name}', selectedThrall.name);

        if (success) {
          const newXP = (selectedThrall.experience || 0) + 30;
          const newLevel = Math.floor(newXP / 100) + 1;
          const successText = missionSuccess[mission.id]?.[Math.floor(Math.random() * 3)] || 'Mission complete.';
          const successProcessed = successText.replace('${name}', selectedThrall.name);
          
          await base44.entities.Thrall.update(selectedThrall.id, {
            assigned_mission: mission.id,
            mission_progress: 100,
            times_used: (selectedThrall.times_used || 0) + 1,
            mission_successes: (selectedThrall.mission_successes || 0) + 1,
            experience: newXP,
            level: newLevel,
            control_level: Math.max((selectedThrall.control_level || 100) - 5, 0),
            loyalty: Math.min((selectedThrall.loyalty || 50) + 5, 100)
          });

          setOutcome(`${atmosphereProcessed}\n\n✓ ${successProcessed}\n\n+5 loyalty, +30 XP`);
        } else {
          const failureText = missionFailure[mission.id]?.[Math.floor(Math.random() * 3)] || 'Mission failed.';
          const failureProcessed = failureText.replace('${name}', selectedThrall.name);
          const betrayalIncrease = Math.random() * 20;
          
          await base44.entities.Thrall.update(selectedThrall.id, {
            breaking_point: Math.min((selectedThrall.breaking_point || 0) + 30, 100),
            control_level: Math.max((selectedThrall.control_level || 100) - 15, 0),
            mission_failures: (selectedThrall.mission_failures || 0) + 1,
            rebellion: Math.min((selectedThrall.rebellion || 0) + 10, 100),
            betrayal_risk: Math.min((selectedThrall.betrayal_risk || 0) + betrayalIncrease, 100)
          });

          setOutcome(`${atmosphereProcessed}\n\n✗ ${failureProcessed}\n\nControl weakening. Betrayal risk rising.`);
        }

        await base44.entities.NightLog.create({
          entry: `Thrall ${selectedThrall.name}: ${mission.label}. ${success ? 'Success' : 'Failed'}`,
          category: 'power',
          intensity: 'moderate'
        });

        queryClient.invalidateQueries();
      } catch (e) {
        console.error('Mission assignment failed:', e);
      }

      setTimeout(() => {
        setAssigning(false);
        setOutcome('');
        setSelectedThrall(null);
      }, 3000);
    }, 2000);
  };

  const handleThrallAction = async (action) => {
    setAssigning(true);

    setTimeout(async () => {
      try {
        if (action.id === 'reinforce') {
          await base44.entities.Thrall.update(selectedThrall.id, {
            control_level: 100,
            breaking_point: 0
          });
          setOutcome(`You shattered ${selectedThrall.name}'s mind again. Control fully restored. They're empty.`);
        } else if (action.id === 'extract') {
          const info = ['They know about the hunter network', 'They revealed council secrets', 'They exposed rival vampire locations', 'They gave you blackmail material'][Math.floor(Math.random() * 4)];
          setOutcome(`${selectedThrall.name} told you everything. ${info}. Information extracted.`);
        } else if (action.id === 'use') {
          const outcomes = [
            `${selectedThrall.name} served without resistance. Empty eyes. No thoughts. Just obedience. You used them completely.`,
            `You took what you wanted from ${selectedThrall.name}. They couldn't refuse. Didn't even try. Perfect submission.`,
            `${selectedThrall.name}'s body obeyed every command. Mind too broken to resist. They exist only to serve your desires.`,
            `You claimed ${selectedThrall.name} entirely. They performed without hesitation. No will left to deny you anything.`
          ];
          setOutcome(outcomes[Math.floor(Math.random() * outcomes.length)]);
          await base44.entities.Thrall.update(selectedThrall.id, {
            control_level: Math.max((selectedThrall.control_level || 100) - 3, 0),
            times_used: (selectedThrall.times_used || 0) + 1
          });
        } else if (action.id === 'feed') {
          const feedOutcomes = [
            `You drained ${selectedThrall.name}'s blood. They stood perfectly still, offering their neck without hesitation. Hunger sated.`,
            `${selectedThrall.name} bled for you willingly. No fear. No resistance. Just acceptance. The perfect feeding source.`,
            `You fed deeply on ${selectedThrall.name}. They never flinched, never pulled away. Complete submission to your hunger.`
          ];
          const selectedOutcome = feedOutcomes[Math.floor(Math.random() * feedOutcomes.length)];
          setOutcome(selectedOutcome);
          await base44.entities.Thrall.update(selectedThrall.id, {
            control_level: Math.max((selectedThrall.control_level || 100) - 2, 0)
          });
          if (vampireState?.id) {
            await base44.entities.VampireState.update(vampireState.id, {
              hunger_state: 'sated',
              last_feed: new Date().toISOString()
            });
          }
        } else if (action.id === 'gift') {
          const recipients = ['rival vampire as peace offering', 'ally as a favor', 'council member for influence', 'business partner for leverage'];
          const recipient = recipients[Math.floor(Math.random() * recipients.length)];
          await base44.entities.Thrall.delete(selectedThrall.id);
          setOutcome(`You sent ${selectedThrall.name} to ${recipient}. They'll serve their new master. Political favor gained.`);
        } else if (action.id === 'memories') {
          const memoryTypes = [
            'You implanted memories of unwavering devotion. They now believe they chose this willingly.',
            'False memories embedded. They remember loving you since childhood. Complete psychological rewrite.',
            'You rewrote their past. They believe their old life was empty. Only servitude brings meaning now.',
            'Memories altered. They think they begged you to take them. Their resistance never existed.'
          ];
          setOutcome(memoryTypes[Math.floor(Math.random() * memoryTypes.length)]);
          await base44.entities.Thrall.update(selectedThrall.id, {
            control_level: 100,
            loyalty_decay: 0
          });
        } else if (action.id === 'condition') {
          const conditionOutcomes = [
            `You conditioned ${selectedThrall.name} to feel pleasure from obedience. They crave your commands now. Loyalty increased.`,
            `Pavlovian conditioning successful. ${selectedThrall.name} now experiences euphoria when serving you. Perfect devotion.`,
            `You trained ${selectedThrall.name}'s nervous system. Servitude triggers dopamine release. They're addicted to obedience.`,
            `Conditioning complete. ${selectedThrall.name} feels physical pleasure from submission. They'll never want freedom again.`
          ];
          setOutcome(conditionOutcomes[Math.floor(Math.random() * conditionOutcomes.length)]);
          await base44.entities.Thrall.update(selectedThrall.id, {
            control_level: Math.min((selectedThrall.control_level || 100) + 10, 100),
            loyalty_decay: Math.max((selectedThrall.loyalty_decay || 0) - 20, 0)
          });
        } else if (action.id === 'bait') {
          await base44.entities.Thrall.delete(selectedThrall.id);
          setOutcome(`You used ${selectedThrall.name} as bait. They died. But you got what you needed.`);
        } else if (action.id === 'dispose') {
          await base44.entities.Thrall.delete(selectedThrall.id);
          setOutcome(`${selectedThrall.name} is dead. Disposed of. Too broken to be useful anymore.`);
        }

        await base44.entities.NightLog.create({
          entry: outcome || `Thrall action: ${action.label}`,
          category: 'power',
          intensity: action.id === 'bait' || action.id === 'dispose' ? 'significant' : 'moderate'
        });

        queryClient.invalidateQueries();
      } catch (e) {
        console.error('Thrall action failed:', e);
      }

      setTimeout(() => {
        setAssigning(false);
        setOutcome('');
        setSelectedThrall(null);
      }, 3000);
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
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">🧠 Thrall System</h2>
        <p className="text-gray-400 text-sm mb-6">
          Break their minds. Strip free will. Create perfectly obedient servants for tactical missions.
        </p>

        {creating || assigning ? (
          <div className="text-center py-12">
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-gray-400"
            >
              {creating ? 'Breaking their mind...' : 'Sending on mission...'}
            </motion.p>
          </div>
        ) : outcome ? (
          <div className="text-center py-12">
            <p className="text-gray-300">{outcome}</p>
          </div>
        ) : !selectedThrall ? (
          <>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setShowArmy(true)}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                👥 Manage Army
              </button>
              <button
                onClick={() => setShowRoles(true)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                🎭 Assign Roles
              </button>
            </div>

            <h3 className="text-white font-medium mb-3">Your Thralls ({thralls.length})</h3>
            {thralls.length > 0 && (
              <div className="space-y-3 mb-6">
                {thralls.map(thrall => (
                  <button
                    key={thrall.id}
                    onClick={() => setSelectedThrall(thrall)}
                    className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h4 className="text-white font-medium">{thrall.name}</h4>
                        <p className="text-gray-400 text-sm">Was: {thrall.previous_occupation}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        thrall.role === 'none' ? 'bg-gray-700 text-gray-400' : 'bg-purple-600 text-white'
                      }`}>
                        {thrall.role === 'none' ? 'Unassigned' : thrall.role}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">Level</p>
                        <p className="text-white font-bold">{thrall.level || 1}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Loyalty</p>
                        <p className={thrall.loyalty > 70 ? 'text-green-400' : 'text-yellow-400'}>{thrall.loyalty || 50}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Betrayal Risk</p>
                        <p className={thrall.betrayal_risk > 60 ? 'text-red-400 font-bold' : 'text-gray-400'}>{Math.round(thrall.betrayal_risk || 0)}%</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <h3 className="text-white font-medium mb-3">Create New Thrall</h3>
            {npcs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No NPCs available to enthrall</p>
            ) : (
              <div className="space-y-2">
                {npcs.slice(0, 3).map(npc => (
                  <button
                    key={npc.id}
                    onClick={() => handleCreateThrall(npc)}
                    className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-3 text-left transition-colors"
                  >
                    <h4 className="text-white text-sm">{npc.name}</h4>
                    <p className="text-gray-400 text-xs">{npc.occupation} at {npc.location}</p>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => setSelectedThrall(null)}
              className="text-purple-400 hover:text-purple-300 text-sm mb-3"
            >
              ← Back
            </button>

            <h3 className="text-white font-medium mb-3">Control {selectedThrall.name}</h3>

            <div className="bg-gray-800 rounded-xl p-3 mb-4">
              <p className="text-gray-400 text-xs mb-1">Status</p>
              <p className="text-white text-sm">
                Control: {selectedThrall.control_level || 0}% • Breaking Point: {selectedThrall.breaking_point || 0}%
              </p>
            </div>

            <button
              onClick={() => setShowLoyalty(true)}
              className="w-full bg-red-900/60 hover:bg-red-900/80 rounded-xl p-3 mb-3 text-left transition-colors border border-red-500/30"
            >
              <div className="text-white font-medium mb-1">Manage Loyalty</div>
              <p className="text-red-300 text-xs">Loyalty: {selectedThrall.loyalty || 50}% | Betrayal Risk: {Math.round(selectedThrall.betrayal_risk || 0)}%</p>
            </button>

            <h4 className="text-white text-sm font-medium mb-2">Actions</h4>
            {THRALL_ACTIONS.map(action => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleThrallAction(action)}
                  className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-3 text-left transition-colors mb-2"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <div className="flex-1">
                      <h4 className="text-white text-sm font-medium">{action.label}</h4>
                      <p className="text-gray-400 text-xs">{action.desc}</p>
                    </div>
                  </div>
                </button>
              );
            })}

            <h4 className="text-white text-sm font-medium mt-4 mb-2">Missions</h4>
            {MISSIONS.map(mission => {
              const Icon = mission.icon;
              return (
                <button
                  key={mission.id}
                  onClick={() => handleAssignMission(mission)}
                  className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors mb-2"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-purple-400" />
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{mission.label}</h4>
                      <p className="text-gray-400 text-xs">
                        Duration: {mission.duration}d • Risk: {mission.risk}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Role Assignment Modal */}
        {showRoles && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setShowRoles(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-purple-500/30"
            >
              <h3 className="text-white font-bold mb-4">Assign Roles to Thralls</h3>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {thralls.map(thrall => (
                  <div key={thrall.id} className="bg-gray-800 rounded-lg p-3">
                    <p className="text-white font-medium mb-2">{thrall.name}</p>
                    <div className="grid grid-cols-2 gap-1">
                      {['spy', 'assassin', 'guard', 'seducer', 'messenger', 'saboteur'].map(role => (
                        <button
                          key={role}
                          onClick={() => handleAssignRole(thrall.id, role)}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            thrall.role === role
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowRoles(false)}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg mt-4 text-sm"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Loyalty Management */}
        {showLoyalty && selectedThrall && (
          <ThrallLoyalty
            thrall={selectedThrall}
            vampireState={vampireState}
            onClose={() => setShowLoyalty(false)}
          />
        )}

        {/* Army Management */}
        {showArmy && (
          <ThrallArmy
            vampireState={vampireState}
            onClose={() => setShowArmy(false)}
          />
        )}
      </motion.div>
    </motion.div>
  );
}