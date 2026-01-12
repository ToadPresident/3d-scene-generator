"use client";

import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Loader2, Eye, MousePointer2 } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamic import for GaussianSplatViewer to avoid SSR issues with Three.js
const GaussianSplatViewer = dynamic(
  () => import("./GaussianSplatViewer"),
  { ssr: false }
);

interface SceneViewerProps {
  plyUrl?: string;
  isLoading: boolean;
  previewImageUrl?: string;
}

export default function SceneViewer({
  plyUrl,
  isLoading,
  previewImageUrl,
}: SceneViewerProps) {
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const [showHint, setShowHint] = useState(true);

  // Track pointer lock state
  useEffect(() => {
    const handlePointerLockChange = () => {
      setIsPointerLocked(document.pointerLockElement !== null);
      if (document.pointerLockElement !== null) {
        setShowHint(false);
      }
    };

    document.addEventListener("pointerlockchange", handlePointerLockChange);
    return () => {
      document.removeEventListener("pointerlockchange", handlePointerLockChange);
    };
  }, []);

  // Show empty state when no scene
  if (!plyUrl && !isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-zinc-950">
        <div className="text-center max-w-md px-6">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-zinc-800/50 flex items-center justify-center">
            <Eye className="w-12 h-12 text-zinc-600" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-300 mb-2">
            No Scene Yet
          </h2>
          <p className="text-sm text-zinc-500">
            Enter a prompt and click "Generate Space" to create your first 3D scene.
          </p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-zinc-950">
        {previewImageUrl && (
          <div className="absolute inset-0 opacity-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImageUrl}
              alt="Preview"
              className="w-full h-full object-cover blur-xl"
            />
          </div>
        )}
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-500/20 flex items-center justify-center loading-pulse">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          </div>
          <h2 className="text-lg font-medium text-white mb-2">
            Generating 3D Scene
          </h2>
          <p className="text-sm text-zinc-400">
            Creating concept image and reconstructing 3D space...
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative canvas-container">
      {/* Click to enter hint */}
      {showHint && !isPointerLocked && (
        <div className="pointer-lock-hint">
          <MousePointer2 className="w-8 h-8 mx-auto mb-3 text-blue-400" />
          <h3 className="text-white font-medium">Click to Enter</h3>
          <p>Use WASD to move, mouse to look around</p>
        </div>
      )}

      {/* ESC hint when locked */}
      {isPointerLocked && (
        <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
          <p className="text-xs text-zinc-400">Press ESC to exit</p>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        camera={{
          fov: 85, // Wide FOV for immersive feel
          near: 0.01,
          far: 1000,
          position: [0, 0, 2], // Start slightly back
        }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>
          {plyUrl && <GaussianSplatViewer plyUrl={plyUrl} />}
        </Suspense>
      </Canvas>
    </div>
  );
}
