import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, DollarSign, Users, TrendingUp, Award, Pen, Star, Book, Edit, CheckCircle, Upload, Mic, Share2, Package, MapPin, Zap } from 'lucide-react';
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
  const [workingMessage, setWorkingMessage] = useState('');
  const [workingExcerpt, setWorkingExcerpt] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [newBook, setNewBook] = useState({ title: '', genre: null, target_words: 80000 });
  const [showReview, setShowReview] = useState(null);
  const [showARCModal, setShowARCModal] = useState(false);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState(0);
  const [editingBook, setEditingBook] = useState(null);
  const [facebookGroupSize, setFacebookGroupSize] = useState(servantCareer?.newsletter_subscribers || 0);

  const { data: books = [] } = useQuery({
    queryKey: ['books', servant.id],
    queryFn: () => base44.entities.Book.filter({ servant_id: servant.id }, '-created_date'),
    staleTime: 3000
  });

  const draftBooks = books.filter(b => b.status === 'drafting' || b.status === 'rewriting' || b.status === 'editing' || b.status === 'proofreading' || b.status === 'ready');
  const publishedBooks = books.filter(b => b.status === 'published');
  
  const { data: career = [] } = useQuery({
    queryKey: ['career', servant.id],
    queryFn: () => base44.entities.ServantCareer.filter({ servant_id: servant.id })
  });
  
  const servantCareer = career[0];

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
    
    const excerpts = {
      dark_romance: [
        '"His touch burned like ice against my skin. I should run. I should scream. Instead, I leaned closer."',
        '"You\'re mine," he whispered, his fangs grazing my neck. "In this life and every life after."',
        '"The darkness in him called to the darkness in me. We were inevitable. Dangerous. Perfect."'
      ],
      paranormal: [
        '"The full moon rose, and with it, my true self emerged. Wild. Untamed. Free."',
        '"Magic hummed in my veins, ancient and powerful. The world would never be the same."',
        '"Between the realm of living and dead, we found each other. Love transcending mortality."'
      ],
      gothic_horror: [
        '"The manor whispered secrets. Bloodstained secrets. And I was foolish enough to listen."',
        '"In the mirror, my reflection smiled. But I wasn\'t smiling. Not anymore."',
        '"The walls breathed with malice. Each room a chamber of forgotten horrors."'
      ],
      urban_fantasy: [
        '"Neon lights couldn\'t hide the shadow creatures lurking in every alley. This city was theirs now."',
        '"She summoned fire in the subway. He raised the dead in a coffee shop. Just another Tuesday."',
        '"Magic and technology collided. The old world met the new. And chaos reigned."'
      ],
      erotic_romance: [
        '"His hands explored territory I\'d forbidden to everyone else. With him, I had no boundaries."',
        '"We broke every rule. Crossed every line. And neither of us wanted to stop."',
        '"Desire consumed rational thought. All that mattered was his body against mine."'
      ],
      thriller: [
        '"The killer was closer than I thought. Watching. Waiting. Wearing a familiar face."',
        '"Three bodies. Three nights. And the pattern pointed directly at me."',
        '"Trust no one, they said. But when everyone\'s a suspect, paranoia becomes survival."'
      ],
      fantasy: [
        '"The prophecy spoke of darkness rising. They didn\'t know the darkness was already here."',
        '"Steel met shadow. Ancient power clashed with forbidden magic. War was inevitable."',
        '"Dragons circled overhead. The age of men was ending. The age of legend had begun."'
      ],
      ya_paranormal: [
        '"Sixteen and immortal. High school was about to get a lot more complicated."',
        '"I could read minds now. Turns out, ignorance really is bliss."',
        '"The boy in my dreams appeared in my classroom. This was either fate or a nightmare."'
      ]
    };
    
    const struggles = [
      'Coffee. Need more coffee...',
      'Delete. Delete. Delete. Start over...',
      'This scene isn\'t working...',
      'Character motivation unclear...',
      'Plot hole detected. Fixing...',
      'Rewriting this paragraph for the fifth time...'
    ];
    
    const breakthroughs = [
      'Perfect line! Writing faster now...',
      'The scene clicks into place!',
      'Character voice found!',
      'This dialogue is gold...',
      'In the zone. Don\'t stop...',
      'Everything flowing perfectly...'
    ];
    
    const writerBlock = Math.random() < 0.2;
    const messages = writerBlock ? struggles : breakthroughs;
    
    let msgIndex = 0;
    setWorkingMessage(writerBlock ? '3am. Staring at blank page...' : 'Opening document...');
    
    const interval = setInterval(() => {
      msgIndex++;
      if (msgIndex < messages.length) {
        setWorkingMessage(messages[msgIndex]);
      }
    }, 500);
    
    setTimeout(() => {
      const excerpt = excerpts[book.genre][Math.floor(Math.random() * excerpts[book.genre].length)];
      setWorkingExcerpt(excerpt);
      setWorkingMessage('Writing...');
    }, 1500);
    
    setTimeout(async () => {
      clearInterval(interval);
      const wordsWritten = writerBlock 
        ? Math.floor(Math.random() * 1000) + 500
        : Math.floor(Math.random() * 3000) + 1500;
      const newWordCount = Math.min(book.word_count + wordsWritten, book.target_words);
      const qualityChange = writerBlock ? -1 : Math.floor(Math.random() * 5);
      
      setWorkingMessage(`Session complete. ${wordsWritten} words written.`);
      setWorkingExcerpt('');
      
      await base44.entities.Book.update(book.id, {
        word_count: newWordCount,
        quality: Math.max(0, Math.min(100, book.quality + qualityChange)),
        status: newWordCount >= book.target_words ? 'rewriting' : 'drafting'
      });
      
      await base44.entities.NightLog.create({
        entry: `${servant.name} ${writerBlock ? 'struggled through writer\'s block' : 'had a breakthrough writing session'}. ${wordsWritten} words on "${book.title}".`,
        category: 'interaction',
        intensity: 'moderate'
      });
      
      queryClient.invalidateQueries(['books']);
      
      setTimeout(() => {
        setWorking(false);
        setWorkingMessage('');
      }, 2000);
    }, 4000);
  };

  const handleRewrite = async (book) => {
    setWorking(true);
    const messages = [
      'Reading through your draft...',
      'Identifying weak passages...',
      'Strengthening character arcs...',
      'Improving pacing...',
      'Refining prose...',
      'Polishing scenes...',
      'Quality improving...'
    ];
    
    let msgIndex = 0;
    setWorkingMessage(messages[0]);
    const interval = setInterval(() => {
      msgIndex++;
      if (msgIndex < messages.length) {
        setWorkingMessage(messages[msgIndex]);
      }
    }, 600);
    
    setTimeout(async () => {
      clearInterval(interval);
      const qualityGain = Math.floor(Math.random() * 15) + 10;
      
      setWorkingMessage(`Quality improved by ${qualityGain}%!`);
      
      await base44.entities.Book.update(book.id, {
        quality: Math.min(100, book.quality + qualityGain),
        status: 'editing'
      });
      
      queryClient.invalidateQueries(['books']);
      
      setTimeout(() => {
        setWorking(false);
        setWorkingMessage('');
      }, 1000);
    }, 4000);
  };

  const handleEdit = async (book) => {
    setWorking(true);
    const messages = [
      'Scanning for errors...',
      'Fixing grammar...',
      'Improving sentence flow...',
      'Tightening paragraphs...',
      'Removing redundancy...',
      'Nearly perfect...'
    ];
    
    let msgIndex = 0;
    setWorkingMessage(messages[0]);
    const interval = setInterval(() => {
      msgIndex++;
      if (msgIndex < messages.length) {
        setWorkingMessage(messages[msgIndex]);
      }
    }, 550);
    
    setTimeout(async () => {
      clearInterval(interval);
      const qualityGain = Math.floor(Math.random() * 10) + 5;
      
      setWorkingMessage(`Edited successfully! +${qualityGain}% quality`);
      
      await base44.entities.Book.update(book.id, {
        quality: Math.min(100, book.quality + qualityGain),
        status: 'proofreading'
      });
      
      queryClient.invalidateQueries(['books']);
      
      setTimeout(() => {
        setWorking(false);
        setWorkingMessage('');
      }, 1000);
    }, 3500);
  };

  const handleProofread = async (book) => {
    setWorking(true);
    const messages = [
      'Final read-through...',
      'Catching typos...',
      'Checking consistency...',
      'Perfect punctuation...',
      'Final polish...'
    ];
    
    let msgIndex = 0;
    setWorkingMessage(messages[0]);
    const interval = setInterval(() => {
      msgIndex++;
      if (msgIndex < messages.length) {
        setWorkingMessage(messages[msgIndex]);
      }
    }, 500);
    
    setTimeout(async () => {
      clearInterval(interval);
      const qualityGain = Math.floor(Math.random() * 8) + 3;
      
      setWorkingMessage('Book ready to publish!');
      
      await base44.entities.Book.update(book.id, {
        quality: Math.min(100, book.quality + qualityGain),
        status: 'ready'
      });
      
      queryClient.invalidateQueries(['books']);
      
      setTimeout(() => {
        setWorking(false);
        setWorkingMessage('');
      }, 1000);
    }, 2500);
  };

  const handlePublish = async (book, platform) => {
    setWorking(true);
    
    const rejected = platform === 'traditional' && book.quality < 70 && Math.random() < 0.4;
    
    if (rejected) {
      setWorkingMessage('Submitting to publishers...');
      setTimeout(() => {
        setWorkingMessage('Rejection letter received.');
        setTimeout(() => {
          setWorkingMessage('"Not quite what we\'re looking for at this time. Best of luck elsewhere."');
          setTimeout(() => {
            setWorking(false);
            setWorkingMessage('');
            alert('Your manuscript was rejected. Improve quality or try a different platform.');
          }, 2000);
        }, 1500);
      }, 2000);
      return;
    }
    
    const messages = platform === 'traditional' 
      ? ['Submitting query letter...', 'Agent interested!', 'Negotiating contract...', 'Deal signed!', 'Going to print...']
      : ['Formatting manuscript...', 'Uploading files...', 'Setting metadata...', 'Book going live...'];
    
    let msgIndex = 0;
    setWorkingMessage(messages[0]);
    const interval = setInterval(() => {
      msgIndex++;
      if (msgIndex < messages.length) {
        setWorkingMessage(messages[msgIndex]);
      }
    }, 800);
    
    setTimeout(async () => {
      clearInterval(interval);
      
      const price = BOOK_GENRES[book.genre].basePrice;
      
      await base44.entities.Book.update(book.id, {
        status: 'published',
        platform: platform,
        price: price
      });
      
      const qualityMultiplier = book.quality / 100;
      const initialSales = Math.floor((Math.random() * 100 + 50) * qualityMultiplier);
      const royalty = PLATFORMS[platform].royalty;
      const revenue = initialSales * price * royalty;
      
      const upfront = platform === 'traditional' ? PLATFORMS[platform].upfront : 0;
      
      setWorkingMessage(upfront > 0 
        ? `Published! Advance: $${upfront}. ${initialSales} copies sold.`
        : `Published! ${initialSales} copies sold. $${revenue.toFixed(2)} earned.`
      );
      
      await base44.entities.Book.update(book.id, {
        copies_sold: initialSales,
        revenue: revenue + upfront,
        rating: Math.random() * 1.5 + (book.quality / 100) * 3
      });
      
      await base44.entities.NightLog.create({
        entry: platform === 'traditional'
          ? `${servant.name} signed a publishing deal for "${book.title}"! $${upfront} advance. ${initialSales} copies in first week.`
          : `${servant.name} self-published "${book.title}" on ${PLATFORMS[platform].name}. ${initialSales} copies sold. Earned $${revenue.toFixed(2)}.`,
        category: 'interaction',
        intensity: 'significant'
      });
      
      queryClient.invalidateQueries(['books']);
      
      setTimeout(() => {
        setWorking(false);
        setWorkingMessage('');
      }, 2500);
    }, messages.length * 800);
  };

  const handlePromote = async (book) => {
    setWorking(true);
    const messages = [
      'Posting on social media...',
      'Reaching out to influencers...',
      'Running ads...',
      'Building buzz...',
      'Sales coming in...'
    ];
    
    let msgIndex = 0;
    setWorkingMessage(messages[0]);
    const interval = setInterval(() => {
      msgIndex++;
      if (msgIndex < messages.length) {
        setWorkingMessage(messages[msgIndex]);
      }
    }, 400);
    
    setTimeout(async () => {
      clearInterval(interval);
      const newSales = Math.floor(Math.random() * 50) + 20;
      const royalty = PLATFORMS[book.platform].royalty;
      const newRevenue = newSales * book.price * royalty;
      const buzzGain = Math.floor(Math.random() * 20) + 10;
      
      setWorkingMessage(`+${newSales} sales! Earned $${newRevenue.toFixed(2)}`);
      
      await base44.entities.Book.update(book.id, {
        copies_sold: book.copies_sold + newSales,
        revenue: book.revenue + newRevenue,
        social_buzz: Math.min(100, (book.social_buzz || 0) + buzzGain)
      });
      
      queryClient.invalidateQueries(['books']);
      
      setTimeout(() => {
        setWorking(false);
        setWorkingMessage('');
      }, 1500);
    }, 2000);
  };

  const handleAudiobook = async (book) => {
    if (book.has_audiobook) return;
    
    const narrators = [
      { name: 'Alex Rivers', voice: 'Deep & Commanding', rate: 250, quality: 95 },
      { name: 'Morgan Chase', voice: 'Sultry & Smooth', rate: 300, quality: 98 },
      { name: 'Jordan Blake', voice: 'Versatile & Dynamic', rate: 200, quality: 85 },
      { name: 'Casey Night', voice: 'Dark & Mysterious', rate: 280, quality: 92 },
      { name: 'Riley Storm', voice: 'Young & Energetic', rate: 180, quality: 80 }
    ];
    
    const narrator = narrators[Math.floor(Math.random() * narrators.length)];
    
    if (!confirm(`Hire ${narrator.name}?\nVoice: ${narrator.voice}\nRate: $${narrator.rate}/finished hour\nQuality: ${narrator.quality}/100`)) {
      return;
    }
    
    setWorking(true);
    const messages = [
      `Contracting ${narrator.name}...`,
      'Narrator recording sample chapter...',
      'Sample approved! Full production starting...',
      'Recording chapters 1-5...',
      'Recording chapters 6-10...',
      'Recording chapters 11-15...',
      'Final chapters recorded...',
      'Post-production editing...',
      'Mastering audio quality...',
      'Uploading to ACX/Findaway...',
      'Going live on Audible...'
    ];
    
    let msgIndex = 0;
    setWorkingMessage(messages[0]);
    const interval = setInterval(() => {
      msgIndex++;
      if (msgIndex < messages.length) {
        setWorkingMessage(messages[msgIndex]);
      }
    }, 700);
    
    setTimeout(async () => {
      clearInterval(interval);
      
      const productionCost = Math.floor((book.target_words / 9300) * narrator.rate);
      
      await base44.entities.Book.update(book.id, {
        has_audiobook: true
      });
      
      const qualityBonus = narrator.quality > 90 ? 1.3 : 1.0;
      const audioSales = Math.floor((Math.random() * 40 + 20) * qualityBonus);
      const audioRevenue = audioSales * book.price * 1.5 * 0.7 - productionCost;
      
      setWorkingMessage(`Audiobook live! Cost: $${productionCost}. ${audioSales} copies sold. Net: $${audioRevenue.toFixed(2)}`);
      
      await base44.entities.Book.update(book.id, {
        audiobook_sales: audioSales,
        revenue: book.revenue + audioRevenue
      });
      
      await base44.entities.NightLog.create({
        entry: `${servant.name} produced audiobook for "${book.title}" with narrator ${narrator.name}. Cost $${productionCost}. Earned $${audioRevenue.toFixed(2)}.`,
        category: 'interaction',
        intensity: 'significant'
      });
      
      queryClient.invalidateQueries(['books']);
      
      setTimeout(() => {
        setWorking(false);
        setWorkingMessage('');
      }, 2500);
    }, messages.length * 700);
  };

  const handleBookTour = async (book) => {
    setWorking(true);
    const messages = [
      'Booking venues...',
      'First stop: New York...',
      'Signing books...',
      'Meeting readers...',
      'Next stop: LA...',
      'Media interviews...',
      'Final stop: Chicago...',
      'Tour complete!'
    ];
    
    let msgIndex = 0;
    setWorkingMessage(messages[0]);
    const interval = setInterval(() => {
      msgIndex++;
      if (msgIndex < messages.length) {
        setWorkingMessage(messages[msgIndex]);
      }
    }, 750);
    
    setTimeout(async () => {
      clearInterval(interval);
      const newSales = Math.floor(Math.random() * 100) + 50;
      const royalty = PLATFORMS[book.platform].royalty;
      const tourRevenue = newSales * book.price * royalty;
      const repGain = Math.floor(Math.random() * 15) + 10;
      
      setWorkingMessage(`Signed ${newSales} books! Earned $${tourRevenue.toFixed(2)}`);
      
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
      
      setTimeout(() => {
        setWorking(false);
        setWorkingMessage('');
      }, 2000);
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
          <button onClick={() => setTab('marketing')} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${tab === 'marketing' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
          📣 Marketing
          </button>
          <button onClick={() => setTab('social')} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${tab === 'social' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
          📱 Social
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

                  <div className="flex gap-2 mb-2">
                    <button onClick={() => setEditingBook(book)} className="text-gray-400 hover:text-white text-xs">
                      ✏️ Edit Details
                    </button>
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
                      <button onClick={() => handleBookTour(book)} disabled={working} className="bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg text-sm">
                        <MapPin className="w-4 h-4 inline mr-1" /> Book Tour
                      </button>
                      <button onClick={async () => {
                        const reviews = [
                          { stars: 5, text: 'Absolutely captivating! Couldn\'t put it down.' },
                          { stars: 5, text: 'Best book I\'ve read all year. The ending destroyed me.' },
                          { stars: 4, text: 'Great read. A few slow parts but overall loved it.' },
                          { stars: 4, text: 'Solid story. Characters felt real and complex.' },
                          { stars: 3, text: 'Good concept, execution was okay. Worth the read.' },
                          { stars: 2, text: 'Started strong but lost me halfway through.' },
                          { stars: 1, text: 'Not for me. DNF at 30%.' }
                        ];
                        const review = reviews[Math.floor(Math.random() * reviews.length)];
                        setShowReview({ ...review, book: book.title });
                      }} className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg text-sm">
                        <Star className="w-4 h-4 inline mr-1" /> Reviews
                      </button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {tab === 'marketing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="grid md:grid-cols-3 gap-3">
                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-gray-400 text-xs mb-1">ARC Team</p>
                  <p className="text-white text-2xl font-bold">{servantCareer?.arc_team_size || 0}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-gray-400 text-xs mb-1">Street Team</p>
                  <p className="text-white text-2xl font-bold">{servantCareer?.street_team_size || 0}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-gray-400 text-xs mb-1">Newsletter</p>
                  <p className="text-white text-2xl font-bold">{servantCareer?.newsletter_subscribers || 0}</p>
                </div>
              </div>

              <button
                onClick={async () => {
                  if (!servantCareer) {
                    await base44.entities.ServantCareer.create({
                      servant_id: servant.id,
                      author_career_active: true,
                      arc_team_size: Math.floor(Math.random() * 20) + 10,
                      newsletter_subscribers: Math.floor(Math.random() * 50) + 20
                    });
                  } else {
                    await base44.entities.ServantCareer.update(servantCareer.id, {
                      arc_team_size: (servantCareer.arc_team_size || 0) + Math.floor(Math.random() * 10) + 5,
                      newsletter_subscribers: (servantCareer.newsletter_subscribers || 0) + Math.floor(Math.random() * 30) + 10
                    });
                  }
                  queryClient.invalidateQueries(['career']);
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl"
              >
                📧 Recruit ARC Readers
              </button>

              <button
                onClick={async () => {
                  if (!servantCareer) return;
                  await base44.entities.ServantCareer.update(servantCareer.id, {
                    street_team_size: (servantCareer.street_team_size || 0) + Math.floor(Math.random() * 8) + 3
                  });
                  queryClient.invalidateQueries(['career']);
                }}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-xl"
              >
                👥 Build Street Team
              </button>

              <button
                onClick={async () => {
                  setShowARCModal(true);
                }}
                disabled={!servantCareer || servantCareer.arc_team_size < 5}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white py-3 rounded-xl disabled:opacity-50"
              >
                📦 Send ARC Copies (Need 5+ ARCs)
              </button>

              <button
                onClick={async () => {
                  if (!servantCareer) return;
                  const gain = Math.floor(Math.random() * 50) + 30;
                  await base44.entities.ServantCareer.update(servantCareer.id, {
                    newsletter_subscribers: (servantCareer.newsletter_subscribers || 0) + gain
                  });
                  await base44.entities.NightLog.create({
                    entry: `${servant.name} ran a newsletter campaign. Gained ${gain} new subscribers.`,
                    category: 'interaction',
                    intensity: 'moderate'
                  });
                  queryClient.invalidateQueries(['career']);
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl"
              >
                ✉️ Newsletter Campaign
              </button>

              <div className="bg-gray-800 rounded-xl p-4">
                <h4 className="text-white font-medium mb-2">What ARCs & Street Teams Do:</h4>
                <ul className="text-gray-300 text-sm space-y-2">
                  <li>• <span className="text-purple-400">ARC Readers</span> get early copies, leave honest reviews pre-launch</li>
                  <li>• <span className="text-pink-400">Street Team</span> shares your posts, hypes releases, spreads word-of-mouth</li>
                  <li>• <span className="text-blue-400">Newsletter</span> direct line to your most loyal fans for announcements</li>
                </ul>
              </div>
            </motion.div>
          )}

          {tab === 'social' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="bg-gray-800 rounded-xl p-4">
                <h3 className="text-white font-medium mb-2">📘 Facebook Reader Group</h3>
                <p className="text-gray-400 text-sm mb-3">Build your community and share updates</p>
                <div className="bg-gray-900 rounded-lg p-3 mb-4">
                  <p className="text-white text-xl font-bold">{facebookGroupSize} Members</p>
                </div>
                
                <button
                  onClick={async () => {
                    const gain = Math.floor(Math.random() * 30) + 15;
                    const newSize = facebookGroupSize + gain;
                    setFacebookGroupSize(newSize);
                    
                    if (servantCareer) {
                      await base44.entities.ServantCareer.update(servantCareer.id, {
                        newsletter_subscribers: newSize
                      });
                    }
                    
                    await base44.entities.NightLog.create({
                      entry: `${servant.name} promoted their Facebook reader group. Gained ${gain} new members.`,
                      category: 'interaction',
                      intensity: 'subtle'
                    });
                    
                    queryClient.invalidateQueries(['career']);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg mb-2"
                >
                  Promote Group
                </button>
              </div>

              <div className="bg-gray-800 rounded-xl p-4">
                <h4 className="text-white font-medium mb-3">Post to Group</h4>
                
                <button
                  onClick={async () => {
                    if (books.length === 0) return;
                    
                    const book = books[Math.floor(Math.random() * books.length)];
                    const excerpts = [
                      `"His fingers traced my jaw. 'You're mine,' he whispered." - Coming soon in ${book.title}!`,
                      `Just finished a scene that made me CRY. ${book.title} is going to wreck you all. 💔`,
                      `Sneak peek from ${book.title}: "The darkness called to me. And I answered."`,
                      `Writing update: ${book.title} is at ${book.word_count} words! Almost there!`,
                      `Poll time! What cover vibe for ${book.title}? Drop your thoughts below! 👇`
                    ];
                    
                    const teaser = excerpts[Math.floor(Math.random() * excerpts.length)];
                    const engagement = Math.floor(facebookGroupSize * (Math.random() * 0.3 + 0.2));
                    
                    setWorking(true);
                    setWorkingMessage('Posting to Facebook group...');
                    
                    setTimeout(async () => {
                      setWorkingMessage(`Posted! ${engagement} likes, ${Math.floor(engagement * 0.3)} comments!`);
                      
                      if (book.status === 'published' || book.status === 'ready') {
                        const salesBoost = Math.floor(Math.random() * 10) + 5;
                        const revenue = salesBoost * book.price * (PLATFORMS[book.platform]?.royalty || 0.7);
                        
                        await base44.entities.Book.update(book.id, {
                          copies_sold: book.copies_sold + salesBoost,
                          revenue: book.revenue + revenue,
                          social_buzz: Math.min(100, (book.social_buzz || 0) + 5)
                        });
                      }
                      
                      await base44.entities.NightLog.create({
                        entry: `${servant.name} posted: "${teaser.substring(0, 60)}..." - ${engagement} reactions!`,
                        category: 'interaction',
                        intensity: 'subtle'
                      });
                      
                      queryClient.invalidateQueries(['books']);
                      
                      setTimeout(() => {
                        setWorking(false);
                        setWorkingMessage('');
                      }, 1500);
                    }, 1500);
                  }}
                  disabled={books.length === 0}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white py-2 rounded-lg mb-2 disabled:opacity-50"
                >
                  📝 Share Teaser
                </button>

                <button
                  onClick={async () => {
                    if (publishedBooks.length === 0) return;
                    
                    const book = publishedBooks[Math.floor(Math.random() * publishedBooks.length)];
                    const updates = [
                      `${book.title} just hit ${book.copies_sold} sales! Thank you all so much! ❤️`,
                      `New 5-star review for ${book.title}: "This book destroyed me in the best way!"`,
                      `${book.title} is on sale this weekend! Grab it while it's hot! 🔥`,
                      `Exciting news! ${book.title} audiobook is now available!`,
                      `Reader question: Who's your favorite character from ${book.title}?`
                    ];
                    
                    const update = updates[Math.floor(Math.random() * updates.length)];
                    const engagement = Math.floor(facebookGroupSize * (Math.random() * 0.4 + 0.3));
                    
                    setWorking(true);
                    setWorkingMessage('Posting update...');
                    
                    setTimeout(async () => {
                      setWorkingMessage(`${engagement} reactions! Great engagement!`);
                      
                      const salesBoost = Math.floor(Math.random() * 15) + 8;
                      const revenue = salesBoost * book.price * PLATFORMS[book.platform].royalty;
                      
                      await base44.entities.Book.update(book.id, {
                        copies_sold: book.copies_sold + salesBoost,
                        revenue: book.revenue + revenue,
                        social_buzz: Math.min(100, (book.social_buzz || 0) + 8)
                      });
                      
                      await base44.entities.NightLog.create({
                        entry: `${servant.name} posted: "${update}" - Generated ${salesBoost} sales!`,
                        category: 'interaction',
                        intensity: 'moderate'
                      });
                      
                      queryClient.invalidateQueries(['books']);
                      
                      setTimeout(() => {
                        setWorking(false);
                        setWorkingMessage('');
                      }, 1500);
                    }, 1500);
                  }}
                  disabled={publishedBooks.length === 0}
                  className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-700 text-white py-2 rounded-lg disabled:opacity-50"
                >
                  📢 Share News
                </button>
              </div>
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
                <div className="bg-gradient-to-br from-orange-950/40 to-orange-900/40 border border-orange-500/30 rounded-xl p-6">
                  <Zap className="w-8 h-8 text-orange-400 mb-2" />
                  <p className="text-2xl font-bold text-white">{servantCareer?.writing_streak || 0}</p>
                  <p className="text-gray-400 text-sm">Day Writing Streak</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {working && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          >
            <div className="bg-gradient-to-b from-gray-900 to-black rounded-2xl p-8 max-w-lg w-full border border-purple-900/50 shadow-2xl">
              <motion.div 
                animate={{ rotate: [0, 5, -5, 0] }} 
                transition={{ duration: 0.5, repeat: Infinity }} 
                className="text-6xl mb-4 text-center"
              >
                ✍️
              </motion.div>
              <motion.p
                key={workingMessage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white text-lg mb-4 text-center"
              >
                {workingMessage}
              </motion.p>
              {workingExcerpt && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-black/40 rounded-lg p-4 border border-purple-500/30"
                >
                  <p className="text-purple-300 text-sm italic leading-relaxed">
                    {workingExcerpt}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
        
        {showReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setShowReview(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-yellow-900/50"
            >
              <h3 className="text-white text-xl font-bold mb-2">Reader Review</h3>
              <p className="text-gray-400 text-sm mb-4">{showReview.book}</p>
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < showReview.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                ))}
              </div>
              <p className="text-white italic mb-4">"{showReview.text}"</p>
              <button
                onClick={() => setShowReview(null)}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg"
              >
                Close
              </button>
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

        {editingBook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setEditingBook(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-purple-900/50"
            >
              <h3 className="text-white text-xl font-bold mb-4">Edit Book Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Title</label>
                  <input
                    type="text"
                    defaultValue={editingBook.title}
                    onChange={(e) => setEditingBook({...editingBook, title: e.target.value})}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Target Word Count</label>
                  <input
                    type="number"
                    defaultValue={editingBook.target_words}
                    onChange={(e) => setEditingBook({...editingBook, target_words: parseInt(e.target.value)})}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Genre</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(BOOK_GENRES).map(([key, genre]) => (
                      <button
                        key={key}
                        onClick={() => setEditingBook({...editingBook, genre: key})}
                        className={`rounded-lg p-2 text-left text-sm ${
                          editingBook.genre === key 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-gray-800 text-gray-300'
                        }`}
                      >
                        {genre.icon} {genre.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingBook(null)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      await base44.entities.Book.update(editingBook.id, {
                        title: editingBook.title,
                        genre: editingBook.genre,
                        target_words: editingBook.target_words
                      });
                      queryClient.invalidateQueries(['books']);
                      setEditingBook(null);
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showARCModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setShowARCModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-purple-900/50"
            >
              <h3 className="text-white text-xl font-bold mb-4">Send ARC Copies</h3>
              <p className="text-gray-400 mb-4">Choose a book to send to your {servantCareer?.arc_team_size} ARC readers</p>
              
              <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                {books.filter(b => b.status === 'ready' || b.status === 'published').map(book => (
                  <button
                    key={book.id}
                    onClick={async () => {
                      setWorking(true);
                      setShowARCModal(false);
                      setWorkingMessage('Sending ARC copies to readers...');
                      
                      setTimeout(async () => {
                        const reviewsExpected = Math.floor(servantCareer.arc_team_size * 0.7);
                        setWorkingMessage(`${reviewsExpected}/${servantCareer.arc_team_size} readers left reviews!`);
                        
                        const qualityBoost = Math.floor(Math.random() * 10) + 5;
                        await base44.entities.Book.update(book.id, {
                          quality: Math.min(100, book.quality + qualityBoost),
                          social_buzz: Math.min(100, (book.social_buzz || 0) + 20)
                        });
                        
                        await base44.entities.NightLog.create({
                          entry: `${servant.name} sent ARC copies of "${book.title}" to ${servantCareer.arc_team_size} readers. ${reviewsExpected} early reviews secured.`,
                          category: 'interaction',
                          intensity: 'significant'
                        });
                        
                        queryClient.invalidateQueries(['books']);
                        
                        setTimeout(() => {
                          setWorking(false);
                          setWorkingMessage('');
                        }, 2000);
                      }, 3000);
                    }}
                    className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-3 text-left"
                  >
                    <p className="text-white font-medium">{book.title}</p>
                    <p className="text-gray-400 text-sm">{BOOK_GENRES[book.genre].name}</p>
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setShowARCModal(false)}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}