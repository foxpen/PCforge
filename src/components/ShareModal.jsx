import { useState, useEffect } from 'react'
import { cats, fmt } from '../data/cats.js'

export default function ShareModal({ sel, selShop, total, onClose }) {
  const [copied, setCopied] = useState(false)

  // Zakóduj sestavu do URL parametrů
  const encoded = btoa(JSON.stringify({ sel, selShop }))
  const url = `${window.location.origin}${window.location.pathname}?build=${encoded}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      // fallback pro starší prohlížeče
      const el = document.createElement('textarea')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  const shareNative = async () => {
    if (!navigator.share) return
    await navigator.share({ title: 'PCForge sestava', text: `Podívej na moji PC sestavu za ${fmt(total)}!`, url })
  }

  const compCount = Object.keys(sel).length

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{background:'rgba(0,0,0,0.5)', backdropFilter:'blur(8px)'}}
      onClick={onClose}>
      <div className="relative w-full max-w-lg rounded-3xl overflow-hidden"
        style={{background:'var(--surface)', border:'1px solid var(--accent-b)'}}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{borderColor:'var(--glass-b)'}}>
          <div>
            <div className="font-bold text-lg" style={{color:'var(--tx)'}}>🔗 Sdílet sestavu</div>
            <div className="text-[0.75rem] mt-0.5" style={{color:'var(--tx2)'}}>
              {compCount} komponent · celkem {fmt(total)}
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-pointer border-none"
            style={{background:'var(--close-btn)', color:'var(--close-tx)'}}>✕</button>
        </div>

        {/* Přehled sestavy */}
        <div className="px-6 pt-4 pb-2">
          <div className="text-[0.65rem] uppercase tracking-widest mb-2" style={{color:'var(--tx3)'}}>Tvoje sestava</div>
          <div className="glass rounded-2xl overflow-hidden">
            {Object.entries(sel).map(([k, id]) => {
              const cat  = cats[k]
              const item = cat?.items.find(x => x.id === id)
              if (!item) return null
              return (
                <div key={k} className="flex items-center gap-3 px-4 py-2.5 border-b last:border-b-0"
                  style={{borderColor:'var(--border-subtle)'}}>
                  <span className="text-base flex-shrink-0">{cat.icon}</span>
                  <span className="flex-1 text-[0.8rem] truncate" style={{color:'var(--tx)'}}>{item.name.split(' ').slice(0,5).join(' ')}</span>
                  <span className="font-mono text-[0.75rem] font-semibold flex-shrink-0" style={{color:'var(--accent)'}}>{fmt(item.price)}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* URL box */}
        <div className="px-6 py-4">
          <div className="text-[0.65rem] uppercase tracking-widest mb-2" style={{color:'var(--tx3)'}}>Odkaz na sestavu</div>
          <div className="flex gap-2">
            <div className="flex-1 px-3 py-2.5 rounded-xl text-[0.72rem] font-mono truncate border"
              style={{background:'var(--surface-2)', borderColor:'var(--glass-b)', color:'var(--tx2)'}}>
              {url}
            </div>
            <button onClick={copy}
              className="px-4 py-2.5 rounded-xl text-[0.82rem] font-semibold cursor-pointer border-none transition-all flex-shrink-0"
              style={{background: copied ? 'rgba(52,211,153,0.2)' : 'var(--accent)', color: copied ? 'var(--green)' : '#fff'}}>
              {copied ? '✓ Zkopírováno!' : '📋 Kopírovat'}
            </button>
          </div>

          {/* Native share na mobilu */}
          {navigator.share && (
            <button onClick={shareNative}
              className="w-full mt-2 py-2.5 rounded-xl text-[0.82rem] font-semibold cursor-pointer border transition-all"
              style={{background:'var(--surface-2)', borderColor:'var(--glass-b)', color:'var(--tx)'}}>
              📤 Sdílet přes systém
            </button>
          )}

          <div className="mt-3 text-[0.68rem] text-center" style={{color:'var(--tx3)'}}>
            Příjemce odkazu uvidí přesně stejnou sestavu — včetně vybraných e-shopů
          </div>
        </div>
      </div>
    </div>
  )
}
