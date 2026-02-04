import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Heart, Sparkles, Zap, Shield, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function NymphHealing({ nymph, onClose }) {
  const queryClient = useQueryClient();
  const [healing, setHealing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  const { data: vampires = [] } = useQuery({
    queryKey: ['vampireState'],
    queryFn: () => base44.entities.VampireState.list()
  });

  const { data: witches = [] } = useQuery({
    queryKey: ['witches'],
    queryFn: () => base44.entities.Witch.list()
  });

  const { data: sirens = [] } = useQuery({
    queryKey: ['sirens'],
    queryFn: () => base44.entities.Siren.list()
  });

  const { data: servants = [] } = useQuery({
    queryKey: ['servants'],
    queryFn: () => base44.entities.Servant.list()
  });

  const patients = [
    ...vampires.map(v => ({ ...v, type: 'vampire', displayName: v.vampire_name })),
    ...witches.map(w => ({ ...w, type: 'witch', displayName: w.name })),
    ...sirens.map(s => ({ ...s, type: 'siren', displayName: s.name })),
    ...servants.filter(s => s.is_turned).map(s => ({ ...s, type: 'servant', displayName: s.name }))
  ];

  const handleHeal = async (patient, healingType) => {
    setHealing(true);

    setTimeout(async () => {
      const healings = {
        purify: {
          vampire: `You placed your hands on ${patient.displayName}. Pure water magic flowed. Their corruption lessened. Humanity returned. "I feel... cleaner," they whispered.`,
          witch: `You purified ${patient.displayName}'s dark magic. Corruption washed away. Light magic stronger now. "Thank you," they breathed. Grateful.`,
          siren: `You cleansed ${patient.displayName}. Predatory urges calmed. Benevolence grew. They're kinder now. Gentler.`,
          servant: `You healed ${patient.displayName}'s vampiric darkness. Their humanity strengthened. "I remember who I was," they said. Tears of relief.`
        },
        restore: {
          vampire: `Your healing touch. ${patient.displayName}'s wounds closed. Supernatural regeneration amplified by nature magic. Perfect synergy.`,
          witch: `You restored ${patient.displayName}'s magical reserves. Nature and arcane power flowing together. They're recharged. Powerful again.`,
          siren: `You mended ${patient.displayName}'s voice. Damaged vocal cords healed. Their song returns. Beautiful as ever.`,
          servant: `You healed ${patient.displayName}'s injuries. Body and soul restored. "You're amazing," they said. Awed.`
        },
        bless: {
          vampire: `You blessed ${patient.displayName} with nature's protection. Sunlight hurts less now. Nature accepts them, despite their curse.`,
          witch: `You blessed ${patient.displayName} with water magic. Their spells stronger. Nature-infused. Enhanced.`,
          siren: `You blessed ${patient.displayName}'s voice. Ocean magic amplified. They're more powerful. They owe you.`,
          servant: `You blessed ${patient.displayName}. Nature's favor granted. They're protected. Safe under your care.`
        }
      };

      const text = healings[healingType][patient.type];
      setOutcome(text);

      // Update patient
      const entityMap = {
        vampire: base44.entities.VampireState,
        witch: base44.entities.Witch,
        siren: base44.entities.Siren,
        servant: base44.entities.Servant
      };

      const updates = {};
      if (healingType === 'purify') {
        if (patient.type === 'vampire' || patient.type === 'servant') {
          updates.humanity = Math.min(100, (patient.humanity || 50) + 15);
        } else if (patient.type === 'witch') {
          updates.corruption_level = Math.max(0, (patient.corruption_level || 0) - 20);
        } else if (patient.type === 'siren') {
          updates.alignment = 'benevolent';
        }
      } else if (healingType === 'restore') {
        if (patient.type === 'vampire') {
          updates.vampire_power_level = Math.min(100, (patient.vampire_power_level || 0) + 10);
        } else if (patient.type === 'witch') {
          updates.power_level = Math.min(100, (patient.power_level || 80) + 15);
        } else if (patient.type === 'siren') {
          updates.voice_power = Math.min(100, (patient.voice_power || 50) + 10);
        }
      }

      await entityMap[patient.type].update(patient.id, updates);

      // Update nymph
      await base44.entities.WaterNymph.update(nymph.id, {
        healing_services_performed: (nymph.healing_services_performed || 0) + 1,
        nature_bond: (nymph.nature_bond || 50) + 5,
        purity: Math.min(100, (nymph.purity || 100) + 3)
      });

      await base44.entities.NightLog.create({
        entry: text,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();
      setSelectedPatient(null);

      setTimeout(() => {
        setHealing(false);
        setOutcome('');
      }, 5000);
    }, 2500);
  };

  const handleBuildSanctuary = async (sanctuary) => {
    setHealing(true);

    setTimeout(async () => {
      setOutcome(`You created ${sanctuary.name}. Magic flowed from your hands. Nature responded. Sacred ground established. ${sanctuary.benefit}`);

      const newSanctuaries = [
        ...(nymph.sanctuaries || []),
        {
          type: sanctuary.id,
          name: sanctuary.name,
          created_date: new Date().toISOString(),
          power_level: 50
        }
      ];

      await base44.entities.WaterNymph.update(nymph.id, {
        sanctuaries: newSanctuaries,
        nature_bond: (nymph.nature_bond || 50) + (sanctuary.id === 'temple' ? 15 : 8),
        purity: Math.min(100, (nymph.purity || 100) + (sanctuary.id === 'temple' ? 10 : 5)),
        connection: Math.min(100, (nymph.connection || 50) + (sanctuary.id === 'temple' ? 10 : 6))
      });

      await base44.entities.NightLog.create({
        entry: `Built ${sanctuary.name}. Power surges.`,
        category: 'power',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setHealing(false);
        setOutcome('');
      }, 5000);
    }, 3000);
  };

  const sanctuariesBuilt = nymph.sanctuaries || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-teal-950 to-emerald-950 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-teal-500/50"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Healing & Sanctuaries</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {outcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-black/40 rounded-xl p-6 mb-6 border border-teal-500/30"
          >
            <p className="text-teal-100 text-sm leading-relaxed">{outcome}</p>
          </motion.div>
        )}

        {!selectedPatient && !outcome ? (
          <>
            {/* Build Sanctuaries */}
            <div className="mb-6">
              <h3 className="text-white font-bold mb-3">Build Sanctuary</h3>
              <div className="space-y-2">
                {SANCTUARY_TYPES.map(s => {
                  const Icon = s.icon;
                  const built = sanctuariesBuilt.some(san => san.type === s.id);
                  const canAfford = availablePoints >= s.cost;

                  return (
                    <button
                      key={s.id}
                      onClick={() => !built && canAfford && handleBuildSanctuary(s)}
                      disabled={built || !canAfford || healing}
                      className={`w-full rounded-xl p-3 text-left transition-all ${
                        built
                          ? 'bg-green-900/40 border border-green-500/30 opacity-60'
                          : !canAfford
                          ? 'bg-gray-800/40 border border-gray-600/30 opacity-40'
                          : 'bg-teal-900/60 hover:bg-teal-900/80 border border-teal-500/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="w-5 h-5 text-teal-400 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-white font-medium text-sm">{s.name}</h4>
                            <span className={`text-xs px-2 py-1 rounded ${
                              !canAfford ? 'bg-red-900/50 text-red-300' : 'bg-teal-900/50 text-teal-300'
                            }`}>
                              {s.cost} pts
                            </span>
                          </div>
                          <p className="text-gray-400 text-xs">{s.benefit}</p>
                          {built && <span className="text-xs text-green-400 mt-1 block">✓ Built</span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Heal Supernaturals */}
            {patients.length > 0 && (
              <div>
                <h3 className="text-white font-bold mb-3">Heal Supernaturals</h3>
                <div className="space-y-2">
                  {patients.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPatient(p)}
                      className="w-full bg-black/40 hover:bg-black/60 rounded-xl p-3 border border-teal-500/20 transition-all text-left"
                    >
                      <h4 className="text-white font-medium text-sm">
                        {p.type === 'vampire' ? '🦇' : p.type === 'witch' ? '✨' : p.type === 'siren' ? '🌊' : '🩸'} {p.displayName}
                      </h4>
                      <p className="text-gray-400 text-xs capitalize">{p.type}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : selectedPatient && !outcome && (
          <div>
            <button
              onClick={() => setSelectedPatient(null)}
              className="text-gray-400 hover:text-white mb-4 text-sm"
            >
              ← Back
            </button>

            <div className="bg-black/40 rounded-xl p-4 border border-teal-500/30 mb-6">
              <h3 className="text-white font-bold">{selectedPatient.displayName}</h3>
              <p className="text-gray-400 text-sm capitalize">{selectedPatient.type}</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleHeal(selectedPatient, 'purify')}
                disabled={healing}
                className="w-full bg-blue-900/60 hover:bg-blue-900/80 border border-blue-500/30 rounded-xl py-3 px-4 flex items-center gap-3 disabled:opacity-50"
              >
                <Droplets className="w-5 h-5 text-blue-400" />
                <div className="text-left">
                  <h4 className="text-white font-medium text-sm">Purify Corruption</h4>
                  <p className="text-gray-400 text-xs">Cleanse darkness from their soul</p>
                </div>
              </button>

              <button
                onClick={() => handleHeal(selectedPatient, 'restore')}
                disabled={healing}
                className="w-full bg-green-900/60 hover:bg-green-900/80 border border-green-500/30 rounded-xl py-3 px-4 flex items-center gap-3 disabled:opacity-50"
              >
                <Heart className="w-5 h-5 text-green-400" />
                <div className="text-left">
                  <h4 className="text-white font-medium text-sm">Restore Power</h4>
                  <p className="text-gray-400 text-xs">Replenish their strength</p>
                </div>
              </button>

              <button
                onClick={() => handleHeal(selectedPatient, 'bless')}
                disabled={healing}
                className="w-full bg-purple-900/60 hover:bg-purple-900/80 border border-purple-500/30 rounded-xl py-3 px-4 flex items-center gap-3 disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5 text-purple-400" />
                <div className="text-left">
                  <h4 className="text-white font-medium text-sm">Grant Nature's Blessing</h4>
                  <p className="text-gray-400 text-xs">Enhance their abilities</p>
                </div>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}