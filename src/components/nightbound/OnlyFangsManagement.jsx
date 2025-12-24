import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Video, DollarSign, Users, TrendingUp, Eye, Star, Camera, Lock, Unlock, Percent } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const VIDEO_CATEGORIES = {
  couple: { label: 'Couple', icon: '💑', examples: ['Making love together', 'Vampire takes their servant', 'Passionate kissing', 'Riding my vampire', 'Our morning routine', 'Shower together'] },
  filmed: { label: 'Filmed by Partner', icon: '🎥', examples: ['They film me touching myself', 'Stripping for the camera', 'Playing while they watch', 'Teasing for their lens', 'Solo but not alone'] },
  solo: { label: 'Solo', icon: '💋', examples: ['Touching myself thinking of you', 'Undressing slowly', 'Playing with toys', 'Morning routine', 'Bath time fun'] },
  pov: { label: 'POV', icon: '👁️', examples: ['Your view while I ride you', 'On my knees for you', 'Waking up together', 'Between my legs', 'Facesitting POV'] },
  roleplay: { label: 'Roleplay', icon: '🎭', examples: ['Vampire seduction', 'Your obedient servant', 'Master and pet', 'Forbidden encounter', 'Dark ritual'] },
  teasing: { label: 'Teasing', icon: '😈', examples: ['Strip tease', 'Almost showing everything', 'Teasing touches', 'Denial game', 'Edge play'] },
  intimate: { label: 'Intimate', icon: '💖', examples: ['Making love to camera', 'Passionate moaning', 'Multiple orgasms', 'Intimate closeups', 'Sensual touches'] },
  dominant: { label: 'Dominant', icon: '👑', examples: ['Ordering you around', 'Making you beg', 'Degradation', 'You\'re mine', 'Punishment time'] },
  submissive: { label: 'Submissive', icon: '🙇', examples: ['On my knees', 'Please use me', 'Your obedient toy', 'Taking orders', 'Begging for you'] },
  cosplay: { label: 'Cosplay', icon: '🦇', examples: ['Gothic vampire', 'Dark angel', 'Succubus', 'Witch', 'Leather & lace'] },
  shower: { label: 'Shower', icon: '🚿', examples: ['Wet and soapy', 'Shower masturbation', 'Getting clean, getting dirty', 'Under the water', 'Steamy shower'] },
  bedroom: { label: 'Bedroom', icon: '🛏️', examples: ['Morning in bed', 'Pillow humping', 'Sheets and moans', 'Late night session', 'Bedroom secrets'] },
  public: { label: 'Public Risk', icon: '🌙', examples: ['In the car', 'Risky location', 'Almost caught', 'Public teasing', 'Outdoor adventure'] },
  fetish: { label: 'Fetish', icon: '⛓️', examples: ['Feet worship', 'Bondage', 'Latex & leather', 'Worship me', 'Collar & leash'] },
  artistic: { label: 'Artistic', icon: '🎨', examples: ['Sensual dance', 'Body art', 'Shadow play', 'Aesthetic nudity', 'Artistic poses'] }
};

export default function OnlyFangsManagement({ servant, vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('profile');
  const [creating, setCreating] = useState(false);
  const [filming, setFilming] = useState(false);
  const [filmingOutcome, setFilmingOutcome] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filmWithVampire, setFilmWithVampire] = useState(null);
  const [newVideo, setNewVideo] = useState({ title: '', content_type: '', price: 15 });
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ username: '', bio: '', profile_pic: '🦇', is_couple: true });
  const [livestreaming, setLivestreaming] = useState(false);
  const [livestreamOutcome, setLivestreamOutcome] = useState('');

  const { data: profile = [] } = useQuery({
    queryKey: ['onlyfangs-profile', servant.id],
    queryFn: () => base44.entities.OnlyFangsProfile.filter({ servant_id: servant.id })
  });

  const { data: videos = [] } = useQuery({
    queryKey: ['onlyfangs-videos', servant.id],
    queryFn: () => base44.entities.OnlyFangsVideo.filter({ servant_id: servant.id }, '-created_date')
  });

  const servantProfile = profile[0];
  const hasProfile = !!servantProfile;

  const handleCreateProfile = async () => {
    await base44.entities.OnlyFangsProfile.create({
      servant_id: servant.id,
      username: profileData.username || `${servant.name}_vamp`,
      bio: profileData.bio || (profileData.is_couple ? `Vampire and their devoted servant. Watch us together. 🌙🦇` : `Solo content creator. Dark, sensual, yours. 🌙`),
      profile_pic: profileData.profile_pic,
      is_couple_account: profileData.is_couple,
      subscriber_count: 0,
      revenue: 0,
      reputation: 0
    });

    await base44.entities.NightLog.create({
      entry: `You and ${servant.name} created a couples OnlyFangs account. The night just got more interesting.`,
      category: 'interaction',
      intensity: 'moderate'
    });

    queryClient.invalidateQueries(['onlyfangs-profile']);
    setEditingProfile(false);
  };

  const handleQuit = async () => {
    if (!confirm(`Quit OnlyFangs? You can always come back later.`)) return;
    
    const career = await base44.entities.ServantCareer.filter({ servant_id: servant.id });
    if (career[0]) {
      await base44.entities.ServantCareer.update(career[0].id, {
        onlyfangs_active: false
      });
    }
    
    await base44.entities.NightLog.create({
      entry: `${servant.name} decided to take a break from OnlyFangs. Maybe they'll come back.`,
      category: 'interaction',
      intensity: 'subtle'
    });
    
    queryClient.invalidateQueries();
    onClose();
  };

  const handleCreateVideo = async () => {
    if (!selectedCategory || !newVideo.content_type) return;
    if (filmWithVampire === null && ['filmed', 'couple'].includes(selectedCategory)) return;
    
    const isFilmedCategory = ['filmed', 'couple'].includes(selectedCategory);
    const withVampire = filmWithVampire === true;
    
    if (isFilmedCategory && withVampire) {
      setFilming(true);
      
      const filmingOutcomes = [
        'You held the camera. Watched them perform. Got hard watching. Had to put the camera down and join.',
        'Behind the lens. Filming them. They looked at you with those eyes. You couldn\'t resist anymore.',
        'You directed them. "Touch yourself there." They obeyed. You were aching by the end.',
        'Filming them strip. Your hands shaking. They noticed. "Want to be in the video too?"',
        'You watched through the camera. So fucking beautiful. Had to stop filming to touch them.',
        'Behind the camera, watching them pleasure themselves. You were rock hard. They saw. Smiled.',
        'Filming session became a fucking session. The camera kept rolling. Better content anyway.',
        'You tried to stay professional. Failed completely. Ended up making couple content instead.'
      ];
      
      const outcome = filmingOutcomes[Math.floor(Math.random() * filmingOutcomes.length)];
      setFilmingOutcome(outcome);
      
      setTimeout(async () => {
        const video = await base44.entities.OnlyFangsVideo.create({
          servant_id: servant.id,
          title: newVideo.title || `${VIDEO_CATEGORIES[selectedCategory].label} Content`,
          category: selectedCategory,
          content_type: newVideo.content_type,
          price: newVideo.price,
          views: 0,
          earnings: 0,
          rating: 0
        });

        // Higher earnings for couple/filmed content
        const initialViews = Math.floor(Math.random() * 80) + 30;
        const purchases = Math.floor(initialViews * (Math.random() * 0.4 + 0.2));
        const earnings = purchases * newVideo.price;

        await base44.entities.OnlyFangsVideo.update(video.id, {
          views: initialViews,
          earnings: earnings,
          rating: Math.random() * 1.5 + 3.5
        });

        // Update profile
        const newRevenue = servantProfile.revenue + earnings;
        const newSubs = servantProfile.subscriber_count + Math.floor(Math.random() * 15) + 5;
        const newRep = Math.min(100, servantProfile.reputation + Math.floor(Math.random() * 8) + 5);

        await base44.entities.OnlyFangsProfile.update(servantProfile.id, {
          revenue: newRevenue,
          subscriber_count: newSubs,
          reputation: newRep
        });

        // Increase relationship
        const relBonus = Math.floor(Math.random() * 10) + 10;
        await base44.entities.Servant.update(servant.id, {
          relationship: Math.min(100, (servant.relationship || 0) + relBonus)
        });

        await base44.entities.NightLog.create({
          entry: outcome,
          category: 'interaction',
          intensity: 'significant'
        });

        queryClient.invalidateQueries();
        
        setTimeout(() => {
          setFilming(false);
          setFilmingOutcome('');
          setCreating(false);
          setSelectedCategory(null);
          setFilmWithVampire(null);
          setNewVideo({ title: '', content_type: '', price: 15 });
        }, 4000);
      }, 3000);
    } else if (isFilmedCategory && !withVampire) {
      // Filming alone
      setCreating(true);
      
      setTimeout(async () => {
        const video = await base44.entities.OnlyFangsVideo.create({
          servant_id: servant.id,
          title: newVideo.title || `${VIDEO_CATEGORIES[selectedCategory].label} Content`,
          category: selectedCategory,
          content_type: newVideo.content_type,
          price: newVideo.price,
          views: 0,
          earnings: 0,
          rating: 0
        });

        const initialViews = Math.floor(Math.random() * 60) + 20;
        const purchases = Math.floor(initialViews * (Math.random() * 0.35 + 0.15));
        const earnings = purchases * newVideo.price;

        await base44.entities.OnlyFangsVideo.update(video.id, {
          views: initialViews,
          earnings: earnings,
          rating: Math.random() * 1.8 + 3.2
        });

        const newRevenue = servantProfile.revenue + earnings;
        const newSubs = servantProfile.subscriber_count + Math.floor(Math.random() * 12) + 3;
        const newRep = Math.min(100, servantProfile.reputation + Math.floor(Math.random() * 6) + 3);

        await base44.entities.OnlyFangsProfile.update(servantProfile.id, {
          revenue: newRevenue,
          subscriber_count: newSubs,
          reputation: newRep
        });

        await base44.entities.NightLog.create({
          entry: `${servant.name} filmed solo content: "${newVideo.content_type}". Earned $${earnings}.`,
          category: 'interaction',
          intensity: 'moderate'
        });

        queryClient.invalidateQueries();
        setCreating(false);
        setSelectedCategory(null);
        setFilmWithVampire(null);
        setNewVideo({ title: '', content_type: '', price: 15 });
      }, 2500);
    } else {
      setCreating(true);
      
      setTimeout(async () => {
        const video = await base44.entities.OnlyFangsVideo.create({
          servant_id: servant.id,
          title: newVideo.title || `${VIDEO_CATEGORIES[selectedCategory].label} Content`,
          category: selectedCategory,
          content_type: newVideo.content_type,
          price: newVideo.price,
          views: 0,
          earnings: 0,
          rating: 0
        });

        const initialViews = Math.floor(Math.random() * 50) + 10;
        const purchases = Math.floor(initialViews * (Math.random() * 0.3 + 0.1));
        const earnings = purchases * newVideo.price;

        await base44.entities.OnlyFangsVideo.update(video.id, {
          views: initialViews,
          earnings: earnings,
          rating: Math.random() * 2 + 3
        });

        const newRevenue = servantProfile.revenue + earnings;
        const newSubs = servantProfile.subscriber_count + Math.floor(Math.random() * 10);
        const newRep = Math.min(100, servantProfile.reputation + Math.floor(Math.random() * 5) + 2);

        await base44.entities.OnlyFangsProfile.update(servantProfile.id, {
          revenue: newRevenue,
          subscriber_count: newSubs,
          reputation: newRep
        });

        await base44.entities.NightLog.create({
          entry: `${servant.name} posted new content: "${newVideo.content_type}". Earned $${earnings}.`,
          category: 'interaction',
          intensity: 'moderate'
        });

        queryClient.invalidateQueries();
        setCreating(false);
        setSelectedCategory(null);
        setFilmWithVampire(null);
        setNewVideo({ title: '', content_type: '', price: 15 });
      }, 2500);
    }
  };

  const handleSetDiscount = async (videoId, discount, hours) => {
    const video = videos.find(v => v.id === videoId);
    const discountedPrice = Math.floor(video.price * (1 - discount));
    const discountUntil = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

    await base44.entities.OnlyFangsVideo.update(videoId, {
      discounted_price: discountedPrice,
      discount_until: discountUntil
    });

    queryClient.invalidateQueries(['onlyfangs-videos']);
  };

  const handleMakeFree = async (videoId) => {
    await base44.entities.OnlyFangsVideo.update(videoId, {
      price: 0,
      discounted_price: 0
    });
    queryClient.invalidateQueries(['onlyfangs-videos']);
  };

  const handleLivestream = async (withVampire) => {
    setLivestreaming(true);
    
    const soloOutcomes = [
      'You went live. Touching yourself. Moaning. Viewers flooded in. Tips pouring. You came on camera.',
      'Livestream started. You stripped slowly. Chat went wild. Made $200 in tips in one hour.',
      'Live and exposed. You showed everything. Did exactly what they asked. They loved it.',
      'You performed live. No editing. No retakes. Raw and real. Subscribers doubled.',
      'Livestream session. You touched yourself thinking of them watching. Came hard. Perfect.',
    ];
    
    const coupleOutcomes = [
      'You went live together. They watched you fuck in real-time. Chat exploded. Tips everywhere.',
      'Live sex show. You and your vampire. Unscripted. Passionate. Made $500 in tips.',
      'Livestream turned into breeding session. Everyone watched you get filled. Subscribers went crazy.',
      'You both performed live. Fucking. Moaning. Real orgasms. Chat begging for more.',
      'Live together. They dominated you on camera. You took it. Loved it. Viewers obsessed.',
      'Went live. Started innocent. Ended with you screaming their name. Best stream yet.',
    ];
    
    const outcome = withVampire ? coupleOutcomes[Math.floor(Math.random() * coupleOutcomes.length)] : soloOutcomes[Math.floor(Math.random() * soloOutcomes.length)];
    setLivestreamOutcome(outcome);
    
    setTimeout(async () => {
      const earnings = withVampire ? Math.floor(Math.random() * 400) + 200 : Math.floor(Math.random() * 200) + 100;
      const newSubs = withVampire ? Math.floor(Math.random() * 30) + 20 : Math.floor(Math.random() * 20) + 10;
      const repGain = withVampire ? Math.floor(Math.random() * 15) + 10 : Math.floor(Math.random() * 10) + 5;
      
      await base44.entities.OnlyFangsProfile.update(servantProfile.id, {
        revenue: servantProfile.revenue + earnings,
        subscriber_count: servantProfile.subscriber_count + newSubs,
        reputation: Math.min(100, servantProfile.reputation + repGain)
      });
      
      if (withVampire) {
        const relBonus = Math.floor(Math.random() * 15) + 15;
        await base44.entities.Servant.update(servant.id, {
          relationship: Math.min(100, (servant.relationship || 0) + relBonus)
        });
      }
      
      await base44.entities.NightLog.create({
        entry: outcome,
        category: 'interaction',
        intensity: 'significant'
      });
      
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        setLivestreaming(false);
        setLivestreamOutcome('');
      }, 4000);
    }, 3500);
  };

  if (!hasProfile && !editingProfile) {
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
          className="bg-gray-900 rounded-2xl p-6 max-w-md w-full text-center"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>

          <div className="text-6xl mb-4">🔥</div>
          <h2 className="text-2xl font-bold text-white mb-2">OnlyFangs</h2>
          <p className="text-gray-400 mb-6">
            Create adult content. Build an audience. Earn while you sleep. The night is yours.
          </p>

          <button
            onClick={() => setEditingProfile(true)}
            className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-medium py-3 rounded-xl transition-all"
          >
            Create Profile
          </button>
        </motion.div>
      </motion.div>
    );
  }

  if (editingProfile) {
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
          className="bg-gray-900 rounded-2xl p-6 max-w-md w-full"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-2xl font-bold text-white mb-6">Set Up Profile</h2>

          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm">Username</label>
              <input
                type="text"
                value={profileData.username}
                onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                placeholder={`${servant.name}_vamp`}
                className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 mt-1"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm">Bio</label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                placeholder="Tell them what makes you special..."
                className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 mt-1 h-20"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm">Account Type</label>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => setProfileData({...profileData, is_couple: true})}
                  className={`flex-1 py-3 rounded-lg transition-colors ${profileData.is_couple ? 'bg-gradient-to-r from-pink-600 to-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                >
                  💑 Couple Account
                </button>
                <button
                  onClick={() => setProfileData({...profileData, is_couple: false})}
                  className={`flex-1 py-3 rounded-lg transition-colors ${!profileData.is_couple ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                >
                  💋 Solo Account
                </button>
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-sm">Profile Picture (emoji)</label>
              <div className="flex gap-2 mt-1">
                {['🦇', '💋', '🌙', '🖤', '😈', '🔥', '💜', '🌹'].map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setProfileData({...profileData, profile_pic: emoji})}
                    className={`text-3xl p-2 rounded-lg ${profileData.profile_pic === emoji ? 'bg-purple-600' : 'bg-gray-800'}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreateProfile}
              className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-medium py-3 rounded-xl transition-all"
            >
              Create Profile
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
        className="bg-gray-900 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">{servantProfile.profile_pic}</span>
          <div>
            <h2 className="text-2xl font-bold text-white">OnlyFangs</h2>
            <p className="text-gray-400 text-sm">@{servantProfile.username}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-purple-950/30 rounded-lg p-3 border border-purple-800/30">
            <Users className="w-5 h-5 text-purple-400 mb-1" />
            <p className="text-white text-xl font-bold">{servantProfile.subscriber_count}</p>
            <p className="text-gray-400 text-xs">Subscribers</p>
          </div>
          <div className="bg-green-950/30 rounded-lg p-3 border border-green-800/30">
            <DollarSign className="w-5 h-5 text-green-400 mb-1" />
            <p className="text-white text-xl font-bold">${servantProfile.revenue}</p>
            <p className="text-gray-400 text-xs">Total Revenue</p>
          </div>
          <div className="bg-blue-950/30 rounded-lg p-3 border border-blue-800/30">
            <Video className="w-5 h-5 text-blue-400 mb-1" />
            <p className="text-white text-xl font-bold">{videos.length}</p>
            <p className="text-gray-400 text-xs">Videos</p>
          </div>
          <div className="bg-red-950/30 rounded-lg p-3 border border-red-800/30">
            <TrendingUp className="w-5 h-5 text-red-400 mb-1" />
            <p className="text-white text-xl font-bold">{servantProfile.reputation}/100</p>
            <p className="text-gray-400 text-xs">Reputation</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setTab('profile')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${tab === 'profile' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            Profile
          </button>
          <button
            onClick={() => setTab('livestream')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-1 ${tab === 'livestream' ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            <span className="text-red-400">🔴</span> Go Live
          </button>
          <button
            onClick={() => setTab('create')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${tab === 'create' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            Create Content
          </button>
          <button
            onClick={() => setTab('videos')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${tab === 'videos' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            My Videos
          </button>
        </div>

        {/* Tab Content */}
        {tab === 'profile' && (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-xl p-4">
              <h3 className="text-white font-medium mb-2">Account Type</h3>
              <p className="text-gray-300">{servantProfile.is_couple_account ? '💑 Couple Account' : '💋 Solo Account'}</p>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-4">
              <h3 className="text-white font-medium mb-2">Bio</h3>
              <p className="text-gray-300">{servantProfile.bio}</p>
            </div>
            
            <button
              onClick={handleQuit}
              className="w-full bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 rounded-xl py-3 transition-colors"
            >
              Quit OnlyFangs
            </button>
          </div>
        )}

        {tab === 'livestream' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-red-950/40 to-pink-950/40 border-2 border-red-500/30 rounded-2xl p-6 text-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                🔴
              </motion.div>
              <h3 className="text-white text-2xl font-bold mb-2">Start Livestream</h3>
              <p className="text-gray-300 mb-6">
                Live. Unscripted. Raw. Your audience watching in real-time.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => handleLivestream(false)}
                  disabled={livestreaming}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 text-white font-medium py-4 rounded-xl transition-all disabled:opacity-50"
                >
                  {livestreaming ? 'Live...' : 'Go Live Solo 💋'}
                </button>
                {servantProfile.is_couple_account && (
                  <button
                    onClick={() => handleLivestream(true)}
                    disabled={livestreaming}
                    className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 text-white font-medium py-4 rounded-xl transition-all disabled:opacity-50"
                  >
                    {livestreaming ? 'Live...' : 'Go Live Together 💑'}
                  </button>
                )}
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/20">
              <h4 className="text-purple-400 font-medium mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Livestream Tips
              </h4>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• Higher earnings than regular videos</li>
                <li>• Direct interaction with fans</li>
                <li>• Tips pour in during the stream</li>
                <li>• Couple streams earn 2x more</li>
                <li>• Massive subscriber growth</li>
              </ul>
            </div>
          </div>
        )}

        {tab === 'create' && (
          <div className="space-y-4">
            {!selectedCategory ? (
              <>
                <h3 className="text-white font-bold mb-3">Choose Content Category</h3>
                <div className="grid md:grid-cols-3 gap-3">
                  {Object.entries(VIDEO_CATEGORIES).map(([key, cat]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
                    >
                      <div className="text-3xl mb-2">{cat.icon}</div>
                      <h4 className="text-white font-medium">{cat.label}</h4>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-gray-400 hover:text-white text-sm mb-4"
                >
                  ← Back to categories
                </button>

                <h3 className="text-white font-bold mb-3">
                  {VIDEO_CATEGORIES[selectedCategory].icon} {VIDEO_CATEGORIES[selectedCategory].label} Content
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-gray-400 text-sm">Content Description</label>
                    <select
                      value={newVideo.content_type}
                      onChange={(e) => setNewVideo({...newVideo, content_type: e.target.value})}
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 mt-1"
                    >
                      <option value="">Choose what to create...</option>
                      {VIDEO_CATEGORIES[selectedCategory].examples.map(ex => (
                        <option key={ex} value={ex}>{ex}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm">Custom Title (optional)</label>
                    <input
                      type="text"
                      value={newVideo.title}
                      onChange={(e) => setNewVideo({...newVideo, title: e.target.value})}
                      placeholder="Leave blank for auto-title"
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm">Price ($)</label>
                    <div className="flex gap-2 mt-1">
                      {[0, 5, 10, 15, 25, 50].map(price => (
                        <button
                          key={price}
                          onClick={() => setNewVideo({...newVideo, price})}
                          className={`px-4 py-2 rounded-lg ${newVideo.price === price ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                        >
                          {price === 0 ? 'Free' : `$${price}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {['filmed', 'couple'].includes(selectedCategory) && filmWithVampire === null && (
                    <div className="space-y-2 mb-4">
                      <label className="text-gray-400 text-sm">Who's filming?</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setFilmWithVampire(false)}
                          className="flex-1 bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-lg py-3 text-white transition-colors"
                        >
                          Film Alone
                        </button>
                        <button
                          onClick={() => setFilmWithVampire(true)}
                          className="flex-1 bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 rounded-lg py-3 text-white transition-colors"
                        >
                          Film With Vampire 🔥
                        </button>
                      </div>
                    </div>
                  )}

                  {filmWithVampire !== null && ['filmed', 'couple'].includes(selectedCategory) && (
                    <button
                      onClick={() => setFilmWithVampire(null)}
                      className="w-full bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm py-2 rounded-lg mb-2"
                    >
                      ← Change filming choice
                    </button>
                  )}

                  <button
                    onClick={handleCreateVideo}
                    disabled={!newVideo.content_type || creating || filming || (['filmed', 'couple'].includes(selectedCategory) && filmWithVampire === null)}
                    className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50"
                  >
                    {filming ? 'Filming...' : creating ? 'Processing...' : 'Create Video'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'videos' && (
          <div className="space-y-3">
            {videos.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No videos yet. Time to create some content!</p>
            ) : (
              videos.map(video => {
                const hasDiscount = video.discount_until && new Date(video.discount_until) > new Date();
                const currentPrice = hasDiscount ? video.discounted_price : video.price;
                const isFree = currentPrice === 0;

                return (
                  <div key={video.id} className="bg-gray-800 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{VIDEO_CATEGORIES[video.category]?.icon}</span>
                          <h4 className="text-white font-medium">{video.title}</h4>
                        </div>
                        <p className="text-gray-400 text-sm">{video.content_type}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {video.views} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400" /> {video.rating.toFixed(1)}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3 text-green-400" /> ${video.earnings} earned
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        {isFree ? (
                          <span className="text-green-400 font-bold flex items-center gap-1">
                            <Unlock className="w-4 h-4" /> FREE
                          </span>
                        ) : hasDiscount ? (
                          <div>
                            <span className="text-red-400 line-through text-sm">${video.price}</span>
                            <span className="text-green-400 font-bold ml-2">${currentPrice}</span>
                            <div className="text-xs text-gray-500 mt-1">
                              <Percent className="w-3 h-3 inline" /> Limited time
                            </div>
                          </div>
                        ) : (
                          <span className="text-purple-400 font-bold flex items-center gap-1">
                            <Lock className="w-4 h-4" /> ${video.price}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      {!isFree && !hasDiscount && (
                        <>
                          <button
                            onClick={() => handleSetDiscount(video.id, 0.5, 24)}
                            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-xs py-2 rounded"
                          >
                            50% Off (24h)
                          </button>
                          <button
                            onClick={() => handleMakeFree(video.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-2 rounded"
                          >
                            Make Free
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </motion.div>
      
      <AnimatePresence>
        {filmingOutcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full text-center border border-red-500/30"
            >
              <div className="text-5xl mb-4">🎥</div>
              <p className="text-gray-300 text-lg leading-relaxed">{filmingOutcome}</p>
            </motion.div>
          </motion.div>
        )}
        
        {livestreamOutcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-br from-red-950/80 to-pink-950/80 rounded-2xl p-6 max-w-md w-full text-center border-2 border-red-500/50"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-5xl mb-4"
              >
                🔴
              </motion.div>
              <p className="text-white text-lg leading-relaxed font-medium mb-2">LIVE</p>
              <p className="text-gray-300 text-lg leading-relaxed">{livestreamOutcome}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}