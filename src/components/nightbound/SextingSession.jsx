import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Camera, Video, Image, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import MasturbationSlider from './MasturbationSlider';

export default function SextingSession({ servant, vampireState, onClose, onGainRelationship }) {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [heatLevel, setHeatLevel] = useState(0);
  const [showSlider, setShowSlider] = useState(false);
  const [sliderAction, setSliderAction] = useState(null);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const startSession = () => {
    setSessionStarted(true);
    const openers = [
      { from: 'servant', text: 'hey... you up?', heat: 5 },
      { from: 'servant', text: 'can\'t stop thinking about you...', heat: 10 },
      { from: 'servant', text: 'wish you were here right now', heat: 8 },
      { from: 'servant', text: 'what are you doing? 😏', heat: 7 }
    ];
    const opener = openers[Math.floor(Math.random() * openers.length)];
    setMessages([opener]);
    setHeatLevel(opener.heat);
  };

  const getResponse = (action, currentHeat) => {
    const responses = {
      flirt: {
        low: [
          { text: '😳 stop you\'re making me blush', heat: 8 },
          { text: 'you always know what to say...', heat: 10 },
          { text: 'I\'m smiling so hard right now', heat: 6 }
        ],
        mid: [
          { text: 'fuck you\'re making me feel things...', heat: 15 },
          { text: 'my heart is racing just reading that', heat: 12 },
          { text: 'god I want you so bad right now', heat: 18 }
        ],
        high: [
          { text: 'I\'m already touching myself thinking about you', heat: 25 },
          { text: 'need you. right now. please.', heat: 22 },
          { text: 'you have no idea what you do to me', heat: 20 }
        ]
      },
      tease: {
        mid: [
          { text: 'wait what are you doing right now? 👀', heat: 12 },
          { text: 'don\'t leave me hanging...', heat: 10 },
          { text: 'tell me more...', heat: 15 }
        ],
        high: [
          { text: 'fuck I\'m getting wet just thinking about it', heat: 22 },
          { text: 'you\'re killing me. in the best way.', heat: 20 },
          { text: 'I need you to do that to me. please.', heat: 25 }
        ]
      },
      dirty: {
        mid: [
          { text: 'oh my god 😳', heat: 18 },
          { text: '...yes please', heat: 20 },
          { text: 'fuck that\'s hot', heat: 22 }
        ],
        high: [
          { text: 'YES. exactly like that. please.', heat: 30 },
          { text: 'I\'m so fucking wet right now', heat: 35 },
          { text: 'need your cock inside me. now.', heat: 38 }
        ]
      },
      pic_request: {
        mid: [
          { text: '...you want a pic?', heat: 15 },
          { text: 'give me a sec...', heat: 18 }
        ],
        high: [
          { text: '*sends pic* 📸\n\nlike what you see?', heat: 28 },
          { text: '*picture sent*\n\nI\'m all yours...', heat: 30 }
        ]
      },
      send_pic: {
        high: [
          { text: 'oh FUCK 🥵', heat: 25 },
          { text: 'you can\'t just send that...', heat: 22 },
          { text: 'fuck I just came looking at that', heat: 35 },
          { text: 'saved. screenshot. mine now.', heat: 28 }
        ]
      },
      video: {
        high: [
          { text: 'wait you want me to...', heat: 25 },
          { text: '*recording...*\n\n*video sent* 🎥\n\nfuck I came so hard for you', heat: 40 },
          { text: 'I recorded myself... watch it and tell me what you think', heat: 35 }
        ]
      },
      command: {
        high: [
          { text: 'yes. fuck. okay.', heat: 25 },
          { text: 'I\'m doing it right now...', heat: 30 },
          { text: 'anything for you. always.', heat: 28 },
          { text: 'fuck I\'m so close already...', heat: 35 }
        ]
      },
      edge: {
        high: [
          { text: 'I\'m right there... please can I?', heat: 35 },
          { text: 'so close... need permission...', heat: 32 },
          { text: 'please let me cum I\'m begging', heat: 38 }
        ]
      }
    };

    const tier = currentHeat < 20 ? 'low' : currentHeat < 40 ? 'mid' : 'high';
    const options = responses[action]?.[tier] || responses[action]?.mid || responses[action]?.high;
    return options[Math.floor(Math.random() * options.length)];
  };

  const sendMessage = async (text, action = 'flirt', quickActionObj = null) => {
    if (quickActionObj?.usesSlider) {
      setSliderAction(quickActionObj);
      setShowSlider(true);
      return;
    }

    const vampMsg = { from: 'vampire', text, heat: 0 };
    setMessages(prev => [...prev, vampMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const response = getResponse(action, heatLevel);
      setMessages(prev => [...prev, response]);
      setHeatLevel(prev => Math.min(100, prev + response.heat));
      setIsTyping(false);
    }, 1500 + Math.random() * 1500);
  };

  const handleSliderFinish = async (edgeType, edgeCount, desperationLevel, bodyPart, touchingMultiple) => {
    setShowSlider(false);
    
    const vampMsg = { from: 'vampire', text: sliderAction.text, heat: 0 };
    setMessages(prev => [...prev, vampMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const bodyPartDesc = bodyPart === 'clit' ? 'rubbing my clit' :
                          bodyPart === 'dick' ? 'stroking my cock' :
                          bodyPart === 'dildo' ? 'fucking myself with my dildo' :
                          bodyPart === 'vibrator' ? 'using my vibrator' :
                          bodyPart === 'fingers' ? 'fingers deep inside' :
                          'touching myself';

      const responses = edgeType === 'edged' ? [
        { text: `fuck I edged ${edgeCount} times ${bodyPartDesc}\n\nI'm so desperate\n\nalmost came just thinking about you`, heat: 35 },
        { text: `been ${bodyPartDesc} for you\n\nedged over and over\n\nI need to cum so bad please`, heat: 38 }
      ] : [
        { text: `just came ${bodyPartDesc}\n\nmoaned your name so loud\n\nfuck that was intense`, heat: 32 },
        { text: `came so hard ${bodyPartDesc}\n\nwish you were here to see it\n\nstill shaking`, heat: 35 }
      ];

      const response = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, response]);
      setHeatLevel(prev => Math.min(100, prev + response.heat));
      setIsTyping(false);
    }, 2000);
  };

  const quickActions = heatLevel < 20 ? [
    { id: 'flirt', label: '😏 Flirt', text: 'You look so good...', action: 'flirt' },
    { id: 'compliment', label: '💕 Compliment', text: 'Can\'t stop thinking about you', action: 'flirt' },
    { id: 'tease', label: '😈 Tease', text: 'What are you wearing right now?', action: 'tease' }
  ] : heatLevel < 40 ? [
    { id: 'dirty', label: '🔥 Dirty', text: 'I want to touch you everywhere...', action: 'dirty' },
    { id: 'pic', label: '📸 Request pic', text: 'Send me a pic. Please.', action: 'pic_request' },
    { id: 'tease2', label: '😈 Tease more', text: 'Bet you\'re getting turned on right now', action: 'tease' }
  ] : heatLevel < 70 ? [
    { id: 'explicit', label: '💦 Explicit', text: 'I want to fuck you so bad right now', action: 'dirty' },
    { id: 'sendpic', label: '📷 Send pic', text: '*sends pic* 😈', action: 'send_pic' },
    { id: 'command', label: '👑 Touch yourself', text: 'Touch yourself. Tell me how it feels.', action: 'command', usesSlider: true },
    { id: 'video', label: '🎥 Request video', text: 'Record yourself for me.', action: 'video' }
  ] : [
    { id: 'mutual', label: '💕 Both touch', text: 'I\'m touching myself too. Let\'s do it together.', action: 'command', usesSlider: true },
    { id: 'edge', label: '⚡ Edge together', text: 'Get close with me. But don\'t cum yet.', action: 'edge', usesSlider: true },
    { id: 'allow', label: '✅ Cum together', text: 'Cum with me. Right now.', action: 'command', usesSlider: true },
    { id: 'comeover', label: '🏠 Come over', text: 'Get here. Now. I need you.', action: 'command' }
  ];

  const endSession = async () => {
    const finalHeat = heatLevel;
    const gain = Math.floor(finalHeat / 3) + 10;
    
    await base44.entities.Servant.update(servant.id, {
      relationship: Math.min((servant.relationship || 0) + gain, 100)
    });
    
    const summary = messages.slice(-3).map(m => m.text).join(' ... ');
    await base44.entities.NightLog.create({
      entry: `Sexting session with ${servant.name}. Heat level: ${finalHeat}%. ${summary}`,
      category: 'interaction',
      intensity: finalHeat > 60 ? 'significant' : 'moderate'
    });
    
    queryClient.invalidateQueries();
    onGainRelationship?.(gain);
    onClose();
  };

  if (!sessionStarted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-900 rounded-2xl p-6 max-w-md w-full text-center"
        >
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-bold text-white mb-2">Sext with {servant.name}</h2>
          <p className="text-gray-400 mb-6">Start a sexting session. Build heat. See where it goes.</p>
          <button
            onClick={startSession}
            className="bitlife-btn w-full py-3 rounded-xl font-medium"
          >
            Start Sexting
          </button>
        </motion.div>
      </motion.div>
    );
  }

  if (showSlider) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <div className="text-center mb-4">
            <p className="text-purple-400 text-sm">💬 Sexting... they're touching themselves for you</p>
          </div>
          <MasturbationSlider
            gender={servant.gender}
            context="sexting"
            vampireName={vampireState.vampire_name}
            onFinish={handleSliderFinish}
          />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col bg-black"
    >
      {/* Header */}
      <div className="bg-gray-900 p-4 border-b border-gray-800 flex justify-between items-center">
        <div>
          <h2 className="text-white font-medium">💬 {servant.name}</h2>
          <p className="text-xs text-gray-400">Sexting...</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-400">Heat</p>
            <p className={`text-sm font-bold ${
              heatLevel > 70 ? 'text-red-400' : 
              heatLevel > 40 ? 'text-orange-400' : 
              'text-purple-400'
            }`}>{heatLevel}%</p>
          </div>
          <button
            onClick={endSession}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.from === 'vampire' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.from === 'vampire'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-200'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{msg.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-800 rounded-2xl px-4 py-2">
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-gray-400 text-sm"
              >
                typing...
              </motion.p>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Heat indicator */}
      <div className="px-4 py-2 bg-gray-900/50">
        <div className="flex gap-2 items-center">
          <span className="text-xs text-gray-400">🔥</span>
          <div className="flex-1 bg-gray-800 rounded-full h-2">
            <motion.div
              animate={{ width: `${heatLevel}%` }}
              className={`h-2 rounded-full ${
                heatLevel > 70 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                heatLevel > 40 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                'bg-purple-500'
              }`}
            />
          </div>
          <span className="text-xs text-gray-400">{heatLevel}%</span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-gray-900 p-4 border-t border-gray-800">
        <div className="grid grid-cols-3 gap-2 mb-3">
          {quickActions.map(action => (
            <button
              key={action.id}
              onClick={() => sendMessage(action.text, action.action, action)}
              disabled={isTyping}
              className="bitlife-btn py-2 px-3 rounded-lg text-xs disabled:opacity-50"
            >
              {action.label}
            </button>
          ))}
        </div>

        {heatLevel > 80 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={async () => {
              const finalMsg = { from: 'vampire', text: 'Come over. Now.', heat: 0 };
              setMessages(prev => [...prev, finalMsg]);
              setIsTyping(true);
              
              setTimeout(() => {
                const response = { from: 'servant', text: 'omg yes\n\non my way 🏃💨\n\nbe there in 5', heat: 0 };
                setMessages(prev => [...prev, response]);
                setIsTyping(false);
                
                setTimeout(() => {
                  endSession();
                }, 2000);
              }, 1000);
            }}
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-3 rounded-xl font-bold"
          >
            💋 Tell them to come over NOW
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}