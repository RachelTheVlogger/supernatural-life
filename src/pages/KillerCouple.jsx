import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Skull, Home, Coffee, Book, Moon, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const COUPLE_ACTIVITIES = {
  domestic: [
    { id: 'breakfast', label: '☕ Make breakfast together', outcome: 'You cook eggs. They brew coffee. Domestic bliss. Blood still under their nails from last night. You don\'t mention it. Neither do they.' },
    { id: 'netflix', label: '📺 Watch true crime docs', outcome: 'You cuddle on the couch watching a documentary about a serial killer. "They caught him because he got sloppy," you say. "We won\'t," they whisper back.' },
    { id: 'grocery', label: '🛒 Grocery shopping', outcome: 'Normal couple. Normal cart. Normal lives. The cashier smiles at you both. If only they knew what you hide in the storage unit.' },
    { id: 'dinner', label: '🍝 Cook dinner together', outcome: 'They chop vegetables. You season the meat. Dancing around the kitchen. A murder weapon sits in the dishwasher. You kiss between courses.' }
  ],
  obsession: [
    { id: 'stare', label: '👁️ Watch them sleep', outcome: 'You watch them breathe. In and out. They\'re the only person you\'d never hurt. The only person who truly sees you. They wake up, smile. "Were you watching me again?" "Always."' },
    { id: 'love_talk', label: '💕 Confess your love', outcome: '"I love you," you say. "I love you more," they counter. "I\'d kill for you." "I already have," they smile. Perfect love exists. You found it.' },
    { id: 'jealous', label: '😤 Get possessive', outcome: 'Someone flirted with them today. They tell you about it, testing. Your jaw clenches. "Mine," you growl. They grin. "Only yours. Always." Crisis averted.' },
    { id: 'protect', label: '🛡️ Swear to protect them', outcome: '"If anyone ever tried to hurt you..." you start. They take your hand. "I know. And if anyone hurt you, I\'d make them disappear." You believe them. They would.' }
  ],
  killing: [
    { id: 'hunt_together', label: '🎯 Hunt together', outcome: 'You stalk your prey as a team. They distract. You strike. Perfect synchronization. Two killers. One heart. The body disposal is almost romantic.' },
    { id: 'cover', label: '🧹 Clean up their mess', outcome: 'They got careless. Left evidence. You find it before the cops do. Love is cleaning up blood at 3 AM without asking questions.' },
    { id: 'trophy', label: '📸 Share trophies', outcome: 'They show you a photo of their latest kill. You show them yours. Trading stories like other couples trade vacation photos. This is your intimacy.' },
    { id: 'plan', label: '🗺️ Plan next kill together', outcome: 'Sitting at the kitchen table with coffee and murder plans. They point out flaws in your approach. You refine theirs. Partnership perfected.' }
  ],
  dark_romance: [
    { id: 'kill_for', label: '🔪 Kill someone who hurt them', outcome: 'They mention someone who wronged them. You don\'t need details. Three days later, that person is gone. They know it was you. The kiss they give you says thank you.' },
    { id: 'matching_scars', label: '🩸 Matching scars ceremony', outcome: 'You cut matching marks into your skin. Blood mingles. "Now we\'re bonded forever," they whisper. Pain and love intertwined. Perfect.' },
    { id: 'secret_keeper', label: '🤐 Share your darkest secret', outcome: 'You tell them about your first kill. The one before you met. They don\'t flinch. They understand. "Mine was messy too," they admit. You\'re home.' },
    { id: 'storage_unit', label: '🔑 Show them the storage unit', outcome: 'The place where you keep everything. Your darkest secrets. They walk in, look around. "It\'s perfect," they say. They mean it. No judgment. Only love.' }
  ],
  intimate: [
    { id: 'dangerous_kiss', label: '💋 Kiss with knife between you', outcome: 'The blade rests between your bodies. One wrong move could cut. But you trust each other completely. The danger makes it sweeter. Your lips meet. Perfect control.' },
    { id: 'blood_bath', label: '🛁 Bath after a kill', outcome: 'Water runs pink. You wash blood from their hair. They trace old scars on your skin. This is intimacy others could never understand.' },
    { id: 'confess_kill', label: '🗣️ Describe your kills to each other', outcome: 'Lying in bed, you tell each other about your hunts. Every detail. The fear in their eyes. The moment they stopped breathing. It\'s foreplay for people like you.' },
    { id: 'no_secrets', label: '🔓 Promise no secrets', outcome: '"No more lies. Not between us." You both swear it. Every kill. Every urge. Every dark thought. You\'ll share it all. True intimacy is terrifying.' }
  ]
};

export default function KillerCouple() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState(null);

  const handleActivity = async (activity) => {
    setProcessing(true);
    
    setTimeout(async () => {
      try {
        setOutcome(activity.outcome);
        
        // Log the interaction
        await base44.entities.NightLog.create({
          entry: activity.outcome,
          category: 'interaction',
          intensity: 'significant'
        });

        queryClient.invalidateQueries();
        
        setTimeout(() => {
          setProcessing(false);
          setOutcome(null);
        }, 4000);
      } catch (e) {
        console.error('Failed to process activity:', e);
        setProcessing(false);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-950 via-red-950 to-black p-6 relative overflow-hidden">
      {/* Blood drops ambient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-red-600/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <button
          onClick={() => navigate(createPageUrl('Home'))}
          className="text-rose-300 hover:text-rose-200 mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-red-400" />
            <h1 className="text-4xl font-bold text-rose-100">You & Them</h1>
            <Skull className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-rose-300 italic">Two killers. One love. No secrets.</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-black/40 backdrop-blur-sm border border-rose-500/30 rounded-2xl p-6 mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-rose-400 text-sm">Bond</p>
              <p className="text-rose-100 text-2xl font-bold">100%</p>
            </div>
            <div className="text-center">
              <p className="text-rose-400 text-sm">Kills Together</p>
              <p className="text-rose-100 text-2xl font-bold">17</p>
            </div>
            <div className="text-center">
              <p className="text-rose-400 text-sm">Secrets Shared</p>
              <p className="text-rose-100 text-2xl font-bold">∞</p>
            </div>
          </div>
        </motion.div>

        {/* Activities by category */}
        <div className="space-y-6">
          {Object.entries(COUPLE_ACTIVITIES).map(([category, activities], catIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + catIndex * 0.1 }}
            >
              <h2 className="text-rose-200 font-bold text-lg mb-3 capitalize">
                {category === 'killing' ? '🔪 The Work' : 
                 category === 'obsession' ? '💕 Obsessive Love' :
                 category === 'dark_romance' ? '🖤 Dark Romance' :
                 category === 'intimate' ? '💋 Intimacy' :
                 '🏠 Domestic Bliss'}
              </h2>
              <div className="grid gap-3">
                {activities.map((activity, i) => (
                  <motion.button
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + catIndex * 0.1 + i * 0.05 }}
                    onClick={() => handleActivity(activity)}
                    disabled={processing}
                    className="bg-gradient-to-r from-red-950/60 to-rose-950/60 hover:from-red-950/80 hover:to-rose-950/80 disabled:opacity-50 border-2 border-rose-500/30 rounded-xl p-4 text-left transition-all"
                  >
                    <span className="text-rose-100 font-medium">{activity.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Processing overlay */}
      <AnimatePresence>
        {processing && !outcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl"
            >
              ❤️
            </motion.div>
          </motion.div>
        )}

        {outcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => {
              setProcessing(false);
              setOutcome(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-rose-950 to-red-950 border-2 border-rose-500/50 rounded-2xl p-8 max-w-2xl"
            >
              <p className="text-rose-100 text-lg leading-relaxed">{outcome}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}