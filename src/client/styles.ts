export const STYLES = String.raw`
[data-all-in-entry] {
  width: 100%; height: 36px; border: 0; border-radius: 8px; padding: 0 10px;
  display: flex; align-items: center; justify-content: flex-start; gap: 9px;
  color: var(--dsw-alias-label-secondary); background: transparent; cursor: pointer;
  font: 500 13px/1 var(--dsw-font-family); transition: background var(--ds-transition-duration-fast), color var(--ds-transition-duration-fast);
}
[data-all-in-entry]:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
[data-all-in-entry][data-wide="false"] { width: 36px; justify-content: center; padding: 0; margin-inline: auto; }
.ai-entry-icon { width: 18px; height: 18px; position: relative; flex: 0 0 auto; }
.ai-entry-card { position: absolute; width: 10px; height: 14px; border: 1.5px solid currentColor; border-radius: 2.5px; background: var(--dsw-specific-sidebar-fill); }
.ai-entry-card:first-child { transform: rotate(-12deg); left: 1px; top: 2px; }
.ai-entry-card:last-child { transform: rotate(10deg); right: 1px; top: 1px; }
.ai-entry-pip { position: absolute; z-index: 1; left: 7px; top: 5px; font-size: 8px; color: var(--dsw-alias-state-error-secondary); }
.ai-entry-copy { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.ai-overlay {
  --ai-blue: var(--dsw-alias-state-business-primary);
  --ai-blue-soft: var(--dsw-alias-state-business-tertiary);
  --ai-felt-highlight: rgba(255,255,255,.72);
  --ai-felt-shade: rgba(60,77,112,.1);
  --ai-felt-grain: rgba(67,83,117,.24);
  position: absolute; inset-block: 0; left: 280px; right: 0; z-index: 1; pointer-events: auto; overflow: hidden;
  color: var(--dsw-alias-label-primary); font-family: var(--dsw-font-family);
  background: var(--dsw-alias-bg-base);
}
body[data-ds-dark-theme] .ai-overlay {
  --ai-felt-highlight: rgba(255,255,255,.045);
  --ai-felt-shade: rgba(0,0,0,.26);
  --ai-felt-grain: rgba(255,255,255,.13);
}
.ai-grain { display: none; }
.ai-shell { position: relative; height: 100%; display: grid; grid-template-rows: 50px minmax(0, 1fr) 84px; }
.ai-topbar {
  display: grid; grid-template-columns: 1fr auto; align-items: center;
  padding: 0 14px 0 20px; border-bottom: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-1);
}
.ai-brand { min-width: 0; }
.ai-brandmark {
  width: 32px; height: 32px; border-radius: 10px; display: grid; place-items: center;
  color: var(--dsw-alias-label-primary-foreground); background: var(--dsw-alias-button-primary-fill);
  font: 700 10px/1 var(--dsw-font-family);
}
.ai-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; line-height: 18px; font-weight: 500; }
.ai-subtitle { color: var(--dsw-alias-label-tertiary); font-size: 9px; line-height: 12px; }
.ai-status {
  display: flex; align-items: center; gap: 6px; height: 24px; padding: 0 8px;
  border: 0; border-radius: 12px;
  color: var(--dsw-alias-label-tertiary); background: transparent; font-size: 10px;
}
.ai-status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--dsw-alias-label-caption); }
.ai-status[data-running="true"] { color: var(--dsw-alias-label-primary-bluish); background: var(--ai-blue-soft); border-color: transparent; }
.ai-status[data-running="true"] .ai-status-dot { background: var(--ai-blue); animation: ai-pulse 1.4s infinite; }
@keyframes ai-pulse { 50% { opacity: .42; } }
.ai-top-actions { justify-self: end; display: flex; align-items: center; gap: 3px; }
.ai-hand-number { color: var(--dsw-alias-label-tertiary); margin-right: 4px; font-size: 10px; white-space: nowrap; }
.ai-ghost {
  width: 28px; height: 28px; padding: 0; border: 0; border-radius: 50%;
  color: var(--dsw-alias-label-secondary); background: transparent; cursor: pointer; font: 500 15px/1 var(--dsw-font-family);
}
.ai-ghost:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-interactive-bg-hover); }
.ai-close {
  height: 30px; padding: 0 11px; border-radius: 7px; border: 1px solid var(--dsw-alias-border-l2);
  color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-layer-1); cursor: pointer; font: 500 10px/1 var(--dsw-font-family);
}
.ai-close:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-interactive-bg-hover); }

.ai-stage {
  min-height: 0; display: grid; place-items: center; padding: 0 14px;
  container-type: size; background: var(--dsw-alias-bg-base);
}
.ai-table-wrap {
  --ai-table-height: min(60cqh, 40cqw);
  --ai-table-half-height: min(30cqh, 20cqw);
  --ai-seat-side-y: min(22cqh, 15cqw);
  --ai-seat-anchor-offset: 22px;
  --ai-pot-offset: min(8cqh, 5cqw);
  --ai-board-offset: 0px;
  position: relative; width: 94cqw; height: 96cqh; min-height: 400px;
}
.ai-table {
  position: absolute; inset: auto 7%; top: 50%; height: var(--ai-table-height);
  transform: translateY(-50%); overflow: hidden; border-radius: 999px;
  background:
    radial-gradient(ellipse at 50% 38%, var(--ai-felt-highlight), transparent 58%),
    var(--dsw-static-neutral-bluish-50);
  border: 1px solid var(--dsw-alias-border-l1);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.54),
    inset 0 -24px 48px var(--ai-felt-shade),
    0 9px 24px rgba(38,49,72,.07);
}
body[data-ds-dark-theme] .ai-table {
  background:
    radial-gradient(ellipse at 50% 38%, var(--ai-felt-highlight), transparent 58%),
    var(--dsw-static-neutral-bluish-900);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.045),
    inset 0 -24px 48px var(--ai-felt-shade),
    0 10px 28px rgba(0,0,0,.18);
}
.ai-table::before {
  content: ''; position: absolute; z-index: 1; inset: 10px; display: block;
  border: 1px solid var(--dsw-alias-border-l1); border-radius: inherit;
  box-shadow: inset 0 0 30px var(--ai-felt-shade); pointer-events: none;
}
.ai-table::after {
  content: ''; position: absolute; inset: 11px; border-radius: inherit; pointer-events: none;
  background-image: radial-gradient(circle at 1px 1px, var(--ai-felt-grain) 0 .6px, transparent .75px);
  background-size: 5px 5px; opacity: .28;
}
.ai-table-logo {
  position: absolute; z-index: 2; left: 50%; top: 72%; transform: translate(-50%,-50%);
  display: flex; align-items: center; gap: 7px; color: var(--dsw-alias-label-caption);
  opacity: .2; white-space: nowrap; letter-spacing: .14em;
  font: 600 8px/1 var(--dsw-font-family); pointer-events: none;
}
.ai-table-logo svg { width: 18px; height: 18px; }
.ai-pot {
  position: absolute; left: 50%; top: calc(50% - var(--ai-pot-offset)); transform: translate(-50%,-50%);
  display: flex; align-items: baseline; gap: 5px; padding: 4px 9px; text-align: center;
  border: 1px solid var(--dsw-alias-border-l1); border-radius: 11px; background: var(--dsw-alias-bg-layer-1);
}
.ai-pot-label { color: var(--dsw-alias-label-tertiary); font-size: 9px; line-height: 13px; }
.ai-pot-value { color: var(--dsw-alias-label-primary); font: 600 11px/1.2 var(--ds-font-family-code); }
.ai-board { position: absolute; left: 50%; top: calc(50% + var(--ai-board-offset)); transform: translate(-50%,-50%); display: flex; gap: 6px; }
.ai-card {
  width: clamp(38px, 3.7vw, 52px); aspect-ratio: .71; border-radius: 7px;
  position: relative; overflow: hidden;
  background: var(--dsw-static-neutral-00); color: var(--dsw-static-neutral-bluish-1000);
  border: 1px solid rgba(15,17,21,.08); box-shadow: 0 3px 10px rgba(38,49,72,.06);
  display: block; padding: 0; box-sizing: border-box;
  font: 600 clamp(14px, 1.45vw, 19px)/1 var(--dsw-font-family);
}
.ai-board .ai-card[data-dealing="true"] {
  animation: ai-board-deal 520ms cubic-bezier(.16,.78,.22,1) both;
  animation-delay: calc(var(--ai-deal-step, 0) * 110ms);
}
@keyframes ai-board-deal {
  0% { opacity: 0; transform: translate(150px,-34px) rotate(9deg) scale(.78); }
  76% { opacity: 1; transform: translate(0,-3px) rotate(-1deg) scale(1.04); }
  100% { opacity: 1; transform: translate(0,0) rotate(0) scale(1); }
}
.ai-card[data-red="true"] { color: var(--dsw-static-red-500); }
.ai-card-rank { position: absolute; left: 7px; top: 7px; letter-spacing: -.04em; }
.ai-card-suit { position: absolute; left: 7px; bottom: 6px; font-size: 1.08em; }
.ai-card-back {
  display: grid; place-items: center; background: var(--dsw-static-neutral-00);
  color: var(--dsw-static-neutral-bluish-1000); border-color: rgba(15,17,21,.09);
}
.ai-card-mark { display: block; max-width: 48%; height: auto; }
.ai-card-empty {
  display: grid; place-items: center; background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-caption); border-color: var(--dsw-alias-border-l1); box-shadow: none;
}

.ai-seat {
  --ai-chip-x: 0px; --ai-chip-y: -72px; --ai-muck-x: 0px; --ai-muck-y: -170px;
  --ai-deal-x: 0px; --ai-deal-y: 0px;
  position: absolute; width: 158px; transform: translate(-50%,-50%); text-align: center;
  opacity: 1; transition: opacity .22s, filter .22s;
}
.ai-seat[data-folded="true"] { opacity: .42; filter: saturate(.35); }
.ai-seat[data-effect="fold"] { opacity: 1; filter: none; }
.ai-seat[data-folded="true"] .ai-hole { opacity: 0; }
.ai-seat[data-pos="0"] { left: 50%; top: calc(50% + var(--ai-table-half-height)); --ai-chip-y: -78px; --ai-muck-y: -180px; --ai-deal-x: 20cqw; --ai-deal-y: calc(64px - var(--ai-table-half-height)); }
.ai-seat[data-pos="1"] { left: 21%; top: calc(50% + var(--ai-seat-side-y) - var(--ai-seat-anchor-offset)); --ai-chip-x: 100px; --ai-chip-y: -42px; --ai-muck-x: 165px; --ai-muck-y: -92px; --ai-deal-x: 49cqw; --ai-deal-y: calc(64px + var(--ai-seat-anchor-offset) - var(--ai-seat-side-y)); }
.ai-seat[data-pos="2"] { left: 21%; top: calc(50% - var(--ai-seat-side-y) - var(--ai-seat-anchor-offset)); --ai-chip-x: 100px; --ai-chip-y: 42px; --ai-muck-x: 165px; --ai-muck-y: 92px; --ai-deal-x: 49cqw; --ai-deal-y: calc(64px + var(--ai-seat-anchor-offset) + var(--ai-seat-side-y)); }
.ai-seat[data-pos="3"] { left: 50%; top: calc(50% - var(--ai-table-half-height) - var(--ai-seat-anchor-offset)); --ai-chip-y: 72px; --ai-muck-y: 180px; --ai-deal-x: 20cqw; --ai-deal-y: calc(64px + var(--ai-seat-anchor-offset) + var(--ai-table-half-height)); }
.ai-seat[data-pos="4"] { left: 79%; top: calc(50% - var(--ai-seat-side-y) - var(--ai-seat-anchor-offset)); --ai-chip-x: -100px; --ai-chip-y: 42px; --ai-muck-x: -165px; --ai-muck-y: 92px; --ai-deal-x: -9cqw; --ai-deal-y: calc(64px + var(--ai-seat-anchor-offset) + var(--ai-seat-side-y)); }
.ai-seat[data-pos="5"] { left: 79%; top: calc(50% + var(--ai-seat-side-y) - var(--ai-seat-anchor-offset)); --ai-chip-x: -100px; --ai-chip-y: -42px; --ai-muck-x: -165px; --ai-muck-y: -92px; --ai-deal-x: -9cqw; --ai-deal-y: calc(64px + var(--ai-seat-anchor-offset) - var(--ai-seat-side-y)); }
.ai-hole { position: relative; z-index: 3; height: 48px; display: flex; justify-content: center; align-items: flex-end; gap: 3px; margin-bottom: -4px; transition: opacity .18s; }
.ai-hole .ai-card { width: 34px; border-radius: 5px; font-size: 11px; animation: none; }
.ai-hole .ai-card-rank { left: 5px; top: 5px; }
.ai-hole .ai-card-suit { left: 5px; bottom: 4px; }
.ai-hole .ai-card-mark { max-width: 50%; }
.ai-hole .ai-card:first-child { --ai-card-angle: -4deg; --ai-card-nudge: 2px; transform: rotate(var(--ai-card-angle)) translateX(var(--ai-card-nudge)); }
.ai-hole .ai-card:last-child { --ai-card-angle: 4deg; --ai-card-nudge: -2px; transform: rotate(var(--ai-card-angle)) translateX(var(--ai-card-nudge)); }
.ai-table-wrap[data-dealing="true"] .ai-hole .ai-card {
  animation: ai-hole-deal 560ms cubic-bezier(.16,.78,.22,1) both;
  animation-delay: calc(var(--ai-deal-step, 0) * 105ms);
}
@keyframes ai-hole-deal {
  0% { opacity: 0; transform: translate(var(--ai-deal-x),var(--ai-deal-y)) rotate(-10deg) scale(.72); }
  18% { opacity: 1; }
  78% { opacity: 1; transform: translate(0,-3px) rotate(var(--ai-card-angle)) scale(1.04); }
  100% { opacity: 1; transform: rotate(var(--ai-card-angle)) translateX(var(--ai-card-nudge)) scale(1); }
}
.ai-deck {
  position: absolute; z-index: 7; left: 70%; top: 50%; width: 38px; height: 54px;
  transform: translate(-50%,-50%); pointer-events: none; animation: ai-deck-fade 1.85s ease both;
}
.ai-deck > span {
  position: absolute; inset: 0; display: grid; place-items: center; border-radius: 6px;
  border: 1px solid rgba(15,17,21,.12); background: var(--dsw-static-neutral-00); color: var(--dsw-static-neutral-bluish-1000);
  box-shadow: 0 5px 15px rgba(15,17,21,.16);
}
.ai-deck > span:first-child { transform: translate(-4px,3px) rotate(-5deg); }
.ai-deck > span:last-child { transform: translate(2px,-1px) rotate(3deg); }
@keyframes ai-deck-fade { 0%, 76% { opacity: 1; } 100% { opacity: 0; } }
.ai-deck[data-mode="board"] { animation-duration: 950ms; }
.ai-mucked-hand {
  --ai-muck-from-x: 0px; --ai-muck-from-y: 0px;
  position: absolute; z-index: 5; width: 76px; height: 58px; transform: translate(-50%,-50%);
  pointer-events: none;
}
.ai-mucked-hand[data-pos="0"] { left: 50%; top: 64%; --ai-muck-from-x: 0cqw; --ai-muck-from-y: 2cqh; }
.ai-mucked-hand[data-pos="1"] { left: 33%; top: 60%; --ai-muck-from-x: -12cqw; --ai-muck-from-y: -1cqh; }
.ai-mucked-hand[data-pos="2"] { left: 34%; top: 43%; --ai-muck-from-x: -13cqw; --ai-muck-from-y: -13cqh; }
.ai-mucked-hand[data-pos="3"] { left: 49%; top: 39%; --ai-muck-from-x: 1cqw; --ai-muck-from-y: -14cqh; }
.ai-mucked-hand[data-pos="4"] { left: 64%; top: 43%; --ai-muck-from-x: 15cqw; --ai-muck-from-y: -13cqh; }
.ai-mucked-hand[data-pos="5"] { left: 65%; top: 60%; --ai-muck-from-x: 14cqw; --ai-muck-from-y: -1cqh; }
.ai-mucked-hand .ai-card {
  position: absolute; left: 50%; top: 50%; width: 34px; border-radius: 5px; font-size: 11px;
  box-shadow: 0 4px 12px rgba(38,49,72,.12);
}
.ai-mucked-hand .ai-card-rank { left: 5px; top: 5px; }
.ai-mucked-hand .ai-card-suit { left: 5px; bottom: 4px; }
.ai-mucked-hand .ai-card-mark { max-width: 50%; }
.ai-mucked-hand .ai-card:first-child { z-index: 1; transform: translate(-68%,-50%) rotate(-14deg); }
.ai-mucked-hand .ai-card:nth-child(2) { z-index: 2; transform: translate(-30%,-48%) rotate(11deg); }
.ai-mucked-hand[data-hero="false"] { opacity: .76; filter: saturate(.72); }
.ai-mucked-hand[data-hero="true"] { z-index: 7; }
.ai-mucked-hand[data-hero="true"] .ai-card { box-shadow: 0 0 0 2px var(--ai-blue-soft), 0 5px 14px rgba(38,49,72,.14); }
.ai-muck-label {
  position: absolute; left: 50%; top: calc(100% + 2px); transform: translateX(-50%); white-space: nowrap;
  color: var(--dsw-alias-label-tertiary); font: 700 7px/1 var(--dsw-font-family); letter-spacing: .12em; text-transform: uppercase;
}
.ai-mucked-hand[data-entering="true"] .ai-card:first-child { animation: ai-muck-land-left 780ms cubic-bezier(.18,.78,.2,1) both; }
.ai-mucked-hand[data-entering="true"] .ai-card:nth-child(2) { animation: ai-muck-land-right 820ms cubic-bezier(.18,.78,.2,1) 35ms both; }
@keyframes ai-muck-land-left {
  0% { opacity: 1; transform: translate(calc(-68% + var(--ai-muck-from-x)),calc(-50% + var(--ai-muck-from-y))) rotate(-3deg) scale(1); }
  72% { opacity: 1; transform: translate(-72%,-55%) rotate(-18deg) scale(1.04); }
  100% { opacity: 1; transform: translate(-68%,-50%) rotate(-14deg) scale(1); }
}
@keyframes ai-muck-land-right {
  0% { opacity: 1; transform: translate(calc(-30% + var(--ai-muck-from-x)),calc(-48% + var(--ai-muck-from-y))) rotate(4deg) scale(1); }
  74% { opacity: 1; transform: translate(-26%,-53%) rotate(15deg) scale(1.04); }
  100% { opacity: 1; transform: translate(-30%,-48%) rotate(11deg) scale(1); }
}
.ai-player {
  position: relative;
  display: inline-grid; grid-template-columns: 30px minmax(0,1fr) auto; align-items: center; gap: 7px;
  min-width: 120px; max-width: 150px; padding: 5px 8px 5px 5px; border-radius: 19px;
  background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l2);
  box-shadow: 0 5px 16px rgba(38,49,72,.07); text-align: left;
}
body[data-ds-dark-theme] .ai-player { box-shadow: 0 5px 16px rgba(0,0,0,.15); }
.ai-seat[data-hero="true"] .ai-player { border-color: var(--ai-blue); box-shadow: 0 0 0 3px var(--ai-blue-soft); }
.ai-seat[data-acting="true"] .ai-player {
  border-color: var(--ai-blue); box-shadow: 0 0 0 3px var(--ai-blue-soft), 0 5px 16px rgba(38,49,72,.07);
  animation: ai-seat-breathe 1.8s var(--ds-ease-in-out) infinite;
}
@keyframes ai-seat-breathe {
  50% { box-shadow: 0 0 0 5px var(--ai-blue-soft), 0 5px 16px rgba(38,49,72,.07); }
}
.ai-seat[data-acting="true"] .ai-player::after {
  content: ''; position: absolute; right: -3px; top: -3px; width: 7px; height: 7px;
  border: 2px solid var(--dsw-alias-bg-base); border-radius: 50%; background: var(--ai-blue);
}
.ai-avatar {
  width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center;
  background: var(--dsw-alias-bg-module-platform); color: var(--dsw-alias-label-secondary);
  font: 600 9px/1 var(--dsw-font-family);
}
.ai-seat[data-hero="true"] .ai-avatar { color: var(--dsw-alias-label-primary-bluish); background: var(--ai-blue-soft); }
.ai-seat[data-pos="1"] .ai-avatar { background: #edf0ff; color: #5866aa; }
.ai-seat[data-pos="2"] .ai-avatar { background: #e6f7fb; color: #387d8f; }
.ai-seat[data-pos="3"] .ai-avatar { background: #f7ede8; color: #9a6049; }
.ai-seat[data-pos="4"] .ai-avatar { background: #eef4e8; color: #64824e; }
.ai-seat[data-pos="5"] .ai-avatar { background: #f4eafa; color: #80559a; }
.ai-player-meta { min-width: 0; }
.ai-player-name { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11px; line-height: 14px; font-weight: 600; }
.ai-stack { display: block; color: var(--dsw-alias-label-tertiary); margin-top: 2px; font: 9px/1.2 var(--ds-font-family-code); }
.ai-badges { display: flex; align-items: center; gap: 2px; }
.ai-badge { min-width: 18px; height: 18px; padding: 0 4px; box-sizing: border-box; display: grid; place-items: center; border-radius: 9px; background: var(--dsw-alias-button-primary-fill); color: var(--dsw-alias-label-primary-foreground); font: 700 8px/1 var(--dsw-font-family); }
.ai-badge[data-role="D"] { width: 18px; padding: 0; border-radius: 50%; }
.ai-badge[data-role="SB"] { border: 1px solid var(--ai-blue); color: var(--dsw-alias-label-primary-bluish); background: var(--ai-blue-soft); }
.ai-badge[data-role="BB"] { background: var(--ai-blue); color: var(--dsw-alias-label-primary-foreground); }
.ai-result {
  position: absolute; left: 50%; top: calc(100% + 5px); transform: translateX(-50%);
  width: max-content; max-width: 170px; padding: 4px 8px; border-radius: 10px;
  background: var(--ai-blue-soft); color: var(--dsw-alias-label-primary-bluish); font-size: 9px; font-weight: 600;
}
.ai-thinking-chip {
  position: absolute; left: 50%; top: calc(100% + 5px); transform: translateX(-50%);
  width: 88px; padding: 4px 7px 5px; box-sizing: border-box; overflow: hidden;
  border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-tertiary);
  box-shadow: 0 3px 10px rgba(38,49,72,.05); font-size: 8px; line-height: 10px; white-space: nowrap;
}
.ai-thinking-copy { display: block; }
.ai-thinking-track { display: block; height: 2px; margin-top: 3px; overflow: hidden; border-radius: 1px; background: var(--dsw-alias-bg-module-platform); }
.ai-thinking-track > span {
  display: block; width: 100%; height: 100%; transform-origin: left center;
  border-radius: inherit; background: var(--ai-blue); transition: transform 100ms linear;
}
.ai-chip-flight {
  position: absolute; z-index: 8; left: 50%; top: 48px; width: 30px; height: 26px;
  pointer-events: none; animation: ai-chip-flight 860ms cubic-bezier(.18,.8,.24,1) forwards;
}
.ai-chip-flight::after {
  content: ''; position: absolute; left: 3px; top: 14px; width: 20px; height: 8px;
  border-radius: 50%; background: var(--ai-blue); opacity: .16; filter: blur(4px);
}
.ai-chip-flight i, .ai-chip-stack i {
  position: absolute; left: 1px; width: 13px; height: 5px; box-sizing: border-box;
  border: 1px solid rgba(0,0,0,.24); border-radius: 50%;
  background: linear-gradient(90deg, var(--ai-blue) 0 22%, #fff 22% 31%, var(--ai-blue) 31% 68%, #fff 68% 77%, var(--ai-blue) 77%);
  box-shadow: 0 1px 2px rgba(19,33,68,.22);
}
.ai-chip-flight i:nth-child(1), .ai-chip-stack i:nth-child(1) { top: 8px; }
.ai-chip-flight i:nth-child(2), .ai-chip-stack i:nth-child(2) { top: 4px; }
.ai-chip-flight i:nth-child(3), .ai-chip-stack i:nth-child(3) { top: 0; }
.ai-chip-flight i { left: 3px; width: 18px; height: 7px; }
.ai-chip-flight i:nth-child(1) { top: 12px; }
.ai-chip-flight i:nth-child(2) { top: 6px; }
.ai-chip-flight i:nth-child(3) { top: 0; }
@keyframes ai-chip-flight {
  0% { opacity: 0; transform: translate(-50%,0) scale(.7) rotate(-8deg); }
  12% { opacity: 1; }
  68% { opacity: 1; transform: translate(calc(-50% + var(--ai-chip-x)),var(--ai-chip-y)) scale(1.06) rotate(3deg); }
  82% { opacity: 1; transform: translate(calc(-50% + var(--ai-chip-x)),calc(var(--ai-chip-y) - 4px)) scale(1) rotate(0); }
  100% { opacity: 0; transform: translate(calc(-50% + var(--ai-chip-x)),var(--ai-chip-y)) scale(.96) rotate(0); }
}
.ai-bet {
  position: absolute; z-index: 4; left: 50%; top: -10px; transform: translate(-50%,-50%);
  min-height: 20px; display: flex; align-items: center; gap: 4px; padding: 2px 7px 2px 4px;
  border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-secondary);
  box-shadow: 0 3px 10px rgba(38,49,72,.07); font: 600 9px/1 var(--ds-font-family-code); white-space: nowrap;
}
.ai-chip-stack { position: relative; width: 15px; height: 13px; flex: 0 0 auto; }
.ai-seat[data-pos="1"] .ai-bet { left: 100%; top: 8%; }
.ai-seat[data-pos="2"] .ai-bet { left: 100%; top: 92%; }
.ai-seat[data-pos="3"] .ai-bet { top: calc(100% + 8px); }
.ai-seat[data-pos="4"] .ai-bet { left: 0; top: 92%; }
.ai-seat[data-pos="5"] .ai-bet { left: 0; top: 8%; }
.ai-seat[data-effect="chips"] .ai-bet { animation: ai-bet-land 860ms cubic-bezier(.2,.75,.25,1) both; }
@keyframes ai-bet-land {
  0%, 54% { opacity: 0; scale: .86; }
  76% { opacity: 1; scale: 1.08; }
  100% { opacity: 1; scale: 1; }
}

.ai-bottombar {
  position: relative; display: grid; place-items: center;
  padding: 3px 18px 11px; border: 0; background: var(--dsw-alias-bg-base);
  transform: translateY(clamp(-220px, calc(450px - 50vh), 0px));
}
.ai-log {
  position: absolute; left: 50%; top: -5px; transform: translateX(-50%); max-width: min(420px, 72%);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 4px 9px;
  border-radius: 10px; background: var(--dsw-alias-bg-module-platform); color: var(--dsw-alias-label-tertiary); font-size: 9px;
}
.ai-log strong { display: inline; color: var(--dsw-alias-label-secondary); margin-right: 6px; font-size: 9px; font-weight: 500; }
.ai-controls {
  display: flex; align-items: center; gap: 2px; padding: 5px;
  border: 1px solid var(--dsw-alias-border-l1); border-radius: 24px; background: var(--dsw-alias-bg-layer-1);
  box-shadow: 0 5px 18px rgba(38,49,72,.08);
}
.ai-action {
  min-width: 68px; height: 34px; padding: 0 13px; border: 0; border-radius: 17px;
  color: var(--dsw-alias-label-primary); background: transparent; cursor: pointer;
  font: 500 11px/1 var(--dsw-font-family); transition: background .12s, transform .12s;
}
.ai-action:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); transform: translateY(-1px); }
.ai-action:disabled { opacity: .35; cursor: default; }
.ai-action[data-primary="true"] { color: var(--dsw-alias-label-primary-foreground); border-color: transparent; background: var(--dsw-alias-button-primary-fill); }
.ai-action[data-primary="true"]:hover:not(:disabled) { background: var(--dsw-alias-button-primary-hover); }
.ai-action[data-danger="true"] { color: var(--dsw-alias-label-primary); }
.ai-action[data-danger="true"]:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover-danger); }
.ai-spectating {
  height: 34px; padding: 0 15px; display: flex; align-items: center; gap: 7px;
  color: var(--dsw-alias-label-secondary); font-size: 11px; white-space: nowrap;
}
.ai-spectating-dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--ai-blue);
  box-shadow: 0 0 0 3px var(--ai-blue-soft); animation: ai-pulse 1.2s infinite;
}
.ai-hand-meta { display: none; }

@media (max-width: 760px) {
  .ai-shell { grid-template-rows: 58px 1fr 144px; }
  .ai-topbar { grid-template-columns: 1fr auto; padding: 0 14px; }
  .ai-status, .ai-subtitle, .ai-ghost, .ai-hand-number { display: none; }
  .ai-stage { padding: 8px 4px; }
  .ai-table-wrap {
    --ai-table-half-height: 40%; --ai-seat-side-y: 21%; --ai-seat-anchor-offset: 16px;
    width: 100%; height: calc(100vh - 202px); min-height: 390px;
  }
  .ai-table { inset: 15% 3% 12%; height: auto; transform: none; }
  .ai-seat { width: 118px; }
  .ai-seat[data-pos="1"] { left: 17%; --ai-deal-x: 53cqw; }.ai-seat[data-pos="2"] { left: 17%; --ai-deal-x: 53cqw; }.ai-seat[data-pos="4"] { left: 83%; --ai-deal-x: -13cqw; }.ai-seat[data-pos="5"] { left: 83%; --ai-deal-x: -13cqw; }
  .ai-player { min-width: 98px; max-width: 118px; grid-template-columns: 25px minmax(0,1fr) auto; gap: 4px; padding: 4px; }
  .ai-avatar { width: 25px; height: 25px; }
  .ai-hole .ai-card { width: 28px; }
  .ai-mucked-hand .ai-card { width: 28px; }
  .ai-mucked-hand { transform: translate(-50%,-50%) scale(.88); }
  .ai-bottombar { grid-template-columns: 1fr; gap: 8px; padding: 10px 12px; transform: none; }
  .ai-log, .ai-hand-meta { display: none; }
  .ai-controls { flex-wrap: wrap; justify-content: center; }
  .ai-action { min-width: 70px; height: 34px; padding: 0 10px; }
}

@media (prefers-reduced-motion: reduce) {
  .ai-status-dot, .ai-seat, .ai-seat[data-acting="true"] .ai-player, .ai-card, .ai-bet, .ai-deck { animation: none; transition: none; }
  .ai-chip-flight { display: none; }
  .ai-mucked-hand[data-entering="true"] .ai-card { animation: none; }
}
`
