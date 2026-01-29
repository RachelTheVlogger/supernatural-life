export const TURNED_HUNTER_POWERS = {
  // Predator Powers - Enhanced hunting abilities
  predatory_instinct: {
    id: 'predatory_instinct',
    name: 'Predatory Instinct',
    category: 'predator',
    tier: 1,
    stage: 1,
    power: 0,
    icon: 'Eye',
    color: 'red',
    desc: 'Track prey with supernatural accuracy',
    upgrades: [
      { id: 'scent_tracking', name: 'Scent Tracking', desc: 'Follow blood trails miles away', cost: 50 },
      { id: 'kill_sense', name: 'Kill Sense', desc: 'Sense weaknesses in prey', cost: 50 },
      { id: 'prey_resonance', name: 'Prey Resonance', desc: 'Feel heartbeats across the city', cost: 100, tier: 2 },
      { id: 'predator_perfection', name: 'Predator Perfection', desc: 'Track anything, anywhere, always', cost: 200, tier: 3 }
    ]
  },
  hunter_reflexes: {
    id: 'hunter_reflexes',
    name: 'Hunter Reflexes',
    category: 'predator',
    tier: 1,
    stage: 1,
    power: 10,
    icon: 'Wind',
    color: 'cyan',
    desc: 'Combat-honed vampire speed and precision',
    upgrades: [
      { id: 'tactical_blur', name: 'Tactical Blur', desc: 'Move between cover instantly', cost: 60 },
      { id: 'counter_strike', name: 'Counter Strike', desc: 'React faster than thought', cost: 60 }
    ]
  },
  lethal_strength: {
    id: 'lethal_strength',
    name: 'Lethal Strength',
    category: 'predator',
    tier: 1,
    stage: 1,
    power: 15,
    icon: 'Zap',
    color: 'red',
    desc: 'Vampire strength weaponized for kills',
    upgrades: [
      { id: 'execution_grip', name: 'Execution Grip', desc: 'Crushing hold that paralyzes', cost: 60 },
      { id: 'bone_break', name: 'Bone Break', desc: 'Shatter bones with touch', cost: 60 }
    ]
  },

  // Domination Powers - Control and subjugation
  predator_presence: {
    id: 'predator_presence',
    name: 'Predator Presence',
    category: 'domination',
    tier: 2,
    stage: 2,
    power: 25,
    icon: 'Brain',
    color: 'purple',
    desc: 'Emit aura of dominance that terrifies prey',
    upgrades: [
      { id: 'fear_aura', name: 'Fear Aura', desc: 'Paralyze with pure terror', cost: 100 },
      { id: 'submission_compulsion', name: 'Submission Compulsion', desc: 'Force surrender without words', cost: 100 }
    ]
  },
  pack_mentality: {
    id: 'pack_mentality',
    name: 'Pack Mentality',
    category: 'domination',
    tier: 2,
    stage: 2,
    power: 35,
    icon: 'Users',
    color: 'blue',
    desc: 'Command and coordinate with other vampires',
    upgrades: [
      { id: 'pack_bond', name: 'Pack Bond', desc: 'Share senses with pack members', cost: 100 },
      { id: 'alpha_command', name: 'Alpha Command', desc: 'Enforce absolute obedience', cost: 120 }
    ]
  },

  // Killer Powers - Assassination and execution
  silent_death: {
    id: 'silent_death',
    name: 'Silent Death',
    category: 'killer',
    tier: 2,
    stage: 2,
    power: 30,
    icon: 'Eye',
    color: 'gray',
    desc: 'Kill without alerting anyone nearby',
    upgrades: [
      { id: 'silence_aura', name: 'Silence Aura', desc: 'Muffle all sounds around kill', cost: 90 },
      { id: 'bloodless_death', name: 'Bloodless Death', desc: 'Execute with no mess', cost: 90 }
    ]
  },
  execution_mastery: {
    id: 'execution_mastery',
    name: 'Execution Mastery',
    category: 'killer',
    tier: 3,
    stage: 3,
    power: 60,
    icon: 'Target',
    color: 'red',
    desc: 'One-hit kill on weakened prey',
    upgrades: [
      { id: 'instant_kill', name: 'Instant Kill', desc: 'Execute anything vulnerable', cost: 150 },
      { id: 'death_mark', name: 'Death Mark', desc: 'Mark prey for lethal strikes', cost: 150 }
    ]
  },

  // Corruption Powers - Turning and corrupting others
  sire_gift: {
    id: 'sire_gift',
    name: 'Sire Gift',
    category: 'corruption',
    tier: 2,
    stage: 2,
    power: 40,
    icon: 'Droplets',
    color: 'pink',
    desc: 'Turn humans into vampires with your bite',
    upgrades: [
      { id: 'rapid_turning', name: 'Rapid Turning', desc: 'Transformation in minutes', cost: 100 },
      { id: 'loyal_spawn', name: 'Loyal Spawn', desc: 'Turned ones are bound to you', cost: 120 }
    ]
  },
  corruption_aura: {
    id: 'corruption_aura',
    name: 'Corruption Aura',
    category: 'corruption',
    tier: 3,
    stage: 3,
    power: 70,
    icon: 'Brain',
    color: 'violet',
    desc: 'Corrupt the wills of those nearby',
    upgrades: [
      { id: 'moral_decay', name: 'Moral Decay', desc: 'Break down victim morality', cost: 180 },
      { id: 'will_breaking', name: 'Will Breaking', desc: 'Shatter resistance permanently', cost: 180 }
    ]
  },

  // Daywalker Powers - Sunlight immunity and daylight hunting
  sunlight_resistance: {
    id: 'sunlight_resistance',
    name: 'Sunlight Resistance',
    category: 'daywalker',
    tier: 3,
    stage: 3,
    power: 65,
    icon: 'Eye',
    color: 'yellow',
    desc: 'Tolerate brief sun exposure',
    upgrades: [
      { id: 'dusk_walker', name: 'Dusk Walker', desc: 'Hunt at dawn and dusk', cost: 150 },
      { id: 'sun_cloak', name: 'Sun Cloak', desc: 'Ward yourself from solar damage', cost: 150 }
    ]
  },
  daylight_immunity: {
    id: 'daylight_immunity',
    name: 'Daylight Immunity',
    category: 'daywalker',
    tier: 4,
    stage: 4,
    power: 85,
    icon: 'Eye',
    color: 'yellow',
    desc: 'Walk freely in sunlight without pain',
    upgrades: [
      { id: 'sun_predator', name: 'Sun Predator', desc: 'Strength increases in daylight', cost: 200 },
      { id: 'eternal_hunter', name: 'Eternal Hunter', desc: 'Hunt 24/7 without restriction', cost: 250 }
    ]
  },

  // Guardian Powers - Protection and defense
  iron_skin: {
    id: 'iron_skin',
    name: 'Iron Skin',
    category: 'guardian',
    tier: 2,
    stage: 2,
    power: 25,
    icon: 'Zap',
    color: 'blue',
    desc: 'Hardened hide resistant to damage',
    upgrades: [
      { id: 'scar_tissue', name: 'Scar Tissue', desc: 'Heal damage as tough scar', cost: 100 },
      { id: 'pain_immunity', name: 'Pain Immunity', desc: 'Feel no pain from wounds', cost: 100 }
    ]
  },
  regeneration: {
    id: 'regeneration',
    name: 'Regeneration',
    category: 'guardian',
    tier: 3,
    stage: 3,
    power: 55,
    icon: 'Droplets',
    color: 'green',
    desc: 'Rapidly heal wounds and injuries',
    upgrades: [
      { id: 'rapid_healing', name: 'Rapid Healing', desc: 'Heal in seconds', cost: 160 },
      { id: 'limb_regrowth', name: 'Limb Regrowth', desc: 'Regenerate lost limbs', cost: 180 }
    ]
  },

  // Supernatural Powers - Reality-bending abilities
  shadow_form: {
    id: 'shadow_form',
    name: 'Shadow Form',
    category: 'supernatural',
    tier: 3,
    stage: 3,
    power: 75,
    icon: 'Eye',
    color: 'gray',
    desc: 'Transform into shadow to escape',
    upgrades: [
      { id: 'shadow_travel', name: 'Shadow Travel', desc: 'Move through shadows instantly', cost: 170 },
      { id: 'shadow_strike', name: 'Shadow Strike', desc: 'Attack from shadow form', cost: 170 }
    ]
  },
  temporal_sight: {
    id: 'temporal_sight',
    name: 'Temporal Sight',
    category: 'supernatural',
    tier: 4,
    stage: 4,
    power: 90,
    icon: 'Brain',
    color: 'purple',
    desc: 'See immediate future to predict actions',
    upgrades: [
      { id: 'precognition', name: 'Precognition', desc: 'See seconds into future', cost: 250 },
      { id: 'fate_dodge', name: 'Fate Dodge', desc: 'Avoid attacks before they happen', cost: 250 }
    ]
  }
};

export const TURNED_HUNTER_CATEGORIES = {
  predator: {
    name: 'Predator',
    desc: 'Hunting abilities for stalking and killing prey',
    emoji: '🦇'
  },
  domination: {
    name: 'Domination',
    desc: 'Control and subjugate others',
    emoji: '👑'
  },
  killer: {
    name: 'Killer',
    desc: 'Assassination and execution powers',
    emoji: '⚔️'
  },
  corruption: {
    name: 'Corruption',
    desc: 'Turn others and corrupt their souls',
    emoji: '🩸'
  },
  daywalker: {
    name: 'Daywalker',
    desc: 'Conquer the sun and hunt by day',
    emoji: '☀️'
  },
  guardian: {
    name: 'Guardian',
    desc: 'Protect yourself from harm',
    emoji: '🛡️'
  },
  supernatural: {
    name: 'Supernatural',
    desc: 'Reality-bending and transcendent powers',
    emoji: '✨'
  }
};