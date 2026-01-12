"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";

interface GaussianSplatViewerProps {
  plyUrl: string;
}

// Movement limits
const MOVEMENT_BOUNDS = {
  minX: -2,
  maxX: 2,
  minZ: -1,
  maxZ: 2,
  lockedY: 0,
};

const MOVE_SPEED = 2;

export default function GaussianSplatViewer({ plyUrl }: GaussianSplatViewerProps) {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  
  const keysRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  const direction = useMemo(() => new THREE.Vector3(), []);
  const frontVector = useMemo(() => new THREE.Vector3(), []);
  const sideVector = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    camera.position.set(0, 0, 1.5);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW": case "ArrowUp": keysRef.current.forward = true; break;
        case "KeyS": case "ArrowDown": keysRef.current.backward = true; break;
        case "KeyA": case "ArrowLeft": keysRef.current.left = true; break;
        case "KeyD": case "ArrowRight": keysRef.current.right = true; break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW": case "ArrowUp": keysRef.current.forward = false; break;
        case "KeyS": case "ArrowDown": keysRef.current.backward = false; break;
        case "KeyA": case "ArrowLeft": keysRef.current.left = false; break;
        case "KeyD": case "ArrowRight": keysRef.current.right = false; break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    if (!controlsRef.current?.isLocked) return;

    const keys = keysRef.current;
    frontVector.set(0, 0, Number(keys.backward) - Number(keys.forward));
    sideVector.set(Number(keys.left) - Number(keys.right), 0, 0);

    direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(MOVE_SPEED * delta);
    const euler = new THREE.Euler(0, camera.rotation.y, 0, "YXZ");
    direction.applyEuler(euler);

    camera.position.x = Math.max(MOVEMENT_BOUNDS.minX, Math.min(MOVEMENT_BOUNDS.maxX, camera.position.x + direction.x));
    camera.position.z = Math.max(MOVEMENT_BOUNDS.minZ, Math.min(MOVEMENT_BOUNDS.maxZ, camera.position.z + direction.z));
    camera.position.y = MOVEMENT_BOUNDS.lockedY;
  });

  return (
    <>
      <PointerLockControls ref={controlsRef} />
      <ambientLight intensity={0.6} />
      <GaussianSplatMesh plyUrl={plyUrl} />
    </>
  );
}

// Gaussian Splat renderer with binary PLY support
function GaussianSplatMesh({ plyUrl }: { plyUrl: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const [error, setError] = useState<string | null>(null);

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
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center) * 2.0;
        float alpha = exp(-dist * dist * 2.0) * vOpacity;
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
  }), []);

  useEffect(() => {
    const loadPly = async () => {
      try {
        console.log("Loading PLY from:", plyUrl);
        const response = await fetch(plyUrl);
        if (!response.ok) throw new Error(`Failed to load PLY: ${response.status}`);

        const buffer = await response.arrayBuffer();
        const result = parseBinaryPly(buffer);
        
        if (!result || !groupRef.current) {
          setError("Failed to parse PLY data");
          return;
        }

        // Clear existing
        while (groupRef.current.children.length > 0) {
          const child = groupRef.current.children[0];
          if (child instanceof THREE.Points) child.geometry.dispose();
          groupRef.current.remove(child);
        }

        const material = new THREE.ShaderMaterial({
          vertexShader: splatShader.vertexShader,
          fragmentShader: splatShader.fragmentShader,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });

        const points = new THREE.Points(result.geometry, material);
        
        // SHARP uses OpenCV coords, convert to Three.js
        points.rotation.x = Math.PI;
        
        // Center and scale
        result.geometry.computeBoundingSphere();
        const sphere = result.geometry.boundingSphere;
        if (sphere && Number.isFinite(sphere.radius)) {
          points.position.sub(sphere.center);
          if (sphere.radius > 3) {
            points.scale.setScalar(3 / sphere.radius);
          }
        }

        groupRef.current.add(points);
        console.log("PLY loaded successfully");
        
      } catch (e) {
        console.error("PLY load error:", e);
        setError(e instanceof Error ? e.message : "Unknown error");
      }
    };

    loadPly();
  }, [plyUrl, splatShader]);

  if (error) {
    return null;
  }

  return <group ref={groupRef} />;
}

// Binary PLY parser for SHARP output
function parseBinaryPly(buffer: ArrayBuffer): { geometry: THREE.BufferGeometry } | null {
  const uint8 = new Uint8Array(buffer);
  
  // Find header
  let headerEnd = 0;
  const headerLines: string[] = [];
  let lineStart = 0;
  
  for (let i = 0; i < Math.min(uint8.length, 10000); i++) {
    if (uint8[i] === 10) { // newline
      const line = new TextDecoder().decode(uint8.slice(lineStart, i)).trim();
      headerLines.push(line);
      lineStart = i + 1;
      if (line === "end_header") {
        headerEnd = i + 1;
        break;
      }
    }
  }
  
  if (headerEnd === 0) {
    console.error("No end_header found");
    return null;
  }
  
  // Parse header
  let vertexCount = 0;
  let isLittleEndian = true;
  const properties: { name: string; type: string }[] = [];
  
  for (const line of headerLines) {
    if (line.startsWith("format binary_little_endian")) isLittleEndian = true;
    else if (line.startsWith("format binary_big_endian")) isLittleEndian = false;
    else if (line.startsWith("element vertex")) vertexCount = parseInt(line.split(" ")[2]);
    else if (line.startsWith("property float")) {
      properties.push({ name: line.split(" ")[2], type: "float" });
    }
  }
  
  console.log(`PLY Header: ${vertexCount} vertices, ${properties.length} properties, littleEndian: ${isLittleEndian}`);
  
  if (vertexCount === 0 || properties.length === 0) return null;
  
  // Build property index
  const propIdx: Record<string, number> = {};
  properties.forEach((p, i) => propIdx[p.name] = i);
  
  if (!('x' in propIdx) || !('y' in propIdx) || !('z' in propIdx)) {
    console.error("Missing position properties");
    return null;
  }
  
  const bytesPerVertex = properties.length * 4;
  const dataView = new DataView(buffer, headerEnd);
  
  const positions: number[] = [];
  const colors: number[] = [];
  const sizes: number[] = [];
  const opacities: number[] = [];
  
  let validCount = 0;
  
  for (let i = 0; i < vertexCount; i++) {
    const offset = i * bytesPerVertex;
    if (offset + bytesPerVertex > dataView.byteLength) break;
    
    const x = dataView.getFloat32(offset + propIdx['x'] * 4, isLittleEndian);
    const y = dataView.getFloat32(offset + propIdx['y'] * 4, isLittleEndian);
    const z = dataView.getFloat32(offset + propIdx['z'] * 4, isLittleEndian);
    
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) continue;
    
    positions.push(x, y, z);
    validCount++;
    
    // Colors from spherical harmonics
    if ('f_dc_0' in propIdx && 'f_dc_1' in propIdx && 'f_dc_2' in propIdx) {
      const f0 = dataView.getFloat32(offset + propIdx['f_dc_0'] * 4, isLittleEndian);
      const f1 = dataView.getFloat32(offset + propIdx['f_dc_1'] * 4, isLittleEndian);
      const f2 = dataView.getFloat32(offset + propIdx['f_dc_2'] * 4, isLittleEndian);
      const C0 = 0.28209479177387814;
      colors.push(
        Math.max(0, Math.min(1, 0.5 + C0 * f0)),
        Math.max(0, Math.min(1, 0.5 + C0 * f1)),
        Math.max(0, Math.min(1, 0.5 + C0 * f2))
      );
    } else {
      colors.push(0.7, 0.7, 0.7);
    }
    
    // Scale
    if ('scale_0' in propIdx && 'scale_1' in propIdx && 'scale_2' in propIdx) {
      const s0 = dataView.getFloat32(offset + propIdx['scale_0'] * 4, isLittleEndian);
      const s1 = dataView.getFloat32(offset + propIdx['scale_1'] * 4, isLittleEndian);
      const s2 = dataView.getFloat32(offset + propIdx['scale_2'] * 4, isLittleEndian);
      const avgScale = (Math.exp(s0) + Math.exp(s1) + Math.exp(s2)) / 3;
      sizes.push(Math.max(0.001, Math.min(0.1, avgScale * 0.02)));
    } else {
      sizes.push(0.01);
    }
    
    // Opacity
    if ('opacity' in propIdx) {
      const opRaw = dataView.getFloat32(offset + propIdx['opacity'] * 4, isLittleEndian);
      opacities.push(Math.max(0.1, Math.min(1.0, 1 / (1 + Math.exp(-opRaw)))));
    } else {
      opacities.push(0.8);
    }
  }
  
  console.log(`PLY parsed: ${validCount} valid vertices`);
  
  if (validCount === 0) return null;
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));
  geometry.setAttribute("opacity", new THREE.Float32BufferAttribute(opacities, 1));
  
  return { geometry };
}
