import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function WitchServantInteraction({ servant, witch, onClose }) {
  const queryClient = useQueryClient();
  const [interacting, setInteracting] = useState(false);
  const [outcome, setOutcome] = useState('');

  const handleInteraction = async (action) => {
    setInteracting(true);

    const messages = {
      chat: [
        `You talk with ${servant.name}. They're adjusting to the supernatural world.`,
        `"It's overwhelming," ${servant.name} admits. You understand.`,
        `Deep conversation. ${servant.name} appreciates having someone to talk to.`
      ],
      comfort: [
        `You comfort ${servant.name}. Being bound to a vampire is hard.`,
        `${servant.name} opens up to you. You listen without judgment.`,
        `Your magic soothes them. ${servant.name} feels safer around you.`
      ],
      teach: [
        `You teach ${servant.name} basic protection spells. Just in case.`,
        `${servant.name} learns quickly. "This could save your life," you say.`,
        `Magic lessons. ${servant.name} is grateful for your guidance.`
      ],
      flirt: [
        `You flirt with ${servant.name}. They blush. Complicated feelings.`,
        `The attraction is there. Witch and vampire's human. Interesting.`,
        `${servant.name} flirts back. This could get complicated.`
      ],
      gift: [
        `You give ${servant.name} a protective charm. They smile.`,
        `Your gift means a lot. ${servant.name} feels protected.`,
        `You enchanted a necklace for them. "Wear this. Always."`
      ],
      help: [
        `You help ${servant.name} with their tasks. Working together feels natural.`,
        `${servant.name} appreciates the help. You enjoy their company.`,
        `Helping around the house. ${servant.name} is grateful.`
      ]
    };

    setTimeout(async () => {
      let relChange = 0;
      let newOutcome = '';

      if (action === 'chat') {
        relChange = 10;
        newOutcome = messages.chat[Math.floor(Math.random() * messages.chat.length)];
      } else if (action === 'comfort') {
        relChange = 15;
        newOutcome = messages.comfort[Math.floor(Math.random() * messages.comfort.length)];
      } else if (action === 'teach') {
        if (witch.relationship < 30) {
          newOutcome = `${servant.name} isn't ready to learn magic yet. Build trust first.`;
        } else {
          relChange = 20;
          newOutcome = messages.teach[Math.floor(Math.random() * messages.teach.length)];
        }
      } else if (action === 'flirt') {
        if (witch.relationship < 20) {
          relChange = -5;
          newOutcome = `${servant.name} seems uncomfortable. Too soon.`;
        } else {
          relChange = 12;
          newOutcome = messages.flirt[Math.floor(Math.random() * messages.flirt.length)];
        }
      } else if (action === 'gift') {
        relChange = 15;
        newOutcome = messages.gift[Math.floor(Math.random() * messages.gift.length)];
      } else if (action === 'help') {
        relChange = 10;
        newOutcome = messages.help[Math.floor(Math.random() * messages.help.length)];
      }

      await base44.entities.Witch.update(witch.id, {
        relationship: Math.max(-100, Math.min(100, witch.relationship + relChange)),
        last_encounter: new Date().toISOString()
      });

      const servantRelBonus = Math.floor(Math.random() * 5) + 3;
      await base44.entities.Servant.update(servant.id, {
        relationship: Math.min(100, (servant.relationship || 0) + servantRelBonus)
      });

      await base44.entities.NightLog.create({
        entry: `${witch.name} visited ${servant.name}. ${newOutcome}`,
        category: 'interaction',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();
      setOutcome(newOutcome);

      setTimeout(() => {
        setInteracting(false);
        setOutcome('');
        onClose();
      }, 3000);
    }, 1500);
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
        className="bg-gray-900 rounded-2xl p-6 max-w-md w-full relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-8 h-8 text-purple-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Talk to {servant.name}</h2>
            <p className="text-gray-400 text-sm">As {witch.name}</p>
          </div>
        </div>

        {!interacting && !outcome && (
          <div className="space-y-3">
            <button
              onClick={() => handleInteraction('chat')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
            >
              💬 Chat
            </button>
            <button
              onClick={() => handleInteraction('comfort')}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl"
            >
              💚 Comfort Them
            </button>
            <button
              onClick={() => handleInteraction('help')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl"
            >
              🤝 Help Out
            </button>
            {witch.relationship >= 20 && (
              <button
                onClick={() => handleInteraction('flirt')}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-xl"
              >
                💖 Flirt
              </button>
            )}
            {witch.relationship >= 30 && (
              <button
                onClick={() => handleInteraction('teach')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl"
              >
                ✨ Teach Protection Magic
              </button>
            )}
            <button
              onClick={() => handleInteraction('gift')}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-xl"
            >
              🎁 Give Charm
            </button>
          </div>
        )}

        {(interacting || outcome) && (
          <div className="text-center py-12">
            {interacting && (
              <>
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="text-6xl mb-4"
                >
                  ✨
                </motion.div>
                <p className="text-gray-400">Interacting...</p>
              </>
            )}
            {outcome && (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
              >
                <p className="text-white text-lg">{outcome}</p>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}