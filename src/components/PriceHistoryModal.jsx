import { useEffect, useRef } from 'react'
import { cats, fmt } from '../data/cats.js'

function generateHistory(basePrice) {
  const months = ['Srp','Zář','Říj','Lis','Pro','Led','Úno','Bře','Dub','Kvě','Čvn','Čvc']
  return months.map((m, i) => {
    const noise = (Math.random() - 0.5) * basePrice * 0.15
    const trend = i < 6 ? basePrice * 1.12 : basePrice * 1.04
    return { month: m, price: Math.round((trend + noise) / 10) * 10 }
  })
}

const SHOPS = ['Alza','CZC','Mironet','Mall','Datart']

export default function PriceHistoryModal({ onClose }) {
  const canvasRef = useRef(null)
  const exampleItem = cats.gpu.items[1]
  const history = generateHistory(exampleItem.price)
  const min = Math.min(...history.map(h => h.price))
  const max = Math.max(...history.map(h => h.price))
  const current = exampleItem.price

  useEffect(() => { drawChart() }, [])

  function getVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  }

  function drawChart() {
    const canvas = canvasRef.current; if (!canvas) return
    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    const ctx = canvas.getContext('2d')
    ctx.scale(2, 2)
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight
    const pad = { t:20, r:20, b:36, l:60 }
    const cW = w - pad.l - pad.r
    const cH = h - pad.t - pad.b
    const pMin = min * 0.92
    const pMax = max * 1.05

    const accent  = getVar('--accent')
    const tx3     = getVar('--tx3')
    const surface2 = getVar('--surface-2')

    ctx.clearRect(0, 0, w, h)

    // Grid
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + (cH / 4) * i
      const val = pMax - ((pMax - pMin) / 4) * i
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + cW, y)
      ctx.strokeStyle = 'rgba(128,128,128,0.15)'; ctx.lineWidth = 1; ctx.stroke()
      ctx.fillStyle = tx3; ctx.font = '11px JetBrains Mono,monospace'; ctx.textAlign = 'right'
      ctx.fillText(Math.round(val / 100) * 100 + ' Kč', pad.l - 8, y + 4)
    }

    // X labels
    ctx.fillStyle = tx3; ctx.font = '11px Inter,sans-serif'; ctx.textAlign = 'center'
    history.forEach((d, i) => {
      ctx.fillText(d.month, pad.l + (i / (history.length - 1)) * cW, h - 8)
    })

    // Points
    const pts = history.map((d, i) => ({
      x: pad.l + (i / (history.length - 1)) * cW,
      y: pad.t + cH - ((d.price - pMin) / (pMax - pMin)) * cH,
    }))

    // Gradient fill
    const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + cH)
    grad.addColorStop(0, accent + '55')
    grad.addColorStop(1, accent + '05')
    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y)
    pts.forEach((p, i) => { if(i>0) ctx.lineTo(p.x, p.y) })
    ctx.lineTo(pts[pts.length-1].x, pad.t+cH); ctx.lineTo(pts[0].x, pad.t+cH)
    ctx.closePath(); ctx.fillStyle = grad; ctx.fill()

    // Line
    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y)
    pts.forEach((p, i) => { if(i>0) ctx.lineTo(p.x, p.y) })
    ctx.strokeStyle = accent; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke()

    // Dots
    pts.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2); ctx.fillStyle = accent; ctx.fill()
      ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI*2); ctx.fillStyle = '#fff'; ctx.fill()
    })

    // Current price dashed line
    const cy = pad.t + cH - ((current - pMin) / (pMax - pMin)) * cH
    ctx.beginPath(); ctx.setLineDash([6,4]); ctx.moveTo(pad.l, cy); ctx.lineTo(pad.l+cW, cy)
    ctx.strokeStyle = '#34d399'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([])
  }

  const shopPrices = SHOPS.map(s => ({
    shop: s,
    price: Math.round((current * (0.92 + Math.random() * 0.18)) / 10) * 10,
  })).sort((a, b) => a.price - b.price)

  const savings = shopPrices[shopPrices.length-1].price - shopPrices[0].price

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{background:'rgba(0,0,0,0.5)',backdropFilter:'blur(8px)'}}
      onClick={onClose}>
      <div className="relative w-full max-w-2xl rounded-3xl overflow-hidden"
        style={{background:'var(--surface)',border:'1px solid var(--accent-b)',maxHeight:'90vh',overflowY:'auto'}}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b" style={{borderColor:'var(--glass-b)'}}>
          <div>
            <div className="text-[0.65rem] uppercase tracking-widest mb-1" style={{color:'var(--accent)'}}>📈 Vývoj ceny</div>
            <div className="font-bold text-lg" style={{color:'var(--tx)'}}>{exampleItem.name}</div>
            <div className="text-[0.75rem] font-mono mt-0.5" style={{color:'var(--tx3)'}}>{exampleItem.specs}</div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-pointer border-none ml-4 flex-shrink-0"
            style={{background:'var(--close-btn)',color:'var(--close-tx)'}}>✕</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 p-6 pb-0">
          {[
            {label:'Aktuální cena', value:fmt(current),  color:'var(--accent)'},
            {label:'Min. za rok',   value:fmt(min),       color:'var(--green)'},
            {label:'Max. za rok',   value:fmt(max),       color:'#f87171'},
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4 text-center" style={{background:'var(--surface-2)'}}>
              <div className="font-mono font-bold text-lg" style={{color:s.color}}>{s.value}</div>
              <div className="text-[0.65rem] mt-1" style={{color:'var(--tx3)'}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="px-6 pt-4">
          <div className="text-[0.65rem] uppercase tracking-widest mb-3" style={{color:'var(--tx3)'}}>
            Posledních 12 měsíců · <span style={{color:'var(--green)'}}>— aktuální cena</span>
          </div>
          <canvas ref={canvasRef} className="w-full rounded-xl" style={{height:'180px',display:'block'}} />
        </div>

        {/* Shop comparison */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[0.65rem] uppercase tracking-widest" style={{color:'var(--tx3)'}}>Porovnání e-shopů</div>
            <div className="text-[0.7rem] font-semibold" style={{color:'var(--green)'}}>Ušetříš až {fmt(savings)}</div>
          </div>
          <div className="flex flex-col gap-2">
            {shopPrices.map((s, i) => {
              const pct = ((s.price - shopPrices[0].price) / (shopPrices[shopPrices.length-1].price - shopPrices[0].price + 1)) * 100
              return (
                <div key={s.shop} className="flex items-center gap-3 rounded-xl px-4 py-2.5"
                  style={{background:i===0?'rgba(52,211,153,0.08)':'var(--surface-2)',border:`1px solid ${i===0?'rgba(52,211,153,0.25)':'transparent'}`}}>
                  {i===0 && <span className="text-[0.6rem] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md flex-shrink-0" style={{background:'rgba(52,211,153,0.15)',color:'var(--green)'}}>Nejlepší</span>}
                  <span className="flex-1 text-[0.82rem] font-medium" style={{color:'var(--tx)'}}>{s.shop}</span>
                  <div className="flex-1 mx-2">
                    <div className="h-1 rounded-full overflow-hidden" style={{background:'var(--surface-3)'}}>
                      <div className="h-full rounded-full" style={{width:`${Math.max(5,pct)}%`,background:i===0?'var(--green)':'var(--accent)'}} />
                    </div>
                  </div>
                  <span className="font-mono font-bold text-[0.85rem]" style={{color:i===0?'var(--green)':'var(--tx)'}}>{fmt(s.price)}</span>
                </div>
              )
            })}
          </div>
          <div className="mt-4 text-[0.65rem] text-center" style={{color:'var(--tx3)'}}>
            ⚠️ Data jsou ilustrativní — live ceny budou dostupné po napojení na API
          </div>
        </div>
      </div>
    </div>
  )
}
