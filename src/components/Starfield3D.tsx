"use client";

import { Canvas } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "@/lib/animation";

function Stars({ opacity, reducedMotion }: { opacity: number; reducedMotion: boolean }) {
  const ref = useRef<THREE.Points>(null!);
  const count = 500;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return pos;
  }, []);

  const colors = useMemo(() => {
    const col = new Float32Array(count * 3);
    const warmColor = new THREE.Color("#fff8e7");
    const coolColor = new THREE.Color("#aaccff");
    for (let i = 0; i < count; i++) {
      const mixed = warmColor.clone().lerp(coolColor, Math.random());
      col[i * 3] = mixed.r;
      col[i * 3 + 1] = mixed.g;
      col[i * 3 + 2] = mixed.b;
    }
    return col;
  }, []);

  useFrame((_, delta) => {
    if (!reducedMotion && ref.current) {
      ref.current.rotation.z += delta * 0.02;
    }
  });

  return (
    <Points ref={ref} positions={positions} colors={colors}>
      <PointMaterial
        transparent
        depthWrite={false}
        size={0.15}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        opacity={opacity}
      />
    </Points>
  );
}

export function Starfield3D({ enabled, opacity = 0.6 }: { enabled: boolean; opacity?: number }) {
  const reducedMotion = useReducedMotion();
  if (!enabled) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 20], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Stars opacity={opacity} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
