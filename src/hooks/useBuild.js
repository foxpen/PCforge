import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage.js'
import { cats, getItem } from '../data/cats.js'

export function useBuild() {
  const [sel, setSel]         = useLocalStorage('pcforge_sel', {})
  const [selShop, setSelShop] = useLocalStorage('pcforge_selShop', {})

  const pick = useCallback((catKey, id) => {
    setSel(prev => {
      const next = { ...prev }
      if (next[catKey] === id) { delete next[catKey] }
      else next[catKey] = id
      return next
    })
    setSelShop(prev => { const next = { ...prev }; delete next[catKey]; return next })
  }, [])

  const pickShop = useCallback((catKey, shop) => {
    setSelShop(prev => {
      const next = { ...prev }
      if (next[catKey] === shop) delete next[catKey]
      else next[catKey] = shop
      return next
    })
  }, [])

  const removePick = useCallback((catKey) => {
    setSel(prev => { const next = { ...prev }; delete next[catKey]; return next })
    setSelShop(prev => { const next = { ...prev }; delete next[catKey]; return next })
  }, [])

  const loadPreset = useCallback((preset) => {
    setSel({ ...preset.s })
    setSelShop({})
  }, [])

  const clearBuild = useCallback(() => {
    setSel({})
    setSelShop({})
  }, [])

  const total = Object.entries(sel).reduce((sum, [k, id]) => {
    const it = getItem(id)
    if (!it) return sum
    const shop = selShop[k]
    const price = shop && it.shops[shop] ? it.shops[shop] : it.price
    return sum + price
  }, 0)

  const count = Object.keys(sel).length

  return { sel, selShop, pick, pickShop, removePick, loadPreset, clearBuild, total, count }
}
