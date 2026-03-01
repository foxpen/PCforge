import { useState } from 'react'

export default function Onboarding({ onChoose }) {
  const [hovered, setHovered] = useState(null)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{background:'linear-gradient(135deg, var(--bg-from), var(--bg-to))', padding:'2rem'}}>
      <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />

      {/* Logo */}
      <div className="relative z-10 text-center">
        <div className="font-extrabold tracking-tight mb-2" style={{fontSize:'clamp(1.4rem,2.5vw,1.8rem)', color:'var(--tx)'}}>
          PC<span style={{color:'var(--accent)'}}>Forge</span>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs mb-12" style={{color:'var(--tx2)'}}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{background:'var(--green)'}} />
          Konfigurátor PC sestav pro CZ + SK trh
        </div>

        <h1 className="font-extrabold tracking-tight leading-[1.1] mb-3" style={{fontSize:'clamp(1.8rem,4.5vw,3.2rem)', color:'var(--tx)'}}>
          Jak chceš stavět<br/>svůj počítač?
        </h1>
        <p className="mx-auto mb-12 leading-relaxed" style={{fontSize:'0.95rem', color:'var(--tx2)', maxWidth:'460px'}}>
          Vyber si styl, který ti sedí. Můžeš přepnout kdykoliv.
        </p>
      </div>

      {/* Cards */}
      <div className="relative z-10 flex gap-6 flex-wrap justify-center" style={{maxWidth:'780px'}}>

        {/* EZ Mode */}
        <button
          onClick={() => onChoose('ez')}
          onMouseEnter={() => setHovered('ez')}
          onMouseLeave={() => setHovered(null)}
          className="text-left border-none cursor-pointer transition-all"
          style={{
            width:'clamp(300px,40vw,360px)', padding:0, borderRadius:20, overflow:'hidden',
            background: hovered==='ez' ? 'var(--accent2-s)' : 'var(--glass)',
            border: `2px solid ${hovered==='ez' ? 'var(--accent2-b)' : 'var(--glass-b)'}`,
            transform: hovered==='ez' ? 'translateY(-4px)' : 'none',
            boxShadow: hovered==='ez' ? '0 12px 40px var(--accent2-glow)' : 'none',
          }}
        >
          <div className="flex items-center justify-center relative" style={{
            height:170,
            background: 'linear-gradient(135deg, var(--accent2-s), transparent)',
          }}>
            <span className="absolute top-3 right-3 text-[0.6rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg"
              style={{background:'var(--accent2-s)', color:'var(--accent2)', border:'1px solid var(--accent2-b)'}}>
              Doporučeno
            </span>
            <div className="flex flex-col items-center gap-2">
              <span style={{fontSize:48}}>🧩</span>
              <div className="flex gap-1.5">
                {['🧠','🎮','💾','⚡'].map((e,i) => (
                  <span key={i} className="text-sm px-1.5 py-0.5 rounded-md" style={{background:'var(--accent2-s)'}}>{e}</span>
                ))}
              </div>
              <span className="text-[0.65rem] font-semibold" style={{color:'var(--accent2)', opacity:0.6}}>DRAG & DROP</span>
            </div>
          </div>
          <div style={{padding:'20px 24px 24px'}}>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold" style={{fontSize:'1.15rem', color:'var(--accent2)'}}>EZ Mode</span>
            </div>
            <p className="text-[0.82rem] leading-relaxed m-0" style={{color:'var(--tx2)'}}>
              Stavěj jako <strong style={{color:'var(--tx)'}}>LEGO</strong>. Přetahuj komponenty přímo do počítače.
              Vizuální, intuitivní, zábavný. Ideální pokud stavíš poprvé.
            </p>
            <div className="flex gap-2 mt-3 flex-wrap">
              {['Drag & Drop','Vizuální','Průvodce'].map(t => (
                <span key={t} className="text-[0.65rem] px-2.5 py-1 rounded-lg font-semibold"
                  style={{background:'var(--accent2-s)', color:'var(--accent2)'}}>{t}</span>
              ))}
            </div>
          </div>
        </button>

        {/* Advanced Mode */}
        <button
          onClick={() => onChoose('advanced')}
          onMouseEnter={() => setHovered('adv')}
          onMouseLeave={() => setHovered(null)}
          className="text-left border-none cursor-pointer transition-all"
          style={{
            width:'clamp(300px,40vw,360px)', padding:0, borderRadius:20, overflow:'hidden',
            background: hovered==='adv' ? 'var(--accent-s)' : 'var(--glass)',
            border: `2px solid ${hovered==='adv' ? 'var(--accent-b)' : 'var(--glass-b)'}`,
            transform: hovered==='adv' ? 'translateY(-4px)' : 'none',
            boxShadow: hovered==='adv' ? '0 12px 40px rgba(129,140,248,0.15)' : 'none',
          }}
        >
          <div className="flex items-center justify-center" style={{
            height:170,
            background: 'linear-gradient(135deg, var(--accent-s), transparent)',
          }}>
            <div style={{width:160}}>
              {[['🧠 CPU','3 490'],['🎮 GPU','15 990'],['💾 RAM','2 290'],['⚡ PSU','4 990']].map(([l,p],i) => (
                <div key={i} className="flex justify-between py-1.5 text-[0.65rem]" style={{borderBottom:'1px solid var(--glass-b)'}}>
                  <span style={{color:'var(--tx3)'}}>{l}</span>
                  <span className="font-mono" style={{color:'var(--accent)'}}>{p} Kč</span>
                </div>
              ))}
              <div className="text-right font-mono font-bold py-1.5 text-[0.72rem]" style={{color:'var(--accent)'}}>42 180 Kč</div>
            </div>
          </div>
          <div style={{padding:'20px 24px 24px'}}>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold" style={{fontSize:'1.15rem', color:'var(--accent)'}}>Advanced Mode</span>
            </div>
            <p className="text-[0.82rem] leading-relaxed m-0" style={{color:'var(--tx2)'}}>
              Klasický konfigurátor s <strong style={{color:'var(--tx)'}}>plnou kontrolou</strong>.
              Porovnávej ceny, filtry, detailní specifikace. Pro zkušené stavitele.
            </p>
            <div className="flex gap-2 mt-3 flex-wrap">
              {['Porovnání cen','Filtry','Detailní specs'].map(t => (
                <span key={t} className="text-[0.65rem] px-2.5 py-1 rounded-lg font-semibold"
                  style={{background:'var(--accent-s)', color:'var(--accent)'}}>{t}</span>
              ))}
            </div>
          </div>
        </button>
      </div>

      <p className="relative z-10 mt-8 text-[0.75rem]" style={{color:'var(--tx3)'}}>
        Můžeš přepnout režim kdykoliv v průběhu konfigurace
      </p>
    </div>
  )
}
