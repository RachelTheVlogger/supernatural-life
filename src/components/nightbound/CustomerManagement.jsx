import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, TrendingUp, AlertTriangle, Heart, Skull, DollarSign, MessageSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import CustomerDialogue from './CustomerDialogue';

const LOYALTY_TIERS = {
  bronze: { name: 'Bronze', color: 'orange', minSpent: 0, benefits: 'Standard pricing', icon: '🥉' },
  silver: { name: 'Silver', color: 'gray', minSpent: 500, benefits: '5% discount, priority stock', icon: '🥈' },
  gold: { name: 'Gold', color: 'yellow', minSpent: 1500, benefits: '10% discount, custom orders', icon: '🥇' },
  platinum: { name: 'Platinum', color: 'cyan', minSpent: 3000, benefits: '15% discount, exclusive strains', icon: '💎' },
  diamond: { name: 'Diamond', color: 'purple', minSpent: 5000, benefits: '20% discount, VIP treatment', icon: '💠' }
};

const WITHDRAWAL_STAGES = {
  none: { name: 'None', severity: 0, description: 'Customer is fine' },
  early: { name: 'Early', severity: 30, description: 'Starting to crave. Irritable.' },
  peak: { name: 'Peak', severity: 80, description: 'Severe symptoms. Desperate.' },
  late: { name: 'Late', severity: 50, description: 'Symptoms fading but still struggling.' },
  recovered: { name: 'Recovered', severity: 10, description: 'Clean and stable.' }
};

export default function CustomerManagement({ hunter, onClose }) {
  const queryClient = useQueryClient();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [showDialogue, setShowDialogue] = useState(false);
  
  // Lite mode disabled - this is a drug management system
  const isLiteMode = true; // Always disable this in production

  const { data: customers = [] } = useQuery({
    queryKey: ['drugCustomers'],
    queryFn: async () => {
      try {
        return await base44.entities.DrugCustomer.list('-total_spent');
      } catch {
        return [];
      }
    }
  });

  const calculateLoyaltyTier = (totalSpent) => {
    if (totalSpent >= 5000) return 'diamond';
    if (totalSpent >= 3000) return 'platinum';
    if (totalSpent >= 1500) return 'gold';
    if (totalSpent >= 500) return 'silver';
    return 'bronze';
  };

  const handleIntervention = async (customer, type) => {
    setProcessing(true);

    setTimeout(async () => {
      try {
        if (type === 'rehab') {
          const success = Math.random() < (customer.rehab_success_rate / 100 || 0.3);
          
          await base44.entities.DrugCustomer.update(customer.id, {
            in_rehab: true,
            rehab_attempts: (customer.rehab_attempts || 0) + 1,
            withdrawal_stage: 'early',
            withdrawal_severity: success ? 40 : 70,
            days_clean: success ? 7 : 0,
            life_status: success ? 'recovering' : 'declining',
            addiction_level: Math.max(0, customer.addiction_level - (success ? 30 : 10))
          });

          await base44.entities.NightLog.create({
            entry: `${hunter.name} sent ${customer.name} to rehab. ${success ? 'They\'re fighting to recover. Maybe there\'s hope.' : 'They\'re struggling. Addiction has its claws deep.'}`,
            category: 'dark_deed',
            intensity: 'significant'
          });

          setOutcome(success ? 
            `✨ ${customer.name} is in rehab.\n\nThey're trying. Seven days clean. The sweats are bad but they're holding on.\n\nAddiction reduced by 30%.\n\nWill they stay clean?` :
            `😔 ${customer.name} is in rehab.\n\nThey're not doing well. The cravings are winning. Staff says it's touch and go.\n\nAddiction reduced by 10%.\n\nNot looking good.`
          );
        } else if (type === 'force_addiction') {
          await base44.entities.DrugCustomer.update(customer.id, {
            addiction_level: Math.min(100, customer.addiction_level + 30),
            dealer_manipulation: Math.min(100, (customer.dealer_manipulation || 0) + 25),
            overdose_risk: Math.min(100, (customer.overdose_risk || 0) + 15),
            withdrawal_severity: Math.min(100, (customer.withdrawal_severity || 0) + 20),
            life_status: 'declining',
            rehab_success_rate: Math.max(0, (customer.rehab_success_rate || 30) - 10)
          });

          await base44.entities.NightLog.create({
            entry: `${hunter.name} deliberately increased ${customer.name}'s dependency. More product pushed. More control gained. ${customer.name} is trapped now.`,
            category: 'dark_deed',
            intensity: 'extreme'
          });

          setOutcome(`🔒 ${customer.name} is more dependent.\n\nYou gave them extra doses. "On the house," you said. They're yours now.\n\nAddiction +30%\nManipulation +25%\nOverdose Risk +15%\n\nThey won't leave.`);
        } else if (type === 'cut_off') {
          const daysClean = customer.days_clean || 0;
          const willRecover = daysClean > 14 || Math.random() < 0.4;

          await base44.entities.DrugCustomer.update(customer.id, {
            withdrawal_stage: 'peak',
            withdrawal_severity: 90,
            days_clean: daysClean + 1,
            violence_level: Math.min(100, (customer.violence_level || 0) + 40),
            life_status: willRecover ? 'recovering' : 'rock_bottom',
            addiction_level: Math.max(0, customer.addiction_level - 5)
          });

          await base44.entities.NightLog.create({
            entry: `${hunter.name} cut off ${customer.name}'s supply. Cold turkey. ${willRecover ? 'They\'re suffering but might make it.' : 'They\'re in hell. This might break them.'}`,
            category: 'dark_deed',
            intensity: 'significant'
          });

          setOutcome(willRecover ?
            `⚠️ ${customer.name} is in withdrawal.\n\nThey came begging. You said no. They screamed. They cried.\n\nNow they're shaking in an alley somewhere.\n\nViolence +40%\nWithdrawal: PEAK\n\nBut maybe... maybe they'll survive this.` :
            `💀 ${customer.name} is in hell.\n\nWithdrawal is destroying them. They're at rock bottom.\n\nYou might see them dead soon.\n\nViolence +40%\nLife Status: Rock Bottom`
          );
        } else if (type === 'loyalty_reward') {
          const tier = LOYALTY_TIERS[customer.loyalty_tier || 'bronze'];
          const reward = Math.floor(customer.total_spent * 0.1);

          await base44.entities.DrugCustomer.update(customer.id, {
            loyalty_points: (customer.loyalty_points || 0) + reward,
            friendship: Math.min(100, customer.friendship + 15),
            dealer_manipulation: Math.min(100, (customer.dealer_manipulation || 0) + 10)
          });

          await base44.entities.NightLog.create({
            entry: `${hunter.name} rewarded ${customer.name} with ${reward} loyalty points. ${tier.name} tier perks applied. Customer loyalty increased.`,
            category: 'interaction',
            intensity: 'moderate'
          });

          setOutcome(`⭐ ${customer.name} got loyalty rewards!\n\n${tier.icon} ${tier.name} Tier Benefits:\n${tier.benefits}\n\nBonus: ${reward} points\nFriendship +15%\n\nThey're grateful. They'll buy more.`);
        }

        queryClient.invalidateQueries(['drugCustomers']);

        setTimeout(() => {
          setProcessing(false);
          setOutcome('');
          setSelectedCustomer(null);
        }, 5000);
      } catch (e) {
        console.error('Intervention failed:', e);
        setProcessing(false);
      }
    }, 2000);
  };

  const handleOverdose = async (customer) => {
    const survived = Math.random() < (1 - customer.overdose_risk / 100);

    if (survived) {
      await base44.entities.DrugCustomer.update(customer.id, {
        overdose_count: (customer.overdose_count || 0) + 1,
        overdose_risk: Math.min(100, (customer.overdose_risk || 0) + 20),
        life_status: 'rock_bottom',
        addiction_level: Math.max(0, customer.addiction_level - 15),
        withdrawal_stage: 'peak',
        family_concern: Math.min(100, (customer.family_concern || 0) + 30)
      });

      await base44.entities.NightLog.create({
        entry: `${customer.name} overdosed. They survived. Barely. ${customer.name} is shaken. Family is terrified.`,
        category: 'dark_deed',
        intensity: 'extreme'
      });

      setOutcome(`💉 ${customer.name} overdosed.\n\nThey collapsed. Ambulance came. Touch and go.\n\nThey made it. Barely.\n\nOverdoses: ${(customer.overdose_count || 0) + 1}\nFamily Concern +30%\n\nClose call.`);
    } else {
      await base44.entities.DrugCustomer.delete(customer.id);

      await base44.entities.NightLog.create({
        entry: `${customer.name} overdosed and died. Gone. Another casualty of ${hunter.name}'s operation.`,
        category: 'dark_deed',
        intensity: 'extreme'
      });

      setOutcome(`💀 ${customer.name} is dead.\n\nThey took too much. Heart stopped. No coming back.\n\nCustomer lost permanently.\n\nBlood on your hands.`);
    }

    queryClient.invalidateQueries(['drugCustomers']);

    setTimeout(() => {
      setProcessing(false);
      setOutcome('');
      setSelectedCustomer(null);
    }, 5000);
  };

  if (processing && outcome) {
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
            className="text-red-200 text-base leading-relaxed whitespace-pre-line"
          >
            {outcome}
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  if (processing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      >
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }}>
          <span className="text-4xl">💊</span>
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
        className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-purple-500/50"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-purple-100 mb-1">👥 Customer Management</h2>
            <p className="text-purple-300 text-sm">Loyalty programs, addiction control, interventions</p>
          </div>
          <button onClick={onClose} className="text-purple-300 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {!selectedCustomer ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-black/40 rounded-lg p-4 border border-purple-500/30">
                <p className="text-purple-400 text-xs mb-1">Total Customers</p>
                <p className="text-white font-bold text-2xl">{customers.length}</p>
              </div>
              <div className="bg-black/40 rounded-lg p-4 border border-yellow-500/30">
                <p className="text-yellow-400 text-xs mb-1">VIP Customers</p>
                <p className="text-white font-bold text-2xl">{customers.filter(c => (c.total_spent || 0) >= 1500).length}</p>
              </div>
              <div className="bg-black/40 rounded-lg p-4 border border-red-500/30">
                <p className="text-red-400 text-xs mb-1">High Risk</p>
                <p className="text-white font-bold text-2xl">{customers.filter(c => (c.overdose_risk || 0) > 70).length}</p>
              </div>
              <div className="bg-black/40 rounded-lg p-4 border border-green-500/30">
                <p className="text-green-400 text-xs mb-1">In Rehab</p>
                <p className="text-white font-bold text-2xl">{customers.filter(c => c.in_rehab).length}</p>
              </div>
            </div>

            <div className="space-y-3">
              {customers.map(customer => {
                const tier = LOYALTY_TIERS[calculateLoyaltyTier(customer.total_spent || 0)];
                const withdrawal = WITHDRAWAL_STAGES[customer.withdrawal_stage || 'none'];
                
                return (
                  <motion.div
                    key={customer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:bg-gray-800/70 transition-colors cursor-pointer"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-bold">{customer.name}</h4>
                          <span className="text-xl">{tier.icon}</span>
                          {customer.in_rehab && <span className="text-xs bg-green-600 px-2 py-1 rounded">REHAB</span>}
                          {(customer.overdose_risk || 0) > 70 && <span className="text-xs bg-red-600 px-2 py-1 rounded">HIGH RISK</span>}
                        </div>
                        <p className="text-gray-400 text-xs capitalize">{customer.customer_type} • {tier.name} Tier</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold">${customer.total_spent || 0}</p>
                        <p className="text-gray-400 text-xs">{customer.purchase_count || 0} purchases</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-xs mb-2">
                      <div className="bg-black/40 rounded p-2">
                        <p className="text-gray-400">Addiction</p>
                        <p className="text-red-300 font-bold">{Math.round(customer.addiction_level || 0)}%</p>
                      </div>
                      <div className="bg-black/40 rounded p-2">
                        <p className="text-gray-400">Withdrawal</p>
                        <p className="text-yellow-300 font-bold">{withdrawal.name}</p>
                      </div>
                      <div className="bg-black/40 rounded p-2">
                        <p className="text-gray-400">OD Risk</p>
                        <p className="text-red-300 font-bold">{Math.round(customer.overdose_risk || 0)}%</p>
                      </div>
                      <div className="bg-black/40 rounded p-2">
                        <p className="text-gray-400">Loyalty</p>
                        <p className="text-purple-300 font-bold">{Math.round(customer.loyalty_points || 0)}</p>
                      </div>
                    </div>

                    {customer.life_status && (
                      <p className={`text-xs ${
                        customer.life_status === 'stable' ? 'text-green-400' :
                        customer.life_status === 'declining' ? 'text-yellow-400' :
                        customer.life_status === 'rock_bottom' ? 'text-red-400' :
                        'text-blue-400'
                      }`}>
                        Status: {customer.life_status}
                      </p>
                    )}
                  </motion.div>
                );
              })}

              {customers.length === 0 && (
                <p className="text-gray-400 text-center py-8">No customers yet</p>
              )}
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <button
              onClick={() => setSelectedCustomer(null)}
              className="text-purple-400 hover:text-purple-300 mb-4 text-sm"
            >
              ← Back to customers
            </button>

            <div className="bg-black/40 rounded-xl p-6 border border-purple-500/30 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{selectedCustomer.name}</h3>
                  <p className="text-gray-400 capitalize">{selectedCustomer.customer_type} customer</p>
                </div>
                <span className="text-4xl">{LOYALTY_TIERS[calculateLoyaltyTier(selectedCustomer.total_spent || 0)].icon}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-xs">Total Spent</p>
                  <p className="text-green-400 font-bold text-lg">${selectedCustomer.total_spent || 0}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-xs">Purchases</p>
                  <p className="text-white font-bold text-lg">{selectedCustomer.purchase_count || 0}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-xs">Loyalty Points</p>
                  <p className="text-purple-400 font-bold text-lg">{selectedCustomer.loyalty_points || 0}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-xs">Addiction Level</p>
                  <p className="text-red-400 font-bold text-lg">{Math.round(selectedCustomer.addiction_level || 0)}%</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-xs">Overdose Risk</p>
                  <p className="text-red-400 font-bold text-lg">{Math.round(selectedCustomer.overdose_risk || 0)}%</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-xs">Days Clean</p>
                  <p className="text-blue-400 font-bold text-lg">{Math.round(selectedCustomer.days_clean || 0)}</p>
                </div>
              </div>

              {selectedCustomer.withdrawal_stage !== 'none' && (
                <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-3 mb-4">
                  <p className="text-yellow-300 text-sm font-bold mb-1">⚠️ Withdrawal: {WITHDRAWAL_STAGES[selectedCustomer.withdrawal_stage].name}</p>
                  <p className="text-yellow-200 text-xs">{WITHDRAWAL_STAGES[selectedCustomer.withdrawal_stage].description}</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="text-white font-bold mb-3">Actions</h4>

              <button
                onClick={() => setShowDialogue(true)}
                className="w-full bg-gradient-to-r from-purple-900/60 to-purple-950/60 hover:from-purple-900/80 hover:to-purple-950/80 border border-purple-500/30 rounded-lg p-4 text-left transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-white font-bold mb-1">💬 Start Conversation</h5>
                    <p className="text-purple-300 text-xs">Talk with them. Negotiate, manipulate, or build trust.</p>
                  </div>
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                </div>
              </button>

              <button
                onClick={() => handleIntervention(selectedCustomer, 'rehab')}
                className="w-full bg-gradient-to-r from-green-900/60 to-green-950/60 hover:from-green-900/80 hover:to-green-950/80 border border-green-500/30 rounded-lg p-4 text-left transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-white font-bold mb-1">🏥 Send to Rehab</h5>
                    <p className="text-green-300 text-xs">Give them a chance to recover. Reduces addiction but may fail.</p>
                  </div>
                  <Heart className="w-5 h-5 text-green-400" />
                </div>
              </button>

              <button
                onClick={() => handleIntervention(selectedCustomer, 'force_addiction')}
                className="w-full bg-gradient-to-r from-red-900/60 to-red-950/60 hover:from-red-900/80 hover:to-red-950/80 border border-red-500/30 rounded-lg p-4 text-left transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-white font-bold mb-1">💉 Increase Dependency</h5>
                    <p className="text-red-300 text-xs">Push more product. Increase their addiction. Control them.</p>
                  </div>
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
              </button>

              <button
                onClick={() => handleIntervention(selectedCustomer, 'cut_off')}
                className="w-full bg-gradient-to-r from-orange-900/60 to-orange-950/60 hover:from-orange-900/80 hover:to-orange-950/80 border border-orange-500/30 rounded-lg p-4 text-left transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-white font-bold mb-1">🚫 Cut Off Supply</h5>
                    <p className="text-orange-300 text-xs">Stop selling to them. Cold turkey. Dangerous withdrawal.</p>
                  </div>
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                </div>
              </button>

              <button
                onClick={() => handleIntervention(selectedCustomer, 'loyalty_reward')}
                disabled={(selectedCustomer.total_spent || 0) < 500}
                className="w-full bg-gradient-to-r from-purple-900/60 to-purple-950/60 hover:from-purple-900/80 hover:to-purple-950/80 border border-purple-500/30 rounded-lg p-4 text-left transition-all disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-white font-bold mb-1">⭐ Loyalty Reward</h5>
                    <p className="text-purple-300 text-xs">Give them bonus points. Increase friendship and manipulation.</p>
                  </div>
                  <Star className="w-5 h-5 text-purple-400" />
                </div>
              </button>

              {(selectedCustomer.overdose_risk || 0) > 50 && (
                <button
                  onClick={() => handleOverdose(selectedCustomer)}
                  className="w-full bg-gradient-to-r from-gray-900/60 to-black/60 hover:from-gray-900/80 hover:to-black/80 border border-gray-500/30 rounded-lg p-4 text-left transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-white font-bold mb-1">💀 Trigger Overdose Event</h5>
                      <p className="text-gray-300 text-xs">They're high risk. This could go very wrong. Potentially fatal.</p>
                    </div>
                    <Skull className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
              )}
            </div>
          </motion.div>
        )}

        {showDialogue && selectedCustomer && (
          <CustomerDialogue 
            customer={selectedCustomer}
            hunter={hunter}
            onClose={() => {
              setShowDialogue(false);
              setSelectedCustomer(null);
              queryClient.invalidateQueries(['drugCustomers']);
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}