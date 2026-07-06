import { reactive, readonly } from 'vue'

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
export type SnackbarType = 'success' | 'error' | 'info'

export interface SnackbarAction {
  label: string
  onClick: () => void
}

export interface SnackbarOptions {
  type?: SnackbarType
  /** Auto-dismiss after this many ms. Pass 0 to keep it until dismissed. */
  duration?: number
  action?: SnackbarAction
}

export interface SnackbarItem extends Required<Omit<SnackbarOptions, 'action'>> {
  id: number
  message: string
  action?: SnackbarAction
}

/* ------------------------------------------------------------------ */
/* Shared, module-scoped state (a tiny store)                          */
/* ------------------------------------------------------------------ */
const items = reactive<SnackbarItem[]>([])
const timers = new Map<number, ReturnType<typeof setTimeout>>()
let seq = 0

function dismiss(id: number) {
  const i = items.findIndex(s => s.id === id)
  if (i !== -1) items.splice(i, 1)
  const t = timers.get(id)
  if (t) { clearTimeout(t); timers.delete(id) }
}

function notify(message: string, opts: SnackbarOptions = {}): number {
  const id = ++seq
  const item: SnackbarItem = {
    id,
    message,
    type: opts.type ?? 'info',
    duration: opts.duration ?? 4000,
    action: opts.action,
  }
  items.push(item)
  if (item.duration > 0) {
    timers.set(id, setTimeout(() => dismiss(id), item.duration))
  }
  return id
}

/* Convenience helpers */
const success = (m: string, o: SnackbarOptions = {}) => notify(m, { ...o, type: 'success' })
const error   = (m: string, o: SnackbarOptions = {}) => notify(m, { ...o, type: 'error', duration: o.duration ?? 6000 })
const info    = (m: string, o: SnackbarOptions = {}) => notify(m, { ...o, type: 'info' })

export function useSnackbar() {
  return {
    items: readonly(items),
    notify,
    success,
    error,
    info,
    dismiss,
  }
}
