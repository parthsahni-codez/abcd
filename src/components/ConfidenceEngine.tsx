"use client";
import React, { useState, useEffect } from 'react';
import { Target, Zap, AlertCircle } from 'lucide-react';
import './ConfidenceEngine.css';

const ConfidenceEngine: React.FC = () => {
  const [confidence, setConfidence] = useState(0);
  const targetConfidence = 78;

  useEffect(() => {
    // Animate confidence level up to target
    const interval = setInterval(() => {
      setConfidence(prev => {
        if (prev >= targetConfidence) {
          clearInterval(interval);
          return targetConfidence;
        }
        return prev + 1;
      });
    }, 20);
    return () => clearInterval(interval);
  }, [targetConfidence]);

  return (
    <section className="container confidence-engine">
      <div className="section-header text-center">
        <h2>Confidence Engine</h2>
        <p className="text-muted">Dynamic decision routing based on AI certainty scoring.</p>
      </div>

      <div className="engine-layout flex-center">
        <div className="confidence-meter glass-panel">
          <svg className="circular-chart" viewBox="0 0 36 36">
            <path
              className="circle-bg"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="circle"
              strokeDasharray={`${confidence}, 100`}
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <text x="18" y="20.35" className="percentage">{confidence}%</text>
          </svg>
          <div className="meter-label">AI Certainty Score</div>
        </div>

        <div className="decision-branches">
          <div className={`branch glass-panel ${confidence > 90 ? 'active-branch success-border' : ''}`}>
            <div className="branch-icon"><Zap size={20} className="text-success" /></div>
            <div className="branch-content">
              <h4>&gt; 90%: Auto Fix</h4>
              <p className="text-muted">Changes applied automatically.</p>
            </div>
          </div>
          
          <div className={`branch glass-panel ${confidence >= 60 && confidence <= 90 ? 'active-branch warning-border animate-float' : ''}`}>
            <div className="branch-icon"><Target size={20} className="text-warning" /></div>
            <div className="branch-content">
              <h4>60-90%: Ask User</h4>
              <p className="text-muted">Requires human approval.</p>
            </div>
          </div>
          
          <div className={`branch glass-panel ${confidence < 60 ? 'active-branch error-border' : ''}`}>
            <div className="branch-icon"><AlertCircle size={20} className="text-error" /></div>
            <div className="branch-content">
              <h4>&lt; 60%: Needs Clarification</h4>
              <p className="text-muted">Human-in-the-loop chat triggers.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConfidenceEngine;
