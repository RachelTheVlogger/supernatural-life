import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, BookOpen, TrendingUp, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const GENRES = [
  { id: 'shonen', label: 'Shonen', icon: '⚔️', desc: 'Action-packed adventures' },
  { id: 'shojo', label: 'Shojo', icon: '💕', desc: 'Romance and relationships' },
  { id: 'seinen', label: 'Seinen', icon: '🌙', desc: 'Mature themes' },
  { id: 'josei', label: 'Josei', icon: '🌸', desc: 'Adult romance & drama' },
  { id: 'isekai', label: 'Isekai', icon: '🌀', desc: 'Transported to another world' },
  { id: 'slice-of-life', label: 'Slice of Life', icon: '☕', desc: 'Everyday moments' }
];

const ART_STYLES = [
  { id: 'classic', label: 'Classic Manga', desc: 'Traditional black & white manga style' },
  { id: 'modern', label: 'Modern Anime', desc: 'Contemporary anime aesthetic' },
  { id: 'chibi', label: 'Chibi', desc: 'A cute style' },
  { id: 'realistic', label: 'Realistic', desc: 'Detailed realistic art' },
  { id: 'watercolor', label: 'Watercolor', desc: 'Soft painted style' },
  { id: 'noir', label: 'Noir', desc: 'High contrast dark style' }
];

export default function MangaCareer({ servant, onClose }) {
  const queryClient = useQueryClient();
  const [working, setWorking] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [showGenreSelect, setShowGenreSelect] = useState(false);
  const [showStyleSelect, setShowStyleSelect] = useState(false);
  const [uploadingStyle, setUploadingStyle] = useState(false);
  const [generatingCover, setGeneratingCover] = useState(false);
  const [showCoverPrompt, setShowCoverPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [viewingChapter, setViewingChapter] = useState(null);
  const [generationProgress, setGenerationProgress] = useState('');
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0);
  const [panelZoom, setPanelZoom] = useState(1);
  const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showCustomCreator, setShowCustomCreator] = useState(false);
  const [customMode, setCustomMode] = useState('prompt'); // 'prompt' or 'manual'
  const [chapterPrompt, setChapterPrompt] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customPanels, setCustomPanels] = useState([
    { description: '', dialogue: '' }
  ]);

  const { data: careers = [] } = useQuery({
    queryKey: ['career', servant.id],
    queryFn: () => base44.entities.ServantCareer.filter({ servant_id: servant.id })
  });

  const career = careers[0];

  const saveBookmark = async (chapterNumber, panelIndex) => {
    if (!career?.id) return;
    const bookmarks = career.manga_bookmarks || {};
    bookmarks[`chapter_${chapterNumber}`] = panelIndex;
    await base44.entities.ServantCareer.update(career.id, {
      manga_bookmarks: bookmarks
    });
    queryClient.invalidateQueries(['career']);
  };

  const getBookmark = (chapterNumber) => {
    if (!career?.manga_bookmarks) return 0;
    return career.manga_bookmarks[`chapter_${chapterNumber}`] || 0;
  };

  const handlePanelZoom = (delta) => {
    setPanelZoom(prev => Math.max(1, Math.min(3, prev + delta)));
  };

  const handlePanelDragStart = (e) => {
    if (panelZoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX || e.touches?.[0]?.clientX || 0,
        y: e.clientY || e.touches?.[0]?.clientY || 0
      });
    }
  };

  const handlePanelDrag = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
    setPanelPosition(prev => ({
      x: prev.x + (clientX - dragStart.x),
      y: prev.y + (clientY - dragStart.y)
    }));
    setDragStart({ x: clientX, y: clientY });
  };

  const handlePanelDragEnd = () => {
    setIsDragging(false);
  };

  const resetPanelView = () => {
    setPanelZoom(1);
    setPanelPosition({ x: 0, y: 0 });
  };

  const goToNextPanel = () => {
    if (viewingChapter && currentPanelIndex < (viewingChapter.panels?.length || 0) - 1) {
      setCurrentPanelIndex(prev => prev + 1);
      resetPanelView();
      saveBookmark(viewingChapter.number, currentPanelIndex + 1);
    }
  };

  const goToPreviousPanel = () => {
    if (currentPanelIndex > 0) {
      setCurrentPanelIndex(prev => prev - 1);
      resetPanelView();
      saveBookmark(viewingChapter.number, currentPanelIndex - 1);
    }
  };

  React.useEffect(() => {
    if (viewingChapter) {
      const bookmark = getBookmark(viewingChapter.number);
      setCurrentPanelIndex(bookmark);
      resetPanelView();
    }
  }, [viewingChapter]);

  const handleGenerateCover = async (useCustomPrompt = false) => {
    if (!career?.id) return;
    
    setGeneratingCover(true);
    setOutcome('Generating cover art...');
    
    try {
      const genre = career.current_genre || 'shonen';
      const artStyle = career.art_style || 'classic';
      const seriesName = career.series_name || 'Untitled';
      
      const genreDescriptions = {
        shonen: 'action-packed battle scene with dynamic energy',
        shojo: 'romantic scene with flowers and sparkles, emotional atmosphere',
        seinen: 'dark mature setting with gritty realism',
        josei: 'elegant sophisticated scene with adult themes',
        isekai: 'fantasy world with magic and adventure',
        'slice-of-life': 'peaceful everyday life scene with warm colors'
      };
      
      const styleDescriptions = {
        classic: 'traditional manga art style, black and white aesthetic',
        modern: 'modern anime style, vibrant digital colors',
        chibi: 'cute chibi style characters',
        realistic: 'realistic detailed illustration',
        watercolor: 'watercolor painted style',
        noir: 'noir high contrast dramatic shadows'
      };
      
      let prompt;
      if (useCustomPrompt && customPrompt.trim()) {
        prompt = `${customPrompt}, ${styleDescriptions[artStyle]}, manga cover art, professional illustration, title layout space`;
      } else {
        prompt = `"${seriesName}" manga cover art, ${genreDescriptions[genre]}, ${styleDescriptions[artStyle]}, dramatic composition, professional manga illustration, eye-catching design, title space at top`;
      }
      
      const generateParams = { prompt };
      if (career.style_reference_image) {
        generateParams.existing_image_urls = [career.style_reference_image];
      }
      
      const imageResult = await base44.integrations.Core.GenerateImage(generateParams);
      
      await base44.entities.ServantCareer.update(career.id, {
        cover_art: imageResult.url
      });
      
      await base44.entities.NightLog.create({
        entry: `${servant.name} created stunning cover art for "${seriesName}"!`,
        category: 'interaction',
        intensity: 'moderate'
      });
      
      setOutcome('Cover art generated!');
      queryClient.invalidateQueries(['career']);
      
      setTimeout(() => {
        setGeneratingCover(false);
        setOutcome('');
        setShowCoverPrompt(false);
        setCustomPrompt('');
      }, 2000);
    } catch (error) {
      console.error('Failed to generate cover:', error);
      setOutcome('Failed to generate cover. Please try again.');
      setTimeout(() => {
        setGeneratingCover(false);
        setOutcome('');
      }, 2000);
    }
  };

  const handleDrawChapter = async () => {
    if (!career?.id) return;
    
    setWorking(true);
    setGenerationProgress('Creating chapter story...');
    
    try {
      const genre = career.current_genre || 'shonen';
      const artStyle = career.art_style || 'classic';
      const seriesName = career.series_name || 'Untitled';
      const newChapters = (career.chapters_released || 0) + 1;
      const existingChapters = career.manga_chapters || [];
      const storySummary = career.story_summary || `A ${genre} manga series about adventure and growth.`;

      // Generate chapter content with AI
      const contentPrompt = `You are writing Chapter ${newChapters} of "${seriesName}", a ${genre} manga.

Story so far: ${storySummary}

Create this chapter with:
1. A compelling chapter title
2. 6 key manga panels with descriptions
3. Brief dialogue/narration for each panel
4. A plot summary

Format as JSON:
{
  "title": "Chapter Title",
  "plot": "Brief plot summary",
  "panels": [
    {"description": "Panel scene description", "dialogue": "Character dialogue or narration"},
    ...
  ]
}`;

      const chapterContent = await base44.integrations.Core.InvokeLLM({
        prompt: contentPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            plot: { type: "string" },
            panels: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  description: { type: "string" },
                  dialogue: { type: "string" }
                }
              }
            }
          }
        }
      });

      const title = chapterContent.title;
      const panels = chapterContent.panels || [];
      
      // Generate images for each panel
      setGenerationProgress(`Generating ${panels.length} manga panels...`);
      
      const stylePrompts = {
        classic: 'traditional black and white manga art style, classic manga aesthetic, hand-drawn linework',
        modern: 'modern anime style, vibrant colors, digital anime art, contemporary manga aesthetic',
        chibi: 'chibi style, super deformed cute characters, simplified features, kawaii aesthetic',
        realistic: 'realistic detailed art style, photorealistic manga illustration, high detail',
        watercolor: 'watercolor painting style manga, soft painted aesthetic, artistic brushstrokes',
        noir: 'noir manga style, high contrast shadows, dark atmosphere, dramatic black and white'
      };

      const panelImages = [];
      for (let i = 0; i < Math.min(panels.length, 6); i++) {
        setGenerationProgress(`Generating panel ${i + 1}/${panels.length}...`);
        
        const panelPrompt = `${panels[i].description}, ${stylePrompts[artStyle]}, manga panel, professional manga illustration, dramatic composition`;
        
        const generateParams = { prompt: panelPrompt };
        if (career.style_reference_image) {
          generateParams.existing_image_urls = [career.style_reference_image];
        }
        
        const imageResult = await base44.integrations.Core.GenerateImage(generateParams);
        panelImages.push({
          image: imageResult.url,
          description: panels[i].description,
          dialogue: panels[i].dialogue
        });
      }

      const quality = Math.floor(Math.random() * 30) + 70;
      const fansGained = Math.floor(Math.random() * 300) + 150;
      const incomeGained = Math.floor(Math.random() * 200) + 150;

      const newChapter = {
        number: newChapters,
        title,
        plot: chapterContent.plot,
        panels: panelImages,
        quality,
        fans_gained: fansGained,
        income: incomeGained,
        date: new Date().toISOString()
      };

      // Update story summary for continuity
      const newStorySummary = `${storySummary} Chapter ${newChapters}: ${chapterContent.plot}`;

      await base44.entities.ServantCareer.update(career.id, {
        fans: (career.fans || 0) + fansGained,
        income: (career.income || 0) + incomeGained,
        chapters_released: newChapters,
        manga_chapters: [...existingChapters, newChapter],
        story_summary: newStorySummary
      });

      await base44.entities.NightLog.create({
        entry: `${servant.name} released Chapter ${newChapters}: "${title}" with ${panelImages.length} panels! +${fansGained} fans, +$${incomeGained}`,
        category: 'interaction',
        intensity: 'moderate'
      });

      setOutcome(`Chapter ${newChapters}: "${title}" complete! +${fansGained} fans, $${incomeGained}`);
      queryClient.invalidateQueries(['career']);

      setTimeout(() => {
        setWorking(false);
        setOutcome('');
        setGenerationProgress('');
      }, 3000);
    } catch (error) {
      console.error('Failed to generate chapter:', error);
      setWorking(false);
      setOutcome('Failed to generate chapter. Please try again.');
      setGenerationProgress('');
    }
  };

  const handleCreateCustomChapter = async () => {
    if (!career?.id) return;
    
    setWorking(true);
    setGenerationProgress('Processing your custom chapter...');
    
    try {
      const genre = career.current_genre || 'shonen';
      const artStyle = career.art_style || 'classic';
      const seriesName = career.series_name || 'Untitled';
      const newChapters = (career.chapters_released || 0) + 1;
      const existingChapters = career.manga_chapters || [];

      let chapterData;

      if (customMode === 'prompt') {
        // Generate from custom prompt
        const contentPrompt = `You are writing Chapter ${newChapters} of "${seriesName}", a ${genre} manga.

User's custom request: ${chapterPrompt}

Create this chapter with:
1. A compelling chapter title
2. 6 key manga panels with descriptions
3. Brief dialogue/narration for each panel
4. A plot summary

Format as JSON:
{
  "title": "Chapter Title",
  "plot": "Brief plot summary",
  "panels": [
    {"description": "Panel scene description", "dialogue": "Character dialogue or narration"},
    ...
  ]
}`;

        chapterData = await base44.integrations.Core.InvokeLLM({
          prompt: contentPrompt,
          response_json_schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              plot: { type: "string" },
              panels: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    description: { type: "string" },
                    dialogue: { type: "string" }
                  }
                }
              }
            }
          }
        });
      } else {
        // Use manually entered panels
        chapterData = {
          title: customTitle || `Chapter ${newChapters}`,
          plot: chapterPrompt || 'Custom chapter',
          panels: customPanels.filter(p => p.description.trim())
        };
      }

      const title = chapterData.title;
      const panels = chapterData.panels || [];
      
      // Generate images for each panel
      setGenerationProgress(`Generating ${panels.length} manga panels...`);
      
      const stylePrompts = {
        classic: 'traditional black and white manga art style, classic manga aesthetic, hand-drawn linework',
        modern: 'modern anime style, vibrant colors, digital anime art, contemporary manga aesthetic',
        chibi: 'chibi style, super deformed cute characters, simplified features, kawaii aesthetic',
        realistic: 'realistic detailed art style, photorealistic manga illustration, high detail',
        watercolor: 'watercolor painting style manga, soft painted aesthetic, artistic brushstrokes',
        noir: 'noir manga style, high contrast shadows, dark atmosphere, dramatic black and white'
      };

      const panelImages = [];
      for (let i = 0; i < Math.min(panels.length, 6); i++) {
        setGenerationProgress(`Generating panel ${i + 1}/${panels.length}...`);
        
        const panelPrompt = `${panels[i].description}, ${stylePrompts[artStyle]}, manga panel, professional manga illustration, dramatic composition`;
        
        const generateParams = { prompt: panelPrompt };
        if (career.style_reference_image) {
          generateParams.existing_image_urls = [career.style_reference_image];
        }
        
        const imageResult = await base44.integrations.Core.GenerateImage(generateParams);
        panelImages.push({
          image: imageResult.url,
          description: panels[i].description,
          dialogue: panels[i].dialogue
        });
      }

      const quality = Math.floor(Math.random() * 30) + 70;
      const fansGained = Math.floor(Math.random() * 300) + 150;
      const incomeGained = Math.floor(Math.random() * 200) + 150;

      const newChapter = {
        number: newChapters,
        title,
        plot: chapterData.plot,
        panels: panelImages,
        quality,
        fans_gained: fansGained,
        income: incomeGained,
        date: new Date().toISOString()
      };

      await base44.entities.ServantCareer.update(career.id, {
        fans: (career.fans || 0) + fansGained,
        income: (career.income || 0) + incomeGained,
        chapters_released: newChapters,
        manga_chapters: [...existingChapters, newChapter],
        story_summary: (career.story_summary || '') + ` Chapter ${newChapters}: ${chapterData.plot}`
      });

      await base44.entities.NightLog.create({
        entry: `${servant.name} created custom Chapter ${newChapters}: "${title}"! +${fansGained} fans, +$${incomeGained}`,
        category: 'interaction',
        intensity: 'moderate'
      });

      setOutcome(`Custom chapter "${title}" complete! +${fansGained} fans, $${incomeGained}`);
      queryClient.invalidateQueries(['career']);
      setShowCustomCreator(false);
      setChapterPrompt('');
      setCustomTitle('');
      setCustomPanels([{ description: '', dialogue: '' }]);

      setTimeout(() => {
        setWorking(false);
        setOutcome('');
        setGenerationProgress('');
      }, 3000);
    } catch (error) {
      console.error('Failed to create custom chapter:', error);
      setWorking(false);
      setOutcome('Failed to create custom chapter. Please try again.');
      setGenerationProgress('');
    }
  };

  const handleStartSeries = async (genre) => {
    setWorking(true);
    
    setTimeout(async () => {
      const seriesNames = {
        shonen: ['Battle Chronicles', 'Rising Hero', 'Power Surge'],
        shojo: ['First Love', 'Spring Romance', 'Heart Melody'],
        seinen: ['Dark Society', 'Broken Glass', 'Urban Tales'],
        josei: ['After Hours', 'Office Affairs', 'Midnight Calls'],
        isekai: ['Another World', 'Portal Quest', 'Reborn Legend'],
        'slice-of-life': ['Daily Life', 'Coffee Shop Days', 'Small Town Stories']
      };

      const names = seriesNames[genre.id];
      const seriesName = names[Math.floor(Math.random() * names.length)];

      if (!career?.id) {
        await base44.entities.ServantCareer.create({
          servant_id: servant.id,
          manga_career_active: true,
          current_genre: genre.id,
          series_name: seriesName,
          chapters_released: 0,
          fans: Math.floor(Math.random() * 50) + 20,
          income: 0,
          art_style: 'classic'
        });
      } else {
        await base44.entities.ServantCareer.update(career.id, {
          manga_career_active: true,
          current_genre: genre.id,
          series_name: seriesName,
          chapters_released: 0,
          fans: Math.floor(Math.random() * 50) + 20,
          income: 0,
          art_style: 'classic'
        });
      }

      await base44.entities.NightLog.create({
        entry: `${servant.name} started "${seriesName}" - a ${genre.label} manga series!`,
        category: 'interaction',
        intensity: 'moderate'
      });

      setOutcome(`Started "${seriesName}" - a ${genre.label} manga series!`);
      queryClient.invalidateQueries(['career']);
      
      setTimeout(() => {
        setWorking(false);
        setOutcome('');
      }, 2000);
    }, 1500);
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
        className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col relative"
      >
        <div className="p-6 pb-4">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Manga Artist</h2>
              <p className="text-gray-400 text-sm">{servant.name}'s manga career</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 overflow-y-auto flex-1">
        {career?.series_name && (
          <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4 mb-4">
            {career.cover_art && (
              <div className="mb-4">
                <img 
                  src={career.cover_art} 
                  alt={`${career.series_name} cover`}
                  className="w-full rounded-lg border-2 border-purple-500/50 object-cover"
                />
              </div>
            )}

            <h3 className="text-purple-300 font-bold text-lg mb-1">{career.series_name}</h3>
            <p className="text-gray-400 text-xs capitalize mb-3">{career.current_genre} manga</p>
            
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-gray-800 rounded-lg p-2">
                <Users className="w-4 h-4 text-blue-400 mb-1" />
                <p className="text-white font-bold text-sm">{career.fans || 0}</p>
                <p className="text-gray-400 text-xs">Fans</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-2">
                <BookOpen className="w-4 h-4 text-green-400 mb-1" />
                <p className="text-white font-bold text-sm">{career.chapters_released || 0}</p>
                <p className="text-gray-400 text-xs">Chapters</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-2">
                <TrendingUp className="w-4 h-4 text-yellow-400 mb-1" />
                <p className="text-white font-bold text-sm">${career.income || 0}</p>
                <p className="text-gray-400 text-xs">Income</p>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={handleDrawChapter}
                disabled={working || generatingCover}
                className="flex-1 bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-lg py-3 text-white disabled:opacity-50 font-medium"
              >
                {working ? 'Drawing...' : 'Auto Chapter'}
              </button>
              <button
                onClick={() => setShowCustomCreator(true)}
                disabled={working || generatingCover}
                className="flex-1 bg-blue-900/40 hover:bg-blue-900/60 border border-blue-500/30 rounded-lg py-3 text-white disabled:opacity-50 font-medium"
              >
                Custom Chapter
              </button>
              <button
                onClick={() => setShowCoverPrompt(true)}
                disabled={working || generatingCover}
                className="bg-pink-900/40 hover:bg-pink-900/60 border border-pink-500/30 rounded-lg px-4 text-white disabled:opacity-50"
                title="Generate Cover Art"
              >
                🖼️
              </button>
              <button
                onClick={() => setShowStyleSelect(true)}
                disabled={working || generatingCover}
                className="bg-blue-900/40 hover:bg-blue-900/60 border border-blue-500/30 rounded-lg px-4 text-white disabled:opacity-50"
                title="Change Art Style"
              >
                🎨
              </button>
              <button
                onClick={async () => {
                  if (confirm(`Delete "${career.series_name}"? This cannot be undone.`)) {
                    await base44.entities.ServantCareer.update(career.id, {
                      manga_career_active: false,
                      series_name: null,
                      current_genre: null,
                      chapters_released: 0,
                      fans: 0,
                      income: 0,
                      manga_chapters: [],
                      art_style: 'classic',
                      style_reference_image: null,
                      cover_art: null
                    });
                    queryClient.invalidateQueries(['career']);
                  }
                }}
                disabled={working || generatingCover}
                className="bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 rounded-lg px-4 text-white disabled:opacity-50"
                title="Delete Series"
              >
                🗑️
              </button>
            </div>

            {career.manga_chapters && career.manga_chapters.length > 0 && (
              <div>
                <h4 className="text-white font-medium text-sm mb-2">Published Chapters</h4>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {[...career.manga_chapters].reverse().map((chapter) => (
                    <button
                      key={chapter.number}
                      onClick={() => setViewingChapter(chapter)}
                      className="w-full bg-gray-800/50 hover:bg-gray-800/70 rounded-lg p-3 text-left transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="text-white font-medium text-sm">Ch. {chapter.number}: {chapter.title}</h5>
                        <span className="text-xs text-purple-400">{chapter.quality}% quality</span>
                      </div>

                      {chapter.panels && chapter.panels.length > 0 && (
                        <div className="mb-2 grid grid-cols-3 gap-1">
                          {chapter.panels.slice(0, 3).map((panel, i) => (
                            <img 
                              key={i}
                              src={panel.image} 
                              alt={`Panel ${i + 1}`}
                              className="w-full h-16 rounded border border-purple-500/30 object-cover"
                            />
                          ))}
                        </div>
                      )}

                      {chapter.panel_image && !chapter.panels && (
                        <div className="mb-2">
                          <img 
                            src={chapter.panel_image} 
                            alt={`${chapter.title} manga panel`}
                            className="w-full rounded-lg border-2 border-purple-500/30 object-cover"
                          />
                        </div>
                      )}

                      <div className="flex gap-3 text-xs text-gray-400">
                        <span>📄 {chapter.panels?.length || chapter.panels || 0} panels</span>
                        <span>👥 +{chapter.fans_gained} fans</span>
                        <span>💰 ${chapter.income}</span>
                      </div>

                      <p className="text-purple-400 text-xs mt-2">Click to read →</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!career?.series_name && (
          <div className="text-center py-8">
            <BookOpen className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">No Active Series</h3>
            <p className="text-gray-400 text-sm mb-6">Start your manga journey</p>
            <button
              onClick={() => setShowGenreSelect(true)}
              disabled={working}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-xl disabled:opacity-50"
            >
              Start New Series
            </button>
          </div>
        )}

        {working && (
          <div className="mt-4 text-center">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-purple-400"
            >
              {generationProgress || 'Working on the chapter...'}
            </motion.div>
          </div>
        )}

        {outcome && (
          <div className="mt-4 bg-green-950/40 border border-green-500/30 rounded-lg p-4">
            <p className="text-green-300 text-center">{outcome}</p>
          </div>
        )}
        </div>
      </motion.div>

      {/* Style Selection Modal */}
      {showStyleSelect && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90"
          onClick={() => !working && setShowStyleSelect(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-white text-xl font-bold mb-4">Art Style</h3>

            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-2">Current: {ART_STYLES.find(s => s.id === (career?.art_style || 'classic'))?.label}</p>
            </div>

            <div className="space-y-2 mb-4">
              {ART_STYLES.map(style => (
                <button
                  key={style.id}
                  onClick={async () => {
                    await base44.entities.ServantCareer.update(career.id, { art_style: style.id });
                    queryClient.invalidateQueries(['career']);
                    setShowStyleSelect(false);
                  }}
                  disabled={working}
                  className={`w-full rounded-lg p-3 text-left transition-colors ${
                    career?.art_style === style.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  <h4 className="font-medium">{style.label}</h4>
                  <p className="text-xs opacity-80">{style.desc}</p>
                </button>
              ))}
            </div>

            <div className="border-t border-gray-700 pt-4">
              <h4 className="text-white font-medium mb-2">Style Transfer</h4>
              <p className="text-gray-400 text-xs mb-3">Upload a reference image to transfer its style</p>

              {career?.style_reference_image && (
                <div className="mb-3">
                  <img src={career.style_reference_image} alt="Style reference" className="w-full rounded-lg border border-purple-500/30" />
                  <button
                    onClick={async () => {
                      await base44.entities.ServantCareer.update(career.id, { style_reference_image: null });
                      queryClient.invalidateQueries(['career']);
                    }}
                    className="w-full mt-2 bg-red-900/40 hover:bg-red-900/60 text-red-300 py-2 rounded-lg text-sm"
                  >
                    Remove Reference
                  </button>
                </div>
              )}

              <label className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg py-3 px-4 cursor-pointer text-center block disabled:opacity-50">
                {uploadingStyle ? 'Uploading...' : 'Upload Style Reference Image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    setUploadingStyle(true);
                    setOutcome('Uploading style reference...');

                    try {
                      const result = await base44.integrations.Core.UploadFile({ file });

                      if (result?.file_url) {
                        await base44.entities.ServantCareer.update(career.id, { 
                          style_reference_image: result.file_url 
                        });
                        queryClient.invalidateQueries(['career']);
                        setOutcome('Style reference uploaded!');

                        setTimeout(() => {
                          setUploadingStyle(false);
                          setOutcome('');
                          setShowStyleSelect(false);
                        }, 2000);
                      } else {
                        throw new Error('No file URL returned');
                      }
                    } catch (error) {
                      console.error('Upload failed:', error);
                      setOutcome('Upload failed. Please try again.');
                      setTimeout(() => {
                        setUploadingStyle(false);
                        setOutcome('');
                      }, 2000);
                    }
                  }}
                  disabled={uploadingStyle}
                  className="hidden"
                />
              </label>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Chapter Viewer Modal with Page Turning */}
      {viewingChapter && viewingChapter.panels && viewingChapter.panels.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black"
          onClick={() => setViewingChapter(null)}
        >
          <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                Ch. {viewingChapter.number}: {viewingChapter.title}
              </h2>
              <p className="text-gray-400 text-sm">
                Panel {currentPanelIndex + 1} of {viewingChapter.panels.length}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setViewingChapter(null);
              }}
              className="bg-gray-900/80 hover:bg-gray-900 rounded-full p-2 text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div 
            className="relative w-full h-full flex items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPanelIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative max-w-4xl max-h-[80vh] touch-none"
                onMouseDown={handlePanelDragStart}
                onMouseMove={handlePanelDrag}
                onMouseUp={handlePanelDragEnd}
                onMouseLeave={handlePanelDragEnd}
                onTouchStart={handlePanelDragStart}
                onTouchMove={handlePanelDrag}
                onTouchEnd={handlePanelDragEnd}
                onWheel={(e) => {
                  e.preventDefault();
                  handlePanelZoom(e.deltaY > 0 ? -0.1 : 0.1);
                }}
              >
                <img
                  src={viewingChapter.panels[currentPanelIndex].image}
                  alt={`Panel ${currentPanelIndex + 1}`}
                  className="max-w-full max-h-[80vh] rounded-lg shadow-2xl"
                  style={{
                    transform: `scale(${panelZoom}) translate(${panelPosition.x / panelZoom}px, ${panelPosition.y / panelZoom}px)`,
                    cursor: panelZoom > 1 ? 'grab' : 'default',
                    transition: isDragging ? 'none' : 'transform 0.3s ease'
                  }}
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
            {viewingChapter.panels[currentPanelIndex].dialogue && (
              <div className="bg-gray-900/90 rounded-lg p-4 mb-4 max-w-2xl mx-auto border border-purple-500/30">
                <p className="text-white text-center">{viewingChapter.panels[currentPanelIndex].dialogue}</p>
              </div>
            )}

            <div className="flex items-center justify-between max-w-2xl mx-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPreviousPanel();
                }}
                disabled={currentPanelIndex === 0}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium"
              >
                ← Previous
              </button>

              <div className="flex gap-2 items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePanelZoom(-0.5);
                  }}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg"
                >
                  −
                </button>
                <span className="text-white text-sm">{Math.round(panelZoom * 100)}%</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePanelZoom(0.5);
                  }}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg"
                >
                  +
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetPanelView();
                  }}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm"
                >
                  Reset
                </button>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextPanel();
                }}
                disabled={currentPanelIndex === viewingChapter.panels.length - 1}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium"
              >
                Next →
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Custom Chapter Creator Modal */}
      {showCustomCreator && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90"
          onClick={() => !working && setShowCustomCreator(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 rounded-2xl p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto"
          >
            <h3 className="text-white text-2xl font-bold mb-4">Create Custom Chapter</h3>

            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setCustomMode('prompt')}
                className={`flex-1 py-2 rounded-lg transition-colors ${
                  customMode === 'prompt'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                AI from Prompt
              </button>
              <button
                onClick={() => setCustomMode('manual')}
                className={`flex-1 py-2 rounded-lg transition-colors ${
                  customMode === 'manual'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                Manual Entry
              </button>
            </div>

            {customMode === 'prompt' ? (
              <div className="space-y-4">
                <div>
                  <label className="text-white text-sm mb-2 block">Chapter Idea/Prompt</label>
                  <textarea
                    value={chapterPrompt}
                    onChange={(e) => setChapterPrompt(e.target.value)}
                    placeholder="Describe what happens in this chapter... (e.g., 'The protagonist faces their rival in an epic showdown at the tournament finals')"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                    rows={6}
                    disabled={working}
                  />
                </div>
                <p className="text-gray-400 text-sm">
                  The AI will generate a complete chapter with title, plot, 6 panels, descriptions, and dialogue based on your prompt.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-white text-sm mb-2 block">Chapter Title</label>
                  <input
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Chapter title..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    disabled={working}
                  />
                </div>

                <div>
                  <label className="text-white text-sm mb-2 block">Plot Summary</label>
                  <textarea
                    value={chapterPrompt}
                    onChange={(e) => setChapterPrompt(e.target.value)}
                    placeholder="Brief summary of what happens..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                    rows={3}
                    disabled={working}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-white text-sm">Panels (Max 6)</label>
                    <button
                      onClick={() => {
                        if (customPanels.length < 6) {
                          setCustomPanels([...customPanels, { description: '', dialogue: '' }]);
                        }
                      }}
                      disabled={customPanels.length >= 6 || working}
                      className="text-purple-400 hover:text-purple-300 text-sm disabled:opacity-50"
                    >
                      + Add Panel
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                    {customPanels.map((panel, i) => (
                      <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-purple-400 text-sm font-medium">Panel {i + 1}</span>
                          {customPanels.length > 1 && (
                            <button
                              onClick={() => setCustomPanels(customPanels.filter((_, idx) => idx !== i))}
                              disabled={working}
                              className="text-red-400 hover:text-red-300 text-xs"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <textarea
                          value={panel.description}
                          onChange={(e) => {
                            const newPanels = [...customPanels];
                            newPanels[i].description = e.target.value;
                            setCustomPanels(newPanels);
                          }}
                          placeholder="Panel description (e.g., 'Character charging up energy attack with dramatic lighting')"
                          className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none mb-2"
                          rows={2}
                          disabled={working}
                        />
                        <textarea
                          value={panel.dialogue}
                          onChange={(e) => {
                            const newPanels = [...customPanels];
                            newPanels[i].dialogue = e.target.value;
                            setCustomPanels(newPanels);
                          }}
                          placeholder="Dialogue/narration (optional)"
                          className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                          rows={2}
                          disabled={working}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateCustomChapter}
                disabled={working || (customMode === 'prompt' ? !chapterPrompt.trim() : !customPanels.some(p => p.description.trim()))}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50"
              >
                {working ? generationProgress || 'Creating...' : 'Generate Chapter'}
              </button>
              {!working && (
                <button
                  onClick={() => setShowCustomCreator(false)}
                  className="px-6 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg"
                >
                  Cancel
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Cover Art Prompt Modal */}
      {showCoverPrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90"
          onClick={() => !generatingCover && setShowCoverPrompt(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-white text-xl font-bold mb-4">Generate Cover Art</h3>

            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-3">
                Create a stunning cover for "{career.series_name}"
              </p>

              <label className="text-white text-sm mb-2 block">Custom Prompt (Optional)</label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe your ideal cover... (or leave blank for auto-generated)"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                rows={3}
                disabled={generatingCover}
              />
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleGenerateCover(true)}
                disabled={generatingCover}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg disabled:opacity-50"
              >
                {generatingCover ? 'Generating...' : customPrompt.trim() ? 'Generate with Custom Prompt' : 'Auto-Generate Cover'}
              </button>

              {!generatingCover && (
                <button
                  onClick={() => setShowCoverPrompt(false)}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg"
                >
                  Cancel
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Genre Selection Modal */}
      {showGenreSelect && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90"
          onClick={() => !working && setShowGenreSelect(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-white text-xl font-bold mb-4">Choose Genre</h3>
            <div className="grid grid-cols-2 gap-3">
              {GENRES.map(genre => (
                <button
                  key={genre.id}
                  onClick={() => {
                    handleStartSeries(genre);
                    setShowGenreSelect(false);
                  }}
                  disabled={working}
                  className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-center transition-colors disabled:opacity-50"
                >
                  <div className="text-4xl mb-2">{genre.icon}</div>
                  <h4 className="text-white font-medium text-sm mb-1">{genre.label}</h4>
                  <p className="text-gray-400 text-xs">{genre.desc}</p>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}