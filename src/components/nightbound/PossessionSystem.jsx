import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Eye, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const POSSESSION_ACTIONS = [
  { id: 'live', label: 'Live their life', duration: 4000, humanityLoss: 5, desc: 'Experience being them' },
  { id: 'sabotage', label: 'Sabotage their relationships', duration: 3500, humanityLoss: 10, desc: 'Ruin their life' },
  { id: 'gather', label: 'Gather information', duration: 3000, humanityLoss: 3, desc: 'Learn secrets' },
  { id: 'seduce', label: 'Seduce someone as them', duration: 4000, humanityLoss: 8, desc: 'Use their body' },
  { id: 'kill', label: 'Kill as them', duration: 5000, humanityLoss: 25, desc: 'Frame them for murder' }
];

export default function PossessionSystem({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [possessing, setPossessing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [isPossessed, setIsPossessed] = useState(false);

  const { data: humans = [] } = useQuery({
    queryKey: ['humans'],
    queryFn: () => base44.entities.Human.list()
  });

  const { data: npcs = [] } = useQuery({
    queryKey: ['npcs'],
    queryFn: () => base44.entities.NPC.list()
  });

  const { data: servants = [] } = useQuery({
    queryKey: ['servants'],
    queryFn: () => base44.entities.Servant.list()
  });

  const allTargets = [
    ...humans.map(h => ({ ...h, type: 'human' })),
    ...npcs.map(n => ({ ...n, type: 'npc' })),
    ...servants.filter(s => !s.is_turned).map(s => ({ ...s, type: 'servant' }))
  ];

  const handlePossess = async (target) => {
    setPossessing(true);
    
    setTimeout(async () => {
      const possessionOutcomes = [
        `You reach into ${target.name}'s mind. Their consciousness fights back. Screaming. Terrified.\n\nYou push harder.\n\nTheir resistance crumbles. You're in.\n\nYou open their eyes. Their body. Your puppet.`,
        `${target.name} never saw you coming. One moment they were themselves.\n\nThe next: darkness.\n\nYou slipped into their body like wearing new clothes. Perfect fit.\n\nThey're still in there. Trapped. Watching you control them.`,
        `The possession is violent. ${target.name}'s soul screams as you force them down. Down. Down.\n\nYou take the reins.\n\nEverything they are - memories, feelings, relationships - yours to use.\n\nThey're a prisoner in their own body.`
      ];

      setOutcome(possessionOutcomes[Math.floor(Math.random() * possessionOutcomes.length)]);
      setIsPossessed(true);
      setSelectedTarget(target);

      await base44.entities.NightLog.create({
        entry: `You possessed ${target.name}. Their body is yours now. They're trapped inside, helpless.`,
        category: 'power',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();
      
      setTimeout(() => {
        setPossessing(false);
        setOutcome('');
      }, 4000);
    }, 3000);
  };

  const handleAction = async (action) => {
    if (!selectedTarget) return;
    setPossessing(true);

    setTimeout(async () => {
      let result = '';
      const name = selectedTarget.name;

      if (action.id === 'live') {
        const liveOutcomes = [
          `You lived as ${name} for a day. Their friends. Their family. Their life.\n\nThey were screaming inside. Watching you pretend to be them.\n\nNo one noticed. No one knew.`,
          `You went to ${name}'s work. Did their job. Talked to their coworkers.\n\nPerfect imitation. You knew everything about them from their memories.\n\n${name} begged you to stop. You kept going.`,
          `You kissed ${name}'s lover as them. Felt everything they felt.\n\nTheir body betrayed them. Responded to touches they didn't want.\n\nThe violation was complete.`
        ];
        result = liveOutcomes[Math.floor(Math.random() * liveOutcomes.length)];
      } else if (action.id === 'sabotage') {
        const sabotageOutcomes = [
          `You told ${name}'s best friend to fuck off. Screamed at them. Said horrible things.\n\n${name} was crying inside. Begging you to stop.\n\nYou didn't. The friendship is over.`,
          `You cheated on ${name}'s partner. In their body. With their consent trapped inside.\n\nThey had to watch. Had to feel everything.\n\nTheir relationship is destroyed.`,
          `You got ${name} fired. Made a scene at work. Threatened people.\n\n${name} watched their career burn. Powerless to stop you.\n\nTheir life is ruined.`
        ];
        result = sabotageOutcomes[Math.floor(Math.random() * sabotageOutcomes.length)];
      } else if (action.id === 'gather') {
        const gatherOutcomes = [
          `You accessed all of ${name}'s memories. Their secrets. Their fears. Their desires.\n\nEverything they've ever hidden. Yours now.\n\nKnowledge is power. You'll use this.`,
          `You went through ${name}'s phone. Read their messages. Their photos. Their life.\n\nFound things they never wanted anyone to see.\n\n${name} begged you not to. You saved copies.`,
          `You learned who ${name} loves. Who they hate. What they fear most.\n\nTheir vulnerabilities exposed. Catalogued. Weaponized.\n\nThey'll never be safe from you.`
        ];
        result = gatherOutcomes[Math.floor(Math.random() * gatherOutcomes.length)];
      } else if (action.id === 'seduce') {
        const seduceOutcomes = [
          `You used ${name}'s body to seduce someone they'd never touch.\n\nThey felt everything. The touches. The kisses. The surrender.\n\nTheir body wasn't theirs. You made sure they knew it.`,
          `You took ${name} to someone's bed. Did things they'd never do.\n\nThey screamed silently. Begging you to stop.\n\nYou didn't. Made them enjoy it physically. Made them hate themselves.`,
          `You seduced someone ${name} loved. Made them cheat using their own body.\n\nThe guilt will haunt them forever.\n\nEven though it was you. They'll never forgive themselves.`
        ];
        result = seduceOutcomes[Math.floor(Math.random() * seduceOutcomes.length)];
      } else if (action.id === 'kill') {
        const killOutcomes = [
          `You used ${name}'s hands to kill. Their fingerprints on the weapon.\n\nThey felt the life drain away. Witnessed the murder from inside.\n\nWhen you left their body, the police found them covered in blood. Evidence everywhere.`,
          `You made ${name} kill someone they loved. Their hands. Their strength.\n\nThey begged. Cried. Fought you from inside.\n\nDidn't matter. You killed them anyway. ${name} will be blamed.`,
          `Murder in ${name}'s body. Perfect crime for you.\n\nTheir DNA at the scene. Witnesses saw "them" do it.\n\nYou left. ${name} woke up next to a corpse. No memory. All evidence.`
        ];
        result = killOutcomes[Math.floor(Math.random() * killOutcomes.length)];
      }

      await base44.entities.VampireState.update(vampireState.id, {
        humanity: Math.max(0, vampireState.humanity - action.humanityLoss),
        exposure_level: Math.min(100, (vampireState.exposure_level || 0) + (action.id === 'kill' ? 20 : 5))
      });

      await base44.entities.NightLog.create({
        entry: `While possessing ${name}: ${result}`,
        category: 'power',
        intensity: 'significant'
      });

      setOutcome(result);
      queryClient.invalidateQueries();

      setTimeout(() => {
        setPossessing(false);
        setOutcome('');
        setIsPossessed(false);
        setSelectedTarget(null);
      }, 5000);
    }, action.duration);
  };

  const handleRelease = async () => {
    setPossessing(true);

    setTimeout(async () => {
      setOutcome(`You released ${selectedTarget.name}.\n\nThey gasped. Fell to their knees.\n\nThe memory of being trapped. Being used. Being violated.\n\nThey'll never forget. Never recover.\n\nYou left them broken.`);

      await base44.entities.NightLog.create({
        entry: `You released ${selectedTarget.name} from possession. They're traumatized. Changed forever.`,
        category: 'power',
        intensity: 'moderate'
      });

      setTimeout(() => {
        setPossessing(false);
        setOutcome('');
        setIsPossessed(false);
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
      onClick={() => !possessing && !isPossessed && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {!possessing && !isPossessed && (
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}

        <h2 className="text-2xl font-bold text-white mb-2">👁️ Possession</h2>
        <p className="text-gray-400 text-sm mb-6">Take over another's body. Trap their consciousness inside.</p>

        {!selectedTarget && !outcome && (
          <>
            {allTargets.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No one available to possess.</p>
            ) : (
              <div className="space-y-3">
                {allTargets.map(target => (
                  <button
                    key={`${target.type}-${target.id}`}
                    onClick={() => handlePossess(target)}
                    className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-bold">{target.name}</h3>
                        <p className="text-gray-400 text-sm capitalize">
                          {target.type} • {target.gender || 'unknown'}
                        </p>
                      </div>
                      <User className="w-5 h-5 text-purple-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {isPossessed && !outcome && (
          <div>
            <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4 mb-6">
              <p className="text-purple-300 font-medium mb-2">Currently possessing: {selectedTarget.name}</p>
              <p className="text-gray-400 text-sm">
                Their consciousness is trapped. Screaming silently. Watching everything you do.
              </p>
            </div>

            <h3 className="text-white font-medium mb-3">What will you do in their body?</h3>
            <div className="space-y-2 mb-6">
              {POSSESSION_ACTIONS.map(action => (
                <button
                  key={action.id}
                  onClick={() => handleAction(action)}
                  className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-3 text-left transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-white font-medium block">{action.label}</span>
                      <p className="text-gray-500 text-xs">{action.desc}</p>
                    </div>
                    <span className="text-xs text-red-400">-{action.humanityLoss} humanity</span>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleRelease}
              className="w-full bg-green-900/40 hover:bg-green-900/60 border border-green-500/30 rounded-lg py-3 text-green-300"
            >
              Release them
            </button>
          </div>
        )}

        {possessing && !outcome && (
          <div className="py-16 text-center">
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <p className="text-gray-400">{isPossessed ? 'Acting...' : 'Possessing...'}</p>
            </motion.div>
          </div>
        )}

        {outcome && (
          <div className="py-8">
            <p className="text-gray-300 text-center leading-relaxed whitespace-pre-line">{outcome}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}