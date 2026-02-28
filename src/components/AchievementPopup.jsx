import { useEffect, useRef, useState } from 'react'

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#fbbf24','#34d399','#60a5fa','#f87171','#a78bfa']

export default function AchievementPopup({ achievement, onDismiss }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const timerRef = useRef(null)
  const [progressKey, setProgressKey] = useState(0)

  useEffect(() => {
    if (!achievement) return
    setProgressKey(k => k + 1)
    startConfetti()
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(onDismiss, 8000)
    return () => { clearTimeout(timerRef.current); stopConfetti() }
  }, [achievement])

  function startConfetti() {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const particles = Array.from({ length: 55 }, () => ({
      x: 20 + Math.random() * 320,
      y: 20 + Math.random() * 180,
      w: 6 + Math.random() * 7, h: 3 + Math.random() * 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * 360, rotV: (Math.random() - 0.5) * 10,
      vy: 1 + Math.random() * 3, vx: (Math.random() - 0.5) * 2,
      opacity: 1,
    }))
    const draw = () => {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let alive = false
      particles.forEach(p => {
        p.y += p.vy; p.x += p.vx; p.rot += p.rotV
        if (p.y > canvas.height * 0.55) p.opacity -= 0.025
        if (p.opacity > 0) {
          alive = true
          ctx.save()
          ctx.globalAlpha = Math.max(0, p.opacity)
          ctx.translate(p.x, p.y)
          ctx.rotate(p.rot * Math.PI / 180)
          ctx.fillStyle = p.color
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
          ctx.restore()
        }
      })
      if (alive) animRef.current = requestAnimationFrame(draw)
    }
    draw()
  }

  function stopConfetti() {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    const canvas = canvasRef.current
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:99998 }}
      />
      <div className={`ach-overlay${achievement ? ' show' : ''}`}>
        {achievement && (
          <div className="ach-epic-card">
            <div className="ach-epic-glow" />
            <button className="ach-epic-close" onClick={onDismiss}>✕</button>
            <div className="ach-epic-top">
              <div className="ach-epic-icon">{achievement.icon}</div>
              <div className="ach-epic-header">
                <div className="ach-epic-badge">🔓 Achievement odemčen!</div>
                <div className="ach-epic-name">{achievement.name}</div>
                <div className="ach-epic-xp">+{achievement.xp} XP</div>
              </div>
            </div>
            <div className="ach-epic-story">{achievement.story}</div>
            <div className="ach-epic-progress">
              <div key={progressKey} className="ach-epic-progress-fill" />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
