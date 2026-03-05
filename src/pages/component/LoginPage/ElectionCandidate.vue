<template>
  <section class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="inline-flex items-center gap-3">
        <div class="rounded-xl bg-blue-600 px-5 py-3 text-lg font-semibold text-white shadow-sm">
          {{ yearTitle }} CEMIMPCO ELECTIONS
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
          @click="prevPage"
          :disabled="pageIndex === 0"
          :class="{ 'opacity-40 cursor-not-allowed': pageIndex === 0 }"
          aria-label="Previous"
        >
          ‹
        </button>
        <button
          type="button"
          class="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
          @click="nextPage"
          :disabled="pageIndex >= maxPageIndex"
          :class="{ 'opacity-40 cursor-not-allowed': pageIndex >= maxPageIndex }"
          aria-label="Next"
        >
          ›
        </button>
      </div>
    </div>

    <!-- Tabs (NO ALL) -->
    <div class="mt-5 flex flex-wrap gap-2">
      <button
        v-for="t in tabsComputed"
        :key="t.key"
        type="button"
        class="rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-slate-200 transition"
        :class="activeTab === t.key
          ? 'bg-blue-600 text-white ring-blue-600'
          : 'bg-white text-slate-700 hover:bg-slate-50'"
        @click="setTab(t.key)"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- Grid of cards -->
    <div class="mt-6 grid gap-5 lg:grid-cols-2">
      <article
        v-for="c in pagedCandidates"
        :key="c.id"
        class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
      >
        <div class="flex gap-4">
          <div class="h-12 w-12 overflow-hidden rounded-full ring-2 ring-slate-200">
            <img :src="c.avatar" alt="" class="h-full w-full object-cover" />
          </div>

          <div class="flex-1">
            <div class="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-extrabold text-blue-700">
              {{ c.position }}
            </div>

            <h3 class="mt-1 text-lg font-extrabold text-slate-900">
              {{ c.name }}
            </h3>

            <p class="text-sm text-slate-500">Member since {{ c.memberSince }}</p>

            <p class="mt-3 text-sm italic leading-relaxed text-slate-600">
              “{{ c.quote }}”
            </p>

            <button
              type="button"
              class="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
              @click="openManifesto(c)"
            >
              View Full Vision <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </article>
    </div>

    <!-- Pagination dots -->
    <div class="mt-6 flex items-center justify-center gap-2">
      <button
        v-for="i in maxPageIndex + 1"
        :key="i"
        type="button"
        class="h-2.5 rounded-full transition"
        :class="pageIndex === (i - 1) ? 'w-8 bg-blue-600' : 'w-2.5 bg-slate-300 hover:bg-slate-400'"
        @click="pageIndex = i - 1"
        aria-label="Go to page"
      />
    </div>

    <!-- Simple Modal -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" @click.self="closeModal">
      <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-extrabold text-blue-700">{{ modalData?.position }}</p>
            <h3 class="mt-1 text-xl font-extrabold text-slate-900">{{ modalData?.name }}</h3>
            <p class="text-sm text-slate-500">Member since {{ modalData?.memberSince }}</p>
          </div>
          <button class="rounded-xl p-2 text-slate-500 hover:bg-slate-100" @click="closeModal" aria-label="Close">✕</button>
        </div>

        <div class="mt-4 space-y-3 text-sm text-slate-700">
          <p class="leading-relaxed whitespace-pre-line">
            {{ modalData?.manifesto }}
          </p>
        </div>

        <div class="mt-6 flex justify-end">
          <button class="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700" @click="closeModal">
            Close
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useElectionStore } from "@/stores/election";
import { candidates as fetchCandidates } from "@/services/auth.services";

type ApiCandidate = {
  member_name: string;
  position_desc: string;
  position_id: string;
  vision: string | null;
  membership_date: string | null; // example: "2009-04-26 00:00:00.0000"
  photo_url: string | null;
};

type UiCandidate = {
  id: string;
  name: string;
  position: string;
  memberSince: string;
  quote: string;
  manifesto: string;
  avatar: string;
  tabKey: string; // position group (position_desc)
};

type Tab = { key: string; label: string };

const electionStore = useElectionStore();
const yearTitle = computed(() => electionStore.year || new Date().getFullYear());

const perPage = 4;
const activeTab = ref<string>(""); // ✅ no "All"
const pageIndex = ref<number>(0);

const apiCandidates = ref<UiCandidate[]>([]);
const randomized = ref<UiCandidate[]>([]);

// ---------- helpers ----------
function safeText(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function formatMemberSince(raw: string | null): string {
  if (!raw) return "—";

  // raw example: "2009-04-26 00:00:00.0000"
  const cleaned = raw.trim();
  const m = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return raw;

  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);

  const d = new Date(year, month - 1, day);

  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function mapApiToUi(list: ApiCandidate[]): UiCandidate[] {
  return list.map((c, idx) => {
    const name = safeText(c.member_name, "Unknown");
    const position = safeText(c.position_desc, "Unknown Position");
    const vision = safeText(c.vision, "");

    const quote =
      vision.length > 0 ? (vision.length > 120 ? vision.slice(0, 120) + "…" : vision) : "—";

    const avatar = safeText(c.photo_url, "") || "/default-avatar.png";

    return {
      id: `${c.position_id || position}-${name}-${idx}`,
      name,
      position,
      memberSince: formatMemberSince(c.membership_date),
      quote,
      manifesto: vision || "No vision provided.",
      avatar,
      tabKey: position, // group by position_desc
    };
  });
}

// ---------- shuffle ----------
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = a[i]!;
    a[i] = a[j]!;
    a[j] = temp;
  }
  return a;
}

// ---------- maximize randomness (global shuffle + per-group shuffle) ----------
function randomizePerPosition(input: UiCandidate[]) {
  const globallyShuffled = shuffleArray(input);

  const groups: Record<string, UiCandidate[]> = {};
  for (const c of globallyShuffled) {
    (groups[c.tabKey] ||= []).push(c);
  }

  const out: UiCandidate[] = [];
  for (const group of Object.values(groups)) {
    out.push(...shuffleArray(group));
  }

  randomized.value = out;
}

// ---------- tabs (auto, NO "All") ----------
const tabsComputed = computed<Tab[]>(() => {
  const uniq = new Map<string, string>();
  for (const c of apiCandidates.value) {
    if (!uniq.has(c.tabKey)) uniq.set(c.tabKey, c.tabKey);
  }
  return Array.from(uniq.keys()).map(k => ({ key: k, label: k }));
});

// ---------- load ----------
async function loadCandidates() {
  try {
    const year = electionStore.year || new Date().getFullYear();
    const response = await fetchCandidates(year);

    if (!response.data.success) {
      apiCandidates.value = [];
      randomized.value = [];
      activeTab.value = "";
      pageIndex.value = 0;
      return;
    }

    const raw = (response.data.candidates ?? []) as ApiCandidate[];
    apiCandidates.value = mapApiToUi(raw);

    randomizePerPosition(apiCandidates.value);

    // ✅ set default tab safely (first position)
    const first = tabsComputed.value[0];
    activeTab.value = first ? first.key : "";

    pageIndex.value = 0;
  } catch (error) {
    console.log(error);
    apiCandidates.value = [];
    randomized.value = [];
    activeTab.value = "";
    pageIndex.value = 0;
  }
}

onMounted(() => {
  loadCandidates();
});

// If year changes, reload
watch(
  () => electionStore.year,
  () => loadCandidates()
);

// ---------- filtering (no "All") ----------
const filtered = computed(() => {
  if (!activeTab.value) return [];
  return randomized.value.filter(c => c.tabKey === activeTab.value);
});

// ---------- pagination ----------
const maxPageIndex = computed(() => {
  const pages = Math.ceil(filtered.value.length / perPage);
  return Math.max(0, pages - 1);
});

const pagedCandidates = computed(() => {
  const start = pageIndex.value * perPage;
  return filtered.value.slice(start, start + perPage);
});

watch(activeTab, () => {
  pageIndex.value = 0;
});

function setTab(key: string) {
  activeTab.value = key;
}

function prevPage() {
  pageIndex.value = Math.max(0, pageIndex.value - 1);
}

function nextPage() {
  pageIndex.value = Math.min(maxPageIndex.value, pageIndex.value + 1);
}

// ---------- modal ----------
const modalOpen = ref(false);
const modalData = ref<UiCandidate | null>(null);

function openManifesto(c: UiCandidate) {
  modalData.value = c;
  modalOpen.value = true;
}

function closeModal() {
  modalOpen.value = false;
  modalData.value = null;
}
</script>