"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface GaussianSplatViewerProps {
  plyUrl: string;
}

export default function GaussianSplatViewer({ plyUrl }: GaussianSplatViewerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const viewerContainerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<string>("Loading...");
  const [error, setError] = useState<string | null>(null);
  const viewerRef = useRef<any>(null);
  const mountedRef = useRef(true);

  // Create container outside React's control
  const createContainer = useCallback(() => {
    if (!wrapperRef.current) return null;
    
    // Remove old container if exists
    if (viewerContainerRef.current && wrapperRef.current.contains(viewerContainerRef.current)) {
      wrapperRef.current.removeChild(viewerContainerRef.current);
    }
    
    // Create new container
    const container = document.createElement("div");
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.position = "absolute";
    container.style.top = "0";
    container.style.left = "0";
    wrapperRef.current.appendChild(container);
    viewerContainerRef.current = container;
    
    return container;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    
    const initViewer = async () => {
      try {
        const container = createContainer();
        if (!container) return;
        
        // Dynamic import
        const GaussianSplats3D = await import("@mkkellogg/gaussian-splats-3d");
        
        if (!mountedRef.current) return;
        
        // Clean up previous viewer
        if (viewerRef.current) {
          try {
            viewerRef.current.dispose();
          } catch (e) {
            console.warn("Dispose error:", e);
          }
          viewerRef.current = null;
        }
        
        console.log("Initializing viewer for:", plyUrl);
        
        const viewer = new GaussianSplats3D.Viewer({
          rootElement: container,
          cameraUp: [0, 1, 0],
          initialCameraPosition: [0, 0, 3],
          initialCameraLookAt: [0, 0, 0],
          selfDrivenMode: true,
          useBuiltInControls: true,
          dynamicScene: false,
          sharedMemoryForWorkers: false,
        });
        
        viewerRef.current = viewer;
        setStatus("Loading PLY...");
        
        await viewer.addSplatScene(plyUrl, {
          splatAlphaRemovalThreshold: 5,
          showLoadingUI: false,
          progressiveLoad: true,
          rotation: [1, 0, 0, 0],
        });
        
        if (!mountedRef.current) {
          viewer.dispose();
          return;
        }
        
        viewer.start();
        setStatus("");
        console.log("Viewer started");
        
      } catch (e) {
        console.error("Viewer error:", e);
        if (mountedRef.current) {
          setError(e instanceof Error ? e.message : "Failed to load");
        }
      }
    };
    
    initViewer();
    
    return () => {
      mountedRef.current = false;
      
      if (viewerRef.current) {
        try {
          viewerRef.current.dispose();
        } catch (e) {
          // Ignore dispose errors
        }
        viewerRef.current = null;
      }
      
      // Clean up container manually
      if (viewerContainerRef.current && wrapperRef.current?.contains(viewerContainerRef.current)) {
        try {
          wrapperRef.current.removeChild(viewerContainerRef.current);
        } catch (e) {
          // Ignore
        }
      }
      viewerContainerRef.current = null;
    };
  }, [plyUrl, createContainer]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-900/20">
        <div className="text-center p-4">
          <p className="text-red-400 mb-2">Error: {error}</p>
          <p className="text-zinc-500 text-sm">Check console for details</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="w-full h-full relative" style={{ minHeight: "400px" }}>
      {status && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 pointer-events-none">
          <p className="text-white text-lg">{status}</p>
        </div>
      )}
    </div>
  );
}
