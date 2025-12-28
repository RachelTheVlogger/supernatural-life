import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const DESIGNS = [
  { id: 'gothic', name: 'Gothic Dark', price: 25, time: 2, desc: 'Black coffins, crosses, bats' },
  { id: 'blood', name: 'Blood Drip', price: 30, time: 2, desc: 'Realistic blood effects' },
  { id: 'celestial', name: 'Moon & Stars', price: 28, time: 2, desc: 'Mystical celestial designs' },
  { id: 'floral', name: 'Dark Florals', price: 22, time: 2, desc: 'Black roses and vines' },
  { id: 'marble', name: 'Marble Glam', price: 35, time: 3, desc: 'Marble with gold accents' },
  { id: 'chrome', name: 'Chrome Mirror', price: 40, time: 3, desc: 'Reflective chrome finish' },
  { id: 'custom', name: 'Custom Design', price: 50, time: 4, desc: 'Personalized art' }
];

export default function NailWrapsCareer({ servant, onClose }) {
  const queryClient = useQueryClient();
  const [working, setWorking] = useState(false);
  const [outcome, setOutcome] = useState('');

  const { data: career = [] } = useQuery({
    queryKey: ['career', servant.id],
    queryFn: () => base44.entities.ServantCareer.filter({ servant_id: servant.id })
  });

  const servantCareer = career[0];
  const reputation = servantCareer?.nail_wrap_reputation || 0;
  const customers = servantCareer?.nail_wrap_customers || 0;
  const revenue = servantCareer?.nail_wrap_revenue || 0;

  const handleMakeWraps = async (design) => {
    setWorking(true);

    setTimeout(async () => {
      const quality = Math.random() > 0.3 ? 'great' : 'okay';
      const repGain = quality === 'great' ? Math.floor(Math.random() * 5) + 3 : Math.floor(Math.random() * 3) + 1;
      const tips = quality === 'great' ? Math.floor(Math.random() * 20) + 10 : Math.floor(Math.random() * 10);

      const outcomes = {
        great: [
          `Perfect application! Customer LOVES them. Posted on Instagram. You're getting tagged.`,
          `Flawless. Customer tipped extra. Said they're coming back and bringing friends.`,
          `Your best work yet. The design looks professional. Customer is thrilled.`,
          `Absolutely stunning. Customer can't stop staring at their nails. Word spreading.`,
          `10/10 execution. Customer wants to book their next appointment already.`
        ],
        okay: [
          `Good work. Customer satisfied. A few minor bubbles but they didn't mind.`,
          `Decent application. Customer happy enough. Room for improvement.`,
          `Not your best but not bad. Customer accepted them.`,
          `One nail slightly crooked but overall fine. Customer still paid.`
        ]
      };

      const result = outcomes[quality][Math.floor(Math.random() * outcomes[quality].length)];
      
      const updates = {
        nail_wrap_reputation: Math.min(100, reputation + repGain),
        nail_wrap_customers: customers + 1,
        nail_wrap_revenue: revenue + design.price + tips
      };

      if (servantCareer) {
        await base44.entities.ServantCareer.update(servantCareer.id, updates);
      } else {
        await base44.entities.ServantCareer.create({
          servant_id: servant.id,
          nail_wraps_active: true,
          ...updates
        });
      }

      await base44.entities.NightLog.create({
        entry: `${servant.name} completed ${design.name} nail wraps. ${result}`,
        category: 'interaction',
        intensity: 'subtle'
      });

      setOutcome(`${result}\n\nEarned: $${design.price + tips} (+${repGain} reputation)`);
      queryClient.invalidateQueries();

      setTimeout(() => {
        setWorking(false);
        setOutcome('');
      }, 3500);
    }, design.time * 1000);
  };

  const handlePractice = async () => {
    setWorking(true);

    setTimeout(async () => {
      const skillGain = Math.floor(Math.random() * 4) + 2;
      
      await base44.entities.ServantCareer.update(servantCareer.id, {
        nail_wrap_reputation: Math.min(100, reputation + skillGain)
      });

      const outcomes = [
        `Practiced application techniques. Getting smoother. Faster. Cleaner.`,
        `Experimented with new designs. Creativity flowing. Skills improving.`,
        `Watched tutorials. Learned new tips. Practice makes perfect.`,
        `Perfected your filing technique. Edges clean. Professional quality.`
      ];

      setOutcome(outcomes[Math.floor(Math.random() * outcomes.length)] + `\n\n+${skillGain} reputation`);
      queryClient.invalidateQueries();

      setTimeout(() => {
        setWorking(false);
        setOutcome('');
      }, 3000);
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
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-pink-950 to-purple-950 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative border-2 border-pink-500/50"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">💅 Nail Wraps Career</h2>
        <p className="text-pink-300 text-sm mb-6">Apply adhesive nail art stickers to customers' natural nails</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-black/40 rounded-lg p-3 border border-pink-500/30">
            <p className="text-pink-400 text-xs">Reputation</p>
            <p className="text-white font-bold">{reputation}/100</p>
          </div>
          <div className="bg-black/40 rounded-lg p-3 border border-pink-500/30">
            <p className="text-pink-400 text-xs">Customers</p>
            <p className="text-white font-bold">{customers}</p>
          </div>
          <div className="bg-black/40 rounded-lg p-3 border border-pink-500/30">
            <p className="text-pink-400 text-xs">Revenue</p>
            <p className="text-white font-bold">${revenue}</p>
          </div>
        </div>

        {outcome ? (
          <div className="bg-black/40 rounded-xl p-6 border border-pink-500/30">
            <p className="text-pink-100 leading-relaxed whitespace-pre-line">{outcome}</p>
          </div>
        ) : working ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <div className="text-6xl">💅</div>
            </motion.div>
            <p className="text-pink-300 mt-4">Working on nails...</p>
          </div>
        ) : (
          <div>
            <button
              onClick={handlePractice}
              className="w-full bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-xl p-4 mb-4 transition-colors"
            >
              <h3 className="text-white font-bold">✨ Practice Techniques</h3>
              <p className="text-gray-400 text-sm">Improve skills (no income)</p>
            </button>

            <h3 className="text-white font-bold mb-3">Available Designs</h3>
            <div className="space-y-2">
              {DESIGNS.map(design => (
                <button
                  key={design.id}
                  onClick={() => handleMakeWraps(design)}
                  className="w-full bg-pink-900/40 hover:bg-pink-900/60 border border-pink-500/30 rounded-xl p-4 text-left transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-white font-medium">{design.name}</h4>
                    <span className="text-green-400 font-bold">${design.price}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{design.desc}</p>
                  <p className="text-pink-400 text-xs mt-1">⏱️ {design.time}s</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}