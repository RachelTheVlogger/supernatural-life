import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Stories() {
  const navigate = useNavigate();

  const stories = [
    {
      id: 'nate-lilith',
      title: 'Nate & Lilith',
      subtitle: 'Vampire therapist × his turned patient',
      description: 'Day-walking vampires. Professional boundaries crossed. Dominant love.',
      icon: '🧠',
      gradient: 'from-blue-900 to-indigo-900',
      page: 'NateLilithHome'
    },
    {
      id: 'yandere',
      title: 'Eric & Ruby',
      subtitle: 'Obsessive love story',
      description: 'Book 1: Human obsession. Possessive. Jealous. Completely consumed by each other.',
      icon: '❤️',
      gradient: 'from-red-900 to-pink-900',
      page: 'YandereCoupleHome'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(createPageUrl('Night'))}
          className="text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Stories</h1>
          <p className="text-gray-400">Book couples. Supernatural or not. All intense.</p>
        </div>

        <div className="space-y-4">
          {stories.map((story) => (
            <motion.button
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => navigate(createPageUrl(story.page))}
              className={`w-full bg-gradient-to-r ${story.gradient} hover:opacity-90 border-2 border-white/20 rounded-2xl p-6 text-left transition-all`}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{story.icon}</div>
                <div className="flex-1">
                  <h2 className="text-white text-xl font-bold mb-1">{story.title}</h2>
                  <p className="text-gray-300 text-sm mb-2">{story.subtitle}</p>
                  <p className="text-gray-400 text-xs">{story.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}