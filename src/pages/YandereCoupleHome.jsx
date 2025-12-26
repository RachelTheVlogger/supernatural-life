import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const ACTIVITY_SECTIONS = {
  'Obsession': [
    { id: 'stalk', label: 'Follow Them' },
    { id: 'watch', label: 'Watch Sleep' },
    { id: 'photos', label: 'Take Photos' },
    { id: 'belongings', label: 'Steal Item' },
    { id: 'jealous', label: 'Get Jealous' },
    { id: 'possessive', label: 'Mark Territory' }
  ],
  'Control': [
    { id: 'isolate', label: 'Isolate' },
    { id: 'manipulate', label: 'Manipulate' },
    { id: 'track', label: 'Track Phone' },
    { id: 'threaten', label: 'Threaten Rival' },
    { id: 'claim', label: 'Public Claim' },
    { id: 'punish', label: 'Punish' }
  ],
  'Intimate': [
    { id: 'rough', label: 'Rough Sex' },
    { id: 'desperate', label: 'Desperate' },
    { id: 'worship', label: 'Worship' },
    { id: 'marks', label: 'Leave Marks' },
    { id: 'possessive-sex', label: 'Mine' },
    { id: 'gentle', label: 'Gentle' }
  ],
  'Daily Life': [
    { id: 'cooking', label: 'Cook' },
    { id: 'work', label: 'Work' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'date', label: 'Date Night' },
    { id: 'movie', label: 'Movie' },
    { id: 'cleaning', label: 'Clean' }
  ],
  'Communication': [
    { id: 'text', label: 'Text Constantly' },
    { id: 'call', label: 'Video Call' },
    { id: 'voicemail', label: 'Love Voicemails' },
    { id: 'notes', label: 'Leave Notes' }
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
      stalk: 'You followed them from work. They didn\'t notice. You memorized every step. Every breath. Every pause.',
      watch: 'You watched them sleep. So peaceful. So vulnerable. So completely yours.',
      photos: 'Another photo added to the collection. Thousands now. Every angle. Every expression. Perfect.',
      belongings: 'You took their hoodie. It still smells like them. You\'ll sleep in it tonight.',
      jealous: 'Someone looked at them too long. Your blood boiled. They need to know who they belong to.',
      possessive: 'Hickeys. Scratches. Marks they can\'t hide. Everyone needs to see they\'re taken.',
      isolate: 'Convinced them to skip the party. "It\'s just us tonight." Always just us.',
      manipulate: 'Guilt. Love. Fear. You know exactly which buttons to push. They stayed.',
      track: 'Phone tracker installed. You know where they are. Always. It\'s for their safety.',
      threaten: 'That coworker who keeps flirting? Had a little chat. They won\'t make that mistake again.',
      claim: 'Arm around them in public. Hand on their neck. Possessive kiss. Message clear: MINE.',
      punish: 'They talked to someone you didn\'t approve of. Now they\'re apologizing. Begging. Learning.',
      rough: 'Nails down their back. Teeth on their throat. Hard. Desperate. Consuming.',
      desperate: 'Couldn\'t wait. Couldn\'t breathe without them. Fucked them until you both forgot where one ended and the other began.',
      worship: 'On your knees. Worshipping every inch. They\'re your god. Your religion. Your everything.',
      marks: 'Bruises blooming on their skin. Your artwork. Your signature. Your claim.',
      'possessive-sex': '"Say you\'re mine." Thrust. "SAY IT." They screamed it. Over and over.',
      gentle: 'Slow. Tender. Worshipful. They deserved gentleness. Sometimes. When they\'ve been good.',
      cooking: 'Made their favorite meal. Watched them eat. Every bite they took felt like love.',
      work: 'Normal day at work. But texted them 47 times. Just to make sure they were thinking of you.',
      shopping: 'Grocery shopping together. Held hands the entire time. They tried to let go once. Once.',
      date: 'Date night. Fancy restaurant. You stared at them the entire time. They blushed. Perfect.',
      movie: 'Movie night. You didn\'t watch the screen. Only them. Their reactions. Their smiles. Theirs.',
      cleaning: 'Cleaned the apartment. Found more of their things mixed with yours. Good. As it should be.',
      text: '32 texts in an hour. "Miss you." "Love you." "Thinking of you." "Are you okay?" "Who\'s there?"',
      call: 'Video call. Needed to see their face. Needed to know they were alone. Safe. Yours.',
      voicemail: 'Left them another voicemail. "I love you. I need you. I can\'t breathe without you. Call me back."',
      notes: 'Left notes everywhere. Pockets. Bags. Car. "You\'re mine." "I love you." "Don\'t forget."'
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
                <div className="grid grid-cols-4 gap-2">
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