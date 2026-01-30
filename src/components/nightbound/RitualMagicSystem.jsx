import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Flame, Moon, Skull } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const RITUAL_TEMPLATES = [
  { name: 'Summon Lesser Demon', type: 'summoning', ingredients: ['virgin blood', 'black candles', 'pentagram'], power: 50, moon: 'new', success: 70 },
  { name: 'Blood Binding', type: 'binding', ingredients: ['two bloods mixed', 'silver chain', 'spoken oath'], power: 30, moon: 'any', success: 85 },
  { name: 'Transformation Ritual', type: 'transformation', ingredients: ['essence of beast', 'moonwater', 'personal sacrifice'], power: 70, moon: 'full', success: 60 },
  { name: 'Eternal Curse', type: 'curse', ingredients: ['victim\'s hair', 'graveyard dirt', 'hatred manifest'], power: 60, moon: 'waning', success: 75 },
  { name: 'Divine Blessing', type: 'blessing', ingredients: ['holy water', 'angel feather', 'pure intent'], power: 40, moon: 'waxing', success: 80 }
];

export default function RitualMagicSystem({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [performing, setPerforming] = useState(null);
  const [outcome, setOutcome] = useState('');

  const handlePerformRitual = async (template) => {
    setPerforming(template.name);

    setTimeout(async () => {
      const success = Math.random() * 100 < template.success;

      await base44.entities.Ritual.create({
        name: template.name,
        description: success ? 'Ritual succeeded' : 'Ritual failed',
        ritual_type: template.type,
        required_ingredients: template.ingredients,
        power_cost: template.power,
        completed: true
      });

      if (success) {
        const outcomes = {
          summoning: 'The circle flared. Reality tore. Something crawled through. Summoning complete.',
          binding: 'Blood mixed. Oaths spoken. The binding absolute. Unbreakable.',
          transformation: 'Power surged. Form shifted. Transformation achieved. You are changed.',
          curse: 'Words of power spoken. The curse takes hold. Their fate sealed.',
          blessing: 'Divine light descended. Blessing granted. Grace bestowed.'
        };
        setOutcome('✅ SUCCESS: ' + outcomes[template.type]);

        if (template.type === 'summoning') {
          // Could create a demon entity here
        }
      } else {
        setOutcome('❌ FAILED: The ritual fizzled. Power wasted. Try again.');
      }

      await base44.entities.NightLog.create({
        entry: `Ritual performed: ${template.name}. ${success ? 'Success' : 'Failed'}.`,
        category: 'magic',
        intensity: success ? 'extreme' : 'moderate'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setPerforming(null);
        setOutcome('');
      }, 3000);
    }, 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">🔥 Ritual Magic</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {outcome && (
          <div className={`rounded-xl p-4 mb-6 ${outcome.includes('SUCCESS') ? 'bg-green-950/30 border border-green-500/30' : 'bg-red-950/30 border border-red-500/30'}`}>
            <p className="text-white text-center">{outcome}</p>
          </div>
        )}

        <div className="space-y-3">
          {RITUAL_TEMPLATES.map(ritual => (
            <div key={ritual.name} className="bg-purple-950/20 border border-purple-500/30 rounded-lg p-4">
              <p className="text-white font-bold mb-2">{ritual.name}</p>
              <div className="text-sm text-gray-400 mb-3">
                <p>Ingredients: {ritual.ingredients.join(', ')}</p>
                <p>Power: {ritual.power} • Moon: {ritual.moon} • Success: {ritual.success}%</p>
              </div>
              <button
                onClick={() => handlePerformRitual(ritual)}
                disabled={performing === ritual.name}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded disabled:opacity-50"
              >
                {performing === ritual.name ? 'Performing...' : 'Perform Ritual'}
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}