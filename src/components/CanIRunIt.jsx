import { useState } from 'react'
import { games } from '../data/games.js'
import { cats } from '../data/cats.js'

export default function CanIRunIt({ sel }) {
  const [search, setSearch] = useState('')

  const cpu = sel.cpu ? cats.cpu.items.find(x => x.id === sel.cpu) : null
  const gpu = sel.gpu ? cats.gpu.items.find(x => x.id === sel.gpu) : null
  const ram = sel.ram ? cats.ram.items.find(x => x.id === sel.ram) : null

  const myCpuScore = cpu?.params?.score || 0
  const myGpuScore = gpu?.params?.score || 0
  const myRam      = ram?.params?.capacity || 0
  const myVram     = gpu?.params?.vram || 0

  const filtered = search
    ? games.filter(g => g.name.toLowerCase().includes(search.toLowerCase()))
    : games

  function getResult(g) {
    if (!cpu && !gpu) return { cls:'unknown', ico:'❓', txt:'Sestav PC nejdřív', sub:'Vyber CPU a GPU v Konfigurátoru' }
    const ok = (tier) => myCpuScore >= tier.cpuScore && myGpuScore >= tier.gpuScore && myRam >= tier.ram && myVram >= tier.vram
    if (ok(g.ultra)) return { cls:'yes', ico:'🚀', txt:'Ultra nastavení bez problémů!', sub:'Tvoje sestava hru drtí na nejvyšší detaily' }
    if (ok(g.rec))   return { cls:'yes', ico:'✅', txt:'Rozjedeš na doporučených nastaveních', sub:'Plynulý gameplay na High/Ultra v 1080p–1440p' }
    if (ok(g.min))   return { cls:'warn', ico:'⚠️', txt:'Spustíš na minimálních požadavcích', sub:'Nižší detaily, ale hratelné. Uvažuj o upgradu.' }
    return { cls:'no', ico:'❌', txt:'Tvoje sestava nestačí', sub:`CPU ${g.min.cpuScore}+, GPU ${g.min.gpuScore}+, RAM ${g.min.ram}GB+` }
  }

  return (
    <div className="canrun-view">
      <div className="canrun-wrap">
        <div className="canrun-header">
          <div className="sec-label">🎮 Rozjedu to?</div>
          <p style={{ color:'var(--text-2)', fontSize:'0.85rem', marginTop:'0.5rem' }}>
            Porovnáme tvoji sestavu s požadavky her. Nejdřív sestav PC v Konfigurátoru!
          </p>
        </div>
        <div className="canrun-search-bar">
          <span>🔍</span>
          <input
            className="canrun-search"
            placeholder="Hledat hru..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="canrun-games">
          {filtered.map(g => {
            const result = getResult(g)
            return (
              <div key={g.id} className="game-card">
                <div className="game-banner" style={{ background: `linear-gradient(135deg,${g.color}33,${g.color}11)` }}>
                  <span style={{ fontSize:'2.5rem' }}>{g.icon}</span>
                </div>
                <div className="game-body">
                  <div className="game-title">{g.name}</div>
                  <div className="game-genre">{g.genre}</div>
                  <div className="game-reqs">
                    <div className="game-req-col">
                      <div className="game-req-label">⚡ Minimum</div>
                      <div className="game-req-row">CPU <strong>{g.min.cpuScore}+ skóre</strong></div>
                      <div className="game-req-row">GPU <strong>{g.min.gpuScore}+ skóre</strong></div>
                      <div className="game-req-row">RAM <strong>{g.min.ram} GB</strong></div>
                      <div className="game-req-row">VRAM <strong>{g.min.vram} GB</strong></div>
                    </div>
                    <div className="game-req-col">
                      <div className="game-req-label">⭐ Doporučeno</div>
                      <div className="game-req-row">CPU <strong>{g.rec.cpuScore}+ skóre</strong></div>
                      <div className="game-req-row">GPU <strong>{g.rec.gpuScore}+ skóre</strong></div>
                      <div className="game-req-row">RAM <strong>{g.rec.ram} GB</strong></div>
                      <div className="game-req-row">VRAM <strong>{g.rec.vram} GB</strong></div>
                    </div>
                  </div>
                  <div className={`game-result ${result.cls}`}>
                    <span className="game-result-ico">{result.ico}</span>
                    <div className="game-result-txt">
                      {result.txt}
                      <div className="game-result-sub">{result.sub}</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
