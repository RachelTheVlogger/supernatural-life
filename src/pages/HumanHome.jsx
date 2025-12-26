import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, BookOpen, Heart, Eye, Moon, Coffee, School, Home as HomeIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const HUMAN_ACTIVITIES = [
  { id: 'school', label: 'Go to School/Work', icon: School, duration: 3000 },
  { id: 'coffee', label: 'Coffee Shop', icon: Coffee, duration: 2000 },
  { id: 'friends', label: 'Hang with Friends', icon: Users, duration: 2500 },
  { id: 'read', label: 'Read a Book', icon: BookOpen, duration: 2000 },
  { id: 'explore', label: 'Explore the Town', icon: Eye, duration: 3000 },
  { id: 'party', label: 'Go to a Party', icon: Heart, duration: 3500 }
];

export default function HumanHome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeAction, setActiveAction] = useState(null);
  const [outcome, setOutcome] = useState('');
  const [showEncounter, setShowEncounter] = useState(false);

  const { data: humans = [] } = useQuery({
    queryKey: ['humans'],
    queryFn: () => base44.entities.Human.list()
  });

  const { data: vampireStates = [] } = useQuery({
    queryKey: ['vampireState'],
    queryFn: () => base44.entities.VampireState.list()
  });

  const human = humans[0];

  const handleActivity = async (activity) => {
    if (!human) return;
    setActiveAction(activity.id);
    
    setTimeout(async () => {
      const encounterChance = Math.random();
      const hasVampire = vampireStates.length > 0;
      
      let result = '';
      let awarenessGain = 0;
      let dangerGain = 0;
      let vampireEncounter = false;

      if (activity.id === 'explore' && encounterChance > 0.6 && hasVampire) {
        vampireEncounter = true;
        awarenessGain = Math.floor(Math.random() * 15) + 10;
        dangerGain = Math.floor(Math.random() * 10) + 5;
        
        const vampire = vampireStates[0];
        result = `You were walking through a dark alley when you saw them.\n\n${vampire.vampire_name}. Standing impossibly still. Eyes reflecting moonlight like an animal.\n\nThey smiled. "You shouldn't be here."\n\nYou ran. But you felt their eyes on you the entire way home.\n\nSomething's not right about this town.`;
      } else if (activity.id === 'party' && encounterChance > 0.5 && hasVampire) {
        vampireEncounter = true;
        awarenessGain = Math.floor(Math.random() * 20) + 15;
        dangerGain = Math.floor(Math.random() * 15) + 10;
        
        const vampire = vampireStates[0];
        result = `The party was packed. You noticed them immediately.\n\n${vampire.vampire_name}. They moved through the crowd like water. Everyone drawn to them.\n\nThey approached you. "First time at one of these?"\n\nTheir hand was ice cold. Their smile... predatory.\n\n"I'll be seeing you around," they said.\n\nYou believe them.`;
      } else if (activity.id === 'coffee' && encounterChance > 0.7 && hasVampire) {
        vampireEncounter = true;
        awarenessGain = Math.floor(Math.random() * 10) + 5;
        
        const vampire = vampireStates[0];
        result = `You were ordering coffee when you noticed them.\n\n${vampire.vampire_name}. Sitting alone. Reading a book that looked centuries old.\n\nThey looked up. Locked eyes with you. Smiled.\n\n"Beautiful night, isn't it?"\n\nIt was 2pm.`;
      } else {
        const normalOutcomes = {
          school: [
            'Classes were boring. You doodled in your notebook.',
            'Your teacher talked about the local history. Lots of mysterious deaths over the years.',
            'Someone mentioned seeing strange things at night. Everyone laughed.'
          ],
          coffee: [
            'You got your usual. The barista said you look tired. You are.',
            'Overheard two people talking about animal attacks. Weird.',
            'Your coffee tasted metallic. They made a new one.'
          ],
          friends: [
            'You hung out. Talked about nothing. It was nice.',
            'Your friend mentioned their cousin went missing last month. Still no body.',
            'Everyone seems on edge lately. Something in the air.'
          ],
          read: [
            'You read about local folklore. Vampires. Witches. Old legends.',
            'The book talked about protection charms. You laughed. Then pocketed a few.',
            'Found a weird symbol in the margins. It felt important.'
          ],
          explore: [
            'You walked around town. Nothing unusual.',
            'You found a weird shop. "Apothecary." Smelled like herbs.',
            'Saw someone in a hoodie watching you. When you looked again, they were gone.'
          ],
          party: [
            'Music. Dancing. Normal night.',
            'Someone offered you a weird drink. You declined. They seemed disappointed.',
            'The party felt off. Like predators circling prey.'
          ]
        };
        
        result = normalOutcomes[activity.id][Math.floor(Math.random() * normalOutcomes[activity.id].length)];
        awarenessGain = Math.floor(Math.random() * 3);
      }

      if (vampireEncounter) {
        await base44.entities.Human.update(human.id, {
          vampire_encounters: (human.vampire_encounters || 0) + 1
        });
      }

      await base44.entities.Human.update(human.id, {
        awareness_level: Math.min(100, (human.awareness_level || 0) + awarenessGain),
        danger_level: Math.min(100, (human.danger_level || 0) + dangerGain)
      });

      setOutcome(result);
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        setActiveAction(null);
        setOutcome('');
      }, 5000);
    }, activity.duration);
  };

  if (!human) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">No human character found...</p>
      </div>
    );
  }

  const awarenessColor = human.awareness_level > 70 ? 'text-red-400' : human.awareness_level > 40 ? 'text-yellow-400' : 'text-green-400';
  const dangerColor = human.danger_level > 70 ? 'text-red-400' : human.danger_level > 40 ? 'text-orange-400' : 'text-green-400';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate(createPageUrl('Home'))}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          {vampireStates.length > 0 && (
            <button
              onClick={() => navigate(createPageUrl('Night'))}
              className="text-purple-600 hover:text-purple-800 text-sm"
            >
              Switch to Vampire →
            </button>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{human.name}</h1>
          <p className="text-gray-600 capitalize">{human.job} • {human.gender}</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 text-sm">Awareness</span>
              <span className={`font-bold ${awarenessColor}`}>{human.awareness_level || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                style={{ width: `${human.awareness_level || 0}%` }}
                className="h-2 bg-gradient-to-r from-green-500 to-red-500 rounded-full"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">How much you know</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 text-sm">Danger</span>
              <span className={`font-bold ${dangerColor}`}>{human.danger_level || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                style={{ width: `${human.danger_level || 0}%` }}
                className="h-2 bg-gradient-to-r from-green-500 to-red-500 rounded-full"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Risk level</p>
          </div>
        </motion.div>

        {/* Vampire Encounters Warning */}
        {human.vampire_encounters > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6"
          >
            <p className="text-red-800 font-medium">⚠️ Vampire Encounters: {human.vampire_encounters}</p>
            <p className="text-red-600 text-sm mt-1">You've seen things you can't explain. They're watching you.</p>
          </motion.div>
        )}

        {/* Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Daily Life</h2>
          {HUMAN_ACTIVITIES.map((activity, i) => (
            <motion.button
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.05 }}
              onClick={() => handleActivity(activity)}
              disabled={activeAction}
              className="w-full bg-white hover:bg-gray-50 rounded-xl p-4 flex items-center gap-3 shadow-sm transition-all disabled:opacity-50"
            >
              <activity.icon className="w-5 h-5 text-purple-600" />
              <span className="text-gray-900 font-medium">{activity.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Can be turned option */}
        {human.awareness_level >= 80 && vampireStates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-red-900 to-purple-900 rounded-2xl p-6 text-center"
          >
            <h3 className="text-white text-xl font-bold mb-2">The Choice</h3>
            <p className="text-gray-300 mb-4">You know the truth now. You can't unknow it.</p>
            <button
              onClick={async () => {
                if (confirm('Become a vampire? This cannot be undone.')) {
                  const vampire = vampireStates[0];
                  await base44.entities.VampireState.create({
                    vampire_name: human.name,
                    gender: human.gender,
                    sexuality: human.sexuality,
                    job: 'Night Shift Nurse',
                    hunger_state: 'restless',
                    emotional_mode: 'feeling',
                    vampire_stage: 1,
                    vampire_power_level: 0,
                    unlocked_powers: ['Enhanced Senses'],
                    humanity: 80,
                    moral_path: 'humane'
                  });
                  
                  await base44.entities.NightLog.create({
                    entry: `${human.name} was turned. The transformation was agonizing. Beautiful. Final. They died human. They rose vampire.`,
                    category: 'interaction',
                    intensity: 'significant'
                  });
                  
                  await base44.entities.Human.delete(human.id);
                  queryClient.invalidateQueries();
                  navigate(createPageUrl('Night'));
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold transition-colors"
            >
              Accept the Transformation
            </button>
          </motion.div>
        )}
      </div>

      {/* Outcome Modal */}
      <AnimatePresence>
        {outcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full"
            >
              <p className="text-gray-800 leading-relaxed whitespace-pre-line">{outcome}</p>
            </motion.div>
          </motion.div>
        )}

        {activeAction && !outcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-white text-xl"
            >
              Living your life...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}