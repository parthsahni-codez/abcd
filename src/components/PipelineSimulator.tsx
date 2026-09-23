"use client";
import React, { useState, useEffect } from 'react';
import { Package, Code, Rocket, AlertTriangle, Terminal } from 'lucide-react';
import './PipelineSimulator.css';

const PipelineSimulator: React.FC = () => {
  const [failed, setFailed] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Simulate failure after 3 seconds
    const timer = setTimeout(() => {
      setFailed(true);
      setLogs([
        '> Running tests...',
        '> [PASS] Unit Test 1: Authentication',
        '> [PASS] Unit Test 2: Database Connection',
        '> [FAIL] Integration Test: User Flow',
        '> ERROR: Cannot read property \'id\' of undefined in UserService.ts:42',
        '> Pipeline aborted. AutoDevOps AI triggered.'
      ]);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="container pipeline-simulator">
      <div className="section-header text-center">
        <h2>Live Pipeline Simulator</h2>
        <p className="text-muted">Watch as AutoDevOps detects pipeline failures in real-time.</p>
      </div>

      <div className="pipeline-nodes flex-center">
        <div className="node-wrapper">
          <div className="node-box glass-panel flex-center success-border">
            <Package size={24} className="text-success" />
          </div>
          <p>Build</p>
        </div>
        <div className="connector success-line"></div>
        <div className="node-wrapper">
          <div className={`node-box glass-panel flex-center ${failed ? 'error-border animate-shake' : 'success-border'}`}>
            <Code size={24} className={failed ? 'text-error' : 'text-success'} />
            {failed && <div className="alert-badge"><AlertTriangle size={14} /></div>}
          </div>
          <p>Test</p>
        </div>
        <div className="connector pending-line"></div>
        <div className="node-wrapper">
          <div className="node-box glass-panel flex-center pending-border">
            <Rocket size={24} className="text-muted" />
          </div>
          <p>Deploy</p>
        </div>
      </div>

      <div className="terminal-window glass-panel">
        <div className="terminal-header">
          <Terminal size={16} /> CI/CD Logs
          <div className="window-controls">
            <span className="dot red"></span>
            <span className="dot yellow"></span>
            <span className="dot green"></span>
          </div>
        </div>
        <div className="terminal-body">
          {!failed ? (
            <p className="typing">Waiting for pipeline events...</p>
          ) : (
            logs.map((log, index) => (
              <p key={index} className={`log-line ${log.includes('FAIL') || log.includes('ERROR') ? 'text-error' : log.includes('PASS') ? 'text-success' : ''}`}>
                {log}
              </p>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default PipelineSimulator;
