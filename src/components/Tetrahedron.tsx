import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

// A regular octahedron rendered in the same chrome/glass material as the
// Borromean knot, so the Approach section visually rhymes with Core Principles.
const RADIUS = 1.4; // circumscribed-sphere radius

function Shape() {
  const group = useRef<THREE.Group>(null);

  const geometry = useMemo(() => new THREE.OctahedronGeometry(RADIUS, 0), []);

  // Slow multi-axis idle tumble; OrbitControls lets the user override by dragging.
  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.18;
    group.current.rotation.x += delta * 0.07;
  });

  return (
    <group ref={group}>
      <mesh geometry={geometry} scale={[1, 1.6, 1]}>
        <meshPhysicalMaterial
          color="#44d62c"
          transmission={1}
          thickness={0.6}
          roughness={0.05}
          ior={1.5}
          metalness={0}
        />
      </mesh>
    </group>
  );
}

function Tetrahedron() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.0], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <Shape />
      {/* Image-based lighting gives the chrome its reflections */}
      <Environment preset="city" />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
      />
    </Canvas>
  );
}

export default Tetrahedron;
