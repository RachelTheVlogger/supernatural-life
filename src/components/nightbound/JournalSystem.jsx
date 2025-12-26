import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Sparkles, Calendar, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

export default function JournalSystem({ servant, vampire, onClose }) {
  const queryClient = useQueryClient();
  const [view, setView] = useState('entries'); // entries, write, prompts
  const [newEntry, setNewEntry] = useState('');
  const [entryTitle, setEntryTitle] = useState('');
  const [selectedMood, setSelectedMood] = useState('content');
  const [generatingPrompts, setGeneratingPrompts] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const [summarizing, setSummarizing] = useState(null);

  const isVampire = !!vampire;
  const ownerId = isVampire ? vampire?.id : servant?.id;
  const ownerName = isVampire ? vampire?.vampire_name : servant?.name;

  const { data: entries = [] } = useQuery({
    queryKey: ['journal', ownerId],
    queryFn: async () => {
      if (isVampire) {
        return await base44.entities.Journal.filter({ vampire_id: ownerId }, '-created_date');
      } else {
        return await base44.entities.Journal.filter({ servant_id: ownerId }, '-created_date');
      }
    },
    enabled: !!ownerId
  });

  const { data: recentLogs = [] } = useQuery({
    queryKey: ['recent-logs-for-prompts'],
    queryFn: () => base44.entities.NightLog.list('-created_date', 5)
  });

  const moods = [
    { value: 'happy', emoji: '😊', label: 'Happy' },
    { value: 'sad', emoji: '😢', label: 'Sad' },
    { value: 'anxious', emoji: '😰', label: 'Anxious' },
    { value: 'excited', emoji: '🤩', label: 'Excited' },
    { value: 'confused', emoji: '😕', label: 'Confused' },
    { value: 'content', emoji: '😌', label: 'Content' },
    { value: 'angry', emoji: '😠', label: 'Angry' },
    { value: 'peaceful', emoji: '😇', label: 'Peaceful' },
    { value: 'obsessed', emoji: '🖤', label: 'Obsessed' },
    { value: 'hungry', emoji: '🩸', label: 'Hungry' }
  ];

  const handleSaveEntry = async () => {
    if (!newEntry.trim()) return;

    const entryData = {
      content: newEntry,
      title: entryTitle || undefined,
      mood: selectedMood,
      entry_date: new Date().toISOString(),
      is_turned: servant?.is_turned || false
    };

    if (isVampire) {
      entryData.vampire_id = ownerId;
    } else {
      entryData.servant_id = ownerId;
    }

    await base44.entities.Journal.create(entryData);
    await base44.entities.NightLog.create({
      entry: `${ownerName} wrote in their journal.`,
      category: 'observation',
      intensity: 'subtle'
    });

    queryClient.invalidateQueries(['journal']);
    setNewEntry('');
    setEntryTitle('');
    setView('entries');
  };

  const handleGeneratePrompts = async () => {
    setGeneratingPrompts(true);

    const recentEvents = recentLogs.map(log => log.entry).join('\n');
    const context = isVampire 
      ? `You are ${vampire?.vampire_name}, a vampire. Recent events: ${recentEvents}`
      : `You are ${servant?.name}, a ${servant?.is_turned ? 'newly turned vampire' : 'human servant'} serving a vampire. Recent events: ${recentEvents}`;

    const prompt = `${context}

Generate 5 thoughtful journal prompts that would help me reflect on these recent experiences. Make them personal, introspective, and relevant to my situation. Format as a simple numbered list.`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt
      });

      const promptsList = response.split('\n').filter(p => p.trim() && /^\d/.test(p.trim()));
      setPrompts(promptsList.map(p => p.replace(/^\d+\.\s*/, '')));
      setView('prompts');
    } catch (e) {
      console.error('Failed to generate prompts:', e);
    }

    setGeneratingPrompts(false);
  };

  const handleSummarize = async (entry) => {
    setSummarizing(entry.id);

    try {
      const summary = await base44.integrations.Core.InvokeLLM({
        prompt: `Summarize this journal entry in 2-3 sentences, capturing the key emotions and events:\n\n${entry.content}`
      });

      await base44.entities.Journal.update(entry.id, {
        ai_summary: summary
      });

      queryClient.invalidateQueries(['journal']);
    } catch (e) {
      console.error('Failed to summarize:', e);
    }

    setSummarizing(null);
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
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-8 h-8 text-purple-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">{ownerName}'s Journal</h2>
            <p className="text-gray-400 text-sm">
              {isVampire ? 'Chronicle your nights' : servant?.is_turned ? 'Your vampire transformation' : 'Your thoughts and experiences'}
            </p>
          </div>
        </div>

        {/* View tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setView('entries')}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              view === 'entries'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-1" />
            Entries
          </button>
          <button
            onClick={() => setView('write')}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              view === 'write'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-1" />
            Write
          </button>
          <button
            onClick={handleGeneratePrompts}
            disabled={generatingPrompts}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              view === 'prompts'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            } disabled:opacity-50`}
          >
            <Sparkles className="w-4 h-4 inline mr-1" />
            {generatingPrompts ? 'Generating...' : 'AI Prompts'}
          </button>
        </div>

        {/* Entries view */}
        {view === 'entries' && (
          <div className="space-y-4">
            {entries.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No entries yet. Start writing!</p>
              </div>
            ) : (
              entries.map(entry => (
                <div key={entry.id} className="bg-gray-800 rounded-xl p-4 border border-purple-500/20">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      {entry.title && (
                        <h3 className="text-white font-bold mb-1">{entry.title}</h3>
                      )}
                      <p className="text-gray-400 text-xs">
                        {format(new Date(entry.created_date), 'MMM d, yyyy')}
                        {entry.is_turned && <span className="ml-2 text-red-400">🩸 As Vampire</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {moods.find(m => m.value === entry.mood)?.emoji || '😌'}
                      </span>
                      <button
                        onClick={() => handleSummarize(entry)}
                        disabled={!!entry.ai_summary || summarizing === entry.id}
                        className="text-xs bg-purple-900/40 hover:bg-purple-900/60 text-purple-300 px-2 py-1 rounded disabled:opacity-50"
                      >
                        {summarizing === entry.id ? 'Summarizing...' : entry.ai_summary ? 'Summarized' : 'AI Summary'}
                      </button>
                    </div>
                  </div>
                  
                  {entry.ai_summary && (
                    <div className="bg-purple-950/40 border border-purple-500/30 rounded-lg p-3 mb-3">
                      <p className="text-purple-300 text-xs font-medium mb-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI Summary
                      </p>
                      <p className="text-gray-300 text-sm italic">{entry.ai_summary}</p>
                    </div>
                  )}

                  <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {entry.content}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Write view */}
        {view === 'write' && (
          <div className="space-y-4">
            <input
              type="text"
              value={entryTitle}
              onChange={(e) => setEntryTitle(e.target.value)}
              placeholder="Title (optional)"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500"
            />

            <div>
              <label className="text-gray-400 text-sm mb-2 block">How are you feeling?</label>
              <div className="grid grid-cols-5 gap-2">
                {moods.map(mood => (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(mood.value)}
                    className={`p-2 rounded-lg transition-colors ${
                      selectedMood === mood.value
                        ? 'bg-purple-600 ring-2 ring-purple-400'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-2xl">{mood.emoji}</span>
                    <p className="text-xs text-gray-400 mt-1">{mood.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              placeholder="Write your thoughts..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 min-h-[300px] resize-none"
            />

            <button
              onClick={handleSaveEntry}
              disabled={!newEntry.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:opacity-50 text-white py-3 rounded-lg transition-colors"
            >
              Save Entry
            </button>
          </div>
        )}

        {/* AI Prompts view */}
        {view === 'prompts' && (
          <div className="space-y-4">
            {prompts.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <p className="text-gray-400">Click "AI Prompts" to generate writing prompts based on recent events</p>
              </div>
            ) : (
              <>
                <p className="text-gray-400 text-sm mb-4">Choose a prompt to inspire your next entry:</p>
                {prompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setNewEntry(prompt);
                      setView('write');
                    }}
                    className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors border border-purple-500/20"
                  >
                    <p className="text-white">{prompt}</p>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}