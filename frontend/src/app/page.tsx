"use client";

import { useState, useCallback, useEffect } from "react";
import PromptPanel from "@/components/PromptPanel";
import SceneViewer from "@/components/SceneViewer";

// API URL - uses environment variable or falls back to localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface GenerationResult {
  plyUrl: string;
  imageUrl: string;
  generationTimeMs: number;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [apiKey, setApiKey] = useState("");

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  // Save API key to localStorage when it changes
  const handleApiKeyChange = useCallback((key: string) => {
    setApiKey(key);
    localStorage.setItem("gemini_api_key", key);
  }, []);

  const handleGenerate = useCallback(async (prompt: string) => {
    if (!apiKey) {
      setError("Please enter your Gemini API Key first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
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
          plyUrl: `${API_URL}${data.ply_url}`,
          imageUrl: `${API_URL}${data.image_url}`,
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
  }, [apiKey]);

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Left Panel - Controls */}
      <div className="w-[30%] min-w-[320px] max-w-[400px] h-full border-r border-border flex flex-col">
        <PromptPanel
          onGenerate={handleGenerate}
          isLoading={isLoading}
          error={error}
          generationTime={result?.generationTimeMs}
          apiKey={apiKey}
          onApiKeyChange={handleApiKeyChange}
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
