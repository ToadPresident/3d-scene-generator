"use client";

import { useState, useEffect } from "react";
import { Loader2, Eye } from "lucide-react";
import dynamic from "next/dynamic";

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
  if (!plyUrl && !isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-zinc-950">
        <div className="text-center max-w-md px-6">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-zinc-800/50 flex items-center justify-center">
            <Eye className="w-12 h-12 text-zinc-600" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-300 mb-2">No Scene Yet</h2>
          <p className="text-sm text-zinc-500">
            Enter a prompt and click &quot;Generate Space&quot; to create your 3D scene.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-zinc-950">
        {previewImageUrl && (
          <div className="absolute inset-0 opacity-20">
            <img src={previewImageUrl} alt="Preview" className="w-full h-full object-cover blur-xl" />
          </div>
        )}
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          </div>
          <h2 className="text-lg font-medium text-white mb-2">Generating 3D Scene</h2>
          <p className="text-sm text-zinc-400">Creating concept image and reconstructing 3D space...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-black">
      {/* Controls hint */}
      <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg">
        <p className="text-xs text-zinc-300">
          🖱️ Left drag: Rotate &nbsp;|&nbsp; Scroll: Zoom &nbsp;|&nbsp; Right drag: Pan
        </p>
      </div>
      
      {plyUrl && <GaussianSplatViewer plyUrl={plyUrl} />}
    </div>
  );
}
