<template>
  <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div class="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4">
      <div>
        <h2 class="text-base font-bold text-slate-900">{{ title }}</h2>
        <p class="mt-1 text-sm text-slate-500">{{ subtitle }}</p>
      </div>

      <div class="inline-flex items-center gap-2 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
        Select {{ limit }}
      </div>
    </div>

    <div class="p-5">
      <div
        v-if="candidates.length === 0"
        class="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500"
      >
        {{ emptyText }}
      </div>

      <div v-else class="grid gap-4 sm:grid-cols-2">
        <button
          v-for="c in candidates"
          :key="c.id"
          type="button"
          class="group relative flex w-full gap-4 rounded-2xl border p-4 text-left shadow-sm transition
                 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="pickedIds.has(c.id) ? 'border-blue-500 ring-1 ring-blue-500/30' : 'border-slate-200'"
          @click="toggle(c)"
        >
          <!-- avatar -->
          <div class="h-12 w-12 overflow-hidden rounded-xl bg-slate-200">
            <img
              v-if="c.photoUrl"
              :src="c.photoUrl"
              :alt="c.name"
              class="h-full w-full object-cover"
              loading="lazy"
            />
            <div v-else class="grid h-full w-full place-items-center bg-slate-900 text-white">
              <svg viewBox="0 0 24 24" class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M22 21v-2a4 4 0 00-3-3.87" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
          </div>

          <!-- info -->
          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="truncate text-sm font-bold text-slate-900">{{ c.name }}</div>
                <div class="mt-0.5 text-xs text-slate-500">{{ c.meta }}</div>
              </div>

              <span
                class="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border"
                :class="pickedIds.has(c.id) ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 text-transparent'"
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20 6L9 17l-5-5" />
                </svg>
              </span>
            </div>

            <p class="mt-2 line-clamp-2 text-xs text-slate-600 italic">
              {{ c.role }}
            </p>

            <p class="mt-2 text-[11px] text-slate-500" v-if="!pickedIds.has(c.id) && selected.length >= limit">
              Limit reached ({{ limit }}). Unselect one to choose another.
            </p>
          </div>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";

export type Candidate = {
  id: string;
  name: string;
  meta: string;
  role: string;
  photoUrl?: string | null;
  avatarType?: "photo" | "illustration";
};

const props = defineProps<{
  title: string;
  subtitle: string;
  limit: number;
  candidates: Candidate[];
  selected: Candidate[];
  emptyText?: string;
}>();

const emit = defineEmits<{
  (e: "update:selected", value: Candidate[]): void;
}>();

const pickedIds = computed(() => new Set(props.selected.map((c) => c.id)));

function toggle(c: Candidate) {
  const isPicked = pickedIds.value.has(c.id);

  if (isPicked) {
    emit("update:selected", props.selected.filter((x) => x.id !== c.id));
    return;
  }

  if (props.selected.length >= props.limit) return;

  emit("update:selected", [...props.selected, c]);
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>