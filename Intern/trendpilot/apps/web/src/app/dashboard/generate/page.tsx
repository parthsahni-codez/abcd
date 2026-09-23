"use client";

import { useState } from "react";

export default function GeneratePage() {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Mock API call delay
    setTimeout(() => {
      setResult({
        linkedin: "Are you using AI in your workflow?\n\nHere are 3 ways I use agents to save 10 hours a week:\n\n1. Content research\n2. Code generation\n3. Data analysis\n\nWhat is your favorite use case?",
        instagram: "AI is changing the game. 🚀 Swipe to see how to stay ahead! #AI #Tech #Innovation"
      });
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out max-w-3xl">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Generate Viral Post</h1>
        <p className="text-neutral-400 mt-2">Let our AI agents research, plan, and write an original post based on current trends.</p>
      </header>

      <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-md space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Topic or Keyword</label>
          <input 
            type="text" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. AI Agents, Bootstrapping, Marketing..."
            className="w-full px-4 py-3 rounded-lg bg-neutral-950 border border-neutral-800 focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600 transition-all text-white"
          />
        </div>
        
        <button 
          onClick={handleGenerate}
          disabled={isGenerating || !topic}
          className="w-full py-3 rounded-lg bg-white text-black font-medium hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center"
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Agents are researching...
            </span>
          ) : "Generate Post"}
        </button>
      </div>

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="p-6 rounded-2xl border border-blue-900/50 bg-blue-950/20 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-4 text-blue-400">
              <span className="font-medium">LinkedIn Draft</span>
            </div>
            <p className="whitespace-pre-wrap text-neutral-200">{result.linkedin}</p>
          </div>
          
          <div className="p-6 rounded-2xl border border-pink-900/50 bg-pink-950/20 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-4 text-pink-400">
              <span className="font-medium">Instagram Draft</span>
            </div>
            <p className="whitespace-pre-wrap text-neutral-200">{result.instagram}</p>
          </div>
        </div>
      )}
    </div>
  );
}
