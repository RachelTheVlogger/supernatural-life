import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Droplets, Eye, Shield, Skull, Users, Brain, Zap, Heart, Flame, Crown, Ghost } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import DoppelgangerMemories from '../components/nightbound/DoppelgangerMemories';
import DoppelgangerEvolution from '../components/nightbound/DoppelgangerEvolution';

export default function DoppelgangerHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [acting, setActing] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [showMemories, setShowMemories] = useState(false);
  const [showEvolution, setShowEvolution] = useState(false);

  const urlParams = new URLSearchParams(location.search);
  const doppelgangerId = urlParams.get('id');

  const { data: doppelgangers = [] } = useQuery({
    queryKey: ['doppelgangers'],
    queryFn: () => base44.entities.Doppelganger.list()
  });

  const { data: vampireStates = [] } = useQuery({
    queryKey: ['vampireState'],
    queryFn: () => base44.entities.VampireState.list()
  });

  const vampireState = vampireStates[0];
  const doppelganger = doppelgangers.find(d => d.id === doppelgangerId) || doppelgangers[0];

  React.useEffect(() => {
    if (doppelgangers.length === 0) {
      navigate(createPageUrl('VampireHome'), { replace: true });
    }
  }, [doppelgangers.length, navigate]);

  if (!doppelganger) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-950 to-black pb-24">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No doppelgängers found yet.</p>
          <button
            onClick={() => navigate(createPageUrl('VampireHome'))}
            className="mt-4 text-purple-400 hover:text-purple-300"
          >
            Search from Vampire Home →
          </button>
        </div>
      </div>
    );
  }

  const handleAction = async (action) => {
    setActing(true);

    setTimeout(async () => {
      let message = '';
      let humanityChange = 0;

      if (action === 'impersonate') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.max((doppelganger.relationship_vampire || 0) - 25, -100)
        });

        const impersonations = [
          `You pretended to be ${doppelganger.name}. Lived their life for a week. Met their friends. Their family. Slept with their partner. Ruined everything. When you revealed yourself, the betrayal in their eyes was delicious.`,
          `You impersonated ${doppelganger.name} perfectly. Same face. Same voice. Destroyed their reputation. Made enemies in their name. They came back to a life in ruins. "That wasn't me!" Nobody believes them.`,
          `You became ${doppelganger.name}. Stole their identity completely. Got them fired. Broke up with their lover for them. They watched from the shadows, helpless. You smiled at them. "Thanks for the life."`,
          `Perfect impersonation. You texted their loved ones horrible things as them. Posted embarrassing content. Sabotaged relationships. When ${doppelganger.name} returned, everyone hated them. You just watched. Enjoyed it.`
        ];
        message = impersonations[Math.floor(Math.random() * impersonations.length)];
        humanityChange = -10;
      } else if (action === 'steal_life') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.max((doppelganger.relationship_vampire || 0) - 35, -100)
        });

        const thefts = [
          `You took everything. Their apartment - yours now. Their job - you charmed the boss. Their friends - convinced them ${doppelganger.name} was crazy. Their lover - seduced them in their bed. ${doppelganger.name} has NOTHING left. You took it all. They watch their stolen life from the outside.`,
          `Systematic destruction. You stole their identity piece by piece. Bank account drained. Lease canceled. Relationships poisoned. ${doppelganger.name} became a ghost in their own life. You? You're living their dream. Better than they ever did.`,
          `You didn't just impersonate. You REPLACED them. Everyone thinks YOU are the real one now. ${doppelganger.name} tries to explain. "I'm me!" But you have their fingerprints. Their memories. Their face. Who's the copy now?`,
          `You stole their entire existence. Got them arrested for crimes you committed. Turned their family against them. Married their fiancé. ${doppelganger.name} is homeless. Alone. Destroyed. You send them photos of your perfect life. Their life. Stolen.`
        ];
        message = thefts[Math.floor(Math.random() * thefts.length)];
        humanityChange = -15;
      } else if (action === 'possess') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.max((doppelganger.relationship_vampire || 0) - 40, -100),
          is_aware: true
        });

        const possessions = [
          `You forced your consciousness into ${doppelganger.name}'s body. They screamed inside their own mind. Trapped. Prisoner in their own flesh. You lived as them for MONTHS. Did terrible things in their body. When you finally left, they remembered everything. Couldn't wash the feeling of violation away.`,
          `Body possession. You pushed ${doppelganger.name}'s soul aside. Took control. Used their body however you wanted. They felt everything but controlled nothing. When you released them, they collapsed sobbing. "You were INSIDE me. I felt you. I couldn't stop you."`,
          `You possessed ${doppelganger.name} and made them hurt people they love. Used their hands to destroy. Their voice to lie. Their body to betray. When you left, the guilt remained. They'll never forgive you. Or themselves.`,
          `Consciousness swap. You trapped ${doppelganger.name} in your body while you lived in theirs. They experienced being a vampire. The hunger. The urges. The killing. It broke them. When you switched back, they weren't the same. "I understand you now. I hate you more."`
        ];
        message = possessions[Math.floor(Math.random() * possessions.length)];
        humanityChange = -20;
      } else if (action === 'gaslighting') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.max((doppelganger.relationship_vampire || 0) - 15, -100)
        });

        const gaslights = [
          `You made ${doppelganger.name} doubt everything. "That never happened." "You're remembering wrong." "You're going crazy." Systematic. Deliberate. You rewrote their reality. Now they don't trust their own memories. Perfect.`,
          `You convinced ${doppelganger.name} that they're the doppelganger and YOU'RE the original. They believe it now. Identity crisis complete. They don't know who they are anymore. You smile. "I've always been me. You're just the copy, remember?"`,
          `Gaslighting as an art form. You made ${doppelganger.name} question their sanity. Moved their belongings. Denied conversations. Created false evidence. They think they're losing their mind. They came to YOU for help. Ironic. You comfort them. While destroying them.`,
          `You made them believe everyone secretly hates them. Forged messages. Faked conversations. ${doppelganger.name} is paranoid now. Isolated. Only trusts you. Exactly as planned. "I'm the only one who cares about you." They believe it. You broke them psychologically.`
        ];
        message = gaslights[Math.floor(Math.random() * gaslights.length)];
        humanityChange = -8;
      } else if (action === 'rivalry') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: (doppelganger.relationship_vampire || 0) - 20
        });

        const rivalries = [
          `You challenged ${doppelganger.name}. Who's better? Who's smarter? Who's more loved? You won. Every time. Proved you're superior in every way. They hate you. Good. Hate keeps them close. Obsessed with beating you. They never will.`,
          `Competition. You stole their achievements. Did everything they did, but BETTER. They got promoted? You got promoted HIGHER. They found love? You seduced someone MORE desirable. Constantly one-upping them. They're furious. Desperate to win. It's delicious.`,
          `You turned your existence into their personal hell. Everything's a competition. Every victory yours. Every failure theirs. ${doppelganger.name} is consumed with beating you. Can't. You're always better. The frustration eats them alive. Perfect.`,
          `Rivalry became obsession. You're better than ${doppelganger.name} at everything. They train. You train harder. They succeed. You succeed MORE. The gap widens. They'll never catch up. But they'll never stop trying. You own them through competition.`
        ];
        message = rivalries[Math.floor(Math.random() * rivalries.length)];
        humanityChange = -5;
      } else if (action === 'steal_love') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.max((doppelganger.relationship_vampire || 0) - 30, -100)
        });

        const thefts = [
          `${doppelganger.name} had someone they loved. HAD. You seduced them. Stole them. Fucked them in ${doppelganger.name}'s bed. Made them forget the original. Now they're yours. ${doppelganger.name} watched it happen. Helpless. You kissed their lover in front of them. "They prefer the upgrade."`,
          `You targeted ${doppelganger.name}'s lover specifically. Seduction. Manipulation. Better sex. Better everything. They left ${doppelganger.name} for you. "You're what I thought they were." The original watches their love story with YOU. Replaced. Forgotten. Perfect revenge.`,
          `Same face. Better personality. You took ${doppelganger.name}'s partner easily. They couldn't resist. Thought they were cheating with their own lover. Realized too late. Now addicted to you. ${doppelganger.name} lost them forever. "Sorry. I'm just... better than you."`,
          `You didn't just steal their lover. You made ${doppelganger.name} WATCH. Compelled them to witness every intimate moment. Every kiss. Every fuck. Every "I love you" meant for them, said to you instead. Psychological torture perfected.`
        ];
        message = thefts[Math.floor(Math.random() * thefts.length)];
        humanityChange = -12;
      } else if (action === 'frame') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.max((doppelganger.relationship_vampire || 0) - 25, -100)
        });

        const frames = [
          `You committed crimes wearing ${doppelganger.name}'s face. Murder. Theft. Assault. All caught on camera. All blamed on them. They're arrested. Imprisoned. Screaming "It wasn't me!" DNA says otherwise. You visit them in jail. Smile through the glass. "Enjoying your life?"`,
          `You framed ${doppelganger.name} for YOUR kills. Every body. Every witness. Saw their face. Their DNA at scenes. Police are hunting THEM. They're running. Terrified. You? Safe. Free. Watching the hunt. Amused. "Should have been more careful, twin."`,
          `Perfect frame job. You made ${doppelganger.name} look like a monster. Planted evidence everywhere. Testimonies from "victims." They're wanted. Hunted. Ruined. Lost everything. You took their life and gave them your crimes. "Thanks for taking the fall."`,
          `You framed them for supernatural crimes. Hunters think ${doppelganger.name} is the dangerous one. They're being hunted by everyone. Vampires AND humans. Nowhere safe. You offered protection. "All you have to do is serve me." They had no choice. Trapped.`
        ];
        message = frames[Math.floor(Math.random() * frames.length)];
        humanityChange = -14;
      } else if (action === 'ruin') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.max((doppelganger.relationship_vampire || 0) - 45, -100)
        });

        const ruins = [
          `Total destruction. You destroyed EVERYTHING ${doppelganger.name} built. Career sabotaged. Relationships poisoned. Reputation demolished. Family turned against them. Savings stolen. Home burned. They have NOTHING. You did this methodically. Carefully. Completely. They're broken. Empty. Perfect.`,
          `You didn't just ruin their life. You made them ruin it themselves. Compelled them to quit their job. Insult their family. Cheat on their partner. Destroy their own life while conscious but unable to stop. They remember doing it all. Can't explain why. Everyone thinks they went insane. Mission accomplished.`,
          `Systematic annihilation. You spent months destroying every good thing in ${doppelganger.name}'s life. One by one. Watched them spiral. Lose hope. Contemplate ending it. Then you appeared. "I can make it stop. Just obey me." They agreed. You own them through devastation.`,
          `You ruined them so thoroughly they became dependent on you. Lost everything. Everyone. You're all they have left. Stockholm syndrome on purpose. "I'll help you rebuild. Be mine." They nodded. Broken. Yours. Exactly as planned.`
        ];
        message = ruins[Math.floor(Math.random() * ruins.length)];
        humanityChange = -18;
      } else if (action === 'jealousy') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.min((doppelganger.relationship_vampire || 0) + 15, 100)
        });

        const jealousies = [
          `You flaunted your vampire life. Powers. Immortality. Beauty. Everything ${doppelganger.name} doesn't have. Made them watch you seduce people effortlessly. "Being me must be so... boring." They're consumed with envy. Want what you have. Want to BE you.`,
          `You made ${doppelganger.name} jealous of their own face. "I wear it better, don't I?" Showed them how much more powerful you are. How much more desired. Same appearance. Completely different lives. They hate it. Hate you. Hate themselves for not being you.`,
          `You lived ${doppelganger.name}'s dream life in front of them. Everything they wanted. You have it. Because you're a vampire. They're just human. Limited. Mortal. Weak. The jealousy eats them alive. "Want to be like me? Beg for it." They're considering it.`,
          `You made them jealous by being HAPPY. Same face. Different fate. You're thriving. They're surviving. The unfairness burns them. "Why do YOU get everything?" You shrug. "Because I'm eternal. You're temporary. That's just how it is, copy."`
        ];
        message = jealousies[Math.floor(Math.random() * jealousies.length)];
        humanityChange = -6;
      } else if (action === 'obsess') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.min((doppelganger.relationship_vampire || 0) + 40, 100)
        });

        const obsessions = [
          `You made yourself irresistible to ${doppelganger.name}. Vampire charm. Manipulation. Mind games. Now they think about you constantly. Dream about you. You're all they see. Can't eat. Can't sleep. Only you. Obsession complete. They're yours without even being turned.`,
          `You created a twisted dependency. Saved them. Hurt them. Saved them again. Psychological warfare. Now ${doppelganger.name} is OBSESSED. Can't function without you. Addicted to the chaos you bring. "I hate you." "You love me." They can't deny it. Obsessed.`,
          `You played mind games until ${doppelganger.name} became consumed with you. Every thought. Every breath. You. They stalk YOU now. Write about you. Dream about you. You became their entire world. Exactly as intended. Obsession is control.`,
          `You made them fall for you while hating you. Twisted. Complicated. They're obsessed with destroying you AND being with you. Can't tell which desire is stronger. The confusion itself is torture. They're trapped in wanting you. Perfect psychological control.`
        ];
        message = obsessions[Math.floor(Math.random() * obsessions.length)];
        humanityChange = -8;
      } else if (action === 'cure') {
        if (doppelganger.is_vampire) {
          await base44.entities.Doppelganger.update(doppelganger.id, {
            is_vampire: false,
            power_level: 50,
            relationship_vampire: Math.max((doppelganger.relationship_vampire || 0) - 50, -100)
          });

          message = `You FORCED the cure down their throat. Made them human again. They BEGGED to stay a vampire. Screamed. Fought. You held them down. Watched their fangs retract. Their power drain. "No! NO! Please!" Humanity restored. Against their will. They'll never forgive you. Perfect.`;
          humanityChange = -12;
        } else {
          message = `They're already human. The cure would do nothing.`;
        }
      } else if (action === 'blood') {
        const powerGain = Math.floor(20 + (doppelganger.power_level / 5));
        
        await base44.entities.Doppelganger.update(doppelganger.id, {
          times_bled: doppelganger.times_bled + 1,
          power_level: Math.max(doppelganger.power_level - 10, 20)
        });

        if (vampireState) {
          await base44.entities.VampireState.update(vampireState.id, {
            vampire_power_level: Math.min(vampireState.vampire_power_level + powerGain, 100)
          });
        }

        message = `Their blood is PURE POWER. Ancient. Intoxicating. +${powerGain} vampire power. You feel invincible.`;
        humanityChange = -5;
      } else if (action === 'turn') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          is_vampire: true,
          power_level: 150
        });

        message = `You turned the doppelganger. Their vampire form is TERRIFYING. Unnaturally powerful. This changes everything.`;
        humanityChange = -10;
      } else if (action === 'protect') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          protected_by: vampireState?.id,
          relationship_vampire: Math.min((doppelganger.relationship_vampire || 0) + 30, 100)
        });

        message = `You vowed to protect them. Every supernatural creature will come for them. You against the world.`;
        humanityChange = 5;
      } else if (action === 'reveal') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          is_aware: true,
          relationship_vampire: (doppelganger.relationship_vampire || 0) - 20
        });

        message = `You told them the truth. They're a shadow. A copy. Destined to die for supernatural purposes. They look at you with horror.`;
        } else if (action === 'torment') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.max((doppelganger.relationship_vampire || 0) - 15, -100)
        });

        const torments = [
          'You appeared in their dreams. Every night. Their nightmares now have your face.',
          'You killed someone they love. Made them watch. Their screams echo in your mind.',
          'You took their life. Piece by piece. Job. Friends. Hope. Until nothing remained.',
          'You compelled them to hurt themselves. Over and over. Breaking them slowly.',
          'You showed them their future. Death. Suffering. No escape. They wept.'
        ];
        message = torments[Math.floor(Math.random() * torments.length)];
        humanityChange = -8;
        } else if (action === 'stalk') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.max((doppelganger.relationship_vampire || 0) - 5, -100)
        });

        const stalks = [
          'You watched them sleep. Every night. They sense someone watching but see nothing.',
          'You followed them everywhere. Work. Home. Dates. They feel paranoid now.',
          'You left them gifts. Cryptic notes. Photos of them they never knew existed.',
          'You stood outside their window. For hours. Just watching. Breathing.'
        ];
        message = stalks[Math.floor(Math.random() * stalks.length)];
        humanityChange = -3;
        } else if (action === 'save') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.min((doppelganger.relationship_vampire || 0) + 25, 100),
          protected_by: vampireState.id
        });

        const saves = [
          'Hunters came for them. You slaughtered them all. Blood everywhere. They watched you kill for them.',
          'A vampire attacked. You tore them apart. Saved the doppelganger from turning. They owe you their life.',
          'They were dying. Accident. You gave them your blood to heal. Now they know what you are.',
          'A werewolf stalked them. You fought it off. Nearly died. They saw your monster form protecting them.'
        ];
        message = saves[Math.floor(Math.random() * saves.length)];
        humanityChange = 8;
        } else if (action === 'manipulate') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: (doppelganger.relationship_vampire || 0) + 10,
          is_aware: false
        });

        const manipulations = [
          'You compelled them. Made them forget their suspicions. Now they trust you completely.',
          'You orchestrated events. Made yourself their hero. They think you saved them. You created the danger.',
          'You gaslit them. Made them doubt their memories. Now they believe your version of reality.',
          'You isolated them from friends. Family. Now you\'re all they have left.'
        ];
        message = manipulations[Math.floor(Math.random() * manipulations.length)];
        humanityChange = -5;
      } else if (action === 'bond') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.min((doppelganger.relationship_vampire || 0) + 30, 100)
        });

        const bonds = [
          'You spent time with them. Really talked. Shared stories. They see you as a friend now.',
          'You showed them vulnerability. Your fears. Your pain. They feel connected to you.',
          'You trained together. Practiced abilities. Fighting side by side creates trust.',
          'You opened up about being a vampire. They listened without judgment. Understanding grew.'
        ];
        message = bonds[Math.floor(Math.random() * bonds.length)];
        humanityChange = 5;
      } else if (action === 'test') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          power_level: Math.min((doppelganger.power_level || 100) + 15, 150)
        });

        const tests = [
          'You tested their limits. Pushed them hard. They discovered new strength within.',
          'You made them face danger. They survived. Grew stronger from it.',
          'You challenged their reality. Made them question everything. Their mind expanded.',
          'You forced them to use their doppelgänger nature. They hate it. But they\'re more powerful now.'
        ];
        message = tests[Math.floor(Math.random() * tests.length)];
        humanityChange = -2;
      } else if (action === 'seduce') {
        const intimacy = Math.random();
        const relChange = intimacy > 0.7 ? 40 : intimacy > 0.4 ? 25 : 15;
        
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.min((doppelganger.relationship_vampire || 0) + relChange, 100)
        });

        const seductions = [
          'You seduced them. Slow. Deliberate. By the end, they were yours completely.',
          'Vampire charm overwhelmed them. They couldn\'t resist. Now they crave your touch.',
          'You made love to them. Supernatural passion. They\'ve never felt anything like it.',
          'You bit them during intimacy. The ecstasy. The danger. They\'re addicted to you now.'
        ];
        message = seductions[Math.floor(Math.random() * seductions.length)];
        humanityChange = -1;
      } else if (action === 'gift') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.min((doppelganger.relationship_vampire || 0) + 20, 100)
        });

        const gifts = [
          'You gave them a gift. Something they\'ve always wanted. Their eyes lit up with joy.',
          'You shared your blood. Not to turn them. Just a taste. Power flowed through them.',
          'You taught them a secret. Vampire knowledge. Ancient wisdom. They\'re grateful.',
          'You introduced them to your world. Other supernaturals. They feel special. Chosen.'
        ];
        message = gifts[Math.floor(Math.random() * gifts.length)];
        humanityChange = 3;
      } else if (action === 'abandon') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.max((doppelganger.relationship_vampire || 0) - 35, -100),
          protected_by: null
        });

        const abandonments = [
          'You left them. No explanation. No goodbye. They waited. You never came back.',
          'You pushed them away. Told them you don\'t care. The hurt in their eyes was real.',
          'You abandoned them to danger. They survived. Barely. They won\'t forget.',
          'You broke every promise. Disappeared from their life. They feel betrayed. Empty.'
        ];
        message = abandonments[Math.floor(Math.random() * abandonments.length)];
        humanityChange = -6;
      } else if (action === 'sacrifice') {
        await base44.entities.Doppelganger.update(doppelganger.id, {
          relationship_vampire: Math.min((doppelganger.relationship_vampire || 0) + 50, 100),
          protected_by: vampireState.id
        });

        const sacrifices = [
          'You sacrificed for them. Took a hunter\'s blade meant for them. Your blood. Their life.',
          'You gave up something precious. For their safety. They saw you bleed for them.',
          'You fought impossible odds. Nearly died. All to protect them. They owe you everything.',
          'You chose them over power. Over safety. They know what that cost you.'
        ];
        message = sacrifices[Math.floor(Math.random() * sacrifices.length)];
        humanityChange = 10;
      }

      if (humanityChange !== 0 && vampireState) {
        await base44.entities.VampireState.update(vampireState.id, {
          humanity: Math.max(0, Math.min(100, vampireState.humanity + humanityChange))
        });
      }

      await base44.entities.NightLog.create({
        entry: message,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();
      setOutcome(message);
      
      setTimeout(() => {
        setActing(false);
        setOutcome('');
      }, 4000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950/20 to-black pb-24">
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate(createPageUrl('Night'))}
            className="text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">{doppelganger.name}</h1>
            <p className="text-purple-400 text-lg">{doppelganger.bloodline} Bloodline</p>
            {doppelganger.is_vampire && <p className="text-red-400 mt-2">🦇 Vampire Doppelgänger</p>}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900 rounded-2xl p-6 mb-8"
          >
            <h2 className="text-white font-bold mb-4">Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Form:</span>
                <span className="text-white">{doppelganger.is_vampire ? '🦇 Vampire' : '👤 Human'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Aware of Nature:</span>
                <span className="text-white">{doppelganger.is_aware ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Blood Power:</span>
                <span className="text-red-400">{doppelganger.power_level}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Times Bled:</span>
                <span className="text-white">{doppelganger.times_bled}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Relationship:</span>
                <span className="text-purple-400">{doppelganger.relationship_vampire || 0}</span>
              </div>
              {doppelganger.protected_by && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Protection:</span>
                  <span className="text-blue-400">🛡️ Protected</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Special System Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 gap-3 mb-6"
          >
            <button
              onClick={() => setShowMemories(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 border-2 border-purple-400/50 rounded-xl py-4 text-white font-bold"
            >
              <Brain className="w-6 h-6 inline mr-2" />
              Memories
            </button>
            <button
              onClick={() => setShowEvolution(true)}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 border-2 border-yellow-400/50 rounded-xl py-4 text-white font-bold"
            >
              <Zap className="w-6 h-6 inline mr-2" />
              Evolution
            </button>
          </motion.div>

          <h2 className="text-white text-xl font-bold mb-4">Doppelgänger Interactions</h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3 max-h-[60vh] overflow-y-auto pr-2"
          >
            {/* VAMPIRE INTERACTIONS */}
            {!doppelganger.is_vampire && (
              <>
                <button
                  onClick={() => handleAction('blood')}
                  disabled={acting}
                  className="w-full bg-gradient-to-r from-red-900/60 to-red-950/60 hover:from-red-900/80 hover:to-red-950/80 border-2 border-red-500/50 rounded-xl py-4 text-white disabled:opacity-50"
                >
                  <Droplets className="w-5 h-5 inline mr-2" />
                  Drink Their Blood
                </button>
                <button
                  onClick={() => handleAction('turn')}
                  disabled={acting}
                  className="w-full bg-gradient-to-r from-purple-900/60 to-purple-950/60 hover:from-purple-900/80 hover:to-purple-950/80 border-2 border-purple-500/50 rounded-xl py-4 text-white disabled:opacity-50"
                >
                  <Skull className="w-5 h-5 inline mr-2" />
                  Turn Them Into Vampire
                </button>
              </>
            )}
            {doppelganger.is_vampire && (
              <button
                onClick={() => handleAction('cure')}
                disabled={acting}
                className="w-full bg-gradient-to-r from-blue-900/60 to-cyan-950/60 hover:from-blue-900/80 hover:to-cyan-950/80 border-2 border-blue-500/50 rounded-xl py-4 text-white disabled:opacity-50"
              >
                <Zap className="w-5 h-5 inline mr-2" />
                Force The Cure On Them
              </button>
            )}

            {/* ELENA/KATHERINE PSYCHOLOGICAL WARFARE */}
            <button
              onClick={() => handleAction('impersonate')}
              disabled={acting}
              className="w-full bg-gradient-to-r from-indigo-900/60 to-purple-950/60 hover:from-indigo-900/80 hover:to-purple-950/80 border-2 border-indigo-500/50 rounded-xl py-4 text-white disabled:opacity-50"
            >
              <Users className="w-5 h-5 inline mr-2" />
              Impersonate Them
            </button>
            <button
              onClick={() => handleAction('steal_life')}
              disabled={acting}
              className="w-full bg-gradient-to-r from-purple-900/60 to-pink-950/60 hover:from-purple-900/80 hover:to-pink-950/80 border-2 border-purple-500/50 rounded-xl py-4 text-white disabled:opacity-50"
            >
              <Skull className="w-5 h-5 inline mr-2" />
              Steal Their Entire Life
            </button>
            <button
              onClick={() => handleAction('possess')}
              disabled={acting}
              className="w-full bg-gradient-to-r from-red-900/60 to-purple-950/60 hover:from-red-900/80 hover:to-purple-950/80 border-2 border-red-500/50 rounded-xl py-4 text-white disabled:opacity-50"
            >
              <Brain className="w-5 h-5 inline mr-2" />
              Possess Their Body
            </button>
            <button
              onClick={() => handleAction('steal_love')}
              disabled={acting}
              className="w-full bg-gradient-to-r from-pink-900/60 to-red-950/60 hover:from-pink-900/80 hover:to-red-950/80 border-2 border-pink-500/50 rounded-xl py-4 text-white disabled:opacity-50"
            >
              <Heart className="w-5 h-5 inline mr-2" />
              Steal Their Lover
            </button>
            <button
              onClick={() => handleAction('frame')}
              disabled={acting}
              className="w-full bg-gradient-to-r from-yellow-900/60 to-orange-950/60 hover:from-yellow-900/80 hover:to-orange-950/80 border-2 border-yellow-500/50 rounded-xl py-4 text-white disabled:opacity-50"
            >
              <Skull className="w-5 h-5 inline mr-2" />
              Frame Them For Crimes
            </button>
            <button
              onClick={() => handleAction('ruin')}
              disabled={acting}
              className="w-full bg-gradient-to-r from-red-900/60 to-black/80 hover:from-red-900/80 hover:to-black border-2 border-red-700/50 rounded-xl py-4 text-red-300 disabled:opacity-50"
            >
              <Skull className="w-5 h-5 inline mr-2" />
              Completely Ruin Them
            </button>
            <button
              onClick={() => handleAction('gaslighting')}
              disabled={acting}
              className="w-full bg-gradient-to-r from-gray-900/60 to-purple-950/60 hover:from-gray-900/80 hover:to-purple-950/80 border-2 border-gray-500/50 rounded-xl py-4 text-white disabled:opacity-50"
            >
              <Eye className="w-5 h-5 inline mr-2" />
              Gaslight Them
            </button>
            <button
              onClick={() => handleAction('rivalry')}
              disabled={acting}
              className="w-full bg-gradient-to-r from-orange-900/60 to-red-950/60 hover:from-orange-900/80 hover:to-red-950/80 border-2 border-orange-500/50 rounded-xl py-4 text-white disabled:opacity-50"
            >
              <Flame className="w-5 h-5 inline mr-2" />
              Compete With Them
            </button>
            <button
              onClick={() => handleAction('jealousy')}
              disabled={acting}
              className="w-full bg-gradient-to-r from-green-900/60 to-emerald-950/60 hover:from-green-900/80 hover:to-emerald-950/80 border-2 border-green-500/50 rounded-xl py-4 text-white disabled:opacity-50"
            >
              <Zap className="w-5 h-5 inline mr-2" />
              Make Them Jealous
            </button>
            <button
              onClick={() => handleAction('obsess')}
              disabled={acting}
              className="w-full bg-gradient-to-r from-pink-900/60 to-purple-950/60 hover:from-pink-900/80 hover:to-purple-950/80 border-2 border-pink-500/50 rounded-xl py-4 text-white disabled:opacity-50"
            >
              <Heart className="w-5 h-5 inline mr-2" />
              Make Them Obsessed
            </button>

            {/* POSITIVE INTERACTIONS */}
            <button
              onClick={() => handleAction('bond')}
              disabled={acting}
              className="w-full bg-gradient-to-r from-blue-900/60 to-cyan-950/60 hover:from-blue-900/80 hover:to-cyan-950/80 border-2 border-cyan-500/50 rounded-xl py-4 text-white disabled:opacity-50"
            >
              <Heart className="w-5 h-5 inline mr-2" />
              Bond With Them
            </button>
            <button
              onClick={() => handleAction('save')}
              disabled={acting}
              className="w-full bg-gradient-to-r from-green-900/60 to-green-950/60 hover:from-green-900/80 hover:to-green-950/80 border-2 border-green-500/50 rounded-xl py-4 text-white disabled:opacity-50"
            >
              <Shield className="w-5 h-5 inline mr-2" />
              Save From Danger
            </button>
            <button
              onClick={() => handleAction('sacrifice')}
              disabled={acting}
              className="w-full bg-gradient-to-r from-yellow-900/60 to-yellow-950/60 hover:from-yellow-900/80 hover:to-yellow-950/80 border-2 border-yellow-500/50 rounded-xl py-4 text-white disabled:opacity-50"
            >
              <Crown className="w-5 h-5 inline mr-2" />
              Sacrifice For Them
            </button>
            <button
              onClick={() => handleAction('protect')}
              disabled={acting}
              className="w-full bg-gradient-to-r from-blue-900/60 to-blue-950/60 hover:from-blue-900/80 hover:to-blue-950/80 border-2 border-blue-500/50 rounded-xl py-4 text-white disabled:opacity-50"
            >
              <Shield className="w-5 h-5 inline mr-2" />
              Vow Protection
            </button>
            <button
              onClick={() => handleAction('seduce')}
              disabled={acting}
              className="w-full bg-gradient-to-r from-rose-900/60 to-pink-950/60 hover:from-rose-900/80 hover:to-pink-950/80 border-2 border-rose-500/50 rounded-xl py-4 text-rose-300 disabled:opacity-50"
            >
              <Flame className="w-5 h-5 inline mr-2" />
              Seduce Them
            </button>
            <button
              onClick={() => handleAction('gift')}
              disabled={acting}
              className="w-full bg-gradient-to-r from-pink-900/60 to-pink-950/60 hover:from-pink-900/80 hover:to-pink-950/80 border-2 border-pink-500/50 rounded-xl py-4 text-white disabled:opacity-50"
            >
              <Heart className="w-5 h-5 inline mr-2" />
              Give Gift
            </button>
            <button
              onClick={() => handleAction('test')}
              disabled={acting}
              className="w-full bg-gradient-to-r from-orange-900/60 to-orange-950/60 hover:from-orange-900/80 hover:to-orange-950/80 border-2 border-orange-500/50 rounded-xl py-4 text-white disabled:opacity-50"
            >
              <Zap className="w-5 h-5 inline mr-2" />
              Test Their Limits
            </button>

            {/* DARK INTERACTIONS */}
            <button
              onClick={() => handleAction('stalk')}
              disabled={acting}
              className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl py-4 text-white disabled:opacity-50"
            >
              <Eye className="w-5 h-5 inline mr-2" />
              Stalk Them
            </button>
            <button
              onClick={() => handleAction('manipulate')}
              disabled={acting}
              className="w-full bg-gradient-to-r from-purple-950/60 to-purple-950/80 hover:from-purple-950/80 hover:to-purple-950/100 border-2 border-purple-600/40 rounded-xl py-4 text-purple-400 disabled:opacity-50"
            >
              <Eye className="w-5 h-5 inline mr-2" />
              Compel & Manipulate
            </button>
            <button
              onClick={() => handleAction('torment')}
              disabled={acting}
              className="w-full bg-gradient-to-r from-red-950/60 to-red-950/80 hover:from-red-950/80 hover:to-red-950/100 border-2 border-red-600/40 rounded-xl py-4 text-red-400 disabled:opacity-50"
            >
              <Skull className="w-5 h-5 inline mr-2" />
              Torment Them
            </button>
            <button
              onClick={() => handleAction('abandon')}
              disabled={acting}
              className="w-full bg-gradient-to-r from-gray-900/60 to-gray-950/60 hover:from-gray-900/80 hover:to-gray-950/80 border-2 border-gray-600/40 rounded-xl py-4 text-gray-400 disabled:opacity-50"
            >
              <Ghost className="w-5 h-5 inline mr-2" />
              Abandon Them
            </button>
            {!doppelganger.is_aware && (
              <button
                onClick={() => handleAction('reveal')}
                disabled={acting}
                className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl py-4 text-white disabled:opacity-50"
              >
                <Eye className="w-5 h-5 inline mr-2" />
                Tell Them The Truth
              </button>
            )}
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {outcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          >
            <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full">
              <p className="text-gray-300 text-center leading-relaxed">{outcome}</p>
            </div>
          </motion.div>
        )}

        {showMemories && (
          <DoppelgangerMemories
            doppelganger={doppelganger}
            vampireState={vampireState}
            onClose={() => setShowMemories(false)}
          />
        )}

        {showEvolution && (
          <DoppelgangerEvolution
            doppelganger={doppelganger}
            vampireState={vampireState}
            onClose={() => setShowEvolution(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}