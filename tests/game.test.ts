import assert from 'node:assert/strict'
import test from 'node:test'
import { act, createGame, legalActions, potOf, spectateNext, type GameState } from '../src/client/game.ts'

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

test('deals six unique pairs and posts blinds', () => {
  const game = createGame(seeded(7))
  assert.equal(game.seats.length, 6)
  assert.equal(game.seats.flatMap(seat => seat.hole).length, 12)
  assert.equal(new Set(game.seats.flatMap(seat => seat.hole).map(card => `${card.rank}-${card.suit}`)).size, 12)
  assert.equal(potOf(game), 150)
  assert.equal(game.currentBet, 100)
})

test('a passive hand advances through every street to showdown', () => {
  const random = seeded(12)
  let game = createGame(random)
  for (let guard = 0; guard < 5 && game.street !== 'hand-over'; guard += 1) {
    const legal = legalActions(game)
    game = act(game, legal.canCheck ? 'check' : 'call', random)
  }
  assert.equal(game.street, 'hand-over')
  assert.equal(game.board.length, 5)
  assert.ok(game.winners.length >= 1)
  assert.equal(game.seats.reduce((sum, seat) => sum + seat.stack, 0), 60_000)
})

test('all-in runs the board and conserves the table bankroll', () => {
  const random = seeded(2)
  const game = act(createGame(random), 'all-in', random)
  assert.equal(game.street, 'hand-over')
  assert.equal(game.board.length, 5)
  assert.equal(game.seats.reduce((sum, seat) => sum + seat.stack, 0), 60_000)
})

test('fold leaves the hero spectating while bots finish the hand', () => {
  const random = seeded(99)
  const initial = createGame(random)
  const heroBefore = initial.seats[0]?.stack ?? 0
  let observed = act(initial, 'fold', random)
  assert.equal(observed.seats[0]?.folded, true)
  assert.notEqual(observed.street, 'hand-over')
  assert.equal(observed.board.length, 3)
  assert.ok((observed.seats[0]?.stack ?? 0) <= heroBefore)

  for (let guard = 0; guard < 4 && observed.street !== 'hand-over'; guard += 1) {
    observed = spectateNext(observed, random)
  }
  assert.equal(observed.street, 'hand-over')
  assert.equal(observed.board.length, 5)
  assert.equal(observed.seats.reduce((sum, seat) => sum + seat.stack, 0), 60_000)
  assert.equal(totalChips(observed), 60_000)
})
