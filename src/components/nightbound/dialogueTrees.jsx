// Dialogue tree templates for NPCs

export const SIREN_DIALOGUE_TREE = {
  characterName: 'Siren',
  characterType: 'Supernatural',
  startNodeId: 'greeting',
  nodes: {
    greeting: {
      id: 'greeting',
      text: 'You approach the figure by the water. Their eyes glow with an otherworldly light.',
      options: [
        {
          text: 'Try to charm them with flattery',
          nextNode: 'charm_attempt',
          skillCheck: { stat: 'charm_level', difficulty: 60 },
          relationshipChange: 15,
          storyProgress: 'siren_charmed'
        },
        {
          text: 'Ask what they are',
          nextNode: 'direct_question',
          relationshipChange: 5,
          storyProgress: 'siren_curious'
        },
        {
          text: 'Keep your distance and observe',
          nextNode: 'cautious_approach',
          relationshipChange: -5,
          storyProgress: 'siren_wary'
        }
      ]
    },
    charm_attempt: {
      id: 'charm_attempt',
      text: 'The siren smiles, seemingly enchanted by your words. "Not many mortals are brave enough to admire us so openly."',
      options: [
        {
          text: 'Suggest meeting again',
          nextNode: null,
          relationshipChange: 20,
          storyProgress: 'siren_date_unlocked'
        },
        {
          text: 'Compliment their voice',
          nextNode: null,
          relationshipChange: 25,
          storyProgress: 'siren_voice_obsessed'
        },
        {
          text: 'Ask about their power',
          nextNode: null,
          relationshipChange: 10,
          storyProgress: 'siren_power_curious'
        }
      ]
    },
    direct_question: {
      id: 'direct_question',
      text: 'They tilt their head, studying you. "Perceptive, aren\'t you? I\'m not something your kind usually encounters."',
      options: [
        {
          text: 'Express fascination',
          nextNode: null,
          relationshipChange: 15,
          storyProgress: 'siren_intrigued'
        },
        {
          text: 'Show fear',
          nextNode: null,
          relationshipChange: -10,
          storyProgress: 'siren_disgusted'
        },
        {
          text: 'Challenge them',
          nextNode: null,
          skillCheck: { stat: 'voice_power', difficulty: 55 },
          relationshipChange: 20,
          relationshipChangeFail: -20,
          storyProgress: 'siren_challenged'
        }
      ]
    },
    cautious_approach: {
      id: 'cautious_approach',
      text: 'The siren notices your hesitation. Their expression hardens slightly. "Wise. Fear keeps you alive."',
      options: [
        {
          text: 'Move closer slowly',
          nextNode: null,
          relationshipChange: 15,
          storyProgress: 'siren_trust_building'
        },
        {
          text: 'Leave immediately',
          nextNode: null,
          relationshipChange: -15,
          storyProgress: 'siren_fled'
        },
        {
          text: 'Ask them to explain what you should fear',
          nextNode: null,
          relationshipChange: 10,
          storyProgress: 'siren_explanation'
        }
      ]
    }
  }
};

export const WITCH_DIALOGUE_TREE = {
  characterName: 'Mysterious Witch',
  characterType: 'Supernatural',
  startNodeId: 'greeting',
  nodes: {
    greeting: {
      id: 'greeting',
      text: 'A figure draped in shadows studies ancient texts. They glance up as you approach, eyes gleaming with arcane knowledge.',
      options: [
        {
          text: 'Ask about their magical knowledge',
          nextNode: 'magic_discussion',
          skillCheck: { stat: 'magic_level', difficulty: 50 },
          relationshipChange: 20,
          storyProgress: 'witch_scholar'
        },
        {
          text: 'Compliment their grimoire',
          nextNode: 'grimoire_comment',
          relationshipChange: 10,
          storyProgress: 'witch_flatter'
        },
        {
          text: 'Demand to know their intentions',
          nextNode: 'confrontation',
          relationshipChange: -5,
          storyProgress: 'witch_hostile'
        }
      ]
    },
    magic_discussion: {
      id: 'magic_discussion',
      text: 'The witch\'s eyes light up. "Finally, someone who understands the craft. Most mortals are woefully ignorant."',
      options: [
        {
          text: 'Ask to learn their secrets',
          nextNode: null,
          skillCheck: { stat: 'magic_level', difficulty: 70 },
          relationshipChange: 30,
          relationshipChangeFail: 5,
          storyProgress: 'witch_mentor'
        },
        {
          text: 'Share your own magical experiences',
          nextNode: null,
          relationshipChange: 25,
          storyProgress: 'witch_colleague'
        }
      ]
    },
    grimoire_comment: {
      id: 'grimoire_comment',
      text: 'A slight smile crosses their face. "Not many recognize quality craftsmanship anymore. Would you like to see something... special?"',
      options: [
        {
          text: 'Accept eagerly',
          nextNode: null,
          relationshipChange: 20,
          storyProgress: 'witch_shown_power'
        },
        {
          text: 'Proceed cautiously',
          nextNode: null,
          relationshipChange: 15,
          storyProgress: 'witch_careful'
        }
      ]
    },
    confrontation: {
      id: 'confrontation',
      text: 'The witch closes their book with a sharp snap. Dark energy crackles around them. "How dare you question me."',
      options: [
        {
          text: 'Apologize immediately',
          nextNode: null,
          relationshipChange: -10,
          storyProgress: 'witch_enemy'
        },
        {
          text: 'Stand your ground',
          nextNode: null,
          skillCheck: { stat: 'vampire_power_level', difficulty: 60 },
          relationshipChange: 25,
          relationshipChangeFail: -30,
          storyProgress: 'witch_respect'
        }
      ]
    }
  }
};

export const NYMPH_DIALOGUE_TREE = {
  characterName: 'Water Nymph',
  characterType: 'Supernatural',
  startNodeId: 'greeting',
  nodes: {
    greeting: {
      id: 'greeting',
      text: 'A ethereal figure emerges from the water, her form shimmering with otherworldly beauty. She regards you with ancient wisdom.',
      options: [
        {
          text: 'Compliment the natural beauty around her',
          nextNode: 'nature_praise',
          skillCheck: { stat: 'charm_level', difficulty: 45 },
          relationshipChange: 20,
          storyProgress: 'nymph_pleased'
        },
        {
          text: 'Ask about the waters she protects',
          nextNode: 'waters_question',
          relationshipChange: 15,
          storyProgress: 'nymph_curious'
        },
        {
          text: 'Try to touch her',
          nextNode: 'touch_attempt',
          relationshipChange: -20,
          storyProgress: 'nymph_offended'
        }
      ]
    },
    nature_praise: {
      id: 'nature_praise',
      text: 'Her form solidifies slightly, and she smiles genuinely. "You see the beauty in nature. Most mortals destroy without understanding."',
      options: [
        {
          text: 'Promise to protect these waters',
          nextNode: null,
          relationshipChange: 30,
          storyProgress: 'nymph_guardian_pact'
        },
        {
          text: 'Ask her to show you hidden places',
          nextNode: null,
          relationshipChange: 25,
          storyProgress: 'nymph_guide'
        }
      ]
    },
    waters_question: {
      id: 'waters_question',
      text: 'She gestures to the water, her expression becoming protective. "These waters have seen centuries. I guard them with my life."',
      options: [
        {
          text: 'Offer to help her protect them',
          nextNode: null,
          relationshipChange: 25,
          storyProgress: 'nymph_ally'
        },
        {
          text: 'Ask what threats she faces',
          nextNode: null,
          relationshipChange: 20,
          storyProgress: 'nymph_concerned'
        }
      ]
    },
    touch_attempt: {
      id: 'touch_attempt',
      text: 'She pulls away sharply, water swirling around her defensively. "Do not presume familiarity, mortal."',
      options: [
        {
          text: 'Apologize profusely',
          nextNode: null,
          relationshipChange: -5,
          storyProgress: 'nymph_forgiven'
        },
        {
          text: 'Leave immediately',
          nextNode: null,
          relationshipChange: -30,
          storyProgress: 'nymph_banished'
        }
      ]
    }
  }
};

export const getDialogueTree = (npcType) => {
  const trees = {
    siren: SIREN_DIALOGUE_TREE,
    witch: WITCH_DIALOGUE_TREE,
    nymph: NYMPH_DIALOGUE_TREE
  };
  
  return trees[npcType?.toLowerCase()] || SIREN_DIALOGUE_TREE;
};