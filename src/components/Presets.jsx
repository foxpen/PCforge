import { presets, fmt } from '../data/cats.js'

const tierClass = { e:'b-e', g:'b-g', b:'b-b' }

export default function Presets({ onLoad }) {
  return (
    <section className="presets">
      <div className="sec-label" style={{ marginBottom:'1.25rem' }}>Doporučené sestavy</div>
      <div className="pg">
        {presets.map((p, i) => (
          <div key={i} className="pc">
            <span className={`p-badge ${tierClass[p.tier]}`}>{p.label}</span>
            <div className="p-name">{p.name}</div>
            <div className="p-desc">{p.desc}</div>
            <div className="p-from">od</div>
            <div className="p-price">{p.price.toLocaleString('cs')} Kč</div>
            <button className="btn-preset" onClick={() => onLoad(p)}>Načíst sestavu →</button>
          </div>
        ))}
      </div>
    </section>
  )
}
