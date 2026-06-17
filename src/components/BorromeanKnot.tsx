import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Golden-ratio ellipses in mutually perpendicular planes are the classic
// realization of true Borromean rings: no two are linked, yet all three are
// collectively inseparable. Circular rings centered at the origin would just
// interpenetrate — the φ elongation is what produces the over-under weave.
const PHI = (1 + Math.sqrt(5)) / 2;
const A = 1.25;        // long semi-axis
const B = A / PHI;     // short semi-axis
const TUBE_RADIUS = 0.18;

// Exact ellipse as a parametric 3D curve (no Catmull-Rom wobble).
class EllipseCurve3 extends THREE.Curve<THREE.Vector3> {
  constructor(private long: THREE.Vector3, private short: THREE.Vector3) {
    super();
  }
  getPoint(t: number, target = new THREE.Vector3()) {
    const a = t * Math.PI * 2;
    return target
      .copy(this.long)
      .multiplyScalar(Math.cos(a))
      .addScaledVector(this.short, Math.sin(a));
  }
}

function makeEllipseGeometry(long: THREE.Vector3, short: THREE.Vector3) {
  return new THREE.TubeGeometry(new EllipseCurve3(long, short), 256, TUBE_RADIUS, 24, true);
}

function Rings() {
  const group = useRef<THREE.Group>(null);

  const geometries = useMemo(() => {
    const x = new THREE.Vector3(1, 0, 0);
    const y = new THREE.Vector3(0, 1, 0);
    const z = new THREE.Vector3(0, 0, 1);
    // Cyclic elongation X → Y → Z gives the genuine Borromean arrangement.
    return [
      makeEllipseGeometry(x.clone().multiplyScalar(A), y.clone().multiplyScalar(B)),
      makeEllipseGeometry(y.clone().multiplyScalar(A), z.clone().multiplyScalar(B)),
      makeEllipseGeometry(z.clone().multiplyScalar(A), x.clone().multiplyScalar(B)),
    ];
  }, []);

  // Slow multi-axis idle tumble; OrbitControls lets the user override by dragging.
  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.18;
    group.current.rotation.x += delta * 0.07;
  });

  return (
    <group ref={group}>
      {geometries.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshPhysicalMaterial
            color="#5b8fd6"
            transmission={1}
            thickness={0.6}
            roughness={0.05}
            ior={1.5}
            metalness={0}
          />
        </mesh>
      ))}
    </group>
  );
}

function BorromeanKnot() {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.8], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <Rings />
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

export default BorromeanKnot;
