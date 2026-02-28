import { shopsList } from '../data/cats.js'

export default function Footer() {
  return (
    <footer>
      <div className="f-logo">PC<span>Forge</span></div>
      <div className="f-shops">
        {shopsList.map(s => <span key={s} className="f-shop">{s}</span>)}
      </div>
      <div className="f-note">
        PCForge porovnává ceny z veřejně dostupných e-shopů. Ceny jsou orientační a aktualizují se každé 2 hodiny.
      </div>
    </footer>
  )
}
