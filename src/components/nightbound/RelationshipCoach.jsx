import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Sparkles, TrendingUp, Heart, AlertCircle, Send, MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function RelationshipCoach({ vampireState, onClose, viewMode = 'vampire', currentServant = null }) {
  const [selectedServant, setSelectedServant] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [advice, setAdvice] = useState(null);
  const [chatMode, setChatMode] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationMode, setConversationMode] = useState('general'); // general, relationship, therapy, life
  const messagesEndRef = useRef(null);
  
  const isServantView = viewMode === 'servant';

  const { data: servants = [] } = useQuery({
    queryKey: ['servants'],
    queryFn: () => base44.entities.Servant.list()
  });

  const { data: nightLogs = [] } = useQuery({
    queryKey: ['recent-logs'],
    queryFn: () => base44.entities.NightLog.list('-created_date', 20)
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const analyzeRelationship = async (servant) => {
    setAnalyzing(true);
    setSelectedServant(servant);

    const recentInteractions = nightLogs
      .filter(log => log.entry.includes(servant.name))
      .slice(0, 5)
      .map(log => log.entry)
      .join('\n');

    const prompt = `${isServantView 
      ? 'You are an expert relationship coach specializing in vampire-servant dynamics. A human servant is asking about their relationship with their vampire master/mistress. Provide advice from THEIR perspective - help them navigate this intense, dangerous relationship.'
      : 'You are an expert relationship coach specializing in vampire-servant dynamics. Analyze this relationship and provide actionable advice.'}

${isServantView ? 'YOUR PROFILE (Servant):' : 'SERVANT PROFILE:'}
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

${isServantView ? 'THEIR PROFILE (Your Vampire):' : 'VAMPIRE PROFILE:'}
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
4. Specific ${isServantView ? 'Actions' : 'Interaction'} Recommendations (what should ${isServantView ? 'you' : 'they'} do RIGHT NOW)
5. Warning Signs (if any - danger, obsession, losing yourself, etc.)
6. Next Milestone Prediction

Be direct, insightful, and tailored to their specific dynamic. ${isServantView ? 'Remember: this is a dangerous relationship. The servant needs advice on navigating their feelings while staying safe. Be protective but honest.' : 'Consider their variant type heavily.'}`;
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

  const startChat = (servant, mode = 'general') => {
    setSelectedServant(servant);
    setChatMode(true);
    setConversationMode(mode);
    
    const greetings = {
      general: isServantView 
        ? `Hi ${servant.name}. I'm your AI Companion - think of me as a friend from the future. I can talk about anything: your feelings, life advice, dreams, fears, random thoughts... whatever's on your mind. This is your safe space.`
        : `Hi! I'm your AI Companion. I'm here to chat about anything - life, philosophy, advice, or just casual conversation. What's on your mind?`,
      relationship: isServantView 
        ? `Hi ${servant.name}. Let's talk about your relationship with ${vampireState.vampire_name}. I'm here to help you navigate this intense connection.`
        : `Let's discuss your relationship with ${servant.name}. What would you like to explore?`,
      therapy: isServantView
        ? `Hi ${servant.name}. This is your therapy session - a completely judgment-free zone. Talk about your mental health, trauma, feelings, anything weighing on you.`
        : `Welcome to your therapy session. Let's explore what's on your mind today.`,
      life: isServantView
        ? `Hi ${servant.name}. Let's talk about your life - your goals, dreams, fears, daily struggles. I'm here to listen and guide.`
        : `Let's discuss life, purpose, meaning. What are you thinking about?`
    };
    
    setMessages([
      {
        role: 'coach',
        text: greetings[mode] || greetings.general
      }
    ]);
  };

  const sendMessage = async () => {
    if (!userInput.trim() || sending) return;

    const userMessage = userInput.trim();
    setUserInput('');
    setSending(true);

    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);

    const recentInteractions = nightLogs
      .filter(log => log.entry.includes(selectedServant.name))
      .slice(0, 5)
      .map(log => log.entry)
      .join('\n');

    const conversationHistory = messages.map(m => `${m.role === 'user' ? (isServantView ? 'Servant' : 'Vampire') : 'AI'}: ${m.text}`).join('\n');

    const modePrompts = {
      general: isServantView
        ? 'You are a futuristic AI companion - like having a friend from the future. You can discuss anything: relationships, life advice, mental health, philosophy, daily problems, random thoughts. Be warm, understanding, and insightful. Reference their vampire connection when relevant but don\'t make everything about it.'
        : 'You are a futuristic AI companion for a vampire. Discuss anything they want - philosophy, loneliness, immortality, relationships, life. Be thoughtful and understand their unique perspective.',
      relationship: isServantView
        ? 'You are an AI relationship coach. You\'re talking with a human servant about their vampire relationship. Be supportive but honest about dangers. Help them navigate their feelings.'
        : 'You are an AI relationship coach for a vampire discussing their servant relationship. Provide insight and guidance.',
      therapy: isServantView
        ? 'You are an AI therapist in a Black Mirror-style future. Provide genuine therapy - validate feelings, explore trauma, offer coping strategies. This is serious mental health support. Acknowledge the unique stress of being a vampire\'s servant.'
        : 'You are an AI therapist. Provide genuine mental health support for a vampire dealing with immortality, power, and complex emotions.',
      life: isServantView
        ? 'You are an AI life coach helping a human navigate their existence as a vampire\'s servant. Discuss purpose, meaning, goals, identity. Help them find themselves in this unusual life.'
        : 'You are an AI life coach for a vampire. Discuss purpose, meaning, legacy, and navigating immortality.'
    };

    const prompt = modePrompts[conversationMode] || modePrompts.general;

${isServantView ? 'YOUR PROFILE (Servant):' : 'SERVANT PROFILE:'}
- Name: ${selectedServant.name}
- Variant: ${selectedServant.variant} (devoted=worships you, defiant=resists but attracted, dreamer=lost in fantasy)
- Personality: ${selectedServant.personality}
- Gender: ${selectedServant.gender}
- Sexuality: ${selectedServant.sexuality}
- Current Relationship: ${selectedServant.relationship || 0}%
- Obsession Stage: ${selectedServant.obsession_stage}/5
- Emotional State: ${selectedServant.emotional_state}
- Jealousy Level: ${selectedServant.jealousy_level || 0}%
- Boundaries: ${selectedServant.boundaries || 'not set'}
- Is Turned: ${selectedServant.is_turned ? 'Yes - now a vampire' : 'No - still human'}
${selectedServant.is_turned ? `- Vampire Stage: ${selectedServant.vampire_stage}/4
- Vampire Power: ${selectedServant.vampire_power_level}%
- Nights as Vampire: ${selectedServant.nights_as_vampire}` : ''}

${isServantView ? 'THEIR PROFILE (Your Vampire):' : 'VAMPIRE PROFILE:'}
- Name: ${vampireState.vampire_name}
- Gender: ${vampireState.gender}
- Sexuality: ${vampireState.sexuality}
- Personality: ${vampireState.personality?.join(', ')}
- Humanity: ${vampireState.humanity}%
- Moral Path: ${vampireState.moral_path}

RECENT INTERACTIONS:
${recentInteractions || 'No recent interactions logged'}

CONVERSATION HISTORY:
${conversationHistory}

${isServantView ? 'SERVANT' : 'VAMPIRE'}'S QUESTION: ${userMessage}

Respond naturally and helpfully. Give specific, actionable advice. Be direct but supportive. Reference specific aspects of their relationship. ${isServantView ? 'Remember this is a dangerous power dynamic - be protective of the servant while respecting their autonomy.' : ''} Keep responses conversational and 2-4 paragraphs max.`;
    try {
      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      setMessages(prev => [...prev, { role: 'coach', text: response }]);
    } catch (e) {
      console.error('Failed to send message:', e);
      setMessages(prev => [...prev, { role: 'coach', text: 'Sorry, I had trouble processing that. Could you rephrase?' }]);
    }

    setSending(false);
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
          <h2 className="text-2xl font-bold text-white">AI Companion</h2>
          <p className="text-gray-400 text-sm">
            {isServantView ? 'Your futuristic AI friend - talk about anything' : 'Advanced AI companion & advisor'}
          </p>
        </div>
        </div>

        {!selectedServant && !isServantView ? (
          <div className="space-y-3">
            <p className="text-gray-400 mb-4">Select a servant to discuss:</p>
            {servants.map(s => (
              <div key={s.id} className="bg-gray-800 rounded-xl p-4">
                <div className="flex justify-between items-start mb-3">
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
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => analyzeRelationship(s)}
                    className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-xs transition-colors"
                  >
                    📊 Analysis
                  </button>
                  <button
                    onClick={() => startChat(s, 'general')}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs transition-colors"
                  >
                    💬 General Chat
                  </button>
                  <button
                    onClick={() => startChat(s, 'relationship')}
                    className="bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg text-xs transition-colors"
                  >
                    💝 Relationship
                  </button>
                  <button
                    onClick={() => startChat(s, 'therapy')}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-xs transition-colors"
                  >
                    🧠 Therapy
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : !selectedServant && isServantView ? (
          // Auto-start for servant view
          <div className="space-y-3">
            <div className="bg-pink-950/40 border border-pink-500/30 rounded-xl p-4 mb-4">
              <p className="text-white text-sm mb-3">
                This is a confidential space. Talk freely about your relationship with {vampireState.vampire_name}.
              </p>
              <p className="text-gray-400 text-xs">
                The AI coach is here to help you navigate this intense connection.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => analyzeRelationship(currentServant)}
                className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition-colors text-sm"
              >
                📊 Relationship Analysis
              </button>
              <button
                onClick={() => startChat(currentServant, 'general')}
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors text-sm"
              >
                💬 General Chat
              </button>
              <button
                onClick={() => startChat(currentServant, 'therapy')}
                className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-colors text-sm"
              >
                🧠 Therapy Session
              </button>
              <button
                onClick={() => startChat(currentServant, 'life')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition-colors text-sm"
              >
                🌟 Life Coaching
              </button>
            </div>
          </div>
        ) : chatMode ? (
          <div className="flex flex-col h-[60vh]">
            <button
              onClick={() => {
                setSelectedServant(null);
                setChatMode(false);
                setMessages([]);
              }}
              className="text-purple-400 hover:text-purple-300 text-sm mb-4"
            >
              ← Back to servant selection
            </button>

            <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-3 mb-4">
              <p className="text-white font-medium flex items-center gap-2">
                {conversationMode === 'general' && '💬'}
                {conversationMode === 'relationship' && '💝'}
                {conversationMode === 'therapy' && '🧠'}
                {conversationMode === 'life' && '🌟'}
                {conversationMode === 'general' ? 'General Chat' : conversationMode === 'relationship' ? 'Relationship Talk' : conversationMode === 'therapy' ? 'Therapy Session' : 'Life Coaching'}
                {!isServantView && ` with ${selectedServant.name}`}
              </p>
              <p className="text-gray-400 text-xs">
                {isServantView ? 'Safe, confidential space' : `Bond: ${selectedServant.relationship || 0}%`}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-200'
                    }`}
                  >
                    {msg.role === 'coach' && (
                      <div className="flex items-center gap-2 mb-1">
                        <Brain className="w-4 h-4 text-pink-400" />
                        <span className="text-xs text-pink-400 font-medium">AI Coach</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-line">{msg.text}</p>
                  </div>
                </motion.div>
              ))}
              {sending && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-800 rounded-xl px-4 py-3">
                    <motion.p
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-gray-400 text-sm"
                    >
                      Coach is thinking...
                    </motion.p>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={
                  conversationMode === 'general' ? "Talk about anything..." :
                  conversationMode === 'therapy' ? "What's on your mind?" :
                  conversationMode === 'life' ? "What are you thinking about?" :
                  "Ask about your relationship..."
                }
                disabled={sending}
                className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={!userInput.trim() || sending}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
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