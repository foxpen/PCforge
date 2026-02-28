import { useState, useCallback, useRef } from 'react'
import { achievements } from '../data/achievements.js'

export function useAchievements() {
  const [unlocked, setUnlocked] = useState(new Set())
  const [totalXp, setTotalXp] = useState(0)
  const [queue, setQueue] = useState([])
  const [current, setCurrent] = useState(null)
  const [stats, setStats] = useState({
    shared: 0, exported: 0, historyOpened: 0, canRunChecked: 0,
    buildTime: 0, openedAll: 0, catalogVisited: 0, presetLoaded: 0,
    totalClicks: 0, buildStartTime: null,
  })
  const showingRef = useRef(false)

  const trackStat = useCallback((key, value = 1) => {
    setStats(prev => ({ ...prev, [key]: prev[key] + value }))
  }, [])

  const check = useCallback((currentSel, currentSelShop, compareList, currentStats) => {
    const conditions = {
      first_pick:    () => Object.keys(currentSel).length >= 1,
      half_build:    () => Object.keys(currentSel).length >= 4,
      full_build:    () => Object.keys(currentSel).length >= 8,
      shop_picker:   () => Object.keys(currentSelShop).length >= 1,
      all_shops:     () => Object.keys(currentSelShop).length >= 8,
      compared:      () => compareList.length >= 2,
      compare_pro:   () => compareList.length >= 4,
      shared:        () => currentStats.shared >= 1,
      pdf_export:    () => currentStats.exported >= 1,
      history_view:  () => currentStats.historyOpened >= 1,
      price_watcher: () => currentStats.historyOpened >= 5,
      canrun_check:  () => currentStats.canRunChecked >= 1,
      speed_build:   () => currentStats.buildTime > 0 && currentStats.buildTime < 60,
      open_all:      () => currentStats.openedAll >= 1,
      catalog_user:  () => currentStats.catalogVisited >= 1,
      preset_load:   () => currentStats.presetLoaded >= 1,
      click_frenzy:  () => currentStats.totalClicks >= 100,
      compat_genius: () => Object.keys(currentSel).length >= 2,
    }

    const newOnes = []
    setUnlocked(prev => {
      const next = new Set(prev)
      achievements.forEach(a => {
        if (!next.has(a.id) && conditions[a.id]?.()) {
          next.add(a.id)
          newOnes.push(a)
        }
      })
      if (newOnes.length) {
        setTotalXp(x => x + newOnes.reduce((s, a) => s + a.xp, 0))
        setQueue(q => [...q, ...newOnes])
      }
      return next
    })
  }, [])

  const popNext = useCallback(() => {
    setQueue(q => {
      if (!q.length) { showingRef.current = false; setCurrent(null); return q }
      const [next, ...rest] = q
      setCurrent(next)
      showingRef.current = true
      return rest
    })
  }, [])

  const dismiss = useCallback(() => {
    setCurrent(null)
    showingRef.current = false
    setTimeout(popNext, 500)
  }, [popNext])

  // When queue changes and nothing showing, pop
  const enqueue = useCallback((items) => {
    setQueue(q => {
      const next = [...q, ...items]
      if (!showingRef.current && next.length) {
        const [first, ...rest] = next
        setCurrent(first)
        showingRef.current = true
        return rest
      }
      return next
    })
  }, [])

  const level = Math.floor(totalXp / 100) + 1
  const xpInLevel = totalXp % 100
  const xpPct = xpInLevel

  return {
    unlocked, totalXp, level, xpInLevel, xpPct,
    current, stats, trackStat, check, dismiss,
    unlockedCount: unlocked.size,
  }
}
