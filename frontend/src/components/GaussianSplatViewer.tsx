"use client";

import { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Splat } from "@react-three/drei";
import * as THREE from "three";

interface GaussianSplatViewerProps {
  plyUrl: string;
}

// Immersive controls with comfort zone
function ImmersiveControls() {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const keys = useRef({ w: false, a: false, s: false, d: false, q: false, e: false });
  const moveSpeed = 2;
  
  // Comfort zone bounds - generous but prevents total scene breakdown
  const BOUNDS = {
    minX: -1.5, maxX: 1.5,
    minY: -1, maxY: 1,
    minZ: -0.8, maxZ: 1.5,  // Can go forward a bit, but not through the scene
  };
  
  useEffect(() => {
    // Start camera slightly forward into the scene to reduce black edges
    camera.position.set(0, 0, 0.3);
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, -0.5);
    }
  }, [camera]);
  
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keys.current) keys.current[key as keyof typeof keys.current] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keys.current) keys.current[key as keyof typeof keys.current] = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    const { w, a, s, d, q, e } = keys.current;
    if (!w && !a && !s && !d && !q && !e) return;
    
    const direction = new THREE.Vector3();
    
    if (w) direction.z -= 1;
    if (s) direction.z += 1;
    if (a) direction.x -= 1;
    if (d) direction.x += 1;
    if (q) direction.y -= 1;
    if (e) direction.y += 1;
    
    direction.normalize().multiplyScalar(moveSpeed * delta);
    direction.applyQuaternion(camera.quaternion);
    
    // Apply movement
    const newPos = camera.position.clone().add(direction);
    
    // Clamp to comfort zone
    newPos.x = Math.max(BOUNDS.minX, Math.min(BOUNDS.maxX, newPos.x));
    newPos.y = Math.max(BOUNDS.minY, Math.min(BOUNDS.maxY, newPos.y));
    newPos.z = Math.max(BOUNDS.minZ, Math.min(BOUNDS.maxZ, newPos.z));
    
    const actualMove = newPos.clone().sub(camera.position);
    camera.position.copy(newPos);
    
    // Move orbit target with camera
    if (controlsRef.current?.target) {
      controlsRef.current.target.add(actualMove);
    }
  });

  return (
    <OrbitControls 
      ref={controlsRef}
      enableDamping 
      dampingFactor={0.05}
      minDistance={0}
      maxDistance={10}
    />
  );
}

export default function GaussianSplatViewer({ plyUrl }: GaussianSplatViewerProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 0.3], fov: 85, near: 0.001, far: 100 }}
      gl={{ antialias: true }}
      style={{ width: "100%", height: "100%" }}
      tabIndex={0}
    >
      <Suspense fallback={null}>
        <Splat src={plyUrl} position={[0, 0, 0]} />
        <ImmersiveControls />
      </Suspense>
    </Canvas>
  );
}
