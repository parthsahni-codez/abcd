"use client";
import React, { useState } from 'react';
import { GitPullRequest, GitMerge, CheckCircle2 } from 'lucide-react';
import './AutoFixPR.css';

const AutoFixPR: React.FC = () => {
  const [status, setStatus] = useState<'pending' | 'creating' | 'success'>('pending');

  const handleCreatePR = () => {
    setStatus('creating');
    setTimeout(() => {
      setStatus('success');
    }, 2000);
  };

  return (
    <section className="container autofix-section">
      <div className="section-header text-center">
        <h2>Auto Fix & PR Generator</h2>
        <p className="text-muted">Review the AI-generated patch before it merges into your codebase.</p>
      </div>

      <div className="diff-viewer glass-panel">
        <div className="diff-header flex-between">
          <div className="file-name text-muted">src/services/UserService.ts</div>
          <div className="diff-stats">
            <span className="text-error">-1 deletion</span>
            <span className="text-success">+2 additions</span>
          </div>
        </div>
        
        <div className="diff-body">
          <div className="diff-line unchanged">
            <span className="line-num">40</span>
            <span className="code">  async getUserProfile(userId: string) &#123;</span>
          </div>
          <div className="diff-line unchanged">
            <span className="line-num">41</span>
            <span className="code">    const user = await this.db.users.findOne(userId);</span>
          </div>
          <div className="diff-line removed">
            <span className="line-num">42</span>
            <span className="code">-   return user.profile;</span>
          </div>
          <div className="diff-line added">
            <span className="line-num">42</span>
            <span className="code">+   if (!user) throw new Error('User not found');</span>
          </div>
          <div className="diff-line added">
            <span className="line-num">43</span>
            <span className="code">+   return user.profile || null;</span>
          </div>
          <div className="diff-line unchanged">
            <span className="line-num">44</span>
            <span className="code">  &#125;</span>
          </div>
        </div>

        <div className="diff-footer flex-center">
          {status === 'pending' && (
            <button className="btn btn-primary animate-pulse" onClick={handleCreatePR}>
              <GitPullRequest size={18} /> Create Pull Request
            </button>
          )}
          {status === 'creating' && (
            <button className="btn btn-outline" disabled>
              <span className="spinner"></span> Generating PR...
            </button>
          )}
          {status === 'success' && (
            <div className="success-message text-success flex-center animate-shake">
              <CheckCircle2 size={24} /> 
              <span>PR #402 Created Successfully</span>
              <button className="btn btn-outline btn-sm ml-4">
                <GitMerge size={14} /> Auto-Merge
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AutoFixPR;
