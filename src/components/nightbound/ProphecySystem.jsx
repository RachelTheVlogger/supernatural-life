import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Eye, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function ProphecySystem({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);

  const { data: prophecies = [] } = useQuery({
    queryKey: ['prophecies'],
    queryFn: () => base44.entities.Prophecy.filter({ subject_id: vampireState.id })
  });

  const handleGenerateProphecy = async () => {
    setGenerating(true);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a dark, dramatic prophecy for a vampire named ${vampireState.vampire_name}. Make it ominous, specific, and game-relevant. Include 3-5 stages that will unfold. Return as JSON.`,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          text: { type: 'string' },
          stages: { type: 'array', items: { type: 'string' } },
          severity: { type: 'string' }
        }
      }
    });

    await base44.entities.Prophecy.create({
      title: result.title,
      text: result.text,
      subject_id: vampireState.id,
      severity: result.severity || 'significant',
      completion_progress: 0
    });

    await base44.entities.NightLog.create({
      entry: `Prophecy revealed: ${result.title}. Your fate unfolds.`,
      category: 'supernatural',
      intensity: 'extreme'
    });

    queryClient.invalidateQueries();
    setGenerating(false);
  };

  const getSeverityColor = (severity) => {
    return {
      minor: 'blue',
      significant: 'yellow',
      catastrophic: 'red',
      apocalyptic: 'purple'
    }[severity] || 'gray';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">🔮 Prophecies</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleGenerateProphecy}
          disabled={generating}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl mb-6 font-bold disabled:opacity-50"
        >
          {generating ? 'Seeking visions...' : '🔮 Seek Prophecy'}
        </button>

        <div className="space-y-4">
          {prophecies.map(prophecy => {
            const color = getSeverityColor(prophecy.severity);
            return (
              <div key={prophecy.id} className={`bg-${color}-950/30 border border-${color}-500/30 rounded-lg p-4`}>
                <div className="flex items-start gap-3 mb-3">
                  <Eye className={`w-5 h-5 text-${color}-400 mt-1`} />
                  <div>
                    <p className="text-white font-bold mb-1">{prophecy.title}</p>
                    <p className="text-gray-300 text-sm italic mb-2">"{prophecy.text}"</p>
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-1 rounded bg-${color}-900/50 text-${color}-300 capitalize`}>
                        {prophecy.severity}
                      </span>
                      {prophecy.is_fulfilled && (
                        <span className="text-xs px-2 py-1 rounded bg-green-900/50 text-green-300">
                          Fulfilled
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-black/40 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Progress</p>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      style={{ width: `${prophecy.completion_progress}%` }}
                      className={`h-2 rounded-full bg-${color}-500`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}