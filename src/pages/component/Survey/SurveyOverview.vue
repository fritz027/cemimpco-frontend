<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { allSurvey, surveyResult } from "@/services/survey.services"; // Added surveyResult

/** =========================
 * Types
 * ========================= */
type SurveyStatus = "Live" | "Scheduled" | "Closed" | "Stopped";

type ApiSurvey = {
  survey_id: string;
  survey_name: string;
  survey_from: string;
  survey_to: string;
  status: string;
  total_question: number;
  survey_status: string;
  total_responses?: number; // In case your new SQL adds this directly
};

type Survey = {
  id: string;
  title: string;
  enabled: boolean;
  stage: SurveyStatus;
  startAt: string;
  endAt: string;
  totalQuestion: number;
  raw: ApiSurvey;
};

/** =========================
 * State
 * ========================= */
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const surveys = ref<Survey[]>([]);
const loading = ref(false);
const pollLoading = ref(false); // To show loading state for the numbers
const errorMessage = ref("");
const selectedUpcomingId = ref<string | null>(null);
const lastUpdated = ref(new Date().toLocaleTimeString());
const now = ref(Date.now());

// Dashboard Stats
const totalRegistered = ref(0); 
const totalResponses = ref(0);  

let tick: number | undefined;

const editId = computed(() => {
  const q = route.query.id;
  return Array.isArray(q) ? q[0] : q;
});
const isEdit = computed(() => route.query.edit === "true");

/** =========================
 * Helpers
 * ========================= */
function sqlAnywhereToISO(dt?: string | null): string {
  if (!dt) return "";
  const noFrac = dt.includes(".") ? dt.substring(0, dt.indexOf(".")) : dt;
  return noFrac.replace(" ", "T") + "+08:00";
}

function normalizeSurveyStatus(v: any): SurveyStatus {
  const s = String(v ?? "").toLowerCase();
  if (s === "active" || s === "live") return "Live";
  if (s === "upcoming" || s === "scheduled") return "Scheduled";
  if (s === "closed" || s === "ended" || s === "finished") return "Closed";
  if (s === "stopped" || s === "disabled") return "Stopped";
  return "Scheduled";
}

function fmtDateTime(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatNumber(n: number) {
  return new Intl.NumberFormat().format(n);
}

function mapSurvey(row: ApiSurvey): Survey {
  return {
    id: row.survey_id,
    title: row.survey_name,
    enabled: String(row.status) === "1",
    stage: normalizeSurveyStatus(row.survey_status),
    startAt: sqlAnywhereToISO(row.survey_from),
    endAt: sqlAnywhereToISO(row.survey_to),
    totalQuestion: Number(row.total_question ?? 0),
    raw: row,
  };
}

/** =========================
 * Computed
 * ========================= */
const currentSurvey = computed(() => {
  const list = surveys.value.filter(s => s.enabled);
  const live = list.find((s) => s.stage === "Live");
  if (live) return live;
  const next = list.filter((s) => s.stage === "Scheduled").sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())[0];
  return next ?? list[0] ?? null;
});

const upcomingSurveys = computed(() => {
  const currentId = currentSurvey.value?.id;
  return surveys.value
    .filter((s) => s.enabled && s.stage === "Scheduled" && s.id !== currentId)
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
});

const remainingTime = computed(() => {
  const s = currentSurvey.value;
  if (!s || s.stage !== "Live") return "—";
  const end = new Date(s.endAt).getTime();
  if (Number.isNaN(end)) return "—";

  const diff = Math.max(0, end - now.value);
  if (diff === 0) return "Ended";
  
  const sec = Math.floor(diff / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
});

const turnoutPct = computed(() => {
  if (!totalRegistered.value) return 0;
  return Math.min((totalResponses.value / totalRegistered.value) * 100, 100);
});

const statusBadge = (status: SurveyStatus) => {
  if (status === "Live") return { text: "Active", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" };
  if (status === "Scheduled") return { text: "Upcoming", cls: "bg-amber-100 text-amber-800 border-amber-200" };
  if (status === "Closed") return { text: "Closed", cls: "bg-slate-100 text-slate-700 border-slate-200" };
  return { text: "Stopped", cls: "bg-red-100 text-red-800 border-red-200" };
};

/** =========================
 * API Calls
 * ========================= */
async function loadPollData(surveyId: string) {
  pollLoading.value = true;
  try {
    const res = await surveyResult(surveyId, authStore.accessToken);
    if (res.data.success) {
      // 1. Set total registered voters from API
      totalRegistered.value = res.data.totalRegisteredVoters || 0;
      
      // 2. Calculate unique participants
      const rows = res.data.results || [];
      const uniqueUsers = new Set(rows.map((row: any) => row.member_no));
      totalResponses.value = uniqueUsers.size;
    }
  } catch (err) {
    console.error("Failed to load survey results for dashboard", err);
  } finally {
    pollLoading.value = false;
  }
}

async function loadSurvey() {
  loading.value = true;
  errorMessage.value = "";

  try {
    const res = await allSurvey(authStore.accessToken);
    if (!res?.data?.success) {
      errorMessage.value = res?.data?.message ?? "Failed to load surveys";
      return;
    }

    const rows: ApiSurvey[] = res.data.surveys ?? [];
    surveys.value = (Array.isArray(rows) ? rows : []).map(mapSurvey);
    
    // --> NEW: Check if there is a current active survey, and load its results! <--
    if (currentSurvey.value) {
      await loadPollData(currentSurvey.value.id);
    }

    lastUpdated.value = new Date().toLocaleTimeString();
  } catch (err) {
    errorMessage.value = "Failed to load surveys";
  } finally {
    loading.value = false;
  }
}

/** =========================
 * Lifecycle & Navigation
 * ========================= */
onMounted(async () => {
  await loadSurvey();
  tick = window.setInterval(() => {
    now.value = Date.now();
  }, 1000);
});

onBeforeUnmount(() => { if (tick) window.clearInterval(tick); });

async function editDetails(id: string) {
  await router.push({ name: "SurveyList", query: { id, edit: "true" } });
}
</script>

<template>
  <div class="min-h-screen bg-[#f8fafc] pb-12">
    <div class="top-0 z-30 border-b bg-white/80 backdrop-blur-md">
      <div class="mx-auto max-w-6xl px-4 py-4 sm:px-6 flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Survey Dashboard</h1>
          <div class="flex items-center gap-2 mt-1">
            <span class="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            <p class="text-xs font-medium text-slate-500">Live feed • Updated {{ lastUpdated }}</p>
          </div>
        </div>
        <button
          @click="loadSurvey"
          :disabled="loading"
          class="inline-flex h-10 items-center rounded-xl border bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50"
        >
          {{ loading ? 'Syncing...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <div class="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
      
      <div v-if="errorMessage" class="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 flex items-center gap-3 shadow-sm">
        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
        <span class="font-medium">{{ errorMessage }}</span>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div class="relative overflow-hidden rounded-3xl border bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Time Left</p>
            <span class="rounded-xl bg-orange-50 p-2 text-orange-500">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </span>
          </div>
          <p class="mt-4 text-3xl font-black text-slate-900">{{ remainingTime }}</p>
        </div>

        <div class="relative overflow-hidden rounded-3xl border bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Registered</p>
            <span class="rounded-xl bg-blue-50 p-2 text-blue-600">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </span>
          </div>
          <p class="mt-4 text-3xl font-black text-slate-900">{{ formatNumber(totalRegistered) }}</p>
        </div>

        <div class="relative overflow-hidden rounded-3xl border bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Casted</p>
            <span class="rounded-xl bg-emerald-50 p-2 text-emerald-600">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </span>
          </div>
          <p class="mt-4 text-3xl font-black text-slate-900">{{ formatNumber(totalResponses) }}</p>
        </div>

        <div class="relative overflow-hidden rounded-3xl border bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Turnout Rate</p>
            <span class="rounded-xl bg-purple-50 p-2 text-purple-600">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            </span>
          </div>
          <p class="mt-4 text-3xl font-black text-slate-900">{{ turnoutPct.toFixed(1) }}%</p>
          <div class="absolute bottom-0 left-0 h-1.5 w-full bg-slate-100">
            <div class="h-full bg-purple-500 transition-all duration-1000" :style="{ width: `${turnoutPct}%` }"></div>
          </div>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        
        <div class="lg:col-span-2 space-y-6">
          <div class="rounded-3xl border bg-white shadow-sm overflow-hidden">
            <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-5">
              <h2 class="text-lg font-bold text-slate-800">Active / Next Survey</h2>
              <button
                v-if="currentSurvey"
                class="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-blue-600 shadow-sm border hover:bg-slate-50 transition-colors"
                @click="editDetails(currentSurvey.id)"
              >
                Edit Configuration
              </button>
            </div>

            <div v-if="currentSurvey" class="p-6">
              <div class="flex items-start justify-between mb-6">
                <div>
                  <div class="flex items-center gap-3 mb-2">
                    <span class="rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider" :class="statusBadge(currentSurvey.stage).cls">
                      {{ statusBadge(currentSurvey.stage).text }}
                    </span>
                    <span v-if="!currentSurvey.enabled" class="text-xs font-bold text-red-500 flex items-center gap-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                      Force Stopped
                    </span>
                  </div>
                  <h3 class="text-2xl font-black text-slate-900">{{ currentSurvey.title }}</h3>
                  <p class="mt-1 text-sm text-slate-500 font-mono">ID: {{ currentSurvey.id }}</p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <div>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Start Date</p>
                  <p class="mt-1 text-sm font-bold text-slate-800">{{ fmtDateTime(currentSurvey.startAt) }}</p>
                </div>
                <div>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">End Date</p>
                  <p class="mt-1 text-sm font-bold text-slate-800">{{ fmtDateTime(currentSurvey.endAt) }}</p>
                </div>
                <div class="col-span-2 pt-2 border-t border-slate-200 mt-2">
                  <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Questions Attached</p>
                  <p class="mt-1 text-lg font-black text-slate-800">{{ currentSurvey.totalQuestion }}</p>
                </div>
              </div>
            </div>

            <div v-else class="p-12 text-center flex flex-col items-center">
              <div class="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4">
                 <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
              </div>
              <h3 class="text-lg font-bold text-slate-900">No Active Surveys</h3>
              <p class="text-sm text-slate-500 mt-1">There are currently no active or upcoming surveys available.</p>
            </div>
          </div>
          
          <div class="rounded-3xl border bg-white p-6 shadow-sm">
             <h3 class="text-sm font-bold text-slate-800 mb-4">Live Participation Progress</h3>
             <div class="flex items-end justify-between mb-2">
                <div>
                   <span class="text-2xl font-black text-blue-600">{{ turnoutPct.toFixed(1) }}%</span>
                   <span class="text-sm text-slate-500 ml-2">Response Rate</span>
                </div>
                <p class="text-xs font-bold text-slate-600">{{ formatNumber(totalResponses) }} / {{ formatNumber(totalRegistered) }}</p>
             </div>
             <div class="h-4 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
                <div class="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000" :style="{ width: `${turnoutPct}%` }"></div>
             </div>
            <div class="mt-5 flex items-center gap-3 rounded-xl bg-blue-50/50 p-4 border border-blue-100">
              <span class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              <p class="text-xs text-blue-800">
                <strong class="font-bold">Live Tracking Active.</strong> 
                Results are synchronizing automatically as members cast their votes.
              </p>
            </div>
          </div>
        </div>

        <div class="rounded-3xl border bg-white shadow-sm flex flex-col overflow-hidden max-h-[800px]">
          <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-5">
            <h2 class="text-lg font-bold text-slate-800">Upcoming Schedule</h2>
            <span class="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-700">{{ upcomingSurveys.length }}</span>
          </div>

          <div class="flex-1 overflow-y-auto p-4 bg-slate-50/30">
            <div v-if="upcomingSurveys.length === 0" class="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              No other scheduled surveys.
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="s in upcomingSurveys"
                :key="s.id"
                class="group relative overflow-hidden rounded-2xl border bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md cursor-pointer"
                :class="selectedUpcomingId === s.id ? 'border-blue-400 ring-2 ring-blue-50' : 'border-slate-200'"
                @click="selectedUpcomingId = s.id"
              >
                <div class="absolute left-0 top-0 h-full w-1 bg-blue-500 opacity-0 transition-opacity group-hover:opacity-100" :class="{ 'opacity-100': selectedUpcomingId === s.id }"></div>
                
                <div class="flex flex-col gap-2">
                  <div class="flex items-start justify-between">
                    <p class="font-bold text-slate-900 line-clamp-2 pr-2 leading-tight">{{ s.title }}</p>
                    <span class="shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase" :class="statusBadge(s.stage).cls">
                      {{ statusBadge(s.stage).text }}
                    </span>
                  </div>
                  
                  <div class="mt-2 flex items-center gap-2 text-[11px] text-slate-500 font-medium bg-slate-50 p-2 rounded-lg">
                    <svg class="h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <span>{{ fmtDateTime(s.startAt).split(',')[0] }}</span>
                    <span>&bull;</span>
                    <span>{{ s.totalQuestion }} Qs</span>
                  </div>
                </div>
                
                <div v-if="!s.enabled" class="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-red-600 bg-red-50 p-1.5 rounded-lg">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  Disabled by Admin
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* Custom scrollbar for the upcoming list */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>