"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls, Splat } from "@react-three/drei";
import * as THREE from "three";

interface GaussianSplatViewerProps {
  plyUrl: string;
}

// Movement limits (camera cage - 2m radius)
const MOVEMENT_BOUNDS = {
  minX: -2,
  maxX: 2,
  minZ: -1,
  maxZ: 2,
  lockedY: 0,
};

// Movement speed
const MOVE_SPEED = 2;

export default function GaussianSplatViewer({ plyUrl }: GaussianSplatViewerProps) {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  
  // Track pressed keys
  const keysRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  // Direction vectors
  const direction = useMemo(() => new THREE.Vector3(), []);
  const frontVector = useMemo(() => new THREE.Vector3(), []);
  const sideVector = useMemo(() => new THREE.Vector3(), []);

  // Set initial camera position
  useEffect(() => {
    camera.position.set(0, 0, 1.5);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          keysRef.current.forward = true;
          break;
        case "KeyS":
        case "ArrowDown":
          keysRef.current.backward = true;
          break;
        case "KeyA":
        case "ArrowLeft":
          keysRef.current.left = true;
          break;
        case "KeyD":
        case "ArrowRight":
          keysRef.current.right = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          keysRef.current.forward = false;
          break;
        case "KeyS":
        case "ArrowDown":
          keysRef.current.backward = false;
          break;
        case "KeyA":
        case "ArrowLeft":
          keysRef.current.left = false;
          break;
        case "KeyD":
        case "ArrowRight":
          keysRef.current.right = false;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Frame update for movement
  useFrame((_, delta) => {
    if (!controlsRef.current?.isLocked) return;

    const keys = keysRef.current;

    frontVector.set(0, 0, Number(keys.backward) - Number(keys.forward));
    sideVector.set(Number(keys.left) - Number(keys.right), 0, 0);

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(MOVE_SPEED * delta);

    const euler = new THREE.Euler(0, camera.rotation.y, 0, "YXZ");
    direction.applyEuler(euler);

    const newX = camera.position.x + direction.x;
    const newZ = camera.position.z + direction.z;

    camera.position.x = Math.max(
      MOVEMENT_BOUNDS.minX,
      Math.min(MOVEMENT_BOUNDS.maxX, newX)
    );
    camera.position.z = Math.max(
      MOVEMENT_BOUNDS.minZ,
      Math.min(MOVEMENT_BOUNDS.maxZ, newZ)
    );

    camera.position.y = MOVEMENT_BOUNDS.lockedY;
  });

  return (
    <>
      <PointerLockControls ref={controlsRef} />
      <ambientLight intensity={0.6} />
      
      {/* Use @react-three/drei Splat component - supports PLY and splat formats */}
      <Splat 
        src={plyUrl}
        scale={1}
        position={[0, 0, 0]}
        rotation={[Math.PI, 0, 0]} // Convert SHARP's OpenCV coords to Three.js
      />
    </>
  );
}
