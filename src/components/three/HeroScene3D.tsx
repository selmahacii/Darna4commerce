'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

function useMousePosition() {
  const mouse = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return { mouse, viewport };
}

function FloatingDiamond({ position, color, speed, scale, mouse }: {
  position: [number, number, number];
  color: string;
  speed: number;
  scale: number;
  mouse: React.RefObject<{ x: number; y: number }>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    // Floating animation
    meshRef.current.position.y = position[1] + Math.sin(t * speed) * 0.3;
    meshRef.current.position.x = position[0] + Math.cos(t * speed * 0.7) * 0.2;
    meshRef.current.rotation.x = t * speed * 0.3;
    meshRef.current.rotation.z = t * speed * 0.2;

    // Mouse follow - subtle parallax
    if (mouse.current) {
      meshRef.current.position.x += mouse.current.x * 0.15 * scale;
      meshRef.current.position.y += mouse.current.y * 0.1 * scale;
      meshRef.current.rotation.y += mouse.current.x * 0.2;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.3}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <octahedronGeometry args={[1, 0]} />
        <MeshDistortMaterial
          color={color}
          roughness={0.15}
          metalness={0.85}
          distort={0.15}
          speed={2}
        />
      </mesh>
    </Float>
  );
}

function FloatingRing({ position, color, speed, scale, mouse }: {
  position: [number, number, number];
  color: string;
  speed: number;
  scale: number;
  mouse: React.RefObject<{ x: number; y: number }>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    meshRef.current.position.y = position[1] + Math.sin(t * speed + 1) * 0.25;
    meshRef.current.position.x = position[0] + Math.cos(t * speed * 0.5) * 0.15;
    meshRef.current.rotation.x = Math.PI / 4 + t * speed * 0.2;
    meshRef.current.rotation.y = t * speed * 0.3;

    if (mouse.current) {
      meshRef.current.position.x += mouse.current.x * 0.12 * scale;
      meshRef.current.position.y += mouse.current.y * 0.08 * scale;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <torusGeometry args={[1, 0.15, 16, 32]} />
      <meshStandardMaterial
        color={color}
        roughness={0.2}
        metalness={0.9}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

function FloatingSphere({ position, color, speed, scale, mouse }: {
  position: [number, number, number];
  color: string;
  speed: number;
  scale: number;
  mouse: React.RefObject<{ x: number; y: number }>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    meshRef.current.position.y = position[1] + Math.sin(t * speed + 2) * 0.35;
    meshRef.current.position.x = position[0] + Math.cos(t * speed * 0.6) * 0.2;
    meshRef.current.scale.setScalar(scale + Math.sin(t * speed * 2) * 0.05);

    if (mouse.current) {
      meshRef.current.position.x += mouse.current.x * 0.1 * scale;
      meshRef.current.position.y += mouse.current.y * 0.06 * scale;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <sphereGeometry args={[1, 32, 32]} />
        <MeshDistortMaterial
          color={color}
          roughness={0.1}
          metalness={0.95}
          distort={0.2}
          speed={3}
        />
      </mesh>
    </Float>
  );
}

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 200;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#C4A35A"
        size={0.02}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function MouseLight() {
  const lightRef = useRef<THREE.PointLight>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    if (!lightRef.current) return;
    lightRef.current.position.x = THREE.MathUtils.lerp(lightRef.current.position.x, mouse.current.x * 5, 0.05);
    lightRef.current.position.y = THREE.MathUtils.lerp(lightRef.current.position.y, mouse.current.y * 3 + 2, 0.05);
  });

  return <pointLight ref={lightRef} color="#E8A87C" intensity={1.5} distance={12} />;
}

function Scene() {
  const { mouse } = useMousePosition();

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 3]} intensity={0.8} color="#FAF7F0" />
      <directionalLight position={[-3, 2, -3]} intensity={0.3} color="#C4A35A" />
      <MouseLight />

      {/* Main floating objects */}
      <FloatingDiamond position={[3, 1, -1]} color="#C75B39" speed={0.4} scale={0.8} mouse={mouse} />
      <FloatingDiamond position={[-3.5, -0.5, -2]} color="#C4A35A" speed={0.5} scale={0.5} mouse={mouse} />
      <FloatingDiamond position={[1.5, -1.5, -1.5]} color="#8B3A1F" speed={0.35} scale={0.4} mouse={mouse} />

      <FloatingRing position={[2.5, -1, -3]} color="#C4A35A" speed={0.3} scale={0.6} mouse={mouse} />
      <FloatingRing position={[-2, 1.5, -2]} color="#C75B39" speed={0.45} scale={0.45} mouse={mouse} />

      <FloatingSphere position={[4, 2, -4]} color="#C4A35A" speed={0.25} scale={0.3} mouse={mouse} />
      <FloatingSphere position={[-4, -1, -3.5]} color="#E8A87C" speed={0.3} scale={0.25} mouse={mouse} />
      <FloatingSphere position={[0, 2.5, -5]} color="#C75B39" speed={0.2} scale={0.2} mouse={mouse} />

      <ParticleField />
    </>
  );
}

export default function HeroScene3D() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
      {/* Gradient overlays for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#2D2A26]/85 via-[#2D2A26]/50 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#2D2A26]/40 to-transparent pointer-events-none" />
    </div>
  );
}
