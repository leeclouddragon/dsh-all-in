import { act, createGame, spectateNext, type PlayerAction } from './game.ts'
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
  let spectatorTimer: ReturnType<typeof setTimeout> | undefined
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
  const stopSpectating = (): void => {
    if (spectatorTimer === undefined) return
    clearTimeout(spectatorTimer)
    spectatorTimer = undefined
  }
  const scheduleSpectating = (): void => {
    stopSpectating()
    const hero = snapshot.game.seats[snapshot.game.userSeat]
    if (!snapshot.open || snapshot.game.street === 'hand-over' || hero?.folded !== true) return
    spectatorTimer = setTimeout(() => {
      spectatorTimer = undefined
      publish({ ...snapshot, game: spectateNext(snapshot.game) })
      scheduleSpectating()
    }, 950)
  }
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    open: () => { publish({ ...snapshot, open: true }); scheduleSpectating() },
    close: () => { stopSpectating(); publish({ ...snapshot, open: false }) },
    toggle: () => { stopSpectating(); publish({ ...snapshot, open: !snapshot.open }); scheduleSpectating() },
    act: (action: PlayerAction) => {
      stopSpectating()
      publish({ ...snapshot, game: act(snapshot.game, action) })
      scheduleSpectating()
    },
    nextHand: () => { stopSpectating(); publish({ ...snapshot, game: createGame(Math.random, snapshot.game) }) },
    reset: () => { stopSpectating(); publish({ open: true, game: createGame() }) },
  }
}
