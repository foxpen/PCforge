import { useState } from 'react'
import { cats, fmt, shopUrls } from '../data/cats.js'
import Sidebar from './Sidebar.jsx'

export default function Configurator({ sel, selShop, total, count, compareList, onPick, onPickShop, onRemove, onClear, onToggleCompare, onHistoryOpen, onOpenAll }) {
  const [openCat, setOpenCat]         = useState(null)
  const [activeFilters, setActiveFilters] = useState({})
  const [configOpen, setConfigOpen]   = useState(true)

  return (
    <main className="main">
      {/* KONFIGURÁTOR vlevo */}
      <div className="config-col">
        <div className="collapse-header" onClick={() => setConfigOpen(o => !o)}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div className="sec-label" style={{ marginBottom:0 }}>
              ⚙️ Konfigurátor{' '}
              <span style={{ fontFamily:'JetBrains Mono,monospace', color:'var(--text-3)', fontWeight:400 }}>
                {count} / 8
              </span>
            </div>
            <span className={`collapse-arrow${!configOpen ? ' closed' : ''}`}>▲</span>
          </div>
        </div>

        {configOpen && (
          <>
            <div className="prog-bar" style={{ margin:'0.75rem 0 1.25rem' }}>
              <div className="prog-fill" style={{ width: (count / 8 * 100) + '%' }} />
            </div>

            <div className="cats">
              {Object.entries(cats).map(([k, cat]) => {
                const selected = sel[k] ? cat.items.find(x => x.id === sel[k]) : null
                const isOpen   = openCat === k
                const filter   = activeFilters[k] || 'Vše'
                const filtered = filter === 'Vše' ? cat.items : cat.items.filter(it => it[cat.filterKey] === filter)

                return (
                  <div key={k} className={`cat-card${selected ? ' done' : ''}${isOpen ? ' open' : ''}`}>
                    {/* Hlavička kategorie */}
                    <div className="cat-head" onClick={() => setOpenCat(isOpen ? null : k)}>
                      <div className="cat-ico">{cat.icon}</div>
                      <div className="cat-txt">
                        <div className="cat-n">{cat.name}</div>
                        {selected
                          ? <div className="cat-s">{selected.name}</div>
                          : <div className="cat-s" style={{ color:'var(--text-3)' }}>Nevybráno</div>
                        }
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                        {selected && (
                          <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.82rem', fontWeight:600, color:'var(--accent)' }}>
                            {fmt(selected.price)}
                          </span>
                        )}
                        <span className="cat-chev">▼</span>
                      </div>
                    </div>

                    {/* Filtry */}
                    {isOpen && (
                      <div className="cat-filters">
                        {cat.filters.map(f => (
                          <button
                            key={f}
                            className={`cat-filter-btn${filter === f ? ' on' : ''}`}
                            onClick={e => { e.stopPropagation(); setActiveFilters(prev => ({ ...prev, [k]: f })) }}
                          >{f}</button>
                        ))}
                      </div>
                    )}

                    {/* Produkty */}
                    <div className="items">
                      {filtered.map(it => {
                        const isSelected = sel[k] === it.id
                        const isCmp      = compareList.some(c => c.id === it.id && c.cat === k)
                        const score      = it.rating ? (it.rating / 10).toFixed(1) : null
                        const scoreColor = !score ? '' : score >= 8.5 ? '#34d399' : score >= 7 ? '#fbbf24' : '#f87171'

                        return (
                          <div key={it.id} className={`item${isSelected ? ' on' : ''}`} onClick={() => onPick(k, it.id)}>
                            <div className={`item-chk`}>{isSelected ? '✓' : ''}</div>
                            <div className="item-info">
                              <div className="item-name">
                                {it.top && <span className="top-badge">TOP</span>}
                                {it.name}
                                {score && (
                                  <span style={{
                                    marginLeft:'0.4rem', fontSize:'0.6rem', fontWeight:700,
                                    color:scoreColor, fontFamily:'JetBrains Mono,monospace'
                                  }}>{score}</span>
                                )}
                              </div>
                              <div className="item-specs">{it.specs}</div>
                            </div>
                            <div className="item-price">
                              <div className="p">{fmt(it.price)}</div>
                              {Object.keys(it.shops).length > 0 && (
                                <div className="shops">
                                  od {Math.min(...Object.values(it.shops)).toLocaleString('cs')} Kč
                                </div>
                              )}
                            </div>
                            <div style={{ display:'flex', gap:'0.25rem' }} onClick={e => e.stopPropagation()}>
                              <button
                                className={`cg-btn-cmp${isCmp ? ' on' : ''}`}
                                onClick={() => onToggleCompare(k, it.id)}
                                title="Porovnat"
                              >⚖️</button>
                              <button
                                className="cg-btn-cmp"
                                onClick={onHistoryOpen}
                                title="Historie cen"
                              >📈</button>
                            </div>

                            {/* Shop picker — zobrazí se po výběru */}
                            {isSelected && Object.keys(it.shops).length > 0 && (
                              <div className="shop-picker" onClick={e => e.stopPropagation()}>
                                {Object.entries(it.shops).map(([shop, price]) => {
                                  const url = shopUrls[shop]
                                    ? shopUrls[shop](it.name)
                                    : `https://www.google.com/search?q=${encodeURIComponent(it.name + ' ' + shop)}`
                                  const isActive = selShop[k] === shop
                                  return (
                                    <div
                                      key={shop}
                                      className={`shop-pick-row${isActive ? ' shop-pick-on' : ''}`}
                                      onClick={() => onPickShop(k, shop)}
                                    >
                                      <div className="shop-pick-chk">{isActive ? '✓' : ''}</div>
                                      <span className="shop-pick-name">{shop}</span>
                                      <span className="shop-pick-price">{price.toLocaleString('cs')} Kč</span>
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="shop-pick-link"
                                        onClick={e => e.stopPropagation()}
                                      >↗</a>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* SIDEBAR vpravo */}
      <Sidebar
        sel={sel}
        selShop={selShop}
        total={total}
        count={count}
        onRemove={onRemove}
        onOpenAll={onOpenAll}
      />
    </main>
  )
}
