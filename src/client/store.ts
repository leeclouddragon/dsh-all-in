import { act, advanceAutomatic, createGame, type PlayerAction } from './game.ts'
import type { TableSnapshot, TableStore } from './services.ts'

const STORAGE_KEY = 'dsh-all-in/table-v2'

function load(): TableSnapshot {
  if (typeof window === 'undefined') return { open: false, game: createGame() }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === null) return { open: false, game: createGame() }
    const parsed = JSON.parse(raw) as Partial<TableSnapshot>
    if (
      parsed.game === undefined
      || !Array.isArray(parsed.game.seats)
      || !Array.isArray(parsed.game.pendingActors)
      || !Array.isArray(parsed.game.actedSinceFullRaise)
    ) throw new Error('invalid saved table')
    return { open: false, game: parsed.game }
  } catch {
    return { open: false, game: createGame() }
  }
}

export function createTableStore(): TableStore {
  let snapshot = load()
  let automationTimer: ReturnType<typeof setTimeout> | undefined
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
  const stopAutomation = (): void => {
    if (automationTimer === undefined) return
    clearTimeout(automationTimer)
    automationTimer = undefined
  }
  const scheduleAutomation = (): void => {
    stopAutomation()
    const { game } = snapshot
    if (!snapshot.open || game.street === 'hand-over') return
    const actor = game.actingSeat === null ? undefined : game.seats[game.actingSeat]
    if (actor !== undefined && !actor.bot) return
    automationTimer = setTimeout(() => {
      automationTimer = undefined
      publish({ ...snapshot, game: advanceAutomatic(snapshot.game) })
      scheduleAutomation()
    }, game.actingSeat === null ? 900 : 520)
  }
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    open: () => { publish({ ...snapshot, open: true }); scheduleAutomation() },
    close: () => { stopAutomation(); publish({ ...snapshot, open: false }) },
    toggle: () => { stopAutomation(); publish({ ...snapshot, open: !snapshot.open }); scheduleAutomation() },
    act: (action: PlayerAction) => {
      stopAutomation()
      publish({ ...snapshot, game: act(snapshot.game, action) })
      scheduleAutomation()
    },
    nextHand: () => { stopAutomation(); publish({ ...snapshot, game: createGame(Math.random, snapshot.game) }); scheduleAutomation() },
    reset: () => { stopAutomation(); publish({ open: true, game: createGame() }); scheduleAutomation() },
  }
}
