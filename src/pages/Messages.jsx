import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Trash2, Package, Star, Video, Eye } from 'lucide-react';
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
  const [videoCallOutcome, setVideoCallOutcome] = useState('');
  const [sextingOutcome, setSextingOutcome] = useState('');
  
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
          <div className="space-y-3">
            <p className="text-gray-400 text-sm text-center mb-4">Video call with {servant.name}... watch them pleasure themselves for you</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'watch_casual', label: '👀 Watch them casually', gain: [10, 15] },
                { id: 'watch_strip', label: '👙 Make them strip', gain: [15, 22] },
                { id: 'watch_touch', label: '✋ Tell them where to touch', gain: [18, 25] },
                { id: 'watch_masturbate', label: '💦 Watch them masturbate', gain: [25, 35] },
                { id: 'watch_toy', label: '🎀 Watch them use toys', gain: [28, 38] },
                { id: 'watch_edge', label: '⚡ Make them edge for you', gain: [30, 40] },
                { id: 'watch_deny', label: '🚫 Deny their orgasm', gain: [20, 30] },
                { id: 'watch_cum', label: '💫 Let them cum for you', gain: [35, 45] }
              ].map(action => (
                <button
                  key={action.id}
                  onClick={async () => {
                    const outcomes = {
                      watch_casual: [`Video call started.\n\n${servant.name} sitting there, nervous. Adjusting the camera.\n\n"Hi..." they say softly.\n\nYou watch them. They blush under your gaze.`, `They're on camera for you. Fidgeting. Uncertain.\n\n"What should I do?" they ask.\n\nYou just watch. That's enough for now.`],
                      watch_strip: [`"Take it off. Slowly."\n\nThey obey. Piece by piece.\n\nShirt first. Then pants. Down to underwear.\n\nThey pause, looking at you through the camera.\n\n"Everything," you say.\n\nThey strip completely. Naked on camera for you.`, `Video call strip tease.\n\nThey undress slowly. Teasingly.\n\nWatching you watch them.\n\nNaked now. Exposed. Yours to see.`],
                      watch_touch: [`"Touch yourself. Start slow."\n\nTheir hand moves. Hesitant at first.\n\nYou guide them. "There. Like that."\n\nThey obey every command. Touching where you say.\n\nMoaning softly for you.`, `You direct every touch through the camera.\n\n"Slower. Circles. Good."\n\nThey follow your instructions perfectly.\n\nTheir body responding to your voice.`],
                      watch_masturbate: [`"Show me. Touch yourself for me."\n\nThey spread their legs. Camera angle perfect.\n\nYou watch them pleasure themselves.\n\nTheir eyes on the camera. On you.\n\n"Don't stop," you command.`, `They masturbate while you watch.\n\nFingers moving. Moaning your name.\n\nCamera capturing everything.\n\nYou direct them. They obey.\n\nSo fucking hot.`],
                      watch_toy: [`"Get your toy."\n\nThey reach off camera. Return with it.\n\nYou watch them use it. Slowly at first.\n\n"Deeper," you command.\n\nThey push it in. Moaning. Taking it all for you.`, `Toy on camera. You're directing the show.\n\n"Fuck yourself with it."\n\nThey obey. In and out. Faster.\n\nMoaning. Gasping. Performing for you.`],
                      watch_edge: [`"Get close. But don't cum yet."\n\nThey touch themselves faster. Building.\n\n"Stop."\n\nThey whimper but obey.\n\n"Again."\n\nYou edge them over and over through the camera.`, `Edging them remotely.\n\n"Close now?"\n\n"Yes please..."\n\n"Stop."\n\nThey cry out in frustration.\n\nYou're cruel. They love it.`],
                      watch_deny: [`They're so close. Begging to cum.\n\n"Please can I?!"\n\n"No."\n\nYou end the call.\n\nLeave them desperate. Denied.\n\nPerfect control.`, `"Can I cum please?!"\n\n"No. Stop touching."\n\nThey whimper. Frustrated. Denied.\n\nYou smile and hang up.`],
                      watch_cum: [`"Cum for me. Now."\n\nThey don't hold back.\n\nMasturbating hard. Moaning loud.\n\nYou watch them come undone.\n\nScreaming your name. Shaking.\n\nPerfect.`, `Permission granted.\n\nThey cum on camera for you.\n\nMoaning. Trembling. Calling your name.\n\nYou watch everything.\n\nSo fucking beautiful.`]
                    };
                    const result = outcomes[action.id][Math.floor(Math.random() * outcomes[action.id].length)];
                    setVideoCallOutcome(result);
                    
                    const [min, max] = action.gain;
                    const gain = Math.floor(Math.random() * (max - min + 1)) + min;
                    await base44.entities.Servant.update(servantId, {
                      relationship: Math.min((servant.relationship || 0) + gain, 100)
                    });
                    await base44.entities.NightLog.create({
                      entry: `Video call with ${servant.name}: ${result.split('\n')[0]}`,
                      category: 'interaction',
                      intensity: 'significant'
                    });
                    queryClient.invalidateQueries();
                    setTimeout(() => setVideoCallOutcome(''), 5000);
                  }}
                  className="bitlife-btn py-3 px-4 rounded-xl text-sm"
                >
                  {action.label}
                </button>
              ))}
            </div>
            {videoCallOutcome && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-pink-950/40 border border-pink-500/30 rounded-xl p-4 mt-4"
              >
                <p className="text-gray-300 whitespace-pre-line">{videoCallOutcome}</p>
              </motion.div>
            )}
          </div>
        ) : tab === 'sexting' ? (
          <div className="space-y-3">
            <p className="text-gray-400 text-sm text-center mb-4">Send dirty texts to {servant.name}...</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'flirt', label: '😏 Flirt', gain: [8, 12] },
                { id: 'tease', label: '😈 Tease them', gain: [12, 18] },
                { id: 'dirty_text', label: '🔥 Send dirty text', gain: [15, 22] },
                { id: 'request_pic', label: '📸 Request pic', gain: [18, 25] },
                { id: 'send_pic', label: '📷 Send your pic', gain: [20, 28] },
                { id: 'video_request', label: '🎥 Request video', gain: [25, 32] },
                { id: 'mutual_sext', label: '💕 Mutual sexting', gain: [28, 38] },
                { id: 'come_over', label: '🏠 Tell them to come over', gain: [35, 45] }
              ].map(action => (
                <button
                  key={action.id}
                  onClick={async () => {
                    const outcomes = {
                      flirt: [`You: "Thinking about you..."\n\nThem: "Yeah? What about me?"\n\nYou: "Your body. Your voice. Everything."\n\nThem: "😳 stop I'm blushing"`, `Flirty texts back and forth.\n\nThem: "You're trouble you know that?"\n\nYou: "You love it."\n\nThem: "...yeah I do 💜"`],
                      tease: [`You: "Wish you were here right now..."\n\nThem: "Why? What would you do?"\n\nYou: "Things I can't say over text 😈"\n\nThem: "fuck you're making me wet"`, `Teasing them over text.\n\nYou send suggestive messages.\n\nThey respond eagerly. Getting worked up.\n\n"You're driving me crazy" they text.`],
                      dirty_text: [`You: "I want to bend you over and fuck you hard."\n\nThem: "oh my god"\n\nThem: "I'm touching myself reading this"\n\nYou: "Good. Keep going."`, `Filthy texts sent.\n\nDescribing exactly what you'd do to them.\n\nThey respond: "FUCK 🥵"\n\nThey're definitely touching themselves now.`],
                      request_pic: [`You: "Send me a pic. Now."\n\nThem: "...okay"\n\n*Photo received*\n\nThey sent it. Naked. Perfect.\n\nYou: "Good. Send more."`, `You requested a pic.\n\nThey hesitated.\n\nThen sent it.\n\nFucking beautiful.\n\nYou save it immediately.`],
                      send_pic: [`You sent them a pic.\n\nThem: "oh FUCK"\n\nThem: "you can't just send that"\n\nThem: "I'm at work 😳"\n\nYou: "😈"`, `Photo sent.\n\nTheir response immediate:\n\n"holy shit"\n\n"I need you right now"\n\n"please"`],
                      video_request: [`You: "Send me a video."\n\nThem: "...of what?"\n\nYou: "You know what."\n\n*Video received*\n\nThey sent it. Them touching themselves. Moaning your name.\n\nFuck.`, `Video request sent.\n\nThey recorded themselves masturbating.\n\nSent it to you.\n\nMoaning. Cumming. Saying your name.\n\nYou watch it three times.`],
                      mutual_sext: [`Both of you sexting.\n\nDescribing what you're doing.\n\n"I'm touching myself" - them\n\n"Me too" - you\n\nBuilding together. Closer. Closer.\n\nBoth cum while texting.`, `Mutual sexting session.\n\nBoth touching yourselves.\n\nTexting what you're doing.\n\n"I'm close"\n\n"Me too"\n\n"Cum with me"\n\nBoth finish together.`],
                      come_over: [`You: "Come over. Now."\n\nThem: "It's 2am"\n\nYou: "I said now."\n\nThem: "...on my way"\n\nThey arrive in 10 minutes. Eager. Desperate.`, `You text: "Get here. I need you."\n\nThem: "omw 🏃"\n\nThey show up breathless.\n\nYou don't even let them sit down.\n\nPush them against the door immediately.`]
                    };
                    const result = outcomes[action.id][Math.floor(Math.random() * outcomes[action.id].length)];
                    setSextingOutcome(result);
                    
                    const [min, max] = action.gain;
                    const gain = Math.floor(Math.random() * (max - min + 1)) + min;
                    await base44.entities.Servant.update(servantId, {
                      relationship: Math.min((servant.relationship || 0) + gain, 100)
                    });
                    await base44.entities.NightLog.create({
                      entry: `Sexting ${servant.name}: ${result.split('\n')[0]}`,
                      category: 'interaction',
                      intensity: 'moderate'
                    });
                    queryClient.invalidateQueries();
                    setTimeout(() => setSextingOutcome(''), 5000);
                  }}
                  className="bitlife-btn py-3 px-4 rounded-xl text-sm"
                >
                  {action.label}
                </button>
              ))}
            </div>
            {sextingOutcome && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4 mt-4"
              >
                <p className="text-gray-300 whitespace-pre-line">{sextingOutcome}</p>
              </motion.div>
            )}
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
  );
}