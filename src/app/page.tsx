"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroInput from '@/components/HeroInput';
import DevOpsResult, { AnalysisResult } from '@/components/DevOpsResult';

export default function Home() {
  const [stage, setStage] = useState<'input' | 'fetching' | 'results'>('input');
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [requestError, setRequestError] = useState('');

  const handleAnalyze = (inputUrl: string) => {
    setUrl(inputUrl);
    void analyzeRepository(inputUrl);
  };

  const analyzeRepository = async (repositoryUrl: string) => {
    setStage('fetching');
    setAnalysis(null);
    setRequestError('');
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 360000);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${baseUrl}/api/analyze-error`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repository_url: repositoryUrl }),
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`Backend request failed with status ${response.status}`);
      }
      const data = (await response.json()) as AnalysisResult;
      setAnalysis(data);
    } catch (error) {
      console.error("Failed to connect to backend", error);
      setRequestError(error instanceof Error ? error.message : "Unknown backend connection error");
    } finally {
      window.clearTimeout(timeout);
      setStage('results');
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#4F9CF9]/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <AnimatePresence mode="wait">
        {stage === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col pt-10"
          >
            <HeroInput onAnalyze={handleAnalyze} />
          </motion.div>
        )}

        {stage === 'fetching' && (
          <motion.div
            key="fetching"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center pt-20"
          >
            <div className="w-12 h-12 border-4 border-[#4F9CF9]/30 border-t-[#4F9CF9] rounded-full animate-spin mb-6" />
            <h2 className="text-2xl font-semibold text-white mb-2">Analyzing repository...</h2>
            <p className="text-[#9DA7B3]">Cloning, detecting the project, running checks, and analyzing captured logs</p>
          </motion.div>
        )}

        {stage === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex-1 flex flex-col pt-10 pb-32"
          >
            <div className="max-w-4xl mx-auto w-full px-4">
              <div className="mb-10 text-center">
                <div className="inline-flex items-center justify-center px-3 py-1 mb-4 text-sm font-medium text-red-400 bg-red-400/10 border border-red-400/20 rounded-full">
                  Analysis Complete
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Analysis for <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">{url}</span>
                </h2>
                <p className="text-[#9DA7B3]">
                  Review the real repository logs, diagnosis, and validated fix plan below.
                </p>
              </div>

              {analysis ? <DevOpsResult repositoryUrl={url} analysis={analysis} /> : (
                <div className="rounded-xl border border-red-400/25 bg-red-400/10 p-5 text-red-200">
                  <p className="font-semibold">Analysis failed</p>
                  <p className="mt-2 text-sm">{requestError || "The backend returned no analysis."}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
