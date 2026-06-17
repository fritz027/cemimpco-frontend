<template>
  <div class="min-h-screen bg-[#f8fafc] pb-12">
    <div class="top-0 z-30 border-b bg-white/80 backdrop-blur-md">
      <div class="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              {{ surveyTitle }}
            </h1>
            <div class="flex items-center gap-2 mt-1">
              <span class="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <p class="text-xs font-medium text-slate-500">
                Live Results • Last updated {{ lastUpdated }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <select 
              v-model="sortBy" 
              class="rounded-xl border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="seq_asc">Order: Default</option>
              <option value="yes_desc">Highest Yes %</option>
              <option value="no_desc">Highest No %</option>
              <option value="votes_desc">Most Votes</option>
            </select>

            <button
              class="inline-flex h-10 items-center rounded-xl border bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50"
              :disabled="loading"
              @click="loadResults"
            >
              <span v-if="loading" class="flex items-center gap-2">
                <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Syncing
              </span>
              <span v-else>Reload</span>
            </button>
            
            <button
              class="inline-flex h-10 items-center rounded-xl bg-slate-900 px-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-slate-800 active:scale-95"
              @click="printSummary"
            >
              Print Report
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div class="relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Registered Voters</p>
            <span class="rounded-lg bg-slate-50 p-1.5 text-slate-600">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            </span>
          </div>
          <p class="mt-2 text-2xl font-black text-slate-900">{{ formatNumber(totalRegisterVoter) }}</p>
        </div>

        <div class="relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Participation</p>
            <span class="rounded-lg bg-blue-50 p-1.5 text-blue-600">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </span>
          </div>
          <p class="mt-2 text-2xl font-black text-slate-900">{{ formatNumber(totalParticipants) }} ({{ participationRate.toFixed(1)}}%)</p>
        </div>

        <div class="relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Questions</p>
            <span class="rounded-lg bg-purple-50 p-1.5 text-purple-600">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </span>
          </div>
          <p class="mt-2 text-2xl font-black text-slate-900">{{ questionResults.length }}</p>
        </div>
      </div>

      <div class="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-bold text-slate-700">Overall Participation Progress</h3>
          <span class="text-sm font-black text-blue-600">{{ participationRate.toFixed(1) }}%</span>
        </div>
        <div class="relative h-4 w-full overflow-hidden rounded-full bg-slate-100">
          <div 
            class="h-full bg-blue-600 transition-all duration-1000 ease-out" 
            :style="{ width: `${participationRate}%` }"
          ></div>
        </div>
        <p class="mt-2 text-xs text-slate-500">
          {{ formatNumber(totalParticipants) }} out of {{ formatNumber(totalRegisterVoter) }} registered members have cast their votes.
        </p>
      </div>

      <div v-if="error" class="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 flex items-center gap-3 text-red-700">
        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
        <span class="font-medium">{{ error }}</span>
      </div>

      <div class="mt-10 space-y-6">
        <h2 class="text-lg font-bold text-slate-800">Detailed Breakdown</h2>
        
        <div
          v-for="q in sortedQuestionResults"
          :key="q.survey_qid"
          class="group relative rounded-3xl border bg-white p-6 shadow-sm transition-all hover:shadow-md"
        >
          <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3">
                <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                  {{ q.survey_seq }}
                </span>
                <h3 class="text-base font-bold text-slate-900">{{ q.survey_question }}</h3>
              </div>

              <div v-if="q.survey_context" class="mt-4">
                <div
                  class="relative rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600 transition-all"
                  :class="expanded[q.survey_qid] ? '' : 'max-h-24 overflow-hidden'"
                >
                  <span class="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">Context</span>
                  <div v-html="q.survey_context" class="prose prose-sm max-w-none"></div>
                  
                  <div v-if="!expanded[q.survey_qid] && q.survey_context.length > 200" class="absolute bottom-0 left-0 h-12 w-full bg-gradient-to-t from-slate-50 to-transparent"></div>
                </div>
                
                <button
                  v-if="q.survey_context.length > 200"
                  class="mt-2 text-xs font-bold text-blue-600 hover:text-blue-700"
                  @click="toggle(q.survey_qid)"
                >
                  {{ expanded[q.survey_qid] ? "Show less" : "Read full context" }}
                </button>
              </div>
            </div>

            <div class="flex min-w-[240px] flex-col gap-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="rounded-2xl bg-green-50/50 p-3 text-center border border-green-100">
                  <p class="text-2xl font-black text-green-600">{{ q.yesPct.toFixed(0) }}%</p>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-green-700">Yes</p>
                </div>
                <div class="rounded-2xl bg-red-50/50 p-3 text-center border border-red-100">
                  <p class="text-2xl font-black text-red-600">{{ q.noPct.toFixed(0) }}%</p>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-red-700">No</p>
                </div>
              </div>

              <div class="h-4 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner flex">
                <div class="h-full bg-green-500 transition-all duration-700" :style="{ width: `${q.yesPct}%` }"></div>
                <div class="h-full bg-red-400 transition-all duration-700" :style="{ width: `${q.noPct}%` }"></div>
              </div>

              <div class="flex items-center justify-between px-1 text-[11px] font-bold text-slate-500">
                <span>{{ formatNumber(q.yes) }} Yes</span>
                <span class="text-slate-300">|</span>
                <span>{{ formatNumber(q.no) }} No</span>
                <span class="text-slate-300">|</span>
                <span class="text-slate-900">{{ formatNumber(q.totalVotes) }} Total</span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="!loading && !questionResults.length" class="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center">
          <div class="rounded-full bg-slate-50 p-4 text-slate-400">
             <svg class="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <h3 class="mt-4 text-lg font-bold text-slate-900">No data found</h3>
          <p class="text-sm text-slate-500">We couldn't find any results for this survey yet.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { surveyResult, allSurvey } from "@/services/survey.services";
import { useRoute } from "vue-router";

// Types remain the same as your business logic
type ApiRow = {
  survey_qid: number;
  survey_seq: number;
  survey_question: string;
  survey_context: string;
  answer: "y" | "n";
  total: number;
  member_no: string;
};

type QuestionResult = {
  survey_qid: number;
  survey_seq: number;
  survey_question: string;
  survey_context: string;
  yes: number;
  no: number;
  totalVotes: number;
  yesPct: number;
  noPct: number;
};

const authStore = useAuthStore();
const route = useRoute();
const surveyId = computed(() => route.params.id as string);

// State
const apiRows = ref<ApiRow[]>([]);
const expanded = ref<Record<number, boolean>>({});
const surveyTitle = ref("Loading Survey...");
const lastUpdated = ref(new Date().toLocaleString());
const totalRegisterVoter = ref(0);
const loading = ref(false);
const error = ref("");
const sortBy = ref<"seq_asc" | "yes_desc" | "no_desc" | "votes_desc">("seq_asc");

// Printing Config
const printLimit = 20; // Increased since we are using a dense table for print

function toggle(id: number) {
  expanded.value[id] = !expanded.value[id];
}

function toQuestionResults(rows: ApiRow[]): QuestionResult[] {
  const map = new Map<number, any>();

  for (const r of rows) {
    if (!map.has(r.survey_qid)) {
      map.set(r.survey_qid, {
        survey_qid: r.survey_qid,
        survey_seq: r.survey_seq,
        survey_question: r.survey_question,
        survey_context: r.survey_context,
        yes: 0,
        no: 0,
      });
    }
    const existing = map.get(r.survey_qid);
    const ans = r.answer?.toLowerCase();

    const count = r.total ? Number(r.total) : 1;
    if (ans === "y") existing.yes += count;
    if (ans === "n") existing.no += count;
  }

  return Array.from(map.values()).map((q) => {
    const totalVotes = q.yes + q.no;
    return {
      ...q,
      totalVotes,
      yesPct: totalVotes ? (q.yes / totalVotes) * 100 : 0,
      noPct: totalVotes ? (q.no / totalVotes) * 100 : 0,
    };
  });
}

const questionResults = computed(() => toQuestionResults(apiRows.value));

const sortedQuestionResults = computed(() => {
  const arr = [...questionResults.value];
  switch (sortBy.value) {
    case "seq_asc": arr.sort((a, b) => a.survey_seq - b.survey_seq); break;
    case "yes_desc": arr.sort((a, b) => b.yesPct - a.yesPct); break;
    case "no_desc": arr.sort((a, b) => b.noPct - a.noPct); break;
    case "votes_desc": arr.sort((a, b) => b.totalVotes - a.totalVotes); break;
  }
  return arr;
});

const totalParticipants = computed(() => {
  // If you have a user_id field in your apiRows
  const uniqueUsers = new Set(apiRows.value.map(row => row.member_no));
  return uniqueUsers.size;
});

const totalVotesCast = computed(() => {
  return questionResults.value.reduce((acc, q) => acc + q.totalVotes, 0);
});
const avgYesPct = computed(() => {
  if (!questionResults.value.length) return 0;
  return questionResults.value.reduce((acc, q) => acc + q.yesPct, 0) / questionResults.value.length;
});

// Helper for formatting
const formatNumber = (n: number) => new Intl.NumberFormat().format(n);

// Security helper for print strings
function esc(s: any) {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function printSummary() {
  const printItems = [...questionResults.value]
    .sort((a, b) => a.survey_seq - b.survey_seq)
    .slice(0, printLimit);

  const rowsHtml = printItems.map(q => `
    <tr>
      <td class="num">${q.survey_seq}</td>
      <td>
        <div class="q">${esc(q.survey_question)}</div>
      </td>
      <td class="right bold">${Math.round(q.yesPct)}%</td>
      <td class="right">${formatNumber(q.yes)}</td>
      <td class="right">${formatNumber(q.no)}</td>
      <td class="right bold">${formatNumber(q.totalVotes)}</td>
    </tr>
  `).join("");

  const html = `
    <html>
    <head>
      <title>Report - ${esc(surveyTitle.value)}</title>
      <style>
        @page { size: A4; margin: 15mm; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; line-height: 1.4; }
        header { border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
        h1 { margin: 0; font-size: 20px; color: #0f172a; }
        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 30px; }
        .stat-card { border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; }
        .stat-label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold; }
        .stat-val { font-size: 18px; font-weight: 800; color: #0f172a; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th { text-align: left; background: #f8fafc; padding: 8px; border-bottom: 2px solid #cbd5e1; }
        td { padding: 8px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
        .right { text-align: right; }
        .bold { font-weight: 700; }
        .q { font-weight: 700; color: #0f172a; margin-bottom: 4px; }
        .ctx { color: #475569; font-size: 10px; font-style: italic; }
        tr { page-break-inside: avoid; }
      </style>
    </head>
    <body>
      <header>
        <div>
          <h1>${esc(surveyTitle.value)}</h1>
          <div style="font-size: 10px; color: #64748b;">Report Generated: ${new Date().toLocaleString()}</div>
        </div>
      </header>
      <div class="summary-grid">
        <div class="stat-card">
          <div class="stat-label">Registered Voters</div>
          <div class="stat-val">${formatNumber(totalRegisterVoter.value)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Actual Participation</div>
          <div class="stat-val">${formatNumber(totalParticipants.value)} (${participationRate.value.toFixed(1)}%)</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Questions</div>
          <div class="stat-val">${questionResults.value.length}</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:30px">#</th>
            <th>Question Detail</th>
            <th class="right" style="width:60px">Yes %</th>
            <th class="right" style="width:50px">Yes</th>
            <th class="right" style="width:50px">No</th>
            <th class="right" style="width:60px">Total</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </body>
    </html>
  `;

  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 500);
  }
}

const participationRate = computed(() => {
  if (!totalRegisterVoter.value) return 0;
  const rate = (totalParticipants.value / totalRegisterVoter.value) * 100;
  return Math.min(rate, 100); // Caps it at 100% just in case
});

async function loadResults() {
  if (!surveyId.value) {
    error.value = "Missing survey id.";
    return;
  }
  loading.value = true;
  error.value = "";
  try {
    const [surveysRes, resultsRes] = await Promise.all([
      allSurvey(authStore.accessToken),
      surveyResult(surveyId.value, authStore.accessToken)
    ]);

    console.log(resultsRes.data)
    const found = surveysRes.data.surveys.find((s: any) => s.survey_id == surveyId.value);
    if (found) surveyTitle.value = found.survey_name;

    if (resultsRes.data.success) {
      totalRegisterVoter.value = resultsRes.data.totalRegisteredVoters;
      apiRows.value = resultsRes.data.results || [];
      lastUpdated.value = new Date().toLocaleTimeString();
    }
  } catch (e: any) {
    error.value = "Failed to synchronize data.";
  } finally {
    loading.value = false;
  }
}

onMounted(loadResults);
</script>

<style scoped>
/* Added for the v-html context rendering */
:deep(.prose) {
  color: inherit;
}
:deep(.prose p) {
  margin-bottom: 0.5rem;
}
:deep(.prose strong) {
  font-weight: 700;
  color: #1e293b;
}
</style>