import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

function Bokeh() {
  const count = 60;
  const mesh = useRef<THREE.InstancedMesh>(null!);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 30 + Math.random() * 120;
      const speed = 0.005 + Math.random() / 300;
      const xFactor = -60 + Math.random() * 120;
      const yFactor = -60 + Math.random() * 120;
      const zFactor = -60 + Math.random() * 120;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor });
    }
    return temp;
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed / 1.5;
      const s = 1.2 + Math.cos(t) * 0.8;
      dummy.position.set(
        (particle.xFactor + Math.cos((t / 8) * factor) + (Math.sin(t * 1) * factor) / 8) / 8,
        (particle.yFactor + Math.sin((t / 8) * factor) + (Math.cos(t * 2) * factor) / 8) / 8,
        (particle.zFactor + Math.cos((t / 8) * factor) + (Math.sin(t * 3) * factor) / 8) / 8
      );
      dummy.scale.set(s, s, s);
      dummy.rotation.set(t, t * 1.5, t * 0.5);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} position={[0, 0, -5]}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshBasicMaterial color="#FF2D55" transparent opacity={0.12} />
    </instancedMesh>
  );
}

export default function BackgroundEffect({ active = true }: { active?: boolean }) {
  return (
    <div className="fixed inset-0 -z-10 bg-shakti-black">
      {active && (
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <ambientLight intensity={0.8} />
          <Bokeh />
        </Canvas>
      )}
      <div className="cinematic-vignette opacity-80" />
      <div className="film-grain" />
    </div>
  );
}
