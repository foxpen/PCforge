const SHOPS = ['Alza','CZC','Mironet','Mall','Datart','Okay','Tsbohemia','Gigacomputer','Softcom','Czechcomputer','Alzashop','Heureka']

export default function Footer() {
  return (
    <footer className="relative z-10 text-center border-t px-[clamp(1.5rem,5vw,6rem)] py-[clamp(3rem,6vh,5rem)]" style={{borderColor:'var(--glass-b)'}}>
      <div className="text-lg font-bold mb-4" style={{color:'var(--tx)'}}>PC<span style={{color:'var(--accent)'}}>Forge</span></div>
      <div className="flex flex-wrap justify-center gap-1.5 mb-4">
        {SHOPS.map(s => (
          <span key={s} className="glass rounded-md px-2 py-0.5 text-[0.65rem]" style={{color:'var(--tx2)'}}>{s}</span>
        ))}
      </div>
      <p className="text-[0.72rem] max-w-md mx-auto" style={{color:'var(--tx3)'}}>
        PCForge není obchod — slouží pouze k porovnání cen a konfiguraci sestav.
      </p>
    </footer>
  )
}
