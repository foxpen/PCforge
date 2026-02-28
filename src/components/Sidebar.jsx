import { cats, fmt, shopUrls, getItem } from '../data/cats.js'

export default function Sidebar({ sel, selShop, total, count, collapsed, onToggleCollapse, onRemove, onOpenAll }) {
  const hasAll = count === 8

  // Compatibility checks
  const cpu = sel.cpu ? cats.cpu.items.find(x => x.id === sel.cpu) : null
  const gpu = sel.gpu ? cats.gpu.items.find(x => x.id === sel.gpu) : null
  const ram = sel.ram ? cats.ram.items.find(x => x.id === sel.ram) : null
  const mb  = sel.mb  ? cats.mb.items.find(x => x.id === sel.mb)   : null
  const psu = sel.psu ? cats.psu.items.find(x => x.id === sel.psu) : null
  const cool = sel.cool ? cats.cool.items.find(x => x.id === sel.cool) : null

  const compatChecks = []
  if (cpu && mb) {
    const ok = cpu.params.socket === mb.params.socket
    compatChecks.push({ label:`Socket: CPU ${cpu.params.socket} ↔ MB ${mb.params.socket}`, status: ok ? 'ok' : 'err' })
  }
  if (ram && mb) {
    const ok = ram.params.gen === mb.params.ddr
    compatChecks.push({ label:`RAM: ${ram.params.gen} ↔ MB ${mb.params.ddr}`, status: ok ? 'ok' : 'err' })
  }
  if (cpu && cool) {
    const ratio = cool.params.tdp / cpu.params.tdp
    compatChecks.push({ label:`Chlazení: ${cool.params.tdp}W TDP vs CPU ${cpu.params.tdp}W`, status: ratio >= 1 ? 'ok' : ratio >= 0.8 ? 'warn' : 'err' })
  }
  if (gpu && psu) {
    const reqMap = { rx6600:500, rtx4060:550, rtx4070:650, rtx4090:850 }
    const req = reqMap[gpu.id] || 400
    const has = psu.params.wattage
    compatChecks.push({ label:`PSU: ${has}W zdroj vs GPU požadavek ${req}W`, status: has >= req + 50 ? 'ok' : has >= req ? 'warn' : 'err' })
  }

  return (
    <aside className="sidebar">
      {/* Vaše sestava */}
      <div className="sum-card">
        <div className="collapse-header" onClick={() => onToggleCollapse('sestava')}>
          <div className="sum-top" style={{ marginBottom: 0 }}>
            <span className="sum-ttl">📋 Vaše sestava</span>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <span className="sum-cnt">{count} / 8</span>
              <span className={`collapse-arrow${collapsed.sestava ? ' closed' : ''}`}>▲</span>
            </div>
          </div>
        </div>

        {!collapsed.sestava && (
          <>
            <div className="sum-rows">
              {Object.entries(cats).map(([k, cat]) => {
                const it = sel[k] ? cat.items.find(x => x.id === sel[k]) : null
                const shop = selShop[k]
                const price = shop && it?.shops[shop] ? it.shops[shop] : it?.price
                const url = shop && it && shopUrls[shop] ? shopUrls[shop](it.name) : null

                return (
                  <div key={k} className={`sum-row${it ? ' filled' : ''}`}>
                    <span className="sum-ico">{cat.icon}</span>
                    <div className="sum-info">
                      <div className="sum-cat">{cat.name.split(' ')[0]}</div>
                      {it
                        ? <div className="sum-name">{it.name.split(' ').slice(0, 4).join(' ')}</div>
                        : <div className="sum-empty">Nevybráno</div>
                      }
                    </div>
                    {it && (
                      <div style={{ display:'flex', alignItems:'center', gap:'0.35rem' }}>
                        <span className="sum-price">{fmt(price)}</span>
                        {url && <a href={url} target="_blank" rel="noopener noreferrer" className="shop-pick-link" style={{ fontSize:'0.7rem' }}>↗</a>}
                        <button onClick={() => onRemove(k)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', fontSize:'0.7rem', padding:'0.1rem 0.3rem' }}>✕</button>
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
              <button className="btn-openall-side" disabled={!hasAll} onClick={onOpenAll} style={{ marginTop:'1rem' }}>
                ⚡ Otevřít vše v eshopu
              </button>
            </div>
          </>
        )}
      </div>

      {/* Kompatibilita */}
      {compatChecks.length > 0 && (
        <div className="compat-wrap">
          <div className="collapse-header" onClick={() => onToggleCollapse('kompat')}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div className="compat-title" style={{ marginBottom:0 }}>🔍 Kontrola kompatibility</div>
              <span className={`collapse-arrow${collapsed.kompat ? ' closed' : ''}`}>▲</span>
            </div>
          </div>
          {!collapsed.kompat && (
            <div style={{ marginTop:'0.75rem', display:'flex', flexDirection:'column', gap:'0.4rem' }}>
              {compatChecks.map((c, i) => (
                <div key={i} className={`compat-item compat-${c.status}`}>
                  <span>{c.status === 'ok' ? '✅' : c.status === 'warn' ? '⚠️' : '❌'}</span>
                  <span style={{ fontSize:'0.75rem' }}>{c.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
