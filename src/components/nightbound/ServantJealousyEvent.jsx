import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Heart, Flame, MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function ServantJealousyEvent({ servant1, servant2, onClose }) {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');

  if (!servant1 || !servant2) {
    return null;
  }

  const handleResolve = async (choice) => {
    setProcessing(true);

    setTimeout(async () => {
      const outcomes = {
        reassure1: {
          text: `You told ${servant1.name} they\'re special. Irreplaceable. They believed you.`,
          effect: { s1Rel: 10, s1Jealousy: -20, s2Rel: -5 }
        },
        reassure2: {
          text: `You reassured ${servant2.name}. They\'re not being replaced. They calmed.`,
          effect: { s1Rel: -5, s2Rel: 10, s2Jealousy: -20 }
        },
        both: {
          text: 'You told them both they\'re equally important. You have room for everyone. Tension eased.',
          effect: { s1Rel: 5, s2Rel: 5, s1Jealousy: -10, s2Jealousy: -10 }
        },
        ignore: {
          text: 'You ignored the jealousy. They\'ll work it out themselves. Or not. Tension remains.',
          effect: { s1Jealousy: 5, s2Jealousy: 5 }
        },
        threesome: {
          text: 'You brought them both to bed. Together. Problem solved through pleasure. They both submitted.',
          effect: { s1Rel: 20, s2Rel: 20, s1Jealousy: -30, s2Jealousy: -30 }
        }
      };

      const result = outcomes[choice];
      setOutcome(result.text);

      await base44.entities.Servant.update(servant1.id, {
        relationship: Math.min(100, (servant1.relationship || 0) + (result.effect.s1Rel || 0)),
        jealousy_level: Math.max(0, Math.min(100, (servant1.jealousy_level || 0) + (result.effect.s1Jealousy || 0)))
      });

      await base44.entities.Servant.update(servant2.id, {
        relationship: Math.min(100, (servant2.relationship || 0) + (result.effect.s2Rel || 0)),
        jealousy_level: Math.max(0, Math.min(100, (servant2.jealousy_level || 0) + (result.effect.s2Jealousy || 0)))
      });

      await base44.entities.NightLog.create({
        entry: result.text,
        category: 'interaction',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        onClose();
      }, 4000);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-md w-full"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        {outcome ? (
          <div className="text-center py-8">
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
          <>
            <h2 className="text-2xl font-bold text-white mb-3">Jealousy</h2>
            <p className="text-gray-400 mb-6">
              {servant1.name} and {servant2.name} are competing for your attention. Tension is building.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleResolve('reassure1')}
                className="w-full bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-xl p-3 text-left transition-colors"
              >
                <Heart className="w-5 h-5 text-purple-400 mb-1" />
                <h4 className="text-white font-medium text-sm">Reassure {servant1.name}</h4>
              </button>

              <button
                onClick={() => handleResolve('reassure2')}
                className="w-full bg-blue-900/40 hover:bg-blue-900/60 border border-blue-500/30 rounded-xl p-3 text-left transition-colors"
              >
                <Heart className="w-5 h-5 text-blue-400 mb-1" />
                <h4 className="text-white font-medium text-sm">Reassure {servant2.name}</h4>
              </button>

              <button
                onClick={() => handleResolve('both')}
                className="w-full bg-green-900/40 hover:bg-green-900/60 border border-green-500/30 rounded-xl p-3 text-left transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-green-400 mb-1" />
                <h4 className="text-white font-medium text-sm">Reassure both equally</h4>
              </button>

              <button
                onClick={() => handleResolve('threesome')}
                className="w-full bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 rounded-xl p-3 text-left transition-colors"
              >
                <Flame className="w-5 h-5 text-red-400 mb-1" />
                <h4 className="text-white font-medium text-sm">Bring them both to bed</h4>
              </button>

              <button
                onClick={() => handleResolve('ignore')}
                className="w-full bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-xl p-3 text-sm transition-colors"
              >
                Ignore it
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}