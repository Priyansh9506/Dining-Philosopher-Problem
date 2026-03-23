import { useEffect, useRef } from 'react'
import { N, LF, RF, SCOL, SEMOJI, SLABEL, NAMES, DISH } from './useSimulation'

const W = 480, H = 480, CX = 240, CY = 240
const ORBIT_R = 175, TABLE_R = 98, FORK_R = 136, PHIL_R = 28

const PHI_ANG  = Array.from({ length: N }, (_, i) => -Math.PI / 2 + (2 * Math.PI / N) * i)
const FORK_ANG = Array.from({ length: N }, (_, i) => {
  const a1 = PHI_ANG[i]
  const a2 = i === N - 1 ? PHI_ANG[0] + 2 * Math.PI : PHI_ANG[i + 1]
  return (a1 + a2) / 2
})

export const philPos = i => ({ x: CX + ORBIT_R * Math.cos(PHI_ANG[i]), y: CY + ORBIT_R * Math.sin(PHI_ANG[i]) })
export const forkPos = f => ({ x: CX + FORK_R  * Math.cos(FORK_ANG[f]), y: CY + FORK_R  * Math.sin(FORK_ANG[f]) })

function drawTable(ctx, sim) {
  // drop shadow
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.13)'; ctx.shadowBlur = 44; ctx.shadowOffsetY = 9
  ctx.beginPath(); ctx.arc(CX, CY, TABLE_R + 2, 0, Math.PI * 2)
  ctx.fillStyle = '#b07840'; ctx.fill()
  ctx.restore()

  // wood rings
  for (let r = TABLE_R; r > 6; r -= 13) {
    ctx.beginPath(); ctx.arc(CX, CY, r, 0, Math.PI * 2)
    const t = (TABLE_R - r) / TABLE_R
    ctx.strokeStyle = `rgba(42,18,5,${0.17 + t * 0.09})`
    ctx.lineWidth = 9; ctx.stroke()
  }

  // radial grain
  ctx.save()
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 10) {
    ctx.beginPath()
    ctx.moveTo(CX + 7 * Math.cos(a), CY + 7 * Math.sin(a))
    ctx.lineTo(CX + TABLE_R * Math.cos(a), CY + TABLE_R * Math.sin(a))
    ctx.strokeStyle = 'rgba(30,10,2,0.04)'; ctx.lineWidth = 1; ctx.stroke()
  }
  ctx.restore()

  // walnut fill
  const tg = ctx.createRadialGradient(CX - 28, CY - 28, 5, CX, CY, TABLE_R)
  tg.addColorStop(0, '#ca8e5a'); tg.addColorStop(0.44, '#a86c3a'); tg.addColorStop(1, '#6c3c16')
  ctx.beginPath(); ctx.arc(CX, CY, TABLE_R, 0, Math.PI * 2); ctx.fillStyle = tg; ctx.fill()

  // sheen
  const sh = ctx.createRadialGradient(CX - 33, CY - 38, 4, CX - 10, CY - 14, TABLE_R * 0.66)
  sh.addColorStop(0, 'rgba(255,255,255,0.19)'); sh.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.beginPath(); ctx.arc(CX, CY, TABLE_R, 0, Math.PI * 2); ctx.fillStyle = sh; ctx.fill()

  // outer rim
  ctx.beginPath(); ctx.arc(CX, CY, TABLE_R, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(34,14,3,0.46)'; ctx.lineWidth = 3.5; ctx.stroke()
  ctx.beginPath(); ctx.arc(CX, CY, TABLE_R - 3, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(255,200,130,0.22)'; ctx.lineWidth = 1.5; ctx.stroke()

  // inner ring
  ctx.beginPath(); ctx.arc(CX, CY, TABLE_R - 11, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(34,14,3,0.11)'; ctx.lineWidth = 1; ctx.stroke()

  // plates
  for (let i = 0; i < N; i++) {
    const ang = PHI_ANG[i]
    const px = CX + (TABLE_R - 26) * Math.cos(ang)
    const py = CY + (TABLE_R - 26) * Math.sin(ang)
    const p = sim.philosophers[i]

    ctx.beginPath(); ctx.ellipse(px, py + 2.5, 11, 3.5, 0, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.fill()
    ctx.beginPath(); ctx.arc(px, py, 11.5, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0,0,0,0.07)'; ctx.fill()
    const pg = ctx.createRadialGradient(px - 2, py - 2, 1, px, py, 11)
    pg.addColorStop(0, '#f9f5ef'); pg.addColorStop(1, '#ece4d4')
    ctx.beginPath(); ctx.arc(px, py, 10.5, 0, Math.PI * 2); ctx.fillStyle = pg; ctx.fill()
    ctx.beginPath(); ctx.arc(px, py, 10.5, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(150,115,75,0.38)'; ctx.lineWidth = 1.2; ctx.stroke()
    ctx.beginPath(); ctx.arc(px, py, 8.5, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(150,115,75,0.15)'; ctx.lineWidth = 0.7; ctx.stroke()

    ctx.font = '9px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(p.state === 'eating' ? DISH[i] : '🍽', px, py)
  }

  // centerpiece
  ctx.beginPath(); ctx.arc(CX, CY, 20, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fill()
  ctx.beginPath(); ctx.arc(CX, CY, 18, 0, Math.PI * 2)
  const bowl = ctx.createRadialGradient(CX - 3, CY - 3, 1, CX, CY, 18)
  bowl.addColorStop(0, '#f7f2ea'); bowl.addColorStop(1, '#e8ddc8')
  ctx.fillStyle = bowl; ctx.fill()
  ctx.beginPath(); ctx.arc(CX, CY, 18, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(150,115,75,0.32)'; ctx.lineWidth = 1; ctx.stroke()
  ctx.font = '12px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('🌸', CX, CY)

  // connector guides
  ctx.save(); ctx.setLineDash([2, 8]); ctx.lineWidth = 0.6
  for (let i = 0; i < N; i++) {
    const pp = philPos(i), fl = forkPos(LF(i)), fr = forkPos(RF(i))
    ctx.strokeStyle = 'rgba(0,0,0,0.07)'
    ctx.beginPath(); ctx.moveTo(pp.x, pp.y); ctx.lineTo(fl.x, fl.y); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(pp.x, pp.y); ctx.lineTo(fr.x, fr.y); ctx.stroke()
  }
  ctx.setLineDash([]); ctx.restore()
}

function drawForkShape(ctx, x, y, angle, color, glowAmt) {
  ctx.save()
  ctx.translate(x, y); ctx.rotate(angle + Math.PI / 2)
  if (glowAmt > 0) { ctx.shadowColor = color; ctx.shadowBlur = glowAmt }
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineCap = 'round'; ctx.lineJoin = 'round'

  ctx.beginPath()
  ctx.moveTo(-1.3, 9); ctx.lineTo(-1.3, 23); ctx.lineTo(1.3, 23); ctx.lineTo(1.3, 9)
  ctx.closePath(); ctx.fill()

  ctx.beginPath()
  ctx.moveTo(-1, 3.5); ctx.quadraticCurveTo(-1.6, 6, -1.3, 9)
  ctx.lineTo(1.3, 9); ctx.quadraticCurveTo(1.6, 6, 1, 3.5)
  ctx.closePath(); ctx.fill()

  const ts = 2.3, tl = 13, tb = -3.5
  for (let t = -1.5; t <= 1.5; t++) {
    const tx = t * ts
    ctx.beginPath(); ctx.moveTo(tx, tb); ctx.lineTo(tx, tb - tl); ctx.lineWidth = 1.6; ctx.stroke()
    ctx.beginPath(); ctx.arc(tx, tb - tl, 0.88, 0, Math.PI * 2); ctx.fill()
  }
  ctx.beginPath(); ctx.moveTo(-1.5 * ts, tb); ctx.lineTo(1.5 * ts, tb); ctx.lineWidth = 2; ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(-1.5 * ts, tb); ctx.lineTo(-1, 3.5)
  ctx.moveTo(1.5 * ts, tb); ctx.lineTo(1, 3.5)
  ctx.lineWidth = 1.3; ctx.stroke()
  ctx.restore()
}

function drawForks(ctx, sim) {
  for (let fi = 0; fi < N; fi++) {
    const fork = sim.forks[fi], fp = forkPos(fi)
    const held = fork.heldBy !== -1
    const col = held ? SCOL[sim.philosophers[fork.heldBy].state] : '#c8b898'
    drawForkShape(ctx, fp.x, fp.y, FORK_ANG[fi], col, held ? 12 : 0)

    const lr = FORK_R + 32
    ctx.save()
    ctx.font = "400 7.5px 'DM Sans', sans-serif"
    ctx.fillStyle = held ? col + 'cc' : '#bbb0a0'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(`F${fi}`, CX + lr * Math.cos(FORK_ANG[fi]), CY + lr * Math.sin(FORK_ANG[fi]))
    ctx.restore()
  }
}

function drawPhilosophers(ctx, sim) {
  for (let i = 0; i < N; i++) {
    const p = sim.philosophers[i], pp = philPos(i)
    const col = SCOL[p.state]
    const pulse = Math.sin(p.anim) * 0.5 + 0.5

    ctx.beginPath(); ctx.arc(pp.x, pp.y, PHIL_R + 5 + pulse * 3, 0, Math.PI * 2)
    ctx.strokeStyle = col; ctx.globalAlpha = 0.1 + pulse * 0.09; ctx.lineWidth = 1; ctx.stroke()
    ctx.globalAlpha = 1

    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 2
    ctx.beginPath(); ctx.arc(pp.x, pp.y, PHIL_R, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill()
    ctx.restore()

    if (p.state === 'eating') {
      ctx.beginPath(); ctx.arc(pp.x, pp.y, PHIL_R, 0, Math.PI * 2)
      ctx.fillStyle = col + '16'; ctx.fill()
    }

    ctx.beginPath(); ctx.arc(pp.x, pp.y, PHIL_R, 0, Math.PI * 2)
    ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.stroke()

    ctx.font = '16px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(SEMOJI[p.state], pp.x, pp.y)

    ;[sim.forks[LF(i)].heldBy === i, sim.forks[RF(i)].heldBy === i].forEach((h, di) => {
      ctx.beginPath(); ctx.arc(pp.x + (di === 0 ? -8 : 8), pp.y + PHIL_R - 5, 2.5, 0, Math.PI * 2)
      ctx.fillStyle = h ? col : '#e8e4dc'; ctx.fill()
    })

    const ny = pp.y + PHIL_R + 7
    ctx.font = "600 9px 'DM Sans', sans-serif"
    ctx.fillStyle = '#1a1915'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
    ctx.fillText(NAMES[i].toUpperCase(), pp.x, ny)
    ctx.font = "400 8px 'DM Sans', sans-serif"
    ctx.fillStyle = col; ctx.fillText(SLABEL[p.state], pp.x, ny + 11)
  }
}

export function useCanvas(canvasRef, simRef, runningRef, finishedRef, checkDeadlock, update, syncStats) {
  const rafRef   = useRef(null)
  const lastTsRef = useRef(null)
  const frameRef  = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function loop(ts) {
      rafRef.current = requestAnimationFrame(loop)
      if (lastTsRef.current !== null && runningRef.current && !finishedRef.current) {
        const dt = Math.min(ts - lastTsRef.current, 60)
        update(dt)
        checkDeadlock()
        if (frameRef.current++ % 4 === 0) syncStats()
      }
      lastTsRef.current = ts

      ctx.clearRect(0, 0, W, H)
      drawTable(ctx, simRef.current)
      drawForks(ctx, simRef.current)
      drawPhilosophers(ctx, simRef.current)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [canvasRef, simRef, runningRef, finishedRef, checkDeadlock, update, syncStats])
}
