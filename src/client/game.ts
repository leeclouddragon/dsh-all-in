import { compareValues, createDeck, evaluateBest, shuffle, type Card, type HandValue } from './poker.ts'

export type Street = 'preflop' | 'flop' | 'turn' | 'river' | 'hand-over'
export type PlayerAction = 'fold' | 'check' | 'call' | 'raise' | 'all-in'

export interface Seat {
  readonly id: string
  readonly name: string
  readonly bot: boolean
  readonly stack: number
  readonly hole: readonly Card[]
  readonly folded: boolean
  readonly allIn: boolean
  readonly streetBet: number
  readonly committed: number
  readonly result?: string
}

export interface GameState {
  readonly handNumber: number
  readonly dealer: number
  readonly street: Street
  readonly board: readonly Card[]
  readonly deck: readonly Card[]
  readonly seats: readonly Seat[]
  readonly smallBlind: number
  readonly bigBlind: number
  readonly currentBet: number
  readonly lastRaiseSize: number
  readonly actingSeat: number | null
  readonly pendingActors: readonly number[]
  readonly actedSinceFullRaise: readonly number[]
  readonly userSeat: number
  readonly pot: number
  readonly logs: readonly string[]
  readonly winners: readonly string[]
}

export interface LegalActions {
  readonly toCall: number
  readonly raiseTo: number
  readonly canCheck: boolean
  readonly canCall: boolean
  readonly canRaise: boolean
  readonly canAllIn: boolean
}

const NAMES = ['You', 'Ada', 'Turing', 'Hopper', 'Linus', 'Satoshi'] as const
export const STARTING_STACK = 5_000_000
export const SMALL_BLIND = 25_000
export const BIG_BLIND = 50_000

export function formatTokenAmount(value: number): string {
  if (value >= 1_000_000) return `${Number((value / 1_000_000).toFixed(2))}M`
  if (value >= 1_000) return `${Number((value / 1_000).toFixed(1))}K`
  return value.toLocaleString()
}

function replaceSeat(state: GameState, index: number, change: (seat: Seat) => Seat): GameState {
  const seats = [...state.seats]
  seats[index] = change(seats[index] as Seat)
  return { ...state, seats }
}

function addLog(state: GameState, message: string): GameState {
  return { ...state, logs: [...state.logs.slice(-8), message] }
}

function pay(state: GameState, index: number, requested: number): GameState {
  const seat = state.seats[index] as Seat
  const amount = Math.min(Math.max(0, requested), seat.stack)
  return replaceSeat(state, index, current => ({
    ...current,
    stack: current.stack - amount,
    streetBet: current.streetBet + amount,
    committed: current.committed + amount,
    allIn: current.stack === amount,
  }))
}

function nextIndex(seats: readonly Seat[], from: number, predicate: (seat: Seat, index: number) => boolean): number | null {
  for (let offset = 1; offset <= seats.length; offset += 1) {
    const index = (from + offset) % seats.length
    const seat = seats[index]
    if (seat !== undefined && predicate(seat, index)) return index
  }
  return null
}

function nextFundedIndex(seats: readonly Seat[], from: number): number {
  return nextIndex(seats, from, seat => seat.stack > 0) ?? from
}

export function blindSeatIndices(state: GameState): { smallBlindSeat: number; bigBlindSeat: number } {
  const inHand = (seat: Seat): boolean => seat.stack + seat.committed > 0
  const fundedCount = state.seats.filter(inHand).length
  const smallBlindSeat = fundedCount === 2
    ? state.dealer
    : nextIndex(state.seats, state.dealer, inHand) ?? state.dealer
  const bigBlindSeat = nextIndex(state.seats, smallBlindSeat, inHand) ?? smallBlindSeat
  return { smallBlindSeat, bigBlindSeat }
}

function nextPendingIndex(state: GameState, from: number, pending: readonly number[]): number | null {
  const allowed = new Set(pending)
  return nextIndex(state.seats, from, (_seat, index) => allowed.has(index))
}

function activeSeats(state: GameState): Array<[number, Seat]> {
  return state.seats.map((seat, index) => [index, seat] as [number, Seat]).filter(([, seat]) => !seat.folded)
}

function actionableIndices(state: GameState): number[] {
  return state.seats.flatMap((seat, index) => !seat.folded && !seat.allIn ? [index] : [])
}

function withPot(state: GameState): GameState {
  return { ...state, pot: potOf(state) }
}

function awardUncontested(state: GameState): GameState {
  const active = activeSeats(state)
  if (active.length !== 1) return state
  const [index, winner] = active[0] as [number, Seat]
  const pot = potOf(state)
  let next = replaceSeat(state, index, seat => ({ ...seat, stack: seat.stack + pot, result: `Won ${formatTokenAmount(pot)}` }))
  next = { ...next, street: 'hand-over', currentBet: 0, actingSeat: null, pendingActors: [], winners: [winner.id], pot }
  return addLog(next, `${winner.name} wins ${formatTokenAmount(pot)} uncontested`)
}

function settleShowdown(state: GameState): GameState {
  const seats = state.seats.map(seat => ({ ...seat }))
  const levels = [...new Set(seats.map(seat => seat.committed).filter(value => value > 0))].sort((a, b) => a - b)
  let lower = 0
  const won = new Map<number, number>()
  for (const level of levels) {
    const contributors = seats.map((seat, index) => ({ seat, index })).filter(({ seat }) => seat.committed >= level)
    const amount = (level - lower) * contributors.length
    lower = level
    const eligible = contributors.filter(({ seat }) => !seat.folded)
    if (eligible.length === 0) continue
    let best: HandValue | undefined
    let winners: number[] = []
    for (const { seat, index } of eligible) {
      const value = evaluateBest([...seat.hole, ...state.board])
      const comparison = best === undefined ? 1 : compareValues(value, best)
      if (comparison > 0) {
        best = value
        winners = [index]
      } else if (comparison === 0) winners.push(index)
    }
    const share = Math.floor(amount / winners.length)
    let remainder = amount - share * winners.length
    for (const index of winners) {
      won.set(index, (won.get(index) ?? 0) + share + (remainder > 0 ? 1 : 0))
      if (remainder > 0) remainder -= 1
    }
  }
  for (const [index, amount] of won) {
    const seat = seats[index] as Seat
    const value = evaluateBest([...seat.hole, ...state.board])
    seats[index] = { ...seat, stack: seat.stack + amount, result: `${value.label} · +${formatTokenAmount(amount)}` }
  }
  const winnerIds = [...won.keys()].map(index => (seats[index] as Seat).id)
  const names = [...won.keys()].map(index => (seats[index] as Seat).name).join(' & ')
  const pot = potOf(state)
  return addLog({
    ...state,
    seats,
    street: 'hand-over',
    currentBet: 0,
    actingSeat: null,
    pendingActors: [],
    winners: winnerIds,
    pot,
  }, `${names} win the showdown`)
}

function revealTo(state: GameState, count: number): GameState {
  const board = [...state.board]
  const deck = [...state.deck]
  while (board.length < count) {
    const card = deck.shift()
    if (card === undefined) throw new Error('deck exhausted')
    board.push(card)
  }
  return { ...state, board, deck }
}

function beginPostflopStreet(state: GameState, street: Exclude<Street, 'preflop' | 'hand-over'>, boardCount: number): GameState {
  let next = revealTo({
    ...state,
    street,
    currentBet: 0,
    lastRaiseSize: state.bigBlind,
    actedSinceFullRaise: [],
    seats: state.seats.map(seat => ({ ...seat, streetBet: 0 })),
  }, boardCount)
  const actionable = actionableIndices(next)
  const pending = actionable.length >= 2 ? actionable : []
  const actingSeat = pending.length === 0 ? null : nextIndex(next.seats, next.dealer, (_seat, index) => pending.includes(index))
  next = { ...next, pendingActors: pending, actingSeat }
  return addLog(next, street === 'flop' ? 'Flop dealt' : street === 'turn' ? 'Turn dealt' : 'River dealt')
}

function finishStreet(state: GameState): GameState {
  const uncontested = awardUncontested(state)
  if (uncontested.street === 'hand-over') return uncontested
  if (state.street === 'preflop') return beginPostflopStreet(state, 'flop', 3)
  if (state.street === 'flop') return beginPostflopStreet(state, 'turn', 4)
  if (state.street === 'turn') return beginPostflopStreet(state, 'river', 5)
  if (state.street === 'river') return settleShowdown(revealTo(state, 5))
  return state
}

function preflopStrength(cards: readonly Card[]): number {
  const first = cards[0]
  const second = cards[1]
  if (first === undefined || second === undefined) return 0
  const high = Math.max(first.rank, second.rank)
  const low = Math.min(first.rank, second.rank)
  const pair = high === low ? 0.38 + high / 24 : 0
  const suited = first.suit === second.suit ? 0.08 : 0
  const connected = Math.max(0, 0.08 - Math.abs(high - low) * 0.015)
  return Math.min(1, high / 20 + low / 45 + pair + suited + connected)
}

function botStrength(state: GameState, seat: Seat): number {
  if (state.board.length < 3) return preflopStrength(seat.hole)
  const value = evaluateBest([...seat.hole, ...state.board])
  return Math.min(1, value.category / 8 + (value.kickers[0] ?? 0) / 42)
}

function legalActionsFor(state: GameState, index: number): LegalActions {
  const seat = state.seats[index] as Seat
  const ownsTurn = state.street !== 'hand-over' && state.actingSeat === index && !seat.folded && !seat.allIn
  const toCall = Math.max(0, state.currentBet - seat.streetBet)
  const pot = potOf(state)
  const suggestedRaise = Math.max(state.lastRaiseSize, Math.round(Math.max(state.bigBlind, pot * 0.75) / state.bigBlind) * state.bigBlind)
  const raiseTo = state.currentBet + suggestedRaise
  const maximumTo = seat.streetBet + seat.stack
  const raiseRightsOpen = !state.actedSinceFullRaise.includes(index)
  return {
    toCall,
    raiseTo,
    canCheck: ownsTurn && toCall === 0,
    canCall: ownsTurn && toCall > 0 && seat.stack > 0,
    canRaise: ownsTurn && raiseRightsOpen && maximumTo >= state.currentBet + state.lastRaiseSize,
    canAllIn: ownsTurn && seat.stack > 0,
  }
}

function recordActed(state: GameState, index: number): number[] {
  return state.actedSinceFullRaise.includes(index)
    ? [...state.actedSinceFullRaise]
    : [...state.actedSinceFullRaise, index]
}

function resolveAfterAction(state: GameState, actor: number, fullRaise: boolean, raisedBet: boolean): GameState {
  const uncontested = awardUncontested(state)
  if (uncontested.street === 'hand-over') return uncontested

  const actionable = actionableIndices(state)
  let pending: number[]
  let acted = recordActed(state, actor)
  if (fullRaise) {
    pending = actionable.filter(index => index !== actor)
    acted = [actor]
  } else {
    const remaining = state.pendingActors.filter(index => index !== actor && actionable.includes(index))
    const owesNewBet = raisedBet
      ? actionable.filter(index => index !== actor && (state.seats[index]?.streetBet ?? 0) < state.currentBet)
      : []
    pending = [...new Set([...remaining, ...owesNewBet])]
  }

  if (pending.length === 0) {
    return withPot(addLog({
      ...state,
      pendingActors: [],
      actingSeat: null,
      actedSinceFullRaise: acted,
    }, `${state.street === 'preflop' ? 'Pre-flop' : state.street[0]?.toUpperCase()}${state.street === 'preflop' ? '' : state.street.slice(1)} betting complete`))
  }
  const actingSeat = nextPendingIndex(state, actor, pending)
  if (actingSeat === null) throw new Error('pending betting actors have no next seat')
  return withPot({ ...state, pendingActors: pending, actingSeat, actedSinceFullRaise: acted })
}

function actAt(state: GameState, index: number, action: PlayerAction): GameState {
  if (state.street === 'hand-over' || state.actingSeat !== index) return state
  const legal = legalActionsFor(state, index)
  const seat = state.seats[index] as Seat
  let next = state
  let fullRaise = false
  let raisedBet = false

  if (action === 'fold') {
    next = replaceSeat(next, index, current => ({ ...current, folded: true }))
    next = addLog(next, `${seat.name} folds`)
  } else if (action === 'check' && legal.canCheck) {
    next = addLog(next, `${seat.name} checks`)
  } else if (action === 'call' && legal.canCall) {
    const amount = Math.min(legal.toCall, seat.stack)
    next = pay(next, index, legal.toCall)
    next = addLog(next, `${seat.name} calls ${formatTokenAmount(amount)}${amount < legal.toCall ? ' all-in' : ''}`)
  } else if (action === 'raise' && legal.canRaise) {
    const oldBet = next.currentBet
    const amount = Math.min(seat.stack, legal.raiseTo - seat.streetBet)
    next = pay(next, index, amount)
    const newBet = (next.seats[index] as Seat).streetBet
    const raiseSize = newBet - oldBet
    next = { ...next, currentBet: newBet, lastRaiseSize: raiseSize }
    next = addLog(next, `${seat.name} raises to ${formatTokenAmount(newBet)}`)
    fullRaise = true
    raisedBet = true
  } else if (action === 'all-in' && legal.canAllIn) {
    const oldBet = next.currentBet
    next = pay(next, index, seat.stack)
    const newBet = (next.seats[index] as Seat).streetBet
    if (newBet > oldBet) {
      const raiseSize = newBet - oldBet
      fullRaise = raiseSize >= next.lastRaiseSize
      raisedBet = true
      next = { ...next, currentBet: newBet, lastRaiseSize: fullRaise ? raiseSize : next.lastRaiseSize }
    }
    next = addLog(next, `${seat.name} moves all-in for ${formatTokenAmount(seat.stack)}`)
  } else {
    return state
  }
  return resolveAfterAction(next, index, fullRaise, raisedBet)
}

function chooseBotAction(state: GameState, index: number, random: () => number): PlayerAction {
  const seat = state.seats[index] as Seat
  const legal = legalActionsFor(state, index)
  const strength = botStrength(state, seat)
  const potOdds = legal.toCall / Math.max(1, potOf(state) + legal.toCall)

  if (legal.canCheck) {
    if (legal.canAllIn && strength > 0.92 && random() < 0.12) return 'all-in'
    if (legal.canRaise && strength + random() * 0.22 > 0.83) return 'raise'
    return 'check'
  }
  if (strength + random() * 0.34 < potOdds + 0.22) return 'fold'
  if (legal.canAllIn && strength > 0.9 && random() < 0.2) return 'all-in'
  if (legal.canRaise && strength + random() * 0.18 > 0.9) return 'raise'
  return 'call'
}

export function potOf(state: GameState): number {
  return state.seats.reduce((sum, seat) => sum + seat.committed, 0)
}

export function legalActions(state: GameState): LegalActions {
  return legalActionsFor(state, state.userSeat)
}

export function act(state: GameState, action: PlayerAction): GameState {
  return actAt(state, state.userSeat, action)
}

/** Advance exactly one bot decision or one all-in board runout street. */
export function advanceAutomatic(state: GameState, random: () => number = Math.random): GameState {
  if (state.street === 'hand-over') return state
  if (state.actingSeat === null) return withPot(finishStreet(state))
  const actor = state.seats[state.actingSeat]
  if (actor === undefined || !actor.bot) return state
  return actAt(state, state.actingSeat, chooseBotAction(state, state.actingSeat, random))
}

export function createGame(random: () => number = Math.random, previous?: GameState): GameState {
  const oldSeats = previous?.seats
  const stacks = NAMES.map((_, index) => oldSeats?.[index]?.stack ?? STARTING_STACK)
  if (stacks.filter(stack => stack > 0).length < 2 || stacks[0] === 0) stacks.fill(STARTING_STACK)
  const dealer = previous === undefined ? 5 : nextFundedIndex(oldSeats ?? [], previous.dealer)
  const fundedCount = stacks.filter(stack => stack > 0).length
  const skeleton = stacks.map((stack, index): Seat => ({
    stack, id: String(index), name: '', bot: true, hole: [], folded: stack === 0,
    allIn: false, streetBet: 0, committed: 0,
  }))
  const smallBlindIndex = fundedCount === 2 ? dealer : nextFundedIndex(skeleton, dealer)
  const bigBlindIndex = nextFundedIndex(skeleton, smallBlindIndex)
  const deck = shuffle(createDeck(), random)
  const seats: Seat[] = NAMES.map((name, index) => ({
    id: index === 0 ? 'hero' : `bot-${index}`,
    name,
    bot: index !== 0,
    stack: stacks[index] as number,
    hole: stacks[index] === 0 ? [] : [deck.shift() as Card, deck.shift() as Card],
    folded: stacks[index] === 0,
    allIn: false,
    streetBet: 0,
    committed: 0,
  }))
  let state: GameState = {
    handNumber: (previous?.handNumber ?? 0) + 1,
    dealer,
    street: 'preflop',
    board: [],
    deck,
    seats,
    smallBlind: SMALL_BLIND,
    bigBlind: BIG_BLIND,
    currentBet: BIG_BLIND,
    lastRaiseSize: BIG_BLIND,
    actingSeat: null,
    pendingActors: [],
    actedSinceFullRaise: [],
    userSeat: 0,
    pot: 0,
    logs: [`Hand #${(previous?.handNumber ?? 0) + 1}`],
    winners: [],
  }
  state = pay(state, smallBlindIndex, state.smallBlind)
  state = pay(state, bigBlindIndex, state.bigBlind)
  state = addLog(state, `${state.seats[smallBlindIndex]?.name} posts ${formatTokenAmount(state.smallBlind)}; ${state.seats[bigBlindIndex]?.name} posts ${formatTokenAmount(state.bigBlind)}`)
  const actionable = actionableIndices(state)
  const loneActor = actionable.length === 1 ? state.seats[actionable[0] as number] : undefined
  const pending = loneActor !== undefined && loneActor.streetBet >= state.currentBet ? [] : actionable
  const actingSeat = nextIndex(state.seats, bigBlindIndex, (_seat, index) => pending.includes(index))
  return withPot({ ...state, pendingActors: pending, actingSeat })
}
