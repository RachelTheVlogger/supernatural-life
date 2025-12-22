import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, AlertTriangle, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const HOSPITAL_SCENES = [
  {
    title: "Blood Donation Center",
    description: "You're restocking the blood bank. Bags of fresh blood, right there. So easy.",
    temptation: "Take a bag. No one would notice. Just one.",
    humanity_cost: 15,
    outcomes: {
      resist: "You closed the fridge door. Your hands shook. But you did it.",
      give_in: "You took a bag. Warm blood. Your secret shame. But god, it helped."
    }
  },
  {
    title: "Trauma Patient",
    description: "A patient is bleeding badly. You're alone with them. The scent is overwhelming.",
    temptation: "They're unconscious. Just a taste. They won't remember.",
    humanity_cost: 25,
    outcomes: {
      resist: "You called for help. Saved them. The hunger screamed but you held on.",
      give_in: "You fed. Just a little. They survived. You tell yourself it was nothing."
    }
  },
  {
    title: "Night Shift Isolation",
    description: "3 AM. Empty halls. A sleeping patient in room 304. No cameras. No witnesses.",
    temptation: "This is why you took this job. Admit it.",
    humanity_cost: 30,
    outcomes: {
      resist: "You walked past the room. Did your job. You're not a monster yet.",
      give_in: "You entered. Fed. Left them alive but changed. This is who you are now."
    }
  },
  {
    title: "Coworker's Cut",
    description: "Dr. Martinez cut her hand on broken glass. Blood drips as she asks for help.",
    temptation: "Help her. Get close. The scent of her blood...",
    humanity_cost: 10,
    outcomes: {
      resist: "You bandaged her hand quickly. Professional. She thanked you. You smiled back.",
      give_in: "You got too close. Breathed it in. She noticed your stare. Uncomfortable silence."
    }
  }
];

export default function HospitalJob({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [scene, setScene] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState(null);

  const startShift = () => {
    const randomScene = HOSPITAL_SCENES[Math.floor(Math.random() * HOSPITAL_SCENES.length)];
    setScene(randomScene);
  };

  const handleChoice = async (resist) => {
    setProcessing(true);
    
    setTimeout(async () => {
      const result = resist ? 'resist' : 'give_in';
      const outcomeText = scene.outcomes[result];
      
      // Update humanity
      const humanityChange = resist ? 0 : -scene.humanity_cost;
      const newHumanity = Math.max(0, Math.min(100, (vampireState.humanity || 50) + humanityChange));
      
      // Update hunger state if gave in
      const hungerStates = ['sated', 'calm', 'lingering', 'heightened', 'restless'];
      const currentHungerIndex = hungerStates.indexOf(vampireState.hunger_state);
      let newHungerState = vampireState.hunger_state;
      
      if (!resist && currentHungerIndex > 0) {
        newHungerState = hungerStates[Math.max(0, currentHungerIndex - 2)];
      }
      
      // Determine moral path
      let moralPath = 'balanced';
      if (newHumanity >= 70) moralPath = 'humane';
      else if (newHumanity >= 40) moralPath = 'balanced';
      else if (newHumanity >= 15) moralPath = 'ruthless';
      else moralPath = 'monster';
      
      await base44.entities.VampireState.update(vampireState.id, {
        humanity: newHumanity,
        moral_path: moralPath,
        hunger_state: newHungerState
      });
      
      await base44.entities.NightLog.create({
        entry: `Hospital shift: ${outcomeText}`,
        category: resist ? 'observation' : 'feeding',
        intensity: resist ? 'subtle' : 'significant'
      });
      
      queryClient.invalidateQueries(['vampireState']);
      queryClient.invalidateQueries(['logs']);
      
      setOutcome({ text: outcomeText, resisted: resist });
      setProcessing(false);
      
      setTimeout(() => {
        onClose();
      }, 4000);
    }, 2000);
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
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full border border-red-900/30"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-400" />
          Night Shift at the Hospital
        </h2>

        {!scene ? (
          <div className="space-y-4">
            <p className="text-gray-300">
              You work the night shift. Empty halls. Unconscious patients. Blood everywhere.
            </p>
            <p className="text-gray-400 text-sm italic">
              This job keeps you close to what you need. But it tests your control every single night.
            </p>
            <button
              onClick={startShift}
              className="w-full bitlife-btn py-4 rounded-xl text-lg font-medium"
            >
              Start Your Shift
            </button>
          </div>
        ) : outcome ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className={`p-4 rounded-xl border ${
              outcome.resisted 
                ? 'bg-green-950/20 border-green-800/30' 
                : 'bg-red-950/20 border-red-800/30'
            }`}>
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
            </div>
            <p className="text-gray-500 text-sm text-center">Shift ending...</p>
          </motion.div>
        ) : processing ? (
          <div className="text-center py-8">
            <p className="text-gray-400">...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-black/40 rounded-xl p-4 border border-red-900/30">
              <h3 className="text-white font-bold mb-2">{scene.title}</h3>
              <p className="text-gray-300 mb-4">{scene.description}</p>
              <p className="text-red-400 italic text-sm">{scene.temptation}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleChoice(true)}
                className="bg-green-950/40 hover:bg-green-950/60 border border-green-800/50 text-green-300 py-4 rounded-xl transition-colors font-medium"
              >
                Resist
              </button>
              <button
                onClick={() => handleChoice(false)}
                className="bg-red-950/40 hover:bg-red-950/60 border border-red-800/50 text-red-300 py-4 rounded-xl transition-colors font-medium"
              >
                Give In
              </button>
            </div>

            <p className="text-gray-500 text-xs text-center">
              Giving in reduces humanity by {scene.humanity_cost} but eases hunger
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}