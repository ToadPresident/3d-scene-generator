"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, AlertCircle, Clock, Github, Linkedin, ChevronDown, ChevronUp, Key } from "lucide-react";

interface PromptPanelProps {
  onGenerate: (prompt: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  generationTime?: number;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

// Example prompts - visually interesting scenes with depth
const EXAMPLE_PROMPTS = [
  "Neon-lit cyberpunk alley at night with rain reflections and holographic signs",
  "Gothic cathedral interior with tall pillars, stained glass windows, and candlelight",
  "Ancient library with towering bookshelves and magical floating lights",
  "Underwater temple ruins with sunbeams filtering through the water",
  "Steam-powered Victorian greenhouse with exotic plants and brass machinery",
  "Mystical forest path with glowing mushrooms and fireflies at twilight",
  "Abandoned space station corridor with flickering emergency lights",
  "Japanese zen garden with cherry blossoms and stone lanterns at sunset",
  "Crystal cave with glowing minerals and underground waterfall",
  "Cozy wizard's study with floating books and magical artifacts",
];

export default function PromptPanel({
  onGenerate,
  isLoading,
  error,
  generationTime,
  apiKey,
  onApiKeyChange,
}: PromptPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [showExamples, setShowExamples] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      await onGenerate(prompt.trim());
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-500" />
          Scene Generator
        </h1>
        <p className="text-sm text-muted-foreground">
          Transform text into immersive 3D environments
        </p>
      </div>

      {/* API Key Input */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setShowApiKey(!showApiKey)}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-2 transition-colors"
        >
          <Key className="w-4 h-4" />
          {apiKey ? "API Key Set ✓" : "Set Gemini API Key"}
          {showApiKey ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        {showApiKey && (
          <div className="space-y-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="Enter your Gemini API Key"
              className="w-full px-4 py-2 bg-muted border border-border rounded-lg 
                         text-white placeholder-zinc-500 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-zinc-500">
              Get your free API key from{" "}
              <a 
                href="https://aistudio.google.com/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>
        )}
      </div>

      {/* Prompt Form */}
      <form onSubmit={handleSubmit} className="flex flex-col flex-1">
        <div className="mb-4">
          <label
            htmlFor="prompt"
            className="block text-sm font-medium text-zinc-300 mb-2"
          >
            Scene Description
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your scene in detail..."
            className="w-full h-32 px-4 py-3 bg-muted border border-border rounded-lg 
                       text-white placeholder-zinc-500 resize-none
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-all duration-200"
            disabled={isLoading}
          />
        </div>

        {/* Example Prompts - Collapsible */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-2"
          >
            {showExamples ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            Try these examples
          </button>
          {showExamples && (
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((example, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleExampleClick(example)}
                  className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 
                             rounded-full text-zinc-400 hover:text-white
                             transition-colors duration-200 truncate max-w-[200px]"
                >
                  {example.slice(0, 25)}...
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Generate Button */}
        <button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-white
                      flex items-center justify-center gap-2 transition-all duration-300
                      ${
                        isLoading
                          ? "bg-blue-600/50 cursor-wait loading-pulse"
                          : prompt.trim()
                          ? "bg-blue-600 hover:bg-blue-500 cursor-pointer"
                          : "bg-zinc-700 cursor-not-allowed"
                      }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Space...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Space
            </>
          )}
        </button>

        {/* Status Messages */}
        <div className="mt-4 space-y-2">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {generationTime && !isLoading && !error && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <Clock className="w-4 h-4 text-green-400" />
              <p className="text-sm text-green-400">
                Generated in {(generationTime / 1000).toFixed(1)}s
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-auto pt-6 border-t border-border">
          <h3 className="text-sm font-medium text-zinc-300 mb-2">Controls</h3>
          <ul className="text-xs text-zinc-500 space-y-1">
            <li>• <b>WASD</b> - Move forward/left/back/right</li>
            <li>• <b>Q/E</b> - Move down/up</li>
            <li>• <b>Left-drag</b> - Rotate view</li>
            <li>• <b>Scroll</b> - Zoom in/out</li>
            <li>• Click canvas first to enable keyboard</li>
          </ul>
        </div>

        {/* Social Links */}
        <div className="pt-4 flex items-center gap-3">
          <a
            href="https://github.com/ToadPresident/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all duration-200"
            title="GitHub"
          >
            <Github className="w-5 h-5" />
          </a>
          <a
            href="https://www.linkedin.com/in/xinwei-wang-525a41358"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-[#0A66C2] transition-all duration-200"
            title="LinkedIn"
          >
            <Linkedin className="w-5 h-5" />
          </a>

        </div>
      </form>
    </div>
  );
}
