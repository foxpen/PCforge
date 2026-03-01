import { useState } from 'react'
import { cats, fmt } from '../data/cats.js'

export default function Saved({ savedBuilds, favorites, onLoadBuild, onDeleteBuild, onClearFavorite }) {
  const [tab, setTab] = useState('builds') // 'builds' | 'favorites'
  const [renamingId, setRenamingId] = useState(null)
  const [renameVal, setRenameVal]   = useState('')

  return (
    <div className="relative z-10 px-[clamp(1.5rem,5vw,6rem)] pb-[clamp(4rem,8vh,8rem)]">

      {/* Sub-tabs */}
      <div className="flex gap-1.5 mb-6">
        {[['builds','💾 Uložené sestavy', savedBuilds.length], ['favorites','❤️ Oblíbené', favorites.length]].map(([id, label, cnt]) => (
          <button key={id} onClick={() => setTab(id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[0.82rem] font-medium cursor-pointer border transition-all"
            style={{background: tab===id ? 'var(--accent-s)' : 'transparent', borderColor: tab===id ? 'var(--accent-b)' : 'var(--glass-b)', color: tab===id ? 'var(--accent)' : 'var(--tx2)'}}>
            {label}
            {cnt > 0 && <span className="font-mono text-[0.65rem] font-bold px-1.5 py-0.5 rounded-md" style={{background:'var(--accent-s)', color:'var(--accent)'}}>{cnt}</span>}
          </button>
        ))}
      </div>

      {/* BUILDS */}
      {tab === 'builds' && (
        savedBuilds.length === 0
          ? <Empty icon="💾" text="Zatím žádné uložené sestavy" sub="V konfigurátoru klikni na Uložit sestavu" />
          : <div className="grid gap-4" style={{gridTemplateColumns:'repeat(auto-fill, minmax(clamp(280px,30vw,380px), 1fr))'}}>
              {savedBuilds.map(b => <BuildCard key={b.id} build={b}
                renamingId={renamingId} renameVal={renameVal}
                setRenamingId={setRenamingId} setRenameVal={setRenameVal}
                onLoad={onLoadBuild} onDelete={onDeleteBuild} />)}
            </div>
      )}

      {/* FAVORITES */}
      {tab === 'favorites' && (
        favorites.length === 0
          ? <Empty icon="❤️" text="Zatím žádné oblíbené produkty" sub="Klikni na ❤️ u libovolné komponenty v konfigurátoru" />
          : <div className="grid gap-3" style={{gridTemplateColumns:'repeat(auto-fill, minmax(clamp(260px,28vw,360px), 1fr))'}}>
              {favorites.map(f => {
                const cat  = cats[f.catKey]
                const item = cat?.items.find(x => x.id === f.id)
                if (!item) return null
                return (
                  <div key={f.id+f.catKey} className="glass rounded-2xl flex items-center gap-3 px-4 py-3 transition-all hover:border-[color:var(--accent-b)]" style={{borderColor:'var(--glass-b)'}}>
                    <span className="text-xl flex-shrink-0">{cat.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[0.62rem] uppercase tracking-wider mb-0.5" style={{color:'var(--tx3)'}}>{cat.name}</div>
                      <div className="font-semibold text-[0.85rem] truncate" style={{color:'var(--tx)'}}>{item.name}</div>
                      <div className="font-mono text-[0.72rem] mt-0.5" style={{color:'var(--accent)'}}>{fmt(item.price)}</div>
                    </div>
                    <button onClick={() => onClearFavorite(f.catKey, f.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-sm border-none cursor-pointer transition-all flex-shrink-0"
                      style={{background:'var(--surface-2)', color:'#f87171'}}>✕</button>
                  </div>
                )
              })}
            </div>
      )}
    </div>
  )
}

function BuildCard({ build, renamingId, renameVal, setRenamingId, setRenameVal, onLoad, onDelete }) {
  const date = new Date(build.savedAt).toLocaleDateString('cs', { day:'numeric', month:'short', year:'numeric' })
  const compCount = Object.keys(build.sel).length

  return (
    <div className="glass rounded-2xl overflow-hidden transition-all hover:border-[color:var(--accent-b)]" style={{borderColor:'var(--glass-b)'}}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{borderColor:'var(--glass-b)'}}>
        {renamingId === build.id
          ? <input autoFocus value={renameVal}
              onChange={e => setRenameVal(e.target.value)}
              onBlur={() => { onLoad(build.id, renameVal, true); setRenamingId(null) }}
              onKeyDown={e => { if(e.key==='Enter') { onLoad(build.id, renameVal, true); setRenamingId(null) } if(e.key==='Escape') setRenamingId(null) }}
              className="bg-transparent border-b outline-none font-semibold text-[0.88rem] flex-1 mr-2"
              style={{borderColor:'var(--accent)', color:'var(--tx)'}} />
          : <div className="font-semibold text-[0.88rem] flex-1 cursor-pointer hover:underline"
              style={{color:'var(--tx)'}}
              onClick={() => { setRenamingId(build.id); setRenameVal(build.name) }}>
              {build.name} ✏️
            </div>
        }
        <button onClick={() => onDelete(build.id)}
          className="w-6 h-6 rounded-full flex items-center justify-center text-[0.7rem] border-none cursor-pointer flex-shrink-0"
          style={{background:'var(--close-btn)', color:'var(--close-tx)'}}>✕</button>
      </div>

      {/* Components list */}
      <div className="px-4 py-2">
        {Object.entries(build.sel).map(([k, id]) => {
          const cat  = cats[k]
          const item = cat?.items.find(x => x.id === id)
          if (!item) return null
          return (
            <div key={k} className="flex items-center gap-2 py-1.5 border-b last:border-b-0" style={{borderColor:'var(--border-subtle)'}}>
              <span className="text-sm flex-shrink-0">{cat.icon}</span>
              <span className="flex-1 text-[0.75rem] truncate" style={{color:'var(--tx2)'}}>{item.name.split(' ').slice(0,4).join(' ')}</span>
              <span className="font-mono text-[0.72rem] font-semibold flex-shrink-0" style={{color:'var(--accent)'}}>{fmt(item.price)}</span>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t" style={{borderColor:'var(--glass-b)'}}>
        <div>
          <div className="font-mono font-bold text-[1rem]" style={{color:'var(--accent)'}}>{fmt(build.total)}</div>
          <div className="text-[0.62rem] mt-0.5" style={{color:'var(--tx3)'}}>{compCount}/8 komponent · {date}</div>
        </div>
        <button onClick={() => onLoad(build.id)}
          className="px-4 py-2 rounded-xl text-[0.78rem] font-semibold cursor-pointer border-none transition-all hover:opacity-90"
          style={{background:'var(--accent)', color:'#fff'}}>
          Načíst →
        </button>
      </div>
    </div>
  )
}

function Empty({ icon, text, sub }) {
  return (
    <div className="text-center py-24">
      <div className="text-4xl mb-4">{icon}</div>
      <div className="font-semibold text-base mb-2" style={{color:'var(--tx)'}}>{text}</div>
      <div className="text-[0.82rem]" style={{color:'var(--tx2)'}}>{sub}</div>
    </div>
  )
}
