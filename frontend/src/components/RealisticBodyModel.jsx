import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * RealisticBodyModel
 * This is the premium 3D mannequin placeholder.
 * 
 * To upgrade this to load a hyper-realistic 3D asset (.glb), 
 * import { useGLTF } from '@react-three/drei' and map the morph targets!
 * Example:
 * const { nodes, materials } = useGLTF('/human.glb');
 * ...
 */
export default function RealisticBodyModel({ scales }) {
  const group = useRef();
  
  // Custom subtle breathing animation in 3D
  useFrame((state) => {
    if (group.current) {
      const breathe = Math.sin(state.clock.elapsedTime * 2) * 0.02;
      group.current.position.y = breathe;
      // Slight chest expansion
      group.current.children[1].scale.z = scales.torsoX + breathe * 0.5;
    }
  });

  const skinSettings = {
    color: '#e3ae78',
    roughness: 0.4,
    metalness: 0.1,
    clearcoat: 0.2
  };

  return (
    <group ref={group} dispose={null} position={[0, -1.2, 0]}>
      
      {/* Head */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <sphereGeometry args={[0.13, 64, 64]} />
        <meshPhysicalMaterial {...skinSettings} />
      </mesh>
      
      {/* Neck */}
      <mesh position={[0, 1.52, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.15, 32]} />
        <meshPhysicalMaterial {...skinSettings} />
      </mesh>

      {/* Torso & Core */}
      <mesh position={[0, 1.05, 0]} scale={[scales.torsoX, 1, scales.torsoX * 0.8]} castShadow>
        {/* Using a capsule for an organic smooth chest/waist blend */}
        <capsuleGeometry args={[0.18, 0.6, 64, 64]} />
        <meshPhysicalMaterial {...skinSettings} />
      </mesh>

      {/* Shoulders & Arms */}
      {/* Left Arm */}
      <mesh position={[-0.25 - (scales.torsoX - 1) * 0.15, 1.15, 0]} rotation={[0, 0, 0.15]} scale={[scales.armsX, 1, scales.armsX]} castShadow>
        <capsuleGeometry args={[0.065, 0.7, 32, 32]} />
        <meshPhysicalMaterial {...skinSettings} />
      </mesh>
      
      {/* Right Arm */}
      <mesh position={[0.25 + (scales.torsoX - 1) * 0.15, 1.15, 0]} rotation={[0, 0, -0.15]} scale={[scales.armsX, 1, scales.armsX]} castShadow>
        <capsuleGeometry args={[0.065, 0.7, 32, 32]} />
        <meshPhysicalMaterial {...skinSettings} />
      </mesh>

      {/* Hips / Pelvis */}
      <mesh position={[0, 0.65, 0]} scale={[scales.torsoX, 1, scales.torsoX * 0.85]} castShadow>
        <sphereGeometry args={[0.2, 64, 64]} />
        <meshPhysicalMaterial {...skinSettings} />
      </mesh>

      {/* Legs */}
      {/* Left Leg */}
      <mesh position={[-0.1 - (scales.torsoX - 1) * 0.05, 0.25, 0]} scale={[scales.legsX, 1, scales.legsX]} castShadow>
        <capsuleGeometry args={[0.08, 0.8, 32, 32]} />
        <meshPhysicalMaterial {...skinSettings} />
      </mesh>

      {/* Right Leg */}
      <mesh position={[0.1 + (scales.torsoX - 1) * 0.05, 0.25, 0]} scale={[scales.legsX, 1, scales.legsX]} castShadow>
        <capsuleGeometry args={[0.08, 0.8, 32, 32]} />
        <meshPhysicalMaterial {...skinSettings} />
      </mesh>

    </group>
  );
}
