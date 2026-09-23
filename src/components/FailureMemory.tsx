"use client";
import React from 'react';
import { Database, GitCommit, GitPullRequest, Search } from 'lucide-react';
import './FailureMemory.css';

const FailureMemory: React.FC = () => {
  return (
    <section className="container memory-section">
      <div className="section-header text-center">
        <h2>Failure Memory System</h2>
        <p className="text-muted">Learning from past failures to fix future issues instantly.</p>
      </div>

      <div className="memory-container flex-center">
        <div className="memory-info glass-panel">
          <div className="info-header flex-center">
            <Database className="text-primary" />
            <h3>Memory Match Found</h3>
          </div>
          <p className="text-muted text-center mt-2 mb-4">
            "Similar error fixed before in repository backend-api."
          </p>
          
          <div className="memory-timeline">
            <div className="timeline-item">
              <div className="timeline-icon"><Search size={14} /></div>
              <div className="timeline-content">
                <span className="date">Oct 12, 2025</span>
                <p>Identical TypeError logged in Auth Module.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-icon"><GitCommit size={14} /></div>
              <div className="timeline-content">
                <span className="date">Oct 12, 2025</span>
                <p>Developer 'jdoe' committed a fix for null checking.</p>
              </div>
            </div>
            <div className="timeline-item active">
              <div className="timeline-icon pulse-icon"><GitPullRequest size={14} /></div>
              <div className="timeline-content">
                <span className="date text-primary">Now</span>
                <p className="text-primary">Suggested current fix based on past learning.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FailureMemory;
