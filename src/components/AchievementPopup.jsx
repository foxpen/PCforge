import { useEffect, useRef, useState } from 'react'

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#fbbf24','#34d399','#60a5fa','#f87171','#a78bfa']

export default function AchievementPopup({ achievement, onDismiss }) {
  const canvasRef  = useRef(null)
  const animRef    = useRef(null)
  const timerRef   = useRef(null)
  const [pKey, setPKey] = useState(0)

  useEffect(() => {
    if (!achievement) return
    setPKey(k => k+1)
    startConfetti()
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(onDismiss, 8000)
    return () => { clearTimeout(timerRef.current); stopConfetti() }
  }, [achievement])

  function startConfetti() {
    const canvas = canvasRef.current; if (!canvas) return
    canvas.width = window.innerWidth; canvas.height = window.innerHeight
    const ps = Array.from({length:55}, () => ({
      x:20+Math.random()*320, y:20+Math.random()*180,
      w:6+Math.random()*7, h:3+Math.random()*4,
      color:COLORS[Math.floor(Math.random()*COLORS.length)],
      rot:Math.random()*360, rotV:(Math.random()-0.5)*10,
      vy:1+Math.random()*3, vx:(Math.random()-0.5)*2, opacity:1,
    }))
    const draw = () => {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0,0,canvas.width,canvas.height)
      let alive = false
      ps.forEach(p => {
        p.y+=p.vy; p.x+=p.vx; p.rot+=p.rotV
        if(p.y > canvas.height*0.55) p.opacity-=0.025
        if(p.opacity>0) { alive=true; ctx.save(); ctx.globalAlpha=Math.max(0,p.opacity); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180); ctx.fillStyle=p.color; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); ctx.restore() }
      })
      if(alive) animRef.current=requestAnimationFrame(draw)
    }; draw()
  }
  function stopConfetti() {
    if(animRef.current) cancelAnimationFrame(animRef.current)
    const c=canvasRef.current; if(c) c.getContext('2d').clearRect(0,0,c.width,c.height)
  }

  return (
    <>
      <canvas ref={canvasRef} style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:99998}} />
      <div className="fixed z-[99999]" style={{top:'1.25rem',left:'1.25rem',transform:achievement?'translateX(0)':'translateX(-120%)', transition:'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',pointerEvents:achievement?'all':'none'}}>
        {achievement && (
          <div className="relative overflow-hidden rounded-2xl" style={{width:'clamp(260px,22vw,320px)', background:'rgba(13,13,26,0.97)', border:'1px solid var(--accent-b)', backdropFilter:'blur(40px)', padding:'1.25rem'}}>
            {/* Glow ring */}
            <div className="absolute inset-[-1px] rounded-2xl pointer-events-none opacity-15 animate-glow-spin"
              style={{background:'conic-gradient(from 0deg,#6366f1,#a855f7,#06b6d4,#6366f1)'}} />
            <button onClick={onDismiss}
              className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-[0.75rem] cursor-pointer border-none z-10"
              style={{background:'rgba(255,255,255,0.08)', color:'var(--tx2)'}}>✕</button>
            <div className="flex items-start gap-3 mb-3 relative z-10">
              <span className="text-[2rem] animate-bounce-icon">{achievement.icon}</span>
              <div>
                <div className="text-[0.6rem] font-bold uppercase tracking-wider mb-1" style={{color:'var(--accent)'}}>🔓 Achievement odemčen!</div>
                <div className="font-bold text-[0.95rem]" style={{color:'var(--tx)'}}>{achievement.name}</div>
                <span className="inline-block mt-1 font-mono text-[0.65rem] font-bold px-2 py-0.5 rounded-md" style={{background:'var(--accent-s)', color:'var(--accent)'}}>+{achievement.xp} XP</span>
              </div>
            </div>
            <div className="text-[0.72rem] leading-relaxed mb-3 relative z-10" style={{color:'var(--tx2)'}}>{achievement.story}</div>
            <div className="h-[3px] rounded-full overflow-hidden relative z-10" style={{background:'rgba(255,255,255,0.1)'}}>
              <div key={pKey} className="h-full rounded-full animate-drain" style={{background:'var(--accent)'}} />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
