import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Book, Sparkles, ShoppingBag, DollarSign, Lock, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function MangaMonetization({ career, entityName, onClose }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('volumes');
  const [working, setWorking] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [tipAmount, setTipAmount] = useState(5);
  const [premiumChapterIndex, setPremiumChapterIndex] = useState(null);
  const [premiumPrice, setPremiumPrice] = useState(10);

  const publishPhysicalVolume = async () => {
    setWorking(true);
    const chaptersPerVolume = 8;
    const totalChapters = career.chapters_released || 0;
    const volumesPublished = career.physical_volumes || 0;
    
    if (totalChapters >= (volumesPublished + 1) * chaptersPerVolume) {
      const sales = Math.floor(Math.random() * 1000) + 500;
      const revenue = sales * 15; // $15 per volume
      
      await base44.entities.ServantCareer.update(career.id, {
        physical_volumes: volumesPublished + 1,
        income: (career.income || 0) + revenue
      });

      await base44.entities.NightLog.create({
        entry: `📚 Published Physical Volume ${volumesPublished + 1} of "${career.series_name}"! ${sales} copies sold, +$${revenue}`,
        category: 'interaction',
        intensity: 'moderate'
      });

      setOutcome(`Volume ${volumesPublished + 1} published! ${sales} sales, +$${revenue}`);
      queryClient.invalidateQueries(['career']);
    } else {
      setOutcome(`Need ${chaptersPerVolume} chapters for next volume (have ${totalChapters})`);
    }

    setTimeout(() => { setWorking(false); setOutcome(''); }, 3000);
  };

  const createLimitedEdition = async () => {
    setWorking(true);
    const cost = 500;

    if ((career.income || 0) >= cost) {
      const editions = career.limited_editions || [];
      const sales = Math.floor(Math.random() * 500) + 300;
      const revenue = sales * 30; // Premium price
      
      editions.push({
        name: `Special Edition Vol. ${editions.length + 1}`,
        sales,
        revenue,
        date: new Date().toISOString()
      });

      await base44.entities.ServantCareer.update(career.id, {
        limited_editions: editions,
        income: (career.income || 0) - cost + revenue
      });

      setOutcome(`Limited edition sold! ${sales} copies, +$${revenue - cost} profit`);
      queryClient.invalidateQueries(['career']);
    } else {
      setOutcome(`Need $${cost} (have $${career.income || 0})`);
    }

    setTimeout(() => { setWorking(false); setOutcome(''); }, 3000);
  };

  const setupConventionBooth = async () => {
    setWorking(true);
    const boothCost = 300;

    if ((career.income || 0) >= boothCost) {
      const sales = Math.floor((career.fans || 0) / 10);
      const revenue = Math.floor(sales * 20);
      const newFans = Math.floor(Math.random() * 300) + 100;

      await base44.entities.ServantCareer.update(career.id, {
        income: (career.income || 0) - boothCost + revenue,
        fans: (career.fans || 0) + newFans
      });

      await base44.entities.NightLog.create({
        entry: `🎪 ${entityName} ran a convention booth! Sold ${sales} items, +${newFans} fans, +$${revenue - boothCost} profit`,
        category: 'interaction',
        intensity: 'moderate'
      });

      setOutcome(`Booth success! ${sales} items sold, +${newFans} fans, +$${revenue - boothCost}`);
      queryClient.invalidateQueries(['career']);
    } else {
      setOutcome(`Need $${boothCost} (have $${career.income || 0})`);
    }

    setTimeout(() => { setWorking(false); setOutcome(''); }, 3000);
  };

  const receiveTip = async () => {
    setWorking(true);
    const fansWhoTip = Math.floor((career.fans || 0) * 0.05);
    const totalTips = fansWhoTip * tipAmount;
    
    await base44.entities.ServantCareer.update(career.id, {
      income: (career.income || 0) + totalTips,
      total_tips: ((career.total_tips || 0) + totalTips)
    });

    await base44.entities.NightLog.create({
      entry: `💵 Fans tipped ${entityName}! ${fansWhoTip} fans donated $${tipAmount} each. Total: +$${totalTips}`,
      category: 'interaction',
      intensity: 'moderate'
    });

    setOutcome(`${fansWhoTip} fans tipped you! +$${totalTips}`);
    queryClient.invalidateQueries(['career']);
    setTimeout(() => { setWorking(false); setOutcome(''); }, 3000);
  };

  const makePremiumChapter = async (chapterIndex) => {
    setWorking(true);
    const chapters = [...(career.manga_chapters || [])];
    const chapter = chapters[chapterIndex];
    
    if (!chapter.is_premium) {
      chapter.is_premium = true;
      chapter.premium_price = premiumPrice;
      chapter.premium_sales = 0;
      
      await base44.entities.ServantCareer.update(career.id, {
        manga_chapters: chapters
      });

      setOutcome(`Chapter ${chapter.number} is now premium ($${premiumPrice})!`);
      queryClient.invalidateQueries(['career']);
      setPremiumChapterIndex(null);
    }
    
    setTimeout(() => { setWorking(false); setOutcome(''); }, 2000);
  };

  const simulatePremiumSales = async (chapterIndex) => {
    setWorking(true);
    const chapters = [...(career.manga_chapters || [])];
    const chapter = chapters[chapterIndex];
    
    if (chapter.is_premium) {
      const buyers = Math.floor((career.fans || 0) * 0.1);
      const revenue = buyers * chapter.premium_price;
      
      chapter.premium_sales = (chapter.premium_sales || 0) + buyers;
      
      await base44.entities.ServantCareer.update(career.id, {
        manga_chapters: chapters,
        income: (career.income || 0) + revenue,
        premium_sales_total: ((career.premium_sales_total || 0) + revenue)
      });

      setOutcome(`${buyers} fans bought premium chapter! +$${revenue}`);
      queryClient.invalidateQueries(['career']);
    }
    
    setTimeout(() => { setWorking(false); setOutcome(''); }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white text-2xl font-bold">💰 Monetization</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['volumes', 'limited', 'booth', 'tips', 'premium', 'analytics'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap ${
                tab === t ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {t === 'volumes' && <Book className="w-4 h-4 inline mr-1" />}
              {t === 'limited' && <Sparkles className="w-4 h-4 inline mr-1" />}
              {t === 'booth' && <ShoppingBag className="w-4 h-4 inline mr-1" />}
              {t === 'tips' && <DollarSign className="w-4 h-4 inline mr-1" />}
              {t === 'premium' && <Lock className="w-4 h-4 inline mr-1" />}
              {t === 'analytics' && <TrendingUp className="w-4 h-4 inline mr-1" />}
              {t}
            </button>
          ))}
        </div>

        {tab === 'volumes' && (
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
              <p className="text-gray-400 text-sm">Physical Volumes Published</p>
              <p className="text-white text-3xl font-bold">{career.physical_volumes || 0}</p>
              <p className="text-gray-500 text-xs mt-1">8 chapters per volume</p>
            </div>

            <button
              onClick={publishPhysicalVolume}
              disabled={working}
              className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg text-white font-medium disabled:opacity-50"
            >
              📚 Publish Physical Volume
            </button>

            <p className="text-gray-400 text-sm text-center">
              Each volume = ~500-1500 sales at $15 each
            </p>
          </div>
        )}

        {tab === 'limited' && (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm mb-4">Create premium limited edition releases!</p>
            
            <button
              onClick={createLimitedEdition}
              disabled={working}
              className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 py-3 rounded-lg text-white font-medium disabled:opacity-50"
            >
              ✨ Create Limited Edition ($500 cost)
            </button>

            {(career.limited_editions || []).length > 0 && (
              <div className="mt-6">
                <h4 className="text-white font-medium mb-3">Past Releases</h4>
                {(career.limited_editions || []).map((edition, i) => (
                  <div key={i} className="bg-gray-800/50 rounded-lg p-3 mb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-medium">{edition.name}</p>
                        <p className="text-gray-400 text-sm">{edition.sales} copies sold</p>
                      </div>
                      <p className="text-green-400 font-bold">+${edition.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'booth' && (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm mb-4">Set up a booth at conventions to sell exclusive merch!</p>
            
            <button
              onClick={setupConventionBooth}
              disabled={working}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 py-3 rounded-lg text-white font-medium disabled:opacity-50"
            >
              🎪 Convention Booth ($300 cost)
            </button>

            <div className="bg-gray-800/50 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-2">Expected Sales</p>
              <p className="text-white font-bold">~{Math.floor((career.fans || 0) / 10)} items</p>
              <p className="text-green-400 text-sm">Revenue: $20 per item</p>
            </div>
          </div>
        )}

        {tab === 'tips' && (
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
              <p className="text-gray-400 text-sm mb-2">Total Tips Received</p>
              <p className="text-white text-3xl font-bold">${career.total_tips || 0}</p>
              <p className="text-gray-500 text-xs mt-1">From generous fans</p>
            </div>

            <div>
              <label className="text-white text-sm mb-2 block">Suggested Tip Amount</label>
              <select
                value={tipAmount}
                onChange={(e) => setTipAmount(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white mb-4"
              >
                <option value={1}>$1 - Coffee</option>
                <option value={5}>$5 - Lunch</option>
                <option value={10}>$10 - Generous</option>
                <option value={25}>$25 - Super Fan</option>
                <option value={50}>$50 - Dedicated</option>
              </select>
            </div>

            <button
              onClick={receiveTip}
              disabled={working}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 py-3 rounded-lg text-white font-medium disabled:opacity-50"
            >
              💵 Open Tip Jar
            </button>

            <p className="text-gray-400 text-sm text-center">
              ~{Math.floor((career.fans || 0) * 0.05)} fans will tip ${tipAmount} each
            </p>
          </div>
        )}

        {tab === 'premium' && (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm mb-4">Make chapters premium to earn extra revenue!</p>
            
            {(career.manga_chapters || []).length === 0 ? (
              <p className="text-gray-500 text-center py-8">No chapters yet</p>
            ) : (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                {(career.manga_chapters || []).map((chapter, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h5 className="text-white font-medium">Ch. {chapter.number}: {chapter.title}</h5>
                        {chapter.is_premium && (
                          <p className="text-yellow-400 text-xs">
                            🔒 Premium - ${chapter.premium_price} • {chapter.premium_sales || 0} sales
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {!chapter.is_premium ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={premiumChapterIndex === index ? premiumPrice : 10}
                          onChange={(e) => {
                            setPremiumChapterIndex(index);
                            setPremiumPrice(Number(e.target.value));
                          }}
                          min={1}
                          max={50}
                          className="w-20 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                        />
                        <button
                          onClick={() => makePremiumChapter(index)}
                          disabled={working}
                          className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded text-sm disabled:opacity-50"
                        >
                          Make Premium
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => simulatePremiumSales(index)}
                        disabled={working}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm disabled:opacity-50"
                      >
                        Simulate Sales
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'analytics' && (
          <div className="space-y-4">
            <h4 className="text-white font-bold mb-4">📊 Monetization Analytics</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4">
                <p className="text-purple-300 text-xs mb-1">Total Income</p>
                <p className="text-white text-2xl font-bold">${career.income || 0}</p>
              </div>
              
              <div className="bg-green-950/40 border border-green-500/30 rounded-xl p-4">
                <p className="text-green-300 text-xs mb-1">Tips Received</p>
                <p className="text-white text-2xl font-bold">${career.total_tips || 0}</p>
              </div>
              
              <div className="bg-yellow-950/40 border border-yellow-500/30 rounded-xl p-4">
                <p className="text-yellow-300 text-xs mb-1">Premium Sales</p>
                <p className="text-white text-2xl font-bold">${career.premium_sales_total || 0}</p>
              </div>
              
              <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-4">
                <p className="text-blue-300 text-xs mb-1">Physical Volumes</p>
                <p className="text-white text-2xl font-bold">{career.physical_volumes || 0}</p>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 mt-4">
              <h5 className="text-white font-medium mb-3">Revenue Breakdown</h5>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tips ({Math.round(((career.total_tips || 0) / (career.income || 1)) * 100)}%)</span>
                  <span className="text-green-400">${career.total_tips || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Premium Chapters ({Math.round(((career.premium_sales_total || 0) / (career.income || 1)) * 100)}%)</span>
                  <span className="text-yellow-400">${career.premium_sales_total || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Other Revenue</span>
                  <span className="text-purple-400">${(career.income || 0) - (career.total_tips || 0) - (career.premium_sales_total || 0)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4">
              <h5 className="text-white font-medium mb-3">Premium Chapters Stats</h5>
              {(career.manga_chapters || []).filter(c => c.is_premium).length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No premium chapters yet</p>
              ) : (
                <div className="space-y-2">
                  {(career.manga_chapters || []).filter(c => c.is_premium).map(chapter => (
                    <div key={chapter.number} className="flex justify-between text-sm">
                      <span className="text-gray-400">Ch. {chapter.number}</span>
                      <span className="text-green-400">{chapter.premium_sales || 0} sales (${(chapter.premium_sales || 0) * chapter.premium_price})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {outcome && (
          <div className="mt-4 bg-green-950/40 border border-green-500/30 rounded-lg p-4">
            <p className="text-green-300 text-center whitespace-pre-line">{outcome}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}