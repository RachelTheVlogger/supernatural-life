import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Video, Users, Eye, TrendingUp, DollarSign, Play, MessageCircle, ThumbsUp, Bell, Award, Flame, Zap, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const VIDEO_CATEGORIES = {
  gaming: { icon: '🎮', label: 'Gaming', examples: ['Horror game playthrough', 'Late night gaming stream', 'Scary game reactions', 'Dark souls gameplay'] },
  vlog: { icon: '📹', label: 'Vlog', examples: ['Night routine', 'Day in my life (night owl edition)', 'Midnight adventures', 'Living with my partner'] },
  lifestyle: { icon: '✨', label: 'Lifestyle', examples: ['Gothic home tour', 'Dark aesthetic room', 'Night routine ASMR', 'My unusual sleep schedule'] },
  paranormal: { icon: '👻', label: 'Paranormal', examples: ['Investigating abandoned places', 'True scary stories', 'Unexplained phenomena', 'My paranormal experiences'] },
  mystery: { icon: '🔍', label: 'Mystery', examples: ['Unsolved mysteries', 'True crime discussion', 'Dark history', 'Conspiracy theories'] },
  challenge: { icon: '🎯', label: 'Challenge', examples: ['24h overnight challenge', 'No sleep challenge', 'Eating weird foods', 'Fear factor style'] },
  collab: { icon: '👥', label: 'Collab', examples: ['Collab with another creator', 'Boyfriend/girlfriend reveal', 'Couple content', 'Meeting fans'] },
  asmr: { icon: '🎧', label: 'ASMR', examples: ['Dark ASMR roleplay', 'Gothic makeup ASMR', 'Whispered storytelling', 'Tapping and triggers'] },
  storytime: { icon: '💬', label: 'Storytime', examples: ['Weird things that happened to me', 'Strange encounters', 'My secret life', 'Unexplainable events'] },
  dark_content: { icon: '🌙', label: 'Dark Content', examples: ['Living as a night person', 'My unusual lifestyle', 'Things I can\'t explain', 'Why I avoid sunlight'], risky: true }
};

export default function YouTubeCareer({ servant, vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('create');
  const [creating, setCreating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newVideo, setNewVideo] = useState({ title: '', content: '' });
  const [editingChannel, setEditingChannel] = useState(false);
  const [channelData, setChannelData] = useState({ channel_name: '', niche: 'vlog' });
  const [streaming, setStreaming] = useState(false);
  const [streamChat, setStreamChat] = useState([]);
  const [viewingComments, setViewingComments] = useState(null);
  const [filmWithVampire, setFilmWithVampire] = useState(false);

  const { data: channels = [] } = useQuery({
    queryKey: ['youtube-channel', servant.id],
    queryFn: () => base44.entities.YouTubeChannel.filter({ servant_id: servant.id }),
    staleTime: 5000
  });

  const { data: videos = [], isLoading: videosLoading } = useQuery({
    queryKey: ['youtube-videos', channels[0]?.id],
    queryFn: () => base44.entities.YouTubeVideo.filter({ channel_id: channels[0]?.id }, '-created_date'),
    enabled: !!channels[0],
    staleTime: 3000
  });

  const { data: allComments = [] } = useQuery({
    queryKey: ['youtube-comments', channels[0]?.id],
    queryFn: () => base44.entities.YouTubeComment.list('-created_date'),
    enabled: !!channels[0],
    staleTime: 3000
  });

  const channel = channels[0];
  const hasChannel = !!channel;

  const stats = React.useMemo(() => {
    if (!channel) return { avgViews: 0, totalLikes: 0, viralCount: 0 };
    return {
      avgViews: videos.length > 0 ? Math.floor(videos.reduce((sum, v) => sum + v.views, 0) / videos.length) : 0,
      totalLikes: videos.reduce((sum, v) => sum + v.likes, 0),
      viralCount: videos.filter(v => v.is_viral).length
    };
  }, [channel, videos]);

  const handleCreateChannel = async () => {
    await base44.entities.YouTubeChannel.create({
      servant_id: servant.id,
      channel_name: channelData.channel_name || `${servant.name}`,
      niche: channelData.niche,
      subscriber_count: 0,
      total_views: 0,
      watch_hours: 0,
      revenue: 0,
      reputation: 0,
      monetized: false,
      applied_for_monetization: false
    });

    await base44.entities.NightLog.create({
      entry: `${servant.name} started a YouTube channel: "${channelData.channel_name}". Let's see where this goes.`,
      category: 'interaction',
      intensity: 'moderate'
    });

    queryClient.invalidateQueries();
    setEditingChannel(false);
  };

  const handleApplyForMonetization = async () => {
    if (channel.subscriber_count < 1000 || channel.watch_hours < 4000) {
      alert(`Need 1,000 subs (${channel.subscriber_count}) & 4,000 watch hours (${channel.watch_hours})`);
      return;
    }

    await base44.entities.YouTubeChannel.update(channel.id, {
      applied_for_monetization: true,
      monetized: true
    });

    await base44.entities.NightLog.create({
      entry: `Applied for YouTube Partner Program. APPROVED! Channel is now monetized. Revenue will increase.`,
      category: 'interaction',
      intensity: 'significant'
    });

    queryClient.invalidateQueries();
  };

  const handleCreateVideo = async () => {
    if (!selectedCategory || !newVideo.content) return;
    setCreating(true);

    setTimeout(async () => {
      const isRisky = VIDEO_CATEGORIES[selectedCategory].risky || filmWithVampire;
      const baseViews = Math.floor(Math.random() * 5000) + 1000;
      const viralChance = isRisky ? 0.15 : 0.05;
      const isViral = Math.random() < viralChance;
      const views = isViral ? baseViews * (Math.floor(Math.random() * 20) + 10) : baseViews;
      const likes = Math.floor(views * (Math.random() * 0.15 + 0.05));
      const avgWatchTime = Math.random() * 6 + 4; // 4-10 min average watch time
      const watchHours = Math.floor((views * avgWatchTime) / 60);
      const cpm = channel.monetized ? (Math.random() * 3 + 2) : 0; // $2-5 CPM if monetized, $0 if not
      const earnings = Math.floor((views / 1000) * cpm);

      const video = await base44.entities.YouTubeVideo.create({
        channel_id: channel.id,
        title: newVideo.title || `${VIDEO_CATEGORIES[selectedCategory].label} Video`,
        category: selectedCategory,
        content_description: newVideo.content,
        views: views,
        likes: likes,
        earnings: earnings,
        is_viral: isViral,
        controversy_score: isRisky ? Math.floor(Math.random() * 40) + 30 : Math.floor(Math.random() * 20),
        featured_vampire: filmWithVampire
      });

      // Generate comments
      const numComments = Math.floor(views / 100);
      const commentPool = isViral ? [
        'This is INSANE', 'How does this only have X views??', 'Underrated af', 'Algorithm bless this',
        'Came from TikTok', 'Viral incoming', 'This needs to blow up', 'Why am I just finding this',
        'Bro this is wild', 'No way this is real', 'I can\'t stop watching', 'Subscribed immediately'
      ] : [
        'Great video!', 'Love your content', 'Keep it up', 'More please',
        'Subscribed', 'This is so good', 'Underrated', 'Amazing work'
      ];

      const suspiciousComments = filmWithVampire || selectedCategory === 'dark_content' ? [
        'Anyone else notice they never film during the day?', 
        'Why do they always avoid sunlight lol',
        'Something feels off about this...',
        'Are those contacts or...?',
        'Their partner never blinks. Weird.'
      ] : [];

      const usernamePool = ['NightOwl_47', 'DarkVibes', 'MidnightWatcher', 'ShadowFan', 'GothicSoul', 'VampLover', 'NocturnalLife', 'EternalNight'];
      
      for (let i = 0; i < Math.min(numComments, 8); i++) {
        const isSuspicious = suspiciousComments.length > 0 && Math.random() < 0.15;
        await base44.entities.YouTubeComment.create({
          video_id: video.id,
          username: usernamePool[Math.floor(Math.random() * usernamePool.length)],
          comment: isSuspicious 
            ? suspiciousComments[Math.floor(Math.random() * suspiciousComments.length)]
            : commentPool[Math.floor(Math.random() * commentPool.length)],
          is_suspicious: isSuspicious
        });
      }

      const newSubs = Math.floor(views * (Math.random() * 0.03 + 0.01));
      const repGain = isViral ? Math.floor(Math.random() * 20) + 15 : Math.floor(Math.random() * 8) + 3;

      await base44.entities.YouTubeChannel.update(channel.id, {
        subscriber_count: channel.subscriber_count + newSubs,
        total_views: (channel.total_views || 0) + views,
        watch_hours: (channel.watch_hours || 0) + watchHours,
        revenue: channel.revenue + earnings,
        reputation: Math.min(100, channel.reputation + repGain),
        verified: channel.subscriber_count + newSubs >= 100000,
        controversy_level: Math.min(100, channel.controversy_level + (isRisky ? 10 : 0))
      });

      if (filmWithVampire) {
        const relBonus = Math.floor(Math.random() * 10) + 8;
        await base44.entities.Servant.update(servant.id, {
          relationship: Math.min(100, (servant.relationship || 0) + relBonus)
        });
      }

      await base44.entities.NightLog.create({
        entry: `${servant.name} posted: "${newVideo.title}". ${views.toLocaleString()} views, ${likes.toLocaleString()} likes. ${isViral ? '🔥 WENT VIRAL! ' : ''}+${newSubs} subs${channel.monetized ? `. $${earnings} earned` : ' (not monetized yet)'}.`,
        category: 'interaction',
        intensity: isViral ? 'significant' : 'moderate'
      });

      queryClient.invalidateQueries();
      setCreating(false);
      setSelectedCategory(null);
      setNewVideo({ title: '', content: '' });
      setFilmWithVampire(false);
    }, 3000);
  };

  const handleLivestream = async () => {
    setStreaming(true);
    setStreamChat([]);

    const chatMessages = [
      'First!', 'Hi from Canada 🇨🇦', 'Love your streams', 'You look tired today', 'What time is it there?',
      'When do you sleep lol', 'Always streaming at night', 'Night owl gang', 'Do you ever see the sun?',
      'Your setup is sick', 'This is cozy', 'Love the vibes', 'Put me in the video!',
      'Shoutout please', 'Been watching for months', 'Your best stream yet', 'Chat is popping off'
    ];

    const usernames = ['NightWatcher_', 'GothKid420', 'DarkAesthetic', 'MidnightVibes', 'ShadowLurker', 'VampireHours'];

    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        setStreamChat(prev => [...prev.slice(-10), {
          username: usernames[Math.floor(Math.random() * usernames.length)] + Math.floor(Math.random() * 999),
          message: chatMessages[Math.floor(Math.random() * chatMessages.length)]
        }]);
      }, i * 1500);
    }

    setTimeout(async () => {
      const viewers = Math.floor(Math.random() * 500) + 100;
      const newSubs = Math.floor(Math.random() * 30) + 15;
      const earnings = Math.floor(Math.random() * 100) + 50;

      await base44.entities.YouTubeChannel.update(channel.id, {
        subscriber_count: channel.subscriber_count + newSubs,
        revenue: channel.revenue + earnings
      });

      await base44.entities.NightLog.create({
        entry: `Livestream complete. ${viewers} peak viewers. +${newSubs} subs. $${earnings} earned.`,
        category: 'interaction',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();
      setTimeout(() => {
        setStreaming(false);
        setStreamChat([]);
      }, 2000);
    }, 12000);
  };

  const handleSponsorship = async () => {
    const sponsors = [
      { name: 'NordVPN', pay: 500 },
      { name: 'Raid Shadow Legends', pay: 800 },
      { name: 'GFuel', pay: 300 },
      { name: 'HelloFresh', pay: 400 },
      { name: 'Skillshare', pay: 350 }
    ];

    const sponsor = sponsors[Math.floor(Math.random() * sponsors.length)];

    if (confirm(`${sponsor.name} wants to sponsor you for $${sponsor.pay}. Accept?`)) {
      await base44.entities.YouTubeChannel.update(channel.id, {
        revenue: channel.revenue + sponsor.pay
      });

      await base44.entities.NightLog.create({
        entry: `Sponsorship deal with ${sponsor.name}. Earned $${sponsor.pay}.`,
        category: 'interaction',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();
    }
  };

  const handleDramaEvent = async () => {
    const dramas = [
      { text: 'Another creator called you out for "suspicious behavior". Controversy brewing.', controversy: 15, subs: -20 },
      { text: 'Comments are theorizing you\'re a vampire. Viewers love the mystery. Going viral.', controversy: 20, subs: 200 },
      { text: 'Drama with another YouTuber. Views spiking from the attention.', controversy: 10, subs: 50 },
      { text: 'People noticed you never film during day. "Are you okay?" Concern spreading.', controversy: 25, subs: 100 }
    ];

    const drama = dramas[Math.floor(Math.random() * dramas.length)];

    await base44.entities.YouTubeChannel.update(channel.id, {
      controversy_level: Math.min(100, channel.controversy_level + drama.controversy),
      subscriber_count: Math.max(0, channel.subscriber_count + drama.subs)
    });

    await base44.entities.NightLog.create({
      entry: drama.text,
      category: 'interaction',
      intensity: 'significant'
    });

    queryClient.invalidateQueries();
  };

  const handleAlgorithmBoost = async (type) => {
    const boosts = {
      clickbait: { cost: 500, subs: Math.floor(Math.random() * 5000) + 3000, views: Math.floor(Math.random() * 50000) + 30000, text: 'Optimized titles and thumbnails. Algorithm loves it. Views exploding.' },
      trending: { cost: 1000, subs: Math.floor(Math.random() * 10000) + 8000, views: Math.floor(Math.random() * 100000) + 80000, text: 'Rode the trending wave. #1 on trending page. Channel blowing up.' },
      viral: { cost: 2000, subs: Math.floor(Math.random() * 25000) + 20000, views: Math.floor(Math.random() * 500000) + 300000, text: 'Video went MEGA VIRAL. Millions of views. Everyone knows your channel now.' },
      collab: { cost: 800, subs: Math.floor(Math.random() * 7000) + 5000, views: Math.floor(Math.random() * 70000) + 50000, text: 'Collaborated with massive creator. Their audience flooded your channel.' }
    };

    const boost = boosts[type];
    
    if (channel.revenue < boost.cost) {
      alert(`Need $${boost.cost} (have $${channel.revenue})`);
      return;
    }

    await base44.entities.YouTubeChannel.update(channel.id, {
      subscriber_count: channel.subscriber_count + boost.subs,
      total_views: channel.total_views + boost.views,
      revenue: channel.revenue - boost.cost + Math.floor(boost.views * 0.003),
      reputation: Math.min(100, channel.reputation + 20)
    });

    await base44.entities.NightLog.create({
      entry: `${boost.text} +${boost.subs.toLocaleString()} subs. +${boost.views.toLocaleString()} views.`,
      category: 'interaction',
      intensity: 'significant'
    });

    queryClient.invalidateQueries();
  };

  const handleMassUpload = async () => {
    if (channel.revenue < 1500) {
      alert('Need $1,500 to hire editors');
      return;
    }

    const numVideos = Math.floor(Math.random() * 3) + 5; // 5-7 videos
    let totalViews = 0;
    let totalSubs = 0;
    let totalEarnings = 0;

    for (let i = 0; i < numVideos; i++) {
      const views = Math.floor(Math.random() * 10000) + 5000;
      const subs = Math.floor(views * 0.02);
      const earnings = Math.floor(views * 0.003);
      
      totalViews += views;
      totalSubs += subs;
      totalEarnings += earnings;

      await base44.entities.YouTubeVideo.create({
        channel_id: channel.id,
        title: `Mass Upload Video ${i + 1}`,
        category: channel.niche,
        content_description: 'Part of mass upload strategy',
        views: views,
        likes: Math.floor(views * 0.08),
        earnings: earnings,
        is_viral: false,
        controversy_score: 0,
        featured_vampire: false
      });
    }

    await base44.entities.YouTubeChannel.update(channel.id, {
      subscriber_count: channel.subscriber_count + totalSubs,
      total_views: channel.total_views + totalViews,
      revenue: channel.revenue - 1500 + totalEarnings,
      reputation: Math.min(100, channel.reputation + 15)
    });

    await base44.entities.NightLog.create({
      entry: `Mass uploaded ${numVideos} videos. Hired editors. +${totalSubs.toLocaleString()} subs. +${totalViews.toLocaleString()} views. Dominating the algorithm.`,
      category: 'interaction',
      intensity: 'significant'
    });

    queryClient.invalidateQueries();
  };

  if (!hasChannel && !editingChannel) {
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
          className="bg-gradient-to-br from-red-600/20 to-gray-900 rounded-2xl p-8 max-w-md w-full text-center relative border-2 border-red-500/30"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>

          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-7xl mb-4"
          >
            📺
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-3">YouTube Career</h2>
          <p className="text-gray-400 mb-8">
            Build your channel. Dominate the algorithm. Rule YouTube.
          </p>

          <button
            onClick={() => setEditingChannel(true)}
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg"
          >
            Start Your Channel
          </button>
        </motion.div>
      </motion.div>
    );
  }

  if (editingChannel) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-900 rounded-2xl p-6 max-w-md w-full relative"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-2xl font-bold text-white mb-6">Create Your Channel</h2>

          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Channel Name</label>
              <input
                type="text"
                value={channelData.channel_name}
                onChange={(e) => setChannelData({...channelData, channel_name: e.target.value})}
                placeholder={servant.name}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-2 block">Channel Niche</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(VIDEO_CATEGORIES).filter(([k]) => !VIDEO_CATEGORIES[k].risky).slice(0, 8).map(([key, cat]) => (
                  <button
                    key={key}
                    onClick={() => setChannelData({...channelData, niche: key})}
                    className={`p-3 rounded-lg transition-colors ${
                      channelData.niche === key 
                        ? 'bg-gradient-to-br from-red-600 to-purple-600 text-white' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <div className="text-2xl mb-1">{cat.icon}</div>
                    <p className="text-xs">{cat.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreateChannel}
              className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all"
            >
              Launch Channel
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

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
        className="bg-gradient-to-b from-gray-900 to-black rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative border border-red-500/20"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <motion.div 
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl"
          >
            📺
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {channel.channel_name}
              {channel.verified && <Award className="w-5 h-5 text-blue-400" />}
            </h2>
            <p className="text-gray-400 text-sm capitalize">{channel.niche} content</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-red-950/30 rounded-lg p-3 border border-red-800/30">
            <Users className="w-5 h-5 text-red-400 mb-1" />
            <p className="text-white text-xl font-bold">{channel.subscriber_count.toLocaleString()}</p>
            <p className="text-gray-400 text-xs">Subscribers</p>
          </div>
          <div className="bg-blue-950/30 rounded-lg p-3 border border-blue-800/30">
            <Eye className="w-5 h-5 text-blue-400 mb-1" />
            <p className="text-white text-xl font-bold">{channel.total_views.toLocaleString()}</p>
            <p className="text-gray-400 text-xs">Total Views</p>
          </div>
          <div className="bg-green-950/30 rounded-lg p-3 border border-green-800/30">
            <DollarSign className="w-5 h-5 text-green-400 mb-1" />
            <p className="text-white text-xl font-bold">${channel.revenue}</p>
            <p className="text-gray-400 text-xs">Revenue</p>
          </div>
          <div className="bg-purple-950/30 rounded-lg p-3 border border-purple-800/30">
            <TrendingUp className="w-5 h-5 text-purple-400 mb-1" />
            <p className="text-white text-xl font-bold">{channel.reputation}/100</p>
            <p className="text-gray-400 text-xs">Reputation</p>
          </div>
          <div className="bg-orange-950/30 rounded-lg p-3 border border-orange-800/30">
            <Flame className="w-5 h-5 text-orange-400 mb-1" />
            <p className="text-white text-xl font-bold">{stats.viralCount}</p>
            <p className="text-gray-400 text-xs">Viral Videos</p>
          </div>
        </div>

        {/* Controversy Warning */}
        {channel.controversy_level > 50 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-orange-950/40 border border-orange-500/40 rounded-lg p-3 mb-4 flex items-center gap-2"
          >
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <p className="text-orange-300 text-sm">High controversy level ({channel.controversy_level}%) - People are getting suspicious...</p>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button onClick={() => setTab('create')} className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm ${tab === 'create' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            📹 Upload
          </button>
          <button onClick={() => setTab('videos')} className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm ${tab === 'videos' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            🎥 Videos ({videos.length})
          </button>
          <button onClick={() => setTab('livestream')} className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm ${tab === 'livestream' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            🔴 Livestream
          </button>
          <button onClick={() => setTab('algorithm')} className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm ${tab === 'algorithm' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            🚀 Algorithm
          </button>
          <button onClick={() => setTab('analytics')} className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm ${tab === 'analytics' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            📊 Analytics
          </button>
          <button onClick={() => setTab('monetize')} className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm ${tab === 'monetize' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            💰 Monetize
          </button>
        </div>

        {/* CREATE TAB */}
        {tab === 'create' && !selectedCategory && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            <h3 className="text-white text-xl font-bold mb-3">Select Video Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(VIDEO_CATEGORIES).map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-center transition-all ${
                    cat.risky ? 'border-2 border-orange-500/50' : ''
                  }`}
                >
                  <div className="text-4xl mb-2">{cat.icon}</div>
                  <h4 className="text-white font-medium text-sm">{cat.label}</h4>
                  {cat.risky && <p className="text-orange-400 text-xs mt-1">⚠️ Risky</p>}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === 'create' && selectedCategory && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            <button onClick={() => { setSelectedCategory(null); setNewVideo({ title: '', content: '' }); setFilmWithVampire(false); }} className="text-red-400 text-sm">
              ← Back
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">{VIDEO_CATEGORIES[selectedCategory].icon}</span>
              <h3 className="text-white text-xl font-bold">{VIDEO_CATEGORIES[selectedCategory].label}</h3>
            </div>

            <input
              type="text"
              value={newVideo.title}
              onChange={(e) => setNewVideo({...newVideo, title: e.target.value})}
              placeholder="Video title..."
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3"
            />

            <textarea
              value={newVideo.content}
              onChange={(e) => setNewVideo({...newVideo, content: e.target.value})}
              placeholder="What's in this video..."
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 h-24"
            />

            {VIDEO_CATEGORIES[selectedCategory].examples && (
              <details className="bg-gray-800/50 rounded-lg p-3">
                <summary className="text-purple-400 text-sm cursor-pointer">💡 Video Ideas</summary>
                <div className="grid gap-2 mt-2 max-h-32 overflow-y-auto">
                  {VIDEO_CATEGORIES[selectedCategory].examples.map(ex => (
                    <button
                      key={ex}
                      onClick={() => setNewVideo({...newVideo, content: ex})}
                      className="text-left text-xs text-gray-300 bg-gray-900 hover:bg-gray-700 px-3 py-2 rounded"
                    >
                      • {ex}
                    </button>
                  ))}
                </div>
              </details>
            )}

            <label className="flex items-center gap-2 text-gray-400 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={filmWithVampire}
                onChange={(e) => setFilmWithVampire(e.target.checked)}
                className="rounded"
              />
              Film with {vampireState.vampire_name} (risky - viewers might notice)
            </label>

            <button
              onClick={handleCreateVideo}
              disabled={!newVideo.content || creating}
              className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 text-white font-bold py-4 rounded-xl disabled:opacity-50"
            >
              {creating ? '⚡ Uploading...' : '📤 UPLOAD VIDEO'}
            </button>
          </div>
        )}

        {/* VIDEOS TAB */}
        {tab === 'videos' && (
          <div className="space-y-3 max-h-[55vh] overflow-y-auto">
            {videos.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No videos yet. Start creating!</p>
            ) : (
              videos.map(v => (
                <div key={v.id} className="bg-gray-800 rounded-xl p-4 hover:bg-gray-700 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1 flex items-center gap-2">
                        {v.title}
                        {v.is_viral && <Flame className="w-4 h-4 text-orange-400" />}
                      </h4>
                      <p className="text-gray-400 text-sm mb-2">{v.content_description}</p>
                      <div className="flex gap-3 text-xs flex-wrap">
                        <span className="text-blue-400 flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {v.views.toLocaleString()}
                        </span>
                        <span className="text-green-400 flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {v.likes.toLocaleString()}
                        </span>
                        <span className="text-green-400">${v.earnings}</span>
                        {v.featured_vampire && <span className="text-purple-400">🦇 Vampire featured</span>}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewingComments(v)}
                    className="w-full bg-gray-900 hover:bg-gray-700 text-gray-300 py-2 rounded-lg text-sm mt-2"
                  >
                    💬 View Comments
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* LIVESTREAM TAB */}
        {tab === 'livestream' && !streaming && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            <div className="bg-gradient-to-br from-red-950/40 to-pink-950/40 border-2 border-red-500/30 rounded-2xl p-8 text-center">
              <motion.div 
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-7xl mb-4"
              >
                🔴
              </motion.div>
              <h3 className="text-white text-2xl font-bold mb-2">Go Live</h3>
              <p className="text-gray-300 mb-6">Stream live. Interact with viewers. Build community.</p>
              
              <button
                onClick={handleLivestream}
                className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl"
              >
                START LIVESTREAM
              </button>
            </div>
          </div>
        )}

        {tab === 'livestream' && streaming && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            <div className="bg-gradient-to-br from-red-950/60 to-pink-950/60 border-2 border-red-500/50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-3 h-3 bg-red-500 rounded-full"
                />
                <span className="text-red-400 font-bold text-lg">LIVE NOW</span>
                <span className="text-gray-400 text-sm ml-auto">{Math.floor(Math.random() * 300) + 100} watching</span>
              </div>
              
              <div className="bg-black/60 rounded-xl p-3 h-64 overflow-y-auto space-y-2">
                {streamChat.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm"
                  >
                    <span className="text-red-400 font-medium">{msg.username}:</span>
                    <span className="text-gray-300 ml-2">{msg.message}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ALGORITHM TAB */}
        {tab === 'algorithm' && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            <div className="bg-gradient-to-br from-purple-950/40 to-pink-950/40 border-2 border-purple-500/30 rounded-2xl p-6 text-center mb-4">
              <motion.div 
                animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-6xl mb-3"
              >
                🚀
              </motion.div>
              <h3 className="text-white text-2xl font-bold mb-2">RULE THE ALGORITHM</h3>
              <p className="text-purple-300 text-sm">Explode your growth. Dominate YouTube.</p>
            </div>

            <button
              onClick={() => handleAlgorithmBoost('clickbait')}
              disabled={channel.revenue < 500}
              className="w-full bg-gradient-to-br from-orange-950/40 to-red-950/40 border-2 border-orange-500/30 hover:border-orange-500/50 rounded-xl p-6 text-left transition-all disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">📢</span>
                  <div>
                    <h4 className="text-white font-bold mb-1">Clickbait Mastery</h4>
                    <p className="text-gray-400 text-sm">Optimize titles & thumbnails. Algorithm boost.</p>
                    <p className="text-orange-400 text-xs mt-1">+3-8k subs, +30-80k views</p>
                  </div>
                </div>
                <span className="text-green-400 font-bold">$500</span>
              </div>
            </button>

            <button
              onClick={() => handleAlgorithmBoost('trending')}
              disabled={channel.revenue < 1000}
              className="w-full bg-gradient-to-br from-red-950/40 to-pink-950/40 border-2 border-red-500/30 hover:border-red-500/50 rounded-xl p-6 text-left transition-all disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">📈</span>
                  <div>
                    <h4 className="text-white font-bold mb-1">Hit Trending Page</h4>
                    <p className="text-gray-400 text-sm">Get on #1 trending. Massive exposure.</p>
                    <p className="text-red-400 text-xs mt-1">+8-18k subs, +80-180k views</p>
                  </div>
                </div>
                <span className="text-green-400 font-bold">$1,000</span>
              </div>
            </button>

            <button
              onClick={() => handleAlgorithmBoost('viral')}
              disabled={channel.revenue < 2000}
              className="w-full bg-gradient-to-br from-purple-950/40 to-blue-950/40 border-2 border-purple-500/30 hover:border-purple-500/50 rounded-xl p-6 text-left transition-all disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">💥</span>
                  <div>
                    <h4 className="text-white font-bold mb-1 flex items-center gap-2">
                      MEGA VIRAL
                      <Flame className="w-5 h-5 text-orange-400" />
                    </h4>
                    <p className="text-gray-400 text-sm">Force a video to go MEGA viral. Millions of views.</p>
                    <p className="text-purple-400 text-xs mt-1">+20-45k subs, +300k-800k views</p>
                  </div>
                </div>
                <span className="text-green-400 font-bold">$2,000</span>
              </div>
            </button>

            <button
              onClick={() => handleAlgorithmBoost('collab')}
              disabled={channel.revenue < 800}
              className="w-full bg-gradient-to-br from-blue-950/40 to-cyan-950/40 border-2 border-blue-500/30 hover:border-blue-500/50 rounded-xl p-6 text-left transition-all disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">🤝</span>
                  <div>
                    <h4 className="text-white font-bold mb-1">Big Creator Collab</h4>
                    <p className="text-gray-400 text-sm">Collab with massive YouTuber. Steal their audience.</p>
                    <p className="text-blue-400 text-xs mt-1">+5-12k subs, +50-120k views</p>
                  </div>
                </div>
                <span className="text-green-400 font-bold">$800</span>
              </div>
            </button>

            <button
              onClick={handleMassUpload}
              disabled={channel.revenue < 1500}
              className="w-full bg-gradient-to-br from-yellow-950/40 to-orange-950/40 border-2 border-yellow-500/30 hover:border-yellow-500/50 rounded-xl p-6 text-left transition-all disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">⚡</span>
                  <div>
                    <h4 className="text-white font-bold mb-1">Mass Upload Campaign</h4>
                    <p className="text-gray-400 text-sm">Hire editors. Upload 5-7 videos at once. Flood the algorithm.</p>
                    <p className="text-yellow-400 text-xs mt-1">Instant growth spike</p>
                  </div>
                </div>
                <span className="text-green-400 font-bold">$1,500</span>
              </div>
            </button>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {tab === 'analytics' && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            <div className="bg-gray-800 rounded-xl p-4">
              <h3 className="text-white font-bold mb-3">Channel Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Views/Video</span>
                  <span className="text-white font-bold">{stats.avgViews.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Likes</span>
                  <span className="text-white font-bold">{stats.totalLikes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Viral Success Rate</span>
                  <span className="text-white font-bold">
                    {videos.length > 0 ? Math.floor((stats.viralCount / videos.length) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Controversy Level</span>
                  <span className={`font-bold ${
                    channel.controversy_level > 70 ? 'text-red-400' :
                    channel.controversy_level > 40 ? 'text-orange-400' :
                    'text-green-400'
                  }`}>
                    {channel.controversy_level}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MONETIZE TAB */}
        {tab === 'monetize' && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            {!channel.monetized && !channel.applied_for_monetization && (
              <div className="bg-gradient-to-br from-green-950/40 to-emerald-950/40 border-2 border-green-500/30 rounded-2xl p-6">
                <h3 className="text-white text-xl font-bold mb-3 flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-green-400" />
                  YouTube Partner Program
                </h3>
                <p className="text-gray-400 text-sm mb-4">Get monetized. Earn from ads.</p>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Subscribers</span>
                    <span className={`font-bold ${channel.subscriber_count >= 1000 ? 'text-green-400' : 'text-orange-400'}`}>
                      {channel.subscriber_count.toLocaleString()} / 1,000
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                      style={{ width: `${Math.min((channel.subscriber_count / 1000) * 100, 100)}%` }}
                      className="h-2 rounded-full bg-gradient-to-r from-green-600 to-emerald-500"
                    />
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-gray-400 text-sm">Watch Hours</span>
                    <span className={`font-bold ${(channel.watch_hours || 0) >= 4000 ? 'text-green-400' : 'text-orange-400'}`}>
                      {(channel.watch_hours || 0).toLocaleString()} / 4,000
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                      style={{ width: `${Math.min(((channel.watch_hours || 0) / 4000) * 100, 100)}%` }}
                      className="h-2 rounded-full bg-gradient-to-r from-green-600 to-emerald-500"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleApplyForMonetization}
                  disabled={channel.subscriber_count < 1000 || (channel.watch_hours || 0) < 4000}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-700 disabled:to-gray-700 text-white font-bold py-4 rounded-xl disabled:opacity-50"
                >
                  {channel.subscriber_count >= 1000 && (channel.watch_hours || 0) >= 4000
                    ? 'APPLY FOR MONETIZATION'
                    : 'Requirements Not Met'}
                </button>
              </div>
            )}

            {channel.monetized && (
              <div className="bg-gradient-to-br from-green-950/40 to-emerald-950/40 border-2 border-green-500/30 rounded-2xl p-6 mb-4">
                <div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-5xl mb-3"
                  >
                    ✅
                  </motion.div>
                  <h3 className="text-white text-xl font-bold mb-2">MONETIZED</h3>
                  <p className="text-green-400 text-sm">Earning from ads on all videos</p>
                </div>
              </div>
            )}

            <button
              onClick={handleSponsorship}
              disabled={channel.subscriber_count < 10000}
              className="w-full bg-gradient-to-br from-purple-950/40 to-pink-950/40 border-2 border-purple-500/30 hover:border-purple-500/50 rounded-xl p-6 text-left transition-all disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-purple-400" />
                <div>
                  <h4 className="text-white font-bold mb-1">Get Sponsorship</h4>
                  <p className="text-gray-400 text-sm">
                    {channel.subscriber_count >= 10000 
                      ? 'Brands want to work with you!' 
                      : `Need 10k subs (${channel.subscriber_count.toLocaleString()}/10,000)`}
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={handleDramaEvent}
              disabled={channel.subscriber_count < 5000}
              className="w-full bg-gradient-to-br from-orange-950/40 to-red-950/40 border-2 border-orange-500/30 hover:border-orange-500/50 rounded-xl p-6 text-left transition-all disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <Flame className="w-8 h-8 text-orange-400" />
                <div>
                  <h4 className="text-white font-bold mb-1">Trigger Drama Event</h4>
                  <p className="text-gray-400 text-sm">
                    {channel.subscriber_count >= 5000 
                      ? 'Controversy = views. Risky but effective.' 
                      : `Need 5k subs (${channel.subscriber_count.toLocaleString()}/5,000)`}
                  </p>
                </div>
              </div>
            </button>

            {channel.monetized && (
              <div className="bg-gray-800 rounded-xl p-4">
                <h4 className="text-white font-medium mb-2">Revenue Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ad Revenue</span>
                    <span className="text-green-400">${Math.floor(channel.revenue * 0.7)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sponsorships</span>
                    <span className="text-green-400">${Math.floor(channel.revenue * 0.3)}</span>
                  </div>
                  <div className="border-t border-gray-700 pt-2 flex justify-between font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-green-400">${channel.revenue}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Comments Modal */}
        <AnimatePresence>
          {viewingComments && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
              onClick={() => setViewingComments(null)}
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-900 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              >
                <h3 className="text-white text-xl font-bold mb-4">{viewingComments.title}</h3>
                
                <div className="space-y-3">
                  {allComments
                    .filter(c => c.video_id === viewingComments.id)
                    .map(comment => (
                      <div 
                        key={comment.id} 
                        className={`rounded-lg p-3 ${
                          comment.is_suspicious ? 'bg-orange-900/30 border border-orange-500/30' : 'bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-red-400 font-medium text-sm">{comment.username}</span>
                          {comment.is_suspicious && <AlertTriangle className="w-4 h-4 text-orange-400" />}
                        </div>
                        <p className="text-gray-300 text-sm">{comment.comment}</p>
                      </div>
                    ))}
                </div>
                
                <button 
                  onClick={() => setViewingComments(null)} 
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl mt-4"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Overlay */}
        <AnimatePresence>
          {creating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="text-7xl"
              >
                📺
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}