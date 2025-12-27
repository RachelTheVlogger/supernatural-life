import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Star, TrendingUp, Book, Dumbbell, Palette, Code } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function HumanSkills({ human, onClose }) {
  const [skills, setSkills] = useState({
    fitness: 0,
    cooking: 0,
    art: 0,
    tech: 0,
    social: 0,
    academic: 0
  });
  const queryClient = useQueryClient();

  const skillCategories = [
    { id: 'fitness', name: 'Fitness', icon: Dumbbell, color: 'red', description: 'Physical strength and health' },
    { id: 'cooking', name: 'Cooking', icon: Star, color: 'orange', description: 'Culinary skills' },
    { id: 'art', name: 'Art', icon: Palette, color: 'purple', description: 'Creative expression' },
    { id: 'tech', name: 'Tech', icon: Code, color: 'blue', description: 'Computer and technology' },
    { id: 'social', name: 'Social', icon: TrendingUp, color: 'green', description: 'People skills' },
    { id: 'academic', name: 'Academic', icon: Book, color: 'indigo', description: 'Knowledge and learning' }
  ];

  const practiceSkill = async (skillId) => {
    const xpGain = Math.floor(Math.random() * 15) + 5;
    const newSkills = { ...skills, [skillId]: Math.min(100, skills[skillId] + xpGain) };
    setSkills(newSkills);

    const skillName = skillCategories.find(s => s.id === skillId).name;
    
    await base44.entities.NightLog.create({
      entry: `${human.name} practiced ${skillName} skill - +${xpGain} XP`,
      category: 'interaction',
      intensity: 'subtle'
    });

    queryClient.invalidateQueries();
    alert(`Practiced ${skillName}!\n\n+${xpGain} XP\n\nCurrent level: ${newSkills[skillId]}/100`);
  };

  const getSkillLevel = (xp) => {
    if (xp >= 80) return 'Expert';
    if (xp >= 60) return 'Advanced';
    if (xp >= 40) return 'Intermediate';
    if (xp >= 20) return 'Beginner';
    return 'Novice';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-purple-500/30"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Star className="w-8 h-8 text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Skills</h2>
              <p className="text-gray-400 text-sm">Develop your abilities</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4 mb-6">
          <h3 className="text-white font-bold mb-2">📚 Skill Tree</h3>
          <p className="text-gray-300 text-sm">Practice to improve your skills and unlock new abilities</p>
        </div>

        <div className="space-y-3">
          {skillCategories.map(skill => {
            const Icon = skill.icon;
            const level = getSkillLevel(skills[skill.id]);
            return (
              <div key={skill.id} className={`bg-${skill.color}-950/40 border border-${skill.color}-500/30 rounded-xl p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-6 h-6 text-${skill.color}-400`} />
                    <div>
                      <h4 className="text-white font-bold">{skill.name}</h4>
                      <p className="text-gray-400 text-xs">{skill.description}</p>
                    </div>
                  </div>
                  <span className={`text-${skill.color}-400 text-sm font-bold`}>{level}</span>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{skills[skill.id]}/100 XP</span>
                    <span>{Math.floor(skills[skill.id] / 20)} / 5</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      style={{ width: `${skills[skill.id]}%` }}
                      className={`h-2 bg-${skill.color}-500 rounded-full`}
                    />
                  </div>
                </div>

                <button
                  onClick={() => practiceSkill(skill.id)}
                  className={`w-full bg-${skill.color}-600 hover:bg-${skill.color}-700 text-white py-2 rounded-lg text-sm font-bold`}
                >
                  Practice
                </button>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}