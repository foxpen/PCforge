import { cats, fmt } from '../data/cats.js'

const PRESETS = [
  { id:'entry', badge:'Základ', badgeCls:'bg-green-500/15 text-green-400', name:'Kancelářský hrdina', desc:'Ideální na práci, web a lehčí hry.', build:{ cpu:'r5-5600', gpu:'rx6600', ram:'fury16', mb:'b550', ssd:'980pro', psu:'bequiet550', case:'h510', cool:'ak620' } },
  { id:'gaming', badge:'Gaming', badgeCls:'bg-accent/15', name:'Herní bestie', desc:'Plynulé hraní na 1080p/1440p.', build:{ cpu:'r5-5600', gpu:'rtx4070', ram:'fury16', mb:'b550', ssd:'980pro', psu:'bequiet550', case:'h510', cool:'ak620' } },
  { id:'beast', badge:'Pro', badgeCls:'bg-yellow-400/15 text-yellow-400', name:'No-compromise build', desc:'Maximální výkon pro 4K a streamování.', build:{ cpu:'r9-7950x', gpu:'rtx4090', ram:'fury16', mb:'x670', ssd:'980pro', psu:'bequiet750', case:'h510', cool:'ak620' } },
]

export default function Presets({ onLoad }) {
  return (
    <div className="relative z-10 px-[clamp(1.5rem,5vw,6rem)] pb-[clamp(2rem,4vh,4rem)]">
      <div className="grid gap-[clamp(0.85rem,1.5vw,1.75rem)]" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
        {PRESETS.map(p => {
          const total = Object.entries(p.build).reduce((acc,[k,id]) => {
            const item = cats[k]?.items.find(x => x.id === id)
            return acc + (item?.price || 0)
          }, 0)
          return (
            <div key={p.id} className="glass rounded-2xl flex flex-col gap-1.5 transition-all hover:-translate-y-0.5 cursor-pointer"
              style={{padding:'clamp(1.25rem,2vw,1.75rem)', borderColor:'var(--glass-b)'}}>
              <span className={`self-start text-[0.6rem] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${p.badgeCls}`}>
                {p.badge}
              </span>
              <div className="font-bold" style={{fontSize:'clamp(0.95rem,1.5vw,1.1rem)', color:'var(--tx)'}}>{p.name}</div>
              <div className="flex-1 text-[0.78rem]" style={{color:'var(--tx2)'}}>{p.desc}</div>
              <div className="text-[0.65rem] uppercase tracking-widest mt-2" style={{color:'var(--tx3)'}}>od</div>
              <div className="font-mono font-extrabold" style={{fontSize:'clamp(1.3rem,2vw,1.6rem)', color:'var(--accent)'}}>{fmt(total)}</div>
              <button
                onClick={() => onLoad(p.build)}
                className="w-full py-2.5 rounded-xl text-[0.82rem] font-semibold cursor-pointer transition-all hover:text-white"
                style={{background:'var(--accent-s)', border:'1px solid var(--accent-b)', color:'var(--accent)'}}
                onMouseEnter={e => e.target.style.background='var(--accent)'}
                onMouseLeave={e => e.target.style.background='var(--accent-s)'}
              >
                Načíst sestavu →
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
