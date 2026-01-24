import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplet, Leaf, Trash2, Plus, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import SVGPlant from './SVGPlant';

const PLANT_TYPES = {
  cannabis: { name: '🌿 Cannabis', growth_days: 8, max_potency: 85, icon: '💚', color: 'green', variants: ['🟢', '💚', '✅'] },
  psilocybin: { name: '🍄 Psilocybin Mushrooms', growth_days: 6, max_potency: 75, icon: '🍄', color: 'purple', variants: ['🟣', '💜', '🍆'] },
  opium_poppy: { name: '🌸 Opium Poppy', growth_days: 10, max_potency: 90, icon: '🌸', color: 'red', variants: ['🔴', '❤️', '🌹'] },
  coca: { name: '🌿 Coca Plant', growth_days: 9, max_potency: 80, icon: '🟡', color: 'yellow', variants: ['🟡', '💛', '⭐'] },
  ergot: { name: '⚫ Ergot Fungus', growth_days: 7, max_potency: 70, icon: '🟣', color: 'dark', variants: ['⚫', '⬛', '◼️'] }
};

const APPEARANCE_OPTIONS = {
  realistic: { label: 'Realistic (obvious)', icon: '🌿', desc: 'Looks exactly like the real plant' },
  hidden: { label: 'Hidden (disguised)', icon: '🪴', desc: 'Looks like an ordinary potted plant' },
  potted: { label: 'Potted Decor', icon: '🏺', desc: 'Decorative plant pot' },
  herb_garden: { label: 'Herb Garden', icon: '🌱', desc: 'Mixed with cooking herbs' }
};

export default function DrugPlantGrowth({ hunter, onClose }) {
  const queryClient = useQueryClient();
  const [plants, setPlants] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedAppearance, setSelectedAppearance] = useState('hidden');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const fetchPlants = async () => {
      try {
        const allPlants = await base44.entities.DrugPlant.list();
        setPlants(allPlants.filter(p => p.hunter_id === hunter.id));
      } catch (e) {
        console.error('Failed to fetch plants:', e);
      }
    };
    fetchPlants();
  }, [hunter.id]);

  const handlePlantNew = async () => {
    if (!selectedType || plants.length >= 3) return;
    setLoading(true);

    try {
      await base44.entities.DrugPlant.create({
        hunter_id: hunter.id,
        plant_type: selectedType,
        appearance: selectedAppearance,
        growth_stage: 1,
        potency: 30,
        health: 100,
        last_watered: new Date().toISOString(),
        days_growing: 0,
        yield: 0,
        ready_to_harvest: false
      });

      queryClient.invalidateQueries();
      setSelectedType(null);
      setLoading(false);
    } catch (e) {
      console.error('Failed to plant:', e);
      setLoading(false);
    }
  };

  const handleWater = async (plant) => {
    try {
      const newHealth = Math.min(plant.health + 15, 100);
      await base44.entities.DrugPlant.update(plant.id, {
        health: newHealth,
        last_watered: new Date().toISOString()
      });
      queryClient.invalidateQueries();
    } catch (e) {
      console.error('Failed to water plant:', e);
    }
  };

  const handleGrow = async (plant) => {
    try {
      const plantInfo = PLANT_TYPES[plant.plant_type];
      const newStage = Math.min(plant.growth_stage + 1, 5);
      const newPotency = Math.min(plant.potency + 15, plantInfo.max_potency);
      const ready = newStage === 5;

      await base44.entities.DrugPlant.update(plant.id, {
        growth_stage: newStage,
        potency: newPotency,
        days_growing: (plant.days_growing || 0) + 1,
        ready_to_harvest: ready
      });

      queryClient.invalidateQueries();
    } catch (e) {
      console.error('Failed to grow plant:', e);
    }
  };

  const handleHarvest = async (plant) => {
    try {
      const yield_amount = Math.floor((plant.potency / 100) * 50);
      
      await base44.entities.DrugPlant.delete(plant.id);
      
      await base44.entities.NightLog.create({
        entry: `Harvested ${yield_amount}g of ${PLANT_TYPES[plant.plant_type].name}. Potency: ${plant.potency}%.`,
        category: 'hunting',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();
    } catch (e) {
      console.error('Failed to harvest:', e);
    }
  };

  const handleDelete = async (plant) => {
    try {
      await base44.entities.DrugPlant.delete(plant.id);
      queryClient.invalidateQueries();
    } catch (e) {
      console.error('Failed to delete plant:', e);
    }
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
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto"
      >
        <h2 className="text-2xl font-bold text-white mb-6">🌱 Drug Plant Cultivation</h2>

        {/* Current Plants */}
        {plants.length > 0 && (
          <div className="mb-8 space-y-3">
            <h3 className="text-white font-semibold">Your Plants</h3>
            {plants.map(plant => {
              const info = PLANT_TYPES[plant.plant_type];
              return (
                <div key={plant.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-medium">{info.name}</p>
                      <p className="text-gray-400 text-sm capitalize">
                        {APPEARANCE_OPTIONS[plant.appearance].label}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(plant)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <p className="text-gray-400 text-xs">Stage</p>
                      <p className="text-white font-bold">{plant.growth_stage}/5</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Potency</p>
                      <p className="text-white font-bold">{plant.potency}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Health</p>
                      <p className="text-white font-bold">{plant.health}%</p>
                    </div>
                  </div>

                  {/* Plant Visual */}
                  <div className="text-center mb-4 flex justify-center">
                    <SVGPlant plantType={plant.plant_type} stage={plant.growth_stage} potency={plant.potency} size={140} />
                  </div>

                  <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                    <div
                      style={{ width: `${plant.health}%` }}
                      className="h-2 rounded-full bg-green-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleWater(plant)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-1 transition-colors"
                    >
                      <Droplet className="w-3 h-3" />
                      Water
                    </button>
                    <button
                      onClick={() => handleGrow(plant)}
                      disabled={plant.growth_stage === 5}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-1 transition-colors"
                    >
                      <Leaf className="w-3 h-3" />
                      Grow
                    </button>
                    {plant.ready_to_harvest && (
                      <button
                        onClick={() => handleHarvest(plant)}
                        className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg text-sm transition-colors"
                      >
                        Harvest
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {plants.length < 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-semibold mb-3">Plant Type</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(PLANT_TYPES).map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedType(key)}
                    className={`rounded-lg p-3 text-left transition-colors ${
                      selectedType === key
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <p className="font-medium">{info.icon} {info.name}</p>
                    <p className="text-xs opacity-75">{info.growth_days} days</p>
                  </button>
                ))}
              </div>
            </div>

            {selectedType && (
              <div>
                <h3 className="text-white font-semibold mb-3">Appearance</h3>
                <div className="space-y-2">
                  {Object.entries(APPEARANCE_OPTIONS).map(([key, option]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedAppearance(key)}
                      className={`w-full rounded-lg p-3 text-left transition-colors ${
                        selectedAppearance === key
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <p className="font-medium">{option.icon} {option.label}</p>
                      <p className="text-xs opacity-75">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handlePlantNew}
              disabled={!selectedType || loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Plant Seed
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-6 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}