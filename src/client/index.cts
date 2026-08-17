import { PokerOverlay, SidebarEntry } from './App.tsx'
import { dictionaries } from './i18n.ts'
import type { ClientCtx, TableFace } from './services.ts'
import { createTableStore } from './store.ts'
import { STYLES } from './styles.ts'

const NS = 'dsh-all-in'

function apply(ctx: ClientCtx): void {
  ctx.effect(() => ctx.locale.register(NS, dictionaries), 'dsh-all-in: dictionaries')
  const t = ctx.locale.bind(NS)

  ctx.effect(() => {
    const style = document.createElement('style')
    style.dataset.plugin = NS
    style.textContent = STYLES
    document.head.appendChild(style)
    return () => { style.remove() }
  }, 'dsh-all-in: styles')

  const store = createTableStore()
  const face = (): { hooks: { allIn: typeof store } } & Omit<TableFace, 'useAllIn'> => ({
    hooks: { allIn: store },
    openTable: store.open,
    closeTable: store.close,
    act: store.act,
    nextHand: store.nextHand,
    resetTable: store.reset,
  })

  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'dsh-all-in',
    order: 40,
    locale: NS,
    label: () => t('entry'),
    inject: face,
  }, SidebarEntry))

  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'dsh-all-in-table',
    order: 100,
    locale: NS,
    inject: face,
  }, PokerOverlay))
}

module.exports = {
  name: NS,
  inject: ['slots', 'locale'],
  apply,
}
