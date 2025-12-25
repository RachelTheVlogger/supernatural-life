import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Beaker, DollarSign, Users, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const BASE_STRAINS = [
  { name: 'Crimson Bliss', potency: 1, effects: 'mild euphoria. Colors slightly brighter. Warm feeling.', price: 50, addictiveness: 30 },
  { name: 'Midnight Rush', potency: 3, effects: 'intense visuals. Time slows. Everything pulses.', price: 150, addictiveness: 50 },
  { name: 'Eternal Dream', potency: 5, effects: 'reality fractures. See through dimensions. Pure ecstasy.', price: 300, addictiveness: 70 },
  { name: 'Bloodfire', potency: 7, effects: 'your blood burns. Power surges. Primal rage mixed with bliss.', price: 500, addictiveness: 85 },
  { name: 'Void Kiss', potency: 10, effects: 'total ego death. Become the darkness itself. Transcendence.', price: 1000, addictiveness: 95 }
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
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a unique blood drug strain for a vampire drug lab. Make it creative, trippy, and explicit. Include: name (creative 2-word name), potency (1-10), effects (vivid psychedelic description), price (50-1000), addictiveness (30-95). Make it wilder than typical drugs. Format as JSON.`,
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

      const experiences = [
        `You both take ${drug.strain_name}. Colors explode. Time stops. You pull them close. Every touch is electric. You kiss. Their lips taste like eternity. Clothes disappear. Bodies merge. Reality fractures as you fuck. You've never felt anything like this.`,
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
        effects: `Hybrid effects: ${effect1}... merged with ${effect2}...`,
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
                    onClick={() => handleProduce(strain)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
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
            {servants.map(servant => (
              <button
                key={servant.id}
                onClick={() => handleServantBloodProduction(servant)}
                className="w-full bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 rounded-xl p-4 text-left transition-colors"
              >
                <h4 className="text-white font-bold mb-1">{servant.name}</h4>
                <p className="text-gray-400 text-sm">Use their blood to create a unique strain</p>
              </button>
            ))}
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
                    onClick={() => handleSell(drug)}
                    disabled={drug.quantity === 0}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
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
                      onClick={() => handlePersonalUse(drug)}
                      disabled={drug.quantity === 0}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Use Solo
                    </button>
                    <div className="space-y-1">
                      {servants.filter(s => s.id).map(servant => (
                        <button
                          key={servant.id}
                          onClick={() => handleUseWith(drug, servant)}
                          disabled={drug.quantity < 2}
                          className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50 text-sm"
                        >
                          Use with {servant.name} 💕 (2 doses)
                        </button>
                      ))}
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
                      <p className="text-gray-400 text-sm capitalize">{customer.customer_type}</p>
                      {customer.custom_order && <p className="text-purple-400 text-xs mt-1">💎 Custom order: {customer.custom_order}</p>}
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
                      onClick={() => handleChatWithCustomer(customer)}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors text-sm"
                    >
                      Talk
                    </button>
                    {customer.is_vip && (
                      <button
                        onClick={() => handleCustomerReferral(customer)}
                        className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors text-sm"
                      >
                        Get Referral
                      </button>
                    )}
                    {customer.custom_order && (
                      <button
                        onClick={() => handleCustomOrder(customer)}
                        className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors text-sm col-span-2"
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
                    {servants.map(servant => (
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
                    ))}
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

            {customers.length === 0 && (
              <p className="text-gray-400 text-center py-8">No active events. Keep selling to generate events.</p>
            )}
          </div>
        )}

        {selectedCustomer && chatOutcome && (
          <div className="text-center py-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-6xl mb-4"
            >
              💬
            </motion.div>
            <p className="text-gray-300 text-lg whitespace-pre-line">{chatOutcome}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}