import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Tv, Users, Calendar, Globe } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function MangaProgression({ career, entityName, onClose }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('anime');
  const [working, setWorking] = useState(false);
  const [outcome, setOutcome] = useState('');

  const checkAnimeOffer = async () => {
    if (!career?.id) return;
    setWorking(true);
    try {
      const fanThreshold = 5000;
      
      if ((career.fans || 0) >= fanThreshold) {
        const studios = ['Sunrise Animation', 'Moonlight Studios', 'Crystal Pictures', 'Apex Animation'];
        const studio = studios[Math.floor(Math.random() * studios.length)];
        const budget = Math.floor(Math.random() * 500000) + 200000;
        
        const offers = career.anime_offers || [];
        offers.push({
          studio,
          budget,
          episodes: Math.floor(Math.random() * 13) + 12,
          date: new Date().toISOString(),
          status: 'pending'
        });

        await base44.entities.ServantCareer.update(career.id, { anime_offers: offers });
        
        await base44.entities.NightLog.create({
          entry: `📺 ${studio} offered to adapt "${career.series_name}" into anime! Budget: $${budget.toLocaleString()}`,
          category: 'interaction',
          intensity: 'significant'
        });

        setOutcome(`📺 Anime offer from ${studio}!`);
        queryClient.invalidateQueries(['career']);
      } else {
        setOutcome(`Need ${fanThreshold} fans for anime offers (currently ${career.fans || 0})`);
      }
    } catch (error) {
      console.error('Anime offer check failed:', error);
      setOutcome('Check failed');
    } finally {
      setTimeout(() => { setWorking(false); setOutcome(''); }, 3000);
    }
  };

  const acceptAnimeOffer = async (offerIndex) => {
    if (!career?.id) return;
    try {
      const offers = [...(career.anime_offers || [])];
      const offer = offers[offerIndex];
      offer.status = 'accepted';
      
      const boost = Math.floor(offer.budget / 100);
      await base44.entities.ServantCareer.update(career.id, {
        anime_offers: offers,
        fans: (career.fans || 0) + boost,
        has_anime: true
      });

      await base44.entities.NightLog.create({
        entry: `🎬 "${career.series_name}" anime adaptation confirmed! Production starting!`,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries(['career']);
      setOutcome(`Anime confirmed! +${boost} fans!`);
      setTimeout(() => setOutcome(''), 3000);
    } catch (error) {
      console.error('Offer acceptance failed:', error);
      setOutcome('Failed to accept offer');
      setTimeout(() => setOutcome(''), 2000);
    }
  };

  const hireAssistant = async () => {
    if (!career?.id) return;
    setWorking(true);
    try {
      const assistantTypes = ['Background Artist', 'Inker', 'Colorist', 'Layout Designer'];
      const type = assistantTypes[Math.floor(Math.random() * assistantTypes.length)];
      const cost = Math.floor(Math.random() * 500) + 200;

      if ((career.income || 0) >= cost) {
        const assistants = career.assistants || [];
        assistants.push({
          name: `Assistant ${assistants.length + 1}`,
          type,
          skill: Math.floor(Math.random() * 30) + 70,
          hired: new Date().toISOString()
        });

        await base44.entities.ServantCareer.update(career.id, {
          assistants,
          income: (career.income || 0) - cost
        });

        setOutcome(`Hired ${type}! -$${cost}`);
        queryClient.invalidateQueries(['career']);
      } else {
        setOutcome(`Need $${cost} (have $${career.income || 0})`);
      }
    } catch (error) {
      console.error('Hiring failed:', error);
      setOutcome('Failed to hire assistant');
    } finally {
      setTimeout(() => { setWorking(false); setOutcome(''); }, 2000);
    }
  };

  const hostConvention = async () => {
    if (!career?.id) return;
    setWorking(true);
    try {
      const attendance = Math.floor((career.fans || 0) / 10);
      const boost = Math.floor(Math.random() * 1000) + 500;
      const income = Math.floor(attendance * 5);

      await base44.entities.ServantCareer.update(career.id, {
        fans: (career.fans || 0) + boost,
        income: (career.income || 0) + income
      });

      await base44.entities.NightLog.create({
        entry: `🎪 ${entityName} hosted a convention! ${attendance} attendees, +${boost} fans, +$${income}`,
        category: 'interaction',
        intensity: 'moderate'
      });

      setOutcome(`Convention success! +${boost} fans, +$${income}`);
      queryClient.invalidateQueries(['career']);
    } catch (error) {
      console.error('Convention failed:', error);
      setOutcome('Convention failed');
    } finally {
      setTimeout(() => { setWorking(false); setOutcome(''); }, 3000);
    }
  };

  const translateSeries = async (language) => {
    if (!career?.id) return;
    setWorking(true);
    try {
      const cost = 1000;
      
      if ((career.income || 0) >= cost) {
        const translations = career.translations || [];
        const boost = Math.floor(Math.random() * 2000) + 1000;
        
        translations.push({
          language,
          date: new Date().toISOString(),
          fans_gained: boost
        });

        await base44.entities.ServantCareer.update(career.id, {
          translations,
          fans: (career.fans || 0) + boost,
          income: (career.income || 0) - cost
        });

        setOutcome(`${language} translation! +${boost} fans, -$${cost}`);
        queryClient.invalidateQueries(['career']);
      } else {
        setOutcome(`Need $${cost} (have $${career.income || 0})`);
      }
    } catch (error) {
      console.error('Translation failed:', error);
      setOutcome('Translation failed');
    } finally {
      setTimeout(() => { setWorking(false); setOutcome(''); }, 2000);
    }
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
          <h3 className="text-white text-2xl font-bold">🚀 Career Growth</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['anime', 'assistants', 'conventions', 'translation'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap ${
                tab === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {t === 'anime' && <Tv className="w-4 h-4 inline mr-1" />}
              {t === 'assistants' && <Users className="w-4 h-4 inline mr-1" />}
              {t === 'conventions' && <Calendar className="w-4 h-4 inline mr-1" />}
              {t === 'translation' && <Globe className="w-4 h-4 inline mr-1" />}
              {t}
            </button>
          ))}
        </div>

        {tab === 'anime' && (
          <div className="space-y-4">
            <button
              onClick={checkAnimeOffer}
              disabled={working}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 rounded-lg text-white font-medium disabled:opacity-50 mb-6"
            >
              📺 Check for Anime Offers
            </button>

            {(career.anime_offers || []).map((offer, i) => (
              <div key={i} className={`rounded-xl p-4 ${offer.status === 'accepted' ? 'bg-green-900/40 border border-green-500/30' : 'bg-gray-800/50'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-white font-bold">{offer.studio}</h4>
                    <p className="text-gray-400 text-sm">{offer.episodes} episodes</p>
                    <p className="text-green-400 text-sm">${offer.budget.toLocaleString()} budget</p>
                  </div>
                  {offer.status === 'pending' && (
                    <button
                      onClick={() => acceptAnimeOffer(i)}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white"
                    >
                      Accept
                    </button>
                  )}
                  {offer.status === 'accepted' && (
                    <span className="bg-green-600 px-4 py-2 rounded-lg text-white">✓ In Production</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'assistants' && (
          <div className="space-y-4">
            <button
              onClick={hireAssistant}
              disabled={working}
              className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg text-white font-medium disabled:opacity-50 mb-6"
            >
              Hire Assistant ($200-700)
            </button>

            {(career.assistants || []).map((assistant, i) => (
              <div key={i} className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-white font-medium">{assistant.name}</h4>
                    <p className="text-purple-400 text-sm">{assistant.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold">{assistant.skill}% Skill</p>
                    <p className="text-gray-400 text-xs">Speed +{Math.floor(assistant.skill / 10)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'conventions' && (
          <div className="space-y-4">
            <button
              onClick={hostConvention}
              disabled={working}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 py-3 rounded-lg text-white font-medium disabled:opacity-50"
            >
              🎪 Host Convention Event
            </button>
            <p className="text-gray-400 text-sm text-center">Meet fans, sell merch, boost popularity!</p>
          </div>
        )}

        {tab === 'translation' && (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm mb-4">Translate your manga to reach international audiences!</p>
            {['English', 'Spanish', 'French', 'Chinese', 'Korean'].map(lang => {
              const hasTranslation = (career.translations || []).some(t => t.language === lang);
              return (
                <button
                  key={lang}
                  onClick={() => translateSeries(lang)}
                  disabled={working || hasTranslation}
                  className={`w-full py-3 rounded-lg font-medium ${
                    hasTranslation
                      ? 'bg-green-900/40 text-green-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  } disabled:opacity-50`}
                >
                  {hasTranslation ? `✓ ${lang} (Done)` : `${lang} ($1000)`}
                </button>
              );
            })}
          </div>
        )}

        {outcome && (
          <div className="mt-4 bg-blue-950/40 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-300 text-center">{outcome}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}