import { useState } from 'react'
import { cats, fmt, shopUrls } from '../data/cats.js'

export default function Sidebar({ sel, selShop, total, count, onRemove, onOpenAll, onSaveBuild, favorites, onToggleFavorite }) {
  const [sestavOpen, setSestavOpen] = useState(true)
  const [kompatOpen, setKompatOpen] = useState(true)
  const [saveName,   setSaveName]   = useState('')
  const [saveOpen,   setSaveOpen]   = useState(false)

  const cpu  = sel.cpu  ? cats.cpu.items.find(x => x.id === sel.cpu)   : null
  const gpu  = sel.gpu  ? cats.gpu.items.find(x => x.id === sel.gpu)   : null
  const ram  = sel.ram  ? cats.ram.items.find(x => x.id === sel.ram)   : null
  const mb   = sel.mb   ? cats.mb.items.find(x => x.id === sel.mb)     : null
  const psu  = sel.psu  ? cats.psu.items.find(x => x.id === sel.psu)   : null
  const cool = sel.cool ? cats.cool.items.find(x => x.id === sel.cool) : null

  const checks = []
  if (cpu && mb)   checks.push({ label:`Socket: CPU ${cpu.params.socket} ↔ MB ${mb.params.socket}`,  ok: cpu.params.socket === mb.params.socket })
  if (ram && mb)   checks.push({ label:`RAM: ${ram.params.gen} ↔ MB ${mb.params.ddr}`,               ok: ram.params.gen === mb.params.ddr })
  if (cpu && cool) { const r = cool.params.tdp/cpu.params.tdp; checks.push({ label:`Chlazení: ${cool.params.tdp}W vs CPU ${cpu.params.tdp}W`, ok: r>=1, warn: r>=0.8&&r<1 }) }
  if (gpu && psu)  { const req={rx6600:500,rtx4060:550,rtx4070:650,rtx4090:850}[gpu.id]||400; checks.push({ label:`PSU: ${psu.params.wattage}W vs GPU ${req}W`, ok: psu.params.wattage>=req+50, warn: psu.params.wattage>=req&&psu.params.wattage<req+50 }) }

  const handleSave = () => {
    if (!saveName.trim()) return
    onSaveBuild(saveName.trim())
    setSaveName('')
    setSaveOpen(false)
  }

  return (
    <aside className="flex flex-col gap-3" style={{position:'sticky', top:'calc(64px + 1.5rem)'}}>

      {/* Sestava — zvýrazněný panel */}
      <div className="sidebar-panel rounded-2xl overflow-hidden">

        {/* Hlavička */}
        <div className="flex items-center justify-between px-[clamp(1rem,2vw,1.5rem)] py-[clamp(0.9rem,1.5vw,1.3rem)] border-b cursor-pointer"
          style={{borderColor:'var(--accent2-b)'}} onClick={() => setSestavOpen(o => !o)}>
          <span className="text-[0.88rem] font-semibold flex items-center gap-2" style={{color:'var(--accent2)'}}>
            🛠 Vaše sestava
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[0.68rem] font-semibold px-2.5 py-1 rounded-full"
              style={{background:'var(--accent2-s)', color:'var(--accent2)', border:'1px solid var(--accent2-b)'}}>
              {count} / 8
            </span>
            <span className={`text-[0.65rem] transition-transform ${sestavOpen ? '' : 'rotate-180'}`} style={{color:'var(--tx3)'}}>▲</span>
          </div>
        </div>

        {sestavOpen && (
          <>
            {/* Seznam komponent */}
            <div className="py-1.5 px-[clamp(0.6rem,1.2vw,1rem)]">
              {Object.entries(cats).map(([k, cat]) => {
                const it    = sel[k] ? cat.items.find(x => x.id === sel[k]) : null
                const shop  = selShop[k]
                const price = shop && it?.shops[shop] ? it.shops[shop] : it?.price
                const url   = shop && it && shopUrls[shop] ? shopUrls[shop](it.name) : null
                const isFav = favorites?.some(f => f.catKey === k && f.id === sel[k])
                return (
                  <div key={k} className={`flex items-center gap-2.5 px-[clamp(0.6rem,1vw,0.85rem)] py-[clamp(0.45rem,0.9vw,0.65rem)] rounded-lg mb-1 transition-colors ${it ? 'sidebar-item' : ''}`}
                    style={!it ? {borderLeft:'2px solid var(--border-subtle)', background:'var(--panel)'} : undefined}>
                    <span className="text-[0.9rem] flex-shrink-0">{cat.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[0.58rem] uppercase tracking-wider font-semibold" style={{color: it ? 'var(--accent2)' : 'var(--tx3)', opacity: it ? 0.6 : 1}}>{cat.name.split('(')[0].trim()}</div>
                      {it
                        ? <div className="text-[0.78rem] font-medium truncate mt-0.5" style={{color:'var(--tx)'}}>{it.name.split(' ').slice(0,4).join(' ')}</div>
                        : <div className="text-[0.75rem] italic mt-0.5" style={{color:'var(--tx3)'}}>Nevybráno</div>
                      }
                    </div>
                    {it && (
                      <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
                        <span className="font-mono text-[0.74rem] font-semibold price-accent2">{fmt(price)}</span>
                        {url && <a href={url} target="_blank" rel="noopener noreferrer" className="text-[0.7rem] px-1 py-0.5 rounded transition-colors" style={{color:'var(--accent2)'}}>↗</a>}
                        <button onClick={() => onToggleFavorite(k, sel[k])}
                          className="text-[0.8rem] px-0.5 border-none bg-transparent cursor-pointer transition-all"
                          title={isFav ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'}>
                          {isFav ? '❤️' : '🤍'}
                        </button>
                        <button onClick={() => onRemove(k)} className="text-[0.7rem] px-1 py-0.5 rounded cursor-pointer hover:text-red-400 transition-colors bg-transparent border-none" style={{color:'var(--tx3)'}}>✕</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Celková cena + CTA */}
            <div className="px-[clamp(1rem,2vw,1.5rem)] py-[clamp(1rem,1.5vw,1.3rem)] border-t flex flex-col gap-3" style={{borderColor:'var(--accent2-b)'}}>
              <div>
                <div className="text-[0.68rem] uppercase tracking-widest mb-1 font-semibold" style={{color:'var(--accent2)', opacity:0.6}}>Celkem od</div>
                <div className="font-mono font-bold mb-0.5 total-price" style={{fontSize:'clamp(1.8rem,2.8vw,2.5rem)'}}>
                  {total > 0 ? fmt(total) : '0 Kč'}
                </div>
                <div className="text-[0.68rem]" style={{color:'var(--tx3)'}}>Nejlepší dostupné ceny · vč. DPH</div>
              </div>

              {/* Uložit sestavu */}
              {count > 0 && (
                saveOpen ? (
                  <div className="flex gap-2">
                    <input autoFocus value={saveName} onChange={e => setSaveName(e.target.value)}
                      onKeyDown={e => { if(e.key==='Enter') handleSave(); if(e.key==='Escape') setSaveOpen(false) }}
                      placeholder="Název sestavy..."
                      className="flex-1 px-3 py-2 rounded-xl text-[0.8rem] border outline-none font-sans"
                      style={{background:'var(--surface-2)', borderColor:'var(--accent2-b)', color:'var(--tx)'}} />
                    <button onClick={handleSave}
                      className="px-3 py-2 rounded-xl text-[0.8rem] font-semibold cursor-pointer border-none"
                      style={{background:'var(--accent2)', color:'#0f0a1a'}}>✓</button>
                    <button onClick={() => setSaveOpen(false)}
                      className="px-3 py-2 rounded-xl text-[0.8rem] cursor-pointer border-none"
                      style={{background:'var(--surface-2)', color:'var(--tx2)'}}>✕</button>
                  </div>
                ) : (
                  <button onClick={() => setSaveOpen(true)}
                    className="w-full py-2.5 rounded-xl text-[0.82rem] font-semibold cursor-pointer transition-all hover:-translate-y-0.5 sidebar-cta">
                    💾 Uložit sestavu
                  </button>
                )
              )}

              <button onClick={onOpenAll} disabled={count < 8}
                className="w-full py-2.5 rounded-xl text-[0.82rem] font-semibold cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed sidebar-btn-secondary">
                ⚡ Otevřít vše v e-shopu
              </button>
            </div>
          </>
        )}
      </div>

      {/* Kompatibilita */}
      {checks.length > 0 && (
        <div className="glass rounded-2xl px-[clamp(1rem,2vw,1.5rem)] py-[clamp(1rem,1.5vw,1.3rem)]">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setKompatOpen(o => !o)}>
            <span className="text-[0.7rem] font-bold uppercase tracking-wider" style={{color:'var(--tx2)'}}>🔍 Kompatibilita</span>
            <span className={`text-[0.65rem] transition-transform ${kompatOpen ? '' : 'rotate-180'}`} style={{color:'var(--tx3)'}}>▲</span>
          </div>
          {kompatOpen && checks.map((c,i) => (
            <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[0.74rem] mt-1.5 ${c.ok ? 'bg-green-500/10 text-green-400' : c.warn ? 'bg-yellow-400/10 text-yellow-400' : 'bg-red-400/10 text-red-400'}`}>
              <span>{c.ok ? '✅' : c.warn ? '⚠️' : '❌'}</span><span>{c.label}</span>
            </div>
          ))}
        </div>
      )}
    </aside>
  )
}
