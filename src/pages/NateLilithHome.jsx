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

const ACTIVITY_SECTIONS = {
  'Hunting & Feeding': [
    { id: 'hunt', label: 'Hunt Streets' },
    { id: 'beach', label: 'Beach Hunt' },
    { id: 'club', label: 'Club Feed' },
    { id: 'forest', label: 'Forest Chase' },
    { id: 'alley', label: 'Alley Kill' },
    { id: 'warehouse', label: 'Warehouse' }
  ],
  'Dom/Sub': [
    { id: 'kneel', label: 'Kneel' },
    { id: 'restraints', label: 'Tied Up' },
    { id: 'edging', label: 'Edging' },
    { id: 'collar', label: 'Collar' },
    { id: 'hairpull', label: 'Hair Pull' },
    { id: 'throatfuck', label: 'Throat' },
    { id: 'spanking', label: 'Spanking' },
    { id: 'public', label: 'Public' },
    { id: 'commanded', label: 'Commands' },
    { id: 'praise', label: 'Praise' },
    { id: 'begging', label: 'Beg' },
    { id: 'control', label: 'Control' }
  ],
  'Intimate': [
    { id: 'bedroom', label: 'Rough' },
    { id: 'desk', label: 'Desk' },
    { id: 'wall', label: 'Wall' },
    { id: 'slow', label: 'Slow' },
    { id: 'morning', label: 'Morning' },
    { id: 'bite', label: 'Feed+Sex' },
    { id: 'counter', label: 'Counter' },
    { id: 'couch', label: 'Couch' },
    { id: 'floor', label: 'Floor' }
  ],
  'Daily Life': [
    { id: 'cooking', label: 'Cook' },
    { id: 'movie', label: 'Movie' },
    { id: 'reading', label: 'Read' },
    { id: 'walk', label: 'Walk' },
    { id: 'coffee', label: 'Coffee' },
    { id: 'bath', label: 'Bath' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'cleaning', label: 'Clean House' },
    { id: 'laundry', label: 'Laundry' },
    { id: 'grocery', label: 'Groceries' }
  ],
  'Work/Admin': [
    { id: 'bills', label: 'Check Bills' },
    { id: 'patients', label: 'Review Patients' },
    { id: 'shopinventory', label: 'Shop Inventory' },
    { id: 'scheduling', label: 'Scheduling' },
    { id: 'paperwork', label: 'Paperwork' },
    { id: 'finances', label: 'Finances' }
  ],
  'Communication': [
    { id: 'text', label: 'Text Each Other' },
    { id: 'call', label: 'Quick Call' },
    { id: 'sext', label: 'Sexting' },
    { id: 'photo', label: 'Send Photo' }
  ]
};

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
      hunt: ['You prowled the streets together. A man stumbled from the bar. You both fed, mouths red, grinding together as blood filled you.'],
      beach: ['Ocean air, moonlight, a lone figure on the sand. You fed as waves crashed. Nate bent you over after, salt and blood mixing.'],
      club: ['Bass pounding. Lights flashing. You fed in the crowd, unseen. Nate pulled you to a dark hallway after and fucked you against brick.'],
      forest: ['He chased you through the trees. Caught you. Pinned you. Fed from your throat while fucking you against bark.'],
      alley: ['Dark alley. Drunk victim. You bit together, blood mixing on your lips. He fucked you against the wall after, still dripping red.'],
      warehouse: ['Abandoned building. Perfect hunting ground. Three victims. You fed until drunk on blood, then each other.'],
      
      kneel: ['"Kneel." You dropped instantly. He stroked your hair. "Good girl. Now open your mouth." You obeyed. Always.'],
      restraints: ['Wrists bound to the bedpost. You tugged, helpless. "Don\'t fight it," he growled, spreading your thighs. "You\'re mine to use."'],
      edging: ['Three times he brought you to the edge. Three times he stopped. "Not yet." By the fourth, you were sobbing. "Please..." "Now." You shattered.'],
      collar: ['Leather around your throat. His fingers traced it. "Everyone will know you belong to me." You shivered. "Good."'],
      hairpull: ['He fisted your hair, yanking your head back. "Look at me when I fuck you." Your pussy clenched. "Yes, sir."'],
      throatfuck: ['On your knees. His cock in your mouth. His hand guiding. "Take it deeper." You gagged. He groaned. "Perfect."'],
      spanking: ['"You\'ve been bratty all day." His palm cracked across your ass. You moaned. "Count them." "One... sir..."'],
      public: ['Restaurant. His hand slid up your thigh under the table. Fingers in your panties. You bit your lip, trying not to moan. "Come. Quietly."'],
      commanded: ['"Strip. Slowly." You obeyed. "Touch yourself. Not there—your breasts first." His voice controlled everything. You were dripping.'],
      praise: ['"Such a good girl for me." His thumb stroked your cheek. "Taking my cock so perfectly." The praise made you clench. "More... please..."'],
      begging: ['"Please..." you whimpered. "Please what?" His fingers teased. "Say it." "Please fuck me, sir." "Good girl. Since you asked so nicely."'],
      control: ['He controlled everything. When you breathed. When you moved. When you came. "You don\'t get to decide anymore. I do."'],
      
      bedroom: ['Hair pulled. Throat arched. His cock deep. "Say you\'re mine." You screamed it. Came so hard you saw stars.'],
      desk: ['He bent you over his desk. Papers scattered. One brutal thrust. "You love when I take you like this." "Yes... fuck... yes..."'],
      wall: ['Pinned against the wall. Your legs around his waist. He pounded into you. "Mine. Say it." "Yours. Always yours."'],
      slow: ['He took his time. Every thrust deep, deliberate, worshipful. "I love you." Foreheads pressed together. "I love you too."'],
      morning: ['Sunlight through the curtains. His arms around you. Slow kisses. He slid inside you gently. Morning sex, lazy and perfect.'],
      bite: ['His fangs sank into your throat as he thrust deep. Blood and pleasure exploded. You came screaming, him filling you as he drank.'],
      counter: ['Kitchen counter. He lifted you up. Thrust into you hard. Dishes clattered. Neither of you cared.'],
      couch: ['Movie forgotten. You straddled him. Riding slow. His hands on your hips, guiding. "That\'s it. Take what you need."'],
      floor: ['Didn\'t make it to the bed. Floor. Carpet burn. Worth it. He fucked you until you couldn\'t think.'],
      
      cooking: ['You cooked pasta together. He kissed your neck while you stirred. Domestic and sweet. "I could get used to this."'],
      movie: ['Curled on the couch, his arm around you. Horror movie playing. You barely watched. Just enjoyed being close.'],
      reading: ['You both read quietly. Your legs over his lap. He stroked your ankle absently. Perfect peace.'],
      walk: ['Evening stroll through Crescent Hollow. Hand in hand. The fog rolled in. "Beautiful," you said. "You are," he replied.'],
      coffee: ['Morning coffee on the balcony. He wrapped a blanket around you. Kissed your temple. "Good morning, love."'],
      bath: ['Warm water. His chest against your back. His hands washing your hair. Gentle. Intimate. Safe.'],
      shopping: ['Grocery store together. He pushed the cart. You picked out ingredients. So normal. So perfect. You held hands in the checkout line.'],
      cleaning: ['Cleaning the house together. He vacuumed. You dusted. Mundane. Domestic. You loved it. "Our home," he said. "Our home," you agreed.'],
      laundry: ['Folding laundry together. His shirts. Your dresses. Clothes tangled like your lives. He kissed your forehead. "I love this."'],
      grocery: ['Wandering the aisles. Debating what to make for dinner. His hand on your lower back. Simple. Perfect. Yours.'],
      
      bills: ['Nate at his desk, reviewing therapy invoices. "Three new patients this week." You kissed his shoulder. "You\'re brilliant."'],
      patients: ['He read through patient notes. Clinical. Professional. You watched him work. "You help people," you said. "I try," he replied.'],
      shopinventory: ['You counted inventory at the shop. Nate helped. "You\'re good at this," he said, tallying receipts. Teamwork.'],
      scheduling: ['Coordinating your work schedules. "I have therapy until 6pm." "I close at 5." "Dinner at 7?" "Perfect."'],
      paperwork: ['Bills. Forms. Adult responsibilities. He filled them out while you sorted mail. Boring. Necessary. Together.'],
      finances: ['Bank statements spread across the table. "We\'re doing okay," he said. You nodded. Building a life. Slowly. Surely.'],
      
      text: ['"Miss you." He texted during your shift. You smiled, biting your lip. "Miss you too. Can\'t wait to get home."'],
      call: ['His voice on the phone. "How\'s work?" Just to hear you. "Better now," you said. "Come home soon."'],
      sext: ['"What are you wearing?" His text made you flush. At work. In public. "Nothing under this dress." "Good girl. Keep it that way."'],
      photo: ['You sent a photo. Neck exposed. "Bite me later?" His reply: "Count on it. Already hard thinking about it."'],
      
      journal: ['"Session Twelve. She crossed her legs. I wanted to ask if her panties were wet." You read his words. Your body answered.'],
      bloodbond: ['He cut your palm. Cut his. Blood to blood. You came together, wound to wound, sealing the vow. Forever.'],
      write: ['One line. Honest. "The fog is a hand over the town\'s mouth." He smiled. "There you are." You wrote more. He watched.'],
      mara: ['She stood in the dark. "You\'ve poisoned him." Nate stepped forward. "I never wanted you." She left broken.'],
      shower: ['Hot water. Blood washing away. His hands on you, reverent, claiming. You came against the tile as steam filled the room.'],
      breakfast: ['"You\'re dripping already," he said over coffee. His foot slid up your calf. You couldn\'t eat. Couldn\'t think. Only ache.']
    };

    const activityOutcomes = outcomes[activity.id] || ['You spent time together. It was perfect.'];
    const randomOutcome = activityOutcomes[Math.floor(Math.random() * activityOutcomes.length)];

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
          <div className="mb-8 max-h-[65vh] overflow-y-auto">
            {Object.entries(ACTIVITY_SECTIONS).map(([section, activities]) => (
              <div key={section} className="mb-6">
                <h3 className="text-purple-400 text-sm font-bold mb-2">{section}</h3>
                <div className="grid grid-cols-4 gap-2">
                  {activities.map(activity => (
                    <button
                      key={activity.id}
                      onClick={() => handleCoupleActivity(activity)}
                      className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-center transition-all"
                    >
                      <p className="text-white text-xs">{activity.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}



        {/* Actions */}
        {!workMode && !coupleActivity && !processing && (
          <div className="space-y-4">
            {activeCharacter === 'nate' && (
              <button
                onClick={() => setWorkMode('therapy')}
                className="w-full bg-blue-900/40 hover:bg-blue-900/60 border-2 border-blue-500/50 rounded-xl p-6 text-left transition-all"
              >
                <h3 className="text-white text-lg font-bold mb-2">See a Patient</h3>
                <p className="text-gray-400 text-sm">Professional therapy... or something darker</p>
              </button>
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
                  onClick={() => setActiveCharacter('nate')}
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