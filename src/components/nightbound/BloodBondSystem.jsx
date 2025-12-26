import React from 'react';
import { motion } from 'framer-motion';
import { X, Link as LinkIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function BloodBondSystem({ vampireState, servants, onClose }) {
  const { data: bonds = [] } = useQuery({
    queryKey: ['bloodBonds'],
    queryFn: () => base44.entities.BloodBond.list()
  });

  const myBonds = bonds.filter(b => b.sire_id === vampireState.id || b.progeny_id === vampireState.id);
  const siredByMe = myBonds.filter(b => b.sire_id === vampireState.id);
  const mySire = myBonds.find(b => b.progeny_id === vampireState.id);

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
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">🩸 Blood Bonds & Sire Lines</h2>
        <p className="text-gray-400 text-sm mb-6">Track who turned who</p>

        {mySire && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6">
            <h3 className="text-red-400 font-bold mb-2">Your Sire</h3>
            <p className="text-white">You were turned by: {mySire.sire_id}</p>
            <p className="text-gray-400 text-sm">Bloodline: {mySire.bloodline || 'Unknown'}</p>
            <p className="text-gray-400 text-sm">Bond Strength: {mySire.bond_strength}%</p>
          </div>
        )}

        {siredByMe.length > 0 ? (
          <>
            <h3 className="text-white font-bold mb-3">Your Progeny ({siredByMe.length})</h3>
            <div className="space-y-3">
              {siredByMe.map(bond => {
                const progeny = servants.find(s => s.id === bond.progeny_id);
                return (
                  <div key={bond.id} className="bg-gray-800 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-medium">{progeny?.name || 'Unknown'}</h4>
                        <p className="text-gray-400 text-sm">Bloodline: {bond.bloodline || 'Your line'}</p>
                        <p className="text-purple-400 text-xs mt-1">They've turned {bond.turns_made} others</p>
                      </div>
                      <div className="text-right">
                        <p className="text-red-400 text-sm">Bond: {bond.bond_strength}%</p>
                        {bond.can_compel && <p className="text-yellow-400 text-xs">✓ Can compel</p>}
                      </div>
                    </div>
                    {bond.shared_powers.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {bond.shared_powers.map(power => (
                          <span key={power} className="bg-purple-900/30 text-purple-300 px-2 py-1 rounded text-xs">
                            {power}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="text-gray-400 text-center py-8">You haven't turned anyone yet</p>
        )}
      </motion.div>
    </motion.div>
  );
}