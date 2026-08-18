import { act, advanceAutomatic, createGame, type PlayerAction } from './game.ts'
import type { TableSnapshot, TableStore } from './services.ts'

const STORAGE_KEY = 'dsh-all-in/table-v3'

function idleSnapshot(game: TableSnapshot['game'], open = false): TableSnapshot {
  return { open, game, thinkingSeat: null, thinkingRemainingMs: 0, thinkingDurationMs: 0 }
}

function load(): TableSnapshot {
  if (typeof window === 'undefined') return idleSnapshot(createGame())
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === null) return idleSnapshot(createGame())
    const parsed = JSON.parse(raw) as Partial<TableSnapshot>
    if (
      parsed.game === undefined
      || !Array.isArray(parsed.game.seats)
      || !Array.isArray(parsed.game.pendingActors)
      || !Array.isArray(parsed.game.actedSinceFullRaise)
    ) throw new Error('invalid saved table')
    return idleSnapshot(parsed.game)
  } catch {
    return idleSnapshot(createGame())
  }
}

export function createTableStore(): TableStore {
  let snapshot = load()
  let automationTimer: ReturnType<typeof setTimeout> | undefined
  let countdownTimer: ReturnType<typeof setInterval> | undefined
  const listeners = new Set<() => void>()
  const publish = (next: TableSnapshot, persist = true): void => {
    snapshot = next
    if (persist && typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ open: false, game: snapshot.game }))
      } catch {
        // Storage can be disabled or full; gameplay remains in memory.
      }
    }
    for (const listener of listeners) listener()
  }
  const clearTimers = (): void => {
    if (automationTimer !== undefined) clearTimeout(automationTimer)
    if (countdownTimer !== undefined) clearInterval(countdownTimer)
    automationTimer = undefined
    countdownTimer = undefined
  }
  const stopAutomation = (): void => {
    clearTimers()
    if (snapshot.thinkingRemainingMs > 0 || snapshot.thinkingDurationMs > 0) {
      publish({ ...snapshot, thinkingSeat: null, thinkingRemainingMs: 0, thinkingDurationMs: 0 }, false)
    }
  }
  const scheduleAutomation = (): void => {
    clearTimers()
    const { game } = snapshot
    if (!snapshot.open || game.street === 'hand-over') {
      stopAutomation()
      return
    }
    const actor = game.actingSeat === null ? undefined : game.seats[game.actingSeat]
    if (actor !== undefined && !actor.bot) {
      stopAutomation()
      return
    }
    const duration = game.actingSeat === null ? 1_500 : 2_400 + Math.floor(Math.random() * 1_800)
    const deadline = Date.now() + duration
    publish({
      ...snapshot,
      thinkingSeat: game.actingSeat,
      thinkingRemainingMs: duration,
      thinkingDurationMs: duration,
    }, false)
    countdownTimer = setInterval(() => {
      const remaining = Math.max(0, deadline - Date.now())
      publish({ ...snapshot, thinkingRemainingMs: remaining }, false)
    }, 100)
    automationTimer = setTimeout(() => {
      clearTimers()
      automationTimer = undefined
      publish({
        ...snapshot,
        game: advanceAutomatic(snapshot.game),
        thinkingSeat: null,
        thinkingRemainingMs: 0,
        thinkingDurationMs: 0,
      })
      scheduleAutomation()
    }, duration)
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
      publish({ ...snapshot, game: act(snapshot.game, action), thinkingSeat: null, thinkingRemainingMs: 0, thinkingDurationMs: 0 })
      scheduleAutomation()
    },
    nextHand: () => { stopAutomation(); publish(idleSnapshot(createGame(Math.random, snapshot.game), snapshot.open)); scheduleAutomation() },
    reset: () => { stopAutomation(); publish(idleSnapshot(createGame(), true)); scheduleAutomation() },
  }
}
