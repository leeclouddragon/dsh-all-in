import assert from 'node:assert/strict'
import test from 'node:test'
import { compareValues, createDeck, evaluateBest, evaluateFive, type Card, type Rank, type Suit } from '../src/client/poker.ts'

const suit = (value: string): Suit => value as Suit
const card = (rank: number, value: string): Card => ({ rank: rank as Rank, suit: suit(value) })

test('creates a unique 52-card deck', () => {
  const deck = createDeck()
  assert.equal(deck.length, 52)
  assert.equal(new Set(deck.map(value => `${value.rank}-${value.suit}`)).size, 52)
})

test('recognizes the wheel as a five-high straight', () => {
  const value = evaluateFive([
    card(14, 'spades'), card(2, 'clubs'), card(3, 'diamonds'), card(4, 'hearts'), card(5, 'spades'),
  ])
  assert.equal(value.label, 'Straight')
  assert.deepEqual(value.kickers, [5])
})

test('orders full house above a flush', () => {
  const fullHouse = evaluateFive([
    card(13, 'spades'), card(13, 'clubs'), card(13, 'diamonds'), card(7, 'hearts'), card(7, 'spades'),
  ])
  const flush = evaluateFive([
    card(14, 'hearts'), card(11, 'hearts'), card(8, 'hearts'), card(4, 'hearts'), card(2, 'hearts'),
  ])
  assert.ok(compareValues(fullHouse, flush) > 0)
})

test('selects the best five cards from seven', () => {
  const value = evaluateBest([
    card(14, 'spades'), card(13, 'spades'), card(12, 'spades'), card(11, 'spades'),
    card(10, 'spades'), card(2, 'clubs'), card(2, 'diamonds'),
  ])
  assert.equal(value.label, 'Straight flush')
  assert.deepEqual(value.kickers, [14])
})
