"use client";

import { useState, useEffect } from "react";
import { Loader2, Eye } from "lucide-react";
import dynamic from "next/dynamic";

const GaussianSplatViewer = dynamic(() => import("./GaussianSplatViewer"), { ssr: false });

interface SceneViewerProps {
  plyUrl?: string;
  isLoading: boolean;
  previewImageUrl?: string;
}

export default function SceneViewer({ plyUrl, isLoading, previewImageUrl }: SceneViewerProps) {
  const [viewerError, setViewerError] = useState<string | null>(null);

  if (!plyUrl && !isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-zinc-950">
        <div className="text-center max-w-md px-6">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-zinc-800/50 flex items-center justify-center">
            <Eye className="w-12 h-12 text-zinc-600" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-300 mb-2">No Scene Yet</h2>
          <p className="text-sm text-zinc-500">Enter a prompt and generate your 3D scene.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-zinc-950">
        {previewImageUrl && (
          <div className="absolute inset-0 opacity-20">
            <img src={previewImageUrl} alt="" className="w-full h-full object-cover blur-xl" />
          </div>
        )}
        <div className="relative z-10 text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
          <h2 className="text-lg font-medium text-white mb-2">Generating 3D Scene</h2>
          <p className="text-sm text-zinc-400">This may take 20-40 seconds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-black">
      <div className="absolute top-4 left-4 z-10 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg">
        <p className="text-sm text-zinc-200">
          🖱️ Drag to rotate | Scroll to zoom | Right-drag to pan
        </p>
      </div>
      
      {plyUrl && <GaussianSplatViewer plyUrl={plyUrl} />}
    </div>
  );
}
