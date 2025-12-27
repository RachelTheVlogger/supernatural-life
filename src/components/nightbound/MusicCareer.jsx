import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Music, DollarSign, Users, Heart, Flame, ShoppingBag, Award, Mic, Video, Newspaper } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import MusicEquipment from './MusicEquipment';
import DancingSlider from './DancingSlider';

export default function MusicCareer({ human, onClose }) {
  const [activeTab, setActiveTab] = useState('create');
  const [creating, setCreating] = useState(false);
  const [performing, setPerforming] = useState(false);
  const [newSong, setNewSong] = useState({ 
    title: '', 
    genre: 'pop', 
    vibe: 'upbeat',
    contentType: 'clean',
    lyrics: ''
  });
  const [performanceOutcome, setPerformanceOutcome] = useState(null);
  const [vampireEvent, setVampireEvent] = useState(null);
  const [tourPlan, setTourPlan] = useState(null);
  const [fanInteraction, setFanInteraction] = useState(null);
  const [songs, setSongs] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [showEquipment, setShowEquipment] = useState(false);
  const [creatingAlbum, setCreatingAlbum] = useState(false);
  const [newAlbum, setNewAlbum] = useState({ title: '', selectedSongs: [] });
  const [showDancing, setShowDancing] = useState(false);
  const queryClient = useQueryClient();

  const { data: vampires = [] } = useQuery({
    queryKey: ['vampireState'],
    queryFn: () => base44.entities.VampireState.list()
  });

  const vampire = vampires[0];

  const createSong = async () => {
    if (!newSong.title) return;
    setCreating(true);

    const equipmentBonus = equipment.reduce((sum, item) => sum + item.quality, 0);
    const baseStreams = newSong.contentType === 'explicit_sexual' ? 8000 : 
                       newSong.contentType === 'dark' ? 6000 : 
                       newSong.contentType === 'romantic' ? 4000 : 2000;
    const streams = Math.floor((Math.random() * 5000) + baseStreams) * (1 + equipmentBonus / 100);
    const earnings = Math.floor(streams / 10);

    const contentDescriptions = {
      clean: 'radio-friendly track',
      romantic: 'sensual love song',
      dark: 'haunting, disturbing piece',
      explicit_sexual: 'explicit, sexually charged anthem',
      vampire_themed: 'vampire-obsessed dark song'
    };

    const newSongData = {
      ...newSong,
      streams,
      earnings,
      id: Date.now()
    };

    setSongs(prev => [...prev, newSongData]);

    await base44.entities.NightLog.create({
      entry: `${human.name} released "${newSong.title}" (${contentDescriptions[newSong.contentType]}) - ${streams} streams, $${earnings}. ${newSong.contentType === 'explicit_sexual' ? 'The explicit content is going viral.' : newSong.contentType === 'vampire_themed' ? 'Fans think it\'s about someone specific...' : ''}`,
      category: 'interaction',
      intensity: newSong.contentType === 'explicit_sexual' || newSong.contentType === 'vampire_themed' ? 'significant' : 'moderate'
    });

    const obsessionGain = newSong.contentType === 'vampire_themed' ? 15 : 
                         newSong.contentType === 'explicit_sexual' ? 8 : 3;

    await base44.entities.Human.update(human.id, {
      obsession_level: Math.min(100, (human.obsession_level || 0) + obsessionGain),
      awareness_level: newSong.contentType === 'vampire_themed' ? 
        Math.min(100, (human.awareness_level || 0) + 10) : (human.awareness_level || 0)
    });

    queryClient.invalidateQueries();
    setNewSong({ title: '', genre: 'pop', vibe: 'upbeat', contentType: 'clean', lyrics: '' });
    setCreating(false);
  };

  const performLive = async () => {
    setShowDancing(true);
  };

  const finishPerformance = async (danceData) => {
    setShowDancing(false);
    setPerforming(true);

    const venues = ['small bar', 'coffee shop', 'club', 'concert hall', 'underground venue'];
    const venue = venues[Math.floor(Math.random() * venues.length)];
    const crowd = Math.floor(Math.random() * 200) + 20;
    const performanceBonus = Math.floor((danceData.performance / 100) * 100);
    const seductionBonus = Math.floor((danceData.seduction / 100) * 80);
    const tips = Math.floor(Math.random() * 150) + 50 + performanceBonus + seductionBonus;

    const moveDescriptions = {
      sway: 'swaying your hips slowly, sensually',
      grind: 'grinding, body rolling',
      drop: 'dropping to the floor, crawling',
      twerk: 'bouncing, twerking',
      pole: 'spinning on the pole',
      floor: 'doing floor work',
      jump: 'jumping with high energy',
      strip: 'teasing, slowly stripping'
    };

    const outcomes = [
      `You performed at ${venue}. ${crowd} people showed up.\n\nYou danced ${moveDescriptions[danceData.moveType]}.\n\nThe crowd went WILD. Eyes on you. All of you.\n\nEarned $${tips} in tips.`,
      `Show at ${venue}.\n\n${crowd} people watching you move.\n\nYou were ${moveDescriptions[danceData.moveType]}.\n\nPeople recording. Posted everywhere.\n\n+$${tips}`,
      `${venue} was PACKED. ${crowd} fans.\n\nYou danced like you were possessed. ${moveDescriptions[danceData.moveType]}.\n\nSomeone in VIP never took their eyes off you.\n\n+$${tips}`,
      `Performed at ${venue}.\n\n${crowd} people. You were ${moveDescriptions[danceData.moveType]}.\n\nThe way you moved... hypnotic. Dangerous.\n\nEarned $${tips}`
    ];

    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];

    // Vampire might attend
    if (vampire && Math.random() > 0.6) {
      setVampireEvent({
        text: `After the show, ${vampire.vampire_name} approached you backstage.\n\n"You have talent," they said. "I've been watching you perform."\n\nTheir presence was magnetic. Dangerous.\n\n"I'd like to support your career. Personally."`,
        pay: 300
      });
    } else {
      setPerformanceOutcome(outcome);
    }

    await base44.entities.Human.update(human.id, {
      awareness_level: Math.min(100, (human.awareness_level || 0) + 5),
      obsession_level: Math.min(100, (human.obsession_level || 0) + 8)
    });

    await base44.entities.NightLog.create({
      entry: `${human.name} performed live: ${outcome}`,
      category: 'interaction',
      intensity: 'moderate'
    });

    queryClient.invalidateQueries();
    setPerforming(false);
  };

  const startTour = () => {
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Miami', 'Seattle', 'Austin'];
    const numCities = Math.floor(Math.random() * 3) + 3;
    const tourCities = cities.sort(() => Math.random() - 0.5).slice(0, numCities);
    
    setTourPlan({
      cities: tourCities,
      currentCity: 0,
      totalEarnings: 0
    });
  };

  const performTourStop = async () => {
    if (!tourPlan) return;
    
    const city = tourPlan.cities[tourPlan.currentCity];
    const crowd = Math.floor(Math.random() * 500) + 200;
    const earnings = Math.floor(Math.random() * 800) + 400;
    
    const vampireAttends = vampire && Math.random() > 0.5;
    
    const outcome = vampireAttends ?
      `${city} show SOLD OUT. ${crowd} fans screaming.\n\n${vampire.vampire_name} was in the VIP section. Watching you. Only you.\n\nAfter the show, they came backstage.\n\n"You're captivating on stage," they said.\n\nTheir eyes never left yours.\n\n+$${earnings}` :
      `${city} show was electric. ${crowd} fans. Your music connects with people.\n\nFans screaming your name. Some threw things on stage.\n\nYou're building something real here.\n\n+$${earnings}`;
    
    const newTourPlan = {
      ...tourPlan,
      currentCity: tourPlan.currentCity + 1,
      totalEarnings: tourPlan.totalEarnings + earnings
    };
    
    if (vampireAttends) {
      await base44.entities.Human.update(human.id, {
        obsession_level: Math.min(100, (human.obsession_level || 0) + 12),
        vampire_encounters: (human.vampire_encounters || 0) + 1
      });
    }
    
    await base44.entities.NightLog.create({
      entry: `${human.name} performed in ${city} - ${crowd} fans, $${earnings}${vampireAttends ? `. ${vampire.vampire_name} attended.` : ''}`,
      category: 'interaction',
      intensity: 'moderate'
    });
    
    if (newTourPlan.currentCity >= tourPlan.cities.length) {
      setPerformanceOutcome(`TOUR COMPLETE!\n\nYou played ${tourPlan.cities.length} cities.\n\nTotal earnings: $${newTourPlan.totalEarnings}\n\nYour fanbase exploded. You're a star now.`);
      setTourPlan(null);
    } else {
      setPerformanceOutcome(outcome);
      setTourPlan(newTourPlan);
    }
    
    queryClient.invalidateQueries();
  };

  const handleFanInteraction = () => {
    const interactions = [
      {
        type: 'confession',
        text: `A fan messaged you: "Your music saved my life. I listen to it every night."\n\nThey're obsessed with you.`,
        obsessionGain: 5
      },
      {
        type: 'sexual_request',
        text: `Fan DM: "Can you write a song about us fucking? I'll pay you."\n\nThey attached explicit photos.`,
        obsessionGain: 10,
        awareness: 5
      },
      {
        type: 'stalker',
        text: `Someone's been following you after shows.\n\nThey know where you live.\n\nLeft flowers at your door with a note: "I'm your biggest fan."`,
        obsessionGain: 8,
        danger: 15
      }
    ];
    
    if (vampire && Math.random() > 0.6) {
      setFanInteraction({
        type: 'vampire_fan',
        text: `${vampire.vampire_name} sent you a message:\n\n"I've been to every show. You sing like you're in pain. Like you're hungry for something.\n\nI understand that hunger.\n\nMeet me after the next show."`,
        obsessionGain: 20,
        awareness: 15
      });
    } else {
      setFanInteraction(interactions[Math.floor(Math.random() * interactions.length)]);
    }
  };

  const respondToFan = async (accept) => {
    if (!fanInteraction) return;
    
    if (fanInteraction.type === 'vampire_fan' && accept) {
      await base44.entities.Human.update(human.id, {
        obsession_level: Math.min(100, (human.obsession_level || 0) + 25),
        awareness_level: Math.min(100, (human.awareness_level || 0) + 20),
        vampire_encounters: (human.vampire_encounters || 0) + 1,
        romance_with_vampire: vampire.id
      });
      
      await base44.entities.NightLog.create({
        entry: `${human.name} met ${vampire.vampire_name} after the show. The connection is undeniable. Dangerous. Intoxicating.`,
        category: 'interaction',
        intensity: 'significant'
      });
      
      alert(`You met ${vampire.vampire_name} backstage.\n\nThey touched your face.\n\n"Your music speaks to me," they whispered.\n\n"Like you're singing about us."`);
    } else {
      await base44.entities.Human.update(human.id, {
        obsession_level: Math.min(100, (human.obsession_level || 0) + (fanInteraction.obsessionGain || 0)),
        awareness_level: Math.min(100, (human.awareness_level || 0) + (fanInteraction.awareness || 0)),
        danger_level: Math.min(100, (human.danger_level || 0) + (fanInteraction.danger || 0))
      });
    }
    
    queryClient.invalidateQueries();
    setFanInteraction(null);
  };

  const acceptVampirePatron = async () => {
    await base44.entities.Human.update(human.id, {
      awareness_level: Math.min(100, (human.awareness_level || 0) + 20),
      obsession_level: Math.min(100, (human.obsession_level || 0) + 30),
      vampire_encounters: (human.vampire_encounters || 0) + 1,
      romance_with_vampire: vampire.id
    });

    await base44.entities.NightLog.create({
      entry: `${human.name} accepted ${vampire.vampire_name} as their patron. The vampire will fund their music career... for a price. Their connection deepens.`,
      category: 'interaction',
      intensity: 'significant'
    });

    queryClient.invalidateQueries();
    setVampireEvent(null);
    alert(`${vampire.vampire_name} is now your patron! +$${vampireEvent.pay}\n\n"I'll be at every show," they whispered.`);
  };

  const doInterview = async () => {
    const interviewTypes = [
      {
        outlet: 'Rolling Stone',
        question: 'What inspires your dark, obsessive lyrics?',
        options: ['Someone I can\'t have', 'The night', 'My demons', 'A dangerous love']
      },
      {
        outlet: 'Pitchfork',
        question: 'Your music has sexual and violent undertones. What\'s the story?',
        options: ['It\'s personal', 'Art imitates life', 'I\'m exploring darkness', 'No comment']
      },
      {
        outlet: 'Late Night Show',
        question: 'Fans say you sing about vampires. Is that true?',
        options: ['It\'s metaphorical', 'Maybe...', 'I sing about obsession', 'You\'ll have to listen']
      }
    ];

    const interview = interviewTypes[Math.floor(Math.random() * interviewTypes.length)];
    setInterviews([...interviews, interview]);
  };

  const createAlbum = async () => {
    if (!newAlbum.title || newAlbum.selectedSongs.length < 3) return;

    const albumData = {
      id: Date.now(),
      title: newAlbum.title,
      songs: newAlbum.selectedSongs,
      streams: 0,
      earnings: 0
    };

    const totalStreams = newAlbum.selectedSongs.reduce((sum, songId) => {
      const song = songs.find(s => s.id === songId);
      return sum + (song?.streams || 0);
    }, 0);

    albumData.streams = totalStreams * 2;
    albumData.earnings = Math.floor(albumData.streams / 5);

    setAlbums([...albums, albumData]);

    await base44.entities.NightLog.create({
      entry: `${human.name} released album "${newAlbum.title}" with ${newAlbum.selectedSongs.length} songs - ${albumData.streams} streams, $${albumData.earnings}`,
      category: 'interaction',
      intensity: 'significant'
    });

    queryClient.invalidateQueries();
    setNewAlbum({ title: '', selectedSongs: [] });
    setCreatingAlbum(false);
  };

  const purchaseEquipment = (item) => {
    setEquipment([...equipment, item]);
    alert(`Purchased ${item.name}! +${item.quality}% recording quality`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-indigo-500/30"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Music className="w-8 h-8 text-indigo-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Music Career</h2>
              <p className="text-gray-400 text-sm">Create songs • Perform live</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {fanInteraction ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className={`rounded-xl p-6 border-2 ${
                fanInteraction.type === 'vampire_fan' ? 'bg-red-950/40 border-red-500/50' :
                fanInteraction.type === 'stalker' ? 'bg-orange-950/40 border-orange-500/50' :
                'bg-purple-950/40 border-purple-500/50'
              }`}>
                <h3 className="text-white font-bold text-lg mb-3">
                  {fanInteraction.type === 'vampire_fan' ? '🦇 Message from Admirer' :
                   fanInteraction.type === 'stalker' ? '⚠️ Stalker Alert' :
                   fanInteraction.type === 'sexual_request' ? '💋 Explicit Fan Request' :
                   '💌 Fan Message'}
                </h3>
                <p className="text-gray-300 whitespace-pre-line mb-4">{fanInteraction.text}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => respondToFan(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl"
                >
                  Ignore
                </button>
                <button
                  onClick={() => respondToFan(true)}
                  className={`flex-1 ${
                    fanInteraction.type === 'vampire_fan' 
                      ? 'bg-gradient-to-r from-red-600 to-purple-600' 
                      : 'bg-purple-600'
                  } hover:opacity-90 text-white py-3 rounded-xl font-bold`}
                >
                  {fanInteraction.type === 'vampire_fan' ? 'Meet Them' : 'Respond'}
                </button>
              </div>
            </motion.div>
          ) : tourPlan && !performanceOutcome ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-6">
                <h3 className="text-white font-bold text-xl mb-4">
                  🎸 ON TOUR
                </h3>
                <div className="space-y-2 mb-4">
                  {tourPlan.cities.map((city, i) => (
                    <div key={city} className={`flex items-center gap-3 ${
                      i < tourPlan.currentCity ? 'text-green-400' :
                      i === tourPlan.currentCity ? 'text-white font-bold' :
                      'text-gray-500'
                    }`}>
                      <span>{i < tourPlan.currentCity ? '✓' : i === tourPlan.currentCity ? '▶' : '○'}</span>
                      <span>{city}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-green-950/40 border border-green-500/30 rounded-lg p-3 mb-4">
                  <p className="text-green-400 font-bold text-center">
                    Tour Earnings: ${tourPlan.totalEarnings}
                  </p>
                </div>
                <p className="text-gray-400 text-sm text-center mb-4">
                  Stop {tourPlan.currentCity + 1} of {tourPlan.cities.length}: {tourPlan.cities[tourPlan.currentCity]}
                </p>
              </div>
              <button
                onClick={performTourStop}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold"
              >
                🎤 Perform in {tourPlan.cities[tourPlan.currentCity]}
              </button>
            </motion.div>
          ) : vampireEvent ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-red-950/40 border-2 border-red-500/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🦇</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Vampire Patron Offer</h3>
                    <p className="text-red-300 text-sm">From {vampire.vampire_name}</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-4 whitespace-pre-line">{vampireEvent.text}</p>
                <div className="flex items-center justify-center gap-4 bg-green-950/40 border border-green-500/30 rounded-lg p-3">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <p className="text-white font-bold">${vampireEvent.pay} upfront payment</p>
                </div>
              </div>

              <div className="bg-yellow-950/40 border border-yellow-500/30 rounded-xl p-3">
                <p className="text-yellow-300 text-sm text-center">
                  ⚠️ Accepting means they'll be at every show. Watching. Obsessed with you.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setVampireEvent(null)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl"
                >
                  Decline
                </button>
                <button
                  onClick={acceptVampirePatron}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white py-3 rounded-xl font-bold"
                >
                  Accept Patron
                </button>
              </div>
            </motion.div>
          ) : performanceOutcome ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-6">
                <p className="text-white text-center mb-4">{performanceOutcome}</p>
              </div>
              <button
                onClick={() => setPerformanceOutcome(null)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl"
              >
                Continue
              </button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <div className="flex gap-2 border-b border-gray-700 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('create')}
                  className={`px-4 py-2 whitespace-nowrap ${activeTab === 'create' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}
                >
                  Create
                </button>
                <button
                  onClick={() => setActiveTab('songs')}
                  className={`px-4 py-2 whitespace-nowrap ${activeTab === 'songs' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}
                >
                  Songs ({songs.length})
                </button>
                <button
                  onClick={() => setActiveTab('perform')}
                  className={`px-4 py-2 whitespace-nowrap ${activeTab === 'perform' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}
                >
                  Perform
                </button>
                <button
                  onClick={() => setActiveTab('tour')}
                  className={`px-4 py-2 whitespace-nowrap ${activeTab === 'tour' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}
                >
                  Tour
                </button>
                <button
                  onClick={() => setActiveTab('fans')}
                  className={`px-4 py-2 whitespace-nowrap ${activeTab === 'fans' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}
                >
                  Fans
                </button>
                <button
                  onClick={() => setActiveTab('equipment')}
                  className={`px-4 py-2 whitespace-nowrap ${activeTab === 'equipment' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}
                >
                  Equipment
                </button>
                <button
                  onClick={() => setActiveTab('album')}
                  className={`px-4 py-2 whitespace-nowrap ${activeTab === 'album' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}
                >
                  Albums
                </button>
                <button
                  onClick={() => setActiveTab('press')}
                  className={`px-4 py-2 whitespace-nowrap ${activeTab === 'press' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}
                >
                  Press
                </button>
              </div>

              {activeTab === 'create' ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Song title..."
                    value={newSong.title}
                    onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-indigo-500/30 focus:border-indigo-500 focus:outline-none"
                  />

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Genre</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['pop', 'rock', 'indie', 'electronic', 'dark', 'alternative'].map(genre => (
                        <button
                          key={genre}
                          onClick={() => setNewSong({ ...newSong, genre })}
                          className={`py-2 rounded-lg capitalize text-sm ${
                            newSong.genre === genre
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-800 text-gray-400'
                          }`}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Content Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'clean', label: 'Clean' },
                        { value: 'romantic', label: 'Romantic' },
                        { value: 'dark', label: 'Dark' },
                        { value: 'explicit_sexual', label: 'Explicit 🔞' },
                        { value: 'vampire_themed', label: 'Vampire 🦇' }
                      ].map(type => (
                        <button
                          key={type.value}
                          onClick={() => setNewSong({ ...newSong, contentType: type.value })}
                          className={`py-2 rounded-lg text-sm ${
                            newSong.contentType === type.value
                              ? type.value === 'explicit_sexual' ? 'bg-red-600 text-white' :
                                type.value === 'vampire_themed' ? 'bg-purple-600 text-white' :
                                'bg-indigo-600 text-white'
                              : 'bg-gray-800 text-gray-400'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Vibe</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['upbeat', 'melancholy', 'dark', 'dreamy', 'desperate', 'obsessive'].map(vibe => (
                        <button
                          key={vibe}
                          onClick={() => setNewSong({ ...newSong, vibe })}
                          className={`py-2 rounded-lg capitalize text-sm ${
                            newSong.vibe === vibe
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-800 text-gray-400'
                          }`}
                        >
                          {vibe}
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    placeholder="Song lyrics (optional)..."
                    value={newSong.lyrics}
                    onChange={(e) => setNewSong({ ...newSong, lyrics: e.target.value })}
                    rows={4}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-indigo-500/30 focus:border-indigo-500 focus:outline-none text-sm"
                  />

                  <button
                    onClick={createSong}
                    disabled={!newSong.title || creating}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 text-white py-3 rounded-xl font-bold"
                  >
                    {creating ? 'Creating...' : '🎵 Release Song'}
                  </button>

                  {(newSong.contentType === 'explicit_sexual' || newSong.contentType === 'vampire_themed') && (
                    <div className="bg-yellow-950/40 border border-yellow-500/30 rounded-xl p-3">
                      <p className="text-yellow-300 text-xs text-center">
                        {newSong.contentType === 'explicit_sexual' 
                          ? '⚠️ Explicit content gets more streams but attracts attention'
                          : '🦇 Vampire-themed songs might attract... actual vampires'}
                      </p>
                    </div>
                  )}
                </div>
              ) : activeTab === 'songs' ? (
                <div className="space-y-3">
                  {songs.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No songs released yet</p>
                  ) : (
                    songs.map(song => (
                      <div key={song.id} className="bg-gray-800/50 border border-indigo-500/30 rounded-xl p-4">
                        <h4 className="text-white font-bold mb-1">{song.title}</h4>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded">{song.genre}</span>
                          <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">{song.vibe}</span>
                          {song.contentType !== 'clean' && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              song.contentType === 'explicit_sexual' ? 'bg-red-600 text-white' :
                              song.contentType === 'vampire_themed' ? 'bg-purple-600 text-white' :
                              'bg-gray-600 text-white'
                            }`}>
                              {song.contentType === 'explicit_sexual' ? 'Explicit 🔞' :
                               song.contentType === 'vampire_themed' ? 'Vampire 🦇' :
                               song.contentType}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Streams: {song.streams.toLocaleString()}</span>
                          <span className="text-green-400">Earned: ${song.earnings}</span>
                        </div>
                        {song.lyrics && (
                          <p className="text-gray-400 text-xs mt-2 italic">"{song.lyrics.slice(0, 50)}..."</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              ) : activeTab === 'tour' ? (
                <div className="space-y-4">
                  <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4">
                    <h3 className="text-white font-bold mb-2">🎸 Go On Tour</h3>
                    <div className="space-y-1 text-sm text-gray-300">
                      <p>🌎 Play multiple cities</p>
                      <p>💰 $400-1200 per show</p>
                      <p>👥 Massive fanbase growth</p>
                      <p>⚠️ More visibility = more danger</p>
                    </div>
                  </div>

                  {songs.length < 3 ? (
                    <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-4">
                      <p className="text-red-300 text-sm text-center">
                        You need at least 3 songs to go on tour
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={startTour}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold"
                    >
                      🎤 Start Tour
                    </button>
                  )}
                </div>
              ) : activeTab === 'fans' ? (
                <div className="space-y-4">
                  <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4">
                    <h3 className="text-white font-bold mb-2">💌 Fan Interactions</h3>
                    <p className="text-gray-300 text-sm mb-3">Your fans want to connect with you. Some more than others...</p>
                  </div>

                  <button
                    onClick={handleFanInteraction}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-bold"
                  >
                    📬 Check Fan Messages
                  </button>
                </div>
              ) : activeTab === 'equipment' ? (
                <div className="space-y-4">
                  <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4">
                    <h3 className="text-white font-bold mb-2">🎸 Your Equipment</h3>
                    <p className="text-gray-300 text-sm mb-3">
                      Better equipment = better sound quality = more streams
                    </p>
                    {equipment.length > 0 && (
                      <div className="bg-green-950/40 border border-green-500/30 rounded-lg p-3">
                        <p className="text-green-400 font-bold text-center">
                          Total Quality Bonus: +{equipment.reduce((sum, item) => sum + item.quality, 0)}%
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setShowEquipment(true)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold"
                  >
                    🛒 Browse Equipment Store
                  </button>

                  {equipment.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-white font-bold text-sm">Owned Equipment:</h4>
                      {equipment.map((item, i) => (
                        <div key={i} className="bg-gray-800/50 border border-green-500/30 rounded-lg p-3">
                          <p className="text-white text-sm">{item.name}</p>
                          <p className="text-green-400 text-xs">+{item.quality}% quality</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : activeTab === 'album' ? (
                <div className="space-y-4">
                  {creatingAlbum ? (
                    <>
                      <input
                        type="text"
                        placeholder="Album title..."
                        value={newAlbum.title}
                        onChange={(e) => setNewAlbum({ ...newAlbum, title: e.target.value })}
                        className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-indigo-500/30 focus:border-indigo-500 focus:outline-none"
                      />
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Select songs (min 3):</p>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {songs.map(song => (
                            <button
                              key={song.id}
                              onClick={() => {
                                if (newAlbum.selectedSongs.includes(song.id)) {
                                  setNewAlbum({
                                    ...newAlbum,
                                    selectedSongs: newAlbum.selectedSongs.filter(id => id !== song.id)
                                  });
                                } else {
                                  setNewAlbum({
                                    ...newAlbum,
                                    selectedSongs: [...newAlbum.selectedSongs, song.id]
                                  });
                                }
                              }}
                              className={`w-full text-left p-3 rounded-lg ${
                                newAlbum.selectedSongs.includes(song.id)
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-gray-800 text-gray-300'
                              }`}
                            >
                              {song.title}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setCreatingAlbum(false)}
                          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={createAlbum}
                          disabled={!newAlbum.title || newAlbum.selectedSongs.length < 3}
                          className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 text-white py-3 rounded-xl font-bold"
                        >
                          Release Album
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4">
                        <h3 className="text-white font-bold mb-2">💿 Create Album/EP</h3>
                        <p className="text-gray-300 text-sm">
                          Group your songs into albums for bigger releases
                        </p>
                      </div>

                      {songs.length < 3 ? (
                        <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-4">
                          <p className="text-red-300 text-sm text-center">
                            You need at least 3 songs to create an album
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => setCreatingAlbum(true)}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold"
                        >
                          💿 Create New Album
                        </button>
                      )}

                      {albums.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-white font-bold">Released Albums:</h4>
                          {albums.map(album => (
                            <div key={album.id} className="bg-gray-800/50 border border-indigo-500/30 rounded-xl p-4">
                              <h4 className="text-white font-bold mb-2">{album.title}</h4>
                              <p className="text-gray-400 text-sm mb-2">{album.songs.length} tracks</p>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Streams: {album.streams.toLocaleString()}</span>
                                <span className="text-green-400">Earned: ${album.earnings}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : activeTab === 'press' ? (
                <div className="space-y-4">
                  <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4">
                    <h3 className="text-white font-bold mb-2">📰 Press & Interviews</h3>
                    <div className="space-y-1 text-sm text-gray-300">
                      <p>🎤 Press junkets</p>
                      <p>📺 TV interviews</p>
                      <p>📰 Magazine features</p>
                      <p>⚠️ Your answers affect your image</p>
                    </div>
                  </div>

                  <button
                    onClick={doInterview}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold"
                  >
                    🎙️ Do Press Interview
                  </button>

                  {interviews.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-white font-bold">Recent Interviews:</h4>
                      {interviews.map((interview, i) => (
                        <div key={i} className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4">
                          <p className="text-purple-300 font-bold text-sm mb-2">{interview.outlet}</p>
                          <p className="text-white text-sm mb-3">"{interview.question}"</p>
                          <div className="space-y-2">
                            {interview.options.map((option, j) => (
                              <button
                                key={j}
                                onClick={async () => {
                                  await base44.entities.NightLog.create({
                                    entry: `${human.name} interviewed by ${interview.outlet}. Response: "${option}"`,
                                    category: 'interaction',
                                    intensity: 'moderate'
                                  });
                                  queryClient.invalidateQueries();
                                  alert(`Your answer: "${option}"\n\nFans are talking about it.`);
                                }}
                                className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 px-3 rounded-lg text-left"
                              >
                                "{option}"
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4">
                    <h3 className="text-white font-bold mb-2">Live Performances</h3>
                    <div className="space-y-1 text-sm text-gray-300">
                      <p>🎤 Venues: Bars, clubs, concert halls</p>
                      <p>💰 Earnings: $50-200 per show</p>
                      <p>👥 Build your fanbase</p>
                      <p>⚠️ Night shows attract... unusual crowds</p>
                    </div>
                  </div>

                  {vampire && (
                    <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4">
                      <p className="text-purple-300 text-sm text-center">
                        🦇 Vampires are drawn to artists. They might attend your shows...
                      </p>
                    </div>
                  )}

                  <button
                    onClick={performLive}
                    disabled={performing}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 text-white py-4 rounded-xl font-bold"
                  >
                    {performing ? 'Performing...' : '🎸 Perform Live Show'}
                  </button>
                </div>
              )}
            </div>
          )}
        </AnimatePresence>

        {showEquipment && (
          <MusicEquipment
            onClose={() => setShowEquipment(false)}
            onPurchase={purchaseEquipment}
          />
        )}

        <AnimatePresence>
          {showDancing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 flex items-center justify-center z-[60] p-4"
              onClick={() => setShowDancing(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-lg w-full"
              >
                <DancingSlider
                  gender={human.gender}
                  context="stage"
                  vampireName={vampire?.vampire_name}
                  onFinish={finishPerformance}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>}
      </motion.div>
    </motion.div>
  );
}