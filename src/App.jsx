import { useCallback, useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage.js'
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
  const [tab, setTab]               = useState('config')
  const [compareList, setCompareList] = useState([])
  const [achCurrent, setAchCurrent]   = useState(null)
  const [achQueue, setAchQueue]       = useState([])

  // Vše persistováno v localStorage
  const [theme, setTheme]         = useLocalStorage('pcforge_theme', 'dark')
  const [unlockedArr, setUnlockedArr] = useLocalStorage('pcforge_unlocked', [])
  const [totalXp, setTotalXp]     = useLocalStorage('pcforge_xp', 0)
  const [stats, setStats]         = useLocalStorage('pcforge_stats', {
    shared:0, exported:0, historyOpened:0, canRunChecked:0,
    buildTime:0, openedAll:0, catalogVisited:0, presetLoaded:0, totalClicks:0,
  })

  const unlockedSet = new Set(unlockedArr)
  const build = useBuild()

  const trackStat = (key) => setStats(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }))

  const checkAchievements = useCallback((overrideStats) => {
    const s = overrideStats || stats
    setUnlockedArr(prevArr => {
      const prevSet = new Set(prevArr)
      const newOnes = []
      achievements.forEach(a => {
        if (prevSet.has(a.id)) return
        if (check(a.id, build.sel, build.selShop, compareList, s)) {
          prevSet.add(a.id)
          newOnes.push(a)
        }
      })
      if (newOnes.length) {
        setTotalXp(x => x + newOnes.reduce((acc, a) => acc + a.xp, 0))
        setAchCurrent(prev => {
          if (!prev) { setAchQueue(newOnes.slice(1)); return newOnes[0] }
          setAchQueue(q => [...q, ...newOnes])
          return prev
        })
      }
      return [...prevSet]
    })
  }, [build.sel, build.selShop, compareList, stats])

  const dismissAch = () => {
    setAchCurrent(null)
    setTimeout(() => setAchQueue(q => { if (q.length) { setAchCurrent(q[0]); return q.slice(1) } return q }), 500)
  }

  const toggleCompare = (catKey, id) =>
    setCompareList(prev => {
      const idx = prev.findIndex(c => c.id === id && c.cat === catKey)
      return idx >= 0 ? prev.filter((_, i) => i !== idx) : [...prev, { cat: catKey, id }]
    })

  const bump = (key) => {
    const ns = { ...stats, [key]: (stats[key] || 0) + 1 }
    trackStat(key)
    checkAchievements(ns)
  }

  return (
    <div className="min-h-screen pt-16" data-theme={theme}>
      <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />

      <Nav
        theme={theme}
        onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        total={build.total}
        onShare={() => bump('shared')}
        onExport={() => bump('exported')}
      />

      <Hero />

      <Tabs
        active={tab}
        onSwitch={t => {
          setTab(t)
          if (t === 'catalog') bump('catalogVisited')
          if (t === 'canrun')  bump('canRunChecked')
        }}
        compareCount={compareList.length}
      />

      <div style={{ display: tab === 'config' ? '' : 'none' }}>
        <Configurator
          sel={build.sel} selShop={build.selShop}
          total={build.total} count={build.count}
          compareList={compareList}
          onPick={(k, id) => { build.pick(k, id); checkAchievements() }}
          onPickShop={build.pickShop}
          onRemove={build.removePick}
          onClear={build.clearBuild}
          onToggleCompare={toggleCompare}
          onHistoryOpen={() => bump('historyOpened')}
          onOpenAll={() => bump('openedAll')}
        />
        <Presets onLoad={p => { build.loadPreset(p); bump('presetLoaded') }} />
      </div>

      <div style={{ display: tab === 'compare' ? '' : 'none' }}>
        <Compare compareList={compareList} onRemove={toggleCompare} />
      </div>

      <div style={{ display: tab === 'catalog' ? '' : 'none' }}>
        <Catalog
          sel={build.sel}
          onAddToBuild={(k, id) => { build.pick(k, id); checkAchievements() }}
          onToggleCompare={toggleCompare}
          compareList={compareList}
          onHistoryOpen={() => bump('historyOpened')}
        />
      </div>

      <div style={{ display: tab === 'canrun' ? '' : 'none' }}>
        <CanIRunIt sel={build.sel} />
      </div>

      <AchievementPopup achievement={achCurrent} onDismiss={dismissAch} />

      <AchievementHud
        level={Math.floor(totalXp / 100) + 1}
        xpPct={totalXp % 100}
        count={unlockedSet.size}
        unlocked={unlockedSet}
        totalXp={totalXp}
        stats={stats}
        onReset={() => {
          if (!confirm('Resetovat vše? Sestava, achievementy i XP.')) return
          build.clearBuild()
          setUnlockedArr([])
          setTotalXp(0)
          setStats({ shared:0, exported:0, historyOpened:0, canRunChecked:0, buildTime:0, openedAll:0, catalogVisited:0, presetLoaded:0, totalClicks:0 })
        }}
      />

      <Footer />
    </div>
  )
}

function check(id, sel, selShop, compareList, s) {
  const cnt = Object.keys(sel).length
  const sc  = Object.keys(selShop).length
  switch (id) {
    case 'first_pick':    return cnt >= 1
    case 'half_build':    return cnt >= 4
    case 'full_build':    return cnt >= 8
    case 'shop_picker':   return sc >= 1
    case 'all_shops':     return sc >= 8
    case 'compared':      return compareList.length >= 2
    case 'compare_pro':   return compareList.length >= 4
    case 'shared':        return (s.shared||0) >= 1
    case 'pdf_export':    return (s.exported||0) >= 1
    case 'history_view':  return (s.historyOpened||0) >= 1
    case 'price_watcher': return (s.historyOpened||0) >= 5
    case 'canrun_check':  return (s.canRunChecked||0) >= 1
    case 'speed_build':   return (s.buildTime||0) > 0 && s.buildTime < 60
    case 'open_all':      return (s.openedAll||0) >= 1
    case 'catalog_user':  return (s.catalogVisited||0) >= 1
    case 'preset_load':   return (s.presetLoaded||0) >= 1
    case 'click_frenzy':  return (s.totalClicks||0) >= 100
    case 'compat_genius': return cnt >= 2
    default: return false
  }
}
