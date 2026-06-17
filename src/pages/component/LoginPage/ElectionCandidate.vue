<template>
  <section class="rounded-2xl md:rounded-3xl bg-slate-100 p-4 md:p-8 ring-1 ring-slate-200  overflow-hidden">
    
    <div class="flex flex-col gap-4 mb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 class="text-2xl md:text-3xl font-black text-slate-900 leading-tight mt-1">
          {{ yearTitle }} <span class="text-blue-600">CEMIMPCO</span> 
          <span class="block sm:inline"> ELECTIONS</span>
        </h2>
      </div>

      <div class="flex items-center justify-between sm:justify-end gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
        <span class="pl-3 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
          Page {{ pageIndex + 1 }} / {{ maxPageIndex + 1 }}
        </span>
        <div class="flex gap-1">
          <button
            type="button"
            class="grid h-10 w-10 place-items-center rounded-xl border border-slate-100 bg-slate-50 text-slate-600 active:scale-95 disabled:opacity-30 transition-colors hover:bg-slate-100"
            @click="prevPage"
            :disabled="pageIndex === 0"
          >
            <span class="text-xl">←</span>
          </button>
          <button
            type="button"
            class="grid h-10 w-10 place-items-center rounded-xl border border-slate-100 bg-slate-50 text-slate-600 active:scale-95 disabled:opacity-30 transition-colors hover:bg-slate-100"
            @click="nextPage"
            :disabled="pageIndex >= maxPageIndex"
          >
            <span class="text-xl">→</span>
          </button>
        </div>
      </div>
    </div>

    <div class="flex flex-nowrap sm:flex-wrap gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
      <button
        v-for="t in tabsComputed"
        :key="t.key"
        type="button"
        class="shrink-0 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition-all active:scale-95"
        :class="activeTab === t.key
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 ring-2 ring-blue-600 ring-offset-1'
          : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'"
        @click="setTab(t.key)"
      >
        {{ t.label }}
      </button>
    </div>

    <div class="relative min-h-[400px]">
      <TransitionGroup 
        name="slide-fade" 
        tag="div" 
        class="grid gap-4 md:gap-6 lg:grid-cols-2"
      >
        <article
          v-for="c in pagedCandidates"
          :key="c.id"
          class="group relative flex flex-col sm:flex-row gap-4 md:gap-5 rounded-2xl border border-slate-200 bg-white p-4 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60"
        >
          <div class="shrink-0 flex sm:block items-center gap-4">
            <div class="h-16 w-16 md:h-20 md:w-20 overflow-hidden rounded-2xl ring-4 ring-slate-50 shadow-inner">
              <img :src="c.avatar" alt="" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
            </div>
            <div class="sm:hidden flex-1">
              <span class="text-[9px] font-black uppercase tracking-tighter text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                {{ c.position }}
              </span>
              <h3 class="text-lg font-black text-slate-900 leading-tight mt-1">{{ c.name }}</h3>
            </div>
          </div>

          <div class="flex flex-1 flex-col">
            <div class="hidden sm:flex mb-1 items-center justify-between">
              <span class="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {{ c.position }}
              </span>
            </div>

            <h3 class="hidden sm:block text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
              {{ c.name }}
            </h3>
            <p class="text-[10px] md:text-xs font-medium text-slate-400">Member since {{ c.memberSince }}</p>

            <p class="mt-2 md:mt-4 line-clamp-3 text-sm leading-relaxed text-slate-600 italic">
              "{{ c.quote }}"
            </p>

            <div class="mt-4 sm:mt-auto pt-2 flex items-center justify-between">
              <button
                type="button"
                class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-800 transition-colors"
                @click="openManifesto(c)"
              >
                View Full Vision
                <span class="transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>
          </div>
        </article>
      </TransitionGroup>

      <div v-if="!pagedCandidates.length" class="py-20 text-center rounded-3xl border-2 border-dashed border-slate-200 bg-white/50">
        <p class="text-slate-400 font-medium">Loading candidates...</p>
      </div>
    </div>

    <div class="mt-10 flex items-center justify-center gap-3">
      <button
        v-for="i in maxPageIndex + 1"
        :key="i"
        @click="pageIndex = i - 1"
        class="h-1.5 rounded-full transition-all duration-300"
        :class="pageIndex === (i - 1) ? 'w-10 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'"
      />
    </div>

    <Transition name="modal-fade">
      <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-md bg-slate-900/40" @click.self="closeModal">
        <div class="w-full max-w-2xl h-[85vh] sm:h-auto overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95">
          <div class="relative h-28 md:h-32 bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8">
            <button class="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-black/10 text-white hover:bg-black/20" @click="closeModal">✕</button>
            <div class="absolute -bottom-8 left-6 md:left-8 h-20 w-20 md:h-24 md:w-24 overflow-hidden rounded-2xl border-4 border-white bg-slate-100 shadow-lg">
               <img :src="modalData?.avatar" alt="" class="h-full w-full object-cover" />
            </div>
          </div>
          
          <div class="p-6 md:p-8 pt-12 md:pt-14">
            <span class="text-[10px] font-black uppercase tracking-widest text-blue-600">{{ modalData?.position }}</span>
            <h3 class="text-2xl md:text-3xl font-black text-slate-900 leading-tight">{{ modalData?.name }}</h3>
            
            <div class="mt-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              <p class="whitespace-pre-line text-sm md:text-base leading-relaxed text-slate-700">
                {{ modalData?.manifesto }}
              </p>
            </div>

            <div class="mt-8 flex justify-end">
              <button class="w-full sm:w-auto rounded-xl bg-slate-900 px-8 py-3 font-bold text-white active:scale-95 transition hover:bg-slate-800" @click="closeModal">
                Back to Candidates
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
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
  membership_date: string | null;
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
  tabKey: string;
  positionId: number;
};

type Tab = { key: string; label: string; sortId: number };

const electionStore = useElectionStore();
const yearTitle = computed(() => electionStore.year || new Date().getFullYear());

const perPage = 4;
const activeTab = ref<string>("");
const pageIndex = ref<number>(0);

const apiCandidates = ref<UiCandidate[]>([]);
const randomized = ref<UiCandidate[]>([]);

// ---------- Formatting ----------
function formatMemberSince(raw: string | null): string {
  if (!raw) return "—";
  const m = raw.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return raw;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

function mapApiToUi(list: ApiCandidate[]): UiCandidate[] {
  return list.map((c, idx) => {
    const vision = c.vision || "";
    return {
      id: `${c.position_id}-${c.member_name}-${idx}`,
      name: c.member_name || "Unknown",
      position: c.position_desc || "Candidate",
      memberSince: formatMemberSince(c.membership_date),
      quote: vision.length > 120 ? vision.slice(0, 120) + "…" : vision || "No vision provided.",
      manifesto: vision || "No vision provided.",
      avatar: c.photo_url || "/default-avatar.png",
      tabKey: c.position_desc,
      positionId: parseInt(c.position_id) || 999,
    };
  });
}

// ---------- Shuffle Logic ----------
// ---------- Shuffle & Randomization ----------

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

// Global randomize function
function randomizePerPosition() {
  const groups: Record<string, UiCandidate[]> = {};
  apiCandidates.value.forEach(c => (groups[c.tabKey] ||= []).push(c));
  
  const out: UiCandidate[] = [];
  Object.values(groups).forEach(group => out.push(...shuffleArray(group)));
  randomized.value = out;
}

// ---------- Tabs (Sorted by ID) ----------
const tabsComputed = computed<Tab[]>(() => {
  const uniq = new Map<string, number>();
  apiCandidates.value.forEach(c => {
    if (!uniq.has(c.tabKey)) uniq.set(c.tabKey, c.positionId);
  });
  return Array.from(uniq.entries())
    .map(([key, sortId]) => ({ key, label: key, sortId }))
    .sort((a, b) => a.sortId - b.sortId);
});

// ---------- Core Actions ----------
async function loadCandidates() {
  try {
    const year = electionStore.year || new Date().getFullYear();
    const response = await fetchCandidates(year);
    if (!response.data?.success) return;

    apiCandidates.value = mapApiToUi(response.data.candidates || []);
    randomizePerPosition(); // Initial shuffle

    if (tabsComputed.value.length > 0 && !activeTab.value) {
      activeTab.value = tabsComputed.value[0]?.key ?? "";
    }
    pageIndex.value = 0;
  } catch (error) {
    console.error(error);
  }
}

function setTab(key: string) {
  activeTab.value = key;
  pageIndex.value = 0;
  // RESHUFFLE on tab click
  randomizePerPosition(); 
}

onMounted(loadCandidates);
watch(() => electionStore.year, () => {
  activeTab.value = "";
  loadCandidates();
});

// ---------- Filtering & Pagination ----------
const filtered = computed(() => {
  return randomized.value.filter(c => c.tabKey === activeTab.value);
});

const maxPageIndex = computed(() => Math.max(0, Math.ceil(filtered.value.length / perPage) - 1));
const pagedCandidates = computed(() => {
  const start = pageIndex.value * perPage;
  return filtered.value.slice(start, start + perPage);
});

function prevPage() { pageIndex.value = Math.max(0, pageIndex.value - 1); }
function nextPage() { pageIndex.value = Math.min(maxPageIndex.value, pageIndex.value + 1); }

// ---------- Modal ----------
const modalOpen = ref(false);
const modalData = ref<UiCandidate | null>(null);
function openManifesto(c: UiCandidate) { modalData.value = c; modalOpen.value = true; }
function closeModal() { modalOpen.value = false; }
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

/* Grid Transition: Slide + Fade */
.slide-fade-enter-active { transition: all 0.4s ease-out; }
.slide-fade-leave-active { transition: all 0.3s ease-in; position: absolute; width: 48%; }
.slide-fade-enter-from { transform: translateY(15px); opacity: 0; }
.slide-fade-leave-to { transform: scale(0.9); opacity: 0; }

/* Modal Transitions */
.modal-fade-enter-active, .modal-fade-leave-active { transition: all 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
</style>