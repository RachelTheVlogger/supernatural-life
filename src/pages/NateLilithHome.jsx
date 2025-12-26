import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Brain, ShoppingBag, Home, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const NATE_CLIENTS = [
  { name: 'Sarah Chen', issue: 'Anxiety about career change', severity: 'moderate', payment: 150 },
  { name: 'Marcus Williams', issue: 'Depression after breakup', severity: 'severe', payment: 180 },
  { name: 'Emma Rodriguez', issue: 'Work-life balance stress', severity: 'mild', payment: 120 },
  { name: 'David Park', issue: 'Traumatic childhood memories', severity: 'severe', payment: 200 },
  { name: 'Lisa Thompson', issue: 'Social anxiety disorder', severity: 'moderate', payment: 160 }
];

const THERAPY_APPROACHES = [
  { id: 'ethical', label: 'Professional Therapy', desc: 'Help them genuinely', humanity: 5 },
  { id: 'read', label: 'Read Their Mind', desc: 'Use vampire powers', humanity: -3 },
  { id: 'compel', label: 'Compel Happiness', desc: 'Force them to feel better', humanity: -10 },
  { id: 'feed', label: 'Feed During Session', desc: 'Use therapy as hunting', humanity: -15 }
];

const SHOP_ACTIVITIES = [
  { id: 'serve', label: 'Help Customers', desc: 'Be friendly and helpful', pay: 80 },
  { id: 'restock', label: 'Restock Shelves', desc: 'Organize inventory', pay: 60 },
  { id: 'charm', label: 'Charm Customers', desc: 'Use vampire allure', pay: 120 },
  { id: 'feed', label: 'Feed in Storage', desc: 'Quick bite in the back', pay: 100 }
];

const COUPLE_ACTIVITIES = [
  { id: 'hunt', label: 'Hunt Together', desc: 'Feed together on the streets', type: 'dark' },
  { id: 'beach', label: 'Beach Night', desc: 'Ocean air and hunting', type: 'romantic' },
  { id: 'club', label: 'Vampire Club', desc: 'Feed in the crowd', type: 'dark' },
  { id: 'journal', label: 'Read His Journal', desc: 'Discover his desires', type: 'intimate' },
  { id: 'bloodbond', label: 'Blood Bond', desc: 'Cut palms, bind forever', type: 'ritual' },
  { id: 'shower', label: 'Shower Together', desc: 'Wash the blood away', type: 'intimate' },
  { id: 'breakfast', label: 'Breakfast Tease', desc: 'Coffee and filthy words', type: 'tease' },
  { id: 'write', label: 'Write Together', desc: 'One line, honest', type: 'creative' },
  { id: 'mara', label: 'Deal with Mara', desc: 'The stalker returns', type: 'conflict' },
  { id: 'bedroom', label: 'Intimate Moment', desc: 'Lose control together', type: 'intimate' }
];

export default function NateLilithHome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeCharacter, setActiveCharacter] = useState('nate'); // 'nate' or 'lilith'
  const [workMode, setWorkMode] = useState(null); // 'therapy' or 'shop'
  const [currentClient, setCurrentClient] = useState(null);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [outcome, setOutcome] = useState('');
  const [processing, setProcessing] = useState(false);
  const [coupleActivity, setCoupleActivity] = useState(null);

  // Fetch or create couple state
  const { data: coupleData } = useQuery({
    queryKey: ['nateLilithState'],
    queryFn: async () => {
      const existing = await base44.entities.VampireState.filter({ vampire_name: 'Nate Cross' });
      if (existing.length > 0) return existing[0];
      
      // Create initial state
      const created = await base44.entities.VampireState.create({
        vampire_name: 'Nate Cross',
        gender: 'man',
        sexuality: 'bisexual',
        job: 'Therapist',
        humanity: 60,
        vampire_stage: 2,
        vampire_power_level: 30,
        unlocked_powers: ['Enhanced Senses', 'Compulsion', 'Mind Reading'],
        emotional_mode: 'feeling',
        time_of_day: 'day'
      });
      return created;
    }
  });

  const { data: lilithData } = useQuery({
    queryKey: ['lilithState'],
    queryFn: async () => {
      const existing = await base44.entities.Servant.filter({ name: 'Lilith Hart' });
      if (existing.length > 0) return existing[0];
      
      const created = await base44.entities.Servant.create({
        name: 'Lilith Hart',
        gender: 'woman',
        sexuality: 'bisexual',
        job: 'Shop Worker (9am-5pm)',
        variant: 'devoted',
        obsession_stage: 5,
        relationship: 100,
        is_turned: true,
        vampire_stage: 2,
        vampire_power_level: 25,
        unlocked_powers: ['Enhanced Senses', 'Compulsion'],
        emotional_state: 'reverent',
        boundaries: 'exclusive'
      });
      return created;
    }
  });

  const handleTherapySession = async (client, approach) => {
    setProcessing(true);
    
    const outcomes = {
      ethical: `You helped ${client.name} work through their ${client.issue}. Professional and genuine.`,
      read: `You read ${client.name}'s mind. Knew exactly what to say. They're amazed by your insight.`,
      compel: `You compelled ${client.name} to feel happy. Problems buried, not solved. Quick fix.`,
      feed: `You fed on ${client.name} during the session. Erased their memory. Dark but satisfying.`
    };

    setTimeout(async () => {
      setOutcome(outcomes[approach.id]);
      
      const newHumanity = Math.max(0, Math.min(100, coupleData.humanity + approach.humanity));
      await base44.entities.VampireState.update(coupleData.id, { humanity: newHumanity });
      
      await base44.entities.NightLog.create({
        entry: `Nate: ${outcomes[approach.id]}`,
        category: 'interaction',
        intensity: approach.humanity < 0 ? 'significant' : 'moderate'
      });
      
      queryClient.invalidateQueries(['nateLilithState']);
      
      setTimeout(() => {
        setProcessing(false);
        setWorkMode(null);
        setCurrentClient(null);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  const handleShopActivity = async (activity) => {
    setProcessing(true);
    
    const outcomes = {
      serve: 'Lilith helped customers with a warm smile. Day shift went smoothly.',
      restock: 'Lilith restocked shelves efficiently. Vampire strength makes it easy.',
      charm: 'Lilith used her natural vampire allure. Customers bought way more than planned.',
      feed: 'Lilith fed quickly in the storage room. A delivery guy. Compelled and forgotten.'
    };

    setTimeout(async () => {
      setOutcome(outcomes[activity.id]);
      
      await base44.entities.NightLog.create({
        entry: `Lilith: ${outcomes[activity.id]} Earned $${activity.pay}.`,
        category: 'interaction',
        intensity: activity.id === 'feed' ? 'significant' : 'moderate'
      });
      
      queryClient.invalidateQueries(['lilithState']);
      
      setTimeout(() => {
        setProcessing(false);
        setWorkMode(null);
        setCurrentActivity(null);
        setOutcome('');
      }, 3000);
    }, 2000);
  };

  const handleCoupleActivity = async (activity) => {
    setProcessing(true);

    const outcomes = {
      hunt: [
        'You prowled the streets together. A man stumbled from the bar. You both fed, mouths red, grinding together as blood filled you.',
        'Alley behind the warehouse. You bit one side, Nate the other. The pulse between you. You kissed with blood on your lips.',
        'The hunt was quick. You pinned them together, fed together, came together. The body fell. You kept going.'
      ],
      beach: [
        'Ocean air, moonlight, a lone figure on the sand. You fed as waves crashed. Nate bent you over after, salt and blood mixing.',
        'The beach was empty. You hunted. Fed. Fucked against the rocks with blood still wet on your chin.',
        'You dragged the body into the surf. Nate took you there, in the shallows, tasting copper and sea.'
      ],
      club: [
        'Bass pounding. Lights flashing. You fed in the crowd, unseen. Nate pulled you to a dark hallway after and fucked you against brick.',
        'The warehouse club. You both bit the same boy, dancing close. Blood and sweat. You came in the alley after.',
        'Music drowned out the moans. You fed together. Kissed. His hand in your panties while bodies moved around you.'
      ],
      journal: [
        '"Session Twelve. She crossed her legs. I wanted to ask if her panties were wet." You read his words. Your body answered.',
        'You found his journal. Every session detailed. Every thought about you. "I wanted to ruin her across that desk." You were soaked.',
        'His handwriting. His confessions. "Kn eel. Open. Say my name like a prayer." You couldn\'t stop reading. Couldn\'t stop aching.'
      ],
      bloodbond: [
        'He cut your palm. Cut his. Blood to blood. You came together, wound to wound, sealing the vow. Forever.',
        'The blade was sharp. Blood welled. He pressed your palms together and you felt it—the bond, permanent, eternal.',
        'You bound yourselves in blood. "Mine," he said. "Yours," you answered. The cuts healed. The vow didn\'t.'
      ],
      shower: [
        'Hot water. Blood washing away. His hands on you, reverent, claiming. You came against the tile as steam filled the room.',
        'The shower ran red at first. Then clear. Then you were pressed to the wall, his cock inside you, water cascading.',
        'He washed the blood from your skin. Kissed every inch clean. Then made you dirty again.'
      ],
      breakfast: [
        '"You\'re dripping already," he said over coffee. His foot slid up your calf. You couldn\'t eat. Couldn\'t think. Only ache.',
        'Breakfast table. His words filthy, his tone calm. "I\'ll fuck you against this counter until you scream." You were wet instantly.',
        'He described exactly what he\'d do to you. Every detail. You sat there trembling, coffee untouched, pussy throbbing.'
      ],
      write: [
        'One line. Honest. "The fog is a hand over the town\'s mouth." He smiled. "There you are." You wrote more. He watched.',
        'Your notebook. His eyes on you. "Write what you\'re feeling right now." You wrote: I want you. He pulled you into his lap.',
        '"One true line." You wrote it. He read it. Kissed you hard. "Perfect. My perfect writer."'
      ],
      mara: [
        'She stood in the dark. "You\'ve poisoned him." Nate stepped forward. "I never wanted you." She left broken.',
        'Mara appeared at your door. "He was mine first." You smiled, fangs showing. "He was never yours." She ran.',
        'The restraining order came. Five hundred feet. Nate crumpled it. "Let her try." You kissed him, claiming.'
      ],
      bedroom: [
        'Hair pulled. Throat arched. His cock deep. "Say you\'re mine." You screamed it. Came so hard you saw stars.',
        'He bent you over the desk. Filled you completely. "You love being mine." Yes. God, yes. Over and over.',
        'On your knees. His hand in your hair. His voice commanding. You obeyed everything. Came harder than ever before.'
      ]
    };

    const randomOutcome = outcomes[activity.id][Math.floor(Math.random() * outcomes[activity.id].length)];

    setTimeout(async () => {
      setOutcome(randomOutcome);
      
      await base44.entities.NightLog.create({
        entry: `Nate & Lilith: ${randomOutcome}`,
        category: 'interaction',
        intensity: activity.type === 'dark' ? 'significant' : 'moderate'
      });
      
      queryClient.invalidateQueries(['nateLilithState', 'lilithState']);
      
      setTimeout(() => {
        setProcessing(false);
        setCoupleActivity(null);
        setOutcome('');
      }, 4000);
    }, 2000);
  };

  if (!coupleData || !lilithData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(createPageUrl('VampireHome'))}
          className="text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Nate & Lilith</h1>
          <p className="text-gray-400">Living together. Both vampires. Both complicated.</p>
        </div>

        {/* Character Selection */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setActiveCharacter('nate')}
            className={`rounded-xl p-6 transition-all ${
              activeCharacter === 'nate'
                ? 'bg-blue-600 border-2 border-blue-400'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <Brain className="w-8 h-8 text-white mx-auto mb-2" />
            <h3 className="text-white font-bold">Dr. Nate Cross</h3>
            <p className="text-gray-300 text-sm">Therapist</p>
            <p className="text-blue-300 text-xs mt-2">Humanity: {coupleData.humanity}/100</p>
          </button>

          <button
            onClick={() => setActiveCharacter('lilith')}
            className={`rounded-xl p-6 transition-all ${
              activeCharacter === 'lilith'
                ? 'bg-pink-600 border-2 border-pink-400'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <ShoppingBag className="w-8 h-8 text-white mx-auto mb-2" />
            <h3 className="text-white font-bold">Lilith Hart</h3>
            <p className="text-gray-300 text-sm">Shop Worker</p>
            <p className="text-pink-300 text-xs mt-2">Bond: {lilithData.relationship}/100</p>
          </button>
        </div>

        {/* Couple Activities */}
        {!workMode && !coupleActivity && !processing && (
          <div className="mb-8">
            <h3 className="text-white text-xl font-bold mb-4">Together</h3>
            <div className="grid grid-cols-2 gap-3">
              {COUPLE_ACTIVITIES.map(activity => (
                <button
                  key={activity.id}
                  onClick={() => setCoupleActivity(activity)}
                  className={`rounded-xl p-4 text-left transition-all ${
                    activity.type === 'dark' ? 'bg-red-900/40 hover:bg-red-900/60 border-2 border-red-500/30' :
                    activity.type === 'intimate' ? 'bg-pink-900/40 hover:bg-pink-900/60 border-2 border-pink-500/30' :
                    activity.type === 'ritual' ? 'bg-purple-900/40 hover:bg-purple-900/60 border-2 border-purple-500/30' :
                    activity.type === 'conflict' ? 'bg-orange-900/40 hover:bg-orange-900/60 border-2 border-orange-500/30' :
                    'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <h4 className="text-white font-medium text-sm mb-1">{activity.label}</h4>
                  <p className="text-gray-400 text-xs">{activity.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Couple Activity in Progress */}
        {coupleActivity && !outcome && !processing && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-white text-xl font-bold mb-4">{coupleActivity.label}</h3>
            <p className="text-gray-300 mb-6">{coupleActivity.desc}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setCoupleActivity(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCoupleActivity(coupleActivity)}
                className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-3 rounded-xl transition-all"
              >
                Begin
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        {!workMode && !coupleActivity && !processing && (
          <div className="space-y-4">
            {activeCharacter === 'nate' && (
              <>
                <button
                  onClick={() => setWorkMode('therapy')}
                  className="w-full bg-blue-900/40 hover:bg-blue-900/60 border-2 border-blue-500/50 rounded-xl p-6 text-left transition-all"
                >
                  <h3 className="text-white text-lg font-bold mb-2">See a Patient</h3>
                  <p className="text-gray-400 text-sm">Professional therapy... or something darker</p>
                </button>

                <button
                  onClick={async () => {
                    const newTime = coupleData.time_of_day === 'day' ? 'night' : 'day';
                    await base44.entities.VampireState.update(coupleData.id, { time_of_day: newTime });
                    queryClient.invalidateQueries(['nateLilithState']);
                  }}
                  className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-xl p-4 text-left transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white">
                      {coupleData.time_of_day === 'day' ? 'End Work Day' : 'Start Work Day'}
                    </span>
                    {coupleData.time_of_day === 'day' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-purple-400" />}
                  </div>
                </button>
              </>
            )}

            {activeCharacter === 'lilith' && (
              <>
                <button
                  onClick={() => setWorkMode('shop')}
                  className="w-full bg-pink-900/40 hover:bg-pink-900/60 border-2 border-pink-500/50 rounded-xl p-6 text-left transition-all"
                >
                  <h3 className="text-white text-lg font-bold mb-2">Work at the Shop</h3>
                  <p className="text-gray-400 text-sm">9am to 5pm shift. Vampires make good retail workers.</p>
                </button>

                <button
                  className="w-full bg-purple-900/40 hover:bg-purple-900/60 border-2 border-purple-500/50 rounded-xl p-6 text-left transition-all"
                >
                  <h3 className="text-white text-lg font-bold mb-2">Spend Time with Nate</h3>
                  <p className="text-gray-400 text-sm">Your sire. Your lover. Your everything.</p>
                </button>
              </>
            )}
          </div>
        )}

        {/* Therapy Session */}
        {workMode === 'therapy' && !currentClient && !processing && (
          <div className="space-y-4">
            <h3 className="text-white text-xl font-bold">Today's Patients</h3>
            {NATE_CLIENTS.map(client => (
              <button
                key={client.name}
                onClick={() => setCurrentClient(client)}
                className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-medium">{client.name}</h4>
                    <p className="text-gray-400 text-sm">{client.issue}</p>
                  </div>
                  <span className="text-green-400 text-sm">${client.payment}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {currentClient && !outcome && (
          <div className="space-y-4">
            <div className="bg-blue-950/30 rounded-xl p-4 border border-blue-800/30">
              <h3 className="text-white font-bold mb-2">{currentClient.name}</h3>
              <p className="text-gray-300 text-sm">"{currentClient.issue}"</p>
            </div>

            <h4 className="text-white font-medium">Choose Your Approach</h4>
            {THERAPY_APPROACHES.map(approach => (
              <button
                key={approach.id}
                onClick={() => handleTherapySession(currentClient, approach)}
                disabled={processing}
                className={`w-full rounded-xl p-4 text-left transition-all ${
                  approach.humanity < 0 
                    ? 'bg-red-900/30 hover:bg-red-900/50 border-2 border-red-500/30'
                    : 'bg-green-900/30 hover:bg-green-900/50 border-2 border-green-500/30'
                }`}
              >
                <h5 className="text-white font-medium mb-1">{approach.label}</h5>
                <p className="text-gray-400 text-sm">{approach.desc}</p>
                <span className={`text-xs mt-2 inline-block ${approach.humanity > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  Humanity {approach.humanity > 0 ? '+' : ''}{approach.humanity}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Shop Work */}
        {workMode === 'shop' && !outcome && !processing && (
          <div className="space-y-4">
            <h3 className="text-white text-xl font-bold">Shop Activities</h3>
            {SHOP_ACTIVITIES.map(activity => (
              <button
                key={activity.id}
                onClick={() => handleShopActivity(activity)}
                className={`w-full rounded-xl p-4 text-left transition-all ${
                  activity.id === 'feed'
                    ? 'bg-red-900/30 hover:bg-red-900/50 border-2 border-red-500/30'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-white font-medium mb-1">{activity.label}</h5>
                    <p className="text-gray-400 text-sm">{activity.desc}</p>
                  </div>
                  <span className="text-green-400 text-sm">${activity.pay}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Outcome Display */}
        <AnimatePresence>
          {outcome && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 text-center mt-8"
            >
              <p className="text-gray-300 leading-relaxed">{outcome}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}