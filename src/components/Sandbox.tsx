"use client";
import React, { useState } from 'react';
import { FlaskConical, PlayCircle, CheckCircle } from 'lucide-react';
import './Sandbox.css';

const Sandbox: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [passed, setPassed] = useState(false);

  const runTests = () => {
    setTesting(true);
    setLogs(['> Initiating sandbox environment...']);
    setPassed(false);
    
    setTimeout(() => setLogs(prev => [...prev, '> Pulling branch: feature/fix-user-service']), 1000);
    setTimeout(() => setLogs(prev => [...prev, '> Building application... [DONE]']), 2500);
    setTimeout(() => setLogs(prev => [...prev, '> Running test suite...']), 3500);
    setTimeout(() => setLogs(prev => [...prev, '> [PASS] Unit Test 1: Authentication']), 4500);
    setTimeout(() => setLogs(prev => [...prev, '> [PASS] Unit Test 2: Database Connection']), 5000);
    setTimeout(() => setLogs(prev => [...prev, '> [PASS] Integration Test: User Flow (FIXED)']), 6000);
    setTimeout(() => {
      setLogs(prev => [...prev, '> All tests passed. Safe to deploy.']);
      setTesting(false);
      setPassed(true);
    }, 7000);
  };

  return (
    <section className="container sandbox-section">
      <div className="section-header text-center">
        <h2>Sandbox Testing Environment</h2>
        <p className="text-muted">Safe, isolated execution of the generated patch.</p>
      </div>

      <div className="sandbox-container glass-panel">
        <div className="sandbox-header flex-between">
          <div className="flex-center" style={{gap: '0.5rem'}}>
            <FlaskConical className="text-purple" />
            <span className="font-mono">Isolated Testing Runtime</span>
          </div>
          {!testing && !passed && (
            <button className="btn btn-outline btn-sm" onClick={runTests}>
              <PlayCircle size={16} /> Run Sandbox
            </button>
          )}
          {testing && <span className="status-badge running"><span className="spinner"></span> Testing...</span>}
          {passed && <span className="status-badge done"><CheckCircle size={14} /> Passed</span>}
        </div>

        <div className="sandbox-terminal">
          <div className="terminal-content">
            {logs.length === 0 ? (
              <div className="text-muted text-center mt-4">Waiting to start tests...</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className={`log-line animate-fade-in ${log.includes('PASS') ? 'text-success' : log.includes('FIXED') ? 'text-primary' : ''}`}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {passed && (
          <div className="sandbox-footer flex-center animate-fade-in">
            <button className="btn btn-success">Deploy to Staging</button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Sandbox;
