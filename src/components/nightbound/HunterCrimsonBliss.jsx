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

export default function HunterCrimsonBliss({ hunter, vampires = [], onClose }) {
  const queryClient = useQueryClient();
  const [formulas, setFormulas] = useState([]);
  const [extracting, setExtracting] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState(null);
  const [selling, setSelling] = useState(false);
  const [outcome, setOutcome] = useState('');

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

        {/* Extract Section */}
        <div className="mb-8">
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
        </div>

        {/* Formulas Section */}
        {formulas.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-red-200 mb-4">🧪 Active Formulas</h3>
            <div className="space-y-3">
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
          </div>
        )}

        {/* Stats */}
        <div className="bg-black/40 rounded-lg p-4 border border-red-500/30">
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
      </motion.div>
    </motion.div>
  );
}