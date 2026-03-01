import { useState } from 'react'
import { cats, fmt, shopUrls } from '../data/cats.js'

export default function Sidebar({ sel, selShop, total, count, onRemove, onOpenAll }) {
  const [sestavOpen, setSestavOpen] = useState(true)
  const [kompatOpen, setKompatOpen] = useState(true)

  const cpu  = sel.cpu  ? cats.cpu.items.find(x => x.id === sel.cpu)   : null
  const gpu  = sel.gpu  ? cats.gpu.items.find(x => x.id === sel.gpu)   : null
  const ram  = sel.ram  ? cats.ram.items.find(x => x.id === sel.ram)   : null
  const mb   = sel.mb   ? cats.mb.items.find(x => x.id === sel.mb)     : null
  const psu  = sel.psu  ? cats.psu.items.find(x => x.id === sel.psu)   : null
  const cool = sel.cool ? cats.cool.items.find(x => x.id === sel.cool) : null

  const checks = []
  if (cpu && mb)   checks.push({ label:`Socket: CPU ${cpu.params.socket} ↔ MB ${mb.params.socket}`,  ok: cpu.params.socket === mb.params.socket })
  if (ram && mb)   checks.push({ label:`RAM: ${ram.params.gen} ↔ MB ${mb.params.ddr}`,              ok: ram.params.gen === mb.params.ddr })
  if (cpu && cool) { const r = cool.params.tdp/cpu.params.tdp; checks.push({ label:`Chlazení: ${cool.params.tdp}W vs CPU ${cpu.params.tdp}W`, ok: r>=1, warn: r>=0.8&&r<1 }) }
  if (gpu && psu)  { const req={rx6600:500,rtx4060:550,rtx4070:650,rtx4090:850}[gpu.id]||400; checks.push({ label:`PSU: ${psu.params.wattage}W vs GPU ${req}W`, ok: psu.params.wattage>=req+50, warn: psu.params.wattage>=req&&psu.params.wattage<req+50 }) }

  const Row = ({ label, ok, warn }) => (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[0.74rem] mt-1.5
      ${ok ? 'bg-green-500/10 text-green-400' : warn ? 'bg-yellow-400/10 text-yellow-400' : 'bg-red-400/10 text-red-400'}`}>
      <span>{ok ? '✅' : warn ? '⚠️' : '❌'}</span>
      <span>{label}</span>
    </div>
  )

  return (
    <aside className="flex flex-col gap-3" style={{position:'sticky', top:'calc(64px + 1.5rem)'}}>
      {/* Vaše sestava */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-[clamp(1rem,2vw,1.5rem)] py-[clamp(0.9rem,1.5vw,1.3rem)] border-b cursor-pointer"
          style={{borderColor:'var(--glass-b)'}} onClick={() => setSestavOpen(o => !o)}>
          <span className="text-[0.88rem] font-semibold" style={{color:'var(--tx)'}}>📋 Vaše sestava</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[0.68rem] font-semibold px-2 py-0.5 rounded-full" style={{background:'var(--accent-s)', color:'var(--accent)'}}>{count} / 8</span>
            <span className={`text-[0.65rem] transition-transform ${sestavOpen ? '' : 'rotate-180'}`} style={{color:'var(--tx3)'}}>▲</span>
          </div>
        </div>

        {sestavOpen && (
          <>
            <div className="py-1">
              {Object.entries(cats).map(([k, cat]) => {
                const it    = sel[k] ? cat.items.find(x => x.id === sel[k]) : null
                const shop  = selShop[k]
                const price = shop && it?.shops[shop] ? it.shops[shop] : it?.price
                const url   = shop && it && shopUrls[shop] ? shopUrls[shop](it.name) : null
                return (
                  <div key={k} className="flex items-center gap-2.5 px-[clamp(1rem,2vw,1.5rem)] py-[clamp(0.35rem,0.8vw,0.6rem)] border-b last:border-b-0 transition-colors hover:bg-white/[0.02]"
                    style={{borderColor:'rgba(255,255,255,0.04)'}}>
                    <span className="text-[0.9rem] flex-shrink-0">{cat.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[0.6rem] uppercase tracking-wider" style={{color:'var(--tx3)'}}>{cat.name.split('(')[0].trim()}</div>
                      {it
                        ? <div className="text-[0.78rem] font-medium truncate mt-0.5" style={{color:'var(--tx)'}}>{it.name.split(' ').slice(0,4).join(' ')}</div>
                        : <div className="text-[0.75rem] italic mt-0.5" style={{color:'var(--tx3)'}}>Nevybráno</div>
                      }
                    </div>
                    {it && (
                      <div className="flex items-center gap-1 ml-auto flex-shrink-0">
                        <span className="font-mono text-[0.72rem] font-semibold" style={{color:'var(--accent)'}}>{fmt(price)}</span>
                        {url && <a href={url} target="_blank" rel="noopener noreferrer" className="text-[0.7rem] px-1 py-0.5 rounded transition-colors hover:bg-white/10" style={{color:'var(--accent)'}}>↗</a>}
                        <button onClick={() => onRemove(k)} className="text-[0.7rem] px-1 py-0.5 rounded cursor-pointer hover:text-red-400 transition-colors bg-transparent border-none" style={{color:'var(--tx3)'}}>✕</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="px-[clamp(1rem,2vw,1.5rem)] py-[clamp(1rem,1.5vw,1.3rem)] border-t" style={{borderColor:'var(--glass-b)'}}>
              <div className="text-[0.68rem] uppercase tracking-widest mb-1" style={{color:'var(--tx2)'}}>Celkem od</div>
              <div className="font-mono font-bold mb-1" style={{fontSize:'clamp(1.6rem,2.5vw,2.25rem)', color:'var(--tx)'}}>{total > 0 ? fmt(total) : '0 Kč'}</div>
              <div className="text-[0.68rem] mb-4" style={{color:'var(--tx3)'}}>Nejlepší dostupné ceny · vč. DPH</div>
              <button
                onClick={onOpenAll} disabled={count < 8}
                className="w-full py-3 rounded-2xl text-[0.88rem] font-semibold cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:-translate-y-0.5"
                style={{background:'var(--glass)', border:'1px solid var(--glass-b)', color:'var(--tx)'}}
                onMouseEnter={e => { if(count>=8) { e.target.style.background='var(--accent-s)'; e.target.style.borderColor='var(--accent-b)' } }}
                onMouseLeave={e => { e.target.style.background='var(--glass)'; e.target.style.borderColor='var(--glass-b)' }}
              >⚡ Otevřít vše v eshopu</button>
            </div>
          </>
        )}
      </div>

      {/* Kompatibilita */}
      {checks.length > 0 && (
        <div className="glass rounded-2xl px-[clamp(1rem,2vw,1.5rem)] py-[clamp(1rem,1.5vw,1.3rem)]">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setKompatOpen(o => !o)}>
            <span className="text-[0.7rem] font-bold uppercase tracking-wider" style={{color:'var(--tx2)'}}>🔍 Kontrola kompatibility</span>
            <span className={`text-[0.65rem] transition-transform ${kompatOpen ? '' : 'rotate-180'}`} style={{color:'var(--tx3)'}}>▲</span>
          </div>
          {kompatOpen && checks.map((c,i) => <Row key={i} {...c} />)}
        </div>
      )}
    </aside>
  )
}
