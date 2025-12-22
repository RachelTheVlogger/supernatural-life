import React, { useState } from 'react';
import OrganicFlower from '@/components/garden/styles/OrganicFlower';
import MinimalistFlower from '@/components/garden/styles/MinimalistFlower';
import PixelFlower from '@/components/garden/styles/PixelFlower';
import EmojiFlower from '@/components/garden/styles/EmojiFlower';
import HandDrawnFlower from '@/components/garden/styles/HandDrawnFlower';
import ThreeDFlower from '@/components/garden/styles/ThreeDFlower';

export default function StyleComparison() {
  const [interactingIndex, setInteractingIndex] = useState(null);
  
  const sampleFlowers = [
    { seed: 12345, personality: 'familiar' },
    { seed: 67890, personality: 'poisonous' },
    { seed: 24680, personality: 'alien' }
  ];
  
  const styles = [
    { 
      name: 'Organic / Painterly',
      description: 'Soft gradients, watercolor-like, dreamy',
      Component: OrganicFlower 
    },
    { 
      name: 'Minimalist / Abstract',
      description: 'Clean shapes, geometric, modern',
      Component: MinimalistFlower 
    },
    { 
      name: 'Pixel Art',
      description: 'Retro gaming aesthetic, sharp pixels',
      Component: PixelFlower 
    },
    { 
      name: 'Emoji / Photo-based',
      description: 'Real emojis with filters, playful',
      Component: EmojiFlower 
    },
    { 
      name: 'Hand-Drawn / Sketchy',
      description: 'Imperfect lines, textured, warm',
      Component: HandDrawnFlower 
    },
    { 
      name: '3D Rendered',
      description: 'Dimensional, soft lighting, spatial',
      Component: ThreeDFlower 
    }
  ];
  
  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-light text-stone-800 mb-2 text-center">
          Flower Visual Styles
        </h1>
        <p className="text-stone-500 text-center mb-12">
          Click any flower to see interaction animation
        </p>
        
        {styles.map((style, styleIndex) => (
          <div key={style.name} className="mb-16">
            <div className="mb-6">
              <h2 className="text-xl font-medium text-stone-700 mb-1">
                {style.name}
              </h2>
              <p className="text-sm text-stone-500">
                {style.description}
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-8 max-w-4xl">
              {sampleFlowers.map((flower, flowerIndex) => {
                const uniqueIndex = styleIndex * 10 + flowerIndex;
                return (
                  <div 
                    key={flowerIndex}
                    className="relative bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    style={{ height: '280px' }}
                    onClick={() => {
                      setInteractingIndex(uniqueIndex);
                      setTimeout(() => setInteractingIndex(null), 1000);
                    }}
                  >
                    <div className="h-full">
                      <style.Component 
                        flower={flower}
                        isInteracting={interactingIndex === uniqueIndex}
                      />
                    </div>
                    <div className="absolute bottom-2 left-0 right-0 text-center">
                      <span className="text-xs px-2 py-1 rounded-full bg-stone-100 text-stone-600">
                        {flower.personality}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}