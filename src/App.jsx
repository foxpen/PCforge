import { useCallback, useState, useEffect } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage.js'
import { useBuild } from './hooks/useBuild.js'
import Nav, { PALETTES, tv } from './components/Nav.jsx'
import Onboarding from './components/Onboarding.jsx'
import EZMode from './components/EZMode.jsx'
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
import PriceHistoryModal from './components/PriceHistoryModal.jsx'
import ShareModal from './components/ShareModal.jsx'
import Saved from './components/Saved.jsx'

export default function App() {
  const [tab, setTab]               = useState('config')
  const [appMode, setAppMode]       = useLocalStorage('pcforge_mode', null) // null=onboarding, 'ez', 'advanced'
  const [compareList, setCompareList] = useState([])
  const [achCurrent, setAchCurrent]   = useState(null)
  const [achQueue, setAchQueue]       = useState([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [shareOpen,   setShareOpen]   = useState(false)

  // Načti sestavu z URL parametru při prvním načtení
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const buildParam = params.get('build')
    if (!buildParam) return
    try {
      const { sel: s, selShop: ss } = JSON.parse(atob(buildParam))
      build.loadPreset({ s })
      // selShop načteme přímo
      if (ss && Object.keys(ss).length) {
        Object.entries(ss).forEach(([k, shop]) => build.pickShop(k, shop))
      }
      // Vymaž parametr z URL bez reload
      window.history.replaceState({}, '', window.location.pathname)
      setTab('config')
    } catch (e) {
      console.warn('Neplatný build parametr v URL')
    }
  }, [])

  // Vše persistováno v localStorage
  const [theme, setTheme]         = useLocalStorage('pcforge_theme', 'dark')
  const [paletteId, setPaletteId] = useLocalStorage('pcforge_palette', 'indigo')

  // Aplikuj paletu jako CSS proměnné na root
  const pal = PALETTES.find(p => p.id === paletteId) || PALETTES[0]
  document.documentElement.style.setProperty('--accent', pal.accent)
  document.documentElement.style.setProperty('--accent-s', pal.soft)
  document.documentElement.style.setProperty('--accent-b', pal.border)
  document.documentElement.style.setProperty('--accent2', tv(pal.accent2, theme))
  document.documentElement.style.setProperty('--accent2-s', tv(pal.accent2s, theme))
  document.documentElement.style.setProperty('--accent2-b', tv(pal.accent2b, theme))
  document.documentElement.style.setProperty('--accent2-glow', tv(pal.accent2glow, theme))
  document.documentElement.style.setProperty('--accent2-dark', tv(pal.accent2dark, theme))
  document.documentElement.style.setProperty('--sidebar-bg', tv(pal.sidebarBg, theme))
  document.documentElement.style.setProperty('--sidebar-line', tv(pal.sidebarLine, theme))
  document.documentElement.style.setProperty('--sidebar-item-hover', tv(pal.sidebarItemH, theme))
  document.documentElement.style.setProperty('--sidebar-cta-tx', tv(pal.sidebarCtaTx, theme))
  document.documentElement.setAttribute('data-theme', theme)
  const [unlockedArr, setUnlockedArr] = useLocalStorage('pcforge_unlocked', [])
  const [totalXp, setTotalXp]     = useLocalStorage('pcforge_xp', 0)
  const [stats, setStats]         = useLocalStorage('pcforge_stats', {
    shared:0, exported:0, historyOpened:0, canRunChecked:0,
    buildTime:0, openedAll:0, catalogVisited:0, presetLoaded:0, totalClicks:0,
  })
  const [savedBuilds, setSavedBuilds] = useLocalStorage('pcforge_saved', [])
  const [favorites,   setFavorites]   = useLocalStorage('pcforge_favorites', [])

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

  const saveBuild = (name) => {
    const newBuild = {
      id: Date.now().toString(),
      name,
      sel: { ...build.sel },
      selShop: { ...build.selShop },
      total: build.total,
      savedAt: Date.now(),
    }
    setSavedBuilds(prev => [newBuild, ...prev])
  }

  const loadSaved = (id, newName, renameOnly = false) => {
    const b = savedBuilds.find(x => x.id === id)
    if (!b) return
    if (renameOnly) {
      setSavedBuilds(prev => prev.map(x => x.id === id ? { ...x, name: newName } : x))
      return
    }
    build.loadPreset({ s: b.sel })
    setTab('config')
  }

  const deleteSaved = (id) => setSavedBuilds(prev => prev.filter(x => x.id !== id))

  const toggleFavorite = (catKey, itemId) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.catKey === catKey && f.id === itemId)
      return exists ? prev.filter(f => !(f.catKey === catKey && f.id === itemId)) : [...prev, { catKey, id: itemId }]
    })
  }

  const clearFavorite = (catKey, itemId) => setFavorites(prev => prev.filter(f => !(f.catKey === catKey && f.id === itemId)))
  const bump = (key) => {
    const ns = { ...stats, [key]: (stats[key] || 0) + 1 }
    trackStat(key)
    checkAchievements(ns)
  }

  // ═══ ONBOARDING ═══
  if (!appMode) {
    return <Onboarding onChoose={setAppMode} />
  }

  // ═══ EZ MODE ═══
  if (appMode === 'ez') {
    return (
      <div className="min-h-screen">
        <Nav
          theme={theme}
          onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          total={build.total}
          count={build.count}
          sel={build.sel}
          selShop={build.selShop}
          onRemove={build.removePick}
          onOpenAll={() => bump('openedAll')}
          onSaveBuild={saveBuild}
          onShare={() => { setShareOpen(true); bump('shared') }}
          onExport={() => bump('exported')}
          palette={paletteId}
          onPalette={setPaletteId}
          onGoHome={() => setAppMode(null)}
        />
        <EZMode
          sel={build.sel}
          selShop={build.selShop}
          total={build.total}
          count={build.count}
          onPick={(k, id) => { build.pick(k, id); checkAchievements() }}
          onRemove={build.removePick}
          onSaveBuild={saveBuild}
          onShare={() => { setShareOpen(true); bump('shared') }}
          onSwitchMode={() => setAppMode('advanced')}
          onGoHome={() => setAppMode(null)}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />
        <AchievementPopup achievement={achCurrent} onDismiss={dismissAch} />
        {shareOpen && <ShareModal sel={build.sel} selShop={build.selShop} total={build.total} onClose={() => setShareOpen(false)} />}
        <AchievementHud
          level={Math.floor(totalXp / 100) + 1}
          xpPct={totalXp % 100}
          count={unlockedSet.size}
          unlocked={unlockedSet}
          totalXp={totalXp}
          stats={stats}
          onReset={() => {
            if (!confirm('Resetovat vše?')) return
            build.clearBuild(); setUnlockedArr([]); setTotalXp(0)
            setStats({ shared:0, exported:0, historyOpened:0, canRunChecked:0, buildTime:0, openedAll:0, catalogVisited:0, presetLoaded:0, totalClicks:0 })
          }}
        />
        <Footer />
      </div>
    )
  }

  // ═══ ADVANCED MODE ═══
  return (
    <div className="min-h-screen pt-16">
      <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />

      <Nav
        theme={theme}
        onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        total={build.total}
        count={build.count}
        sel={build.sel}
        selShop={build.selShop}
        onRemove={build.removePick}
        onOpenAll={() => bump('openedAll')}
        onSaveBuild={saveBuild}
        onShare={() => { setShareOpen(true); bump('shared') }}
        onExport={() => bump('exported')}
        palette={paletteId}
        onPalette={setPaletteId}
        onGoHome={() => setAppMode(null)}
      />

      <Hero onStart={() => { setTab('config'); document.getElementById('tabs')?.scrollIntoView({ behavior:'smooth' }) }}
        onSwitchToEZ={() => setAppMode('ez')} />

      <Tabs
        active={tab}
        onSwitch={t => {
          setTab(t)
          if (t === 'catalog') bump('catalogVisited')
          if (t === 'canrun')  bump('canRunChecked')
        }}
        compareCount={compareList.length}
        savedCount={savedBuilds.length + favorites.length}
      />

      <div style={{ display: tab === 'config' ? '' : 'none' }}>
        <Configurator
          sel={build.sel} selShop={build.selShop}
          total={build.total} count={build.count}
          compareList={compareList}
          favorites={favorites}
          onPick={(k, id) => { build.pick(k, id); checkAchievements() }}
          onPickShop={build.pickShop}
          onRemove={build.removePick}
          onClear={build.clearBuild}
          onToggleCompare={toggleCompare}
          onHistoryOpen={() => { setHistoryOpen(true); bump('historyOpened') }}
          onOpenAll={() => bump('openedAll')}
          onSaveBuild={saveBuild}
          onToggleFavorite={toggleFavorite}
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
          onHistoryOpen={() => { setHistoryOpen(true); bump('historyOpened') }}
        />
      </div>

      <div style={{ display: tab === 'canrun' ? '' : 'none' }}>
        <CanIRunIt sel={build.sel} />
      </div>

      <div style={{ display: tab === 'saved' ? '' : 'none' }}>
        <Saved
          savedBuilds={savedBuilds}
          favorites={favorites}
          onLoadBuild={loadSaved}
          onDeleteBuild={deleteSaved}
          onClearFavorite={clearFavorite}
        />
      </div>

      <AchievementPopup achievement={achCurrent} onDismiss={dismissAch} />

      {historyOpen && <PriceHistoryModal onClose={() => setHistoryOpen(false)} />}
      {shareOpen   && <ShareModal sel={build.sel} selShop={build.selShop} total={build.total} onClose={() => setShareOpen(false)} />}

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
