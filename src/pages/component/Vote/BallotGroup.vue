<template>
  <div>
    <div class="flex items-center justify-between">
      <div class="text-[11px] font-extrabold tracking-wider text-slate-500 uppercase">
        {{ title }}
      </div>
      <div class="text-xs font-semibold text-slate-500">
        <span class="text-blue-600">{{ picked.length }}</span>/<span>{{ limit }}</span>
      </div>
    </div>

    <div class="mt-2 space-y-2">
      <div
        v-for="c in picked"
        :key="c.id"
        class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2"
      >
        <div class="h-8 w-8 overflow-hidden rounded-lg bg-slate-200">
          <img
            v-if="c.photoUrl"
            :src="c.photoUrl"
            :alt="c.name"
            class="h-full w-full object-cover"
            loading="lazy"
          />
          <div v-else class="grid h-full w-full place-items-center bg-slate-900 text-white">
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </div>
        </div>

        <div class="min-w-0 flex-1">
          <div class="truncate text-sm font-semibold text-slate-900">{{ c.name }}</div>
        </div>

        <button
          type="button"
          class="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          @click="$emit('remove', c.id)"
          aria-label="Remove selection"
        >
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div
        v-if="picked.length === 0 && emptyText"
        class="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-500"
      >
        {{ emptyText }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export type Candidate = {
  id: string;
  name: string;
  meta: string;
  role: string;
  photoUrl?: string | null;
  avatarType?: "photo" | "illustration";
};

defineProps<{
  title: string;
  picked: Candidate[];
  limit: number;
  emptyText?: string;
}>();

defineEmits<{
  (e: "remove", id: string): void;
}>();
</script>