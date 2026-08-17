import { act, createGame, type PlayerAction } from './game.ts'
import type { TableSnapshot, TableStore } from './services.ts'

const STORAGE_KEY = 'dsh-all-in/table-v1'

function load(): TableSnapshot {
  if (typeof window === 'undefined') return { open: false, game: createGame() }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === null) return { open: false, game: createGame() }
    const parsed = JSON.parse(raw) as Partial<TableSnapshot>
    if (parsed.game === undefined || !Array.isArray(parsed.game.seats)) throw new Error('invalid saved table')
    return { open: false, game: parsed.game }
  } catch {
    return { open: false, game: createGame() }
  }
}

export function createTableStore(): TableStore {
  let snapshot = load()
  const listeners = new Set<() => void>()
  const publish = (next: TableSnapshot): void => {
    snapshot = next
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ open: false, game: snapshot.game }))
      } catch {
        // Storage can be disabled or full; gameplay remains in memory.
      }
    }
    for (const listener of listeners) listener()
  }
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    open: () => { publish({ ...snapshot, open: true }) },
    close: () => { publish({ ...snapshot, open: false }) },
    toggle: () => { publish({ ...snapshot, open: !snapshot.open }) },
    act: (action: PlayerAction) => { publish({ ...snapshot, game: act(snapshot.game, action) }) },
    nextHand: () => { publish({ ...snapshot, game: createGame(Math.random, snapshot.game) }) },
    reset: () => { publish({ open: true, game: createGame() }) },
  }
}
