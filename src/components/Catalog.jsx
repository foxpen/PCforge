import { useState, useMemo } from 'react'
import { cats, fmt, shopUrls } from '../data/cats.js'

function getAllItems() {
  return Object.entries(cats).flatMap(([k, cat]) =>
    cat.items.map(it => ({ ...it, _catKey: k, _catName: cat.name, _catIcon: cat.icon }))
  )
}

export default function Catalog({ sel, onAddToBuild, onToggleCompare, compareList, onHistoryOpen }) {
  const [view, setView] = useState('grid')
  const [catFilter, setCatFilter] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('score')
  const [priceMax, setPriceMax] = useState(50000)
  const [minScore, setMinScore] = useState(0)
  const [showBuild, setShowBuild] = useState(false)

  const buildCount = Object.keys(sel).length

  const items = useMemo(() => {
    let list = getAllItems()
    if (catFilter) list = list.filter(it => it._catKey === catFilter)
    if (search) list = list.filter(it => it.name.toLowerCase().includes(search.toLowerCase()) || it.specs.toLowerCase().includes(search.toLowerCase()))
    if (priceMax < 50000) list = list.filter(it => it.price <= priceMax)
    if (minScore > 0) list = list.filter(it => (it.rating || 0) >= minScore)
    if (sort === 'price_asc') list.sort((a, b) => a.price - b.price)
    else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price)
    else if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'cs'))
    else list.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    return list
  }, [catFilter, search, sort, priceMax, minScore])

  return (
    <div className="catalog-view">
      <div className="catalog-inner">
        {/* Filter bar */}
        <div className="cat-bar">
          <div className="cat-bar-left">
            <div className="cat-search-wrap">
              <span className="cat-search-ico">🔍</span>
              <input className="cat-search" placeholder="Hledat produkt..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="cat-chips">
              {[['', 'Vše'], ...Object.entries(cats).map(([k, c]) => [k, c.icon + ' ' + c.name.split(' ')[0]])].map(([k, l]) => (
                <span key={k} className={`cat-chip${catFilter === k ? ' on' : ''}`} onClick={() => setCatFilter(catFilter === k ? '' : k)}>{l}</span>
              ))}
            </div>
          </div>
          <div className="cat-bar-right">
            <select className="cat-select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="score">Dle hodnocení</option>
              <option value="price_asc">Cena ↑</option>
              <option value="price_desc">Cena ↓</option>
              <option value="name">Název A-Z</option>
            </select>
            <div className="cat-view-btns">
              <button className={`cat-view-btn${view === 'grid' ? ' active' : ''}`} onClick={() => setView('grid')}>⊞</button>
              <button className={`cat-view-btn${view === 'list' ? ' active' : ''}`} onClick={() => setView('list')}>☰</button>
            </div>
          </div>
        </div>

        {/* Price slider */}
        <div className="cat-price-bar">
          <span className="cat-price-lbl">Cena max:</span>
          <input type="range" className="cat-range" min={0} max={50000} step={100} value={priceMax} onChange={e => setPriceMax(+e.target.value)} />
          <span className="cat-price-val">{priceMax >= 50000 ? '50 000+ Kč' : priceMax.toLocaleString('cs') + ' Kč'}</span>
          <span className="cat-price-lbl" style={{ marginLeft:'1rem' }}>Min. skóre:</span>
          <input type="range" className="cat-range" min={0} max={100} step={5} value={minScore} onChange={e => setMinScore(+e.target.value)} />
          <span className="cat-price-val">{minScore}</span>
        </div>

        {/* Results bar */}
        <div className="cat-results-bar">
          <span className="cat-results-count">{items.length} produktů</span>
          <button className="cat-mybuild-btn" onClick={() => setShowBuild(o => !o)}>
            📋 Moje sestava <span className="cat-mybuild-cnt">{buildCount}</span>
          </button>
        </div>

        {/* My build panel */}
        {showBuild && (
          <div className="cat-mybuild-panel">
            <div className="cat-mybuild-title">📋 Moje sestava — {buildCount}/8 komponent</div>
            {Object.entries(cats).map(([k, cat]) => {
              const it = sel[k] ? cat.items.find(x => x.id === sel[k]) : null
              if (!it) return null
              return (
                <div key={k} className="cat-mybuild-row">
                  <span>{cat.icon}</span>
                  <span className="cat-mybuild-row-name">{it.name.split(' ').slice(0, 4).join(' ')}</span>
                  <span className="cat-mybuild-row-price">{fmt(it.price)}</span>
                  <button onClick={() => onAddToBuild(k, it.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', fontSize:'0.75rem' }}>✕</button>
                </div>
              )
            })}
          </div>
        )}

        {/* Products */}
        {view === 'grid' ? (
          <div className="catalog-grid">
            {items.map(it => <CatalogCard key={it.id + it._catKey} it={it} sel={sel} compareList={compareList} onAdd={onAddToBuild} onCompare={onToggleCompare} onHistory={onHistoryOpen} />)}
          </div>
        ) : (
          <div className="catalog-list">
            {items.map(it => <CatalogRow key={it.id + it._catKey} it={it} sel={sel} compareList={compareList} onAdd={onAddToBuild} onCompare={onToggleCompare} onHistory={onHistoryOpen} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function CatalogCard({ it, sel, compareList, onAdd, onCompare, onHistory }) {
  const isAdded = sel[it._catKey] === it.id
  const isCmp = compareList.some(c => c.id === it.id && c.cat === it._catKey)
  const score = it.rating ? (it.rating / 10).toFixed(1) : null
  const scoreColor = !score ? 'var(--text-2)' : score >= 8.5 ? '#34d399' : score >= 7 ? '#fbbf24' : '#f87171'

  return (
    <div className="cg-card">
      <div className="cg-cat">{it._catIcon} {it._catName}</div>
      <div className="cg-name">{it.name}{it.top && <span className="top-badge" style={{ marginLeft:'0.4rem' }}>TOP</span>}</div>
      <div className="cg-specs">{it.specs}</div>
      {score && (
        <div className="cg-score-row">
          <span className="cg-score" style={{ color: scoreColor }}>{score}/10</span>
        </div>
      )}
      <div className="cg-price">{fmt(it.price)}</div>
      <div className="cg-shops-row">
        {Object.entries(it.shops).slice(0, 3).map(([shop, price]) => {
          const url = shopUrls[shop] ? shopUrls[shop](it.name) : `https://www.google.com/search?q=${encodeURIComponent(it.name + ' ' + shop)}`
          return (
            <div key={shop} className="cg-shop-row">
              <span>{shop}</span>
              <span style={{ fontFamily:'JetBrains Mono,monospace', fontWeight:600 }}>{price.toLocaleString('cs')} Kč</span>
              <a href={url} target="_blank" rel="noopener noreferrer">↗ Koupit</a>
            </div>
          )
        })}
      </div>
      <div className="cg-actions">
        <button className={`cg-btn-add${isAdded ? ' added' : ''}`} onClick={() => onAdd(it._catKey, it.id)}>
          {isAdded ? '✓ Přidáno' : '+ Do sestavy'}
        </button>
        <button className={`cg-btn-cmp${isCmp ? ' on' : ''}`} onClick={() => onCompare(it._catKey, it.id)} title="Porovnat">⚖️</button>
        <button className="cg-btn-cmp" onClick={onHistory} title="Historie cen">📈</button>
      </div>
    </div>
  )
}

function CatalogRow({ it, sel, compareList, onAdd, onCompare, onHistory }) {
  const isAdded = sel[it._catKey] === it.id
  const isCmp = compareList.some(c => c.id === it.id && c.cat === it._catKey)
  const score = it.rating ? (it.rating / 10).toFixed(1) : '—'
  const scoreColor = it.rating >= 85 ? '#34d399' : it.rating >= 70 ? '#fbbf24' : '#f87171'

  return (
    <div className="cl-row">
      <div>
        <div className="cl-cat-lbl">{it._catIcon} {it._catName}</div>
        <div className="cl-name">{it.name}{it.top && <span className="top-badge" style={{ marginLeft:'0.4rem' }}>TOP</span>}</div>
      </div>
      <div className="cl-specs">{it.specs}</div>
      <div className="cl-score" style={{ color: scoreColor }}>{score}</div>
      <div className="cl-price">{fmt(it.price)}</div>
      <div className="cl-actions">
        <button className={`cl-btn-add${isAdded ? ' added' : ''}`} onClick={() => onAdd(it._catKey, it.id)}>
          {isAdded ? '✓' : '+ Sestava'}
        </button>
        <button className={`cl-btn-cmp${isCmp ? ' on' : ''}`} onClick={() => onCompare(it._catKey, it.id)}>⚖️</button>
        <button className="cl-btn-cmp" onClick={onHistory}>📈</button>
      </div>
    </div>
  )
}
