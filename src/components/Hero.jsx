export default function Hero() {
  return (
    <>
      <section className="hero">
        <div className="hero-chip"><div className="chip-dot" />Ceny z 12+ CZ &amp; SK eshopů</div>
        <h1>Sestav svůj<br />počítač <em>chytře</em></h1>
        <p>Porovnáváme ceny z Alzy, CZC, Mironetu a dalších. Ušetříš tisíce bez zdlouhavého hledání.</p>
        <div className="hero-btns">
          <button className="btn-p" onClick={() => document.querySelector('.tabs-wrap')?.scrollIntoView({ behavior:'smooth' })}>
            Začít konfigurovat
          </button>
        </div>
      </section>
      <div className="stats">
        <div className="stat-pill"><strong>12+</strong><span>e-shopů</span></div>
        <div className="stat-pill"><strong>50k+</strong><span>komponent</span></div>
        <div className="stat-pill"><strong>CZ + SK</strong><span>trhy</span></div>
        <div className="stat-pill"><strong>Live</strong><span>ceny</span></div>
      </div>
    </>
  )
}
