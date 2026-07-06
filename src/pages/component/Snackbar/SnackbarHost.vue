<script setup lang="ts">
import { useSnackbar, type SnackbarType } from './useSnackbar'

const { items, dismiss } = useSnackbar()

const styles: Record<SnackbarType, { ring: string; icon: string; iconPath: string; bar: string }> = {
  success: {
    ring: 'ring-emerald-200',
    icon: 'text-emerald-600',
    iconPath: 'M20 6 9 17l-5-5',
    bar: 'bg-emerald-500',
  },
  error: {
    ring: 'ring-rose-200',
    icon: 'text-rose-600',
    iconPath: 'M12 8v5M12 16.5h.01M10.3 3.9 2 18.5A2 2 0 0 0 3.7 21.5h16.6A2 2 0 0 0 22 18.5L13.7 3.9a2 2 0 0 0-3.4 0Z',
    bar: 'bg-rose-500',
  },
  info: {
    ring: 'ring-sky-200',
    icon: 'text-sky-600',
    iconPath: 'M12 16v-5M12 8h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z',
    bar: 'bg-sky-500',
  },
}
</script>

<template>
  <!-- Bottom-center on mobile, bottom-right on larger screens -->
  <div
    class="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end sm:p-6"
    aria-live="polite"
  >
    <transition-group
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-3 opacity-0 sm:translate-y-0 sm:translate-x-4"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition duration-200 ease-in absolute"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0 scale-95"
      move-class="transition duration-200"
    >
      <div
        v-for="s in items"
        :key="s.id"
        :role="s.type === 'error' ? 'alert' : 'status'"
        class="pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-xl bg-white px-4 py-3 shadow-lg ring-1"
        :class="styles[s.type].ring"
      >
        <div class="flex items-start gap-3">
          <svg viewBox="0 0 24 24" fill="none" class="mt-0.5 h-5 w-5 shrink-0" :class="styles[s.type].icon"
            stroke="currentColor" stroke-width="2.2">
            <path :d="styles[s.type].iconPath" stroke-linecap="round" stroke-linejoin="round" />
          </svg>

          <p class="min-w-0 flex-1 text-sm font-medium text-slate-700">{{ s.message }}</p>

          <button
            v-if="s.action"
            type="button"
            @click="s.action.onClick(); dismiss(s.id)"
            class="shrink-0 rounded-md px-2 py-1 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          >
            {{ s.action.label }}
          </button>

          <button
            type="button"
            @click="dismiss(s.id)"
            aria-label="Dismiss"
            class="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <svg viewBox="0 0 24 24" fill="none" class="h-4 w-4" stroke="currentColor" stroke-width="2.2">
              <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <!-- Auto-dismiss progress bar -->
        <span
          v-if="s.duration > 0"
          class="absolute bottom-0 left-0 h-0.5 origin-left"
          :class="styles[s.type].bar"
          :style="{ animation: `snack-progress ${s.duration}ms linear forwards` }"
        />
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
@keyframes snack-progress {
  from { transform: scaleX(1); width: 100%; }
  to   { transform: scaleX(0); width: 100%; }
}
@media (prefers-reduced-motion: reduce) {
  span[style] { animation: none !important; }
}
</style>
