"use client";

import { useEffect, useRef, useState } from "react";

interface GaussianSplatViewerProps {
  plyUrl: string; // Can be .ply or .splat
}

export default function GaussianSplatViewer({ plyUrl }: GaussianSplatViewerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<string>("Loading...");
  const [error, setError] = useState<string | null>(null);
  const initRef = useRef(false);

  useEffect(() => {
    // Prevent double init in React strict mode
    if (initRef.current) return;
    initRef.current = true;

    let viewer: any = null;
    let container: HTMLDivElement | null = null;
    let animationId: number | null = null;
    
    const init = async () => {
      if (!wrapperRef.current) return;
      
      try {
        // Create container outside React control
        container = document.createElement("div");
        container.style.cssText = "width:100%;height:100%;position:absolute;top:0;left:0;";
        wrapperRef.current.appendChild(container);
        
        // Import gsplat.js
        const SPLAT = await import("gsplat");
        
        console.log("Loading scene:", plyUrl);
        setStatus("Initializing viewer...");
        
        // Create scene
        const scene = new SPLAT.Scene();
        const camera = new SPLAT.Camera();
        const renderer = new SPLAT.WebGLRenderer(container);
        const controls = new SPLAT.OrbitControls(camera, renderer.canvas);
        
        // Set initial camera position
        camera.position.set(0, 0, 3);
        
        viewer = { scene, camera, renderer, controls };
        
        setStatus("Loading 3D scene...");
        
        // Load the scene (.splat or .ply)
        await SPLAT.Loader.LoadAsync(plyUrl, scene, (progress: number) => {
          setStatus(`Loading... ${Math.round(progress * 100)}%`);
        });
        
        console.log("Scene loaded successfully");
        setStatus("");
        
        // Render loop
        const frame = () => {
          controls.update();
          renderer.render(scene, camera);
          animationId = requestAnimationFrame(frame);
        };
        animationId = requestAnimationFrame(frame);
        
      } catch (e: any) {
        console.error("Viewer error:", e);
        // Don't show error for abort/dispose
        if (!e?.message?.includes("disposed") && !e?.message?.includes("abort")) {
          setError(e?.message || "Failed to load scene");
        }
      }
    };
    
    init();
    
    return () => {
      initRef.current = false;
      
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      if (viewer?.renderer) {
        try { viewer.renderer.dispose(); } catch (e) {}
      }
      
      if (container && wrapperRef.current?.contains(container)) {
        try { wrapperRef.current.removeChild(container); } catch (e) {}
      }
    };
  }, [plyUrl]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-900/20">
        <div className="text-center p-4">
          <p className="text-red-400 mb-2">Error: {error}</p>
          <p className="text-zinc-500 text-xs">Check console for details</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="w-full h-full relative bg-zinc-950" style={{ minHeight: "400px" }}>
      {status && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 pointer-events-none">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-white">{status}</p>
          </div>
        </div>
      )}
    </div>
  );
}
