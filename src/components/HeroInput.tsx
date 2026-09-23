"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, GitBranch } from 'lucide-react';

interface HeroInputProps {
  onAnalyze: (url: string) => void;
}

export default function HeroInput({ onAnalyze }: HeroInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (url.trim()) {
      const lowerUrl = url.toLowerCase();
      // Allow urls that contain github.com
      if (!lowerUrl.includes('github.com')) {
        setError('Please enter a valid GitHub repository URL.');
        return;
      }
      onAnalyze(url);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center justify-center min-h-[70vh] px-4 w-full"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-8 text-center"
      >
        <div className="inline-flex items-center justify-center px-3 py-1 mb-6 text-sm font-medium text-[#4F9CF9] bg-[#4F9CF9]/10 border border-[#4F9CF9]/20 rounded-full">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4F9CF9] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4F9CF9]"></span>
          </span>
          Antigravity AI DevOps
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-6">
          Self-Healing <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F9CF9] to-purple-500">Infrastructure</span>
        </h1>
        <p className="text-[#9DA7B3] text-lg max-w-2xl mx-auto">
          Deploy our multi-agent AI system to analyze, diagnose, and fix your GitHub repository in real-time.
        </p>
      </motion.div>

      <motion.div 
        className="w-full max-w-xl relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <form onSubmit={handleSubmit} className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#4F9CF9] to-purple-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
          <div className={`relative flex items-center bg-[#11161C] border ${error ? 'border-red-500/50' : 'border-white/10 group-hover:border-[#4F9CF9]/50'} rounded-2xl p-2 transition-colors duration-300 shadow-2xl`}>
            <div className="pl-4 pr-2 text-[#9DA7B3]">
              <GitBranch size={20} />
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter your GitHub repository URL..."
              className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-[#9DA7B3]/50 px-2 py-3 w-full"
              required
            />
            <button
              type="submit"
              className="flex items-center gap-2 bg-[#4F9CF9] hover:bg-[#3A8BE6] text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-[0_0_15px_rgba(79,156,249,0.5)] hover:scale-[1.02]"
            >
              Analyze Repo
              <ArrowRight size={18} />
            </button>
          </div>
        </form>

        {/* Error Message Animation */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="absolute left-0 top-full mt-2 w-full flex justify-center overflow-hidden"
            >
              <span className="text-red-400 text-sm bg-red-400/10 px-4 py-1.5 rounded-lg border border-red-400/20">
                {error}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
