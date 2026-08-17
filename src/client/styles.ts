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
  position: fixed; inset: 0; z-index: 2147480000; pointer-events: auto; overflow: hidden;
  color: var(--dsw-alias-label-primary); font-family: var(--dsw-font-family);
  background: var(--dsw-alias-bg-base);
}
.ai-grain { display: none; }
.ai-shell { position: relative; height: 100%; display: grid; grid-template-rows: 64px 1fr 104px; }
.ai-topbar {
  display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
  padding: 0 clamp(18px, 3vw, 40px); border-bottom: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-1);
}
.ai-brand { display: flex; align-items: center; gap: 11px; min-width: 0; }
.ai-brandmark {
  width: 32px; height: 32px; border-radius: 10px; display: grid; place-items: center;
  color: var(--dsw-alias-label-primary-foreground); background: var(--dsw-alias-button-primary-fill);
  font: 700 10px/1 var(--dsw-font-family);
}
.ai-title { font-size: 14px; line-height: 20px; font-weight: 600; letter-spacing: -.01em; }
.ai-subtitle { color: var(--dsw-alias-label-tertiary); font-size: 11px; line-height: 16px; }
.ai-status {
  display: flex; align-items: center; gap: 7px; height: 28px; padding: 0 10px;
  border: 1px solid var(--dsw-alias-border-l2); border-radius: 14px;
  color: var(--dsw-alias-label-secondary); background: var(--dsw-alias-bg-layer-2); font-size: 12px;
}
.ai-status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--dsw-alias-label-caption); }
.ai-status[data-running="true"] { color: var(--dsw-alias-label-primary-bluish); background: var(--ai-blue-soft); border-color: transparent; }
.ai-status[data-running="true"] .ai-status-dot { background: var(--ai-blue); animation: ai-pulse 1.4s infinite; }
@keyframes ai-pulse { 50% { opacity: .42; } }
.ai-top-actions { justify-self: end; display: flex; align-items: center; gap: 4px; }
.ai-ghost {
  height: 32px; padding: 0 12px; border: 0; border-radius: 16px;
  color: var(--dsw-alias-label-secondary); background: transparent; cursor: pointer; font: 500 12px/1 var(--dsw-font-family);
}
.ai-ghost:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-interactive-bg-hover); }
.ai-close {
  width: 32px; height: 32px; border-radius: 50%; border: 0;
  color: var(--dsw-alias-label-secondary); background: transparent; cursor: pointer; font: 300 20px/1 var(--dsw-font-family);
}
.ai-close:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-interactive-bg-hover); }

.ai-stage { min-height: 0; display: grid; place-items: center; padding: 20px 30px 8px; background: var(--dsw-alias-bg-base); }
.ai-table-wrap { position: relative; width: min(1040px, 88vw); height: min(580px, calc(100vh - 196px)); min-height: 430px; }
.ai-table {
  position: absolute; inset: 10% 8% 9%; border-radius: 48% / 50%;
  background: linear-gradient(155deg, var(--dsw-static-neutral-bluish-50), var(--dsw-static-neutral-bluish-100));
  border: 1px solid var(--dsw-alias-border-l2);
  box-shadow: 0 18px 60px rgba(38,49,72,.06), inset 0 0 0 18px rgba(255,255,255,.38);
}
body[data-ds-dark-theme] .ai-table {
  background: linear-gradient(155deg, var(--dsw-static-neutral-bluish-875), var(--dsw-static-neutral-bluish-900));
  box-shadow: 0 18px 60px rgba(0,0,0,.18), inset 0 0 0 18px rgba(255,255,255,.018);
}
.ai-table::before { content: ''; position: absolute; inset: 18px; border: 1px solid var(--dsw-alias-border-l1); border-radius: inherit; }
.ai-table-logo {
  position: absolute; inset: 0; display: grid; place-items: center;
  color: var(--dsw-alias-label-caption); opacity: .45;
  font: 600 16px/1 var(--dsw-font-family); letter-spacing: .15em; transform: translateY(46px);
}
.ai-pot { position: absolute; left: 50%; top: 40%; transform: translate(-50%,-50%); text-align: center; }
.ai-pot-label { color: var(--dsw-alias-label-tertiary); font-size: 10px; line-height: 15px; }
.ai-pot-value { margin-top: 2px; color: var(--dsw-alias-label-primary); font: 600 16px/1.2 var(--ds-font-family-code); }
.ai-board { position: absolute; left: 50%; top: 53%; transform: translate(-50%,-50%); display: flex; gap: 7px; }
.ai-card {
  width: clamp(42px, 4.3vw, 58px); aspect-ratio: .71; border-radius: 8px;
  background: var(--dsw-static-neutral-00); color: var(--dsw-static-neutral-bluish-1000);
  border: 1px solid var(--dsw-alias-border-l2); box-shadow: 0 4px 14px rgba(38,49,72,.08);
  display: flex; flex-direction: column; align-items: flex-start; justify-content: space-between;
  padding: 7px; box-sizing: border-box; font: 700 clamp(15px, 1.6vw, 21px)/1 Georgia, serif;
}
.ai-card[data-red="true"] { color: var(--dsw-static-red-500); }
.ai-card-suit { align-self: flex-end; font-size: 1.15em; }
.ai-card-back {
  background: repeating-linear-gradient(45deg, var(--dsw-static-deepseek-500) 0 4px, var(--dsw-static-deepseek-400) 4px 6px);
  border: 3px solid var(--dsw-static-neutral-00);
}
.ai-card-empty { background: var(--dsw-alias-bg-layer-1); border: 1px dashed var(--dsw-alias-border-l3); box-shadow: none; }

.ai-seat { position: absolute; width: 158px; transform: translate(-50%,-50%); text-align: center; opacity: 1; transition: opacity .2s, filter .2s; }
.ai-seat[data-folded="true"] { opacity: .42; filter: saturate(.35); }
.ai-seat[data-pos="0"] { left: 50%; top: 93%; }
.ai-seat[data-pos="1"] { left: 14%; top: 76%; }
.ai-seat[data-pos="2"] { left: 12%; top: 25%; }
.ai-seat[data-pos="3"] { left: 50%; top: 7%; }
.ai-seat[data-pos="4"] { left: 88%; top: 25%; }
.ai-seat[data-pos="5"] { left: 86%; top: 76%; }
.ai-hole { height: 48px; display: flex; justify-content: center; align-items: flex-end; gap: 3px; margin-bottom: -4px; }
.ai-hole .ai-card { width: 34px; border-radius: 5px; padding: 4px; font-size: 12px; }
.ai-hole .ai-card:first-child { transform: rotate(-4deg) translateX(2px); }
.ai-hole .ai-card:last-child { transform: rotate(4deg) translateX(-2px); }
.ai-player {
  display: inline-grid; grid-template-columns: 30px minmax(0,1fr) auto; align-items: center; gap: 7px;
  min-width: 126px; max-width: 158px; padding: 6px 9px 6px 6px; border-radius: 18px;
  background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l2);
  box-shadow: 0 5px 16px rgba(38,49,72,.07); text-align: left;
}
body[data-ds-dark-theme] .ai-player { box-shadow: 0 5px 16px rgba(0,0,0,.15); }
.ai-seat[data-hero="true"] .ai-player { border-color: var(--ai-blue); box-shadow: 0 0 0 3px var(--ai-blue-soft); }
.ai-avatar {
  width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center;
  background: var(--dsw-alias-bg-module-platform); color: var(--dsw-alias-label-secondary);
  font: 600 9px/1 var(--dsw-font-family);
}
.ai-seat[data-hero="true"] .ai-avatar { color: var(--dsw-alias-label-primary-bluish); background: var(--ai-blue-soft); }
.ai-player-meta { min-width: 0; }
.ai-player-name { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11px; line-height: 14px; font-weight: 600; }
.ai-stack { display: block; color: var(--dsw-alias-label-tertiary); margin-top: 2px; font: 9px/1.2 var(--ds-font-family-code); }
.ai-badge { width: 18px; height: 18px; display: grid; place-items: center; border-radius: 50%; background: var(--dsw-alias-button-primary-fill); color: var(--dsw-alias-label-primary-foreground); font: 700 9px/1 var(--dsw-font-family); }
.ai-result {
  position: absolute; left: 50%; top: calc(100% + 5px); transform: translateX(-50%);
  width: max-content; max-width: 170px; padding: 4px 8px; border-radius: 10px;
  background: var(--ai-blue-soft); color: var(--dsw-alias-label-primary-bluish); font-size: 9px; font-weight: 600;
}
.ai-bet { position: absolute; left: 50%; top: -15px; transform: translateX(-50%); color: var(--dsw-alias-label-primary-bluish); font: 600 9px/1 var(--ds-font-family-code); white-space: nowrap; }

.ai-bottombar {
  display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 22px;
  padding: 12px clamp(18px, 3vw, 40px) 18px; border-top: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-1);
}
.ai-log { justify-self: start; color: var(--dsw-alias-label-tertiary); font-size: 10px; line-height: 1.5; max-width: 270px; }
.ai-log strong { display: block; color: var(--dsw-alias-label-secondary); font-size: 11px; font-weight: 500; }
.ai-controls { display: flex; align-items: center; gap: 8px; }
.ai-action {
  min-width: 78px; height: 36px; padding: 0 14px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 18px;
  color: var(--dsw-alias-label-primary); background: transparent; cursor: pointer;
  font: 500 12px/1 var(--dsw-font-family); transition: background .12s, border-color .12s, transform .12s;
}
.ai-action:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); transform: translateY(-1px); }
.ai-action:disabled { opacity: .35; cursor: default; }
.ai-action[data-primary="true"] { color: var(--dsw-alias-label-primary-foreground); border-color: transparent; background: var(--dsw-alias-button-primary-fill); }
.ai-action[data-primary="true"]:hover:not(:disabled) { background: var(--dsw-alias-button-primary-hover); }
.ai-action[data-danger="true"] { border-color: var(--dsw-alias-border-l2); color: var(--dsw-alias-state-error-primary); }
.ai-action[data-danger="true"]:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover-danger); }
.ai-hand-meta { justify-self: end; text-align: right; color: var(--dsw-alias-label-tertiary); font-size: 9px; line-height: 14px; }
.ai-hand-meta strong { display: block; color: var(--dsw-alias-label-secondary); margin-bottom: 2px; font-size: 11px; font-weight: 500; }

@media (max-width: 760px) {
  .ai-shell { grid-template-rows: 58px 1fr 144px; }
  .ai-topbar { grid-template-columns: 1fr auto; padding: 0 14px; }
  .ai-status, .ai-subtitle, .ai-ghost { display: none; }
  .ai-stage { padding: 8px 4px; }
  .ai-table-wrap { width: 100vw; height: calc(100vh - 202px); min-height: 390px; }
  .ai-table { inset: 15% 3% 12%; }
  .ai-seat { width: 118px; }
  .ai-seat[data-pos="1"] { left: 17%; }.ai-seat[data-pos="2"] { left: 17%; }.ai-seat[data-pos="4"] { left: 83%; }.ai-seat[data-pos="5"] { left: 83%; }
  .ai-player { min-width: 98px; max-width: 118px; grid-template-columns: 25px minmax(0,1fr) auto; gap: 4px; padding: 4px; }
  .ai-avatar { width: 25px; height: 25px; }
  .ai-hole .ai-card { width: 28px; }
  .ai-bottombar { grid-template-columns: 1fr; gap: 8px; padding: 10px 12px; }
  .ai-log, .ai-hand-meta { display: none; }
  .ai-controls { flex-wrap: wrap; justify-content: center; }
  .ai-action { min-width: 70px; height: 34px; padding: 0 10px; }
}

@media (prefers-reduced-motion: reduce) {
  .ai-status-dot, .ai-seat { animation: none; transition: none; }
}
`
