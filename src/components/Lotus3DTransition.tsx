import { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { motion, AnimatePresence } from 'motion/react';
import * as THREE from 'three';
import { Compass, ChevronRight } from 'lucide-react';

// Custom lightweight GLSL Fresnel shaders for iridescent ruby-pink to gold translucent shading
const PETAL_VERTEX_SHADER = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewPosition = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const PETAL_FRAGMENT_SHADER = `
  uniform vec3 color1;
  uniform vec3 color2;
  uniform float bloomProgress;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;
  
  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    
    // High-performance smooth Fresnel effect
    float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), 3.0);
    
    // Iridescent blend of Ruby Pink (#E0115F) and Authentic Gold (#D4AF37)
    vec3 baseColor = mix(color1, color2, fresnel + 0.1);
    
    // Smooth vertical linear gradient to color the petal tip richer gold
    float tipGlow = smoothstep(0.0, 1.0, vUv.y);
    baseColor = mix(baseColor, color2, tipGlow * 0.2);
    
    // High-fidelity edge glow highlighting the luxury form factor
    float edgeGlow = pow(1.0 - max(0.0, dot(normal, viewDir)), 1.5);
    vec3 finalColor = baseColor + color2 * edgeGlow * (0.35 + 0.45 * bloomProgress);
    
    gl_FragColor = vec4(finalColor, 0.95);
  }
`;

// Volumetric custom shifting fog shader under the lotus
const FOG_VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FOG_FRAGMENT_SHADER = `
  uniform float time;
  uniform float opacity;
  varying vec2 vUv;
  
  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  
  float smoothNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = noise(i);
    float b = noise(i + vec3(1.0, 0.0, 0.0).xy);
    float c = noise(i + vec3(0.0, 1.0, 0.0).xy);
    float d = noise(i + vec3(1.0, 1.0, 0.0).xy);
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  
  void main() {
    vec2 uv = vUv * 2.0;
    uv.y -= time * 0.15;
    uv.x += sin(time * 0.1 + uv.y) * 0.3;
    
    float n1 = smoothNoise(uv * 1.5);
    float n2 = smoothNoise(uv * 3.0 - time * 0.08);
    float smoke = mix(n1, n2, 0.45);
    
    float dist = length(vUv - vec2(0.5));
    float mask = smoothstep(0.5, 0.15, dist);
    
    vec3 colPink = vec3(0.88, 0.07, 0.37); // Ruby pink
    vec3 colGold = vec3(0.83, 0.69, 0.22); // Shakti gold
    vec3 col = mix(colPink, colGold, smoke);
    
    gl_FragColor = vec4(col, smoke * mask * opacity * 0.22);
  }
`;

interface PetalProps {
  angle: number;
  radius: number;
  scaleX?: number;
  scaleY?: number;
  scaleZ?: number;
  tiltStart?: number;
  tiltEnd?: number;
  bloomProgress: number;
  color1: THREE.Color;
  color2: THREE.Color;
  phase?: number;
  sharedGeometry: THREE.BufferGeometry;
}

// Single petal instance with motion-interpolated custom shaders
function LotusPetal({ 
  angle, 
  radius, 
  scaleX = 1, 
  scaleY = 1.8, 
  scaleZ = 0.8, 
  tiltStart = 1.3, 
  tiltEnd = 0.2, 
  bloomProgress,
  color1,
  color2,
  phase = 0,
  sharedGeometry
}: PetalProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Instantiated once inside memo to prevent memory leak / compilation spikes
  const uniforms = useMemo(() => ({
    color1: { value: color1 },
    color2: { value: color2 },
    bloomProgress: { value: 0 }
  }), [color1, color2]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    
    // Non-linear blooming ease-out curve
    const easeProgress = Math.pow(bloomProgress, 1.4);
    const tilt = THREE.MathUtils.lerp(tiltStart, tiltEnd, easeProgress);
    
    // Gentle natural wave/breathing animation
    const wave = Math.sin(t * 1.5 + phase + angle) * 0.03 * (0.2 + easeProgress);
    
    // Position of petal around flower hub
    const r = radius * THREE.MathUtils.lerp(0.4, 1.15, easeProgress);
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    
    meshRef.current.position.set(x, wave * 0.5, z);
    meshRef.current.rotation.set(0, -angle + Math.PI / 2, 0);
    meshRef.current.rotateX(tilt + wave);
    
    // Dynamically scale petals up
    const s = THREE.MathUtils.lerp(0.35, 1.05, easeProgress);
    meshRef.current.scale.set(s * scaleX, s * scaleY, s * scaleZ);

    // Update uniform factor
    uniforms.bloomProgress.value = easeProgress;
  });

  return (
    <mesh ref={meshRef} geometry={sharedGeometry}>
      <shaderMaterial
        vertexShader={PETAL_VERTEX_SHADER}
        fragmentShader={PETAL_FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Volumetric custom swirling fog container
function VolumetricSmoke({ bloomProgress }: { bloomProgress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(() => ({
    time: { value: 0 },
    opacity: { value: 0 }
  }), []);

  const smokeGeometry = useMemo(() => new THREE.PlaneGeometry(8, 8), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    uniforms.time.value = t;
    uniforms.opacity.value = THREE.MathUtils.lerp(0.0, 0.85, bloomProgress);
    
    meshRef.current.position.y = -0.35 + Math.sin(t * 0.4) * 0.03;
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} geometry={smokeGeometry}>
      <shaderMaterial
        vertexShader={FOG_VERTEX_SHADER}
        fragmentShader={FOG_FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// High-performance center golden pistil and stamens
function CenterPistil({ bloomProgress }: { bloomProgress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const stamenRef = useRef<THREE.Group>(null);

  const cylinderGeom = useMemo(() => new THREE.CylinderGeometry(0.45, 0.35, 0.5, 16), []);
  const stamenGeom = useMemo(() => new THREE.CylinderGeometry(0.012, 0.008, 0.35, 8), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      const s = THREE.MathUtils.lerp(0.1, 0.85, bloomProgress);
      meshRef.current.scale.set(s, s * 0.7, s);
      meshRef.current.rotation.y = t * 0.25;
    }
    if (stamenRef.current) {
      stamenRef.current.rotation.y = -t * 0.4;
      stamenRef.current.scale.setScalar(THREE.MathUtils.lerp(0.1, 0.95, bloomProgress));
    }
  });

  const stamens = useMemo(() => {
    const arr = [];
    const count = 18; // Balanced count for peak mobile performance
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 0.52;
      arr.push({
        x: Math.cos(angle) * r,
        z: Math.sin(angle) * r
      });
    }
    return arr;
  }, []);

  return (
    <group>
      <mesh ref={meshRef} geometry={cylinderGeom}>
        <meshStandardMaterial
          color="#D4AF37"
          emissive="#7A5E12"
          emissiveIntensity={1.0}
          roughness={0.15}
          metalness={0.8}
        />
      </mesh>

      <group ref={stamenRef}>
        {stamens.map((item, idx) => (
          <mesh key={idx} position={[item.x, 0.25, item.z]} geometry={stamenGeom}>
            <meshStandardMaterial
              color="#F9E79F"
              emissive="#D4AF37"
              emissiveIntensity={0.6}
              roughness={0.2}
              metalness={0.7}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// Lightweight energy expansion disk
function EnergyLiquidDisk({ bloomProgress }: { bloomProgress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const diskGeometry = useMemo(() => new THREE.RingGeometry(1.3, 1.7, 32), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const s = THREE.MathUtils.lerp(0.1, 4.2, bloomProgress);
    meshRef.current.scale.set(s, s, s);
    meshRef.current.rotation.z = t * 0.15;
    if (meshRef.current.material) {
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity = 
        THREE.MathUtils.lerp(0.0, Math.sin(t * 2.5) * 0.12 + 0.2, bloomProgress);
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.22, 0]} geometry={diskGeometry}>
      <meshBasicMaterial
        color="#D4AF37"
        transparent
        opacity={0.25}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// GPU-Efficient Point Particles Orbiting via Rotational Transformation (0% CPU Overhead)
function OptimizedQuantumAura({ bloomProgress, count = 180 }: { bloomProgress: number; count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const pointsGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positionArray = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.8 + Math.random() * 3.2;
      const height = -1.2 + Math.random() * 3.8;
      
      positionArray[i * 3] = Math.cos(angle) * radius;
      positionArray[i * 3 + 1] = height;
      positionArray[i * 3 + 2] = Math.sin(angle) * radius;
    }
    geom.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
    return geom;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    
    // Rotate of the point cloud strictly on GPU
    pointsRef.current.rotation.y = t * 0.16;
    pointsRef.current.position.y = Math.sin(t * 0.4) * 0.15;

    // Dynamic puff-out scaling
    const scale = THREE.MathUtils.lerp(0.4, 1.25, bloomProgress);
    pointsRef.current.scale.set(scale, scale, scale);
  });

  return (
    <points ref={pointsRef} geometry={pointsGeometry}>
      <pointsMaterial
        color="#F9E79F"
        size={0.05}
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Energetic high-fashion golden-to-pink 3D particle burst
function EnergyParticleBurst({ active }: { active: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 280; // High-density premium look but fast

  // Keep track of velocities and times for each particle
  const particles = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      // Golden ratio or spherical distribution of directions
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      const speed = 2.0 + Math.random() * 6.0; // Dynamic high-speed burst
      
      data.push({
        dirX: Math.sin(phi) * Math.cos(theta),
        dirY: Math.sin(phi) * Math.sin(theta) * 0.4 + 0.3, // gently tilted upwards like a fountain
        dirZ: Math.cos(phi),
        speed,
        decay: 0.92 + Math.random() * 0.05 // elegant deceleration drag coefficient
      });
    }
    return data;
  }, []);

  const geom = useMemo(() => {
    const buffer = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    // Initial position centered at lotus hub
    for (let i = 0; i < count * 3; i++) {
      positions[i] = 0;
    }
    
    buffer.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    buffer.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return buffer;
  }, []);

  // Use a ref to track burst duration
  const burstTimeRef = useRef(0);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    if (!active) {
      // Hidden or static at start
      burstTimeRef.current = 0;
      const posAttr = geom.attributes.position as THREE.BufferAttribute;
      const colAttr = geom.attributes.color as THREE.BufferAttribute;
      for (let i = 0; i < count; i++) {
        posAttr.setXYZ(i, 0, 0, 0);
        colAttr.setXYZ(i, 0, 0, 0);
      }
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
      if (pointsRef.current.material) {
        (pointsRef.current.material as THREE.PointsMaterial).opacity = 0;
      }
      return;
    }

    // Accumulate time when active
    burstTimeRef.current += delta;
    const t = burstTimeRef.current;
    
    const posAttr = geom.attributes.position as THREE.BufferAttribute;
    const colAttr = geom.attributes.color as THREE.BufferAttribute;
    
    // Elite gold to ruby pink colors
    const colorGold = new THREE.Color("#F9E79F");
    const colorPink = new THREE.Color("#E0115F");
    const colorWhite = new THREE.Color("#FFFFFF");

    for (let i = 0; i < count; i++) {
      const p = particles[i];
      
      // Apply beautiful exponential friction decay to the burst
      const currentSpeed = p.speed * Math.pow(p.decay, t * 45);
      
      let x = posAttr.getX(i) + p.dirX * currentSpeed * delta * 2.5;
      let y = posAttr.getY(i) + p.dirY * currentSpeed * delta * 2.5;
      let z = posAttr.getZ(i) + p.dirZ * currentSpeed * delta * 2.5;
      
      // Add a subtle swirling cosmic twist
      const swirlFactor = 1.2 / (0.1 + t);
      const angle = swirlFactor * delta;
      const rotatedX = x * Math.cos(angle) - z * Math.sin(angle);
      const rotatedZ = x * Math.sin(angle) + z * Math.cos(angle);
      x = rotatedX;
      z = rotatedZ;

      posAttr.setXYZ(i, x, y, z);

      // Interpolate colors: White -> Gold -> Ruby Pink -> Deep Magenta
      const interpolationFactor = Math.min(t * 1.8, 1);
      const finalCol = new THREE.Color();
      if (interpolationFactor < 0.25) {
        finalCol.lerpColors(colorWhite, colorGold, interpolationFactor / 0.25);
      } else {
        finalCol.lerpColors(colorGold, colorPink, (interpolationFactor - 0.25) / 0.75);
      }

      colAttr.setXYZ(i, finalCol.r, finalCol.g, finalCol.b);
    }
    
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
    
    if (pointsRef.current.material) {
      // Graceful fadeout over lifetime
      const opacity = Math.max(0, 1 - (t / 1.4));
      (pointsRef.current.material as THREE.PointsMaterial).opacity = opacity * 0.95;
    }
    
    // Scale up slightly over time
    pointsRef.current.scale.setScalar(1 + t * 0.4);
  });

  return (
    <points ref={pointsRef} geometry={geom}>
      <pointsMaterial
        size={0.075}
        vertexColors
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Camera Sweep rig
function CameraRigAndLights({ bloomProgress }: { bloomProgress: number }) {
  const { camera } = useThree();
  const spotlightRef = useRef<THREE.SpotLight>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Continuous 120fps sweep vector math
    const angle = t * 0.12 + (3.2 * (1 - bloomProgress));
    const distance = THREE.MathUtils.lerp(6.5, 3.4, bloomProgress);
    const height = THREE.MathUtils.lerp(3.8, 1.35, bloomProgress);
    
    camera.position.set(Math.cos(angle) * distance, height, Math.sin(angle) * distance);
    camera.lookAt(0, 0.1, 0);

    if (spotlightRef.current) {
      spotlightRef.current.position.set(
        Math.cos(-t * 0.4) * 5,
        4.5,
        Math.sin(-t * 0.4) * 5
      );
    }
  });

  return (
    <group>
      <ambientLight intensity={0.45} />
      <spotLight
        ref={spotlightRef}
        intensity={6.0}
        angle={0.5}
        penumbra={0.9}
        color="#F9E79F"
      />
      <pointLight position={[0, 1.2, 0]} intensity={3.5} distance={8} color="#E0115F" />
      <directionalLight position={[-3, 2, -3]} intensity={1.5} color="#D4AF37" />
    </group>
  );
}

interface Lotus3DTransitionProps {
  onBloomComplete: () => void;
  onTransitionEnd: () => void;
  destinationName: string;
}

export default function Lotus3DTransition({ onBloomComplete, onTransitionEnd, destinationName }: Lotus3DTransitionProps) {
  const [bloomProgress, setBloomProgress] = useState(0);
  const [phase, setPhase] = useState<'bloom' | 'whiteout' | 'reveal' | 'fading'>('bloom');

  // Shared geometry declared once inside parent hook in a memoized space
  // Completely eliminates instancing stutter or garbage collection drop!
  const sharedPetalGeometry = useMemo(() => {
    // Width = 1, Height = 1. Base is at Y = 0, Tip is at Y = 1.
    const geom = new THREE.PlaneGeometry(1, 1, 30, 30);
    const pos = geom.attributes.position;
    
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i); // Originally -0.5 to 0.5
      let y = pos.getY(i); // Originally -0.5 to 0.5
      
      // Shift Y to range from 0 (base) to 1 (tip)
      const t = y + 0.5; 
      
      // Real-world organic lotus petal width envelope equation:
      // Tapered at base, bulging in the middle-lower half (t = 0.45),
      // and gently tapering to a sharp, elegant tip (t = 1.0)
      let widthFactor = 0.0;
      if (t < 0.2) {
        // Smooth transition from base width
        widthFactor = 0.1 + 0.9 * (t / 0.2);
      } else {
        // Tapers down beautifully to 0 at t = 1
        widthFactor = Math.sin(t * Math.PI) * (1.1 - 0.25 * (t - 0.2));
      }
      
      x = x * widthFactor * 1.1; // scale width
      
      // Elegant spoon/cup depth (transverse curve along X axis)
      const cupStrength = Math.sin(t * Math.PI) * 0.28;
      const normalizedX = x / (widthFactor * 0.5 + 0.0001);
      const zCup = -cupStrength * (1.0 - Math.pow(normalizedX, 2));
      
      // Double-curved spine profile typical of realistic lotus petals (S-curve profile)
      // Bends upward-inward near base, flares outwards beautifully at the tip
      const zSpine = -0.15 * Math.sin(t * Math.PI * 0.85) + 0.08 * Math.pow(t, 2.5);
      
      pos.setX(i, x);
      pos.setY(i, t); // Put shifted Y (0 to 1) back
      pos.setZ(i, zCup + zSpine);
    }
    
    geom.computeVertexNormals();
    return geom;
  }, []);

  // Shared THREE Color declarations
  const pinkColor = useMemo(() => new THREE.Color("#E0115F"), []);
  const goldColor = useMemo(() => new THREE.Color("#D4AF37"), []);

  // Layout distribution values of dense lotus petals
  const outerPetals = useMemo(() => {
    const count = 12;
    return Array.from({ length: count }).map((_, i) => ({
      angle: (i / count) * Math.PI * 2,
      phase: i * 0.12
    }));
  }, []);

  const middlePetals = useMemo(() => {
    const count = 10;
    return Array.from({ length: count }).map((_, i) => ({
      angle: ((i + 0.5) / count) * Math.PI * 2,
      phase: i * 0.15 + 0.8
    }));
  }, []);

  const innerPetals = useMemo(() => {
    const count = 8;
    return Array.from({ length: count }).map((_, i) => ({
      angle: (i / count) * Math.PI * 2,
      phase: i * 0.2 + 1.5
    }));
  }, []);

  const bloomCompleteRef = useRef(onBloomComplete);
  const transitionEndRef = useRef(onTransitionEnd);

  // Keep references updated but separate from the animation loop
  useEffect(() => {
    bloomCompleteRef.current = onBloomComplete;
  }, [onBloomComplete]);

  useEffect(() => {
    transitionEndRef.current = onTransitionEnd;
  }, [onTransitionEnd]);

  useEffect(() => {
    let animationFrameId: number;
    let startTimestamp: number | null = null;
    const duration = 2200; // Accelerated organic speed for higher snap feeling

    const animateBloom = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      
      // Decelerating quintic ease-out curve for luxury dynamic feel
      const ease = 1 - Math.pow(1 - progress, 4);
      setBloomProgress(ease);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateBloom);
      } else {
        setPhase('whiteout');
        setTimeout(() => {
          bloomCompleteRef.current();
          setPhase('reveal');
          setTimeout(() => {
            setPhase('fading');
            transitionEndRef.current();
          }, 600);
        }, 500);
      }
    };

    animationFrameId = requestAnimationFrame(animateBloom);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []); // Run precisely once per mount!

  if (phase === 'fading') return null;

  return (
    <div className="fixed inset-0 z-[1000] overflow-hidden pointer-events-none">
      {/* Background blackout card */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'bloom' || phase === 'whiteout' ? 1 : 0 }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0 bg-[#040103] mix-blend-normal z-10 pointer-events-auto"
      />

      {/* Cybernetic HUD layout overlays */}
      <AnimatePresence>
        {phase === 'bloom' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col justify-between p-12 select-none"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[7px] uppercase tracking-[0.5em] text-shakti-gold/40 font-mono">PORTAL VECTOR</span>
                <h4 className="text-[10px] uppercase tracking-[0.3em] text-white/70 font-black flex items-center gap-2">
                  <Compass className="w-3 h-3 text-shakti-gold animate-spin" />
                  STABLE WARP STREAM ACTIVE
                </h4>
              </div>
              <div className="text-right font-mono text-[8px] text-shakti-gold/40 tracking-widest">
                FPS_PULSE: 120HZ
              </div>
            </div>

            {/* Destination Panel */}
            <div className="flex flex-col items-center justify-center space-y-2 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-[1px] bg-gradient-to-r from-transparent via-shakti-gold/30 to-transparent animate-pulse" />
              <div className="text-[8px] uppercase tracking-[0.6em] text-shakti-gold/70 font-black italic">
                ALIGNING MATRIX REVEAL
              </div>
              <h2 className="font-serif text-3xl md:text-5xl tracking-[0.15em] italic uppercase gold-text select-none text-center">
                {destinationName}
              </h2>
              <div className="flex items-center gap-1.5 text-[8px] tracking-[0.3em] font-mono text-white/30">
                AURA RATIO <ChevronRight className="w-2.5 h-2.5 text-shakti-gold" /> {(bloomProgress * 100).toFixed(0)}%
              </div>
            </div>

            <div className="flex justify-between items-end">
              <span className="text-[7px] tracking-[0.4em] text-white/20 font-bold">COUTURE PLATFORM ENGINE</span>
              <span className="text-[7px] tracking-[0.4em] text-white/20 font-bold">ZERO LATENCY PRELOAD</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* R3F WebGL Elements */}
      <div className="absolute inset-0 z-15 w-full h-full pointer-events-auto">
        <Canvas 
          gl={{ antialias: false, powerPreference: "high-performance", depth: true }} 
          camera={{ position: [0, 2, 5.5], fov: 45 }}
        >
          <color attach="background" args={['#040103']} />
          <fog attach="fog" args={['#040103', 1, 7.5]} />

          <CameraRigAndLights bloomProgress={bloomProgress} />

          <group position={[0, -0.4, 0]}>
            {/* Shifting background smoke fog with custom fragment shaders */}
            <VolumetricSmoke bloomProgress={bloomProgress} />

            {/* Expansive Energy wave disk */}
            <EnergyLiquidDisk bloomProgress={bloomProgress} />

            {/* 0% CPU heavy load particle swirler */}
            <OptimizedQuantumAura count={180} bloomProgress={bloomProgress} />

            {/* Energetic high-fashion golden-to-pink particle burst layer */}
            <EnergyParticleBurst active={bloomProgress > 0.88 || phase === 'whiteout' || phase === 'reveal'} />

            {/* Ring 1 - Outer Ruby Lacquer group */}
            {outerPetals.map((petal, i) => (
              <LotusPetal
                key={`outer-${i}`}
                angle={petal.angle}
                radius={2.0}
                scaleX={1.35}
                scaleY={2.1}
                scaleZ={1.15}
                tiltStart={1.4}
                tiltEnd={0.12}
                bloomProgress={bloomProgress}
                color1={pinkColor}
                color2={goldColor}
                phase={petal.phase}
                sharedGeometry={sharedPetalGeometry}
              />
            ))}

            {/* Ring 2 - Mid Gold-Pink transition group */}
            {middlePetals.map((petal, i) => (
              <LotusPetal
                key={`middle-${i}`}
                angle={petal.angle}
                radius={1.35}
                scaleX={1.15}
                scaleY={1.9}
                scaleZ={0.95}
                tiltStart={1.2}
                tiltEnd={0.25}
                bloomProgress={bloomProgress}
                color1={pinkColor}
                color2={goldColor}
                phase={petal.phase}
                sharedGeometry={sharedPetalGeometry}
              />
            ))}

            {/* Ring 3 - Inner Bright Gold core */}
            {innerPetals.map((petal, i) => (
              <LotusPetal
                key={`inner-${i}`}
                angle={petal.angle}
                radius={0.68}
                scaleX={0.88}
                scaleY={1.5}
                scaleZ={0.78}
                tiltStart={0.9}
                tiltEnd={0.4}
                bloomProgress={bloomProgress}
                color1={goldColor}
                color2={pinkColor}
                phase={petal.phase}
                sharedGeometry={sharedPetalGeometry}
              />
            ))}

            <CenterPistil bloomProgress={bloomProgress} />
          </group>
        </Canvas>
      </div>

      {/* High-speed Whiteout soundwave warp circle card stack */}
      <AnimatePresence>
        {phase === 'whiteout' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 z-30 bg-gradient-to-tr from-[#FFF0F5] via-[#D4AF37] to-white mix-blend-screen flex items-center justify-center p-8 text-center"
          >
            <motion.div 
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 3.2, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute w-80 h-80 border-[3px] border-white rounded-full"
            />
            <motion.div 
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 4.8, opacity: 0 }}
              transition={{ duration: 1.0, delay: 0.08, ease: "easeOut" }}
              className="absolute w-80 h-80 border-[1px] border-shakti-gold/40 rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Blend mask */}
      <AnimatePresence>
        {phase === 'reveal' && (
          <motion.div 
            initial={{ backdropFilter: 'blur(30px) saturate(0%)', opacity: 1 }}
            animate={{ backdropFilter: 'blur(0px) saturate(100%)', opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 z-40 bg-shakti-black p-0 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
