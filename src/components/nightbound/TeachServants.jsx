import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const LESSONS = [
  { name: 'Basic Protection', icon: '🛡️', description: 'Shield from harm', teaches: 'Protection spells' },
  { name: 'Herb Identification', icon: '🌿', description: 'Know magical plants', teaches: 'Herbology basics' },
  { name: 'Simple Healing', icon: '💚', description: 'Mend wounds', teaches: 'Healing magic' },
  { name: 'Divination Basics', icon: '🔮', description: 'See the future', teaches: 'Fortune telling' }
];

export default function TeachServants({ witch, onClose }) {
  const queryClient = useQueryClient();
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [student, setStudent] = useState(null);
  const [teaching, setTeaching] = useState(false);
  const [outcome, setOutcome] = useState('');

  const { data: servants = [] } = useQuery({
    queryKey: ['servants'],
    queryFn: () => base44.entities.Servant.list()
  });

  const handleTeach = async () => {
    setTeaching(true);

    setTimeout(async () => {
      const success = Math.random() > 0.3;
      const relationshipGain = success ? 15 : 8;

      await base44.entities.Servant.update(student.id, {
        relationship: Math.min(100, (student.relationship || 0) + relationshipGain),
        teaching_progress: (student.teaching_progress || 0) + (success ? 20 : 10)
      });

      const outcomeText = success
        ? `${student.name} learned ${selectedLesson.name}! They're grateful.`
        : `${student.name} struggled with ${selectedLesson.name}, but made progress.`;

      setOutcome(outcomeText);

      await base44.entities.NightLog.create({
        entry: `${witch.name} taught ${student.name} ${selectedLesson.name}. ${outcomeText}`,
        category: 'interaction',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setTeaching(false);
        setOutcome('');
        setSelectedLesson(null);
        setStudent(null);
      }, 3000);
    }, 3000);
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
        className="bg-gray-900 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-4">🎓 Teach Servants Magic</h2>
        <p className="text-gray-400 text-sm mb-6">Share your knowledge with them</p>

        {servants.length === 0 && (
          <p className="text-gray-400 text-center py-8">No servants to teach yet</p>
        )}

        {!selectedLesson && !teaching && !outcome && servants.length > 0 && (
          <div className="space-y-3">
            <p className="text-purple-400 text-sm mb-4">Choose what to teach:</p>
            {LESSONS.map(lesson => (
              <button
                key={lesson.name}
                onClick={() => setSelectedLesson(lesson)}
                className="w-full bg-yellow-900/40 hover:bg-yellow-900/60 border border-yellow-500/30 rounded-xl p-4 text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{lesson.icon}</span>
                  <div>
                    <h3 className="text-white font-medium">{lesson.name}</h3>
                    <p className="text-gray-400 text-xs">{lesson.description}</p>
                  </div>
                </div>
                <p className="text-yellow-400 text-xs">Teaches: {lesson.teaches}</p>
              </button>
            ))}
          </div>
        )}

        {selectedLesson && !student && !teaching && !outcome && (
          <div>
            <button
              onClick={() => setSelectedLesson(null)}
              className="text-gray-400 hover:text-white text-sm mb-4"
            >
              ← Back
            </button>
            <p className="text-purple-400 text-sm mb-4">Choose a student:</p>
            <div className="space-y-2">
              {servants.map(servant => (
                <button
                  key={servant.id}
                  onClick={() => setStudent(servant)}
                  className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg p-3 text-left"
                >
                  <h3 className="text-white font-medium">{servant.name}</h3>
                  <p className="text-gray-400 text-xs">
                    Progress: {servant.teaching_progress || 0}%
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {student && !teaching && !outcome && (
          <div className="bg-gray-800 rounded-xl p-6 border-2 border-yellow-500/30">
            <div className="text-center mb-4">
              <span className="text-6xl">{selectedLesson.icon}</span>
              <h3 className="text-white text-xl font-bold mt-2">Teach {student.name}</h3>
              <p className="text-yellow-400 text-sm mt-1">{selectedLesson.name}</p>
            </div>

            <div className="bg-yellow-900/30 rounded-lg p-4 mb-4">
              <p className="text-gray-300 text-sm">{selectedLesson.description}</p>
              <p className="text-yellow-400 text-xs mt-2">They will learn: {selectedLesson.teaches}</p>
            </div>

            <button
              onClick={handleTeach}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-medium"
            >
              Begin Lesson
            </button>
          </div>
        )}

        {teaching && !outcome && (
          <div className="text-center py-12">
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mx-auto mb-4"
            >
              🎓
            </motion.div>
            <p className="text-yellow-400">Teaching magic...</p>
          </div>
        )}

        {outcome && (
          <div className="bg-gray-800 rounded-xl p-6 border-2 border-yellow-500/30 text-center">
            <p className="text-white">{outcome}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}