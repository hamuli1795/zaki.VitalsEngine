import { useState, useEffect, useRef } from "react";

// ─── SIMULATED CV ENGINE (Python logic ported to JS for prototype) ───────────
const CV_ENGINE = {
  analyzeXray: (stage) => {
    const profiles = {
      1: { jointSpace: 4.2, cartilageLoss: 10, osteophytes: false, boneContact: 0, confidence: 94 },
      2: { jointSpace: 3.1, cartilageLoss: 28, osteophytes: true, boneContact: 0, confidence: 91 },
      3: { jointSpace: 1.8, cartilageLoss: 55, osteophytes: true, boneContact: 15, confidence: 89 },
      4: { jointSpace: 0.4, cartilageLoss: 87, osteophytes: true, boneContact: 73, confidence: 96 },
    };
    return profiles[stage];
  },
};

// ─── BIOMECHANICS ENGINE ───────────────────────────────────────────────────────
const BIOMECH_ENGINE = {
  movements: {
    "Crossover Dribble": { baseLoad: 3.2, lateralForce: 2.8, impactPeak: 4.1 },
    "Jump Shot Landing": { baseLoad: 5.6, lateralForce: 1.2, impactPeak: 7.8 },
    "Hard Cut (V-Cut)": { baseLoad: 4.4, lateralForce: 4.6, impactPeak: 6.2 },
    "Post Pivot":       { baseLoad: 3.8, lateralForce: 3.1, impactPeak: 4.9 },
    "Defensive Slide":  { baseLoad: 2.9, lateralForce: 3.8, impactPeak: 3.4 },
  },
  calcRisk: (movement, stage) => {
    const mv = BIOMECH_ENGINE.movements[movement];
    const stageMult = [0, 1.0, 1.4, 2.1, 3.6][stage];
    const riskScore = ((mv.baseLoad + mv.lateralForce + mv.impactPeak) / 3) * stageMult;
    return Math.min(riskScore / 10, 1);
  },
};

// ─── AI RECOMMENDATION ENGINE ─────────────────────────────────────────────────
const AI_RECS = {
  3: [
    { type: "LOAD_REDISTRIBUTION", text: "Offload medial compartment via lateral wedge orthotics — reduces bone contact stress 18–22%", priority: "CRITICAL" },
    { type: "MOVEMENT_MOD",        text: "Eliminate hard V-cuts. Replace with early screen usage & pin-down actions off movement", priority: "HIGH" },
    { type: "RECOVERY_PROTOCOL",   text: "Hydrotherapy & anti-gravity treadmill (AlterG) for conditioning — zero impact load", priority: "HIGH" },
    { type: "ROLE_ADAPTATION",     text: "Transition to catch-and-shoot off screens. Movement economy conserves joint cycles", priority: "MEDIUM" },
    { type: "MONITORING",          text: "Deploy wearable IMU sensors — flag movements exceeding 4.0x bodyweight joint load in real-time", priority: "MEDIUM" },
  ],
  4: [
    { type: "LOAD_REDISTRIBUTION", text: "Custom unloader brace (valgus) + viscosupplementation to restore minimal lubrication layer", priority: "CRITICAL" },
    { type: "MOVEMENT_MOD",        text: "Jump shot mechanics overhaul — flatter arc, reduced vertical load. Eliminate post play entirely", priority: "CRITICAL" },
    { type: "RECOVERY_PROTOCOL",   text: "PRP injection cycles + stem cell micro-dosing simulation. PEMF therapy nightly protocol", priority: "HIGH" },
    { type: "ROLE_ADAPTATION",     text: "3-point specialist role: stationary catch, minimal lateral movement. Brandon Roy 2011 model", priority: "HIGH" },
    { type: "BIOFEEDBACK",         text: "Real-time joint load AI alert — haptic feedback in shoe insole when threshold breached", priority: "CRITICAL" },
  ],
};

// ─── PLAYER DATABASE ──────────────────────────────────────────────────────────
const PLAYERS = [
  { name: "Brandon Roy",      team: "Portland Trail Blazers", stage: 4, age: 27, position: "SG", status: "Career Ended", image: "BR" },
  { name: "Penny Hardaway",   team: "Orlando Magic",          stage: 4, age: 29, position: "PG", status: "Career Shortened", image: "PH" },
  { name: "Shaun Livingston", team: "Brooklyn Nets",          stage: 3, age: 22, position: "PG", status: "Recovered (ARTIS Model)", image: "SL" },
  { name: "Demo Patient",     team: "Free Agent",             stage: 3, age: 24, position: "SF", status: "Active Monitoring", image: "DP" },
];

// ─── COLOR SYSTEM ─────────────────────────────────────────────────────────────
const STAGE_COLORS = { 1: "#22c55e", 2: "#eab308", 3: "#f97316", 4: "#ef4444" };
const STAGE_LABELS = { 1: "DOUBTFUL", 2: "MILD", 3: "MODERATE", 4: "SEVERE" };
const PRIORITY_COLORS = { CRITICAL: "#ef4444", HIGH: "#f97316", MEDIUM: "#eab308" };

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function ARTIS() {
  const [activePlayer, setActivePlayer] = useState(PLAYERS[0]);
  const [activeTab, setActiveTab]       = useState("overview");
  const [selectedMove, setSelectedMove] = useState("Jump Shot Landing");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanning, setScanning]         = useState(false);
  const [scanComplete, setScanComplete] = useState(true);
  const [animIn, setAnimIn]             = useState(true);
  const canvasRef = useRef(null);
  const cvData = CV_ENGINE.analyzeXray(activePlayer.stage);

  // Trigger scan animation on player switch
  useEffect(() => {
    setScanning(true);
    setScanComplete(false);
    setScanProgress(0);
    setAnimIn(false);
    setTimeout(() => setAnimIn(true), 50);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 18 + 4;
      if (p >= 100) { p = 100; clearInterval(iv); setScanComplete(true); setScanning(false); }
      setScanProgress(Math.min(p, 100));
    }, 80);
    return () => clearInterval(iv);
  }, [activePlayer]);

  // Canvas X-ray simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    drawXray(ctx, activePlayer.stage, canvas.width, canvas.height);
  }, [activePlayer, scanComplete]);

  const recs = AI_RECS[activePlayer.stage] || AI_RECS[3];
  const stageColor = STAGE_COLORS[activePlayer.stage];

  return (
    <div style={styles.root}>
      {/* NOISE TEXTURE OVERLAY */}
      <div style={styles.noise} />

      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logo}>
            <span style={styles.logoA}>A</span>
            <span style={styles.logoR}>R</span>
            <span style={styles.logoT}>T</span>
            <span style={styles.logoIS}>IS</span>
          </div>
          <div>
            <div style={styles.logoSub}>Adaptive Recovery & Tissue Intelligence System</div>
            <div style={styles.logoTag}>NBA Joint Health Platform · v2.4.1</div>
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.liveChip}>
            <span style={styles.liveDot} />
            LIVE ANALYSIS
          </div>
          <div style={styles.headerStat}>
            <span style={styles.headerStatNum}>847</span>
            <span style={styles.headerStatLabel}>Athletes Monitored</span>
          </div>
          <div style={styles.headerStat}>
            <span style={styles.headerStatNum}>23</span>
            <span style={styles.headerStatLabel}>NBA Teams</span>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div style={styles.main}>

        {/* LEFT — PLAYER ROSTER */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarTitle}>PATIENT ROSTER</div>
          {PLAYERS.map((p) => (
            <div
              key={p.name}
              onClick={() => setActivePlayer(p)}
              style={{
                ...styles.playerCard,
                borderColor: activePlayer.name === p.name ? STAGE_COLORS[p.stage] : "transparent",
                background: activePlayer.name === p.name
                  ? `linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))`
                  : "rgba(255,255,255,0.02)",
              }}
            >
              <div style={{ ...styles.playerAvatar, background: `linear-gradient(135deg, ${STAGE_COLORS[p.stage]}33, ${STAGE_COLORS[p.stage]}11)`, borderColor: STAGE_COLORS[p.stage] }}>
                {p.image}
              </div>
              <div style={styles.playerInfo}>
                <div style={styles.playerName}>{p.name}</div>
                <div style={styles.playerTeam}>{p.position} · {p.team}</div>
                <div style={{ ...styles.playerStatus, color: STAGE_COLORS[p.stage] }}>
                  Stage {p.stage} · {STAGE_LABELS[p.stage]}
                </div>
              </div>
              <div style={{ ...styles.stageCircle, background: STAGE_COLORS[p.stage] }}>
                {p.stage}
              </div>
            </div>
          ))}

          {/* STAGE LEGEND */}
          <div style={styles.legend}>
            <div style={styles.legendTitle}>OA STAGING SCALE</div>
            {[1,2,3,4].map(s => (
              <div key={s} style={styles.legendItem}>
                <div style={{ ...styles.legendDot, background: STAGE_COLORS[s] }} />
                <span style={styles.legendLabel}>Stage {s} — {STAGE_LABELS[s]}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* CENTER — ANALYSIS PANEL */}
        <main style={{ ...styles.center, opacity: animIn ? 1 : 0, transform: animIn ? "translateY(0)" : "translateY(12px)", transition: "all 0.4s ease" }}>

          {/* PATIENT HEADER */}
          <div style={styles.patientBanner}>
            <div>
              <div style={styles.patientName}>{activePlayer.name}</div>
              <div style={styles.patientMeta}>{activePlayer.position} · Age {activePlayer.age} · {activePlayer.team}</div>
            </div>
            <div style={{ ...styles.stageBadge, background: `${stageColor}22`, border: `1px solid ${stageColor}`, color: stageColor }}>
              STAGE {activePlayer.stage} — {STAGE_LABELS[activePlayer.stage]}
            </div>
          </div>

          {/* TABS */}
          <div style={styles.tabs}>
            {["overview", "biomechanics", "recommendations"].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ ...styles.tab, ...(activeTab === t ? { ...styles.tabActive, borderBottomColor: stageColor, color: stageColor } : {}) }}>
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          {/* TAB: OVERVIEW */}
          {activeTab === "overview" && (
            <div style={styles.tabContent}>
              <div style={styles.twoCol}>

                {/* X-RAY SIMULATION */}
                <div style={styles.card}>
                  <div style={styles.cardTitle}>CV X-RAY ANALYSIS</div>
                  {scanning && (
                    <div style={styles.scanBar}>
                      <div style={{ ...styles.scanFill, width: `${scanProgress}%`, background: stageColor }} />
                      <span style={styles.scanLabel}>ANALYZING IMAGE... {Math.round(scanProgress)}%</span>
                    </div>
                  )}
                  <canvas ref={canvasRef} width={280} height={200} style={styles.canvas} />
                  {scanComplete && (
                    <div style={styles.cvResults}>
                      <div style={styles.cvRow}>
                        <span style={styles.cvLabel}>Joint Space Width</span>
                        <span style={{ ...styles.cvVal, color: stageColor }}>{cvData.jointSpace} mm</span>
                      </div>
                      <div style={styles.cvRow}>
                        <span style={styles.cvLabel}>Cartilage Loss</span>
                        <span style={{ ...styles.cvVal, color: stageColor }}>{cvData.cartilageLoss}%</span>
                      </div>
                      <div style={styles.cvRow}>
                        <span style={styles.cvLabel}>Bone Contact</span>
                        <span style={{ ...styles.cvVal, color: stageColor }}>{cvData.boneContact}%</span>
                      </div>
                      <div style={styles.cvRow}>
                        <span style={styles.cvLabel}>CV Confidence</span>
                        <span style={{ ...styles.cvVal, color: "#22c55e" }}>{cvData.confidence}%</span>
                      </div>
                      <div style={styles.cvRow}>
                        <span style={styles.cvLabel}>Osteophytes</span>
                        <span style={{ ...styles.cvVal, color: cvData.osteophytes ? "#ef4444" : "#22c55e" }}>{cvData.osteophytes ? "DETECTED" : "NONE"}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* JOINT LOAD METER */}
                <div style={styles.card}>
                  <div style={styles.cardTitle}>JOINT HEALTH INDEX</div>
                  <div style={styles.gaugeWrap}>
                    <GaugeMeter value={100 - cvData.cartilageLoss} color={stageColor} label="Cartilage Health" />
                    <GaugeMeter value={100 - cvData.boneContact} color={stageColor} label="Joint Clearance" />
                  </div>
                  <div style={styles.alertBox(stageColor)}>
                    <div style={styles.alertTitle}>⚠ ARTIS ASSESSMENT</div>
                    <div style={styles.alertBody}>
                      {activePlayer.stage === 4
                        ? "Bone-on-bone contact confirmed. Standard career prognosis: retirement within 18 months. ARTIS load management protocol initiated."
                        : "Significant cartilage degradation detected. High risk of progression to Stage 4 without intervention. ARTIS protocol recommended immediately."}
                    </div>
                  </div>
                </div>
              </div>

              {/* CAREER IMPACT */}
              <div style={styles.card}>
                <div style={styles.cardTitle}>CAREER IMPACT PROJECTION</div>
                <div style={styles.impactGrid}>
                  {[
                    { label: "Without ARTIS", seasons: activePlayer.stage === 4 ? "0.8" : "1.9", games: activePlayer.stage === 4 ? "31" : "48", color: "#ef4444" },
                    { label: "With ARTIS Protocol", seasons: activePlayer.stage === 4 ? "3.2" : "5.7", games: activePlayer.stage === 4 ? "52" : "67", color: "#22c55e" },
                  ].map(item => (
                    <div key={item.label} style={{ ...styles.impactCard, borderColor: item.color }}>
                      <div style={{ ...styles.impactLabel, color: item.color }}>{item.label}</div>
                      <div style={styles.impactStat}>
                        <span style={{ ...styles.impactNum, color: item.color }}>{item.seasons}</span>
                        <span style={styles.impactUnit}>seasons remaining</span>
                      </div>
                      <div style={styles.impactStat}>
                        <span style={{ ...styles.impactNum, color: item.color }}>{item.games}</span>
                        <span style={styles.impactUnit}>avg games/season</span>
                      </div>
                    </div>
                  ))}
                  <div style={styles.impactDelta}>
                    <div style={styles.deltaNum}>+{activePlayer.stage === 4 ? "2.4" : "3.8"}</div>
                    <div style={styles.deltaLabel}>Additional Seasons</div>
                    <div style={styles.deltaTag}>ARTIS ADVANTAGE</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BIOMECHANICS */}
          {activeTab === "biomechanics" && (
            <div style={styles.tabContent}>
              <div style={styles.card}>
                <div style={styles.cardTitle}>MOVEMENT RISK ANALYZER</div>
                <div style={styles.moveGrid}>
                  {Object.keys(BIOMECH_ENGINE.movements).map(mv => {
                    const risk = BIOMECH_ENGINE.calcRisk(mv, activePlayer.stage);
                    const rColor = risk > 0.7 ? "#ef4444" : risk > 0.45 ? "#f97316" : "#22c55e";
                    return (
                      <div key={mv} onClick={() => setSelectedMove(mv)} style={{ ...styles.moveCard, borderColor: selectedMove === mv ? rColor : "rgba(255,255,255,0.08)", background: selectedMove === mv ? `${rColor}11` : "rgba(255,255,255,0.02)" }}>
                        <div style={styles.moveName}>{mv}</div>
                        <div style={styles.moveBarWrap}>
                          <div style={{ ...styles.moveBar, width: `${risk * 100}%`, background: `linear-gradient(90deg, ${rColor}88, ${rColor})` }} />
                        </div>
                        <div style={{ ...styles.moveRisk, color: rColor }}>{(risk * 10).toFixed(1)} / 10 RISK</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* FORCE BREAKDOWN */}
              <div style={styles.card}>
                <div style={styles.cardTitle}>FORCE VECTOR BREAKDOWN — {selectedMove.toUpperCase()}</div>
                <div style={styles.forceGrid}>
                  {Object.entries(BIOMECH_ENGINE.movements[selectedMove]).map(([key, val]) => {
                    const adjusted = val * [0,1,1.4,2.1,3.6][activePlayer.stage];
                    const danger = adjusted > 8;
                    return (
                      <div key={key} style={styles.forceCard}>
                        <div style={styles.forceLabel}>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</div>
                        <div style={{ ...styles.forceNum, color: danger ? "#ef4444" : "#e2e8f0" }}>{adjusted.toFixed(2)}x BW</div>
                        <div style={styles.forceSub}>Body Weight Multiples</div>
                        {danger && <div style={styles.forceDanger}>⚠ EXCEEDS THRESHOLD</div>}
                      </div>
                    );
                  })}
                </div>
                <div style={styles.bioNote}>
                  Forces calculated at Stage {activePlayer.stage} degradation multiplier ({[0,"1.0x","1.4x","2.1x","3.6x"][activePlayer.stage]}). Normal cartilage cushioning assumed absent in bone-contact zones.
                </div>
              </div>
            </div>
          )}

          {/* TAB: RECOMMENDATIONS */}
          {activeTab === "recommendations" && (
            <div style={styles.tabContent}>
              <div style={styles.card}>
                <div style={styles.cardTitle}>AI INTERVENTION PROTOCOL — STAGE {activePlayer.stage}</div>
                <div style={styles.recGrid}>
                  {recs.map((rec, i) => (
                    <div key={i} style={{ ...styles.recCard, borderLeftColor: PRIORITY_COLORS[rec.priority] }}>
                      <div style={styles.recHeader}>
                        <span style={{ ...styles.recType }}>{rec.type.replace(/_/g, " ")}</span>
                        <span style={{ ...styles.recPriority, color: PRIORITY_COLORS[rec.priority], background: `${PRIORITY_COLORS[rec.priority]}18` }}>
                          {rec.priority}
                        </span>
                      </div>
                      <div style={styles.recText}>{rec.text}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* BRANDON ROY CASE STUDY */}
              <div style={{ ...styles.card, borderColor: "#f97316" }}>
                <div style={styles.cardTitle}>📼 CASE STUDY: BRANDON ROY (2011)</div>
                <div style={styles.caseBody}>
                  <div style={styles.caseStat}>
                    <div style={styles.caseNum}>Stage 4</div>
                    <div style={styles.caseLabel}>OA Severity at Retirement</div>
                  </div>
                  <div style={styles.caseStat}>
                    <div style={{ ...styles.caseNum, color: "#ef4444" }}>27</div>
                    <div style={styles.caseLabel}>Age at Forced Retirement</div>
                  </div>
                  <div style={styles.caseStat}>
                    <div style={{ ...styles.caseNum, color: "#22c55e" }}>3.2</div>
                    <div style={styles.caseLabel}>ARTIS Projected Ext. (Seasons)</div>
                  </div>
                </div>
                <div style={styles.caseText}>
                  Roy's medial compartment showed 87% cartilage loss by age 27. ARTIS analysis indicates that a combination of unloader bracing, movement modification (eliminating hard cuts & post play), and AlterG conditioning could have extended his effective career through age 30–31 at a catch-and-shoot specialist role — preserving ~$67M in contract value.
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <footer style={styles.footer}>
        ARTIS · Built for NBA Performance & Medical Staff · Simulated Prototype · Computer Vision + Biomechanics Engine
      </footer>
    </div>
  );
}

// ─── GAUGE METER COMPONENT ────────────────────────────────────────────────────
function GaugeMeter({ value, color, label }) {
  const r = 45, cx = 60, cy = 60;
  const circumference = Math.PI * r;
  const offset = circumference * (1 - value / 100);
  return (
    <div style={{ textAlign: "center", flex: 1 }}>
      <svg width="120" height="70" viewBox="0 0 120 75">
        <path d={`M 15 60 A ${r} ${r} 0 0 1 105 60`} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" strokeLinecap="round" />
        <path d={`M 15 60 A ${r} ${r} 0 0 1 105 60`} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1s ease" }} />
        <text x="60" y="58" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="monospace">{Math.round(value)}%</text>
      </svg>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2, letterSpacing: 1 }}>{label.toUpperCase()}</div>
    </div>
  );
}

// ─── X-RAY CANVAS DRAW ────────────────────────────────────────────────────────
function drawXray(ctx, stage, w, h) {
  ctx.clearRect(0, 0, w, h);
  // Dark background
  ctx.fillStyle = "#050a0f";
  ctx.fillRect(0, 0, w, h);

  // Bone glow
  const grd = ctx.createRadialGradient(w/2, h/2, 10, w/2, h/2, 120);
  grd.addColorStop(0, "rgba(200,220,255,0.12)");
  grd.addColorStop(1, "transparent");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);

  // Femur (top bone)
  ctx.fillStyle = "rgba(200,215,240,0.82)";
  ctx.beginPath();
  ctx.ellipse(w/2, 55, 55, 38, 0, 0, Math.PI*2);
  ctx.fill();

  // Cartilage gap — shrinks with stage
  const gapSizes = [0, 14, 8, 4, 1];
  const gap = gapSizes[stage];

  // Tibia (bottom bone)
  ctx.fillStyle = "rgba(190,210,235,0.78)";
  ctx.beginPath();
  ctx.ellipse(w/2, 55 + 38 + gap*2 + 18, 58, 30, 0, 0, Math.PI*2);
  ctx.fill();

  // Cartilage layer
  if (gap > 2) {
    ctx.fillStyle = `rgba(120,200,160,${gap / 18})`;
    ctx.beginPath();
    ctx.ellipse(w/2, 55 + 38 + gap, 52, gap, 0, 0, Math.PI*2);
    ctx.fill();
  }

  // Bone contact zone (stage 4)
  if (stage === 4) {
    ctx.fillStyle = "rgba(239,68,68,0.6)";
    ctx.beginPath();
    ctx.ellipse(w/2, 55 + 38 + 1, 30, 3, 0, 0, Math.PI*2);
    ctx.fill();
  }

  // Osteophytes (stage 2+)
  if (stage >= 2) {
    ctx.fillStyle = "rgba(200,215,240,0.7)";
    [[w/2-55, 60], [w/2+55, 60], [w/2-58, 130], [w/2+58, 130]].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, stage * 2.5, 0, Math.PI*2);
      ctx.fill();
    });
  }

  // CV scan lines overlay
  ctx.strokeStyle = "rgba(0,200,255,0.04)";
  ctx.lineWidth = 1;
  for (let y = 0; y < h; y += 4) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  // Label
  ctx.fillStyle = "rgba(0,200,255,0.7)";
  ctx.font = "bold 9px monospace";
  ctx.fillText(`STAGE ${stage} · JSW: ${CV_ENGINE.analyzeXray(stage).jointSpace}mm`, 8, h - 8);
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = {
  root: {
    minHeight: "100vh",
    background: "linear-gradient(160deg, #040d18 0%, #060e1a 40%, #020810 100%)",
    color: "#e2e8f0",
    fontFamily: "'Courier New', monospace",
    position: "relative",
    overflow: "hidden",
  },
  noise: {
    position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(0,0,0,0.4)", backdropFilter: "blur(12px)",
    position: "relative", zIndex: 10,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 16 },
  logo: { display: "flex", alignItems: "baseline", gap: 1 },
  logoA: { fontSize: 28, fontWeight: 900, color: "#3b82f6", letterSpacing: -1 },
  logoR: { fontSize: 28, fontWeight: 900, color: "#60a5fa", letterSpacing: -1 },
  logoT: { fontSize: 28, fontWeight: 900, color: "#93c5fd", letterSpacing: -1 },
  logoIS: { fontSize: 28, fontWeight: 900, color: "rgba(255,255,255,0.4)", letterSpacing: -1 },
  logoSub: { fontSize: 11, color: "rgba(255,255,255,0.7)", letterSpacing: 2, fontWeight: 600 },
  logoTag: { fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 1.5, marginTop: 1 },
  headerRight: { display: "flex", alignItems: "center", gap: 24 },
  liveChip: {
    display: "flex", alignItems: "center", gap: 6,
    background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
    borderRadius: 4, padding: "4px 10px", fontSize: 9, letterSpacing: 2, color: "#22c55e", fontWeight: 700,
  },
  liveDot: {
    width: 6, height: 6, borderRadius: "50%", background: "#22c55e",
    boxShadow: "0 0 6px #22c55e", animation: "pulse 1.4s ease infinite",
  },
  headerStat: { textAlign: "center" },
  headerStatNum: { display: "block", fontSize: 18, fontWeight: 800, color: "#e2e8f0", letterSpacing: -0.5 },
  headerStatLabel: { display: "block", fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: 1.5, marginTop: 1 },
  main: { display: "flex", height: "calc(100vh - 62px)", overflow: "hidden", position: "relative", zIndex: 1 },
  sidebar: {
    width: 240, borderRight: "1px solid rgba(255,255,255,0.06)",
    padding: "16px 12px", overflowY: "auto",
    background: "rgba(0,0,0,0.2)",
    display: "flex", flexDirection: "column", gap: 8,
  },
  sidebarTitle: { fontSize: 8, letterSpacing: 3, color: "rgba(255,255,255,0.3)", marginBottom: 4, paddingLeft: 4 },
  playerCard: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 10px", borderRadius: 8, border: "1px solid",
    cursor: "pointer", transition: "all 0.2s ease",
  },
  playerAvatar: {
    width: 36, height: 36, borderRadius: 6, border: "1px solid",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.7)", flexShrink: 0,
    letterSpacing: 0.5,
  },
  playerInfo: { flex: 1, minWidth: 0 },
  playerName: { fontSize: 11, fontWeight: 700, color: "#e2e8f0", letterSpacing: 0.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  playerTeam: { fontSize: 8, color: "rgba(255,255,255,0.35)", marginTop: 1, letterSpacing: 0.5 },
  playerStatus: { fontSize: 8, fontWeight: 700, marginTop: 2, letterSpacing: 0.8 },
  stageCircle: {
    width: 22, height: 22, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 10, fontWeight: 900, color: "white", flexShrink: 0,
  },
  legend: { marginTop: "auto", padding: "12px 4px", borderTop: "1px solid rgba(255,255,255,0.06)" },
  legendTitle: { fontSize: 7, letterSpacing: 3, color: "rgba(255,255,255,0.25)", marginBottom: 8 },
  legendItem: { display: "flex", alignItems: "center", gap: 8, marginBottom: 5 },
  legendDot: { width: 7, height: 7, borderRadius: "50%", flexShrink: 0 },
  legendLabel: { fontSize: 9, color: "rgba(255,255,255,0.45)", letterSpacing: 0.5 },
  center: { flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 },
  patientBanner: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "14px 18px", background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10,
  },
  patientName: { fontSize: 22, fontWeight: 900, letterSpacing: -0.5 },
  patientMeta: { fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2, letterSpacing: 1 },
  stageBadge: { padding: "6px 14px", borderRadius: 6, fontSize: 11, fontWeight: 800, letterSpacing: 1.5 },
  tabs: { display: "flex", gap: 0, borderBottom: "1px solid rgba(255,255,255,0.08)" },
  tab: {
    background: "none", border: "none", borderBottom: "2px solid transparent",
    color: "rgba(255,255,255,0.35)", padding: "8px 20px", cursor: "pointer",
    fontSize: 10, letterSpacing: 2, fontFamily: "inherit", transition: "all 0.2s",
  },
  tabActive: { color: "white", borderBottom: "2px solid" },
  tabContent: { display: "flex", flexDirection: "column", gap: 16 },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  card: {
    background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 10, padding: "16px 18px",
  },
  cardTitle: { fontSize: 9, letterSpacing: 3, color: "rgba(255,255,255,0.4)", marginBottom: 14, fontWeight: 700 },
  scanBar: { position: "relative", height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, marginBottom: 12, overflow: "hidden" },
  scanFill: { position: "absolute", height: "100%", borderRadius: 2, transition: "width 0.1s linear" },
  scanLabel: { position: "absolute", right: 0, top: 6, fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: 1 },
  canvas: { borderRadius: 6, display: "block", margin: "0 auto 12px", border: "1px solid rgba(255,255,255,0.08)" },
  cvResults: { display: "flex", flexDirection: "column", gap: 6 },
  cvRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" },
  cvLabel: { fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: 0.5 },
  cvVal: { fontSize: 11, fontWeight: 800, letterSpacing: 0.5 },
  gaugeWrap: { display: "flex", justifyContent: "space-around", margin: "12px 0" },
  alertBox: (c) => ({
    marginTop: 12, padding: "10px 12px",
    background: `${c}10`, border: `1px solid ${c}33`, borderRadius: 7,
  }),
  alertTitle: { fontSize: 9, letterSpacing: 2, fontWeight: 800, color: "rgba(255,255,255,0.6)", marginBottom: 6 },
  alertBody: { fontSize: 10, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 },
  impactGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 8 },
  impactCard: { padding: "14px", border: "1px solid", borderRadius: 8, background: "rgba(255,255,255,0.02)" },
  impactLabel: { fontSize: 9, fontWeight: 800, letterSpacing: 1.5, marginBottom: 10 },
  impactStat: { marginBottom: 6 },
  impactNum: { fontSize: 24, fontWeight: 900, display: "block", letterSpacing: -1 },
  impactUnit: { fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: 0.8 },
  impactDelta: {
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)",
    borderRadius: 8, padding: 14,
  },
  deltaNum: { fontSize: 32, fontWeight: 900, color: "#22c55e", letterSpacing: -2 },
  deltaLabel: { fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: 1, marginTop: 2 },
  deltaTag: { fontSize: 7, letterSpacing: 2, color: "#22c55e", marginTop: 4, fontWeight: 700 },
  moveGrid: { display: "flex", flexDirection: "column", gap: 8 },
  moveCard: {
    padding: "10px 14px", border: "1px solid", borderRadius: 8, cursor: "pointer", transition: "all 0.2s",
  },
  moveName: { fontSize: 11, fontWeight: 700, marginBottom: 6 },
  moveBarWrap: { height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, marginBottom: 4, overflow: "hidden" },
  moveBar: { height: "100%", borderRadius: 2, transition: "width 0.6s ease" },
  moveRisk: { fontSize: 9, letterSpacing: 1.5, fontWeight: 700 },
  forceGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, margin: "12px 0" },
  forceCard: { padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" },
  forceLabel: { fontSize: 8, letterSpacing: 1.5, color: "rgba(255,255,255,0.35)", marginBottom: 6 },
  forceNum: { fontSize: 20, fontWeight: 900, letterSpacing: -0.5 },
  forceSub: { fontSize: 8, color: "rgba(255,255,255,0.25)", marginTop: 2 },
  forceDanger: { marginTop: 4, fontSize: 7, color: "#ef4444", letterSpacing: 1, fontWeight: 700 },
  bioNote: { fontSize: 9, color: "rgba(255,255,255,0.3)", lineHeight: 1.6, padding: "8px 0", borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 4 },
  recGrid: { display: "flex", flexDirection: "column", gap: 10 },
  recCard: {
    padding: "12px 14px", background: "rgba(255,255,255,0.02)",
    borderRadius: 8, borderLeft: "3px solid", border: "1px solid rgba(255,255,255,0.06)",
  },
  recHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  recType: { fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.5)", fontWeight: 700 },
  recPriority: { fontSize: 7, letterSpacing: 2, fontWeight: 800, padding: "2px 8px", borderRadius: 3 },
  recText: { fontSize: 11, color: "rgba(255,255,255,0.7)", lineHeight: 1.65 },
  caseBody: { display: "flex", gap: 16, margin: "12px 0" },
  caseStat: { flex: 1, textAlign: "center", padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: 8 },
  caseNum: { fontSize: 28, fontWeight: 900, color: "#f97316", letterSpacing: -1 },
  caseLabel: { fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: 1, marginTop: 4 },
  caseText: { fontSize: 10, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, padding: "10px 0", borderTop: "1px solid rgba(255,255,255,0.06)" },
  footer: {
    position: "relative", zIndex: 10, textAlign: "center",
    padding: "10px", fontSize: 8, color: "rgba(255,255,255,0.15)",
    letterSpacing: 2, borderTop: "1px solid rgba(255,255,255,0.04)",
  },
};
