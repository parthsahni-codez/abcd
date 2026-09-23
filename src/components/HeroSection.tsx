"use client";
import React from 'react';
import { Play, Activity } from 'lucide-react';
import './HeroSection.css';

const HeroSection: React.FC = () => {
  return (
    <section className="hero-section flex-center">
      <div className="container text-center">
        <div className="badge glass-panel animate-float">
          <Activity size={16} className="text-success" />
          <span>System Online • Agents Active</span>
        </div>
        
        <h1 className="hero-title">
          AI That Fixes Your <br />
          <span className="text-gradient">CI/CD Failures</span> Automatically
        </h1>
        
        <p className="hero-subtitle text-muted">
          From failure detection to auto-repair with intelligent confidence control.
          Let our multi-agent system heal your pipelines.
        </p>
        
        <div className="hero-actions">
          <button className="btn btn-primary btn-lg">
            <Play size={20} /> View Demo
          </button>
          <button className="btn btn-outline btn-lg">
            Simulate Failure
          </button>
        </div>

        <div className="hero-visual">
          <div className="pipeline-line"></div>
          <div className="node pulse"><div className="glowing-dot success"></div></div>
          <div className="pipeline-line"></div>
          <div className="node pulse"><div className="glowing-dot success"></div></div>
          <div className="pipeline-line"></div>
          <div className="node pulse"><div className="glowing-dot success"></div></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
