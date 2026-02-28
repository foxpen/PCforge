import { useState, useCallback } from 'react'
import { useBuild } from './hooks/useBuild.js'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Tabs from './components/Tabs.jsx'
import Configurator from './components/Configurator.jsx'
import Compare from './components/Compare.jsx'
import Catalog from './components/Catalog.jsx'
import CanIRunIt from './components/CanIRunIt.jsx'
import Presets from './components/Presets.jsx'
import AchievementPopup from './components/AchievementPopup.jsx'
import AchievementHud from './components/AchievementHud.jsx'
import Footer from './components/Footer.jsx'
import { achievements } from './data/achievements.js'

export default function App() {
  const [tab, setTab] = useState('config')
  const [compareList, setCompareList] = useState([])
  const [theme, setTheme] = useState('dark')
  const build = useBuild()

  // Achievement state
  const [unlocked, setUnlocked] = useState(new Set())
  const [totalXp, setTotalXp] = useState(0)
  const [achCurrent, setAchCurrent] = useState(null)
  const [achQueue, setAchQueue] = useState([])
  const [stats, setStats] = useState({
    shared:0, exported:0, historyOpened:0, canRunChecked:0,
    buildTime:0, openedAll:0, catalogVisited:0, presetLoaded:0,
    totalClicks:0, buildStartTime:null,
  })

  const trackStat = useCallback((key) => {
    setStats(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }))
  }, [])

  const checkAchievements = useCallback((overrideStats) => {
    const s = overrideStats || stats
    setUnlocked(prev => {
      const next = new Set(prev)
      const newOnes = []
      achievements.forEach(a => {
        if (next.has(a.id)) return
        const ok = checkCondition(a.id, build.sel, build.selShop, compareList, s)
        if (ok) { next.add(a.id); newOnes.push(a) }
      })
      if (newOnes.length) {
        setTotalXp(x => x + newOnes.reduce((s, a) => s + a.xp, 0))
        setAchQueue(q => [...q, ...newOnes])
        if (!achCurrent) {
          setAchCurrent(newOnes[0])
          setAchQueue(newOnes.slice(1))
        }
      }
      return next
    })
  }, [build.sel, build.selShop, compareList, stats, achCurrent])

  const dismissAch = useCallback(() => {
    setAchCurrent(null)
    setTimeout(() => {
      setAchQueue(q => {
        if (q.length) { setAchCurrent(q[0]); return q.slice(1) }
        return q
      })
    }, 500)
  }, [])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  const toggleCompare = (catKey, id) => {
    setCompareList(prev => {
      const idx = prev.findIndex(c => c.id === id && c.cat === catKey)
      return idx >= 0 ? prev.filter((_, i) => i !== idx) : [...prev, { cat: catKey, id }]
    })
  }

  return (
    <div className={`app theme-${theme}`}>
      <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />

      <Nav
        theme={theme}
        onToggleTheme={toggleTheme}
        total={build.total}
        sel={build.sel}
        selShop={build.selShop}
        onShare={() => { trackStat('shared'); checkAchievements() }}
        onExport={() => { trackStat('exported'); checkAchievements() }}
      />

      <Hero />

      <Tabs
        active={tab}
        onSwitch={t => {
          setTab(t)
          if (t === 'catalog') { trackStat('catalogVisited'); checkAchievements() }
          if (t === 'canrun')  { trackStat('canRunChecked');  checkAchievements() }
        }}
        compareCount={compareList.length}
      />

      <div style={{ display: tab === 'config'  ? '' : 'none' }}>
        <Configurator
          sel={build.sel}
          selShop={build.selShop}
          total={build.total}
          count={build.count}
          compareList={compareList}
          onPick={(k, id) => { build.pick(k, id); checkAchievements() }}
          onPickShop={build.pickShop}
          onRemove={build.removePick}
          onToggleCompare={toggleCompare}
          onHistoryOpen={() => { trackStat('historyOpened'); checkAchievements() }}
          onOpenAll={() => { trackStat('openedAll'); checkAchievements() }}
        />
        <Presets onLoad={p => { build.loadPreset(p); trackStat('presetLoaded'); checkAchievements() }} />
      </div>

      <div style={{ display: tab === 'compare' ? '' : 'none' }}>
        <Compare compareList={compareList} onRemove={(cat, id) => toggleCompare(cat, id)} />
      </div>

      <div style={{ display: tab === 'catalog' ? '' : 'none' }}>
        <Catalog
          sel={build.sel}
          onAddToBuild={(k, id) => { build.pick(k, id); checkAchievements() }}
          onToggleCompare={toggleCompare}
          compareList={compareList}
          onHistoryOpen={() => { trackStat('historyOpened'); checkAchievements() }}
        />
      </div>

      <div style={{ display: tab === 'canrun' ? '' : 'none' }}>
        <CanIRunIt sel={build.sel} />
      </div>

      <AchievementPopup achievement={achCurrent} onDismiss={dismissAch} />
      <AchievementHud
        level={Math.floor(totalXp / 100) + 1}
        xpPct={(totalXp % 100)}
        count={unlocked.size}
        unlocked={unlocked}
        totalXp={totalXp}
        stats={stats}
      />

      <Footer />
    </div>
  )
}

function checkCondition(id, sel, selShop, compareList, stats) {
  const cnt = Object.keys(sel).length
  const shopCnt = Object.keys(selShop).length
  switch (id) {
    case 'first_pick':    return cnt >= 1
    case 'half_build':    return cnt >= 4
    case 'full_build':    return cnt >= 8
    case 'shop_picker':   return shopCnt >= 1
    case 'all_shops':     return shopCnt >= 8
    case 'compared':      return compareList.length >= 2
    case 'compare_pro':   return compareList.length >= 4
    case 'shared':        return stats.shared >= 1
    case 'pdf_export':    return stats.exported >= 1
    case 'history_view':  return stats.historyOpened >= 1
    case 'price_watcher': return stats.historyOpened >= 5
    case 'canrun_check':  return stats.canRunChecked >= 1
    case 'speed_build':   return stats.buildTime > 0 && stats.buildTime < 60
    case 'open_all':      return stats.openedAll >= 1
    case 'catalog_user':  return stats.catalogVisited >= 1
    case 'preset_load':   return stats.presetLoaded >= 1
    case 'click_frenzy':  return stats.totalClicks >= 100
    case 'compat_genius': return cnt >= 2
    default: return false
  }
}
