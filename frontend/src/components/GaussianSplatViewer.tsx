"use client";

import { useEffect, useRef, useState } from "react";

interface GaussianSplatViewerProps {
  plyUrl: string;
}

export default function GaussianSplatViewer({ plyUrl }: GaussianSplatViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<string>("Loading...");
  const [error, setError] = useState<string | null>(null);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    let mounted = true;
    
    const initViewer = async () => {
      try {
        // Dynamic import
        const GaussianSplats3D = await import("@mkkellogg/gaussian-splats-3d");
        
        if (!mounted || !containerRef.current) return;
        
        // Clean up previous viewer
        if (viewerRef.current) {
          viewerRef.current.dispose();
          viewerRef.current = null;
        }
        containerRef.current.innerHTML = "";
        
        console.log("Initializing GaussianSplats3D viewer for:", plyUrl);
        
        // Create viewer with orbit controls for exploration
        const viewer = new GaussianSplats3D.Viewer({
          rootElement: containerRef.current,
          cameraUp: [0, 1, 0],
          initialCameraPosition: [0, 0, 3],
          initialCameraLookAt: [0, 0, 0],
          selfDrivenMode: true,
          useBuiltInControls: true,
          dynamicScene: false,
          sharedMemoryForWorkers: false, // Avoid CORS issues
        });
        
        viewerRef.current = viewer;
        
        setStatus("Loading PLY...");
        
        // Load the PLY scene
        await viewer.addSplatScene(plyUrl, {
          splatAlphaRemovalThreshold: 5,
          showLoadingUI: false,
          progressiveLoad: true,
          rotation: [1, 0, 0, 0], // Rotate to fix SHARP's coordinate system
        });
        
        if (!mounted) return;
        
        // Start rendering
        viewer.start();
        
        setStatus("");
        console.log("GaussianSplats3D viewer started successfully");
        
      } catch (e) {
        console.error("Viewer error:", e);
        if (mounted) {
          setError(e instanceof Error ? e.message : "Failed to load scene");
        }
      }
    };
    
    initViewer();
    
    return () => {
      mounted = false;
      if (viewerRef.current) {
        try {
          viewerRef.current.dispose();
        } catch (e) {
          console.warn("Dispose error:", e);
        }
        viewerRef.current = null;
      }
    };
  }, [plyUrl]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-900/20">
        <div className="text-center p-4">
          <p className="text-red-400 mb-2">Error: {error}</p>
          <p className="text-zinc-500 text-sm">Check browser console for details</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {status && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <p className="text-white text-lg">{status}</p>
        </div>
      )}
    </div>
  );
}
