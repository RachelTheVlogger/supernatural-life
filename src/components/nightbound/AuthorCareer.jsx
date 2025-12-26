import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, DollarSign, Users, TrendingUp, Award, Pen, Star, Book, Edit, CheckCircle, Upload, Mic, Share2, Package, MapPin } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const BOOK_GENRES = {
  dark_romance: { name: 'Dark Romance', icon: '💋', basePrice: 4.99, difficulty: 'Medium' },
  paranormal: { name: 'Paranormal Romance', icon: '🌙', basePrice: 3.99, difficulty: 'Easy' },
  gothic_horror: { name: 'Gothic Horror', icon: '🏚️', basePrice: 5.99, difficulty: 'Hard' },
  urban_fantasy: { name: 'Urban Fantasy', icon: '🌃', basePrice: 4.99, difficulty: 'Medium' },
  erotic_romance: { name: 'Erotic Romance', icon: '🔥', basePrice: 6.99, difficulty: 'Medium' },
  thriller: { name: 'Supernatural Thriller', icon: '🔪', basePrice: 5.99, difficulty: 'Hard' },
  fantasy: { name: 'Dark Fantasy', icon: '⚔️', basePrice: 5.99, difficulty: 'Hard' },
  ya_paranormal: { name: 'YA Paranormal', icon: '📖', basePrice: 3.99, difficulty: 'Easy' }
};

const PLATFORMS = {
  amazon: { name: 'Amazon KDP', royalty: 0.70, reach: 'Massive', upfront: 0 },
  traditional: { name: 'Traditional Publisher', royalty: 0.10, reach: 'Large', upfront: 5000 },
  indie: { name: 'Independent', royalty: 0.90, reach: 'Small', upfront: 500 },
  serialized: { name: 'Serialized (Patreon)', royalty: 0.95, reach: 'Niche', upfront: 0 }
};

export default function AuthorCareer({ servant, onClose }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('write');
  const [working, setWorking] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [newBook, setNewBook] = useState({ title: '', genre: null, target_words: 80000 });

  const { data: books = [] } = useQuery({
    queryKey: ['books', servant.id],
    queryFn: () => base44.entities.Book.filter({ servant_id: servant.id }, '-created_date'),
    staleTime: 3000
  });

  const draftBooks = books.filter(b => b.status === 'drafting');
  const publishedBooks = books.filter(b => b.status === 'published');

  const handleStartBook = async () => {
    if (!newBook.title || !newBook.genre) return;
    
    await base44.entities.Book.create({
      servant_id: servant.id,
      title: newBook.title,
      genre: newBook.genre,
      word_count: 0,
      target_words: newBook.target_words,
      status: 'drafting',
      quality: 50
    });
    
    queryClient.invalidateQueries(['books']);
    setNewBook({ title: '', genre: null, target_words: 80000 });
  };

  const handleWrite = async (book) => {
    setWorking(true);
    setTimeout(async () => {
      const wordsWritten = Math.floor(Math.random() * 3000) + 1000;
      const newWordCount = Math.min(book.word_count + wordsWritten, book.target_words);
      const qualityChange = Math.floor(Math.random() * 5) - 2;
      
      await base44.entities.Book.update(book.id, {
        word_count: newWordCount,
        quality: Math.max(0, Math.min(100, book.quality + qualityChange)),
        status: newWordCount >= book.target_words ? 'rewriting' : 'drafting'
      });
      
      queryClient.invalidateQueries(['books']);
      setWorking(false);
    }, 3000);
  };

  const handleRewrite = async (book) => {
    setWorking(true);
    setTimeout(async () => {
      const qualityGain = Math.floor(Math.random() * 15) + 10;
      
      await base44.entities.Book.update(book.id, {
        quality: Math.min(100, book.quality + qualityGain),
        status: 'editing'
      });
      
      queryClient.invalidateQueries(['books']);
      setWorking(false);
    }, 4000);
  };

  const handleEdit = async (book) => {
    setWorking(true);
    setTimeout(async () => {
      const qualityGain = Math.floor(Math.random() * 10) + 5;
      
      await base44.entities.Book.update(book.id, {
        quality: Math.min(100, book.quality + qualityGain),
        status: 'proofreading'
      });
      
      queryClient.invalidateQueries(['books']);
      setWorking(false);
    }, 3500);
  };

  const handleProofread = async (book) => {
    setWorking(true);
    setTimeout(async () => {
      const qualityGain = Math.floor(Math.random() * 8) + 3;
      
      await base44.entities.Book.update(book.id, {
        quality: Math.min(100, book.quality + qualityGain),
        status: 'ready'
      });
      
      queryClient.invalidateQueries(['books']);
      setWorking(false);
    }, 2500);
  };

  const handlePublish = async (book, platform) => {
    const price = BOOK_GENRES[book.genre].basePrice;
    
    await base44.entities.Book.update(book.id, {
      status: 'published',
      platform: platform,
      price: price
    });
    
    // Initial sales
    const initialSales = Math.floor(Math.random() * 100) + 50;
    const royalty = PLATFORMS[platform].royalty;
    const revenue = initialSales * price * royalty;
    
    await base44.entities.Book.update(book.id, {
      copies_sold: initialSales,
      revenue: revenue,
      rating: Math.random() * 2 + 3
    });
    
    await base44.entities.NightLog.create({
      entry: `${servant.name} published "${book.title}" on ${PLATFORMS[platform].name}. ${initialSales} copies sold. Earned $${revenue.toFixed(2)}.`,
      category: 'interaction',
      intensity: 'significant'
    });
    
    queryClient.invalidateQueries(['books']);
  };

  const handlePromote = async (book) => {
    setWorking(true);
    setTimeout(async () => {
      const newSales = Math.floor(Math.random() * 50) + 20;
      const royalty = PLATFORMS[book.platform].royalty;
      const newRevenue = newSales * book.price * royalty;
      const buzzGain = Math.floor(Math.random() * 20) + 10;
      
      await base44.entities.Book.update(book.id, {
        copies_sold: book.copies_sold + newSales,
        revenue: book.revenue + newRevenue,
        social_buzz: Math.min(100, (book.social_buzz || 0) + buzzGain)
      });
      
      queryClient.invalidateQueries(['books']);
      setWorking(false);
    }, 2000);
  };

  const handleAudiobook = async (book) => {
    if (book.has_audiobook) return;
    
    setWorking(true);
    setTimeout(async () => {
      await base44.entities.Book.update(book.id, {
        has_audiobook: true
      });
      
      const audioSales = Math.floor(Math.random() * 30) + 10;
      const audioRevenue = audioSales * book.price * 1.5 * 0.7;
      
      await base44.entities.Book.update(book.id, {
        audiobook_sales: audioSales,
        revenue: book.revenue + audioRevenue
      });
      
      queryClient.invalidateQueries(['books']);
      setWorking(false);
    }, 5000);
  };

  const handleBookTour = async (book) => {
    setWorking(true);
    setTimeout(async () => {
      const newSales = Math.floor(Math.random() * 100) + 50;
      const royalty = PLATFORMS[book.platform].royalty;
      const tourRevenue = newSales * book.price * royalty;
      const repGain = Math.floor(Math.random() * 15) + 10;
      
      await base44.entities.Book.update(book.id, {
        copies_sold: book.copies_sold + newSales,
        revenue: book.revenue + tourRevenue,
        social_buzz: Math.min(100, (book.social_buzz || 0) + 25)
      });
      
      await base44.entities.Servant.update(servant.id, {
        relationship: Math.min(100, (servant.relationship || 0) + repGain)
      });
      
      await base44.entities.NightLog.create({
        entry: `${servant.name} went on a book tour for "${book.title}". Signed ${newSales} copies. Earned $${tourRevenue.toFixed(2)}.`,
        category: 'interaction',
        intensity: 'significant'
      });
      
      queryClient.invalidateQueries(['books']);
      setWorking(false);
    }, 6000);
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
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Author Career</h2>
        <p className="text-gray-400 text-sm mb-6">Write, publish, and promote your books</p>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button onClick={() => setTab('write')} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${tab === 'write' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            ✍️ Write
          </button>
          <button onClick={() => setTab('published')} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${tab === 'published' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            📚 Published ({publishedBooks.length})
          </button>
          <button onClick={() => setTab('stats')} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${tab === 'stats' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            📊 Stats
          </button>
        </div>

        <AnimatePresence mode="wait">
          {tab === 'write' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Always show new book section if no drafts */}
              {draftBooks.length === 0 && (
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-white font-medium mb-3">Start New Book</h3>
                  <input
                    type="text"
                    value={newBook.title}
                    onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                    placeholder="Book title..."
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 mb-4"
                  />
                  
                  <h4 className="text-white text-sm mb-2">Choose Genre</h4>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {Object.entries(BOOK_GENRES).map(([key, genre]) => (
                      <button
                        key={key}
                        onClick={() => setNewBook({...newBook, genre: key})}
                        className={`rounded-lg p-3 text-left transition-all ${
                          newBook.genre === key 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-gray-900 hover:bg-gray-700 text-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{genre.icon}</span>
                          <div>
                            <p className="text-sm font-medium">{genre.name}</p>
                            <p className="text-xs opacity-70">${genre.basePrice}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={handleStartBook}
                    disabled={!newBook.title || !newBook.genre}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 text-white font-medium py-4 rounded-xl disabled:opacity-50"
                  >
                    Start Writing
                  </button>
                </div>
              )}

              {/* Show active drafts */}
              {draftBooks.map(book => (
                <div key={book.id} className="bg-gray-800 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-white font-bold">{book.title}</h3>
                      <p className="text-gray-400 text-sm">{BOOK_GENRES[book.genre].name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded text-xs ${
                      book.status === 'ready' ? 'bg-green-900/30 text-green-400' :
                      'bg-purple-900/30 text-purple-400'
                    }`}>
                      {book.status}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white">{book.word_count}/{book.target_words} words</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div style={{ width: `${(book.word_count / book.target_words) * 100}%` }} className="h-2 bg-purple-500 rounded-full" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Quality</span>
                        <span className="text-white">{book.quality}/100</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div style={{ width: `${book.quality}%` }} className="h-2 bg-green-500 rounded-full" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {book.status === 'drafting' && (
                      <button onClick={() => handleWrite(book)} disabled={working} className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm">
                        <Pen className="w-4 h-4 inline mr-1" /> Write
                      </button>
                    )}
                    {book.status === 'rewriting' && (
                      <button onClick={() => handleRewrite(book)} disabled={working} className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm">
                        <Book className="w-4 h-4 inline mr-1" /> Rewrite
                      </button>
                    )}
                    {book.status === 'editing' && (
                      <button onClick={() => handleEdit(book)} disabled={working} className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg text-sm">
                        <Edit className="w-4 h-4 inline mr-1" /> Edit
                      </button>
                    )}
                    {book.status === 'proofreading' && (
                      <button onClick={() => handleProofread(book)} disabled={working} className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm">
                        <CheckCircle className="w-4 h-4 inline mr-1" /> Proofread
                      </button>
                    )}
                    {book.status === 'ready' && (
                      <>
                        <button onClick={() => setSelectedBook(book)} className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm col-span-2">
                          <Upload className="w-4 h-4 inline mr-1" /> Publish
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {tab === 'published' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {publishedBooks.length === 0 ? (
                <p className="text-gray-400 text-center py-12">No published books yet</p>
              ) : (
                publishedBooks.map(book => (
                  <div key={book.id} className="bg-gray-800 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-white font-bold">{book.title}</h3>
                        <p className="text-gray-400 text-sm">{BOOK_GENRES[book.genre].name} • {PLATFORMS[book.platform].name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold">${book.revenue.toFixed(2)}</p>
                        <p className="text-gray-400 text-xs">{book.copies_sold} sold</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="bg-gray-900 rounded p-2">
                        <p className="text-gray-400 text-xs">Rating</p>
                        <p className="text-white">⭐ {book.rating?.toFixed(1) || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-900 rounded p-2">
                        <p className="text-gray-400 text-xs">Social Buzz</p>
                        <p className="text-white">{book.social_buzz || 0}/100</p>
                      </div>
                      {book.has_audiobook && (
                        <div className="bg-gray-900 rounded p-2">
                          <p className="text-gray-400 text-xs">Audiobook Sales</p>
                          <p className="text-white">{book.audiobook_sales}</p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => handlePromote(book)} disabled={working} className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm">
                        <Share2 className="w-4 h-4 inline mr-1" /> Promote
                      </button>
                      {!book.has_audiobook && (
                        <button onClick={() => handleAudiobook(book)} disabled={working} className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm">
                          <Mic className="w-4 h-4 inline mr-1" /> Audiobook
                        </button>
                      )}
                      <button onClick={() => handleBookTour(book)} disabled={working} className="bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg text-sm col-span-2">
                        <MapPin className="w-4 h-4 inline mr-1" /> Book Tour
                      </button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {tab === 'stats' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-green-950/40 to-green-900/40 border border-green-500/30 rounded-xl p-6">
                  <DollarSign className="w-8 h-8 text-green-400 mb-2" />
                  <p className="text-2xl font-bold text-white">${publishedBooks.reduce((sum, b) => sum + b.revenue, 0).toFixed(2)}</p>
                  <p className="text-gray-400 text-sm">Total Revenue</p>
                </div>
                <div className="bg-gradient-to-br from-blue-950/40 to-blue-900/40 border border-blue-500/30 rounded-xl p-6">
                  <BookOpen className="w-8 h-8 text-blue-400 mb-2" />
                  <p className="text-2xl font-bold text-white">{publishedBooks.reduce((sum, b) => sum + b.copies_sold, 0)}</p>
                  <p className="text-gray-400 text-sm">Total Sales</p>
                </div>
                <div className="bg-gradient-to-br from-purple-950/40 to-purple-900/40 border border-purple-500/30 rounded-xl p-6">
                  <Book className="w-8 h-8 text-purple-400 mb-2" />
                  <p className="text-2xl font-bold text-white">{publishedBooks.length}</p>
                  <p className="text-gray-400 text-sm">Published Books</p>
                </div>
                <div className="bg-gradient-to-br from-pink-950/40 to-pink-900/40 border border-pink-500/30 rounded-xl p-6">
                  <Star className="w-8 h-8 text-pink-400 mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {publishedBooks.length > 0 ? (publishedBooks.reduce((sum, b) => sum + (b.rating || 0), 0) / publishedBooks.length).toFixed(1) : 'N/A'}
                  </p>
                  <p className="text-gray-400 text-sm">Avg Rating</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {working && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }} className="text-6xl">
              ✍️
            </motion.div>
          </motion.div>
        )}

        {selectedBook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setSelectedBook(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-white text-xl font-bold mb-4">Choose Publishing Platform</h3>
              <div className="space-y-3">
                {Object.entries(PLATFORMS).map(([key, platform]) => (
                  <button
                    key={key}
                    onClick={() => {
                      handlePublish(selectedBook, key);
                      setSelectedBook(null);
                    }}
                    className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left"
                  >
                    <h4 className="text-white font-medium mb-1">{platform.name}</h4>
                    <p className="text-gray-400 text-sm">Royalty: {platform.royalty * 100}% • {platform.reach} reach</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}