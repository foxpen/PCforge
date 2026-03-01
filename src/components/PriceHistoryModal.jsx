import { useEffect, useRef } from 'react'
import { cats, fmt } from '../data/cats.js'

// Generuje mock historická data pro komponentu
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

  // Náhodně vybraná komponenta pro ukázku
  const exampleCat = cats.gpu
  const exampleItem = exampleCat.items[1]
  const history = generateHistory(exampleItem.price)

  const min = Math.min(...history.map(h => h.price))
  const max = Math.max(...history.map(h => h.price))
  const current = exampleItem.price

  useEffect(() => {
    drawChart()
  }, [])

  function drawChart() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width = canvas.offsetWidth * 2
    const H = canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2)
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight
    const pad = { t: 20, r: 20, b: 36, l: 60 }
    const chartW = w - pad.l - pad.r
    const chartH = h - pad.t - pad.b
    const priceMin = min * 0.92
    const priceMax = max * 1.05

    ctx.clearRect(0, 0, w, h)

    // Grid lines
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + (chartH / 4) * i
      const val = priceMax - ((priceMax - priceMin) / 4) * i
      ctx.beginPath()
      ctx.moveTo(pad.l, y)
      ctx.lineTo(pad.l + chartW, y)
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.font = '11px JetBrains Mono, monospace'
      ctx.textAlign = 'right'
      ctx.fillText(Math.round(val / 100) * 100 + ' Kč', pad.l - 8, y + 4)
    }

    // X labels
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.font = '11px Inter, sans-serif'
    ctx.textAlign = 'center'
    history.forEach((d, i) => {
      const x = pad.l + (i / (history.length - 1)) * chartW
      ctx.fillText(d.month, x, h - 8)
    })

    // Gradient fill
    const points = history.map((d, i) => ({
      x: pad.l + (i / (history.length - 1)) * chartW,
      y: pad.t + chartH - ((d.price - priceMin) / (priceMax - priceMin)) * chartH,
    }))
    const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + chartH)
    grad.addColorStop(0, 'rgba(129,140,248,0.3)')
    grad.addColorStop(1, 'rgba(129,140,248,0.01)')
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    points.forEach((p, i) => { if (i > 0) ctx.lineTo(p.x, p.y) })
    ctx.lineTo(points[points.length - 1].x, pad.t + chartH)
    ctx.lineTo(points[0].x, pad.t + chartH)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()

    // Line
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    points.forEach((p, i) => { if (i > 0) ctx.lineTo(p.x, p.y) })
    ctx.strokeStyle = '#818cf8'
    ctx.lineWidth = 2.5
    ctx.lineJoin = 'round'
    ctx.stroke()

    // Dots
    points.forEach((p, i) => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#818cf8'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
      ctx.fillStyle = '#fff'
      ctx.fill()
    })

    // Current price line
    const currentY = pad.t + chartH - ((current - priceMin) / (priceMax - priceMin)) * chartH
    ctx.beginPath()
    ctx.setLineDash([6, 4])
    ctx.moveTo(pad.l, currentY)
    ctx.lineTo(pad.l + chartW, currentY)
    ctx.strokeStyle = '#34d399'
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.setLineDash([])
  }

  // Mock shop prices
  const shopPrices = SHOPS.map(s => ({
    shop: s,
    price: Math.round((current * (0.92 + Math.random() * 0.18)) / 10) * 10,
  })).sort((a, b) => a.price - b.price)

  const savings = shopPrices[shopPrices.length - 1].price - shopPrices[0].price

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)'}}
      onClick={onClose}>
      <div className="relative w-full max-w-2xl rounded-3xl overflow-hidden"
        style={{background:'rgba(13,13,26,0.98)', border:'1px solid rgba(129,140,248,0.3)', maxHeight:'90vh', overflowY:'auto'}}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b" style={{borderColor:'rgba(255,255,255,0.08)'}}>
          <div>
            <div className="text-[0.65rem] uppercase tracking-widest mb-1" style={{color:'rgba(129,140,248,1)'}}>📈 Vývoj ceny</div>
            <div className="font-bold text-lg" style={{color:'rgba(255,255,255,0.92)'}}>{exampleItem.name}</div>
            <div className="text-[0.75rem] font-mono mt-0.5" style={{color:'rgba(255,255,255,0.4)'}}>{exampleItem.specs}</div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-pointer border-none ml-4 flex-shrink-0"
            style={{background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.5)'}}>✕</button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 p-6 pb-0">
          {[
            { label: 'Aktuální cena', value: fmt(current), color: '#818cf8' },
            { label: 'Min. za rok', value: fmt(min), color: '#34d399' },
            { label: 'Max. za rok', value: fmt(max), color: '#f87171' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4 text-center" style={{background:'rgba(255,255,255,0.04)'}}>
              <div className="font-mono font-bold text-lg" style={{color:s.color}}>{s.value}</div>
              <div className="text-[0.65rem] mt-1" style={{color:'rgba(255,255,255,0.35)'}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="px-6 pt-4">
          <div className="text-[0.65rem] uppercase tracking-widest mb-3" style={{color:'rgba(255,255,255,0.3)'}}>
            Posledních 12 měsíců · <span style={{color:'#34d399'}}>— aktuální cena</span>
          </div>
          <canvas ref={canvasRef} className="w-full rounded-xl" style={{height:'180px', display:'block'}} />
        </div>

        {/* Shop comparison */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[0.65rem] uppercase tracking-widest" style={{color:'rgba(255,255,255,0.3)'}}>Porovnání e-shopů</div>
            <div className="text-[0.7rem] font-semibold" style={{color:'#34d399'}}>Ušetříš až {fmt(savings)}</div>
          </div>
          <div className="flex flex-col gap-2">
            {shopPrices.map((s, i) => {
              const pct = ((s.price - shopPrices[0].price) / (shopPrices[shopPrices.length-1].price - shopPrices[0].price + 1)) * 100
              return (
                <div key={s.shop} className="flex items-center gap-3 rounded-xl px-4 py-2.5"
                  style={{background: i===0 ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.03)', border:`1px solid ${i===0 ? 'rgba(52,211,153,0.25)' : 'transparent'}`}}>
                  {i === 0 && <span className="text-[0.6rem] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md flex-shrink-0" style={{background:'rgba(52,211,153,0.15)', color:'#34d399'}}>Nejlepší</span>}
                  <span className="flex-1 text-[0.82rem] font-medium" style={{color:'rgba(255,255,255,0.75)'}}>{s.shop}</span>
                  <div className="flex-1 mx-2">
                    <div className="h-1 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.08)'}}>
                      <div className="h-full rounded-full" style={{width:`${Math.max(5,pct)}%`, background: i===0 ? '#34d399' : '#818cf8'}} />
                    </div>
                  </div>
                  <span className="font-mono font-bold text-[0.85rem]" style={{color: i===0 ? '#34d399' : 'rgba(255,255,255,0.75)'}}>{fmt(s.price)}</span>
                </div>
              )
            })}
          </div>
          <div className="mt-4 text-[0.65rem] text-center" style={{color:'rgba(255,255,255,0.2)'}}>
            ⚠️ Data jsou ilustrativní — live ceny budou dostupné po napojení na API
          </div>
        </div>
      </div>
    </div>
  )
}
