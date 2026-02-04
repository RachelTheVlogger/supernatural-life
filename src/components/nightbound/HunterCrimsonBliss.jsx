import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplets, Zap, TrendingUp, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient, useQuery } from '@tanstack/react-query';

const STRAIN_NAMES = [
  'Crimson Ecstasy', 'Bloodlust Prime', 'Nocturne', 'Scarlet Rush', 'Venom Kiss',
  'Eternal Night', 'Raven\'s Touch', 'Pulse', 'Eclipse', 'Inferno', 'Abyss',
  'Midnight Elixir', 'Soul Drain', 'Crimson Tide', 'Dark Euphoria'
];

const EFFECTS = [
  'Euphoric rush', 'Heightened senses', 'Temporal distortion', 'Inner vision',
  'Primal power', 'Transcendence', 'Obsessive focus', 'Sensory overload'
];

const BLOOD_PLANTS = [
  { type: 'crimson_bloom', name: 'Crimson Bloom', description: 'Classic blood flower. Grows fast. Reliable potency.', growTime: 3, baseYield: 5 },
  { type: 'shadow_vine', name: 'Shadow Vine', description: 'Creeps in darkness. High THC equivalent. Psychedelic effects.', growTime: 4, baseYield: 7 },
  { type: 'midnight_lotus', name: 'Midnight Lotus', description: 'Rare. Beautiful. Extremely potent. Hard to grow.', growTime: 6, baseYield: 3 },
  { type: 'bloodroot', name: 'Bloodroot', description: 'Deep roots. Feeds on blood. Creates powerful strains.', growTime: 5, baseYield: 6 },
  { type: 'vampweed', name: 'Vampweed', description: 'Hybrid plant. Easy to grow. Medium potency. Great for beginners.', growTime: 2, baseYield: 8 }
];

export default function HunterCrimsonBliss({ hunter, vampires = [], onClose }) {
  const queryClient = useQueryClient();
  const [formulas, setFormulas] = useState([]);
  const [extracting, setExtracting] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState(null);
  const [selling, setSelling] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [tab, setTab] = useState('extract');
  const [plantBreeding, setPlantBreeding] = useState(false);
  const [selectedPlants, setSelectedPlants] = useState([]);
  const [breedingOutcome, setBreedingOutcome] = useState('');

  const { data: bloodDrugs = [] } = useQuery({
    queryKey: ['bloodDrugs'],
    queryFn: async () => {
      try {
        return await base44.entities.BloodDrug.list();
      } catch {
        return [];
      }
    }
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['drugCustomers'],
    queryFn: async () => {
      try {
        return await base44.entities.DrugCustomer.list();
      } catch {
        return [];
      }
    }
  });

  const { data: bloodPlants = [] } = useQuery({
    queryKey: ['bloodPlants'],
    queryFn: async () => {
      try {
        return await base44.entities.BloodPlant.list();
      } catch {
        return [];
      }
    }
  });

  const generateStrain = () => {
    const baseName = STRAIN_NAMES[Math.floor(Math.random() * STRAIN_NAMES.length)];
    const effect = EFFECTS[Math.floor(Math.random() * EFFECTS.length)];
    const potency = Math.floor(Math.random() * 40) + 60; // 60-100
    const addictiveness = Math.floor(Math.random() * 30) + 70; // 70-100
    const pricePerDose = Math.floor(Math.random() * 150) + 100; // 100-250

    return {
      id: `strain_${Date.now()}_${Math.random()}`,
      strain_name: baseName,
      potency,
      addictiveness,
      quantity: 0,
      price_per_dose: pricePerDose,
      effects: effect,
      quality: 'premium',
      is_hybrid: false
    };
  };

  const generateHybridStrain = (formula1, formula2) => {
    const hybrid = {
      ...generateStrain(),
      is_hybrid: true,
      strain_name: `${formula1.strain_name} × ${formula2.strain_name}`,
      potency: Math.min(100, formula1.potency + formula2.potency) / 2 + Math.floor(Math.random() * 20),
      addictiveness: (formula1.addictiveness + formula2.addictiveness) / 2,
      price_per_dose: formula1.price_per_dose + formula2.price_per_dose
    };
    return hybrid;
  };

  const handleExtract = async (vampire) => {
    setExtracting(true);

    setTimeout(async () => {
      try {
        const newFormula = generateStrain();
        newFormula.quantity = Math.floor(Math.random() * 10) + 15; // 15-25 doses
        newFormula.base_servant_id = vampire.id;

        setFormulas([...formulas, newFormula]);

        // Damage vampire
        const newExposure = Math.min(100, (vampire.exposure_level || 0) + 15);
        const newPowerLevel = Math.max(0, (vampire.vampire_power_level || 0) - 10);

        await base44.entities.VampireState.update(vampire.id, {
          exposure_level: newExposure,
          vampire_power_level: newPowerLevel
        });

        await base44.entities.NightLog.create({
          entry: `${hunter.name} extracted blood from ${vampire.vampire_name}. Created batch of ${newFormula.strain_name} (${newFormula.quantity} doses). ${vampire.vampire_name} weakened.`,
          category: 'dark_deed',
          intensity: 'extreme'
        });

        setOutcome(`✨ Created: ${newFormula.strain_name}\n📊 Potency: ${newFormula.potency}/100\n⚠️ Addictiveness: ${newFormula.addictiveness}/100\n💰 Price: $${newFormula.price_per_dose}/dose\n🧪 Doses: ${newFormula.quantity}\n\n${vampire.vampire_name} weakened permanently.`);

        setTimeout(() => {
          setExtracting(false);
          setOutcome('');
        }, 3000);
      } catch (e) {
        console.error('Extraction failed:', e);
        setExtracting(false);
      }
    }, 2000);
  };

  const handleCreateHybrid = async (formula1, formula2) => {
    const hybrid = generateHybridStrain(formula1, formula2);
    setFormulas([...formulas, hybrid]);

    await base44.entities.NightLog.create({
      entry: `${hunter.name} created hybrid strain: ${hybrid.strain_name}. Experimental compound ready for distribution.`,
      category: 'dark_deed',
      intensity: 'significant'
    });
  };

  const handleSell = async (formula) => {
    setSelling(true);

    setTimeout(async () => {
      try {
        const revenue = formula.quantity * formula.price_per_dose;
        const profit = Math.floor(revenue * 0.7); // 70% profit

        // Create drug customer record
        await base44.entities.DrugCustomer.create({
          name: `Anonymous Buyer #${Math.floor(Math.random() * 1000)}`,
          customer_type: 'human',
          preferred_strain: formula.strain_name,
          total_spent: revenue,
          addiction_level: Math.floor(Math.random() * 40) + 60,
          friendship: 50,
          relationship_type: 'business'
        });

        // Remove formula
        const newFormulas = formulas.filter(f => f.id !== formula.id);
        setFormulas(newFormulas);

        setOutcome(`💰 SOLD: ${formula.strain_name}\n📦 Doses: ${formula.quantity}\n💵 Revenue: $${revenue}\n💲 Profit: $${profit}\n\nFormula completely gone. No traces.`);

        await base44.entities.NightLog.create({
          entry: `${hunter.name} sold ${formula.quantity} doses of ${formula.strain_name} for $${revenue}. Profit: $${profit}. Business is booming.`,
          category: 'dark_deed',
          intensity: 'significant'
        });

        setTimeout(() => {
          setSelling(false);
          setOutcome('');
        }, 3000);
      } catch (e) {
        console.error('Sale failed:', e);
        setSelling(false);
      }
    }, 1500);
  };

  const handlePlantCrossBreed = async () => {
    if (selectedPlants.length !== 2) return;
    
    setPlantBreeding(true);

    setTimeout(async () => {
      try {
        const plant1 = bloodPlants.find(p => p.id === selectedPlants[0]);
        const plant2 = bloodPlants.find(p => p.id === selectedPlants[1]);

        const plant1Info = BLOOD_PLANTS.find(p => p.type === plant1.plant_type);
        const plant2Info = BLOOD_PLANTS.find(p => p.type === plant2.plant_type);

        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Two blood plants are being cross-bred: ${plant1Info.name} (${plant1Info.description}) and ${plant2Info.name} (${plant2Info.description}). Generate a unique hybrid plant. Create: hybrid_name (creative 2-3 word name), description (unique properties), special_trait (mutation/enhancement), potency_boost (10-40).`,
          response_json_schema: {
            type: 'object',
            properties: {
              hybrid_name: { type: 'string' },
              description: { type: 'string' },
              special_trait: { type: 'string' },
              potency_boost: { type: 'number' }
            }
          }
        });

        const avgPotency = Math.floor((plant1.potency + plant2.potency) / 2) + response.potency_boost;

        await base44.entities.BloodPlant.delete(plant1.id);
        await base44.entities.BloodPlant.delete(plant2.id);

        await base44.entities.BloodPlant.create({
          plant_type: `hybrid_${Date.now()}`,
          growth_stage: 1,
          health: 100,
          potency: Math.min(100, avgPotency),
          planted_date: new Date().toISOString(),
          last_watered: new Date().toISOString(),
          mutation_level: 30,
          hybrid_name: response.hybrid_name,
          hybrid_description: response.description,
          special_trait: response.special_trait
        });

        await base44.entities.NightLog.create({
          entry: `${hunter.name} cross-bred ${plant1Info.name} with ${plant2Info.name}. Created: ${response.hybrid_name}. ${response.special_trait}`,
          category: 'dark_deed',
          intensity: 'significant'
        });

        setBreedingOutcome(`🌿 Hybrid Created: ${response.hybrid_name}\n\n${response.description}\n\n✨ Special Trait: ${response.special_trait}\n\nPotency: ${Math.min(100, avgPotency)}%`);

        queryClient.invalidateQueries();

        setTimeout(() => {
          setPlantBreeding(false);
          setSelectedPlants([]);
          setBreedingOutcome('');
        }, 6000);
      } catch (e) {
        // Fallback
        const plant1 = bloodPlants.find(p => p.id === selectedPlants[0]);
        const plant2 = bloodPlants.find(p => p.id === selectedPlants[1]);
        const plant1Info = BLOOD_PLANTS.find(p => p.type === plant1.plant_type);
        const plant2Info = BLOOD_PLANTS.find(p => p.type === plant2.plant_type);

        const hybridNames = ['Shadow Bloom', 'Crimson Vine', 'Midnight Root', 'Blood Lotus'];
        const hybridName = hybridNames[Math.floor(Math.random() * hybridNames.length)];
        const avgPotency = Math.floor((plant1.potency + plant2.potency) / 2) + 20;

        await base44.entities.BloodPlant.delete(plant1.id);
        await base44.entities.BloodPlant.delete(plant2.id);

        await base44.entities.BloodPlant.create({
          plant_type: `hybrid_${Date.now()}`,
          growth_stage: 1,
          health: 100,
          potency: Math.min(100, avgPotency),
          planted_date: new Date().toISOString(),
          last_watered: new Date().toISOString(),
          mutation_level: 30,
          hybrid_name: hybridName,
          hybrid_description: `Hybrid of ${plant1Info.name} and ${plant2Info.name}. Enhanced properties.`
        });

        setBreedingOutcome(`🌿 Hybrid Created: ${hybridName}\n\nCombines traits from both parent plants.\n\nPotency: ${Math.min(100, avgPotency)}%`);

        queryClient.invalidateQueries();

        setTimeout(() => {
          setPlantBreeding(false);
          setSelectedPlants([]);
          setBreedingOutcome('');
        }, 6000);
      }
    }, 3000);
  };

  if (extracting && outcome) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gray-900 rounded-2xl p-8 max-w-md w-full text-center border-2 border-red-500/50"
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-200 text-lg leading-relaxed whitespace-pre-line font-medium"
          >
            {outcome}
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  if (extracting || selling) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      >
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }}>
          <span className="text-4xl">🩸</span>
        </motion.div>
      </motion.div>
    );
  }

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
        className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-red-500/50"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-red-100 mb-1">🩸 Crimson Bliss</h2>
            <p className="text-red-300 text-sm">Extract. Create. Distribute.</p>
          </div>
          <button onClick={onClose} className="text-red-300 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-black/40 rounded-lg p-4 border border-red-500/30">
            <p className="text-red-400 text-xs mb-1">Active Formulas</p>
            <p className="text-red-100 font-bold text-2xl">{formulas.length}</p>
          </div>
          <div className="bg-black/40 rounded-lg p-4 border border-red-500/30">
            <p className="text-red-400 text-xs mb-1">Total Doses</p>
            <p className="text-red-100 font-bold text-2xl">{formulas.reduce((sum, f) => sum + f.quantity, 0)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button 
            onClick={() => setTab('extract')} 
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${tab === 'extract' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            Extract
          </button>
          <button 
            onClick={() => setTab('formulas')} 
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${tab === 'formulas' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            Formulas
          </button>
          <button 
            onClick={() => setTab('plants')} 
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${tab === 'plants' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            🌿 Plants
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {tab === 'extract' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h3 className="text-xl font-bold text-red-200 mb-4">🔪 Extract Blood</h3>
              <p className="text-gray-400 text-sm mb-4">Select a vampire to torture and extract their blood. Creates a new drug strain.</p>
              <div className="grid gap-3">
                {vampires.map(v => (
                  <motion.button
                    key={v.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => handleExtract(v)}
                    className="bg-red-950/30 hover:bg-red-950/50 border border-red-500/30 rounded-lg p-4 text-left transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-red-100 font-bold">{v.vampire_name}</h4>
                        <p className="text-gray-400 text-sm">Power: {v.vampire_power_level || 0}/100 • Exposure: {v.exposure_level || 0}%</p>
                      </div>
                      <Droplets className="w-5 h-5 text-red-400" />
                    </div>
                  </motion.button>
                ))}
                {vampires.length === 0 && (
                  <p className="text-gray-500 text-sm p-4 bg-black/40 rounded-lg">No vampires encountered yet.</p>
                )}
              </div>
            </motion.div>
          )}

          {tab === 'formulas' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {formulas.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No formulas yet. Extract blood first.</p>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-red-200 mb-4">🧪 Active Formulas</h3>
                  {formulas.map((formula, idx) => (
                    <motion.div
                      key={formula.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-950/20 border border-red-500/30 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-red-100 font-bold">{formula.strain_name}</h4>
                          <p className="text-gray-400 text-sm">{formula.effects}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-bold text-lg">${formula.price_per_dose}/dose</p>
                          <p className="text-gray-400 text-xs">{formula.quantity} doses</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                        <div className="bg-black/40 rounded p-2">
                          <p className="text-gray-400">Potency</p>
                          <p className="text-red-300 font-bold">{formula.potency}/100</p>
                        </div>
                        <div className="bg-black/40 rounded p-2">
                          <p className="text-gray-400">Addictiveness</p>
                          <p className="text-red-300 font-bold">{formula.addictiveness}/100</p>
                        </div>
                        <div className="bg-black/40 rounded p-2">
                          <p className="text-gray-400">Revenue</p>
                          <p className="text-green-300 font-bold">${formula.quantity * formula.price_per_dose}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSell(formula)}
                          className="flex-1 bg-gradient-to-r from-green-900/60 to-green-950/60 hover:from-green-900/80 hover:to-green-950/80 border border-green-500/30 rounded px-3 py-2 text-white text-sm font-medium transition-all"
                        >
                          💰 Sell All
                        </button>
                        {idx < formulas.length - 1 && (
                          <button
                            onClick={() => handleCreateHybrid(formula, formulas[idx + 1])}
                            className="flex-1 bg-gradient-to-r from-purple-900/60 to-purple-950/60 hover:from-purple-900/80 hover:to-purple-950/80 border border-purple-500/30 rounded px-3 py-2 text-white text-sm font-medium transition-all"
                          >
                            ⚗️ Hybrid with Next
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {tab === 'plants' && !plantBreeding && !breedingOutcome && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-white font-bold">Blood Plant Garden 🌿</h3>
                {bloodPlants.length >= 2 && (
                  <button 
                    onClick={() => setPlantBreeding(true)}
                    className="text-pink-400 text-xs px-3 py-1 bg-pink-900/40 rounded-lg"
                  >
                    Cross-Breed
                  </button>
                )}
              </div>
              
              {bloodPlants.length === 0 ? (
                <div className="space-y-3">
                  <p className="text-gray-400 text-sm mb-4">Grow blood plants to create organic strains</p>
                  {BLOOD_PLANTS.map(plant => (
                    <button
                      key={plant.type}
                      onClick={async (e) => {
                        e.stopPropagation();
                        await base44.entities.BloodPlant.create({
                          plant_type: plant.type,
                          growth_stage: 1,
                          health: 100,
                          potency: 50,
                          planted_date: new Date().toISOString(),
                          last_watered: new Date().toISOString()
                        });
                        await base44.entities.NightLog.create({
                          entry: `${hunter.name} planted ${plant.name}. Let it grow.`,
                          category: 'dark_deed',
                          intensity: 'moderate'
                        });
                        queryClient.invalidateQueries();
                      }}
                      className="w-full bg-green-900/40 hover:bg-green-900/60 border border-green-500/30 rounded-xl p-4 text-left"
                    >
                      <h4 className="text-white font-bold mb-1">{plant.name}</h4>
                      <p className="text-gray-400 text-sm mb-2">{plant.description}</p>
                      <div className="flex gap-3 text-xs text-gray-500">
                        <span>Grow time: {plant.growTime} days</span>
                        <span>Yield: {plant.baseYield} doses</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                bloodPlants.map(plant => {
                  const plantInfo = BLOOD_PLANTS.find(p => p.type === plant.plant_type);
                  const displayName = plant.hybrid_name || plantInfo?.name || 'Unknown Plant';
                  return (
                    <div key={plant.id} className="bg-gray-800 rounded-xl p-4 mb-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="text-white font-bold mb-1">{displayName} 🌱</h4>
                          {plant.hybrid_description && (
                            <p className="text-pink-400 text-xs mb-1">{plant.hybrid_description}</p>
                          )}
                          {plant.special_trait && (
                            <p className="text-purple-400 text-xs mb-1">✨ {plant.special_trait}</p>
                          )}
                          <p className="text-gray-400 text-sm mb-2">Stage {plant.growth_stage}/5</p>
                          <div className="flex gap-3 text-xs mb-3">
                            <span className={`${plant.health > 70 ? 'text-green-400' : plant.health > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                              Health: {plant.health}%
                            </span>
                            <span className="text-purple-400">Potency: {plant.potency}%</span>
                            {plant.mutation_level > 0 && <span className="text-pink-400">Mutated: {plant.mutation_level}%</span>}
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                            <div 
                              style={{ width: `${(plant.growth_stage / 5) * 100}%` }}
                              className="h-2 bg-gradient-to-r from-green-500 to-purple-500 rounded-full"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await base44.entities.BloodPlant.update(plant.id, {
                              health: Math.min(100, plant.health + 20),
                              last_watered: new Date().toISOString()
                            });
                            queryClient.invalidateQueries();
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm"
                        >
                          Water
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await base44.entities.BloodPlant.update(plant.id, {
                              health: Math.min(100, plant.health + 30),
                              potency: Math.min(100, plant.potency + 15),
                              needs_blood: false
                            });
                            queryClient.invalidateQueries();
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm"
                        >
                          Feed Blood
                        </button>
                        {plant.growth_stage < 5 && (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              await base44.entities.BloodPlant.update(plant.id, {
                                growth_stage: plant.growth_stage + 1,
                                harvest_ready: plant.growth_stage + 1 === 5
                              });
                              queryClient.invalidateQueries();
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm"
                          >
                            Advance Growth
                          </button>
                        )}
                        {plant.harvest_ready && (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const baseYield = plantInfo?.baseYield || 5;
                              const yield_ = Math.floor(Math.random() * 3) + baseYield;
                              const strainName = plant.hybrid_name ? `${plant.hybrid_name} Extract` : `${plantInfo.name} Extract`;

                              const newFormula = {
                                id: `plant_${Date.now()}`,
                                strain_name: strainName,
                                potency: Math.floor(plant.potency / 10) * 10,
                                quantity: yield_,
                                price_per_dose: 150 + (plant.potency * 2),
                                effects: plant.hybrid_description || `organic ${plantInfo.name.toLowerCase()} strain. Natural. Pure. ${plant.mutation_level > 0 ? 'Mutated properties.' : ''}`,
                                addictiveness: 40 + plant.potency / 2
                              };

                              setFormulas([...formulas, newFormula]);

                              await base44.entities.BloodPlant.delete(plant.id);

                              await base44.entities.NightLog.create({
                                entry: `${hunter.name} harvested ${displayName}. Got ${yield_} doses of ${strainName}.`,
                                category: 'dark_deed',
                                intensity: 'moderate'
                              });

                              queryClient.invalidateQueries();
                            }}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg text-sm col-span-2"
                          >
                            🌿 Harvest
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </motion.div>
          )}

          {plantBreeding && !breedingOutcome && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-white font-bold">Cross-Breed Plants</h3>
                <button 
                  onClick={() => { setPlantBreeding(false); setSelectedPlants([]); }}
                  className="text-gray-400 text-sm"
                >
                  Cancel
                </button>
              </div>
              <p className="text-gray-400 text-sm mb-4">Select 2 plants to cross-breed and create a hybrid with unique properties</p>
              
              {bloodPlants.map(plant => {
                const plantInfo = BLOOD_PLANTS.find(p => p.type === plant.plant_type);
                const displayName = plant.hybrid_name || plantInfo?.name || 'Unknown Plant';
                return (
                  <div 
                    key={plant.id} 
                    className={`bg-gray-800 rounded-xl p-4 border-2 mb-2 ${
                      selectedPlants.includes(plant.id) ? 'border-pink-500' : 'border-transparent'
                    }`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedPlants.includes(plant.id)) {
                          setSelectedPlants(selectedPlants.filter(id => id !== plant.id));
                        } else if (selectedPlants.length < 2) {
                          setSelectedPlants([...selectedPlants, plant.id]);
                        }
                      }}
                      className="w-full text-left"
                    >
                      <h4 className="text-white font-bold mb-1">{displayName}</h4>
                      <p className="text-gray-400 text-xs">Potency: {plant.potency}% | Stage: {plant.growth_stage}/5</p>
                    </button>
                  </div>
                );
              })}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlantCrossBreed();
                }}
                disabled={selectedPlants.length !== 2}
                className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-700 text-white py-3 rounded-lg transition-colors disabled:opacity-50 mt-4"
              >
                Cross-Breed ({selectedPlants.length}/2 selected)
              </button>
            </motion.div>
          )}

          {(plantBreeding || breedingOutcome) && breedingOutcome && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🌿✨</div>
              <p className="text-pink-300 text-lg whitespace-pre-line px-4">{breedingOutcome}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        {tab !== 'plants' && (
          <div className="bg-black/40 rounded-lg p-4 border border-red-500/30 mt-6">
            <h3 className="text-red-200 font-bold mb-3">📊 Operation Status</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-400">Vampires Harmed</p>
                <p className="text-red-300 font-bold">{formulas.length}</p>
              </div>
              <div>
                <p className="text-gray-400">Active Customers</p>
                <p className="text-red-300 font-bold">{customers.length}</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}