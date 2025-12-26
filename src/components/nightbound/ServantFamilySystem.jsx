import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const RELATIONS = ['parent', 'sibling', 'child', 'spouse', 'ex'];

export default function ServantFamilySystem({ servant, vampireState, onClose }) {
  const queryClient = useQueryClient();
  const [interacting, setInteracting] = useState(null);

  const { data: family = [] } = useQuery({
    queryKey: ['family', servant.id],
    queryFn: async () => {
      const existing = await base44.entities.ServantFamily.filter({ servant_id: servant.id });
      if (existing.length === 0) {
        // Generate initial family
        const names = ['Sarah', 'Michael', 'Emma', 'David', 'Lisa'];
        const newMember = await base44.entities.ServantFamily.create({
          servant_id: servant.id,
          member_name: names[Math.floor(Math.random() * names.length)],
          relationship_type: RELATIONS[Math.floor(Math.random() * RELATIONS.length)],
          concern_level: Math.floor(Math.random() * 30),
          relationship_with_vampire: -40
        });
        return [newMember];
      }
      return existing;
    }
  });

  const [selectedMember, setSelectedMember] = useState(null);
  const [outcome, setOutcome] = useState('');

  const interactions = {
    vampire: [
      { id: 'meet', label: 'Meet Them', color: 'blue', disabled: (m) => m.knows_secret },
      { id: 'talk', label: 'Deep Conversation', color: 'purple', disabled: (m) => !m.knows_secret },
      { id: 'blood_bond', label: 'Blood Bond', color: 'red', disabled: (m) => !m.knows_secret },
      { id: 'compel', label: 'Compel Silence', color: 'purple', disabled: (m) => !m.knows_secret },
      { id: 'threaten', label: 'Threaten', color: 'gray', disabled: (m) => !m.knows_secret },
      { id: 'gift', label: 'Give Gift', color: 'pink', disabled: () => false },
    ],
    human: [
      { id: 'visit', label: 'Visit Them', color: 'blue' },
      { id: 'call', label: 'Phone Call', color: 'green' },
      { id: 'lunch', label: 'Have Lunch Together', color: 'yellow' },
      { id: 'gift', label: 'Give Gift', color: 'pink' },
      { id: 'heart-to-heart', label: 'Heart to Heart', color: 'purple' },
      { id: 'lie', label: 'Lie About Your Life', color: 'red' },
      { id: 'reassure', label: 'Reassure', color: 'green', disabled: (m) => m.concern_level < 30 },
      { id: 'avoid', label: 'Avoid Contact', color: 'gray' },
    ]
  };

  const handleInteract = async (member, type) => {
    setInteracting(member.id);
    
    setTimeout(async () => {
      let concernChange = 0;
      let relationChange = 0;
      let message = '';
      const updates = {};
      
      if (servant.is_turned) {
        // Vampire servant interactions
        if (type === 'meet') {
          const humanity = vampireState.humanity || 50;
          const success = humanity >= 50;
          relationChange = success ? Math.floor(Math.random() * 15) + 15 : Math.floor(Math.random() * 20) - 30;
          concernChange = success ? Math.floor(Math.random() * 10) - 15 : Math.floor(Math.random() * 20) + 10;
          
          if (success) {
            message = `${servant.name} brought ${member.member_name} to meet you.\n\n"${member.member_name}, this is..." ${servant.name} hesitated.\n\nYou stepped forward. Humanity intact. Warmth in your eyes.\n\n${member.member_name} looked nervous but... accepting. "So you're the one," they said quietly. "I can see why ${servant.name} chose this."\n\nNot horror. Not fear. Understanding.`;
          } else {
            message = `${servant.name} brought ${member.member_name} to meet you.\n\nYour eyes were dark. Hunger barely contained. The predator showing through.\n\n${member.member_name} stepped back. "${servant.name}, what have you become?"\n\n"This is wrong. All of this is wrong."\n\nThey left. Terrified. Disgusted.`;
          }
          updates.knows_secret = true;
        } else if (type === 'talk') {
          const roll = Math.random();
          if (roll > 0.6) {
            relationChange = Math.floor(Math.random() * 20) + 15;
            concernChange = Math.floor(Math.random() * 15) - 20;
            message = `You sat with ${member.member_name}. Really talked.\n\n"I won't pretend to understand," they said. "But ${servant.name} is happy. Truly happy. I can see that."\n\n"Maybe this world has room for... whatever you are."\n\nAcceptance. Slowly earned.`;
          } else {
            relationChange = Math.floor(Math.random() * 10) - 5;
            concernChange = Math.floor(Math.random() * 10);
            message = `The conversation was difficult.\n\n${member.member_name}: "This isn't natural. You know that, right?"\n\nYou: "Natural doesn't mean good. Unnatural doesn't mean evil."\n\nThey weren't convinced. But they listened.`;
          }
        } else if (type === 'compel') {
          relationChange = Math.floor(Math.random() * 20) - 40;
          concernChange = -100;
          message = `You looked ${member.member_name} in the eyes.\n\nPower flowing. Mind bending. Memories fading.\n\n"You saw nothing. ${servant.name} is fine. Everything is normal."\n\nThey blinked. Confused. "Sorry, I... what were we talking about?"\n\nThe secret erased. But the bond damaged forever.`;
          updates.knows_secret = false;
          updates.concern_level = 0;
        } else if (type === 'blood_bond') {
          relationChange = Math.floor(Math.random() * 30) + 50;
          concernChange = -100;
          message = `You offered your wrist.\n\n${member.member_name} hesitated. Then drank.\n\nYour blood. Ancient. Powerful. Intoxicating.\n\nTheir eyes changed. "I... I understand now. Everything. I'd die for you. For ${servant.name}. For this family."\n\nUnbreakable loyalty. Blood bond complete.`;
          updates.knows_secret = true;
          updates.concern_level = 0;
        } else if (type === 'threaten') {
          relationChange = Math.floor(Math.random() * 40) - 60;
          concernChange = Math.floor(Math.random() * 30) + 50;
          message = `You let the monster show.\n\nFangs. Eyes dark. Voice cold.\n\n"If you tell anyone, ${member.member_name}, I will find you. And ${servant.name} won't be able to stop me."\n\n${member.member_name} went pale. Nodding frantically. "I won't. I swear. Please."\n\nTerror achieved. But at what cost?`;
          updates.knows_secret = true;
        } else if (type === 'gift') {
          relationChange = Math.floor(Math.random() * 15) + 10;
          concernChange = Math.floor(Math.random() * 10) - 10;
          message = `You sent ${member.member_name} a gift. Expensive. Thoughtful.\n\nThey called ${servant.name}. "Tell your... tell them thank you. This is... too much."\n\n${servant.name} smiled. "They care about the people I care about."\n\n${member.member_name} softened a little.`;
        }
      } else {
        // Human servant interactions
        if (type === 'visit') {
          const warmth = Math.random() > 0.35;
          relationChange = warmth ? Math.floor(Math.random() * 15) + 10 : Math.floor(Math.random() * 15) - 15;
          concernChange = warmth ? Math.floor(Math.random() * 10) - 10 : Math.floor(Math.random() * 15) + 5;
          
          if (warmth) {
            message = `${servant.name} visited ${member.member_name}.\n\nHugs. Laughter. Real connection.\n\n"You seem good," ${member.member_name} said. "Really good. I was worried but... you're glowing."\n\n${servant.name} smiled. Couldn't explain why. But the worry eased.`;
          } else {
            message = `The visit was tense.\n\n${member.member_name}: "You're different. Distant. What's going on?"\n\n${servant.name}: "Nothing. Everything's fine."\n\nBut ${member.member_name} didn't believe it. The concern grew.`;
          }
        } else if (type === 'call') {
          relationChange = Math.floor(Math.random() * 10) + 5;
          concernChange = Math.floor(Math.random() * 15) - 10;
          message = `${servant.name} called ${member.member_name}.\n\n${member.concern_level > 50 ? `"Are you okay? Really okay? You can tell me anything."\n\n${servant.name} lied smoothly. The concern remained.` : `Easy conversation. Updates. Laughter. "Love you," they both said before hanging up.`}`;
        } else if (type === 'lunch') {
          const success = Math.random() > 0.3;
          relationChange = success ? Math.floor(Math.random() * 20) + 15 : Math.floor(Math.random() * 10) - 5;
          concernChange = success ? Math.floor(Math.random() * 15) - 20 : Math.floor(Math.random() * 10) + 5;
          
          if (success) {
            message = `Lunch together. Normal. Human.\n\n${member.member_name} relaxed. "This is nice. I missed this."\n\n${servant.name} realized how much they missed it too. Normalcy. Family. Connection.\n\nThe concern faded. For now.`;
          } else {
            message = `${servant.name} barely touched their food.\n\n${member.member_name} noticed. "You're not eating."\n\n"Not hungry."\n\n"You're never hungry anymore. ${servant.name}, talk to me."\n\nBut ${servant.name} couldn't. The gap widening.`;
          }
        } else if (type === 'gift') {
          relationChange = Math.floor(Math.random() * 20) + 15;
          concernChange = Math.floor(Math.random() * 15) - 18;
          message = `${servant.name} sent a thoughtful gift.\n\n${member.member_name} called immediately. "You didn't have to! This is... thank you. Really."\n\nWarmth through the phone. "I've been worried about you but... you're okay. You're doing well."\n\nLove renewed.`;
        } else if (type === 'heart-to-heart') {
          const honest = Math.random() > 0.5;
          relationChange = honest ? Math.floor(Math.random() * 25) + 20 : Math.floor(Math.random() * 10);
          concernChange = honest ? Math.floor(Math.random() * 20) - 25 : Math.floor(Math.random() * 20) + 10;
          
          if (honest) {
            message = `${servant.name} opened up. Not about vampires. But about feelings.\n\n"I found something. Someone. I'm... I'm happy."\n\n${member.member_name} listened. Really listened. "That's all I want for you. Happiness."\n\nNo more questions. Just acceptance.`;
          } else {
            message = `${servant.name} tried to open up but kept secrets.\n\n${member.member_name} sensed it. "You're holding back. Why won't you trust me?"\n\nThe gap remained. Trust damaged.`;
          }
        } else if (type === 'lie') {
          concernChange = Math.floor(Math.random() * 15) - 20;
          relationChange = Math.floor(Math.random() * 10) - 15;
          message = `${servant.name} lied smoothly.\n\n"New job. New relationship. Everything's great."\n\nConvincing lies. Practiced lies.\n\n${member.member_name} believed them. For now. But lies have a cost.`;
        } else if (type === 'reassure') {
          const success = Math.random() > 0.25;
          concernChange = success ? Math.floor(Math.random() * 30) - 35 : Math.floor(Math.random() * 10);
          relationChange = success ? Math.floor(Math.random() * 10) + 5 : Math.floor(Math.random() * 10) - 10;
          
          if (success) {
            message = `${servant.name}: "I know you're worried. But I promise, I'm okay. Better than okay."\n\n${member.member_name} studied their face. Saw truth there. Real happiness.\n\n"Okay. I believe you. Just... stay safe."\n\nWorry eased. Trust maintained.`;
          } else {
            message = `${servant.name} tried to reassure them.\n\nBut ${member.member_name} wasn't buying it. "You're lying. I know you're lying. What's really going on?"\n\nThe concern grew worse.`;
          }
        } else if (type === 'avoid') {
          relationChange = Math.floor(Math.random() * 15) - 20;
          concernChange = Math.floor(Math.random() * 25) + 15;
          message = `${servant.name} avoided ${member.member_name}'s calls. Texts. Visits.\n\n${member.member_name} left a voicemail: "Did I do something wrong? Please talk to me."\n\nSilence. Distance. The relationship fracturing.`;
        }
      }
      
      const newConcern = Math.max(0, Math.min(100, (member.concern_level || 0) + concernChange));
      const newRelation = Math.max(-100, Math.min(100, (member.relationship_with_vampire || 0) + relationChange));
      
      await base44.entities.ServantFamily.update(member.id, {
        concern_level: newConcern,
        relationship_with_vampire: newRelation,
        last_contact: new Date().toISOString(),
        ...updates
      });
      
      // Check for intervention (only for human servants)
      if (!servant.is_turned && newConcern > 75 && !member.intervention_attempted && Math.random() > 0.6) {
        await base44.entities.ServantFamily.update(member.id, {
          intervention_attempted: true
        });
        
        message += `\n\n⚠️ WARNING: ${member.member_name} is planning an intervention. They're going to confront ${servant.name} soon.`;
      }
      
      setOutcome(message);
      
      await base44.entities.NightLog.create({
        entry: `${servant.name}'s family: ${message.split('\n')[0]}`,
        category: 'interaction',
        intensity: member.intervention_attempted ? 'significant' : 'moderate'
      });
      
      queryClient.invalidateQueries();
      
      setTimeout(() => {
        setInteracting(null);
        setOutcome('');
        setSelectedMember(null);
      }, 5000);
    }, 2500);
  };

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
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">👨‍👩‍👧 {servant.name}'s Family</h2>
        <p className="text-gray-400 text-sm mb-6">Mortals who notice something's wrong</p>

{!selectedMember ? (
          family.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No family discovered yet</p>
          ) : (
            <div className="space-y-3">
              {family.map(member => (
                <button
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-white font-bold">{member.member_name}</h3>
                      <p className="text-gray-400 text-sm capitalize">{servant.name}'s {member.relationship_type}</p>
                      {member.knows_secret && <p className="text-red-400 text-xs mt-1">👁️ Knows the secret</p>}
                      {member.intervention_attempted && (
                        <p className="text-orange-400 text-xs mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Intervention planned!
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`text-sm ${(member.relationship_with_vampire || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        Rel: {member.relationship_with_vampire || 0}
                      </p>
                      <p className={`text-xs ${(member.concern_level || 0) > 50 ? 'text-orange-400' : 'text-gray-500'}`}>
                        Concern: {member.concern_level || 0}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )
        ) : outcome ? (
          <div className="py-8">
            <div className="bg-black/40 rounded-xl p-6 border border-purple-500/30">
              <p className="text-gray-300 text-base leading-relaxed whitespace-pre-line">
                {outcome}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => setSelectedMember(null)}
              className="text-gray-400 hover:text-white text-sm mb-4"
            >
              ← Back
            </button>

            <div className="bg-gray-800 rounded-xl p-4 mb-4">
              <h3 className="text-white font-bold text-lg">{selectedMember.member_name}</h3>
              <p className="text-gray-400 text-sm capitalize">{servant.name}'s {selectedMember.relationship_type}</p>
              <div className="flex gap-4 mt-2 text-xs">
                <span className={(selectedMember.relationship_with_vampire || 0) >= 0 ? 'text-green-400' : 'text-red-400'}>
                  Relationship: {selectedMember.relationship_with_vampire || 0}
                </span>
                <span className={(selectedMember.concern_level || 0) > 50 ? 'text-orange-400' : 'text-gray-400'}>
                  Concern: {selectedMember.concern_level || 0}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(servant.is_turned ? interactions.vampire : interactions.human).map(action => (
                <button
                  key={action.id}
                  onClick={() => handleInteract(selectedMember, action.id)}
                  disabled={interacting || (action.disabled && action.disabled(selectedMember))}
                  className={`bg-${action.color}-900/40 hover:bg-${action.color}-900/60 border border-${action.color}-500/30 text-${action.color}-300 rounded-lg py-3 px-4 text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
                  style={{
                    backgroundColor: `rgb(${action.color === 'blue' ? '30 58 138' : action.color === 'purple' ? '88 28 135' : action.color === 'red' ? '127 29 29' : action.color === 'green' ? '20 83 45' : action.color === 'pink' ? '131 24 67' : action.color === 'yellow' ? '113 63 18' : '31 41 55'} / 0.4)`,
                    borderColor: `rgb(${action.color === 'blue' ? '59 130 246' : action.color === 'purple' ? '168 85 247' : action.color === 'red' ? '239 68 68' : action.color === 'green' ? '34 197 94' : action.color === 'pink' ? '236 72 153' : action.color === 'yellow' ? '234 179 8' : '156 163 175'} / 0.3)`,
                    color: `rgb(${action.color === 'blue' ? '147 197 253' : action.color === 'purple' ? '216 180 254' : action.color === 'red' ? '252 165 165' : action.color === 'green' ? '134 239 172' : action.color === 'pink' ? '249 168 212' : action.color === 'yellow' ? '253 224 71' : '209 213 219'})`
                  }}
                >
                  {interacting === selectedMember.id ? '...' : action.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}