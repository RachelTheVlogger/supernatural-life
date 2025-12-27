import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Trash2, Package, Star, Video, Eye, MessageCircle } from 'lucide-react';
import SextingSession from '@/components/nightbound/SextingSession';
import VideoCallSession from '@/components/nightbound/VideoCallSession';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const INTERNAL_COMMENTARY = {
  devoted: {
    1: ['You sense their nervous anticipation. They wonder if you approve.', 'Their thoughts circle back to you. Always you.', 'You feel their heartbeat quicken when they think of you.'],
    2: ['Devotion radiates from them like heat. Comforting. Constant.', 'They crave your attention like air.', 'You sense their mind reaching for yours.'],
    3: ['Complete focus. You are their entire world now.', 'Their thoughts have no room for anything but you.', 'You feel their soul bending toward yours.'],
    4: ['Pure worship flows through the bond. Overwhelming.', 'They exist in a state of reverence.', 'You sense their identity dissolving into yours.'],
    5: ['The bond pulses. You are one entity now.', 'No separation exists between your minds anymore.', 'You feel what they feel. Complete union.']
  },
  defiant: {
    1: ['Resistance wars with attraction. They hate wanting you.', 'You sense their inner conflict. Sharp. Bitter.', 'Pride battles desire in their mind.'],
    2: ['The fight weakens. You feel their resolve cracking.', 'Anger at themselves. Hunger for you.', 'They resent how much they need this.'],
    3: ['Surrender tastes like defeat in their thoughts.', 'You sense acceptance replacing resistance.', 'The war is over. You won.'],
    4: ['Submission flows freely now. No more fighting.', 'They have given up. Given in. Given everything.', 'You feel their defiance transform into devotion.'],
    5: ['Complete capitulation. They are yours.', 'No walls remain. Total openness.', 'You sense their relief at finally letting go.']
  },
  dreamer: {
    1: ['Their thoughts drift. Ethereal. Distant.', 'You sense them slipping between worlds.', 'Reality feels thin around them.'],
    2: ['They exist half in dreams now. Fading.', 'You feel them floating. Untethered.', 'Their mind reaches across dimensions.'],
    3: ['Barely present. More shadow than substance.', 'You sense them dissolving into the night.', 'They drift in your orbit. Dreamlike.'],
    4: ['Almost gone. A ghost in your presence.', 'You feel them existing only through you now.', 'Their reality is whatever you make it.'],
    5: ['Completely dissolved. Only echoes remain.', 'You sense nothing but your own reflection in them.', 'They are a dream you\'re having.']
  }
};

export default function Messages() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [tab, setTab] = useState('messages');
  const [showSexting, setShowSexting] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  
  const urlParams = new URLSearchParams(window.location.search);
  const servantId = urlParams.get('servant');

  // Redirect to Night if no servant ID or invalid ID
  useEffect(() => {
    const checkGameState = async () => {
      const states = await base44.entities.VampireState.list();
      if (states.length === 0) {
        navigate(createPageUrl('Home'), { replace: true });
        return;
      }
      
      if (!servantId || servantId === 'null' || servantId === 'undefined') {
        navigate(createPageUrl('Night'), { replace: true });
      }
    };
    checkGameState();
  }, [navigate, servantId]);
  
  const { data: servant } = useQuery({
    queryKey: ['servant', servantId],
    queryFn: async () => {
      try {
        const servants = await base44.entities.Servant.list();
        return servants.find(s => s.id === servantId);
      } catch (e) {
        console.error('Failed to fetch servant:', e);
        return null;
      }
    },
    enabled: !!servantId && servantId !== 'null' && servantId !== 'undefined',
    retry: 2
  });

  const { data: vampireStates = [] } = useQuery({
    queryKey: ['vampireState'],
    queryFn: () => base44.entities.VampireState.list()
  });

  const vampireState = vampireStates[0];
  
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', servantId],
    queryFn: () => base44.entities.Message.filter({ servant_id: servantId }, '-created_date'),
    enabled: !!servantId,
    staleTime: 3000
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', servantId],
    queryFn: () => base44.entities.BusinessOrder.filter({ servant_id: servantId }, '-created_date'),
    enabled: !!servantId,
    staleTime: 3000
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', servantId],
    queryFn: () => base44.entities.Review.filter({ servant_id: servantId }, '-created_date'),
    enabled: !!servantId,
    staleTime: 5000
  });

  const isTabLoading = (tabName) => {
    if (tabName === 'messages') return messagesLoading;
    if (tabName === 'business') return ordersLoading;
    if (tabName === 'reviews') return reviewsLoading;
    return false;
  };
  
  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.Message.create(data),
    onSuccess: async () => {
      queryClient.invalidateQueries(['messages', servantId]);
      setInput('');
      
      // Small relationship gain from messaging
      const relationshipGain = Math.floor(Math.random() * 3) + 2; // 2-4
      const oldRel = servant.relationship || 0;
      await base44.entities.Servant.update(servantId, {
        relationship: Math.min(oldRel + relationshipGain, 100)
      });
      queryClient.invalidateQueries(['servant', servantId]);
      
      // Simulate servant response after delay
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(async () => {
          const rel = servant.relationship || 0;

          // Build conversation history for context
          const recentMessages = messages.slice(-6).map(m => 
            `${m.sender === 'vampire' ? 'You' : servant.name}: ${m.content}`
          ).join('\n');

          // Build personality prompt
          const variantTraits = {
            devoted: 'You are deeply devoted, soft, earnest, and emotionally anchored to the vampire. You express warmth and devotion.',
            defiant: 'You have controlled resistance through fascination. You struggle with your feelings but are drawn to the vampire despite yourself.',
            dreamer: 'You are detached, poetic, and already half-gone into the vampire\'s world. You speak in dreamy, abstract ways.'
          };

          const relationshipContext = rel >= 80 ? 'deeply bound and utterly devoted' : 
                                    rel >= 60 ? 'trusting and devoted' :
                                    rel >= 40 ? 'beginning to trust' :
                                    rel >= 20 ? 'curious but cautious' : 'wary and uncertain';

          const prompt = `You are ${servant.name}, deeply connected to a vampire through a supernatural bond. Personality: ${variantTraits[servant.variant]}. Bond level: ${relationshipContext}. Obsession: ${servant.obsession_stage}/5.

Recent conversation:
${recentMessages}
Vampire: ${input}

Respond as ${servant.name} texting them. Be natural, emotional, authentic. 1-3 sentences. React to explicit/sexual messages based on your bond level - respond in kind if close enough, be shy/hesitant if not. Show your personality and feelings.`;

          try {
            const response = await base44.integrations.Core.InvokeLLM({
              prompt: prompt
            });

            await base44.entities.Message.create({
              servant_id: servantId,
              content: response,
              sender: 'servant'
            });
          } catch (error) {
            console.log('LLM rate limit hit, using fallback');
            // Fallback to internal commentary if LLM fails
            const responses = INTERNAL_COMMENTARY[servant.variant]?.[servant.obsession_stage] || ['You sense... something. Faint.'];
            const response = responses[Math.floor(Math.random() * responses.length)];

            await base44.entities.Message.create({
              servant_id: servantId,
              content: response,
              sender: 'servant'
            });
          }

          setIsTyping(false);
          queryClient.invalidateQueries(['messages', servantId]);
        }, 3000 + Math.random() * 3000);
      }, 500);
    }
  });
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);
  
  const handleSend = () => {
    if (!input.trim()) return;
    
    sendMessageMutation.mutate({
      servant_id: servantId,
      content: input,
      sender: 'vampire'
    });

    // Update quest progress
    base44.entities.Quest.filter({ servant_id: servantId }).then(quests => {
      const activeQuest = quests.find(q => !q.completed);
      if (activeQuest) {
        const progress = activeQuest.progress || {};
        const newCount = (progress.message || 0) + 1;
        base44.entities.Quest.update(activeQuest.id, {
          progress: { ...progress, message: newCount }
        });
      }
    });
  };
  
  const handleClearMessages = async () => {
    if (messages.length === 0) return;
    if (!confirm('Clear all messages with this servant?')) return;
    
    await base44.entities.Message.filter({ servant_id: servantId }).then(async (msgs) => {
      for (const msg of msgs) {
        await base44.entities.Message.delete(msg.id);
      }
    });
    
    queryClient.invalidateQueries(['messages', servantId]);
  };

  if (!servant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }
  
  return (
    <>
      {showSexting && vampireState && (
        <SextingSession
          servant={servant}
          vampireState={vampireState}
          onClose={() => setShowSexting(false)}
          onGainRelationship={() => queryClient.invalidateQueries()}
        />
      )}
      {showVideoCall && vampireState && (
        <VideoCallSession
          servant={servant}
          vampireState={vampireState}
          onClose={() => setShowVideoCall(false)}
          onGainRelationship={() => queryClient.invalidateQueries()}
        />
      )}
    <div className="min-h-screen flex flex-col bg-black">
      {/* Header */}
      <div className="bg-gray-900 p-4 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate(createPageUrl('Night'))}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h2 className="text-white font-medium">🌙 {servant.name}'s Thoughts</h2>
            <p className="text-gray-400 text-xs">What you sense through the bond</p>
          </div>
          <button
            onClick={handleClearMessages}
            className="text-gray-400 hover:text-red-400 transition-colors"
            title="Clear messages"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab('messages')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
              tab === 'messages' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-white active:bg-gray-700'
            }`}
          >
            💬 Chat
          </button>
          <button
            onClick={() => setTab('videocall')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
              tab === 'videocall' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-white active:bg-gray-700'
            }`}
          >
            📹 Video
          </button>
          <button
            onClick={() => setTab('sexting')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
              tab === 'sexting' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-white active:bg-gray-700'
            }`}
          >
            💋 Sext
          </button>
          <button
            onClick={() => setTab('business')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation flex items-center justify-center gap-1 ${
              tab === 'business' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-white active:bg-gray-700'
            }`}
          >
            <Package className="w-4 h-4" />
            Orders {orders.length > 0 && `(${orders.length})`}
          </button>
          <button
            onClick={() => setTab('reviews')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation flex items-center justify-center gap-1 ${
              tab === 'reviews' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-white active:bg-gray-700'
            }`}
          >
            <Star className="w-4 h-4" />
            Reviews {reviews.length > 0 && `(${reviews.length})`}
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 relative">
        {/* Loading Overlay */}
        <AnimatePresence>
          {isTabLoading(tab) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 360]
                }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="text-5xl"
              >
                💌
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {tab === 'messages' ? (
          <>
            {messages.sort((a, b) => new Date(a.created_date) - new Date(b.created_date)).map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === 'vampire' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                msg.sender === 'vampire'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800/50 text-gray-300 italic border border-purple-900/30'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
            </div>
          </motion.div>
            ))}
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-gray-800 text-gray-400 rounded-2xl px-4 py-2">
                  <p className="text-sm">typing...</p>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        ) : tab === 'business' ? (
          <>
            {orders.length > 0 && (
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-400 text-sm">{orders.length} orders</p>
                <button
                  onClick={async () => {
                    if (!confirm(`Clear all ${orders.length} orders?`)) return;
                    
                    for (const order of orders) {
                      await base44.entities.BusinessOrder.delete(order.id);
                    }
                    
                    await base44.entities.NightLog.create({
                      entry: `${servant.name} cleared ${orders.length} orders from messages.`,
                      category: 'interaction',
                      intensity: 'subtle'
                    });
                    
                    queryClient.invalidateQueries(['orders']);
                  }}
                  className="bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 rounded-lg px-3 py-1 text-xs transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}
            {orders.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No orders yet...</p>
            ) : (
              orders.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800 rounded-xl p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-white font-medium">{order.customer_name}</h3>
                      <p className="text-gray-400 text-sm">{order.item}</p>
                    </div>
                    <p className="text-purple-400 font-medium">${order.price}</p>
                  </div>
                  {order.message && (
                    <p className="text-gray-300 text-sm italic mb-2">"{order.message}"</p>
                  )}
                  <span className={`inline-block px-2 py-1 rounded text-xs ${
                    order.status === 'completed' ? 'bg-green-900/30 text-green-400' :
                    order.status === 'crafting' ? 'bg-purple-900/30 text-purple-400' :
                    'bg-gray-700 text-gray-400'
                  }`}>
                    {order.status}
                  </span>
                </motion.div>
              ))
            )}
          </>
        ) : tab === 'videocall' ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-6xl mb-4">📹</div>
            <h3 className="text-white text-xl font-bold mb-2">Video Call</h3>
            <p className="text-gray-400 text-sm mb-6 text-center">Start a video call with {servant.name}.<br/>Watch them. Direct them. Control them.</p>
            <button
              onClick={() => setShowVideoCall(true)}
              className="bitlife-btn px-8 py-3 rounded-xl font-medium"
            >
              📹 Start Video Call
            </button>
          </div>
        ) : tab === 'sexting' ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-white text-xl font-bold mb-2">Sexting</h3>
            <p className="text-gray-400 text-sm mb-6 text-center">Send dirty messages back and forth.<br/>Build the heat. Make them desperate.</p>
            <button
              onClick={() => setShowSexting(true)}
              className="bitlife-btn px-8 py-3 rounded-xl font-medium"
            >
              💋 Start Sexting
            </button>
          </div>
        ) : tab === 'reviews' ? (
          <>
            {reviews.length > 0 && (
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-400 text-sm">{reviews.length} reviews</p>
                <button
                  onClick={async () => {
                    if (!confirm(`Clear all ${reviews.length} reviews?`)) return;
                    
                    for (const review of reviews) {
                      await base44.entities.Review.delete(review.id);
                    }
                    
                    await base44.entities.NightLog.create({
                      entry: `${servant.name} cleared ${reviews.length} reviews from messages.`,
                      category: 'interaction',
                      intensity: 'subtle'
                    });
                    
                    queryClient.invalidateQueries(['reviews']);
                  }}
                  className="bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 rounded-lg px-3 py-1 text-xs transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}
            {reviews.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No reviews yet...</p>
            ) : (
              reviews.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800 rounded-xl p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-medium">{review.customer_name}</h3>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm italic">"{review.comment}"</p>
                </motion.div>
              ))
            )}
          </>
        ) : null}
      </div>
      
      {/* Input */}
      <div className="bg-gray-900 p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Reach out through the bond..."
            className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-3 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bitlife-btn rounded-xl px-6 py-3 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
    </>
  );
}