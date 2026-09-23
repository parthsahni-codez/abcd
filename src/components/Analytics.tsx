"use client";
import React from 'react';
import { TrendingUp, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import './Analytics.css';

const Analytics: React.FC = () => {
  return (
    <section className="container analytics-section">
      <div className="section-header text-center">
        <h2>Analytics Dashboard</h2>
        <p className="text-muted">Impact of AutoDevOps AI across your organization.</p>
      </div>

      <div className="analytics-grid">
        <div className="stat-card glass-panel flex-center flex-column">
          <div className="stat-icon bg-success-light">
            <CheckCircle size={28} className="text-success" />
          </div>
          <h3 className="stat-value text-gradient">1,402</h3>
          <p className="stat-label">Failures Resolved</p>
          <div className="stat-trend text-success"><TrendingUp size={14} /> +12% this week</div>
        </div>

        <div className="stat-card glass-panel flex-center flex-column">
          <div className="stat-icon bg-primary-light">
            <Clock size={28} className="text-primary" />
          </div>
          <h3 className="stat-value text-gradient">320 hrs</h3>
          <p className="stat-label">Dev Time Saved</p>
          <div className="stat-trend text-success"><TrendingUp size={14} /> +5% this week</div>
        </div>

        <div className="stat-card glass-panel flex-center flex-column">
          <div className="stat-icon bg-warning-light">
            <AlertTriangle size={28} className="text-warning" />
          </div>
          <div className="chart-bar-container">
            <div className="chart-bar flex-end">
              <div className="bar type-1" style={{height: '80%'}}></div>
              <div className="bar type-2" style={{height: '60%'}}></div>
              <div className="bar type-3" style={{height: '40%'}}></div>
            </div>
          </div>
          <p className="stat-label mt-2">Common Issues</p>
          <div className="issue-labels">
            <span className="dot-label"><span className="dot type-1"></span> Dependencies</span>
            <span className="dot-label"><span className="dot type-2"></span> Config</span>
            <span className="dot-label"><span className="dot type-3"></span> Tests</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Analytics;
