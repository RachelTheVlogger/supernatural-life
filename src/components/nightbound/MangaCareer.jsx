import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, BookOpen, TrendingUp, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const GENRES = [
  { id: 'shonen', label: 'Shonen', audience: 'teens', desc: 'Action-packed adventures' },
  { id: 'shojo', label: 'Shojo', audience: 'teens', desc: 'Romance and relationships' },
  { id: 'seinen', label: 'Seinen', audience: 'adults', desc: 'Mature themes' },
  { id: 'josei', label: 'Josei', audience: 'adults', desc: 'Adult romance & drama' },
  { id: 'isekai', label: 'Isekai', audience: 'mixed', desc: 'Transported to another world' },
  { id: 'slice-of-life', label: 'Slice of Life', audience: 'mixed', desc: 'Everyday moments' }
];

export default function MangaCareer({ servant, onClose }) {
  const queryClient = useQueryClient();
  const [working, setWorking] = useState(false);
  const [outcome, setOutcome] = useState('');

  const { data: career, isLoading } = useQuery({
    queryKey: ['career', servant.id],
    queryFn: async () => {
      const careers = await base44.entities.ServantCareer.filter({ servant_id: servant.id });
      return careers[0];
    }
  });

  if (isLoading || !career) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
        onClick={onClose}
      >
        <div className="bg-gray-900 rounded-2xl p-6 text-center">
          <p className="text-white">Loading...</p>
        </div>
      </motion.div>
    );
  }

  const handleDrawChapter = async () => {
    if (!career?.id) return;
    
    setWorking(true);
    
    setTimeout(async () => {
      const quality = Math.floor(Math.random() * 30) + 50;
      const fansGained = Math.floor(Math.random() * 200) + 100;
      const incomeGained = Math.floor(Math.random() * 150) + 100;

      const newFans = (career.fans || 0) + fansGained;
      const newIncome = (career.income || 0) + incomeGained;
      const newChapters = (career.chapters_released || 0) + 1;

      await base44.entities.ServantCareer.update(career.id, {
        fans: newFans,
        income: newIncome,
        chapters_released: newChapters
      });

      const outcomes = [
        `Drew an incredible chapter. Fans are going wild. +${fansGained} fans, $${incomeGained}`,
        `Your art improved. The panel work is stunning. +${fansGained} fans, $${incomeGained}`,
        `Posted a new chapter. The comments are pouring in. +${fansGained} fans, $${incomeGained}`,
        `Your character designs are getting praised everywhere. +${fansGained} fans, $${incomeGained}`
      ];

      setOutcome(outcomes[Math.floor(Math.random() * outcomes.length)]);
      queryClient.invalidateQueries();

      setTimeout(() => {
        setWorking(false);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  const handleStartSeries = async (genre) => {
    if (!career?.id) return;
    
    setWorking(true);
    
    const seriesNames = {
      shonen: ['Battle Chronicles', 'Rising Hero', 'Power Surge'],
      shojo: ['First Love', 'Spring Romance', 'Heart Melody'],
      seinen: ['Dark Society', 'Broken Glass', 'Urban Tales'],
      josei: ['After Hours', 'Office Affairs', 'Midnight Calls'],
      isekai: ['Another World', 'Portal Quest', 'Reborn Legend'],
      'slice-of-life': ['Daily Life', 'Coffee Shop Days', 'Small Town Stories']
    };

    const names = seriesNames[genre.id];
    const seriesName = names[Math.floor(Math.random() * names.length)];

    await base44.entities.ServantCareer.update(career.id, {
      current_genre: genre.id,
      series_name: seriesName,
      chapters_released: 0,
      fans: 0,
      income: 0
    });

    setOutcome(`Started "${seriesName}" - a ${genre.label} manga series!`);
    await queryClient.invalidateQueries();
    
    setTimeout(() => {
      setWorking(false);
      setOutcome('');
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
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-8 h-8 text-purple-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Manga Artist</h2>
            <p className="text-gray-400 text-sm">{servant.name}'s manga career</p>
          </div>
        </div>

        {career?.series_name && (
          <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4 mb-4">
            <h3 className="text-purple-300 font-bold text-lg mb-1">{career.series_name}</h3>
            <p className="text-gray-400 text-xs capitalize mb-3">{career.current_genre} manga</p>
            
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-gray-800 rounded-lg p-2">
                <Users className="w-4 h-4 text-blue-400 mb-1" />
                <p className="text-white font-bold text-sm">{career.fans || 0}</p>
                <p className="text-gray-400 text-xs">Fans</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-2">
                <BookOpen className="w-4 h-4 text-green-400 mb-1" />
                <p className="text-white font-bold text-sm">{career.chapters_released || 0}</p>
                <p className="text-gray-400 text-xs">Chapters</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-2">
                <TrendingUp className="w-4 h-4 text-yellow-400 mb-1" />
                <p className="text-white font-bold text-sm">${career.income || 0}</p>
                <p className="text-gray-400 text-xs">Income</p>
              </div>
            </div>

            <button
              onClick={handleDrawChapter}
              disabled={working}
              className="w-full bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-lg py-3 text-white disabled:opacity-50 font-medium"
            >
              {working ? 'Drawing...' : 'Draw Next Chapter'}
            </button>
          </div>
        )}

        {!career?.series_name && (
          <div>
            <h3 className="text-white font-medium mb-3">Start a New Series</h3>
            <div className="space-y-2">
              {GENRES.map(genre => (
                <button
                  key={genre.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartSeries(genre);
                  }}
                  disabled={working}
                  className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-3 text-left transition-colors disabled:opacity-50"
                >
                  <h4 className="text-white font-medium">{genre.label}</h4>
                  <p className="text-gray-400 text-sm">{genre.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {working && (
          <div className="mt-4 text-center">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-purple-400"
            >
              Working on the chapter...
            </motion.div>
          </div>
        )}

        {outcome && (
          <div className="mt-4 bg-green-950/40 border border-green-500/30 rounded-lg p-4">
            <p className="text-green-300 text-center">{outcome}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}