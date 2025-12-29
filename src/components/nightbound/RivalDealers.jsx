import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Shield, DollarSign, Target, Zap, Skull } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const RIVAL_ACTIONS = [
  { 
    id: 'sabotage', 
    name: 'Sabotage Their Supply',
    icon: Zap,
    desc: 'Contaminate or destroy their product',
    threatChange: -20,
    repChange: 10,
    heatChange: 5,
    cost: 0
  },
  { 
    id: 'steal_customers', 
    name: 'Steal Their Customers',
    icon: DollarSign,
    desc: 'Offer better deals to their clients',
    threatChange: -15,
    repChange: 15,
    heatChange: 0,
    cost: 500
  },
  { 
    id: 'territorial_war', 
    name: 'Declare Territory War',
    icon: Swords,
    desc: 'Aggressive expansion into their turf',
    threatChange: -30,
    repChange: 25,
    heatChange: 20,
    cost: 0,
    risky: true
  },
  { 
    id: 'negotiate', 
    name: 'Negotiate Peace',
    icon: Shield,
    desc: 'Split territory peacefully',
    threatChange: -40,
    repChange: -5,
    heatChange: -10,
    cost: 1000
  },
  { 
    id: 'eliminate', 
    name: 'Eliminate Rival',
    icon: Skull,
    desc: 'Permanent solution. Extremely dangerous.',
    threatChange: -100,
    repChange: 40,
    heatChange: 40,
    cost: 0,
    extreme: true
  }
];

export default function RivalDealers({ operation, vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [selectedRival, setSelectedRival] = useState(null);

  // Create rival if none exists and threat is high
  React.useEffect(() => {
    const createRival = async () => {
      if ((operation?.rival_threat || 0) > 30 && !selectedRival) {
        const rivalNames = ['Viktor the Vicious', 'Scarlet Fang', 'The Chemist', 'Razor', 'Nightshade', 'Blood Baron'];
        const name = rivalNames[Math.floor(Math.random() * rivalNames.length)];
        setSelectedRival({
          name,
          territory: Math.floor(Math.random() * 30) + 20,
          reputation: Math.floor(Math.random() * 40) + 30,
          aggression: Math.floor(Math.random() * 50) + 30
        });
      }
    };
    createRival();
  }, [operation?.rival_threat, selectedRival]);

  const handleRivalAction = async (action) => {
    if (!operation) return;
    
    setProcessing(true);

    setTimeout(async () => {
      const outcomes = {
        sabotage: [
          `You sabotaged ${selectedRival.name}'s supply. Their customers got sick. Word spreads. They know it was you.`,
          `Contaminated rival's product. They lost customers. You gained territory. Ruthless but effective.`,
          `You destroyed ${selectedRival.name}'s lab. Explosions. Fire. They'll rebuild but you've sent a message.`
        ],
        steal_customers: [
          `Offered better prices. ${selectedRival.name}'s customers switched to you. Market dominance growing.`,
          `You provide superior product. Their clients defect. ${selectedRival.name} is losing control.`,
          `Aggressive marketing. You steal 60% of their customer base. They're weakened.`
        ],
        territorial_war: [
          `WAR. You and ${selectedRival.name} fight for territory. Blood spilled. You won. Barely. Casualties on both sides.`,
          `Turf war. Violent. ${selectedRival.name} fought hard but you're stronger. Territory expanded. Police attention increased.`,
          `All-out war. You crushed ${selectedRival.name}'s operation. Their dealers flee. You rule this territory now.`
        ],
        negotiate: [
          `Peace talks. ${selectedRival.name} agrees to split territory. You both benefit. No more conflict. For now.`,
          `Negotiation successful. You keep your turf, they keep theirs. Uneasy alliance formed.`,
          `You and ${selectedRival.name} reach agreement. Territory divided. Competition becomes cooperation.`
        ],
        eliminate: [
          `You killed ${selectedRival.name}. Quick. Clean. Their operation collapsed. You absorbed everything. But the cost... the weight of murder settles on you.`,
          `ELIMINATION. ${selectedRival.name} is gone. You made it look like an accident. Their dealers now work for you. Empire expanded. Humanity lost.`,
          `Final solution. ${selectedRival.name} dead. No witnesses. You control everything now. But you see their face when you close your eyes.`
        ]
      };

      const result = outcomes[action.id][Math.floor(Math.random() * outcomes[action.id].length)];
      setOutcome(result);

      const newThreat = Math.max(0, (operation.rival_threat || 0) + action.threatChange);
      const updates = {
        rival_threat: newThreat,
        reputation: Math.min(100, Math.max(0, (operation.reputation || 0) + action.repChange)),
        heat_level: Math.min(100, Math.max(0, (operation.heat_level || 0) + action.heatChange)),
        moral_compass: action.extreme 
          ? Math.max(0, (operation.moral_compass || 50) - 30)
          : (operation.moral_compass || 50)
      };

      if (action.id === 'territorial_war' || action.id === 'sabotage') {
        updates.territory_control = Math.min(100, (operation.territory_control || 50) + 15);
      }

      if (action.id === 'eliminate') {
        updates.casualties = (operation.casualties || 0) + 1;
      }

      await base44.entities.DrugOperation.update(operation.id, updates);

      if (action.extreme && vampireState) {
        await base44.entities.VampireState.update(vampireState.id, {
          humanity: Math.max(0, (vampireState.humanity || 50) - 15)
        });
      }

      await base44.entities.NightLog.create({
        entry: result,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
        if (newThreat === 0) setSelectedRival(null);
      }, 5000);
    }, 2500);
  };

  if (!operation || (operation.rival_threat || 0) < 30) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No rival threats currently</p>
        <p className="text-gray-500 text-sm mt-2">
          Rivals appear when your territory control or reputation grows
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Rival Info */}
      {selectedRival && (
        <div className="bg-gradient-to-br from-red-950/40 to-orange-950/40 border-2 border-red-500/50 rounded-xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-white font-bold text-lg mb-1">{selectedRival.name}</h3>
              <p className="text-gray-400 text-sm">Rival Drug Lord</p>
            </div>
            <div className="text-4xl">⚔️</div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-gray-400 text-xs">Territory</p>
              <p className="text-white font-bold">{selectedRival.territory}%</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Reputation</p>
              <p className="text-white font-bold">{selectedRival.reputation}%</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Aggression</p>
              <p className="text-red-400 font-bold">{selectedRival.aggression}%</p>
            </div>
          </div>
          <div className="mt-3 bg-black/40 rounded-lg p-2">
            <p className="text-orange-400 text-sm">
              ⚠️ Threat Level: {operation.rival_threat}%
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      {!processing && !outcome && (
        <div className="space-y-3">
          <h4 className="text-white font-bold">Choose Your Response</h4>
          {RIVAL_ACTIONS.map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => handleRivalAction(action)}
                className={`w-full rounded-xl p-4 text-left transition-all ${
                  action.extreme 
                    ? 'bg-red-950/60 hover:bg-red-950/80 border-2 border-red-500'
                    : action.risky
                    ? 'bg-orange-950/40 hover:bg-orange-950/60 border border-orange-500/30'
                    : 'bg-gray-800 hover:bg-gray-700 border border-gray-600/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-1 ${
                    action.extreme ? 'text-red-400' :
                    action.risky ? 'text-orange-400' :
                    'text-purple-400'
                  }`} />
                  <div className="flex-1">
                    <h5 className="text-white font-bold mb-1">{action.name}</h5>
                    <p className="text-gray-400 text-sm mb-2">{action.desc}</p>
                    <div className="flex gap-3 text-xs flex-wrap">
                      <span className={action.threatChange < 0 ? 'text-green-400' : 'text-red-400'}>
                        Threat: {action.threatChange > 0 ? '+' : ''}{action.threatChange}%
                      </span>
                      <span className={action.repChange > 0 ? 'text-green-400' : 'text-red-400'}>
                        Rep: {action.repChange > 0 ? '+' : ''}{action.repChange}%
                      </span>
                      <span className={action.heatChange > 0 ? 'text-red-400' : 'text-green-400'}>
                        Heat: {action.heatChange > 0 ? '+' : ''}{action.heatChange}%
                      </span>
                      {action.cost > 0 && <span className="text-yellow-400">Cost: ${action.cost}</span>}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Processing Animation */}
      {processing && !outcome && (
        <div className="text-center py-12">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            ⚔️
          </motion.div>
          <p className="text-red-400">Handling rival...</p>
        </div>
      )}

      {/* Outcome Display */}
      <AnimatePresence>
        {outcome && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-black/60 rounded-xl p-6 border border-red-500/50"
          >
            <p className="text-red-100 text-base leading-relaxed">
              {outcome}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}