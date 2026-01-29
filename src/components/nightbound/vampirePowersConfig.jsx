export const VAMPIRE_POWERS = {
  // Tier 1 - Newborn (Stage 1, Power 0-25)
  heightened_hearing: {
    id: 'heightened_hearing',
    name: 'Heightened Hearing',
    tier: 1,
    stage: 1,
    power: 0,
    icon: 'Eye',
    color: 'blue',
    desc: 'Hear heartbeats and whispers from afar',
    upgrades: [
      { id: 'scent_reading', name: 'Scent Reading', desc: 'Track prey by blood scent', cost: 50 },
      { id: 'threshold_sense', name: 'Threshold Sense', desc: 'Sense when wards break', cost: 50 }
    ]
  },
  heightened_speed: {
    id: 'heightened_speed',
    name: 'Heightened Speed',
    tier: 1,
    stage: 1,
    power: 10,
    icon: 'Wind',
    color: 'cyan',
    desc: 'Move faster than mortals can perceive',
    upgrades: [
      { id: 'echo_step', name: 'Echo Step', desc: 'Leave afterimages', cost: 60 },
      { id: 'shadow_patience', name: 'Shadow Patience', desc: 'Wait unseen for hours', cost: 60 }
    ]
  },
  heightened_strength: {
    id: 'heightened_strength',
    name: 'Heightened Strength',
    tier: 1,
    stage: 1,
    power: 15,
    icon: 'Zap',
    color: 'red',
    desc: 'Possess supernatural physical power',
    upgrades: [
      { id: 'hunger_suppression', name: 'Hunger Suppression', desc: 'Go longer without feeding', cost: 60 },
      { id: 'presence_weight', name: 'Presence Weight', desc: 'Make your presence felt', cost: 60 }
    ]
  },
  night_sight: {
    id: 'night_sight',
    name: 'Night Sight',
    tier: 1,
    stage: 1,
    power: 5,
    icon: 'Eye',
    color: 'purple',
    desc: 'Perfect vision in complete darkness',
    upgrades: [
      { id: 'lingering_presence', name: 'Lingering Presence', desc: 'Victims remember you', cost: 45 },
      { id: 'stillness', name: 'Stillness', desc: 'Become invisible when still', cost: 45 }
    ]
  },

  // Tier 2 - Fledgling (Stage 2, Power 25-50)
  compulsion: {
    id: 'compulsion',
    name: 'Compulsion',
    tier: 2,
    stage: 2,
    power: 30,
    icon: 'Brain',
    color: 'purple',
    desc: 'Force your will upon mortal minds',
    upgrades: [
      { id: 'veiled_voice', name: 'Veiled Voice', desc: 'Commands sound like suggestions', cost: 100 },
      { id: 'binding_gaze', name: 'Binding Gaze', desc: 'Paralyze with a look', cost: 100 }
    ]
  },
  dream_reach: {
    id: 'dream_reach',
    name: 'Dream Reach',
    tier: 2,
    stage: 2,
    power: 40,
    icon: 'Moon',
    color: 'indigo',
    desc: 'Enter and influence sleeping minds',
    upgrades: [
      { id: 'mutual_awareness', name: 'Mutual Awareness', desc: 'Share dreams with chosen ones', cost: 100 },
      { id: 'silent_invitation', name: 'Silent Invitation', desc: 'Summon through dreams', cost: 120 }
    ]
  },
  emotional_imprint: {
    id: 'emotional_imprint',
    name: 'Emotional Imprint',
    tier: 2,
    stage: 2,
    power: 50,
    icon: 'Target',
    color: 'pink',
    desc: 'Leave emotional marks on mortals',
    upgrades: [
      { id: 'blood_memory', name: 'Blood Memory', desc: 'Victims\' memories in their blood', cost: 90 },
      { id: 'night_calm', name: 'Night Calm', desc: 'Soothe all unease', cost: 90 }
    ]
  },

  // Tier 3 - Established (Stage 3, Power 50-75)
  time_dilation: {
    id: 'time_dilation',
    name: 'Time Dilation',
    tier: 3,
    stage: 3,
    power: 60,
    icon: 'Moon',
    color: 'violet',
    desc: 'Make seconds stretch like hours',
    upgrades: [
      { id: 'moment_stretch', name: 'Moment Stretch', desc: 'Slow time around you', cost: 150 },
      { id: 'temporal_echo', name: 'Temporal Echo', desc: 'See multiple timelines', cost: 150 }
    ]
  },
  blood_memory: {
    id: 'blood_memory_master',
    name: 'Blood Memory Master',
    tier: 3,
    stage: 3,
    power: 70,
    icon: 'Brain',
    color: 'red',
    desc: 'Read the memories within blood',
    upgrades: [
      { id: 'genetic_memory', name: 'Genetic Memory', desc: 'Access ancestral knowledge', cost: 180 },
      { id: 'blood_prophecy', name: 'Blood Prophecy', desc: 'See futures in blood', cost: 180 }
    ]
  },
  presence_mastery: {
    id: 'presence_mastery',
    name: 'Presence Mastery',
    tier: 3,
    stage: 3,
    power: 80,
    icon: 'Wind',
    color: 'gray',
    desc: 'Master how mortals perceive you',
    upgrades: [
      { id: 'perfect_anonymity', name: 'Perfect Anonymity', desc: 'Be instantly forgotten', cost: 160 },
      { id: 'fear_embodiment', name: 'Fear Embodiment', desc: 'Embody their nightmares', cost: 200 }
    ]
  },

  // Tier 4 - Elder (Stage 4, Power 75-100)
  time_mastery: {
    id: 'time_mastery',
    name: 'Time Mastery',
    tier: 4,
    stage: 4,
    power: 90,
    icon: 'Moon',
    color: 'yellow',
    desc: 'Bend time to your will',
    special: 'Requires bond 90%',
    upgrades: [
      { id: 'temporal_anchor', name: 'Temporal Anchor', desc: 'Create fixed points in time', cost: 250 },
      { id: 'age_reversal', name: 'Age Reversal', desc: 'Turn back time on objects', cost: 250 }
    ]
  }
};

export const POWER_EFFECTS = {
  enhanced_senses: {
    animation: 'pulse',
    particles: 'blue',
    outcomes: [
      'Your senses exploded. Every heartbeat for miles. Every whisper. Every scent. The world alive in impossible detail.',
      'Colors sharper. Sounds clearer. You heard their thoughts before they spoke. Enhanced beyond human comprehension.',
      'The night revealed its secrets. You saw heat signatures through walls. Heard blood flowing in veins. Perfect predator.'
    ]
  },
  super_speed: {
    animation: 'blur',
    particles: 'cyan',
    outcomes: [
      'You moved. The world froze. Raindrops hung in air. You walked between seconds. Time meant nothing.',
      'Blur of motion. You crossed the city in heartbeats. Impossible speed. Reality struggled to keep up.',
      'Afterimages followed you. The human eye couldn\'t track. You were everywhere and nowhere.'
    ]
  },
  super_strength: {
    animation: 'shake',
    particles: 'red',
    outcomes: [
      'Power surged. You punched through concrete. Ripped steel like paper. Unstoppable force.',
      'Raw strength incarnate. You lifted a car one-handed. The ground cracked beneath your feet.',
      'Your grip crushed stone to dust. Buildings trembled at your touch. Titan strength.'
    ]
  },
  compulsion: {
    animation: 'spiral',
    particles: 'purple',
    outcomes: [
      'You looked into their eyes. Your will became theirs. "Obey." They did. No question. No resistance.',
      'Their mind opened like a book. You rewrote the pages. Complete control. Perfect puppet.',
      'One glance. Their will shattered. They were yours now. Body and soul. Compulsion absolute.'
    ]
  },
  dream_walking: {
    animation: 'wave',
    particles: 'indigo',
    outcomes: [
      'You stepped into their dream. Shaped it. Twisted it. They woke screaming your name.',
      'Their subconscious was yours to explore. You planted seeds of thought. Dreams became your weapon.',
      'You walked through sleeping minds. Left messages. Warnings. Promises. They\'d never forget.'
    ]
  },
  emotion_manipulation: {
    animation: 'ripple',
    particles: 'pink',
    outcomes: [
      'You reached into their chest. Changed what they felt. Fear to love. Hate to devotion. Emotions clay.',
      'Their feelings bent to your will. You made them laugh. Made them cry. Made them yours.',
      'Like plucking strings. Each emotion a note. You played them like instruments. Perfect control.'
    ]
  },
  mind_reading: {
    animation: 'pulse',
    particles: 'violet',
    outcomes: [
      'Their thoughts flooded your mind. Every secret. Every fear. Every desire. Nothing hidden.',
      'You heard them think. Surface thoughts clear as speech. Deeper thoughts like whispers. All yours.',
      'Their mind an open book. You read every page. Every memory. Every plan. Total knowledge.'
    ]
  },
  telekinesis: {
    animation: 'float',
    particles: 'purple',
    outcomes: [
      'Objects rose at your command. You crushed cars without touch. Bent reality with thought alone.',
      'Your mind reached out. Things moved. Walls crumbled. Steel twisted. Power beyond physical.',
      'Invisible force obeyed you. You shaped the world without lifting a finger. Telekinetic god.'
    ]
  },
  illusion_casting: {
    animation: 'shimmer',
    particles: 'pink',
    outcomes: [
      'Reality bent. They saw what you wanted. An army where you stood alone. Dragons where there were pigeons.',
      'You wove illusions so perfect even you almost believed. The world your canvas. Perception your paint.',
      'Their eyes betrayed them. You made them see monsters. Angels. Nothing. Whatever you desired.'
    ]
  },
  daylight_immunity: {
    animation: 'glow',
    particles: 'yellow',
    outcomes: [
      'Sunlight touched your skin. No burn. No pain. You walked in daylight. Truly immortal now.',
      'The sun that once killed now caressed. You stood in noon light, smiling. Fear conquered.',
      'Daylight immunity achieved. You were no longer bound by night. The world truly yours.'
    ]
  }
};