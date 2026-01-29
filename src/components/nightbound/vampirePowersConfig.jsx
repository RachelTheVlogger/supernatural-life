export const VAMPIRE_POWERS = {
  // Tier 1 - Newborn (Stage 1, Power 0-25)
  enhanced_senses: {
    id: 'enhanced_senses',
    name: 'Enhanced Senses',
    tier: 1,
    stage: 1,
    power: 0,
    icon: 'Eye',
    color: 'blue',
    desc: 'See in darkness, hear heartbeats from afar',
    upgrades: [
      { id: 'predator_vision', name: 'Predator Vision', desc: 'Track heat signatures through walls', cost: 50 },
      { id: 'sonic_hearing', name: 'Sonic Hearing', desc: 'Hear whispers from miles away', cost: 50 }
    ]
  },
  super_speed: {
    id: 'super_speed',
    name: 'Super Speed',
    tier: 1,
    stage: 1,
    power: 10,
    icon: 'Wind',
    color: 'cyan',
    desc: 'Move faster than the human eye can track',
    upgrades: [
      { id: 'time_dilation', name: 'Time Dilation', desc: 'World slows when you move', cost: 60 },
      { id: 'afterimage', name: 'Afterimage', desc: 'Leave copies of yourself', cost: 60 }
    ]
  },
  super_strength: {
    id: 'super_strength',
    name: 'Super Strength',
    tier: 1,
    stage: 1,
    power: 15,
    icon: 'Zap',
    color: 'red',
    desc: 'Possess overwhelming physical power',
    upgrades: [
      { id: 'titanium_grip', name: 'Titanium Grip', desc: 'Crush steel with bare hands', cost: 60 },
      { id: 'seismic_impact', name: 'Seismic Impact', desc: 'Shatter ground with strikes', cost: 60 }
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
      { id: 'mass_compulsion', name: 'Mass Compulsion', desc: 'Control multiple minds at once', cost: 100 },
      { id: 'memory_implant', name: 'Memory Implant', desc: 'Create false memories', cost: 100 }
    ]
  },
  dream_walking: {
    id: 'dream_walking',
    name: 'Dream Walking',
    tier: 2,
    stage: 2,
    power: 40,
    icon: 'Brain',
    color: 'indigo',
    desc: 'Enter and manipulate dreams',
    upgrades: [
      { id: 'nightmare_weaver', name: 'Nightmare Weaver', desc: 'Craft terrifying dreams', cost: 100 },
      { id: 'dream_prison', name: 'Dream Prison', desc: 'Trap consciousness in dreams', cost: 120 }
    ]
  },
  emotion_manipulation: {
    id: 'emotion_manipulation',
    name: 'Emotion Manipulation',
    tier: 2,
    stage: 2,
    power: 50,
    icon: 'Brain',
    color: 'pink',
    desc: 'Control what others feel',
    upgrades: [
      { id: 'fear_aura', name: 'Fear Aura', desc: 'Radiate terror', cost: 90 },
      { id: 'euphoria_touch', name: 'Euphoria Touch', desc: 'Make them crave you', cost: 90 }
    ]
  },

  // Tier 3 - Established (Stage 3, Power 50-75)
  mind_reading: {
    id: 'mind_reading',
    name: 'Mind Reading',
    tier: 3,
    stage: 3,
    power: 60,
    icon: 'Brain',
    color: 'violet',
    desc: 'Hear thoughts like whispers',
    upgrades: [
      { id: 'thought_extraction', name: 'Thought Extraction', desc: 'Steal memories and knowledge', cost: 150 },
      { id: 'mental_link', name: 'Mental Link', desc: 'Create telepathic bonds', cost: 150 }
    ]
  },
  telekinesis: {
    id: 'telekinesis',
    name: 'Telekinesis',
    tier: 3,
    stage: 3,
    power: 70,
    icon: 'Zap',
    color: 'purple',
    desc: 'Move objects with your mind',
    upgrades: [
      { id: 'blood_control', name: 'Blood Control', desc: 'Manipulate blood itself', cost: 180 },
      { id: 'force_barrier', name: 'Force Barrier', desc: 'Create invisible shields', cost: 180 }
    ]
  },
  illusion_casting: {
    id: 'illusion_casting',
    name: 'Illusion Casting',
    tier: 3,
    stage: 3,
    power: 80,
    icon: 'Eye',
    color: 'pink',
    desc: 'Make others see what isn\'t there',
    upgrades: [
      { id: 'perfect_disguise', name: 'Perfect Disguise', desc: 'Become anyone', cost: 160 },
      { id: 'mass_hallucination', name: 'Mass Hallucination', desc: 'Bend reality for crowds', cost: 200 }
    ]
  },

  // Tier 4 - Elder (Stage 4, Power 75-100)
  daylight_immunity: {
    id: 'daylight_immunity',
    name: 'Daylight Immunity',
    tier: 4,
    stage: 4,
    power: 90,
    icon: 'Star',
    color: 'yellow',
    desc: 'Walk freely in sunlight',
    special: 'Requires sire bond 90%',
    upgrades: [
      { id: 'solar_absorption', name: 'Solar Absorption', desc: 'Gain power from sun', cost: 250 },
      { id: 'radiant_form', name: 'Radiant Form', desc: 'Glow with inner light', cost: 250 }
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