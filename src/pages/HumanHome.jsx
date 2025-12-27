import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, BookOpen, Heart, Eye, Moon, Coffee, School, Home as HomeIcon, Search, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import MangaCareer from '@/components/nightbound/MangaCareer';
import MangaStore from '@/components/nightbound/MangaStore';

const HUMAN_ACTIVITIES = [
  { id: 'school', label: 'Go to School/Work', icon: School, duration: 5000, awarenessChance: 0.1 },
  { id: 'coffee', label: 'Coffee Shop', icon: Coffee, duration: 4000, awarenessChance: 0.15 },
  { id: 'friends', label: 'Hang with Friends', icon: Users, duration: 4500, awarenessChance: 0.05 },
  { id: 'read', label: 'Read a Book', icon: BookOpen, duration: 4000, awarenessChance: 0.1 },
  { id: 'explore', label: 'Explore the Town', icon: Eye, duration: 5000, awarenessChance: 0.3 },
  { id: 'party', label: 'Go to a Party', icon: Heart, duration: 5500, awarenessChance: 0.2 },
  { id: 'gym', label: 'Go to the Gym', icon: Users, duration: 4500, awarenessChance: 0.1 },
  { id: 'library', label: 'Study at Library', icon: BookOpen, duration: 5000, awarenessChance: 0.15 },
  { id: 'nightwalk', label: 'Walk Alone at Night', icon: Moon, duration: 4500, awarenessChance: 0.4, requiresAwareness: 10 },
  { id: 'research', label: 'Research Vampires', icon: Search, duration: 6000, requiresAwareness: 20 },
  { id: 'investigate', label: 'Investigate Disappearances', icon: Eye, duration: 6500, requiresAwareness: 40 },
  { id: 'seek', label: 'Deliberately Seek Them Out', icon: Eye, duration: 7000, requiresAwareness: 60 },
  { id: 'confront', label: 'Confront What You Know', icon: Shield, duration: 7500, requiresAwareness: 80 }
];

export default function HumanHome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeAction, setActiveAction] = useState(null);
  const [outcome, setOutcome] = useState('');
  const [showEncounter, setShowEncounter] = useState(false);
  const [showResearch, setShowResearch] = useState(false);
  const [evidenceCollected, setEvidenceCollected] = useState([]);
  const [showManga, setShowManga] = useState(false);
  const [showMangaStore, setShowMangaStore] = useState(false);

  const { data: humans = [] } = useQuery({
    queryKey: ['humans'],
    queryFn: () => base44.entities.Human.list()
  });

  const { data: vampireStates = [] } = useQuery({
    queryKey: ['vampireState'],
    queryFn: () => base44.entities.VampireState.list()
  });

  const human = humans[0];

  const { isLoading: vampireLoading } = useQuery({
    queryKey: ['vampireState'],
    enabled: false
  });

  // Redirect to Home if no human exists
  React.useEffect(() => {
    if (humans.length === 0 && !vampireLoading) {
      navigate(createPageUrl('Home'), { replace: true });
    }
  }, [humans, vampireLoading, navigate]);

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

      if (activity.id === 'gym') {
        awarenessGain = Math.floor(Math.random() * 5);
        dangerGain = Math.floor(Math.random() * 3);
        result = 'You worked out. Stayed healthy. Normal life. But you kept looking over your shoulder. Can\'t shake the feeling you\'re being watched.';
      } else if (activity.id === 'library') {
        awarenessGain = Math.floor(Math.random() * 8) + 2;
        result = 'Studied for hours. Tried to focus. But your eyes kept drifting to books about folklore. Mythology. Creatures that shouldn\'t exist.';
      } else if (activity.id === 'nightwalk') {
        awarenessGain = Math.floor(Math.random() * 15) + 10;
        dangerGain = Math.floor(Math.random() * 20) + 10;
        const nightWalkOutcomes = [
          'The streets were empty. Too quiet. You heard footsteps behind you. When you turned, nothing. But you felt eyes on you. Watching. Waiting.',
          'Someone followed you home. You\'re sure of it. Tall. Moved too smoothly. Disappeared when you looked directly at them. You\'re not imagining this.',
          'A figure in the shadows. They didn\'t try to hide. Just... watched. You locked eyes for a moment. They smiled. You ran.',
          'You walked past an alley. Heard voices. Saw something that looked like... No. Can\'t be. But the body on the ground. The blood. You kept walking. Faster.'
        ];
        result = nightWalkOutcomes[Math.floor(Math.random() * nightWalkOutcomes.length)];
      } else if (activity.id === 'research') {
        awarenessGain = Math.floor(Math.random() * 15) + 20;
        const researchOutcomes = [
          'You found old newspapers. "Mysterious deaths." All drained of blood. Decades apart. Same MO. Same locations. This has been happening for over a century.',
          'Online forums. People talking about "them." Dismissed as conspiracy theories. But the details match. Too many witnesses. Too consistent. This is real.',
          'Library archives. Photos from the 1800s. You recognize someone from town. They haven\'t aged a day. Same face. Same eyes. Impossible. But there they are.',
          'Medical records. "Anemia." Hundreds of cases. All near the same addresses. Over centuries. Doctors noticed patterns but dismissed them. You see the truth now.',
          'You found protection rituals. Vervain. Garlic. Wooden stakes. Old wives tales, maybe. But every culture has them. Every continent. Same methods. You bought some.',
          'Missing persons reports. Dozens. All young. All last seen at night. Police say "ran away." But you know better. The pattern is clear. They were taken.'
        ];
        result = researchOutcomes[Math.floor(Math.random() * researchOutcomes.length)];
        setEvidenceCollected(prev => [...prev, result.split('.')[0]]);
      } else if (activity.id === 'investigate') {
        awarenessGain = Math.floor(Math.random() * 20) + 15;
        dangerGain = Math.floor(Math.random() * 25) + 15;
        const investigateOutcomes = [
          'You visited the last known locations. Found bite marks covered up as "animal attacks." Everyone lying. Everyone scared. You\'re getting too close.',
          'Talked to witnesses. They changed their stories mid-sentence. Eyes glazed. Like they\'d been... compelled. This is bigger than you thought.',
          'Found a body. Fresh. Police hadn\'t arrived yet. Two puncture wounds. Neck. Drained. You took photos. Evidence. Now you\'re a target.',
          'Followed a lead to an abandoned building. Found signs of habitation. Blackout curtains. No mirrors. Locked basement. You heard movement inside. Left quickly.'
        ];
        result = investigateOutcomes[Math.floor(Math.random() * investigateOutcomes.length)];
        setEvidenceCollected(prev => [...prev, 'Investigation evidence']);
      } else if (activity.id === 'confront') {
        awarenessGain = Math.floor(Math.random() * 25) + 25;
        dangerGain = Math.floor(Math.random() * 30) + 30;
        result = 'You know too much now. You\'re ready to confront the truth. To face them. This could be the end. Or the beginning of something darker.';
      } else if (activity.id === 'seek' && hasVampire) {
        vampireEncounter = true;
        awarenessGain = Math.floor(Math.random() * 20) + 20;
        dangerGain = Math.floor(Math.random() * 25) + 15;
        
        const vampire = vampireStates[0];
        const seekOutcomes = [
          `You went to the places they frequent. ${vampire.vampire_name} was there.\n\nThey saw you immediately. "Looking for someone?"\n\nYou couldn't speak. They stepped closer.\n\n"You should stop digging. For your own sake."\n\nBut their eyes said they liked that you were looking.`,
          `You staked out their house. Waited all night.\n\nDawn approached. No sign of them.\n\nThen: "${vampire.vampire_name}. Behind you. "Interesting hobby."\n\nYou spun around. They were inches away.\n\n"Next time, just knock."`,
          `You followed the pattern. The deaths. The sightings.\n\nIt led you to an abandoned building.\n\n${vampire.vampire_name} was waiting. "Impressive. Most don't figure it out."\n\nThey looked amused. Dangerous.\n\n"Since you know... want to talk about it?"`,
          `You went to the cemetery at night. Stupid. Desperate.\n\n${vampire.vampire_name} appeared like smoke. "Hoping to find me?"\n\nYou nodded. Couldn't lie.\n\n"Brave. Reckless. I respect that."\n\nThey circled you. Considering.`
        ];
        result = seekOutcomes[Math.floor(Math.random() * seekOutcomes.length)];
      } else if (activity.id === 'school') {
        awarenessGain = Math.floor(Math.random() * 5);
        const schoolOutcomes = [
          'Normal day. Classes. Friends. But you caught yourself staring out windows. Looking for shadows. Searching for something you can\'t name.',
          'Someone new at school. Pale. Beautiful. Moved like water. Nobody else seemed to notice how different they were. But you did.',
          'Fell asleep in class. Dreamed of teeth. Blood. Darkness. Woke up with everyone staring. You\'d been whispering something. Couldn\'t remember what.',
          'Found yourself researching instead of studying. Medieval history. Eastern European folklore. Vampires. You closed the tab when someone walked by.'
        ];
        result = schoolOutcomes[Math.floor(Math.random() * schoolOutcomes.length)];
      } else if (activity.id === 'coffee') {
        awarenessGain = Math.floor(Math.random() * 8);
        const coffeeOutcomes = [
          'Sat alone with your coffee. Watched people. Wondered which ones were real. Which ones were pretending. You\'re becoming paranoid.',
          'The barista had bite marks on their neck. "Boyfriend," they said quickly. Too quickly. Their eyes were distant. Scared. You didn\'t push.',
          'Someone sat across from you. Didn\'t order anything. Just watched. You tried to leave. They smiled. "Stay," they whispered. You stayed.',
          'Overheard a conversation. "...at night..." "...don\'t go alone..." "...people are disappearing..." They stopped talking when they saw you listening.'
        ];
        result = coffeeOutcomes[Math.floor(Math.random() * coffeeOutcomes.length)];
      } else if (activity.id === 'friends') {
        awarenessGain = Math.floor(Math.random() * 3);
        const friendOutcomes = [
          'Your friends laughed about the "vampire rumors." You didn\'t. They noticed. Asked if you were okay. You lied. Said you were fine.',
          'One friend seemed different. Quieter. Paler. Wearing high collars. Avoiding sunlight. You wanted to ask. Didn\'t dare.',
          'Everyone talking about the missing student. Police said runaway. Your friends believed it. You knew better. Stayed quiet.',
          'Normal hangout. Normal conversation. But you kept thinking about what you\'d seen. What you knew. You\'re changing. They don\'t notice yet.'
        ];
        result = friendOutcomes[Math.floor(Math.random() * friendOutcomes.length)];
      } else if (activity.id === 'read') {
        awarenessGain = Math.floor(Math.random() * 8) + 3;
        const readOutcomes = [
          'Started with fiction. Gothic novels. Dracula. Then switched to non-fiction. Historical accounts. Eyewitness testimonies. Too many to be coincidence.',
          'Found a book that shouldn\'t exist. Self-published. No author name. "A Hunter\'s Guide." Detailed. Specific. Written by someone who knew.',
          'Reading about vampire mythology. Every culture has them. Different names. Same creature. Same weakness. Same hunger. Universal fear.',
          'The book described protection methods. Vervain in tea. Salt at doorways. Invitation rules. You\'re memorizing everything. Just in case.'
        ];
        result = readOutcomes[Math.floor(Math.random() * readOutcomes.length)];
      } else if (activity.id === 'party') {
        awarenessGain = Math.floor(Math.random() * 12) + 5;
        dangerGain = Math.floor(Math.random() * 15) + 5;
        const partyOutcomes = [
          'The party was packed. Loud. Dark. Someone touched your neck. "Beautiful," they whispered. You turned. They were gone. Your neck tingled.',
          'Saw someone drinking from a bottle. Looked like wine. Too dark. Too thick. They saw you watching. Smiled. Offered you some. You declined.',
          'Someone followed you to a quiet room. Locked the door. "I know what you know," they said. "Be careful." Left through the window. Second floor.',
          'Everyone drunk. Everyone oblivious. But you saw them. In corners. Watching. Waiting. Hunting. You left early. Walked fast. Didn\'t look back.'
        ];
        result = partyOutcomes[Math.floor(Math.random() * partyOutcomes.length)];
        if (Math.random() > 0.6) vampireEncounter = true;
      } else if (activity.id === 'explore' && encounterChance > 0.6 && hasVampire) {
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

  const awarenessColor = human?.awareness_level > 70 ? 'text-red-400' : human?.awareness_level > 40 ? 'text-yellow-400' : 'text-green-400';
  const dangerColor = human?.danger_level > 70 ? 'text-red-400' : human?.danger_level > 40 ? 'text-orange-400' : 'text-green-400';

  if (!human) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">No human character found...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate(createPageUrl('Home'))}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex gap-3 items-center">
            <button
              onClick={() => setShowMangaStore(true)}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              📚 Manga Store
            </button>
            {vampireStates.length > 0 && (
              <button
                onClick={() => navigate(createPageUrl('Night'))}
                className="text-purple-400 hover:text-purple-300 text-sm"
              >
                Switch to Vampire →
              </button>
            )}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">{human.name}</h1>
          <p className="text-gray-400 capitalize">{human.job} • {human.gender}</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-sm">Awareness</span>
              <span className={`font-bold ${awarenessColor}`}>{human.awareness_level || 0}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                style={{ width: `${human.awareness_level || 0}%` }}
                className="h-2 bg-gradient-to-r from-green-500 to-red-500 rounded-full"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">How much you know</p>
          </div>

          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-sm">Danger</span>
              <span className={`font-bold ${dangerColor}`}>{human.danger_level || 0}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                style={{ width: `${human.danger_level || 0}%` }}
                className="h-2 bg-gradient-to-r from-green-500 to-red-500 rounded-full"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Risk level</p>
          </div>
        </motion.div>

        {/* High awareness warning */}
        {human.awareness_level >= 90 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-950/40 border border-red-500/30 rounded-xl p-4 mb-6"
          >
            <p className="text-red-300 font-medium mb-2">⚠️ You know too much</p>
            <p className="text-gray-400 text-sm mb-3">
              The truth is undeniable now. They know you know. This will end one way or another.
            </p>
            <p className="text-red-400 text-xs">
              Your life has changed forever. There's no going back to ignorance.
            </p>
          </motion.div>
        )}

        {/* Medium awareness */}
        {human.awareness_level >= 50 && human.awareness_level < 90 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-orange-950/40 border border-orange-500/30 rounded-xl p-4 mb-6"
          >
            <p className="text-orange-300 font-medium mb-2">👁️ The veil is lifting</p>
            <p className="text-gray-400 text-sm">
              You see the patterns now. The missing pieces. Every day brings more clarity. More danger.
            </p>
          </motion.div>
        )}

        {/* High danger warning */}
        {human.danger_level >= 70 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4 mb-6"
          >
            <p className="text-purple-300 font-medium mb-2">💀 You're being hunted</p>
            <p className="text-gray-400 text-sm">
              They've noticed you. Marked you. You feel eyes on you constantly. They're deciding what to do with you.
            </p>
          </motion.div>
        )}

        {/* Vampire Encounters Warning */}
        {human.vampire_encounters > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-950/40 border border-red-500/30 rounded-xl p-4 mb-6"
          >
            <p className="text-red-400 font-medium">⚠️ Vampire Encounters: {human.vampire_encounters}</p>
            <p className="text-red-300 text-sm mt-1">You've seen things you can't explain. They're watching you.</p>
          </motion.div>
        )}

        {/* Evidence Collected */}
        {evidenceCollected.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-4 h-4 text-purple-400" />
              <p className="text-purple-300 font-medium">Evidence Collected</p>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {evidenceCollected.slice(-5).map((evidence, i) => (
                <p key={i} className="text-gray-400 text-sm">• {evidence}</p>
              ))}
            </div>
          </motion.div>
        )}

        {/* Manga Career Access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <button
            onClick={() => setShowManga(true)}
            className="w-full bg-gradient-to-r from-purple-900/40 to-blue-900/40 hover:from-purple-900/60 hover:to-blue-900/60 border border-purple-500/30 rounded-xl p-4 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-purple-400" />
                <div className="text-left">
                  <h3 className="text-white font-medium">Manga Career</h3>
                  <p className="text-gray-400 text-sm">Create your own manga series</p>
                </div>
              </div>
              <span className="text-purple-400">→</span>
            </div>
          </button>
        </motion.div>

        {/* Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3 mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-4">Daily Life</h2>
          {HUMAN_ACTIVITIES.map((activity, i) => {
            const isLocked = activity.requiresAwareness && (human.awareness_level || 0) < activity.requiresAwareness;
            return (
              <motion.button
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                onClick={() => !isLocked && handleActivity(activity)}
                disabled={activeAction || isLocked}
                className={`w-full bg-gray-900 hover:bg-gray-800 rounded-xl p-4 flex items-center justify-between border border-gray-800 transition-all disabled:opacity-50 ${isLocked ? 'cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <activity.icon className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-medium">{activity.label}</span>
                </div>
                {isLocked && (
                  <span className="text-xs text-gray-500">Requires {activity.requiresAwareness}% awareness</span>
                )}
              </motion.button>
            );
          })}
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
              className="bg-gray-900 rounded-2xl p-6 max-w-lg w-full border border-gray-800"
            >
              <p className="text-gray-200 leading-relaxed whitespace-pre-line">{outcome}</p>
            </motion.div>
          </motion.div>
        )}

        {activeAction && !outcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
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

      {/* Modals */}
      <AnimatePresence>
        {showManga && (
          <MangaCareer
            servant={human}
            onClose={() => setShowManga(false)}
          />
        )}
        {showMangaStore && (
          <MangaStore
            currentEntityId={human?.id}
            onClose={() => setShowMangaStore(false)}
          />
        )}
        {showCareerSelector && (
          <CareerSelector
            human={human}
            onClose={() => setShowCareerSelector(false)}
            onSelect={(careerType) => {
              setShowCareerSelector(false);
              if (careerType === 'manga') setShowManga(true);
            }}
          />
        )}
        {showDating && vampireStates.length > 0 && (
          <ServantDating
            servant={human}
            vampireState={vampireStates[0]}
            onClose={() => setShowDating(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}