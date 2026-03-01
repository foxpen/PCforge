import { useState } from 'react'
import { cats, fmt, shopUrls } from '../data/cats.js'

const PALETTES = [
  { id:'indigo', label:'Indigo', accent:'#818cf8', soft:'rgba(129,140,248,0.15)', border:'rgba(129,140,248,0.35)',
    accent2:       { dark:'#f59e0b',  light:'#e8930a' },
    accent2s:      { dark:'rgba(245,158,11,0.12)', light:'rgba(232,147,10,0.12)' },
    accent2b:      { dark:'rgba(245,158,11,0.28)', light:'rgba(232,147,10,0.25)' },
    accent2glow:   { dark:'rgba(245,158,11,0.15)', light:'rgba(232,147,10,0.08)' },
    accent2dark:   { dark:'#b45309', light:'#b45309' },
    sidebarBg:     { dark:'linear-gradient(165deg, rgba(245,158,11,0.06) 0%, rgba(15,12,28,0.97) 40%)',  light:'linear-gradient(165deg, rgba(232,147,10,0.08) 0%, rgba(255,252,245,0.8) 40%)' },
    sidebarLine:   { dark:'linear-gradient(90deg, transparent, #f59e0b, transparent)', light:'linear-gradient(90deg, transparent, #e8930a, transparent)' },
    sidebarItemH:  { dark:'rgba(245,158,11,0.08)', light:'rgba(232,147,10,0.1)' },
    sidebarCtaTx:  { dark:'#0f0a1a', light:'#fff' },
  },
  { id:'violet', label:'Violet', accent:'#a78bfa', soft:'rgba(167,139,250,0.15)', border:'rgba(167,139,250,0.35)',
    accent2:       { dark:'#f59e0b',  light:'#e8930a' },
    accent2s:      { dark:'rgba(245,158,11,0.12)', light:'rgba(232,147,10,0.12)' },
    accent2b:      { dark:'rgba(245,158,11,0.28)', light:'rgba(232,147,10,0.25)' },
    accent2glow:   { dark:'rgba(245,158,11,0.15)', light:'rgba(232,147,10,0.08)' },
    accent2dark:   { dark:'#b45309', light:'#b45309' },
    sidebarBg:     { dark:'linear-gradient(165deg, rgba(245,158,11,0.06) 0%, rgba(15,12,28,0.97) 40%)',  light:'linear-gradient(165deg, rgba(232,147,10,0.08) 0%, rgba(255,252,245,0.8) 40%)' },
    sidebarLine:   { dark:'linear-gradient(90deg, transparent, #f59e0b, transparent)', light:'linear-gradient(90deg, transparent, #e8930a, transparent)' },
    sidebarItemH:  { dark:'rgba(245,158,11,0.08)', light:'rgba(232,147,10,0.1)' },
    sidebarCtaTx:  { dark:'#0f0a1a', light:'#fff' },
  },
  { id:'cyan', label:'Cyan', accent:'#22d3ee', soft:'rgba(34,211,238,0.15)', border:'rgba(34,211,238,0.35)',
    accent2:       { dark:'#34d399',  light:'#10b981' },
    accent2s:      { dark:'rgba(52,211,153,0.12)', light:'rgba(16,185,129,0.12)' },
    accent2b:      { dark:'rgba(52,211,153,0.28)', light:'rgba(16,185,129,0.25)' },
    accent2glow:   { dark:'rgba(52,211,153,0.15)', light:'rgba(16,185,129,0.08)' },
    accent2dark:   { dark:'#047857', light:'#047857' },
    sidebarBg:     { dark:'linear-gradient(165deg, rgba(52,211,153,0.06) 0%, rgba(15,12,28,0.97) 40%)',  light:'linear-gradient(165deg, rgba(16,185,129,0.08) 0%, rgba(255,252,245,0.8) 40%)' },
    sidebarLine:   { dark:'linear-gradient(90deg, transparent, #34d399, transparent)', light:'linear-gradient(90deg, transparent, #10b981, transparent)' },
    sidebarItemH:  { dark:'rgba(52,211,153,0.08)', light:'rgba(16,185,129,0.1)' },
    sidebarCtaTx:  { dark:'#0f0a1a', light:'#fff' },
  },
  { id:'rose', label:'Rose', accent:'#fb7185', soft:'rgba(251,113,133,0.15)', border:'rgba(251,113,133,0.35)',
    accent2:       { dark:'#fbbf24',  light:'#eab308' },
    accent2s:      { dark:'rgba(251,191,36,0.12)', light:'rgba(234,179,8,0.12)' },
    accent2b:      { dark:'rgba(251,191,36,0.28)', light:'rgba(234,179,8,0.25)' },
    accent2glow:   { dark:'rgba(251,191,36,0.15)', light:'rgba(234,179,8,0.08)' },
    accent2dark:   { dark:'#b45309', light:'#a16207' },
    sidebarBg:     { dark:'linear-gradient(165deg, rgba(251,191,36,0.06) 0%, rgba(15,12,28,0.97) 40%)',  light:'linear-gradient(165deg, rgba(234,179,8,0.08) 0%, rgba(255,252,245,0.8) 40%)' },
    sidebarLine:   { dark:'linear-gradient(90deg, transparent, #fbbf24, transparent)', light:'linear-gradient(90deg, transparent, #eab308, transparent)' },
    sidebarItemH:  { dark:'rgba(251,191,36,0.08)', light:'rgba(234,179,8,0.1)' },
    sidebarCtaTx:  { dark:'#0f0a1a', light:'#fff' },
  },
]

/* Vrátí hodnotu podle tématu */
function tv(obj, theme) {
  if (!obj || typeof obj === 'string') return obj
  return theme === 'light' ? obj.light : obj.dark
}

export default function Nav({ theme, onToggleTheme, total, count, sel, selShop, onShare, onExport, palette, onPalette, onRemove, onOpenAll, onSaveBuild, onGoHome }) {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [cartOpen, setCartOpen]       = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-[clamp(1.5rem,5vw,6rem)] h-16 glass border-b" style={{borderColor:'var(--glass-b)'}}>
      <div className="flex items-center gap-3">
        <div className="text-[clamp(1rem,1.5vw,1.25rem)] font-extrabold tracking-tight" style={{color:'var(--tx)'}}>
          PC<span style={{color:'var(--accent)'}}>Forge</span>
        </div>
        {onGoHome && (
          <button onClick={onGoHome} title="Hlavní stránka"
            className="w-8 h-8 rounded-lg glass flex items-center justify-center cursor-pointer text-sm border-none transition-all hover:scale-105"
            style={{color:'var(--tx2)', borderColor:'var(--glass-b)'}}>
            🏠
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">

        {/* Palette picker */}
        <div className="relative">
          <button onClick={() => setPaletteOpen(o => !o)} title="Barvy"
            className="w-10 h-10 rounded-xl glass flex items-center justify-center cursor-pointer transition-all text-base"
            style={{borderColor: paletteOpen ? 'var(--accent)' : 'var(--glass-b)'}}>
            🎨
          </button>
          {paletteOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setPaletteOpen(false)} />
              <div className="absolute right-0 top-12 z-50 rounded-2xl p-3 flex flex-col gap-1.5 shadow-xl"
                style={{background:'var(--surface)',border:'1px solid var(--glass-b)',backdropFilter:'blur(24px)',minWidth:'160px'}}>
                <div className="text-[0.6rem] font-bold uppercase tracking-widest px-1 mb-1" style={{color:'var(--tx3)'}}>Barevné téma</div>
                {PALETTES.map(p => (
                  <button key={p.id} onClick={() => { onPalette(p.id); setPaletteOpen(false) }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer border transition-all text-left w-full"
                    style={{background:palette===p.id?p.soft:'transparent',borderColor:palette===p.id?p.border:'transparent',color:'var(--tx)'}}>
                    <span className="w-4 h-4 rounded-full flex-shrink-0" style={{background:p.accent}} />
                    <span className="text-[0.8rem] font-medium">{p.label}</span>
                    {palette===p.id && <span className="ml-auto text-[0.7rem]" style={{color:p.accent}}>✓</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <IconBtn onClick={onToggleTheme} title="Téma">{theme==='dark'?'☀️':'🌙'}</IconBtn>
        <IconBtn onClick={onShare} title="Sdílet">🔗</IconBtn>
        <IconBtn onClick={onExport} title="Export">📄</IconBtn>

        {/* Cart button + dropdown */}
        {total > 0 && (
          <div className="relative">
            <button onClick={() => setCartOpen(o => !o)}
              className="flex items-center gap-2 px-4 h-10 rounded-xl glass text-sm cursor-pointer transition-all border-none"
              style={{borderColor: cartOpen ? 'var(--accent2-b)' : 'var(--glass-b)', border: cartOpen ? '1px solid var(--accent2-b)' : '1px solid var(--glass-b)'}}>
              <span className="text-[0.85rem]">🛒</span>
              <span style={{color:'var(--tx2)',fontSize:'0.78rem'}}>Sestava</span>
              <span className="font-mono font-bold" style={{color:'var(--accent2)'}}>{fmt(total)}</span>
              <span className="flex items-center justify-center w-5 h-5 rounded-full text-[0.6rem] font-bold"
                style={{background:'var(--accent2)', color: theme === 'dark' ? '#0f0a1a' : '#fff'}}>
                {count}
              </span>
            </button>

            {cartOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setCartOpen(false)} />
                <div className="cart-dropdown absolute right-0 top-12 z-50 rounded-2xl overflow-hidden"
                  style={{minWidth:'340px', maxWidth:'400px'}}>

                  {/* Cart header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b" style={{borderColor:'var(--accent2-b)'}}>
                    <span className="text-[0.82rem] font-semibold" style={{color:'var(--accent2)'}}>🛠 Vaše sestava</span>
                    <span className="font-mono text-[0.68rem] px-2 py-0.5 rounded-full font-semibold"
                      style={{background:'var(--accent2-s)', color:'var(--accent2)', border:'1px solid var(--accent2-b)'}}>
                      {count} / 8
                    </span>
                  </div>

                  {/* Cart items */}
                  <div style={{maxHeight:'320px', overflowY:'auto'}}>
                    {Object.entries(cats).map(([k, cat]) => {
                      const it = sel[k] ? cat.items.find(x => x.id === sel[k]) : null
                      if (!it) return null
                      const shop  = selShop[k]
                      const price = shop && it.shops[shop] ? it.shops[shop] : it.price
                      return (
                        <div key={k} className="cart-item flex items-center gap-2.5 px-4 py-2.5">
                          <span className="text-[0.85rem] flex-shrink-0">{cat.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-[0.6rem] uppercase tracking-wider font-semibold" style={{color:'var(--accent2)', opacity:0.6}}>{cat.name.split('(')[0].trim()}</div>
                            <div className="text-[0.78rem] font-medium truncate" style={{color:'var(--tx)'}}>{it.name.split(' ').slice(0,4).join(' ')}</div>
                          </div>
                          <span className="font-mono text-[0.74rem] font-semibold flex-shrink-0" style={{color:'var(--accent2)'}}>{fmt(price)}</span>
                          <button onClick={(e) => { e.stopPropagation(); onRemove(k) }}
                            className="text-[0.65rem] w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer hover:text-red-400 transition-colors bg-transparent border-none flex-shrink-0"
                            style={{color:'var(--tx3)', background:'var(--surface-2)'}}>✕</button>
                        </div>
                      )
                    })}
                  </div>

                  {/* Cart footer */}
                  <div className="px-4 py-3 border-t flex flex-col gap-2.5" style={{borderColor:'var(--accent2-b)'}}>
                    <div className="flex items-center justify-between">
                      <span className="text-[0.72rem] uppercase tracking-wider font-semibold" style={{color:'var(--accent2)', opacity:0.6}}>Celkem od</span>
                      <span className="font-mono font-bold text-[1.15rem]" style={{color:'var(--accent2)'}}>{fmt(total)}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { onSaveBuild?.('Rychlé uložení'); setCartOpen(false) }}
                        className="flex-1 py-2 rounded-xl text-[0.78rem] font-semibold cursor-pointer sidebar-cta">
                        💾 Uložit
                      </button>
                      <button onClick={() => { onOpenAll(); setCartOpen(false) }} disabled={count < 8}
                        className="flex-1 py-2 rounded-xl text-[0.78rem] font-semibold cursor-pointer sidebar-btn-secondary disabled:opacity-30 disabled:cursor-not-allowed">
                        ⚡ E-shopy
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

function IconBtn({ children, onClick, title }) {
  return (
    <button onClick={onClick} title={title}
      className="w-10 h-10 rounded-xl glass flex items-center justify-center cursor-pointer transition-all text-base"
      style={{color:'var(--tx)'}}>
      {children}
    </button>
  )
}

export { PALETTES, tv }
