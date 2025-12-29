import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Beaker, DollarSign, Users, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ResearchTree from './ResearchTree';
import AddictionManagement from './AddictionManagement';
import RivalDealers from './RivalDealers';

const BASE_STRAINS = [
  { name: 'Crimson Bliss', potency: 1, effects: 'mild euphoria. Colors slightly brighter. Warm feeling.', price: 50, addictiveness: 30 },
  { name: 'Midnight Rush', potency: 3, effects: 'intense visuals. Time slows. Everything pulses.', price: 150, addictiveness: 50 },
  { name: 'Eternal Dream', potency: 5, effects: 'reality fractures. See through dimensions. Pure ecstasy.', price: 300, addictiveness: 70 },
  { name: 'Bloodfire', potency: 7, effects: 'your blood burns. Power surges. Primal rage mixed with bliss.', price: 500, addictiveness: 85 },
  { name: 'Void Kiss', potency: 10, effects: 'total ego death. Become the darkness itself. Transcendence.', price: 1000, addictiveness: 95 }
];

const BLOOD_PLANTS = [
  { type: 'crimson_bloom', name: 'Crimson Bloom', description: 'Classic blood flower. Grows fast. Reliable potency.', growTime: 3, baseYield: 5 },
  { type: 'shadow_vine', name: 'Shadow Vine', description: 'Creeps in darkness. High THC equivalent. Psychedelic effects.', growTime: 4, baseYield: 7 },
  { type: 'midnight_lotus', name: 'Midnight Lotus', description: 'Rare. Beautiful. Extremely potent. Hard to grow.', growTime: 6, baseYield: 3 },
  { type: 'bloodroot', name: 'Bloodroot', description: 'Deep roots. Feeds on blood. Creates powerful strains.', growTime: 5, baseYield: 6 },
  { type: 'vampweed', name: 'Vampweed', description: 'Hybrid plant. Easy to grow. Medium potency. Great for beginners.', growTime: 2, baseYield: 8 }
];

export default function CrimsonBlissLab({ vampireState, servants, onClose }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('produce');
  const [producing, setProducing] = useState(false);
  const [selectedStrain, setSelectedStrain] = useState(null);
  const [selling, setSelling] = useState(false);
  const [saleOutcome, setSaleOutcome] = useState('');
  const [testing, setTesting] = useState(false);
  const [testEffects, setTestEffects] = useState('');
  const [usingWith, setUsingWith] = useState(null);
  const [experienceOutcome, setExperienceOutcome] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [chatOutcome, setChatOutcome] = useState('');
  const [hybridMode, setHybridMode] = useState(false);
  const [selectedStrains, setSelectedStrains] = useState([]);
  const [servantBloodMode, setServantBloodMode] = useState(false);
  const [feedingSnake, setFeedingSnake] = useState(null);
  const [snakeFeedOutcome, setSnakeFeedOutcome] = useState('');
  const [plantBreeding, setPlantBreeding] = useState(false);
  const [selectedPlants, setSelectedPlants] = useState([]);
  const [breedingOutcome, setBreedingOutcome] = useState('');
  const [showResearch, setShowResearch] = useState(false);
  const [researching, setResearching] = useState(false);

  const { data: inventory = [] } = useQuery({
    queryKey: ['bloodDrugs'],
    queryFn: () => base44.entities.BloodDrug.list()
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['drugCustomers'],
    queryFn: () => base44.entities.DrugCustomer.list('-total_spent')
  });

  const { data: operations = [] } = useQuery({
    queryKey: ['drugOperation'],
    queryFn: () => base44.entities.DrugOperation.list()
  });

  const { data: bloodPlants = [] } = useQuery({
    queryKey: ['bloodPlants'],
    queryFn: () => base44.entities.BloodPlant.list()
  });

  const { data: snakes = [] } = useQuery({
    queryKey: ['snakeFamiliars'],
    queryFn: () => base44.entities.SnakeFamiliar.list()
  });

  if (!vampireState) {
    return null;
  }

  const operation = operations[0];

  const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent, 0);
  const totalDoses = inventory.reduce((sum, i) => sum + i.quantity, 0);

  // Initialize operation if needed
  React.useEffect(() => {
    const initOperation = async () => {
      if (operations.length === 0) {
        await base44.entities.DrugOperation.create({
          reputation: 0,
          heat_level: 0,
          territory_control: 50,
          rival_threat: 0,
          automation_level: 0
        });
        queryClient.invalidateQueries(['drugOperation']);
      }
    };
    initOperation();
  }, [operations.length, queryClient]);

  // Track experimentation count
  const experimentCount = React.useMemo(() => {
    return inventory.reduce((sum, drug) => {
      const baseDrug = BASE_STRAINS.find(b => b.name === drug.strain_name);
      return sum + (baseDrug ? 0 : 1); // Count custom strains
    }, 0);
  }, [inventory]);

  const generateNewStrain = async () => {
    try {
      // Get existing strain names to avoid duplicates
      const existingNames = [
        ...BASE_STRAINS.map(s => s.name),
        ...inventory.map(i => i.strain_name)
      ];

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a unique blood drug strain for a vampire drug lab. Make it creative, trippy, and explicit. The name must be 2-3 words and completely different from these existing strains: ${existingNames.join(', ')}. Include: name (creative 2-3 word name, must be unique), potency (1-10), effects (vivid psychedelic description, 10-15 words, make it wild and supernatural), price (50-1000), addictiveness (30-95). Make it darker and more intense than typical drugs. Format as JSON.`,
        response_json_schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            potency: { type: 'number' },
            effects: { type: 'string' },
            price: { type: 'number' },
            addictiveness: { type: 'number' }
          }
        }
      });

      await base44.entities.BloodDrug.create({
        strain_name: response.name,
        potency: response.potency,
        quantity: 3,
        price_per_dose: response.price,
        effects: response.effects,
        addictiveness: response.addictiveness
      });

      await base44.entities.NightLog.create({
        entry: `Through experimentation, you discovered a new strain: ${response.name}. ${response.effects}`,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();
    } catch (e) {
      // Fallback strain
      const fallbackNames = ['Obsidian Dreams', 'Scarlet Whisper', 'Abyssal Rush', 'Lunar Ecstasy'];
      const name = fallbackNames[Math.floor(Math.random() * fallbackNames.length)];
      
      await base44.entities.BloodDrug.create({
        strain_name: name,
        potency: Math.floor(Math.random() * 5) + 5,
        quantity: 3,
        price_per_dose: Math.floor(Math.random() * 500) + 300,
        effects: 'reality bends. New dimensions open. Unexplored territory.',
        addictiveness: Math.floor(Math.random() * 30) + 60
      });

      queryClient.invalidateQueries();
    }
  };

  const handleUseWith = async (drug, servant) => {
    if (drug.quantity === 0) return;
    
    setUsingWith({ drug, servant });

    setTimeout(async () => {
      await base44.entities.BloodDrug.update(drug.id, {
        quantity: Math.max(0, drug.quantity - 2)
      });

      // Dynamically generate experiences using current servant name
      const experiences = [
        `You both take ${drug.strain_name}. Colors explode. Time stops. You pull ${servant.name} close. Every touch is electric. You kiss. Their lips taste like eternity. Clothes disappear. Bodies merge. Reality fractures as you fuck. You've never felt anything like this.`,
        `${drug.strain_name} hits. ${servant.name} gasps. Their pupils dilate. "I feel everything," they whisper. You touch their face. They shudder. You undress each other slowly, every sensation amplified. When you enter them, you both see the same fractals. Connected. One being.`,
        `The drug takes hold. You're both flying. ${servant.name} straddles you, moving in slow motion. Every thrust creates waves of color. You're not just fucking - you're traveling through dimensions together. They scream your name. You taste sound. Hear their pleasure as music.`,
        `${drug.strain_name} makes everything vibrate. ${servant.name}'s skin glows. You kiss them everywhere. They beg for more. You give them everything. The room breathes with you. Your heartbeats sync. When you finish, you're both crying from how beautiful it was.`,
        `You dose together. Reality becomes liquid. ${servant.name} touches you and you see through time. You make love for hours - or seconds - you can't tell. Every position creates new universes. You're gods creating worlds with your bodies.`
      ];

      const outcome = experiences[Math.floor(Math.random() * experiences.length)];
      setExperienceOutcome(outcome);

      await base44.entities.Servant.update(servant.id, {
        relationship: Math.min(100, (servant.relationship || 0) + 15)
      });

      await base44.entities.NightLog.create({
        entry: `You and ${servant.name} used ${drug.strain_name} together. Transcendent experience.`,
        category: 'interaction',
        intensity: 'significant'
      });

      // Chance to discover new strain through experimentation
      if (Math.random() > 0.7) {
        await generateNewStrain();
      }

      queryClient.invalidateQueries();

      setTimeout(() => {
        setUsingWith(null);
        setExperienceOutcome('');
      }, 6000);
    }, 2000);
  };

  const handlePersonalUse = async (drug) => {
    if (drug.quantity === 0) return;
    
    setTesting(true);
    setSelectedStrain(drug);

    const soloExperiences = [
      `You take ${drug.strain_name} alone. The walls melt. You see yourself from outside. Every version of you across infinite timelines. You masturbate watching yourself from every angle. Transcendent.`,
      `${drug.strain_name} hits hard. You're alone but you feel everything. Touch yourself. Every sensation magnified a thousand times. You finish seeing the birth of galaxies.`,
      `Solo trip on ${drug.strain_name}. Your reflection moves independently. You have a conversation with it. It tells you secrets. Shows you what immortality really means. You understand now.`,
      `The drug takes you deep. You remember being human. Being mortal. The moment you died. The moment you woke up different. You relive it all. When you come back, you're changed.`
    ];

    setTimeout(async () => {
      const effect = soloExperiences[Math.floor(Math.random() * soloExperiences.length)];
      setTestEffects(effect);

      await base44.entities.BloodDrug.update(drug.id, {
        quantity: Math.max(0, drug.quantity - 1)
      });

      await base44.entities.NightLog.create({
        entry: `You used ${drug.strain_name} recreationally. Profound experience.`,
        category: 'interaction',
        intensity: 'significant'
      });

      // Chance to discover new strain through solo experimentation
      if (Math.random() > 0.75) {
        await generateNewStrain();
      }

      queryClient.invalidateQueries();

      setTimeout(() => {
        setTesting(false);
        setTestEffects('');
        setSelectedStrain(null);
      }, 6000);
    }, 2000);
  };

  const handleProduce = async (strain) => {
    setProducing(true);
    setSelectedStrain(strain);

    setTimeout(async () => {
      const doses = Math.floor(Math.random() * 5) + 3;
      
      const existing = inventory.find(i => i.strain_name === strain.name);
      
      if (existing) {
        await base44.entities.BloodDrug.update(existing.id, {
          quantity: existing.quantity + doses
        });
      } else {
        await base44.entities.BloodDrug.create({
          strain_name: strain.name,
          potency: strain.potency,
          quantity: doses,
          price_per_dose: strain.price,
          effects: strain.effects,
          addictiveness: strain.addictiveness
        });
      }

      await base44.entities.NightLog.create({
        entry: `Produced ${doses} doses of ${strain.name}. Your blood drug empire grows.`,
        category: 'interaction',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();
      setProducing(false);
      setSelectedStrain(null);
    }, 3000);
  };

  const handleSell = async (drug) => {
    if (drug.quantity === 0) return;
    
    setSelling(true);
    setSelectedStrain(drug);

    setTimeout(async () => {
      const customerType = Math.random() > 0.5 ? 'vampire' : 'human';
      const dosesToSell = Math.min(Math.floor(Math.random() * 3) + 1, drug.quantity);
      const earnings = dosesToSell * drug.price_per_dose;

      // Update inventory
      await base44.entities.BloodDrug.update(drug.id, {
        quantity: drug.quantity - dosesToSell
      });

      // Find or create customer
      const existingCustomer = customers.find(c => c.preferred_strain === drug.strain_name);
      
      if (existingCustomer) {
        await base44.entities.DrugCustomer.update(existingCustomer.id, {
          addiction_level: Math.min(100, existingCustomer.addiction_level + (drug.addictiveness / 10)),
          total_spent: existingCustomer.total_spent + earnings,
          last_purchase: new Date().toISOString()
        });
      } else {
        const namePool = customerType === 'vampire' 
          ? ['Vladislav', 'Carmilla', 'Lestat', 'Akasha', 'Armand', 'Selene', 'Viktor', 'Lucian', 'Sonja', 'Kraven']
          : ['Marcus', 'Elena', 'David', 'Sarah', 'Alex', 'Maya', 'Nathan', 'Rachel', 'Lucas', 'Jade'];
        
        // Get existing customer names to avoid duplicates
        const existingNames = customers.map(c => c.name);
        const availableNames = namePool.filter(n => !existingNames.includes(n));
        
        const newName = availableNames.length > 0
          ? availableNames[Math.floor(Math.random() * availableNames.length)]
          : namePool[Math.floor(Math.random() * namePool.length)] + Math.floor(Math.random() * 100);
        
        await base44.entities.DrugCustomer.create({
          name: newName,
          customer_type: customerType,
          addiction_level: drug.addictiveness / 10,
          preferred_strain: drug.strain_name,
          total_spent: earnings,
          last_purchase: new Date().toISOString()
        });
      }

      const outcome = customerType === 'vampire' 
        ? `Sold ${dosesToSell} doses of ${drug.strain_name} to a vampire. They paid $${earnings}. Their eyes dilated. They'll be back.`
        : `Sold ${dosesToSell} doses of ${drug.strain_name} to a human. $${earnings}. They don't know what they're getting into.`;

      setSaleOutcome(outcome);

      await base44.entities.NightLog.create({
        entry: outcome,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setSelling(false);
        setSaleOutcome('');
        setSelectedStrain(null);
      }, 4000);
    }, 2000);
  };

  const handleCreateHybrid = async () => {
    if (selectedStrains.length !== 2) return;
    
    setProducing(true);

    setTimeout(async () => {
      const strain1 = inventory.find(i => i.id === selectedStrains[0]);
      const strain2 = inventory.find(i => i.id === selectedStrains[1]);

      if (strain1.quantity < 2 || strain2.quantity < 2) {
        setProducing(false);
        return;
      }

      const name1Parts = strain1.strain_name.split(' ');
      const name2Parts = strain2.strain_name.split(' ');
      const newName = name2Parts.length > 1 
        ? `${name1Parts[0]} ${name2Parts[1]}`
        : `${name1Parts[0]} ${name2Parts[0]}`;
      const avgPotency = Math.floor((strain1.potency + strain2.potency) / 2) + Math.floor(Math.random() * 3);
      const avgAddictiveness = Math.floor((strain1.addictiveness + strain2.addictiveness) / 2);
      const quality = Math.random() > 0.7 ? 'premium' : Math.random() > 0.9 ? 'legendary' : 'standard';

      await base44.entities.BloodDrug.update(strain1.id, {
        quantity: strain1.quantity - 2
      });
      await base44.entities.BloodDrug.update(strain2.id, {
        quantity: strain2.quantity - 2
      });

      const effect1 = strain1.effects.substring(0, 50).toLowerCase();
      const effect2 = strain2.effects.substring(0, 50).toLowerCase();

      await base44.entities.BloodDrug.create({
        strain_name: newName,
        potency: Math.min(10, avgPotency),
        quantity: 3,
        price_per_dose: Math.floor((strain1.price_per_dose + strain2.price_per_dose) * 0.7),
        effects: `hybrid effects: ${effect1}... merged with ${effect2}...`,
        addictiveness: avgAddictiveness,
        is_hybrid: true,
        quality: quality,
        parent_strains: [strain1.strain_name, strain2.strain_name]
      });

      await base44.entities.NightLog.create({
        entry: `Created hybrid strain: ${newName}. Quality: ${quality}. Experimentation pays off.`,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();
      setProducing(false);
      setHybridMode(false);
      setSelectedStrains([]);
    }, 3000);
  };

  const handleServantBloodProduction = async (servant) => {
    setProducing(true);
    setServantBloodMode(false);

    setTimeout(async () => {
      const quality = Math.random() > 0.8 ? 'premium' : Math.random() > 0.95 ? 'legendary' : 'standard';
      const nameVariants = ['Essence', 'Dreams', 'Soul', 'Spirit', 'Blood', 'Whisper'];
      const strainName = `${servant.name}'s ${nameVariants[Math.floor(Math.random() * nameVariants.length)]}`;

      await base44.entities.BloodDrug.create({
        strain_name: strainName,
        potency: Math.floor(Math.random() * 5) + 5,
        quantity: 4,
        price_per_dose: Math.floor(Math.random() * 400) + 300,
        effects: `made from ${servant.name}'s blood. Their essence. Their memories. Intimate. Personal. Powerful.`,
        addictiveness: 75,
        quality: quality,
        base_servant_id: servant.id
      });

      await base44.entities.Servant.update(servant.id, {
        relationship: Math.min(100, (servant.relationship || 0) + 10)
      });

      await base44.entities.NightLog.create({
        entry: `Used ${servant.name}'s blood to create ${strainName}. Quality: ${quality}. They gave themselves to you.`,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();
      setProducing(false);
    }, 3000);
  };

  const handleCustomerReferral = async (customer) => {
    if (!customer.is_vip) return;

    const namePool = customer.customer_type === 'vampire' 
      ? ['Vladislav', 'Carmilla', 'Lestat', 'Akasha', 'Armand', 'Selene', 'Viktor', 'Lucian', 'Sonja', 'Kraven', 'Aro', 'Marcus']
      : ['Marcus', 'Elena', 'David', 'Sarah', 'Alex', 'Maya', 'Nathan', 'Rachel', 'Lucas', 'Jade', 'Chris', 'Kim'];
    
    const existingNames = customers.map(c => c.name);
    const availableNames = namePool.filter(n => !existingNames.includes(n));
    
    if (availableNames.length === 0) return;

    const newName = availableNames[Math.floor(Math.random() * availableNames.length)];

    await base44.entities.DrugCustomer.create({
      name: newName,
      customer_type: customer.customer_type,
      addiction_level: 0,
      preferred_strain: customer.preferred_strain,
      total_spent: 0,
      referred_by: customer.id
    });

    await base44.entities.NightLog.create({
      entry: `${customer.name} referred ${newName}. Your network grows.`,
      category: 'interaction',
      intensity: 'moderate'
    });

    queryClient.invalidateQueries();
  };

  const handleOverdoseEvent = async (customer) => {
    const survived = Math.random() > (customer.overdose_risk / 100);

    if (survived) {
      await base44.entities.DrugCustomer.update(customer.id, {
        overdose_risk: Math.max(0, customer.overdose_risk - 20),
        addiction_level: Math.max(0, customer.addiction_level - 10)
      });

      await base44.entities.NightLog.create({
        entry: `${customer.name} overdosed but survived. They're scared now. Less addicted.`,
        category: 'interaction',
        intensity: 'significant'
      });
    } else {
      await base44.entities.DrugCustomer.delete(customer.id);

      if (operation) {
        await base44.entities.DrugOperation.update(operation.id, {
          heat_level: Math.min(100, (operation.heat_level || 0) + 15),
          reputation: Math.max(0, (operation.reputation || 0) - 10)
        });
      }

      await base44.entities.NightLog.create({
        entry: `${customer.name} died from overdose. Heat increased. Blood on your hands.`,
        category: 'interaction',
        intensity: 'significant'
      });
    }

    queryClient.invalidateQueries();
  };

  const handleViolentCustomer = async (customer) => {
    const outcomes = [
      `${customer.name} attacked you in withdrawal. You subdued them. Barely. They're dangerous now.`,
      `${customer.name} threatened you. Desperate. Violent. You gave them a free dose to calm them.`,
      `${customer.name} went berserk. Broke things. You had to restrain them. This is getting out of hand.`
    ];

    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];

    await base44.entities.DrugCustomer.update(customer.id, {
      violence_level: Math.max(0, customer.violence_level - 20)
    });

    if (operation) {
      await base44.entities.DrugOperation.update(operation.id, {
        heat_level: Math.min(100, (operation.heat_level || 0) + 10)
      });
    }

    await base44.entities.NightLog.create({
      entry: outcome,
      category: 'interaction',
      intensity: 'significant'
    });

    queryClient.invalidateQueries();
  };

  const handleRivalEvent = async () => {
    if (!operation) return;

    const events = [
      { text: 'Rival dealer tried to steal your customers. You fought them off.', rep: 5, threat: -10 },
      { text: 'Rival contaminated your supply. Had to destroy a batch. Lost product.', rep: -10, threat: 10 },
      { text: 'You sabotaged rival operation. Their customers come to you now.', rep: 15, threat: -20 },
      { text: 'Rival dealer challenged you to territory war. Ongoing conflict.', rep: 0, threat: 20 }
    ];

    const event = events[Math.floor(Math.random() * events.length)];

    await base44.entities.DrugOperation.update(operation.id, {
      reputation: Math.max(0, Math.min(100, (operation.reputation || 0) + event.rep)),
      rival_threat: Math.max(0, Math.min(100, (operation.rival_threat || 0) + event.threat))
    });

    await base44.entities.NightLog.create({
      entry: event.text,
      category: 'interaction',
      intensity: 'significant'
    });

    queryClient.invalidateQueries();
  };

  const handleSetupDistributor = async (servant) => {
    if (!operation) return;

    await base44.entities.DrugOperation.update(operation.id, {
      servant_distributor_id: servant.id,
      automation_level: 50
    });

    await base44.entities.NightLog.create({
      entry: `${servant.name} is now your distributor. They'll handle sales. Operation automated.`,
      category: 'interaction',
      intensity: 'moderate'
    });

    queryClient.invalidateQueries();
  };

  const handleCustomOrder = async (customer) => {
    if (!customer.custom_order || !customer.is_vip) return;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a custom blood drug strain based on this request: "${customer.custom_order}". Make it creative and explicit. Include: name, potency (1-10), effects, price (200-1500), addictiveness (40-95). Format as JSON.`,
        response_json_schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            potency: { type: 'number' },
            effects: { type: 'string' },
            price: { type: 'number' },
            addictiveness: { type: 'number' }
          }
        }
      });

      await base44.entities.BloodDrug.create({
        strain_name: response.name,
        potency: response.potency,
        quantity: 1,
        price_per_dose: response.price,
        effects: response.effects,
        addictiveness: response.addictiveness,
        quality: 'premium'
      });

      await base44.entities.DrugCustomer.update(customer.id, {
        custom_order: null
      });

      await base44.entities.NightLog.create({
        entry: `Fulfilled ${customer.name}'s custom order: ${response.name}. They paid well.`,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();
    } catch (e) {
      console.error('Failed to create custom order:', e);
    }
  };

  const handleDeepConversation = async (customer) => {
    setSelectedCustomer(customer);
    
    setTimeout(async () => {
      try {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Create a deep, emotional conversation between a vampire drug dealer and their customer "${customer.name}" (${customer.customer_type}). Addiction level: ${customer.addiction_level}%. Life status: ${customer.life_status || 'stable'}. Make it raw, honest, and impactful. Include: what they say, their emotional state, and outcome. 150 words max.`,
          response_json_schema: {
            type: 'object',
            properties: {
              dialogue: { type: 'string' },
              emotional_impact: { type: 'string' },
              relationship_shift: { type: 'string', enum: ['business', 'friend', 'lover', 'dependent', 'enemy'] },
              life_change: { type: 'string', enum: ['stable', 'declining', 'rock_bottom', 'recovering'] }
            }
          }
        });

        await base44.entities.DrugCustomer.update(customer.id, {
          relationship_type: response.relationship_shift,
          life_status: response.life_change,
          friendship: Math.min(100, (customer.friendship || 0) + 20),
          backstory: response.dialogue
        });

        setChatOutcome(`${response.dialogue}\n\n${response.emotional_impact}\n\nRelationship: ${response.relationship_shift}\nLife: ${response.life_change}`);

        await base44.entities.NightLog.create({
          entry: `Deep conversation with ${customer.name}. ${response.emotional_impact}`,
          category: 'interaction',
          intensity: 'significant'
        });

        queryClient.invalidateQueries();
      } catch (e) {
        // Fallback
        const fallback = [
          `${customer.name}: "I'm losing myself. Every hit takes more of me away." They're crying. Real pain. You realize the weight of what you do.`,
          `${customer.name} confesses everything. Their family. Their job. All gone because of you. They don't blame you. That makes it worse.`,
          `Deep talk. ${customer.name} says you saved them. The drugs let them escape. You're their only friend. You don't know how to feel.`
        ];
        setChatOutcome(fallback[Math.floor(Math.random() * fallback.length)]);
        await base44.entities.DrugCustomer.update(customer.id, {
          friendship: Math.min(100, (customer.friendship || 0) + 20)
        });
        queryClient.invalidateQueries();
      }

      setTimeout(() => {
        setSelectedCustomer(null);
        setChatOutcome('');
      }, 7000);
    }, 2000);
  };

  const handleChatWithCustomer = async (customer) => {
    setSelectedCustomer(customer);

    const conversations = {
      low: [
        `You talk to ${customer.name}. Small talk. They're nervous around you. Watching you carefully.`,
        `Conversation with ${customer.name}. Surface level. They don't trust you yet. Just business.`,
        `${customer.name} keeps their distance. Polite but cautious. They're afraid of getting too close.`
      ],
      mid: [
        `${customer.name} opens up a bit. Shares stories. Laughs. You're building something here.`,
        `Good conversation with ${customer.name}. They're warming up to you. Starting to trust.`,
        `You talk for hours. ${customer.name} feels comfortable now. This could become friendship.`
      ],
      high: [
        `${customer.name} confides in you. Deep secrets. Real connection. They trust you completely.`,
        `You and ${customer.name} talk like old friends. They'd do anything for you now. Loyal.`,
        `${customer.name} says you changed their life. They're here for you, not just the drugs. True friend.`
      ]
    };

    setTimeout(async () => {
      const friendshipGain = Math.floor(Math.random() * 15) + 10;
      const newFriendship = Math.min(100, (customer.friendship || 0) + friendshipGain);
      const isVip = newFriendship >= 60;
      
      const tier = newFriendship >= 70 ? 'high' : newFriendship >= 40 ? 'mid' : 'low';
      const outcome = conversations[tier][Math.floor(Math.random() * conversations[tier].length)];

      await base44.entities.DrugCustomer.update(customer.id, {
        friendship: newFriendship,
        is_vip: isVip
      });

      if (isVip && !customer.is_vip) {
        setChatOutcome(`${outcome}\n\n🌟 ${customer.name} became a VIP regular customer! They'll buy more and stay loyal.`);
      } else {
        setChatOutcome(outcome);
      }

      await base44.entities.NightLog.create({
        entry: `You talked with ${customer.name}. Friendship growing.${isVip && !customer.is_vip ? ' They became a VIP!' : ''}`,
        category: 'interaction',
        intensity: 'moderate'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setSelectedCustomer(null);
        setChatOutcome('');
      }, 4000);
    }, 2000);
  };

  const handlePlantCrossBreed = async () => {
    if (selectedPlants.length !== 2) return;
    
    setPlantBreeding(true);

    setTimeout(async () => {
      try {
        const plant1 = bloodPlants.find(p => p.id === selectedPlants[0]);
        const plant2 = bloodPlants.find(p => p.id === selectedPlants[1]);

        const plant1Info = BLOOD_PLANTS.find(p => p.type === plant1.plant_type);
        const plant2Info = BLOOD_PLANTS.find(p => p.type === plant2.plant_type);

        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Two blood plants are being cross-bred: ${plant1Info.name} (${plant1Info.description}) and ${plant2Info.name} (${plant2Info.description}). Generate a unique hybrid plant. Create: hybrid_name (creative 2-3 word name), description (unique properties), special_trait (mutation/enhancement), potency_boost (10-40).`,
          response_json_schema: {
            type: 'object',
            properties: {
              hybrid_name: { type: 'string' },
              description: { type: 'string' },
              special_trait: { type: 'string' },
              potency_boost: { type: 'number' }
            }
          }
        });

        const avgPotency = Math.floor((plant1.potency + plant2.potency) / 2) + response.potency_boost;
        const avgGrowTime = Math.floor((plant1Info.growTime + plant2Info.growTime) / 2);

        await base44.entities.BloodPlant.delete(plant1.id);
        await base44.entities.BloodPlant.delete(plant2.id);

        await base44.entities.BloodPlant.create({
          plant_type: `hybrid_${Date.now()}`,
          growth_stage: 1,
          health: 100,
          potency: Math.min(100, avgPotency),
          planted_date: new Date().toISOString(),
          last_watered: new Date().toISOString(),
          mutation_level: 30,
          hybrid_name: response.hybrid_name,
          hybrid_description: response.description,
          special_trait: response.special_trait
        });

        await base44.entities.NightLog.create({
          entry: `Cross-bred ${plant1Info.name} with ${plant2Info.name}. Created: ${response.hybrid_name}. ${response.special_trait}`,
          category: 'interaction',
          intensity: 'significant'
        });

        if (operation) {
          await base44.entities.DrugOperation.update(operation.id, {
            research_points: Math.min(100, (operation.research_points || 0) + 20)
          });
        }

        setBreedingOutcome(`🌿 Hybrid Created: ${response.hybrid_name}\n\n${response.description}\n\n✨ Special Trait: ${response.special_trait}\n\nPotency: ${Math.min(100, avgPotency)}%`);

        queryClient.invalidateQueries();

        setTimeout(() => {
          setPlantBreeding(false);
          setSelectedPlants([]);
          setBreedingOutcome('');
        }, 6000);
      } catch (e) {
        // Fallback
        const plant1 = bloodPlants.find(p => p.id === selectedPlants[0]);
        const plant2 = bloodPlants.find(p => p.id === selectedPlants[1]);
        const plant1Info = BLOOD_PLANTS.find(p => p.type === plant1.plant_type);
        const plant2Info = BLOOD_PLANTS.find(p => p.type === plant2.plant_type);

        const hybridNames = ['Shadow Bloom', 'Crimson Vine', 'Midnight Root', 'Blood Lotus'];
        const hybridName = hybridNames[Math.floor(Math.random() * hybridNames.length)];
        const avgPotency = Math.floor((plant1.potency + plant2.potency) / 2) + 20;

        await base44.entities.BloodPlant.delete(plant1.id);
        await base44.entities.BloodPlant.delete(plant2.id);

        await base44.entities.BloodPlant.create({
          plant_type: `hybrid_${Date.now()}`,
          growth_stage: 1,
          health: 100,
          potency: Math.min(100, avgPotency),
          planted_date: new Date().toISOString(),
          last_watered: new Date().toISOString(),
          mutation_level: 30,
          hybrid_name: hybridName,
          hybrid_description: `Hybrid of ${plant1Info.name} and ${plant2Info.name}. Enhanced properties.`
        });

        setBreedingOutcome(`🌿 Hybrid Created: ${hybridName}\n\nCombines traits from both parent plants.\n\nPotency: ${Math.min(100, avgPotency)}%`);

        queryClient.invalidateQueries();

        setTimeout(() => {
          setPlantBreeding(false);
          setSelectedPlants([]);
          setBreedingOutcome('');
        }, 6000);
      }
    }, 3000);
  };

  const handleReduceHeat = async (method) => {
    if (!operation) return;

    const methods = {
      bribe: { cost: 500, reduction: 20, rep: -5, text: 'Bribed local police. Heat reduced. Corruption spreads.' },
      relocate: { cost: 1000, reduction: 40, rep: -10, text: 'Relocated lab. New location. Fresh start. Lost some territory.' },
      cleanup: { cost: 200, reduction: 10, rep: 5, text: 'Cleaned up evidence. More careful now. Slightly safer.' },
      frame: { cost: 0, reduction: 30, rep: -20, text: 'Framed a rival. Police went after them. You\'re safe for now. Ruthless.' }
    };

    const action = methods[method];
    
    await base44.entities.DrugOperation.update(operation.id, {
      heat_level: Math.max(0, (operation.heat_level || 0) - action.reduction),
      reputation: Math.max(0, Math.min(100, (operation.reputation || 0) + action.rep)),
      territory_control: method === 'relocate' ? Math.max(30, (operation.territory_control || 50) - 10) : operation.territory_control,
      moral_compass: method === 'frame' ? Math.max(0, (operation.moral_compass || 50) - 15) : operation.moral_compass
    });

    await base44.entities.NightLog.create({
      entry: action.text,
      category: 'interaction',
      intensity: 'significant'
    });

    queryClient.invalidateQueries();
  };

  const handleResearchUpgrade = async (upgrade) => {
    if (!operation) return;

    const upgrades = {
      extraction: {
        name: 'Advanced Extraction',
        cost: 30,
        desc: 'Extract more doses from blood plants',
        benefit: 'Harvesting yields +3 doses'
      },
      stealth: {
        name: 'Stealth Operations',
        cost: 40,
        desc: 'Reduce heat generation from sales',
        benefit: 'Heat gain reduced by 50%'
      },
      quality: {
        name: 'Quality Enhancement',
        cost: 50,
        desc: 'Increase potency of all strains',
        benefit: 'All drugs +1 potency'
      },
      automation: {
        name: 'Full Automation',
        cost: 60,
        desc: 'Servant distributor produces drugs',
        benefit: 'Passive drug production'
      },
      network: {
        name: 'Network Expansion',
        cost: 45,
        desc: 'Attract high-value customers',
        benefit: 'VIP customers more likely'
      }
    };

    const tech = upgrades[upgrade];
    
    if ((operation.research_points || 0) < tech.cost) return;

    setResearching(true);

    setTimeout(async () => {
      await base44.entities.DrugOperation.update(operation.id, {
        research_points: (operation.research_points || 0) - tech.cost,
        underworld_connections: [...(operation.underworld_connections || []), tech.name]
      });

      await base44.entities.NightLog.create({
        entry: `Researched: ${tech.name}. ${tech.benefit}`,
        category: 'power',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();
      setResearching(false);
    }, 2000);
  };

  const handlePoliceRaid = async () => {
    if (!operation || (operation.heat_level || 0) < 80) return;

    const outcomes = [
      { 
        text: 'POLICE RAID! They burst in. You barely escaped. Lost inventory. Heat cooled down.',
        inventoryLoss: 0.5,
        heatReduction: 60,
        repLoss: 30,
        casualties: 0
      },
      {
        text: 'POLICE RAID! Shootout. You killed two cops. Escaped but this is BAD. Manhunt incoming.',
        inventoryLoss: 0.3,
        heatReduction: 20,
        repLoss: 50,
        casualties: 2
      },
      {
        text: 'POLICE RAID! They arrested a customer. Turned informant. You need to move. NOW.',
        inventoryLoss: 0,
        heatReduction: 40,
        repLoss: 20,
        casualties: 0
      },
      {
        text: 'POLICE RAID! Your servant took the fall. Arrested. Protecting you. Loyal to the end.',
        inventoryLoss: 0.2,
        heatReduction: 70,
        repLoss: 10,
        casualties: 0
      }
    ];

    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];

    // Delete inventory based on loss percentage
    const drugsToLose = Math.floor(inventory.length * outcome.inventoryLoss);
    for (let i = 0; i < drugsToLose; i++) {
      if (inventory[i]) {
        await base44.entities.BloodDrug.delete(inventory[i].id);
      }
    }

    await base44.entities.DrugOperation.update(operation.id, {
      heat_level: Math.max(0, (operation.heat_level || 0) - outcome.heatReduction),
      reputation: Math.max(0, (operation.reputation || 0) - outcome.repLoss),
      casualties: (operation.casualties || 0) + outcome.casualties,
      lives_ruined: (operation.lives_ruined || 0) + 1
    });

    await base44.entities.NightLog.create({
      entry: outcome.text,
      category: 'interaction',
      intensity: 'significant'
    });

    queryClient.invalidateQueries();
  };

  const handleFeedSnake = async (snake, drug) => {
    if (drug.quantity === 0) return;
    
    setFeedingSnake({ snake, drug });

    setTimeout(async () => {
      // Map drugs/plants to snake abilities
      const powerMappings = {
        'Crimson Bliss': { ability: 'Blood Rage', icon: '🔥', desc: 'Temporary strength boost from blood fury' },
        'Midnight Rush': { ability: 'Time Dilation', icon: '⏰', desc: 'Slow perceived time during combat' },
        'Eternal Dream': { ability: 'Reality Warp', icon: '🌀', desc: 'Create illusions and bend reality' },
        'Bloodfire': { ability: 'Inferno Scales', icon: '🔥', desc: 'Scales burn anyone who touches them' },
        'Void Kiss': { ability: 'Void Step', icon: '⚫', desc: 'Teleport through the void instantly' },
        'crimson_bloom': { ability: 'Bloom Shield', icon: '🌸', desc: 'Protective barrier of blood petals' },
        'shadow_vine': { ability: 'Shadow Bind', icon: '🌿', desc: 'Entangle enemies with shadow vines' },
        'midnight_lotus': { ability: 'Lunar Empowerment', icon: '🌙', desc: 'Power increases at night' },
        'bloodroot': { ability: 'Root Strike', icon: '🌱', desc: 'Summon blood roots from ground' },
        'vampweed': { ability: 'Toxic Cloud', icon: '☁️', desc: 'Exhale poisonous vapor' }
      };

      const mapping = powerMappings[drug.strain_name] || powerMappings[drug.plant_type];
      const defaultPower = { ability: 'Enhanced Senses', icon: '👁️', desc: 'Heightened perception' };
      const newPower = mapping || defaultPower;

      // Check if snake already has this ability
      const hasAbility = (snake.unlocked_abilities || []).includes(newPower.ability);

      await base44.entities.BloodDrug.update(drug.id, {
        quantity: drug.quantity - 1
      });

      let outcome = '';
      let bondGain = 0;
      let powerGain = 0;

      if (!hasAbility) {
        await base44.entities.SnakeFamiliar.update(snake.id, {
          unlocked_abilities: [...(snake.unlocked_abilities || []), newPower.ability],
          power_level: Math.min(100, (snake.power_level || 0) + 15),
          bond_level: Math.min(100, (snake.bond_level || 0) + 10)
        });

        outcome = `${snake.custom_name} consumed ${drug.strain_name}. The serpent's body convulses. Eyes glow brighter. Scales shimmer with new power.\n\n${newPower.icon} NEW ABILITY UNLOCKED: ${newPower.ability}\n${newPower.desc}\n\nYour familiar has evolved.`;
        bondGain = 10;
        powerGain = 15;
      } else {
        await base44.entities.SnakeFamiliar.update(snake.id, {
          power_level: Math.min(100, (snake.power_level || 0) + 5),
          bond_level: Math.min(100, (snake.bond_level || 0) + 5)
        });

        outcome = `${snake.custom_name} consumed ${drug.strain_name}. Already has ${newPower.ability}, but the drug strengthens it. Power surges through serpent scales. Existing abilities enhanced.`;
        bondGain = 5;
        powerGain = 5;
      }

      setSnakeFeedOutcome(outcome);

      await base44.entities.NightLog.create({
        entry: `Fed ${drug.strain_name} to ${snake.custom_name}. ${hasAbility ? 'Enhanced' : 'Unlocked'} ${newPower.ability}.`,
        category: 'power',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setFeedingSnake(null);
        setSnakeFeedOutcome('');
      }, 5000);
    }, 2000);
  };

  const handleTest = async (drug) => {
    setTesting(true);
    setSelectedStrain(drug);

    const visualEffects = [
      'Colors explode. Everything bleeds into everything.',
      'You see through time. Past and future merge.',
      'Reality pixelates. You\'re inside a dream.',
      'Your blood sings. Pure energy courses through you.',
      'The walls breathe. You breathe with them.',
      'You become light. Weightless. Infinite.',
      'Fractals everywhere. Mathematical perfection.',
      'You taste sound. Hear colors. Everything is one.'
    ];

    setTimeout(async () => {
      const effect = visualEffects[Math.floor(Math.random() * visualEffects.length)];
      setTestEffects(`${drug.effects}\n\n${effect}`);

      await base44.entities.BloodDrug.update(drug.id, {
        quantity: Math.max(0, drug.quantity - 1)
      });

      await base44.entities.NightLog.create({
        entry: `You tested ${drug.strain_name}. ${effect}`,
        category: 'interaction',
        intensity: 'significant'
      });

      queryClient.invalidateQueries();

      setTimeout(() => {
        setTesting(false);
        setTestEffects('');
        setSelectedStrain(null);
      }, 6000);
    }, 2000);
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
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 touch-manipulation p-2"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Beaker className="w-8 h-8 text-red-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Crimson Bliss Lab</h2>
            <p className="text-gray-400 text-sm">Blood drugs. Addictive. Profitable.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-green-950/30 rounded-lg p-3 border border-green-800/30">
            <DollarSign className="w-5 h-5 text-green-400 mb-1" />
            <p className="text-white text-xl font-bold">${totalRevenue}</p>
            <p className="text-gray-400 text-xs">Total Revenue</p>
          </div>
          <div className="bg-purple-950/30 rounded-lg p-3 border border-purple-800/30">
            <Beaker className="w-5 h-5 text-purple-400 mb-1" />
            <p className="text-white text-xl font-bold">{totalDoses}</p>
            <p className="text-gray-400 text-xs">Doses in Stock</p>
          </div>
          <div className="bg-blue-950/30 rounded-lg p-3 border border-blue-800/30">
            <Users className="w-5 h-5 text-blue-400 mb-1" />
            <p className="text-white text-xl font-bold">{customers.length}</p>
            <p className="text-gray-400 text-xs">Customers</p>
          </div>
          <div className="bg-red-950/30 rounded-lg p-3 border border-red-800/30">
            <TrendingUp className="w-5 h-5 text-red-400 mb-1" />
            <p className="text-white text-xl font-bold">{inventory.length}</p>
            <p className="text-gray-400 text-xs">Strains</p>
          </div>
        </div>

        {/* Operation Stats */}
        {operation && (
          <div className="bg-gray-800 rounded-xl p-4 mb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <p className="text-gray-400 text-xs">Reputation</p>
                <p className="text-white font-bold">{operation.reputation || 0}%</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Heat Level</p>
                <p className={`font-bold ${(operation.heat_level || 0) > 60 ? 'text-red-400' : 'text-green-400'}`}>{operation.heat_level || 0}%</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Territory</p>
                <p className="text-white font-bold">{operation.territory_control || 50}%</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Rival Threat</p>
                <p className={`font-bold ${(operation.rival_threat || 0) > 60 ? 'text-red-400' : 'text-yellow-400'}`}>{operation.rival_threat || 0}%</p>
              </div>
            </div>
            {operation.servant_distributor_id && (
              <p className="text-purple-400 text-xs mt-2">
                🤖 {servants.find(s => s.id === operation.servant_distributor_id)?.name} running distribution
              </p>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button 
            onClick={() => setTab('produce')} 
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${tab === 'produce' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            Produce
          </button>
          <button 
            onClick={() => setTab('inventory')} 
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${tab === 'inventory' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            Inventory
          </button>
          <button 
            onClick={() => setTab('personal')} 
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${tab === 'personal' ? 'bg-pink-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            Personal Use
          </button>
          <button 
            onClick={() => setTab('customers')} 
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${tab === 'customers' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            Customers
          </button>
          <button 
            onClick={() => setTab('advanced')} 
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${tab === 'advanced' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            Advanced
          </button>
          <button 
            onClick={() => setTab('events')} 
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${tab === 'events' ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            Events
          </button>
          <button 
            onClick={() => setTab('progression')} 
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${tab === 'progression' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            Progression
          </button>
          <button 
            onClick={() => setTab('plants')} 
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${tab === 'plants' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            🌿 Plants
          </button>
          <button 
            onClick={() => setTab('snakes')} 
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${tab === 'snakes' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            🐍 Snake Powers
          </button>
          <button 
            onClick={() => setTab('research')} 
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${tab === 'research' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            🔬 Research
          </button>
          <button 
            onClick={() => setTab('heat')} 
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${tab === 'heat' ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            🚨 Heat Management
          </button>
          <button 
            onClick={() => setTab('research_tree')} 
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${tab === 'research_tree' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            🔬 Research Tree
          </button>
          <button 
            onClick={() => setTab('addiction_mgmt')} 
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${tab === 'addiction_mgmt' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            💊 Addiction
          </button>
          <button 
            onClick={() => setTab('rivals')} 
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${tab === 'rivals' ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            ⚔️ Rivals
          </button>
        </div>

        {/* Tab Content */}
        {tab === 'produce' && !producing && !hybridMode && !servantBloodMode && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-bold">Create Blood Drugs</h3>
              <div className="flex gap-2">
                <button onClick={() => setHybridMode(true)} className="text-purple-400 text-xs px-3 py-1 bg-purple-900/40 rounded-lg">Create Hybrid</button>
                <button onClick={() => setServantBloodMode(true)} className="text-red-400 text-xs px-3 py-1 bg-red-900/40 rounded-lg">Use Servant Blood</button>
              </div>
            </div>
            {BASE_STRAINS.map(strain => (
              <div key={strain.name} className="bg-gray-800 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="text-white font-bold mb-1">{strain.name}</h4>
                    <p className="text-gray-400 text-sm mb-2">{strain.effects}</p>
                    <div className="flex gap-3 text-xs">
                      <span className="text-purple-400">Potency: {strain.potency}/10</span>
                      <span className="text-red-400">Addictive: {strain.addictiveness}%</span>
                      <span className="text-green-400">${strain.price}/dose</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProduce(strain);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors touch-manipulation"
                  >
                    Produce
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {hybridMode && !producing && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-bold">Create Hybrid Strain</h3>
              <button onClick={() => { setHybridMode(false); setSelectedStrains([]); }} className="text-gray-400 text-sm">Cancel</button>
            </div>
            <p className="text-gray-400 text-sm mb-4">Select 2 strains to combine (requires 2 doses each)</p>
            {inventory.map(drug => (
              <div key={drug.id} className={`bg-gray-800 rounded-xl p-4 border-2 ${selectedStrains.includes(drug.id) ? 'border-purple-500' : 'border-transparent'}`}>
                <button
                  onClick={() => {
                    if (selectedStrains.includes(drug.id)) {
                      setSelectedStrains(selectedStrains.filter(id => id !== drug.id));
                    } else if (selectedStrains.length < 2) {
                      setSelectedStrains([...selectedStrains, drug.id]);
                    }
                  }}
                  disabled={drug.quantity < 2}
                  className="w-full text-left"
                >
                  <h4 className="text-white font-bold mb-1">{drug.strain_name}</h4>
                  <p className="text-gray-400 text-xs">Stock: {drug.quantity} | Potency: {drug.potency}</p>
                </button>
              </div>
            ))}
            <button
              onClick={handleCreateHybrid}
              disabled={selectedStrains.length !== 2}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              Create Hybrid ({selectedStrains.length}/2 selected)
            </button>
          </div>
        )}

        {servantBloodMode && !producing && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-bold">Use Servant Blood</h3>
              <button onClick={() => setServantBloodMode(false)} className="text-gray-400 text-sm">Cancel</button>
            </div>
            <p className="text-gray-400 text-sm mb-4">Create strains using your servants' blood. Intimate. Personal. Powerful.</p>
            {servants && servants.length > 0 ? (
              servants.filter(s => s.id && s.name).map(servant => (
                <button
                  key={servant.id}
                  onClick={() => handleServantBloodProduction(servant)}
                  className="w-full bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 rounded-xl p-4 text-left transition-colors"
                >
                  <h4 className="text-white font-bold mb-1">{servant.name}</h4>
                  <p className="text-gray-400 text-sm">Use their blood to create a unique strain</p>
                </button>
              ))
            ) : (
              <p className="text-gray-400 text-center py-8">No servants available</p>
            )}
          </div>
        )}

        {producing && (
          <div className="text-center py-12">
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                scale: { duration: 1, repeat: Infinity }
              }}
              className="text-6xl mb-4"
            >
              🧪
            </motion.div>
            <p className="text-gray-300">Producing {selectedStrain?.name}...</p>
            <p className="text-gray-500 text-sm mt-2">Mixing blood. Adding compounds. Creating addiction.</p>
          </div>
        )}

        {tab === 'inventory' && !selling && !testing && (
          <div className="space-y-3">
            <h3 className="text-white font-bold mb-3">Business Stock</h3>
            {inventory.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No inventory. Start producing.</p>
            ) : (
              inventory.map(drug => (
                <div key={drug.id} className="bg-gray-800 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="text-white font-bold mb-1">{drug.strain_name}</h4>
                      <p className="text-gray-400 text-sm mb-2">{drug.effects}</p>
                      <div className="flex gap-3 text-xs mb-3">
                        <span className="text-blue-400">Stock: {drug.quantity} doses</span>
                        <span className="text-green-400">${drug.price_per_dose}/dose</span>
                        <span className="text-purple-400">Potency: {drug.potency}/10</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSell(drug);
                    }}
                    disabled={drug.quantity === 0}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50 touch-manipulation"
                  >
                    Sell to Customers
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'personal' && !testing && !usingWith && (
          <div className="space-y-3">
            <h3 className="text-white font-bold mb-3">Personal Stash</h3>
            {inventory.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No drugs available. Produce some first.</p>
            ) : (
              inventory.map(drug => (
                <div key={drug.id} className="bg-gray-800 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="text-white font-bold mb-1">{drug.strain_name}</h4>
                      <p className="text-gray-400 text-sm mb-2">{drug.effects}</p>
                      <div className="flex gap-3 text-xs mb-3">
                        <span className="text-blue-400">Available: {drug.quantity} doses</span>
                        <span className="text-purple-400">Potency: {drug.potency}/10</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePersonalUse(drug);
                      }}
                      disabled={drug.quantity === 0}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50 touch-manipulation"
                    >
                      Use Solo
                    </button>
                    <div className="space-y-1">
                      {servants && servants.length > 0 ? (
                        servants.filter(s => s.id && s.name).map(servant => (
                          <button
                            key={servant.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUseWith(drug, servant);
                            }}
                            disabled={drug.quantity < 2}
                            className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50 text-sm touch-manipulation"
                          >
                            Use with {servant.name} 💕 (2 doses)
                          </button>
                        ))
                      ) : (
                        <p className="text-gray-500 text-xs text-center py-2">No servants available</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {selling && saleOutcome && (
          <div className="text-center py-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-6xl mb-4"
            >
              💰
            </motion.div>
            <p className="text-gray-300 text-lg">{saleOutcome}</p>
          </div>
        )}

        {(testing || usingWith) && (
          <div className="text-center py-12">
            <AnimatePresence>
              {!testEffects && !experienceOutcome ? (
                <motion.div
                  animate={{ 
                    scale: [1, 1.5, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  {usingWith ? '💕' : '🌀'}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.8, 1] }}
                  className="space-y-4"
                >
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute text-4xl"
                      initial={{ 
                        x: '50%',
                        y: '50%',
                        opacity: 0
                      }}
                      animate={{ 
                        x: `${Math.random() * 100}%`,
                        y: `${Math.random() * 100}%`,
                        opacity: [0, 1, 0],
                        scale: [0, 2, 0],
                        rotate: Math.random() * 360
                      }}
                      transition={{ 
                        duration: 3,
                        delay: Math.random() * 2
                      }}
                    >
                      {['✨', '🌈', '💫', '⚡', '🔥', '💕', '🌙'][Math.floor(Math.random() * 7)]}
                    </motion.div>
                  ))}
                  <motion.p 
                    className="text-purple-300 text-lg whitespace-pre-line relative z-10 px-4"
                    animate={{ 
                      textShadow: [
                        '0 0 10px rgba(168, 85, 247, 0.5)',
                        '0 0 20px rgba(168, 85, 247, 1)',
                        '0 0 10px rgba(168, 85, 247, 0.5)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {testEffects || experienceOutcome}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {tab === 'customers' && !selectedCustomer && (
          <div className="space-y-3">
            <h3 className="text-white font-bold mb-3">Your Clients</h3>
            {customers.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No customers yet. Start selling.</p>
            ) : (
              customers.map(customer => (
                <div key={customer.id} className="bg-gray-800 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-bold">{customer.name}</h4>
                        {customer.is_vip && <span className="text-xs bg-yellow-600 text-white px-2 py-0.5 rounded">VIP</span>}
                      </div>
                      <p className="text-gray-400 text-sm capitalize">{customer.customer_type} • {customer.relationship_type || 'business'}</p>
                      {customer.life_status && customer.life_status !== 'stable' && (
                        <p className={`text-xs mt-1 ${
                          customer.life_status === 'recovering' ? 'text-green-400' :
                          customer.life_status === 'declining' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          Life: {customer.life_status}
                        </p>
                      )}
                      {customer.custom_order && <p className="text-purple-400 text-xs mt-1">💎 Custom order: {customer.custom_order}</p>}
                      {customer.days_clean > 0 && <p className="text-green-400 text-xs mt-1">🌱 {customer.days_clean} days clean</p>}
                    </div>
                    <span className="text-green-400 font-bold">${customer.total_spent}</span>
                  </div>
                  <div className="flex gap-3 text-xs mb-2 flex-wrap">
                    <span className="text-purple-400">Prefers: {customer.preferred_strain}</span>
                    <span className={`${customer.addiction_level > 70 ? 'text-red-400' : 'text-yellow-400'}`}>
                      Addiction: {customer.addiction_level}%
                    </span>
                    <span className="text-blue-400">Friend: {customer.friendship || 0}%</span>
                    {(customer.overdose_risk || 0) > 50 && <span className="text-red-400">⚠️ OD Risk: {customer.overdose_risk}%</span>}
                    {(customer.violence_level || 0) > 50 && <span className="text-orange-400">⚡ Violent: {customer.violence_level}%</span>}
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                    <div 
                      style={{ width: `${customer.addiction_level}%` }}
                      className="h-2 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-full"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChatWithCustomer(customer);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors text-sm touch-manipulation"
                    >
                      Small Talk
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeepConversation(customer);
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors text-sm touch-manipulation"
                    >
                      Deep Talk
                    </button>
                    {customer.is_vip && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCustomerReferral(customer);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors text-sm touch-manipulation"
                      >
                        Get Referral
                      </button>
                    )}
                    {customer.custom_order && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCustomOrder(customer);
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors text-sm col-span-2 touch-manipulation"
                      >
                        Fulfill Custom Order
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'advanced' && (
          <div className="space-y-3">
            <h3 className="text-white font-bold mb-3">Advanced Operations</h3>
            
            {!operation ? (
              <p className="text-gray-400 text-center py-8">Loading operations...</p>
            ) : (
              <>
                <div className="bg-gray-800 rounded-xl p-4">
                  <h4 className="text-white font-bold mb-2">Automation</h4>
                  <p className="text-gray-400 text-sm mb-3">Assign a servant to handle distribution</p>
                  <div className="space-y-2">
                    {servants && servants.length > 0 ? (
                      servants.filter(s => s.id && s.name).map(servant => (
                        <button
                          key={servant.id}
                          onClick={() => handleSetupDistributor(servant)}
                          disabled={operation.servant_distributor_id === servant.id}
                          className={`w-full py-2 rounded-lg transition-colors text-sm ${
                            operation.servant_distributor_id === servant.id
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          }`}
                        >
                          {operation.servant_distributor_id === servant.id ? '✓ ' : ''}{servant.name}
                        </button>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm text-center py-2">No servants available</p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-4">
                  <h4 className="text-white font-bold mb-2">Territory Control</h4>
                  <p className="text-gray-400 text-sm mb-3">Your dominance: {operation.territory_control}%</p>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      style={{ width: `${operation.territory_control}%` }}
                      className="h-3 bg-gradient-to-r from-red-500 to-purple-500 rounded-full"
                    />
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-4">
                  <h4 className="text-white font-bold mb-2">Quality Standards</h4>
                  <p className="text-gray-400 text-sm">Hybrid strains and servant blood produce premium/legendary quality</p>
                  <div className="flex gap-2 text-xs mt-2">
                    <span className="bg-gray-700 px-2 py-1 rounded">Standard</span>
                    <span className="bg-blue-700 px-2 py-1 rounded">Premium</span>
                    <span className="bg-yellow-700 px-2 py-1 rounded">Legendary</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'progression' && (
          <div className="space-y-3">
            <h3 className="text-white font-bold mb-3">Lab Progression</h3>
            
            {operation && (
              <>
                <div className="bg-gray-800 rounded-xl p-4">
                  <h4 className="text-white font-bold mb-2">Lab Tier: {operation.lab_tier || 1}/5</h4>
                  <p className="text-gray-400 text-sm mb-3">Research: {operation.research_points || 0}/100</p>
                  <div className="w-full bg-gray-700 rounded-full h-3 mb-3">
                    <div 
                      style={{ width: `${operation.research_points || 0}%` }}
                      className="h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    />
                  </div>
                  {(operation.research_points || 0) >= 100 && (
                    <button
                      onClick={async () => {
                        await base44.entities.DrugOperation.update(operation.id, {
                          lab_tier: Math.min(5, (operation.lab_tier || 1) + 1),
                          research_points: 0
                        });
                        await base44.entities.NightLog.create({
                          entry: `Lab upgraded to tier ${(operation.lab_tier || 1) + 1}! New techniques unlocked.`,
                          category: 'interaction',
                          intensity: 'significant'
                        });
                        queryClient.invalidateQueries();
                      }}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg"
                    >
                      Upgrade Lab
                    </button>
                  )}
                </div>

                <div className="bg-gray-800 rounded-xl p-4">
                  <h4 className="text-white font-bold mb-2">Moral Compass</h4>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-red-400">Ruthless</span>
                    <span className="text-blue-400">Ethical</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                    <div 
                      style={{ width: `${operation.moral_compass || 50}%` }}
                      className="h-3 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 rounded-full"
                    />
                  </div>
                  <div className="flex gap-3 text-xs text-gray-400">
                    <span>Deaths: {operation.casualties || 0}</span>
                    <span>Lives Ruined: {operation.lives_ruined || 0}</span>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-4">
                  <h4 className="text-white font-bold mb-2">Underworld Network</h4>
                  <p className="text-gray-400 text-sm mb-2">Connections: {(operation.underworld_connections || []).length}</p>
                  {(operation.underworld_connections || []).map((contact, i) => (
                    <div key={i} className="bg-gray-700 rounded p-2 mb-1 text-sm text-gray-300">
                      {contact}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'events' && (
          <div className="space-y-3">
            <h3 className="text-white font-bold mb-3">Manage Events</h3>
            
            {operation && (operation.rival_threat || 0) > 30 && (
              <button
                onClick={handleRivalEvent}
                className="w-full bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 rounded-xl p-4 text-left transition-colors"
              >
                <h4 className="text-white font-bold mb-1">⚔️ Handle Rival Dealer</h4>
                <p className="text-gray-400 text-sm">Threat level: {operation.rival_threat}%</p>
              </button>
            )}

            {customers.filter(c => (c.overdose_risk || 0) > 60).map(customer => (
              <button
                key={customer.id}
                onClick={() => handleOverdoseEvent(customer)}
                className="w-full bg-orange-900/40 hover:bg-orange-900/60 border border-orange-500/30 rounded-xl p-4 text-left transition-colors"
              >
                <h4 className="text-white font-bold mb-1">⚠️ {customer.name} - High OD Risk</h4>
                <p className="text-gray-400 text-sm">Overdose risk: {customer.overdose_risk}%</p>
              </button>
            ))}

            {customers.filter(c => (c.violence_level || 0) > 60).map(customer => (
              <button
                key={customer.id}
                onClick={() => handleViolentCustomer(customer)}
                className="w-full bg-yellow-900/40 hover:bg-yellow-900/60 border border-yellow-500/30 rounded-xl p-4 text-left transition-colors"
              >
                <h4 className="text-white font-bold mb-1">⚡ {customer.name} - Violent</h4>
                <p className="text-gray-400 text-sm">Violence level: {customer.violence_level}%</p>
              </button>
            ))}

            {/* Show message if no events */}
            {operation && (operation.rival_threat || 0) <= 30 && 
             customers.filter(c => (c.overdose_risk || 0) > 60 || (c.violence_level || 0) > 60).length === 0 && (
              <div className="bg-gray-800 rounded-xl p-6 text-center">
                <p className="text-gray-400 mb-2">No active critical events</p>
                <p className="text-gray-500 text-sm">Events trigger when:</p>
                <ul className="text-gray-500 text-xs mt-2 space-y-1">
                  <li>• Rival Threat exceeds 30%</li>
                  <li>• Customer Overdose Risk exceeds 60%</li>
                  <li>• Customer Violence Level exceeds 60%</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {selectedCustomer && chatOutcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90"
            onClick={() => {
              setSelectedCustomer(null);
              setChatOutcome('');
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-6xl mb-4"
                >
                  💬
                </motion.div>
              </div>
              <p className="text-gray-300 text-base whitespace-pre-line leading-relaxed">{chatOutcome}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCustomer(null);
                  setChatOutcome('');
                }}
                className="w-full mt-6 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}

        {tab === 'snakes' && !feedingSnake && (
          <div className="space-y-3">
            <h3 className="text-white font-bold mb-3">🐍 Snake Power Enhancement</h3>
            <p className="text-gray-400 text-sm mb-4">Feed blood drugs or plant extracts to your snakes to unlock new abilities</p>
            
            {snakes.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No snake familiars. Adopt one first.</p>
            ) : inventory.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No drugs available. Produce some first.</p>
            ) : (
              snakes.map(snake => (
                <div key={snake.id} className="bg-gray-800 rounded-xl p-4 border-2 border-emerald-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-white font-bold">{snake.custom_name}</h4>
                      <p className="text-gray-400 text-sm capitalize">{snake.type} • Power: {snake.power_level}/100</p>
                      <p className="text-emerald-400 text-xs mt-1">Abilities: {(snake.unlocked_abilities || []).length}</p>
                    </div>
                  </div>

                  {(snake.unlocked_abilities || []).length > 0 && (
                    <div className="mb-3 flex gap-1 flex-wrap">
                      {(snake.unlocked_abilities || []).map(ability => (
                        <span key={ability} className="text-xs bg-emerald-600 text-white px-2 py-1 rounded">
                          {ability}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-gray-400 text-xs mb-2">Select drug to feed:</p>
                    {inventory.filter(d => d.quantity > 0).map(drug => (
                      <button
                        key={drug.id}
                        onClick={() => handleFeedSnake(snake, drug)}
                        className="w-full bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-lg p-3 text-left transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-white font-medium text-sm">{drug.strain_name}</p>
                            <p className="text-gray-400 text-xs">Potency: {drug.potency} • Stock: {drug.quantity}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <AnimatePresence>
          {feedingSnake && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90"
              onClick={() => {
                setFeedingSnake(null);
                setSnakeFeedOutcome('');
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 max-w-lg w-full border-2 border-emerald-500/50"
              >
                {!snakeFeedOutcome ? (
                  <div className="text-center">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.3, 1],
                        rotate: [0, 360]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-8xl mb-4"
                    >
                      🐍
                    </motion.div>
                    <p className="text-emerald-400 text-lg">Feeding snake...</p>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <div className="text-8xl mb-6">🐍✨</div>
                    <p className="text-emerald-300 text-lg whitespace-pre-line leading-relaxed">
                      {snakeFeedOutcome}
                    </p>
                    <button
                      onClick={() => {
                        setFeedingSnake(null);
                        setSnakeFeedOutcome('');
                      }}
                      className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg"
                    >
                      Close
                    </button>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {tab === 'research' && !researching && (
          <div className="space-y-3">
            <h3 className="text-white font-bold mb-3">🔬 Research & Development</h3>
            
            {operation && (
              <>
                <div className="bg-gray-800 rounded-xl p-4 mb-4">
                  <p className="text-gray-400 text-sm mb-2">Research Points: {operation.research_points || 0}</p>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      style={{ width: `${operation.research_points || 0}%` }}
                      className="h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    />
                  </div>
                  <p className="text-gray-500 text-xs mt-2">Earn research points by experimenting, harvesting plants, and creating hybrids</p>
                </div>

                {/* AI STRAIN GENERATOR - PROMINENT */}
                <div className="bg-gradient-to-r from-purple-900/60 to-pink-900/60 border-2 border-purple-500/50 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Sparkles className="w-8 h-8 text-purple-300" />
                    <div>
                      <h4 className="text-white font-bold text-lg">AI Strain Generator</h4>
                      <p className="text-purple-300 text-xs">Discover completely unique blood drugs using AI</p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      setResearching(true);
                      await generateNewStrain();
                      setResearching(false);
                    }}
                    disabled={researching}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 text-white py-4 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
                  >
                    <Sparkles className="w-6 h-6" />
                    Generate New Strain
                  </button>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => handleResearchUpgrade('extraction')}
                    disabled={(operation.research_points || 0) < 30}
                    className="w-full bg-cyan-900/40 hover:bg-cyan-900/60 disabled:bg-gray-800 border border-cyan-500/30 rounded-xl p-4 text-left disabled:opacity-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-bold mb-1">Advanced Extraction</h4>
                        <p className="text-gray-400 text-sm">Extract more doses from blood plants</p>
                        <p className="text-cyan-400 text-xs mt-1">Benefit: Harvesting yields +3 doses</p>
                      </div>
                      <span className="text-cyan-400 font-bold">30 RP</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleResearchUpgrade('stealth')}
                    disabled={(operation.research_points || 0) < 40}
                    className="w-full bg-cyan-900/40 hover:bg-cyan-900/60 disabled:bg-gray-800 border border-cyan-500/30 rounded-xl p-4 text-left disabled:opacity-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-bold mb-1">Stealth Operations</h4>
                        <p className="text-gray-400 text-sm">Reduce heat generation from sales</p>
                        <p className="text-cyan-400 text-xs mt-1">Benefit: Heat gain reduced by 50%</p>
                      </div>
                      <span className="text-cyan-400 font-bold">40 RP</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleResearchUpgrade('quality')}
                    disabled={(operation.research_points || 0) < 50}
                    className="w-full bg-cyan-900/40 hover:bg-cyan-900/60 disabled:bg-gray-800 border border-cyan-500/30 rounded-xl p-4 text-left disabled:opacity-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-bold mb-1">Quality Enhancement</h4>
                        <p className="text-gray-400 text-sm">Increase potency of all strains</p>
                        <p className="text-cyan-400 text-xs mt-1">Benefit: All drugs +1 potency</p>
                      </div>
                      <span className="text-cyan-400 font-bold">50 RP</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleResearchUpgrade('automation')}
                    disabled={(operation.research_points || 0) < 60}
                    className="w-full bg-cyan-900/40 hover:bg-cyan-900/60 disabled:bg-gray-800 border border-cyan-500/30 rounded-xl p-4 text-left disabled:opacity-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-bold mb-1">Full Automation</h4>
                        <p className="text-gray-400 text-sm">Servant distributor produces drugs automatically</p>
                        <p className="text-cyan-400 text-xs mt-1">Benefit: Passive drug production</p>
                      </div>
                      <span className="text-cyan-400 font-bold">60 RP</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleResearchUpgrade('network')}
                    disabled={(operation.research_points || 0) < 45}
                    className="w-full bg-cyan-900/40 hover:bg-cyan-900/60 disabled:bg-gray-800 border border-cyan-500/30 rounded-xl p-4 text-left disabled:opacity-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-bold mb-1">Network Expansion</h4>
                        <p className="text-gray-400 text-sm">Attract high-value customers</p>
                        <p className="text-cyan-400 text-xs mt-1">Benefit: VIP customers more likely</p>
                      </div>
                      <span className="text-cyan-400 font-bold">45 RP</span>
                    </div>
                  </button>
                </div>

                {(operation.underworld_connections || []).length > 0 && (
                  <div className="bg-gray-800 rounded-xl p-4 mt-4">
                    <h4 className="text-white font-bold mb-2">Researched Technologies</h4>
                    <div className="space-y-1">
                      {(operation.underworld_connections || []).map((tech, i) => (
                        <div key={i} className="text-cyan-400 text-sm">✓ {tech}</div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {researching && (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-6xl mb-4"
            >
              🔬
            </motion.div>
            <p className="text-cyan-300">Researching new technology...</p>
          </div>
        )}

        {tab === 'heat' && (
          <div className="space-y-3">
            <h3 className="text-white font-bold mb-3">🚨 Heat Management</h3>
            
            {operation && (
              <>
                <div className="bg-gray-800 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm">Police Heat</span>
                    <span className={`font-bold ${
                      (operation.heat_level || 0) > 80 ? 'text-red-400' :
                      (operation.heat_level || 0) > 50 ? 'text-orange-400' :
                      'text-green-400'
                    }`}>
                      {operation.heat_level || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      style={{ width: `${operation.heat_level || 0}%` }}
                      className="h-3 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-full"
                    />
                  </div>
                  {(operation.heat_level || 0) > 80 && (
                    <p className="text-red-400 text-sm mt-2 font-bold">⚠️ CRITICAL: Police raid imminent!</p>
                  )}
                  {(operation.heat_level || 0) > 50 && (operation.heat_level || 0) <= 80 && (
                    <p className="text-orange-400 text-sm mt-2">⚠️ WARNING: High police attention</p>
                  )}
                </div>

                {(operation.heat_level || 0) > 80 && (
                  <button
                    onClick={handlePoliceRaid}
                    className="w-full bg-red-900/60 border-2 border-red-500 rounded-xl p-4 text-left mb-3"
                  >
                    <h4 className="text-white font-bold mb-1">⚠️ POLICE RAID IN PROGRESS</h4>
                    <p className="text-red-300 text-sm">Click to resolve the situation</p>
                  </button>
                )}

                <div className="space-y-2">
                  <button
                    onClick={() => handleReduceHeat('cleanup')}
                    className="w-full bg-blue-900/40 hover:bg-blue-900/60 border border-blue-500/30 rounded-xl p-4 text-left"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-bold mb-1">🧹 Clean Up Evidence</h4>
                        <p className="text-gray-400 text-sm">Remove traces. Be more careful.</p>
                        <p className="text-blue-400 text-xs mt-1">-10% Heat | +5 Reputation | Cost: $200</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleReduceHeat('bribe')}
                    className="w-full bg-yellow-900/40 hover:bg-yellow-900/60 border border-yellow-500/30 rounded-xl p-4 text-left"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-bold mb-1">💰 Bribe Police</h4>
                        <p className="text-gray-400 text-sm">Pay off local cops. Corruption spreads.</p>
                        <p className="text-yellow-400 text-xs mt-1">-20% Heat | -5 Reputation | Cost: $500</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleReduceHeat('relocate')}
                    className="w-full bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-xl p-4 text-left"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-bold mb-1">🚚 Relocate Lab</h4>
                        <p className="text-gray-400 text-sm">Move to new location. Fresh start.</p>
                        <p className="text-purple-400 text-xs mt-1">-40% Heat | -10 Territory | -10 Rep | Cost: $1000</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleReduceHeat('frame')}
                    className="w-full bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 rounded-xl p-4 text-left"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-bold mb-1">🎯 Frame Rival Dealer</h4>
                        <p className="text-gray-400 text-sm">Send police after competition. Ruthless.</p>
                        <p className="text-red-400 text-xs mt-1">-30% Heat | -20 Reputation | -15 Morality | Free</p>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="bg-gray-800 rounded-xl p-4 mt-4">
                  <h4 className="text-white font-bold mb-2">Investigation Details</h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-400">Heat increases from:</p>
                    <p className="text-red-300">• Selling drugs</p>
                    <p className="text-red-300">• Customer overdoses</p>
                    <p className="text-red-300">• Violent incidents</p>
                    <p className="text-red-300">• High-profile operations</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'plants' && !plantBreeding && !breedingOutcome && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-bold">Blood Plant Garden 🌿</h3>
              {bloodPlants.length >= 2 && (
                <button 
                  onClick={() => setPlantBreeding(true)}
                  className="text-pink-400 text-xs px-3 py-1 bg-pink-900/40 rounded-lg"
                >
                  Cross-Breed
                </button>
              )}
            </div>
            
            {bloodPlants.length === 0 ? (
              <div className="space-y-3">
                <p className="text-gray-400 text-sm mb-4">Grow blood plants to create organic strains</p>
                {BLOOD_PLANTS.map(plant => (
                 <button
                   key={plant.type}
                   onClick={async (e) => {
                     e.stopPropagation();
                     await base44.entities.BloodPlant.create({
                       plant_type: plant.type,
                       growth_stage: 1,
                       health: 100,
                       potency: 50,
                       planted_date: new Date().toISOString(),
                       last_watered: new Date().toISOString()
                     });
                     await base44.entities.NightLog.create({
                       entry: `Planted ${plant.name}. Let it grow.`,
                       category: 'interaction',
                       intensity: 'moderate'
                     });
                     queryClient.invalidateQueries();
                   }}
                   className="w-full bg-green-900/40 hover:bg-green-900/60 border border-green-500/30 rounded-xl p-4 text-left touch-manipulation"
                 >
                   <h4 className="text-white font-bold mb-1">{plant.name}</h4>
                   <p className="text-gray-400 text-sm mb-2">{plant.description}</p>
                   <div className="flex gap-3 text-xs text-gray-500">
                     <span>Grow time: {plant.growTime} days</span>
                     <span>Yield: {plant.baseYield} doses</span>
                   </div>
                 </button>
                ))}
              </div>
            ) : (
              bloodPlants.map(plant => {
                const plantInfo = BLOOD_PLANTS.find(p => p.type === plant.plant_type);
                const displayName = plant.hybrid_name || plantInfo?.name || 'Unknown Plant';
                return (
                  <div key={plant.id} className="bg-gray-800 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="text-white font-bold mb-1">{displayName} 🌱</h4>
                        {plant.hybrid_description && (
                          <p className="text-pink-400 text-xs mb-1">{plant.hybrid_description}</p>
                        )}
                        {plant.special_trait && (
                          <p className="text-purple-400 text-xs mb-1">✨ {plant.special_trait}</p>
                        )}
                        <p className="text-gray-400 text-sm mb-2">Stage {plant.growth_stage}/5</p>
                        <div className="flex gap-3 text-xs mb-3">
                          <span className={`${plant.health > 70 ? 'text-green-400' : plant.health > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                            Health: {plant.health}%
                          </span>
                          <span className="text-purple-400">Potency: {plant.potency}%</span>
                          {plant.mutation_level > 0 && <span className="text-pink-400">Mutated: {plant.mutation_level}%</span>}
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                          <div 
                            style={{ width: `${(plant.growth_stage / 5) * 100}%` }}
                            className="h-2 bg-gradient-to-r from-green-500 to-purple-500 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await base44.entities.BloodPlant.update(plant.id, {
                            health: Math.min(100, plant.health + 20),
                            last_watered: new Date().toISOString()
                          });
                          queryClient.invalidateQueries();
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm touch-manipulation"
                      >
                        Water
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await base44.entities.BloodPlant.update(plant.id, {
                            health: Math.min(100, plant.health + 30),
                            potency: Math.min(100, plant.potency + 15),
                            needs_blood: false
                          });
                          queryClient.invalidateQueries();
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm touch-manipulation"
                      >
                        Feed Blood
                      </button>
                      {plant.growth_stage < 5 && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await base44.entities.BloodPlant.update(plant.id, {
                              growth_stage: plant.growth_stage + 1,
                              harvest_ready: plant.growth_stage + 1 === 5
                            });
                            queryClient.invalidateQueries();
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm touch-manipulation"
                        >
                          Advance Growth
                        </button>
                      )}
                      {plant.harvest_ready && (
                       <button
                         onClick={async (e) => {
                           e.stopPropagation();
                           const baseYield = plantInfo?.baseYield || 5;
                           const yield_ = Math.floor(Math.random() * 3) + baseYield;
                           const strainName = plant.hybrid_name ? `${plant.hybrid_name} Extract` : `${plantInfo.name} Extract`;

                           await base44.entities.BloodDrug.create({
                             strain_name: strainName,
                             potency: Math.floor(plant.potency / 10),
                             quantity: yield_,
                             price_per_dose: 150 + (plant.potency * 2),
                             effects: plant.hybrid_description || `organic ${plantInfo.name.toLowerCase()} strain. Natural. Pure. ${plant.mutation_level > 0 ? 'Mutated properties.' : ''}`,
                             addictiveness: 40 + plant.potency / 2
                           });

                           await base44.entities.BloodPlant.delete(plant.id);

                           await base44.entities.NightLog.create({
                             entry: `Harvested ${displayName}. Got ${yield_} doses of ${strainName}.`,
                             category: 'interaction',
                             intensity: 'moderate'
                           });

                           if (operation) {
                             await base44.entities.DrugOperation.update(operation.id, {
                               research_points: Math.min(100, (operation.research_points || 0) + (plant.hybrid_name ? 15 : 10))
                             });
                           }

                           queryClient.invalidateQueries();
                         }}
                         className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg text-sm col-span-2 touch-manipulation"
                       >
                         🌿 Harvest
                       </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {plantBreeding && !breedingOutcome && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-bold">Cross-Breed Plants</h3>
              <button 
                onClick={() => { setPlantBreeding(false); setSelectedPlants([]); }}
                className="text-gray-400 text-sm"
              >
                Cancel
              </button>
            </div>
            <p className="text-gray-400 text-sm mb-4">Select 2 plants to cross-breed and create a hybrid with unique properties</p>
            
            {bloodPlants.map(plant => {
              const plantInfo = BLOOD_PLANTS.find(p => p.type === plant.plant_type);
              const displayName = plant.hybrid_name || plantInfo?.name || 'Unknown Plant';
              return (
                <div 
                  key={plant.id} 
                  className={`bg-gray-800 rounded-xl p-4 border-2 ${
                    selectedPlants.includes(plant.id) ? 'border-pink-500' : 'border-transparent'
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (selectedPlants.includes(plant.id)) {
                        setSelectedPlants(selectedPlants.filter(id => id !== plant.id));
                      } else if (selectedPlants.length < 2) {
                        setSelectedPlants([...selectedPlants, plant.id]);
                      }
                    }}
                    className="w-full text-left touch-manipulation"
                  >
                    <h4 className="text-white font-bold mb-1">{displayName}</h4>
                    <p className="text-gray-400 text-xs">Potency: {plant.potency}% | Stage: {plant.growth_stage}/5</p>
                  </button>
                </div>
              );
            })}

            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlantCrossBreed();
              }}
              disabled={selectedPlants.length !== 2}
              className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-700 text-white py-3 rounded-lg transition-colors disabled:opacity-50 touch-manipulation"
            >
              Cross-Breed ({selectedPlants.length}/2 selected)
            </button>
          </div>
        )}

        {(plantBreeding || breedingOutcome) && (
          <div className="text-center py-12">
            {!breedingOutcome ? (
              <motion.div>
                <motion.div
                  animate={{ scale: [1, 1.3, 1], rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  🌿
                </motion.div>
                <p className="text-pink-400 mt-4">Cross-breeding plants...</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="text-6xl mb-4">🌿✨</div>
                <p className="text-pink-300 text-lg whitespace-pre-line px-4">{breedingOutcome}</p>
              </motion.div>
            )}
          </div>
        )}

        {tab === 'research_tree' && operation && (
          <ResearchTree operation={operation} onClose={onClose} />
        )}

        {tab === 'addiction_mgmt' && operation && (
          <AddictionManagement customers={customers} operation={operation} onClose={onClose} />
        )}

        {tab === 'rivals' && operation && (
          <RivalDealers operation={operation} vampireState={vampireState} onClose={onClose} />
        )}

        {!operation && (tab === 'research_tree' || tab === 'addiction_mgmt' || tab === 'rivals') && (
          <div className="text-center py-12">
            <p className="text-gray-400">Initializing lab operations...</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}