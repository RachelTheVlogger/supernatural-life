import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function FlowerMesh({ seed, personality, isInteracting }) {
  const flowerRef = useRef();
  const petalsRef = useRef();
  
  const seededRandom = (s) => {
    const x = Math.sin(s * 9999) * 10000;
    return x - Math.floor(x);
  };
  
  const { color, petalCount } = useMemo(() => {
    let hue = seededRandom(seed) * 360;
    if (personality === 'poisonous') hue = 280;
    if (personality === 'alien') hue = 190;
    
    const color = new THREE.Color(`hsl(${hue}, 70%, 60%)`);
    const petalCount = 5 + Math.floor(seededRandom(seed + 1) * 7);
    
    return { color, petalCount };
  }, [seed, personality]);
  
  useFrame((state) => {
    if (flowerRef.current) {
      // Gentle sway
      flowerRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
    
    if (petalsRef.current && isInteracting) {
      petalsRef.current.rotation.y += 0.02;
    }
    
    // Alien flowers slowly rotate
    if (personality === 'alien' && petalsRef.current) {
      petalsRef.current.rotation.y += 0.005;
    }
  });
  
  return (
    <group ref={flowerRef} position={[0, -2, 0]}>
      {/* Stem */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 3, 8]} />
        <meshStandardMaterial color="#4d7c0f" roughness={0.8} />
      </mesh>
      
      {/* Leaf */}
      <mesh position={[-0.3, 1.5, 0]} rotation={[0, 0, -0.5]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#65a30d" roughness={0.7} />
      </mesh>
      
      {/* Flower head */}
      <group ref={petalsRef} position={[0, 2.5, 0]}>
        {/* Petals */}
        {Array.from({ length: petalCount }).map((_, i) => {
          const angle = (Math.PI * 2 / petalCount) * i;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * 0.4,
                0,
                Math.sin(angle) * 0.4
              ]}
              rotation={[Math.PI / 3, 0, angle]}
            >
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial 
                color={color} 
                roughness={0.6}
                metalness={personality === 'alien' ? 0.3 : 0.1}
                emissive={personality === 'alien' ? color : new THREE.Color('#000000')}
                emissiveIntensity={personality === 'alien' ? 0.2 : 0}
              />
            </mesh>
          );
        })}
        
        {/* Center */}
        <mesh>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial 
            color={new THREE.Color(`hsl(${(seededRandom(seed + 100) * 360 + 40) % 360}, 70%, 50%)`)}
            roughness={0.4}
          />
        </mesh>
        
        {/* Alien glow sphere */}
        {personality === 'alien' && (
          <mesh scale={1.8}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial 
              color={color}
              transparent
              opacity={0.2}
              emissive={color}
              emissiveIntensity={0.5}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}

export default function ThreeDFlower({ flower, isInteracting }) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, 5, -5]} intensity={0.3} />
        <FlowerMesh 
          seed={flower.seed} 
          personality={flower.personality}
          isInteracting={isInteracting}
        />
      </Canvas>
    </div>
  );
}