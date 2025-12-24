import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Beaker, DollarSign, Users, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const BASE_STRAINS = [
  { name: 'Crimson Bliss', potency: 1, effects: 'Mild euphoria. Colors slightly brighter. Warm feeling.', price: 50, addictiveness: 30 },
  { name: 'Midnight Rush', potency: 3, effects: 'Intense visuals. Time slows. Everything pulses.', price: 150, addictiveness: 50 },
  { name: 'Eternal Dream', potency: 5, effects: 'Reality fractures. See through dimensions. Pure ecstasy.', price: 300, addictiveness: 70 },
  { name: 'Bloodfire', potency: 7, effects: 'Your blood burns. Power surges. Primal rage mixed with bliss.', price: 500, addictiveness: 85 },
  { name: 'Void Kiss', potency: 10, effects: 'Total ego death. Become the darkness itself. Transcendence.', price: 1000, addictiveness: 95 }
];

export default function CrimsonBlissLab({ vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('produce');
  const [producing, setProducing] = useState(false);
  const [selectedStrain, setSelectedStrain] = useState(null);
  const [selling, setSelling] = useState(false);
  const [saleOutcome, setSaleOutcome] = useState('');
  const [testing, setTesting] = useState(false);
  const [testEffects, setTestEffects] = useState('');

  const { data: inventory = [] } = useQuery({
    queryKey: ['bloodDrugs'],
    queryFn: () => base44.entities.BloodDrug.list()
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['drugCustomers'],
    queryFn: () => base44.entities.DrugCustomer.list('-total_spent')
  });

  const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent, 0);
  const totalDoses = inventory.reduce((sum, i) => sum + i.quantity, 0);

  const handleProduce = async (strain) => {
    setProducing(true);
    setSelectedStrain(strain);

    setTimeout(async () => {
      const doses = Math.floor(Math.random() * 5) + 3;
      
      const existing = inventory.find(i => i.strain_name === strain.name);
      
      if (existing) {
        await base44.entities.BloodDrug.update(existing.id, {
          quantity: existing.quantity + doses
        });
      } else {
        await base44.entities.BloodDrug.create({
          strain_name: strain.name,
          potency: strain.potency,
          quantity: doses,
          price_per_dose: strain.price,
          effects: strain.effects,
          addictiveness: strain.addictiveness
        });
      }

      await base44.entities.NightLog.create({
        entry: `Produced ${doses} doses of ${strain.name}. Your blood drug empire grows.`,
        category: 'interaction',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();
      setProducing(false);
      setSelectedStrain(null);
    }, 3000);
  };

  const handleSell = async (drug) => {
    if (drug.quantity === 0) return;
    
    setSelling(true);
    setSelectedStrain(drug);

    setTimeout(async () => {
      const customerType = Math.random() > 0.5 ? 'vampire' : 'human';
      const dosesToSell = Math.min(Math.floor(Math.random() * 3) + 1, drug.quantity);
      const earnings = dosesToSell * drug.price_per_dose;

      // Update inventory
      await base44.entities.BloodDrug.update(drug.id, {
        quantity: drug.quantity - dosesToSell
      });

      // Find or create customer
      const existingCustomer = customers.find(c => c.preferred_strain === drug.strain_name);
      
      if (existingCustomer) {
        await base44.entities.DrugCustomer.update(existingCustomer.id, {
          addiction_level: Math.min(100, existingCustomer.addiction_level + (drug.addictiveness / 10)),
          total_spent: existingCustomer.total_spent + earnings,
          last_purchase: new Date().toISOString()
        });
      } else {
        const names = customerType === 'vampire' 
          ? ['Vladislav', 'Carmilla', 'Lestat', 'Akasha', 'Armand']
          : ['Marcus', 'Elena', 'David', 'Sarah', 'Alex'];
        
        await base44.entities.DrugCustomer.create({
          name: names[Math.floor(Math.random() * names.length)],
          customer_type: customerType,
          addiction_level: drug.addictiveness / 10,
          preferred_strain: drug.strain_name,
          total_spent: earnings,
          last_purchase: new Date().toISOString()
        });
      }

      const outcome = customerType === 'vampire' 
        ? `Sold ${dosesToSell} doses of ${drug.strain_name} to a vampire. They paid $${earnings}. Their eyes dilated. They'll be back.`
        : `Sold ${dosesToSell} doses of ${drug.strain_name} to a human. $${earnings}. They don't know what they're getting into.`;

      setSaleOutcome(outcome);

      await base44.entities.NightLog.create({
        entry: outcome,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setSelling(false);
        setSaleOutcome('');
        setSelectedStrain(null);
      }, 4000);
    }, 2000);
  };

  const handleTest = async (drug) => {
    setTesting(true);
    setSelectedStrain(drug);

    const visualEffects = [
      'Colors explode. Everything bleeds into everything.',
      'You see through time. Past and future merge.',
      'Reality pixelates. You\'re inside a dream.',
      'Your blood sings. Pure energy courses through you.',
      'The walls breathe. You breathe with them.',
      'You become light. Weightless. Infinite.',
      'Fractals everywhere. Mathematical perfection.',
      'You taste sound. Hear colors. Everything is one.'
    ];

    setTimeout(async () => {
      const effect = visualEffects[Math.floor(Math.random() * visualEffects.length)];
      setTestEffects(`${drug.effects}\n\n${effect}`);

      await base44.entities.BloodDrug.update(drug.id, {
        quantity: Math.max(0, drug.quantity - 1)
      });

      await base44.entities.NightLog.create({
        entry: `You tested ${drug.strain_name}. ${effect}`,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setTesting(false);
        setTestEffects('');
        setSelectedStrain(null);
      }, 6000);
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
        className="bg-gray-900 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Beaker className="w-8 h-8 text-red-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Crimson Bliss Lab</h2>
            <p className="text-gray-400 text-sm">Blood drugs. Addictive. Profitable.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-green-950/30 rounded-lg p-3 border border-green-800/30">
            <DollarSign className="w-5 h-5 text-green-400 mb-1" />
            <p className="text-white text-xl font-bold">${totalRevenue}</p>
            <p className="text-gray-400 text-xs">Total Revenue</p>
          </div>
          <div className="bg-purple-950/30 rounded-lg p-3 border border-purple-800/30">
            <Beaker className="w-5 h-5 text-purple-400 mb-1" />
            <p className="text-white text-xl font-bold">{totalDoses}</p>
            <p className="text-gray-400 text-xs">Doses in Stock</p>
          </div>
          <div className="bg-blue-950/30 rounded-lg p-3 border border-blue-800/30">
            <Users className="w-5 h-5 text-blue-400 mb-1" />
            <p className="text-white text-xl font-bold">{customers.length}</p>
            <p className="text-gray-400 text-xs">Customers</p>
          </div>
          <div className="bg-red-950/30 rounded-lg p-3 border border-red-800/30">
            <TrendingUp className="w-5 h-5 text-red-400 mb-1" />
            <p className="text-white text-xl font-bold">{inventory.length}</p>
            <p className="text-gray-400 text-xs">Strains</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button 
            onClick={() => setTab('produce')} 
            className={`px-4 py-2 rounded-lg ${tab === 'produce' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            Produce
          </button>
          <button 
            onClick={() => setTab('inventory')} 
            className={`px-4 py-2 rounded-lg ${tab === 'inventory' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            Inventory
          </button>
          <button 
            onClick={() => setTab('customers')} 
            className={`px-4 py-2 rounded-lg ${tab === 'customers' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            Customers
          </button>
        </div>

        {/* Tab Content */}
        {tab === 'produce' && !producing && (
          <div className="space-y-3">
            <h3 className="text-white font-bold mb-3">Create Blood Drugs</h3>
            {BASE_STRAINS.map(strain => (
              <div key={strain.name} className="bg-gray-800 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="text-white font-bold mb-1">{strain.name}</h4>
                    <p className="text-gray-400 text-sm mb-2">{strain.effects}</p>
                    <div className="flex gap-3 text-xs">
                      <span className="text-purple-400">Potency: {strain.potency}/10</span>
                      <span className="text-red-400">Addictive: {strain.addictiveness}%</span>
                      <span className="text-green-400">${strain.price}/dose</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleProduce(strain)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Produce
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {producing && (
          <div className="text-center py-12">
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                scale: { duration: 1, repeat: Infinity }
              }}
              className="text-6xl mb-4"
            >
              🧪
            </motion.div>
            <p className="text-gray-300">Producing {selectedStrain?.name}...</p>
            <p className="text-gray-500 text-sm mt-2">Mixing blood. Adding compounds. Creating addiction.</p>
          </div>
        )}

        {tab === 'inventory' && !selling && !testing && (
          <div className="space-y-3">
            <h3 className="text-white font-bold mb-3">Your Stock</h3>
            {inventory.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No inventory. Start producing.</p>
            ) : (
              inventory.map(drug => (
                <div key={drug.id} className="bg-gray-800 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="text-white font-bold mb-1">{drug.strain_name}</h4>
                      <p className="text-gray-400 text-sm mb-2">{drug.effects}</p>
                      <div className="flex gap-3 text-xs mb-3">
                        <span className="text-blue-400">Stock: {drug.quantity} doses</span>
                        <span className="text-green-400">${drug.price_per_dose}/dose</span>
                        <span className="text-purple-400">Potency: {drug.potency}/10</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSell(drug)}
                      disabled={drug.quantity === 0}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Sell
                    </button>
                    <button
                      onClick={() => handleTest(drug)}
                      disabled={drug.quantity === 0}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Test on Yourself
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {selling && saleOutcome && (
          <div className="text-center py-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-6xl mb-4"
            >
              💰
            </motion.div>
            <p className="text-gray-300 text-lg">{saleOutcome}</p>
          </div>
        )}

        {testing && (
          <div className="text-center py-12">
            <AnimatePresence>
              {!testEffects ? (
                <motion.div
                  animate={{ 
                    scale: [1, 1.5, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  🌀
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.8, 1] }}
                  className="space-y-4"
                >
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute text-4xl"
                      initial={{ 
                        x: '50%',
                        y: '50%',
                        opacity: 0
                      }}
                      animate={{ 
                        x: `${Math.random() * 100}%`,
                        y: `${Math.random() * 100}%`,
                        opacity: [0, 1, 0],
                        scale: [0, 2, 0],
                        rotate: Math.random() * 360
                      }}
                      transition={{ 
                        duration: 3,
                        delay: Math.random() * 2
                      }}
                    >
                      {['✨', '🌈', '💫', '⚡', '🔥'][Math.floor(Math.random() * 5)]}
                    </motion.div>
                  ))}
                  <motion.p 
                    className="text-purple-300 text-xl whitespace-pre-line relative z-10"
                    animate={{ 
                      textShadow: [
                        '0 0 10px rgba(168, 85, 247, 0.5)',
                        '0 0 20px rgba(168, 85, 247, 1)',
                        '0 0 10px rgba(168, 85, 247, 0.5)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {testEffects}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {tab === 'customers' && (
          <div className="space-y-3">
            <h3 className="text-white font-bold mb-3">Your Clients</h3>
            {customers.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No customers yet. Start selling.</p>
            ) : (
              customers.map(customer => (
                <div key={customer.id} className="bg-gray-800 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-white font-bold">{customer.name}</h4>
                      <p className="text-gray-400 text-sm capitalize">{customer.customer_type}</p>
                    </div>
                    <span className="text-green-400 font-bold">${customer.total_spent}</span>
                  </div>
                  <div className="flex gap-3 text-xs mb-2">
                    <span className="text-purple-400">Prefers: {customer.preferred_strain}</span>
                    <span className={`${customer.addiction_level > 70 ? 'text-red-400' : 'text-yellow-400'}`}>
                      Addiction: {customer.addiction_level}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      style={{ width: `${customer.addiction_level}%` }}
                      className="h-2 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-full"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}