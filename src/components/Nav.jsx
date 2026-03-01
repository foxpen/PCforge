import { fmt } from '../data/cats.js'

export default function Nav({ theme, onToggleTheme, total, onShare, onExport }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-[clamp(1.5rem,5vw,6rem)] h-16 glass border-b border-white/10">
      <div className="text-[clamp(1rem,1.5vw,1.25rem)] font-extrabold tracking-tight" style={{color:'var(--tx)'}}>
        PC<span style={{color:'var(--accent)'}}>Forge</span>
      </div>
      <div className="flex items-center gap-3">
        <IconBtn onClick={onToggleTheme} title="Téma">{theme === 'dark' ? '☀️' : '🌙'}</IconBtn>
        <IconBtn onClick={onShare} title="Sdílet">🔗</IconBtn>
        <IconBtn onClick={onExport} title="Export">📄</IconBtn>
        {total > 0 && (
          <div className="flex items-center gap-2 px-4 h-10 rounded-xl glass text-sm">
            <span style={{color:'var(--tx2)', fontSize:'0.78rem'}}>Sestava</span>
            <span className="font-mono font-bold" style={{color:'var(--accent)'}}>{fmt(total)}</span>
          </div>
        )}
      </div>
    </nav>
  )
}

function IconBtn({ children, onClick, title }) {
  return (
    <button
      onClick={onClick} title={title}
      className="w-10 h-10 rounded-xl glass glass-hover flex items-center justify-center cursor-pointer transition-all text-base"
      style={{color:'var(--tx)'}}
    >{children}</button>
  )
}
