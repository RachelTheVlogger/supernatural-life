import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Zap, Users, Briefcase, Scroll, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const CATEGORIES = [
  { id: 'lore', label: 'Lore', icon: Scroll, color: 'purple' },
  { id: 'mechanics', label: 'Mechanics', icon: BookOpen, color: 'blue' },
  { id: 'characters', label: 'Characters', icon: Users, color: 'pink' },
  { id: 'powers', label: 'Powers', icon: Zap, color: 'red' },
  { id: 'business', label: 'Business', icon: Briefcase, color: 'green' }
];

const INITIAL_ENTRIES = [
  {
    category: 'lore',
    title: 'The First Night',
    content: 'Every vampire remembers their first night. The hunger. The fear. The realization that you are no longer human. The first night is always the longest. Every night after is borrowed time.'
  },
  {
    category: 'lore',
    title: 'The Blood Bond',
    content: 'When a vampire feeds regularly from the same mortal, a bond forms. The mortal becomes enthralled, devoted, obsessed. This bond runs both ways - the vampire begins to feel what the servant feels.'
  },
  {
    category: 'lore',
    title: 'Turning',
    content: 'To turn another is to bind yourself. Their hunger becomes yours. Their death, your death. Most vampires never sire. Those who do bear the weight of immortal responsibility.'
  },
  {
    category: 'mechanics',
    title: 'Hunger States',
    content: 'Sated: Recently fed, calm and controlled.\nCalm: Normal state, manageable hunger.\nLingering: Hunger growing, need to feed soon.\nHeightened: Strong hunger, control wavering.\nRestless: Desperate hunger, risky behavior.'
  },
  {
    category: 'mechanics',
    title: 'Relationship System',
    content: 'Bond with servants grows from 0-100 through interactions. Higher bonds unlock new interaction tiers and more intimate options. Each servant variant responds differently to your actions.'
  },
  {
    category: 'mechanics',
    title: 'Obsession Stages',
    content: 'Stage 1: Curious - Just beginning to fall under your influence.\nStage 2: Devoted - Thinking about you constantly.\nStage 3: Dependent - Cannot imagine life without you.\nStage 4: Reverent - You are their entire world.\nStage 5: Bound - Complete unity, no separation.'
  },
  {
    category: 'mechanics',
    title: 'Humanity & Morality',
    content: 'Your humanity ranges from 0-100. High humanity: compassionate, controlled. Low humanity: monstrous, ruthless. Actions affect humanity. Fall too low and you may lose yourself entirely.'
  },
  {
    category: 'characters',
    title: 'Devoted Servants',
    content: 'Soft, earnest, emotionally anchored. They worship you willingly. Every moment with you is sacred to them. They exist to please you. High relationship gains from gentle interactions.'
  },
  {
    category: 'characters',
    title: 'Defiant Servants',
    content: 'Resistant, conflicted, proud. They hate how much they want you. Their will wars with their desire. Breaking them is slow but deeply satisfying. Lower relationship gains but intense dynamics.'
  },
  {
    category: 'characters',
    title: 'Dreamer Servants',
    content: 'Ethereal, poetic, detached. Already half-gone into your world. Reality blurs around them. They drift between dimensions. Highest gains from supernatural interactions.'
  },
  {
    category: 'powers',
    title: 'Persuasion Path',
    content: 'Masters of influence and charm. Subtle Touch, Compelling Voice, Mass Charm. For vampires who prefer elegance over force.'
  },
  {
    category: 'powers',
    title: 'Shadow Path',
    content: 'Masters of darkness and stealth. Meld with Shadows, Shadow Step, Shadow Form. For vampires who hunt from darkness.'
  },
  {
    category: 'powers',
    title: 'Domination Path',
    content: 'Masters of control and will. Command, Break Will, Total Domination. For vampires who demand absolute obedience.'
  },
  {
    category: 'powers',
    title: 'Might Path',
    content: 'Masters of raw power and strength. Enhanced Strength, Celerity, Immortal Resilience. For vampires who embrace physical supremacy.'
  },
  {
    category: 'business',
    title: 'Gothic Jewelry Craft',
    content: 'Your servant creates dark, beautiful jewelry. Ravens, moons, thorns, blood drops. Each piece carries a fragment of the night. Mortals wear them without knowing what they truly represent.'
  },
  {
    category: 'business',
    title: 'Materials & Crafting',
    content: 'Silver, moonstone, onyx, obsidian, garnet, amethyst. Each material resonates with different energies. Combine them carefully to create pieces of power and beauty.'
  },
  {
    category: 'business',
    title: 'Automation System',
    content: 'Set your servant\'s autonomy level. Low: they wait for commands. Medium: they suggest actions. High: they act independently, managing business and routines on their own.'
  }
];

export default function Codex() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('lore');
  const [selectedEntry, setSelectedEntry] = useState(null);

  const { data: vampireStates = [], isLoading: vampireLoading } = useQuery({
    queryKey: ['vampireState'],
    queryFn: () => base44.entities.VampireState.list()
  });

  // Redirect to Home if no vampire state exists
  useEffect(() => {
    if (!vampireLoading && vampireStates.length === 0) {
      navigate(createPageUrl('Home'), { replace: true });
    }
  }, [vampireStates.length, vampireLoading, navigate]);

  const { data: servants = [] } = useQuery({
    queryKey: ['servants'],
    queryFn: () => base44.entities.Servant.list()
  });

  const { data: entries = [] } = useQuery({
    queryKey: ['codex'],
    queryFn: async () => {
      const existing = await base44.entities.CodexEntry.list();
      
      // Initialize entries if empty
      if (existing.length === 0) {
        for (const entry of INITIAL_ENTRIES) {
          await base44.entities.CodexEntry.create({
            ...entry,
            discovery_date: new Date().toISOString()
          });
        }
        return await base44.entities.CodexEntry.list();
      }
      
      return existing;
    }
  });

  const vampireState = vampireStates[0];
  
  const filteredEntries = entries.filter(e => e.category === selectedCategory);
  const categoryData = CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-black p-4 md:p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(createPageUrl('Night'))}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-purple-400" />
              Vampire Codex
            </h1>
            <p className="text-gray-400 text-sm">Knowledge accumulated through endless nights</p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-900 rounded-lg p-3 border border-purple-900/30">
            <p className="text-gray-400 text-xs">Nights Passed</p>
            <p className="text-white text-xl font-bold">{vampireState?.nights_passed || 0}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-3 border border-purple-900/30">
            <p className="text-gray-400 text-xs">Servants</p>
            <p className="text-white text-xl font-bold">{servants.length}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-3 border border-purple-900/30">
            <p className="text-gray-400 text-xs">Powers</p>
            <p className="text-white text-xl font-bold">{vampireState?.unlocked_powers?.length || 0}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-3 border border-purple-900/30">
            <p className="text-gray-400 text-xs">Humanity</p>
            <p className="text-white text-xl font-bold">{vampireState?.humanity ?? 50}</p>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const count = entries.filter(e => e.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedEntry(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? `bg-${cat.color}-600 text-white`
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Entries List */}
        <div className="grid md:grid-cols-2 gap-4">
          {filteredEntries.map((entry) => (
            <motion.button
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedEntry(entry)}
              className={`bg-gray-900 hover:bg-gray-800 rounded-xl p-4 text-left transition-all border ${
                selectedEntry?.id === entry.id
                  ? 'border-purple-500'
                  : 'border-gray-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="text-white font-medium mb-1">{entry.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {entry.content.substring(0, 100)}...
                  </p>
                </div>
                {!entry.unlocked && (
                  <Lock className="w-4 h-4 text-gray-600 flex-shrink-0" />
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Entry Detail Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full border-2 border-purple-500/30"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`text-xs uppercase font-bold text-${categoryData.color}-400`}>
                    {categoryData.label}
                  </span>
                  <h2 className="text-2xl font-bold text-white mt-1">
                    {selectedEntry.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
              </div>
              
              <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                {selectedEntry.content}
              </div>

              {selectedEntry.discovery_date && (
                <p className="text-gray-500 text-xs mt-4">
                  Discovered: {new Date(selectedEntry.discovery_date).toLocaleDateString()}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}