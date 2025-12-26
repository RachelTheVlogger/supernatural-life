import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, DollarSign, Users, TrendingUp, Award, Pen, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function AuthorCareer({ servant, onClose }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('write');
  const [writing, setWriting] = useState(false);

  // TODO: Add entities for Books, WritingStats, etc.
  // For now, placeholder UI

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
        className="bg-gray-900 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Dark Romance Author</h2>
        <p className="text-gray-400 text-sm mb-6">Writing gothic vampire romance novels</p>

        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-gray-400">Author career coming soon...</p>
          <p className="text-gray-500 text-sm mt-2">Full writing mechanics will be added in the next update</p>
        </div>
      </motion.div>
    </motion.div>
  );
}