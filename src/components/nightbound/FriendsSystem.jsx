import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, MessageCircle, Eye, UserPlus, Home } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const CONVERSATION_TOPICS = {
  cautious: [
    { q: "So... you really live with them? A vampire?", a: "Yes. Every night. It's... complicated." },
    { q: "Aren't you scared? Don't they want to... you know?", a: "Sometimes. But there's more to it than fear." },
    { q: "Why would you choose this?", a: "I didn't choose it. It chose me." },
    { q: "What do they look like? Are they... attractive?", a: "Beautiful. Terrifying. Both at once." },
    { q: "Do you sleep in the same house?", a: "Yes. I hear them moving at night." },
    { q: "Have they ever hurt you?", a: "Not in the way you'd think." },
    { q: "Can you leave? If you wanted to?", a: "I... I don't know if I want to anymore." },
    { q: "What happens if you disobey them?", a: "I haven't tried. I don't want to find out." }
  ],
  curious: [
    { q: "What's it like? Being with a vampire?", a: "Like nothing else. Every moment feels electric." },
    { q: "Do they really have powers? Can they read minds?", a: "Some can. Mine can do things you wouldn't believe." },
    { q: "Have you ever seen them feed?", a: "Yes. It's... intimate. More than you'd think." },
    { q: "Could they turn you into one? Do you want that?", a: "Maybe. The thought crosses my mind more than it should." },
    { q: "What do they smell like?", a: "Like old books. Night air. Something ancient." },
    { q: "Do they age? Will you grow old while they stay the same?", a: "That's... something I try not to think about." },
    { q: "Have you met other vampires?", a: "No. Just mine. That's enough." },
    { q: "What's the most supernatural thing you've witnessed?", a: "I watched them move through shadows like liquid darkness." }
  ],
  'thrill-seeking': [
    { q: "That sounds incredible. I want to meet them.", a: "Be careful what you wish for." },
    { q: "Do they ever let you watch them hunt?", a: "Sometimes. It's dangerous. Exhilarating." },
    { q: "Could I become like you? A servant?", a: "Maybe. If they choose you." },
    { q: "Have you ever been in danger because of them?", a: "Every single day. That's part of the thrill." },
    { q: "Do you ever go hunting with them?", a: "Once. I'll never forget it. The adrenaline, the power..." },
    { q: "Would they bite me? If I asked?", a: "You'd have to earn that. It's not a game." },
    { q: "What's the darkest thing you've seen them do?", a: "Things I can't unsee. Things that should horrify me. But don't." },
    { q: "Can you introduce me? Please?", a: "If you're serious... I could ask them." }
  ],
  lonely: [
    { q: "You're never alone, are you?", a: "No. Never. They're always there." },
    { q: "What's it feel like? Being wanted like that?", a: "Like being seen. Really seen. For the first time." },
    { q: "Do you think... they could want someone like me?", a: "They might. If you're willing." },
    { q: "Do they hold you? Touch you?", a: "Yes. Cold hands. But gentle." },
    { q: "Are you in love with them?", a: "I... I don't know what this is. But it's everything." },
    { q: "Do they need you? Really need you?", a: "More than they'd admit. I'm theirs. They're mine." },
    { q: "What would you do if they left you?", a: "I can't imagine it. I don't want to." },
    { q: "Have they said they love you?", a: "Not in those words. But I feel it. Every night." }
  ]
};

const VISIT_SCENARIOS = [
  {
    intro: "{friend} came over. They sat in your living room, eyes darting nervously around.",
    questions: [
      "Can I... look around? See where you actually live with them?",
      "Do you have any of their things here? Their belongings?",
      "Where do they sleep? Can I see?",
      "What's it like waking up every day knowing they're... here?"
    ]
  },
  {
    intro: "{friend} wanted to stay for dinner. They keep glancing at the shadows.",
    questions: [
      "Do you ever cook for them? Do they eat regular food?",
      "What time do they usually come home?",
      "Have you ever accidentally walked in on them feeding?",
      "Do you dream about them?"
    ]
  },
  {
    intro: "{friend} arrived late at night. They said they couldn't sleep. Thinking about your life.",
    questions: [
      "Are you happy? Really happy?",
      "Do you ever wish you could go back? Before them?",
      "What happens if you fall in love with someone else?",
      "Would they let me stay the night? Here?"
    ]
  }
];

export default function FriendsSystem({ servant, onClose }) {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [conversing, setConversing] = useState(false);
  const [meetingNew, setMeetingNew] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [visiting, setVisiting] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: potentialServants = [] } = useQuery({
    queryKey: ['potentialServants', servant.id],
    queryFn: () => base44.entities.PotentialServant.filter({ met_through_servant_id: servant.id })
  });
  
  const handleMeetNewPerson = async (e) => {
    if (e) e.stopPropagation();
    setMeetingNew(true);
    
    setTimeout(async () => {
      const names = ['Jordan', 'Casey', 'Morgan', 'Riley', 'Avery', 'Skylar', 'Dakota', 'Charlie'];
      const personalities = ['cautious', 'curious', 'thrill-seeking', 'lonely'];
      
      const newPerson = await base44.entities.PotentialServant.create({
        name: names[Math.floor(Math.random() * names.length)],
        met_through_servant_id: servant.id,
        personality: personalities[Math.floor(Math.random() * personalities.length)],
        curiosity_level: Math.floor(Math.random() * 20) + 10,
        friendship_level: Math.floor(Math.random() * 15) + 5
      });
      
      await base44.entities.NightLog.create({
        entry: `${servant.name} met someone new: ${newPerson.name}. A potential friend. A potential servant.`,
        category: 'interaction',
        intensity: 'moderate'
      });
      
      setOutcome(`${servant.name} brought ${newPerson.name} into their life. They talk about ordinary things. But ${servant.name}'s secret hangs between them.`);
      
      queryClient.invalidateQueries(['potentialServants']);
      queryClient.invalidateQueries(['logs']);
      
      setTimeout(() => {
        setMeetingNew(false);
        setOutcome('');
      }, 4000);
    }, 2000);
  };
  
  const handleConversation = async (friend, e) => {
    if (e) e.stopPropagation();
    setSelectedFriend(friend);
    setConversing(true);
    
    setTimeout(async () => {
      const topics = CONVERSATION_TOPICS[friend.personality];
      const topic = topics[Math.floor(Math.random() * topics.length)];
      
      const friendshipGain = Math.floor(Math.random() * 8) + 5;
      const curiosityGain = Math.floor(Math.random() * 12) + 8;
      
      const newFriendship = Math.min(friend.friendship_level + friendshipGain, 100);
      const newCuriosity = Math.min(friend.curiosity_level + curiosityGain, 100);
      
      await base44.entities.PotentialServant.update(friend.id, {
        friendship_level: newFriendship,
        curiosity_level: newCuriosity,
        last_conversation: new Date().toISOString(),
        knows_about_vampires: newCuriosity >= 60
      });
      
      setOutcome(`"${topic.q}"\n\n"${topic.a}"\n\nThey're getting closer to the truth.`);
      
      await base44.entities.NightLog.create({
        entry: `${servant.name} and ${friend.name} talked. Questions asked. Secrets hinted at. Curiosity growing.`,
        category: 'interaction',
        intensity: 'moderate'
      });
      
      queryClient.invalidateQueries(['potentialServants']);
      queryClient.invalidateQueries(['logs']);
      
      setTimeout(() => {
        setConversing(false);
        setOutcome('');
        setSelectedFriend(null);
      }, 5000);
    }, 1500);
  };

  const handleVisit = async (friend, e) => {
    if (e) e.stopPropagation();
    setSelectedFriend(friend);
    setVisiting(true);
    
    setTimeout(async () => {
      const scenario = VISIT_SCENARIOS[Math.floor(Math.random() * VISIT_SCENARIOS.length)];
      const question = scenario.questions[Math.floor(Math.random() * scenario.questions.length)];
      
      const friendshipGain = Math.floor(Math.random() * 12) + 10;
      const curiosityGain = Math.floor(Math.random() * 15) + 12;
      
      const newFriendship = Math.min(friend.friendship_level + friendshipGain, 100);
      const newCuriosity = Math.min(friend.curiosity_level + curiosityGain, 100);
      
      await base44.entities.PotentialServant.update(friend.id, {
        friendship_level: newFriendship,
        curiosity_level: newCuriosity,
        last_conversation: new Date().toISOString(),
        knows_about_vampires: newCuriosity >= 60
      });
      
      const intro = scenario.intro.replace('{friend}', friend.name);
      setOutcome(`${intro}\n\n"${question}"\n\nThey see your world now. The line between curiosity and obsession blurs.`);
      
      await base44.entities.NightLog.create({
        entry: `${friend.name} visited ${servant.name}'s home. Saw where the vampire lives. Questions multiply.`,
        category: 'interaction',
        intensity: 'significant'
      });
      
      queryClient.invalidateQueries(['potentialServants']);
      queryClient.invalidateQueries(['logs']);
      
      setTimeout(() => {
        setVisiting(false);
        setOutcome('');
        setSelectedFriend(null);
      }, 6000);
    }, 2000);
  };
  
  const handleRevealTruth = async (friend, e) => {
    if (e) e.stopPropagation();
    
    if (!confirm(`Have ${servant.name} tell ${friend.name} about you? This cannot be undone.`)) {
      return;
    }
    
    setConversing(true);
    setSelectedFriend(friend);
    
    setTimeout(async () => {
      await base44.entities.PotentialServant.update(friend.id, {
        knows_about_vampires: true,
        curiosity_level: 100
      });
      
      setOutcome(`${servant.name} told ${friend.name} everything. The truth. About you. About what you are.\n\n${friend.name} is terrified. Fascinated. They want to meet you.`);
      
      await base44.entities.NightLog.create({
        entry: `${servant.name} revealed the truth to ${friend.name}. The secret is out. They know about you now.`,
        category: 'interaction',
        intensity: 'significant'
      });
      
      queryClient.invalidateQueries(['potentialServants']);
      queryClient.invalidateQueries(['logs']);
      
      setTimeout(() => {
        setConversing(false);
        setOutcome('');
        setSelectedFriend(null);
      }, 6000);
    }, 2000);
  };
  
  const handleRecruitAsServant = async (friend, e) => {
    if (e) e.stopPropagation();
    
    if (!confirm(`Invite ${friend.name} to become your servant?`)) {
      return;
    }
    
    setConversing(true);
    
    setTimeout(async () => {
      const variantMap = {
        cautious: 'defiant',
        curious: 'dreamer',
        'thrill-seeking': 'devoted',
        lonely: 'devoted'
      };
      
      await base44.entities.Servant.create({
        name: friend.name,
        variant: variantMap[friend.personality] || 'devoted',
        obsession_stage: 1,
        relationship: Math.floor(friend.curiosity_level / 2),
        emotional_state: 'curious'
      });
      
      await base44.entities.PotentialServant.delete(friend.id);
      
      await base44.entities.NightLog.create({
        entry: `${friend.name} became yours. ${servant.name} brought them to you. Now there are two.`,
        category: 'interaction',
        intensity: 'significant'
      });
      
      queryClient.invalidateQueries(['servants']);
      queryClient.invalidateQueries(['potentialServants']);
      queryClient.invalidateQueries(['logs']);
      
      setOutcome(`${friend.name} is yours now. They kneel beside ${servant.name}. Your circle grows.`);
      
      setTimeout(() => {
        setConversing(false);
        onClose();
      }, 4000);
    }, 2000);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
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
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-2">
          {servant.name}'s Friends
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          They have a life outside of you. For now.
        </p>
        
        {outcome ? (
          <div className="text-center py-8">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gray-300 text-sm leading-relaxed whitespace-pre-line"
            >
              {outcome}
            </motion.p>
          </div>
        ) : conversing || meetingNew || visiting ? (
          <div className="text-center py-12">
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-gray-400"
            >
              {conversing ? 'Talking...' : visiting ? 'Visiting...' : 'Meeting...'}
            </motion.p>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleMeetNewPerson}
              className="w-full bg-gradient-to-r from-blue-900/40 to-purple-900/40 hover:from-blue-900/60 hover:to-purple-900/60 border-2 border-blue-500/50 rounded-xl py-4 flex items-center justify-center gap-2 transition-all"
            >
              <UserPlus className="w-5 h-5" />
              <span className="text-white font-medium">Meet New People</span>
            </button>
            
            {potentialServants.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">
                {servant.name} hasn't met anyone yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {potentialServants.map(friend => (
                  <div
                    key={friend.id}
                    className="bg-gray-800 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-white font-medium">{friend.name}</h3>
                        <p className="text-gray-400 text-xs capitalize">{friend.personality}</p>
                      </div>
                      {friend.knows_about_vampires && (
                        <span className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded">
                          Knows
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Friendship</span>
                          <span>{friend.friendship_level}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                          <div
                            style={{ width: `${friend.friendship_level}%` }}
                            className="h-1.5 bg-blue-500 rounded-full"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Curiosity</span>
                          <span>{friend.curiosity_level}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                          <div
                            style={{ width: `${friend.curiosity_level}%` }}
                            className="h-1.5 bg-purple-500 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={(e) => handleConversation(friend, e)}
                        className="bg-blue-900/40 hover:bg-blue-900/60 rounded-lg py-2 text-white text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3" />
                        Talk
                      </button>
                      
                      {friend.friendship_level >= 30 && (
                        <button
                          onClick={(e) => handleVisit(friend, e)}
                          className="bg-purple-900/40 hover:bg-purple-900/60 rounded-lg py-2 text-white text-xs transition-colors flex items-center justify-center gap-1"
                        >
                          <Home className="w-3 h-3" />
                          Visit
                        </button>
                      )}
                      
                      {!friend.knows_about_vampires && friend.curiosity_level >= 50 && (
                        <button
                          onClick={(e) => handleRevealTruth(friend, e)}
                          className="bg-yellow-900/40 hover:bg-yellow-900/60 rounded-lg py-2 text-white text-xs transition-colors flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          Reveal
                        </button>
                      )}
                      
                      {friend.knows_about_vampires && friend.curiosity_level >= 80 && (
                        <button
                          onClick={(e) => handleRecruitAsServant(friend, e)}
                          className="bg-red-900/40 hover:bg-red-900/60 rounded-lg py-2 text-white text-xs transition-colors flex items-center justify-center gap-1"
                        >
                          <Users className="w-3 h-3" />
                          Recruit
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}