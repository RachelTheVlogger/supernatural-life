import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, TrendingUp, Sparkles, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function FuturePredictor({ vampireState, onClose }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [selectedServant, setSelectedServant] = useState(null);

  const { data: servants = [] } = useQuery({
    queryKey: ['servants'],
    queryFn: () => base44.entities.Servant.list()
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['logs'],
    queryFn: () => base44.entities.NightLog.list('-created_date', 30)
  });

  const predictFuture = async (servant) => {
    setSelectedServant(servant);
    setAnalyzing(true);

    const recentEvents = logs
      .filter(log => log.entry.includes(servant.name))
      .slice(0, 10)
      .map(log => log.entry)
      .join('\n');

    const prompt = `You are an advanced AI that predicts relationship futures using pattern analysis. Analyze this vampire-servant relationship and predict THREE possible futures (optimistic, realistic, pessimistic).

SERVANT: ${servant.name}
- Variant: ${servant.variant}
- Bond: ${servant.relationship || 0}%
- Obsession: ${servant.obsession_stage}/5
- Is Turned: ${servant.is_turned ? 'Yes' : 'No'}

VAMPIRE: ${vampireState.vampire_name}
- Humanity: ${vampireState.humanity}%
- Moral Path: ${vampireState.moral_path}

RECENT EVENTS:
${recentEvents || 'Limited data'}

Provide predictions for 1 month, 6 months, and 1 year from now for each scenario. Be specific and dramatic.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          optimistic: {
            type: 'object',
            properties: {
              one_month: { type: 'string' },
              six_months: { type: 'string' },
              one_year: { type: 'string' }
            }
          },
          realistic: {
            type: 'object',
            properties: {
              one_month: { type: 'string' },
              six_months: { type: 'string' },
              one_year: { type: 'string' }
            }
          },
          pessimistic: {
            type: 'object',
            properties: {
              one_month: { type: 'string' },
              six_months: { type: 'string' },
              one_year: { type: 'string' }
            }
          },
          probability: { type: 'string' }
        }
      }
    });

    setPrediction(result);
    setAnalyzing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-indigo-500/30"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-indigo-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Future Predictor</h2>
              <p className="text-gray-400 text-sm">AI-powered timeline analysis</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {analyzing ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
            </motion.div>
            <p className="text-white text-xl font-bold">Analyzing timeline...</p>
            <p className="text-gray-400 text-sm mt-2">Computing possible futures</p>
          </div>
        ) : prediction ? (
          <div className="space-y-6">
            <button
              onClick={() => { setSelectedServant(null); setPrediction(null); }}
              className="text-indigo-400 text-sm"
            >
              ← Back
            </button>

            <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4">
              <h3 className="text-white font-bold mb-2">Analyzing: {selectedServant.name}</h3>
              <p className="text-gray-400 text-sm">{prediction.probability}</p>
            </div>

            <div className="grid gap-4">
              {/* Optimistic */}
              <div className="bg-green-950/20 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-green-400" />
                  <h3 className="text-green-400 font-bold">Best Case Scenario</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-green-300 text-sm font-medium mb-1">1 Month:</p>
                    <p className="text-gray-300 text-sm">{prediction.optimistic.one_month}</p>
                  </div>
                  <div>
                    <p className="text-green-300 text-sm font-medium mb-1">6 Months:</p>
                    <p className="text-gray-300 text-sm">{prediction.optimistic.six_months}</p>
                  </div>
                  <div>
                    <p className="text-green-300 text-sm font-medium mb-1">1 Year:</p>
                    <p className="text-gray-300 text-sm">{prediction.optimistic.one_year}</p>
                  </div>
                </div>
              </div>

              {/* Realistic */}
              <div className="bg-blue-950/20 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <h3 className="text-blue-400 font-bold">Most Likely Outcome</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-blue-300 text-sm font-medium mb-1">1 Month:</p>
                    <p className="text-gray-300 text-sm">{prediction.realistic.one_month}</p>
                  </div>
                  <div>
                    <p className="text-blue-300 text-sm font-medium mb-1">6 Months:</p>
                    <p className="text-gray-300 text-sm">{prediction.realistic.six_months}</p>
                  </div>
                  <div>
                    <p className="text-blue-300 text-sm font-medium mb-1">1 Year:</p>
                    <p className="text-gray-300 text-sm">{prediction.realistic.one_year}</p>
                  </div>
                </div>
              </div>

              {/* Pessimistic */}
              <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <h3 className="text-red-400 font-bold">Worst Case Scenario</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-red-300 text-sm font-medium mb-1">1 Month:</p>
                    <p className="text-gray-300 text-sm">{prediction.pessimistic.one_month}</p>
                  </div>
                  <div>
                    <p className="text-red-300 text-sm font-medium mb-1">6 Months:</p>
                    <p className="text-gray-300 text-sm">{prediction.pessimistic.six_months}</p>
                  </div>
                  <div>
                    <p className="text-red-300 text-sm font-medium mb-1">1 Year:</p>
                    <p className="text-gray-300 text-sm">{prediction.pessimistic.one_year}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-gray-400 mb-4">Select a relationship to analyze:</p>
            {servants.map(servant => (
              <button
                key={servant.id}
                onClick={() => predictFuture(servant)}
                className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-all border border-indigo-500/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">{servant.name}</h3>
                    <p className="text-gray-400 text-sm">Bond: {servant.relationship || 0}% • {servant.variant}</p>
                  </div>
                  <TrendingUp className="w-6 h-6 text-indigo-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}