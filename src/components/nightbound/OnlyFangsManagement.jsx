import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Video, DollarSign, Users, TrendingUp, Eye, Star, Camera, Lock, Unlock, Percent, MessageCircle, Gift, Award, BarChart3, Package, Zap, ShoppingBag, UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import OnlyFangsMerch from './OnlyFangsMerch';

// Generate gender-appropriate examples
const getGenderExamples = (vampireGender) => {
  const isFemale = vampireGender === 'female';
  const vampireAnatomy = isFemale ? 'touching myself' : 'stroking myself';
  const servantAnatomy = 'touching myself'; // Servant examples remain neutral
  
  return {
    couple: isFemale 
      ? ['Making love together', 'Vampire takes their servant', 'Riding my vampire', 'Getting filled on camera', 'Passionate fucking', 'Shower sex']
      : ['Making love together', 'Vampire takes their servant', 'Riding my vampire', 'Getting bred on camera', 'Passionate fucking', 'Shower sex'],
    filmed: ['They film me masturbating', 'Stripping and touching myself', 'Using toys while they watch', 'Fingering myself for them', 'Moaning for the camera'],
    vampiresolo: isFemale
      ? ['Vampire masturbating', 'Vampire stripping and teasing', 'Playing with my pussy', 'Vampire using toys', 'Showing everything']
      : ['Vampire masturbating', 'Vampire stripping and teasing', 'Dominant vampire jerking off', 'Vampire using toys', 'Vampire showing everything']
  };
};

const VIDEO_CATEGORIES = {
  couple: { label: 'Couple', icon: '💑', minRep: 0 },
  filmed: { label: 'Filmed by Partner', icon: '🎥', minRep: 0 },
  vampiresolo: { label: 'Vampire Solo', icon: '🦇', minRep: 0 },
  solo: { label: 'Solo', icon: '💋', examples: ['Masturbating thinking of you', 'Undressing and fingering myself', 'Playing with toys and moaning', 'Multiple orgasms on camera', 'Edging and cumming'], minRep: 0 },
  pov: { label: 'POV', icon: '👁️', examples: ['Your view while I ride you', 'On my knees for you', 'Waking up together', 'Between my legs', 'Facesitting POV'], minRep: 0 },
  roleplay: { label: 'Roleplay', icon: '🎭', examples: ['Vampire seduction', 'Your obedient servant', 'Master and pet', 'Forbidden encounter', 'Dark ritual'], minRep: 0 },
  teasing: { label: 'Teasing', icon: '😈', examples: ['Strip tease', 'Almost showing everything', 'Teasing touches', 'Denial game', 'Edge play'], minRep: 0 },
  intimate: { label: 'Intimate', icon: '💖', examples: ['Making love to camera', 'Passionate moaning', 'Multiple orgasms', 'Intimate closeups', 'Sensual touches'], minRep: 0 },
  dominant: { label: 'Dominant', icon: '👑', examples: ['Ordering you around', 'Making you beg', 'Degradation', 'You\'re mine', 'Punishment time'], minRep: 20 },
  submissive: { label: 'Submissive', icon: '🙇', examples: ['On my knees', 'Please use me', 'Your obedient toy', 'Taking orders', 'Begging for you'], minRep: 20 },
  cosplay: { label: 'Cosplay', icon: '🦇', examples: ['Gothic vampire', 'Dark angel', 'Succubus', 'Witch', 'Leather & lace'], minRep: 30 },
  shower: { label: 'Shower', icon: '🚿', examples: ['Wet and soapy', 'Shower masturbation', 'Getting clean, getting dirty', 'Under the water', 'Steamy shower'], minRep: 30 },
  bedroom: { label: 'Bedroom', icon: '🛏️', examples: ['Morning in bed', 'Pillow humping', 'Sheets and moans', 'Late night session', 'Bedroom secrets'], minRep: 40 },
  public: { label: 'Public Risk', icon: '🌙', examples: ['In the car', 'Risky location', 'Almost caught', 'Public teasing', 'Outdoor adventure'], minRep: 50 },
  fetish: { label: 'Fetish', icon: '⛓️', examples: ['Feet worship', 'Bondage', 'Latex & leather', 'Worship me', 'Collar & leash'], minRep: 60 },
  artistic: { label: 'Artistic', icon: '🎨', examples: ['Sensual dance', 'Body art', 'Shadow play', 'Aesthetic nudity', 'Artistic poses'], minRep: 40 },
  // ADVANCED CATEGORIES - Unlock as you grow
  threesome: { label: 'Threesome', icon: '👥', examples: ['Adding a third person', 'Group fun on camera', 'Sharing with another', 'Double pleasure', 'Three-way passion'], minRep: 70 },
  extreme: { label: 'Extreme', icon: '💥', examples: ['Pushing all limits', 'Extreme insertion', 'Pain and pleasure', 'Going all out', 'No limits content'], minRep: 80 },
  celebrity: { label: 'Celebrity Collab', icon: '⭐', examples: ['Collab with top creator', 'Celebrity guest appearance', 'Famous partnership', 'Star crossover', 'VIP collaboration'], minRep: 85 },
  custom: { label: 'Custom Requests', icon: '✨', examples: ['Fan custom video', 'Personalized content', 'Specific fantasy fulfillment', 'Commissioned piece', 'Special request'], minRep: 75 },
  marathon: { label: 'Marathon Sessions', icon: '⏱️', examples: ['12-hour livestream', 'All-day content', 'Marathon fucking', 'Endurance challenge', 'Non-stop session'], minRep: 90 },
  exclusive: { label: 'Exclusive Elite', icon: '💎', examples: ['VIP-only content', 'Elite tier exclusive', 'Premium ultra-rare', 'Top-tier only', 'Highest bidder'], minRep: 95 }
};

const SUBSCRIPTION_TIERS = [
  { price: 5, name: 'Basic', perks: ['Access to feed', 'Like & comment'] },
  { price: 10, name: 'Premium', perks: ['All Basic perks', '10% off PPV', 'Weekly exclusive'] },
  { price: 20, name: 'VIP', perks: ['All Premium perks', '25% off PPV', 'Priority DMs', 'Custom content requests'] }
];

const WISHLIST_ITEMS = [
  { name: 'Silver', icon: '🪙', cost: 50, material: 'silver' },
  { name: 'Moonstone', icon: '🌙', cost: 75, material: 'moonstone' },
  { name: 'Garnet', icon: '🔴', cost: 100, material: 'garnet' },
  { name: 'Ruby', icon: '❤️', cost: 200, material: 'ruby' },
  { name: 'New Camera', icon: '📷', cost: 300 },
  { name: 'Lingerie Set', icon: '💋', cost: 150 },
  { name: 'Toys', icon: '🔥', cost: 250 }
];

export default function OnlyFangsManagement({ servant, vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('profile');
  
  // Gender-appropriate examples
  const genderExamples = getGenderExamples(vampireState.gender);
  const updatedCategories = {
    ...VIDEO_CATEGORIES,
    couple: { ...VIDEO_CATEGORIES.couple, examples: genderExamples.couple },
    filmed: { ...VIDEO_CATEGORIES.filmed, examples: genderExamples.filmed },
    vampiresolo: { ...VIDEO_CATEGORIES.vampiresolo, examples: genderExamples.vampiresolo }
  };
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
  const [chatMessages, setChatMessages] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [ppvMessage, setPpvMessage] = useState({ text: '', price: 20, videoId: null });
  const [sendingPpv, setSendingPpv] = useState(false);
  const [creatingPoll, setCreatingPoll] = useState(false);
  const [pollData, setPollData] = useState({ question: '', options: ['', ''] });
  const [activePoll, setActivePoll] = useState(null);
  const [creatingBundle, setCreatingBundle] = useState(false);
  const [bundleData, setBundleData] = useState({ name: '', videoIds: [], discount: 0.3 });
  const [brainstorming, setBrainstorming] = useState(false);
  const [brainstormIdea, setBrainstormIdea] = useState(null);
  const [creatingPost, setCreatingPost] = useState(false);
  const [newPost, setNewPost] = useState({ caption: '', content: '', is_ppv: false, price: 0 });
  const [viewingComments, setViewingComments] = useState(null);
  const [showMerch, setShowMerch] = useState(false);
  const [collabing, setCollabing] = useState(false);
  const [collabOutcome, setCollabOutcome] = useState('');

  const { data: profile = [], isLoading: profileLoading } = useQuery({
    queryKey: ['onlyfangs-profile', servant.id],
    queryFn: () => base44.entities.OnlyFangsProfile.filter({ servant_id: servant.id }),
    staleTime: 5000
  });

  const { data: videos = [], isLoading: videosLoading } = useQuery({
    queryKey: ['onlyfangs-videos', servant.id],
    queryFn: () => base44.entities.OnlyFangsVideo.filter({ servant_id: servant.id }, '-created_date'),
    staleTime: 3000
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['onlyfangs-posts', servant.id],
    queryFn: () => base44.entities.OnlyFangsPost.filter({ servant_id: servant.id }, '-created_date'),
    staleTime: 3000
  });

  const { data: allComments = [] } = useQuery({
    queryKey: ['onlyfangs-comments', servant.id],
    queryFn: () => base44.entities.OnlyFangsComment.filter({ servant_id: servant.id }, '-created_date'),
    staleTime: 3000
  });

  const isTabLoading = (tabName) => {
    if (tabName === 'videos') return videosLoading;
    if (tabName === 'create') return videosLoading;
    if (tabName === 'posts') return postsLoading;
    return false;
  };

  const servantProfile = profile[0];
  const hasProfile = !!servantProfile;

  // Generate top fans - unique names
  const topFans = React.useMemo(() => {
    if (!servantProfile) return [];
    const fanNamePool = [
      'DarkLover69', 'VampireFan420', 'NightStalker', 'BloodThirsty', 'GothKing', 'ShadowQueen',
      'LustfulNight', 'EternalDesire', 'MidnightCrave', 'CrimsonFan', 'ObsessedOne', 'DevotedSub'
    ];
    
    // Use consistent set based on servant ID to avoid regenerating each render
    const seed = servant.id?.charCodeAt(0) || 0;
    const shuffled = [...fanNamePool].sort(() => 0.5 - ((seed * 9301 + 49297) % 233280) / 233280);
    
    return shuffled.slice(0, 5).map((name, i) => ({
      name,
      spent: Math.floor(servantProfile.revenue * (0.3 - i * 0.05)),
      tier: i === 0 ? 'VIP' : i < 3 ? 'Premium' : 'Basic'
    }));
  }, [servantProfile?.revenue, servant.id]);

  // Analytics data
  const analytics = React.useMemo(() => {
    const byCategory = {};
    videos.forEach(v => {
      if (!byCategory[v.category]) byCategory[v.category] = { views: 0, earnings: 0, count: 0 };
      byCategory[v.category].views += v.views;
      byCategory[v.category].earnings += v.earnings;
      byCategory[v.category].count++;
    });
    return Object.entries(byCategory).map(([cat, data]) => ({
      category: VIDEO_CATEGORIES[cat]?.label || cat,
      ...data,
      avgEarnings: data.count > 0 ? Math.floor(data.earnings / data.count) : 0
    })).sort((a, b) => b.earnings - a.earnings);
  }, [videos]);

  const handleCreateProfile = async () => {
    await base44.entities.OnlyFangsProfile.create({
      servant_id: servant.id,
      username: profileData.username || `${servant.name}_vamp`,
      bio: profileData.bio || (profileData.is_couple ? `Two souls bound by darkness. Watch our nights together. 🌙💕` : `Solo content creator. Dark, sensual, yours. 🌙`),
      profile_pic: profileData.profile_pic || '💕',
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
    const isVampireSolo = selectedCategory === 'vampiresolo';
    const withVampire = filmWithVampire === true;
    
    if (isFilmedCategory && withVampire) {
      setFilming(true);
      
      const isVampFemale = vampireState.gender === 'female';
      const filmingOutcomes = isVampFemale ? [
        'You held the camera. Watched them perform. Got so wet watching. Had to put the camera down and join.',
        'Behind the lens. Filming them. They looked at you with those eyes. You couldn\'t resist anymore.',
        'You directed them. "Touch yourself there." They obeyed. You were dripping by the end.',
        'Filming them strip. Your hands shaking. They noticed. "Want to be in the video too?"',
        'You watched through the camera. So fucking beautiful. Had to stop filming to touch them.',
        'Behind the camera, watching them pleasure themselves. Your pussy throbbing. They saw. Smiled.',
        'Filming session became a fucking session. The camera kept rolling. Better content anyway.',
        'You tried to stay professional. Failed completely. Ended up making couple content instead.'
      ] : [
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
    } else if (isVampireSolo) {
      // Vampire solo content
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

        // Vampire content tends to do very well
        const initialViews = Math.floor(Math.random() * 100) + 50;
        const purchases = Math.floor(initialViews * (Math.random() * 0.5 + 0.3));
        const earnings = purchases * newVideo.price;

        await base44.entities.OnlyFangsVideo.update(video.id, {
          views: initialViews,
          earnings: earnings,
          rating: Math.random() * 1.5 + 3.8
        });

        const newRevenue = servantProfile.revenue + earnings;
        const newSubs = servantProfile.subscriber_count + Math.floor(Math.random() * 20) + 10;
        const newRep = Math.min(100, servantProfile.reputation + Math.floor(Math.random() * 10) + 8);

        await base44.entities.OnlyFangsProfile.update(servantProfile.id, {
          revenue: newRevenue,
          subscriber_count: newSubs,
          reputation: newRep
        });

        await base44.entities.NightLog.create({
          entry: `You created vampire content: "${newVideo.content_type}". Dominant. Powerful. They loved it. Earned $${earnings}.`,
          category: 'interaction',
          intensity: 'significant'
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
    setChatMessages([]);
    
    // Generate initial chat messages
    const initialMessages = [];
    const isVampFemale = vampireState.gender === 'female';
    const explicitMessages = withVampire ? (isVampFemale ? [
      'Oh fuck yes take it',
      'Make them scream',
      'So hot together 💦',
      'You\'re both so fucking hot',
      'I wish I was there',
      'Ride them harder',
      'Yes! Fuck!',
      'Your moans are perfect 🔥',
      'Best stream ever',
      'Don\'t stop',
    ] : [
      'Oh fuck yes breed her',
      'Make her scream daddy',
      'Fill her up 💦',
      'She\'s so fucking hot',
      'I wish I was there',
      'Choke her please',
      'Harder! Fuck her harder!',
      'Her moans are perfect 🔥',
      'Best stream ever',
      'Take it all baby',
    ]) : [
      'You\'re so fucking sexy',
      'Touch yourself for us',
      'Show us more baby',
      'Your body is perfect',
      'I\'m so hard for you',
      'Keep going gorgeous',
      'You\'re making me so wet',
      'Don\'t stop please',
      'So hot 🔥🔥',
      'I want you so bad',
    ];
    
    const usernames = ['DarkLover69', 'VampireFan420', 'NightStalker', 'BloodThirsty', 'GothKing', 'ShadowQueen', 'LustfulNight', 'EternalDesire'];
    const usedNames = new Set();

    for (let i = 0; i < 8; i++) {
      let username = usernames[Math.floor(Math.random() * usernames.length)];
      let attempts = 0;
      while (usedNames.has(username) && attempts < 10) {
        username = usernames[Math.floor(Math.random() * usernames.length)];
        attempts++;
      }
      usedNames.add(username);

      initialMessages.push({
        username,
        message: explicitMessages[Math.floor(Math.random() * explicitMessages.length)],
        tip: Math.random() > 0.6 ? Math.floor(Math.random() * 50) + 5 : 0
      });
    }
    
    setChatMessages(initialMessages);
    
    // Keep adding messages during stream - avoid recent duplicates
    const messageInterval = setInterval(() => {
      const recentNames = chatMessages.slice(-5).map(m => m.username);
      let username = usernames[Math.floor(Math.random() * usernames.length)];
      let attempts = 0;
      while (recentNames.includes(username) && attempts < 5) {
        username = usernames[Math.floor(Math.random() * usernames.length)];
        attempts++;
      }
      
      const newMsg = {
        username,
        message: explicitMessages[Math.floor(Math.random() * explicitMessages.length)],
        tip: Math.random() > 0.7 ? Math.floor(Math.random() * 50) + 5 : 0
      };
      setChatMessages(prev => [...prev.slice(-12), newMsg]);
    }, 2000);
    
    setTimeout(async () => {
      clearInterval(messageInterval);
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
      
      const outcomes = withVampire ? [
        'Live sex show complete. Chat went insane. Tips flooded in. You both came together on camera.',
        'Stream ended. Everyone watched you get bred live. Subscribers exploded. $' + earnings + ' earned.',
        'Livestream finished. You fucked on camera. Real. Raw. Unfiltered. They loved every second.',
      ] : [
        'Stream ended. You came on camera. Chat tipped like crazy. $' + earnings + ' earned.',
        'Livestream complete. Solo show. Touching yourself. Moaning. Perfect performance.',
        'You finished the stream. Everyone saw you at your most vulnerable. They can\'t get enough.',
      ];
      
      await base44.entities.NightLog.create({
        entry: outcomes[Math.floor(Math.random() * outcomes.length)],
        category: 'interaction',
        intensity: 'significant'
      });
      
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        setLivestreaming(false);
        setLivestreamOutcome('');
        setChatMessages([]);
      }, 3000);
    }, 15000);
  };
  
  const handleSendMessage = async () => {
    if (!userMessage.trim() || sendingMessage) return;
    
    setSendingMessage(true);
    const myMessage = userMessage;
    setUserMessage('');
    
    // Add user message to chat
    setChatMessages(prev => [...prev.slice(-12), { username: 'You', message: myMessage, isUser: true }]);
    
    // Get AI response
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are responding to a livestream chat message during an adult OnlyFangs livestream. The streamer (${servant.name}) is ${servantProfile.is_couple_account ? 'performing with their vampire partner' : 'performing solo'}. A viewer in chat said: "${myMessage}". Generate 2-3 responses from different viewers that are explicit, complimentary, or reacting to what was said. Keep responses short (under 15 words each). Be explicit and sexual. Format as JSON array of strings.`,
        response_json_schema: {
          type: 'object',
          properties: {
            responses: { type: 'array', items: { type: 'string' } }
          }
        }
      });
      
      const usernames = ['DarkLover69', 'VampireFan420', 'NightStalker', 'BloodThirsty', 'GothKing', 'ShadowQueen', 'LustfulNight', 'EternalDesire', 'MidnightCrave', 'CrimsonFan'];
      const usedInResponse = new Set(chatMessages.map(m => m.username));
      
      response.responses.forEach((msg, i) => {
        setTimeout(() => {
          let username = usernames[Math.floor(Math.random() * usernames.length)];
          let attempts = 0;
          while (usedInResponse.has(username) && attempts < 10) {
            username = usernames[Math.floor(Math.random() * usernames.length)];
            attempts++;
          }
          usedInResponse.add(username);
          
          setChatMessages(prev => [...prev.slice(-12), {
            username,
            message: msg,
            tip: Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 5 : 0
          }]);
        }, (i + 1) * 1000);
      });
    } catch (e) {
      // Fallback
      const fallbacks = ['Yes please!', 'So hot 🔥', 'Keep going!', 'Amazing'];
      setChatMessages(prev => [...prev.slice(-12), {
        username: 'VampireFan420',
        message: fallbacks[Math.floor(Math.random() * fallbacks.length)]
      }]);
    }
    
    setSendingMessage(false);
  };

  const handleSendPPV = async () => {
    if (!ppvMessage.text || !ppvMessage.videoId) return;
    setSendingPpv(true);
    
    setTimeout(async () => {
      const unlocks = Math.floor(servantProfile.subscriber_count * (Math.random() * 0.2 + 0.1));
      const earnings = unlocks * ppvMessage.price;
      
      await base44.entities.OnlyFangsProfile.update(servantProfile.id, {
        revenue: servantProfile.revenue + earnings
      });
      
      await base44.entities.NightLog.create({
        entry: `Sent PPV message to ${servantProfile.subscriber_count} subscribers. ${unlocks} unlocked it. Earned $${earnings}.`,
        category: 'interaction',
        intensity: 'moderate'
      });
      
      queryClient.invalidateQueries();
      setSendingPpv(false);
      setPpvMessage({ text: '', price: 20, videoId: null });
    }, 2000);
  };

  const handleCreatePoll = async () => {
    if (!pollData.question || pollData.options.filter(o => o).length < 2) return;
    setCreatingPoll(true);
    
    setTimeout(() => {
      const votes = pollData.options.filter(o => o).map(opt => ({
        option: opt,
        votes: Math.floor(Math.random() * servantProfile.subscriber_count * 0.3)
      }));
      setActivePoll({ question: pollData.question, results: votes });
      setCreatingPoll(false);
      setPollData({ question: '', options: ['', ''] });
    }, 1500);
  };

  const handleCustomRequest = async () => {
    const requestPool = [
      { fan: 'DarkLover69', request: 'Shower video with my name written on your body', offer: 150 },
      { fan: 'VampireFan420', request: 'Roleplay: vampire seducing innocent victim', offer: 200 },
      { fan: 'NightStalker', request: 'Feet content + face reveal', offer: 300 },
      { fan: 'GothKing', request: 'Video calling my name while you finish', offer: 250 },
      { fan: 'ShadowQueen', request: 'Couple video with specific positions', offer: 275 },
      { fan: 'BloodThirsty', request: 'Solo masturbation saying their name', offer: 180 },
      { fan: 'LustfulNight', request: 'Custom outfit video with toys', offer: 220 },
      { fan: 'CrimsonFan', request: 'POV video pretending they are there', offer: 240 }
    ];
    
    // Get recent custom request logs to avoid repeating same fan
    const { data: recentLogs = [] } = await queryClient.fetchQuery({
      queryKey: ['recent-custom-logs'],
      queryFn: () => base44.entities.NightLog.filter({ category: 'interaction' }, '-created_date', 20)
    });
    
    const recentFans = recentLogs
      .filter(log => log.entry.includes('custom request from'))
      .map(log => {
        const match = log.entry.match(/custom request from ([^:]+):/);
        return match ? match[1] : null;
      })
      .filter(Boolean);
    
    const availableRequests = requestPool.filter(r => !recentFans.includes(r.fan));
    const request = availableRequests.length > 0 
      ? availableRequests[Math.floor(Math.random() * availableRequests.length)]
      : requestPool[Math.floor(Math.random() * requestPool.length)];
    
    if (confirm(`${request.fan} wants: "${request.request}" - Offering $${request.offer}. Accept?`)) {
      await base44.entities.OnlyFangsProfile.update(servantProfile.id, {
        revenue: servantProfile.revenue + request.offer
      });
      
      await base44.entities.NightLog.create({
        entry: `Accepted custom request from ${request.fan}: "${request.request}". Earned $${request.offer}.`,
        category: 'interaction',
        intensity: 'moderate'
      });
      
      queryClient.invalidateQueries();
    }
  };

  const handleShoutout = async () => {
    const fan = topFans[0];
    if (!fan) return;
    
    const earnings = 100;
    await base44.entities.OnlyFangsProfile.update(servantProfile.id, {
      revenue: servantProfile.revenue + earnings
    });
    
    await base44.entities.NightLog.create({
      entry: `Recorded personalized shoutout for ${fan.name}. Earned $${earnings}.`,
      category: 'interaction',
      intensity: 'subtle'
    });
    
    queryClient.invalidateQueries();
  };

  const handleWishlistPurchase = async (item) => {
    const earnings = item.cost;
    
    await base44.entities.OnlyFangsProfile.update(servantProfile.id, {
      revenue: servantProfile.revenue + earnings
    });
    
    if (item.material) {
      const inv = await base44.entities.Inventory.filter({ servant_id: servant.id, material: item.material });
      if (inv[0]) {
        await base44.entities.Inventory.update(inv[0].id, {
          quantity: inv[0].quantity + 10
        });
      } else {
        await base44.entities.Inventory.create({
          servant_id: servant.id,
          material: item.material,
          quantity: 10
        });
      }
    }
    
    await base44.entities.NightLog.create({
      entry: `A fan bought you ${item.name} from your wishlist! Received $${earnings}.`,
      category: 'interaction',
      intensity: 'moderate'
    });
    
    queryClient.invalidateQueries();
  };

  const handleCreateBundle = async () => {
    if (bundleData.videoIds.length < 2) return;
    setCreatingBundle(true);
    
    setTimeout(async () => {
      const totalPrice = bundleData.videoIds.reduce((sum, id) => {
        const video = videos.find(v => v.id === id);
        return sum + (video?.price || 0);
      }, 0);
      
      const bundlePrice = Math.floor(totalPrice * (1 - bundleData.discount));
      const sales = Math.floor(Math.random() * 30) + 10;
      const earnings = sales * bundlePrice;
      
      await base44.entities.OnlyFangsProfile.update(servantProfile.id, {
        revenue: servantProfile.revenue + earnings
      });
      
      await base44.entities.NightLog.create({
        entry: `Created bundle "${bundleData.name}". Sold ${sales} copies. Earned $${earnings}.`,
        category: 'interaction',
        intensity: 'moderate'
      });
      
      queryClient.invalidateQueries();
      setCreatingBundle(false);
      setBundleData({ name: '', videoIds: [], discount: 0.3 });
    }, 2000);
  };

  const handleFreeTrial = async () => {
    const newSubs = Math.floor(Math.random() * 50) + 30;
    
    await base44.entities.OnlyFangsProfile.update(servantProfile.id, {
      subscriber_count: servantProfile.subscriber_count + newSubs
    });
    
    await base44.entities.NightLog.create({
      entry: `Started 24h free trial promotion. Gained ${newSubs} new subscribers!`,
      category: 'interaction',
      intensity: 'moderate'
    });
    
    queryClient.invalidateQueries();
  };

  const handleBrainstorm = async () => {
    setBrainstorming(true);
    
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are ${servant.name}, brainstorming explicit OnlyFangs content ideas with your vampire partner. Generate 3 creative, explicit adult content ideas. Be specific about the sexual acts. Each idea should include: a catchy title, explicit description of what happens, and estimated earnings potential. Consider: masturbation, sex acts, toys, roleplay, fetish content. Format as JSON array with objects containing: title, description, category, estimated_earnings.`,
        response_json_schema: {
          type: 'object',
          properties: {
            ideas: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  category: { type: 'string' },
                  estimated_earnings: { type: 'number' }
                }
              }
            }
          }
        }
      });
      
      setBrainstormIdea(response.ideas);
    } catch (e) {
      // Fallback ideas
      setBrainstormIdea([
        { title: 'Vampire Breeds Me', description: 'Full penetration. Multiple positions. Creampie finish.', category: 'couple', estimated_earnings: 200 },
        { title: 'Masturbating to Exhaustion', description: 'Using toys. Multiple orgasms. Moaning and begging.', category: 'solo', estimated_earnings: 150 },
        { title: 'Shower Sex POV', description: 'Wet bodies. Fucking against the wall. His POV.', category: 'pov', estimated_earnings: 180 }
      ]);
    }
    
    setBrainstorming(false);
  };

  const handleUseIdea = (idea) => {
    setTab('create');
    setSelectedCategory(idea.category);
    setNewVideo({ title: idea.title, content_type: idea.description, price: 20 });
    setBrainstormIdea(null);
  };

  const handleCollab = async () => {
    setCollabing(true);
    
    const creatorPool = [
      { name: 'MidnightMuse', followers: 50000, type: 'Solo creator' },
      { name: 'DarkDesires', followers: 120000, type: 'Couple account' },
      { name: 'ShadowPlay', followers: 80000, type: 'Fetish specialist' },
      { name: 'NightQueen', followers: 200000, type: 'Top creator' },
      { name: 'VelvetVixen', followers: 95000, type: 'Dominant creator' },
      { name: 'CrimsonRose', followers: 150000, type: 'Elite content' }
    ];
    
    // Get existing collabs to avoid duplicates
    const { data: existingCollabs = [] } = await queryClient.fetchQuery({
      queryKey: ['collabs', servant.id],
      queryFn: () => base44.entities.OnlyFangsCollab.filter({ servant_id: servant.id })
    });
    
    const usedNames = existingCollabs.map(c => c.creator_name);
    const availableCreators = creatorPool.filter(c => !usedNames.includes(c.name));
    
    const creator = availableCreators.length > 0 
      ? availableCreators[Math.floor(Math.random() * availableCreators.length)]
      : creatorPool[Math.floor(Math.random() * creatorPool.length)];
    
    setTimeout(async () => {
      const collab = await base44.entities.OnlyFangsCollab.create({
        servant_id: servant.id,
        creator_name: creator.name,
        creator_followers: creator.followers,
        collab_type: 'video',
        earnings: 0,
        new_subs: 0,
        completed: false
      });
      
      // Collaboration results
      const crossoverSubs = Math.floor(creator.followers * (Math.random() * 0.05 + 0.02));
      const earnings = Math.floor(Math.random() * 800) + 400;
      
      await base44.entities.OnlyFangsCollab.update(collab.id, {
        earnings: earnings,
        new_subs: crossoverSubs,
        completed: true
      });
      
      await base44.entities.OnlyFangsProfile.update(servantProfile.id, {
        revenue: servantProfile.revenue + earnings,
        subscriber_count: servantProfile.subscriber_count + crossoverSubs,
        reputation: Math.min(100, servantProfile.reputation + 15)
      });
      
      const outcome = `Collaboration with ${creator.name} (${creator.followers.toLocaleString()} followers) complete! Gained ${crossoverSubs} new subscribers. Earned $${earnings}. Your reputation skyrocketed.`;
      setCollabOutcome(outcome);
      
      await base44.entities.NightLog.create({
        entry: outcome,
        category: 'interaction',
        intensity: 'significant'
      });
      
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        setCollabing(false);
        setCollabOutcome('');
      }, 5000);
    }, 3000);
  };

  const handleCreatePost = async () => {
    if (!newPost.content || !newPost.caption) return;
    setCreatingPost(true);
    
    setTimeout(async () => {
      const post = await base44.entities.OnlyFangsPost.create({
        servant_id: servant.id,
        caption: newPost.caption,
        content: newPost.content,
        is_ppv: newPost.is_ppv,
        price: newPost.price,
        likes: 0,
        earnings: 0
      });

      const baseLikes = Math.floor(Math.random() * 100) + 50;
      let earnings = 0;
      
      if (newPost.is_ppv) {
        const unlocks = Math.floor(servantProfile.subscriber_count * (Math.random() * 0.3 + 0.2));
        earnings = unlocks * newPost.price;
      }

      await base44.entities.OnlyFangsPost.update(post.id, {
        likes: baseLikes,
        earnings: earnings
      });

      // Generate 3-8 comments with unique usernames
      const numComments = Math.floor(Math.random() * 6) + 3;
      const usernames = ['DarkLover69', 'VampireFan420', 'NightStalker', 'BloodThirsty', 'GothKing', 'ShadowQueen', 'LustfulNight', 'EternalDesire'];
      const comments = [
        'So fucking hot 🔥', 'Damn you look amazing', 'I need more of you', 'Perfect body',
        'This is everything', 'You\'re so sexy', 'Can\'t stop looking at this', 'Wow just wow',
        'Please post more like this', 'Absolutely stunning', 'My favorite creator', 'So beautiful',
        'This made my night', 'I\'m obsessed with you', 'Best content ever', 'You\'re incredible'
      ];
      
      const usedNames = new Set();
      for (let i = 0; i < numComments; i++) {
        let username = usernames[Math.floor(Math.random() * usernames.length)];
        let attempts = 0;
        while (usedNames.has(username) && attempts < 10) {
          username = usernames[Math.floor(Math.random() * usernames.length)];
          attempts++;
        }
        usedNames.add(username);
        
        await base44.entities.OnlyFangsComment.create({
          servant_id: servant.id,
          post_id: post.id,
          username,
          comment: comments[Math.floor(Math.random() * comments.length)],
          tip: Math.random() > 0.7 ? Math.floor(Math.random() * 20) + 5 : 0
        });
      }

      const newRevenue = servantProfile.revenue + earnings;
      const newSubs = servantProfile.subscriber_count + Math.floor(Math.random() * 8) + 2;
      const newRep = Math.min(100, servantProfile.reputation + Math.floor(Math.random() * 5) + 2);

      await base44.entities.OnlyFangsProfile.update(servantProfile.id, {
        revenue: newRevenue,
        subscriber_count: newSubs,
        reputation: newRep
      });

      await base44.entities.NightLog.create({
        entry: `${servant.name} posted: "${newPost.caption}". ${baseLikes} likes. ${numComments} comments.${newPost.is_ppv ? ` Earned $${earnings}.` : ''}`,
        category: 'interaction',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();
      setCreatingPost(false);
      setNewPost({ caption: '', content: '', is_ppv: false, price: 0 });
      setTab('posts');
    }, 2000);
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
          className="bg-gray-900 rounded-2xl p-6 max-w-md w-full text-center relative"
        >
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }} 
            className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
          >
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
          className="bg-gray-900 rounded-2xl p-6 max-w-md w-full relative"
        >
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }} 
            className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 touch-manipulation p-2"
          >
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
                placeholder={profileData.is_couple ? "Tell them about your couple's account..." : "Tell them what makes you special..."}
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
                  ❤️ Couples Account
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
              <div className="flex gap-2 mt-1 flex-wrap">
                {['💕', '🦇', '💋', '🌙', '🔥'].map(emoji => (
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
        className="bg-gray-900 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 touch-manipulation p-2"
        >
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
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button onClick={() => setTab('profile')} className={`px-3 py-2 rounded-lg whitespace-nowrap text-sm ${tab === 'profile' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            Profile
          </button>
          <button onClick={() => setTab('livestream')} className={`px-3 py-2 rounded-lg whitespace-nowrap flex items-center gap-1 text-sm ${tab === 'livestream' ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            <span className="text-red-400">🔴</span> Live
          </button>
          <button onClick={() => setTab('create')} className={`px-3 py-2 rounded-lg whitespace-nowrap text-sm ${tab === 'create' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            Create
          </button>
          <button onClick={() => setTab('videos')} className={`px-3 py-2 rounded-lg whitespace-nowrap text-sm ${tab === 'videos' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            Videos
          </button>
          <button onClick={() => setTab('posts')} className={`px-3 py-2 rounded-lg whitespace-nowrap text-sm ${tab === 'posts' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            Pictures
          </button>
          <button onClick={() => setTab('ppv')} className={`px-3 py-2 rounded-lg whitespace-nowrap flex items-center gap-1 text-sm ${tab === 'ppv' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            <MessageCircle className="w-3 h-3" /> PPV
          </button>
          <button onClick={() => setTab('fans')} className={`px-3 py-2 rounded-lg whitespace-nowrap flex items-center gap-1 text-sm ${tab === 'fans' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            <Award className="w-3 h-3" /> Fans
          </button>
          <button onClick={() => setTab('analytics')} className={`px-3 py-2 rounded-lg whitespace-nowrap flex items-center gap-1 text-sm ${tab === 'analytics' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            <BarChart3 className="w-3 h-3" /> Stats
          </button>
          <button onClick={() => setTab('engagement')} className={`px-3 py-2 rounded-lg whitespace-nowrap flex items-center gap-1 text-sm ${tab === 'engagement' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            <Zap className="w-3 h-3" /> Tools
          </button>
          <button onClick={() => setTab('brainstorm')} className={`px-3 py-2 rounded-lg whitespace-nowrap flex items-center gap-1 text-sm ${tab === 'brainstorm' ? 'bg-gradient-to-r from-pink-600 to-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            💡 Ideas
          </button>
          <button onClick={() => setTab('merch')} className={`px-3 py-2 rounded-lg whitespace-nowrap flex items-center gap-1 text-sm ${tab === 'merch' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            <ShoppingBag className="w-3 h-3" /> Merch
          </button>
          <button onClick={() => setTab('collab')} className={`px-3 py-2 rounded-lg whitespace-nowrap flex items-center gap-1 text-sm ${tab === 'collab' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            <UserPlus className="w-3 h-3" /> Collab
          </button>
          <button onClick={() => setShowMerch(true)} className="px-3 py-2 rounded-lg whitespace-nowrap flex items-center gap-1 text-sm bg-gray-800 text-gray-400 hover:bg-gray-700">
            <ShoppingBag className="w-3 h-3" /> Store
          </button>
        </div>

        {/* Loading Overlay */}
        <AnimatePresence>
          {isTabLoading(tab) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-6xl"
              >
                💋
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Content */}
        {tab === 'profile' && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            <div className="bg-gray-800 rounded-xl p-4">
              <h3 className="text-white font-medium mb-2">Account Type</h3>
              <p className="text-gray-300">{servantProfile.is_couple_account ? '❤️ Couples Account' : '💋 Solo Account'}</p>
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

        {tab === 'livestream' && !livestreaming && (
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
                  Go Live Solo 💋
                </button>
                {servantProfile.is_couple_account && (
                  <button
                    onClick={() => handleLivestream(true)}
                    disabled={livestreaming}
                    className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 text-white font-medium py-4 rounded-xl transition-all disabled:opacity-50"
                  >
                    Go Live Together 💑
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

        {tab === 'livestream' && livestreaming && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-red-950/60 to-pink-950/60 border-2 border-red-500/50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-3 h-3 bg-red-500 rounded-full"
                />
                <span className="text-red-400 font-bold">LIVE</span>
                <span className="text-gray-400 text-sm ml-auto">{servantProfile.subscriber_count} watching</span>
              </div>
              
              {/* Live Chat */}
              <div className="bg-black/40 rounded-xl p-3 h-64 overflow-y-auto mb-3 space-y-2">
                {chatMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`${msg.isUser ? 'bg-purple-900/40' : 'bg-gray-800/60'} rounded-lg p-2`}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`${msg.isUser ? 'text-purple-400' : 'text-pink-400'} text-xs font-bold`}>
                        {msg.username}
                      </span>
                      {msg.tip > 0 && (
                        <span className="text-green-400 text-xs">💵 ${msg.tip}</span>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm">{msg.message}</p>
                  </motion.div>
                ))}
              </div>
              
              {/* Message Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Say something to the chat..."
                  className="flex-1 bg-gray-900/60 border border-purple-500/30 rounded-lg px-3 py-2 text-white text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !userMessage.trim()}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'create' && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            {!selectedCategory ? (
              <>
                <h3 className="text-white font-bold mb-3">Choose Content Category</h3>
                <div className="grid md:grid-cols-3 gap-3">
                  {Object.entries(updatedCategories).map(([key, cat]) => {
                    const isLocked = cat.minRep > servantProfile.reputation;
                    const isNew = cat.minRep > 0 && cat.minRep <= servantProfile.reputation && cat.minRep > (servantProfile.reputation - 20);

                    return (
                      <button
                        key={key}
                        onClick={() => !isLocked && setSelectedCategory(key)}
                        disabled={isLocked}
                        className={`bg-gray-800 rounded-xl p-4 text-left transition-colors relative ${
                          isLocked ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-700'
                        } ${isNew ? 'ring-2 ring-yellow-400' : ''}`}
                      >
                        <div className="text-3xl mb-2">{cat.icon}</div>
                        <h4 className="text-white font-medium">{cat.label}</h4>
                        {isLocked && (
                          <span className="absolute top-2 right-2 text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded">
                            Rep {cat.minRep}
                          </span>
                        )}
                        {isNew && (
                          <span className="absolute top-2 right-2 text-xs bg-yellow-500 text-black px-2 py-1 rounded font-bold">
                            NEW!
                          </span>
                        )}
                      </button>
                    );
                  })}
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
                  {updatedCategories[selectedCategory].icon} {updatedCategories[selectedCategory].label} Content
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-gray-400 text-sm">Content Description</label>
                    <textarea
                      value={newVideo.content_type}
                      onChange={(e) => setNewVideo({...newVideo, content_type: e.target.value})}
                      placeholder="Describe what you want to create... Be as explicit as you want."
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 mt-1 h-20"
                    />
                    <details className="mt-2">
                      <summary className="text-purple-400 text-xs cursor-pointer">Quick suggestions</summary>
                      <div className="grid grid-cols-1 gap-1 mt-2">
                        {updatedCategories[selectedCategory].examples.map(ex => (
                          <button
                            key={ex}
                            type="button"
                            onClick={() => setNewVideo({...newVideo, content_type: ex})}
                            className="text-left text-xs text-gray-400 hover:text-white bg-gray-900 hover:bg-gray-700 px-2 py-1 rounded transition-colors"
                          >
                            {ex}
                          </button>
                        ))}
                      </div>
                    </details>
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
          <div className="space-y-3 max-h-[55vh] overflow-y-auto">
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
                      <button
                        onClick={() => setViewingComments({ type: 'video', id: video.id, title: video.title })}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs py-2 rounded"
                      >
                        💬 {allComments.filter(c => c.video_id === video.id).length} Comments
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === 'ppv' && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            <div className="bg-gradient-to-br from-pink-950/40 to-purple-950/40 border-2 border-pink-500/30 rounded-2xl p-6">
              <h3 className="text-white text-xl font-bold mb-2 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" /> Mass PPV Message
              </h3>
              <p className="text-gray-400 text-sm mb-4">Send locked content to all {servantProfile.subscriber_count} subscribers</p>
              
              <div className="space-y-3">
                <textarea
                  value={ppvMessage.text}
                  onChange={(e) => setPpvMessage({...ppvMessage, text: e.target.value})}
                  placeholder="Your teasing message... 'Want to see what happened next? 😈'"
                  className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 h-20"
                />
                
                <div>
                  <label className="text-gray-400 text-sm">Select Video to Lock</label>
                  <select
                    value={ppvMessage.videoId || ''}
                    onChange={(e) => setPpvMessage({...ppvMessage, videoId: e.target.value})}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 mt-1"
                  >
                    <option value="">Choose a video...</option>
                    {videos.map(v => (
                      <option key={v.id} value={v.id}>{v.title} (${v.price})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 text-sm">Unlock Price ($)</label>
                  <div className="flex gap-2 mt-1">
                    {[10, 15, 20, 30, 50].map(price => (
                      <button
                        key={price}
                        onClick={() => setPpvMessage({...ppvMessage, price})}
                        className={`px-4 py-2 rounded-lg ${ppvMessage.price === price ? 'bg-pink-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                      >
                        ${price}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSendPPV}
                  disabled={!ppvMessage.text || !ppvMessage.videoId || sendingPpv}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50"
                >
                  {sendingPpv ? 'Sending...' : `Send to ${servantProfile.subscriber_count} Subscribers`}
                </button>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-4">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" /> Create Bundle
              </h4>
              <p className="text-gray-400 text-sm mb-3">Package videos together at a discount</p>
              
              <input
                type="text"
                value={bundleData.name}
                onChange={(e) => setBundleData({...bundleData, name: e.target.value})}
                placeholder="Bundle name..."
                className="w-full bg-gray-900 text-white rounded-lg px-3 py-2 mb-3"
              />
              
              <div className="space-y-2 mb-3">
                {videos.slice(0, 5).map(v => (
                  <label key={v.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={bundleData.videoIds.includes(v.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBundleData({...bundleData, videoIds: [...bundleData.videoIds, v.id]});
                        } else {
                          setBundleData({...bundleData, videoIds: bundleData.videoIds.filter(id => id !== v.id)});
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-gray-300">{v.title} (${v.price})</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-2 mb-3">
                <button onClick={() => setBundleData({...bundleData, discount: 0.2})} className={`flex-1 py-2 rounded text-sm ${bundleData.discount === 0.2 ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'}`}>20% Off</button>
                <button onClick={() => setBundleData({...bundleData, discount: 0.3})} className={`flex-1 py-2 rounded text-sm ${bundleData.discount === 0.3 ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'}`}>30% Off</button>
                <button onClick={() => setBundleData({...bundleData, discount: 0.5})} className={`flex-1 py-2 rounded text-sm ${bundleData.discount === 0.5 ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'}`}>50% Off</button>
              </div>

              <button
                onClick={handleCreateBundle}
                disabled={bundleData.videoIds.length < 2 || !bundleData.name || creatingBundle}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {creatingBundle ? 'Creating...' : 'Create Bundle'}
              </button>
            </div>
          </div>
        )}

        {tab === 'fans' && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            <div className="bg-gradient-to-br from-yellow-950/40 to-amber-950/40 border-2 border-yellow-500/30 rounded-2xl p-6">
              <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" /> Top Fans
              </h3>
              <div className="space-y-3">
                {topFans.map((fan, i) => (
                  <div key={fan.name} className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : '⭐'}</span>
                      <div>
                        <p className="text-white font-medium">{fan.name}</p>
                        <p className="text-gray-400 text-sm">{fan.tier} Subscriber</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold">${fan.spent}</p>
                      <p className="text-gray-500 text-xs">total spent</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <button
                onClick={handleCustomRequest}
                className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 hover:from-purple-900/60 hover:to-pink-900/60 border border-purple-500/30 rounded-xl p-4 text-left transition-colors"
              >
                <h4 className="text-white font-medium mb-1">Custom Content Request</h4>
                <p className="text-gray-400 text-sm">Fans pay premium for personalized content</p>
              </button>

              <button
                onClick={handleShoutout}
                className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 hover:from-blue-900/60 hover:to-purple-900/60 border border-blue-500/30 rounded-xl p-4 text-left transition-colors"
              >
                <h4 className="text-white font-medium mb-1">Record Shoutout</h4>
                <p className="text-gray-400 text-sm">$100 - Personalized video for top fan</p>
              </button>
            </div>

            <div className="bg-gray-800 rounded-xl p-4">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Gift className="w-4 h-4" /> Wishlist
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {WISHLIST_ITEMS.map(item => (
                  <button
                    key={item.name}
                    onClick={() => handleWishlistPurchase(item)}
                    className="bg-gray-900 hover:bg-gray-700 rounded-lg p-3 text-left transition-colors"
                  >
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <p className="text-white text-sm font-medium">{item.name}</p>
                    <p className="text-green-400 text-xs">${item.cost}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'analytics' && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            <div className="bg-gradient-to-br from-blue-950/40 to-purple-950/40 border-2 border-blue-500/30 rounded-2xl p-6">
              <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" /> Performance Analytics
              </h3>
              
              <div className="space-y-3">
                {analytics.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Create content to see analytics</p>
                ) : (
                  analytics.map(cat => (
                    <div key={cat.category} className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-white font-medium">{cat.category}</h4>
                        <span className="text-green-400 font-bold">${cat.earnings}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Videos</p>
                          <p className="text-white">{cat.count}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Views</p>
                          <p className="text-white">{cat.views}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Avg Earn</p>
                          <p className="text-white">${cat.avgEarnings}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Total Views</p>
                <p className="text-white text-2xl font-bold">{videos.reduce((sum, v) => sum + v.views, 0)}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Avg Rating</p>
                <p className="text-white text-2xl font-bold">{videos.length > 0 ? (videos.reduce((sum, v) => sum + v.rating, 0) / videos.length).toFixed(1) : '0.0'} ⭐</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Best Video</p>
                <p className="text-white text-sm font-medium">{videos.sort((a, b) => b.earnings - a.earnings)[0]?.title || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'engagement' && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            <div className="bg-gradient-to-br from-purple-950/40 to-pink-950/40 border-2 border-purple-500/30 rounded-2xl p-6">
              <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" /> Engagement Tools
              </h3>

              <div className="space-y-3">
                <button
                  onClick={handleFreeTrial}
                  className="w-full bg-gradient-to-r from-green-900/40 to-emerald-900/40 hover:from-green-900/60 hover:to-emerald-900/60 border border-green-500/30 rounded-xl p-4 text-left transition-colors"
                >
                  <h4 className="text-white font-medium mb-1">🎁 24h Free Trial</h4>
                  <p className="text-gray-400 text-sm">Massive subscriber boost. Limited time promotion.</p>
                </button>

                <div className="bg-gray-800 rounded-xl p-4">
                  <h4 className="text-white font-medium mb-3">Create Poll</h4>
                  <input
                    type="text"
                    value={pollData.question}
                    onChange={(e) => setPollData({...pollData, question: e.target.value})}
                    placeholder="What should I film next?"
                    className="w-full bg-gray-900 text-white rounded-lg px-3 py-2 mb-2"
                  />
                  {pollData.options.map((opt, i) => (
                    <input
                      key={i}
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...pollData.options];
                        newOpts[i] = e.target.value;
                        setPollData({...pollData, options: newOpts});
                      }}
                      placeholder={`Option ${i + 1}`}
                      className="w-full bg-gray-900 text-white rounded-lg px-3 py-2 mb-2"
                    />
                  ))}
                  <button
                    onClick={() => setPollData({...pollData, options: [...pollData.options, '']})}
                    className="text-purple-400 text-sm mb-2"
                  >
                    + Add Option
                  </button>
                  <button
                    onClick={handleCreatePoll}
                    disabled={!pollData.question || pollData.options.filter(o => o).length < 2 || creatingPoll}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {creatingPoll ? 'Creating...' : 'Create Poll'}
                  </button>
                </div>

                {activePoll && (
                  <div className="bg-gray-800 rounded-xl p-4">
                    <h4 className="text-white font-medium mb-3">Poll Results: {activePoll.question}</h4>
                    {activePoll.results.map((r, i) => (
                      <div key={i} className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">{r.option}</span>
                          <span className="text-purple-400">{r.votes} votes</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            style={{ width: `${(r.votes / Math.max(...activePoll.results.map(x => x.votes))) * 100}%` }}
                            className="h-2 bg-purple-500 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-gray-800 rounded-xl p-4">
                  <h4 className="text-white font-medium mb-2">Subscription Tiers</h4>
                  <div className="space-y-2">
                    {SUBSCRIPTION_TIERS.map(tier => (
                      <div key={tier.name} className="bg-gray-900 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-white font-medium">{tier.name}</span>
                          <span className="text-green-400">${tier.price}/month</span>
                        </div>
                        <ul className="text-gray-400 text-xs space-y-1">
                          {tier.perks.map((perk, i) => (
                            <li key={i}>• {perk}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'posts' && (
          <div className="space-y-3 max-h-[55vh] overflow-y-auto">
            <button
              onClick={() => setCreatingPost(true)}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-medium py-3 rounded-xl transition-all"
            >
              + Post New Picture
            </button>

            {posts.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No posts yet. Share your first picture!</p>
            ) : (
              posts.map(post => {
                const postComments = allComments.filter(c => c.post_id === post.id);
                return (
                  <div key={post.id} className="bg-gray-800 rounded-xl p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-4xl">📷</span>
                      <div className="flex-1">
                        <p className="text-white font-medium mb-1">{post.caption}</p>
                        <p className="text-gray-400 text-sm mb-2">{post.content}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>❤️ {post.likes} likes</span>
                          <span>💬 {postComments.length} comments</span>
                          {post.is_ppv && <span className="text-green-400">💰 ${post.earnings} earned</span>}
                        </div>
                      </div>
                      {post.is_ppv && (
                        <span className="text-green-400 font-bold">${post.price}</span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => setViewingComments({ type: 'post', id: post.id, title: post.caption })}
                      className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm py-2 rounded-lg transition-colors"
                    >
                      View {postComments.length} Comments
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === 'brainstorm' && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            <div className="bg-gradient-to-br from-pink-950/40 to-red-950/40 border-2 border-pink-500/30 rounded-2xl p-6">
              <h3 className="text-white text-xl font-bold mb-2 flex items-center gap-2">
                💡 Content Brainstorming
              </h3>
              <p className="text-gray-400 mb-4">
                Discuss ideas together. Plan your next explicit content.
              </p>
              
              {!brainstormIdea ? (
                <button
                  onClick={handleBrainstorm}
                  disabled={brainstorming}
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 text-white font-medium py-4 rounded-xl transition-all disabled:opacity-50"
                >
                  {brainstorming ? 'Brainstorming...' : 'Brainstorm New Ideas Together'}
                </button>
              ) : (
                <div className="space-y-3">
                  {brainstormIdea.map((idea, i) => (
                    <div key={i} className="bg-gray-800 rounded-xl p-4">
                      <h4 className="text-white font-bold mb-2">{idea.title}</h4>
                      <p className="text-gray-300 text-sm mb-2">{idea.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-green-400 text-sm">Est. ${idea.estimated_earnings}</span>
                        <button
                          onClick={() => handleUseIdea(idea)}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg text-sm transition-all"
                        >
                          Use This Idea
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setBrainstormIdea(null)}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-gray-400 py-2 rounded-lg text-sm"
                  >
                    ← Back
                  </button>
                </div>
              )}
            </div>

            <div className="bg-gray-800 rounded-xl p-4">
              <h4 className="text-white font-medium mb-3">Quick Content Suggestions</h4>
              <div className="space-y-2 text-sm">
                <button onClick={() => { setTab('create'); setSelectedCategory('solo'); setNewVideo({...newVideo, content_type: 'Masturbating with toys, multiple orgasms'}); }} className="w-full bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 text-left px-3 py-2 rounded-lg text-gray-300">
                  💋 Solo Masturbation Session
                </button>
                <button onClick={() => { setTab('create'); setSelectedCategory('couple'); setNewVideo({...newVideo, content_type: 'Passionate fucking, multiple positions, creampie'}); }} className="w-full bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 text-left px-3 py-2 rounded-lg text-gray-300">
                  💑 Couple Sex Tape
                </button>
                <button onClick={() => { setTab('create'); setSelectedCategory('vampiresolo'); setNewVideo({...newVideo, content_type: 'Vampire jerking off, showing everything'}); }} className="w-full bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 text-left px-3 py-2 rounded-lg text-gray-300">
                  🦇 Vampire Solo Content
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'merch' && (
          <OnlyFangsMerch
            servant={servant}
            profile={servantProfile}
            onClose={() => setTab('profile')}
          />
        )}

        {tab === 'collab' && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            {collabOutcome ? (
              <div className="text-center py-12">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-gray-300 text-lg"
                >
                  {collabOutcome}
                </motion.p>
              </div>
            ) : collabing ? (
              <div className="text-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="text-6xl mb-4"
                >
                  🎥
                </motion.div>
                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-gray-400"
                >
                  Filming collaboration...
                </motion.p>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-pink-950/40 to-purple-950/40 border-2 border-pink-500/30 rounded-2xl p-6">
                <h3 className="text-white text-2xl font-bold mb-2">Creator Collaborations</h3>
                <p className="text-gray-400 mb-6">
                  Team up with other OnlyFangs creators. Massive exposure. Cross-promotion. Big earnings.
                </p>

                <div className="space-y-3 mb-6">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="text-white font-medium mb-2">Benefits</h4>
                    <ul className="text-gray-400 text-sm space-y-1">
                      <li>✓ Access to their subscriber base</li>
                      <li>✓ 2-5x normal earnings per video</li>
                      <li>✓ Huge reputation boost</li>
                      <li>✓ Crossover fans</li>
                      <li>✓ Elite content opportunities</li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={handleCollab}
                  disabled={collabing || servantProfile.reputation < 40}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 text-white font-medium py-4 rounded-xl transition-all disabled:opacity-50"
                >
                  {servantProfile.reputation < 40 ? 'Need 40+ Reputation' : 'Find Collaboration Partner'}
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
      
      <AnimatePresence>
        {creatingPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90"
            onClick={() => setCreatingPost(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full relative"
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setCreatingPost(false);
                }} 
                className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 touch-manipulation p-2"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-white text-xl font-bold mb-4">Post New Picture</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm">Caption</label>
                  <input
                    type="text"
                    value={newPost.caption}
                    onChange={(e) => setNewPost({...newPost, caption: e.target.value})}
                    placeholder="Your caption..."
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 mt-1"
                  />
                </div>

                <div>
                  <label className="text-gray-400 text-sm">What's in the picture?</label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                    placeholder="Describe what you're showing... Be explicit."
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 mt-1 h-24"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <input
                      type="checkbox"
                      checked={newPost.is_ppv}
                      onChange={(e) => setNewPost({...newPost, is_ppv: e.target.checked})}
                      className="rounded"
                    />
                    Lock as PPV (pay to view)
                  </label>
                  
                  {newPost.is_ppv && (
                    <div className="flex gap-2">
                      {[5, 10, 15, 20, 30].map(price => (
                        <button
                          key={price}
                          onClick={() => setNewPost({...newPost, price})}
                          className={`px-4 py-2 rounded-lg ${newPost.price === price ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                        >
                          ${price}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCreatingPost(false)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePost}
                    disabled={!newPost.caption || !newPost.content}
                    className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 text-white py-3 rounded-xl transition-all disabled:opacity-50"
                  >
                    Post
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {viewingComments && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setViewingComments(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto relative"
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setViewingComments(null);
                }} 
                className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 touch-manipulation p-2"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-white text-xl font-bold mb-2 pr-8">{viewingComments.title}</h3>
              <p className="text-gray-400 text-sm mb-4">Comments</p>
              
              <div className="space-y-3">
                {allComments
                  .filter(c => viewingComments.type === 'video' ? c.video_id === viewingComments.id : c.post_id === viewingComments.id)
                  .map(comment => (
                    <div key={comment.id} className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-purple-400 font-medium text-sm">{comment.username}</span>
                        {comment.tip > 0 && (
                          <span className="text-green-400 text-xs">💵 ${comment.tip}</span>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm">{comment.comment}</p>
                    </div>
                  ))}
              </div>
              
              <button
                onClick={() => setViewingComments(null)}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl mt-4 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}

        {showMerch && (
          <OnlyFangsMerch
            servant={servant}
            profile={servantProfile}
            onClose={() => setShowMerch(false)}
          />
        )}

        {filmingOutcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 overflow-hidden"
          >
            {/* Sexy animated background effects */}
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={`heart-${i}`}
                className="absolute text-4xl"
                initial={{ 
                  x: `${Math.random() * 100}%`,
                  y: '110%',
                  opacity: 0,
                  rotate: 0
                }}
                animate={{ 
                  y: '-10%',
                  opacity: [0, 0.8, 0],
                  rotate: 360
                }}
                transition={{ 
                  duration: 4 + Math.random() * 2,
                  delay: Math.random() * 3,
                  ease: 'easeOut'
                }}
              >
                {['❤️', '💋', '🔥', '💦'][Math.floor(Math.random() * 4)]}
              </motion.div>
            ))}



            {/* Sparkle effects */}
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={`sparkle-${i}`}
                className="absolute text-2xl"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                initial={{ 
                  opacity: 0,
                  scale: 0
                }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 1.5,
                  delay: Math.random() * 4,
                  repeat: Infinity
                }}
              >
                ✨
              </motion.div>
            ))}

            {/* Heat wave effect */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(255, 50, 100, 0.2) 0%, transparent 70%)'
              }}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full text-center border border-red-500/30 relative z-10"
            >
              <motion.div 
                className="text-5xl mb-4"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, -10, 10, 0]
                }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity
                }}
              >
                🎥
              </motion.div>
              <motion.p 
                className="text-gray-300 text-lg leading-relaxed"
                animate={{ 
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity
                }}
              >
                {filmingOutcome}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}