import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Shield, Zap, Heart, X, Skull, Target, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function HunterVampireCombat({ hunter, vampire, onClose, onVictory, onDefeat }) {
  const queryClient = useQueryClient();
  
  // Combat state
  const [hunterHP, setHunterHP] = useState(100);
  const [vampireHP, setVampireHP] = useState(100);
  const [turn, setTurn] = useState('hunter'); // 'hunter' or 'vampire'
  const [combatLog, setCombatLog] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [combatOver, setCombatOver] = useState(false);
  const [outcome, setOutcome] = useState(null); // 'victory' or 'defeat'
  const [selectedAction, setSelectedAction] = useState(null);

  // Calculate combat stats
  const hunterAttack = Math.floor((hunter.skill_level || 50) * 0.8);
  const hunterDefense = Math.floor((hunter.skill_level || 50) * 0.6);
  const vampirePower = Math.floor((vampire.vampire_power_level || 50) * 0.7);
  const vampireDefense = Math.floor((vampire.vampire_power_level || 50) * 0.5);

  // Get hunter's equipped items and skills
  const hasStake = hunter.unlocked_skills?.includes('silver_weapons');
  const hasUVGrenades = hunter.unlocked_skills?.includes('uv_grenades');
  const hasAdvancedCombat = hunter.unlocked_skills?.includes('advanced_combat');

  const addLog = (message, type = 'info') => {
    setCombatLog(prev => [...prev, { message, type, timestamp: Date.now() }]);
  };

  const calculateDamage = (attacker, defender, actionType) => {
    let baseDamage = attacker === 'hunter' ? hunterAttack : vampirePower;
    
    // Modifiers
    if (actionType === 'stake' && hasStake) baseDamage *= 2;
    if (actionType === 'uv_grenade' && hasUVGrenades) baseDamage *= 1.5;
    if (actionType === 'advanced_attack' && hasAdvancedCombat) baseDamage *= 1.3;
    
    // Random variance
    const variance = Math.random() * 0.4 - 0.2; // -20% to +20%
    baseDamage = Math.floor(baseDamage * (1 + variance));
    
    // Defense reduction
    const defense = defender === 'hunter' ? hunterDefense : vampireDefense;
    const finalDamage = Math.max(5, baseDamage - Math.floor(defense * 0.3));
    
    return finalDamage;
  };

  const hunterAction = async (actionType) => {
    if (isProcessing || combatOver || turn !== 'hunter') return;
    
    setIsProcessing(true);
    setSelectedAction(actionType);
    
    let damage = 0;
    let logMessage = '';

    switch (actionType) {
      case 'attack':
        damage = calculateDamage('hunter', 'vampire', 'basic');
        logMessage = `You strike at the vampire! Dealt ${damage} damage.`;
        setVampireHP(prev => Math.max(0, prev - damage));
        addLog(logMessage, 'hunter');
        break;
      
      case 'stake':
        if (hasStake) {
          damage = calculateDamage('hunter', 'vampire', 'stake');
          logMessage = `You drive a silver stake toward their heart! Dealt ${damage} damage!`;
          setVampireHP(prev => Math.max(0, prev - damage));
          addLog(logMessage, 'hunter');
        } else {
          logMessage = 'You need silver weapons skill!';
          addLog(logMessage, 'error');
        }
        break;
      
      case 'uv_grenade':
        if (hasUVGrenades) {
          damage = calculateDamage('hunter', 'vampire', 'uv_grenade');
          logMessage = `UV grenade explodes in brilliant light! Dealt ${damage} damage!`;
          setVampireHP(prev => Math.max(0, prev - damage));
          addLog(logMessage, 'hunter');
        } else {
          logMessage = 'You need UV grenades skill!';
          addLog(logMessage, 'error');
        }
        break;
      
      case 'defend':
        logMessage = 'You brace for the vampire\'s attack. Defense increased!';
        addLog(logMessage, 'hunter');
        break;
      
      case 'heal':
        const healAmount = 20;
        setHunterHP(prev => Math.min(100, prev + healAmount));
        logMessage = `You use a first aid kit. Restored ${healAmount} HP.`;
        addLog(logMessage, 'hunter');
        break;
    }

    setTimeout(() => {
      setSelectedAction(null);
      
      // Check if vampire is defeated
      if (vampireHP - damage <= 0) {
        endCombat('victory');
      } else {
        // Vampire's turn
        setTurn('vampire');
        vampireTurn();
      }
      setIsProcessing(false);
    }, 1500);
  };

  const vampireTurn = () => {
    setTimeout(() => {
      const actions = ['bite', 'claw', 'hypnosis'];
      const action = actions[Math.floor(Math.random() * actions.length)];
      
      let damage = 0;
      let logMessage = '';

      switch (action) {
        case 'bite':
          damage = calculateDamage('vampire', 'hunter', 'bite');
          logMessage = `The vampire lunges and bites! You take ${damage} damage.`;
          setHunterHP(prev => Math.max(0, prev - damage));
          addLog(logMessage, 'vampire');
          break;
        
        case 'claw':
          damage = calculateDamage('vampire', 'hunter', 'claw');
          logMessage = `Razor-sharp claws slash at you! You take ${damage} damage.`;
          setHunterHP(prev => Math.max(0, prev - damage));
          addLog(logMessage, 'vampire');
          break;
        
        case 'hypnosis':
          damage = Math.floor(calculateDamage('vampire', 'hunter', 'hypnosis') * 0.7);
          logMessage = `The vampire's eyes glow red, attempting to hypnotize you! You take ${damage} psychic damage.`;
          setHunterHP(prev => Math.max(0, prev - damage));
          addLog(logMessage, 'vampire');
          break;
      }

      setTimeout(() => {
        // Check if hunter is defeated
        if (hunterHP - damage <= 0) {
          endCombat('defeat');
        } else {
          setTurn('hunter');
        }
      }, 1000);
    }, 1000);
  };

  const endCombat = async (result) => {
    setCombatOver(true);
    setOutcome(result);

    if (result === 'victory') {
      addLog('Victory! The vampire has been defeated!', 'victory');
      
      // Award experience
      const expGain = Math.floor(50 + (vampire.vampire_power_level || 50));
      await base44.entities.Hunter.update(hunter.id, {
        experience: (hunter.experience || 0) + expGain,
        vampires_killed: (hunter.vampires_killed || 0) + 1
      });

      // Log the victory
      await base44.entities.NightLog.create({
        entry: `${hunter.name} defeated ${vampire.vampire_name} in combat. (+${expGain} EXP)`,
        category: 'hunting',
        intensity: 'high'
      });

      queryClient.invalidateQueries();
      
      if (onVictory) onVictory();
    } else {
      addLog('Defeat... The vampire was too powerful.', 'defeat');
      
      // Update hunter status
      await base44.entities.Hunter.update(hunter.id, {
        morale: Math.max(0, (hunter.morale || 100) - 20)
      });

      await base44.entities.NightLog.create({
        entry: `${hunter.name} was defeated by ${vampire.vampire_name} in combat.`,
        category: 'hunting',
        intensity: 'high'
      });

      if (onDefeat) onDefeat();
    }
  };

  const actions = [
    { id: 'attack', name: 'Attack', icon: Sword, desc: `Deal ${hunterAttack} damage`, enabled: true },
    { id: 'stake', name: 'Silver Stake', icon: Target, desc: 'High damage to vampires', enabled: hasStake },
    { id: 'uv_grenade', name: 'UV Grenade', icon: Zap, desc: 'Area damage', enabled: hasUVGrenades },
    { id: 'defend', name: 'Defend', icon: Shield, desc: 'Reduce incoming damage', enabled: true },
    { id: 'heal', name: 'First Aid', icon: Heart, desc: 'Restore 20 HP', enabled: true }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-red-500/50"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <Sword className="w-8 h-8 text-red-500" />
            Combat
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Combat Arena */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Hunter Stats */}
          <motion.div
            animate={turn === 'hunter' && !combatOver ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
            className={`bg-gradient-to-br from-blue-900/40 to-blue-950/40 rounded-2xl p-6 border-2 ${
              turn === 'hunter' && !combatOver ? 'border-blue-500' : 'border-blue-900/50'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl">{hunter.name}</h3>
                <p className="text-blue-300 text-sm capitalize">{hunter.specialty}</p>
              </div>
            </div>

            {/* HP Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">HP</span>
                <span className="text-white font-bold">{hunterHP}/100</span>
              </div>
              <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: `${hunterHP}%` }}
                  className={`h-full ${
                    hunterHP > 60 ? 'bg-green-500' : hunterHP > 30 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/40 rounded-lg p-3">
                <p className="text-gray-400 text-xs mb-1">Attack</p>
                <p className="text-white font-bold text-lg">{hunterAttack}</p>
              </div>
              <div className="bg-black/40 rounded-lg p-3">
                <p className="text-gray-400 text-xs mb-1">Defense</p>
                <p className="text-white font-bold text-lg">{hunterDefense}</p>
              </div>
            </div>
          </motion.div>

          {/* Vampire Stats */}
          <motion.div
            animate={turn === 'vampire' && !combatOver ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
            className={`bg-gradient-to-br from-red-900/40 to-red-950/40 rounded-2xl p-6 border-2 ${
              turn === 'vampire' && !combatOver ? 'border-red-500' : 'border-red-900/50'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                <Skull className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl">{vampire.vampire_name}</h3>
                <p className="text-red-300 text-sm">Vampire</p>
              </div>
            </div>

            {/* HP Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">HP</span>
                <span className="text-white font-bold">{vampireHP}/100</span>
              </div>
              <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: `${vampireHP}%` }}
                  className={`h-full ${
                    vampireHP > 60 ? 'bg-red-500' : vampireHP > 30 ? 'bg-orange-500' : 'bg-red-700'
                  }`}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/40 rounded-lg p-3">
                <p className="text-gray-400 text-xs mb-1">Power</p>
                <p className="text-white font-bold text-lg">{vampirePower}</p>
              </div>
              <div className="bg-black/40 rounded-lg p-3">
                <p className="text-gray-400 text-xs mb-1">Defense</p>
                <p className="text-white font-bold text-lg">{vampireDefense}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Turn Indicator */}
        <div className="mb-6 text-center">
          <motion.div
            key={turn}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`inline-block px-6 py-3 rounded-full font-bold ${
              turn === 'hunter' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {combatOver
              ? outcome === 'victory'
                ? '🏆 VICTORY!'
                : '💀 DEFEAT'
              : turn === 'hunter'
              ? 'Your Turn'
              : 'Vampire\'s Turn'}
          </motion.div>
        </div>

        {/* Actions */}
        {!combatOver && turn === 'hunter' && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {actions.map(action => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => hunterAction(action.id)}
                  disabled={!action.enabled || isProcessing}
                  className={`p-4 rounded-xl transition-all ${
                    action.enabled
                      ? 'bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 hover:border-gray-600'
                      : 'bg-gray-900 border-2 border-gray-800 opacity-50 cursor-not-allowed'
                  } ${selectedAction === action.id ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${action.enabled ? 'text-white' : 'text-gray-600'}`} />
                  <p className={`text-sm font-bold mb-1 ${action.enabled ? 'text-white' : 'text-gray-600'}`}>
                    {action.name}
                  </p>
                  <p className="text-xs text-gray-400">{action.desc}</p>
                </button>
              );
            })}
          </div>
        )}

        {/* Combat Log */}
        <div className="bg-black/60 border border-gray-700 rounded-xl p-4 max-h-64 overflow-y-auto">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Combat Log
          </h3>
          <div className="space-y-2">
            {combatLog.map((log, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`text-sm p-2 rounded ${
                  log.type === 'hunter'
                    ? 'bg-blue-900/30 text-blue-300'
                    : log.type === 'vampire'
                    ? 'bg-red-900/30 text-red-300'
                    : log.type === 'victory'
                    ? 'bg-green-900/30 text-green-300'
                    : log.type === 'defeat'
                    ? 'bg-red-900/50 text-red-200'
                    : 'bg-gray-800/30 text-gray-400'
                }`}
              >
                {log.message}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Combat Over Actions */}
        {combatOver && (
          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-bold"
            >
              Close Combat
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}