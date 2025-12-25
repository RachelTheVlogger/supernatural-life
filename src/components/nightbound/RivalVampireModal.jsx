import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sword, Heart, Skull, Zap, Crown, Users, MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function RivalVampireModal({ onClose, vampireState }) {
  const queryClient = useQueryClient();
  const [selectedRival, setSelectedRival] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');

  const { data: rivals = [] } = useQuery({
    queryKey: ['rivals'],
    queryFn: () => base44.entities.RivalVampire.list('-power_level')
  });

  const handleAction = async (action) => {
    setProcessing(true);
    
    const outcomes = {
      challenge: {
        win: ['You defeated them. Their territory is yours now.', 'Victory. They acknowledged your superiority.', 'Combat ended. You stand over their broken form.'],
        lose: ['They were stronger. You barely escaped.', 'Defeat. They took your territory.', 'You fled. Humiliated.']
      },
      negotiate: {
        success: ['Alliance formed. United against common threats.', 'They agreed. Territory divided peacefully.', 'Diplomacy succeeded. Peace treaty signed.'],
        fail: ['Negotiations broke down. War inevitable.', 'They refused. Conflict continues.', 'Talks failed. You parted as enemies.']
      },
      seduce: {
        success: ['You seduced them. Power through pleasure.', 'They fell for you. Body and mind.', 'Sexual tension resolved. Violently. Perfectly.'],
        fail: ['They resisted your charm. Impressive.', 'Seduction failed. They saw through you.', 'No effect. They\'re stronger than that.']
      },
      steal: {
        success: ['You stole their best servant. Devastating.', 'Servant recruited. They\'re furious.', 'Poached successfully. War declared.'],
        fail: ['Attempt failed. They know what you tried.', 'Their servants stayed loyal. Damn.', 'Caught in the act. Relationship destroyed.']
      }
    };

    setTimeout(async () => {
      const success = Math.random() > 0.5;
      const result = success ? 'success' : (action === 'challenge' ? 'lose' : 'fail');
      const outcomeText = outcomes[action][result][Math.floor(Math.random() * outcomes[action][result].length)];
      
      setOutcome(outcomeText);

      // Update based on action
      if (action === 'challenge' && success) {
        const newPowerLevel = Math.max(0, selectedRival.power_level - 20);
        
        // If rival is defeated (power reaches 0), replace them with a new one
        if (newPowerLevel === 0) {
          await base44.entities.RivalVampire.delete(selectedRival.id);
          
          // Generate new rival with unique name
          const namePool = [
            'Lilith the Ancient', 'Vladislav Corvinus', 'Carmilla Drăculești',
            'Dorian Blackwood', 'Seraphina Nyx', 'Marcus Ravencroft',
            'Evangeline Thorn', 'Lucien Deveraux', 'Isolde Morningstar',
            'Viktor Shadowmere', 'Anastasia Crimson', 'Dante Nightshade'
          ];
          
          const existingNames = rivals.filter(r => r.id !== selectedRival.id).map(r => r.name);
          const availableNames = namePool.filter(n => !existingNames.includes(n));
          
          if (availableNames.length > 0) {
            const personalities = ['aggressive', 'diplomatic', 'seductive', 'ruthless', 'ancient'];
            const newName = availableNames[Math.floor(Math.random() * availableNames.length)];
            
            await base44.entities.RivalVampire.create({
              name: newName,
              age: Math.floor(Math.random() * 500) + 50,
              personality: personalities[Math.floor(Math.random() * personalities.length)],
              power_level: Math.floor(Math.random() * 40) + 40,
              relationship: Math.floor(Math.random() * 40) - 20,
              servants_count: Math.floor(Math.random() * 5)
            });
          }
        } else {
          await base44.entities.RivalVampire.update(selectedRival.id, {
            relationship: (selectedRival.relationship || 0) - 30,
            power_level: newPowerLevel
          });
        }
        
        if (selectedRival.territory_claimed) {
          const territory = await base44.entities.Territory.filter({ area_name: selectedRival.territory_claimed });
          if (territory[0]) {
            await base44.entities.Territory.update(territory[0].id, {
              controlled_by: 'you',
              control_level: 100
            });
          }
        }
      } else if (action === 'negotiate' && success) {
        await base44.entities.RivalVampire.update(selectedRival.id, {
          relationship: Math.min(100, (selectedRival.relationship || 0) + 20)
        });
      } else if (action === 'seduce' && success) {
        await base44.entities.RivalVampire.update(selectedRival.id, {
          relationship: Math.min(100, (selectedRival.relationship || 0) + 40)
        });
      }

      await base44.entities.NightLog.create({
        entry: `Rival vampire ${selectedRival.name}: ${outcomeText}`,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
        setSelectedRival(null);
      }, 4000);
    }, 2000);
  };

  // Ensure exactly 3 rivals - replace only when defeated
  React.useEffect(() => {
    if (rivals.length === 0) {
      const fixedRivals = [
        { name: 'Lilith the Ancient', age: 487, personality: 'seductive', power: 75 },
        { name: 'Vladislav Corvinus', age: 312, personality: 'ruthless', power: 68 },
        { name: 'Carmilla Drăculești', age: 234, personality: 'diplomatic', power: 62 }
      ];
      
      Promise.all(fixedRivals.map(r => 
        base44.entities.RivalVampire.create({
          name: r.name,
          age: r.age,
          personality: r.personality,
          power_level: r.power,
          relationship: Math.floor(Math.random() * 40) - 20,
          servants_count: Math.floor(Math.random() * 5)
        })
      )).then(() => queryClient.invalidateQueries(['rivals']));
    } else if (rivals.length > 3) {
      // Delete extras - keep only first 3
      const toDelete = rivals.slice(3);
      Promise.all(toDelete.map(r => base44.entities.RivalVampire.delete(r.id)))
        .then(() => queryClient.invalidateQueries(['rivals']));
    } else if (rivals.length < 3) {
      // Add new rival if less than 3 (when one was defeated)
      const namePool = [
        'Lilith the Ancient', 'Vladislav Corvinus', 'Carmilla Drăculești',
        'Dorian Blackwood', 'Seraphina Nyx', 'Marcus Ravencroft',
        'Evangeline Thorn', 'Lucien Deveraux', 'Isolde Morningstar',
        'Viktor Shadowmere', 'Anastasia Crimson', 'Dante Nightshade'
      ];
      
      const existingNames = rivals.map(r => r.name);
      const availableNames = namePool.filter(n => !existingNames.includes(n));
      
      if (availableNames.length > 0) {
        const personalities = ['aggressive', 'diplomatic', 'seductive', 'ruthless', 'ancient'];
        const newName = availableNames[Math.floor(Math.random() * availableNames.length)];
        
        base44.entities.RivalVampire.create({
          name: newName,
          age: Math.floor(Math.random() * 500) + 50,
          personality: personalities[Math.floor(Math.random() * personalities.length)],
          power_level: Math.floor(Math.random() * 40) + 40,
          relationship: Math.floor(Math.random() * 40) - 20,
          servants_count: Math.floor(Math.random() * 5)
        }).then(() => queryClient.invalidateQueries(['rivals']));
      }
    }
  }, [rivals.length]);

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
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 touch-manipulation p-2"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Rival Vampires</h2>
        <p className="text-gray-400 text-sm mb-6">Others like you. Competition. Threat. Opportunity.</p>

        {!selectedRival ? (
          <div className="space-y-3">
            {rivals.map(rival => (
              <button
                key={rival.id}
                onClick={() => setSelectedRival(rival)}
                className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-white font-bold text-lg">{rival.name}</h3>
                    <p className="text-gray-400 text-sm capitalize">{rival.personality} • {rival.age} years old</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${rival.relationship >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {rival.relationship >= 0 ? 'Neutral' : 'Hostile'}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 text-xs">
                  <span className="text-purple-400">Power: {rival.power_level}</span>
                  <span className="text-blue-400">Servants: {rival.servants_count}</span>
                  {rival.territory_claimed && <span className="text-yellow-400">Controls {rival.territory_claimed}</span>}
                </div>
              </button>
            ))}
          </div>
        ) : outcome ? (
          <div className="text-center py-12">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gray-300 text-lg"
            >
              {outcome}
            </motion.p>
          </div>
        ) : processing ? (
          <div className="text-center py-12">
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-gray-400"
            >
              ...
            </motion.p>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => setSelectedRival(null)}
              className="text-gray-400 hover:text-white text-sm mb-4"
            >
              ← Back to rivals
            </button>

            <h3 className="text-white text-xl font-bold mb-4">{selectedRival.name}</h3>

            <button
              onClick={() => handleAction('challenge')}
              className="w-full bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 rounded-xl p-4 text-left transition-colors"
            >
              <Sword className="w-5 h-5 text-red-400 mb-2" />
              <h4 className="text-white font-medium">Challenge to Combat</h4>
              <p className="text-gray-400 text-sm">Fight for dominance. Winner takes all.</p>
            </button>

            <button
              onClick={() => handleAction('negotiate')}
              className="w-full bg-blue-900/40 hover:bg-blue-900/60 border border-blue-500/30 rounded-xl p-4 text-left transition-colors"
            >
              <MessageCircle className="w-5 h-5 text-blue-400 mb-2" />
              <h4 className="text-white font-medium">Negotiate Alliance</h4>
              <p className="text-gray-400 text-sm">Diplomacy. Peace. Mutual benefit.</p>
            </button>

            <button
              onClick={() => handleAction('seduce')}
              className="w-full bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-xl p-4 text-left transition-colors"
            >
              <Heart className="w-5 h-5 text-purple-400 mb-2" />
              <h4 className="text-white font-medium">Seduce</h4>
              <p className="text-gray-400 text-sm">Power through pleasure. Bind them to you.</p>
            </button>

            <button
              onClick={() => handleAction('steal')}
              className="w-full bg-yellow-900/40 hover:bg-yellow-900/60 border border-yellow-500/30 rounded-xl p-4 text-left transition-colors"
            >
              <Users className="w-5 h-5 text-yellow-400 mb-2" />
              <h4 className="text-white font-medium">Steal Their Servant</h4>
              <p className="text-gray-400 text-sm">Recruit one of their servants. Ultimate insult.</p>
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}