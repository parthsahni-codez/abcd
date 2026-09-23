"use client";
import React, { useState, useEffect } from 'react';
import { Bell, ShieldAlert, Cpu } from 'lucide-react';
import './SmartAlerts.css';

const SmartAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    // Simulate incoming alerts
    setTimeout(() => {
      setAlerts(prev => [...prev, { id: 1, type: 'warning', text: 'Dependency conflict detected in package.json.', time: 'Just now' }]);
    }, 2000);

    setTimeout(() => {
      setAlerts(prev => [...prev, { id: 2, type: 'info', text: 'AutoDevOps AI scaling resources for build optimization.', time: '1m ago' }]);
    }, 5000);
  }, []);

  return (
    <div className="smart-alerts-panel">
      <div className="alerts-header flex-between">
        <div className="flex-center" style={{gap: '0.5rem'}}>
          <Bell size={18} /> Smart Alerts
        </div>
        <span className="alerts-count">{alerts.length}</span>
      </div>
      
      <div className="alerts-list">
        {alerts.length === 0 ? (
          <div className="text-muted text-center" style={{padding: '1rem'}}>No active alerts</div>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className={`alert-item slide-in ${alert.type}`}>
              <div className="alert-icon">
                {alert.type === 'warning' ? <ShieldAlert size={16} /> : <Cpu size={16} />}
              </div>
              <div className="alert-content">
                <p>{alert.text}</p>
                <span className="alert-time">{alert.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SmartAlerts;
