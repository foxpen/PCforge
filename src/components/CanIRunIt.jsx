import { useState } from 'react'
import { games } from '../data/games.js'
import { cats } from '../data/cats.js'

export default function CanIRunIt({ sel }) {
  const [search, setSearch] = useState('')

  const cpu = sel.cpu ? cats.cpu.items.find(x => x.id === sel.cpu) : null
  const gpu = sel.gpu ? cats.gpu.items.find(x => x.id === sel.gpu) : null
  const ram = sel.ram ? cats.ram.items.find(x => x.id === sel.ram) : null

  const myCpu  = cpu?.params?.score || 0
  const myGpu  = gpu?.params?.score || 0
  const myRam  = ram?.params?.capacity || 0
  const myVram = gpu?.params?.vram || 0

  const filtered = search ? games.filter(g => g.name.toLowerCase().includes(search.toLowerCase())) : games

  const getResult = (g) => {
    if (!cpu && !gpu) return { cls:'unknown', bg:'rgba(255,255,255,0.04)', brd:'var(--glass-b)', ico:'❓', txt:'Sestav PC nejdřív', sub:'Vyber CPU a GPU v Konfigurátoru' }
    const ok = t => myCpu >= t.cpuScore && myGpu >= t.gpuScore && myRam >= t.ram && myVram >= t.vram
    if (ok(g.ultra)) return { cls:'yes',  bg:'rgba(52,211,153,0.1)',  brd:'rgba(52,211,153,0.25)',  ico:'🚀', txt:'Ultra nastavení bez problémů!', sub:'Tvoje sestava hru drtí na nejvyšší detaily' }
    if (ok(g.rec))   return { cls:'yes',  bg:'rgba(52,211,153,0.1)',  brd:'rgba(52,211,153,0.25)',  ico:'✅', txt:'Rozjedeš na doporučených nastaveních', sub:'Plynulý gameplay na High/Ultra' }
    if (ok(g.min))   return { cls:'warn', bg:'rgba(251,191,36,0.1)',  brd:'rgba(251,191,36,0.25)',  ico:'⚠️', txt:'Spustíš na minimálních požadavcích', sub:'Nižší detaily, ale hratelné.' }
    return              { cls:'no',   bg:'rgba(248,113,113,0.1)', brd:'rgba(248,113,113,0.25)', ico:'❌', txt:'Tvoje sestava nestačí', sub:`CPU ${g.min.cpuScore}+, GPU ${g.min.gpuScore}+, RAM ${g.min.ram}GB+` }
  }

  return (
    <div className="relative z-10 px-[clamp(1.5rem,5vw,6rem)] pb-[clamp(4rem,8vh,8rem)]">
      <div className="text-[0.68rem] font-bold uppercase tracking-widest mb-1" style={{color:'var(--tx2)'}}>🎮 Rozjedu to?</div>
      <p className="text-[0.85rem] mb-5" style={{color:'var(--tx2)'}}>Porovnáme tvoji sestavu s požadavky her. Nejdřív sestav PC v Konfigurátoru!</p>

      <div className="flex items-center gap-2 glass rounded-2xl px-4 py-2.5 mb-6" style={{maxWidth:'clamp(280px,30vw,450px)'}}>
        <span>🔍</span>
        <input className="bg-transparent border-none outline-none text-[0.88rem] flex-1 font-sans" style={{color:'var(--tx)'}}
          placeholder="Hledat hru..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid gap-[clamp(0.85rem,1.5vw,1.75rem)]" style={{gridTemplateColumns:'repeat(auto-fill,minmax(clamp(260px,22vw,320px),1fr))'}}>
        {filtered.map(g => {
          const r = getResult(g)
          return (
            <div key={g.id} className="glass rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 hover:border-[color:var(--accent-b)]" style={{borderColor:'var(--glass-b)'}}>
              <div className="flex items-center justify-center" style={{height:'clamp(70px,8vw,100px)', background:`linear-gradient(135deg,${g.color}33,${g.color}11)`}}>
                <span style={{fontSize:'2.5rem'}}>{g.icon}</span>
              </div>
              <div style={{padding:'clamp(0.75rem,1.5vw,1.1rem)'}}>
                <div className="font-bold mb-0.5" style={{fontSize:'clamp(0.88rem,1.2vw,1rem)', color:'var(--tx)'}}>{g.name}</div>
                <div className="text-[0.7rem] mb-3" style={{color:'var(--tx2)'}}>{g.genre}</div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[['⚡ Minimum', g.min], ['⭐ Doporučeno', g.rec]].map(([label, tier]) => (
                    <div key={label} className="rounded-xl p-2.5" style={{background:'rgba(255,255,255,0.03)'}}>
                      <div className="text-[0.6rem] font-bold uppercase tracking-wider mb-2" style={{color:'var(--tx3)'}}>{label}</div>
                      {[['CPU', tier.cpuScore+' skóre'], ['GPU', tier.gpuScore+' skóre'], ['RAM', tier.ram+' GB'], ['VRAM', tier.vram+' GB']].map(([k,v]) => (
                        <div key={k} className="flex justify-between text-[0.68rem] py-0.5" style={{color:'var(--tx2)'}}>
                          <span>{k}</span><strong>{v}</strong>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mt-2" style={{background:r.bg, border:`1px solid ${r.brd}`}}>
                  <span className="text-xl flex-shrink-0">{r.ico}</span>
                  <div>
                    <div className="text-[0.78rem] font-semibold" style={{color:'var(--tx)'}}>{r.txt}</div>
                    <div className="text-[0.65rem] mt-0.5" style={{color:'var(--tx2)'}}>{r.sub}</div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
