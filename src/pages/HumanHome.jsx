import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, BookOpen, Heart, Eye, Moon, Coffee, School, Home as HomeIcon, Search, Shield, X, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PersonalitySelector from '@/components/nightbound/PersonalitySelector';
import OnlyMortals from '@/components/nightbound/OnlyMortals';
import BloodBankCareer from '@/components/nightbound/BloodBankCareer';
import ArtCommissions from '@/components/nightbound/ArtCommissions';
import MusicCareer from '@/components/nightbound/MusicCareer';
import EscortCareer from '@/components/nightbound/EscortCareer';
import MakeupSystem from '@/components/nightbound/MakeupSystem';
import HumanSocialLife from '@/components/nightbound/HumanSocialLife';
import HumanMentalHealth from '@/components/nightbound/HumanMentalHealth';
import HumanApartment from '@/components/nightbound/HumanApartment';
import HumanSkills from '@/components/nightbound/HumanSkills';
import HumanDating from '@/components/nightbound/HumanDating';
import HumanSocialMedia from '@/components/nightbound/HumanSocialMedia';
import SubstanceSystem from '@/components/nightbound/SubstanceSystem';
import GroceryShopping from '@/components/nightbound/GroceryShopping';
import HumanPhone from '@/components/nightbound/HumanPhone';
import CasualHookups from '@/components/nightbound/CasualHookups';


const HUMAN_ACTIVITIES = [
  { id: 'phone', label: '📱 Phone', icon: Camera, duration: 0, isModal: true },
  { id: 'onlymortals', label: '📸 OnlyMortals', icon: Camera, duration: 0, isModal: true },
  { id: 'blood_bank', label: '🩸 Blood Bank Job', icon: Shield, duration: 0, isModal: true },
  { id: 'art_commissions', label: '🎨 Art Commissions', icon: BookOpen, duration: 0, isModal: true },
  { id: 'music_career', label: '🎵 Music Career', icon: Heart, duration: 0, isModal: true },
  { id: 'escort_work', label: '💋 Escort Work', icon: Heart, duration: 0, isModal: true },
  { id: 'makeup', label: '💄 Do Makeup', icon: Camera, duration: 0, isModal: true },
  { id: 'social_life', label: '👥 Social Life', icon: Users, duration: 0, isModal: true },
  { id: 'mental_health', label: '🧠 Mental Health', icon: Heart, duration: 0, isModal: true },
  { id: 'apartment', label: '🏠 Apartment', icon: HomeIcon, duration: 0, isModal: true },
  { id: 'skills', label: '⭐ Skills', icon: BookOpen, duration: 0, isModal: true },
  { id: 'dating', label: '💕 Dating', icon: Heart, duration: 0, isModal: true },
  { id: 'hookups', label: '🔥 Casual Hookups', icon: Users, duration: 0, isModal: true },
  { id: 'social_media', label: '📱 Social Media', icon: Eye, duration: 0, isModal: true },
  { id: 'substances', label: '💊 Substances', icon: Shield, duration: 0, isModal: true },
  { id: 'groceries', label: '🛒 Buy Groceries', icon: Coffee, duration: 0, isModal: true },
  { id: 'school', label: 'Go to School/Work', icon: School, duration: 5000, awarenessChance: 0.1 },
  { id: 'coffee', label: 'Coffee Shop', icon: Coffee, duration: 4000, awarenessChance: 0.15 },
  { id: 'friends', label: 'Hang with Friends', icon: Users, duration: 4500, awarenessChance: 0.05 },
  { id: 'read', label: 'Read a Book', icon: BookOpen, duration: 4000, awarenessChance: 0.1 },
  { id: 'explore', label: 'Explore the Town', icon: Eye, duration: 5000, awarenessChance: 0.3 },
  { id: 'party', label: 'Go to a Party', icon: Heart, duration: 5500, awarenessChance: 0.2 },
  { id: 'gym', label: 'Go to the Gym', icon: Users, duration: 4500, awarenessChance: 0.1 },
  { id: 'library', label: 'Study at Library', icon: BookOpen, duration: 5000, awarenessChance: 0.15 },
  { id: 'sleep', label: 'Go to Bed', icon: Moon, duration: 6000, awarenessChance: 0.2 },
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
  const [showIdentity, setShowIdentity] = useState(false);
  const [showOnlyMortals, setShowOnlyMortals] = useState(false);
  const [showBloodBank, setShowBloodBank] = useState(false);
  const [showArtCommissions, setShowArtCommissions] = useState(false);
  const [showMusicCareer, setShowMusicCareer] = useState(false);
  const [showEscortWork, setShowEscortWork] = useState(false);
  const [showMakeup, setShowMakeup] = useState(false);
  const [makeupContext, setMakeupContext] = useState('everyday');
  const [showSocialLife, setShowSocialLife] = useState(false);
  const [showMentalHealth, setShowMentalHealth] = useState(false);
  const [showApartment, setShowApartment] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const [showDating, setShowDating] = useState(false);
  const [showSocialMedia, setShowSocialMedia] = useState(false);
  const [showSubstances, setShowSubstances] = useState(false);
  const [showGroceries, setShowGroceries] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showHookups, setShowHookups] = useState(false);
  const [hadObsession, setHadObsession] = useState(false);

  const { data: humans = [], isLoading } = useQuery({
    queryKey: ['humans'],
    queryFn: () => base44.entities.Human.list()
  });

  const { data: vampireStates = [] } = useQuery({
    queryKey: ['vampireState'],
    queryFn: () => base44.entities.VampireState.list()
  });

  const human = humans[0];
  const hasVampire = vampireStates.length > 0;
  const vampire = vampireStates[0];

  const handleActivity = async (activity) => {
    if (!human?.id) return;
    
    if (activity.isModal) {
      if (activity.id === 'phone') {
        setShowPhone(true);
      } else if (activity.id === 'onlymortals') {
        setShowOnlyMortals(true);
      } else if (activity.id === 'blood_bank') {
        setShowBloodBank(true);
      } else if (activity.id === 'art_commissions') {
        setShowArtCommissions(true);
      } else if (activity.id === 'music_career') {
        setShowMusicCareer(true);
      } else if (activity.id === 'escort_work') {
        setShowEscortWork(true);
      } else if (activity.id === 'makeup') {
        setShowMakeup(true);
      } else if (activity.id === 'social_life') {
        setShowSocialLife(true);
      } else if (activity.id === 'mental_health') {
        setShowMentalHealth(true);
      } else if (activity.id === 'apartment') {
        setShowApartment(true);
      } else if (activity.id === 'skills') {
        setShowSkills(true);
      } else if (activity.id === 'dating') {
        setShowDating(true);
      } else if (activity.id === 'hookups') {
        setShowHookups(true);
      } else if (activity.id === 'social_media') {
        setShowSocialMedia(true);
      } else if (activity.id === 'substances') {
        setShowSubstances(true);
      } else if (activity.id === 'groceries') {
        setShowGroceries(true);
      }
      return;
    }
    
    setActiveAction(activity.id);
    
    setTimeout(async () => {
      try {
      const encounterChance = Math.random();
      const currentVampireStates = vampireStates;
      const hasVampire = currentVampireStates.length > 0;
      const vampire = hasVampire ? currentVampireStates[0] : null;
      
      let result = '';
      let awarenessGain = 0;
      let dangerGain = 0;
      let vampireEncounter = false;

      if (activity.id === 'gym') {
        awarenessGain = Math.floor(Math.random() * 5);
        dangerGain = Math.floor(Math.random() * 3);
        result = 'You worked out. Stayed healthy. Normal life. But you kept looking over your shoulder. Can\'t shake the feeling you\'re being watched.';
        
        // Gym helps clear your head a bit
        if ((human.obsession_level || 0) > 0) {
          await base44.entities.Human.update(human.id, {
            obsession_level: Math.max(0, (human.obsession_level || 0) - 3)
          });
        }
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
      } else if (activity.id === 'onlyfangs_search') {
        const searchOutcomes = [
          `You searched OnlyFangs desperately.\n\nFound ${vampire.vampire_name}'s account.\n\nSubscribed immediately.\n\nWatched everything. Every video. Every photo.\n\nYou came twice just scrolling through their content.\n\nLeft desperate comments. Tipped everything you had.`,
          `${vampire.vampire_name}'s OnlyFangs is perfect.\n\nYou watch their videos on repeat.\n\nMasturbate to every single one.\n\nScreenshot everything.\n\nYou're their biggest fan and they don't even know.\n\nYet.`,
          `Found them on OnlyFangs.\n\nThey're doing exactly what you fantasized about.\n\nBiting people. Feeding. Fucking.\n\nYou subscribe to the highest tier.\n\nSend messages. Desperate ones.\n\n"Notice me. Please. I'll do anything."`,
          `Their OnlyFangs content is addictive.\n\nYou've spent hundreds.\n\nWatched every livestream.\n\nCommented on everything.\n\nThey respond sometimes. Heart emojis.\n\nIt's enough to make you come.`
        ];
        result = searchOutcomes[Math.floor(Math.random() * searchOutcomes.length)];
        awarenessGain = Math.floor(Math.random() * 12) + 8;
        await base44.entities.Human.update(human.id, {
          obsession_level: Math.min(100, (human.obsession_level || 0) + Math.floor(Math.random() * 25) + 15)
        });
      } else if (activity.id === 'onlyfangs_record') {
        const recordOutcomes = [
          `You created an OnlyFangs account.\n\nRecorded yourself masturbating.\n\nSaid their name. Begged for them.\n\nPosted it hoping they'd see.\n\nTagged them.\n\nYou're beyond shame now. You just want their attention.`,
          `Filmed yourself touching yourself.\n\nMoaning their name.\n\nTalking about what you want them to do to you.\n\nUploaded it to OnlyFangs.\n\nSent them the link.\n\n"This is what you do to me."`,
          `Made content specifically for them.\n\nShowed everything.\n\nHeld nothing back.\n\nWrote in the description: "I know what you are. I want it."\n\nPosted it publicly.\n\nNow you wait.`,
          `Recorded yourself in bed.\n\nPretending they're there.\n\nBiting your own neck.\n\nTouching yourself desperately.\n\nUploaded it.\n\n"For ${vampire.vampire_name}" in the title.\n\nYou're not subtle anymore.`
        ];
        result = recordOutcomes[Math.floor(Math.random() * recordOutcomes.length)];
        awarenessGain = Math.floor(Math.random() * 15) + 10;
        dangerGain = Math.floor(Math.random() * 20) + 15;
        await base44.entities.Human.update(human.id, {
          obsession_level: Math.min(100, (human.obsession_level || 0) + Math.floor(Math.random() * 30) + 20)
        });
      } else if (activity.id === 'onlyfangs_message') {
        const messageOutcomes = [
          `You DMed ${vampire.vampire_name} on OnlyFangs.\n\n"I know what you are. I want you to turn me."\n\nThey read it immediately.\n\nTyping...\n\n"Come to this address. Tonight. Alone."\n\nYour hands are shaking.`,
          `Sent them message after message.\n\nConfessing everything.\n\nYour obsession. Your fantasies. Your desperation.\n\nThey finally responded.\n\n"You're interesting. Let's meet."\n\nYou came just reading that.`,
          `Messaged them: "I've been watching you. Following you. I can't stop."\n\nThey responded instantly.\n\n"I know. I've been letting you."\n\nOh god.\n\nThey knew the whole time.`,
          `You: "Please notice me. I'll do anything."\n\nThem: "Anything?"\n\nYou: "Yes."\n\nThem: "Prove it."\n\nThey sent an address.\n\nYou're going. Of course you're going.`
        ];
        result = messageOutcomes[Math.floor(Math.random() * messageOutcomes.length)];
        awarenessGain = Math.floor(Math.random() * 18) + 12;
        dangerGain = Math.floor(Math.random() * 25) + 20;
        await base44.entities.Human.update(human.id, {
          obsession_level: Math.min(100, (human.obsession_level || 0) + Math.floor(Math.random() * 30) + 20),
          romance_with_vampire: vampire.id
        });
        vampireEncounter = true;
      } else if (activity.id === 'stalk_vampire') {
        const stalkOutcomes = [
          `You followed ${vampire.vampire_name} through the city.\n\nThey went to dark places. Talked to dangerous people.\n\nYou hid in shadows, heart racing.\n\nFor a moment, they turned. Looked right at you.\n\nDid they see you? Did they... smile?`,
          `Watched ${vampire.vampire_name} from across the street.\n\nSaw them disappear into an alley with someone.\n\nHeard sounds. Gasping. Then silence.\n\nThey emerged alone. Wiping their mouth.\n\nYou touched yourself right there, hidden in the dark.`,
          `Found where ${vampire.vampire_name} lives.\n\nWatched their window for hours.\n\nSaw them moving inside. So beautiful. So dangerous.\n\nYou want them to catch you watching.\n\nYou want them to come down and claim you.`,
          `${vampire.vampire_name} fed tonight.\n\nYou watched from the shadows.\n\nSaw them bite. Saw their victim's ecstasy.\n\nYou're so jealous. That should be you.\n\nYou touch yourself imagining it's your neck.`
        ];
        result = stalkOutcomes[Math.floor(Math.random() * stalkOutcomes.length)];
        awarenessGain = Math.floor(Math.random() * 10) + 5;
        dangerGain = Math.floor(Math.random() * 15) + 10;
        await base44.entities.Human.update(human.id, {
          obsession_level: Math.min(100, (human.obsession_level || 0) + Math.floor(Math.random() * 20) + 10)
        });
        if (Math.random() > 0.5) vampireEncounter = true;
      } else if (activity.id === 'visit_vampire') {
        const visitOutcomes = [
          `You went to ${vampire.vampire_name}'s house.\n\nKnocked on the door. Heart pounding.\n\nThey answered. "I was wondering when you'd come," they said.\n\nYou talked for hours. Or maybe minutes. Time felt strange.\n\nWhen you left, you couldn't remember half of what was said.\n\nBut you remember the way they looked at you.`,
          `Showed up at ${vampire.vampire_name}'s door uninvited.\n\n"Brave," they said. "Or stupid."\n\nThey let you in anyway.\n\nYou tried to play it cool. Failed completely.\n\nEnded up confessing how much you think about them.\n\nThey just smiled. "I know."`,
          `Knocked on ${vampire.vampire_name}'s door at 2 AM.\n\nThey opened it shirtless. Perfect.\n\n"Couldn't sleep?" they asked.\n\nYou shook your head. "Can't stop thinking about you."\n\nThey pulled you inside.\n\nWhat happened next... you'll never forget.`,
          `Went to ${vampire.vampire_name}'s house.\n\nDoor was unlocked.\n\nYou walked in. Called their name.\n\nThey appeared behind you. "Breaking and entering?"\n\nYou turned. They were so close.\n\n"I needed to see you," you whispered.\n\n"I know," they said. "I've been waiting."`
        ];
        result = visitOutcomes[Math.floor(Math.random() * visitOutcomes.length)];
        awarenessGain = Math.floor(Math.random() * 15) + 10;
        dangerGain = Math.floor(Math.random() * 25) + 15;
        await base44.entities.Human.update(human.id, {
          obsession_level: Math.min(100, (human.obsession_level || 0) + Math.floor(Math.random() * 25) + 15),
          romance_with_vampire: vampire.id
        });
        vampireEncounter = true;
      } else if (activity.id === 'social_stalk') {
        const socialOutcomes = [
          `Spent hours looking at ${vampire.vampire_name} online.\n\nEvery photo. Every post. Every comment.\n\nLearning everything about them.\n\nYou screenshot everything.\n\nYou're obsessed and you know it.`,
          `Found ${vampire.vampire_name}'s OnlyFangs.\n\nSubscribed immediately.\n\nWatched every video three times.\n\nTipped them. A lot.\n\nLeft comments. Desperate ones.\n\nThey hearted one. You almost died.`,
          `Searched ${vampire.vampire_name}'s name all night.\n\nFound old photos. Articles. Mentions.\n\nThey've been around a long time.\n\nToo long.\n\nYou know what they are now.\n\nAnd you want them more.`,
          `Created a fake account to follow ${vampire.vampire_name}.\n\nLiked all their posts.\n\nCommented on everything.\n\nThey followed you back.\n\nYou came just from that notification.`
        ];
        result = socialOutcomes[Math.floor(Math.random() * socialOutcomes.length)];
        awarenessGain = Math.floor(Math.random() * 12) + 5;
        await base44.entities.Human.update(human.id, {
          obsession_level: Math.min(100, (human.obsession_level || 0) + Math.floor(Math.random() * 18) + 10)
        });
      } else if (activity.id === 'confession') {
        const confessionOutcomes = [
          `You found ${vampire.vampire_name}.\n\n"I know what you are," you said.\n\nThey smiled. Dangerous. Beautiful.\n\n"And what do you want?" they asked.\n\n"You," you whispered. "All of you."\n\nThey stepped closer.\n\n"Careful what you wish for."`,
          `Cornered ${vampire.vampire_name} alone.\n\n"I'm obsessed with you," you confessed.\n\n"I can't eat. Can't sleep. Just think about you."\n\nThey touched your face.\n\n"I know," they said. "I can smell it on you."\n\nYour need. Your desire. Your desperation.`,
          `You confessed everything to ${vampire.vampire_name}.\n\nYour fantasies. Your stalking. Your obsession.\n\nThey listened. Amused.\n\n"You want to be mine?" they asked.\n\n"Yes," you breathed. "Please."\n\nThey bit their wrist.\n\n"Drink."`,
          `Told ${vampire.vampire_name} you want them.\n\nNeed them. Dream about them.\n\n"Turn me," you begged. "Make me yours forever."\n\nThey grabbed your throat. Gentle. Firm.\n\n"Are you sure?"\n\nYou nodded.\n\n"Soon," they promised.`
        ];
        result = confessionOutcomes[Math.floor(Math.random() * confessionOutcomes.length)];
        awarenessGain = 20;
        dangerGain = Math.floor(Math.random() * 30) + 20;
        await base44.entities.Human.update(human.id, {
          obsession_level: 100,
          wants_to_be_turned: true,
          romance_with_vampire: vampire.id
        });
        vampireEncounter = true;
      } else if (activity.id === 'seek' && hasVampire) {
        vampireEncounter = true;
        awarenessGain = Math.floor(Math.random() * 20) + 20;
        dangerGain = Math.floor(Math.random() * 25) + 15;
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
          'Overheard a conversation. "...at night..." "...don\'t go alone..." "...people are disappearing..." They stopped talking when they saw you listening.',
          'You sat in the coffee shop. Normal sounds. Normal people. The mundane comfort of it all. For an hour, you weren\'t thinking about vampires. Just... living.'
        ];
        result = coffeeOutcomes[Math.floor(Math.random() * coffeeOutcomes.length)];
        
        // Sometimes peaceful moments help
        if ((human.obsession_level || 0) > 0 && Math.random() > 0.5) {
          await base44.entities.Human.update(human.id, {
            obsession_level: Math.max(0, (human.obsession_level || 0) - 4)
          });
        }
      } else if (activity.id === 'friends') {
        awarenessGain = Math.floor(Math.random() * 3);
        const friendOutcomes = [
          'Your friends laughed about the "vampire rumors." You didn\'t. They noticed. Asked if you were okay. You lied. Said you were fine.',
          'One friend seemed different. Quieter. Paler. Wearing high collars. Avoiding sunlight. You wanted to ask. Didn\'t dare.',
          'Everyone talking about the missing student. Police said runaway. Your friends believed it. You knew better. Stayed quiet.',
          'Normal hangout. Normal conversation. But you kept thinking about what you\'d seen. What you knew. You\'re changing. They don\'t notice yet.',
          'You spent time with your friends. Laughed. Talked about normal things. For a few hours, you forgot about... them. It felt good to be normal again.'
        ];
        result = friendOutcomes[Math.floor(Math.random() * friendOutcomes.length)];

        // Friends help ground you
        if ((human.obsession_level || 0) > 0 && Math.random() > 0.4) {
          await base44.entities.Human.update(human.id, {
            obsession_level: Math.max(0, (human.obsession_level || 0) - 5)
          });
        }
      } else if (activity.id === 'read') {
        awarenessGain = Math.floor(Math.random() * 8) + 3;
        const readOutcomes = [
          'Started with fiction. Gothic novels. Dracula. Then switched to non-fiction. Historical accounts. Eyewitness testimonies. Too many to be coincidence.',
          'Found a book that shouldn\'t exist. Self-published. No author name. "A Hunter\'s Guide." Detailed. Specific. Written by someone who knew.',
          'Reading about vampire mythology. Every culture has them. Different names. Same creature. Same weakness. Same hunger. Universal fear.',
          'The book described protection methods. Vervain in tea. Salt at doorways. Invitation rules. You\'re memorizing everything. Just in case.'
        ];
        result = readOutcomes[Math.floor(Math.random() * readOutcomes.length)];
      } else if (activity.id === 'sleep') {
        awarenessGain = Math.floor(Math.random() * 10) + 5;
        
        const sleepOutcomes = hasVampire && vampire && (human.obsession_level || 0) > 0 ? [
          `You lay in bed. Can't sleep. Keep thinking about them.\n\nTheir eyes. Their voice. The way they move.\n\nYou touch yourself thinking about ${vampire.vampire_name}. Imagine them watching. Wanting them to watch.\n\nYou finish gasping their name into your pillow.\n\nThis obsession is consuming you.`,
          `Dreams of ${vampire.vampire_name}. Their hands on you. Their teeth.\n\nYou wake up wet/hard, panting.\n\nIt felt so real. You wanted it to be real.\n\nYou touch yourself again, chasing that dream.\n\nWhat's happening to you?`,
          `You fantasize about meeting them in the dark.\n\nThem pinning you against a wall. Biting your neck while they fuck you.\n\nThe danger. The power. The surrender.\n\nYou come imagining being theirs completely.\n\nYou're addicted to the fantasy.`,
          `Can't stop thinking about ${vampire.vampire_name}.\n\nYou masturbate three times tonight. Each time to thoughts of them.\n\nTheir darkness. Their control. Being their prey. Their possession.\n\nYou want them. Desperately. Dangerously.`,
          `You imagine them breaking into your room.\n\nWatching you sleep. Touching you awake.\n\nTaking what they want from you.\n\nYou touch yourself to this fantasy until you're shaking.\n\nPart of you hopes it's not just a fantasy.`,
          `Dreams blur with fantasy.\n\n${vampire.vampire_name} feeding from you while making you come.\n\nPain and pleasure mixing.\n\nYou wake up moaning, hand between your legs.\n\nYou finish yourself off, wishing they were really there.`
        ] : [
          'You sleep fitfully. Dreams of shadows. Teeth. Darkness.',
          'Nightmares again. You wake up sweating.',
          'Sleep comes eventually. Dreamless. Empty.',
          'You toss and turn. Something feels wrong.'
        ];
        
        result = sleepOutcomes[Math.floor(Math.random() * sleepOutcomes.length)];
        
        if (hasVampire && (human.obsession_level || 0) > 0) {
          await base44.entities.Human.update(human.id, {
            wants_to_be_turned: Math.random() > 0.5,
            obsession_level: Math.min(100, (human.obsession_level || 0) + Math.floor(Math.random() * 15) + 5)
          });
        }
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
        result = `You were walking through a dark alley when you saw them.\n\n${vampire.vampire_name}. Standing impossibly still. Eyes reflecting moonlight like an animal.\n\nThey smiled. "You shouldn't be here."\n\nYou ran. But you felt their eyes on you the entire way home.\n\nSomething's not right about this town.`;
      } else if (activity.id === 'party' && encounterChance > 0.5 && hasVampire) {
        vampireEncounter = true;
        awarenessGain = Math.floor(Math.random() * 20) + 15;
        dangerGain = Math.floor(Math.random() * 15) + 10;
        result = `The party was packed. You noticed them immediately.\n\n${vampire.vampire_name}. They moved through the crowd like water. Everyone drawn to them.\n\nThey approached you. "First time at one of these?"\n\nTheir hand was ice cold. Their smile... predatory.\n\n"I'll be seeing you around," they said.\n\nYou believe them.`;
      } else if (activity.id === 'coffee' && encounterChance > 0.7 && hasVampire) {
        vampireEncounter = true;
        awarenessGain = Math.floor(Math.random() * 10) + 5;
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
      } catch (e) {
        console.error('Activity failed:', e);
        setOutcome('Something went wrong');
      } finally {
        setTimeout(() => {
          setActiveAction(null);
          setOutcome('');
        }, 5000);
      }
    }, activity.duration);
  };

  // Redirect to Home if no human exists
  React.useEffect(() => {
    if (!isLoading && humans.length === 0) {
      navigate(createPageUrl('Home'), { replace: true });
    }
  }, [isLoading, humans.length, navigate]);

  // Track obsession changes
  React.useEffect(() => {
    if (!human) return;
    
    const currentObsession = human.obsession_level || 0;
    
    // Set initial state
    if (currentObsession > 0 && !hadObsession) {
      setHadObsession(true);
    }
    
    // Check if obsession was broken (only after it was >0 before)
    if (hadObsession && currentObsession === 0) {
      const vampireName = vampireStates[0]?.vampire_name || 'them';
      alert(`You woke up this morning... different.\n\nThe constant pull. The ache. The need.\n\nIt's gone.\n\nYou think about ${vampireName} and... nothing.\n\nNo racing heart. No desperate longing.\n\nJust... clarity.\n\nYou're free.\n\nYou got your life back.`);
      setHadObsession(false);
    }
  }, [human?.obsession_level]);

  const awarenessColor = human?.awareness_level > 70 ? 'text-red-400' : human?.awareness_level > 40 ? 'text-yellow-400' : 'text-green-400';
  const dangerColor = human?.danger_level > 70 ? 'text-red-400' : human?.danger_level > 40 ? 'text-orange-400' : 'text-green-400';

  if (isLoading || !human) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
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
          {vampireStates.length > 0 && (
            <button
              onClick={() => navigate(createPageUrl('Night'))}
              className="text-purple-400 hover:text-purple-300 text-sm"
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
          <h1 className="text-4xl font-bold text-white mb-2">{human.name}</h1>
          <p className="text-gray-400 capitalize">{human.job} • {human.gender}</p>
          <button
            onClick={() => setShowIdentity(true)}
            className="text-purple-400 hover:text-purple-300 text-sm mt-2"
          >
            Edit Identity →
          </button>
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
          
          {(human.obsession_level || 0) > 0 && (
            <div className="bg-gray-900 rounded-xl p-4 border border-pink-800 col-span-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-pink-400 text-sm">💭 Vampire Obsession</span>
                <span className="font-bold text-pink-400">{human.obsession_level || 0}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  style={{ width: `${human.obsession_level || 0}%` }}
                  className="h-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full"
                />
              </div>
              <p className="text-xs text-pink-300 mt-1">You can't stop thinking about them...</p>
            </div>
          )}
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
          
          {hasVampire && [
            { id: 'stalk_vampire', label: 'Stalk Them', icon: Eye, duration: 5000, awarenessChance: 0.3, requiresAwareness: 15 },
            { id: 'visit_vampire', label: 'Visit Their House', icon: Heart, duration: 6000, awarenessChance: 0.5, requiresAwareness: 30 },
            { id: 'social_stalk', label: 'Stalk Them Online', icon: Search, duration: 4000, awarenessChance: 0.2, requiresAwareness: 10 },
            { id: 'onlyfangs_search', label: 'Search OnlyFangs for Them', icon: Heart, duration: 4500, awarenessChance: 0.25, requiresAwareness: 20 },
            { id: 'onlyfangs_record', label: 'Record Yourself for OnlyFangs', icon: Moon, duration: 6000, awarenessChance: 0.3, requiresAwareness: 25 },
            { id: 'onlyfangs_message', label: 'Message Them on OnlyFangs', icon: Heart, duration: 5000, awarenessChance: 0.35, requiresAwareness: 30 },
            { id: 'confession', label: 'Confess Your Obsession', icon: Heart, duration: 7000, requiresAwareness: 50 }
          ].map((activity, i) => {
            const isLocked = activity.requiresAwareness && (human.awareness_level || 0) < activity.requiresAwareness;
            return (
              <motion.button
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + (HUMAN_ACTIVITIES.length + i) * 0.05 }}
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


        {showOnlyMortals && (
          <OnlyMortals human={human} onClose={() => setShowOnlyMortals(false)} />
        )}

        {showBloodBank && (
          <BloodBankCareer human={human} onClose={() => setShowBloodBank(false)} />
        )}

        {showArtCommissions && (
          <ArtCommissions human={human} onClose={() => setShowArtCommissions(false)} />
        )}

        {showMusicCareer && (
          <MusicCareer human={human} onClose={() => setShowMusicCareer(false)} />
        )}

        {showEscortWork && (
          <EscortCareer human={human} onClose={() => setShowEscortWork(false)} />
        )}

        {showMakeup && (
          <MakeupSystem human={human} context={makeupContext} onClose={() => setShowMakeup(false)} />
        )}

        {showSocialLife && (
          <HumanSocialLife human={human} onClose={() => setShowSocialLife(false)} />
        )}

        {showMentalHealth && (
          <HumanMentalHealth human={human} onClose={() => setShowMentalHealth(false)} />
        )}

        {showApartment && (
          <HumanApartment human={human} onClose={() => setShowApartment(false)} />
        )}

        {showSkills && (
          <HumanSkills human={human} onClose={() => setShowSkills(false)} />
        )}

        {showDating && (
          <HumanDating human={human} onClose={() => setShowDating(false)} />
        )}

        {showSocialMedia && (
          <HumanSocialMedia human={human} onClose={() => setShowSocialMedia(false)} />
        )}

        {showSubstances && (
          <SubstanceSystem human={human} onClose={() => setShowSubstances(false)} />
        )}

        {showGroceries && (
          <GroceryShopping human={human} onClose={() => setShowGroceries(false)} />
        )}

        {showPhone && (
          <HumanPhone human={human} onClose={() => setShowPhone(false)} />
        )}

        {showHookups && (
          <CasualHookups human={human} onClose={() => setShowHookups(false)} />
        )}

        {showIdentity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
            onClick={() => setShowIdentity(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full relative max-h-[85vh] overflow-y-auto"
            >
              <button onClick={() => setShowIdentity(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-white mb-4">Your Identity</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-white font-medium mb-2 block">Gender</label>
                  <div className="space-y-2">
                    {[
                      { value: 'man', label: 'Man' },
                      { value: 'woman', label: 'Woman' },
                      { value: 'custom', label: 'Custom' }
                    ].map(g => (
                      <button
                        key={g.value}
                        onClick={async () => {
                          await base44.entities.Human.update(human.id, { gender: g.value });
                          queryClient.invalidateQueries();
                        }}
                        className={`w-full rounded-lg py-2 px-3 text-left transition-colors ${
                          human.gender === g.value ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-white font-medium mb-2 block">Sexuality</label>
                  <div className="space-y-2">
                    {['straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'asexual', 'questioning'].map(s => (
                      <button
                        key={s}
                        onClick={async () => {
                          await base44.entities.Human.update(human.id, { sexuality: s });
                          queryClient.invalidateQueries();
                        }}
                        className={`w-full rounded-lg py-2 px-3 text-left transition-colors text-sm capitalize ${
                          human.sexuality === s ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <PersonalitySelector
                  selected={Array.isArray(human.personality) ? human.personality : (human.personality ? [human.personality] : ['cautious'])}
                  onSelect={async (personality) => {
                    await base44.entities.Human.update(human.id, { personality });
                    queryClient.invalidateQueries();
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}