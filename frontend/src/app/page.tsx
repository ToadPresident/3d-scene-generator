"use client";

import { useState, useCallback } from "react";
import PromptPanel from "@/components/PromptPanel";
import SceneViewer from "@/components/SceneViewer";

interface GenerationResult {
  plyUrl: string;
  imageUrl: string;
  generationTimeMs: number;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const handleGenerate = useCallback(async (prompt: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Generation failed");
      }

      const data = await response.json();

      if (data.success) {
        setResult({
          plyUrl: `http://localhost:8000${data.ply_url}`,
          imageUrl: `http://localhost:8000${data.image_url}`,
          generationTimeMs: data.generation_time_ms,
        });
      } else {
        throw new Error(data.message || "Generation failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Left Panel - Controls */}
      <div className="w-[30%] min-w-[320px] max-w-[400px] h-full border-r border-border flex flex-col">
        <PromptPanel
          onGenerate={handleGenerate}
          isLoading={isLoading}
          error={error}
          generationTime={result?.generationTimeMs}
        />
      </div>

      {/* Right Panel - 3D Viewer */}
      <div className="flex-1 h-full relative">
        <SceneViewer 
          plyUrl={result?.plyUrl} 
          isLoading={isLoading}
          previewImageUrl={result?.imageUrl}
        />
      </div>
    </main>
  );
}
