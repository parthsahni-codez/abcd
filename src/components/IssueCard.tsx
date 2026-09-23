"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Terminal, Wrench, ChevronDown, CheckCircle, Copy } from 'lucide-react';

export interface Issue {
  id: string;
  title: string;
  severity: 'critical' | 'medium' | 'low';
  description: string;
  log: string;
  fix: string;
}

interface IssueCardProps {
  issue: Issue;
}

export default function IssueCard({ issue }: IssueCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'low': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(issue.fix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-[#11161C] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors group cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="p-5 flex items-start justify-between">
        <div className="flex gap-4">
          <div className={`p-2 rounded-lg border mt-1 ${getSeverityColor(issue.severity)}`}>
            <AlertCircle size={20} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-medium text-white">{issue.title}</h3>
              <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${getSeverityColor(issue.severity)}`}>
                {issue.severity}
              </span>
            </div>
            <p className="text-[#9DA7B3] text-sm">{issue.description}</p>
          </div>
        </div>
        <div className="text-[#9DA7B3] group-hover:text-white transition-colors">
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
            <ChevronDown size={20} />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="p-5 bg-[#0B0F14]/50 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-[#9DA7B3]">
                  <Terminal size={14} />
                  <span>Detected Log Entry</span>
                </div>
                <div className="bg-[#05070A] border border-white/5 rounded-lg p-3 font-mono text-sm text-red-400">
                  {issue.log}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-[#9DA7B3]">
                  <Wrench size={14} />
                  <span>Suggested Fix</span>
                </div>
                <div className="bg-[#1A222C] border border-[#4F9CF9]/20 rounded-lg p-4 relative group/code">
                  <pre className="font-mono text-sm text-white/90 whitespace-pre-wrap">{issue.fix}</pre>
                  <button 
                    onClick={handleCopy}
                    className="absolute top-3 right-3 p-1.5 rounded-md bg-[#0B0F14] text-[#9DA7B3] hover:text-white border border-white/10 opacity-0 group-hover/code:opacity-100 transition-all"
                  >
                    {copied ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
