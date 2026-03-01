import { useState } from 'react'
import { fmt } from '../data/cats.js'

const PALETTES = [
  { id:'indigo', label:'Indigo', accent:'#818cf8', soft:'rgba(129,140,248,0.15)', border:'rgba(129,140,248,0.35)' },
  { id:'violet', label:'Violet', accent:'#a78bfa', soft:'rgba(167,139,250,0.15)', border:'rgba(167,139,250,0.35)' },
  { id:'cyan',   label:'Cyan',   accent:'#22d3ee', soft:'rgba(34,211,238,0.15)',  border:'rgba(34,211,238,0.35)'  },
  { id:'rose',   label:'Rose',   accent:'#fb7185', soft:'rgba(251,113,133,0.15)', border:'rgba(251,113,133,0.35)' },
]

export default function Nav({ theme, onToggleTheme, total, onShare, onExport, palette, onPalette }) {
  const [paletteOpen, setPaletteOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-[clamp(1.5rem,5vw,6rem)] h-16 glass border-b" style={{borderColor:'var(--glass-b)'}}>
      <div className="text-[clamp(1rem,1.5vw,1.25rem)] font-extrabold tracking-tight" style={{color:'var(--tx)'}}>
        PC<span style={{color:'var(--accent)'}}>Forge</span>
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
        {total > 0 && (
          <div className="flex items-center gap-2 px-4 h-10 rounded-xl glass text-sm">
            <span style={{color:'var(--tx2)',fontSize:'0.78rem'}}>Sestava</span>
            <span className="font-mono font-bold" style={{color:'var(--accent)'}}>{fmt(total)}</span>
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

export { PALETTES }
