<!-- SurveyResultsPage.vue -->
<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">
            {{ surveyTitle }}
          </h1>
          <p class="mt-1 text-sm text-slate-500">
            Monitoring real-time binary feedback (Yes/No).
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span
            class="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200"
          >
            Last updated: {{ lastUpdated }}
          </span>

          <button
            class="inline-flex items-center rounded-xl border bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            :disabled="loading"
            @click="loadResults"
          >
            <span v-if="loading">Loading...</span>
            <span v-else>Reload</span>
          </button>
          <button
            class="inline-flex items-center rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            @click="printSummary"
          >
            Print
          </button>
        </div>
      </div>

      <!-- Top stats -->
      <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div class="rounded-2xl border bg-white p-5 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Total Votes Cast
          </p>
          <p class="mt-2 text-2xl font-bold text-slate-900">
            {{ formatNumber(totalVotesCast) }}
          </p>
          <p class="mt-1 text-xs text-slate-500">Sum of Yes/No votes across questions</p>
        </div>

        <div class="rounded-2xl border bg-white p-5 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Average Yes %
          </p>
          <p class="mt-2 text-2xl font-bold text-slate-900">
            {{ avgYesPct.toFixed(1) }}%
          </p>
          <div class="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div class="h-full bg-blue-600" :style="{ width: `${Math.min(100, avgYesPct)}%` }"></div>
          </div>
        </div>

        <div class="rounded-2xl border bg-white p-5 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Questions
          </p>
          <p class="mt-2 text-2xl font-bold text-slate-900">
            {{ formatNumber(questionResults.length) }}
          </p>
          <p class="mt-1 text-xs text-slate-500">Ordered by survey_seq</p>
        </div>
      </div>

      <!-- Error -->
      <div
        v-if="error"
        class="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        {{ error }}
      </div>

      <!-- List -->
      <div class="mt-6 space-y-4">
        <div
          v-for="q in sortedQuestionResults"
          :key="q.survey_qid"
          class="rounded-2xl border bg-white p-5 shadow-sm"
        >
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span
                class="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-blue-700"
              >
                Question {{ q.survey_seq }}
              </span>

              <p class="mt-2 text-sm font-semibold text-slate-900">
                {{ q.survey_question }}
              </p>

              <div class="mt-1 text-[11px] text-slate-600">

                <div
                  class="rounded bg-blue-50/60 px-2 py-1 text-[11px] text-slate-700"
                  :class="expanded[q.survey_qid] ? '' : 'line-clamp-2'"
                >
                  <span class="font-semibold text-slate-500 mr-1">Context:</span>
                  {{ q.survey_context }}
                </div>

                <button
                  v-if="q.survey_context && q.survey_context.length > 80"
                  class="text-[10px] font-medium text-blue-600 hover:underline"
                  @click="toggle(q.survey_qid)"
                >
                  {{ expanded[q.survey_qid] ? "less" : "more" }}
                </button>

              </div>
            </div>

            <div class="flex items-center gap-8">
              <div class="text-right">
                <p class="text-xl font-extrabold text-blue-600">{{ q.yesPct.toFixed(0) }}%</p>
                <p class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Yes</p>
              </div>

              <div class="text-right">
                <p class="text-xl font-extrabold text-slate-500">{{ q.noPct.toFixed(0) }}%</p>
                <p class="text-[10px] font-bold uppercase tracking-wide text-slate-400">No</p>
              </div>
            </div>
          </div>

          <!-- Bar -->
          <div class="mt-4">
            <div class="h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <div class="flex h-full w-full">
                <div class="h-full bg-blue-600" :style="{ width: `${q.yesPct}%` }"></div>
                <div class="h-full bg-slate-300" :style="{ width: `${q.noPct}%` }"></div>
              </div>
            </div>

            <div class="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
              <div class="flex flex-wrap items-center gap-4">
                <span class="inline-flex items-center gap-1">
                  <span class="h-2 w-2 rounded-full bg-blue-600"></span>
                  YES:
                  <span class="font-semibold text-slate-900">{{ formatNumber(q.yes) }}</span>
                </span>

                <span class="inline-flex items-center gap-1">
                  <span class="h-2 w-2 rounded-full bg-slate-300"></span>
                  NO:
                  <span class="font-semibold text-slate-900">{{ formatNumber(q.no) }}</span>
                </span>

                <span class="inline-flex items-center gap-1">
                  TOTAL:
                  <span class="font-semibold text-slate-900">{{ formatNumber(q.totalVotes) }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!loading && !questionResults.length" class="rounded-2xl border bg-white p-6 text-sm text-slate-600">
          No results returned for this survey.
        </div>
      </div>
    </div>
  </div>
  <!-- PRINT VIEW -->
<div
  id="print-area"
  v-show="printing"
  style="display: none;"
>
  <div class="p-6">
    <div class="flex items-start justify-between gap-6">
      <div>
        <h1 class="text-xl font-bold text-slate-900">{{ surveyTitle }}</h1>
        <p class="text-xs text-slate-600">Printed: {{ new Date().toLocaleString() }}</p>
      </div>

      <div class="text-right text-xs text-slate-700">
        <div><span class="font-semibold">Total Votes Cast:</span> {{ formatNumber(totalVotesCast) }}</div>
        <div><span class="font-semibold">Average Yes %:</span> {{ avgYesPct.toFixed(1) }}%</div>
        <div><span class="font-semibold">Questions:</span> {{ formatNumber(questionResults.length) }}</div>
      </div>
    </div>

    <hr class="my-4" />

    <table class="w-full text-xs">
      <thead>
        <tr class="border-b">
          <th class="py-2 text-left w-10">#</th>
          <th class="py-2 text-left">Question</th>
          <th class="py-2 text-right w-16">Yes%</th>
          <th class="py-2 text-right w-14">Yes</th>
          <th class="py-2 text-right w-14">No</th>
          <th class="py-2 text-right w-16">Total</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="q in printQuestions" :key="q.survey_qid" class="border-b align-top">
          <td class="py-2">{{ q.survey_seq }}</td>
          <td class="py-2 pr-3">
            <div class="font-semibold text-slate-900">{{ q.survey_question }}</div>
            <div v-if="q.survey_context" class="mt-0.5 text-[11px] text-slate-600">
              {{ q.survey_context }}
            </div>
          </td>
          <td class="py-2 text-right font-semibold">{{ q.yesPct.toFixed(0) }}%</td>
          <td class="py-2 text-right">{{ formatNumber(q.yes) }}</td>
          <td class="py-2 text-right">{{ formatNumber(q.no) }}</td>
          <td class="py-2 text-right font-semibold">{{ formatNumber(q.totalVotes) }}</td>
        </tr>
      </tbody>
    </table>

    <p v-if="printTruncated" class="mt-3 text-[11px] text-slate-600">
      * Only the first {{ printLimit }} questions are shown to keep it within 1 page.
    </p>
  </div>
</div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick  } from "vue";
import { useAuthStore } from "@/stores/auth";
import { surveyResult,allSurvey } from "@/services/survey.services";
import { useRoute } from "vue-router";

type ApiRow = {
  survey_qid: number;
  survey_seq: number;
  survey_question: string;
  survey_context: string;
  answer: "y" | "n";
  total: number;
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

const printing = ref(false);
const printLimit = 12;

// You can set this from another endpoint if you have survey details
const surveyTitle = ref("Survey Results");
const lastUpdated = ref(new Date().toLocaleString());

const loading = ref(false);
const error = ref("");

// Not used in this binary results view, but kept since you had them
const departments = ref<string[]>([]);
const deptCount = computed(() => departments.value.length);
const deptFilter = ref<string>("ALL");

// keep your sortBy (but adjust options to match what we actually sort)
const sortBy = ref<"seq_asc" | "yes_desc" | "no_desc" | "votes_desc">("seq_asc");

const surveyId = computed(() => route.params.id as string);

// raw API rows
const apiRows = ref<ApiRow[]>([]);
const expanded = ref<Record<number, boolean>>({});

function toggle(id: number) {
  expanded.value[id] = !expanded.value[id];
}
// group+compute per question
function toQuestionResults(rows: ApiRow[]): QuestionResult[] {
  const map = new Map<number, Omit<QuestionResult, "totalVotes" | "yesPct" | "noPct"> & { totalVotes?: number; yesPct?: number; noPct?: number }>();

  for (const r of rows) {
    const existing =
      map.get(r.survey_qid) ?? {
        survey_qid: r.survey_qid,
        survey_seq: r.survey_seq,
        survey_question: r.survey_question,
        survey_context: r.survey_context,
        yes: 0,
        no: 0,
      };

    if (r.answer === "y") existing.yes = r.total ?? 0;
    if (r.answer === "n") existing.no = r.total ?? 0;

    map.set(r.survey_qid, existing);
  }

  const result: QuestionResult[] = Array.from(map.values()).map((q: any) => {
    const totalVotes = (q.yes ?? 0) + (q.no ?? 0);
    const yesPct = totalVotes ? ((q.yes ?? 0) / totalVotes) * 100 : 0;
    const noPct = totalVotes ? ((q.no ?? 0) / totalVotes) * 100 : 0;
    return {
      survey_qid: q.survey_qid,
      survey_seq: q.survey_seq,
      survey_question: q.survey_question,
      survey_context: q.survey_context,
      yes: q.yes ?? 0,
      no: q.no ?? 0,
      totalVotes,
      yesPct,
      noPct,
    };
  });

  // default order: survey_seq
  result.sort((a, b) => a.survey_seq - b.survey_seq);
  return result;
}

const questionResults = computed(() => toQuestionResults(apiRows.value));

const sortedQuestionResults = computed(() => {
  const arr = [...questionResults.value];

  switch (sortBy.value) {
    case "seq_asc":
      arr.sort((a, b) => (a.survey_seq ?? 0) - (b.survey_seq ?? 0));
      break;
    case "yes_desc":
      arr.sort((a, b) => b.yesPct - a.yesPct);
      break;
    case "no_desc":
      arr.sort((a, b) => b.noPct - a.noPct);
      break;
    case "votes_desc":
      arr.sort((a, b) => b.totalVotes - a.totalVotes);
      break;
  }

  return arr;
});

// top stats
const totalVotesCast = computed(() => {
  return questionResults.value.reduce((acc, q) => acc + q.totalVotes, 0);
});

const avgYesPct = computed(() => {
  if (!questionResults.value.length) return 0;
  return (
    questionResults.value.reduce((acc, q) => acc + q.yesPct, 0) /
    questionResults.value.length
  );
});

const printQuestions = computed(() => {
  return [...questionResults.value]
    .sort((a, b) => (a.survey_seq ?? 0) - (b.survey_seq ?? 0))
    .slice(0, printLimit);
});

function esc(s: any) {
  return String(s ?? "")
    .replace("&", "&amp;")
    .replace("<", "&lt;")
    .replace(">", "&gt;")
    .replace('"', "&quot;")
    .replace("'", "&#039;");
}

const printTruncated = computed(() => questionResults.value.length > printLimit);

function printSummary() {
  const rowsHtml = printQuestions.value
    .map((q) => {
      return `
        <tr>
          <td class="num">${esc(q.survey_seq)}</td>
          <td>
            <div class="q">${esc(q.survey_question)}</div>
            ${q.survey_context ? `<div class="ctx">${esc(q.survey_context)}</div>` : ""}
          </td>
          <td class="right bold">${Math.round(q.yesPct)}%</td>
          <td class="right">${esc(formatNumber(q.yes))}</td>
          <td class="right">${esc(formatNumber(q.no))}</td>
          <td class="right bold">${esc(formatNumber(q.totalVotes))}</td>
        </tr>
      `;
    })
    .join("");

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${esc(surveyTitle.value)} - Print</title>
  <style>
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; color: #111; background: #fff; }
    h1 { font-size: 16px; margin: 0 0 4px 0; }
    .meta { font-size: 11px; color: #444; margin-bottom: 10px; }
    .stats { font-size: 11px; margin: 10px 0 12px; display: flex; gap: 16px; flex-wrap: wrap; }
    .stats b { font-weight: 700; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    thead th { text-align: left; border-bottom: 1px solid #999; padding: 6px 6px; }
    tbody td { border-bottom: 1px solid #ddd; padding: 6px 6px; vertical-align: top; }
    .right { text-align: right; }
    .bold { font-weight: 700; }
    .num { width: 26px; }
    .q { font-weight: 700; margin-bottom: 2px; }
    .ctx { color: #555; font-size: 10px; }
    /* keep rows from splitting awkwardly */
    tr { page-break-inside: avoid; }
  </style>
</head>
<body>
  <h1>${esc(surveyTitle.value)}</h1>
  <div class="meta">Printed: ${esc(new Date().toLocaleString())}</div>

  <div class="stats">
    <div><b>Total Votes Cast:</b> ${esc(formatNumber(totalVotesCast.value))}</div>
    <div><b>Average Yes %:</b> ${esc(avgYesPct.value.toFixed(1))}%</div>
    <div><b>Questions:</b> ${esc(formatNumber(questionResults.value.length))}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:26px">#</th>
        <th>Question</th>
        <th class="right" style="width:50px">Yes%</th>
        <th class="right" style="width:46px">Yes</th>
        <th class="right" style="width:46px">No</th>
        <th class="right" style="width:52px">Total</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml || `<tr><td colspan="6">No results.</td></tr>`}
    </tbody>
  </table>
</body>
</html>`;

  const w = window.open("", "_blank", "width=900,height=650");
  if (!w) return;

  w.document.open();
  w.document.write(html);
  w.document.close();

  // Print after the new doc is ready
  w.focus();
  w.print();
  w.close();
}

async function loadResults() {
  if (!surveyId.value) {
    error.value = "Missing survey id in route params.";
    return;
  }

  loading.value = true;
  error.value = "";

  try {

    const survey = await allSurvey(authStore.accessToken);

    const found = survey.data.surveys.find(
      (s: any) => s.survey_id == surveyId.value
    )

    if (found) {
      surveyTitle.value = found.survey_name;
    }

    const res = await surveyResult(surveyId.value, authStore.accessToken);
    // Your service returns array of ApiRow
    if (!res.data.success) {
      console.log(res.data.message);
      return;
    }
    apiRows.value = (res?.data.results ?? []) as ApiRow[];
    lastUpdated.value = new Date().toLocaleString();
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? e?.message ?? "Failed to load results.";
    console.log(e);
  } finally {
    loading.value = false;
  }
}

function formatNumber(n: number) {
  return new Intl.NumberFormat().format(n);
}

onMounted(async () => {
  await loadResults();
});

</script>
