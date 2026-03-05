<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { allSurvey } from "@/services/survey.services";

/** =========================
 * Types (based on your API)
 * ========================= */
type SurveyStatus = "Live" | "Scheduled" | "Closed" | "Stopped";

type ApiSurvey = {
  survey_id: string;
  survey_name: string;
  survey_from: string;   // "2026-03-10 00:00:00.0000"
  survey_to: string;     // "2026-03-31 00:00:00.0000"
  status: string;        // "0" | "1" (flag; not same as survey_status)
  total_question: number;
  survey_status: string; // "Upcoming" | "Active" | ...
};

type Survey = {
  id: string;
  title: string;

  enabled: boolean;          // from row.status ("1" / "0")
  stage: SurveyStatus;       // from row.survey_status ("Active/Upcoming/Closed")

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
const errorMessage = ref("");
const selectedUpcomingId = ref<string | null>(null);
const lastUpdated = ref(new Date().toLocaleTimeString());
const now = ref(Date.now());

let tick: number | undefined;

/** =========================
 * Route query for edit modal
 * ========================= */
const editId = computed(() => {
  const q = route.query.id;
  return Array.isArray(q) ? q[0] : q; // string | undefined
});
const isEdit = computed(() => route.query.edit === "true");

/** =========================
 * Helpers
 * ========================= */

// Convert "YYYY-MM-DD HH:mm:ss.ffff" -> "YYYY-MM-DDTHH:mm:ss+08:00"
function sqlAnywhereToISO(dt?: string | null): string {
  if (!dt) return "";
  const noFrac = dt.includes(".") ? dt.substring(0, dt.indexOf(".")) : dt;
  return noFrac.replace(" ", "T") + "+08:00";
}

// survey_status field from backend: "Active" / "Upcoming" / "Closed"
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
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapSurvey(row: ApiSurvey): Survey {
  return {
    id: row.survey_id,
    title: row.survey_name,

    enabled: String(row.status) === "1",          // ✅ start/stop flag
    stage: normalizeSurveyStatus(row.survey_status), // ✅ schedule status

    startAt: sqlAnywhereToISO(row.survey_from),
    endAt: sqlAnywhereToISO(row.survey_to),
    totalQuestion: Number(row.total_question ?? 0),

    raw: row,
  };
}
/** =========================
 * API
 * ========================= */
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

    lastUpdated.value = new Date().toLocaleTimeString();
  } catch (err) {
    console.log(err);
    errorMessage.value = "Failed to load surveys";
  } finally {
    loading.value = false;
  }
}

/** =========================
 * Computed
 * ========================= */
const visibleSurveys = computed(() => surveys.value);

const currentSurvey = computed(() => {
  const list = surveys.value.filter(s => s.enabled); // only not stopped

  const live = list.find((s) => s.stage === "Live");
  if (live) return live;

  const next = list
    .filter((s) => s.stage === "Scheduled")
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())[0];

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
  const sec = Math.floor(diff / 1000);

  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s2 = sec % 60;

  return `${d}d ${h}h ${m}m ${s2}s`;
});

const totalRegistered = computed(() => 0);
const totalResponses = computed(() => 0);

const turnoutPct = computed(() => {
  if (!totalRegistered.value) return 0;
  return (totalResponses.value / totalRegistered.value) * 100;
});

const statusBadge = (status: SurveyStatus) => {
  if (status === "Live") return { text: "Active", cls: "bg-blue-50 text-blue-700" };
  if (status === "Scheduled") return { text: "Upcoming", cls: "bg-amber-50 text-amber-700" };
  if (status === "Closed") return { text: "Closed", cls: "bg-slate-100 text-slate-700" };
  return { text: "Stopped", cls: "bg-red-50 text-red-700" };
};

/** =========================
 * Edit modal open from query
 * ========================= */
const showEdit = ref(false);
const editingSurvey = ref<{ id: string; title: string; from: string; to: string; status: string } | null>(null);

function openEditModal(id: string) {
  const s = surveys.value.find((x) => x.id === id);
  if (!s) return;

  editingSurvey.value = {
    id: s.id,
    title: s.title,
    from: s.raw.survey_from, // keep original format
    to: s.raw.survey_to,
    status: s.raw.status,    // "0" or "1" flag from API
  };

  showEdit.value = true;
}

watch(
  () => [editId.value, isEdit.value, surveys.value.length],
  () => {
    if (isEdit.value && editId.value) {
      openEditModal(editId.value);
    }
  },
  { immediate: true }
);

/** =========================
 * Lifecycle
 * ========================= */
onMounted(async () => {
  await loadSurvey();

  tick = window.setInterval(() => {
    now.value = Date.now();
    lastUpdated.value = new Date().toLocaleTimeString();
  }, 1000);
});

onBeforeUnmount(() => {
  if (tick) window.clearInterval(tick);
});

/** =========================
 * Navigation
 * ========================= */
async function editDetails(id: string) {
  await router.push({
    name: "SurveyList",
    query: { id, edit: "true" },
  });
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
      <!-- Loading / Error -->
      <div v-if="loading" class="mb-4 rounded-2xl border bg-white p-4 text-slate-600 shadow-sm">
        Loading surveys...
      </div>
      <div v-else-if="errorMessage" class="mb-4 rounded-2xl border bg-white p-4 text-red-600 shadow-sm">
        {{ errorMessage }}
      </div>

      <!-- Top cards -->
      <div class="grid gap-4 md:grid-cols-3">
        <div class="rounded-2xl border bg-white p-5 shadow-sm">
          <p class="text-sm font-semibold text-slate-500">Remaining Time</p>
          <p class="mt-2 text-3xl font-bold text-slate-900">{{ remainingTime }}</p>
        </div>
      </div>

      <!-- Main grid -->
      <div class="mt-6 grid gap-4 lg:grid-cols-3">
        <!-- Middle: Current survey -->
        <div class="lg:col-span-2 rounded-2xl border bg-white shadow-sm">
          <div class="flex items-center justify-between border-b px-6 py-4">
            <h2 class="text-base font-bold text-slate-900">Current Survey Details</h2>
            <button
              type="button"
              class="text-sm font-semibold text-blue-600 hover:text-blue-700"
              @click="currentSurvey?.id && editDetails(currentSurvey.id)"
            >
              Edit Details
            </button>
          </div>

          <div v-if="currentSurvey" class="grid gap-6 px-6 py-6 sm:grid-cols-2">
            <div>
              <p class="text-xs font-bold tracking-wider text-slate-400">SURVEY TITLE</p>
              <p class="mt-2 text-lg font-bold text-slate-900">{{ currentSurvey.title }}</p>
              <p class="mt-2 text-xs text-slate-500">
                ID: <span class="font-mono">{{ currentSurvey.id }}</span>
              </p>
            </div>

            <div>
              <p class="text-xs font-bold tracking-wider text-slate-400">STATUS</p>
              <div class="mt-2 flex items-center gap-2">
                <span
                  class="h-2.5 w-2.5 rounded-full"
                  :class="
                    currentSurvey.stage === 'Live'
                      ? 'bg-emerald-500'
                      : currentSurvey.stage === 'Scheduled'
                        ? 'bg-amber-500'
                        : currentSurvey.stage === 'Stopped'
                          ? 'bg-red-500'
                          : 'bg-slate-400'
                  "
                />
                <p
                  class="text-lg font-bold"
                  :class="
                    currentSurvey.stage === 'Live'
                      ? 'text-emerald-700'
                      : currentSurvey.stage === 'Scheduled'
                        ? 'text-amber-700'
                        : currentSurvey.stage === 'Stopped'
                          ? 'text-red-700'
                          : 'text-slate-600'
                  "
                >
                  {{ currentSurvey.stage }}
                </p>
              </div>

              <p class="mt-2 text-sm text-slate-500">
                Activate/Stop flag: <span class="font-mono">{{ currentSurvey.raw.status }}</span>
              </p>
            </div>

            <div>
              <p class="text-xs font-bold tracking-wider text-slate-400">START DATE</p>
              <p class="mt-2 text-base font-semibold text-slate-900">
                {{ fmtDateTime(currentSurvey.startAt) }}
              </p>
            </div>

            <div>
              <p class="text-xs font-bold tracking-wider text-slate-400">END DATE</p>
              <p class="mt-2 text-base font-semibold text-slate-900">
                {{ fmtDateTime(currentSurvey.endAt) }}
              </p>
            </div>

            <div class="sm:col-span-2">
              <p class="text-xs font-bold tracking-wider text-slate-400">TOTAL QUESTIONS</p>
              <p class="mt-2 text-2xl font-bold text-slate-900">{{ currentSurvey.totalQuestion }}</p>
            </div>
          </div>

          <div v-else class="px-6 py-6 text-slate-600">
            No survey found.
          </div>
        </div>

        <!-- Right: Upcoming surveys -->
        <div class="rounded-2xl border bg-white shadow-sm">
          <div class="flex items-center justify-between border-b px-5 py-4">
            <h2 class="text-base font-bold text-slate-900">Upcoming Surveys</h2>
            <span class="text-xs font-semibold text-slate-400">{{ upcomingSurveys.length }}</span>
          </div>

          <div class="p-4">
            <div v-if="upcomingSurveys.length === 0" class="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              No upcoming surveys.
            </div>

            <div v-else class="space-y-3">
              <button
                v-for="s in upcomingSurveys"
                :key="s.id"
                type="button"
                @click="selectedUpcomingId = s.id"
                class="w-full rounded-2xl border p-4 text-left shadow-sm transition hover:bg-slate-50"
                :class="selectedUpcomingId === s.id ? 'border-blue-200 ring-2 ring-blue-100' : 'border-slate-200'"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="font-bold text-slate-900 line-clamp-1">{{ s.title }}</p>
                    <p class="mt-1 text-xs text-slate-500">
                      {{ fmtDateTime(s.startAt) }} → {{ fmtDateTime(s.endAt) }}
                    </p>
                    <p class="mt-1 text-xs text-slate-500">
                      Questions: <span class="font-semibold">{{ s.totalQuestion }}</span>
                    </p>
                  </div>

                  <span class="shrink-0 rounded-full px-3 py-1 text-xs font-bold" :class="statusBadge(s.stage).cls">
                    {{ statusBadge(s.stage).text }}
                  </span>
                </div>

                <div v-if="!s.enabled" class="mt-2 text-xs font-semibold text-red-700">
                  This survey is stopped (status={{ s.raw.status }}).
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom: placeholder for polls -->
      <div class="mt-6 rounded-2xl border bg-white shadow-sm">
        <div class="flex items-center justify-between border-b px-6 py-4">
          <h2 class="text-base font-bold text-slate-900">Current Survey Polls</h2>
          <span class="rounded-full bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">
            Last updated: {{ lastUpdated }}
          </span>
        </div>

        <div class="px-6 py-6">
          <div class="flex items-center justify-between">
            <p class="text-lg font-bold text-slate-900">Response Rate</p>
            <p class="text-lg font-bold text-slate-900">{{ turnoutPct.toFixed(2) }}%</p>
          </div>
          <div class="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div class="h-full bg-blue-600" :style="{ width: `${Math.min(100, turnoutPct)}%` }"></div>
          </div>

          <div class="mt-6 rounded-2xl bg-slate-50 p-6 text-slate-600">
            Polls/questions endpoint is not wired yet.
            <div class="mt-2 text-sm">
              If you have an endpoint like <span class="font-mono">GET /surveys/:id/questions</span>, paste its JSON and I’ll plug it in here.
            </div>
          </div>
        </div>
      </div>

      <div class="h-10"></div>
    </div>
  </div>
</template>

<style scoped>
/* optional if you don't have line-clamp plugin */
.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}
</style>