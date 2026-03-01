import { useState, useMemo } from 'react'
import { cats, fmt, shopUrls } from '../data/cats.js'
import { games } from '../data/games.js'

const SLOT_ORDER = ['case','mb','cpu','cool','gpu','ram','ssd','psu']
const SLOT_META = {
  case: { icon:'🖥️', label:'Skříň',         desc:'Drží vše pohromadě',
    tooltip:'Domek pro tvoje komponenty. Chrání je před prachem, kočkami a zvědavými prsty. Čím větší, tím víc se tam vejde – a tím víc RGB můžeš nacpat.' },
  mb:   { icon:'🔌', label:'Základní deska', desc:'Propojuje komponenty',
    tooltip:'Nervový systém počítače. Všechno se zapojuje sem – CPU, RAM, GPU, disky. Když vybereš špatnou, nic ti nepasuje. Jako LEGO, ale dražší.' },
  cpu:  { icon:'🧠', label:'Procesor',       desc:'Mozek počítače',
    tooltip:'Mozek celé operace. Čím víc jader, tím víc věcí najednou – jako kdyby tvůj mozek měl 16 rukou. AMD nebo Intel? Věčná válka.' },
  cool: { icon:'❄️', label:'Chlazení',       desc:'Chladí procesor',
    tooltip:'Procesor se zahřívá jako plotýnka. Tohle ho udržuje v klidu. Vzduch nebo voda? Vzduch = spolehlivé a tiché. Voda = cool faktor (doslova).' },
  gpu:  { icon:'🎮', label:'Grafická karta', desc:'Vykresluje grafiku',
    tooltip:'Kreslí všechno co vidíš na monitoru. Bez ní by Cyberpunk vypadal jako PowerPoint prezentace. Nejdražší díl sestavy – a taky nejdůležitější pro gaming.' },
  ram:  { icon:'💾', label:'RAM',            desc:'Krátkodobá paměť',
    tooltip:'Krátkodobá paměť počítače. Čím víc, tím víc tabů v Chrome můžeš mít otevřených. 16 GB = základ, 32 GB = klid na duši.' },
  ssd:  { icon:'💿', label:'Úložiště',       desc:'Ukládá data',
    tooltip:'Tady bydlí tvoje hry, fotky a 47 GB updatů. NVMe SSD = sekundy bootování. Starý HDD? To je jako jezdit na kole po dálnici.' },
  psu:  { icon:'⚡', label:'Zdroj',          desc:'Dodává energii',
    tooltip:'Srdce počítače – pumpuje elektřinu do všeho. Nešetři na zdroji! Levný zdroj = odpálená základovka. 80+ Gold certifikace = tvůj nejlepší kamarád.' },
}
const TIER_COLORS = { budget:'var(--green)', mid:'var(--accent)', high:'var(--accent2)' }
const TIER_LABELS = { budget:'Budget', mid:'Střední', high:'High-end' }

/* Vtipné + poučné tipy pro jednotlivé komponenty */
const ITEM_TIPS = {
  // CPU
  'r5-5600':   'Nejlepší poměr cena/výkon. Zvládne všechno co běžný smrtelník potřebuje.',
  'r7-7700':   'Osmijádro na novém AM5. Budoucnost bez starostí.',
  'i5-13600k': 'Hybridní šelma – 6 výkonných + 8 úsporných jader. Intel se rozjel.',
  'r9-7950x':  'Zbytečný pro gaming, nezbytný pro ego. A taky pro 3D rendering.',
  // GPU
  'rx6600':    'Solidní 1080p gaming za rozumné peníze. Na Fortňák bohatě stačí.',
  'rtx4060':   'DLSS 3 dělá zázraky. 1080p Ultra bez problémů.',
  'rtx4070':   '1440p sweet spot. Ray tracing konečně funguje plynule.',
  'rtx4090':   'Overkill? Jasně. Chceš ji? Taky jasně. 4K ultra ve všem.',
  // RAM
  'ram16':     '16 GB stačí na gaming. Chrome bude mít jiný názor.',
  'ram32':     '32 GB = zlatý standard 2024. Klidný spánek.',
  'ram32ddr5': 'DDR5 je budoucnost. Vyšší frekvence, nižší latence časem.',
  // MB
  'b550':      'Spolehlivá klasika pro AM4. Žádné experimenty, žádné problémy.',
  'b650':      'AM5 s WiFi 6E. Připravenost na další generaci CPU.',
  'z790':      'High-end Intel deska. PCIe 5.0, DDR5 a všechny vychytávky.',
  // SSD
  'ssd500':    'SATA SSD – pomalejší ale levný. Na systém stačí.',
  'nvme1t':    'NVMe raketa. Hry se načítají než stihneš mrknout.',
  'nvme2t':    '2 TB NVMe. Všechny hry + všechny projekty a stále místo.',
  // PSU
  'psu550':    '550W pro skromné sestavy. Nekrmí bestie ale spolehlivý.',
  'psu750':    '80+ Gold, tichý, spolehlivý. Zlatý standard pro gaming PC.',
  'psu1000':   'Platinum efektivita. Pro RTX 4090 a podobné elektrožrouty.',
  // Case
  'h510':      'Kompaktní, čistý design. Cable management snadno.',
  'o11':       'Legendární vitrina. Ukážeš všechno co máš uvnitř.',
  'mesh2':     'Nejlepší airflow v branži. Tvoje komponenty budou dýchat.',
  // Cooling
  'box':       'Přibalený v krabici s CPU. Zdarma, funguje, ale sotva.',
  'ak620':     'Tower chladič za pakatel. Tiší než AIO a chladí skoro stejně.',
  'kraken':    'AIO vodní chlazení. Vypadá sexy, chladí parádně, trochu dražší.',
}

function getTier(item) {
  const c = cats
  for (const [k, cat] of Object.entries(c)) {
    const found = cat.items.find(x => x.id === item.id)
    if (found) {
      const idx = cat.items.indexOf(found)
      if (idx === 0) return 'budget'
      if (idx >= cat.items.length - 1) return 'high'
      return 'mid'
    }
  }
  return 'mid'
}

/* ═══ PC CUTAWAY SVG ═══ */
function PCCutaway({ sel, activeCat, nextSlot, onSlotClick }) {
  const hasCase = !!sel.case
  const filledCount = Object.keys(sel).filter(k => SLOT_ORDER.includes(k)).length

  const SlotZone = ({ slotKey, x, y, w, h, children, emptyIcon }) => {
    const filled = !!sel[slotKey]
    const isNext = nextSlot === slotKey
    const isActive = activeCat === slotKey
    return (
      <g style={{cursor:'pointer'}} onClick={() => onSlotClick(slotKey)}>
        {filled ? children : (
          <g>
            <rect x={x} y={y} width={w} height={h} rx={4}
              fill={isActive ? 'rgba(245,158,11,0.05)' : 'rgba(255,255,255,0.015)'}
              stroke={isNext ? 'var(--accent2)' : isActive ? 'var(--accent2)' : 'rgba(255,255,255,0.06)'}
              strokeWidth={isNext ? 2 : isActive ? 1.5 : 1}
              strokeDasharray={isNext ? '8 4' : '4 4'}
              opacity={isNext || isActive ? 1 : 0.5}
            >
              {isNext && <animate attributeName="strokeOpacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/>}
            </rect>
            <text x={x+w/2} y={y+h/2+2} textAnchor="middle" fill={isNext ? 'var(--accent2)' : 'rgba(255,255,255,0.12)'} fontSize="14">{emptyIcon}</text>
            <text x={x+w/2} y={y+h/2+16} textAnchor="middle" fill={isNext ? 'var(--accent2)' : 'rgba(255,255,255,0.08)'} fontSize="8" fontWeight="500">
              {SLOT_META[slotKey]?.label}
            </text>
          </g>
        )}
      </g>
    )
  }

  return (
    <svg viewBox="0 0 480 560" style={{width:'100%',maxWidth:500,display:'block',margin:'0 auto',filter:'drop-shadow(0 16px 48px rgba(0,0,0,0.4))'}}>
      <defs>
        <linearGradient id="metalDark" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2a2a35"/><stop offset="100%" stopColor="#16161e"/></linearGradient>
        <linearGradient id="mbBoard" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0%" stopColor="#1a2418"/><stop offset="100%" stopColor="#101810"/></linearGradient>
        <linearGradient id="gpuBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2d2d3a"/><stop offset="100%" stopColor="#1c1c28"/></linearGradient>
        <linearGradient id="amberGlow" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2"/><stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/></linearGradient>
        <filter id="softGlow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>

      {/* CASE SHELL */}
      <g opacity={hasCase ? 1 : 0.2} style={{transition:'opacity 0.5s'}}>
        <rect x="40" y="20" width="400" height="520" rx="12" fill="url(#metalDark)" stroke="#3a3a48" strokeWidth="2"/>
        <rect x="40" y="20" width="400" height="8" rx="4" fill="#32323e" opacity="0.5"/>
        <rect x="70" y="540" width="40" height="8" rx="4" fill="#0e0e16"/>
        <rect x="370" y="540" width="40" height="8" rx="4" fill="#0e0e16"/>
        <rect x="50" y="30" width="380" height="45" rx="6" fill="#141420" opacity="0.4"/>
        <circle cx="240" cy="52" r="7" fill="#1a1a24" stroke="#3a3a48" strokeWidth="1.5"/>
        <circle cx="240" cy="52" r="3" fill={filledCount>=8?'#34d399':'#f59e0b'} opacity={filledCount>0?0.7:0.2}>
          {filledCount>0 && <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3s" repeatCount="indefinite"/>}
        </circle>
        <line x1="50" y1="410" x2="430" y2="410" stroke="#2e2e3a" strokeWidth="2"/>
      </g>
      <rect x="40" y="20" width="400" height="520" rx="12" fill="transparent" style={{cursor:'pointer'}} onClick={() => onSlotClick('case')}/>
      {hasCase && <text x="240" y="550" textAnchor="middle" fill="var(--accent2)" fontSize="9" fontFamily="monospace" opacity="0.4">{sel.case && cats.case.items.find(x=>x.id===sel.case)?.name}</text>}

      {/* Ambient glow */}
      {filledCount > 0 && <rect x="50" y="80" width="380" height="325" fill="url(#amberGlow)" opacity={0.1+filledCount*0.03} rx="6"/>}

      {/* MOTHERBOARD */}
      <SlotZone slotKey="mb" x={70} y={90} w={280} h={310} emptyIcon="🔌">
        <g>
          <rect x="70" y="90" width="280" height="310" rx="4" fill="url(#mbBoard)" stroke="#2a3a28" strokeWidth="1.5"/>
          {Array.from({length:10}).map((_,i)=><line key={i} x1={90+i*26} y1="95" x2={90+i*26} y2="395" stroke="#1e2e1c" strokeWidth="0.5" opacity="0.3"/>)}
          <rect x="75" y="95" width="16" height="75" rx="3" fill="#2a2a3c" stroke="#3a3a4c" strokeWidth="0.8"/>
          <rect x="98" y="95" width="180" height="12" rx="3" fill="#2a2a3c" stroke="#3a3a4c" strokeWidth="0.8"/>
          <rect x="160" y="300" width="55" height="45" rx="3" fill="#28283a" stroke="#3a3a4c" strokeWidth="1"/>
          <text x="80" y="390" fill="#2a4a28" fontSize="6.5" fontFamily="monospace" opacity="0.4">{sel.mb && cats.mb.items.find(x=>x.id===sel.mb)?.name}</text>
        </g>
      </SlotZone>

      {/* CPU */}
      <SlotZone slotKey="cpu" x={150} y={140} w={70} h={70} emptyIcon="🧠">
        <g>
          <rect x="150" y="140" width="70" height="70" rx="4" fill="#1e1e28" stroke="#4a4a5c" strokeWidth="1.5"/>
          <rect x="160" y="150" width="50" height="50" rx="2" fill="#2a2838" stroke="#5a5a6c" strokeWidth="1"/>
          <rect x="170" y="160" width="30" height="30" rx="1" fill="#34324a" opacity="0.5"/>
          <rect x="155" y="145" width="60" height="60" rx="3" fill="none" stroke="var(--accent2)" strokeWidth="0.5" opacity="0.25" filter="url(#softGlow)"/>
          <text x="185" y="208" textAnchor="middle" fill="var(--accent2)" fontSize="6.5" fontFamily="monospace" opacity="0.6">{sel.cpu && cats.cpu.items.find(x=>x.id===sel.cpu)?.name.split(' ').slice(-1)}</text>
        </g>
      </SlotZone>

      {/* COOLER */}
      <SlotZone slotKey="cool" x={155} y={98} w={60} h={42} emptyIcon="❄️">
        <g>
          <rect x="155" y="98" width="60" height="42" rx="3" fill="#26263a" stroke="#3a3a4c" strokeWidth="1"/>
          {Array.from({length:5}).map((_,i)=><rect key={i} x="158" y={101+i*7.5} width="54" height="4.5" rx="0.5" fill="#2e2e44" opacity="0.5"/>)}
          <circle cx="172" cy="138" r="2.5" fill="#b87333" opacity="0.4"/>
          <circle cx="185" cy="138" r="2.5" fill="#b87333" opacity="0.4"/>
          <circle cx="198" cy="138" r="2.5" fill="#b87333" opacity="0.4"/>
          <text x="185" y="94" textAnchor="middle" fill="var(--accent2)" fontSize="6" fontFamily="monospace" opacity="0.4">{sel.cool && cats.cool.items.find(x=>x.id===sel.cool)?.name.split(' ').slice(0,2).join(' ')}</text>
        </g>
      </SlotZone>

      {/* RAM */}
      <SlotZone slotKey="ram" x={248} y={118} w={36} h={85} emptyIcon="💾">
        <g>
          {[0,1].map(i=>(
            <g key={i}>
              <rect x={250+i*17} y="118" width="12" height="85" rx="2" fill="#1c2a1a" stroke="#2a3a28" strokeWidth="1"/>
              {Array.from({length:4}).map((_,j)=><rect key={j} x={252+i*17} y={128+j*18} width="8" height="12" rx="1" fill="#141e14" stroke="#1e2e1c" strokeWidth="0.5"/>)}
              <rect x={250+i*17} y="118" width="12" height="3" rx="1" fill="var(--accent2)" opacity={0.15+i*0.1}>
                <animate attributeName="opacity" values={`${0.1+i*0.08};${0.3+i*0.1};${0.1+i*0.08}`} dur={`${2+i*0.5}s`} repeatCount="indefinite"/>
              </rect>
            </g>
          ))}
        </g>
      </SlotZone>

      {/* GPU */}
      <SlotZone slotKey="gpu" x={80} y={255} w={260} h={55} emptyIcon="🎮">
        <g>
          <rect x="80" y="255" width="260" height="55" rx="5" fill="url(#gpuBody)" stroke="#3a3a4c" strokeWidth="1.5"/>
          <rect x="80" y="255" width="260" height="5" rx="2" fill="#32323e" opacity="0.4"/>
          {[0,1,2].map(i=>(
            <g key={i}><circle cx={130+i*75} cy="282" r="20" fill="#1a1a28" stroke="#2e2e3e" strokeWidth="0.8"/><circle cx={130+i*75} cy="282" r="4" fill="#1e1e2c"/></g>
          ))}
          <rect x="85" y="306" width="250" height="2" rx="1" fill="var(--accent2)" opacity="0.15" filter="url(#softGlow)">
            <animate attributeName="opacity" values="0.08;0.22;0.08" dur="4s" repeatCount="indefinite"/>
          </rect>
          <text x="210" y="250" textAnchor="middle" fill="var(--accent2)" fontSize="7.5" fontFamily="monospace" opacity="0.45">{sel.gpu && cats.gpu.items.find(x=>x.id===sel.gpu)?.name}</text>
        </g>
      </SlotZone>

      {/* SSD */}
      <SlotZone slotKey="ssd" x={100} y={228} w={60} h={16} emptyIcon="💿">
        <g>
          <rect x="100" y="228" width="60" height="16" rx="2" fill="#1c1c2c" stroke="#2e2e40" strokeWidth="1"/>
          <rect x="105" y="231" width="11" height="9" rx="1" fill="#22223a" stroke="#2e2e42" strokeWidth="0.5"/>
          <rect x="119" y="231" width="11" height="9" rx="1" fill="#22223a" stroke="#2e2e42" strokeWidth="0.5"/>
          <circle cx="155" cy="236" r="2" fill="var(--accent2)" opacity="0.3"><animate attributeName="opacity" values="0.15;0.5;0.15" dur="1.2s" repeatCount="indefinite"/></circle>
        </g>
      </SlotZone>

      {/* PSU */}
      <SlotZone slotKey="psu" x={60} y={420} w={160} h={110} emptyIcon="⚡">
        <g>
          <rect x="60" y="420" width="160" height="110" rx="5" fill="#252530" stroke="#2e2e3a" strokeWidth="1.5"/>
          <circle cx="140" cy="475" r="36" fill="none" stroke="#2a2a38" strokeWidth="1"/>
          <circle cx="140" cy="475" r="24" fill="none" stroke="#2a2a38" strokeWidth="0.5"/>
          <circle cx="140" cy="475" r="5" fill="#1e1e2c"/>
          <rect x="75" y="425" width="55" height="11" rx="2" fill="#1a1a26"/>
          <text x="102" y="433" textAnchor="middle" fill="var(--accent2)" fontSize="6.5" fontFamily="monospace" opacity="0.5">{sel.psu && cats.psu.items.find(x=>x.id===sel.psu)?.specs}</text>
        </g>
      </SlotZone>
    </svg>
  )
}


/* ═══ COMPATIBILITY CHECK ═══ */
function CompatPanel({ sel }) {
  const cpu  = sel.cpu  ? cats.cpu.items.find(x => x.id === sel.cpu)   : null
  const gpu  = sel.gpu  ? cats.gpu.items.find(x => x.id === sel.gpu)   : null
  const ram  = sel.ram  ? cats.ram.items.find(x => x.id === sel.ram)   : null
  const mb   = sel.mb   ? cats.mb.items.find(x => x.id === sel.mb)     : null
  const psu  = sel.psu  ? cats.psu.items.find(x => x.id === sel.psu)   : null
  const cool = sel.cool ? cats.cool.items.find(x => x.id === sel.cool) : null

  const checks = []
  if (cpu && mb)   checks.push({ label:`Socket: CPU ${cpu.params.socket} ↔ MB ${mb.params.socket}`, ok: cpu.params.socket === mb.params.socket })
  if (ram && mb)   checks.push({ label:`RAM: ${ram.params.gen} ↔ MB ${mb.params.ddr}`, ok: ram.params.gen === mb.params.ddr })
  if (cpu && cool) { const r = cool.params.tdp/cpu.params.tdp; checks.push({ label:`Chlazení: ${cool.params.tdp}W vs CPU ${cpu.params.tdp}W`, ok: r>=1, warn: r>=0.8&&r<1 }) }
  if (gpu && psu)  { const req={rx6600:500,rtx4060:550,rtx4070:650,rtx4090:850}[gpu.id]||400; checks.push({ label:`PSU: ${psu.params.wattage}W vs GPU doporučeno ${req}W`, ok: psu.params.wattage>=req+50, warn: psu.params.wattage>=req&&psu.params.wattage<req+50 }) }

  if (!checks.length) return null

  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-[0.7rem] font-bold uppercase tracking-wider mb-3" style={{color:'var(--tx2)'}}>🔍 Kompatibilita</div>
      <div className="flex flex-col gap-1.5">
        {checks.map((c,i) => (
          <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[0.74rem] ${c.ok ? 'bg-green-500/10 text-green-400' : c.warn ? 'bg-yellow-400/10 text-yellow-400' : 'bg-red-400/10 text-red-400'}`}>
            <span>{c.ok ? '✅' : c.warn ? '⚠️' : '❌'}</span><span>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}


/* ═══ CAN I RUN IT (mini) ═══ */
function GameCheckPanel({ sel }) {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(false)

  const cpu = sel.cpu ? cats.cpu.items.find(x => x.id === sel.cpu) : null
  const gpu = sel.gpu ? cats.gpu.items.find(x => x.id === sel.gpu) : null
  const ram = sel.ram ? cats.ram.items.find(x => x.id === sel.ram) : null

  const myCpu  = cpu?.params?.score || 0
  const myGpu  = gpu?.params?.score || 0
  const myRam  = ram?.params?.capacity || 0
  const myVram = gpu?.params?.vram || 0

  if (!cpu && !gpu) return (
    <div className="glass rounded-2xl p-4 text-center">
      <span className="text-2xl mb-2 block">🎮</span>
      <div className="text-[0.82rem] font-semibold mb-1" style={{color:'var(--tx)'}}>Rozjedu to?</div>
      <div className="text-[0.72rem]" style={{color:'var(--tx3)'}}>Vyber CPU a GPU a uvidíš, jaké hry utáhneš</div>
    </div>
  )

  const getResult = (g) => {
    const ok = t => myCpu >= t.cpuScore && myGpu >= t.gpuScore && myRam >= t.ram && myVram >= t.vram
    if (ok(g.ultra)) return { ico:'🚀', txt:'Ultra', color:'var(--green)' }
    if (ok(g.rec))   return { ico:'✅', txt:'High',  color:'var(--green)' }
    if (ok(g.min))   return { ico:'⚠️', txt:'Low',   color:'var(--yellow)' }
    return                   { ico:'❌', txt:'Nestačí',color:'#f87171' }
  }

  const filtered = search ? games.filter(g => g.name.toLowerCase().includes(search.toLowerCase())) : games
  const shown = expanded ? filtered : filtered.slice(0, 4)

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{borderColor:'var(--glass-b)'}}>
        <span className="text-[0.72rem] font-bold uppercase tracking-wider" style={{color:'var(--tx2)'}}>🎮 Rozjedu to?</span>
      </div>
      <div className="px-3 pt-2 pb-1">
        <div className="flex items-center gap-2 rounded-xl px-3 py-1.5 mb-2" style={{background:'var(--surface-2)'}}>
          <span className="text-[0.75rem]">🔍</span>
          <input className="bg-transparent border-none outline-none text-[0.78rem] flex-1 font-sans" style={{color:'var(--tx)'}}
            placeholder="Najdi hru..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="px-2 pb-2">
        {shown.map(g => {
          const r = getResult(g)
          return (
            <div key={g.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors hover:bg-white/[0.03]">
              <span className="text-lg flex-shrink-0">{g.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[0.78rem] font-medium truncate" style={{color:'var(--tx)'}}>{g.name}</div>
                <div className="text-[0.62rem]" style={{color:'var(--tx3)'}}>{g.genre}</div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-sm">{r.ico}</span>
                <span className="text-[0.7rem] font-semibold" style={{color:r.color}}>{r.txt}</span>
              </div>
            </div>
          )
        })}
      </div>
      {filtered.length > 4 && (
        <button onClick={() => setExpanded(e => !e)}
          className="w-full py-2 text-[0.72rem] font-semibold cursor-pointer bg-transparent border-none border-t"
          style={{color:'var(--accent)', borderTop:'1px solid var(--glass-b)'}}>
          {expanded ? '▲ Méně' : `▼ Zobrazit všech ${filtered.length} her`}
        </button>
      )}
    </div>
  )
}


/* ═══ EZ MODE MAIN ═══ */
export default function EZMode({ sel, selShop, total, count, onPick, onRemove, onSaveBuild, onShare, onSwitchMode, onGoHome, favorites, onToggleFavorite }) {
  const [activeCat, setActiveCat]   = useState('case')
  const [saveOpen, setSaveOpen]     = useState(false)
  const [saveName, setSaveName]     = useState('')
  const [hoveredSlot, setHoveredSlot] = useState(null)
  const [infoOpen, setInfoOpen]       = useState(true)

  const filledCount = SLOT_ORDER.filter(k => !!sel[k]).length
  const progress = Math.round(filledCount / 8 * 100)
  const nextSlot = SLOT_ORDER.find(k => !sel[k]) || null

  const handleSelect = (catKey, itemId) => {
    onPick(catKey, itemId)
    const nextEmpty = SLOT_ORDER.find(k => k !== catKey && !sel[k])
    if (nextEmpty) setTimeout(() => { setActiveCat(nextEmpty); setInfoOpen(true) }, 300)
  }

  // Otevři panel při změně kategorie
  const switchCat = (key) => {
    setActiveCat(key)
    setInfoOpen(true)
  }

  const handleSave = () => {
    if (!saveName.trim()) return
    onSaveBuild(saveName.trim())
    setSaveName('')
    setSaveOpen(false)
  }

  return (
    <div className="min-h-screen pt-16" style={{background:'linear-gradient(135deg, var(--bg-from), var(--bg-to))'}}>
      <div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/>

      {/* EZ Header */}
      <div className="relative z-10 px-[clamp(1.5rem,5vw,6rem)] pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={onGoHome} title="Hlavní stránka"
              className="w-8 h-8 rounded-lg glass flex items-center justify-center cursor-pointer text-sm border-none transition-all hover:scale-105"
              style={{color:'var(--tx2)'}}>
              🏠
            </button>
            <span className="text-[0.68rem] font-bold uppercase tracking-widest" style={{color:'var(--tx2)'}}>🧩 EZ Mode</span>
            <span className="font-mono text-[0.68rem]" style={{color:'var(--tx3)'}}>{filledCount}/8</span>
          </div>
          <div className="flex items-center gap-3">
            {total > 0 && (
              <span className="font-mono font-bold text-[1rem]" style={{color:'var(--accent2)'}}>{fmt(total)}</span>
            )}
            <button onClick={onSwitchMode}
              className="px-3 py-1.5 rounded-xl text-[0.75rem] font-semibold cursor-pointer glass"
              style={{color:'var(--accent)', border:'1px solid var(--accent-b)'}}>
              ⚙️ Advanced
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between mb-1.5 items-center">
            <span className="text-[0.78rem] font-medium" style={{color:'var(--tx2)'}}>
              {progress === 100 ? '🎉 Sestava kompletní!' : nextSlot ? `Další krok: ${SLOT_META[nextSlot]?.label}` : ''}
            </span>
            <span className="font-mono font-bold text-[0.8rem]" style={{color: progress===100 ? 'var(--green)' : 'var(--accent2)'}}>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{background:'var(--glass-b)'}}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{width:`${progress}%`, background: progress===100 ? 'var(--green)' : 'var(--accent2)'}} />
          </div>
          <div className="flex gap-1 mt-2">
            {SLOT_ORDER.map(key => (
              <div key={key} onClick={() => switchCat(key)}
                className="cursor-pointer transition-all"
                style={{flex:1,height:3,borderRadius:2,
                  background: sel[key] ? 'var(--accent2)' : activeCat===key ? 'var(--accent2-s)' : 'var(--glass-b)',
                  border: activeCat===key ? '1px solid var(--accent2-b)' : 'none',
                }}
                title={SLOT_META[key].label} />
            ))}
          </div>
        </div>
      </div>

      {/* ═══ LEVÝ INFO PANEL — vyjíždí z okraje obrazovky (hidden on mobile) ═══ */}
      <div className="fixed z-40 ez-info-panel" style={{
        top: 'clamp(160px, 22vh, 220px)',
        left: infoOpen ? 0 : '-340px',
        transition: 'left 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        width: 'clamp(260px,20vw,340px)',
      }}>
        <div className="relative ml-0 rounded-r-2xl overflow-hidden"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--accent2-b)',
            borderLeft: 'none',
            backdropFilter: 'blur(24px)',
            boxShadow: '4px 0 30px rgba(0,0,0,0.2)',
          }}>
          {/* Accent top line */}
          <div style={{height:3, background:'linear-gradient(90deg, var(--accent2), transparent)'}} />

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{SLOT_META[activeCat]?.icon}</span>
              <div>
                <div className="font-bold text-[1.05rem]" style={{color:'var(--accent2)'}}>{SLOT_META[activeCat]?.label}</div>
                <div className="text-[0.68rem] font-medium" style={{color:'var(--tx3)'}}>{SLOT_META[activeCat]?.desc}</div>
              </div>
            </div>
            <button onClick={() => setInfoOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer text-xs border-none transition-all hover:scale-110"
              style={{background:'var(--surface-2)', color:'var(--tx3)'}}>✕</button>
          </div>

          {/* Tooltip text */}
          <div className="px-5 pb-4 pt-1">
            <div className="text-[0.82rem] leading-[1.6]" style={{color:'var(--tx2)'}}>
              {SLOT_META[activeCat]?.tooltip}
            </div>
          </div>

          {/* Quick nav — klikatelné sloty */}
          <div className="px-5 pb-4">
            <div className="text-[0.6rem] font-bold uppercase tracking-widest mb-2" style={{color:'var(--tx3)'}}>Komponenty</div>
            <div className="flex flex-col gap-1">
              {SLOT_ORDER.map(key => {
                const meta = SLOT_META[key]
                const filled = !!sel[key]
                const active = activeCat === key
                const item = sel[key] ? cats[key]?.items.find(x => x.id === sel[key]) : null
                return (
                  <button key={key} onClick={() => switchCat(key)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl border-none cursor-pointer transition-all text-left w-full"
                    style={{
                      background: active ? 'var(--accent2-s)' : 'transparent',
                      border: active ? '1px solid var(--accent2-b)' : '1px solid transparent',
                    }}>
                    <span className="text-base flex-shrink-0">{meta.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[0.75rem] font-medium truncate" style={{color: active ? 'var(--accent2)' : filled ? 'var(--tx)' : 'var(--tx3)'}}>
                        {filled && item ? item.name.split(' ').slice(0,3).join(' ') : meta.label}
                      </div>
                    </div>
                    {filled
                      ? <span style={{width:6,height:6,borderRadius:'50%',background:'var(--green)',flexShrink:0}} />
                      : <span className="text-[0.6rem]" style={{color:'var(--tx3)'}}>—</span>
                    }
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Toggle button pokud je panel zavřený */}
      {!infoOpen && (
        <button onClick={() => setInfoOpen(true)}
          className="fixed z-40 flex items-center gap-1.5 cursor-pointer border-none transition-all hover:scale-105 ez-info-toggle"
          style={{
            top: 'clamp(160px, 22vh, 220px)', left: 0,
            padding: '10px 14px 10px 12px',
            borderRadius: '0 14px 14px 0',
            background: 'var(--surface)',
            border: '1px solid var(--accent2-b)',
            borderLeft: 'none',
            boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
            color: 'var(--accent2)',
            fontSize: '0.82rem',
            fontWeight: 600,
          }}>
          <span className="text-base">{SLOT_META[activeCat]?.icon}</span>
          <span>ℹ️</span>
        </button>
      )}

      {/* Main grid */}
      <div className="relative z-10 grid gap-[clamp(0.85rem,1.5vw,1.5rem)] px-[clamp(1rem,4vw,6rem)] pb-[clamp(4rem,8vh,8rem)] items-start ez-grid">

        {/* LEFT — PC + actions */}
        <div className="flex flex-col gap-4">
          <PCCutaway sel={sel} activeCat={activeCat} nextSlot={nextSlot} onSlotClick={switchCat} />

          {/* Save / Share buttons */}
          {filledCount > 0 && (
            <div className="flex gap-3 justify-center">
              {saveOpen ? (
                <div className="flex gap-2 w-full max-w-sm">
                  <input autoFocus value={saveName} onChange={e => setSaveName(e.target.value)}
                    onKeyDown={e => { if(e.key==='Enter') handleSave(); if(e.key==='Escape') setSaveOpen(false) }}
                    placeholder="Název sestavy..."
                    className="flex-1 px-3 py-2 rounded-xl text-[0.8rem] border outline-none font-sans"
                    style={{background:'var(--surface-2)', borderColor:'var(--accent2-b)', color:'var(--tx)'}} />
                  <button onClick={handleSave} className="px-3 py-2 rounded-xl text-[0.8rem] font-semibold cursor-pointer border-none sidebar-cta">✓</button>
                  <button onClick={() => setSaveOpen(false)} className="px-3 py-2 rounded-xl text-[0.8rem] cursor-pointer border-none" style={{background:'var(--surface-2)', color:'var(--tx2)'}}>✕</button>
                </div>
              ) : (
                <>
                  <button onClick={() => setSaveOpen(true)}
                    className="px-5 py-2.5 rounded-xl text-[0.82rem] font-semibold cursor-pointer sidebar-cta">
                    💾 Uložit sestavu
                  </button>
                  <button onClick={onShare}
                    className="px-5 py-2.5 rounded-xl text-[0.82rem] font-semibold cursor-pointer sidebar-btn-secondary">
                    🔗 Sdílet
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* RIGHT — Picker + Compat + Games */}
        <div className="flex flex-col gap-3 ez-picker">

          {/* Mobile info — viditelná jen na mobilu místo levého panelu */}
          <div className="ez-mobile-info glass rounded-2xl px-4 py-3"
            style={{border:'1px solid var(--accent2-b)', background:'var(--accent2-s)'}}>
            <div className="flex items-start gap-2.5">
              <span className="text-lg flex-shrink-0">{SLOT_META[activeCat]?.icon}</span>
              <div>
                <div className="font-semibold text-[0.85rem]" style={{color:'var(--accent2)'}}>{SLOT_META[activeCat]?.label}</div>
                <div className="text-[0.75rem] leading-relaxed" style={{color:'var(--tx2)'}}>{SLOT_META[activeCat]?.tooltip}</div>
              </div>
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-1 p-1 rounded-xl" style={{background:'var(--glass)'}}>
            {SLOT_ORDER.map(key => {
              const filled = !!sel[key]
              const active = activeCat === key
              return (
                <button key={key} onClick={() => switchCat(key)}
                  className="flex items-center gap-1 rounded-lg border-none cursor-pointer transition-all"
                  style={{
                    padding:'5px 8px', fontSize:'0.72rem', fontWeight:600,
                    background: active ? 'var(--accent2-s)' : 'transparent',
                    color: active ? 'var(--accent2)' : filled ? 'var(--tx2)' : 'var(--tx3)',
                    outline: active ? '1px solid var(--accent2-b)' : 'none',
                  }}>
                  <span style={{fontSize:13}}>{SLOT_META[key].icon}</span>
                  {filled && <span style={{width:4,height:4,borderRadius:'50%',background:'var(--green)'}} />}
                </button>
              )
            })}
          </div>

          {/* Component picker */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{borderColor:'var(--glass-b)'}}>
              <div className="flex items-center gap-2">
                <span style={{fontSize:16}}>{SLOT_META[activeCat]?.icon}</span>
                <div>
                  <div className="font-semibold text-[0.88rem]" style={{color:'var(--tx)'}}>{SLOT_META[activeCat]?.label}</div>
                  <div className="text-[0.66rem]" style={{color:'var(--tx3)'}}>{SLOT_META[activeCat]?.desc}</div>
                </div>
              </div>
              {sel[activeCat] && (
                <button onClick={() => onRemove(activeCat)}
                  className="px-2.5 py-1 rounded-lg text-[0.68rem] font-semibold cursor-pointer"
                  style={{background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)', color:'#f87171'}}>
                  ✕ Odebrat
                </button>
              )}
            </div>

            <div className="p-2 flex flex-col gap-1.5" style={{maxHeight:420, overflowY:'auto'}}>
              {cats[activeCat]?.items.map(it => {
                const isSelected = sel[activeCat] === it.id
                const tier = getTier(it)
                const tip = ITEM_TIPS[it.id]
                return (
                  <div key={it.id}
                    onClick={() => handleSelect(activeCat, it.id)}
                    className="flex flex-col rounded-xl cursor-pointer transition-all"
                    style={{
                      background: isSelected ? 'var(--accent2-s)' : 'var(--panel)',
                      border: isSelected ? '1.5px solid var(--accent2-b)' : '1.5px solid var(--panel-b)',
                    }}
                    onMouseEnter={e => { if(!isSelected) e.currentTarget.style.background='var(--panel-h)' }}
                    onMouseLeave={e => { if(!isSelected) e.currentTarget.style.background=isSelected?'var(--accent2-s)':'var(--panel)' }}>
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <div style={{width:6,height:6,borderRadius:'50%',flexShrink:0,background:TIER_COLORS[tier]}} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[0.82rem]" style={{color:'var(--tx)'}}>{it.name}</div>
                        <div className="font-mono text-[0.68rem] mt-0.5" style={{color:'var(--tx2)'}}>
                          {it.specs} · <span style={{color:TIER_COLORS[tier], fontWeight:600}}>{TIER_LABELS[tier]}</span>
                        </div>
                      </div>
                      <span className="font-mono font-semibold text-[0.82rem] flex-shrink-0"
                        style={{color: isSelected ? 'var(--accent2)' : 'var(--tx)'}}>
                        {fmt(it.price)}
                      </span>
                      {isSelected && <span style={{color:'var(--accent2)', fontSize:13}}>✓</span>}
                    </div>
                    {tip && (
                      <div className="px-3 pb-2.5 pt-0 pl-[26px]">
                        <div className="text-[0.68rem] leading-relaxed" style={{color:'var(--tx3)'}}>
                          💡 {tip}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Compatibility */}
          <CompatPanel sel={sel} />

          {/* Can I Run It */}
          <GameCheckPanel sel={sel} />

          {/* Total */}
          {total > 0 && (
            <div className="sidebar-panel rounded-2xl px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-[0.7rem] uppercase tracking-wider font-semibold" style={{color:'var(--accent2)', opacity:0.6}}>Celkem od</span>
                <span className="font-mono font-bold total-price" style={{fontSize:'clamp(1.3rem,2vw,1.8rem)'}}>{fmt(total)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        .ez-grid {
          grid-template-columns: 1fr clamp(300px, 28vw, 420px);
        }
        .ez-mobile-info {
          display: none;
        }
        .ez-picker {
          position: sticky;
          top: calc(64px + 1.5rem);
        }

        /* Tablet landscape */
        @media (max-width: 1100px) {
          .ez-grid {
            grid-template-columns: 1fr clamp(280px, 35vw, 380px);
            padding-left: clamp(1rem, 3vw, 3rem) !important;
            padding-right: clamp(1rem, 3vw, 3rem) !important;
          }
        }

        /* Tablet portrait */
        @media (max-width: 900px) {
          .ez-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem !important;
          }
          .ez-picker {
            position: static;
          }
          .ez-info-panel {
            display: none !important;
          }
          .ez-info-toggle {
            display: none !important;
          }
          .ez-mobile-info {
            display: block;
          }
        }

        /* Mobile */
        @media (max-width: 600px) {
          .ez-grid {
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
          }
        }
      `}</style>
    </div>
  )
}
