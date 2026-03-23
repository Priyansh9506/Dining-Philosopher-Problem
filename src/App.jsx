import { useRef, useState, useCallback } from 'react'
import { useSimulation, NAMES, SHORT, PALETTE, N } from './useSimulation'
import { useCanvas } from './useCanvas'
import styles from './App.module.css'

const MODE_INFO = {
  naive:     { title: 'Naive Mode',           desc: 'Each philosopher picks up the left fork first, then waits for the right. If all 5 act simultaneously, circular wait leads to deadlock.' },
  hierarchy: { title: 'Resource Hierarchy',   desc: 'Each philosopher must acquire the lower-indexed fork first. This breaks the circular dependency so deadlock cannot occur.' },
  waiter:    { title: 'Arbitrator / Waiter',  desc: 'A waiter (mutex) grants permission only when both forks are free simultaneously. At most one philosopher may acquire at a time.' },
}

// ── Shared SVG Icons ─────────────────────────────────────────────────────────
const PlayIcon    = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
const PauseIcon   = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
const ResetIcon   = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
const WarnIcon    = ({ size = 15 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
const CheckIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
const ListIcon    = () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
const PeopleIcon  = () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>

export default function App() {
  const canvasRef = useRef(null)
  const [mode, setModeState] = useState('naive')
  const [speed, setSpeedState] = useState(1)
  const [limitEnabled, setLimitEnabled] = useState(false)
  const [limitValue, setLimitValue] = useState(25)

  const sim = useSimulation()
  const finishedRef = useRef(false)

  // keep finishedRef in sync
  finishedRef.current = sim.finished

  const handleSetMode = useCallback((m) => {
    setModeState(m)
    sim.setMode(m)
  }, [sim])

  const handleSpeed = useCallback((v) => {
    const n = parseFloat(v)
    setSpeedState(n)
    sim.setSpeed(n)
  }, [sim])

  const handleLimitToggle = useCallback((e) => {
    setLimitEnabled(e.target.checked)
    sim.setLimit(e.target.checked, limitValue)
  }, [sim, limitValue])

  const handleLimitValue = useCallback((e) => {
    const v = parseInt(e.target.value) || 25
    setLimitValue(v)
    sim.setLimit(limitEnabled, v)
  }, [sim, limitEnabled])

  useCanvas(canvasRef, sim.simRef, sim.runningRef, finishedRef, sim.checkDeadlock, sim.update, sim.syncStats)

  const { meals, total, deadlocks } = sim.stats
  const maxMeals = Math.max(...meals, 1)
  const { title: modeTitle, desc: modeDesc } = MODE_INFO[mode]

  return (
    <div className={styles.app}>

      {/* ── Header ─────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9"/>
            </svg>
          </div>
          <div>
            <div className={styles.brandTitle}>Dining Philosophers</div>
            <div className={styles.brandSub}>Process Synchronization | OS Visualizer</div>
          </div>
        </div>
        <div className={styles.headerPills}>
          {[
            { label: 'Thinking',  color: 'var(--thinking)' },
            { label: 'Hungry',    color: 'var(--hungry)'   },
            { label: 'Eating',    color: 'var(--eating)'   },
            { label: 'Deadlock',  color: 'var(--deadlock)' },
          ].map(({ label, color }) => (
            <div key={label} className={styles.hpill}>
              <span className={styles.hpillDot} style={{ background: color }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </header>

      <div className={styles.page}>

        {/* ── Banners ────────────────────────────────── */}
        {sim.deadlocked && (
          <div className={`${styles.banner} ${styles.bannerDl}`}>
            <WarnIcon /> Deadlock detected: all philosophers are waiting indefinitely
          </div>
        )}
        {sim.finished && (
          <div className={`${styles.banner} ${styles.bannerOk}`}>
            <CheckIcon /> Simulation complete. Meal target reached!
          </div>
        )}

        {/* ── Hero Row ───────────────────────────────── */}
        <div className={styles.heroRow}>

          {/* Canvas */}
          <div className={styles.canvasCard}>
            <canvas ref={canvasRef} width={480} height={480} className={styles.canvas} />
            <div className={styles.legend}>
              {[
                { label: 'Thinking',   color: 'var(--thinking)' },
                { label: 'Hungry',     color: 'var(--hungry)'   },
                { label: 'Eating',     color: 'var(--eating)'   },
                { label: 'Deadlocked', color: 'var(--deadlock)' },
              ].map(({ label, color }) => (
                <div key={label} className={styles.legItem}>
                  <span className={styles.legDot} style={{ background: color }} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div className={styles.rightPanel}>

            {/* Meals per philosopher */}
            <div className={styles.card}>
              <div className={styles.cardLabel}>Meals per Philosopher</div>
              <div className={styles.statRows}>
                {meals.map((m, i) => (
                  <div key={i} className={styles.statRow}>
                    <span className={styles.statName} style={{ color: PALETTE[i] }}>{SHORT[i]}</span>
                    <div className={styles.barTrack}>
                      <div className={styles.barFill} style={{ width: `${(m / maxMeals) * 100}%`, background: PALETTE[i] }} />
                    </div>
                    <span className={styles.statNum}>{m}</span>
                  </div>
                ))}
              </div>
              <div className={styles.totalsMini}>
                <div className={styles.totBox}>
                  <div className={styles.totLabel}>Total Meals</div>
                  <div className={styles.totVal}>{total}</div>
                </div>
                <div className={styles.totBox}>
                  <div className={styles.totLabel}>Deadlocks</div>
                  <div className={`${styles.totVal} ${styles.totValRed}`}>{deadlocks}</div>
                </div>
              </div>
            </div>

            {/* Event Log */}
            <div className={`${styles.card} ${styles.logCard}`}>
              <div className={styles.cardLabel}>Event Log</div>
              <div className={styles.logWrap}>
                {sim.log.map(entry => (
                  <div key={entry.id} className={`${styles.logEntry} ${styles[`log_${entry.type}`]}`}>
                    {entry.text}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── Controls Row ───────────────────────────── */}
        <div className={styles.controlsRow}>

          {/* Playback */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>Playback</div>
            <div className={styles.btnRow}>
              <button
                className={`${styles.btn} ${sim.running ? '' : styles.btnFilled}`}
                onClick={sim.togglePlay}
                disabled={sim.finished}
              >
                {sim.running ? <><PauseIcon /> Pause</> : <><PlayIcon /> {sim.stats.total > 0 ? 'Resume' : 'Start'}</>}
              </button>
              <button className={styles.btn} onClick={sim.reset}>
                <ResetIcon /> Reset
              </button>
            </div>
            <div className={styles.speedRow}>
              <span className={styles.speedLbl}>Simulation speed</span>
              <span className={styles.speedVal}>{speed}x</span>
            </div>
            <input type="range" min="0.5" max="6" step="0.5" value={speed}
              onChange={e => handleSpeed(e.target.value)} />
          </div>

          {/* Meal target */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>Meal Target</div>
            <div className={styles.mealRow}>
              <label className={styles.checkRow}>
                <input type="checkbox" checked={limitEnabled} onChange={handleLimitToggle} />
                Stop at total meal count
              </label>
              <div className={styles.mealInputRow}>
                <input
                  type="number" className={styles.numInput}
                  value={limitValue} min={5} max={500} step={5}
                  onChange={handleLimitValue}
                  disabled={!limitEnabled}
                />
                <span className={styles.mealUnit}>meals total</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${sim.progress.pct}%` }} />
              </div>
              <div className={styles.progressInfo}>
                <span>{sim.progress.label}</span>
                <span>{limitEnabled ? `${Math.round(sim.progress.pct)}%` : '0%'}</span>
              </div>
            </div>
          </div>

          {/* Deadlock demo */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>Deadlock Demo</div>
            <p className={styles.demoDesc}>Forces all philosophers into a circular wait. Only available in Naive mode.</p>
            <button
              className={`${styles.btn} ${styles.btnWarn}`}
              onClick={sim.forceDeadlock}
              disabled={mode !== 'naive' || sim.finished || sim.deadlocked}
            >
              <WarnIcon size={13} /> Force Deadlock
            </button>
          </div>

        </div>

        {/* ── Mode Selection ─────────────────────────── */}
        <div className={styles.card}>
          <div className={styles.cardLabel}>Solution Mode</div>
          <div className={styles.modesGrid}>
            {[
              { key: 'naive',     label: 'Naive',              tag: 'Deadlock possible',   Icon: () => <WarnIcon size={19} /> },
              { key: 'hierarchy', label: 'Resource Hierarchy', tag: 'Ordered acquisition', Icon: ListIcon   },
              { key: 'waiter',    label: 'Arbitrator',         tag: 'Waiter / Mutex',      Icon: PeopleIcon },
            ].map(({ key, label, tag, Icon }) => (
              <button
                key={key}
                className={`${styles.modeBtn} ${mode === key ? styles.modeBtnActive : ''}`}
                onClick={() => handleSetMode(key)}
              >
                <div className={styles.modeIcon}><Icon /></div>
                {label}
                <span className={styles.modeTag}>{tag}</span>
              </button>
            ))}
          </div>
          <div className={styles.modeInfo}>
            <strong>{modeTitle}</strong>
            {modeDesc}
          </div>
        </div>

      </div>
    </div>
  )
}
