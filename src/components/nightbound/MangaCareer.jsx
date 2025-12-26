import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, BookOpen, TrendingUp, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const GENRES = [
  { id: 'shonen', label: 'Shonen', icon: '⚔️', desc: 'Action-packed adventures' },
  { id: 'shojo', label: 'Shojo', icon: '💕', desc: 'Romance and relationships' },
  { id: 'seinen', label: 'Seinen', icon: '🌙', desc: 'Mature themes' },
  { id: 'josei', label: 'Josei', icon: '🌸', desc: 'Adult romance & drama' },
  { id: 'isekai', label: 'Isekai', icon: '🌀', desc: 'Transported to another world' },
  { id: 'slice-of-life', label: 'Slice of Life', icon: '☕', desc: 'Everyday moments' }
];

export default function MangaCareer({ servant, onClose }) {
  const queryClient = useQueryClient();
  const [working, setWorking] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [showGenreSelect, setShowGenreSelect] = useState(false);

  const { data: careers = [] } = useQuery({
    queryKey: ['career', servant.id],
    queryFn: () => base44.entities.ServantCareer.filter({ servant_id: servant.id })
  });

  const career = careers[0];

  const handleDrawChapter = async () => {
    if (!career?.id) return;
    
    setWorking(true);
    
    setTimeout(async () => {
      const quality = Math.floor(Math.random() * 30) + 50;
      const fansGained = Math.floor(Math.random() * 200) + 100;
      const incomeGained = Math.floor(Math.random() * 150) + 100;
      const panels = Math.floor(Math.random() * 10) + 15;

      const newFans = (career.fans || 0) + fansGained;
      const newIncome = (career.income || 0) + incomeGained;
      const newChapters = (career.chapters_released || 0) + 1;

      const chapterTitles = [
        'New Beginning', 'Dark Truth', 'Confrontation', 'Revelation', 'Battle',
        'Aftermath', 'Rising Tension', 'Breaking Point', 'Destiny', 'Choice'
      ];
      const title = chapterTitles[Math.floor(Math.random() * chapterTitles.length)];

      const existingChapters = career.manga_chapters || [];
      const newChapter = {
        number: newChapters,
        title,
        panels,
        quality,
        fans_gained: fansGained,
        income: incomeGained,
        date: new Date().toISOString()
      };

      await base44.entities.ServantCareer.update(career.id, {
        fans: newFans,
        income: newIncome,
        chapters_released: newChapters,
        manga_chapters: [...existingChapters, newChapter]
      });

      await base44.entities.NightLog.create({
        entry: `${servant.name} released Chapter ${newChapters}: "${title}" (${panels} panels). +${fansGained} fans, +$${incomeGained}`,
        category: 'interaction',
        intensity: 'moderate'
      });

      setOutcome(`Chapter ${newChapters}: "${title}" - ${panels} panels drawn! +${fansGained} fans, $${incomeGained}`);
      queryClient.invalidateQueries(['career']);

      setTimeout(() => {
        setWorking(false);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  const handleStartSeries = async (genre) => {
    setWorking(true);
    
    setTimeout(async () => {
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

      if (!career?.id) {
        await base44.entities.ServantCareer.create({
          servant_id: servant.id,
          manga_career_active: true,
          current_genre: genre.id,
          series_name: seriesName,
          chapters_released: 0,
          fans: Math.floor(Math.random() * 50) + 20,
          income: 0
        });
      } else {
        await base44.entities.ServantCareer.update(career.id, {
          manga_career_active: true,
          current_genre: genre.id,
          series_name: seriesName,
          chapters_released: 0,
          fans: Math.floor(Math.random() * 50) + 20,
          income: 0
        });
      }

      await base44.entities.NightLog.create({
        entry: `${servant.name} started "${seriesName}" - a ${genre.label} manga series!`,
        category: 'interaction',
        intensity: 'moderate'
      });

      setOutcome(`Started "${seriesName}" - a ${genre.label} manga series!`);
      queryClient.invalidateQueries(['career']);
      
      setTimeout(() => {
        setWorking(false);
        setOutcome('');
      }, 2000);
    }, 1500);
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
        className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col relative"
      >
        <div className="p-6 pb-4">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Manga Artist</h2>
              <p className="text-gray-400 text-sm">{servant.name}'s manga career</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 overflow-y-auto flex-1">
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
              className="w-full bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-lg py-3 text-white disabled:opacity-50 font-medium mb-4"
            >
              {working ? 'Drawing...' : 'Draw Next Chapter'}
            </button>

            {career.manga_chapters && career.manga_chapters.length > 0 && (
              <div>
                <h4 className="text-white font-medium text-sm mb-2">Published Chapters</h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {[...career.manga_chapters].reverse().map((chapter) => (
                    <div key={chapter.number} className="bg-gray-800/50 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-1">
                        <h5 className="text-white font-medium text-sm">Ch. {chapter.number}: {chapter.title}</h5>
                        <span className="text-xs text-purple-400">{chapter.quality}% quality</span>
                      </div>
                      <div className="flex gap-3 text-xs text-gray-400">
                        <span>📄 {chapter.panels} panels</span>
                        <span>👥 +{chapter.fans_gained} fans</span>
                        <span>💰 ${chapter.income}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!career?.series_name && (
          <div className="text-center py-8">
            <BookOpen className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">No Active Series</h3>
            <p className="text-gray-400 text-sm mb-6">Start your manga journey</p>
            <button
              onClick={() => setShowGenreSelect(true)}
              disabled={working}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-xl disabled:opacity-50"
            >
              Start New Series
            </button>
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
        </div>
      </motion.div>

      {/* Genre Selection Modal */}
      {showGenreSelect && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90"
          onClick={() => !working && setShowGenreSelect(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-white text-xl font-bold mb-4">Choose Genre</h3>
            <div className="grid grid-cols-2 gap-3">
              {GENRES.map(genre => (
                <button
                  key={genre.id}
                  onClick={() => {
                    handleStartSeries(genre);
                    setShowGenreSelect(false);
                  }}
                  disabled={working}
                  className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-center transition-colors disabled:opacity-50"
                >
                  <div className="text-4xl mb-2">{genre.icon}</div>
                  <h4 className="text-white font-medium text-sm mb-1">{genre.label}</h4>
                  <p className="text-gray-400 text-xs">{genre.desc}</p>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}