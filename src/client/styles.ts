export const STYLES = String.raw`
[data-all-in-entry] {
  width: 100%; height: 36px; border: 0; border-radius: 8px; padding: 0 10px;
  display: flex; align-items: center; justify-content: flex-start; gap: 9px;
  color: var(--text-secondary, #666); background: transparent; cursor: pointer;
  font: 500 13px/1 system-ui, sans-serif; transition: background .16s, color .16s;
}
[data-all-in-entry]:hover { background: var(--bg-hover, rgba(0,0,0,.055)); color: var(--text-primary, #161616); }
[data-all-in-entry][data-wide="false"] { width: 36px; justify-content: center; padding: 0; margin-inline: auto; }
.ai-entry-icon { width: 18px; height: 18px; position: relative; flex: 0 0 auto; }
.ai-entry-card { position: absolute; width: 10px; height: 14px; border: 1.5px solid currentColor; border-radius: 2.5px; background: var(--bg-primary, #fff); }
.ai-entry-card:first-child { transform: rotate(-12deg); left: 1px; top: 2px; }
.ai-entry-card:last-child { transform: rotate(10deg); right: 1px; top: 1px; }
.ai-entry-pip { position: absolute; z-index: 1; left: 7px; top: 5px; font-size: 8px; color: #e34b4b; }
.ai-entry-copy { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.ai-overlay {
  position: fixed; inset: 0; z-index: 2147480000; pointer-events: auto; overflow: hidden;
  color: #f7f4ed; font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background:
    radial-gradient(circle at 50% 35%, rgba(49, 111, 78, .28), transparent 31%),
    radial-gradient(circle at 10% 0%, rgba(215, 161, 65, .12), transparent 24%),
    #0a0d0c;
}
.ai-grain { position: absolute; inset: 0; opacity: .22; pointer-events: none; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.92' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.18'/%3E%3C/svg%3E"); }
.ai-shell { position: relative; z-index: 1; height: 100%; display: grid; grid-template-rows: 70px 1fr 108px; }
.ai-topbar { display: flex; align-items: center; justify-content: space-between; padding: 0 clamp(18px, 3vw, 44px); border-bottom: 1px solid rgba(255,255,255,.09); }
.ai-brand { display: flex; align-items: center; gap: 13px; }
.ai-brandmark { width: 31px; height: 31px; border-radius: 50%; display: grid; place-items: center; color: #111; background: #d9aa55; font: 900 12px/1 Georgia, serif; box-shadow: 0 0 0 5px rgba(217,170,85,.09); }
.ai-title { font-size: 14px; letter-spacing: .18em; font-weight: 800; }
.ai-subtitle { margin-top: 4px; color: rgba(255,255,255,.46); font-size: 10px; letter-spacing: .08em; text-transform: uppercase; }
.ai-status { display: flex; align-items: center; gap: 8px; padding: 7px 11px; border: 1px solid rgba(255,255,255,.1); border-radius: 999px; color: rgba(255,255,255,.68); font-size: 11px; letter-spacing: .04em; }
.ai-status-dot { width: 7px; height: 7px; border-radius: 50%; background: #747a77; }
.ai-status[data-running="true"] .ai-status-dot { background: #79e2a6; box-shadow: 0 0 0 4px rgba(121,226,166,.11); animation: ai-pulse 1.4s infinite; }
@keyframes ai-pulse { 50% { opacity: .4; } }
.ai-top-actions { display: flex; align-items: center; gap: 9px; }
.ai-ghost { border: 0; color: rgba(255,255,255,.55); background: transparent; cursor: pointer; padding: 9px; font: 500 11px/1 inherit; }
.ai-ghost:hover { color: white; }
.ai-close { width: 34px; height: 34px; border-radius: 50%; border: 1px solid rgba(255,255,255,.12); color: rgba(255,255,255,.75); background: rgba(255,255,255,.04); cursor: pointer; font-size: 18px; }
.ai-close:hover { background: rgba(255,255,255,.1); color: #fff; }

.ai-stage { min-height: 0; display: grid; place-items: center; padding: 24px 30px 10px; }
.ai-table-wrap { position: relative; width: min(1040px, 88vw); height: min(580px, calc(100vh - 210px)); min-height: 430px; }
.ai-table {
  position: absolute; inset: 10% 8% 9%; border-radius: 48% / 50%;
  background: radial-gradient(ellipse at 50% 43%, #296548 0%, #174631 61%, #0e2d20 100%);
  border: 12px solid #171b18; box-shadow: 0 0 0 1px #443722, 0 20px 70px rgba(0,0,0,.5), inset 0 0 80px rgba(0,0,0,.3);
}
.ai-table::before { content: ''; position: absolute; inset: 22px; border: 1px solid rgba(230,204,145,.16); border-radius: inherit; }
.ai-table-logo { position: absolute; inset: 0; display: grid; place-items: center; color: rgba(240,222,180,.14); font: 800 21px/1 Georgia, serif; letter-spacing: .24em; transform: translateY(44px); }
.ai-pot { position: absolute; left: 50%; top: 40%; transform: translate(-50%,-50%); text-align: center; }
.ai-pot-label { color: rgba(255,255,255,.46); text-transform: uppercase; letter-spacing: .16em; font-size: 9px; }
.ai-pot-value { margin-top: 4px; font: 700 17px/1 ui-monospace, SFMono-Regular, monospace; }
.ai-board { position: absolute; left: 50%; top: 53%; transform: translate(-50%,-50%); display: flex; gap: 8px; }
.ai-card { width: clamp(42px, 4.3vw, 58px); aspect-ratio: .71; border-radius: 7px; background: #f7f4eb; color: #141414; box-shadow: 0 4px 14px rgba(0,0,0,.24); display: flex; flex-direction: column; align-items: flex-start; justify-content: space-between; padding: 7px; box-sizing: border-box; font: 800 clamp(15px, 1.6vw, 21px)/1 Georgia, serif; }
.ai-card[data-red="true"] { color: #d84949; }
.ai-card-suit { align-self: flex-end; font-size: 1.15em; }
.ai-card-back { background: repeating-linear-gradient(45deg, #171d1a 0 4px, #c69a4d 4px 6px); border: 3px solid #eee5d2; }
.ai-card-empty { background: rgba(255,255,255,.035); border: 1px dashed rgba(255,255,255,.12); box-shadow: none; }

.ai-seat { position: absolute; width: 158px; transform: translate(-50%,-50%); text-align: center; opacity: 1; transition: opacity .2s, filter .2s; }
.ai-seat[data-folded="true"] { opacity: .42; filter: saturate(.35); }
.ai-seat[data-pos="0"] { left: 50%; top: 93%; }
.ai-seat[data-pos="1"] { left: 14%; top: 76%; }
.ai-seat[data-pos="2"] { left: 12%; top: 25%; }
.ai-seat[data-pos="3"] { left: 50%; top: 7%; }
.ai-seat[data-pos="4"] { left: 88%; top: 25%; }
.ai-seat[data-pos="5"] { left: 86%; top: 76%; }
.ai-hole { height: 48px; display: flex; justify-content: center; align-items: flex-end; gap: 3px; margin-bottom: -4px; }
.ai-hole .ai-card { width: 34px; border-radius: 4px; padding: 4px; font-size: 12px; }
.ai-hole .ai-card:first-child { transform: rotate(-4deg) translateX(2px); }
.ai-hole .ai-card:last-child { transform: rotate(4deg) translateX(-2px); }
.ai-player { display: inline-grid; grid-template-columns: 30px minmax(0,1fr) auto; align-items: center; gap: 7px; min-width: 126px; max-width: 158px; padding: 6px 9px 6px 6px; border-radius: 999px; background: rgba(11,14,13,.91); border: 1px solid rgba(255,255,255,.1); box-shadow: 0 5px 18px rgba(0,0,0,.25); text-align: left; }
.ai-seat[data-hero="true"] .ai-player { border-color: rgba(222,177,91,.7); box-shadow: 0 0 0 3px rgba(222,177,91,.08), 0 5px 18px rgba(0,0,0,.3); }
.ai-avatar { width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; background: linear-gradient(135deg,#3e4742,#151917); color: #e1b86e; font: 700 11px/1 Georgia,serif; }
.ai-player-meta { min-width: 0; }
.ai-player-name { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11px; font-weight: 700; }
.ai-stack { display: block; color: rgba(255,255,255,.52); margin-top: 3px; font: 9px/1 ui-monospace, SFMono-Regular, monospace; }
.ai-badge { width: 18px; height: 18px; display: grid; place-items: center; border-radius: 50%; background: #e1b35d; color: #17130b; font: 800 9px/1 serif; }
.ai-result { position: absolute; left: 50%; top: calc(100% + 5px); transform: translateX(-50%); width: max-content; max-width: 170px; padding: 4px 7px; border-radius: 4px; background: #e2b45e; color: #17130b; font-size: 9px; font-weight: 700; }
.ai-bet { position: absolute; left: 50%; top: -15px; transform: translateX(-50%); color: #efd18e; font: 700 9px/1 ui-monospace, monospace; white-space: nowrap; }

.ai-bottombar { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 22px; padding: 12px clamp(18px, 3vw, 44px) 20px; border-top: 1px solid rgba(255,255,255,.08); background: rgba(5,7,6,.42); backdrop-filter: blur(12px); }
.ai-log { justify-self: start; color: rgba(255,255,255,.42); font-size: 10px; line-height: 1.55; max-width: 270px; }
.ai-log strong { display: block; color: rgba(255,255,255,.78); font-size: 11px; }
.ai-controls { display: flex; align-items: center; gap: 8px; }
.ai-action { min-width: 82px; height: 42px; padding: 0 16px; border: 1px solid rgba(255,255,255,.13); border-radius: 9px; color: rgba(255,255,255,.83); background: rgba(255,255,255,.055); cursor: pointer; font: 700 11px/1 inherit; }
.ai-action:hover:not(:disabled) { transform: translateY(-1px); background: rgba(255,255,255,.1); }
.ai-action:disabled { opacity: .25; cursor: default; }
.ai-action[data-primary="true"] { color: #17130b; border-color: #e1b35d; background: #e1b35d; }
.ai-action[data-danger="true"] { border-color: rgba(224,87,79,.55); color: #f28d87; }
.ai-hand-meta { justify-self: end; text-align: right; color: rgba(255,255,255,.4); font-size: 9px; letter-spacing: .09em; text-transform: uppercase; }
.ai-hand-meta strong { display: block; color: rgba(255,255,255,.8); margin-bottom: 5px; font-size: 11px; }

@media (max-width: 760px) {
  .ai-shell { grid-template-rows: 58px 1fr 144px; }
  .ai-topbar { padding: 0 14px; }
  .ai-status, .ai-subtitle, .ai-ghost { display: none; }
  .ai-stage { padding: 8px 4px; }
  .ai-table-wrap { width: 100vw; height: calc(100vh - 202px); min-height: 390px; }
  .ai-table { inset: 15% 3% 12%; border-width: 7px; }
  .ai-seat { width: 118px; }
  .ai-seat[data-pos="1"] { left: 17%; }.ai-seat[data-pos="2"] { left: 17%; }.ai-seat[data-pos="4"] { left: 83%; }.ai-seat[data-pos="5"] { left: 83%; }
  .ai-player { min-width: 98px; max-width: 118px; grid-template-columns: 25px minmax(0,1fr) auto; gap: 4px; padding: 4px; }
  .ai-avatar { width: 25px; height: 25px; }
  .ai-hole .ai-card { width: 28px; }
  .ai-bottombar { grid-template-columns: 1fr; gap: 8px; padding: 10px 12px; }
  .ai-log, .ai-hand-meta { display: none; }
  .ai-controls { flex-wrap: wrap; justify-content: center; }
  .ai-action { min-width: 70px; height: 37px; padding: 0 10px; }
}
`
