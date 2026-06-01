import { useState } from 'react'

export function useSelection() {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const clear = () => setSelected(new Set())

  const selectAll = (ids: string[]) => setSelected(new Set(ids))

  return { selected, toggle, clear, selectAll }
}
