"use client";

import { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Splat, PointerLockControls } from "@react-three/drei";
import * as THREE from "three";

interface GaussianSplatViewerProps {
  plyUrl: string;
}

// WASD movement component
function FirstPersonControls() {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const moveSpeed = 2;
  const keys = useRef({ w: false, a: false, s: false, d: false });
  
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyW") keys.current.w = true;
      if (e.code === "KeyA") keys.current.a = true;
      if (e.code === "KeyS") keys.current.s = true;
      if (e.code === "KeyD") keys.current.d = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "KeyW") keys.current.w = false;
      if (e.code === "KeyA") keys.current.a = false;
      if (e.code === "KeyS") keys.current.s = false;
      if (e.code === "KeyD") keys.current.d = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    if (!controlsRef.current?.isLocked) return;
    
    const direction = new THREE.Vector3();
    const { w, a, s, d } = keys.current;
    
    if (w) direction.z -= 1;
    if (s) direction.z += 1;
    if (a) direction.x -= 1;
    if (d) direction.x += 1;
    
    direction.normalize().multiplyScalar(moveSpeed * delta);
    direction.applyQuaternion(camera.quaternion);
    direction.y = 0; // Lock vertical movement
    
    camera.position.add(direction);
  });

  return <PointerLockControls ref={controlsRef} />;
}

export default function GaussianSplatViewer({ plyUrl }: GaussianSplatViewerProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 0], fov: 85, near: 0.01, far: 100 }}
      gl={{ antialias: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <Suspense fallback={null}>
        <Splat src={plyUrl} position={[0, 0, -2]} scale={1} />
        <FirstPersonControls />
      </Suspense>
    </Canvas>
  );
}
