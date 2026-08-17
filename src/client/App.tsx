import React from 'react'
import { legalActions, potOf, type PlayerAction, type Seat, type Street } from './game.ts'
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

function PlayingCard({ card, hidden = false, empty = false }: { card?: Card | undefined; hidden?: boolean; empty?: boolean }): React.ReactElement {
  if (empty) return <span className="ai-card ai-card-empty" />
  if (hidden || card === undefined) return <span className="ai-card ai-card-back" />
  const text = cardText(card)
  return (
    <span className="ai-card" data-red={String(isRed(card))}>
      <span>{text.slice(0, -1)}</span><span className="ai-card-suit">{text.slice(-1)}</span>
    </span>
  )
}

function SeatView({ seat, position, dealer, reveal }: { seat: Seat; position: number; dealer: boolean; reveal: boolean }): React.ReactElement {
  const initials = seat.name === 'You' ? 'YOU' : seat.name.slice(0, 2).toUpperCase()
  return (
    <div className="ai-seat" data-pos={position} data-folded={String(seat.folded)} data-hero={String(!seat.bot)}>
      <div className="ai-hole">
        {seat.hole.length === 0 ? null : seat.hole.map((card, index) => (
          <PlayingCard key={`${card.rank}-${card.suit}`} card={card} hidden={seat.bot && !reveal} />
        ))}
      </div>
      {seat.streetBet > 0 ? <div className="ai-bet">● {seat.streetBet.toLocaleString()}</div> : null}
      <div className="ai-player">
        <span className="ai-avatar">{initials}</span>
        <span className="ai-player-meta">
          <span className="ai-player-name">{seat.name}</span>
          <span className="ai-stack">{seat.stack.toLocaleString()} chips</span>
        </span>
        {dealer ? <span className="ai-badge">D</span> : <span />}
      </div>
      {seat.result !== undefined ? <div className="ai-result">{seat.result}</div> : null}
    </div>
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
  onAction: (action: PlayerAction) => void
}): React.ReactElement {
  return <button type="button" className="ai-action" data-primary={primary || undefined} data-danger={danger || undefined} disabled={disabled} onClick={() => { onAction(action) }}>{label}</button>
}

export function PokerOverlay(props: OverlayProps): React.ReactElement | null {
  const snapshot = props.useAllIn(state => state)
  const running = currentRunning(props)
  const { game } = snapshot
  const legal = legalActions(game)

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
  const latest = game.logs.at(-1) ?? ''
  const previous = game.logs.at(-2) ?? ''

  return (
    <section className="ai-overlay" role="dialog" aria-modal="true" aria-label={props.t('entry')}>
      <div className="ai-grain" />
      <div className="ai-shell">
        <header className="ai-topbar">
          <div className="ai-brand">
            <span className="ai-brandmark">AI</span>
            <span><div className="ai-title">ALL IN // 6-MAX</div><div className="ai-subtitle">{props.t('playChips')}</div></span>
          </div>
          <div className="ai-status" data-running={String(running)}><span className="ai-status-dot" />{running ? props.t('agentRunning') : props.t('agentIdle')}</div>
          <div className="ai-top-actions">
            <button type="button" className="ai-ghost" onClick={props.resetTable}>{props.t('reset')}</button>
            <button type="button" className="ai-close" aria-label={props.t('close')} onClick={props.closeTable}>×</button>
          </div>
        </header>

        <main className="ai-stage">
          <div className="ai-table-wrap">
            <div className="ai-table"><div className="ai-table-logo">DEEPSEEK RIVER CLUB</div></div>
            <div className="ai-pot"><div className="ai-pot-label">{props.t('pot')}</div><div className="ai-pot-value">{potOf(game).toLocaleString()}</div></div>
            <div className="ai-board">
              {[0, 1, 2, 3, 4].map(index => <PlayingCard key={index} card={game.board[index]} empty={game.board[index] === undefined} />)}
            </div>
            {game.seats.map((seat, index) => <SeatView key={seat.id} seat={seat} position={index} dealer={game.dealer === index} reveal={finished && !seat.folded} />)}
          </div>
        </main>

        <footer className="ai-bottombar">
          <div className="ai-log"><strong>{latest}</strong>{previous}</div>
          <div className="ai-controls">
            {finished ? (
              <button type="button" className="ai-action" data-primary="true" onClick={props.nextHand}>{props.t('nextHand')}</button>
            ) : (
              <>
                <ActionButton action="fold" label={props.t('fold')} danger onAction={props.act} />
                <ActionButton action="check" label={props.t('check')} disabled={!legal.canCheck} onAction={props.act} />
                <ActionButton action="call" label={`${props.t('call')} ${legal.toCall.toLocaleString()}`} disabled={!legal.canCall} onAction={props.act} />
                <ActionButton action="raise" label={`${props.t('raise')} ${legal.raiseTo.toLocaleString()}`} disabled={!legal.canRaise} primary onAction={props.act} />
                <ActionButton action="all-in" label={props.t('allIn')} disabled={!legal.canAllIn} danger onAction={props.act} />
              </>
            )}
          </div>
          <div className="ai-hand-meta"><strong>{finished ? props.t('showdown') : props.t('waiting')}</strong>Hand #{game.handNumber} · {STREET_LABEL[game.street]} · {game.smallBlind}/{game.bigBlind}</div>
        </footer>
      </div>
    </section>
  )
}
