import { compareValues, createDeck, evaluateBest, shuffle, type Card, type HandValue } from './poker.ts'

export type Street = 'preflop' | 'flop' | 'turn' | 'river' | 'hand-over'
export type PlayerAction = 'fold' | 'check' | 'call' | 'raise' | 'all-in'
export type BotDifficulty = 'casual' | 'standard' | 'expert' | 'gto'

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
  readonly minRaiseTo: number
  readonly maxRaiseTo: number
  readonly raiseTo: number
  readonly canCheck: boolean
  readonly canCall: boolean
  readonly canRaise: boolean
  readonly canAllIn: boolean
}

const NAMES = ['You', 'Shark', 'Oracle', 'Mochi', 'Glitch', 'Ghost'] as const
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

function clamp(value: number, minimum = 0, maximum = 1): number {
  return Math.max(minimum, Math.min(maximum, value))
}

function cardKey(card: Card): string {
  return `${card.rank}-${card.suit}`
}

/** Estimate showdown equity without reading any opponent hole cards or the real deck order. */
export function estimateEquity(
  hole: readonly Card[],
  board: readonly Card[],
  opponentCount: number,
  random: () => number = Math.random,
  samples = 64,
): number {
  if (hole.length !== 2) return 0
  const known = new Set([...hole, ...board].map(cardKey))
  const unseen = createDeck().filter(card => !known.has(cardKey(card)))
  const boardNeeded = Math.max(0, 5 - board.length)
  const opponents = Math.max(0, Math.min(opponentCount, Math.floor((unseen.length - boardNeeded) / 2)))
  if (opponents === 0) return 1
  const iterations = Math.max(1, Math.floor(samples))
  const drawCount = boardNeeded + opponents * 2
  let equity = 0

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const pool = [...unseen]
    for (let draw = 0; draw < drawCount; draw += 1) {
      const swap = draw + Math.floor(random() * (pool.length - draw))
      const card = pool[draw] as Card
      pool[draw] = pool[swap] as Card
      pool[swap] = card
    }
    const completedBoard = [...board, ...pool.slice(0, boardNeeded)]
    const heroValue = evaluateBest([...hole, ...completedBoard])
    let tiedOpponents = 0
    let lost = false
    for (let opponent = 0; opponent < opponents; opponent += 1) {
      const offset = boardNeeded + opponent * 2
      const opponentValue = evaluateBest([
        pool[offset] as Card,
        pool[offset + 1] as Card,
        ...completedBoard,
      ])
      const comparison = compareValues(heroValue, opponentValue)
      if (comparison < 0) {
        lost = true
        break
      }
      if (comparison === 0) tiedOpponents += 1
    }
    if (!lost) equity += 1 / (tiedOpponents + 1)
  }
  return equity / iterations
}

function legalActionsFor(state: GameState, index: number): LegalActions {
  const seat = state.seats[index] as Seat
  const ownsTurn = state.street !== 'hand-over' && state.actingSeat === index && !seat.folded && !seat.allIn
  const toCall = Math.max(0, state.currentBet - seat.streetBet)
  const pot = potOf(state)
  const suggestedRaise = Math.max(state.lastRaiseSize, Math.round(Math.max(state.bigBlind, pot * 0.75) / state.bigBlind) * state.bigBlind)
  const maximumTo = seat.streetBet + seat.stack
  const minimumTo = state.currentBet + state.lastRaiseSize
  const raiseTo = Math.min(maximumTo, Math.max(minimumTo, state.currentBet + suggestedRaise))
  const raiseRightsOpen = !state.actedSinceFullRaise.includes(index)
  return {
    toCall,
    minRaiseTo: minimumTo,
    maxRaiseTo: maximumTo,
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

function actAt(state: GameState, index: number, action: PlayerAction, requestedRaiseTo?: number): GameState {
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
    const raiseTo = requestedRaiseTo ?? legal.raiseTo
    if (!Number.isFinite(raiseTo) || !Number.isInteger(raiseTo) || raiseTo < legal.minRaiseTo || raiseTo > legal.maxRaiseTo) return state
    const oldBet = next.currentBet
    const amount = raiseTo - seat.streetBet
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

const BOT_PROFILES = [
  { aggression: 0, looseness: 0, bluff: 0 },
  { aggression: 0.14, looseness: 0.06, bluff: 0.08 },
  { aggression: -0.04, looseness: -0.07, bluff: 0.01 },
  { aggression: 0.04, looseness: 0.13, bluff: 0.05 },
  { aggression: 0.02, looseness: 0.01, bluff: 0.025 },
  { aggression: -0.02, looseness: -0.03, bluff: 0.09 },
] as const

const BOT_DIFFICULTIES = {
  casual: {
    samples: [24, 32, 40],
    equityNoise: 0.13,
    foldSlack: 0.085,
    positionWeight: 0.3,
    bluffWeight: 1.35,
    raiseThreshold: 0.035,
    solverStrategy: false,
  },
  standard: {
    samples: [56, 72, 84],
    equityNoise: 0.025,
    foldSlack: 0.025,
    positionWeight: 1,
    bluffWeight: 1,
    raiseThreshold: 0,
    solverStrategy: false,
  },
  expert: {
    samples: [144, 192, 256],
    equityNoise: 0.008,
    foldSlack: 0.005,
    positionWeight: 1.15,
    bluffWeight: 0.9,
    raiseThreshold: -0.018,
    solverStrategy: false,
  },
  gto: {
    samples: [384, 512, 768],
    equityNoise: 0,
    foldSlack: 0,
    positionWeight: 1.2,
    bluffWeight: 1,
    raiseThreshold: -0.028,
    solverStrategy: true,
  },
} as const

interface BotDecision {
  readonly action: PlayerAction
  readonly raiseTo?: number
}

function raisesThisStreet(state: GameState): number {
  let count = 0
  for (let index = state.logs.length - 1; index >= 0; index -= 1) {
    const message = state.logs[index] ?? ''
    if (/^(?:Hand #\d+|Flop dealt|Turn dealt|River dealt)$/.test(message)) break
    if (message.includes(' raises to ')) count += 1
  }
  return count
}

function botPositionEdge(state: GameState, index: number): number {
  const distance = (index - state.dealer + state.seats.length) % state.seats.length
  if (distance === 0) return 0.045
  return distance / Math.max(1, state.seats.length - 1) * 0.035
}

function botRaiseTarget(state: GameState, legal: LegalActions, equity: number, solverStrategy: boolean): number {
  const fraction = solverStrategy
    ? state.board.length === 0 ? 0.5 : equity >= 0.74 ? 0.75 : 0.33
    : equity >= 0.72 ? 0.9 : equity >= 0.55 ? 0.7 : 0.5
  const increment = Math.max(state.lastRaiseSize, Math.round(potOf(state) * fraction / state.bigBlind) * state.bigBlind)
  return Math.max(legal.minRaiseTo, Math.min(legal.maxRaiseTo, state.currentBet + increment))
}

function chooseBotDecision(state: GameState, index: number, random: () => number, difficulty: BotDifficulty): BotDecision {
  const seat = state.seats[index] as Seat
  const legal = legalActionsFor(state, index)
  const opponentCount = state.seats.filter((candidate, candidateIndex) => candidateIndex !== index && !candidate.folded).length
  const level = BOT_DIFFICULTIES[difficulty]
  const sampleIndex = state.board.length === 0 ? 0 : state.board.length === 3 ? 1 : 2
  const equityEstimate = estimateEquity(seat.hole, state.board, opponentCount, random, level.samples[sampleIndex])
  const equity = clamp(equityEstimate + (random() * 2 - 1) * level.equityNoise)
  const potOdds = legal.toCall / Math.max(1, potOf(state) + legal.toCall)
  const profile = BOT_PROFILES[index] ?? BOT_PROFILES[0]
  const adjustedEquity = clamp(equity + profile.looseness * 0.06 + botPositionEdge(state, index) * level.positionWeight)
  const fairShare = 1 / Math.max(1, opponentCount + 1)
  const valueEdge = adjustedEquity - fairShare
  const callEdge = adjustedEquity - potOdds
  const raises = raisesThisStreet(state)
  const canEscalate = raises < 2
  const stackToPot = seat.stack / Math.max(state.bigBlind, potOf(state))
  const canShove = legal.canAllIn && (seat.stack <= state.bigBlind * 12 || stackToPot <= 1.15)
  const raise = (): BotDecision => ({ action: 'raise', raiseTo: botRaiseTarget(state, legal, equity, level.solverStrategy) })
  const balancedBluffFrequency = clamp(
    (legal.toCall || potOf(state) * 0.5) / Math.max(1, potOf(state) + 2 * (legal.toCall || potOf(state) * 0.5)),
    0.035,
    0.18,
  )

  if (legal.canCheck) {
    if (canShove && adjustedEquity > Math.max(0.62, fairShare + 0.24) && random() < 0.45 + Math.max(0, profile.aggression)) {
      return { action: 'all-in' }
    }
    const openBetChance = level.solverStrategy
      ? valueEdge >= 0
        ? clamp(0.16 + valueEdge * 1.4 + botPositionEdge(state, index) * level.positionWeight, 0.12, 0.82)
        : balancedBluffFrequency * (0.72 + profile.bluff * 2)
      : clamp(0.06 + Math.max(0, valueEdge) * 1.15 + Math.max(0, profile.aggression) * 0.75 + profile.bluff * level.bluffWeight + botPositionEdge(state, index) * level.positionWeight, 0.04, 0.78)
    if (legal.canRaise && canEscalate && random() < openBetChance) return raise()
    return { action: 'check' }
  }
  const bluffFrequency = level.solverStrategy
    ? balancedBluffFrequency * clamp(0.65 + profile.bluff * 2, 0.65, 0.95)
    : profile.bluff * level.bluffWeight * clamp(1 - potOdds, 0.15, 0.8)
  const bluffRaise = legal.canRaise && canEscalate && adjustedEquity < potOdds && random() < bluffFrequency
  if (adjustedEquity < Math.max(0.05, potOdds - level.foldSlack) && !bluffRaise) return { action: 'fold' }
  if (bluffRaise) return raise()
  if (canShove && adjustedEquity > Math.max(0.58, potOdds + 0.18) && random() < 0.38 + Math.max(0, profile.aggression)) {
    return { action: 'all-in' }
  }
  const raiseChance = clamp(0.18 + Math.max(0, callEdge) * 0.9 + Math.max(0, profile.aggression), 0.12, 0.72)
  if (legal.canRaise && canEscalate && callEdge > 0.13 + raises * 0.035 + level.raiseThreshold && random() < raiseChance) return raise()
  return { action: 'call' }
}

export function potOf(state: GameState): number {
  return state.seats.reduce((sum, seat) => sum + seat.committed, 0)
}

export function legalActions(state: GameState): LegalActions {
  return legalActionsFor(state, state.userSeat)
}

export function act(state: GameState, action: PlayerAction, raiseTo?: number): GameState {
  return actAt(state, state.userSeat, action, raiseTo)
}

/** Advance exactly one bot decision or one all-in board runout street. */
export function advanceAutomatic(
  state: GameState,
  random: () => number = Math.random,
  difficulty: BotDifficulty = 'standard',
): GameState {
  if (state.street === 'hand-over') return state
  if (state.actingSeat === null) return withPot(finishStreet(state))
  const actor = state.seats[state.actingSeat]
  if (actor === undefined || !actor.bot) return state
  const decision = chooseBotDecision(state, state.actingSeat, random, difficulty)
  return actAt(state, state.actingSeat, decision.action, decision.raiseTo)
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
  const holes: Card[][] = NAMES.map(() => [])
  for (let round = 0; round < 2; round += 1) {
    for (let offset = 1; offset <= skeleton.length; offset += 1) {
      const index = (dealer + offset) % skeleton.length
      if ((stacks[index] ?? 0) <= 0) continue
      holes[index]?.push(deck.shift() as Card)
    }
  }
  const seats: Seat[] = NAMES.map((name, index) => ({
    id: index === 0 ? 'hero' : `bot-${index}`,
    name,
    bot: index !== 0,
    stack: stacks[index] as number,
    hole: holes[index] ?? [],
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
