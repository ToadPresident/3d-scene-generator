"use client";

import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";

interface GaussianSplatViewerProps {
  plyUrl: string;
}

// Movement limits (camera cage - 2m radius)
const MOVEMENT_BOUNDS = {
  minX: -2,
  maxX: 2,
  minZ: -1, // Slightly less depth to avoid seeing back of scene
  maxZ: 2,
  lockedY: 0, // Lock Y axis to prevent flying
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

  // Direction vectors (memoized to avoid recreation)
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

  // Frame update for movement - optimized with ref instead of state
  useFrame((_, delta) => {
    if (!controlsRef.current?.isLocked) return;

    const keys = keysRef.current;

    // Calculate movement direction based on camera orientation
    frontVector.set(0, 0, Number(keys.backward) - Number(keys.forward));
    sideVector.set(Number(keys.left) - Number(keys.right), 0, 0);

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(MOVE_SPEED * delta);

    // Apply camera rotation to movement direction (only Y rotation for ground movement)
    const euler = new THREE.Euler(0, camera.rotation.y, 0, "YXZ");
    direction.applyEuler(euler);

    // Apply movement (only X and Z, lock Y)
    const newX = camera.position.x + direction.x;
    const newZ = camera.position.z + direction.z;

    // Clamp to bounds (camera cage)
    camera.position.x = Math.max(
      MOVEMENT_BOUNDS.minX,
      Math.min(MOVEMENT_BOUNDS.maxX, newX)
    );
    camera.position.z = Math.max(
      MOVEMENT_BOUNDS.minZ,
      Math.min(MOVEMENT_BOUNDS.maxZ, newZ)
    );

    // Lock Y position
    camera.position.y = MOVEMENT_BOUNDS.lockedY;
  });

  return (
    <>
      {/* First-person controls */}
      <PointerLockControls ref={controlsRef} />

      {/* Subtle ambient light */}
      <ambientLight intensity={0.6} />

      {/* Load and render Gaussian Splat */}
      <GaussianSplatMesh plyUrl={plyUrl} />
    </>
  );
}

// Advanced Gaussian Splat mesh renderer
function GaussianSplatMesh({ plyUrl }: { plyUrl: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Custom shader for Gaussian Splat rendering
  const splatShader = useMemo(() => ({
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      attribute float opacity;
      
      varying vec3 vColor;
      varying float vOpacity;
      
      void main() {
        vColor = color;
        vOpacity = opacity;
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vOpacity;
      
      void main() {
        // Gaussian falloff for soft splat appearance
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center) * 2.0;
        float alpha = exp(-dist * dist * 2.0) * vOpacity;
        
        if (alpha < 0.01) discard;
        
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
  }), []);

  useEffect(() => {
    const loadGaussianSplat = async () => {
      try {
        const response = await fetch(plyUrl);
        if (!response.ok) throw new Error("Failed to load PLY");

        const arrayBuffer = await response.arrayBuffer();
        setLoadingProgress(50);

        const splatData = parseGaussianSplatPly(arrayBuffer);
        setLoadingProgress(80);

        if (groupRef.current && splatData) {
          // Clear existing children
          while (groupRef.current.children.length > 0) {
            const child = groupRef.current.children[0];
            if (child instanceof THREE.Points && child.geometry) {
              child.geometry.dispose();
            }
            groupRef.current.remove(child);
          }

          // Create shader material for Gaussian splats
          const material = new THREE.ShaderMaterial({
            vertexShader: splatShader.vertexShader,
            fragmentShader: splatShader.fragmentShader,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          });

          const points = new THREE.Points(splatData.geometry, material);
          
          // SHARP uses OpenCV coordinates (x right, y down, z forward)
          // Three.js uses (x right, y up, z backward)
          // Apply rotation to convert
          points.rotation.x = Math.PI;
          
          // Scale and center the scene (with error handling)
          try {
            splatData.geometry.computeBoundingBox();
            const box = splatData.geometry.boundingBox;
            
            if (box && 
                Number.isFinite(box.min.x) && Number.isFinite(box.max.x) &&
                Number.isFinite(box.min.y) && Number.isFinite(box.max.y) &&
                Number.isFinite(box.min.z) && Number.isFinite(box.max.z)) {
              
              const center = new THREE.Vector3();
              box.getCenter(center);
              
              if (Number.isFinite(center.x) && Number.isFinite(center.y) && Number.isFinite(center.z)) {
                points.position.sub(center);
              }
              
              // Auto-scale to fit in view
              const size = new THREE.Vector3();
              box.getSize(size);
              const maxDim = Math.max(size.x, size.y, size.z);
              if (Number.isFinite(maxDim) && maxDim > 5) {
                const scale = 5 / maxDim;
                points.scale.setScalar(scale);
              }
            } else {
              console.warn("Bounding box contains invalid values, skipping centering");
            }
          } catch (e) {
            console.warn("Failed to compute bounding box:", e);
          }

          groupRef.current.add(points);
          setLoadingProgress(100);
        }
      } catch (error) {
        console.error("Failed to load Gaussian splat:", error);
      }
    };

    loadGaussianSplat();
  }, [plyUrl, splatShader]);

  return <group ref={groupRef} />;
}

// Parse PLY file containing Gaussian Splat data
function parseGaussianSplatPly(buffer: ArrayBuffer): { geometry: THREE.BufferGeometry } | null {
  const text = new TextDecoder().decode(buffer);
  const lines = text.split("\n");
  
  let vertexCount = 0;
  let headerEnd = 0;
  const properties: string[] = [];

  // Parse header
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith("element vertex")) {
      vertexCount = parseInt(line.split(" ")[2]);
    }
    if (line.startsWith("property")) {
      properties.push(line);
    }
    if (line === "end_header") {
      headerEnd = i + 1;
      break;
    }
  }

  if (vertexCount === 0) {
    console.error("PLY parse error: No vertices found");
    return null;
  }

  console.log(`Parsing PLY: ${vertexCount} vertices, ${properties.length} properties`);

  // Detect property indices
  const hasRgb = properties.some(p => p.includes(" red") || p.includes(" diffuse_red") || p.includes(" f_dc_0"));
  const hasOpacity = properties.some(p => p.includes(" opacity") || p.includes(" alpha"));
  const hasScale = properties.some(p => p.includes(" scale_0") || p.includes(" scale"));

  const positions: number[] = [];
  const colors: number[] = [];
  const sizes: number[] = [];
  const opacities: number[] = [];

  let validVertices = 0;
  let skippedVertices = 0;

  // Parse vertex data
  for (let i = headerEnd; i < headerEnd + vertexCount && i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(/\s+/).map(parseFloat);
    
    // Skip if not enough data or position is invalid
    if (parts.length < 3) {
      skippedVertices++;
      continue;
    }
    
    // Check for NaN or Infinity in position
    const x = parts[0];
    const y = parts[1];
    const z = parts[2];
    
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
      skippedVertices++;
      continue;
    }

    // Position
    positions.push(x, y, z);
    validVertices++;

    // Colors - SHARP uses f_dc_0, f_dc_1, f_dc_2 for spherical harmonics
    if (parts.length >= 6) {
      let r = parts[3];
      let g = parts[4];
      let b = parts[5];
      
      // Handle spherical harmonics (f_dc values are typically small, need sigmoid transform)
      if (Math.abs(r) < 1 && Math.abs(g) < 1 && Math.abs(b) < 1) {
        // SH to RGB conversion (simplified)
        r = 0.5 + r * 0.5;
        g = 0.5 + g * 0.5;
        b = 0.5 + b * 0.5;
      } else if (r > 1 || g > 1 || b > 1) {
        // Normalize from 0-255 range
        r = r / 255;
        g = g / 255;
        b = b / 255;
      }
      
      colors.push(
        Math.max(0, Math.min(1, r)),
        Math.max(0, Math.min(1, g)),
        Math.max(0, Math.min(1, b))
      );
    } else {
      colors.push(0.7, 0.7, 0.7); // Default gray
    }

    // Size from scale property or default
    if (hasScale && parts.length >= 10) {
      const scales = [parts[6], parts[7], parts[8]].map(s => Math.abs(s || 0));
      const avgScale = scales.reduce((a, b) => a + b, 0) / 3;
      sizes.push(Math.max(0.005, Math.min(0.2, avgScale * 0.1)));
    } else {
      sizes.push(0.015);
    }

    // Opacity
    if (hasOpacity && parts.length > 9) {
      // Opacity is usually after scale values
      const opacityRaw = parts[9];
      // Convert logit to opacity: sigmoid(x) = 1 / (1 + exp(-x))
      const op = 1 / (1 + Math.exp(-opacityRaw));
      opacities.push(Math.max(0.1, Math.min(1.0, op)));
    } else {
      opacities.push(0.7);
    }
  }

  console.log(`PLY parsed: ${validVertices} valid vertices, ${skippedVertices} skipped`);

  if (validVertices === 0) {
    console.error("PLY parse error: No valid vertices after filtering");
    return null;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));
  geometry.setAttribute("opacity", new THREE.Float32BufferAttribute(opacities, 1));

  return { geometry };
}
