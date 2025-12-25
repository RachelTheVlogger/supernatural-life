import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Flame, Shield, Droplets, Users, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const TERRITORIES = [
  { name: 'Downtown', quality: 'excellent', difficulty: 'high' },
  { name: 'University District', quality: 'excellent', difficulty: 'medium' },
  { name: 'Business District', quality: 'average', difficulty: 'high' },
  { name: 'Old Town', quality: 'average', difficulty: 'low' },
  { name: 'Waterfront', quality: 'excellent', difficulty: 'medium' },
  { name: 'Industrial Zone', quality: 'poor', difficulty: 'low' },
  { name: 'Nightlife District', quality: 'excellent', difficulty: 'high' },
  { name: 'Suburbs', quality: 'average', difficulty: 'medium' }
];

export default function TerritoryMap({ onClose, vampireState }) {
  const queryClient = useQueryClient();
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [claiming, setClaiming] = useState(false);

  const { data: territories = [] } = useQuery({
    queryKey: ['territories'],
    queryFn: () => base44.entities.Territory.list()
  });

  const { data: rivals = [] } = useQuery({
    queryKey: ['rivals'],
    queryFn: () => base44.entities.RivalVampire.list()
  });

  // Initialize territories
  React.useEffect(() => {
    if (territories.length === 0) {
      Promise.all(TERRITORIES.map(t => 
        base44.entities.Territory.create({
          area_name: t.name,
          control_level: t.name === 'Old Town' ? 30 : 0,
          controlled_by: t.name === 'Old Town' ? 'you' : 'neutral',
          feeding_quality: t.quality,
          heat_level: 0
        })
      )).then(() => queryClient.invalidateQueries(['territories']));
    }
  }, [territories.length]);

  const handleClaim = async () => {
    setClaiming(true);

    setTimeout(async () => {
      const territory = territories.find(t => t.area_name === selectedTerritory.area_name);
      const isRivalControlled = territory.controlled_by !== 'neutral' && territory.controlled_by !== 'you';
      const success = Math.random() > (isRivalControlled ? 0.6 : 0.3);

      if (success) {
        await base44.entities.Territory.update(territory.id, {
          controlled_by: 'you',
          control_level: Math.min(100, (territory.control_level || 0) + 30)
        });

        await base44.entities.NightLog.create({
          entry: `You claimed ${territory.area_name}. Your influence spreads.`,
          category: 'power',
          intensity: 'significant'
        });

        // Update vampire state influence
        if (vampireState.id) {
          const yourTerritories = await base44.entities.Territory.filter({ controlled_by: 'you' });
          const avgControl = yourTerritories.reduce((sum, t) => sum + (t.control_level || 0), 0) / Math.max(yourTerritories.length, 1);
          
          await base44.entities.VampireState.update(vampireState.id, {
            territory_influence: Math.round(avgControl)
          });
        }
      } else {
        await base44.entities.NightLog.create({
          entry: `Failed to claim ${territory.area_name}. ${isRivalControlled ? 'The rival was too strong.' : 'Resistance was fierce.'}`,
          category: 'interaction',
          intensity: 'moderate'
        });
      }

      queryClient.invalidateQueries();
      setClaiming(false);
      setSelectedTerritory(null);
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
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Territory Control</h2>
        <p className="text-gray-400 text-sm mb-6">The city is divided. Claim what's yours.</p>

        {!selectedTerritory ? (
          <div className="grid md:grid-cols-2 gap-3">
            {territories.map(territory => {
              const isYours = territory.controlled_by === 'you';
              const isRival = territory.controlled_by !== 'you' && territory.controlled_by !== 'neutral';
              
              return (
                <button
                  key={territory.id}
                  onClick={() => setSelectedTerritory(territory)}
                  className={`bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors border-2 ${
                    isYours ? 'border-green-500/50' : isRival ? 'border-red-500/50' : 'border-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-bold">{territory.area_name}</h3>
                    {isYours && <span className="text-green-400 text-xs">YOURS</span>}
                    {isRival && <span className="text-red-400 text-xs">RIVAL</span>}
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Control</span>
                      <span className="text-white">{territory.control_level || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Quality</span>
                      <span className={`capitalize ${
                        territory.feeding_quality === 'excellent' ? 'text-green-400' :
                        territory.feeding_quality === 'average' ? 'text-yellow-400' : 'text-red-400'
                      }`}>{territory.feeding_quality}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Heat</span>
                      <span className="text-orange-400">{territory.heat_level || 0}%</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : claiming ? (
          <div className="text-center py-12">
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-gray-400"
            >
              Claiming...
            </motion.p>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => setSelectedTerritory(null)}
              className="text-gray-400 hover:text-white text-sm"
            >
              ← Back
            </button>

            <div className="bg-gray-800 rounded-xl p-4">
              <h3 className="text-white text-xl font-bold mb-3">{selectedTerritory.area_name}</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Control</span>
                  <span className="text-white">{selectedTerritory.control_level || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Feeding Quality</span>
                  <span className="text-green-400 capitalize">{selectedTerritory.feeding_quality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Hunter Activity</span>
                  <span className="text-orange-400">{selectedTerritory.heat_level || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Controlled By</span>
                  <span className={`capitalize ${
                    selectedTerritory.controlled_by === 'you' ? 'text-green-400' :
                    selectedTerritory.controlled_by === 'neutral' ? 'text-gray-400' : 'text-red-400'
                  }`}>{selectedTerritory.controlled_by}</span>
                </div>
              </div>

              {selectedTerritory.controlled_by !== 'you' && (
                <button
                  onClick={handleClaim}
                  className="w-full bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white font-medium py-3 rounded-xl transition-all"
                >
                  Claim Territory
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}