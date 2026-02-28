import { useState } from 'react'
import { cats, fmt, shopUrls, getItem } from '../data/cats.js'
import Sidebar from './Sidebar.jsx'

export default function Configurator({ sel, selShop, total, count, compareList, onPick, onPickShop, onRemove, onToggleCompare, onHistoryOpen, onOpenAll }) {
  const [openCat, setOpenCat] = useState(null)
  const [activeFilters, setActiveFilters] = useState({})
  const [collapsed, setCollapsed] = useState({})

  const toggleCat = (k) => setOpenCat(prev => prev === k ? null : k)
  const toggleCollapse = (id) => setCollapsed(prev => ({ ...prev, [id]: !prev[id] }))

  return (
    <main className="main">
      {/* Konfigurátor vlevo */}
      <div className="config-col">
        <div className="collapse-header" onClick={() => toggleCollapse('config')}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div className="sec-label" style={{ marginBottom:0 }}>
              ⚙️ Konfigurátor <span style={{ fontFamily:'JetBrains Mono,monospace', color:'var(--text-3)', fontWeight:400 }}>{count} / 8</span>
            </div>
            <span className={`collapse-arrow${collapsed.config ? ' closed' : ''}`}>▲</span>
          </div>
        </div>

        {!collapsed.config && (
          <>
            <div className="prog-bar" style={{ margin:'0.75rem 0 1rem' }}>
              <div className="prog-fill" style={{ width: (count / 8 * 100) + '%' }} />
            </div>
            <div className="cats">
              {Object.entries(cats).map(([k, cat]) => {
                const selected = sel[k] ? cat.items.find(x => x.id === sel[k]) : null
                const isOpen = openCat === k
                const filter = activeFilters[k] || 'Vše'
                const filtered = filter === 'Vše' ? cat.items : cat.items.filter(it => it[cat.filterKey] === filter)

                return (
                  <div key={k} className={`cat-section${sel[k] ? ' picked' : ''}${isOpen ? ' open' : ''}`}>
                    <div className="cat-head" onClick={() => toggleCat(k)}>
                      <div className="cat-head-left">
                        <span className="cat-icon">{cat.icon}</span>
                        <div>
                          <div className="cat-name">{cat.name}</div>
                          {selected && <div className="cat-selected-name">{selected.name}</div>}
                        </div>
                      </div>
                      <div className="cat-head-right">
                        {selected && <span className="cat-price">{fmt(selected.price)}</span>}
                        <span className="cat-chevron">{isOpen ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="cat-body">
                        <div className="cat-filters">
                          {cat.filters.map(f => (
                            <button
                              key={f}
                              className={`cat-filter${filter === f ? ' on' : ''}`}
                              onClick={e => { e.stopPropagation(); setActiveFilters(prev => ({ ...prev, [k]: f })) }}
                            >{f}</button>
                          ))}
                        </div>
                        <div className="items">
                          {filtered.map(it => {
                            const isSelected = sel[k] === it.id
                            const isCmp = compareList.some(c => c.id === it.id && c.cat === k)
                            const score = it.rating ? (it.rating / 10).toFixed(1) : null
                            const scoreColor = !score ? 'var(--text-2)' : score >= 8.5 ? '#34d399' : score >= 7 ? '#fbbf24' : '#f87171'
                            const shops = Object.entries(it.shops)

                            return (
                              <div key={it.id} className={`item${isSelected ? ' selected' : ''}`} onClick={() => onPick(k, it.id)}>
                                <div className="item-main">
                                  <div className="item-info">
                                    <div className="item-name-row">
                                      {it.top && <span className="top-badge">TOP</span>}
                                      <span className="item-name">{it.name}</span>
                                      {score && <span className="score-badge" style={{ color:scoreColor, borderColor:scoreColor+'40', background:scoreColor+'12' }}>{score}</span>}
                                    </div>
                                    <div className="item-specs">{it.specs}{shops.length ? ` · ${shops.length} obchodů` : ''}</div>
                                  </div>
                                  <div className="item-price">
                                    <div className="p">{fmt(it.price)}</div>
                                    {shops.length > 0 && <div className="shops">od {Math.min(...Object.values(it.shops)).toLocaleString('cs')} Kč</div>}
                                  </div>
                                  <button className={`cg-btn-cmp${isCmp ? ' on' : ''}`} onClick={e => { e.stopPropagation(); onToggleCompare(k, it.id) }} title="Porovnat">⚖️</button>
                                  <button className="cg-btn-cmp" onClick={e => { e.stopPropagation(); onHistoryOpen() }} title="Historie cen">📈</button>
                                </div>

                                {isSelected && shops.length > 0 && (
                                  <div className="shop-picker">
                                    {shops.map(([shop, price]) => {
                                      const url = shopUrls[shop] ? shopUrls[shop](it.name) : `https://www.google.com/search?q=${encodeURIComponent(it.name + ' ' + shop)}`
                                      return (
                                        <div
                                          key={shop}
                                          className={`shop-pick-row${selShop[k] === shop ? ' active' : ''}`}
                                          onClick={e => { e.stopPropagation(); onPickShop(k, shop) }}
                                        >
                                          <span className="shop-pick-name">{shop}</span>
                                          <span className="shop-pick-price">{price.toLocaleString('cs')} Kč</span>
                                          <a href={url} target="_blank" rel="noopener noreferrer" className="shop-pick-link" onClick={e => e.stopPropagation()}>↗</a>
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
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Sidebar vpravo */}
      <Sidebar
        sel={sel}
        selShop={selShop}
        total={total}
        count={count}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        onRemove={onRemove}
        onOpenAll={onOpenAll}
      />
    </main>
  )
}
