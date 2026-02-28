export default function Tabs({ active, onSwitch, compareCount }) {
  const tabs = [
    { id:'config',  label:'⚙️ Konfigurátor' },
    { id:'compare', label:'⚖️ Porovnání', badge: compareCount },
    { id:'catalog', label:'📦 Katalog' },
    { id:'canrun',  label:'🎮 Rozjedu to?' },
  ]
  return (
    <div className="tabs-wrap">
      <div className="tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`tab${active === t.id ? ' active' : ''}`}
            onClick={() => onSwitch(t.id)}
          >
            {t.label}
            {t.badge > 0 && <span className="compare-badge">{t.badge}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
