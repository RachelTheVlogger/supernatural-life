import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, MessageCircle, TrendingUp, Image, BarChart3 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function MangaFanInteraction({ career, onClose }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('comments');
  const [working, setWorking] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [pollOption, setPollOption] = useState('');

  const generateComments = async (chapter) => {
    setWorking(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 5 diverse reader comments for manga chapter "${chapter.title}". Mix of praise, criticism, theories, and reactions. Make them feel authentic and varied.`,
        response_json_schema: {
          type: "object",
          properties: {
            comments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  username: { type: "string" },
                  text: { type: "string" },
                  likes: { type: "number" }
                }
              }
            }
          }
        }
      });

      const chapters = [...(career.manga_chapters || [])];
      const chapterIndex = chapters.findIndex(c => c.number === chapter.number);
      if (chapterIndex >= 0) {
        chapters[chapterIndex].comments = result.comments;
        await base44.entities.ServantCareer.update(career.id, { manga_chapters: chapters });
        queryClient.invalidateQueries(['career']);
      }

      setOutcome('Comments generated!');
      setTimeout(() => { setWorking(false); setOutcome(''); }, 2000);
    } catch (error) {
      setWorking(false);
      setOutcome('Failed to generate comments');
    }
  };

  const checkViralMoment = async (chapter) => {
    setWorking(true);
    const viralChance = Math.random();
    
    if (viralChance > 0.6) {
      const boost = Math.floor(Math.random() * 2000) + 1000;
      await base44.entities.ServantCareer.update(career.id, {
        fans: (career.fans || 0) + boost
      });

      await base44.entities.NightLog.create({
        entry: `🔥 VIRAL! Chapter ${chapter.number} went viral on social media! +${boost} fans!`,
        category: 'interaction',
        intensity: 'significant'
      });

      setOutcome(`🔥 Chapter ${chapter.number} went VIRAL! +${boost} fans!`);
      queryClient.invalidateQueries(['career']);
    } else {
      setOutcome('No viral moment this time...');
    }

    setTimeout(() => { setWorking(false); setOutcome(''); }, 3000);
  };

  const generateFanArt = async () => {
    setWorking(true);
    try {
      const characters = career.manga_characters || [];
      const randomChar = characters[Math.floor(Math.random() * characters.length)];
      
      if (!randomChar) {
        setOutcome('Need characters first!');
        setWorking(false);
        return;
      }

      const prompt = `Fan art of ${randomChar.name} from ${career.series_name}, amateur artist style, cute chibi fan drawing, posted on social media, fanart aesthetic`;
      const result = await base44.integrations.Core.GenerateImage({ prompt });

      const fanArts = career.fan_art || [];
      fanArts.push({
        character: randomChar.name,
        image: result.url,
        likes: Math.floor(Math.random() * 500) + 100,
        date: new Date().toISOString()
      });

      await base44.entities.ServantCareer.update(career.id, { fan_art: fanArts });
      queryClient.invalidateQueries(['career']);

      setOutcome('New fan art generated!');
      setTimeout(() => { setWorking(false); setOutcome(''); }, 2000);
    } catch (error) {
      setWorking(false);
      setOutcome('Failed to generate fan art');
    }
  };

  const createPoll = async () => {
    if (!pollOption.trim()) return;
    
    setWorking(true);
    try {
      const polls = career.reader_polls || [];
      polls.push({
        question: pollOption,
        options: ['Yes', 'No', 'Maybe'],
        votes: [0, 0, 0],
        active: true,
        created: new Date().toISOString()
      });

      await base44.entities.ServantCareer.update(career.id, { reader_polls: polls });
      queryClient.invalidateQueries(['career']);
      setPollOption('');

      setOutcome('Poll created!');
      setTimeout(() => { setWorking(false); setOutcome(''); }, 2000);
    } catch (error) {
      setWorking(false);
      setOutcome('Failed to create poll');
    }
  };

  const votePoll = async (pollIndex, optionIndex) => {
    const polls = [...(career.reader_polls || [])];
    polls[pollIndex].votes[optionIndex] += Math.floor(Math.random() * 100) + 50;
    
    await base44.entities.ServantCareer.update(career.id, { reader_polls: polls });
    queryClient.invalidateQueries(['career']);
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
          <h3 className="text-white text-2xl font-bold">📱 Fan Interaction</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['comments', 'viral', 'fanart', 'polls'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap ${
                tab === t ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {t === 'comments' && <MessageCircle className="w-4 h-4 inline mr-1" />}
              {t === 'viral' && <TrendingUp className="w-4 h-4 inline mr-1" />}
              {t === 'fanart' && <Image className="w-4 h-4 inline mr-1" />}
              {t === 'polls' && <BarChart3 className="w-4 h-4 inline mr-1" />}
              {t}
            </button>
          ))}
        </div>

        {tab === 'comments' && (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm mb-4">Generate and view reader comments on your chapters</p>
            {(career.manga_chapters || []).map(chapter => (
              <div key={chapter.number} className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-white font-medium">Ch. {chapter.number}: {chapter.title}</h4>
                  <button
                    onClick={() => generateComments(chapter)}
                    disabled={working}
                    className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-white text-sm disabled:opacity-50"
                  >
                    Generate Comments
                  </button>
                </div>
                {chapter.comments && chapter.comments.length > 0 && (
                  <div className="space-y-2">
                    {chapter.comments.map((comment, i) => (
                      <div key={i} className="bg-gray-900/50 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-purple-400 text-sm font-medium">{comment.username}</span>
                          <span className="text-gray-500 text-xs">👍 {comment.likes}</span>
                        </div>
                        <p className="text-gray-300 text-sm">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'viral' && (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm mb-4">Try to make your chapters go viral for massive fan boosts!</p>
            {(career.manga_chapters || []).map(chapter => (
              <div key={chapter.number} className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-white font-medium">Ch. {chapter.number}: {chapter.title}</h4>
                    <p className="text-gray-400 text-sm">Try for viral moment (60% chance)</p>
                  </div>
                  <button
                    onClick={() => checkViralMoment(chapter)}
                    disabled={working}
                    className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 px-4 py-2 rounded-lg text-white disabled:opacity-50"
                  >
                    🔥 Check Viral
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'fanart' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-400 text-sm">Your fans create art of your characters!</p>
              <button
                onClick={generateFanArt}
                disabled={working}
                className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg text-white disabled:opacity-50"
              >
                Generate Fan Art
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {(career.fan_art || []).map((art, i) => (
                <div key={i} className="bg-gray-800/50 rounded-xl overflow-hidden">
                  <img src={art.image} alt={art.character} className="w-full h-48 object-cover" />
                  <div className="p-3">
                    <p className="text-white font-medium">{art.character}</p>
                    <p className="text-gray-400 text-sm">👍 {art.likes} likes</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'polls' && (
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
              <label className="text-white text-sm mb-2 block">Create Reader Poll</label>
              <input
                value={pollOption}
                onChange={(e) => setPollOption(e.target.value)}
                placeholder="e.g., 'Should the main character turn evil?'"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white mb-3"
              />
              <button
                onClick={createPoll}
                disabled={working || !pollOption.trim()}
                className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white disabled:opacity-50"
              >
                Create Poll
              </button>
            </div>

            {(career.reader_polls || []).map((poll, i) => (
              <div key={i} className="bg-gray-800/50 rounded-xl p-4">
                <h4 className="text-white font-medium mb-3">{poll.question}</h4>
                <div className="space-y-2">
                  {poll.options.map((option, optIndex) => {
                    const total = poll.votes.reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? Math.round((poll.votes[optIndex] / total) * 100) : 0;
                    return (
                      <button
                        key={optIndex}
                        onClick={() => votePoll(i, optIndex)}
                        className="w-full bg-gray-900/50 rounded-lg p-3 text-left hover:bg-gray-900/70 transition-colors"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-white">{option}</span>
                          <span className="text-purple-400">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div
                            style={{ width: `${percentage}%` }}
                            className="bg-purple-600 h-2 rounded-full transition-all"
                          />
                        </div>
                        <span className="text-gray-400 text-xs">{poll.votes[optIndex]} votes</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {outcome && (
          <div className="mt-4 bg-purple-950/40 border border-purple-500/30 rounded-lg p-4">
            <p className="text-purple-300 text-center">{outcome}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}