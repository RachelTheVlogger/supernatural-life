import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import GardenBackground from '@/components/garden/GardenBackground';
import FlowerInteraction from '@/components/garden/FlowerInteraction';
import NewFlowerMessage from '@/components/garden/NewFlowerMessage';
import RestingMessage from '@/components/garden/RestingMessage';

const PERSONALITY_WEIGHTS = {
  familiar: 0.6,
  poisonous: 0.25,
  alien: 0.15
};

const TRAITS_BY_PERSONALITY = {
  familiar: ['gentle', 'warm', 'responsive'],
  poisonous: ['guarded', 'patient', 'mysterious'],
  alien: ['shifting', 'glowing', 'asymmetric', 'tentacled', 'crystalline']
};

function generateFlowerData() {
  const rand = Math.random();
  let personality;
  if (rand < PERSONALITY_WEIGHTS.familiar) {
    personality = 'familiar';
  } else if (rand < PERSONALITY_WEIGHTS.familiar + PERSONALITY_WEIGHTS.poisonous) {
    personality = 'poisonous';
  } else {
    personality = 'alien';
  }
  
  return {
    personality,
    position_x: 10 + Math.random() * 80,
    position_y: 20 + Math.random() * 60,
    seed: Math.floor(Math.random() * 1000000),
    growth_stage: 0,
    interaction_count: 0,
    dormant: false
  };
}

export default function Garden() {
  const queryClient = useQueryClient();
  const [showNewFlowerMessage, setShowNewFlowerMessage] = useState(false);
  const [showRestingMessage, setShowRestingMessage] = useState(false);
  const [lastCheckedDate, setLastCheckedDate] = useState(null);
  
  // Fetch all flowers
  const { data: flowers = [], isLoading } = useQuery({
    queryKey: ['flowers'],
    queryFn: () => base44.entities.Flower.list('-created_date'),
    staleTime: 30000
  });
  
  // Mutations
  const createFlowerMutation = useMutation({
    mutationFn: (data) => base44.entities.Flower.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flowers'] });
      setShowNewFlowerMessage(true);
    }
  });
  
  const updateFlowerMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Flower.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flowers'] });
    }
  });
  
  // Check if we should spawn a new flower (once per day max)
  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('gardenLastSpawnCheck');
    
    if (storedDate !== today && !isLoading) {
      localStorage.setItem('gardenLastSpawnCheck', today);
      setLastCheckedDate(today);
      
      // Chance to spawn new flower (higher if garden is small)
      const spawnChance = flowers.length < 3 ? 0.9 : 
                          flowers.length < 8 ? 0.4 : 
                          flowers.length < 15 ? 0.2 : 0.1;
      
      if (Math.random() < spawnChance) {
        createFlowerMutation.mutate(generateFlowerData());
      } else if (Math.random() < 0.05) {
        // Very rare resting message
        setShowRestingMessage(true);
        setTimeout(() => setShowRestingMessage(false), 4000);
      }
    }
  }, [flowers.length, isLoading]);
  
  // Seed initial flowers if garden is empty
  useEffect(() => {
    if (!isLoading && flowers.length === 0) {
      // Create 2-3 starter flowers
      const starterCount = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < starterCount; i++) {
        setTimeout(() => {
          createFlowerMutation.mutate(generateFlowerData());
        }, i * 500);
      }
    }
  }, [isLoading, flowers.length]);
  
  // Handle interactions
  const handleWater = useCallback((flower) => {
    updateFlowerMutation.mutate({
      id: flower.id,
      data: {
        last_watered: new Date().toISOString(),
        interaction_count: (flower.interaction_count || 0) + 1,
        growth_stage: Math.min((flower.growth_stage || 0) + 0.5, 10),
        dormant: false
      }
    });
  }, [updateFlowerMutation]);
  
  const handleTouch = useCallback((flower) => {
    updateFlowerMutation.mutate({
      id: flower.id,
      data: {
        interaction_count: (flower.interaction_count || 0) + 1,
        growth_stage: Math.min((flower.growth_stage || 0) + 0.1, 10)
      }
    });
  }, [updateFlowerMutation]);
  
  const handleHold = useCallback((flower) => {
    updateFlowerMutation.mutate({
      id: flower.id,
      data: {
        interaction_count: (flower.interaction_count || 0) + 1,
        growth_stage: Math.min((flower.growth_stage || 0) + 0.3, 10),
        dormant: false
      }
    });
  }, [updateFlowerMutation]);
  
  // Calculate flower sizes based on screen and density
  const flowerSize = useMemo(() => {
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 400;
    const baseSize = screenWidth < 640 ? 100 : screenWidth < 1024 ? 120 : 140;
    
    // Reduce size slightly if many flowers, but never below comfortable touch size
    const densityFactor = flowers.length > 10 ? 0.9 : 1;
    return Math.max(baseSize * densityFactor, 80);
  }, [flowers.length]);
  
  // Organize flowers into shelves
  const shelvesData = useMemo(() => {
    const shelves = [[], [], [], []]; // 4 shelves
    const sortedFlowers = [...flowers].sort((a, b) => a.created_date - b.created_date);
    
    sortedFlowers.forEach((flower, i) => {
      const shelfIndex = i % 4;
      shelves[shelfIndex].push(flower);
    });
    
    return shelves;
  }, [flowers]);
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      <GardenBackground />
      
      {/* Shelves container */}
      <div className="relative min-h-screen p-4 md:p-8 flex flex-col justify-between">
        {shelvesData.map((shelfFlowers, shelfIndex) => (
          <div key={shelfIndex} className="relative">
            {/* Shelf board */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-3 rounded-sm shadow-md"
              style={{
                background: 'linear-gradient(180deg, #8b7355 0%, #6d5a45 100%)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            />
            
            {/* Plants on shelf */}
            <div className="flex flex-wrap gap-2 md:gap-6 justify-start items-end pb-3 min-h-[120px] md:min-h-[180px]">
              {shelfFlowers.map((flower, flowerIndex) => (
                <motion.div
                  key={flower.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: flowerIndex * 0.2,
                    type: 'spring'
                  }}
                >
                  <FlowerInteraction
                    flower={flower}
                    size={flowerSize}
                    onWater={handleWater}
                    onTouch={handleTouch}
                    onHold={handleHold}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Interaction hint */}
      <motion.div
        className="fixed bottom-6 left-0 right-0 flex flex-col items-center gap-1 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 3, duration: 2 }}
      >
        <p className="text-xs tracking-widest text-stone-500/60 uppercase">
          tap · hold · double-tap to water
        </p>
      </motion.div>
      
      {/* Messages */}
      <NewFlowerMessage 
        show={showNewFlowerMessage} 
        onDismiss={() => setShowNewFlowerMessage(false)} 
      />
      <RestingMessage show={showRestingMessage} />
    </div>
  );
}