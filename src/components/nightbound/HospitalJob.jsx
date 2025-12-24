import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, AlertTriangle, CheckCircle, MessageCircle, Send, Syringe, Coffee, Video, DollarSign, Camera } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const HOSPITAL_SCENES = [
  {
    title: "Blood Sample Collection",
    description: "You're drawing blood samples from patients. Needle punctures skin. Dark red fills the vial. Twenty samples collected. So warm in your hands. You could pocket one. No one counts.",
    temptation: "Just one vial. Drink it in the bathroom. Quick energy. No one harmed.",
    humanity_cost: 12,
    outcomes: {
      resist: "You processed every sample correctly. Sent them to the lab. The vials stayed sealed. Professional.",
      give_in: "You pocketed a vial. Drank it in the bathroom stall. Hospital blood. Clinical. Wrong. But it worked."
    }
  },
  {
    title: "Trauma Patient",
    description: "Motorcycle accident. Patient bleeding from neck wound. You're alone in trauma bay. Fresh hot blood pooling. Fangs extend automatically.",
    temptation: "Unconscious. Dying anyway. Just a taste. Won't remember.",
    humanity_cost: 25,
    outcomes: {
      resist: "Called for help. Applied pressure. Saved them. Hunger screamed but you held on.",
      give_in: "Fed from the wound. Just a little. They survived. Barely. You know what you did."
    }
  },
  {
    title: "Morgue Access",
    description: "Fresh bodies from tonight. Blood still liquid for hours. No heartbeat but warm enough. No one would miss what's already dead.",
    temptation: "Already dead. Not murder. Just practical. Efficient.",
    humanity_cost: 20,
    outcomes: {
      resist: "Stayed upstairs. Did your rounds. Bodies untouched. Lines you won't cross.",
      give_in: "Went downstairs. Fed from a corpse. Cold blood. Wrong. But it filled you."
    }
  },
  {
    title: "Blood Bag Inventory",
    description: "Restocking blood bank. Refrigerator full of fresh donations. Type O negative. Plastic bags condensation-slick. Easy to slip one into your pocket.",
    temptation: "One bag. No one counts. Drink it in supply closet.",
    humanity_cost: 15,
    outcomes: {
      resist: "Closed the fridge. Hands shaking. Fangs aching. But you did it. Still in control.",
      give_in: "Took a bag. Hid in supply closet. Punctured with teeth. Warm blood flooded mouth."
    }
  },
  {
    title: "IV Line Access",
    description: "Patient on heavy sedation. IV line direct to vein. You're checking fluids. Could easily tap the line. Draw some off. They wouldn't wake.",
    temptation: "So simple. Just use a syringe. Small amount. Medical procedure. Sort of.",
    humanity_cost: 18,
    outcomes: {
      resist: "Checked the IV. Left it alone. Did your job. That's all.",
      give_in: "Drew blood from their IV. Drank from the syringe. Medical vampire. Is that better or worse?"
    }
  },
  {
    title: "Coworker Injury",
    description: "Dr. Martinez cut her hand badly. Deep laceration. Blood flowing. Asks you to help bandage. Alone in break room. Smells incredible.",
    temptation: "Get close. Smell it. Maybe taste from your fingers after. Just the scent...",
    humanity_cost: 10,
    outcomes: {
      resist: "Bandaged quickly. Professionally. Kept distance. Normal interaction.",
      give_in: "Got too close. Breathed deep. Licked fingers after. She saw your pupils blown wide."
    }
  },
  {
    title: "Night Isolation",
    description: "3 AM. Empty halls. Comatose patient room 304. No cameras. No witnesses. Thought building all shift.",
    temptation: "This is why you took this job. Access. Privacy. Victims who can't remember.",
    humanity_cost: 30,
    outcomes: {
      resist: "Walked past. Did your job. Checked other patients. Not a monster yet.",
      give_in: "Entered. Locked door. Fed from IV line. Left alive but marked. This is who you are."
    }
  },
  {
    title: "Seduction Opportunity",
    description: "Nurse flirts in break room. Attracted to you. Easy to seduce. Take somewhere private. Feed while distracted by pleasure.",
    temptation: "Consensual-ish. They want you. You want blood. Everyone gets something.",
    humanity_cost: 12,
    outcomes: {
      resist: "Deflected politely. Professional. Won't mix feeding with sex. Not yet.",
      give_in: "Took them to on-call room. Made out. Bit neck during. Hickey. Fed. They enjoyed it."
    }
  }
];

export default function HospitalJob({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [shiftPhase, setShiftPhase] = useState('start'); // start, task, break, scene
  const [currentScene, setCurrentScene] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [scenesCompleted, setScenesCompleted] = useState(0);

  const { data: servants = [] } = useQuery({
    queryKey: ['servants'],
    queryFn: () => base44.entities.Servant.list()
  });

  const servant = servants[0];

  const { data: messages = [] } = useQuery({
    queryKey: ['hospital-messages', servant?.id],
    queryFn: () => base44.entities.Message.filter({ servant_id: servant?.id }, '-created_date', 20),
    enabled: !!servant && showChat,
    staleTime: 3000
  });

  const { data: onlyfangsProfile } = useQuery({
    queryKey: ['onlyfangs-profile', servant?.id],
    queryFn: async () => {
      const profiles = await base44.entities.OnlyFangsProfile.filter({ servant_id: servant?.id });
      return profiles[0];
    },
    enabled: !!servant && showChat
  });

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !servant) return;

    const userMessage = messageInput;
    setMessageInput('');

    await base44.entities.Message.create({
      servant_id: servant.id,
      content: userMessage,
      sender: 'vampire'
    });

    queryClient.invalidateQueries(['hospital-messages']);

    setTimeout(async () => {
      const recentMsgs = messages.slice(-8).map(m => 
        `${m.sender === 'vampire' ? 'You' : servant.name}: ${m.content}`
      ).join('\n');

      const hasOnlyFangs = !!onlyfangsProfile;
      const onlyfangsContext = hasOnlyFangs 
        ? `\n\nYou run an OnlyFangs account together (${onlyfangsProfile.is_couple_account ? 'couples account' : 'solo account'}). You can discuss: filming ideas, PPV content, fan interactions, new video concepts, livestream plans, etc. Be explicit and creative about content ideas.`
        : '';

      const variantTraits = {
        devoted: 'deeply devoted, soft, eager, emotionally open, affectionate',
        defiant: 'resistant but fascinated, conflicted, tsundere',
        dreamer: 'detached, poetic, ethereal, dreamy'
      };

      const relContext = (servant.relationship || 0) >= 80 ? 'deeply bound' : 
                        (servant.relationship || 0) >= 60 ? 'trusting' :
                        (servant.relationship || 0) >= 40 ? 'warming up' : 'cautious';

      const prompt = `You are ${servant.name}, servant to a vampire working night shift at hospital. Personality: ${variantTraits[servant.variant]}. Bond: ${relContext}.${onlyfangsContext}

Recent texts:
${recentMsgs}
Vampire: ${userMessage}

Respond naturally as ${servant.name}. 1-3 sentences. React to what they said. Be authentic. If they mention OnlyFangs, discuss content ideas explicitly. If flirty/sexual, respond accordingly based on bond. Be real and in-character.`;

      try {
        const response = await base44.integrations.Core.InvokeLLM({ prompt });
        await base44.entities.Message.create({
          servant_id: servant.id,
          content: response,
          sender: 'servant'
        });
      } catch {
        await base44.entities.Message.create({
          servant_id: servant.id,
          content: "Miss you. Stay safe.",
          sender: 'servant'
        });
      }

      queryClient.invalidateQueries(['hospital-messages']);
    }, 1500 + Math.random() * 2000);
  };

  const startTask = () => {
    const tasks = [
      { action: 'draw_blood', text: 'Drawing blood samples from patients...' },
      { action: 'check_vitals', text: 'Checking vital signs on floor 3...' },
      { action: 'restock', text: 'Restocking medical supplies...' },
      { action: 'assist', text: 'Assisting with patient care...' }
    ];
    const task = tasks[Math.floor(Math.random() * tasks.length)];
    
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      if (Math.random() > 0.5) {
        const scene = HOSPITAL_SCENES[Math.floor(Math.random() * HOSPITAL_SCENES.length)];
        setCurrentScene(scene);
        setShiftPhase('scene');
      } else {
        setShiftPhase('break');
      }
    }, 2500);
  };

  const handleSceneChoice = async (resist) => {
    setProcessing(true);
    
    setTimeout(async () => {
      const result = resist ? 'resist' : 'give_in';
      const outcomeText = currentScene.outcomes[result];
      
      const humanityChange = resist ? 0 : -currentScene.humanity_cost;
      const newHumanity = Math.max(0, Math.min(100, (vampireState.humanity || 50) + humanityChange));
      
      const hungerStates = ['sated', 'calm', 'lingering', 'heightened', 'restless'];
      const currentIndex = hungerStates.indexOf(vampireState.hunger_state);
      const newHungerState = !resist && currentIndex > 0 
        ? hungerStates[Math.max(0, currentIndex - 2)]
        : vampireState.hunger_state;
      
      let moralPath = newHumanity >= 70 ? 'humane' : 
                     newHumanity >= 40 ? 'balanced' :
                     newHumanity >= 15 ? 'ruthless' : 'monster';
      
      await base44.entities.VampireState.update(vampireState.id, {
        humanity: newHumanity,
        moral_path: moralPath,
        hunger_state: newHungerState
      });
      
      await base44.entities.NightLog.create({
        entry: `Hospital: ${outcomeText}`,
        category: resist ? 'observation' : 'feeding',
        intensity: resist ? 'subtle' : 'significant'
      });
      
      queryClient.invalidateQueries();
      
      setOutcome({ text: outcomeText, resisted: resist });
      setProcessing(false);
      
      const completed = scenesCompleted + 1;
      setScenesCompleted(completed);
      
      setTimeout(() => {
        setOutcome(null);
        setCurrentScene(null);
        if (completed >= 3) {
          onClose();
        } else {
          setShiftPhase('break');
        }
      }, 3500);
    }, 2000);
  };

  const handleBreak = () => {
    setShowChat(true);
  };

  const endBreak = () => {
    setShowChat(false);
    setShiftPhase('task');
    startTask();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full border border-red-900/30 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-400" />
            Night Shift
          </h2>
          <div className="text-gray-400 text-sm">
            Scene {scenesCompleted}/3
          </div>
        </div>

        <AnimatePresence mode="wait">
          {shiftPhase === 'start' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <p className="text-gray-300">
                Night shift at the hospital. Empty halls. Unconscious patients. Blood everywhere.
              </p>
              <p className="text-gray-400 text-sm italic">
                This job keeps you close to what you need. But tests your control every night.
              </p>
              <button
                onClick={() => {
                  setShiftPhase('task');
                  startTask();
                }}
                className="w-full bitlife-btn py-4 rounded-xl text-lg font-medium"
              >
                Start Shift
              </button>
            </motion.div>
          )}

          {shiftPhase === 'task' && processing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-5xl mb-4"
              >
                <Syringe className="w-12 h-12 mx-auto text-red-400" />
              </motion.div>
              <p className="text-gray-400">Working...</p>
            </motion.div>
          )}

          {shiftPhase === 'break' && !showChat && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="bg-gray-800 rounded-xl p-4 border border-purple-900/30">
                <Coffee className="w-8 h-8 text-purple-400 mb-2" />
                <h3 className="text-white font-bold mb-2">Break Time</h3>
                <p className="text-gray-400 text-sm">15 minutes. What will you do?</p>
              </div>

              <div className="grid gap-3">
                {servant && (
                  <button
                    onClick={handleBreak}
                    className="bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Text {servant.name}
                  </button>
                )}
                <button
                  onClick={endBreak}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-xl transition-colors"
                >
                  Skip Break - Back to Work
                </button>
              </div>
            </motion.div>
          )}

          {shiftPhase === 'break' && showChat && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="bg-gray-800 rounded-xl p-4 max-h-64 overflow-y-auto space-y-2">
                {messages.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">Start conversation...</p>
                ) : (
                  messages.slice(-10).map(msg => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: msg.sender === 'vampire' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${msg.sender === 'vampire' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                          msg.sender === 'vampire'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 text-gray-200'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {onlyfangsProfile && (
                <div className="bg-pink-950/30 border border-pink-800/30 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Camera className="w-4 h-4 text-pink-400" />
                    <span className="text-pink-400 text-sm font-medium">OnlyFangs Ideas</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setMessageInput("Want to film something tonight after my shift?")}
                      className="bg-pink-900/40 hover:bg-pink-900/60 text-pink-300 text-xs py-2 rounded-lg transition-colors"
                    >
                      📹 Film Together
                    </button>
                    <button
                      onClick={() => setMessageInput("What content do you think fans want next?")}
                      className="bg-purple-900/40 hover:bg-purple-900/60 text-purple-300 text-xs py-2 rounded-lg transition-colors"
                    >
                      💭 Brainstorm
                    </button>
                    <button
                      onClick={() => setMessageInput("Should we do a PPV message? What would you tease?")}
                      className="bg-red-900/40 hover:bg-red-900/60 text-red-300 text-xs py-2 rounded-lg transition-colors"
                    >
                      💵 PPV Ideas
                    </button>
                    <button
                      onClick={() => setMessageInput("Feeling creative. Describe what you'd want to film...")}
                      className="bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-300 text-xs py-2 rounded-lg transition-colors"
                    >
                      🎨 Get Explicit
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Text them..."
                  className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-2 text-sm outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl px-4 py-2 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={endBreak}
                className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-xl text-sm transition-colors"
              >
                End Break
              </button>
            </motion.div>
          )}

          {shiftPhase === 'scene' && !outcome && !processing && currentScene && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="bg-black/40 rounded-xl p-4 border border-red-900/30">
                <h3 className="text-white font-bold mb-2">{currentScene.title}</h3>
                <p className="text-gray-300 mb-4">{currentScene.description}</p>
                <p className="text-red-400 italic text-sm">{currentScene.temptation}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleSceneChoice(true)}
                  className="bg-green-950/40 hover:bg-green-950/60 border border-green-800/50 text-green-300 py-4 rounded-xl transition-colors font-medium"
                >
                  Resist
                </button>
                <button
                  onClick={() => handleSceneChoice(false)}
                  className="bg-red-950/40 hover:bg-red-950/60 border border-red-800/50 text-red-300 py-4 rounded-xl transition-colors font-medium"
                >
                  Give In
                </button>
              </div>

              <p className="text-gray-500 text-xs text-center">
                Giving in: -{currentScene.humanity_cost} humanity, reduces hunger
              </p>
            </motion.div>
          )}

          {outcome && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-4 rounded-xl border ${
                outcome.resisted 
                  ? 'bg-green-950/20 border-green-800/30' 
                  : 'bg-red-950/20 border-red-800/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {outcome.resisted ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                )}
                <h3 className={`font-bold ${outcome.resisted ? 'text-green-400' : 'text-red-400'}`}>
                  {outcome.resisted ? 'Resisted' : 'Gave In'}
                </h3>
              </div>
              <p className="text-gray-300">{outcome.text}</p>
            </motion.div>
          )}

          {processing && shiftPhase === 'scene' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <p className="text-gray-400">...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}