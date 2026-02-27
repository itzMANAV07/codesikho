import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { languages, quickQuestions } from './languages';
import { getAIResponse } from './aiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/* ─── syntax highlighter ─────────────────────────────────── */
function highlight(code, lang) {
  const kw = {
    python: ['def','class','import','from','return','if','else','elif','for','while','in','not','and','or','True','False','None','try','except','with','as','lambda','pass','break','continue','print','len','range','self','super','yield'],
    javascript: ['const','let','var','function','return','if','else','for','while','class','import','export','default','new','this','true','false','null','undefined','async','await','try','catch','finally','typeof','instanceof','switch','case','break'],
  }[lang] || [];
  let s = code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  s = s.replace(/("""[\s\S]*?"""|'''[\s\S]*?'''|"[^"]*"|'[^']*'|`[^`]*`)/g,'<em class="s">$1</em>');
  s = s.replace(/(#[^\n]*|\/\/[^\n]*)/g,'<em class="c">$1</em>');
  s = s.replace(/\b(\d+\.?\d*)\b/g,'<em class="n">$1</em>');
  kw.forEach(k => { s = s.replace(new RegExp(`\\b(${k})\\b`,'g'),'<em class="k">$1</em>'); });
  return s;
}

/* ─── CodeBlock ──────────────────────────────────────────── */
function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const display = lang || 'code';
  return (
    <div className="cb">
      <div className="cb-bar">
        <span className="cb-lang">{display}</span>
        <button className="cb-copy" onClick={copy}>
          {copied ? <><CheckIcon/> Copied!</> : <><CopyIcon/> Copy code</>}
        </button>
      </div>
      <pre className="cb-pre"><code dangerouslySetInnerHTML={{__html: highlight(code, display)}}/></pre>
    </div>
  );
}

/* ─── Markdown renderer ──────────────────────────────────── */
function Prose({ text, isUser }) {
  const blocks = [];
  const re = /```(\w*)\n?([\s\S]*?)```/g;
  let last = 0, m, i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) blocks.push(
      <div key={i++} className="md-wrap">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text.slice(last, m.index)}</ReactMarkdown>
      </div>
    );
    blocks.push(<CodeBlock key={i++} lang={m[1]} code={m[2].trim()}/>);
    last = m.index + m[0].length;
  }
  if (last < text.length) blocks.push(
    <div key={i++} className="md-wrap">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text.slice(last)}</ReactMarkdown>
    </div>
  );
  return <div className={`prose${isUser ? ' prose-user' : ''}`}>{blocks}</div>;
}

/* ─── Icons ──────────────────────────────────────────────── */
const CopyIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>);
const CheckIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>);
const SendIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>);
const PlusIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const MenuIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);
const BotIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M12 11V7"/><circle cx="12" cy="5" r="2"/><line x1="8" y1="15" x2="8" y2="17"/><line x1="16" y1="15" x2="16" y2="17"/><path d="M7 11V9a5 5 0 0 1 10 0v2"/></svg>);
/* ─── Custom Logo (chat bubble + two eyes) ───────────────── */
const Logo = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4ade80"/>
        <stop offset="50%" stopColor="#22d3ee"/>
        <stop offset="100%" stopColor="#3b82f6"/>
      </linearGradient>
      <linearGradient id="logoGradSm" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4ade80"/>
        <stop offset="50%" stopColor="#22d3ee"/>
        <stop offset="100%" stopColor="#3b82f6"/>
      </linearGradient>
    </defs>
    {/* Chat bubble outline */}
    <path
      d="M20 15 Q20 8 27 8 L73 8 Q80 8 80 15 L80 58 Q80 65 73 65 L52 65 L38 80 L38 65 L27 65 Q20 65 20 58 Z"
      stroke="url(#logoGrad)"
      strokeWidth="5.5"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Dark inner circle / face */}
    <circle cx="50" cy="37" r="16" fill="rgba(10,20,50,0.55)"/>
    {/* Green left eye */}
    <circle cx="43" cy="37" r="5.5" fill="#4ade80"/>
    {/* Blue right eye */}
    <circle cx="57" cy="37" r="5.5" fill="#3b82f6"/>
  </svg>
);

/* Small logo variant for avatar (no defs duplication issue) */
const LogoAvatar = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lgA" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4ade80"/>
        <stop offset="50%" stopColor="#22d3ee"/>
        <stop offset="100%" stopColor="#3b82f6"/>
      </linearGradient>
    </defs>
    <path d="M20 15 Q20 8 27 8 L73 8 Q80 8 80 15 L80 58 Q80 65 73 65 L52 65 L38 80 L38 65 L27 65 Q20 65 20 58 Z"
      stroke="url(#lgA)" strokeWidth="5.5" strokeLinejoin="round" fill="none"/>
    <circle cx="50" cy="37" r="16" fill="rgba(10,20,50,0.55)"/>
    <circle cx="43" cy="37" r="5.5" fill="#4ade80"/>
    <circle cx="57" cy="37" r="5.5" fill="#3b82f6"/>
  </svg>
);

const GlobeIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>);
const ChevronIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>);
const TrashIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>);
const ChatIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>);
const Spinner = () => (<svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>);
const SunIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>);
const MoonIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>);
const MicIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M19 10a7 7 0 0 1-14 0"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>);
const StopIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>);

const ts = () => new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'});

const WELCOME = {
  en: "Hello! I'm **CodeSikho AI** — your personal coding tutor built for Indian students.\n\nAsk me about any **error**, **concept**, or **programming topic** and I'll explain it clearly with examples!",
  hi: "नमस्ते! मैं **CodeSikho AI** हूं — भारतीय छात्रों के लिए बना आपका personal coding tutor।\n\nकिसी भी **error**, **concept**, या **programming topic** के बारे में पूछें!",
  ta: "வணக்கம்! நான் **CodeSikho AI** — இந்திய மாணவர்களுக்காக உருவாக்கப்பட்ட coding tutor.\n\nஎந்த **error**, **concept** பற்றியும் கேளுங்கள்!",
  te: "నమస్కారం! నేను **CodeSikho AI** — భారతీయ విద్యార్థుల కోసం తయారైన coding tutor.\n\nఏ **error**, **concept** గురించైనా అడగండి!",
  bn: "নমস্কার! আমি **CodeSikho AI** — ভারতীয় ছাত্রদের জন্য তৈরি coding tutor।\n\nযেকোনো **error** বা **concept** সম্পর্কে জিজ্ঞাসা করুন!",
  kn: "ನಮಸ್ಕಾರ! ನಾನು **CodeSikho AI** — ಭಾರತೀಯ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ತಯಾರಾದ coding tutor.\n\nಯಾವ **error**, **concept** ಬಗ್ಗೆಯಾದರೂ ಕೇಳಿ!",
  ml: "നമസ്കാരം! ഞാൻ **CodeSikho AI** — ഇന്ത്യൻ വിദ്യാർത്ഥികൾക്കായി നിർമ്മിച്ച coding tutor.\n\nഏത് **error**, **concept** സംബന്ധിച്ചും ചോദിക്കൂ!",
};

/* helper — get first user message as title */
const getTitle = (messages) => {
  const first = messages.find(m => m.role === 'user');
  if (!first) return 'New chat';
  return first.text.slice(0, 36) + (first.text.length > 36 ? '…' : '');
};

/* ═══════════════════════════════════════════════════════════
   APP
═══════════════════════════════════════════════════════════ */
export default function App() {
  const [msgs, setMsgs]         = useState([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [lang, setLang]         = useState('en');
  const [history, setHistory]   = useState([]);
  const [sidebar, setSidebar]   = useState(true);
  const [langOpen, setLangOpen] = useState(false);
  const [dark, setDark]         = useState(true);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  // Chat history: array of { id, title, messages, history, lang }
  const [chats, setChats]           = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);

  const endRef = useRef(null);
  const taRef  = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({behavior:'smooth'}); }, [msgs, loading]);

  const resize = () => {
    const t = taRef.current;
    if (t) { t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 160) + 'px'; }
  };

  const toggleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Your browser does not support voice input. Please use Chrome.'); return; }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const rec = new SR();
    rec.lang = lang === 'hi' ? 'hi-IN'
      : lang === 'ta' ? 'ta-IN'
      : lang === 'te' ? 'te-IN'
      : lang === 'bn' ? 'bn-IN'
      : lang === 'kn' ? 'kn-IN'
      : lang === 'ml' ? 'ml-IN'
      : 'en-IN';
    rec.continuous = false;
    rec.interimResults = true;

    rec.onstart = () => setListening(true);
    rec.onend   = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
      setInput(transcript);
      if (taRef.current) { taRef.current.style.height = 'auto'; taRef.current.style.height = Math.min(taRef.current.scrollHeight, 160) + 'px'; }
    };

    recognitionRef.current = rec;
    rec.start();
  };

  /* Start a brand new chat */
  const newChat = () => {
    // Save current chat if it has messages
    if (msgs.length > 0) saveCurrentChat();
    setMsgs([]);
    setHistory([]);
    setActiveChatId(null);
    setInput('');
    if (taRef.current) taRef.current.style.height = 'auto';
  };

  /* Save current session to history */
  const saveCurrentChat = (currentMsgs = msgs, currentHistory = history) => {
    if (currentMsgs.length === 0) return;
    const id = activeChatId || Date.now();
    const title = getTitle(currentMsgs);
    setChats(prev => {
      const exists = prev.find(c => c.id === id);
      if (exists) {
        return prev.map(c => c.id === id ? {...c, title, messages: currentMsgs, history: currentHistory, lang} : c);
      }
      return [{ id, title, messages: currentMsgs, history: currentHistory, lang }, ...prev];
    });
    setActiveChatId(id);
  };

  /* Load a past chat */
  const loadChat = (chat) => {
    if (msgs.length > 0) saveCurrentChat();
    setMsgs(chat.messages);
    setHistory(chat.history);
    setLang(chat.lang);
    setActiveChatId(chat.id);
    setSidebar(window.innerWidth > 768);
  };

  /* Delete a chat from history */
  const deleteChat = (e, id) => {
    e.stopPropagation();
    setChats(prev => prev.filter(c => c.id !== id));
    if (activeChatId === id) { setMsgs([]); setHistory([]); setActiveChatId(null); }
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = {id: Date.now(), role:'user', text: input, time: ts()};
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs);
    const newHist = [...history, {role:'user', content: input}];
    const txt = input;
    setInput('');
    if (taRef.current) taRef.current.style.height = 'auto';
    setLoading(true);
    try {
      const res = await getAIResponse(txt, lang, history);
      const aiMsg = {id: Date.now(), role:'ai', text: res, time: ts()};
      const finalMsgs = [...newMsgs, aiMsg];
      const finalHist = [...newHist, {role:'assistant', content: res}];
      setMsgs(finalMsgs);
      setHistory(finalHist);
      // Auto-save to history after each AI reply
      saveCurrentChat(finalMsgs, finalHist);
    } catch {
      const errMsg = {id: Date.now(), role:'ai', text: 'Something went wrong. Please try again.', time: ts()};
      setMsgs(p => [...p, errMsg]);
    } finally { setLoading(false); }
  };

  const onKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };
  const curLang = languages.find(l => l.code === lang) || languages[0];
  const curQs   = quickQuestions[lang] || quickQuestions.en;

  return (
    <div className={`root ${dark ? 'dark' : 'light'}`}>

      {/* ── SIDEBAR ── */}
      <aside className={`aside ${sidebar ? 'open' : 'closed'}`}>
        <div className="aside-head">
          <div className="logo-row">
            <div className="logo-gem"><Logo size={28}/></div>
            {sidebar && <span className="logo-name">CodeSikho</span>}
          </div>
          <button className="icon-btn" onClick={() => setSidebar(p => !p)}>
            <MenuIcon/>
          </button>
        </div>

        {sidebar && (
          <>
            <div className="aside-scroll">
              <button className="new-btn" onClick={newChat}>
                <PlusIcon/> New chat
              </button>

              {/* Chat History */}
              {chats.length > 0 && (
                <>
                  <p className="aside-label">Recent</p>
                  {chats.map(chat => (
                    <div
                      key={chat.id}
                      className={`hist-item ${activeChatId === chat.id ? 'active' : ''}`}
                      onClick={() => loadChat(chat)}
                    >
                      <ChatIcon/>
                      <span className="hist-title">{chat.title}</span>
                      <button className="hist-del" onClick={e => deleteChat(e, chat.id)} title="Delete">
                        <TrashIcon/>
                      </button>
                    </div>
                  ))}
                </>
              )}

              {chats.length === 0 && (
                <div className="hist-empty">
                  <p>Your conversations will appear here</p>
                </div>
              )}
            </div>

            <div className="aside-foot">
              {/* Language label block */}
              <div className="lang-label-block">
                <span className="lang-label-icon"><GlobeIcon/></span>
                <span className="lang-label-text">Response Language</span>
              </div>
              <div className="lang-selector" onClick={() => setLangOpen(p => !p)}>
                <GlobeIcon/>
                <span>{curLang.flag} {curLang.nativeName}</span>
                <span className={`caret ${langOpen ? 'open' : ''}`}><ChevronIcon/></span>
              </div>
              {langOpen && (
                <div className="lang-menu">
                  {languages.map(l => (
                    <button key={l.code} className={`lang-opt ${lang === l.code ? 'sel' : ''}`}
                      onClick={() => { setLang(l.code); setLangOpen(false); }}>
                      <span>{l.flag}</span>
                      <span>{l.nativeName}</span>
                      {lang === l.code && <span className="lang-check">✓</span>}
                    </button>
                  ))}
                </div>
              )}
              <div className="user-pill">
                <div className="user-av">S</div>
                <div>
                  <p className="user-name">Student</p>
                  <p className="user-plan">Free Plan</p>
                </div>
                <button className="theme-toggle-sm" onClick={() => setDark(p => !p)} title="Toggle theme">
                  {dark ? <SunIcon/> : <MoonIcon/>}
                </button>
              </div>
            </div>
          </>
        )}
      </aside>

      {/* ── MAIN ── */}
      <main className="main">

        {/* Topbar */}
        <header className={`topbar ${msgs.length > 0 ? 'tb-visible' : 'tb-hidden'}`}>
          {!sidebar && (
            <button className="icon-btn" onClick={() => setSidebar(true)}><MenuIcon/></button>
          )}
          <div className="tb-center">
            <div className="model-chip">
              <Logo size={22}/>
              <span>CodeSikho AI</span>
              <span className="model-sub">· {curLang.flag} {curLang.name}</span>
            </div>
          </div>
          <div className="tb-right">
            <button className="theme-toggle" onClick={() => setDark(p => !p)} title="Toggle theme">
              <span className={`toggle-track ${dark ? '' : 'light-mode'}`}>
                <span className="toggle-thumb">{dark ? <MoonIcon/> : <SunIcon/>}</span>
              </span>
            </button>
            <div className="status-badge">
              <span className="status-dot"/>
              <span>Online</span>
            </div>
          </div>
        </header>

        {/* ── HOME STATE ── */}
        {msgs.length === 0 && (
          <div className="home">
            <div className="home-body">
              <div className="home-icon"><Logo size={36}/></div>
              <h1 className="home-title">What can I help with?</h1>
              <p className="home-sub">Ask me about coding errors, concepts, or debugging in {curLang.flag} {curLang.name}</p>

              <div className="composer home-composer">
                <div className="composer-box">
                  <textarea
                    ref={taRef}
                    value={input}
                    onChange={e => { setInput(e.target.value); resize(); }}
                    onKeyPress={onKey}
                    placeholder={`Message CodeSikho AI in ${curLang.name}…`}
                    rows={1}
                    disabled={loading}
                    autoFocus
                  />
                  <button className={`mic-btn ${listening ? 'active' : ''}`} onClick={toggleVoice} title="Voice input">
                    {listening ? <StopIcon/> : <MicIcon/>}
                  </button>
                  <button className={`send ${input.trim() && !loading ? 'on' : ''}`} onClick={send} disabled={!input.trim() || loading}>
                    {loading ? <Spinner/> : <SendIcon/>}
                  </button>
                </div>
                <p className="composer-hint">Press Enter to send · Shift+Enter for new line</p>
              </div>

              <div className="starter-grid">
                {curQs.map((q,i) => (
                  <button key={i} className="starter-card" onClick={() => { setInput(q); taRef.current?.focus(); }}>
                    <span>{q}</span><ChevronIcon/>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CHAT STATE ── */}
        {msgs.length > 0 && (
          <>
            <div className="feed">
              {msgs.map((m, idx) => (
                <div key={m.id} className={`row ${m.role}`} style={{animationDelay:`${Math.min(idx*.04,.2)}s`}}>
                  {m.role === 'ai' && (
                    <div className="av">
                      <div className="av-ai"><LogoAvatar size={24}/></div>
                    </div>
                  )}
                  <div className="bubble-wrap">
                    {m.role === 'ai' && (
                      <div className="bubble-meta">
                        <span className="bubble-who">CodeSikho AI</span>
                        <span className="bubble-time">{m.time}</span>
                      </div>
                    )}
                    <div className={`bubble ${m.role}`}>
                      <Prose text={m.text} isUser={m.role === 'user'}/>
                      {m.role === 'user' && (
                        <span className="user-time">{m.time}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="row ai">
                  <div className="av"><div className="av-ai"><LogoAvatar size={24}/></div></div>
                  <div className="bubble-wrap">
                    <div className="bubble-meta"><span className="bubble-who">CodeSikho AI</span></div>
                    <div className="bubble ai"><div className="typing"><span/><span/><span/></div></div>
                  </div>
                </div>
              )}
              <div ref={endRef}/>
            </div>

            <div className="composer">
              <div className="composer-box">
                <textarea
                  ref={taRef}
                  value={input}
                  onChange={e => { setInput(e.target.value); resize(); }}
                  onKeyPress={onKey}
                  placeholder={`Message CodeSikho AI in ${curLang.name}…`}
                  rows={1}
                  disabled={loading}
                />
                <button className={`mic-btn ${listening ? 'active' : ''}`} onClick={toggleVoice} title="Voice input">
                  {listening ? <StopIcon/> : <MicIcon/>}
                </button>
                <button className={`send ${input.trim() && !loading ? 'on' : ''}`} onClick={send} disabled={!input.trim() || loading}>
                  {loading ? <Spinner/> : <SendIcon/>}
                </button>
              </div>
              <p className="composer-hint">Press Enter to send · Shift+Enter for new line · {curLang.flag} {curLang.name}</p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}