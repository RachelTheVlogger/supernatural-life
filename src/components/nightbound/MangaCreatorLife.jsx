import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Battery, User, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tantml:query';

export default function MangaCreatorLife({ career, entityName, onClose }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('burnout');
  const [working, setWorking] = useState(false);
  const [outcome, setOutcome] = useState('');

  const takeBreak = async () => {
    setWorking(true);
    const burnout = Math.max(0, (career.burnout || 0) - 30);
    
    await base44.entities.ServantCareer.update(career.id, { burnout });
    queryClient.invalidateQueries(['career']);

    setOutcome('Break taken! Energy restored.');
    setTimeout(() => { setWorking(false); setOutcome(''); }, 2000);
  };

  const meetEditor = async () => {
    setWorking(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate editor feedback on a manga chapter. Mix helpful advice with demanding requests. Be realistic.`,
        response_json_schema: {
          type: "object",
          properties: {
            feedback: { type: "string" },
            mood: { type: "string" },
            deadline_pressure: { type: "boolean" }
          }
        }
      });

      const editorHistory = career.editor_interactions || [];
      editorHistory.push({
        feedback: result.feedback,
        mood: result.mood,
        date: new Date().toISOString()
      });

      await base44.entities.ServantCareer.update(career.id, {
        editor_interactions: editorHistory
      });

      queryClient.invalidateQueries(['career']);
      setOutcome(result.feedback);
    } catch (error) {
      setOutcome('Editor unavailable');
    }

    setTimeout(() => { setWorking(false); setOutcome(''); }, 4000);
  };

  const workOnDeadline = async () => {
    setWorking(true);
    const onTime = Math.random() > 0.3;
    const burnoutIncrease = Math.floor(Math.random() * 20) + 10;
    
    if (onTime) {
      const bonus = Math.floor(Math.random() * 500) + 300;
      await base44.entities.ServantCareer.update(career.id, {
        fans: (career.fans || 0) + bonus,
        burnout: Math.min(100, (career.burnout || 0) + burnoutIncrease)
      });

      setOutcome(`Met deadline! +${bonus} fans (Burnout +${burnoutIncrease}%)`);
    } else {
      const penalty = Math.floor(Math.random() * 200) + 100;
      await base44.entities.ServantCareer.update(career.id, {
        fans: Math.max(0, (career.fans || 0) - penalty),
        burnout: Math.min(100, (career.burnout || 0) + burnoutIncrease)
      });

      setOutcome(`Missed deadline! -${penalty} fans (Burnout +${burnoutIncrease}%)`);
    }

    queryClient.invalidateQueries(['career']);
    setTimeout(() => { setWorking(false); setOutcome(''); }, 3000);
  };

  const burnoutLevel = career.burnout || 0;
  const getBurnoutColor = () => {
    if (burnoutLevel < 30) return 'text-green-400';
    if (burnoutLevel < 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white text-2xl font-bold">👤 Creator Life</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['burnout', 'editor', 'deadlines'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap ${
                tab === t ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {t === 'burnout' && <Battery className="w-4 h-4 inline mr-1" />}
              {t === 'editor' && <User className="w-4 h-4 inline mr-1" />}
              {t === 'deadlines' && <Clock className="w-4 h-4 inline mr-1" />}
              {t}
            </button>
          ))}
        </div>

        {tab === 'burnout' && (
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
              <p className="text-gray-400 text-sm mb-2">Burnout Level</p>
              <p className={`text-4xl font-bold ${getBurnoutColor()}`}>{burnoutLevel}%</p>
              <div className="w-full bg-gray-700 rounded-full h-3 mt-3">
                <div
                  style={{ width: `${burnoutLevel}%` }}
                  className={`h-3 rounded-full ${
                    burnoutLevel < 30 ? 'bg-green-500' : burnoutLevel < 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                />
              </div>
              {burnoutLevel > 70 && (
                <p className="text-red-400 text-sm mt-2">⚠️ High burnout affects chapter quality!</p>
              )}
            </div>

            <button
              onClick={takeBreak}
              disabled={working}
              className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg text-white font-medium disabled:opacity-50"
            >
              🌴 Take a Break (-30% Burnout)
            </button>

            <p className="text-gray-400 text-sm text-center">
              Creating chapters increases burnout. Take breaks to maintain quality!
            </p>
          </div>
        )}

        {tab === 'editor' && (
          <div className="space-y-4">
            <button
              onClick={meetEditor}
              disabled={working}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg text-white font-medium disabled:opacity-50 mb-6"
            >
              💼 Meet with Editor
            </button>

            <div className="space-y-3">
              {(career.editor_interactions || []).slice(-5).reverse().map((interaction, i) => (
                <div key={i} className="bg-gray-800/50 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-purple-400 text-sm font-medium capitalize">{interaction.mood}</span>
                    <span className="text-gray-500 text-xs">
                      {new Date(interaction.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{interaction.feedback}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'deadlines' && (
          <div className="space-y-4">
            <div className="bg-orange-950/40 border border-orange-500/30 rounded-xl p-4 mb-6">
              <p className="text-orange-300 text-sm">⏰ Deadline approaching!</p>
              <p className="text-gray-400 text-xs mt-1">Work under pressure for bonus fans... or face the penalty</p>
            </div>

            <button
              onClick={workOnDeadline}
              disabled={working}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 py-3 rounded-lg text-white font-medium disabled:opacity-50"
            >
              ⚡ Rush to Meet Deadline
            </button>

            <p className="text-gray-400 text-sm text-center">
              70% chance to meet deadline. Success = bonus fans. Failure = reputation damage.
            </p>
          </div>
        )}

        {outcome && (
          <div className="mt-4 bg-orange-950/40 border border-orange-500/30 rounded-lg p-4">
            <p className="text-orange-300 text-center">{outcome}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}