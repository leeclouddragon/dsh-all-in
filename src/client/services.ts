import type { GameState, PlayerAction } from './game.ts'

export interface SessionSummary {
  readonly running: boolean
}

export interface SessionListState {
  readonly current?: string
  readonly byId: Readonly<Record<string, SessionSummary | undefined>>
}

export type SelectorHook<T> = <Selected>(selector: (state: T) => Selected) => Selected

export interface TableSnapshot {
  readonly open: boolean
  readonly game: GameState
}

export interface TableStore {
  getSnapshot(): TableSnapshot
  subscribe(listener: () => void): () => void
  open(): void
  close(): void
  toggle(): void
  act(action: PlayerAction): void
  nextHand(): void
  reset(): void
}

export interface StandardProps {
  readonly useSessions: SelectorHook<SessionListState>
}

export interface TableFace {
  readonly useAllIn: SelectorHook<TableSnapshot>
  readonly openTable: () => void
  readonly closeTable: () => void
  readonly act: (action: PlayerAction) => void
  readonly nextHand: () => void
  readonly resetTable: () => void
}

export interface SlotsFace {
  inject(name: string, register: () => (() => void) | void): void
  register(options: Record<string, unknown>, component: unknown): () => void
}

export interface LocaleFace {
  register(namespace: string, dictionaries: Record<string, Record<string, string>>): () => void
  bind(namespace: string): (key: string) => string
}

export interface ClientCtx {
  readonly slots: SlotsFace
  readonly locale: LocaleFace
  effect(effect: () => (() => void) | void, label?: string): void
}
