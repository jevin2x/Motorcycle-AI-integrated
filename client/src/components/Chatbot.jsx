import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Sparkles, Bot, User, RotateCcw, Minimize2 } from 'lucide-react';

const WELCOME = {
  role: 'assistant',
  content: "Hey there! 👋 I'm MotoBot, your AI bike matchmaker. Ask me anything about our inventory, prices or which ride fits you — every reply is freshly generated.",
};

const SUGGESTIONS = [
  'Show me sport bikes',
  'Bikes under $10,000',
  'Best first bike?',
  'Book a test ride',
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({ mode: 'demo', available: false });
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetch('/api/chat/status')
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {});
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  useEffect(() => {
    const handler = (e) => {
      setOpen(true);
      const text = e.detail;
      setTimeout(() => {
        setInput(text);
        inputRef.current?.focus();
      }, 120);
    };
    window.addEventListener('motobot:ask', handler);
    return () => window.removeEventListener('motobot:ask', handler);
  }, []);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || busy) return;

    const next = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setBusy(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply || 'Sorry, I had trouble answering that. Try again?',
          mode: data.mode,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Connection lost. Please try again in a moment. 🔌' },
      ]);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  return (
    <>
      {open && (
        <div className="chat-panel" role="dialog" aria-label="MotoBot chat">
          <div className="chat-header">
            <div className="chat-avatar"><Bot size={22} /></div>
            <div className="chat-title">
              <strong>MotoBot</strong>
              <span className="status-line">
                <i className={status.available ? 'online' : ''} />
                {status.available
                  ? `AI online · ${status.provider === 'openrouter' ? 'OpenRouter' : 'free gateway'}`
                  : 'Connecting to AI...'}
              </span>
            </div>
            <button className="icon-btn" onClick={() => setMessages([WELCOME])} title="New chat">
              <RotateCcw size={17} />
            </button>
            <button className="icon-btn" onClick={() => setOpen(false)} title="Minimize">
              <Minimize2 size={17} />
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>
                <span className="msg-icon">
                  {m.role === 'assistant' ? <Bot size={15} /> : <User size={15} />}
                </span>
                <div className="bubble">{m.content}</div>
              </div>
            ))}

            {busy && (
              <div className="msg assistant">
                <span className="msg-icon"><Bot size={15} /></span>
                <div className="bubble typing"><i /><i /><i /></div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {messages.length <= 1 && (
            <div className="suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          )}

          <form
            className="chat-input"
            onSubmit={(e) => { e.preventDefault(); send(); }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a bike..."
              aria-label="Chat message"
            />
            <button type="submit" disabled={busy || !input.trim()} aria-label="Send">
              <Send size={18} />
            </button>
          </form>
          <div className="chat-footer"><Sparkles size={12} /> Powered by free AI models · no canned replies</div>
        </div>
      )}

      <button
        className={`chat-launcher ${open ? 'hidden' : ''}`}
        onClick={() => setOpen(true)}
        aria-label="Open MotoBot chat"
      >
        {open ? <X size={26} /> : <MessageCircle size={26} />}
        {!open && <span className="launcher-dot" />}
      </button>
    </>
  );
}
