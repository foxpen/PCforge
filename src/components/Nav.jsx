import { fmt } from '../data/cats.js'

export default function Nav({ theme, onToggleTheme, total, onShare, onExport }) {
  return (
    <nav>
      <div className="logo">PC<span>Forge</span></div>
      <div className="nav-right">
        <button className="theme-btn" onClick={onToggleTheme} title="Přepnout téma">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button className="theme-btn" onClick={onShare} title="Sdílet sestavu">🔗</button>
        <button className="theme-btn" onClick={onExport} title="Export PDF">📄</button>
        {total > 0 && (
          <div className="nav-total">
            <span style={{ color:'var(--text-2)', fontSize:'0.78rem' }}>Sestava</span>
            <span className="amount">{fmt(total)}</span>
          </div>
        )}
      </div>
    </nav>
  )
}
