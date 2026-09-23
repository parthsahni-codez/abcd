"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroInput from '@/components/HeroInput';
import AgentAnalysis from '@/components/AgentAnalysis';
import IssueCard, { Issue } from '@/components/IssueCard';
import FixPanel from '@/components/FixPanel';

const MOCK_ISSUES: Issue[] = [
  {
    id: "1",
    title: "Login API Failure",
    severity: "critical",
    description: "Login request failing due to server error.",
    log: "POST /api/login → 500 Internal Server Error\nError: Cannot read properties of undefined (reading 'token')",
    fix: "async function login(req, res) {\n  const user = await db.User.findOne({ email });\n+ if (!user) return res.status(401).json({ error: 'User not found' });\n  const token = generateToken(user);\n  res.json({ token });\n}"
  },
  {
    id: "2",
    title: "Slow Page Load",
    severity: "medium",
    description: "Homepage takes 6.2s to load.",
    log: "Warning: Large image assets detected. 3.4MB payload on /hero.png",
    fix: "import Image from 'next/image';\n\n- <img src=\"/hero.png\" alt=\"Hero\" />\n+ <Image \n+   src=\"/hero.png\" \n+   alt=\"Hero\" \n+   width={1200} \n+   height={800} \n+   priority \n+ />"
  },
  {
    id: "3",
    title: "Missing Meta Tags",
    severity: "low",
    description: "SEO meta tags not found on main layout.",
    log: "SEO Checker: No <meta name=\"description\"> tags detected in head",
    fix: "export const metadata: Metadata = {\n  title: 'AutoDevOps',\n+ description: 'AI DevOps Dashboard',\n+ openGraph: {\n+   title: 'AutoDevOps',\n+   type: 'website',\n+ }\n};"
  }
];

export default function Home() {
  const [stage, setStage] = useState<'input' | 'analysis' | 'fetching' | 'results'>('input');
  const [url, setUrl] = useState('');
  const [issues, setIssues] = useState<Issue[]>(MOCK_ISSUES);

  const handleAnalyze = (inputUrl: string) => {
    setUrl(inputUrl);
    setStage('analysis');
  };

  const handleAnalysisComplete = async () => {
    setStage('fetching');
    try {
      const baseUrl = typeof window !== 'undefined' ? `http://${window.location.hostname}:8000` : 'http://localhost:8000';
      const response = await fetch(`${baseUrl}/api/repository/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repository_url: url })
      });
      const data = await response.json();
      
      setIssues([{
        id: "ai-1",
        title: `Build/Test ${data.exit_code === 0 ? 'Success' : 'Failure'} - ${data.project_type} (${data.framework})`,
        severity: data.exit_code === 0 ? 'low' : 'critical',
        description: `Command \`${data.build_command}\` exited with code ${data.exit_code}.`,
        log: data.error || (data.stderr || data.stdout || "No logs captured"),
        fix: data.analysis || "No analysis provided."
      }]);
    } catch (error) {
      console.error("Failed to connect to backend", error);
    } finally {
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

        {stage === 'analysis' && (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col pt-10"
          >
            <AgentAnalysis onComplete={handleAnalysisComplete} />
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
            <h2 className="text-2xl font-semibold text-white mb-2">Consulting Qwen Model...</h2>
            <p className="text-[#9DA7B3]">Sending logs to backend for root cause analysis</p>
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
                  Found <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">{issues.length} Issues</span> in {url}
                </h2>
                <p className="text-[#9DA7B3]">
                  Our AI agents have analyzed the codebase and generated patches. Review the issues below.
                </p>
              </div>

              <div className="space-y-4">
                {issues.map((issue, index) => (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.15 + 0.3 }}
                  >
                    <IssueCard issue={issue} />
                  </motion.div>
                ))}
              </div>
            </div>
            
            <FixPanel targetUrl={url} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
