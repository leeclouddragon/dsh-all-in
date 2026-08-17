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
  position: absolute; inset-block: 0; left: 280px; right: 0; z-index: 1; pointer-events: auto; overflow: hidden;
  color: var(--dsw-alias-label-primary); font-family: var(--dsw-font-family);
  background: var(--dsw-alias-bg-base);
}
.ai-grain { display: none; }
.ai-shell { position: relative; height: 100%; display: grid; grid-template-rows: 50px 1fr 100px; }
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

.ai-stage { min-height: 0; display: grid; place-items: center; padding: 6px 18px 0; background: var(--dsw-alias-bg-base); }
.ai-table-wrap { position: relative; width: min(1120px, 100%); height: min(620px, calc(100vh - 150px)); min-height: 430px; }
.ai-table {
  position: absolute; inset: 13% 9% 8%; border-radius: 48% / 50%;
  background: var(--dsw-static-neutral-bluish-50);
  border: 1px solid var(--dsw-alias-border-l1);
  box-shadow: none;
}
body[data-ds-dark-theme] .ai-table {
  background: var(--dsw-static-neutral-bluish-900);
  box-shadow: none;
}
.ai-table::before { display: none; }
.ai-table-logo { display: none; }
.ai-pot {
  position: absolute; left: 50%; top: 42%; transform: translate(-50%,-50%);
  display: flex; align-items: baseline; gap: 5px; padding: 4px 9px; text-align: center;
  border: 1px solid var(--dsw-alias-border-l1); border-radius: 11px; background: var(--dsw-alias-bg-layer-1);
}
.ai-pot-label { color: var(--dsw-alias-label-tertiary); font-size: 9px; line-height: 13px; }
.ai-pot-value { color: var(--dsw-alias-label-primary); font: 600 11px/1.2 var(--ds-font-family-code); }
.ai-board { position: absolute; left: 50%; top: 55%; transform: translate(-50%,-50%); display: flex; gap: 6px; }
.ai-card {
  width: clamp(38px, 3.7vw, 52px); aspect-ratio: .71; border-radius: 7px;
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
.ai-card-empty { background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1); box-shadow: none; }

.ai-seat { position: absolute; width: 158px; transform: translate(-50%,-50%); text-align: center; opacity: 1; transition: opacity .2s, filter .2s; }
.ai-seat[data-folded="true"] { opacity: .42; filter: saturate(.35); }
.ai-seat[data-pos="0"] { left: 50%; top: 90%; }
.ai-seat[data-pos="1"] { left: 13%; top: 73%; }
.ai-seat[data-pos="2"] { left: 13%; top: 29%; }
.ai-seat[data-pos="3"] { left: 50%; top: 10%; }
.ai-seat[data-pos="4"] { left: 87%; top: 29%; }
.ai-seat[data-pos="5"] { left: 87%; top: 73%; }
.ai-hole { height: 48px; display: flex; justify-content: center; align-items: flex-end; gap: 3px; margin-bottom: -4px; }
.ai-hole .ai-card { width: 34px; border-radius: 5px; padding: 4px; font-size: 12px; }
.ai-hole .ai-card:first-child { transform: rotate(-4deg) translateX(2px); }
.ai-hole .ai-card:last-child { transform: rotate(4deg) translateX(-2px); }
.ai-player {
  display: inline-grid; grid-template-columns: 30px minmax(0,1fr) auto; align-items: center; gap: 7px;
  min-width: 120px; max-width: 150px; padding: 5px 8px 5px 5px; border-radius: 19px;
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
.ai-seat[data-pos="1"] .ai-avatar { background: #edf0ff; color: #5866aa; }
.ai-seat[data-pos="2"] .ai-avatar { background: #e6f7fb; color: #387d8f; }
.ai-seat[data-pos="3"] .ai-avatar { background: #f7ede8; color: #9a6049; }
.ai-seat[data-pos="4"] .ai-avatar { background: #eef4e8; color: #64824e; }
.ai-seat[data-pos="5"] .ai-avatar { background: #f4eafa; color: #80559a; }
.ai-player-meta { min-width: 0; }
.ai-player-name { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11px; line-height: 14px; font-weight: 600; }
.ai-stack { display: block; color: var(--dsw-alias-label-tertiary); margin-top: 2px; font: 9px/1.2 var(--ds-font-family-code); }
.ai-badge { width: 18px; height: 18px; display: grid; place-items: center; border-radius: 50%; background: var(--dsw-alias-button-primary-fill); color: var(--dsw-alias-label-primary-foreground); font: 700 9px/1 var(--dsw-font-family); }
.ai-result {
  position: absolute; left: 50%; top: calc(100% + 5px); transform: translateX(-50%);
  width: max-content; max-width: 170px; padding: 4px 8px; border-radius: 10px;
  background: var(--ai-blue-soft); color: var(--dsw-alias-label-primary-bluish); font-size: 9px; font-weight: 600;
}
.ai-bet { position: absolute; left: 50%; top: -16px; transform: translateX(-50%); padding: 3px 7px; border-radius: 9px; background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-secondary); font: 600 9px/1 var(--ds-font-family-code); white-space: nowrap; }

.ai-bottombar {
  position: relative; display: grid; place-items: center;
  padding: 8px 18px 18px; border: 0; background: var(--dsw-alias-bg-base);
}
.ai-log {
  position: absolute; left: 50%; top: -8px; transform: translateX(-50%); max-width: min(420px, 72%);
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
.ai-hand-meta { display: none; }

@media (max-width: 760px) {
  .ai-shell { grid-template-rows: 58px 1fr 144px; }
  .ai-topbar { grid-template-columns: 1fr auto; padding: 0 14px; }
  .ai-status, .ai-subtitle, .ai-ghost, .ai-hand-number { display: none; }
  .ai-stage { padding: 8px 4px; }
  .ai-table-wrap { width: 100%; height: calc(100vh - 202px); min-height: 390px; }
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
