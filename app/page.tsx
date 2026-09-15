"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { allCodes, getCompatibility, isStudyCode } from "./compatibility";

type AxisKey = "company" | "energy" | "rhythm" | "momentum";
type QuizMode = "intro" | "quiz" | "result";

type Question = {
  axis: AxisKey;
  eyebrow: string;
  prompt: string;
  left: string;
  right: string;
};

const axes = {
  company: {
    left: "A",
    right: "C",
    leftName: "Alone",
    rightName: "Collaborative",
    color: "blue",
  },
  energy: {
    left: "Q",
    right: "T",
    leftName: "Quiet",
    rightName: "Talkative",
    color: "lime",
  },
  rhythm: {
    left: "S",
    right: "F",
    leftName: "Scheduled",
    rightName: "Flexible",
    color: "coral",
  },
  momentum: {
    left: "O",
    right: "P",
    leftName: "Organised",
    rightName: "Procrastinating",
    color: "violet",
  },
} as const;

const axisOrder = Object.keys(axes) as AxisKey[];

const questions: Question[] = [
  {
    axis: "company",
    eyebrow: "Your ideal setup",
    prompt: "A difficult topic has you completely stuck. What helps most?",
    left: "Closing the door and wrestling with it myself",
    right: "Calling someone and working it through together",
  },
  {
    axis: "energy",
    eyebrow: "How your brain warms up",
    prompt: "When a new idea finally clicks, you want to…",
    left: "Sit with it quietly and write it down",
    right: "Say it out loud and explain it to someone",
  },
  {
    axis: "rhythm",
    eyebrow: "Your natural rhythm",
    prompt: "You have a full week of study ahead. Your first move is…",
    left: "Block out exactly when each subject gets done",
    right: "Keep the week open and choose based on the day",
  },
  {
    axis: "momentum",
    eyebrow: "How you meet a deadline",
    prompt: "An assignment is due in two weeks. Honestly, when do you peak?",
    left: "Early, with enough time to review it calmly",
    right: "Near the deadline, when the urgency switches me on",
  },
  {
    axis: "company",
    eyebrow: "Your ideal setup",
    prompt: "Which study session sounds more productive?",
    left: "My materials, my pace, zero interruptions",
    right: "A shared table with people keeping each other moving",
  },
  {
    axis: "energy",
    eyebrow: "How your brain warms up",
    prompt: "Where would you settle in at the library?",
    left: "The silent floor with headphones on",
    right: "A table where low-key discussion is welcome",
  },
  {
    axis: "rhythm",
    eyebrow: "Your natural rhythm",
    prompt: "When you start a big assignment, you prefer to…",
    left: "Map the steps and tackle them in order",
    right: "Jump into the most interesting part and find the path",
  },
  {
    axis: "momentum",
    eyebrow: "How you meet a deadline",
    prompt: "Your relationship with starting early is…",
    left: "A relief — future me deserves the breathing room",
    right: "A nice theory — I usually need the spark to arrive",
  },
  {
    axis: "company",
    eyebrow: "Your ideal setup",
    prompt: "When exam season gets intense, you instinctively…",
    left: "Protect my own plan and study cocoon",
    right: "Pull together a group so nobody falls behind",
  },
  {
    axis: "energy",
    eyebrow: "How your brain warms up",
    prompt: "Which technique makes information stick?",
    left: "Quiet reading, notes, and private reflection",
    right: "Debating, teaching, or talking through examples",
  },
  {
    axis: "rhythm",
    eyebrow: "Your natural rhythm",
    prompt: "A last-minute plan change feels…",
    left: "Disruptive — I had a system for this",
    right: "Fine — I can reshape the session as I go",
  },
  {
    axis: "momentum",
    eyebrow: "How you meet a deadline",
    prompt: "For a month-long project, your work usually looks like…",
    left: "A steady line of small, regular wins",
    right: "Quiet stretches followed by powerful bursts",
  },
  {
    axis: "company",
    eyebrow: "Your ideal setup",
    prompt: "You understand your progress best when you…",
    left: "Check in with myself and adjust privately",
    right: "Compare notes and get reactions from other people",
  },
  {
    axis: "energy",
    eyebrow: "How your brain warms up",
    prompt: "After an hour of focused study, what restores your energy?",
    left: "A quiet break with no conversation",
    right: "A quick chat and a chance to bounce ideas around",
  },
  {
    axis: "rhythm",
    eyebrow: "Your natural rhythm",
    prompt: "Your best study routine is one that…",
    left: "Repeats predictably until it becomes automatic",
    right: "Changes often enough to keep me interested",
  },
  {
    axis: "momentum",
    eyebrow: "How you meet a deadline",
    prompt: "A due date is most useful as…",
    left: "A final safety net after I finish",
    right: "The pressure that gives the work real momentum",
  },
];

const answerLabels = ["Strongly left", "Mostly left", "In between", "Mostly right", "Strongly right"];
const answerValues = [-2, -1, 0, 1, 2];

const typeNames: Record<string, string> = {
  AQSO: "The Methodical Soloist",
  AQSP: "The Deadline Minimalist",
  AQFO: "The Adaptive Deep-Diver",
  AQFP: "The Solo Sprinter",
  ATSO: "The Verbal Planner",
  ATSP: "The Deadline Narrator",
  ATFO: "The Roaming Explainer",
  ATFP: "The Improvised Thinker",
  CQSO: "The Quiet Coordinator",
  CQSP: "The Gentle Finisher",
  CQFO: "The Flexible Listener",
  CQFP: "The Study-Session Surfer",
  CTSO: "The Study Captain",
  CTSP: "The Momentum Maker",
  CTFO: "The Collaborative Catalyst",
  CTFP: "The Group Spark",
};

const traitCopy = {
  A: {
    name: "Alone",
    line: "You think most clearly when you own the pace, space, and sequence.",
    tip: "Protect deep-work windows before adding anyone else to the room.",
  },
  C: {
    name: "Collaborative",
    line: "Shared momentum and quick feedback help you move ideas forward.",
    tip: "Book recurring sessions with people who arrive ready to contribute.",
  },
  Q: {
    name: "Quiet",
    line: "Low stimulation gives your thoughts room to connect and settle.",
    tip: "Use written check-ins so collaboration does not become interruption.",
  },
  T: {
    name: "Talkative",
    line: "You discover what you know by hearing yourself shape the idea.",
    tip: "Try teach-backs, voice notes, or a willing study listener.",
  },
  S: {
    name: "Scheduled",
    line: "A visible plan frees your attention for the work itself.",
    tip: "Leave a small buffer so one surprise does not derail the whole plan.",
  },
  F: {
    name: "Flexible",
    line: "Choice and variety keep you alert, curious, and responsive.",
    tip: "Set a firm finish line, then stay flexible about the route you take.",
  },
  O: {
    name: "Organised",
    line: "You build momentum early and feel better with margin to spare.",
    tip: "Avoid polishing low-value details before the core work is complete.",
  },
  P: {
    name: "Procrastinating",
    line: "Urgency concentrates your attention and turns pressure into a sprint.",
    tip: "Create smaller, real checkpoints so the final sprint stays survivable.",
  },
} as const;

function scoresFromAnswers(answers: Array<number | null>) {
  const scores: Record<AxisKey, number> = {
    company: 0,
    energy: 0,
    rhythm: 0,
    momentum: 0,
  };

  questions.forEach((question, index) => {
    scores[question.axis] += answers[index] ?? 0;
  });

  return scores;
}

function codeFromScores(scores: Record<AxisKey, number>) {
  return axisOrder
    .map((axis) => (scores[axis] > 0 ? axes[axis].right : axes[axis].left))
    .join("");
}

function DimensionPill({ code }: { code: string }) {
  return (
    <span className="mini-code" aria-label={code.split("").map((letter) => traitCopy[letter as keyof typeof traitCopy].name).join(", ")}>
      {code.split("").map((letter, index) => (
        <span key={`${letter}-${index}`}>{letter}</span>
      ))}
    </span>
  );
}

export default function Home() {
  const [mode, setMode] = useState<QuizMode>("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Array<number | null>>(() => Array(questions.length).fill(null));
  const [sharedCode, setSharedCode] = useState<string | null>(null);
  const [compareCode, setCompareCode] = useState("");
  const [copyState, setCopyState] = useState("Share result");
  const quizHeadingRef = useRef<HTMLHeadingElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const incoming = new URLSearchParams(window.location.search).get("type")?.toUpperCase() ?? "";
      if (isStudyCode(incoming)) {
        setSharedCode(incoming);
        setMode("result");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mode === "quiz") quizHeadingRef.current?.focus();
    if (mode === "result") resultHeadingRef.current?.focus();
  }, [mode, current]);

  const quizScores = useMemo(() => scoresFromAnswers(answers), [answers]);
  const code = sharedCode ?? codeFromScores(quizScores);
  const resultScores = sharedCode ? null : quizScores;
  const resultName = typeNames[code] ?? "Your Studyprint";

  const matches = useMemo(
    () =>
      allCodes()
        .filter((candidate) => candidate !== code)
        .map((candidate) => ({ code: candidate, ...getCompatibility(code, candidate) }))
        .sort((a, b) => a.setupCost - b.setupCost || a.code.localeCompare(b.code))
        .slice(0, 3),
    [code],
  );

  function startQuiz() {
    setSharedCode(null);
    setAnswers(Array(questions.length).fill(null));
    setCurrent(0);
    setCompareCode("");
    setMode("quiz");
    window.history.replaceState({}, "", window.location.pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goHome() {
    setSharedCode(null);
    setCompareCode("");
    setMode("intro");
    window.history.replaceState({}, "", window.location.pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function finishQuiz() {
    const finalCode = codeFromScores(scoresFromAnswers(answers));
    setSharedCode(null);
    setMode("result");
    window.history.replaceState({}, "", `${window.location.pathname}?type=${finalCode}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function copyResult() {
    const shareUrl = `${window.location.origin}${window.location.pathname}?type=${code}`;
    const text = `My Studyprint is ${code} — ${resultName}. Find yours and compare with me: ${shareUrl}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `My Studyprint: ${code}`, text, url: shareUrl });
        setCopyState("Shared!");
      } else {
        await navigator.clipboard.writeText(text);
        setCopyState("Copied!");
      }
    } catch {
      return;
    }
    window.setTimeout(() => setCopyState("Share result"), 1800);
  }

  const question = questions[current];
  const selectedAnswer = answers[current];
  const completed = answers.filter((answer) => answer !== null).length;
  const comparison = isStudyCode(compareCode) ? getCompatibility(code, compareCode) : null;
  const invalidCompare = compareCode.length === 4 && !isStudyCode(compareCode);

  return (
    <main className="site-shell">
      <header className="topbar">
        <button className="brand" onClick={goHome} aria-label="Studyprint home">
          <span className="brand-mark" aria-hidden="true">S</span>
          <span>STUDYPRINT</span>
        </button>
        {mode === "quiz" ? (
          <div className="header-progress" aria-label={`${completed} of ${questions.length} questions answered`}>
            <span>{String(completed).padStart(2, "0")}</span>
            <div><i style={{ width: `${(completed / questions.length) * 100}%` }} /></div>
            <span>{questions.length}</span>
          </div>
        ) : (
          <button className="text-button" onClick={startQuiz}>{mode === "result" ? "Retake the test" : "Take the test"}<span>↗</span></button>
        )}
      </header>

      {mode === "intro" && (
        <>
          <section className="hero">
            <div className="hero-copy">
              <p className="kicker"><span>01</span> Your study habits, decoded</p>
              <h1>Find your<br />four-letter<br /><em>study code.</em></h1>
              <p className="lede">Sixteen quick choices reveal how you focus, communicate, plan, and actually get things finished.</p>
              <div className="hero-actions">
                <button className="primary-button" onClick={startQuiz}>Discover my Studyprint <span>→</span></button>
                <p><strong>About 3 minutes</strong><br />No signup. No judgement.</p>
              </div>
            </div>
            <div className="code-poster" aria-label="Example Studyprint code A Q S O">
              <div className="poster-note">Your result looks like this</div>
              {["A", "Q", "S", "O"].map((letter, index) => (
                <div className={`poster-letter poster-letter-${index + 1}`} key={letter}>
                  <b>{letter}</b>
                  <span>{traitCopy[letter as keyof typeof traitCopy].name}</span>
                </div>
              ))}
              <div className="poster-stamp">1 of 16<br />study types</div>
            </div>
          </section>

          <section className="dimensions" aria-labelledby="dimensions-title">
            <div className="section-heading">
              <p className="kicker"><span>02</span> The four dimensions</p>
              <h2 id="dimensions-title">Not who you are.<br />How you work best.</h2>
            </div>
            <div className="dimension-grid">
              {axisOrder.map((axis, index) => {
                const item = axes[axis];
                return (
                  <article className={`dimension-card ${item.color}`} key={axis}>
                    <div className="card-number">0{index + 1}</div>
                    <div className="card-axis">
                      <span><b>{item.left}</b>{item.leftName}</span>
                      <i>or</i>
                      <span><b>{item.right}</b>{item.rightName}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="compat-teaser">
            <div>
              <p className="kicker"><span>03</span> Better together</p>
              <h2>Your code is also a conversation starter.</h2>
            </div>
            <p>Compare codes with a friend, classmate, or project partner. See where your study styles click — and what to agree on before the session starts.</p>
            <button className="primary-button light" onClick={startQuiz}>Find my match <span>→</span></button>
          </section>
        </>
      )}

      {mode === "quiz" && (
        <section className="quiz-wrap">
          <div className="quiz-meta">
            <p>QUESTION {String(current + 1).padStart(2, "0")} / {questions.length}</p>
            <p>{question.eyebrow}</p>
          </div>
          <div className="quiz-card">
            <div className={`axis-tag ${axes[question.axis].color}`}>
              {axes[question.axis].left} / {axes[question.axis].right}
            </div>
            <h1 ref={quizHeadingRef} tabIndex={-1}>{question.prompt}</h1>
            <div className="answer-poles" aria-hidden="true">
              <span>{question.left}</span>
              <span>{question.right}</span>
            </div>
            <div className="answer-scale" role="radiogroup" aria-label="Choose where you sit between the two answers">
              {answerValues.map((value, index) => (
                <button
                  key={value}
                  className={selectedAnswer === value ? "selected" : ""}
                  role="radio"
                  aria-checked={selectedAnswer === value}
                  aria-label={`${answerLabels[index]}: ${value < 0 ? question.left : value > 0 ? question.right : "In between"}`}
                  tabIndex={selectedAnswer === null ? (index === 0 ? 0 : -1) : selectedAnswer === value ? 0 : -1}
                  onClick={() => {
                    const next = [...answers];
                    next[current] = value;
                    setAnswers(next);
                  }}
                  onKeyDown={(event) => {
                    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
                    event.preventDefault();
                    const last = answerValues.length - 1;
                    const nextIndex = event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? last
                        : (index + (event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1) + answerValues.length) % answerValues.length;
                    const next = [...answers];
                    next[current] = answerValues[nextIndex];
                    setAnswers(next);
                    event.currentTarget.parentElement
                      ?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[nextIndex]
                      ?.focus();
                  }}
                >
                  <span>{index + 1}</span>
                  <small>{index === 0 ? "Definitely this" : index === 2 ? "Both / neither" : index === 4 ? "Definitely this" : "Leaning here"}</small>
                </button>
              ))}
            </div>
            <div className="scale-captions">
              <span>← {axes[question.axis].leftName}</span>
              <span>{axes[question.axis].rightName} →</span>
            </div>
          </div>
          <div className="quiz-nav">
            <button className="back-button" onClick={() => current === 0 ? goHome() : setCurrent(current - 1)}>← Back</button>
            {current === questions.length - 1 ? (
              <button className="primary-button" disabled={selectedAnswer === null} onClick={finishQuiz}>Reveal my code <span>✦</span></button>
            ) : (
              <button className="primary-button" disabled={selectedAnswer === null} onClick={() => {
                setCurrent(current + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}>Next question <span>→</span></button>
            )}
          </div>
        </section>
      )}

      {mode === "result" && (
        <section className="result-wrap">
          <div className="result-hero">
            <div className="result-intro">
              <p className="kicker"><span>YOUR RESULT</span> Meet your Studyprint</p>
              <h1 ref={resultHeadingRef} tabIndex={-1}>{resultName}</h1>
              <p>{code.split("").map((letter) => traitCopy[letter as keyof typeof traitCopy].line).join(" ")}</p>
              <div className="result-actions">
                <button className="primary-button" onClick={copyResult}>{copyState} <span>↗</span></button>
                <button className="back-button" onClick={startQuiz}>Retake</button>
              </div>
            </div>
            <div className="result-code" aria-label={`Your code is ${code}`}>
              <p>STUDYPRINT / {resultName.toUpperCase()}</p>
              <div>
                {code.split("").map((letter, index) => (
                  <span key={`${letter}-${index}`} className={`result-letter letter-${index + 1}`}>
                    <b>{letter}</b>
                    <small>{traitCopy[letter as keyof typeof traitCopy].name}</small>
                  </span>
                ))}
              </div>
              <i>Keep this code. Compare it below.</i>
            </div>
          </div>

          <section className="breakdown" aria-labelledby="breakdown-title">
            <div className="section-heading compact">
              <p className="kicker"><span>01</span> Your breakdown</p>
              <div>
                <h2 id="breakdown-title">How your preferences stack up.</h2>
                {sharedCode && <p className="shared-source-note">This shared link contains the four-letter code, not the original answers, so preference-strength percentages are intentionally hidden.</p>}
              </div>
            </div>
            <div className="breakdown-list">
              {axisOrder.map((axis, index) => {
                const item = axes[axis];
                const score = resultScores?.[axis] ?? null;
                const rightPercent = score === null ? null : Math.round(((score + 8) / 16) * 100);
                const chosen = code[index] as keyof typeof traitCopy;
                const preferenceLabel = rightPercent === null
                  ? "Code preference"
                  : rightPercent === 50
                    ? `Balanced · code uses ${chosen}`
                    : `${Math.max(rightPercent, 100 - rightPercent)}% lean`;
                return (
                  <article className="breakdown-row" key={axis}>
                    <div className={`trait-letter ${item.color}`}>{chosen}</div>
                    <div className="trait-detail">
                      <div><h3>{traitCopy[chosen].name}</h3><span>{preferenceLabel}</span></div>
                      <p>{traitCopy[chosen].line}</p>
                      {rightPercent !== null && (
                        <>
                          <div className="trait-meter" aria-label={`${item.leftName} ${100 - rightPercent} percent, ${item.rightName} ${rightPercent} percent`}>
                            <i style={{ left: `${rightPercent}%` }} />
                          </div>
                          <div className="meter-labels"><span>{item.leftName}</span><span>{item.rightName}</span></div>
                        </>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="playbook" aria-labelledby="playbook-title">
            <div className="section-heading compact">
              <p className="kicker"><span>02</span> Your playbook</p>
              <h2 id="playbook-title">Study with your habits, not against them.</h2>
            </div>
            <div className="playbook-grid">
              {code.split("").map((letter, index) => (
                <article key={`${letter}-tip`}>
                  <span>0{index + 1} / {traitCopy[letter as keyof typeof traitCopy].name}</span>
                  <p>{traitCopy[letter as keyof typeof traitCopy].tip}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="compatibility" aria-labelledby="compatibility-title">
            <div className="compat-copy">
              <p className="kicker"><span>03</span> Study compatibility</p>
              <h2 id="compatibility-title">Will your study styles click?</h2>
              <p>Enter someone else’s four-letter code. This practical comparison shows which study-session agreements may help — it does not measure friendship, intelligence, or learning ability.</p>
              <label htmlFor="compare-code">Their Studyprint</label>
              <div className="code-input-wrap">
                <input
                  id="compare-code"
                  value={compareCode}
                  onChange={(event) => setCompareCode(event.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4))}
                  placeholder="e.g. CTFO"
                  aria-describedby={invalidCompare ? "code-format code-error" : "code-format"}
                  aria-invalid={invalidCompare}
                />
                <span>{compareCode.length}/4</span>
              </div>
              <small id="code-format">Use A/C · Q/T · S/F · O/P</small>
              {invalidCompare && <p className="code-error" id="code-error" role="alert">That code is not valid. Check each letter against the key above.</p>}
            </div>

            <div className="compat-result" aria-live="polite">
              {comparison ? (
                <>
                  <div className="score-ring agreement-ring">
                    <div><strong>{comparison.agreementCount}</strong><span>{comparison.agreementCount === 1 ? "agreement" : "agreements"}</span></div>
                  </div>
                  <div className="compat-summary">
                    <p><DimensionPill code={code} /> <span>+</span> <DimensionPill code={compareCode} /></p>
                    <h3>{comparison.label}</h3>
                    <p className="fit-note">{comparison.summary}</p>
                    <ul>{comparison.notes.map((note) => <li key={note}>{note}</li>)}</ul>
                  </div>
                </>
              ) : invalidCompare ? (
                <div className="empty-compat invalid-compat">
                  <div aria-hidden="true">CHECK CODE</div>
                  <p>Studyprint codes use one letter from each pair: A/C, Q/T, S/F, and O/P.</p>
                </div>
              ) : (
                <div className="empty-compat">
                  <div aria-hidden="true">A? + C?</div>
                  <p>Enter a complete code to see your comparison and study-session advice.</p>
                </div>
              )}
            </div>
          </section>

          <section className="matches">
            <div>
              <p className="kicker"><span>04</span> Suggested matches</p>
              <h2>Easiest session setups.</h2>
            </div>
            <div className="match-list">
              {matches.map((match, index) => (
                <button key={match.code} onClick={() => setCompareCode(match.code)}>
                  <span>0{index + 1}</span>
                  <DimensionPill code={match.code} />
                  <strong>{typeNames[match.code]}</strong>
                  <i>{match.agreementCount} {match.agreementCount === 1 ? "agreement" : "agreements"} →</i>
                </button>
              ))}
            </div>
          </section>
        </section>
      )}

      <footer>
        <div className="brand"><span className="brand-mark" aria-hidden="true">S</span><span>STUDYPRINT</span></div>
        <p>A useful mirror, not a diagnosis. Your study style can change by subject, season, and setting.</p>
        <span>MADE FOR BETTER STUDY SESSIONS</span>
      </footer>
    </main>
  );
}
