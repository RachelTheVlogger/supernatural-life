import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Book, Sparkles, ShoppingBag } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function MangaMonetization({ career, entityName, onClose }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('volumes');
  const [working, setWorking] = useState(false);
  const [outcome, setOutcome] = useState('');

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
          {['volumes', 'limited', 'booth'].map(t => (
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

        {outcome && (
          <div className="mt-4 bg-green-950/40 border border-green-500/30 rounded-lg p-4">
            <p className="text-green-300 text-center whitespace-pre-line">{outcome}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}