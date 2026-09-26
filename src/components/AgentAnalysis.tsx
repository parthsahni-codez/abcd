"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Network, FileText, LayoutTemplate, Zap, CheckCircle2, Loader2 } from 'lucide-react';

const agents = [
  { id: 'network', name: 'Network Analyzer', icon: Network, steps: ['Checking API endpoints...', 'Verifying HTTP responses...', 'Detecting failed requests...'] },
  { id: 'logs', name: 'Log Inspector', icon: FileText, steps: ['Parsing error logs...', 'Detecting exceptions...', 'Identifying root causes...'] },
  { id: 'ui', name: 'UI Tester', icon: LayoutTemplate, steps: ['Simulating user interactions...', 'Clicking buttons...', 'Detecting broken components...'] },
  { id: 'perf', name: 'Performance Analyzer', icon: Zap, steps: ['Measuring load time...', 'Checking asset sizes...', 'Identifying slow resources...'] }
];

interface AgentAnalysisProps {
  onComplete: () => void;
}

export default function AgentAnalysis({ onComplete }: AgentAnalysisProps) {
  const [activeAgentIndex, setActiveAgentIndex] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [completedAgents, setCompletedAgents] = useState<string[]>([]);
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    if (activeAgentIndex >= agents.length) {
      setTimeout(() => onComplete(), 1000);
      return;
    }

    const currentAgent = agents[activeAgentIndex];
    
    if (activeStepIndex >= currentAgent.steps.length) {
      const completionTimeout = setTimeout(() => {
        setCompletedAgents(prev => prev.includes(currentAgent.id) ? prev : [...prev, currentAgent.id]);
        setActiveAgentIndex(prev => prev + 1);
        setActiveStepIndex(0);
        setTypedText('');
      }, 400);
      return () => clearTimeout(completionTimeout);
    }

    const currentStepText = currentAgent.steps[activeStepIndex];
    let charIndex = 0;
    
    const typingInterval = setInterval(() => {
      if (charIndex <= currentStepText.length) {
        setTypedText(currentStepText.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          setActiveStepIndex(prev => prev + 1);
        }, 500); // Wait a bit before next step
      }
    }, 20); // Typing speed

    return () => clearInterval(typingInterval);
  }, [activeAgentIndex, activeStepIndex, onComplete]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">Initializing Multi-Agent System</h2>
        <p className="text-[#9DA7B3]">Deploying AI agents to analyze target environment</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.map((agent, index) => {
          const isActive = index === activeAgentIndex;
          const isCompleted = completedAgents.includes(agent.id);
          
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ${
                isActive 
                  ? 'bg-[#1A222C] border-[#4F9CF9]/50 shadow-[0_0_30px_rgba(79,156,249,0.15)]' 
                  : isCompleted
                  ? 'bg-[#11161C] border-green-500/30'
                  : 'bg-[#11161C]/50 border-white/5 opacity-50'
              } p-6`}
            >
              {isActive && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#4F9CF9] to-transparent animate-pulse" />
              )}
              
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl ${
                  isActive ? 'bg-[#4F9CF9]/20 text-[#4F9CF9]' : 
                  isCompleted ? 'bg-green-500/20 text-green-400' : 
                  'bg-white/5 text-[#9DA7B3]'
                }`}>
                  <agent.icon size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">{agent.name}</h3>
                  <div className="text-sm">
                    {isActive ? (
                      <span className="text-[#4F9CF9] flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" /> Analyzing...
                      </span>
                    ) : isCompleted ? (
                      <span className="text-green-400 flex items-center gap-1">
                        <CheckCircle2 size={14} /> Completed
                      </span>
                    ) : (
                      <span className="text-[#9DA7B3]">Waiting...</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="h-[80px] bg-[#0B0F14] rounded-lg border border-white/5 p-4 font-mono text-sm flex flex-col justify-end relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#4F9CF9]/50 to-transparent" />
                
                {isCompleted ? (
                  <div className="text-green-400 flex flex-col gap-1">
                    {agent.steps.map((step, i) => (
                      <div key={i} className="flex items-center gap-2 opacity-80">
                        <span className="text-xs">[{'✓'}]</span> {step}
                      </div>
                    ))}
                  </div>
                ) : isActive ? (
                  <div className="flex flex-col gap-1 text-[#9DA7B3]">
                    {agent.steps.slice(0, activeStepIndex).map((step, i) => (
                      <div key={i} className="flex items-center gap-2 text-white/70">
                        <span className="text-xs text-green-400">[{'✓'}]</span> {step}
                      </div>
                    ))}
                    {activeStepIndex < agent.steps.length && (
                      <div className="flex items-center gap-2 text-white">
                        <span className="text-xs text-[#4F9CF9] animate-pulse">[&gt;]</span> 
                        {typedText}<span className="w-2 h-4 bg-[#4F9CF9] ml-1 animate-pulse" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[#9DA7B3]/40">Awaiting execution...</div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
