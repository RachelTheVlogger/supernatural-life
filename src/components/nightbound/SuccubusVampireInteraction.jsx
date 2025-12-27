import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Heart, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const INTERACTIONS = [
  { 
    id: 'seduce', 
    label: 'Seduce the Vampire', 
    outcomes: [
      'You move closer. Power radiating.\n\nThe vampire\'s eyes darken. "What are you doing to me?"\n\n"Nothing you don\'t want," you whisper. "Your cold heart... let me warm it."\n\nThey surrender. Completely. Desire overwhelming centuries of control.',
      'You trail a finger along their jaw.\n\nThe vampire shudders. "This feeling... I haven\'t felt this in..."\n\n"Centuries?" you finish. "I know. Let me remind you what it means to burn."\n\nThey pull you close. Desperate. Hungry for more than blood.',
      'Your aura surrounds them. Intoxicating. Irresistible.\n\n"You\'re dangerous," the vampire breathes.\n\n"So are you," you smile. "That\'s why this works."\n\nPredator meeting predator. Both wanting. Both taking.'
    ],
    charmGain: 5, relationshipGain: 10 
  },
  { 
    id: 'share_energy', 
    label: 'Share Life Energy',
    outcomes: [
      'You place your hand over their heart.\n\nLife energy flows. Warm. Vibrant. Everything they lost when they died.\n\nThe vampire gasps. "I can feel... life. Again. How?"\n\n"Demon magic. A gift." You smile. "For a price."\n\n"Name it."\n\n"Your devotion."\n\n"Done."',
      'Your essence pours into them.\n\nColors brighter. Sensations sharper. The world alive again.\n\n"This is what I gave up," they whisper. "When I became this."\n\n"I can give it back. Temporarily." You lean close. "But you\'ll always need more. Always need me."\n\nAddiction forming. Beautiful. Mutual.',
      'Energy exchange. Your light. Their darkness.\n\nBalancing. Completing.\n\n"We\'re opposites," the vampire says, wonder in their voice.\n\n"Opposites that fit perfectly together," you reply.\n\nTwo halves of something dangerous. Something beautiful.'
    ],
    charmGain: 3, relationshipGain: 15 
  },
  { 
    id: 'dream_together', 
    label: 'Walk Dreams Together',
    outcomes: [
      'You enter the dreamscape. They follow.\n\nNo walls here. No masks. Just raw desire and hunger.\n\n"In dreams," you explain, "we can be anything. Everything."\n\nYou show them fantasies. Theirs. Yours. Intertwined.\n\nWhen they wake, they\'re breathless. "Again. We do that again."\n\nObsession beginning.',
      'The dream realm bends to your will.\n\nYou craft a world. Just for two. Paradise and hell mixing.\n\nThe vampire explores with childlike wonder. "It\'s been so long since I dreamed."\n\n"Stay with me," you whisper. "I\'ll make every night a dream."\n\nThey agree without hesitation.',
      'Dreams within dreams. Endless.\n\nYou and the vampire, exploring infinity together.\n\n"I don\'t want to wake up," they confess.\n\n"Then don\'t." You pull them deeper. "Stay here. With me. Forever."\n\nThe line between dream and reality blurring. Perfect.'
    ],
    charmGain: 7, relationshipGain: 20 
  },
  { 
    id: 'hunt_together', 
    label: 'Hunt Together',
    outcomes: [
      'The city sprawls below. Prey everywhere.\n\n"You take blood," you purr. "I take energy. We can share."\n\nThe vampire grins. Fangs showing. "I like how you think."\n\nHunting as one. Seduction and violence dancing together.\n\nBy dawn, you\'re both satisfied. Both craving more. More hunts. More nights. More each other.',
      'You lure them in. The vampire finishes them.\n\nPerfect teamwork. Deadly. Efficient. Intimate.\n\n"You\'re magnificent," they say, blood on their lips.\n\n"You\'re not bad yourself," you reply, energy crackling around you.\n\nPartners in predation. Something deeper forming.',
      'The hunt ends in an alley.\n\nVictim drained. Victim seduced. Both of you victorious.\n\nThe vampire pulls you close. "This feeling... hunting with you..."\n\n"Addictive, isn\'t it?" You smile against their neck.\n\n"Dangerously so."\n\n"Good."'
    ],
    charmGain: 4, relationshipGain: 12 
  },
  { 
    id: 'feed_each_other', 
    label: 'Exchange Essences',
    outcomes: [
      'They offer their wrist. You offer your energy.\n\nBlood flows into your mouth. Ancient. Powerful. Intoxicating.\n\nYour essence flows into them. Life. Desire. Pure power.\n\nBoth gasping. Both overwhelmed.\n\n"This is..." the vampire can\'t finish.\n\n"Everything," you complete. "This is everything."\n\nBound now. Irrevocably.',
      'Exchange of fluids. Exchange of power.\n\nTheir blood gives you strength. Your energy gives them sensation.\n\n"I\'ve never..." they start.\n\n"Neither have I," you admit. "Not like this."\n\nSomething new. Something dangerous. Something neither of you can quit.',
      'You drink deeply. They absorb greedily.\n\nThe room spins. Reality bends.\n\n"Too much," someone whispers. You\'re not sure who.\n\nBut neither of you stop.\n\nAddiction formed. Mutual. Eternal. Obsessive.\n\nExactly as you both wanted.'
    ],
    charmGain: 8, relationshipGain: 25 
  },
  { 
    id: 'confess', 
    label: 'Confess Feelings',
    outcomes: [
      'You break the silence.\n\n"This isn\'t just feeding anymore. You know that."\n\nThe vampire looks at you. Really looks. "I know."\n\n"I\'m a demon. You\'re undead. This is..."\n\n"Perfect," they interrupt. "This is perfect. Wrong in every way. Which makes it right."\n\nYou kiss them. Finally honest.',
      '"I think about you," you admit. "Constantly. Obsessively."\n\nThe vampire smiles. Sad. Beautiful. "I haven\'t thought about anyone in centuries. Not like this."\n\n"Is this real?" you ask.\n\n"Does it matter?" they reply. "Real or not, I\'m yours. Completely."\n\nConfession made. No taking it back.',
      '"You\'ve ruined me," the vampire says softly.\n\nYou tense. "Ruined?"\n\n"For anyone else. Anything else. I only want this. Want you."\n\nRelief floods through you. "Good. Because you\'ve done the same to me."\n\nObsession acknowledged. Embraced. Celebrated.'
    ],
    charmGain: 10, relationshipGain: 30 
  },
  { 
    id: 'jealous', 
    label: 'Make Them Jealous',
    outcomes: [
      'You flirt with someone else. Openly. Deliberately.\n\nThe vampire\'s eyes darken. Possessive. Furious.\n\n"Mine," they growl, pulling you away.\n\n"Am I?" you tease. "Prove it."\n\nThey do. Thoroughly. Desperately.\n\nJealousy is such a useful tool.',
      'You mention another vampire. Casually.\n\nTheir jaw clenches. "What other vampire?"\n\n"Just someone I met. Interesting. Powerful."\n\n"More powerful than me?"\n\nYou smile. "Maybe."\n\nThey spend the rest of the night proving otherwise. Exactly as planned.',
      'Jealousy brings out the monster.\n\nThey corner you. Eyes wild. "You\'re playing with me."\n\n"Maybe," you admit. "Is it working?"\n\n"Too well." They kiss you violently. "You\'re mine. Say it."\n\n"Yours," you breathe. "If you\'re mine."\n\n"Always."'
    ],
    charmGain: 6, relationshipGain: 15 
  },
  { 
    id: 'vulnerable', 
    label: 'Show Vulnerability',
    outcomes: [
      'You drop the mask.\n\n"I\'m not as strong as I pretend," you confess. "Being a demon... it\'s lonely."\n\nThe vampire softens. "Being a vampire is lonelier."\n\n"Maybe that\'s why..." you trail off.\n\n"Why this works?" they finish. "Two lonely immortals finding each other?"\n\nYou nod. They hold you. Real connection forming.',
      '"I\'m scared," you admit. "Of what I feel for you."\n\nThe vampire cups your face. "Me too. Centuries of nothing. Then you. It\'s terrifying."\n\n"What do we do?"\n\n"Embrace it?" they suggest. "Be terrified together?"\n\nYou laugh. Then cry. Then kiss them.\n\nVulnerability creating something unbreakable.',
      'The walls come down.\n\nYou show them your true form. Not the seduction. The demon beneath.\n\nThey don\'t flinch. "Beautiful," they whisper.\n\n"You\'re lying."\n\n"Never. Not to you." They kiss your horns. Your claws. Everything.\n\nAccepted. Completely. Finally.'
    ],
    charmGain: 8, relationshipGain: 28 
  },
  { 
    id: 'claim', 
    label: 'Claim Each Other',
    outcomes: [
      'Words aren\'t enough anymore.\n\nYou mark them. Energy signature burned into their soul.\n\nThey mark you. Blood bond sealing the claim.\n\n"Mine," you both say.\n\nThe world recognizes it. Two supernatural beings bound.\n\nObsession. Possession. Love. All three twisted together.\n\nPerfect.',
      'The claiming is ritual. Ancient. Powerful.\n\nBlood and energy mixing. Souls touching.\n\n"No one else," the vampire vows.\n\n"Never," you promise.\n\nSealed. Eternal. Unbreakable.\n\nYou are theirs. They are yours. Nothing else matters.',
      'Claiming complete.\n\nEvery supernatural creature can sense it. The bond. The obsession.\n\n"They\'ll think we\'re crazy," you mention.\n\n"We are," the vampire agrees. "Crazy about each other."\n\nYou laugh. They laugh.\n\nCrazy. Obsessed. Perfectly matched in madness.'
    ],
    charmGain: 12, relationshipGain: 40 
  },
  { 
    id: 'fight', 
    label: 'Fight and Make Up',
    outcomes: [
      'The argument explodes.\n\n"You don\'t own me!" you shout.\n\n"Don\'t I?" they counter. "Aren\'t we bound?"\n\n"That doesn\'t mean possession!"\n\nFury. Pain. Raw emotion.\n\nThen kissing. Desperate. "I\'m sorry." "Me too."\n\nMaking up is always intense.',
      'You fight about jealousy. Control. Everything.\n\n"This is toxic," you accuse.\n\n"Then leave," they challenge.\n\nSilence. Neither can.\n\n"I can\'t," you finally admit.\n\n"Neither can I," they confess.\n\nUnhealthy? Maybe. Unbreakable? Definitely.',
      'The fight turns physical. Not violent. Passionate.\n\nArguing becomes kissing. Kissing becomes more.\n\n"I hate you," you gasp.\n\n"No you don\'t," they smile.\n\n"I hate how much I need you."\n\n"Same."\n\nConflict resolved. Until next time.'
    ],
    charmGain: 5, relationshipGain: 18 
  }
];

export default function SuccubusVampireInteraction({ succubus, vampire, onClose }) {
  const queryClient = useQueryClient();
  const [interacting, setInteracting] = useState(false);
  const [outcome, setOutcome] = useState('');

  if (!succubus || !vampire) {
    return null;
  }

  const handleInteraction = async (interaction) => {
    setInteracting(true);

    setTimeout(async () => {
      const selectedOutcome = interaction.outcomes[Math.floor(Math.random() * interaction.outcomes.length)];
      
      await base44.entities.Succubus.update(succubus.id, {
        charm_level: Math.min(100, (succubus.charm_level || 0) + interaction.charmGain),
        energy_collected: (succubus.energy_collected || 0) + interaction.relationshipGain
      });

      await base44.entities.VampireState.update(vampire.id, {
        humanity: Math.min(100, (vampire.humanity || 50) + Math.floor(interaction.relationshipGain / 3))
      });

      await base44.entities.NightLog.create({
        entry: `${succubus.name} × ${vampire.vampire_name}:\n${selectedOutcome}`,
        category: 'interaction',
        intensity: 'intense'
      });

      setOutcome(selectedOutcome);
      queryClient.invalidateQueries();

      setTimeout(() => {
        setInteracting(false);
        setOutcome('');
      }, 5000);
    }, 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-pink-950/90 to-purple-950/90 rounded-2xl p-6 max-w-md w-full border-2 border-pink-500/30"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="text-6xl mb-3">💋🦇</div>
          <h2 className="text-2xl font-bold text-pink-300 mb-2">Supernatural Connection</h2>
          <p className="text-pink-100 text-sm">{succubus.name} × {vampire.vampire_name}</p>
        </div>

{outcome ? (
          <div className="py-4">
            <button
              onClick={() => {
                setOutcome('');
                setInteracting(false);
              }}
              className="absolute top-4 right-4 text-pink-300 hover:text-white text-sm"
            >
              Close
            </button>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 rounded-xl p-6 border border-pink-500/30"
            >
              <p className="text-pink-100 text-base leading-relaxed whitespace-pre-line">{outcome}</p>
            </motion.div>
          </div>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {INTERACTIONS.map((interaction) => (
              <button
                key={interaction.id}
                onClick={() => handleInteraction(interaction)}
                disabled={interacting}
                className="w-full bg-pink-900/40 hover:bg-pink-900/60 border border-pink-500/30 rounded-xl py-3 px-4 text-left transition-all disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-pink-400" />
                    <h3 className="text-white font-medium">{interaction.label}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-pink-300 text-xs">+{interaction.charmGain} charm</p>
                    <p className="text-purple-300 text-xs">+{interaction.relationshipGain} bond</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}