"use client";
import React, { useState, useEffect } from 'react';
import { Search, Tag, Cpu, FileCode, CheckCircle, Eye } from 'lucide-react';
import './AgentDashboard.css';

interface AgentData {
  id: string;
  name: string;
  icon: React.FC<any>;
  status: 'Idle' | 'Running' | 'Done';
  delay: number;
}

const initialAgents: AgentData[] = [
  { id: '1', name: 'Log Analysis Agent', icon: Search, status: 'Idle', delay: 1000 },
  { id: '2', name: 'Failure Classification Agent', icon: Tag, status: 'Idle', delay: 2500 },
  { id: '3', name: 'Root Cause Agent', icon: Cpu, status: 'Idle', delay: 4000 },
  { id: '4', name: 'Patch Generator Agent', icon: FileCode, status: 'Idle', delay: 5500 },
  { id: '5', name: 'Validation Agent', icon: CheckCircle, status: 'Idle', delay: 7000 },
  { id: '6', name: 'Monitoring Agent', icon: Eye, status: 'Idle', delay: 8500 },
];

const AgentDashboard: React.FC = () => {
  const [agents, setAgents] = useState<AgentData[]>(initialAgents);

  useEffect(() => {
    // Sequence the agents running
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    
    agents.forEach((agent) => {
      // Set to running
      timeouts.push(
        setTimeout(() => {
          setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: 'Running' } : a));
        }, agent.delay)
      );
      
      // Set to done
      timeouts.push(
        setTimeout(() => {
          setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: 'Done' } : a));
        }, agent.delay + 1500)
      );
    });

    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <section className="container agent-dashboard">
      <div className="section-header text-center">
        <h2>AI Agent Dashboard</h2>
        <p className="text-muted">Multi-agent intelligence coordinating to resolve the pipeline failure.</p>
      </div>

      <div className="agents-grid">
        {agents.map((agent) => (
          <div 
            key={agent.id} 
            className={`agent-card glass-panel ${agent.status === 'Running' ? 'active-glow' : ''} ${agent.status === 'Done' ? 'done-border' : ''}`}
          >
            <div className="agent-header flex-between">
              <div className={`agent-icon flex-center ${agent.status === 'Done' ? 'text-success' : agent.status === 'Running' ? 'text-gradient pulse' : 'text-muted'}`}>
                <agent.icon size={28} />
              </div>
              <div className={`status-badge ${agent.status.toLowerCase()}`}>
                {agent.status === 'Running' && <span className="spinner"></span>}
                {agent.status}
              </div>
            </div>
            <h3 className="agent-name">{agent.name}</h3>
            {agent.status === 'Running' && (
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
            )}
            {agent.status === 'Done' && (
              <div className="progress-bar done">
                <div className="progress-fill done"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default AgentDashboard;
