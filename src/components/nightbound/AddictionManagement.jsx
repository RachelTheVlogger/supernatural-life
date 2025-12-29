import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Heart, TrendingDown, Skull } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function AddictionManagement({ customers, operation, onClose }) {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');

  const handleWithdrawalSupport = async (customer) => {
    setProcessing(true);

    setTimeout(async () => {
      const supportOutcomes = [
        {
          text: `You help ${customer.name} through withdrawal. Provide comfort. Clean supplies. They're grateful. Addiction reduced.`,
          addictionChange: -25,
          friendshipChange: 30,
          daysClean: 7,
          humanity: 5
        },
        {
          text: `${customer.name} is suffering. You guide them gently. They trust you more now. Starting to recover.`,
          addictionChange: -15,
          friendshipChange: 20,
          daysClean: 3,
          humanity: 3
        },
        {
          text: `Withdrawal support session. ${customer.name} is in pain but you help them through it. Real progress made.`,
          addictionChange: -20,
          friendshipChange: 25,
          daysClean: 5,
          humanity: 4
        }
      ];

      const result = supportOutcomes[Math.floor(Math.random() * supportOutcomes.length)];
      setOutcome(result.text);

      await base44.entities.DrugCustomer.update(customer.id, {
        addiction_level: Math.max(0, customer.addiction_level - result.addictionChange),
        friendship: Math.min(100, (customer.friendship || 0) + result.friendshipChange),
        days_clean: (customer.days_clean || 0) + result.daysClean,
        overdose_risk: Math.max(0, (customer.overdose_risk || 0) - 20),
        life_status: customer.addiction_level - result.addictionChange < 30 ? 'recovering' : customer.life_status
      });

      await base44.entities.DrugOperation.update(operation.id, {
        moral_compass: Math.min(100, (operation.moral_compass || 50) + 10)
      });

      await base44.entities.NightLog.create({
        entry: `Helped ${customer.name} with withdrawal. They're recovering.`,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 4000);
    }, 2000);
  };

  const handleOverdose = async (customer) => {
    setProcessing(true);

    setTimeout(async () => {
      const survivalChance = Math.max(20, 100 - customer.overdose_risk);
      const survived = Math.random() * 100 < survivalChance;

      if (survived) {
        const outcomes = [
          `${customer.name} overdosed. You found them barely breathing. Called ambulance. They survived. Barely.`,
          `OVERDOSE. ${customer.name} collapsed. You performed CPR. They gasped back to life. Close call.`,
          `${customer.name} took too much. Convulsing. You stayed with them. Talked them through it. They made it.`
        ];

        setOutcome(outcomes[Math.floor(Math.random() * outcomes.length)]);

        await base44.entities.DrugCustomer.update(customer.id, {
          overdose_risk: Math.max(0, customer.overdose_risk - 30),
          addiction_level: Math.max(0, customer.addiction_level - 15),
          life_status: 'rock_bottom',
          friendship: Math.min(100, (customer.friendship || 0) + 15),
          days_clean: 1
        });

        await base44.entities.DrugOperation.update(operation.id, {
          heat_level: Math.min(100, (operation.heat_level || 0) + 10)
        });
      } else {
        const deathOutcomes = [
          `${customer.name} didn't make it. Overdose. You find their body cold. Another life taken by your product.`,
          `FATAL OVERDOSE. ${customer.name} is gone. Their family will never know why. Blood on your hands.`,
          `${customer.name} died alone. Your drugs killed them. The weight of this settles on your soul.`
        ];

        setOutcome(deathOutcomes[Math.floor(Math.random() * deathOutcomes.length)]);

        await base44.entities.DrugCustomer.delete(customer.id);

        await base44.entities.DrugOperation.update(operation.id, {
          heat_level: Math.min(100, (operation.heat_level || 0) + 25),
          reputation: Math.max(0, (operation.reputation || 0) - 15),
          casualties: (operation.casualties || 0) + 1,
          lives_ruined: (operation.lives_ruined || 0) + 1,
          moral_compass: Math.max(0, (operation.moral_compass || 50) - 20)
        });
      }

      await base44.entities.NightLog.create({
        entry: survived 
          ? `${customer.name} overdosed but survived. Close call.`
          : `${customer.name} died from overdose. Another casualty.`,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 5000);
    }, 2000);
  };

  const handleIntervention = async (customer) => {
    setProcessing(true);

    setTimeout(async () => {
      const interventionResults = [
        {
          text: `You sit ${customer.name} down. "This is killing you," you say. They cry. Agree to get help. You lost a customer but maybe saved a life.`,
          success: true,
          addictionChange: -40,
          remove: true
        },
        {
          text: `Intervention. ${customer.name} refuses to listen. "You're my dealer, not my therapist." They leave angry. But you tried.`,
          success: false,
          addictionChange: 0,
          remove: false
        },
        {
          text: `You offer ${customer.name} rehab options. Free treatment. They're shocked you care. Accept your help. There's hope.`,
          success: true,
          addictionChange: -50,
          remove: true
        }
      ];

      const result = interventionResults[Math.floor(Math.random() * interventionResults.length)];
      setOutcome(result.text);

      if (result.remove) {
        await base44.entities.DrugCustomer.delete(customer.id);
      } else {
        await base44.entities.DrugCustomer.update(customer.id, {
          addiction_level: Math.max(0, customer.addiction_level + result.addictionChange),
          friendship: result.success 
            ? Math.min(100, (customer.friendship || 0) + 20)
            : Math.max(0, (customer.friendship || 0) - 30)
        });
      }

      await base44.entities.DrugOperation.update(operation.id, {
        moral_compass: Math.min(100, (operation.moral_compass || 50) + (result.success ? 25 : 10)),
        lives_ruined: result.success ? Math.max(0, (operation.lives_ruined || 0) - 1) : operation.lives_ruined
      });

      await base44.entities.NightLog.create({
        entry: result.text,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 5000);
    }, 2000);
  };

  const criticalCustomers = customers.filter(c => 
    (c.overdose_risk || 0) > 50 || 
    (c.addiction_level || 0) > 70 ||
    (c.life_status && c.life_status !== 'stable')
  );

  return (
    <div className="space-y-4">
      <div className="bg-red-950/30 border border-red-500/50 rounded-xl p-4">
        <h3 className="text-white font-bold mb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Critical Cases
        </h3>
        <p className="text-gray-400 text-sm">
          {criticalCustomers.length} customers need immediate attention
        </p>
      </div>

      {criticalCustomers.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No critical cases currently</p>
      ) : (
        <div className="space-y-3 max-h-[55vh] overflow-y-auto">
          {criticalCustomers.map(customer => (
            <div key={customer.id} className="bg-gray-800 rounded-xl p-4 border-2 border-red-500/30">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-white font-bold">{customer.name}</h4>
                  <p className="text-gray-400 text-sm capitalize">{customer.customer_type}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {(customer.overdose_risk || 0) > 50 && (
                      <span className="text-xs bg-red-900/40 text-red-300 px-2 py-1 rounded flex items-center gap-1">
                        <Skull className="w-3 h-3" />
                        OD Risk: {customer.overdose_risk}%
                      </span>
                    )}
                    {(customer.addiction_level || 0) > 70 && (
                      <span className="text-xs bg-orange-900/40 text-orange-300 px-2 py-1 rounded">
                        Severely Addicted: {customer.addiction_level}%
                      </span>
                    )}
                    {customer.life_status && customer.life_status !== 'stable' && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        customer.life_status === 'recovering' ? 'bg-green-900/40 text-green-300' :
                        customer.life_status === 'declining' ? 'bg-yellow-900/40 text-yellow-300' :
                        'bg-red-900/40 text-red-300'
                      }`}>
                        {customer.life_status}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(customer.overdose_risk || 0) > 50 && (
                  <button
                    onClick={() => handleOverdose(customer)}
                    disabled={processing}
                    className="bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 text-white py-2 rounded-lg text-xs transition-colors disabled:opacity-50"
                  >
                    <Skull className="w-3 h-3 mx-auto mb-1" />
                    Overdose
                  </button>
                )}
                {(customer.addiction_level || 0) > 40 && (
                  <button
                    onClick={() => handleWithdrawalSupport(customer)}
                    disabled={processing}
                    className="bg-blue-900/40 hover:bg-blue-900/60 border border-blue-500/30 text-white py-2 rounded-lg text-xs transition-colors disabled:opacity-50"
                  >
                    <Heart className="w-3 h-3 mx-auto mb-1" />
                    Support
                  </button>
                )}
                {(customer.addiction_level || 0) > 60 && (
                  <button
                    onClick={() => handleIntervention(customer)}
                    disabled={processing}
                    className="bg-green-900/40 hover:bg-green-900/60 border border-green-500/30 text-white py-2 rounded-lg text-xs transition-colors disabled:opacity-50"
                  >
                    <TrendingDown className="w-3 h-3 mx-auto mb-1" />
                    Intervene
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {processing && outcome && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-black/60 rounded-xl p-6 border border-purple-500/30"
          >
            <p className="text-gray-300 text-base leading-relaxed whitespace-pre-line">
              {outcome}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {processing && !outcome && (
        <div className="text-center py-8">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl mb-4"
          >
            💊
          </motion.div>
          <p className="text-gray-400">Processing...</p>
        </div>
      )}
    </div>
  );
}