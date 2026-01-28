import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, BookOpen, Award, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function HunterMentorSystem({ hunter, onClose }) {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState(null); // 'mentor' or 'trainee'
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [trainingType, setTrainingType] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: hunters = [] } = useQuery({
    queryKey: ['hunters'],
    queryFn: () => base44.entities.Hunter.list()
  });

  const mentees = hunters.filter(h => h.mentor_id === hunter.id);
  const mentor = hunter.mentor_id ? hunters.find(h => h.id === hunter.mentor_id) : null;

  const trainingOptions = [
    { id: 'combat', label: '⚔️ Combat Training', exp: 50, improvement: 'skill_level' },
    { id: 'tracking', label: '🔍 Tracking Techniques', exp: 40, improvement: 'tracking_expertise' },
    { id: 'survival', label: '🛡️ Survival Skills', exp: 35, improvement: 'survival_skills' },
    { id: 'intel', label: '📊 Intelligence Network', exp: 30, improvement: 'intel_network' }
  ];

  const handleTrainMentee = async (mentee, training) => {
    if (!training) return;
    setLoading(true);
    try {
      const expGain = training.exp;
      const newExp = (mentee.experience || 0) + expGain;
      
      await base44.entities.Hunter.update(mentee.id, {
        experience: newExp,
        skill_level: Math.min(100, (mentee.skill_level || 50) + 5)
      });

      await base44.entities.NightLog.create({
        entry: `${hunter.name} trained ${mentee.name} in ${training.label}. ${mentee.name} gained ${expGain} experience.`,
        category: 'training',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries(['hunters']);
      queryClient.invalidateQueries(['logs']);
      setTimeout(() => setTrainingType(null), 1500);
    } catch (e) {
      console.error('Training failed:', e);
    }
    setLoading(false);
  };

  const handleBecomeMentee = async (potentialMentor) => {
    setLoading(true);
    try {
      await base44.entities.Hunter.update(hunter.id, {
        mentor_id: potentialMentor.id
      });

      await base44.entities.NightLog.create({
        entry: `${hunter.name} became a trainee under ${potentialMentor.name}. Training begins.`,
        category: 'training',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries(['hunters']);
    } catch (e) {
      console.error('Failed to become mentee:', e);
    }
    setLoading(false);
  };

  if (!selectedRole) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl p-8 max-w-2xl w-full border border-gray-800"
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">Mentor System</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {mentor && (
            <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-4 mb-6">
              <p className="text-blue-300 text-sm">
                📖 You're training under <span className="font-bold">{mentor.name}</span>
              </p>
            </div>
          )}

          <div className="space-y-4">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => setSelectedRole('mentor')}
              className="w-full bg-gradient-to-r from-purple-900/60 to-purple-950/60 hover:from-purple-900/80 hover:to-purple-950/80 border-2 border-purple-700/50 rounded-2xl p-8 transition-all"
            >
              <div className="flex items-center gap-4">
                <span className="text-5xl">👨‍🏫</span>
                <div className="text-left flex-1">
                  <h3 className="text-white text-2xl font-bold mb-2">Be a Mentor</h3>
                  <p className="text-purple-300 text-sm">Train your recruits faster. Level: {Math.floor(Math.sqrt((hunter.experience || 0) / 50)) + 1}</p>
                </div>
              </div>
            </motion.button>

            {hunter.mentor_id === null && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => setSelectedRole('trainee')}
                className="w-full bg-gradient-to-r from-blue-900/60 to-blue-950/60 hover:from-blue-900/80 hover:to-blue-950/80 border-2 border-blue-700/50 rounded-2xl p-8 transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className="text-5xl">📚</span>
                  <div className="text-left flex-1">
                    <h3 className="text-white text-2xl font-bold mb-2">Find a Mentor</h3>
                    <p className="text-blue-300 text-sm">Learn from experienced hunters and gain experience faster</p>
                  </div>
                </div>
              </motion.button>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full mt-8 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl transition-colors"
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    );
  }

  if (selectedRole === 'mentor') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl p-8 max-w-2xl w-full border border-gray-800 max-h-[80vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">Training Recruits</h2>
            <button onClick={() => setSelectedRole(null)} className="text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {mentees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No recruits yet</p>
              <p className="text-gray-600 text-sm">Recruit hunters in the Hunter Management section</p>
            </div>
          ) : (
            <div className="space-y-4">
              {mentees.map(mentee => (
                <div
                  key={mentee.id}
                  className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-white font-bold text-lg">{mentee.name}</h4>
                      <p className="text-gray-400 text-sm">{mentee.specialty} • Skill: {mentee.skill_level}%</p>
                      <p className="text-gray-500 text-xs mt-1">EXP: {mentee.experience || 0}</p>
                    </div>
                  </div>

                  {!trainingType || selectedMentee?.id !== mentee.id ? (
                    <button
                      onClick={() => {
                        setSelectedMentee(mentee);
                        setTrainingType(true);
                      }}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm transition-colors"
                    >
                      Select Training
                    </button>
                  ) : (
                    <div className="space-y-2">
                      {trainingOptions.map(option => (
                        <button
                          key={option.id}
                          onClick={() => handleTrainMentee(mentee, option)}
                          disabled={loading}
                          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white py-2 rounded-lg text-sm transition-colors"
                        >
                          {loading ? 'Training...' : `${option.label} (+${option.exp} EXP)`}
                        </button>
                      ))}
                      <button
                        onClick={() => setTrainingType(null)}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    );
  }

  if (selectedRole === 'trainee') {
    const availableMentors = hunters.filter(h => h.id !== hunter.id && h.mentor_id !== hunter.id);
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl p-8 max-w-2xl w-full border border-gray-800 max-h-[80vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">Find a Mentor</h2>
            <button onClick={() => setSelectedRole(null)} className="text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {availableMentors.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No mentors available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableMentors.sort((a, b) => (b.skill_level || 0) - (a.skill_level || 0)).map(potentialMentor => (
                <div
                  key={potentialMentor.id}
                  className="bg-gray-800/50 border border-gray-700/30 rounded-lg p-4 flex items-start justify-between"
                >
                  <div>
                    <h4 className="text-white font-bold">{potentialMentor.name}</h4>
                    <p className="text-gray-400 text-sm">{potentialMentor.specialty} • Skill: {potentialMentor.skill_level}%</p>
                    <p className="text-yellow-400 text-xs mt-1">⭐ Level {Math.floor(Math.sqrt((potentialMentor.experience || 0) / 50)) + 1}</p>
                  </div>
                  <button
                    onClick={() => handleBecomeMentee(potentialMentor)}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap"
                  >
                    {loading ? 'Joining...' : 'Join'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    );
  }
}