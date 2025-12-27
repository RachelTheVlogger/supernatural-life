import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Sparkles, TrendingUp, Heart, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function RelationshipCoach({ vampireState, onClose }) {
  const [selectedServant, setSelectedServant] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [advice, setAdvice] = useState(null);

  const { data: servants = [] } = useQuery({
    queryKey: ['servants'],
    queryFn: () => base44.entities.Servant.list()
  });

  const { data: nightLogs = [] } = useQuery({
    queryKey: ['recent-logs'],
    queryFn: () => base44.entities.NightLog.list('-created_date', 20)
  });

  const analyzeRelationship = async (servant) => {
    setAnalyzing(true);
    setSelectedServant(servant);

    const recentInteractions = nightLogs
      .filter(log => log.entry.includes(servant.name))
      .slice(0, 5)
      .map(log => log.entry)
      .join('\n');

    const prompt = `You are an expert relationship coach specializing in vampire-servant dynamics. Analyze this relationship and provide actionable advice.

SERVANT PROFILE:
- Name: ${servant.name}
- Variant: ${servant.variant} (devoted=worships you, defiant=resists but attracted, dreamer=lost in fantasy)
- Personality: ${servant.personality}
- Gender: ${servant.gender}
- Sexuality: ${servant.sexuality}
- Current Relationship: ${servant.relationship || 0}%
- Obsession Stage: ${servant.obsession_stage}/5
- Emotional State: ${servant.emotional_state}
- Jealousy Level: ${servant.jealousy_level || 0}%
- Boundaries: ${servant.boundaries || 'not set'}
- Is Turned: ${servant.is_turned ? 'Yes - now a vampire' : 'No - still human'}
${servant.is_turned ? `- Vampire Stage: ${servant.vampire_stage}/4
- Vampire Power: ${servant.vampire_power_level}%
- Nights as Vampire: ${servant.nights_as_vampire}` : ''}

VAMPIRE PROFILE:
- Name: ${vampireState.vampire_name}
- Gender: ${vampireState.gender}
- Sexuality: ${vampireState.sexuality}
- Personality: ${vampireState.personality?.join(', ')}
- Humanity: ${vampireState.humanity}%
- Moral Path: ${vampireState.moral_path}
- Preferred Title: ${vampireState.preferred_title || 'none set'}

RECENT INTERACTIONS:
${recentInteractions || 'No recent interactions logged'}

Provide a structured analysis with:
1. Relationship Status Assessment
2. Key Dynamics & Patterns
3. Growth Opportunities
4. Specific Interaction Recommendations (which interaction types would work best RIGHT NOW)
5. Warning Signs (if any - jealousy, pushing too hard, neglect, etc.)
6. Next Milestone Prediction

Be direct, insightful, and tailored to their specific dynamic. Consider their variant type heavily.`;

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            status_assessment: { type: 'string' },
            key_dynamics: { type: 'array', items: { type: 'string' } },
            growth_opportunities: { type: 'array', items: { type: 'string' } },
            recommended_interactions: { type: 'array', items: { type: 'string' } },
            warning_signs: { type: 'array', items: { type: 'string' } },
            next_milestone: { type: 'string' },
            overall_advice: { type: 'string' }
          }
        }
      });
      
      setAdvice(result);
    } catch (e) {
      console.error('Failed to get advice:', e);
      setAdvice({
        status_assessment: 'Analysis failed. Please try again.',
        key_dynamics: [],
        growth_opportunities: [],
        recommended_interactions: [],
        warning_signs: [],
        next_milestone: '',
        overall_advice: 'Unable to analyze at this time.'
      });
    }
    
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-8 h-8 text-purple-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">AI Relationship Coach</h2>
            <p className="text-gray-400 text-sm">Deep relationship analysis & personalized advice</p>
          </div>
        </div>

        {!selectedServant ? (
          <div className="space-y-3">
            <p className="text-gray-400 mb-4">Select a servant to analyze:</p>
            {servants.map(s => (
              <button
                key={s.id}
                onClick={() => analyzeRelationship(s)}
                className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white font-medium">{s.name}</h3>
                    <p className="text-gray-400 text-sm capitalize">
                      {s.variant} • {s.personality}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-purple-400 font-bold">{s.relationship || 0}%</p>
                    <p className="text-gray-500 text-xs">Bond</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : analyzing ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="inline-block mb-4"
            >
              <Brain className="w-12 h-12 text-purple-400" />
            </motion.div>
            <p className="text-gray-400">Analyzing relationship with {selectedServant.name}...</p>
            <p className="text-gray-500 text-sm mt-2">Reading dynamics, patterns, opportunities...</p>
          </div>
        ) : advice ? (
          <div className="space-y-6">
            <button
              onClick={() => {
                setSelectedServant(null);
                setAdvice(null);
              }}
              className="text-purple-400 hover:text-purple-300 text-sm mb-4"
            >
              ← Back to servant selection
            </button>

            <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-purple-400" />
                <h3 className="text-white font-bold">Relationship Status</h3>
              </div>
              <p className="text-gray-300 text-sm">{advice.status_assessment}</p>
            </div>

            {advice.key_dynamics?.length > 0 && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  <h3 className="text-white font-bold">Key Dynamics</h3>
                </div>
                <ul className="space-y-2">
                  {advice.key_dynamics.map((dynamic, i) => (
                    <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>{dynamic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {advice.recommended_interactions?.length > 0 && (
              <div className="bg-green-950/40 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <h3 className="text-white font-bold">Recommended Interactions</h3>
                </div>
                <ul className="space-y-2">
                  {advice.recommended_interactions.map((rec, i) => (
                    <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {advice.growth_opportunities?.length > 0 && (
              <div className="bg-yellow-950/40 border border-yellow-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-white font-bold">Growth Opportunities</h3>
                </div>
                <ul className="space-y-2">
                  {advice.growth_opportunities.map((opp, i) => (
                    <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">→</span>
                      <span>{opp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {advice.warning_signs?.length > 0 && (
              <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <h3 className="text-white font-bold">Warning Signs</h3>
                </div>
                <ul className="space-y-2">
                  {advice.warning_signs.map((warning, i) => (
                    <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">!</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {advice.next_milestone && (
              <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-white font-bold">Next Milestone</h3>
                </div>
                <p className="text-gray-300 text-sm">{advice.next_milestone}</p>
              </div>
            )}

            <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4">
              <h3 className="text-white font-bold mb-2">Overall Advice</h3>
              <p className="text-gray-300 text-sm">{advice.overall_advice}</p>
            </div>

            <button
              onClick={() => analyzeRelationship(selectedServant)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-medium transition-colors"
            >
              Re-analyze Relationship
            </button>
          </div>
        ) : null}
      </motion.div>
    </motion.div>
  );
}