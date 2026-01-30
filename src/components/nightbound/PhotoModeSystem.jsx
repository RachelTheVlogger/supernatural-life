import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function PhotoModeSystem({ onClose }) {
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [sceneDesc, setSceneDesc] = useState('');

  const { data: screenshots = [] } = useQuery({
    queryKey: ['screenshots'],
    queryFn: () => base44.entities.Screenshot.list('-created_date', 20)
  });

  const handleCapture = async () => {
    if (!sceneDesc.trim()) {
      alert('Describe the scene first');
      return;
    }

    setGenerating(true);

    const result = await base44.integrations.Core.GenerateImage({
      prompt: `Cinematic screenshot from supernatural game: ${sceneDesc}. Dark, atmospheric, dramatic lighting. High quality, detailed.`
    });

    await base44.entities.Screenshot.create({
      title: sceneDesc.substring(0, 50),
      scene_description: sceneDesc,
      image_url: result.url,
      characters_involved: []
    });

    await base44.entities.NightLog.create({
      entry: `Memory captured: ${sceneDesc}`,
      category: 'milestone',
      intensity: 'mild'
    });

    queryClient.invalidateQueries();
    setGenerating(false);
    setSceneDesc('');
  };

  const handleToggleFavorite = async (screenshot) => {
    await base44.entities.Screenshot.update(screenshot.id, {
      is_favorite: !screenshot.is_favorite
    });
    queryClient.invalidateQueries();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">📸 Photo Mode</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <textarea
            value={sceneDesc}
            onChange={(e) => setSceneDesc(e.target.value)}
            placeholder="Describe the scene you want to capture..."
            className="w-full bg-gray-800 border border-purple-500/30 rounded-lg p-3 text-white placeholder-gray-500 mb-3 h-24"
          />
          <button
            onClick={handleCapture}
            disabled={generating || !sceneDesc.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold disabled:opacity-50"
          >
            {generating ? 'Generating...' : '📸 Capture Scene'}
          </button>
        </div>

        <h3 className="text-white font-bold mb-3">Gallery</h3>
        <div className="grid grid-cols-2 gap-3">
          {screenshots.map(shot => (
            <div key={shot.id} className="bg-gray-800 rounded-lg overflow-hidden">
              {shot.image_url && (
                <img src={shot.image_url} alt={shot.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-3">
                <p className="text-white text-sm font-bold mb-1">{shot.title}</p>
                <button
                  onClick={() => handleToggleFavorite(shot)}
                  className={`${shot.is_favorite ? 'text-red-400' : 'text-gray-400'} hover:text-red-300`}
                >
                  <Heart className="w-4 h-4" fill={shot.is_favorite ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}