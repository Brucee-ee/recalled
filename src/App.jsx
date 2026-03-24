// ============================================================
// Recalled - AI Flashcard App
// Built with React (a popular JavaScript UI library)
//
// How this file is structured:
//   1. CSS styles (the visual design)
//   2. Some helper data (the list of quiz modes)
//   3. The main App component (all the logic + UI)
//
// React basics you need to know:
//   - useState() = a variable that makes the screen re-render when it changes
//   - useRef()   = a reference to a DOM element or a value that doesn't re-render
//   - useEffect()= runs code when a variable changes (like a watcher)
//   - JSX        = looks like HTML but it's actually JavaScript
// ============================================================

import { useState, useRef, useEffect } from "react";

// ============================================================
// ALL THE CSS STYLES
// Written as a big string and injected into a <style> tag
// This keeps everything in one file which is easier to manage
// ============================================================
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=VT323&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  /* CSS variables - change these to retheme the whole app */
  :root {
    --bg: #020c02;
    --surface: #050f05;
    --surface2: #0a1a0a;
    --border: #1a3a1a;
    --green: #00ff41;
    --green-dim: #00aa2b;
    --green-dark: #004410;
    --green-muted: #2a6b2a;
    --text: #c8ffc8;
    --muted: #3a7a3a;
    --red: #ff4141;
    --amber: #ffb700;
    --cyan: #00ffff;
  }

  .rc {
    font-family: 'Share Tech Mono', monospace;
    background: var(--bg);
    color: var(--green);
    min-height: 100vh;
    padding: 24px 20px;
    position: relative;
    overflow-x: hidden;
  }

  /* Fake CRT scanlines using a repeating gradient overlay */
  .rc::before {
    content: '';
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.08) 2px,
      rgba(0,0,0,0.08) 4px
    );
    pointer-events: none;
    z-index: 9999;
  }

  /* Subtle screen flicker animation - pure CSS */
  @keyframes flicker {
    0%,100% { opacity: 1; }
    92% { opacity: 1; }
    93% { opacity: 0.92; }
    94% { opacity: 1; }
    96% { opacity: 0.95; }
  }
  .rc { animation: flicker 8s infinite; }

  .glow { text-shadow: 0 0 8px var(--green), 0 0 20px var(--green-dim); }
  .glow-sm { text-shadow: 0 0 4px var(--green); }

  .logo {
    font-family: 'VT323', monospace;
    font-size: 38px;
    color: var(--green);
    letter-spacing: 3px;
    margin-bottom: 4px;
    text-shadow: 0 0 10px var(--green), 0 0 30px var(--green-dim);
  }
  .logo-sub { font-size: 11px; color: var(--muted); letter-spacing: 2px; margin-bottom: 28px; }

  .terminal {
    background: var(--surface);
    border: 1px solid var(--green-dim);
    border-radius: 4px;
    max-width: 660px;
    margin: 0 auto;
    box-shadow: 0 0 20px rgba(0,255,65,0.08), inset 0 0 40px rgba(0,0,0,0.4);
  }
  .term-bar {
    background: var(--green-dark);
    border-bottom: 1px solid var(--green-dim);
    padding: 8px 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: var(--green-dim);
    letter-spacing: 1px;
  }
  .term-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green-dim); opacity: 0.6; }
  .term-body { padding: 24px; }

  .tabs { display: flex; gap: 0; margin-bottom: 20px; border: 1px solid var(--border); border-radius: 2px; overflow: hidden; }
  .tab {
    flex: 1; padding: 9px 16px; border: none; font-family: inherit; font-size: 12px;
    letter-spacing: 1px; cursor: pointer; background: transparent; color: var(--muted);
    transition: all .15s; text-transform: uppercase; border-right: 1px solid var(--border);
  }
  .tab:last-child { border-right: none; }
  .tab.on { background: var(--green-dark); color: var(--green); text-shadow: 0 0 6px var(--green); }
  .tab:hover:not(.on) { color: var(--green-dim); }

  .prompt { color: var(--green-dim); font-size: 12px; margin-bottom: 8px; letter-spacing: 1px; }
  .prompt span { color: var(--green); }

  textarea {
    width: 100%; min-height: 180px; background: var(--bg);
    border: 1px solid var(--border); color: var(--text);
    font-family: 'Share Tech Mono', monospace; font-size: 13px;
    padding: 12px; resize: vertical; outline: none;
    transition: border .15s; line-height: 1.7; border-radius: 2px;
    caret-color: var(--green);
  }
  textarea:focus { border-color: var(--green-dim); box-shadow: 0 0 8px rgba(0,255,65,0.1); }
  textarea::placeholder { color: #1a4a1a; }

  .drop {
    border: 1px dashed var(--border); padding: 44px 24px; text-align: center;
    cursor: pointer; transition: all .15s; color: var(--muted); font-size: 13px;
    letter-spacing: 1px; border-radius: 2px; text-transform: uppercase;
  }
  .drop:hover, .drop.has { border-color: var(--green-dim); color: var(--green); }

  .btn {
    background: var(--green-dark); color: var(--green); border: 1px solid var(--green-dim);
    border-radius: 2px; padding: 12px 20px; font-family: inherit; font-size: 13px;
    cursor: pointer; transition: all .2s; width: 100%; margin-top: 16px;
    letter-spacing: 2px; text-transform: uppercase; text-shadow: 0 0 6px var(--green);
  }
  .btn:hover { background: #0a2a0a; box-shadow: 0 0 12px rgba(0,255,65,0.2); }
  .btn:disabled { opacity: .3; cursor: not-allowed; box-shadow: none; }
  .btn-ghost {
    background: transparent; color: var(--muted); border: 1px solid var(--border);
    border-radius: 2px; padding: 8px 14px; font-family: inherit; font-size: 11px;
    cursor: pointer; transition: all .15s; letter-spacing: 1px; text-transform: uppercase;
  }
  .btn-ghost:hover { border-color: var(--green-dim); color: var(--green); }

  .err { color: var(--red); font-size: 12px; margin-top: 10px; letter-spacing: 1px; }
  .err::before { content: '> ERR: '; }

  .spin { animation: spin 1s linear infinite; display: inline-block; }
  @keyframes spin { to { transform: rotate(360deg); } }

  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  .cursor { animation: blink 1s step-end infinite; color: var(--green); }

  .modes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; max-width: 900px; margin: 0 auto 28px; }
  .mode-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: 2px;
    padding: 16px 12px; cursor: pointer; text-align: left; transition: all .15s;
  }
  .mode-card:hover { border-color: var(--green-dim); background: var(--green-dark); box-shadow: 0 0 10px rgba(0,255,65,0.1); }
  .mode-num { font-size: 10px; color: var(--muted); letter-spacing: 2px; margin-bottom: 6px; }
  .mode-name { font-size: 14px; color: var(--green); letter-spacing: 1px; margin-bottom: 4px; text-shadow: 0 0 4px var(--green); }
  .mode-sub { font-size: 10px; color: var(--muted); line-height: 1.5; letter-spacing: .5px; }

  .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 8px; max-width: 900px; margin: 0 auto 24px; }
  .mini { background: var(--surface); border: 1px solid var(--border); border-radius: 2px; padding: 14px; }
  .mini-front { font-size: 12px; color: var(--green); margin-bottom: 6px; letter-spacing: .5px; }
  .mini-front::before { content: 'Q// '; color: var(--muted); }
  .mini-back { font-size: 11px; color: var(--muted); border-top: 1px solid var(--border); padding-top: 6px; line-height: 1.6; }
  .mini-back::before { content: 'A// '; color: #1a5a1a; }

  .rev-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; max-width: 900px; margin-left: auto; margin-right: auto; flex-wrap: wrap; gap: 10px; }

  .quiz-wrap { max-width: 580px; margin: 0 auto; }
  .topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 8px; }
  .prog-bar { height: 2px; background: var(--border); margin-bottom: 20px; overflow: hidden; }
  .prog-fill { height: 100%; background: var(--green); transition: width .3s ease; box-shadow: 0 0 8px var(--green); }

  .badge { border: 1px solid var(--border); padding: 4px 10px; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; border-radius: 2px; }
  .badge.fire { border-color: var(--amber); color: var(--amber); background: #1a0e00; text-shadow: 0 0 6px var(--amber); }
  .badge.live { border-color: var(--red); color: var(--red); background: #1a0000; }
  .badge.timer { border-color: var(--cyan); color: var(--cyan); background: #001a1a; }
  .badge.timer.warn { border-color: var(--red); color: var(--red); background: #1a0000; animation: blink .5s step-end infinite; }
  .badge.idx { border-color: var(--muted); color: var(--muted); }

  .q-card {
    background: var(--surface); border: 1px solid var(--green-dim); border-radius: 2px;
    padding: 24px; margin-bottom: 14px; box-shadow: 0 0 12px rgba(0,255,65,0.06);
  }
  .q-label { font-size: 10px; color: var(--muted); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
  .q-label::before { content: '> '; }
  .q-text { font-size: 16px; color: var(--text); line-height: 1.6; letter-spacing: .5px; }

  .flip-scene { perspective: 1200px; height: 210px; cursor: pointer; margin-bottom: 12px; }
  .flip-card { width: 100%; height: 100%; position: relative; transform-style: preserve-3d; transition: transform .5s ease; }
  .flip-card.on { transform: rotateY(180deg); }
  .flip-face {
    position: absolute; width: 100%; height: 100%; backface-visibility: hidden;
    background: var(--surface); border: 1px solid var(--green-dim); border-radius: 2px;
    display: flex; align-items: center; justify-content: center; flex-direction: column;
    padding: 28px; text-align: center; box-shadow: 0 0 16px rgba(0,255,65,0.08);
  }
  .flip-back { transform: rotateY(180deg); background: var(--green-dark); }
  .hint { text-align: center; font-size: 11px; color: var(--muted); margin-bottom: 12px; letter-spacing: 1px; text-transform: uppercase; }

  .flip-btns { display: flex; gap: 8px; }
  .btn-ok { flex:1; padding:11px; border:1px solid #22C55E; border-radius:2px; font-family:inherit; font-size:12px; cursor:pointer; background:#0a1f12; color:#4ade80; letter-spacing:1px; text-transform:uppercase; transition:all .15s; }
  .btn-ok:hover { background:#0f2a18; }
  .btn-no { flex:1; padding:11px; border:1px solid var(--red); border-radius:2px; font-family:inherit; font-size:12px; cursor:pointer; background:#1f0a0a; color:#f87171; letter-spacing:1px; text-transform:uppercase; transition:all .15s; }
  .btn-no:hover { background:#2a0f0f; }

  .type-in {
    width:100%; background:var(--bg); border:1px solid var(--border); color:var(--text);
    font-family:'Share Tech Mono',monospace; font-size:14px; padding:12px 14px;
    outline:none; margin-bottom:10px; transition:border .15s; border-radius:2px;
    caret-color:var(--green); letter-spacing:.5px;
  }
  .type-in:focus { border-color:var(--green-dim); }
  .type-in.good { border-color:#22C55E; background:#0a1f12; }
  .type-in.bad { border-color:var(--red); background:#1f0a0a; }
  .feedback { padding:10px 14px; border-radius:2px; font-size:12px; margin-bottom:10px; line-height:1.6; letter-spacing:.5px; }
  .feedback.good { background:#0a1f12; color:#4ade80; border:1px solid #1a4a2a; }
  .feedback.bad { background:#1f0a0a; color:#f87171; border:1px solid #4a1a1a; }

  .mc-opts { display:flex; flex-direction:column; gap:8px; }
  .mc-opt {
    background:var(--surface); border:1px solid var(--border); border-radius:2px;
    padding:12px 14px; font-family:inherit; font-size:12px; color:var(--text);
    cursor:pointer; text-align:left; transition:all .15s; letter-spacing:.5px; line-height:1.5;
  }
  .mc-opt::before { content:'[  ] '; color:var(--muted); }
  .mc-opt:hover:not(:disabled) { border-color:var(--green-dim); background:var(--green-dark); }
  .mc-opt.right { border-color:#22C55E; background:#0a1f12; color:#4ade80; }
  .mc-opt.right::before { content:'[✓] '; color:#4ade80; }
  .mc-opt.wrong { border-color:var(--red); background:#1f0a0a; color:#f87171; }
  .mc-opt.wrong::before { content:'[✗] '; color:#f87171; }
  .mc-opt:disabled { cursor:default; }

  .teach-box { background:var(--surface); border:1px solid var(--green-dim); border-radius:2px; padding:20px; margin-bottom:14px; }
  .teach-prompt { font-size:15px; color:var(--text); line-height:1.6; margin-bottom:14px; }
  .teach-grade { padding:12px 14px; border-radius:2px; font-size:12px; line-height:1.7; margin-bottom:10px; white-space:pre-wrap; letter-spacing:.3px; }
  .teach-grade.good { background:#0a1f12; color:#4ade80; border:1px solid #1a4a2a; }
  .teach-grade.bad { background:#1f0a0a; color:#f87171; border:1px solid #4a1a1a; }
  .teach-grade.med { background:#0a0a1f; color:#93c5fd; border:1px solid #1a1a4a; }

  .boss-banner { border:1px solid var(--amber); border-radius:2px; padding:18px; text-align:center; margin-bottom:14px; background:#0f0800; }
  .boss-title { font-family:'VT323',monospace; font-size:28px; color:var(--amber); letter-spacing:2px; text-shadow:0 0 10px var(--amber); }
  .boss-sub { font-size:11px; color:#8a6a00; letter-spacing:1px; margin-top:4px; }

  .results-wrap { max-width:420px; margin:0 auto; text-align:center; }
  .result-title { font-family:'VT323',monospace; font-size:36px; letter-spacing:2px; color:var(--green); text-shadow:0 0 12px var(--green); margin-bottom:6px; }
  .result-actions { display:flex; flex-direction:column; gap:8px; margin-top:24px; }
`;

// ============================================================
// QUIZ MODES DATA
// Each mode has an id (used in logic), a display number,
// a name shown on screen, and a short description
// ============================================================
const MODES = [
  { id:"flip",     num:"01", name:"FLIP CARD",    sub:"Self-mark your recall" },
  { id:"type",     num:"02", name:"TYPE ANSWER",  sub:"Type from memory" },
  { id:"mc",       num:"03", name:"MULTI-CHOICE", sub:"Four options loaded" },
  { id:"teach",    num:"04", name:"TEACH IT BACK",sub:"AI grades your explanation" },
  { id:"survival", num:"05", name:"SURVIVAL",     sub:"3 lives. Don't waste them." },
  { id:"speedrun", num:"06", name:"SPEED RUN",    sub:"60 seconds. Go." },
];

// Randomises an array - used to shuffle the deck each quiz
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// ============================================================
// MAIN APP COMPONENT
// Everything lives in here - all state, all logic, all UI
// React renders whatever this function returns
// ============================================================
export default function Recalled() {

  // ----------------------------------------------------------
  // STATE
  // useState(default) returns [currentValue, setterFunction]
  // Calling the setter triggers a re-render with the new value
  // ----------------------------------------------------------

  // Which screen to show
  const [view, setView] = useState("input"); // "input" | "review" | "quiz" | "results"

  // Input screen
  const [tab, setTab]         = useState("text");   // "text" or "pdf"
  const [text, setText]       = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  // Generated cards - array of { front: "...", back: "..." }
  const [cards, setCards] = useState([]);

  // Quiz
  const [mode, setMode]         = useState(null);
  const [qIdx, setQIdx]         = useState(0);       // current card index
  const [deck, setDeck]         = useState([]);       // shuffled cards for this session
  const [isBoss, setIsBoss]     = useState(false);
  const [bossQ, setBossQ]       = useState("");
  const [loadingBoss, setLoadingBoss] = useState(false);

  // Per-mode state
  const [flipped, setFlipped]         = useState(false);
  const [typeVal, setTypeVal]         = useState("");
  const [typeRes, setTypeRes]         = useState(null); // "correct" | "incorrect" | null
  const [mcOpts, setMcOpts]           = useState([]);
  const [mcRes, setMcRes]             = useState(null);
  const [teachVal, setTeachVal]       = useState("");
  const [teachRes, setTeachRes]       = useState(null);
  const [loadingTeach, setLoadingTeach] = useState(false);

  // Game mechanics
  const [streak, setStreak] = useState(0);
  const [lives, setLives]   = useState(3);
  const [score, setScore]   = useState({ correct: 0, total: 0 });
  const [timeLeft, setTimeLeft] = useState(60);

  // useRef = a value that persists across renders without causing re-renders
  // Used here to store the timer ID so we can cancel it later
  const timerRef = useRef(null);
  const fileRef  = useRef();

  // ----------------------------------------------------------
  // HELPER: Convert file to base64
  // Anthropic API needs PDFs encoded as base64 strings
  // ----------------------------------------------------------
  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(",")[1]); // remove "data:..." prefix
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // ----------------------------------------------------------
  // HELPER: Call Anthropic Claude API
  // Sends messages to Claude, returns the response as a string
  // ----------------------------------------------------------
  const callClaude = async (messages, systemPrompt) => {
    const body = {
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages,
    };
    if (systemPrompt) body.system = systemPrompt;

    // Call our own Vercel API route - keeps the Anthropic key hidden from the browser
    const res = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return data.content.map(block => block.text || "").join("");
  };

  // ----------------------------------------------------------
  // GENERATE FLASHCARDS
  // Sends notes/PDF to Claude, parses the JSON response
  // ----------------------------------------------------------
  const generate = async () => {
    if (tab === "text" && !text.trim()) return;
    if (tab === "pdf" && !pdfFile) return;
    setLoading(true);
    setError("");

    try {
      // Tell Claude to return only JSON - no markdown, no explanation
      const sys = `You generate flashcards. Return ONLY a valid JSON array, no markdown, no explanation.
Each element: {"front":"question","back":"answer"}. Generate 8-15 cards.`;

      let messages;

      if (tab === "text") {
        messages = [{ role: "user", content: `Generate flashcards from:\n\n${text}` }];
      } else {
        // PDF needs to be base64 encoded and sent as a document block
        const b64 = await toBase64(pdfFile);
        messages = [{
          role: "user",
          content: [
            { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } },
            { type: "text", text: "Generate flashcards from this PDF." }
          ]
        }];
      }

      const raw = await callClaude(messages, sys);
      // Strip any accidental markdown fences before parsing
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setCards(parsed);
      setView("review");

    } catch {
      setError("Failed to generate cards. Check your API key and try again.");
    }

    setLoading(false);
  };

  // ----------------------------------------------------------
  // BUILD MULTIPLE CHOICE OPTIONS
  // Returns 4 options: 1 correct + 3 wrong (from other cards)
  // ----------------------------------------------------------
  const getMC = (idx, d) => {
    const correct     = d[idx].back;
    const distractors = d.filter((_, i) => i !== idx).map(c => c.back).sort(() => Math.random() - 0.5).slice(0, 3);
    return shuffle([...distractors, correct]); // shuffle so correct isn't always last
  };

  // ----------------------------------------------------------
  // GENERATE BOSS QUESTION
  // Claude creates a harder synthesis question from recent cards
  // Triggered every 5 correct answers
  // ----------------------------------------------------------
  const genBoss = async (d, idx) => {
    setLoadingBoss(true);
    try {
      const recent = d.slice(Math.max(0, idx - 4), idx).map(c => `Q: ${c.front}\nA: ${c.back}`).join("\n\n");
      const raw = await callClaude([{
        role: "user",
        content: `Generate ONE harder synthesis question combining multiple concepts from these flashcards. Return only the question.\n\n${recent}`
      }]);
      setBossQ(raw.trim());
    } catch {
      setBossQ("Explain the connections between the concepts you've studied so far.");
    }
    setLoadingBoss(false);
  };

  // ----------------------------------------------------------
  // START QUIZ
  // Shuffles the deck and resets all state for a fresh session
  // ----------------------------------------------------------
  const startQuiz = (m) => {
    const d = shuffle(cards); // new shuffle every time

    setMode(m); setDeck(d); setQIdx(0);
    setFlipped(false);
    setTypeVal(""); setTypeRes(null);
    setMcOpts(getMC(0, d)); setMcRes(null);
    setTeachVal(""); setTeachRes(null);
    setIsBoss(false); setBossQ("");
    setStreak(0); setLives(3);
    setScore({ correct: 0, total: 0 });

    // Speed run: kick off the 60 second countdown
    if (m === "speedrun") {
      setTimeLeft(60);
      clearInterval(timerRef.current); // cancel any existing timer
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); return 0; }
          return t - 1;
        });
      }, 1000); // runs every 1000ms = 1 second
    }

    setView("quiz");
  };

  // ----------------------------------------------------------
  // ADVANCE
  // Called after every answer - updates score, checks game over,
  // triggers boss battles, and moves to the next card
  // ----------------------------------------------------------
  const advance = (correct) => {
    const newStreak = correct ? streak + 1 : 0;
    const newScore  = { correct: score.correct + (correct ? 1 : 0), total: score.total + 1 };
    const newLives  = (!correct && mode === "survival") ? lives - 1 : lives;

    setStreak(newStreak);
    setScore(newScore);
    setLives(newLives);

    // Survival: out of lives = game over
    if (newLives <= 0) { clearInterval(timerRef.current); setScore(newScore); setView("results"); return; }

    const next = qIdx + 1;

    // End of deck = game over
    if (next >= deck.length) { clearInterval(timerRef.current); setScore(newScore); setView("results"); return; }

    // Boss battle triggers every 5 correct (not in speed run)
    if (newScore.correct > 0 && newScore.correct % 5 === 0 && mode !== "speedrun") {
      setIsBoss(true);
      genBoss(deck, next);
      setQIdx(next);
    } else {
      setIsBoss(false);
      setQIdx(next);
    }

    // Reset card-specific state
    setFlipped(false);
    setTypeVal(""); setTypeRes(null);
    setMcOpts(getMC(next, deck)); setMcRes(null);
    setTeachVal(""); setTeachRes(null);
  };

  // ----------------------------------------------------------
  // useEffect: End speed run when timer hits 0
  // Runs whenever timeLeft, mode, or view changes
  // ----------------------------------------------------------
  useEffect(() => {
    if (mode === "speedrun" && timeLeft === 0 && view === "quiz") {
      clearInterval(timerRef.current);
      setView("results");
    }
  }, [timeLeft, mode, view]);

  // ----------------------------------------------------------
  // GRADE TEACH IT BACK
  // Sends user's explanation to Claude for AI grading
  // ----------------------------------------------------------
  const gradeTeach = async () => {
    if (!teachVal.trim()) return;
    setLoadingTeach(true);
    const card = deck[qIdx];
    try {
      const sys = `You are a study coach. Grade the student's explanation. Return ONLY valid JSON:
{"score":"good|medium|poor","feedback":"2-3 sentences on what they got right and missed","correct":true/false}`;
      const raw = await callClaude([{
        role: "user",
        content: `Card: "${card.front}" — Answer: "${card.back}"\nStudent said: "${teachVal}"`
      }], sys);
      const result = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setTeachRes(result);
    } catch {
      setTeachRes({ score: "medium", feedback: "Could not grade. Move on.", correct: false });
    }
    setLoadingTeach(false);
  };

  // Maps score string to CSS class
  const gradeClass = (s) => s === "good" ? "good" : s === "poor" ? "bad" : "med";

  // ============================================================
  // RENDER: INPUT SCREEN
  // ============================================================
  if (view === "input") return (
    <>
      <style>{css}</style>
      <div className="rc">
        <div className="logo glow">RECALLED</div>
        <div className="logo-sub">// AI-POWERED MEMORY SYSTEM v1.0</div>

        <div className="terminal">
          <div className="term-bar">
            <div className="term-dot"/><div className="term-dot"/><div className="term-dot"/>
            <span style={{ marginLeft: 8 }}>recalled@system ~ % input_mode</span>
          </div>
          <div className="term-body">

            {/* Tab switcher between text and PDF input */}
            <div className="tabs">
              <button className={`tab ${tab === "text" ? "on" : ""}`} onClick={() => setTab("text")}>Paste text</button>
              <button className={`tab ${tab === "pdf"  ? "on" : ""}`} onClick={() => setTab("pdf")}>Upload PDF</button>
            </div>

            <div className="prompt">{">"} <span>INPUT</span> — paste study material or upload a PDF <span className="cursor">_</span></div>

            {/* Conditional: show textarea OR file drop zone based on active tab */}
            {tab === "text"
              ? <textarea
                  placeholder="// paste notes, lecture content, or any study material here..."
                  value={text}
                  onChange={e => setText(e.target.value)}
                />
              : <div className={`drop ${pdfFile ? "has" : ""}`} onClick={() => fileRef.current?.click()}>
                  {/* The actual input is hidden - clicking the styled div triggers it */}
                  <input ref={fileRef} type="file" accept=".pdf" style={{ display:"none" }} onChange={e => setPdfFile(e.target.files[0])}/>
                  {pdfFile ? `> file loaded: ${pdfFile.name}` : "[ click to mount PDF ]"}
                </div>
            }

            {error && <div className="err">{error}</div>}

            <button
              className="btn glow-sm"
              onClick={generate}
              disabled={loading || (tab === "text" ? !text.trim() : !pdfFile)}
            >
              {loading ? <><span className="spin">⟳</span>&nbsp; PROCESSING INPUT...</> : "> RUN CARD_GEN"}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  // ============================================================
  // RENDER: REVIEW SCREEN
  // ============================================================
  if (view === "review") return (
    <>
      <style>{css}</style>
      <div className="rc">
        <div className="logo glow">RECALLED</div>
        <div className="rev-header">
          <div>
            <div style={{ fontSize:20, color:"var(--green)", letterSpacing:2 }} className="glow-sm">{cards.length} CARDS LOADED</div>
            <div style={{ fontSize:11, color:"var(--muted)", marginTop:4, letterSpacing:1 }}>// REVIEW DECK THEN SELECT TRAINING MODE</div>
          </div>
          <button className="btn-ghost" onClick={() => setView("input")}>← NEW INPUT</button>
        </div>

        {/* Map over cards array to render each preview */}
        <div className="cards-grid">
          {cards.map((card, i) => (
            <div key={i} className="mini">
              <div className="mini-front">{card.front}</div>
              <div className="mini-back">{card.back}</div>
            </div>
          ))}
        </div>

        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <div style={{ fontSize:11, color:"var(--muted)", letterSpacing:2, marginBottom:10, textTransform:"uppercase" }}>
             SELECT_MODE —
          </div>
          <div className="modes-grid">
            {/* Map over MODES array - onClick starts that quiz mode */}
            {MODES.map(m => (
              <div key={m.id} className="mode-card" onClick={() => startQuiz(m.id)}>
                <div className="mode-num">{m.num}</div>
                <div className="mode-name">{m.name}</div>
                <div className="mode-sub">{m.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  // ============================================================
  // RENDER: QUIZ SCREEN
  // Renders different UI based on the active mode
  // ============================================================
  if (view === "quiz") {
    const card = (!isBoss && deck[qIdx]) ? deck[qIdx] : null;
    const prog = (qIdx / deck.length) * 100; // progress bar percentage

    return (
      <>
        <style>{css}</style>
        <div className="rc">
          <div className="topbar">
            <div className="logo glow" style={{ fontSize:22, marginBottom:0 }}>RECALLED</div>
            <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
              {/* Conditionally show badges depending on mode and state */}
              {mode === "speedrun" && <div className={`badge timer ${timeLeft <= 10 ? "warn" : ""}`}>⏱ {timeLeft}S</div>}
              {streak >= 3         && <div className="badge fire">STREAK ×{streak}</div>}
              {mode === "survival" && <div className="badge live">LIVES: {"♥ ".repeat(lives).trim()}</div>}
              <div className="badge idx">{qIdx + 1}/{deck.length}</div>
              <button className="btn-ghost" onClick={() => { clearInterval(timerRef.current); setView("review"); }}>EXIT</button>
            </div>
          </div>

          <div className="quiz-wrap">
            <div className="prog-bar"><div className="prog-fill" style={{ width:`${prog}%` }}/></div>

            {/* ---- BOSS BATTLE ---- */}
            {isBoss && (
              <>
                <div className="boss-banner">
                  <div className="boss-title">⚠ BOSS SEQUENCE</div>
                  <div className="boss-sub">// SYNTHESIS CHALLENGE — EVERY 5 CORRECT</div>
                </div>
                {loadingBoss
                  ? <div style={{ textAlign:"center", color:"var(--muted)", padding:24 }}><span className="spin">⟳</span> GENERATING...</div>
                  : <>
                      <div className="q-card"><div className="q-label">BOSS QUERY</div><div className="q-text">{bossQ}</div></div>
                      <textarea style={{ minHeight:90, marginBottom:10 }} placeholder="// type your answer..." value={teachVal} onChange={e => setTeachVal(e.target.value)} disabled={!!teachRes}/>
                      {teachRes && <div className={`teach-grade ${gradeClass(teachRes.score)}`}>{teachRes.score==="good"?"[PASS] ":teachRes.score==="poor"?"[FAIL] ":"[PARTIAL] "}{teachRes.feedback}</div>}
                      {!teachRes
                        ? <button className="btn" onClick={gradeTeach} disabled={loadingTeach || !teachVal.trim()}>{loadingTeach ? <><span className="spin">⟳</span> GRADING...</> : "> SUBMIT"}</button>
                        : <button className="btn" onClick={() => { setIsBoss(false); setTeachVal(""); setTeachRes(null); }}>{">"} CONTINUE</button>
                      }
                    </>
                }
              </>
            )}

            {/* ---- FLIP CARD ---- */}
            {!isBoss && mode === "flip" && card && (
              <>
                {/* CSS 3D flip - class "on" rotates it 180deg via CSS transform */}
                <div className="flip-scene" onClick={() => setFlipped(f => !f)}>
                  <div className={`flip-card ${flipped ? "on" : ""}`}>
                    <div className="flip-face"><div className="q-label">QUERY</div><div className="q-text">{card.front}</div></div>
                    <div className="flip-face flip-back"><div className="q-label">ANSWER</div><div className="q-text">{card.back}</div></div>
                  </div>
                </div>
                <div className="hint">{flipped ? "// did you get it right?" : "// click card to reveal"}</div>
                {flipped
                  ? <div className="flip-btns">
                      <button className="btn-no" onClick={() => advance(false)}>[✗] WRONG</button>
                      <button className="btn-ok" onClick={() => advance(true)}>[✓] CORRECT</button>
                    </div>
                  : <button className="btn-ghost" style={{ width:"100%", padding:12 }} onClick={() => setFlipped(true)}>{">"} REVEAL</button>
                }
              </>
            )}

            {/* ---- TYPE ANSWER (also handles survival + speedrun) ---- */}
            {!isBoss && (mode === "type" || mode === "survival" || mode === "speedrun") && card && (
              <>
                <div className="q-card"><div className="q-label">QUERY</div><div className="q-text">{card.front}</div></div>
                <input
                  className={`type-in ${typeRes === "correct" ? "good" : typeRes === "incorrect" ? "bad" : ""}`}
                  placeholder="// type your answer..."
                  value={typeVal}
                  onChange={e => setTypeVal(e.target.value)}
                  disabled={!!typeRes}
                  onKeyDown={e => {
                    // Allow submitting with Enter key
                    if (e.key === "Enter" && !typeRes && typeVal.trim()) {
                      const ok = typeVal.trim().toLowerCase() === card.back.trim().toLowerCase();
                      setTypeRes(ok ? "correct" : "incorrect");
                      if (mode === "speedrun") setTimeout(() => advance(ok), 400); // auto-advance in speed run
                    }
                  }}
                />
                {typeRes && <div className={`feedback ${typeRes === "correct" ? "good" : "bad"}`}>
                  {typeRes === "correct" ? "> [CORRECT] memory confirmed" : `> [INCORRECT] answer: ${card.back}`}
                </div>}
                {!typeRes
                  ? <button className="btn" disabled={!typeVal.trim()} onClick={() => {
                      const ok = typeVal.trim().toLowerCase() === card.back.trim().toLowerCase();
                      setTypeRes(ok ? "correct" : "incorrect");
                      if (mode === "speedrun") setTimeout(() => advance(ok), 400);
                    }}>{">"} CHECK</button>
                  : <button className="btn" onClick={() => advance(typeRes === "correct")}>{">"} NEXT</button>
                }
              </>
            )}

            {/* ---- MULTIPLE CHOICE ---- */}
            {!isBoss && mode === "mc" && card && (
              <>
                <div className="q-card"><div className="q-label">QUERY</div><div className="q-text">{card.front}</div></div>
                <div className="mc-opts">
                  {mcOpts.map((opt, i) => {
                    const isCorrect = opt === card.back;
                    const isChosen  = mcRes === opt;
                    // Apply right/wrong classes only after user has answered
                    const cls = mcRes ? (isCorrect ? "right" : isChosen ? "wrong" : "") : "";
                    return (
                      <button key={i} className={`mc-opt ${cls}`} disabled={!!mcRes}
                        onClick={() => { setMcRes(opt); setTimeout(() => advance(opt === card.back), 750); }}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* ---- TEACH IT BACK ---- */}
            {!isBoss && mode === "teach" && card && (
              <>
                <div className="teach-box">
                  <div className="q-label">TEACH IT BACK</div>
                  <div className="teach-prompt">{card.front}</div>
                  <textarea style={{ minHeight:90, background:"var(--bg)" }} placeholder="// explain in your own words..." value={teachVal} onChange={e => setTeachVal(e.target.value)} disabled={!!teachRes}/>
                </div>
                {teachRes && <div className={`teach-grade ${gradeClass(teachRes.score)}`}>
                  {teachRes.score==="good"?"[PASS] ":teachRes.score==="poor"?"[FAIL] ":"[PARTIAL] "}{teachRes.feedback}
                </div>}
                {!teachRes
                  ? <button className="btn" onClick={gradeTeach} disabled={loadingTeach || !teachVal.trim()}>
                      {loadingTeach ? <><span className="spin">⟳</span> GRADING...</> : "> SUBMIT EXPLANATION"}
                    </button>
                  : <button className="btn" onClick={() => advance(teachRes.correct)}>{">"} NEXT</button>
                }
              </>
            )}
          </div>
        </div>
      </>
    );
  }

  // ============================================================
  // RENDER: RESULTS SCREEN
  // ============================================================
  if (view === "results") {
    const total = score.total || 1; // avoid divide by zero
    const pct   = Math.round((score.correct / total) * 100);
    const msg   = pct >= 80 ? "MEMORY INTACT" : pct >= 50 ? "PARTIAL RECALL" : "MEMORY FRAGMENTED";

    // SVG circle math for the score ring
    // circumference = 2πr, strokeDashoffset controls how much arc is filled
    const circ = 2 * Math.PI * 54;

    return (
      <>
        <style>{css}</style>
        <div className="rc">
          <div className="logo glow">RECALLED</div>
          <div className="results-wrap">
            <svg width="140" height="140" viewBox="0 0 140 140" style={{ margin:"0 auto 20px", display:"block" }}>
              <circle cx="70" cy="70" r="54" fill="none" stroke="var(--border)" strokeWidth="8"/>
              <circle cx="70" cy="70" r="54" fill="none" stroke="var(--green)" strokeWidth="3"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - pct / 100)} // fills proportionally to score
                transform="rotate(-90 70 70)"
                style={{ transition:"stroke-dashoffset 1s ease", filter:"drop-shadow(0 0 6px var(--green))" }}
              />
              <text x="70" y="62" textAnchor="middle" fill="var(--green)" fontSize="28" fontWeight="700" fontFamily="VT323,monospace">{pct}%</text>
              <text x="70" y="80" textAnchor="middle" fill="var(--muted)" fontSize="11" fontFamily="Share Tech Mono,monospace">{score.correct}/{total}</text>
            </svg>

            <div className="result-title glow">{msg}</div>
            <div style={{ fontSize:11, color:"var(--muted)", letterSpacing:1, marginBottom:4 }}>// MODE: {MODES.find(m => m.id === mode)?.name}</div>
            <div style={{ fontSize:11, color:"var(--muted)", letterSpacing:1 }}>// SCORE: {score.correct} CORRECT / {total} TOTAL</div>

            <div className="result-actions">
              <button className="btn glow-sm" onClick={() => startQuiz(mode)}>{">"} RETRY SAME MODE</button>
              <button className="btn-ghost" style={{ padding:12 }} onClick={() => setView("review")}>{">"} SWITCH MODE</button>
              <button className="btn-ghost" style={{ padding:12 }} onClick={() => { setCards([]); setView("input"); }}>{">"} NEW DECK</button>
            </div>
          </div>
        </div>
      </>
    );
  }
}
