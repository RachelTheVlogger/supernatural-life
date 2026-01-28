import React from 'react';
import { motion } from 'framer-motion';
import { X, Trophy, Target, Shield, Zap, Heart, Eye } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const ACHIEVEMENT_DEFINITIONS = [
  { id: 'first_blood', title: 'First Blood', desc: 'Kill your first vampire', icon: '🩸', rarity: 'common', requirement: 1 },
  { id: 'vampire_slayer', title: 'Vampire Slayer', desc: 'Kill 10 vampires', icon: '⚔️', rarity: 'rare', requirement: 10 },
  { id: 'legendary_hunter', title: 'Legendary Hunter', desc: 'Kill 50 vampires', icon: '👑', rarity: 'legendary', requirement: 50 },
  { id: 'first_mission', title: 'First Contract', desc: 'Complete your first mission', icon: '📋', rarity: 'common', requirement: 1 },
  { id: 'veteran', title: 'Veteran', desc: 'Complete 25 missions', icon: '🎖️', rarity: 'rare', requirement: 25 },
  { id: 'master_hunter', title: 'Master Hunter', desc: 'Reach max skill level', icon: '⭐', rarity: 'legendary', requirement: 100 },
  { id: 'fully_upgraded', title: 'Fortress', desc: 'Max all safe house facilities', icon: '🏰', rarity: 'legendary', requirement: 30 },
  { id: 'arsenal', title: 'Arsenal', desc: 'Own 10 pieces of equipment', icon: '🛡️', rarity: 'rare', requirement: 10 }
];

export default function HunterAchievements({ hunter, onClose }) {
  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', hunter.id],
    queryFn: () => base44.entities.HunterAchievement.filter({ hunter_id: hunter.id })
  });

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment', hunter.id],
    queryFn: () => base44.entities.HunterEquipment.filter({ hunter_id: hunter.id })
  });

  const { data: safeHouse } = useQuery({
    queryKey: ['safeHouse', hunter.id],
    queryFn: async () => {
      const houses = await base44.entities.SafeHouse.filter({ hunter_id: hunter.id });
      return houses[0] || null;
    }
  });

  const checkProgress = (achievement) => {
    const kills = hunter.vampires_killed || 0;
    const missions = hunter.missions_completed || 0;
    const skill = hunter.skill_level || 0;
    const equipCount = equipment.length;
    const facilityLevel = safeHouse ? 
      (safeHouse.armory_level || 0) + (safeHouse.research_lab_level || 0) + 
      (safeHouse.training_room_level || 0) + (safeHouse.medical_bay_level || 0) +
      (safeHouse.defense_level || 0) + (safeHouse.surveillance_level || 0) : 0;

    switch(achievement.id) {
      case 'first_blood':
      case 'vampire_slayer':
      case 'legendary_hunter':
        return kills;
      case 'first_mission':
      case 'veteran':
        return missions;
      case 'master_hunter':
        return skill;
      case 'fully_upgraded':
        return facilityLevel;
      case 'arsenal':
        return equipCount;
      default:
        return 0;
    }
  };

  const unlockedIds = achievements.map(a => a.achievement_id);

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
          <div>
            <h2 className="text-2xl font-bold text-white">Achievements</h2>
            <p className="text-gray-400">{achievements.length} / {ACHIEVEMENT_DEFINITIONS.length} Unlocked</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {ACHIEVEMENT_DEFINITIONS.map(achievement => {
            const isUnlocked = unlockedIds.includes(achievement.id);
            const progress = checkProgress(achievement);
            const percentage = Math.min(100, (progress / achievement.requirement) * 100);

            return (
              <div
                key={achievement.id}
                className={`rounded-xl p-4 ${
                  isUnlocked ? 'bg-gradient-to-r from-yellow-900/40 to-yellow-950/40 border border-yellow-500/50' :
                  'bg-gray-800 border border-gray-700'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold">{achievement.title}</h3>
                    <p className="text-gray-400 text-sm">{achievement.desc}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${
                      achievement.rarity === 'legendary' ? 'bg-purple-600' :
                      achievement.rarity === 'rare' ? 'bg-blue-600' :
                      'bg-gray-600'
                    } text-white`}>
                      {achievement.rarity}
                    </span>
                  </div>
                </div>
                
                {!isUnlocked && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{progress} / {achievement.requirement}</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                )}
                
                {isUnlocked && (
                  <div className="flex items-center gap-2 text-yellow-400 text-sm">
                    <Trophy className="w-4 h-4" />
                    <span>Unlocked!</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}