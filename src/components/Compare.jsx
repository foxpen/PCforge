import { cats, fmt } from '../data/cats.js'

export default function Compare({ compareList, onRemove }) {
  if (!compareList.length) {
    return (
      <div className="compare-view">
        <div className="compare-inner">
          <div className="compare-empty">
            <div style={{ fontSize:'2rem', marginBottom:'1rem' }}>⚖️</div>
            <div style={{ fontSize:'1rem', fontWeight:600, marginBottom:'0.5rem' }}>Zatím nic k porovnání</div>
            <div style={{ fontSize:'0.82rem', color:'var(--text-2)' }}>V konfigurátoru klikni na ⚖️ u libovolné komponenty</div>
          </div>
        </div>
      </div>
    )
  }

  const items = compareList.map(c => {
    const cat = cats[c.cat]
    const it = cat?.items.find(x => x.id === c.id)
    return it ? { ...it, _cat: c.cat, _catName: cat.name, _catIcon: cat.icon } : null
  }).filter(Boolean)

  return (
    <div className="compare-view">
      <div className="compare-inner">
        <div className="sec-label" style={{ marginBottom:'1.25rem' }}>⚖️ Porovnání komponent</div>
        <div style={{ display:'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap:'1rem' }}>
          {items.map(it => {
            const score = it.rating ? (it.rating / 10).toFixed(1) : null
            const scoreColor = !score ? 'var(--text-2)' : score >= 8.5 ? '#34d399' : score >= 7 ? '#fbbf24' : '#f87171'
            return (
              <div key={it.id} className="compare-card">
                <button className="compare-rm" onClick={() => onRemove(it._cat, it.id)}>✕</button>
                <div style={{ fontSize:'0.65rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.25rem' }}>
                  {it._catIcon} {it._catName}
                </div>
                <div className="compare-card-name">{it.name}</div>
                <div className="compare-card-specs">{it.specs}</div>
                {score && <div style={{ fontSize:'0.78rem', fontWeight:700, color:scoreColor, marginBottom:'0.5rem' }}>{score}/10</div>}
                <div className="compare-card-price">{fmt(it.price)}</div>
                <div className="compare-card-shops">
                  {Object.entries(it.shops).map(([shop, price]) => (
                    <div key={shop} className="compare-shop-row">
                      <span>{shop}</span>
                      <span style={{ fontFamily:'JetBrains Mono,monospace', fontWeight:600 }}>{price.toLocaleString('cs')} Kč</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
