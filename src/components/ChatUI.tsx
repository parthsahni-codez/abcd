"use client";
import React, { useState } from 'react';
import { MessageSquare, Bot, User, Check, X, Edit2 } from 'lucide-react';
import './ChatUI.css';

const ChatUI: React.FC = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'I am 78% confident that the issue is a missing ID in the mocked user data for the integration test. Should I apply this fix?' }
  ]);

  const [resolved, setResolved] = useState(false);

  const handleAction = (action: string) => {
    setMessages(prev => [...prev, { sender: 'user', text: `Action: ${action}` }]);
    if (action === 'Approve') {
      setTimeout(() => {
        setMessages(prev => [...prev, { sender: 'bot', text: 'Fix approved. Generating Pull Request...' }]);
        setResolved(true);
      }, 1000);
    }
  };

  return (
    <section className="container chat-ui-section">
      <div className="section-header text-center">
        <h2>Human-in-the-Loop Chat</h2>
        <p className="text-muted">Intervene when the AI requires human context or approval.</p>
      </div>

      <div className="chat-container glass-panel">
        <div className="chat-header">
          <MessageSquare size={20} className="text-primary" /> AutoDevOps Assistant
          {resolved && <span className="status-badge done ml-auto">Resolved</span>}
        </div>
        
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-bubble ${msg.sender === 'bot' ? 'bot' : 'user'}`}>
              <div className="avatar">
                {msg.sender === 'bot' ? <Bot size={18} /> : <User size={18} />}
              </div>
              <div className="message-text">
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
          {!resolved && messages.length === 1 && (
            <div className="action-buttons animate-float">
              <button className="btn btn-success" onClick={() => handleAction('Approve')}>
                <Check size={16} /> Approve
              </button>
              <button className="btn btn-error" onClick={() => handleAction('Reject')}>
                <X size={16} /> Reject
              </button>
              <button className="btn btn-outline" onClick={() => handleAction('Modify')}>
                <Edit2 size={16} /> Modify
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ChatUI;
