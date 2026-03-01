import { useState } from 'react'
import { achievements } from '../data/achievements.js'

export default function AchievementHud({ level, xpPct, count, unlocked, totalXp, stats, onReset }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 glass rounded-2xl px-4 py-2.5 cursor-pointer transition-all hover:border-[color:var(--accent-b)]">
        <span className="text-lg">🏆</span>
        <div>
          <div className="text-[0.7rem] font-bold" style={{color:'var(--tx)'}}>Level {level}</div>
          <div className="h-[3px] rounded-full mt-1" style={{width:'80px',background:'var(--surface-2)'}}>
            <div className="h-full rounded-full transition-all" style={{width:`${xpPct}%`,background:'var(--accent)'}} />
          </div>
        </div>
        <span className="font-mono text-[0.68rem] font-bold px-2 py-0.5 rounded-md" style={{background:'var(--accent-s)',color:'var(--accent)'}}>{count}</span>
      </div>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex flex-col gap-3 overflow-y-auto rounded-2xl p-5"
          style={{width:'clamp(280px,22vw,340px)',maxHeight:'70vh',background:'var(--surface)',border:'1px solid var(--glass-b)',backdropFilter:'blur(30px)'}}>
          <div className="flex justify-between items-start">
            <div>
              <div className="font-bold text-[0.9rem]" style={{color:'var(--tx)'}}>🏆 Tvůj profil</div>
              <div className="text-[0.7rem] mt-0.5" style={{color:'var(--tx2)'}}>Level {level} · {totalXp} XP celkem</div>
            </div>
            <button onClick={() => setOpen(false)} className="bg-transparent border-none cursor-pointer text-xl" style={{color:'var(--tx2)'}}>✕</button>
          </div>

          <div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{background:'var(--surface-2)'}}>
              <div className="h-full rounded-full transition-all" style={{width:`${xpPct}%`,background:'var(--accent)'}} />
            </div>
            <div className="flex justify-between text-[0.62rem] mt-1" style={{color:'var(--tx3)'}}>
              <span>{xpPct} XP</span><span>100 XP do dalšího levelu</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              {val:Object.keys(stats).filter(k=>k!=='buildStartTime'&&stats[k]>0).length,lbl:'Akcí'},
              {val:count,lbl:'Achievements'},
              {val:totalXp,lbl:'XP'},
            ].map(s => (
              <div key={s.lbl} className="rounded-xl p-2 text-center" style={{background:'var(--surface-2)'}}>
                <div className="font-mono font-bold text-base" style={{color:'var(--accent)'}}>{s.val}</div>
                <div className="text-[0.6rem] mt-0.5" style={{color:'var(--tx3)'}}>{s.lbl}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            {achievements.map(a => (
              <div key={a.id}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${unlocked.has(a.id)?'':'opacity-40 grayscale'}`}
                style={{background:unlocked.has(a.id)?'var(--accent-s)':'transparent',borderColor:unlocked.has(a.id)?'var(--accent-b)':'transparent'}}>
                <span className="text-xl flex-shrink-0">{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[0.78rem] font-semibold" style={{color:'var(--tx)'}}>{a.name}</div>
                  <div className="text-[0.65rem] truncate mt-0.5" style={{color:'var(--tx2)'}}>{a.story.substring(0,80)}...</div>
                </div>
                <span className="font-mono text-[0.65rem] font-bold flex-shrink-0" style={{color:'var(--accent)'}}>+{a.xp} XP</span>
              </div>
            ))}
          </div>

          {onReset && (
            <button onClick={onReset}
              className="w-full py-2 rounded-xl text-[0.72rem] cursor-pointer border transition-all"
              style={{background:'rgba(248,113,113,0.1)',borderColor:'rgba(248,113,113,0.25)',color:'#f87171'}}>
              🗑️ Resetovat vše
            </button>
          )}
        </div>
      )}
    </>
  )
}
