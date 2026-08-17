import { createDeck, evaluateBest, shuffle, compareValues, type Card, type HandValue } from './poker.ts'

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
const STARTING_STACK = 10_000

function replaceSeat(state: GameState, index: number, change: (seat: Seat) => Seat): GameState {
  const seats = [...state.seats]
  seats[index] = change(seats[index] as Seat)
  return { ...state, seats }
}

function addLog(state: GameState, message: string): GameState {
  return { ...state, logs: [...state.logs.slice(-5), message] }
}

function pay(state: GameState, index: number, requested: number): GameState {
  const seat = state.seats[index] as Seat
  const amount = Math.min(requested, seat.stack)
  return replaceSeat(state, index, current => ({
    ...current,
    stack: current.stack - amount,
    streetBet: current.streetBet + amount,
    committed: current.committed + amount,
    allIn: current.stack === amount,
  }))
}

function nextLiveIndex(seats: readonly Seat[], from: number): number {
  for (let offset = 1; offset <= seats.length; offset += 1) {
    const index = (from + offset) % seats.length
    if ((seats[index]?.stack ?? 0) > 0) return index
  }
  return from
}

function activeSeats(state: GameState): Array<[number, Seat]> {
  return state.seats.map((seat, index) => [index, seat] as [number, Seat]).filter(([, seat]) => !seat.folded)
}

function awardUncontested(state: GameState): GameState {
  const active = activeSeats(state)
  if (active.length !== 1) return state
  const [index, winner] = active[0] as [number, Seat]
  const pot = state.pot
  let next = replaceSeat(state, index, seat => ({ ...seat, stack: seat.stack + pot, result: `Won ${pot.toLocaleString()}` }))
  next = { ...next, street: 'hand-over', currentBet: 0, winners: [winner.id] }
  return addLog(next, `${winner.name} wins ${pot.toLocaleString()} uncontested`)
}

function settleShowdown(state: GameState): GameState {
  let seats = state.seats.map(seat => ({ ...seat }))
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
      remainder -= remainder > 0 ? 1 : 0
    }
  }
  for (const [index, amount] of won) {
    const seat = seats[index] as Seat
    const value = evaluateBest([...seat.hole, ...state.board])
    seats[index] = { ...seat, stack: seat.stack + amount, result: `${value.label} · +${amount.toLocaleString()}` }
  }
  const winnerIds = [...won.keys()].map(index => (seats[index] as Seat).id)
  const names = [...won.keys()].map(index => (seats[index] as Seat).name).join(' & ')
  return addLog({ ...state, seats, street: 'hand-over', currentBet: 0, winners: winnerIds }, `${names} win the showdown`)
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

function resetStreet(state: GameState): GameState {
  return {
    ...state,
    currentBet: 0,
    seats: state.seats.map(seat => ({ ...seat, streetBet: 0 })),
  }
}

function advanceStreet(state: GameState): GameState {
  const uncontested = awardUncontested(state)
  if (uncontested.street === 'hand-over') return uncontested
  const ready = resetStreet(state)
  if (state.street === 'preflop') return addLog({ ...revealTo(ready, 3), street: 'flop' }, 'Flop dealt')
  if (state.street === 'flop') return addLog({ ...revealTo(ready, 4), street: 'turn' }, 'Turn dealt')
  if (state.street === 'turn') return addLog({ ...revealTo(ready, 5), street: 'river' }, 'River dealt')
  if (state.street === 'river') return settleShowdown(revealTo(ready, 5))
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

function botsRespond(state: GameState, random: () => number): GameState {
  let next = state
  for (let index = 0; index < next.seats.length; index += 1) {
    const seat = next.seats[index] as Seat
    if (!seat.bot || seat.folded || seat.allIn) continue
    const toCall = Math.max(0, next.currentBet - seat.streetBet)
    if (toCall === 0) {
      next = addLog(next, `${seat.name} checks`)
      continue
    }
    const strength = botStrength(next, seat)
    const pressure = toCall / Math.max(1, seat.stack + toCall)
    if (strength + random() * 0.42 < pressure * 1.8 + 0.28) {
      next = replaceSeat(next, index, current => ({ ...current, folded: true }))
      next = addLog(next, `${seat.name} folds`)
    } else {
      next = pay(next, index, toCall)
      next = addLog(next, `${seat.name} calls ${Math.min(toCall, seat.stack).toLocaleString()}`)
    }
  }
  return next
}

function finishAfterUserAction(state: GameState, random: () => number): GameState {
  let next = botsRespond(state, random)
  next = awardUncontested(next)
  if (next.street === 'hand-over') return next
  const user = next.seats[next.userSeat] as Seat
  if (user.folded) {
    return advanceStreet(next)
  }
  if (user.allIn) {
    while (next.street !== 'hand-over') next = advanceStreet(next)
    return next
  }
  if (activeSeats(next).every(([, seat]) => seat.allIn)) {
    while (next.street !== 'hand-over') next = advanceStreet(next)
    return next
  }
  return advanceStreet(next)
}

/** Advance one visible street while the hero is no longer in the hand. */
export function spectateNext(state: GameState, random: () => number = Math.random): GameState {
  if (state.street === 'hand-over') return state
  const user = state.seats[state.userSeat] as Seat
  if (!user.folded) return state
  let next = botsRespond(state, random)
  next = awardUncontested(next)
  if (next.street !== 'hand-over') next = advanceStreet(next)
  return { ...next, pot: potOf(next) }
}

export function potOf(state: GameState): number {
  return state.seats.reduce((sum, seat) => sum + seat.committed, 0)
}

export function legalActions(state: GameState): LegalActions {
  const user = state.seats[state.userSeat] as Seat
  const toCall = Math.max(0, state.currentBet - user.streetBet)
  const pot = potOf(state)
  const raiseBy = Math.max(state.bigBlind, Math.round(pot * 0.75 / state.bigBlind) * state.bigBlind)
  const raiseTo = state.currentBet + raiseBy
  return {
    toCall,
    raiseTo,
    canCheck: state.street !== 'hand-over' && toCall === 0 && !user.folded && !user.allIn,
    canCall: state.street !== 'hand-over' && toCall > 0 && user.stack > 0 && !user.folded,
    canRaise: state.street !== 'hand-over' && user.stack > toCall + state.bigBlind && !user.folded,
    canAllIn: state.street !== 'hand-over' && user.stack > 0 && !user.folded,
  }
}

export function act(state: GameState, action: PlayerAction, random: () => number = Math.random): GameState {
  if (state.street === 'hand-over') return state
  const legal = legalActions(state)
  const user = state.seats[state.userSeat] as Seat
  let next = state
  if (action === 'fold') {
    next = replaceSeat(next, state.userSeat, seat => ({ ...seat, folded: true }))
    next = addLog(next, 'You fold')
  } else if (action === 'check' && legal.canCheck) {
    next = addLog(next, 'You check')
  } else if (action === 'call' && legal.canCall) {
    next = pay(next, state.userSeat, legal.toCall)
    next = addLog(next, `You call ${Math.min(legal.toCall, user.stack).toLocaleString()}`)
  } else if (action === 'raise' && legal.canRaise) {
    const amount = Math.min(user.stack, legal.raiseTo - user.streetBet)
    next = pay(next, state.userSeat, amount)
    next = { ...next, currentBet: (next.seats[state.userSeat] as Seat).streetBet }
    next = addLog(next, `You raise to ${next.currentBet.toLocaleString()}`)
  } else if (action === 'all-in' && legal.canAllIn) {
    next = pay(next, state.userSeat, user.stack)
    next = { ...next, currentBet: Math.max(next.currentBet, (next.seats[state.userSeat] as Seat).streetBet) }
    next = addLog(next, `You shove ${user.stack.toLocaleString()}`)
  } else {
    return state
  }
  const finished = finishAfterUserAction(next, random)
  return { ...finished, pot: potOf(finished) }
}

export function createGame(random: () => number = Math.random, previous?: GameState): GameState {
  const oldSeats = previous?.seats
  const stacks = NAMES.map((_, index) => oldSeats?.[index]?.stack ?? STARTING_STACK)
  if (stacks.filter(stack => stack > 0).length < 2 || stacks[0] === 0) stacks.fill(STARTING_STACK)
  const dealer = previous === undefined ? 5 : nextLiveIndex(oldSeats ?? [], previous.dealer)
  const smallBlindIndex = nextLiveIndex(stacks.map((stack, index) => ({ stack, id: String(index), name: '', bot: true, hole: [], folded: false, allIn: false, streetBet: 0, committed: 0 })), dealer)
  const bigBlindIndex = nextLiveIndex(stacks.map((stack, index) => ({ stack, id: String(index), name: '', bot: true, hole: [], folded: false, allIn: false, streetBet: 0, committed: 0 })), smallBlindIndex)
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
    smallBlind: 50,
    bigBlind: 100,
    currentBet: 100,
    userSeat: 0,
    pot: 0,
    logs: [`Hand #${(previous?.handNumber ?? 0) + 1}`],
    winners: [],
  }
  state = pay(state, smallBlindIndex, state.smallBlind)
  state = pay(state, bigBlindIndex, state.bigBlind)
  state = addLog(state, `${state.seats[smallBlindIndex]?.name} posts ${state.smallBlind}; ${state.seats[bigBlindIndex]?.name} posts ${state.bigBlind}`)
  return { ...state, pot: potOf(state) }
}
