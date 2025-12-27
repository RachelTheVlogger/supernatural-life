import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Trophy, Target, Award } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function MangaCompetition({ career, entityName, onClose }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('rivals');
  const [working, setWorking] = useState(false);
  const [outcome, setOutcome] = useState('');

  const generateRival = async () => {
    setWorking(true);
    try {
      const genres = ['shonen', 'shojo', 'seinen', 'josei', 'isekai'];
      const randomGenre = genres[Math.floor(Math.random() * genres.length)];
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a rival manga artist character. Include: name, series title (${randomGenre} genre), personality trait, current ranking (1-100), and a brief backstory.`,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            series_title: { type: "string" },
            genre: { type: "string" },
            personality: { type: "string" },
            ranking: { type: "number" },
            fans: { type: "number" },
            backstory: { type: "string" }
          }
        }
      });

      const rivals = career.rival_artists || [];
      rivals.push({
        ...result,
        relationship: 0,
        last_interaction: new Date().toISOString()
      });

      await base44.entities.ServantCareer.update(career.id, { rival_artists: rivals });
      queryClient.invalidateQueries(['career']);

      setOutcome(`New rival: ${result.name}!`);
      setTimeout(() => { setWorking(false); setOutcome(''); }, 2000);
    } catch (error) {
      setWorking(false);
      setOutcome('Failed to generate rival');
    }
  };

  const competeWithRival = async (rival) => {
    setWorking(true);
    const yourQuality = career.overall_rating || 3;
    const theirQuality = rival.ranking / 20;
    
    const outcome = Math.random() * yourQuality > Math.random() * theirQuality;
    
    if (outcome) {
      const boost = Math.floor(Math.random() * 500) + 200;
      await base44.entities.ServantCareer.update(career.id, {
        fans: (career.fans || 0) + boost
      });

      await base44.entities.NightLog.create({
        entry: `${entityName} surpassed ${rival.name} in the rankings! +${boost} fans!`,
        category: 'interaction',
        intensity: 'moderate'
      });

      setOutcome(`Victory! +${boost} fans!`);
    } else {
      setOutcome(`${rival.name} maintains their lead...`);
    }

    queryClient.invalidateQueries(['career']);
    setTimeout(() => { setWorking(false); setOutcome(''); }, 3000);
  };

  const updateRankings = async () => {
    setWorking(true);
    const yourRank = Math.max(1, Math.min(100, Math.floor(100 - (career.fans || 0) / 100)));
    
    await base44.entities.ServantCareer.update(career.id, {
      current_ranking: yourRank
    });

    queryClient.invalidateQueries(['career']);
    setOutcome(`Your rank: #${yourRank}`);
    setTimeout(() => { setWorking(false); setOutcome(''); }, 2000);
  };

  const enterAwards = async () => {
    setWorking(true);
    const quality = career.overall_rating || 3;
    const winChance = quality / 5;
    
    const categories = ['Best Art', 'Best Story', 'Best Character', 'Rising Star', 'Manga of the Year'];
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    if (Math.random() < winChance) {
      const awards = career.awards_won || [];
      awards.push({
        category,
        year: new Date().getFullYear(),
        date: new Date().toISOString()
      });

      const boost = Math.floor(Math.random() * 2000) + 1000;
      await base44.entities.ServantCareer.update(career.id, {
        awards_won: awards,
        fans: (career.fans || 0) + boost
      });

      await base44.entities.NightLog.create({
        entry: `🏆 ${entityName} won "${category}"! +${boost} fans!`,
        category: 'interaction',
        intensity: 'significant'
      });

      setOutcome(`🏆 Won "${category}"! +${boost} fans!`);
    } else {
      setOutcome('Nominated but didn\'t win this time...');
    }

    queryClient.invalidateQueries(['career']);
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
          <h3 className="text-white text-2xl font-bold">⚔️ Competition</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['rivals', 'rankings', 'awards'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap ${
                tab === t ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {t === 'rivals' && <Target className="w-4 h-4 inline mr-1" />}
              {t === 'rankings' && <Trophy className="w-4 h-4 inline mr-1" />}
              {t === 'awards' && <Award className="w-4 h-4 inline mr-1" />}
              {t}
            </button>
          ))}
        </div>

        {tab === 'rivals' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-400 text-sm">Compete against rival manga artists</p>
              <button
                onClick={generateRival}
                disabled={working}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white disabled:opacity-50"
              >
                Find Rival
              </button>
            </div>

            {(career.rival_artists || []).map((rival, i) => (
              <div key={i} className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-white font-bold">{rival.name}</h4>
                    <p className="text-purple-400 text-sm">{rival.series_title}</p>
                    <p className="text-gray-400 text-xs capitalize">{rival.genre} • {rival.personality}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-bold">#{rival.ranking}</p>
                    <p className="text-gray-400 text-xs">{rival.fans} fans</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-3">{rival.backstory}</p>
                <button
                  onClick={() => competeWithRival(rival)}
                  disabled={working}
                  className="w-full bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 py-2 rounded-lg text-red-300 disabled:opacity-50"
                >
                  ⚔️ Compete
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'rankings' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border border-yellow-500/30 rounded-xl p-6 text-center mb-6">
              <p className="text-yellow-400 text-sm mb-2">Your Current Rank</p>
              <p className="text-white text-4xl font-bold">#{career.current_ranking || 100}</p>
              <p className="text-gray-400 text-sm mt-2">{career.fans || 0} fans</p>
            </div>

            <button
              onClick={updateRankings}
              disabled={working}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 rounded-lg text-white font-medium disabled:opacity-50"
            >
              Update Rankings
            </button>

            <div className="bg-gray-800/50 rounded-xl p-4">
              <h4 className="text-white font-medium mb-3">Top Ranked Series</h4>
              {(career.rival_artists || [])
                .sort((a, b) => a.ranking - b.ranking)
                .slice(0, 10)
                .map((rival, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-yellow-400 font-bold">#{rival.ranking}</span>
                      <div>
                        <p className="text-white text-sm">{rival.series_title}</p>
                        <p className="text-gray-400 text-xs">{rival.name}</p>
                      </div>
                    </div>
                    <span className="text-gray-400 text-sm">{rival.fans} fans</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {tab === 'awards' && (
          <div className="space-y-4">
            <button
              onClick={enterAwards}
              disabled={working}
              className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 py-3 rounded-lg text-white font-medium disabled:opacity-50 mb-6"
            >
              🏆 Enter Award Ceremony
            </button>

            <div className="bg-gray-800/50 rounded-xl p-4">
              <h4 className="text-white font-medium mb-4">Your Awards</h4>
              {(career.awards_won || []).length === 0 ? (
                <p className="text-gray-500 text-center py-4">No awards yet. Keep creating!</p>
              ) : (
                <div className="space-y-3">
                  {(career.awards_won || []).map((award, i) => (
                    <div key={i} className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border border-yellow-500/30 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">🏆</span>
                        <div>
                          <p className="text-yellow-400 font-bold">{award.category}</p>
                          <p className="text-gray-400 text-sm">{award.year}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {outcome && (
          <div className="mt-4 bg-red-950/40 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-300 text-center">{outcome}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}