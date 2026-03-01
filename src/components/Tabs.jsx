export default function Tabs({ active, onSwitch, compareCount }) {
  const tabs = [
    { id: 'config',  label: '⚙️ Konfigurátor' },
    { id: 'compare', label: '⚖️ Porovnání', badge: compareCount },
    { id: 'catalog', label: '🛒 Katalog' },
    { id: 'canrun',  label: '🎮 Rozjedu to?' },
  ]
  return (
    <div id="tabs" className="relative z-10 px-[clamp(1.5rem,5vw,6rem)] pb-[clamp(1.5rem,3vh,2.5rem)]">
      <div className="flex gap-1.5 glass rounded-2xl p-1.5 w-fit flex-wrap">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => onSwitch(t.id)}
            className={`flex items-center gap-1.5 rounded-xl border-none cursor-pointer font-medium transition-all
              ${active === t.id
                ? 'text-white'
                : 'bg-transparent hover:bg-white/5'
              }`}
            style={{
              padding: 'clamp(0.45rem,1vh,0.65rem) clamp(1rem,2vw,1.75rem)',
              fontSize: 'clamp(0.78rem,1.2vw,0.9rem)',
              background: active === t.id ? 'var(--accent)' : undefined,
              color: active === t.id ? '#fff' : 'var(--tx2)',
            }}
          >
            {t.label}
            {t.badge > 0 && (
              <span className="bg-white/25 text-white text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
