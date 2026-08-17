import assert from 'node:assert/strict'
import test from 'node:test'
import { act, advanceAutomatic, createGame, legalActions, potOf, type GameState } from '../src/client/game.ts'

function seeded(seed = 1): () => number {
  let value = seed >>> 0
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 0x100000000
  }
}

function totalChips(state: GameState): number {
  return state.seats.reduce((sum, seat) => sum + seat.stack, 0) + (state.street === 'hand-over' ? 0 : potOf(state))
}

function advanceUntilUser(state: GameState, random: () => number, limit = 100): GameState {
  let next = state
  for (let guard = 0; guard < limit && next.street !== 'hand-over' && next.actingSeat !== next.userSeat; guard += 1) {
    const before = next
    next = advanceAutomatic(next, random)
    assert.notStrictEqual(next, before, 'automatic action must advance the state')
  }
  return next
}

function playToEnd(state: GameState, random: () => number, limit = 500): GameState {
  let next = state
  for (let guard = 0; guard < limit && next.street !== 'hand-over'; guard += 1) {
    if (next.actingSeat === next.userSeat) {
      const legal = legalActions(next)
      next = act(next, legal.canCheck ? 'check' : 'call')
    } else {
      next = advanceAutomatic(next, random)
    }
  }
  assert.equal(next.street, 'hand-over', 'hand must terminate within the action guard')
  return next
}

test('deals six unique pairs, posts blinds, and starts UTG', () => {
  const game = createGame(seeded(7))
  assert.equal(game.dealer, 5)
  assert.equal(game.seats.length, 6)
  assert.equal(game.seats.flatMap(seat => seat.hole).length, 12)
  assert.equal(new Set(game.seats.flatMap(seat => seat.hole).map(card => `${card.rank}-${card.suit}`)).size, 12)
  assert.equal(game.seats[0]?.streetBet, 50)
  assert.equal(game.seats[1]?.streetBet, 100)
  assert.equal(game.actingSeat, 2)
  assert.deepEqual(game.pendingActors, [0, 1, 2, 3, 4, 5])
  assert.equal(potOf(game), 150)
})

test('one automatic step performs exactly one seat action', () => {
  const random = seeded(21)
  const game = createGame(random)
  const next = advanceAutomatic(game, random)
  assert.equal(game.actingSeat, 2)
  assert.equal(next.actingSeat, 3)
  assert.equal(next.street, 'preflop')
  assert.ok(next.logs.length >= game.logs.length)
  assert.equal(totalChips(next), 60_000)
})

test('a full raise reopens action for players who already acted', () => {
  const random = seeded(33)
  const beforeRaise = advanceUntilUser(createGame(random), random)
  assert.equal(beforeRaise.actingSeat, beforeRaise.userSeat)
  assert.equal(legalActions(beforeRaise).canRaise, true)
  const activeOpponents = beforeRaise.seats.flatMap((seat, index) => !seat.folded && !seat.allIn && index !== beforeRaise.userSeat ? [index] : [])
  const raised = act(beforeRaise, 'raise')
  assert.deepEqual([...raised.pendingActors].sort((a, b) => a - b), [...activeOpponents].sort((a, b) => a - b))
  assert.deepEqual(raised.actedSinceFullRaise, [beforeRaise.userSeat])
  assert.notEqual(raised.actingSeat, beforeRaise.userSeat)
})

test('a short all-in requires a response without reopening raise rights', () => {
  const base = createGame(seeded(40))
  const state: GameState = {
    ...base,
    actingSeat: 0,
    currentBet: 500,
    lastRaiseSize: 400,
    pendingActors: [0],
    actedSinceFullRaise: [2],
    seats: base.seats.map((seat, index) => {
      if (index === 0) return { ...seat, stack: 500, streetBet: 200, committed: 200 }
      if (index === 2) return { ...seat, stack: 9_500, streetBet: 500, committed: 500 }
      return { ...seat, folded: true, streetBet: 0, committed: 0 }
    }),
  }
  const shortRaise = act(state, 'all-in')
  assert.equal(shortRaise.currentBet, 700)
  assert.equal(shortRaise.lastRaiseSize, 400)
  assert.deepEqual(shortRaise.actedSinceFullRaise, [2, 0])
  assert.deepEqual(shortRaise.pendingActors, [2])
  assert.equal(shortRaise.actingSeat, 2)
})

test('heads-up button posts the small blind and acts first preflop', () => {
  const random = seeded(8)
  const base = createGame(random)
  const previous: GameState = {
    ...base,
    street: 'hand-over',
    dealer: 5,
    seats: base.seats.map((seat, index) => ({ ...seat, stack: index < 2 ? 10_000 : 0 })),
  }
  const headsUp = createGame(random, previous)
  assert.equal(headsUp.dealer, 0)
  assert.equal(headsUp.seats[0]?.streetBet, 50)
  assert.equal(headsUp.seats[1]?.streetBet, 100)
  assert.equal(headsUp.actingSeat, 0)

  let postflop = act(headsUp, 'call')
  for (let guard = 0; guard < 40 && postflop.street === 'preflop'; guard += 1) {
    if (postflop.actingSeat === postflop.userSeat) {
      const legal = legalActions(postflop)
      postflop = act(postflop, legal.canCheck ? 'check' : 'call')
    } else {
      postflop = advanceAutomatic(postflop, random)
    }
  }
  assert.equal(postflop.street, 'flop')
  assert.equal(postflop.actingSeat, 1)
})

test('betting round closes only after every pending response and starts postflop left of button', () => {
  const random = seeded(12)
  let game = createGame(random)
  for (let guard = 0; guard < 150 && game.street === 'preflop'; guard += 1) {
    if (game.actingSeat === game.userSeat) {
      const legal = legalActions(game)
      game = act(game, legal.canCheck ? 'check' : 'call')
    } else {
      game = advanceAutomatic(game, random)
    }
  }
  assert.equal(game.street, 'flop')
  assert.equal(game.board.length, 3)
  const expected = game.seats.findIndex((seat, index) => index === 0 && !seat.folded && !seat.allIn)
  if (expected === 0 && game.pendingActors.length > 0) assert.equal(game.actingSeat, 0)
  assert.equal(game.currentBet, 0)
  assert.ok(game.seats.every(seat => seat.streetBet === 0))
})

test('fold removes only the hero and bots continue seat by seat', () => {
  const random = seeded(99)
  const initial = createGame(random)
  const heroBefore = initial.seats[0]?.stack ?? 0
  const userTurn = advanceUntilUser(initial, random)
  const folded = act(userTurn, 'fold')
  assert.equal(folded.seats[0]?.folded, true)
  assert.notEqual(folded.street, 'hand-over')
  assert.notEqual(folded.actingSeat, folded.userSeat)
  assert.ok((folded.seats[0]?.stack ?? 0) <= heroBefore)

  const oneBotLater = advanceAutomatic(folded, random)
  assert.notStrictEqual(oneBotLater, folded)
  const finished = playToEnd(oneBotLater, random)
  assert.equal(finished.board.length, 5)
  assert.equal(finished.seats.reduce((sum, seat) => sum + seat.stack, 0), 60_000)
})

test('all-in runout and side-pot settlement conserve the bankroll', () => {
  const random = seeded(2)
  const first = createGame(random)
  const shortPrevious: GameState = {
    ...first,
    street: 'hand-over',
    seats: first.seats.map((seat, index) => ({ ...seat, stack: index === 0 ? 500 : 10_000 })),
  }
  let game = createGame(random, shortPrevious)
  game = advanceUntilUser(game, random)
  assert.equal(game.actingSeat, game.userSeat)
  game = act(game, 'all-in')
  const finished = playToEnd(game, random)
  assert.equal(finished.board.length, 5)
  assert.ok(finished.winners.length >= 1)
  assert.equal(finished.seats.reduce((sum, seat) => sum + seat.stack, 0), 50_500)
})

test('a passive hand reaches showdown and conserves chips', () => {
  const random = seeded(77)
  const finished = playToEnd(createGame(random), random)
  assert.equal(finished.board.length, 5)
  assert.ok(finished.winners.length >= 1)
  assert.equal(finished.seats.reduce((sum, seat) => sum + seat.stack, 0), 60_000)
  assert.equal(totalChips(finished), 60_000)
})

test('seeded action-state simulations terminate without creating chips', () => {
  for (let seed = 1; seed <= 100; seed += 1) {
    const random = seeded(seed)
    const finished = playToEnd(createGame(random), random, 1_000)
    assert.equal(finished.seats.reduce((sum, seat) => sum + seat.stack, 0), 60_000, `seed ${seed}`)
  }
})
