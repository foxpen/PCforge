export default function Hero({ onStart }) {
  return (
    <>
      <section className="relative z-10 text-center px-[clamp(1.5rem,8vw,12rem)] pt-[clamp(80px,12vh,160px)] pb-[clamp(48px,6vh,80px)]">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs mb-7" style={{color:'var(--tx2)'}}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{background:'var(--green)'}} />
          Konfigurátor PC sestav pro CZ + SK trh
        </div>
        <h1 className="font-extrabold tracking-tight leading-[1.1] mb-6" style={{fontSize:'clamp(2.8rem,6vw,5.5rem)', color:'var(--tx)'}}>
          Postav si PC<br />
          <em className="not-italic bg-gradient-to-br from-[#818cf8] via-[#a78bfa] to-[#60a5fa] bg-clip-text text-transparent">
            přesně podle sebe
          </em>
        </h1>
        <p className="mx-auto mb-10 leading-relaxed" style={{fontSize:'clamp(1rem,1.5vw,1.2rem)', color:'var(--tx2)', maxWidth:'600px'}}>
          Porovnej ceny v 12+ e-shopech, zkontroluj kompatibilitu a zjisti, jestli to rozjedeš.
        </p>
        <button
          onClick={onStart}
          className="px-9 py-3.5 rounded-2xl font-semibold text-white cursor-pointer transition-all hover:opacity-90 hover:-translate-y-0.5"
          style={{background:'var(--accent)', boxShadow:'0 8px 30px rgba(129,140,248,0.3)'}}
        >
          Začít konfigurovat
        </button>
      </section>

      <div className="relative z-10 flex justify-center gap-[clamp(0.75rem,2vw,1.5rem)] flex-wrap px-[clamp(1.5rem,5vw,6rem)] pb-[clamp(2rem,4vh,3rem)]">
        {[['12+','e-shopů'],['59k+','komponent'],['CZ + SK','trhy'],['Live','ceny']].map(([v,l]) => (
          <div key={l} className="glass rounded-2xl flex flex-col items-center gap-0.5 px-[clamp(1rem,2.5vw,2rem)] py-[clamp(0.6rem,1.5vw,1rem)]">
            <strong className="font-mono font-bold" style={{fontSize:'clamp(0.95rem,1.5vw,1.2rem)', color:'var(--accent)'}}>{v}</strong>
            <span style={{fontSize:'0.65rem', color:'var(--tx3)'}}>{l}</span>
          </div>
        ))}
      </div>
    </>
  )
}
