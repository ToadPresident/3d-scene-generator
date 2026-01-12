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

// Parse PLY file containing Gaussian Splat data (supports binary format)
function parseGaussianSplatPly(buffer: ArrayBuffer): { geometry: THREE.BufferGeometry } | null {
  const uint8 = new Uint8Array(buffer);
  
  // Find header end
  let headerEnd = 0;
  const headerText: string[] = [];
  let lineStart = 0;
  
  for (let i = 0; i < Math.min(uint8.length, 10000); i++) {
    if (uint8[i] === 10) { // newline
      const line = new TextDecoder().decode(uint8.slice(lineStart, i)).trim();
      headerText.push(line);
      lineStart = i + 1;
      
      if (line === "end_header") {
        headerEnd = i + 1;
        break;
      }
    }
  }
  
  if (headerEnd === 0) {
    console.error("PLY parse error: Could not find end_header");
    return null;
  }
  
  // Parse header
  let vertexCount = 0;
  let isBinary = false;
  let isLittleEndian = true;
  const properties: { name: string; type: string }[] = [];
  
  for (const line of headerText) {
    if (line.startsWith("format binary_little_endian")) {
      isBinary = true;
      isLittleEndian = true;
    } else if (line.startsWith("format binary_big_endian")) {
      isBinary = true;
      isLittleEndian = false;
    } else if (line.startsWith("element vertex")) {
      vertexCount = parseInt(line.split(" ")[2]);
    } else if (line.startsWith("property float") || line.startsWith("property double")) {
      const parts = line.split(" ");
      properties.push({ name: parts[2], type: parts[1] });
    }
  }
  
  console.log(`PLY: ${vertexCount} vertices, ${properties.length} properties, binary: ${isBinary}`);
  
  if (vertexCount === 0 || properties.length === 0) {
    console.error("PLY parse error: No vertices or properties");
    return null;
  }
  
  // Find property indices
  const propIndex: Record<string, number> = {};
  properties.forEach((p, i) => propIndex[p.name] = i);
  
  const hasX = 'x' in propIndex;
  const hasY = 'y' in propIndex;
  const hasZ = 'z' in propIndex;
  
  if (!hasX || !hasY || !hasZ) {
    console.error("PLY parse error: Missing position properties");
    return null;
  }
  
  // Calculate bytes per vertex (assuming all float32)
  const bytesPerVertex = properties.length * 4;
  
  const positions: number[] = [];
  const colors: number[] = [];
  const sizes: number[] = [];
  const opacities: number[] = [];
  
  const dataView = new DataView(buffer, headerEnd);
  let validCount = 0;
  
  for (let i = 0; i < vertexCount; i++) {
    const offset = i * bytesPerVertex;
    
    if (offset + bytesPerVertex > dataView.byteLength) break;
    
    // Read position
    const x = dataView.getFloat32(offset + propIndex['x'] * 4, isLittleEndian);
    const y = dataView.getFloat32(offset + propIndex['y'] * 4, isLittleEndian);
    const z = dataView.getFloat32(offset + propIndex['z'] * 4, isLittleEndian);
    
    // Skip invalid positions
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) continue;
    
    positions.push(x, y, z);
    validCount++;
    
    // Colors from spherical harmonics (f_dc_0, f_dc_1, f_dc_2)
    if ('f_dc_0' in propIndex && 'f_dc_1' in propIndex && 'f_dc_2' in propIndex) {
      const f0 = dataView.getFloat32(offset + propIndex['f_dc_0'] * 4, isLittleEndian);
      const f1 = dataView.getFloat32(offset + propIndex['f_dc_1'] * 4, isLittleEndian);
      const f2 = dataView.getFloat32(offset + propIndex['f_dc_2'] * 4, isLittleEndian);
      
      // Convert SH to RGB (C0 = 0.28209479177387814)
      const C0 = 0.28209479177387814;
      const r = Math.max(0, Math.min(1, 0.5 + C0 * f0));
      const g = Math.max(0, Math.min(1, 0.5 + C0 * f1));
      const b = Math.max(0, Math.min(1, 0.5 + C0 * f2));
      colors.push(r, g, b);
    } else if ('red' in propIndex && 'green' in propIndex && 'blue' in propIndex) {
      const r = dataView.getFloat32(offset + propIndex['red'] * 4, isLittleEndian);
      const g = dataView.getFloat32(offset + propIndex['green'] * 4, isLittleEndian);
      const b = dataView.getFloat32(offset + propIndex['blue'] * 4, isLittleEndian);
      colors.push(r > 1 ? r / 255 : r, g > 1 ? g / 255 : g, b > 1 ? b / 255 : b);
    } else {
      colors.push(0.7, 0.7, 0.7);
    }
    
    // Scale
    if ('scale_0' in propIndex && 'scale_1' in propIndex && 'scale_2' in propIndex) {
      const s0 = dataView.getFloat32(offset + propIndex['scale_0'] * 4, isLittleEndian);
      const s1 = dataView.getFloat32(offset + propIndex['scale_1'] * 4, isLittleEndian);
      const s2 = dataView.getFloat32(offset + propIndex['scale_2'] * 4, isLittleEndian);
      const avgScale = (Math.exp(s0) + Math.exp(s1) + Math.exp(s2)) / 3;
      sizes.push(Math.max(0.001, Math.min(0.1, avgScale * 0.02)));
    } else {
      sizes.push(0.01);
    }
    
    // Opacity
    if ('opacity' in propIndex) {
      const opRaw = dataView.getFloat32(offset + propIndex['opacity'] * 4, isLittleEndian);
      // Sigmoid transform
      const op = 1 / (1 + Math.exp(-opRaw));
      opacities.push(Math.max(0.1, Math.min(1.0, op)));
    } else {
      opacities.push(0.8);
    }
  }
  
  console.log(`PLY parsed: ${validCount} valid vertices`);
  
  if (validCount === 0) {
    console.error("PLY parse error: No valid vertices");
    return null;
  }
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));
  geometry.setAttribute("opacity", new THREE.Float32BufferAttribute(opacities, 1));
  
  return { geometry };
}
