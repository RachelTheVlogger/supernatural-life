import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, MessageCircle, Camera, Heart, User, Music, Home as HomeIcon, Search, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function HumanPhone({ human, onClose }) {
  const [activeApp, setActiveApp] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const queryClient = useQueryClient();

  const { data: vampires = [] } = useQuery({
    queryKey: ['vampireState'],
    queryFn: () => base44.entities.VampireState.list()
  });

  const vampire = vampires[0];

  const contacts = [
    { id: 'mom', name: 'Mom', type: 'family' },
    { id: 'friend1', name: 'Best Friend', type: 'friend' },
    { id: 'friend2', name: 'Work Friend', type: 'friend' },
    { id: 'ex', name: 'Ex', type: 'ex' },
  ];

  if (vampire && (human.vampire_encounters || 0) > 0) {
    contacts.push({ id: 'vampire', name: vampire.vampire_name, type: 'vampire' });
  }

  const apps = [
    { id: 'messages', name: 'Messages', icon: MessageCircle, color: 'bg-green-500' },
    { id: 'calls', name: 'Phone', icon: Phone, color: 'bg-blue-500' },
    { id: 'dating', name: 'Tinder', icon: Heart, color: 'bg-pink-500' },
    { id: 'social', name: 'Instagram', icon: Camera, color: 'bg-purple-500' },
    { id: 'music', name: 'Spotify', icon: Music, color: 'bg-green-600' },
  ];

  const startConversation = (contact) => {
    setCurrentConversation(contact);
    // Load existing messages
    const existing = messages.filter(m => m.contactId === contact.id);
    if (existing.length === 0) {
      // Start with a message from them
      const greetings = {
        mom: "Hey honey, haven't heard from you in a while. Everything okay?",
        friend1: "Yo! We still on for this weekend?",
        friend2: "Did you see what happened at work today? Wild.",
        ex: "Hey... can we talk?",
        vampire: "I've been thinking about you.",
      };
      setMessages([{
        id: Date.now(),
        contactId: contact.id,
        from: 'them',
        text: greetings[contact.id] || "Hey",
        timestamp: new Date()
      }]);
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim() || !currentConversation) return;

    const newMsg = {
      id: Date.now(),
      contactId: currentConversation.id,
      from: 'you',
      text: text,
      timestamp: new Date()
    };

    setMessages([...messages, newMsg]);
    setNewMessage('');

    // Generate response after delay
    setTimeout(async () => {
      let response = '';
      let obsessionChange = 0;
      let awarenessChange = 0;

      if (currentConversation.id === 'vampire') {
        const responses = [
          "I've been thinking about you too.",
          "We should meet. Tonight.",
          "You're always on my mind.",
          "I can't stop thinking about you either.",
          "Come over. I want to see you.",
        ];
        response = responses[Math.floor(Math.random() * responses.length)];
        obsessionChange = Math.floor(Math.random() * 10) + 5;
        awarenessChange = Math.floor(Math.random() * 5) + 2;
      } else if (currentConversation.id === 'mom') {
        response = "That's good to hear. Love you sweetie!";
        obsessionChange = -2; // Grounding effect
      } else if (currentConversation.id === 'friend1') {
        response = "Yeah! Can't wait. You seem distracted lately tho, everything cool?";
        obsessionChange = -3;
      } else if (currentConversation.id === 'ex') {
        response = "I miss you. Can we try again?";
      } else {
        response = "Haha yeah for sure";
      }

      const reply = {
        id: Date.now(),
        contactId: currentConversation.id,
        from: 'them',
        text: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, reply]);

      if (obsessionChange !== 0 || awarenessChange !== 0) {
        await base44.entities.Human.update(human.id, {
          obsession_level: Math.max(0, Math.min(100, (human.obsession_level || 0) + obsessionChange)),
          awareness_level: Math.max(0, Math.min(100, (human.awareness_level || 0) + awarenessChange))
        });

        await base44.entities.NightLog.create({
          entry: `${human.name} texted ${currentConversation.name}`,
          category: 'interaction',
          intensity: 'subtle'
        });

        queryClient.invalidateQueries();
      }
    }, 2000);
  };

  const makeCall = async (contact) => {
    let outcome = '';
    let obsessionChange = 0;

    if (contact.id === 'vampire') {
      const outcomes = [
        `You called ${vampire.vampire_name}.\n\nThey picked up immediately.\n\n"I was hoping you'd call," they said.\n\nTheir voice... you could listen forever.`,
        `${vampire.vampire_name} answered.\n\n"Miss me already?" they teased.\n\nYou talked for hours. Or was it minutes?\n\nTime doesn't work right around them.`,
        `You called them. Heart racing.\n\nThey didn't pick up.\n\nThen a text: "Busy. Call you back tonight."\n\nYou're already counting the minutes.`,
      ];
      outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
      obsessionChange = Math.floor(Math.random() * 15) + 10;
    } else if (contact.id === 'mom') {
      outcome = `Called Mom.\n\nShe was happy to hear from you.\n\nAsked about work, life, if you're eating.\n\nNormal mom stuff. It was... nice.`;
      obsessionChange = -5;
    } else if (contact.id === 'friend1') {
      outcome = `Long call with your best friend.\n\nLaughed. Gossiped. Normal stuff.\n\nThey asked if you're seeing anyone.\n\nYou changed the subject.`;
      obsessionChange = -4;
    } else {
      outcome = `Quick call with ${contact.name}.\n\nCatched up. Made plans.\n\nIt was fine.`;
      obsessionChange = -2;
    }

    await base44.entities.Human.update(human.id, {
      obsession_level: Math.max(0, Math.min(100, (human.obsession_level || 0) + obsessionChange))
    });

    await base44.entities.NightLog.create({
      entry: `${human.name} called ${contact.name}`,
      category: 'interaction',
      intensity: 'moderate'
    });

    queryClient.invalidateQueries();
    alert(outcome);
  };

  const conversationMessages = messages.filter(m => m.contactId === currentConversation?.id);

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
        className="bg-gray-900 rounded-3xl p-0 w-full max-w-sm h-[700px] border-8 border-gray-800 overflow-hidden"
      >
        {/* Phone notch */}
        <div className="bg-black h-8 rounded-b-2xl mx-auto w-32 mb-4" />

        {/* Status bar */}
        <div className="flex justify-between items-center px-6 py-2 text-white text-xs mb-4">
          <span>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          <div className="flex items-center gap-2">
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!activeApp ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-6"
            >
              <div className="text-center mb-6">
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white mb-4"
                >
                  <X className="w-6 h-6 mx-auto" />
                </button>
                <h2 className="text-white text-2xl font-bold">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {apps.map(app => (
                  <button
                    key={app.id}
                    onClick={() => setActiveApp(app.id)}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className={`${app.color} rounded-2xl p-4 w-16 h-16 flex items-center justify-center`}>
                      <app.icon className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-white text-xs">{app.name}</span>
                  </button>
                ))}
              </div>

              {(human.obsession_level || 0) > 50 && vampire && (
                <div className="mt-6 bg-purple-950/40 border border-purple-500/30 rounded-xl p-3">
                  <p className="text-purple-300 text-sm text-center">
                    {vampire.vampire_name} is online...
                  </p>
                </div>
              )}
            </motion.div>
          ) : activeApp === 'messages' && !currentConversation ? (
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="px-6 h-full"
            >
              <div className="flex justify-between items-center mb-6">
                <button onClick={() => setActiveApp(null)} className="text-blue-500">
                  Back
                </button>
                <h2 className="text-white text-xl font-bold">Messages</h2>
                <div className="w-12" />
              </div>

              <div className="space-y-2">
                {contacts.map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => startConversation(contact)}
                    className={`w-full bg-gray-800 rounded-xl p-4 text-left ${
                      contact.type === 'vampire' ? 'border-2 border-purple-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        contact.type === 'vampire' ? 'bg-purple-600' :
                        contact.type === 'family' ? 'bg-blue-600' :
                        contact.type === 'friend' ? 'bg-green-600' :
                        'bg-gray-600'
                      }`}>
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-bold">{contact.name}</p>
                        <p className="text-gray-400 text-sm">Tap to message</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : activeApp === 'messages' && currentConversation ? (
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="flex flex-col h-full"
            >
              <div className="flex justify-between items-center px-6 py-4 bg-gray-800">
                <button onClick={() => setCurrentConversation(null)} className="text-blue-500">
                  Back
                </button>
                <h2 className="text-white font-bold">{currentConversation.name}</h2>
                <Phone className="w-5 h-5 text-blue-500" onClick={() => makeCall(currentConversation)} />
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {conversationMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.from === 'you' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        msg.from === 'you'
                          ? 'bg-blue-500 text-white'
                          : currentConversation.type === 'vampire'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-white'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-4 py-4 bg-gray-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage(newMessage)}
                    placeholder="Message..."
                    className="flex-1 bg-gray-700 text-white rounded-full px-4 py-2 focus:outline-none"
                  />
                  <button
                    onClick={() => sendMessage(newMessage)}
                    className="bg-blue-500 rounded-full p-2"
                  >
                    <MessageCircle className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : activeApp === 'calls' ? (
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="px-6 h-full"
            >
              <div className="flex justify-between items-center mb-6">
                <button onClick={() => setActiveApp(null)} className="text-blue-500">
                  Back
                </button>
                <h2 className="text-white text-xl font-bold">Phone</h2>
                <div className="w-12" />
              </div>

              <div className="space-y-2">
                {contacts.map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => makeCall(contact)}
                    className={`w-full bg-gray-800 rounded-xl p-4 ${
                      contact.type === 'vampire' ? 'border-2 border-purple-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          contact.type === 'vampire' ? 'bg-purple-600' :
                          contact.type === 'family' ? 'bg-blue-600' :
                          contact.type === 'friend' ? 'bg-green-600' :
                          'bg-gray-600'
                        }`}>
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-white font-bold">{contact.name}</p>
                      </div>
                      <Phone className="w-5 h-5 text-blue-500" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="px-6 h-full flex items-center justify-center"
            >
              <div className="text-center">
                <button onClick={() => setActiveApp(null)} className="text-blue-500 mb-4">
                  Back
                </button>
                <p className="text-gray-400">App coming soon...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Home button */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <button
            onClick={() => activeApp ? setActiveApp(null) : onClose()}
            className="w-16 h-1 bg-white rounded-full"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}