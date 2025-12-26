import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const ACTIVITY_SECTIONS = {
  '🕊️ Marble (The Pigeon)': [
    { id: 'feed-marble', label: 'Feed Marble' },
    { id: 'talk-marble', label: 'Talk to Marble' },
    { id: 'marble-tricks', label: 'Teach Tricks' },
    { id: 'marble-cuddle', label: 'Cuddle Marble' },
    { id: 'marble-messages', label: 'Send Letters via Marble' },
    { id: 'marble-shed', label: 'Marble in Knife Shed' },
    { id: 'marble-jealous', label: 'Marble Gets Jealous' },
    { id: 'marble-photo', label: 'Photoshoot' },
    { id: 'marble-sleep', label: 'Marble Sleeps Between You' },
    { id: 'marble-date', label: 'Date with Marble' }
  ],
  'Obsession': [
    { id: 'stalk', label: 'Follow Them' },
    { id: 'watch', label: 'Watch Sleep' },
    { id: 'photos', label: 'Take Photos' },
    { id: 'belongings', label: 'Steal Item' },
    { id: 'admire', label: 'Admire' },
    { id: 'possessive', label: 'Mark Territory' },
    { id: 'scent', label: 'Smell Their Clothes' },
    { id: 'shrine', label: 'Your Secret Shrine' }
  ],
  'Knife Play': [
    { id: 'knife-tease', label: 'Knife on Skin' },
    { id: 'knife-handle', label: 'Handle Play' },
    { id: 'bite-marks', label: 'Bite & Mark' },
    { id: 'blood-play', label: 'Blood Play' },
    { id: 'shed-visit', label: 'Visit Knife Shed' },
    { id: 'rose-thorns', label: 'Rose Thorns' },
    { id: 'new-knife', label: 'Buy New Knife' },
    { id: 'knife-worship', label: 'Worship Their Body with Blade' }
  ],
  'Intimate': [
    { id: 'rough', label: 'Rough Sex' },
    { id: 'desperate', label: 'Desperate' },
    { id: 'worship', label: 'Worship' },
    { id: 'marks', label: 'Leave Marks' },
    { id: 'possessive-sex', label: 'Mine' },
    { id: 'gentle', label: 'Gentle' },
    { id: 'shower', label: 'Shower Together' },
    { id: 'morning', label: 'Morning Sex' },
    { id: 'public-tease', label: 'Public Teasing' },
    { id: 'blindfold', label: 'Blindfold & Trust' }
  ],
  'Daily Life': [
    { id: 'cooking', label: 'Cook Together' },
    { id: 'work', label: 'Work (Writing)' },
    { id: 'forest', label: 'Forest Walk' },
    { id: 'cabin', label: 'Visit Cabin' },
    { id: 'cuddling', label: 'Naked Cuddles' },
    { id: 'grocery', label: 'Grocery Shopping' },
    { id: 'movie', label: 'Movie Night' },
    { id: 'music', label: 'Listen to Music' },
    { id: 'stargazing', label: 'Stargazing' },
    { id: 'books', label: 'Read Together' }
  ],
  'Communication': [
    { id: 'text', label: 'Text Constantly' },
    { id: 'call', label: 'Video Call' },
    { id: 'voicemail', label: 'Love Voicemails' },
    { id: 'notes', label: 'Leave Notes' },
    { id: 'playlist', label: 'Make Playlist' },
    { id: 'letters', label: 'Write Love Letters' }
  ]
};

export default function YandereCoupleHome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [vampireStage, setVampireStage] = useState('human');

  const { data: coupleData } = useQuery({
    queryKey: ['yandereCoupleState'],
    queryFn: async () => {
      const existing = await base44.entities.VampireState.filter({ vampire_name: 'Yandere Couple' });
      if (existing.length > 0) return existing[0];
      
      const created = await base44.entities.VampireState.create({
        vampire_name: 'Yandere Couple',
        gender: 'custom',
        sexuality: 'bisexual',
        job: 'Book 1: Human Obsession',
        humanity: 50,
        vampire_stage: 1,
        vampire_power_level: 0,
        unlocked_powers: [],
        emotional_mode: 'feeling',
        time_of_day: 'day'
      });
      return created;
    }
  });

  const handleActivity = async (activity) => {
    setProcessing(true);

    const outcomes = {
      // Marble interactions
      'feed-marble': 'Eric scattered seeds. Marble cooed happily. Ruby smiled. "He loves you," she said. "Not as much as you do," he replied.',
      'talk-marble': 'You told Marble everything. He tilted his head. Understood somehow. Ruby laughed. "Our therapist pigeon."',
      'marble-tricks': 'Marble learned to land on command. To deliver notes. To coo when you kissed. "Smartest pigeon alive," Ruby beamed.',
      'marble-cuddle': 'Marble nestled between you both. Warm feathers. Soft cooing. "Our little family," Eric whispered. Ruby agreed.',
      'marble-messages': 'You tied a note to Marble\'s leg. He flew to Ruby at work. She blushed reading it. "Come home. I need you. Now."',
      'marble-shed': 'Marble perched in the knife shed. Unbothered by the blades. "He trusts us completely," Eric said. Like Ruby did.',
      'marble-jealous': 'Marble pecked Eric\'s hand when he kissed Ruby. They laughed. "Even the pigeon wants you to himself," Eric joked.',
      'marble-photo': 'Photoshoot with Marble. Ruby held him. Eric took 50 photos. She looked perfect. She always did.',
      'marble-sleep': 'Marble slept between your heads. Cooing softly. Ruby\'s hand found Eric\'s. "This is perfect," she breathed.',
      'marble-date': 'Picnic in the park. Marble on your shoulder. Ruby fed you grapes. Eric felt like the luckiest man alive.',
      
      // Obsession
      stalk: 'You followed them from work. They didn\'t notice. You memorized every step. Every breath. Every pause.',
      watch: 'You watched them sleep. So peaceful. So vulnerable. So completely yours.',
      photos: 'Another photo added to the collection. Thousands now. Every angle. Every expression. Perfect.',
      belongings: 'You took their hoodie. It still smells like them. You\'ll sleep in it tonight.',
      admire: 'Just watching them exist. The way they move. Breathe. Smile. Perfect. Always perfect.',
      possessive: 'Hickeys. Scratches. Marks they can\'t hide. Everyone needs to see they\'re taken.',
      scent: 'You buried your face in their shirt. Breathed deep. Their scent. Your drug. Your addiction.',
      shrine: 'Photos. Hair. Items they touched. Your secret shrine. Your altar to them. Your obsession made physical.',
      
      // Knife Play
      'knife-tease': 'You traced the blade down their body. Not cutting. Just feeling. They shivered. They trusted you completely.',
      'knife-handle': 'The knife handle pressed against them. They came so hard. You smiled wickedly at what you\'d discovered.',
      'bite-marks': 'You bit their neck. Drew blood. Marked them. "Now everyone knows you\'re mine." They moaned in agreement.',
      'blood-play': 'A little blood. A lot of trust. You licked it off their skin. They looked at you like you were everything.',
      'shed-visit': 'You showed them your knife collection. They weren\'t scared. They were fascinated. Perfect match.',
      'rose-thorns': 'Thorns scraped their skin. Not breaking it. Almost. They gasped and said "mark me." So you did.',
      'new-knife': 'You bought a new knife. Silver. Beautiful. Deadly. They looked at it the same way they looked at you.',
      'knife-worship': 'The blade traced their curves. Gentle. Reverent. They trusted you with their life. Their body. Their soul.',
      
      // Intimate
      rough: 'Nails down their back. Teeth on their throat. Hard. Desperate. Consuming.',
      desperate: 'Couldn\'t wait. Couldn\'t breathe without them. Fucked them until you both forgot where one ended and the other began.',
      worship: 'On your knees. Worshipping every inch. They\'re your god. Your religion. Your everything.',
      marks: 'Bruises blooming on their skin. Your artwork. Your signature. Your claim.',
      'possessive-sex': '"Say you\'re mine." Thrust. "SAY IT." They screamed it. Over and over.',
      gentle: 'Slow. Tender. Worshipful. They deserved gentleness. Sometimes. When they\'ve been good.',
      shower: 'Water cascading. Hands roaming. Kissing. Touching. "I love you," whispered against wet skin.',
      morning: 'Woke up hard. They were already awake. Already wanting. Morning sex. Best way to start the day.',
      'public-tease': 'Hand under the table. In the restaurant. They bit their lip. Tried to stay quiet. You smiled wickedly.',
      blindfold: 'Blindfolded them. Made them trust. Made them feel. "I\'ve got you," you promised. You always did.',
      
      // Daily Life
      cooking: 'Cooked together. Your hands kept wandering. Stolen kisses. The food almost burned. Worth it.',
      work: 'Eric wrote. Ruby watched. He accidentally wrote a sex scene about them. She loved it.',
      forest: 'Walked through the forest hand in hand. The trees watched. You didn\'t care. This was your place.',
      cabin: 'The abandoned cabin. Needles on the floor. You talked about your pasts. No judgment. Just understanding.',
      cuddling: '"Naked Friday," she said. You both stripped down. Spent the day tangled together. Paradise.',
      grocery: 'Grocery shopping. Never let go of their hand. Not once. People stared. You didn\'t care.',
      movie: 'Movie night. You didn\'t watch the screen. Only them. Their reactions. Their smiles. Their beauty.',
      music: 'Your song played. You danced. Slow. Close. "This is us," they whispered. "Forever," you replied.',
      stargazing: 'Lying under stars. Fingers intertwined. "Make a wish," they said. "I already have everything," you answered.',
      books: 'Reading together. Their head on your shoulder. Your arm around them. Peace. Perfect peace.',
      
      // Communication
      text: '32 texts in an hour. "Miss you." "Love you." "Thinking of you." "Are you okay?" "Who\'s there?"',
      call: 'Video call. Needed to see their face. Needed to know they were alone. Safe. Yours.',
      voicemail: 'Left them another voicemail. "I love you. I need you. I can\'t breathe without you. Call me back."',
      notes: 'Left notes everywhere. Pockets. Bags. Car. "You\'re mine." "I love you." "Don\'t forget."',
      playlist: 'Made them a playlist. 47 songs. Each one a memory. A moment. A reason you loved them.',
      letters: 'Wrote a 10-page love letter. Detailed everything. How they made you feel. How you needed them. How you\'d die without them.'
    };

    const activityOutcome = outcomes[activity.id] || 'You spent time together. Obsessively.';

    setTimeout(async () => {
      setOutcome(activityOutcome);
      
      await base44.entities.NightLog.create({
        entry: `Yandere Couple: ${activityOutcome}`,
        category: 'interaction',
        intensity: 'significant'
      });
      
      queryClient.invalidateQueries(['yandereCoupleState']);
      
      setTimeout(() => {
        setProcessing(false);
        setOutcome('');
      }, 4000);
    }, 2000);
  };

  const handleTransition = async (stage) => {
    if (stage === 'deciding') {
      setOutcome('Book 2: "We could be immortal." The idea took root. Dangerous. Tempting. Forever together.');
      setVampireStage('deciding');
    } else if (stage === 'vampire') {
      setOutcome('Book 3: The bite. The blood. The transformation. No longer human. No longer mortal. Forever bound in darkness.');
      setVampireStage('vampire');
      
      await base44.entities.VampireState.update(coupleData.id, {
        vampire_stage: 2,
        vampire_power_level: 25,
        unlocked_powers: ['Enhanced Senses', 'Compulsion'],
        job: 'Book 3: Vampire Obsession'
      });
      queryClient.invalidateQueries(['yandereCoupleState']);
    }
    
    setTimeout(() => setOutcome(''), 5000);
  };

  if (!coupleData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-950 to-black p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(createPageUrl('VampireHome'))}
          className="text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Eric & Ruby</h1>
          <p className="text-gray-400">Book 1: Obsessive. Possessive. Completely consumed by each other.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 text-center border-2 border-red-500">
            <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <h3 className="text-white font-bold">Eric</h3>
            <p className="text-gray-400 text-sm">The Obsessive One</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 text-center border-2 border-pink-500">
            <Heart className="w-8 h-8 text-pink-400 mx-auto mb-2" />
            <h3 className="text-white font-bold">Ruby</h3>
            <p className="text-gray-400 text-sm">The Possessed One</p>
          </div>
        </div>

        {!processing && (
          <div className="mb-8 max-h-[65vh] overflow-y-auto">
            {Object.entries(ACTIVITY_SECTIONS).map(([section, activities]) => (
              <div key={section} className="mb-6">
                <h3 className="text-red-400 text-sm font-bold mb-2">{section}</h3>
                <div className={`grid gap-2 ${section.includes('Marble') ? 'grid-cols-5' : 'grid-cols-4'}`}>
                  {activities.map(activity => (
                    <button
                      key={activity.id}
                      onClick={() => handleActivity(activity)}
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

        <AnimatePresence>
          {outcome && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 text-center"
            >
              <p className="text-gray-300 leading-relaxed">{outcome}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {processing && (
          <div className="text-center">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-red-400"
            >
              Processing...
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}