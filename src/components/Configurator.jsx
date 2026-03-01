import { useState } from 'react'
import { cats, fmt, shopUrls } from '../data/cats.js'
import Sidebar from './Sidebar.jsx'

export default function Configurator({ sel, selShop, total, count, compareList, favorites, onPick, onPickShop, onRemove, onClear, onToggleCompare, onHistoryOpen, onOpenAll, onSaveBuild, onToggleFavorite }) {
  const [openCat, setOpenCat]         = useState(null)
  const [activeFilters, setActiveFilters] = useState({})
  const [configOpen, setConfigOpen]   = useState(true)

  const pct = Math.round(count / 8 * 100)

  return (
    <div className="relative z-10 grid gap-[clamp(0.85rem,1.5vw,1.75rem)] px-[clamp(1.5rem,5vw,6rem)] pb-[clamp(4rem,8vh,8rem)] items-start"
      style={{gridTemplateColumns:'1fr clamp(300px,26vw,460px)'}}>

      {/* Konfigurátor */}
      <div className="flex flex-col gap-3">
        {/* Hlavička s progress barem */}
        <div className="cursor-pointer select-none" onClick={() => setConfigOpen(o => !o)}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[0.68rem] font-bold uppercase tracking-widest" style={{color:'var(--tx2)'}}>
              ⚙️ Konfigurátor{' '}
              <span className="font-mono font-normal" style={{color:'var(--tx3)'}}>{count} / 8</span>
            </span>
            <span className={`text-[0.65rem] transition-transform ${configOpen ? '' : 'rotate-180'}`} style={{color:'var(--tx3)'}}>▲</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{background:'var(--glass-b)'}}>
            <div className="h-full rounded-full transition-all duration-500" style={{width:`${pct}%`, background:'var(--accent)'}} />
          </div>
        </div>

        {configOpen && Object.entries(cats).map(([k, cat]) => {
          const selected = sel[k] ? cat.items.find(x => x.id === sel[k]) : null
          const isOpen   = openCat === k
          const filter   = activeFilters[k] || 'Vše'
          const filtered = filter === 'Vše' ? cat.items : cat.items.filter(it => it[cat.filterKey] === filter)

          return (
            <div key={k} className="glass rounded-2xl overflow-hidden transition-all duration-300"
              style={{borderColor: selected ? 'var(--accent-b)' : 'var(--glass-b)'}}>

              {/* Hlavička kategorie */}
              <div className="flex items-center gap-[clamp(0.75rem,1.5vw,1.25rem)] px-[clamp(1rem,2vw,1.5rem)] py-[clamp(0.9rem,1.5vw,1.25rem)] cursor-pointer transition-colors hover:bg-white/[0.03] select-none"
                onClick={() => setOpenCat(isOpen ? null : k)}>
                <div className={`flex items-center justify-center rounded-xl flex-shrink-0 transition-colors`}
                  style={{width:'clamp(36px,3vw,46px)', height:'clamp(36px,3vw,46px)', fontSize:'clamp(1rem,1.5vw,1.25rem)', background: selected ? 'var(--accent-s)' : 'var(--surface-3)'}}>
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold" style={{fontSize:'clamp(0.85rem,1.2vw,0.97rem)', color:'var(--tx)'}}>{cat.name}</div>
                  <div className="truncate mt-0.5" style={{fontSize:'clamp(0.7rem,1vw,0.8rem)', color: selected ? 'var(--tx2)' : 'var(--tx3)'}}>
                    {selected ? selected.name : 'Nevybráno'}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {selected && <span className="font-mono font-semibold" style={{fontSize:'clamp(0.82rem,1.2vw,0.92rem)', color:'var(--accent)'}}>{fmt(selected.price)}</span>}
                  <span className={`text-[0.6rem] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} style={{color:'var(--tx3)'}}>▼</span>
                </div>
              </div>

              {/* Filtry */}
              {isOpen && cat.filters?.length > 0 && (
                <div className="flex gap-1.5 flex-wrap px-[clamp(1rem,2vw,1.5rem)] py-2.5 border-t border-b" style={{borderColor:'var(--glass-b)', background:'var(--panel)'}}>
                  {cat.filters.map(f => (
                    <button key={f} onClick={() => setActiveFilters(p => ({...p,[k]:f}))}
                      className="px-3 py-1 rounded-full text-[0.7rem] font-medium cursor-pointer transition-all border"
                      style={{
                        background: filter===f ? 'var(--accent-s)' : 'transparent',
                        borderColor: filter===f ? 'var(--accent-b)' : 'var(--glass-b)',
                        color: filter===f ? 'var(--accent)' : 'var(--tx2)',
                      }}>
                      {f}
                    </button>
                  ))}
                </div>
              )}

              {/* Produkty */}
              {isOpen && (
                <div className="border-t" style={{borderColor:'var(--glass-b)'}}>
                  {filtered.map(it => {
                    const isSelected = sel[k] === it.id
                    const isCmp      = compareList.some(c => c.id === it.id && c.cat === k)
                    return (
                      <div key={it.id}>
                        <div
                          className="flex items-center flex-wrap gap-[clamp(0.75rem,1.5vw,1.25rem)] px-[clamp(1rem,2vw,1.5rem)] py-[clamp(0.75rem,1.5vw,1rem)] border-b last:border-b-0 cursor-pointer transition-colors"
                          style={{borderColor:'var(--surface-2)', background: isSelected ? 'var(--accent-s)' : undefined}}
                          onClick={() => onPick(k, it.id)}
                          onMouseEnter={e => { if(!isSelected) e.currentTarget.style.background='var(--surface-2)' }}
                          onMouseLeave={e => { if(!isSelected) e.currentTarget.style.background='' }}
                        >
                          {/* Checkbox */}
                          <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all text-[0.7rem]"
                            style={{border: isSelected ? 'none' : '1.5px solid var(--glass-b)', background: isSelected ? 'var(--accent)' : 'transparent', color: isSelected ? '#fff' : 'transparent'}}>
                            {isSelected ? '✓' : ''}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium" style={{fontSize:'clamp(0.82rem,1.1vw,0.92rem)', color:'var(--tx)'}}>
                              {it.top && <span className="inline-block mr-1 text-[0.58rem] px-1.5 py-0.5 rounded font-semibold tracking-wide align-middle" style={{background:'rgba(251,191,36,0.15)', color:'var(--yellow)'}}>TOP</span>}
                              {it.name}
                            </div>
                            <div className="font-mono mt-0.5" style={{fontSize:'clamp(0.68rem,0.9vw,0.75rem)', color:'var(--tx2)'}}>{it.specs}</div>
                          </div>

                          {/* Cena */}
                          <div className="text-right flex-shrink-0">
                            <div className="font-mono font-semibold" style={{fontSize:'clamp(0.85rem,1.2vw,0.95rem)', color:'var(--tx)'}}>{fmt(it.price)}</div>
                            {Object.keys(it.shops).length > 0 && (
                              <div className="text-[0.65rem] mt-0.5 font-mono" style={{color:'var(--accent2)'}}>od {Math.min(...Object.values(it.shops)).toLocaleString('cs')} Kč</div>
                            )}
                          </div>

                          {/* Akční tlačítka */}
                          <div className="flex gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                            {[['⚖️', () => onToggleCompare(k, it.id), isCmp], ['📈', onHistoryOpen, false]].map(([ico, fn, active], i) => (
                              <button key={i} onClick={fn}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-[0.75rem] border-none cursor-pointer transition-all"
                                style={{background: active ? 'var(--accent-s)' : 'var(--hover)', color: active ? 'var(--accent)' : 'var(--tx2)'}}>
                                {ico}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Shop picker */}
                        {isSelected && Object.keys(it.shops).length > 0 && (
                          <div className="flex flex-col gap-1.5 border-t py-2"
                            style={{borderColor:'var(--glass-b)', background:'var(--panel)', paddingLeft:'clamp(2.5rem,4vw,4rem)', paddingRight:'clamp(1rem,2vw,1.5rem)'}}
                            onClick={e => e.stopPropagation()}>
                            {Object.entries(it.shops).map(([shop, price]) => {
                              const url = shopUrls[shop] ? shopUrls[shop](it.name) : `https://www.google.com/search?q=${encodeURIComponent(it.name+' '+shop)}`
                              const isActive = selShop[k] === shop
                              return (
                                <div key={shop}
                                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg cursor-pointer transition-all border"
                                  style={{background: isActive ? 'var(--accent-s)' : 'transparent', borderColor: isActive ? 'var(--accent-b)' : 'transparent'}}
                                  onClick={() => onPickShop(k, shop)}
                                  onMouseEnter={e => { if(!isActive) e.currentTarget.style.background='var(--hover)' }}
                                  onMouseLeave={e => { if(!isActive) e.currentTarget.style.background='transparent' }}>
                                  <div className="w-4 h-4 rounded flex items-center justify-center text-[0.6rem] flex-shrink-0"
                                    style={{border: isActive ? 'none' : '1.5px solid var(--glass-b)', background: isActive ? 'var(--accent)' : 'transparent', color: isActive ? '#fff' : 'transparent'}}>
                                    {isActive ? '✓' : ''}
                                  </div>
                                  <span className="flex-1 text-[0.78rem] font-medium" style={{color:'var(--tx)'}}>{shop}</span>
                                  <span className="font-mono text-[0.78rem]" style={{color: isActive ? 'var(--accent)' : 'var(--tx2)'}}>{price.toLocaleString('cs')} Kč</span>
                                  <a href={url} target="_blank" rel="noopener noreferrer"
                                    className="text-[0.72rem] px-2 py-0.5 rounded-md border transition-all hover:text-white flex-shrink-0"
                                    style={{color:'var(--accent)', borderColor:'var(--accent-b)'}}
                                    onMouseEnter={e => e.target.style.background='var(--accent)'}
                                    onMouseLeave={e => e.target.style.background=''}
                                    onClick={e => e.stopPropagation()}>↗</a>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Sidebar */}
      <Sidebar sel={sel} selShop={selShop} total={total} count={count} onRemove={onRemove} onOpenAll={onOpenAll} onSaveBuild={onSaveBuild} favorites={favorites} onToggleFavorite={onToggleFavorite} />
    </div>
  )
}
