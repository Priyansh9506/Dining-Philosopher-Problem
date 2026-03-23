import { useRef, useState, useCallback } from 'react'

export const N = 5
export const NAMES = ['Aristotle', 'Plato', 'Socrates', 'Descartes', 'Kant']
export const SHORT = ['Arist.', 'Plato', 'Socra.', 'Desc.', 'Kant']
export const PALETTE = ['#4a7cf7', '#e8960a', '#1faa55', '#9b59b6', '#e03535']
export const SCOL = { thinking: '#4a7cf7', hungry: '#e8960a', eating: '#1faa55', deadlocked: '#e03535' }
export const SEMOJI = { thinking: '🤔', hungry: '😤', eating: '😋', deadlocked: '💀' }
export const SLABEL = { thinking: 'thinking', hungry: 'hungry', eating: 'eating', deadlocked: 'stuck' }
export const DISH = ['🍜', '🍝', '🍛', '🍲', '🥘']

const rT = () => 1300 + Math.random() * 2600
const rE = () => 900 + Math.random() * 1700

export const LF = i => i
export const RF = i => (i + 1) % N

function makeSimState() {
  return {
    philosophers: Array.from({ length: N }, (_, i) => ({
      state: 'thinking',
      timer: rT() + i * 320,
      holdL: false,
      holdR: false,
      anim: Math.random() * Math.PI * 2,
      meals: 0,
    })),
    forks: Array.from({ length: N }, () => ({ heldBy: -1 })),
    waiterBusy: false,
  }
}

export function useSimulation() {
  const simRef        = useRef(makeSimState())
  const runningRef    = useRef(false)
  const speedRef      = useRef(1)
  const modeRef       = useRef('naive')
  const finishedRef   = useRef(false)
  const deadlockedRef = useRef(false)
  const dlTimerRef    = useRef(null)
  const totalDLRef    = useRef(0)
  const limitRef      = useRef({ enabled: false, limit: 25 })

  // Reactive stats for UI (updated periodically)
  const [stats, setStats]       = useState({ meals: Array(N).fill(0), total: 0, deadlocks: 0 })
  const [log, setLog]           = useState([{ text: 'Simulation ready. Press Start to begin', type: 'info', id: 0 }])
  const [running, setRunning]   = useState(false)
  const [finished, setFinished] = useState(false)
  const [deadlocked, setDeadlocked] = useState(false)
  const [progress, setProgress] = useState({ pct: 0, label: '0 of 0 meals' })
  const logIdRef = useRef(1)

  const addLog = useCallback((text, type = 'info') => {
    const id = logIdRef.current++
    setLog(prev => [{ text, type, id }, ...prev].slice(0, 80))
  }, [])

  const syncStats = useCallback(() => {
    const s = simRef.current
    const meals = s.philosophers.map(p => p.meals)
    const total = meals.reduce((a, b) => a + b, 0)
    const { enabled, limit } = limitRef.current
    setStats({ meals, total, deadlocks: totalDLRef.current })
    if (enabled) {
      const pct = Math.min((total / limit) * 100, 100)
      setProgress({ pct, label: `${total} of ${limit} meals` })
    }
  }, [])

  const release = useCallback((i) => {
    const s = simRef.current
    const p = s.philosophers[i]
    ;[LF(i), RF(i)].forEach(f => { if (s.forks[f].heldBy === i) s.forks[f].heldBy = -1 })
    p.holdL = p.holdR = false
    p.state = 'thinking'
    p.timer = rT()
    addLog(`${NAMES[i]} finished eating`, 'info')
  }, [addLog])

  const checkFinish = useCallback(() => {
    const { enabled, limit } = limitRef.current
    if (!enabled || finishedRef.current) return
    const total = simRef.current.philosophers.reduce((a, p) => a + p.meals, 0)
    if (total >= limit) {
      finishedRef.current = true
      runningRef.current = false
      setRunning(false)
      setFinished(true)
      addLog(`Done. ${total} total meals eaten`, 'done')
    }
  }, [addLog])

  const tryAcquire = useCallback((i) => {
    const s = simRef.current
    const p = s.philosophers[i]
    const lf = LF(i), rf = RF(i)
    const mode = modeRef.current

    if (mode === 'naive') {
      if (!p.holdL && s.forks[lf].heldBy === -1) { s.forks[lf].heldBy = i; p.holdL = true }
      if (p.holdL && !p.holdR && s.forks[rf].heldBy === -1) { s.forks[rf].heldBy = i; p.holdR = true }
    } else if (mode === 'hierarchy') {
      const lo = Math.min(lf, rf), hi = Math.max(lf, rf)
      if (s.forks[lo].heldBy === -1) s.forks[lo].heldBy = i
      if (s.forks[lo].heldBy === i && s.forks[hi].heldBy === -1) s.forks[hi].heldBy = i
      p.holdL = s.forks[lf].heldBy === i
      p.holdR = s.forks[rf].heldBy === i
    } else {
      if (!s.waiterBusy && s.forks[lf].heldBy === -1 && s.forks[rf].heldBy === -1) {
        s.waiterBusy = true
        s.forks[lf].heldBy = s.forks[rf].heldBy = i
        p.holdL = p.holdR = true
        s.waiterBusy = false
      }
    }

    if (p.holdL && p.holdR) {
      p.state = 'eating'
      p.timer = rE()
      p.meals++
      addLog(`${NAMES[i]} eating, meal #${p.meals}`, 'eat')
      syncStats()
      checkFinish()
    }
  }, [addLog, syncStats, checkFinish])

  const resolveDeadlock = useCallback(() => {
    deadlockedRef.current = false
    setDeadlocked(false)
    const s = simRef.current
    s.forks.forEach(f => f.heldBy = -1)
    s.philosophers.forEach((p, i) => {
      p.state = 'thinking'; p.holdL = p.holdR = false; p.timer = rT() + i * 300
    })
    addLog('Deadlock resolved, simulation resuming', 'info')
  }, [addLog])

  const triggerDeadlock = useCallback(() => {
    if (deadlockedRef.current) return
    deadlockedRef.current = true
    totalDLRef.current++
    simRef.current.philosophers.forEach(p => p.state = 'deadlocked')
    addLog('DEADLOCK: circular wait, all philosophers stuck', 'dead')
    setDeadlocked(true)
    setStats(prev => ({ ...prev, deadlocks: totalDLRef.current }))
    dlTimerRef.current = setTimeout(resolveDeadlock, 3500 / speedRef.current)
  }, [addLog, resolveDeadlock])

  const checkDeadlock = useCallback(() => {
    if (deadlockedRef.current || modeRef.current !== 'naive') return
    const s = simRef.current
    const allH = s.philosophers.every(p => p.state === 'hungry')
    if (!allH) return
    const eachL = s.philosophers.every((_, i) => s.forks[LF(i)].heldBy === i)
    const noneR = s.philosophers.every((_, i) => s.forks[RF(i)].heldBy !== i)
    if (eachL && noneR) triggerDeadlock()
  }, [triggerDeadlock])

  const update = useCallback((dt) => {
    const sdt = dt * speedRef.current
    const s = simRef.current
    s.philosophers.forEach((p, i) => {
      if (p.state === 'deadlocked') return
      p.anim += sdt * (p.state === 'eating' ? 0.004 : p.state === 'hungry' ? 0.003 : 0.0015)
      if (p.state === 'thinking') {
        if ((p.timer -= sdt) <= 0) { p.state = 'hungry'; addLog(`${NAMES[i]} grew hungry`, 'hunger') }
      } else if (p.state === 'hungry') {
        tryAcquire(i)
      } else if (p.state === 'eating') {
        if ((p.timer -= sdt) <= 0) release(i)
      }
    })
  }, [addLog, tryAcquire, release])

  const forceDeadlock = useCallback(() => {
    if (deadlockedRef.current || modeRef.current !== 'naive' || finishedRef.current) return
    const s = simRef.current
    s.forks.forEach(f => f.heldBy = -1)
    s.philosophers.forEach((p, i) => { p.state = 'hungry'; p.holdL = p.holdR = false; p.timer = 0 })
    for (let i = 0; i < N; i++) { s.forks[LF(i)].heldBy = i; s.philosophers[i].holdL = true }
    triggerDeadlock()
  }, [triggerDeadlock])

  const reset = useCallback(() => {
    runningRef.current = false
    deadlockedRef.current = false
    finishedRef.current = false
    totalDLRef.current = 0
    if (dlTimerRef.current) clearTimeout(dlTimerRef.current)
    simRef.current = makeSimState()
    setRunning(false)
    setFinished(false)
    setDeadlocked(false)
    setStats({ meals: Array(N).fill(0), total: 0, deadlocks: 0 })
    setProgress({ pct: 0, label: `0 of ${limitRef.current.limit} meals` })
    setLog([{ text: 'Simulation ready. Press Start to begin', type: 'info', id: logIdRef.current++ }])
  }, [])

  const togglePlay = useCallback(() => {
    if (finishedRef.current) return
    runningRef.current = !runningRef.current
    setRunning(runningRef.current)
  }, [])

  const setMode = useCallback((m) => {
    modeRef.current = m
    reset()
  }, [reset])

  const setSpeed = useCallback((v) => {
    speedRef.current = parseFloat(v)
  }, [])

  const setLimit = useCallback((enabled, limit) => {
    limitRef.current = { enabled, limit }
    if (!enabled) setProgress({ pct: 0, label: '0 of 0 meals' })
    else syncStats()
  }, [syncStats])

  return {
    simRef, runningRef, speedRef, modeRef,
    stats, log, running, finished, deadlocked, progress,
    update, checkDeadlock, syncStats,
    togglePlay, reset, setMode, setSpeed, setLimit, forceDeadlock,
  }
}
