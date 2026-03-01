import { cats, fmt } from '../data/cats.js'

export default function Compare({ compareList, onRemove }) {
  if (!compareList.length) return (
    <div className="relative z-10 px-[clamp(1.5rem,5vw,6rem)] pb-[clamp(4rem,8vh,8rem)]">
      <div className="text-center py-24">
        <div className="text-4xl mb-4">⚖️</div>
        <div className="font-semibold text-base mb-2" style={{color:'var(--tx)'}}>Zatím nic k porovnání</div>
        <div className="text-[0.82rem]" style={{color:'var(--tx2)'}}>V konfigurátoru klikni na ⚖️ u libovolné komponenty</div>
      </div>
    </div>
  )

  const items = compareList.map(c => {
    const cat = cats[c.cat]
    const it  = cat?.items.find(x => x.id === c.id)
    return it ? { ...it, _cat:c.cat, _catName:cat.name, _catIcon:cat.icon } : null
  }).filter(Boolean)

  return (
    <div className="relative z-10 px-[clamp(1.5rem,5vw,6rem)] pb-[clamp(4rem,8vh,8rem)]">
      <div className="text-[0.68rem] font-bold uppercase tracking-widest mb-5" style={{color:'var(--tx2)'}}>⚖️ Porovnání komponent</div>
      <div className="grid gap-[clamp(0.85rem,1.5vw,1.75rem)]" style={{gridTemplateColumns:`repeat(${Math.min(items.length,4)},1fr)`}}>
        {items.map(it => {
          const score = it.rating ? (it.rating/10).toFixed(1) : null
          const sc    = !score ? 'var(--tx2)' : score>=8.5 ? '#34d399' : score>=7 ? '#fbbf24' : '#f87171'
          return (
            <div key={it.id} className="glass rounded-2xl relative transition-all hover:border-[color:var(--accent-b)]"
              style={{padding:'clamp(1rem,2vw,1.5rem)', borderColor:'var(--glass-b)'}}>
              <button onClick={() => onRemove(it._cat, it.id)}
                className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-[0.72rem] cursor-pointer border-none transition-all hover:bg-red-400/20 hover:text-red-400"
                style={{background:'rgba(255,255,255,0.08)', color:'var(--tx3)'}}>✕</button>
              <div className="text-[0.62rem] uppercase tracking-wider mb-1" style={{color:'var(--tx3)'}}>{it._catIcon} {it._catName}</div>
              <div className="font-bold text-[0.92rem] mb-1 pr-6" style={{color:'var(--tx)'}}>{it.name}</div>
              <div className="text-[0.72rem] mb-2" style={{color:'var(--tx2)'}}>{it.specs}</div>
              {score && <div className="font-bold text-[0.78rem] mb-2" style={{color:sc}}>{score}/10</div>}
              <div className="font-mono font-extrabold text-[1.1rem] mb-3" style={{color:'var(--accent)'}}>{fmt(it.price)}</div>
              <div className="flex flex-col gap-0.5">
                {Object.entries(it.shops).map(([shop, price]) => (
                  <div key={shop} className="flex justify-between text-[0.72rem] py-1 border-b" style={{color:'var(--tx2)', borderColor:'var(--glass-b)'}}>
                    <span>{shop}</span>
                    <span className="font-mono font-semibold">{price.toLocaleString('cs')} Kč</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
