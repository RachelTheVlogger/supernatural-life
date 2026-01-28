import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, FileText, Target, Shield, Package, Clock, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const CONTRACT_TEMPLATES = [
  { title: 'Vampire Elimination', type: 'vampire', difficulty: 'hard', exp: 200, supplies: { stakes: 3, holy_water: 2 } },
  { title: 'Protect Civilian', type: 'protection', difficulty: 'medium', exp: 100, supplies: { stakes: 1 } },
  { title: 'Investigate Lair', type: 'investigation', difficulty: 'easy', exp: 50, supplies: {} },
  { title: 'Retrieve Artifact', type: 'retrieval', difficulty: 'hard', exp: 150, supplies: { holy_water: 1 } },
  { title: 'Elder Vampire Hunt', type: 'vampire', difficulty: 'extreme', exp: 500, supplies: { stakes: 5, uv_grenades: 2 } }
];

const DIFFICULTY_COLORS = {
  easy: 'green',
  medium: 'yellow',
  hard: 'orange',
  extreme: 'red'
};

export default function HunterContracts({ hunter, onClose }) {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);

  const { data: contracts = [] } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => base44.entities.HunterContract.list()
  });

  const handleAcceptContract = async (template) => {
    setProcessing(true);
    try {
      await base44.entities.HunterContract.create({
        hunter_id: hunter.id,
        title: template.title,
        description: `${template.type} mission - ${template.difficulty} difficulty`,
        target_type: template.type,
        difficulty: template.difficulty,
        reward_exp: template.exp,
        reward_supplies: template.supplies,
        status: 'active'
      });
      queryClient.invalidateQueries(['contracts']);
    } catch (e) {
      console.error('Failed to accept:', e);
    }
    setProcessing(false);
  };

  const handleCompleteContract = async (contract) => {
    setProcessing(true);
    try {
      const success = Math.random() > 0.3; // 70% success rate
      
      if (success) {
        await Promise.all([
          base44.entities.HunterContract.update(contract.id, { status: 'completed' }),
          base44.entities.Hunter.update(hunter.id, {
            experience: (hunter.experience || 0) + contract.reward_exp,
            missions_completed: (hunter.missions_completed || 0) + 1,
            morale: Math.min(100, (hunter.morale || 100) + 10)
          }),
          base44.entities.NightLog.create({
            entry: `${hunter.name} completed contract: ${contract.title}. Earned ${contract.reward_exp} XP.`,
            category: 'hunting',
            intensity: 'significant'
          })
        ]);
      } else {
        await Promise.all([
          base44.entities.HunterContract.update(contract.id, { status: 'failed' }),
          base44.entities.Hunter.update(hunter.id, {
            morale: Math.max(0, (hunter.morale || 100) - 20)
          })
        ]);
      }
      
      queryClient.invalidateQueries(['contracts']);
      queryClient.invalidateQueries(['hunters']);
    } catch (e) {
      console.error('Failed to complete:', e);
    }
    setProcessing(false);
  };

  const activeContracts = contracts.filter(c => c.status === 'active' && c.hunter_id === hunter.id);
  const availableContracts = CONTRACT_TEMPLATES;

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
        className="bg-gray-900 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Contracts</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {activeContracts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-white font-bold mb-3">Active Contracts</h3>
            <div className="space-y-3">
              {activeContracts.map(contract => (
                <div key={contract.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-white font-bold">{contract.title}</h4>
                      <p className="text-gray-400 text-sm">{contract.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs bg-${DIFFICULTY_COLORS[contract.difficulty]}-600 text-white`}>
                      {contract.difficulty}
                    </span>
                  </div>
                  <p className="text-green-400 text-sm mb-3">Reward: {contract.reward_exp} XP</p>
                  <button
                    onClick={() => handleCompleteContract(contract)}
                    disabled={processing}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
                  >
                    Complete Mission
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-white font-bold mb-3">Available Contracts</h3>
          <div className="space-y-3">
            {availableContracts.map((template, idx) => (
              <div key={idx} className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-white font-bold">{template.title}</h4>
                    <p className="text-gray-400 text-sm capitalize">{template.type} mission</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs bg-${DIFFICULTY_COLORS[template.difficulty]}-600 text-white`}>
                    {template.difficulty}
                  </span>
                </div>
                <p className="text-green-400 text-sm mb-3">Reward: {template.exp} XP</p>
                <button
                  onClick={() => handleAcceptContract(template)}
                  disabled={processing || activeContracts.length >= 3}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg disabled:opacity-50"
                >
                  Accept Contract
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}