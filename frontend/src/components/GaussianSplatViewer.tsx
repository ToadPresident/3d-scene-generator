"use client";

import { useEffect, useRef, useState } from "react";

interface GaussianSplatViewerProps {
  plyUrl: string;
}

export default function GaussianSplatViewer({ plyUrl }: GaussianSplatViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<string>("Loading...");
  const [error, setError] = useState<string | null>(null);
  const rendererRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    let mounted = true;
    
    const initGsplat = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const SPLAT = await import("gsplat");
        
        if (!mounted || !containerRef.current) return;
        
        // Clear previous
        containerRef.current.innerHTML = "";
        
        // Create scene
        const scene = new SPLAT.Scene();
        const camera = new SPLAT.Camera();
        const renderer = new SPLAT.WebGLRenderer();
        const controls = new SPLAT.OrbitControls(camera, renderer.canvas);
        
        // Style canvas
        renderer.canvas.style.width = "100%";
        renderer.canvas.style.height = "100%";
        containerRef.current.appendChild(renderer.canvas);
        
        rendererRef.current = renderer;
        
        // Handle resize
        const handleResize = () => {
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          renderer.setSize(rect.width, rect.height);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        
        // Load PLY
        setStatus("Loading Gaussian Splat...");
        console.log("Loading:", plyUrl);
        
        await SPLAT.Loader.LoadAsync(plyUrl, scene, (progress: number) => {
          setStatus(`Loading... ${Math.round(progress * 100)}%`);
        });
        
        if (!mounted) return;
        
        setStatus("");
        console.log("Loaded successfully");
        
        // Render loop
        const frame = () => {
          if (!mounted) return;
          controls.update();
          renderer.render(scene, camera);
          requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
        
        // Cleanup
        return () => {
          window.removeEventListener("resize", handleResize);
          renderer.dispose();
        };
        
      } catch (e) {
        console.error("Gsplat error:", e);
        if (mounted) {
          setError(e instanceof Error ? e.message : "Failed to load");
        }
      }
    };
    
    initGsplat();
    
    return () => {
      mounted = false;
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [plyUrl]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-900/20">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {status && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <p className="text-white text-lg">{status}</p>
        </div>
      )}
    </div>
  );
}
