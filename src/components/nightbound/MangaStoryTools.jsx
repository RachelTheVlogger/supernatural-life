import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Shuffle, Skull, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function MangaStoryTools({ career, entityName, onClose }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('mystery');
  const [working, setWorking] = useState(false);
  const [outcome, setOutcome] = useState('');

  const generateMysteryChapter = async () => {
    if (!career) return;
    setWorking(true);
    try {
      const genre = career.current_genre || 'shonen';
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a surprise chapter for a ${genre} manga titled "${career.series_name}". Make it unexpected and dramatic. Include a shocking plot twist.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            twist: { type: "string" },
            hook: { type: "string" }
          }
        }
      });

      setOutcome(`📖 Mystery Chapter: "${result.title}"\n\nTwist: ${result.twist}\n\nUse custom chapter creator to make this real!`);
    } catch (error) {
      console.error('Mystery generation failed:', error);
      setOutcome('Failed to generate mystery chapter');
    } finally {
      setTimeout(() => { setWorking(false); setOutcome(''); }, 5000);
    }
  };

  const killCharacter = async () => {
    if (!career?.id) return;
    const characters = career.manga_characters || [];
    if (characters.length === 0) {
      setOutcome('No characters to kill!');
      setTimeout(() => setOutcome(''), 2000);
      return;
    }

    setWorking(true);
    try {
      const randomChar = characters[Math.floor(Math.random() * characters.length)];
      
      const updatedChars = characters.map(c =>
        c.id === randomChar.id ? { ...c, deceased: true, death_date: new Date().toISOString() } : c
      );

      const boost = Math.floor(Math.random() * 1500) + 1000;
      await base44.entities.ServantCareer.update(career.id, {
        manga_characters: updatedChars,
        fans: (career.fans || 0) + boost
      });

      await base44.entities.NightLog.create({
        entry: `💀 ${randomChar.name} died in "${career.series_name}"! Fans devastated. +${boost} fans from emotional impact!`,
        category: 'interaction',
        intensity: 'significant'
      });

      setOutcome(`💀 ${randomChar.name} has died! Massive emotional impact! +${boost} fans`);
      queryClient.invalidateQueries(['career']);
    } catch (error) {
      console.error('Character death failed:', error);
      setOutcome('Failed to process character death');
    } finally {
      setTimeout(() => { setWorking(false); setOutcome(''); }, 4000);
    }
  };

  const generatePlotTwist = async () => {
    if (!career) return;
    setWorking(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 3 shocking plot twists for manga series "${career.series_name}". Make them dramatic, unexpected, and game-changing.`,
        response_json_schema: {
          type: "object",
          properties: {
            twists: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setOutcome(`⚡ Plot Twist Ideas:\n\n${result.twists.map((t, i) => `${i + 1}. ${t}`).join('\n\n')}`);
    } catch (error) {
      console.error('Twist generation failed:', error);
      setOutcome('Failed to generate twists');
    } finally {
      setTimeout(() => { setWorking(false); setOutcome(''); }, 6000);
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
          <h3 className="text-white text-2xl font-bold">✨ Story Tools</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['mystery', 'deaths', 'twists'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap ${
                tab === t ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {t === 'mystery' && <Shuffle className="w-4 h-4 inline mr-1" />}
              {t === 'deaths' && <Skull className="w-4 h-4 inline mr-1" />}
              {t === 'twists' && <Zap className="w-4 h-4 inline mr-1" />}
              {t}
            </button>
          ))}
        </div>

        {tab === 'mystery' && (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm mb-4">Let AI surprise you with a mystery chapter idea!</p>
            <button
              onClick={generateMysteryChapter}
              disabled={working}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 rounded-lg text-white font-medium disabled:opacity-50"
            >
              🎲 Generate Mystery Chapter
            </button>
          </div>
        )}

        {tab === 'deaths' && (
          <div className="space-y-4">
            <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-4 mb-4">
              <p className="text-red-300 font-medium">⚠️ Character Death</p>
              <p className="text-gray-400 text-sm mt-1">Kill a random character for massive emotional impact and fan boost</p>
            </div>

            <button
              onClick={killCharacter}
              disabled={working}
              className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 py-3 rounded-lg text-white font-medium disabled:opacity-50"
            >
              💀 Kill Random Character
            </button>

            <div className="mt-6">
              <h4 className="text-white font-medium mb-3">Living Characters</h4>
              <div className="space-y-2">
                {(career.manga_characters || [])
                  .filter(c => !c.deceased)
                  .map(char => (
                    <div key={char.id} className="bg-gray-800/50 rounded-lg p-3">
                      <p className="text-white">{char.name}</p>
                      <p className="text-gray-400 text-xs">{char.appearances} appearances</p>
                    </div>
                  ))}
              </div>

              {(career.manga_characters || []).some(c => c.deceased) && (
                <>
                  <h4 className="text-gray-500 font-medium mb-3 mt-6">💀 Deceased</h4>
                  <div className="space-y-2">
                    {(career.manga_characters || [])
                      .filter(c => c.deceased)
                      .map(char => (
                        <div key={char.id} className="bg-gray-900/50 rounded-lg p-3 opacity-60">
                          <p className="text-gray-400 line-through">{char.name}</p>
                          <p className="text-gray-500 text-xs">
                            {new Date(char.death_date).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {tab === 'twists' && (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm mb-4">Generate shocking plot twists to keep readers hooked!</p>
            <button
              onClick={generatePlotTwist}
              disabled={working}
              className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 py-3 rounded-lg text-white font-medium disabled:opacity-50"
            >
              ⚡ Generate Plot Twists
            </button>
          </div>
        )}

        {outcome && (
          <div className="mt-4 bg-purple-950/40 border border-purple-500/30 rounded-lg p-4">
            <p className="text-purple-300 whitespace-pre-line">{outcome}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}