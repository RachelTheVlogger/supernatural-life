import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, ShoppingCart, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function MangaStore({ currentEntityId, onClose }) {
  const queryClient = useQueryClient();
  const [viewingSeries, setViewingSeries] = useState(null);
  const [viewingChapter, setViewingChapter] = useState(null);
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0);
  const [purchasing, setPurchasing] = useState(false);

  const { data: allCareers = [] } = useQuery({
    queryKey: ['allCareers'],
    queryFn: () => base44.entities.ServantCareer.list()
  });

  const { data: myCareers = [] } = useQuery({
    queryKey: ['myCareer', currentEntityId],
    queryFn: () => base44.entities.ServantCareer.filter({ servant_id: currentEntityId }),
    enabled: !!currentEntityId
  });

  const myCareer = myCareers[0];
  const purchasedSeries = myCareer?.purchased_manga || [];

  // Get all available series from other creators
  const availableSeries = allCareers
    .filter(c => c.servant_id !== currentEntityId && c.series_name && c.chapters_released > 0)
    .map(c => ({
      id: c.active_series_id || c.id,
      careerId: c.id,
      name: c.series_name,
      genre: c.current_genre,
      chapters: c.chapters_released || 0,
      coverArt: c.cover_art,
      rating: c.overall_rating || 0,
      price: Math.max(c.chapters_released * 50, 100),
      chapters_data: c.manga_chapters || []
    }));

  const handlePurchase = async (series) => {
    setPurchasing(true);
    
    const purchased = myCareer?.purchased_manga || [];
    purchased.push({
      series_id: series.id,
      series_name: series.name,
      purchased_date: new Date().toISOString(),
      chapters_data: series.chapters_data
    });

    if (myCareer?.id) {
      await base44.entities.ServantCareer.update(myCareer.id, {
        purchased_manga: purchased,
        income: (myCareer.income || 0) - series.price
      });
    } else {
      await base44.entities.ServantCareer.create({
        servant_id: currentEntityId,
        purchased_manga: purchased
      });
    }

    await base44.entities.NightLog.create({
      entry: `Purchased "${series.name}" manga for $${series.price}!`,
      category: 'interaction',
      intensity: 'moderate'
    });

    queryClient.invalidateQueries(['myCareer']);
    setPurchasing(false);
    setViewingSeries(null);
  };

  const isPurchased = (seriesId) => {
    return purchasedSeries.some(p => p.series_id === seriesId);
  };

  const goToNextPanel = () => {
    if (viewingChapter && currentPanelIndex < (viewingChapter.panels?.length || 0) - 1) {
      setCurrentPanelIndex(prev => prev + 1);
    }
  };

  const goToPreviousPanel = () => {
    if (currentPanelIndex > 0) {
      setCurrentPanelIndex(prev => prev - 1);
    }
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
        className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col relative"
      >
        <div className="p-6 pb-4 border-b border-gray-800">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Manga Store</h2>
              <p className="text-gray-400 text-sm">Browse and read manga series</p>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {/* My Library */}
          {purchasedSeries.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white font-bold mb-3">📚 My Library</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {purchasedSeries.map(series => (
                  <button
                    key={series.series_id}
                    onClick={() => setViewingSeries(series)}
                    className="bg-gradient-to-br from-purple-950/40 to-pink-950/40 border border-purple-500/30 rounded-xl p-4 text-left hover:scale-105 transition-all"
                  >
                    <h4 className="text-white font-bold mb-1">{series.series_name}</h4>
                    <p className="text-purple-400 text-sm">{series.chapters_data?.length || 0} chapters</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Available Series */}
          <h3 className="text-white font-bold mb-3">🛍️ Available Series</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {availableSeries.map(series => {
              const purchased = isPurchased(series.id);
              return (
                <div key={series.id} className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700">
                  {series.coverArt && (
                    <img src={series.coverArt} alt={series.name} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-4">
                    <h4 className="text-white font-bold mb-1">{series.name}</h4>
                    <p className="text-gray-400 text-sm capitalize mb-2">{series.genre}</p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-purple-400 text-sm">{series.chapters} chapters</span>
                      {series.rating > 0 && (
                        <span className="text-yellow-400 text-sm flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {series.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    {purchased ? (
                      <button
                        onClick={() => setViewingSeries(purchasedSeries.find(p => p.series_id === series.id))}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium"
                      >
                        Read Now
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (confirm(`Purchase "${series.name}" for $${series.price}?`)) {
                            handlePurchase(series);
                          }
                        }}
                        disabled={purchasing}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 rounded-lg font-medium disabled:opacity-50"
                      >
                        {purchasing ? 'Purchasing...' : `Buy - $${series.price}`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {availableSeries.length === 0 && (
            <p className="text-gray-500 text-center py-8">No manga available in the store yet</p>
          )}
        </div>
      </motion.div>

      {/* Series Reader Modal */}
      {viewingSeries && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90"
          onClick={() => setViewingSeries(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto"
          >
            <h3 className="text-white text-2xl font-bold mb-4">{viewingSeries.series_name}</h3>
            
            <div className="space-y-2">
              {(viewingSeries.chapters_data || []).map(chapter => (
                <button
                  key={chapter.number}
                  onClick={() => {
                    setViewingChapter(chapter);
                    setCurrentPanelIndex(0);
                  }}
                  className="w-full bg-gray-800/50 hover:bg-gray-800 rounded-lg p-3 text-left transition-colors"
                >
                  <h5 className="text-white font-medium">Ch. {chapter.number}: {chapter.title}</h5>
                  <div className="flex gap-3 text-xs text-gray-400 mt-1">
                    <span>📄 {chapter.panels?.length || 0} panels</span>
                    {chapter.rating > 0 && <span>⭐ {chapter.rating.toFixed(1)}/5</span>}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Chapter Reader */}
      {viewingChapter && viewingChapter.panels && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black"
          onClick={() => setViewingChapter(null)}
        >
          <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-white">Ch. {viewingChapter.number}: {viewingChapter.title}</h2>
              <p className="text-gray-400 text-sm">Panel {currentPanelIndex + 1} of {viewingChapter.panels.length}</p>
            </div>
            <button onClick={() => setViewingChapter(null)} className="bg-gray-900/80 hover:bg-gray-900 rounded-full p-2 text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentPanelIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="max-w-4xl max-h-[80vh]"
            >
              <img
                src={viewingChapter.panels[currentPanelIndex].image}
                alt={`Panel ${currentPanelIndex + 1}`}
                className="max-w-full max-h-[80vh] rounded-lg shadow-2xl"
              />
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-4 left-0 right-0 p-6" onClick={(e) => e.stopPropagation()}>
            {viewingChapter.panels[currentPanelIndex].dialogue && (
              <div className="bg-gray-900/90 rounded-lg p-4 mb-4 max-w-2xl mx-auto border border-purple-500/30">
                <p className="text-white text-center">{viewingChapter.panels[currentPanelIndex].dialogue}</p>
              </div>
            )}

            <div className="flex items-center justify-between max-w-2xl mx-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPreviousPanel();
                }}
                disabled={currentPanelIndex === 0}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium"
              >
                ← Previous
              </button>
              <span className="text-white">{currentPanelIndex + 1} / {viewingChapter.panels.length}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextPanel();
                }}
                disabled={currentPanelIndex === viewingChapter.panels.length - 1}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium"
              >
                Next →
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}