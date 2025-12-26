import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, DollarSign, Users, TrendingUp, Award, Pen, Star, Book } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const BOOK_GENRES = {
  dark_romance: { 
    name: 'Dark Romance', 
    icon: '💋', 
    examples: ['Forbidden vampire love', 'Toxic immortal relationship', 'Blood-bonded lovers'],
    basePrice: 4.99,
    difficulty: 'Medium'
  },
  paranormal: { 
    name: 'Paranormal Romance', 
    icon: '🌙', 
    examples: ['Supernatural love triangle', 'Witch meets vampire', 'Fated mates under moonlight'],
    basePrice: 3.99,
    difficulty: 'Easy'
  },
  gothic_horror: { 
    name: 'Gothic Horror', 
    icon: '🏚️', 
    examples: ['Haunted mansion mystery', 'Victorian vampire hunters', 'Cursed bloodline'],
    basePrice: 5.99,
    difficulty: 'Hard'
  },
  urban_fantasy: { 
    name: 'Urban Fantasy', 
    icon: '🌃', 
    examples: ['City of vampires', 'Supernatural underground', 'Modern witch society'],
    basePrice: 4.99,
    difficulty: 'Medium'
  },
  erotic_romance: { 
    name: 'Erotic Romance', 
    icon: '🔥', 
    examples: ['Steamy vampire encounters', 'Immortal pleasure', 'Blood and desire'],
    basePrice: 6.99,
    difficulty: 'Medium'
  },
  thriller: { 
    name: 'Supernatural Thriller', 
    icon: '🔪', 
    examples: ['Vampire serial killer', 'Hunt for ancient evil', 'Blood conspiracy'],
    basePrice: 5.99,
    difficulty: 'Hard'
  },
  fantasy: { 
    name: 'Dark Fantasy', 
    icon: '⚔️', 
    examples: ['Vampire kingdoms at war', 'Quest for immortality', 'Ancient vampire prophecy'],
    basePrice: 5.99,
    difficulty: 'Hard'
  },
  ya_paranormal: { 
    name: 'YA Paranormal', 
    icon: '📖', 
    examples: ['Teen discovers they\'re vampire', 'High school supernatural', 'Coming of age in darkness'],
    basePrice: 3.99,
    difficulty: 'Easy'
  }
};

export default function AuthorCareer({ servant, onClose }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('write');
  const [writing, setWriting] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [bookTitle, setBookTitle] = useState('');
  const [bookPlot, setBookPlot] = useState('');

  // TODO: Add Book entity when ready
  // For now showing full interface

  const handleWriteBook = async () => {
    if (!selectedGenre || !bookTitle || !bookPlot) return;
    
    setWriting(true);
    
    setTimeout(async () => {
      const genre = BOOK_GENRES[selectedGenre];
      const wordCount = Math.floor(Math.random() * 40000) + 50000; // 50k-90k words
      const sales = Math.floor(Math.random() * 200) + 50;
      const earnings = sales * genre.basePrice;
      
      await base44.entities.NightLog.create({
        entry: `${servant.name} finished writing "${bookTitle}" (${genre.name}, ${wordCount} words). Sold ${sales} copies. Earned $${earnings.toFixed(2)}.`,
        category: 'interaction',
        intensity: 'significant'
      });
      
      const relGain = Math.floor(Math.random() * 8) + 5;
      await base44.entities.Servant.update(servant.id, {
        relationship: Math.min(100, (servant.relationship || 0) + relGain)
      });
      
      queryClient.invalidateQueries();
      setWriting(false);
      setSelectedGenre(null);
      setBookTitle('');
      setBookPlot('');
    }, 5000);
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
        className="bg-gray-900 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Dark Romance Author</h2>
        <p className="text-gray-400 text-sm mb-6">Write novels and build your author career</p>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('write')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'write' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            📝 Write
          </button>
          <button
            onClick={() => setTab('library')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'library' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            📚 Library
          </button>
        </div>

        {tab === 'write' && !selectedGenre && (
          <div className="space-y-4">
            <h3 className="text-white font-medium mb-3">Choose Genre</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {Object.entries(BOOK_GENRES).map(([key, genre]) => (
                <button
                  key={key}
                  onClick={() => setSelectedGenre(key)}
                  className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{genre.icon}</span>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{genre.name}</h4>
                      <p className="text-gray-500 text-xs">{genre.difficulty} • ${genre.basePrice}</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Examples: {genre.examples.slice(0, 2).join(', ')}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === 'write' && selectedGenre && !writing && (
          <div className="space-y-4">
            <button
              onClick={() => setSelectedGenre(null)}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              ← Back to genres
            </button>

            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{BOOK_GENRES[selectedGenre].icon}</span>
                <div>
                  <h3 className="text-white font-bold">{BOOK_GENRES[selectedGenre].name}</h3>
                  <p className="text-gray-400 text-sm">{BOOK_GENRES[selectedGenre].difficulty} difficulty</p>
                </div>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="Book title..."
                  className="w-full bg-gray-900 text-white rounded-lg px-4 py-3"
                />

                <textarea
                  value={bookPlot}
                  onChange={(e) => setBookPlot(e.target.value)}
                  placeholder="What's the story about?"
                  className="w-full bg-gray-900 text-white rounded-lg px-4 py-3 h-32"
                />

                <details className="text-gray-400 text-sm">
                  <summary className="cursor-pointer">💡 Plot ideas</summary>
                  <div className="mt-2 space-y-1">
                    {BOOK_GENRES[selectedGenre].examples.map((ex, i) => (
                      <button
                        key={i}
                        onClick={() => setBookPlot(ex)}
                        className="block text-left w-full hover:text-white px-2 py-1 hover:bg-gray-800 rounded"
                      >
                        • {ex}
                      </button>
                    ))}
                  </div>
                </details>

                <button
                  onClick={handleWriteBook}
                  disabled={!bookTitle || !bookPlot}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 text-white font-medium py-4 rounded-xl disabled:opacity-50"
                >
                  ✍️ Start Writing
                </button>
              </div>
            </div>
          </div>
        )}

        {writing && (
          <div className="text-center py-12">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              ✍️
            </motion.div>
            <p className="text-gray-400">Writing in progress...</p>
            <p className="text-gray-500 text-sm mt-2">Crafting your story</p>
          </div>
        )}

        {tab === 'library' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-400">Your library is empty</p>
            <p className="text-gray-500 text-sm mt-2">Write your first book to see it here</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}