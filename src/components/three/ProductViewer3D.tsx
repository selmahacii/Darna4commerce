'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text, Float } from '@react-three/drei';
import * as THREE from 'three';

interface ProductModelProps {
  type: string;
  color: string;
  material: string;
  engraving: string;
}

function getMaterialProps(material: string) {
  switch (material) {
    case 'glossy': return { roughness: 0.1, metalness: 0.3 };
    case 'metallic': return { roughness: 0.15, metalness: 0.9 };
    case 'glass': return { roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.7 };
    default: return { roughness: 0.6, metalness: 0.1 };
  }
}

function HeadphonesModel({ color, material, engraving }: ProductModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const matProps = getMaterialProps(material);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>
      {/* Headband */}
      <mesh position={[0, 0.8, 0]}>
        <torusGeometry args={[0.5, 0.06, 16, 32, Math.PI]} />
        <meshStandardMaterial color={color} {...matProps} />
      </mesh>
      {/* Headband cushion */}
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[0.25, 0.06, 0.12]} />
        <meshStandardMaterial color="#333" roughness={0.8} />
      </mesh>
      {/* Left ear cup */}
      <group position={[-0.55, 0.3, 0]}>
        <mesh>
          <cylinderGeometry args={[0.28, 0.28, 0.15, 32]} />
          <meshStandardMaterial color={color} {...matProps} />
        </mesh>
        <mesh position={[0, 0, -0.08]}>
          <cylinderGeometry args={[0.22, 0.22, 0.02, 32]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
        </mesh>
        {/* Connector */}
        <mesh position={[0.15, 0.3, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
          <meshStandardMaterial color={color} {...matProps} />
        </mesh>
      </group>
      {/* Right ear cup */}
      <group position={[0.55, 0.3, 0]}>
        <mesh>
          <cylinderGeometry args={[0.28, 0.28, 0.15, 32]} />
          <meshStandardMaterial color={color} {...matProps} />
        </mesh>
        <mesh position={[0, 0, -0.08]}>
          <cylinderGeometry args={[0.22, 0.22, 0.02, 32]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
        </mesh>
        <mesh position={[-0.15, 0.3, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
          <meshStandardMaterial color={color} {...matProps} />
        </mesh>
      </group>
      {engraving && (
        <Text position={[0, 0.3, 0.29]} fontSize={0.08} color="#ccc">
          {engraving}
        </Text>
      )}
    </group>
  );
}

function ChairModel({ color, material, engraving }: ProductModelProps) {
  const matProps = getMaterialProps(material);

  return (
    <group position={[0, -0.5, 0]}>
      {/* Seat */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.7, 0.08, 0.65]} />
        <meshStandardMaterial color={color} {...matProps} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.85, -0.28]}>
        <boxGeometry args={[0.65, 0.7, 0.06]} />
        <meshStandardMaterial color={color} {...matProps} />
      </mesh>
      {/* Legs */}
      {[[-0.28, 0, -0.25], [0.28, 0, -0.25], [-0.28, 0, 0.25], [0.28, 0, 0.25]].map((pos, i) => (
        <mesh key={i} position={[pos[0], 0.2, pos[2]]}>
          <cylinderGeometry args={[0.025, 0.02, 0.4, 8]} />
          <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      {/* Armrests */}
      {[[-0.38, 0], [0.38, 0]].map((pos, i) => (
        <group key={i}>
          <mesh position={[pos[0], 0.55, -0.15]}>
            <boxGeometry args={[0.05, 0.3, 0.05]} />
            <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[pos[0], 0.72, -0.05]}>
            <boxGeometry args={[0.06, 0.04, 0.25]} />
            <meshStandardMaterial color={color} {...matProps} />
          </mesh>
        </group>
      ))}
      {/* Lumbar support */}
      <mesh position={[0, 0.65, -0.25]}>
        <boxGeometry args={[0.35, 0.15, 0.03]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {engraving && (
        <Text position={[0, 0.45, 0.34]} fontSize={0.06} color="#999">
          {engraving}
        </Text>
      )}
    </group>
  );
}

function WatchModel({ color, material, engraving }: ProductModelProps) {
  const matProps = getMaterialProps(material);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.4;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Watch face */}
      <mesh>
        <cylinderGeometry args={[0.35, 0.35, 0.08, 48]} />
        <meshStandardMaterial color="#111" roughness={0.1} metalness={0.5} />
      </mesh>
      {/* Bezel */}
      <mesh>
        <torusGeometry args={[0.35, 0.04, 16, 48]} />
        <meshStandardMaterial color={color} {...matProps} />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 48]} />
        <meshStandardMaterial color="#0a0a2e" emissive="#1a1a5e" emissiveIntensity={0.3} />
      </mesh>
      {/* Crown */}
      <mesh position={[0.42, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.08, 16]} />
        <meshStandardMaterial color={color} {...matProps} />
      </mesh>
      {/* Top band */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.3, 0.55, 0.06]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Bottom band */}
      <mesh position={[0, -0.55, 0]}>
        <boxGeometry args={[0.3, 0.55, 0.06]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {engraving && (
        <Text position={[0, -0.03, 0.28]} fontSize={0.07} color={color}>
          {engraving}
        </Text>
      )}
    </group>
  );
}

function LampModel({ color, material, engraving }: ProductModelProps) {
  const matProps = getMaterialProps(material);

  return (
    <group position={[0, -0.6, 0]}>
      {/* Base */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.06, 32]} />
        <meshStandardMaterial color={color} {...matProps} />
      </mesh>
      {/* Pole */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.02, 0.025, 1.3, 8]} />
        <meshStandardMaterial color={color} {...matProps} />
      </mesh>
      {/* Arm */}
      <mesh position={[0.3, 1.3, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.015, 0.02, 0.7, 8]} />
        <meshStandardMaterial color={color} {...matProps} />
      </mesh>
      {/* Shade */}
      <mesh position={[0.5, 1.5, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <coneGeometry args={[0.2, 0.25, 32, 1, true]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Light glow */}
      <mesh position={[0.5, 1.4, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#fff8e0" emissive="#fff8e0" emissiveIntensity={2} />
      </mesh>
      {/* Joint */}
      <mesh position={[0, 1.3, 0]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial color={color} {...matProps} />
      </mesh>
      {engraving && (
        <Text position={[0, 0.05, 0.32]} fontSize={0.05} color="#aaa">
          {engraving}
        </Text>
      )}
    </group>
  );
}

function BackpackModel({ color, material, engraving }: ProductModelProps) {
  const matProps = getMaterialProps(material);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.3, 0]}>
      {/* Main body */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.5, 0.65, 0.25]} />
        <meshStandardMaterial color={color} {...matProps} />
      </mesh>
      {/* Top flap */}
      <mesh position={[0, 0.65, 0.02]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.5, 0.15, 0.25]} />
        <meshStandardMaterial color={color} {...matProps} />
      </mesh>
      {/* Front pocket */}
      <mesh position={[0, 0.15, 0.14]}>
        <boxGeometry args={[0.35, 0.25, 0.04]} />
        <meshStandardMaterial color={color} roughness={matProps.roughness + 0.1} metalness={matProps.metalness} />
      </mesh>
      {/* Straps */}
      <mesh position={[-0.15, 0.5, -0.14]}>
        <boxGeometry args={[0.06, 0.5, 0.03]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0.15, 0.5, -0.14]}>
        <boxGeometry args={[0.06, 0.5, 0.03]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Handle */}
      <mesh position={[0, 0.68, -0.05]}>
        <torusGeometry args={[0.08, 0.015, 8, 16, Math.PI]} />
        <meshStandardMaterial color={color} {...matProps} />
      </mesh>
      {/* Buckle */}
      <mesh position={[0, 0.42, 0.14]}>
        <boxGeometry args={[0.06, 0.04, 0.02]} />
        <meshStandardMaterial color="#c0a060" metalness={0.8} roughness={0.2} />
      </mesh>
      {engraving && (
        <Text position={[0, 0.3, 0.14]} fontSize={0.06} color="#ddd">
          {engraving}
        </Text>
      )}
    </group>
  );
}

function SpeakerModel({ color, material, engraving }: ProductModelProps) {
  const matProps = getMaterialProps(material);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.1, 0]}>
      {/* Body */}
      <mesh>
        <cylinderGeometry args={[0.25, 0.28, 0.55, 32]} />
        <meshStandardMaterial color={color} {...matProps} />
      </mesh>
      {/* Speaker grille top */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.01, 32]} />
        <meshStandardMaterial color="#222" roughness={0.9} />
      </mesh>
      {/* Speaker ring */}
      <mesh position={[0, 0.12, 0.01]}>
        <torusGeometry args={[0.15, 0.015, 8, 32]} />
        <meshStandardMaterial color="#555" metalness={0.6} />
      </mesh>
      {/* Light ring */}
      <mesh position={[0, -0.12, 0]}>
        <torusGeometry args={[0.26, 0.01, 8, 48]} />
        <meshStandardMaterial color="#ff6b35" emissive="#ff6b35" emissiveIntensity={1.5} />
      </mesh>
      {/* Top control */}
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.01, 16]} />
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.3} />
      </mesh>
      {engraving && (
        <Text position={[0, 0, 0.3]} fontSize={0.06} color="#aaa" rotation={[0, 0, 0]}>
          {engraving}
        </Text>
      )}
    </group>
  );
}

function VaseModel({ color, material, engraving }: ProductModelProps) {
  const matProps = getMaterialProps(material);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  // Create vase profile using LatheGeometry
  const points = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.18, 0),
    new THREE.Vector2(0.22, 0.05),
    new THREE.Vector2(0.25, 0.15),
    new THREE.Vector2(0.23, 0.35),
    new THREE.Vector2(0.15, 0.55),
    new THREE.Vector2(0.1, 0.65),
    new THREE.Vector2(0.12, 0.72),
    new THREE.Vector2(0.15, 0.8),
    new THREE.Vector2(0.14, 0.85),
    new THREE.Vector2(0, 0.85),
  ];

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      <mesh>
        <latheGeometry args={[points, 32]} />
        <meshStandardMaterial color={color} {...matProps} side={THREE.DoubleSide} />
      </mesh>
      {/* Inner shadow */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.06, 32]} />
        <meshStandardMaterial color="#222" roughness={0.9} />
      </mesh>
      {engraving && (
        <Text position={[0, 0.35, 0.24]} fontSize={0.06} color="#999">
          {engraving}
        </Text>
      )}
    </group>
  );
}

function UltrabookModel({ color, material, engraving }: ProductModelProps) {
  const matProps = getMaterialProps(material);
  const [isOpen, setIsOpen] = useState(true);
  const lidRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (lidRef.current) {
      const targetAngle = isOpen ? -Math.PI / 3 : 0;
      lidRef.current.rotation.x = THREE.MathUtils.lerp(lidRef.current.rotation.x, targetAngle, 0.05);
    }
  });

  return (
    <group position={[0, -0.3, 0]} onClick={() => setIsOpen(!isOpen)}>
      {/* Base */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.8, 0.03, 0.55]} />
        <meshStandardMaterial color={color} {...matProps} />
      </mesh>
      {/* Keyboard area */}
      <mesh position={[0, 0.02, 0.02]}>
        <boxGeometry args={[0.65, 0.005, 0.35]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      {/* Trackpad */}
      <mesh position={[0, 0.02, 0.2]}>
        <boxGeometry args={[0.2, 0.005, 0.12]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Screen (lid) */}
      <group position={[0, 0.02, -0.27]}>
        <mesh ref={lidRef} position={[0, 0, 0]}>
          <boxGeometry args={[0.8, 0.55, 0.02]} />
          <meshStandardMaterial color={color} {...matProps} />
        </mesh>
        {/* Display */}
        <mesh ref={lidRef as never} position={[0, 0, 0.012]}>
          <planeGeometry args={[0.7, 0.47]} />
          <meshStandardMaterial color="#0a0a1a" emissive="#1a1a3e" emissiveIntensity={0.5} />
        </mesh>
      </group>
      {engraving && (
        <Text position={[0, 0.02, -0.1]} fontSize={0.03} color="#666" rotation={[-Math.PI / 2, 0, 0]}>
          {engraving}
        </Text>
      )}
    </group>
  );
}

function ProductScene({ type, color, material, engraving }: ProductModelProps) {
  const models: Record<string, React.FC<ProductModelProps>> = {
    headphones: HeadphonesModel,
    chair: ChairModel,
    watch: WatchModel,
    lamp: LampModel,
    backpack: BackpackModel,
    speaker: SpeakerModel,
    vase: VaseModel,
    ultrabook: UltrabookModel,
  };

  const ModelComponent = models[type] || HeadphonesModel;

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <directionalLight position={[-3, 3, -3]} intensity={0.3} />
      <pointLight position={[0, 3, 0]} intensity={0.5} color="#fff5e6" />
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.1}>
        <ModelComponent type={type} color={color} material={material} engraving={engraving} />
      </Float>
      <ContactShadows position={[0, -0.9, 0]} opacity={0.4} scale={5} blur={2.5} />
      <Environment preset="studio" />
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={1.5}
        maxDistance={5}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 1.5}
      />
    </>
  );
}

interface ProductViewer3DProps {
  productName: string;
  productType: string;
  color: string;
  material: string;
  engraving: string;
  className?: string;
}

export default function ProductViewer3D({
  productType,
  color,
  material,
  engraving,
  className = 'h-[400px] w-full',
}: ProductViewer3DProps) {
  return (
    <div className={`rounded-xl overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800 ${className}`}>
      <Canvas
        camera={{ position: [0, 0.5, 3], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={color} wireframe />
          </mesh>
        }>
          <ProductScene
            type={productType}
            color={color}
            material={material}
            engraving={engraving}
          />
        </Suspense>
      </Canvas>
      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-xs text-gray-400 pointer-events-none">
        <span>Drag to rotate</span>
        <span>Scroll to zoom</span>
      </div>
    </div>
  );
}

import { Suspense } from 'react';
