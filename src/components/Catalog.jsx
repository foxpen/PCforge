import { useState, useMemo } from 'react'
import { cats, fmt, shopUrls } from '../data/cats.js'

const getAllItems = () => Object.entries(cats).flatMap(([k,cat]) =>
  cat.items.map(it => ({ ...it, _catKey:k, _catName:cat.name, _catIcon:cat.icon }))
)

export default function Catalog({ sel, onAddToBuild, onToggleCompare, compareList, onHistoryOpen }) {
  const [view,      setView]      = useState('grid')
  const [catFilter, setCatFilter] = useState('')
  const [search,    setSearch]    = useState('')
  const [sort,      setSort]      = useState('score')
  const [priceMax,  setPriceMax]  = useState(50000)
  const [showBuild, setShowBuild] = useState(false)

  const buildCount = Object.keys(sel).length

  const items = useMemo(() => {
    let list = getAllItems()
    if (catFilter) list = list.filter(it => it._catKey === catFilter)
    if (search)    list = list.filter(it => it.name.toLowerCase().includes(search.toLowerCase()) || it.specs.toLowerCase().includes(search.toLowerCase()))
    if (priceMax < 50000) list = list.filter(it => it.price <= priceMax)
    if (sort === 'price_asc')  list.sort((a,b) => a.price - b.price)
    else if (sort === 'price_desc') list.sort((a,b) => b.price - a.price)
    else if (sort === 'name') list.sort((a,b) => a.name.localeCompare(b.name,'cs'))
    else list.sort((a,b) => (b.rating||0) - (a.rating||0))
    return list
  }, [catFilter, search, sort, priceMax])

  const BtnCls = (active) => `px-3 py-1.5 rounded-lg text-[0.72rem] font-semibold border-none cursor-pointer transition-all ${active ? 'text-white' : 'hover:bg-white/10'}`

  return (
    <div className="relative z-10 px-[clamp(1.5rem,5vw,6rem)] pb-[clamp(4rem,8vh,8rem)]">
      {/* Filter bar */}
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div className="flex flex-col gap-2.5 flex-1">
          {/* Search */}
          <div className="flex items-center gap-2 glass rounded-xl px-3 py-2.5" style={{maxWidth:'clamp(260px,28vw,400px)'}}>
            <span className="text-[0.85rem]">🔍</span>
            <input className="bg-transparent border-none outline-none text-[0.85rem] flex-1 font-sans" style={{color:'var(--tx)'}}
              placeholder="Hledat produkt..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {/* Category chips */}
          <div className="flex gap-1.5 flex-wrap">
            {[['','Vše'], ...Object.entries(cats).map(([k,c]) => [k, c.icon+' '+c.name.split(' ')[0]])].map(([k,l]) => (
              <button key={k} onClick={() => setCatFilter(catFilter===k ? '' : k)}
                className="px-3 py-1 rounded-full text-[0.7rem] font-medium cursor-pointer border transition-all"
                style={{background: catFilter===k ? 'var(--accent-s)' : 'transparent', borderColor: catFilter===k ? 'var(--accent-b)' : 'var(--glass-b)', color: catFilter===k ? 'var(--accent)' : 'var(--tx2)'}}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select className="glass rounded-xl text-[0.78rem] px-3 py-2 cursor-pointer border-none outline-none" style={{color:'var(--tx)'}}
            value={sort} onChange={e => setSort(e.target.value)}>
            <option value="score">Dle hodnocení</option>
            <option value="price_asc">Cena ↑</option>
            <option value="price_desc">Cena ↓</option>
            <option value="name">Název A-Z</option>
          </select>
          {['grid','list'].map(v => (
            <button key={v} onClick={() => setView(v)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-base border cursor-pointer transition-all"
              style={{background: view===v ? 'var(--accent-s)' : 'var(--glass)', borderColor: view===v ? 'var(--accent-b)' : 'var(--glass-b)', color: view===v ? 'var(--accent)' : 'var(--tx2)'}}>
              {v === 'grid' ? '⊞' : '☰'}
            </button>
          ))}
        </div>
      </div>

      {/* Price slider */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <span className="text-[0.72rem]" style={{color:'var(--tx2)'}}>Cena max:</span>
        <input type="range" min={0} max={50000} step={100} value={priceMax} onChange={e => setPriceMax(+e.target.value)}
          className="cursor-pointer" style={{accentColor:'var(--accent)', width:'clamp(100px,15vw,200px)'}} />
        <span className="font-mono text-[0.72rem]" style={{color:'var(--accent)', minWidth:'90px'}}>
          {priceMax >= 50000 ? '50 000+ Kč' : priceMax.toLocaleString('cs')+' Kč'}
        </span>
      </div>

      {/* Results bar */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-[0.78rem]" style={{color:'var(--tx2)'}}>{items.length} produktů</span>
        <button onClick={() => setShowBuild(o => !o)}
          className="flex items-center gap-2 glass rounded-xl px-3 py-1.5 text-[0.78rem] cursor-pointer transition-all hover:border-[color:var(--accent-b)]"
          style={{color:'var(--tx)', borderColor:'var(--glass-b)'}}>
          📋 Moje sestava
          <span className="text-[0.65rem] font-bold px-1.5 py-0.5 rounded-md text-white" style={{background:'var(--accent)'}}>{buildCount}</span>
        </button>
      </div>

      {/* Build panel */}
      {showBuild && (
        <div className="glass rounded-2xl px-5 py-4 mb-5">
          <div className="text-[0.78rem] font-bold mb-3" style={{color:'var(--tx)'}}>📋 Moje sestava — {buildCount}/8</div>
          {Object.entries(cats).map(([k,cat]) => {
            const it = sel[k] ? cat.items.find(x => x.id === sel[k]) : null
            if (!it) return null
            return (
              <div key={k} className="flex items-center gap-2 py-1.5 border-b last:border-b-0 text-[0.78rem]" style={{borderColor:'var(--glass-b)'}}>
                <span>{cat.icon}</span>
                <span className="flex-1" style={{color:'var(--tx)'}}>{it.name.split(' ').slice(0,4).join(' ')}</span>
                <span className="font-mono font-semibold" style={{color:'var(--accent)'}}>{fmt(it.price)}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Products */}
      {view === 'grid' ? (
        <div className="grid gap-[clamp(0.85rem,1.5vw,1.75rem)]" style={{gridTemplateColumns:'repeat(auto-fill,minmax(clamp(220px,18vw,290px),1fr))'}}>
          {items.map(it => <Card key={it.id+it._catKey} it={it} sel={sel} compareList={compareList} onAdd={onAddToBuild} onCompare={onToggleCompare} onHistory={onHistoryOpen} />)}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map(it => <Row key={it.id+it._catKey} it={it} sel={sel} compareList={compareList} onAdd={onAddToBuild} onCompare={onToggleCompare} />)}
        </div>
      )}
    </div>
  )
}

function Card({ it, sel, compareList, onAdd, onCompare, onHistory }) {
  const isAdded = sel[it._catKey] === it.id
  const isCmp   = compareList.some(c => c.id === it.id && c.cat === it._catKey)
  const score   = it.rating ? (it.rating/10).toFixed(1) : null
  const sc      = !score ? 'var(--tx2)' : score>=8.5 ? '#34d399' : score>=7 ? '#fbbf24' : '#f87171'
  return (
    <div className="glass rounded-2xl flex flex-col gap-1 transition-all hover:-translate-y-0.5 hover:border-[color:var(--accent-b)]"
      style={{padding:'clamp(1rem,1.5vw,1.4rem)', borderColor:'var(--glass-b)'}}>
      <div className="text-[0.6rem] uppercase tracking-wider" style={{color:'var(--tx3)'}}>{it._catIcon} {it._catName}</div>
      <div className="font-bold" style={{fontSize:'clamp(0.82rem,1.1vw,0.92rem)', color:'var(--tx)'}}>
        {it.top && <span className="inline-block mr-1 text-[0.58rem] px-1.5 py-0.5 rounded font-semibold tracking-wide align-middle" style={{background:'rgba(251,191,36,0.15)',color:'var(--yellow)'}}>TOP</span>}
        {it.name}
      </div>
      <div className="font-mono text-[0.7rem]" style={{color:'var(--tx2)'}}>{it.specs}</div>
      {score && <div className="font-bold text-[0.8rem]" style={{color:sc}}>{score}/10</div>}
      <div className="font-mono font-extrabold my-1" style={{fontSize:'clamp(0.95rem,1.3vw,1.1rem)', color:'var(--accent)'}}>{fmt(it.price)}</div>
      <div className="flex flex-col gap-0.5 mb-2">
        {Object.entries(it.shops).slice(0,3).map(([shop, price]) => {
          const url = shopUrls[shop] ? shopUrls[shop](it.name) : `https://www.google.com/search?q=${encodeURIComponent(it.name+' '+shop)}`
          return (
            <div key={shop} className="flex items-center justify-between text-[0.68rem] py-1 border-b" style={{color:'var(--tx2)', borderColor:'var(--surface-2)'}}>
              <span>{shop}</span>
              <span className="font-mono font-semibold">{price.toLocaleString('cs')} Kč</span>
              <a href={url} target="_blank" rel="noopener noreferrer" className="ml-1" style={{color:'var(--accent)', fontSize:'0.65rem'}}>↗</a>
            </div>
          )
        })}
      </div>
      <div className="flex gap-1.5 mt-auto">
        <button onClick={() => onAdd(it._catKey, it.id)}
          className="flex-1 py-2 rounded-lg text-[0.72rem] font-semibold cursor-pointer border-none transition-all"
          style={{background: isAdded ? 'rgba(52,211,153,0.15)' : 'rgba(99,102,241,0.15)', color: isAdded ? '#34d399' : 'var(--accent)'}}>
          {isAdded ? '✓ Přidáno' : '+ Do sestavy'}
        </button>
        {[[() => onCompare(it._catKey, it.id), '⚖️', isCmp], [onHistory, '📈', false]].map(([fn, ico, active], i) => (
          <button key={i} onClick={fn}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[0.78rem] border-none cursor-pointer transition-all"
            style={{background: active ? 'var(--accent-s)' : 'var(--hover)', color: active ? 'var(--accent)' : 'var(--tx2)'}}>
            {ico}
          </button>
        ))}
      </div>
    </div>
  )
}

function Row({ it, sel, compareList, onAdd, onCompare }) {
  const isAdded = sel[it._catKey] === it.id
  const isCmp   = compareList.some(c => c.id === it.id && c.cat === it._catKey)
  const score   = it.rating ? (it.rating/10).toFixed(1) : '—'
  const sc      = it.rating>=85 ? '#34d399' : it.rating>=70 ? '#fbbf24' : '#f87171'
  return (
    <div className="glass rounded-xl grid items-center gap-4 px-5 py-3 transition-all hover:border-[color:var(--accent-b)]"
      style={{gridTemplateColumns:'2fr 2fr 0.5fr 1fr auto', borderColor:'var(--glass-b)'}}>
      <div>
        <div className="text-[0.6rem] uppercase tracking-wider mb-0.5" style={{color:'var(--tx3)'}}>{it._catIcon} {it._catName}</div>
        <div className="font-semibold text-[0.85rem]" style={{color:'var(--tx)'}}>
          {it.top && <span className="inline-block mr-1 text-[0.58rem] px-1.5 py-0.5 rounded font-semibold align-middle" style={{background:'rgba(251,191,36,0.15)',color:'var(--yellow)'}}>TOP</span>}
          {it.name}
        </div>
      </div>
      <div className="font-mono text-[0.7rem]" style={{color:'var(--tx2)'}}>{it.specs}</div>
      <div className="font-bold text-[0.82rem] text-center" style={{color:sc}}>{score}</div>
      <div className="font-mono font-bold text-[0.9rem] text-right" style={{color:'var(--accent)'}}>{fmt(it.price)}</div>
      <div className="flex gap-1.5">
        <button onClick={() => onAdd(it._catKey, it.id)}
          className="px-3 py-1.5 rounded-lg text-[0.7rem] font-semibold border-none cursor-pointer transition-all whitespace-nowrap"
          style={{background: isAdded ? 'rgba(52,211,153,0.15)' : 'rgba(99,102,241,0.15)', color: isAdded ? '#34d399' : 'var(--accent)'}}>
          {isAdded ? '✓' : '+ Sestava'}
        </button>
        <button onClick={() => onCompare(it._catKey, it.id)}
          className="px-2 py-1.5 rounded-lg text-[0.72rem] border-none cursor-pointer transition-all"
          style={{background: isCmp ? 'var(--accent-s)' : 'var(--hover)', color: isCmp ? 'var(--accent)' : 'var(--tx2)'}}>⚖️</button>
      </div>
    </div>
  )
}
