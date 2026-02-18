
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from './api.jsx';
import './styles.css';
import './App.css';
import './index.css';

/* =======================
   Day Separator
======================= */
function DaySeparator({ dateStr }) {
  return (
    <div className="day-sep" aria-hidden>
      <span>{dateStr}</span>
    </div>
  );
}

/* =======================
   Message Bubble
======================= */
function MessageBubble({ m }) {
  const isUser = m.role === 'user';
  const cls = isUser ? 'bubble user' : 'bubble ai';

  return (
    <div
      className={cls}
      
    >
      <div className="role">{isUser ? 'You' : 'AI'}</div>

      {/* TEXT / MARKDOWN */}
      <div className="text">
        {isUser ? (
          <span>{m.text}</span>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              pre: ({ node, ...props }) => (
                <pre className="md-pre" {...props} />
              ),
              code: ({ node, inline, ...props }) =>
                inline ? (
                  <code className="md-inline-code" {...props} />
                ) : (
                  <code className="md-code" {...props} />
                )
            }}
          >
            {m.text}
          </ReactMarkdown>
        )}
      </div>

     
    </div>
  );
}

/* =======================
   Typing Indicator
======================= */
function TypingBubble() {
  return (
    <div className="message-row ai">
      <div className="bubble ai typing" aria-hidden>
        <div className="dots" aria-hidden>
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}

/* =======================
   Group Messages by Day
======================= */
function groupByDay(messages) {
  const groups = [];
  messages.forEach((m) => {
    const d = new Date(m.createdAt);
    const key = d.toISOString().slice(0, 10);
    const existing = groups.find(g => g.dateKey === key);
    if (existing) existing.messages.push(m);
    else groups.push({ dateKey: key, date: d, messages: [m] });
  });
  groups.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  return groups;
}

/* =======================
   MAIN APP
======================= */
export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [stats, setStats] = useState({ totalMessages: 0, totalTokens: 0 });
  const bottomRef = useRef(null);

  /* -------- Fetch all data -------- */
  const fetchAll = async () => {
    try {
      const [res, modelsRes, statsRes] = await Promise.all([
        api.getMessages(),
        api.getModels(),
        api.getStats()
      ]);

      if (res?.success) setMessages(res.messages || []);

      if (modelsRes?.success) {
        setModels(modelsRes.models || []);
        if (!selectedModel && modelsRes.models?.length > 0) {
          setSelectedModel(modelsRes.models[0].id);
        }
      }

      if (statsRes?.success) {
        setStats({
          totalMessages: statsRes.totalMessages,
          totalTokens: statsRes.totalTokens
        });
      }
    } catch (err) {
      console.error('FetchAll error:', err);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, []);

  /* -------- Auto scroll -------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  /* -------- Send Message -------- */
  const send = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setTyping(true);

    const userText = input.trim();
    setInput('');

    try {
      const res = await api.postMessage(userText, selectedModel);
      if (res?.success) {
        setMessages(res.messages || []);
        const st = await api.getStats();
        if (st?.success) {
          setStats({
            totalMessages: st.totalMessages,
            totalTokens: st.totalTokens
          });
        }
      }
    } catch (err) {
      console.error('Send error:', err);
    } finally {
      setLoading(false);
      setTyping(false);
    }
  };

  /* -------- Clear Chat -------- */
  const clearAll = async () => {
    if (!window.confirm('Clear all chat history? This cannot be undone.')) return;

    try {
      const res = await api.clearMessages();
      if (res?.success) {
        setMessages([]);
        setStats({ totalMessages: 0, totalTokens: 0 });
      }
    } catch (err) {
      console.error('Clear error:', err);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const grouped = groupByDay(messages);

  return (
    <div className="app">
  <nav className="navbar">
    <div className="logo">⚡ AI Chat</div>
    
  </nav>


      <div className="chatContainer" role="application" aria-labelledby="chat-title">
        {/* ---------- TOP BAR ---------- */}
        <div className="topbar" role="region" aria-label="Chat controls">
          <div className="controls">
            <label className="model-select">
              Model:
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                {models.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </label>

            <button
              className="clear-btn"
              onClick={clearAll}
              aria-label="Clear chat history"
            >
              Clear
            </button>
          </div>
        </div>

        {/* ---------- MESSAGES ---------- */}
        <div className="messages" role="log" aria-live="polite">
          {grouped.length === 0 ? (
            <div className="empty">No messages yet — say hi!</div>
          ) : (
            grouped.map(g => (
              <div key={g.dateKey} className="day-group">
                <DaySeparator dateStr={new Date(g.dateKey).toLocaleDateString()} />
                {g.messages.map(m => (
                  <div
                    key={m._id || m.createdAt}
                    className={`message-row ${m.role === 'user' ? 'user' : 'ai'}`}
                  >
                    <MessageBubble m={m} />
                  </div>
                ))}
              </div>
            ))
          )}

          {typing && <TypingBubble />}
          <div ref={bottomRef} />
        </div>

        {/* ---------- INPUT ---------- */}
        <div className="inputBar" role="region" aria-label="Message input">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a message..."
            aria-label="Type a message"
          />
          <button
            onClick={send}
            disabled={loading}
            aria-label="Send message"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
