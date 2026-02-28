import { useState } from 'react'
import { cats, fmt, shopUrls, getItem } from '../data/cats.js'

export default function Sidebar({ sel, selShop, total, count, onRemove, onOpenAll }) {
  const [sestavOpen, setSestavOpen]   = useState(true)
  const [kompatOpen, setKompatOpen]   = useState(true)

  // Kompatibilita
  const cpu  = sel.cpu  ? cats.cpu.items.find(x => x.id === sel.cpu)   : null
  const gpu  = sel.gpu  ? cats.gpu.items.find(x => x.id === sel.gpu)   : null
  const ram  = sel.ram  ? cats.ram.items.find(x => x.id === sel.ram)   : null
  const mb   = sel.mb   ? cats.mb.items.find(x => x.id === sel.mb)     : null
  const psu  = sel.psu  ? cats.psu.items.find(x => x.id === sel.psu)   : null
  const cool = sel.cool ? cats.cool.items.find(x => x.id === sel.cool) : null

  const checks = []
  if (cpu && mb) {
    const ok = cpu.params.socket === mb.params.socket
    checks.push({ label: `Socket: CPU ${cpu.params.socket} ↔ MB ${mb.params.socket}`, ok, warn: false })
  }
  if (ram && mb) {
    const ok = ram.params.gen === mb.params.ddr
    checks.push({ label: `RAM: ${ram.params.gen} ↔ MB ${mb.params.ddr}`, ok, warn: false })
  }
  if (cpu && cool) {
    const ratio = cool.params.tdp / cpu.params.tdp
    checks.push({ label: `Chlazení: ${cool.params.tdp}W TDP vs CPU ${cpu.params.tdp}W`, ok: ratio >= 1, warn: ratio >= 0.8 && ratio < 1 })
  }
  if (gpu && psu) {
    const req = { rx6600:500, rtx4060:550, rtx4070:650, rtx4090:850 }[gpu.id] || 400
    const has = psu.params.wattage
    checks.push({ label: `PSU: ${has}W vs GPU požadavek ${req}W`, ok: has >= req + 50, warn: has >= req && has < req + 50 })
  }

  return (
    <aside className="sidebar">
      {/* VAŠE SESTAVA */}
      <div className="sum-card">
        <div className="sum-top collapse-header" style={{ cursor:'pointer' }} onClick={() => setSestavOpen(o => !o)}>
          <span className="sum-ttl">📋 Vaše sestava</span>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <span className="sum-cnt">{count} / 8</span>
            <span className={`collapse-arrow${!sestavOpen ? ' closed' : ''}`}>▲</span>
          </div>
        </div>

        {sestavOpen && (
          <>
            <div className="sum-rows">
              {Object.entries(cats).map(([k, cat]) => {
                const it    = sel[k] ? cat.items.find(x => x.id === sel[k]) : null
                const shop  = selShop[k]
                const price = shop && it?.shops[shop] ? it.shops[shop] : it?.price
                const url   = shop && it && shopUrls[shop] ? shopUrls[shop](it.name) : null

                return (
                  <div key={k} className={`sum-row${it ? ' filled' : ''}`}>
                    <span className="sum-ico">{cat.icon}</span>
                    <div className="sum-info">
                      <div className="sum-cat">{cat.name.split('(')[0].trim()}</div>
                      {it
                        ? <div className="sum-name">{it.name.split(' ').slice(0,4).join(' ')}</div>
                        : <div className="sum-empty">Nevybráno</div>
                      }
                    </div>
                    {it && (
                      <div style={{ display:'flex', alignItems:'center', gap:'0.35rem', marginLeft:'auto' }}>
                        <span className="sum-price">{fmt(price)}</span>
                        {url && (
                          <a href={url} target="_blank" rel="noopener noreferrer" className="sum-shop-link">↗</a>
                        )}
                        <button
                          onClick={() => onRemove(k)}
                          style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', fontSize:'0.75rem', padding:'0.1rem 0.25rem', borderRadius:'4px' }}
                          title="Odebrat"
                        >✕</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="sum-bot">
              <div className="tot-lbl">Celkem od</div>
              <div className="tot-amt">{total > 0 ? fmt(total) : '0 Kč'}</div>
              <div className="tot-sub">Nejlepší dostupné ceny · vč. DPH</div>
              <button
                className="btn-openall-side"
                disabled={count < 8}
                onClick={onOpenAll}
                style={{ marginTop:'1rem' }}
              >
                ⚡ Otevřít vše v eshopu
              </button>
            </div>
          </>
        )}
      </div>

      {/* KOMPATIBILITA */}
      {checks.length > 0 && (
        <div className="compat-wrap">
          <div
            className="compat-title collapse-header"
            style={{ cursor:'pointer', marginBottom: kompatOpen ? '0.75rem' : 0 }}
            onClick={() => setKompatOpen(o => !o)}
          >
            <span>🔍 Kontrola kompatibility</span>
            <span className={`collapse-arrow${!kompatOpen ? ' closed' : ''}`}>▲</span>
          </div>
          {kompatOpen && (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
              {checks.map((c, i) => {
                const cls = c.ok ? 'compat-ok' : c.warn ? 'compat-warn' : 'compat-err'
                const ico = c.ok ? '✅' : c.warn ? '⚠️' : '❌'
                return (
                  <div key={i} className={`compat-item ${cls}`}>
                    <span>{ico}</span>
                    <span>{c.label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
