import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Video, DollarSign, Users, TrendingUp, Eye, Star, Lock, Unlock, Percent, MessageCircle, Gift, Award, BarChart3, Package, Zap, AlertTriangle, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import OnlyFangsMerch from './OnlyFangsMerch';
import StalkerManagement from './StalkerManagement';

const getGenderExamples = (vampireGender) => {
  const isFemale = vampireGender === 'woman';
  
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
  clothed: { label: 'Clothed/Lingerie', icon: '👙', examples: ['Lingerie try-on haul', 'Strip tease in lingerie', 'Modeling new outfits', 'Teasing in silk', 'Bra and panties showcase'], minRep: 0 },
  softcore: { label: 'Softcore/Implied', icon: '🌸', examples: ['Covered nudity in bed', 'Implied touching under sheets', 'Suggestive poses', 'Sensual but not explicit'], minRep: 0 },
  pov: { label: 'POV', icon: '👁️', examples: ['Your view while I ride you', 'On my knees for you', 'Waking up together', 'Between my legs'], minRep: 0 },
  roleplay: { label: 'Roleplay', icon: '🎭', examples: ['Vampire seduction', 'Your obedient servant', 'Master and pet', 'Forbidden encounter'], minRep: 0 },
  teasing: { label: 'Teasing', icon: '😈', examples: ['Strip tease', 'Almost showing everything', 'Teasing touches', 'Denial game'], minRep: 0 },
  intimate: { label: 'Intimate', icon: '💖', examples: ['Making love to camera', 'Passionate moaning', 'Multiple orgasms', 'Intimate closeups'], minRep: 0 },
  dominant: { label: 'Dominant', icon: '👑', examples: ['Ordering you around', 'Making you beg', 'Degradation', 'You\'re mine'], minRep: 20 },
  submissive: { label: 'Submissive', icon: '🙇', examples: ['On my knees', 'Please use me', 'Your obedient toy', 'Taking orders'], minRep: 20 },
  cosplay: { label: 'Cosplay', icon: '🦇', examples: ['Gothic vampire', 'Dark angel', 'Succubus', 'Witch'], minRep: 30 },
  shower: { label: 'Shower', icon: '🚿', examples: ['Wet and soapy', 'Shower masturbation', 'Getting clean, getting dirty'], minRep: 30 },
  bedroom: { label: 'Bedroom', icon: '🛏️', examples: ['Morning in bed', 'Pillow humping', 'Sheets and moans'], minRep: 40 },
  public: { label: 'Public Risk', icon: '🌙', examples: ['In the car', 'Risky location', 'Almost caught'], minRep: 50 },
  fetish: { label: 'Fetish', icon: '⛓️', examples: ['Feet worship', 'Bondage', 'Latex & leather'], minRep: 60 },
  threesome: { label: 'Threesome', icon: '👥', examples: ['Adding a third person', 'Group fun on camera'], minRep: 70 },
  extreme: { label: 'Extreme', icon: '💥', examples: ['Pushing all limits', 'Extreme insertion'], minRep: 80 }
};

const getSubscriptionTiers = (servantId) => [
  { id: 'basic', price: 5, name: 'Basic', perks: ['Access to feed', 'Like & comment'] },
  { id: 'premium', price: 10, name: 'Premium', perks: ['All Basic perks', '10% off PPV', 'Weekly exclusive'] },
  { id: 'vip', price: 20, name: 'VIP', perks: ['All Premium perks', '25% off PPV', 'Priority DMs', 'Custom content requests'] }
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
  const [tab, setTab] = useState('content');
  
  const genderExamples = getGenderExamples(vampireState.gender);
  const updatedCategories = {
    ...VIDEO_CATEGORIES,
    couple: { ...VIDEO_CATEGORIES.couple, examples: genderExamples.couple },
    filmed: { ...VIDEO_CATEGORIES.filmed, examples: genderExamples.filmed },
    vampiresolo: { ...VIDEO_CATEGORIES.vampiresolo, examples: genderExamples.vampiresolo }
  };

  const [contentType, setContentType] = useState(null);
  const [creating, setCreating] = useState(false);
  const [filming, setFilming] = useState(false);
  const [filmingOutcome, setFilmingOutcome] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filmWithVampire, setFilmWithVampire] = useState(null);
  const [newVideo, setNewVideo] = useState({ title: '', content_type: '', price: 15 });
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ username: '', bio: '', profile_pic: '🦇', is_couple: true });
  const [livestreaming, setLivestreaming] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [ppvMessage, setPpvMessage] = useState({ text: '', price: 20, videoId: null });
  const [sendingPpv, setSendingPpv] = useState(false);
  const [newPost, setNewPost] = useState({ caption: '', content: '', is_ppv: false, price: 0 });
  const [viewingComments, setViewingComments] = useState(null);
  const [showMerch, setShowMerch] = useState(false);
  const [selectedTier, setSelectedTier] = useState('basic');
  const [dmMessages, setDmMessages] = useState([]);
  const [sendingDm, setSendingDm] = useState(false);
  const [paidDmData, setPaidDmData] = useState({ message: '', price: 10 });
  const [meetGreetData, setMeetGreetData] = useState({ price: 500, slots: 5 });
  const [schedulingMeet, setSchedulingMeet] = useState(false);
  const [creatingPoll, setCreatingPoll] = useState(false);
  const [pollData, setPollData] = useState({ question: '', options: ['', ''] });
  const [activePoll, setActivePoll] = useState(null);
  const [showStalkers, setShowStalkers] = useState(false);

  const { data: profile = [] } = useQuery({
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

  const { data: stalkers = [] } = useQuery({
    queryKey: ['stalkers', servant.id],
    queryFn: () => base44.entities.Stalker.filter({ servant_id: servant.id }),
    staleTime: 3000
  });

  // Randomly spawn stalker
  React.useEffect(() => {
    if (servantProfile && servantProfile.subscriber_count > 100 && Math.random() > 0.95 && stalkers.length < 3) {
      const usernames = ['DarkObsessed', 'NightWatcher99', 'AlwaysWatching', 'YourBiggestFan', 'ShadowFollower'];
      const behaviors = [
        'Comments on every single post',
        'Watches every livestream',
        'Sends multiple messages daily',
        'Screenshots all your content'
      ];
      
      base44.entities.Stalker.create({
        servant_id: servant.id,
        platform: 'onlyfangs',
        username: usernames[Math.floor(Math.random() * usernames.length)],
        obsession_level: Math.floor(Math.random() * 30) + 20,
        danger_level: 'harmless',
        behavior_patterns: [behaviors[Math.floor(Math.random() * behaviors.length)]]
      }).then(() => queryClient.invalidateQueries(['stalkers']));
    }
  }, [servantProfile?.subscriber_count]);

  // Escalate existing stalkers
  React.useEffect(() => {
    if (stalkers.length > 0 && Math.random() > 0.9) {
      const stalker = stalkers[Math.floor(Math.random() * stalkers.length)];
      if (stalker.obsession_level < 90 && !stalker.blocked) {
        const newBehaviors = [
          'Asked for personal info',
          'Tried to find your address',
          'Mentioned knowing your schedule',
          'Talked about meeting you',
          'Got aggressive when ignored'
        ];
        
        const newObsession = Math.min(100, stalker.obsession_level + 10);
        const newDanger = newObsession > 80 ? 'critical' : newObsession > 60 ? 'dangerous' : newObsession > 40 ? 'threatening' : 'concerning';
        
        base44.entities.Stalker.update(stalker.id, {
          obsession_level: newObsession,
          danger_level: newDanger,
          behavior_patterns: [...(stalker.behavior_patterns || []), newBehaviors[Math.floor(Math.random() * newBehaviors.length)]].slice(-5)
        }).then(() => queryClient.invalidateQueries(['stalkers']));
      }
    }
  }, [videos.length, posts.length]);

  const isTabLoading = (tabName) => {
    if (tabName === 'content') return videosLoading || postsLoading;
    return false;
  };

  const servantProfile = profile[0];
  const hasProfile = !!servantProfile;

  const topFans = React.useMemo(() => {
    if (!servantProfile) return [];
    const fanNamePool = [
      'DarkLover69', 'VampireFan420', 'NightStalker', 'BloodThirsty', 'GothKing', 'ShadowQueen',
      'LustfulNight', 'EternalDesire', 'MidnightCrave', 'CrimsonFan', 'ObsessedOne', 'DevotedSub'
    ];
    
    const seed = servant.id?.charCodeAt(0) || 0;
    const shuffled = [...fanNamePool].sort(() => 0.5 - ((seed * 9301 + 49297) % 233280) / 233280);
    
    return shuffled.slice(0, 5).map((name, i) => ({
      name,
      spent: Math.floor(servantProfile.revenue * (0.3 - i * 0.05)),
      tier: i === 0 ? 'VIP' : i < 3 ? 'Premium' : 'Basic'
    }));
  }, [servantProfile?.revenue, servant.id]);

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
      entry: `You and ${servant.name} created an OnlyFangs account. The night just got more interesting.`,
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
      
      const isVampFemale = vampireState.gender === 'woman';
      const filmingOutcomes = isVampFemale ? [
        'You held the camera. Watched them perform. Got so wet watching. Had to put the camera down and join.',
        'Behind the lens. Filming them. They looked at you with those eyes. You couldn\'t resist anymore.',
        'You directed them. "Touch yourself there." They obeyed. You were dripping by the end.',
        'Filming session became a fucking session. The camera kept rolling. Better content anyway.'
      ] : [
        'You held the camera. Watched them perform. Got hard watching. Had to put the camera down and join.',
        'Behind the lens. Filming them. They looked at you with those eyes. You couldn\'t resist anymore.',
        'You directed them. "Touch yourself there." They obeyed. You were aching by the end.',
        'Filming session became a fucking session. The camera kept rolling. Better content anyway.'
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

        const initialViews = Math.floor(Math.random() * 80) + 30;
        const purchases = Math.floor(initialViews * (Math.random() * 0.4 + 0.2));
        const earnings = purchases * newVideo.price;

        await base44.entities.OnlyFangsVideo.update(video.id, {
          views: initialViews,
          earnings: earnings,
          rating: Math.random() * 1.5 + 3.5
        });

        const newRevenue = servantProfile.revenue + earnings;
        const newSubs = servantProfile.subscriber_count + Math.floor(Math.random() * 15) + 5;
        const newRep = Math.min(100, servantProfile.reputation + Math.floor(Math.random() * 8) + 5);

        await base44.entities.OnlyFangsProfile.update(servantProfile.id, {
          revenue: newRevenue,
          subscriber_count: newSubs,
          reputation: newRep
        });

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
          setContentType(null);
          setSelectedCategory(null);
          setFilmWithVampire(null);
          setNewVideo({ title: '', content_type: '', price: 15 });
        }, 4000);
      }, 3000);
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

        const initialViews = isVampireSolo ? Math.floor(Math.random() * 100) + 50 : Math.floor(Math.random() * 50) + 10;
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
        setContentType(null);
        setSelectedCategory(null);
        setFilmWithVampire(null);
        setNewVideo({ title: '', content_type: '', price: 15 });
      }, 2500);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.content || !newPost.caption || creating) return;
    setCreating(true);
    
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

      const numComments = Math.floor(Math.random() * 6) + 3;
      const usernames = ['DarkLover69', 'VampireFan420', 'NightStalker', 'BloodThirsty', 'GothKing', 'ShadowQueen', 'LustfulNight', 'EternalDesire'];
      const comments = [
        'So fucking hot 🔥', 'Damn you look amazing', 'I need more of you', 'Perfect body',
        'This is everything', 'You\'re so sexy', 'Can\'t stop looking at this', 'Wow just wow'
      ];
      
      const usedNames = new Set();
      const commentPromises = [];
      
      for (let i = 0; i < numComments; i++) {
        let username = usernames[Math.floor(Math.random() * usernames.length)];
        let attempts = 0;
        while (usedNames.has(username) && attempts < 10) {
          username = usernames[Math.floor(Math.random() * usernames.length)];
          attempts++;
        }
        usedNames.add(username);
        
        commentPromises.push(
          base44.entities.OnlyFangsComment.create({
            servant_id: servant.id,
            post_id: post.id,
            username,
            comment: comments[Math.floor(Math.random() * comments.length)],
            tip: Math.random() > 0.7 ? Math.floor(Math.random() * 20) + 5 : 0
          })
        );
      }

      await Promise.all(commentPromises);

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
      setCreating(false);
      setContentType(null);
      setNewPost({ caption: '', content: '', is_ppv: false, price: 0 });
    }, 2000);
  };

  const handleLivestream = async (withVampire) => {
    setLivestreaming(true);
    setChatMessages([]);
    
    const initialMessages = [];
    const isVampFemale = vampireState.gender === 'woman';
    
    const explicitMessages = withVampire ? (isVampFemale ? [
      'Oh fuck yes take it', 'So hot together 💦', 'You\'re both so fucking hot', 'Best stream ever', 'Don\'t stop', 'I\'m so wet watching this',
      'Harder!', 'They\'re perfect together', 'Wish I was there', 'This is incredible', 'Keep going!', 'So beautiful', 'Amazing chemistry',
      'I can\'t look away', 'Hottest stream ever', 'You two are fire', 'Need more of this', 'Absolutely stunning', 'My favorite couple',
      'This is art', 'Pure passion', 'I\'m obsessed', 'Never stop streaming', 'Goals honestly', 'Making me feel things',
      'Touch them more', 'Yes yes yes!', 'Perfection', 'I love this so much', 'Take my money', 'Worth every penny'
    ] : [
      'Oh fuck yes breed her', 'Fill her up 💦', 'She\'s so fucking hot', 'Best stream ever', 'Harder daddy', 'Choke her please',
      'Make her scream', 'God she\'s perfect', 'I want to be her', 'Fuck her harder', 'She loves it', 'Amazing', 'So hot together',
      'Don\'t stop', 'Give it to her', 'She\'s taking it so well', 'Hottest couple ever', 'This is insane', 'Keep going',
      'Her moans 🔥', 'Destroy her', 'She\'s so lucky', 'I\'m so hard rn', 'Best content', 'Need more like this',
      'Pull her hair', 'She\'s incredible', 'You\'re both perfect', 'I can\'t stop watching', 'Take my money', 'Worth it'
    ]) : [
      'You\'re so fucking sexy', 'Touch yourself for us', 'So hot 🔥🔥', 'I want you so bad', 'Don\'t stop baby',
      'You look amazing', 'Keep going', 'I\'m so turned on', 'Perfect body', 'Show us more', 'You\'re incredible',
      'Best performer ever', 'I need you', 'So beautiful', 'This is everything', 'Can\'t get enough',
      'You\'re driving me crazy', 'Gorgeous', 'I\'m addicted to you', 'More please', 'Absolutely stunning',
      'Your moans 😍', 'I wish I was there', 'So wet watching you', 'You\'re perfect', 'Never stop',
      'Best stream ever', 'Take my money', 'Worth every second', 'I love you', 'Marry me'
    ];
    
    const usernames = ['DarkLover69', 'VampireFan420', 'NightStalker', 'BloodThirsty', 'GothKing', 'ShadowQueen', 'LustfulNight', 'EternalDesire', 'MidnightCrave', 'ObsessedOne'];
    const usedMessages = new Set();

    for (let i = 0; i < 6; i++) {
      let message = explicitMessages[Math.floor(Math.random() * explicitMessages.length)];
      let attempts = 0;
      while (usedMessages.has(message) && attempts < 10) {
        message = explicitMessages[Math.floor(Math.random() * explicitMessages.length)];
        attempts++;
      }
      usedMessages.add(message);

      initialMessages.push({
        username: usernames[Math.floor(Math.random() * usernames.length)],
        message,
        tip: Math.random() > 0.6 ? Math.floor(Math.random() * 50) + 5 : 0
      });
    }
    
    setChatMessages(initialMessages);
    
    const messageInterval = setInterval(() => {
      setChatMessages(prev => {
        const recentMessages = prev.slice(-5).map(m => m.message);
        let message = explicitMessages[Math.floor(Math.random() * explicitMessages.length)];
        let attempts = 0;
        while (recentMessages.includes(message) && attempts < 10) {
          message = explicitMessages[Math.floor(Math.random() * explicitMessages.length)];
          attempts++;
        }
        
        const newMsg = {
          username: usernames[Math.floor(Math.random() * usernames.length)],
          message,
          tip: Math.random() > 0.7 ? Math.floor(Math.random() * 50) + 5 : 0
        };
        return [...prev.slice(-10), newMsg];
      });
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
        'Livestream finished. You fucked on camera. Real. Raw. Unfiltered. They loved every second.',
      ] : [
        'Stream ended. You came on camera. Chat tipped like crazy. $' + earnings + ' earned.',
        'Livestream complete. Solo show. Perfect performance.',
      ];
      
      await base44.entities.NightLog.create({
        entry: outcomes[Math.floor(Math.random() * outcomes.length)],
        category: 'interaction',
        intensity: 'significant'
      });
      
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        setLivestreaming(false);
        setChatMessages([]);
      }, 3000);
    }, 12000);
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

  const handleSendDM = async (fanName) => {
    if (sendingDm) return;
    setSendingDm(true);
    
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are ${fanName}, a fan sending a DM to ${servant.name} on OnlyFangs. Generate a short, explicit, flirty message (under 20 words). Be sexual but not creepy.`,
        response_json_schema: {
          type: 'object',
          properties: { message: { type: 'string' } }
        }
      });
      
      const earnings = Math.floor(Math.random() * 30) + 10;
      
      await base44.entities.OnlyFangsProfile.update(servantProfile.id, {
        revenue: servantProfile.revenue + earnings
      });
      
      setDmMessages(prev => [...prev, {
        fan: fanName,
        message: response.message,
        tip: earnings,
        timestamp: new Date().toISOString()
      }]);
      
      queryClient.invalidateQueries();
    } catch (e) {
      const fallbackMessages = [
        "Hey beautiful, would love a custom video 😍",
        "You're so hot, can't stop thinking about you",
        "That last video was incredible 🔥"
      ];
      const earnings = Math.floor(Math.random() * 30) + 10;
      
      await base44.entities.OnlyFangsProfile.update(servantProfile.id, {
        revenue: servantProfile.revenue + earnings
      });
      
      setDmMessages(prev => [...prev, {
        fan: fanName,
        message: fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)],
        tip: earnings,
        timestamp: new Date().toISOString()
      }]);
      
      queryClient.invalidateQueries();
    }
    
    setSendingDm(false);
  };

  const handleSendPaidDM = async () => {
    if (!paidDmData.message || sendingDm) return;
    setSendingDm(true);
    
    setTimeout(async () => {
      const unlocks = Math.floor(servantProfile.subscriber_count * (Math.random() * 0.25 + 0.15));
      const earnings = unlocks * paidDmData.price;
      
      await base44.entities.OnlyFangsProfile.update(servantProfile.id, {
        revenue: servantProfile.revenue + earnings
      });
      
      await base44.entities.NightLog.create({
        entry: `Sent paid DM to all subscribers. ${unlocks} unlocked it. Earned $${earnings}.`,
        category: 'interaction',
        intensity: 'moderate'
      });
      
      queryClient.invalidateQueries();
      setPaidDmData({ message: '', price: 10 });
      setSendingDm(false);
    }, 2000);
  };

  const handleScheduleMeetGreet = async () => {
    setSchedulingMeet(true);
    
    setTimeout(async () => {
      const ticketsSold = Math.min(meetGreetData.slots, Math.floor(servantProfile.subscriber_count * (Math.random() * 0.15 + 0.05)));
      const earnings = ticketsSold * meetGreetData.price;
      
      await base44.entities.OnlyFangsProfile.update(servantProfile.id, {
        revenue: servantProfile.revenue + earnings,
        reputation: Math.min(100, servantProfile.reputation + 5)
      });
      
      const relBonus = Math.floor(Math.random() * 8) + 7;
      await base44.entities.Servant.update(servant.id, {
        relationship: Math.min(100, (servant.relationship || 0) + relBonus)
      });
      
      await base44.entities.NightLog.create({
        entry: `Meet & Greet complete. ${ticketsSold}/${meetGreetData.slots} fans attended. Earned $${earnings}.`,
        category: 'interaction',
        intensity: 'significant'
      });
      
      queryClient.invalidateQueries();
      setSchedulingMeet(false);
    }, 3000);
  };

  const handleCustomRequest = async () => {
    const requestPool = [
      { fan: 'DarkLover69', request: 'Shower video with my name written on your body', offer: 150 },
      { fan: 'VampireFan420', request: 'Roleplay: vampire seducing victim', offer: 200 },
      { fan: 'NightStalker', request: 'Feet content + face reveal', offer: 300 },
      { fan: 'GothKing', request: 'Video calling my name while you finish', offer: 250 }
    ];
    
    const request = requestPool[Math.floor(Math.random() * requestPool.length)];
    
    if (confirm(`${request.fan} wants: "${request.request}" - Offering $${request.offer}. Accept?`)) {
      await base44.entities.OnlyFangsProfile.update(servantProfile.id, {
        revenue: servantProfile.revenue + request.offer
      });
      
      await base44.entities.NightLog.create({
        entry: `Accepted custom request from ${request.fan}. Earned $${request.offer}.`,
        category: 'interaction',
        intensity: 'moderate'
      });
      
      queryClient.invalidateQueries();
    }
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

  const handleChangeTier = async (tierId) => {
    setSelectedTier(tierId);
    const tier = getSubscriptionTiers(servant.id).find(t => t.id === tierId);
    await base44.entities.NightLog.create({
      entry: `Changed subscription tier to ${tier.name} ($${tier.price}/month).`,
      category: 'interaction',
      intensity: 'subtle'
    });
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
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>

          <div className="text-6xl mb-4">🔥</div>
          <h2 className="text-2xl font-bold text-white mb-2">OnlyFangs</h2>
          <p className="text-gray-400 mb-6">
            Create adult content. Build an audience. Earn while you sleep.
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
                placeholder="Tell them about your account..."
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
                  ❤️ Couples
                </button>
                <button
                  onClick={() => setProfileData({...profileData, is_couple: false})}
                  className={`flex-1 py-3 rounded-lg transition-colors ${!profileData.is_couple ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                >
                  💋 Solo
                </button>
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
            <p className="text-gray-400 text-xs">Revenue</p>
          </div>
          <div className="bg-blue-950/30 rounded-lg p-3 border border-blue-800/30">
            <Video className="w-5 h-5 text-blue-400 mb-1" />
            <p className="text-white text-xl font-bold">{videos.length + posts.length}</p>
            <p className="text-gray-400 text-xs">Content</p>
          </div>
          <div className="bg-red-950/30 rounded-lg p-3 border border-red-800/30">
            <TrendingUp className="w-5 h-5 text-red-400 mb-1" />
            <p className="text-white text-xl font-bold">{servantProfile.reputation}/100</p>
            <p className="text-gray-400 text-xs">Reputation</p>
          </div>
        </div>

        {/* Stalker Alert */}
        {stalkers.filter(s => !s.blocked && s.danger_level !== 'harmless').length > 0 && (
          <div className="mb-4 bg-red-900/40 border-2 border-red-500/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-red-300 font-medium">
                  {stalkers.filter(s => !s.blocked && s.danger_level !== 'harmless').length} Active Stalker{stalkers.filter(s => !s.blocked && s.danger_level !== 'harmless').length > 1 ? 's' : ''}
                </span>
              </div>
              <button onClick={() => setShowStalkers(true)} className="text-red-400 hover:text-red-300 text-sm">
                Manage →
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button onClick={() => setTab('content')} className={`px-3 py-2 rounded-lg whitespace-nowrap text-sm ${tab === 'content' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            📹 Content
          </button>
          <button onClick={() => setTab('livestream')} className={`px-3 py-2 rounded-lg whitespace-nowrap text-sm ${tab === 'livestream' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            🔴 Live
          </button>
          <button onClick={() => setTab('ppv')} className={`px-3 py-2 rounded-lg whitespace-nowrap text-sm ${tab === 'ppv' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            💌 PPV
          </button>
          <button onClick={() => setTab('dms')} className={`px-3 py-2 rounded-lg whitespace-nowrap text-sm ${tab === 'dms' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            📱 DMs
          </button>
          <button onClick={() => setTab('fans')} className={`px-3 py-2 rounded-lg whitespace-nowrap text-sm ${tab === 'fans' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            👑 Fans
          </button>
          <button onClick={() => setTab('stalkers')} className={`px-3 py-2 rounded-lg whitespace-nowrap text-sm relative ${tab === 'stalkers' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            ⚠️ Stalkers
            {stalkers.filter(s => !s.blocked && s.danger_level !== 'harmless').length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {stalkers.filter(s => !s.blocked && s.danger_level !== 'harmless').length}
              </span>
            )}
          </button>
          <button onClick={() => setTab('meetgreet')} className={`px-3 py-2 rounded-lg whitespace-nowrap text-sm ${tab === 'meetgreet' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            🤝 Meet
          </button>
          <button onClick={() => setTab('tools')} className={`px-3 py-2 rounded-lg whitespace-nowrap text-sm ${tab === 'tools' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            ⚡ Tools
          </button>
          <button onClick={() => setTab('analytics')} className={`px-3 py-2 rounded-lg whitespace-nowrap text-sm ${tab === 'analytics' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            📊 Stats
          </button>
          <button onClick={() => setTab('profile')} className={`px-3 py-2 rounded-lg whitespace-nowrap text-sm ${tab === 'profile' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            ⚙️ Settings
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
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-6xl"
              >
                💋
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CONTENT TAB */}
        {tab === 'content' && !contentType && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setContentType('video')}
                className="bg-gradient-to-br from-purple-950/60 to-pink-950/60 border-2 border-purple-500/40 rounded-xl p-6 hover:scale-105 transition-all"
              >
                <div className="text-4xl mb-2">🎥</div>
                <h4 className="text-white font-bold">Post Video</h4>
                <p className="text-gray-400 text-xs mt-1">Create paid video content</p>
              </button>
              
              <button
                onClick={() => setContentType('photo')}
                className="bg-gradient-to-br from-pink-950/60 to-purple-950/60 border-2 border-pink-500/40 rounded-xl p-6 hover:scale-105 transition-all"
              >
                <div className="text-4xl mb-2">📷</div>
                <h4 className="text-white font-bold">Post Picture</h4>
                <p className="text-gray-400 text-xs mt-1">Share photo content</p>
              </button>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4">
              <h3 className="text-white font-medium mb-3">Your Content</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-900 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-white">{videos.length}</p>
                  <p className="text-gray-400 text-xs">Videos</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-white">{posts.length}</p>
                  <p className="text-gray-400 text-xs">Pictures</p>
                </div>
              </div>
            </div>

            {videos.length > 0 && (
              <div className="bg-gray-800/50 rounded-xl p-4">
                <h4 className="text-white font-medium mb-2">Recent Videos</h4>
                {videos.slice(0, 3).map(v => (
                  <div key={v.id} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0">
                    <span className="text-gray-300 text-sm truncate flex-1 pr-2">{v.title}</span>
                    <span className="text-green-400 text-xs">${v.earnings}</span>
                  </div>
                ))}
              </div>
            )}

            {posts.length > 0 && (
              <div className="bg-gray-800/50 rounded-xl p-4">
                <h4 className="text-white font-medium mb-2">Recent Pictures</h4>
                {posts.slice(0, 3).map(p => (
                  <div key={p.id} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0">
                    <span className="text-gray-300 text-sm truncate flex-1 pr-2">{p.caption}</span>
                    <span className="text-gray-400 text-xs">❤️ {p.likes}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIDEO CREATION */}
        {tab === 'content' && contentType === 'video' && !selectedCategory && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            <button onClick={() => setContentType(null)} className="text-purple-400 hover:text-purple-300 text-sm">
              ← Back
            </button>
            <h3 className="text-white text-xl font-bold">Select Video Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(updatedCategories).map(([key, cat]) => {
                const isLocked = cat.minRep > servantProfile.reputation;
                return (
                  <button
                    key={key}
                    onClick={() => !isLocked && setSelectedCategory(key)}
                    disabled={isLocked}
                    className={`bg-gray-800 rounded-xl p-4 text-center transition-all relative ${
                      isLocked ? 'opacity-40' : 'hover:bg-gray-700'
                    }`}
                  >
                    <div className="text-3xl mb-2">{cat.icon}</div>
                    <h4 className="text-white font-medium text-sm">{cat.label}</h4>
                    {isLocked && (
                      <span className="absolute top-2 right-2 text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded">
                        Rep {cat.minRep}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* VIDEO FORM */}
        {tab === 'content' && contentType === 'video' && selectedCategory && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <button
                onClick={() => { setSelectedCategory(null); setNewVideo({ title: '', content_type: '', price: 15 }); setFilmWithVampire(null); }}
                className="text-purple-400 hover:text-purple-300 text-sm"
              >
                ← Back
              </button>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{updatedCategories[selectedCategory].icon}</span>
                <span className="text-white font-bold">{updatedCategories[selectedCategory].label}</span>
              </div>
            </div>

            <textarea
              value={newVideo.content_type}
              onChange={(e) => setNewVideo({...newVideo, content_type: e.target.value})}
              placeholder="Describe your content..."
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 h-24"
            />
            
            {updatedCategories[selectedCategory].examples && (
              <details>
                <summary className="text-purple-400 text-xs cursor-pointer">💡 Ideas</summary>
                <div className="grid gap-1 mt-2 max-h-32 overflow-y-auto">
                  {updatedCategories[selectedCategory].examples.map(ex => (
                    <button
                      key={ex}
                      onClick={() => setNewVideo({...newVideo, content_type: ex})}
                      className="text-left text-xs text-gray-300 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded"
                    >
                      • {ex}
                    </button>
                  ))}
                </div>
              </details>
            )}

            <div>
              <label className="text-gray-400 text-sm">Price</label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[0, 10, 15, 25, 50].map(price => (
                  <button
                    key={price}
                    onClick={() => setNewVideo({...newVideo, price})}
                    className={`px-4 py-3 rounded-lg ${newVideo.price === price ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                  >
                    {price === 0 ? 'FREE' : `$${price}`}
                  </button>
                ))}
              </div>
            </div>

            {['filmed', 'couple'].includes(selectedCategory) && filmWithVampire === null && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFilmWithVampire(false)}
                  className="bg-purple-900/40 border-2 border-purple-500/50 rounded-lg py-3 text-white"
                >
                  Solo 💋
                </button>
                <button
                  onClick={() => setFilmWithVampire(true)}
                  className="bg-red-900/40 border-2 border-red-500/50 rounded-lg py-3 text-white"
                >
                  With Vampire 🔥
                </button>
              </div>
            )}

            <button
              onClick={handleCreateVideo}
              disabled={!newVideo.content_type || creating || filming || (['filmed', 'couple'].includes(selectedCategory) && filmWithVampire === null)}
              className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 text-white font-bold py-4 rounded-xl disabled:opacity-50"
            >
              {filming ? '🎥 Filming...' : creating ? '⚡ Processing...' : '📤 POST VIDEO'}
            </button>
          </div>
        )}

        {/* PHOTO FORM */}
        {tab === 'content' && contentType === 'photo' && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            <button onClick={() => setContentType(null)} className="text-purple-400 hover:text-purple-300 text-sm">
              ← Back
            </button>
            <h3 className="text-white text-xl font-bold">Post Picture</h3>
            
            <input
              type="text"
              value={newPost.caption}
              onChange={(e) => setNewPost({...newPost, caption: e.target.value})}
              placeholder="Your caption..."
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2"
            />

            <textarea
              value={newPost.content}
              onChange={(e) => setNewPost({...newPost, content: e.target.value})}
              placeholder="Describe what you're showing..."
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 h-24"
            />

            <label className="flex items-center gap-2 text-gray-400 text-sm">
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
                {[5, 10, 15, 20].map(price => (
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

            <button
              onClick={handleCreatePost}
              disabled={!newPost.caption || !newPost.content || creating}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 text-white py-3 rounded-xl disabled:opacity-50"
            >
              {creating ? 'Posting...' : '📸 POST PICTURE'}
            </button>
          </div>
        )}

        {/* LIVESTREAM TAB */}
        {tab === 'livestream' && !livestreaming && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            <div className="bg-gradient-to-br from-red-950/40 to-pink-950/40 border-2 border-red-500/30 rounded-2xl p-6 text-center">
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-4">
                🔴
              </motion.div>
              <h3 className="text-white text-2xl font-bold mb-2">Start Livestream</h3>
              <p className="text-gray-300 mb-6">Live. Raw. Real-time audience.</p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => handleLivestream(false)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-4 rounded-xl"
                >
                  Go Live Solo 💋
                </button>
                {servantProfile.is_couple_account && (
                  <button
                    onClick={() => handleLivestream(true)}
                    className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-medium py-4 rounded-xl"
                  >
                    Go Live Together 💑
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'livestream' && livestreaming && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
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
              
              <div className="bg-black/40 rounded-xl p-3 h-48 overflow-y-auto space-y-2">
                {chatMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gray-800/60 rounded-lg p-2"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-pink-400 text-xs font-bold">{msg.username}</span>
                      {msg.tip > 0 && <span className="text-green-400 text-xs">💵 ${msg.tip}</span>}
                    </div>
                    <p className="text-gray-300 text-sm">{msg.message}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PPV TAB */}
        {tab === 'ppv' && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            <div className="bg-gradient-to-br from-pink-950/40 to-purple-950/40 border-2 border-pink-500/30 rounded-2xl p-6">
              <h3 className="text-white text-xl font-bold mb-2">💌 Send PPV Message</h3>
              <p className="text-gray-400 text-sm mb-4">Send locked video to all {servantProfile.subscriber_count} subscribers</p>
              
              <textarea
                value={ppvMessage.text}
                onChange={(e) => setPpvMessage({...ppvMessage, text: e.target.value})}
                placeholder="Teasing message... 'Want to see what happened next? 😈'"
                className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 h-20 mb-3"
              />
              
              <select
                value={ppvMessage.videoId || ''}
                onChange={(e) => setPpvMessage({...ppvMessage, videoId: e.target.value})}
                className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 mb-3"
              >
                <option value="">Choose video...</option>
                {videos.map(v => (
                  <option key={v.id} value={v.id}>{v.title} (${v.price})</option>
                ))}
              </select>

              <div className="flex gap-2 mb-3">
                {[10, 15, 20, 30].map(price => (
                  <button
                    key={price}
                    onClick={() => setPpvMessage({...ppvMessage, price})}
                    className={`px-4 py-2 rounded-lg ${ppvMessage.price === price ? 'bg-pink-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                  >
                    ${price}
                  </button>
                ))}
              </div>

              <button
                onClick={handleSendPPV}
                disabled={!ppvMessage.text || !ppvMessage.videoId || sendingPpv}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 text-white font-medium py-3 rounded-xl disabled:opacity-50"
              >
                {sendingPpv ? 'Sending...' : `Send to ${servantProfile.subscriber_count} Subs`}
              </button>
            </div>
          </div>
        )}

        {/* DMS TAB */}
        {tab === 'dms' && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            <div className="bg-gradient-to-br from-purple-950/40 to-pink-950/40 border-2 border-purple-500/30 rounded-2xl p-6">
              <h3 className="text-white text-xl font-bold mb-2">📱 Direct Messages</h3>
              
              <div className="bg-gray-800 rounded-xl p-4 mb-4">
                <h4 className="text-white font-medium mb-2">Send Paid DM</h4>
                <textarea
                  value={paidDmData.message}
                  onChange={(e) => setPaidDmData({...paidDmData, message: e.target.value})}
                  placeholder="Locked message... 'I did something naughty 😈'"
                  className="w-full bg-gray-900 text-white rounded-lg px-3 py-2 h-16 mb-3"
                />
                
                <div className="flex gap-2 mb-3">
                  {[5, 10, 15, 25].map(price => (
                    <button
                      key={price}
                      onClick={() => setPaidDmData({...paidDmData, price})}
                      className={`px-3 py-2 rounded-lg ${paidDmData.price === price ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'}`}
                    >
                      ${price}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={handleSendPaidDM}
                  disabled={!paidDmData.message || sendingDm}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 text-white py-2 rounded-xl disabled:opacity-50"
                >
                  {sendingDm ? 'Sending...' : `Send to ${servantProfile.subscriber_count} Subs`}
                </button>
              </div>
              
              <div className="border-t border-gray-700 pt-4">
                <button
                  onClick={() => handleSendDM(topFans[Math.floor(Math.random() * topFans.length)]?.name || 'VampireFan420')}
                  disabled={sendingDm}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg mb-3"
                >
                  {sendingDm ? 'Checking...' : 'Check Inbox'}
                </button>
                
                <div className="space-y-2 max-h-[30vh] overflow-y-auto">
                  {dmMessages.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 text-sm">No messages</p>
                  ) : (
                    dmMessages.map((dm, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-gray-800 rounded-lg p-3"
                      >
                        <div className="flex justify-between mb-1">
                          <span className="text-purple-400 font-medium text-sm">{dm.fan}</span>
                          <span className="text-green-400 text-sm">+${dm.tip}</span>
                        </div>
                        <p className="text-gray-300 text-sm">{dm.message}</p>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FANS TAB */}
        {tab === 'fans' && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            <div className="bg-gradient-to-br from-yellow-950/40 to-amber-950/40 border-2 border-yellow-500/30 rounded-2xl p-6">
              <h3 className="text-white text-xl font-bold mb-4">👑 Top Fans</h3>
              <div className="space-y-2">
                {topFans.map((fan, i) => (
                  <div key={fan.name} className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{i === 0 ? '👑' : '⭐'}</span>
                      <div>
                        <p className="text-white font-medium">{fan.name}</p>
                        <p className="text-gray-400 text-xs">{fan.tier}</p>
                      </div>
                    </div>
                    <p className="text-green-400 font-bold">${fan.spent}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCustomRequest}
                className="bg-purple-900/40 border border-purple-500/30 rounded-xl p-4 text-left"
              >
                <h4 className="text-white font-medium mb-1">Custom Request</h4>
                <p className="text-gray-400 text-xs">Premium content</p>
              </button>

              <button
                onClick={() => setTab('meetgreet')}
                className="bg-blue-900/40 border border-blue-500/30 rounded-xl p-4 text-left"
              >
                <h4 className="text-white font-medium mb-1">Meet & Greet</h4>
                <p className="text-gray-400 text-xs">In-person event</p>
              </button>
            </div>

            <div className="bg-gray-800 rounded-xl p-4">
              <h4 className="text-white font-medium mb-3">💝 Wishlist</h4>
              <div className="grid grid-cols-2 gap-2">
                {WISHLIST_ITEMS.map(item => (
                  <button
                    key={item.name}
                    onClick={() => handleWishlistPurchase(item)}
                    className="bg-gray-900 hover:bg-gray-700 rounded-lg p-3 text-left"
                  >
                    <div className="text-3xl mb-1">{item.icon}</div>
                    <p className="text-white text-sm">{item.name}</p>
                    <p className="text-green-400 text-xs">${item.cost}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MEET & GREET TAB */}
        {tab === 'meetgreet' && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            {schedulingMeet ? (
              <div className="text-center py-12">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }} className="text-6xl mb-4">
                  🤝
                </motion.div>
                <p className="text-gray-400">Scheduling event...</p>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-purple-950/40 to-pink-950/40 border-2 border-purple-500/30 rounded-2xl p-6">
                <h3 className="text-white text-2xl font-bold mb-2">🤝 Meet & Greet</h3>
                <p className="text-gray-400 mb-6">Host in-person event for top fans</p>

                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Ticket Price</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[250, 500, 1000].map(price => (
                        <button
                          key={price}
                          onClick={() => setMeetGreetData({...meetGreetData, price})}
                          className={`px-4 py-3 rounded-lg ${meetGreetData.price === price ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                        >
                          ${price}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Slots</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[5, 10, 20].map(slots => (
                        <button
                          key={slots}
                          onClick={() => setMeetGreetData({...meetGreetData, slots})}
                          className={`px-4 py-3 rounded-lg ${meetGreetData.slots === slots ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                        >
                          {slots} fans
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleScheduleMeetGreet}
                    disabled={servantProfile.reputation < 50}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 text-white font-medium py-4 rounded-xl disabled:opacity-50"
                  >
                    {servantProfile.reputation < 50 ? 'Need 50+ Rep' : 'Schedule Event'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TOOLS TAB */}
        {tab === 'tools' && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            <button
              onClick={handleFreeTrial}
              className="w-full bg-green-900/40 border border-green-500/30 rounded-xl p-4 text-left"
            >
              <h4 className="text-white font-medium mb-1">🎁 24h Free Trial</h4>
              <p className="text-gray-400 text-sm">Gain +30-80 subscribers</p>
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
                onClick={handleCreatePoll}
                disabled={!pollData.question || pollData.options.filter(o => o).length < 2 || creatingPoll}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white py-2 rounded-lg disabled:opacity-50"
              >
                {creatingPoll ? 'Creating...' : 'Create Poll'}
              </button>
            </div>

            {activePoll && (
              <div className="bg-gray-800 rounded-xl p-4">
                <h4 className="text-white font-medium mb-3">{activePoll.question}</h4>
                {activePoll.results.map((r, i) => (
                  <div key={i} className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{r.option}</span>
                      <span className="text-purple-400">{r.votes} votes</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div style={{ width: `${(r.votes / Math.max(...activePoll.results.map(x => x.votes))) * 100}%` }} className="h-2 bg-purple-500 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="text-white font-medium mb-2 block">Subscription Tier</label>
              <div className="space-y-2">
                {getSubscriptionTiers(servant.id).map(tier => (
                  <button
                    key={tier.id}
                    onClick={() => handleChangeTier(tier.id)}
                    className={`w-full rounded-lg p-3 text-left ${selectedTier === tier.id ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                  >
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{tier.name}</span>
                      <span className="font-bold">${tier.price}/mo</span>
                    </div>
                    <p className="text-xs opacity-75">{tier.perks.join(' • ')}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {tab === 'analytics' && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            <div className="bg-gradient-to-br from-blue-950/40 to-purple-950/40 border-2 border-blue-500/30 rounded-2xl p-6">
              <h3 className="text-white text-xl font-bold mb-4">📊 Analytics</h3>
              
              {analytics.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Create content to see stats</p>
              ) : (
                <div className="space-y-3">
                  {analytics.map(cat => (
                    <div key={cat.category} className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <h4 className="text-white font-medium">{cat.category}</h4>
                        <span className="text-green-400 font-bold">${cat.earnings}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <p className="text-gray-500">Videos</p>
                          <p className="text-white">{cat.count}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Views</p>
                          <p className="text-white">{cat.views}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Avg</p>
                          <p className="text-white">${cat.avgEarnings}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STALKERS TAB */}
        {tab === 'stalkers' && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            {stalkers.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-green-400 mx-auto mb-4 opacity-50" />
                <p className="text-gray-400">No stalkers detected. You're safe for now.</p>
              </div>
            ) : (
              stalkers.map(stalker => {
                const DANGER_COLORS = {
                  harmless: 'bg-gray-700 text-gray-300',
                  concerning: 'bg-yellow-900/50 text-yellow-300',
                  threatening: 'bg-orange-900/50 text-orange-300',
                  dangerous: 'bg-red-900/50 text-red-300',
                  critical: 'bg-red-600 text-white'
                };
                
                return (
                  <div key={stalker.id} className="bg-gray-800 rounded-xl p-4 border-2 border-red-900/30">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-white font-bold">{stalker.username}</h3>
                        {stalker.real_name && (
                          <p className="text-red-400 text-sm">Real: {stalker.real_name}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded text-xs ${DANGER_COLORS[stalker.danger_level]}`}>
                          {stalker.danger_level}
                        </span>
                        <p className="text-gray-400 text-xs mt-1">{stalker.obsession_level}% obsessed</p>
                      </div>
                    </div>

                    {stalker.behavior_patterns?.length > 0 && (
                      <div className="mb-3 bg-black/40 rounded p-2">
                        <p className="text-red-300 text-xs font-medium mb-1">Recent Activity:</p>
                        {stalker.behavior_patterns.slice(-3).map((behavior, i) => (
                          <p key={i} className="text-gray-400 text-xs">• {behavior}</p>
                        ))}
                      </div>
                    )}

                    {stalker.has_address && (
                      <div className="mb-3 bg-red-900/30 border border-red-500/50 rounded p-2">
                        <p className="text-red-300 text-xs font-bold">⚠️ THEY KNOW YOUR ADDRESS</p>
                      </div>
                    )}

                    <button
                      onClick={() => setShowStalkers(true)}
                      className="w-full bg-red-900/40 hover:bg-red-900/60 text-red-300 py-2 rounded-lg text-sm"
                    >
                      Manage Stalker
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* PROFILE/SETTINGS TAB */}
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

            <button onClick={() => setShowMerch(true)} className="w-full bg-purple-900/40 border border-purple-500/30 text-white py-3 rounded-xl">
              🛍️ Merch Store
            </button>
            
            <button onClick={handleQuit} className="w-full bg-red-900/40 border border-red-500/30 text-red-300 py-3 rounded-xl">
              Quit OnlyFangs
            </button>
          </div>
        )}

        <AnimatePresence>
          {showStalkers && (
            <StalkerManagement
              servant={servant}
              onClose={() => setShowStalkers(false)}
            />
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
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
            >
              <motion.div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full text-center">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }} className="text-5xl mb-4">
                  🎥
                </motion.div>
                <p className="text-gray-300 text-lg">{filmingOutcome}</p>
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
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-900 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              >
                <h3 className="text-white text-xl font-bold mb-4">{viewingComments.title}</h3>
                
                <div className="space-y-3">
                  {allComments
                    .filter(c => viewingComments.type === 'video' ? c.video_id === viewingComments.id : c.post_id === viewingComments.id)
                    .map(comment => (
                      <div key={comment.id} className="bg-gray-800 rounded-lg p-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-purple-400 font-medium text-sm">{comment.username}</span>
                          {comment.tip > 0 && <span className="text-green-400 text-xs">💵 ${comment.tip}</span>}
                        </div>
                        <p className="text-gray-300 text-sm">{comment.comment}</p>
                      </div>
                    ))}
                </div>
                
                <button onClick={() => setViewingComments(null)} className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl mt-4">
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}