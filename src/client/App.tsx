import React from 'react'
import { FishLogo } from '@deepseek-ai/dsh-client-ui-primitives'
import { blindSeatIndices, formatTokenAmount, legalActions, potOf, STARTING_STACK, type LegalActions, type PlayerAction, type Seat, type Street } from './game.ts'
import { cardText, isRed, type Card } from './poker.ts'
import type { StandardProps, TableFace } from './services.ts'

type T = (key: string) => string

interface EntryProps extends StandardProps, TableFace {
  readonly wide: boolean
  readonly t: T
}

interface OverlayProps extends StandardProps, TableFace {
  readonly t: T
}

interface SeatEffect {
  readonly id: number
  readonly seat: number
  readonly kind: 'chips' | 'fold'
}

interface PotCollection {
  readonly id: number
  readonly bets: ReadonlyArray<{ readonly seat: number; readonly amount: number }>
}

function currentRunning(props: StandardProps): boolean {
  return props.useSessions(state => state.current === undefined ? false : state.byId[state.current]?.running === true)
}

export function SidebarEntry(props: EntryProps): React.ReactElement {
  const running = currentRunning(props)
  return (
    <button
      type="button"
      data-all-in-entry
      data-wide={String(props.wide)}
      aria-label={props.t('entry')}
      title={`${props.t('entry')} — ${running ? props.t('agentRunning') : props.t('tagline')}`}
      onClick={props.openTable}
    >
      <span className="ai-entry-icon" aria-hidden>
        <span className="ai-entry-card" /><span className="ai-entry-card" /><span className="ai-entry-pip">♥</span>
      </span>
      {props.wide ? <span className="ai-entry-copy">{props.t('entry')}</span> : null}
    </button>
  )
}

type DealStyle = React.CSSProperties & { '--ai-deal-step'?: number }
type PositionBadge = 'D' | 'SB' | 'BB'
const HOLE_DEAL_INTERVAL_MS = 170
const HOLE_DEAL_SETTLE_MS = 420
const SEAT_CHARACTERS = [
  { thought: 'Your move' },
  { thought: 'Smells weakness' },
  { thought: 'Reading the river' },
  { thought: 'Cooking chaos' },
  { thought: 'Rewriting the odds' },
  { thought: 'Setting a trap' },
] as const

function PlayingCard({ card, hidden = false, empty = false, dealStep }: { card?: Card | undefined; hidden?: boolean; empty?: boolean; dealStep?: number | undefined }): React.ReactElement {
  const style: DealStyle | undefined = dealStep === undefined ? undefined : { '--ai-deal-step': dealStep }
  if (empty) return <span className="ai-card ai-card-empty"><FishLogo className="ai-card-mark" size={22} /></span>
  if (hidden || card === undefined) return <span className="ai-card ai-card-back" data-dealing={dealStep === undefined ? undefined : 'true'} style={style}><FishLogo className="ai-card-mark" size={24} /></span>
  const text = cardText(card)
  return (
    <span className="ai-card" data-red={String(isRed(card))} data-dealing={dealStep === undefined ? undefined : 'true'} style={style}>
      <span className="ai-card-rank">{text.slice(0, -1)}</span><span className="ai-card-suit">{text.slice(-1)}</span>
    </span>
  )
}

function SeatView({ seat, position, badges, reveal, acting, thinkingMs, thinkingDurationMs, thinkingLabel, dealOrder, dealSeatCount, dealing, dealtCards, bigBlind, effect }: {
  seat: Seat
  position: number
  badges: readonly PositionBadge[]
  reveal: boolean
  acting: boolean
  thinkingMs: number
  thinkingDurationMs: number
  thinkingLabel: string
  dealOrder: number
  dealSeatCount: number
  dealing: boolean
  dealtCards: number
  bigBlind: number
  effect?: SeatEffect | undefined
}): React.ReactElement {
  const character = SEAT_CHARACTERS[position] ?? { thought: thinkingLabel }
  const thinkingProgress = thinkingDurationMs <= 0 ? 0 : Math.max(0, Math.min(1, thinkingMs / thinkingDurationMs))
  return (
    <div className="ai-seat" data-pos={position} data-folded={String(seat.folded)} data-hero={String(!seat.bot)} data-acting={String(acting)} data-effect={effect?.kind}>
      <div className="ai-hole">
        {seat.hole.length === 0 ? null : seat.hole.map((card, index) => {
          const step = dealOrder + index * dealSeatCount
          if (dealing && step >= dealtCards) return null
          return <PlayingCard key={`${card.rank}-${card.suit}`} card={card} hidden={seat.bot && !reveal} dealStep={dealing ? 0 : undefined} />
        })}
      </div>
      {effect?.kind === 'chips' ? (
        <span key={effect.id} className="ai-chip-flight" aria-hidden><i /><i /><i /></span>
      ) : null}
      {seat.streetBet > 0 ? (
        <div className="ai-bet">
          <PotChips amount={seat.streetBet} bigBlind={bigBlind} minimumLevel={3} />
          <span className="ai-bet-value">{formatTokenAmount(seat.streetBet)}</span>
        </div>
      ) : null}
      <BankrollChips key={seat.stack} amount={seat.stack} />
      <div className="ai-player">
        <span className="ai-avatar" data-character={position} title={character.thought}>
          {position === 0 ? <FishLogo size={18} /> : null}
        </span>
        <span className="ai-player-meta">
          <span className="ai-player-name">{seat.name}</span>
          <span className="ai-stack">{formatTokenAmount(seat.stack)} Tokens</span>
        </span>
        {badges.length > 0 ? (
          <span className="ai-badges">{badges.map(badge => <span key={badge} className="ai-badge" data-role={badge}>{badge}</span>)}</span>
        ) : <span />}
      </div>
      {thinkingMs > 0 ? (
        <div className="ai-thinking-chip">
          <span className="ai-thinking-copy">{seat.bot ? character.thought : thinkingLabel} · {Math.max(1, Math.ceil(thinkingMs / 1000))}s</span>
          <span className="ai-thinking-track"><span style={{ transform: `scaleX(${thinkingProgress})` }} /></span>
        </div>
      ) : null}
      {seat.result !== undefined ? <div className="ai-result">{seat.result}</div> : null}
    </div>
  )
}

function MuckedHand({ seat, position, entering, label }: { seat: Seat; position: number; entering: boolean; label: string }): React.ReactElement {
  const hero = !seat.bot
  return (
    <div
      className="ai-mucked-hand"
      data-pos={position}
      data-hero={String(hero)}
      data-entering={String(entering)}
      aria-label={hero ? label : `${seat.name} folded`}
    >
      {seat.hole.map(card => <PlayingCard key={`${card.rank}-${card.suit}`} card={card} hidden={!hero} />)}
      {hero ? <span className="ai-muck-label">{label}</span> : null}
    </div>
  )
}

type ChipTone = 'blue' | 'ink' | 'red' | 'gold'

function ChipStack({ tone, height }: { tone: ChipTone; height: number }): React.ReactElement {
  return (
    <span className="ai-pot-chip-column" data-tone={tone}>
      {Array.from({ length: height }, (_, index) => <i key={index} />)}
    </span>
  )
}

function BankrollChips({ amount }: { amount: number }): React.ReactElement | null {
  if (amount <= 0) return null
  const ratio = amount / STARTING_STACK
  const columns = Math.max(1, Math.min(4, Math.ceil(ratio * 4)))
  const peak = Math.max(2, Math.min(8, Math.ceil(ratio * 6)))
  const tones: readonly ChipTone[] = ['blue', 'ink', 'red', 'gold']
  return (
    <span className="ai-bankroll" aria-hidden>
      {Array.from({ length: columns }, (_, index) => (
        <ChipStack key={tones[index]} tone={tones[index] as ChipTone} height={Math.max(2, peak - index)} />
      ))}
    </span>
  )
}

function PotChips({ amount, bigBlind, minimumLevel = 1 }: { amount: number; bigBlind: number; minimumLevel?: number }): React.ReactElement {
  const level = Math.max(minimumLevel, Math.min(6, Math.ceil(amount / Math.max(1, bigBlind * 3))))
  const stacks = Math.max(1, Math.min(3, Math.ceil(level / 2)))
  return (
    <span className="ai-pot-chips" aria-hidden>
      <ChipStack tone="blue" height={Math.min(6, level + 1)} />
      {stacks >= 2 ? <ChipStack tone="ink" height={Math.max(3, level - 1)} /> : null}
      {stacks >= 3 ? <ChipStack tone="red" height={Math.max(2, level - 2)} /> : null}
    </span>
  )
}

const STREET_LABEL: Record<Street, string> = {
  preflop: 'Pre-flop', flop: 'Flop', turn: 'Turn', river: 'River', 'hand-over': 'Showdown',
}

function ActionButton({ action, label, disabled, primary, danger, onAction }: {
  action: PlayerAction
  label: string
  disabled?: boolean
  primary?: boolean
  danger?: boolean
  onAction: (action: PlayerAction, raiseTo?: number) => void
}): React.ReactElement {
  return <button type="button" className="ai-action" data-primary={primary || undefined} data-danger={danger || undefined} disabled={disabled} onClick={() => { onAction(action) }}>{label}</button>
}

function normalizedRaiseTo(value: number, legal: LegalActions, step: number): number {
  const bounded = Math.max(legal.minRaiseTo, Math.min(legal.maxRaiseTo, value))
  const snapped = legal.minRaiseTo + Math.round((bounded - legal.minRaiseTo) / Math.max(1, step)) * Math.max(1, step)
  return Math.max(legal.minRaiseTo, Math.min(legal.maxRaiseTo, snapped))
}

function RaiseSizer({ legal, pot, currentBet, step, value, onChange, t }: {
  legal: LegalActions
  pot: number
  currentBet: number
  step: number
  value: number
  onChange: (value: number) => void
  t: T
}): React.ReactElement {
  const [draft, setDraft] = React.useState(String(value))
  React.useEffect(() => { setDraft(String(value)) }, [value])
  const choose = (target: number): void => { onChange(normalizedRaiseTo(target, legal, step)) }
  const potTarget = (fraction: number): number => currentBet + (pot + legal.toCall) * fraction
  const commitDraft = (): void => {
    const parsed = Number(draft.replaceAll(',', '').trim())
    if (Number.isFinite(parsed)) choose(parsed)
    else setDraft(String(value))
  }
  return (
    <div className="ai-raise-sizer" aria-label={t('raiseSizing')}>
      <div className="ai-raise-presets">
        <button type="button" onClick={() => { choose(legal.minRaiseTo) }}>{t('minimum')}</button>
        <button type="button" onClick={() => { choose(potTarget(0.5)) }}>½</button>
        <button type="button" onClick={() => { choose(potTarget(0.75)) }}>¾</button>
        <button type="button" onClick={() => { choose(potTarget(1)) }}>{t('pot')}</button>
        <button type="button" onClick={() => { choose(legal.maxRaiseTo) }}>{t('maximum')}</button>
      </div>
      <input
        className="ai-raise-range"
        type="range"
        min={legal.minRaiseTo}
        max={legal.maxRaiseTo}
        step={Math.max(1, step)}
        value={value}
        aria-label={t('raiseAmount')}
        onChange={(event) => { choose(Number(event.currentTarget.value)) }}
      />
      <label className="ai-raise-input">
        <span>{t('raiseTo')}</span>
        <input
          type="text"
          inputMode="numeric"
          value={draft}
          aria-label={t('raiseAmount')}
          onChange={(event) => { setDraft(event.currentTarget.value) }}
          onBlur={commitDraft}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              commitDraft()
              event.currentTarget.blur()
            }
          }}
        />
        <strong>{formatTokenAmount(value)}</strong>
      </label>
    </div>
  )
}

export function PokerOverlay(props: OverlayProps): React.ReactElement | null {
  const snapshot = props.useAllIn(state => state)
  const running = currentRunning(props)
  const { game } = snapshot
  const holeDealKey = `${game.handNumber}:${game.seats.flatMap(seat => seat.hole.map(card => `${card.rank}-${card.suit}`)).join('|')}`
  const legal = legalActions(game)
  const overlayRef = React.useRef<HTMLElement | null>(null)
  const previousGameRef = React.useRef(game)
  const previousBoardCountRef = React.useRef(game.board.length)
  const previousPotGameRef = React.useRef(game)
  const effectIdRef = React.useRef(0)
  const potCollectionIdRef = React.useRef(0)
  const potCollectionTimerRef = React.useRef<number | undefined>()
  const dealtHandRef = React.useRef<string | undefined>()
  const [seatEffect, setSeatEffect] = React.useState<SeatEffect | undefined>()
  const [potCollection, setPotCollection] = React.useState<PotCollection | undefined>()
  const [dealing, setDealing] = React.useState(false)
  const [dealtCards, setDealtCards] = React.useState(0)
  const [boardDealing, setBoardDealing] = React.useState(false)
  const [boardDealFrom, setBoardDealFrom] = React.useState(game.board.length)
  const [raiseTo, setRaiseTo] = React.useState(legal.raiseTo)

  React.useEffect(() => {
    setRaiseTo(legal.raiseTo)
  }, [game.handNumber, game.street, game.actingSeat, game.currentBet, game.lastRaiseSize])

  React.useLayoutEffect(() => {
    if (!snapshot.open) {
      setDealing(false)
      setDealtCards(0)
      return undefined
    }
    if (dealtHandRef.current === holeDealKey) return undefined
    dealtHandRef.current = holeDealKey
    setDealing(true)
    setDealtCards(1)
    const totalCards = game.seats.reduce((sum, seat) => sum + seat.hole.length, 0)
    const timers: number[] = []
    for (let count = 2; count <= totalCards; count += 1) {
      timers.push(window.setTimeout(() => { setDealtCards(count) }, (count - 1) * HOLE_DEAL_INTERVAL_MS))
    }
    timers.push(window.setTimeout(() => {
      setDealing(false)
      setDealtCards(totalCards)
    }, Math.max(0, totalCards - 1) * HOLE_DEAL_INTERVAL_MS + HOLE_DEAL_SETTLE_MS))
    return () => { for (const timer of timers) window.clearTimeout(timer) }
  }, [snapshot.open, holeDealKey])

  React.useLayoutEffect(() => {
    const previousCount = previousBoardCountRef.current
    previousBoardCountRef.current = game.board.length
    if (!snapshot.open || game.board.length <= previousCount) {
      setBoardDealing(false)
      return undefined
    }
    setBoardDealFrom(previousCount)
    setBoardDealing(true)
    const timer = window.setTimeout(() => { setBoardDealing(false) }, game.board.length - previousCount === 3 ? 950 : 680)
    return () => { window.clearTimeout(timer) }
  }, [snapshot.open, game.board.length])

  React.useLayoutEffect(() => {
    const previous = previousGameRef.current
    previousGameRef.current = game
    if (previous === game || previous.handNumber !== game.handNumber) {
      setSeatEffect(undefined)
      return undefined
    }
    let nextEffect: SeatEffect | undefined
    for (let index = 0; index < game.seats.length; index += 1) {
      const before = previous.seats[index]
      const after = game.seats[index]
      if (before === undefined || after === undefined) continue
      const kind = !before.folded && after.folded
        ? 'fold'
        : after.committed > before.committed ? 'chips' : undefined
      if (kind !== undefined) {
        effectIdRef.current += 1
        nextEffect = { id: effectIdRef.current, seat: index, kind }
        break
      }
    }
    if (nextEffect === undefined) return undefined
    setSeatEffect(nextEffect)
    const effectId = nextEffect.id
    const timer = window.setTimeout(() => {
      setSeatEffect(current => current?.id === effectId ? undefined : current)
    }, nextEffect.kind === 'fold' ? 820 : 920)
    return () => { window.clearTimeout(timer) }
  }, [game])

  React.useLayoutEffect(() => {
    const previous = previousPotGameRef.current
    previousPotGameRef.current = game
    if (previous === game || previous.handNumber !== game.handNumber || previous.street === game.street) return
    const bets = previous.seats.flatMap((seat, index) => seat.streetBet > 0 ? [{ seat: index, amount: seat.streetBet }] : [])
    if (bets.length === 0) return
    potCollectionIdRef.current += 1
    const collection = { id: potCollectionIdRef.current, bets }
    setPotCollection(collection)
    if (potCollectionTimerRef.current !== undefined) window.clearTimeout(potCollectionTimerRef.current)
    potCollectionTimerRef.current = window.setTimeout(() => {
      setPotCollection(current => current?.id === collection.id ? undefined : current)
      potCollectionTimerRef.current = undefined
    }, 1_050)
  }, [game])

  React.useEffect(() => () => {
    if (potCollectionTimerRef.current !== undefined) window.clearTimeout(potCollectionTimerRef.current)
  }, [])

  React.useLayoutEffect(() => {
    if (!snapshot.open) return undefined
    const overlay = overlayRef.current
    const frame = overlay?.parentElement?.parentElement
    const center = frame?.children.item(1)
    if (!(overlay instanceof HTMLElement) || !(frame instanceof HTMLElement) || !(center instanceof HTMLElement)) return undefined
    const positionInsideCenter = (): void => {
      const frameBox = frame.getBoundingClientRect()
      const centerBox = center.getBoundingClientRect()
      overlay.style.left = `${Math.max(0, centerBox.left - frameBox.left)}px`
      overlay.style.right = `${Math.max(0, frameBox.right - centerBox.right)}px`
    }
    positionInsideCenter()
    const observer = new ResizeObserver(positionInsideCenter)
    observer.observe(frame)
    observer.observe(center)
    return () => { observer.disconnect() }
  }, [snapshot.open])

  React.useEffect(() => {
    if (!snapshot.open) return undefined
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      props.closeTable()
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => { window.removeEventListener('keydown', onKeyDown, true) }
  }, [snapshot.open, props.closeTable])

  if (!snapshot.open) return null
  const finished = game.street === 'hand-over'
  const hero = game.seats[game.userSeat]
  const spectating = !finished && hero?.folded === true
  const actor = game.actingSeat === null ? undefined : game.seats[game.actingSeat]
  const heroTurn = !finished && game.actingSeat === game.userSeat
  const thinkingSeconds = Math.max(1, Math.ceil(snapshot.thinkingRemainingMs / 1000))
  const automaticStatus = actor === undefined
    ? `${props.t('dealingNext')} · ${thinkingSeconds}s`
    : `${actor.name} ${props.t('thinking')} · ${thinkingSeconds}s`
  const latest = game.logs.at(-1) ?? ''
  const previous = game.logs.at(-2) ?? ''
  const { smallBlindSeat, bigBlindSeat } = blindSeatIndices(game)
  const dealSeats = game.seats
    .flatMap((seat, index) => seat.hole.length > 0 ? [index] : [])
    .sort((first, second) => {
      const offset = (index: number): number => {
        const value = (index - game.dealer + game.seats.length) % game.seats.length
        return value === 0 ? game.seats.length : value
      }
      return offset(first) - offset(second)
    })
  const dealOrder = new Map(dealSeats.map((seat, index) => [seat, index]))

  return (
    <section ref={overlayRef} className="ai-overlay" role="region" aria-label={props.t('entry')}>
      <div className="ai-grain" />
      <div className="ai-shell">
        <header className="ai-topbar">
          <div className="ai-brand">
            <span><div className="ai-title">No-Limit Hold’em — {formatTokenAmount(game.smallBlind)}/{formatTokenAmount(game.bigBlind)} Tokens — 6-max</div><div className="ai-subtitle">{props.t('playTokens')}</div></span>
          </div>
          <div className="ai-top-actions">
            <span className="ai-hand-number">Hand #{game.handNumber}</span>
            <div className="ai-status" data-running={String(running)}><span className="ai-status-dot" />{running ? props.t('agentRunning') : props.t('agentIdle')}</div>
            <button type="button" className="ai-ghost" aria-label={props.t('reset')} title={props.t('reset')} onClick={props.resetTable}>↻</button>
            <button type="button" className="ai-close" onClick={props.closeTable}>{props.t('close')}</button>
          </div>
        </header>

        <main className="ai-stage">
          <div className="ai-table-wrap" data-dealing={String(dealing)}>
            <div className="ai-table">
              <div className="ai-felt-layout" aria-hidden>
                <span className="ai-felt-center" />
                <span className="ai-felt-orbit" />
                {[0, 1, 2, 3, 4, 5].map(position => <i key={position} data-pos={position} />)}
              </div>
              <div className="ai-table-logo"><FishLogo size={18} /><span>ALL IN · TABLE 01</span></div>
            </div>
            {dealing || boardDealing ? <div className="ai-deck" data-mode={dealing ? 'hole' : 'board'} aria-hidden><span><FishLogo size={18} /></span><span><FishLogo size={18} /></span></div> : null}
            {potCollection?.bets.map((bet, index) => (
              <span
                key={`${potCollection.id}-${bet.seat}`}
                className="ai-pot-collect"
                data-pos={bet.seat}
                style={{ animationDelay: `${index * 45}ms` }}
                aria-hidden
              >
                <span className="ai-chip-stack"><i /><i /><i /></span>
              </span>
            ))}
            <div className="ai-pot" data-collecting={potCollection === undefined ? undefined : 'true'}>
              <PotChips amount={potOf(game)} bigBlind={game.bigBlind} />
              <div className="ai-pot-copy"><span className="ai-pot-label">{props.t('pot')}</span><span className="ai-pot-value">{formatTokenAmount(potOf(game))}</span></div>
            </div>
            <div className="ai-board">
              {[0, 1, 2, 3, 4].map(index => <PlayingCard
                key={index}
                card={game.board[index]}
                empty={game.board[index] === undefined}
                dealStep={boardDealing && index >= boardDealFrom && game.board[index] !== undefined ? index - boardDealFrom : undefined}
              />)}
            </div>
            {game.seats.map((seat, index) => <SeatView
              key={seat.id}
              seat={seat}
              position={index}
              badges={[
                ...(game.dealer === index ? ['D' as const] : []),
                ...(smallBlindSeat === index ? ['SB' as const] : []),
                ...(bigBlindSeat === index ? ['BB' as const] : []),
              ]}
              reveal={finished && !seat.folded}
              acting={game.actingSeat === index}
              thinkingMs={snapshot.thinkingSeat === index ? snapshot.thinkingRemainingMs : 0}
              thinkingDurationMs={snapshot.thinkingSeat === index ? snapshot.thinkingDurationMs : 0}
              thinkingLabel={props.t('thinkingShort')}
              dealOrder={dealOrder.get(index) ?? 0}
              dealSeatCount={dealSeats.length}
              dealing={dealing}
              dealtCards={dealtCards}
              bigBlind={game.bigBlind}
              effect={seatEffect?.seat === index ? seatEffect : undefined}
            />)}
            {game.seats.map((seat, index) => seat.folded && seat.hole.length > 0 ? <MuckedHand
              key={`muck-${seat.id}`}
              seat={seat}
              position={index}
              entering={seatEffect?.seat === index && seatEffect.kind === 'fold'}
              label={props.t('yourFold')}
            /> : null)}
          </div>
        </main>

        <footer className="ai-bottombar">
          <div className="ai-log"><strong>{latest}</strong>{previous}</div>
          <div className="ai-action-stack">
            {heroTurn && legal.canRaise ? <RaiseSizer
              legal={legal}
              pot={potOf(game)}
              currentBet={game.currentBet}
              step={game.smallBlind}
              value={raiseTo}
              onChange={setRaiseTo}
              t={props.t}
            /> : null}
            <div className="ai-controls">
              {finished ? (
                <button type="button" className="ai-action" data-primary="true" onClick={props.nextHand}>{props.t('nextHand')}</button>
              ) : spectating ? (
                <div className="ai-spectating"><span className="ai-spectating-dot" />{props.t('spectating')} · {automaticStatus}</div>
              ) : !heroTurn ? (
                <div className="ai-spectating"><span className="ai-spectating-dot" />{automaticStatus}</div>
              ) : (
                <>
                  <ActionButton action="fold" label={props.t('fold')} danger onAction={props.act} />
                  <ActionButton action="check" label={props.t('check')} disabled={!legal.canCheck} onAction={props.act} />
                  <ActionButton action="call" label={`${props.t('call')} ${formatTokenAmount(legal.toCall)}`} disabled={!legal.canCall} onAction={props.act} />
                  <button type="button" className="ai-action" data-primary="true" disabled={!legal.canRaise} onClick={() => { props.act('raise', raiseTo) }}>{props.t('raise')} {formatTokenAmount(raiseTo)}</button>
                  <ActionButton action="all-in" label={props.t('allIn')} disabled={!legal.canAllIn} danger onAction={props.act} />
                </>
              )}
            </div>
          </div>
          <div className="ai-hand-meta"><strong>{finished ? props.t('showdown') : props.t('waiting')}</strong>Hand #{game.handNumber} · {STREET_LABEL[game.street]} · {formatTokenAmount(game.smallBlind)}/{formatTokenAmount(game.bigBlind)} Tokens</div>
        </footer>
      </div>
    </section>
  )
}
