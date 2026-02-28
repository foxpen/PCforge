import { useState } from 'react'
import { achievements } from '../data/achievements.js'

export default function AchievementHud({ level, xpPct, count, unlocked, totalXp, stats }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="ach-hud" onClick={() => setOpen(o => !o)}>
        <span className="ach-hud-icon">🏆</span>
        <div className="ach-hud-info">
          <div className="ach-hud-level">Level {level}</div>
          <div className="ach-hud-xp-bar">
            <div className="ach-hud-xp-fill" style={{ width: xpPct + '%' }} />
          </div>
        </div>
        <span className="ach-hud-cnt">{count}</span>
      </div>

      {open && (
        <div className="ach-panel">
          <div className="ach-panel-head">
            <div>
              <div className="ach-panel-title">🏆 Tvůj profil</div>
              <div className="ach-panel-sub">Level {level} · {totalXp} XP celkem</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'1.2rem', color:'var(--text-2)' }}>✕</button>
          </div>

          <div className="ach-level-bar-wrap">
            <div className="ach-level-bar">
              <div className="ach-level-fill" style={{ width: xpPct + '%' }} />
            </div>
            <div className="ach-level-labels">
              <span>{xpPct} XP</span>
              <span>100 XP do dalšího levelu</span>
            </div>
          </div>

          <div className="ach-stats-row">
            {[
              { val: Object.keys(stats).filter(k => k !== 'buildStartTime' && stats[k] > 0).length, lbl: 'Akcí' },
              { val: count, lbl: 'Achievementů' },
              { val: totalXp, lbl: 'XP' },
            ].map(s => (
              <div key={s.lbl} className="ach-stat">
                <div className="ach-stat-val">{s.val}</div>
                <div className="ach-stat-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>

          <div className="ach-list">
            {achievements.map(a => (
              <div key={a.id} className={`ach-item ${unlocked.has(a.id) ? 'done' : 'locked'}`}>
                <span className="ach-item-icon">{a.icon}</span>
                <div className="ach-item-info">
                  <div className="ach-item-name">{a.name}</div>
                  <div className="ach-item-desc">{a.story.substring(0, 80)}...</div>
                </div>
                <span className="ach-item-xp">+{a.xp} XP</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
