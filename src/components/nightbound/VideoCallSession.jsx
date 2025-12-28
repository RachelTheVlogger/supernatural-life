import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Eye } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function VideoCallSession({ servant, vampireState, onClose, onGainRelationship }) {
  const queryClient = useQueryClient();
  const [stage, setStage] = useState('start'); // start, watching, end
  const [outcome, setOutcome] = useState('');

  const startCall = () => {
    const intros = [
      `📹 Video call connected.\n\n${servant.name} appears on screen. Nervous. Excited.\n\n"Hi..." they say softly.\n\nYou can see everything.`,
      `Call started.\n\n${servant.name} is in their bedroom. Camera angled perfectly.\n\n"I've been waiting for you to call..."\n\nThey bite their lip.`,
      `Video call.\n\n${servant.name} answers. Already undressed.\n\n"Couldn't wait," they admit.\n\nYou smile. Good.`
    ];
    setOutcome(intros[Math.floor(Math.random() * intros.length)]);
    setStage('watching');
  };

  const watchActions = [
    { 
      id: 'strip', 
      label: '👙 Make them strip',
      outcome: `"Take it off. Slowly."\n\nThey obey. Piece by piece.\n\nShirt. Pants. Underwear.\n\nNaked on camera now. All yours to see.`,
      gain: 15
    },
    {
      id: 'pose',
      label: '📸 Tell them to pose',
      outcome: `"Turn around. Show me everything."\n\nThey spin slowly. Showing every angle.\n\n"Beautiful," you say.\n\nThey blush. Pleased.`,
      gain: 12
    },
    {
      id: 'touch',
      label: '✋ Direct their touches',
      outcome: `"Touch yourself. Where I tell you."\n\nYou guide every movement.\n\n"There. Slower. Good."\n\nThey obey perfectly.`,
      gain: 20
    },
    {
      id: 'masturbate',
      label: '💦 Watch them masturbate',
      outcome: `"Show me. Touch yourself for me."\n\nThey spread their legs. Camera focused.\n\nYou watch them pleasure themselves.\n\nMoaning your name.`,
      gain: 25
    },
    {
      id: 'toy',
      label: '🎀 Make them use toys',
      outcome: `"Get your toy."\n\nThey grab it. Hold it up.\n\n"Use it. I want to watch."\n\nThey push it in. Moaning.`,
      gain: 30
    },
    {
      id: 'edge',
      label: '⚡ Edge them',
      outcome: `"Get close. Don't cum yet."\n\nThey touch faster. Building.\n\n"Stop."\n\nThey whimper. Denied.\n\nYou're in control.`,
      gain: 28
    },
    {
      id: 'cum',
      label: '✨ Let them cum',
      outcome: `"Cum for me. Now."\n\nThey don't hold back.\n\nMasturbating hard. Moaning.\n\nYou watch them finish.\n\nPerfect.`,
      gain: 35
    }
  ];

  const handleAction = async (action) => {
    setOutcome(action.outcome);
    
    await base44.entities.Servant.update(servant.id, {
      relationship: Math.min((servant.relationship || 0) + action.gain, 100)
    });
    
    await base44.entities.NightLog.create({
      entry: `Video call with ${servant.name}: ${action.outcome.split('\n')[0]}`,
      category: 'interaction',
      intensity: 'significant'
    });
    
    queryClient.invalidateQueries();
    onGainRelationship?.(action.gain);

    setTimeout(() => {
      setStage('end');
    }, 4000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95"
      onClick={stage === 'end' ? onClose : undefined}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-md w-full"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white font-bold">📹 Video Call</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {outcome && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4 mb-4"
          >
            <p className="text-gray-200 whitespace-pre-line">{outcome}</p>
          </motion.div>
        )}

        {stage === 'start' && (
          <button
            onClick={startCall}
            className="bitlife-btn w-full py-3 rounded-xl"
          >
            Start Call
          </button>
        )}

        {stage === 'watching' && (
          <div className="space-y-2">
            <p className="text-gray-400 text-sm text-center mb-3">What do you want them to do?</p>
            {watchActions.map(action => (
              <button
                key={action.id}
                onClick={() => handleAction(action)}
                className="bitlife-btn w-full py-3 rounded-xl text-sm"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        {stage === 'end' && (
          <button
            onClick={onClose}
            className="bitlife-btn w-full py-3 rounded-xl"
          >
            End Call
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}