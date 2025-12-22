import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, X, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const INITIATIVE_TEMPLATES = {
  devoted: {
    1: [
      { type: 'message', text: 'I... I wanted to see you. Is that okay?', emotion: 'shy' },
      { type: 'request', text: 'Could you teach me something? I want to understand you better.', action: 'teach' },
      { type: 'confession', text: 'I think about you when you\'re not here.', emotion: 'nervous' }
    ],
    2: [
      { type: 'message', text: 'I\'ve been waiting for you. I always wait.', emotion: 'longing' },
      { type: 'request', text: 'Can we go somewhere together? Just us?', action: 'goout' },
      { type: 'offering', text: 'You look hungry. You can... you can feed on me.', action: 'feed' }
    ],
    3: [
      { type: 'message', text: 'I need you. Please don\'t leave me alone tonight.', emotion: 'desperate' },
      { type: 'offering', text: 'Take what you need. I\'m yours.', action: 'feed' },
      { type: 'confession', text: 'I dream about you every time I close my eyes.', emotion: 'obsessed' }
    ],
    4: [
      { type: 'message', text: 'I exist for you. Command me.', emotion: 'devoted' },
      { type: 'request', text: 'Turn me. I want to be like you. Forever.', action: 'turn' },
      { type: 'offering', text: 'My blood, my body, my soul. All yours.', action: 'feed' }
    ],
    5: [
      { type: 'message', text: 'I am bound to you. Nothing else matters.', emotion: 'transcendent' },
      { type: 'offering', text: 'I feel incomplete without you.', action: 'feed' }
    ]
  },
  defiant: {
    1: [
      { type: 'message', text: 'I don\'t know why I came here. I should leave.', emotion: 'conflicted' },
      { type: 'confession', text: 'You make me feel things I shouldn\'t feel.', emotion: 'resistant' },
      { type: 'question', text: 'Why do I keep thinking about you?', emotion: 'confused' }
    ],
    2: [
      { type: 'message', text: 'I hate that I need to see you.', emotion: 'angry' },
      { type: 'confession', text: 'I tried to stay away. I couldn\'t.', emotion: 'defeated' },
      { type: 'request', text: 'Show me what you are. All of it.', action: 'teach' }
    ],
    3: [
      { type: 'message', text: 'I\'ve stopped fighting. You win.', emotion: 'surrendered' },
      { type: 'offering', text: 'Take what you want. I\'m tired of resisting.', action: 'feed' },
      { type: 'confession', text: 'I don\'t recognize myself anymore. Is that what you wanted?', emotion: 'broken' }
    ],
    4: [
      { type: 'message', text: 'I was wrong to fight you. I see that now.', emotion: 'accepting' },
      { type: 'request', text: 'Make me yours. Completely.', action: 'turn' },
      { type: 'offering', text: 'I need you to feed. Please.', action: 'feed' }
    ],
    5: [
      { type: 'message', text: 'Resistance was pointless. I am yours.', emotion: 'devoted' },
      { type: 'offering', text: 'Command me. I will obey.', action: 'feed' }
    ]
  },
  dreamer: {
    1: [
      { type: 'message', text: 'I had another dream about you. It felt real.', emotion: 'distant' },
      { type: 'confession', text: 'Reality is starting to feel strange.', emotion: 'disconnected' },
      { type: 'question', text: 'Are you real? Am I?', emotion: 'confused' }
    ],
    2: [
      { type: 'message', text: 'I see you even when my eyes are closed.', emotion: 'drifting' },
      { type: 'confession', text: 'Time moves differently around you.', emotion: 'altered' },
      { type: 'request', text: 'Take me somewhere I\'ve never been.', action: 'goout' }
    ],
    3: [
      { type: 'message', text: 'I\'m more here with you than anywhere else.', emotion: 'fading' },
      { type: 'offering', text: 'I need to be near you. It\'s the only thing that feels real.', action: 'feed' },
      { type: 'confession', text: 'I\'m losing pieces of myself. I don\'t mind.', emotion: 'dissolving' }
    ],
    4: [
      { type: 'message', text: 'The world is just shadows. You\'re the only light.', emotion: 'transcendent' },
      { type: 'request', text: 'Make me like you. Let me live in your world.', action: 'turn' },
      { type: 'offering', text: 'Take me completely. I\'m already gone.', action: 'feed' }
    ],
    5: [
      { type: 'message', text: 'I exist in your shadow now. It\'s beautiful.', emotion: 'ethereal' },
      { type: 'offering', text: 'I am yours. In every reality.', action: 'feed' }
    ]
  }
};

export default function ServantInitiative({ servants, vampireState, onAction }) {
  const [activeInitiative, setActiveInitiative] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check for servant initiatives every 2-5 minutes
    const checkInitiatives = () => {
      if (servants.length === 0) return;
      
      // Higher obsession = more likely to initiate
      const eligibleServants = servants.filter(s => {
        const timeSinceInteraction = s.last_interaction 
          ? Date.now() - new Date(s.last_interaction).getTime() 
          : Infinity;
        
        // More obsessed servants reach out more frequently
        const cooldown = Math.max(120000, 600000 - (s.obsession_stage * 60000)); // 2-10 minutes
        return timeSinceInteraction > cooldown;
      });

      if (eligibleServants.length === 0) return;

      // Weighted random selection (higher relationship = more likely)
      const totalWeight = eligibleServants.reduce((sum, s) => sum + (s.relationship || 10), 0);
      let random = Math.random() * totalWeight;
      
      let selectedServant = null;
      for (const servant of eligibleServants) {
        random -= (servant.relationship || 10);
        if (random <= 0) {
          selectedServant = servant;
          break;
        }
      }

      if (!selectedServant) return;

      // Select appropriate initiative based on variant and stage
      const templates = INITIATIVE_TEMPLATES[selectedServant.variant]?.[selectedServant.obsession_stage] || [];
      if (templates.length === 0) return;

      const initiative = templates[Math.floor(Math.random() * templates.length)];
      
      setActiveInitiative({
        servant: selectedServant,
        ...initiative
      });
    };

    // Initial check after 30 seconds
    const initialTimer = setTimeout(checkInitiatives, 30000);
    
    // Periodic checks
    const interval = setInterval(checkInitiatives, 180000); // Every 3 minutes

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [servants]);

  const handleResponse = async (accept) => {
    if (!activeInitiative) return;

    const servant = activeInitiative.servant;
    
    if (accept && activeInitiative.action) {
      // Trigger the requested action
      onAction(servant, activeInitiative.action);
    }

    // Log the interaction
    const responseText = accept 
      ? `${servant.name} reached out to you. You answered their call.`
      : `${servant.name} reached out to you. You left them waiting.`;

    await base44.entities.NightLog.create({
      entry: responseText,
      category: 'interaction',
      intensity: 'moderate'
    });
    
    // Humanity impact - responding to servants is compassionate
    if (accept) {
      const vampireStates = await base44.entities.VampireState.list();
      const vampireState = vampireStates[0];
      if (vampireState) {
        const newHumanity = Math.max(0, Math.min(100, (vampireState.humanity ?? 50) + 2));
        let moral_path = 'balanced';
        if (newHumanity >= 75) moral_path = 'humane';
        else if (newHumanity >= 25) moral_path = 'balanced';
        else if (newHumanity >= 10) moral_path = 'ruthless';
        else moral_path = 'monster';
        
        await base44.entities.VampireState.update(vampireState.id, {
          humanity: newHumanity,
          moral_path: moral_path
        });
      }
    }

    // Update relationship based on response
    const relationshipChange = accept ? Math.floor(Math.random() * 3) + 2 : -5;
    const newRel = Math.max(0, Math.min(100, (servant.relationship || 0) + relationshipChange));
    
    await base44.entities.Servant.update(servant.id, {
      last_interaction: new Date().toISOString(),
      relationship: newRel,
      emotional_state: accept ? activeInitiative.emotion : 'hurt'
    });

    queryClient.invalidateQueries(['servants']);
    queryClient.invalidateQueries(['logs']);
    
    setActiveInitiative(null);
  };

  if (!activeInitiative) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-end md:items-center justify-center p-4 bg-black/70"
      >
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="bg-gradient-to-br from-gray-900 to-purple-950/40 rounded-2xl p-6 max-w-md w-full border-2 border-purple-500/50 relative"
        >
          <button
            onClick={() => setActiveInitiative(null)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-purple-900/50 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-bold">{activeInitiative.servant.name}</h3>
              <p className="text-gray-400 text-xs capitalize">{activeInitiative.emotion}</p>
            </div>
          </div>

          <div className="bg-black/40 rounded-xl p-4 mb-6">
            <p className="text-gray-200 italic leading-relaxed">
              "{activeInitiative.text}"
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleResponse(false)}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl py-3 transition-colors"
            >
              Ignore
            </button>
            <button
              onClick={() => handleResponse(true)}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl py-3 transition-colors flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4" />
              Respond
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}