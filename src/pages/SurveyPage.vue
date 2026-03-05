<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto max-w-lg px-4 py-10">

      <!-- Loading -->
      <div v-if="loading" class="text-center text-slate-500">
        Loading survey...
      </div>

      <!-- Survey Card -->
      <div v-else-if="current" class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

        <!-- Header -->
        <div class="px-6 pt-6 pb-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-[11px] font-extrabold tracking-wide text-blue-600">
                {{ surveyTitle.toUpperCase() }}
              </p>
              <p class="mt-1 text-xs text-slate-500">
                Question {{ currentIndex + 1 }} of {{ questions.length }}
              </p>
            </div>

            <div class="text-xs font-bold text-slate-600">
              {{ progressPct }}%
            </div>
          </div>

          <div class="mt-3 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div class="h-full bg-blue-600 transition-all"
                 :style="{ width: progressPct + '%' }"></div>
          </div>
        </div>

        <div class="border-t"></div>

        <!-- Question -->
        <div class="px-6 py-6">
          <h2 class="text-center text-lg font-extrabold text-slate-900 leading-snug">
            {{ current.question }}
          </h2>

          <!-- Context -->
          <div class="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div class="text-[11px] font-extrabold tracking-wide text-blue-600">
              QUESTION CONTEXT
            </div>
            <p class="mt-2 text-xs leading-relaxed text-slate-600">
              {{ current.context }}
            </p>
          </div>

          <!-- Yes / No -->
          <div class="mt-6 grid grid-cols-2 gap-4">
            <button
              @click="answer = 'yes'"
              class="rounded-xl border p-5 text-center transition"
              :class="answer === 'yes'
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                : 'border-slate-200 bg-white'"
            >
              <div class="mx-auto h-10 w-10 flex items-center justify-center rounded-full"
                   :class="answer === 'yes'
                     ? 'bg-blue-600 text-white'
                     : 'bg-slate-200 text-slate-600'">
                ✓
              </div>
              <div class="mt-3 text-sm font-bold">Yes</div>
            </button>

            <button
              @click="answer = 'no'"
              class="rounded-xl border p-5 text-center transition"
              :class="answer === 'no'
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                : 'border-slate-200 bg-white'"
            >
              <div class="mx-auto h-10 w-10 flex items-center justify-center rounded-full"
                   :class="answer === 'no'
                     ? 'bg-blue-600 text-white'
                     : 'bg-slate-200 text-slate-600'">
                ✕
              </div>
              <div class="mt-3 text-sm font-bold">No</div>
            </button>
          </div>
        </div>

        <div class="border-t"></div>

        <!-- Footer -->
        <div class="flex items-center justify-between px-6 py-4">
          <button
            @click="prev"
            :disabled="currentIndex === 0"
            class="text-sm font-semibold text-slate-500 disabled:opacity-40"
          >
            ← Previous
          </button>

          <button
            @click="next"
            :disabled="!answer"
            class="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white
                   disabled:opacity-50"
          >
            {{ currentIndex === questions.length - 1 ? "Submit" : "Next →" }}
          </button>
        </div>
      </div>

      <!-- No Questions -->
      <div v-else class="text-center text-slate-500">
        No questions available.
      </div>

      <p class="mt-4 text-center text-xs text-slate-400">
        🔒 Your responses are encrypted and anonymous
      </p>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute,useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { getQuestions, submitSurvey } from "@/services/survey.services";


type Answer = "yes" | "no" | null;

type ApiQuestion = {
  survey_id: string;
  survey_qid: number;
  survey_question: string;
  survey_context: string;
  survey_seq: number;
};

type UiQuestion = {
  id: string;
  question: string;
  context: string;
  seq: number;
};

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const surveyId = computed(() => {
  const raw = route.params.id;
  return Array.isArray(raw) ? raw[0] : (raw ?? "");
});


type AnswerValue = string | number | string[] | null;



const surveyTitle = ref("");
const loading = ref(true);

const questions = ref<UiQuestion[]>([]);
const currentIndex = ref(0);
const answer = ref<AnswerValue>(null);
const answers = ref<Record<string, AnswerValue>>({}); // key: survey_qid

const current = computed(() => questions.value[currentIndex.value] ?? null);

const progressPct = computed(() => {
  if (!questions.value.length) return 0;
  return Math.round(((currentIndex.value + 1) / questions.value.length) * 100);
});

onMounted(async () => {
  surveyTitle.value = authStore.getSurvey?.survey_name ?? "";
  await loadQuestions();
});

async function loadQuestions() {
  try {
    if (!surveyId.value) return;
    const res = await getQuestions(surveyId.value, authStore.accessToken);

    const rows: ApiQuestion[] = res.data.questions ?? [];

    questions.value = rows
      .map(q => ({
        id: String(q.survey_qid),
        question: q.survey_question ?? "",
        context: q.survey_context ?? "",
        seq: q.survey_seq ?? 0
      }))
      .sort((a, b) => a.seq - b.seq);

  } catch (err) {
    console.log(err);
  } finally {
    loading.value = false;
  }
}

function prev() {
  const q = current.value;
  if (!q) return;

  answers.value[q.id] = answer.value;

  if (currentIndex.value > 0) {
    currentIndex.value--;
    const prevQ = questions.value[currentIndex.value];
    answer.value = prevQ ? answers.value[prevQ.id] ?? null : null;
  }
}

async function next() {
  const q = current.value;
  if (!q) return;

  // If you require an answer for every question:
  if (answer.value === null || answer.value === "" || (Array.isArray(answer.value) && answer.value.length === 0)) {
    return;
  }

  // store current answer
  answers.value[q.id] = answer.value;

  const isLast = currentIndex.value === questions.value.length - 1;

  if (isLast) { 
    // build submit payload
    const payload = {
      answers: Object.entries(answers.value).map(([survey_qid, ans]) => ({
        survey_qid,
        answer: ans, // send as-is, or String(ans) if your API wants string
      })),
    };

    try {
      if (!surveyId.value) return;
      const res = await submitSurvey(payload,surveyId.value,authStore.accessToken);
      alert("Survey submitted!");
      if (!res.data.success) {
        alert("Failed to submit survey. Please try again later");
        setTimeout( async () => {
          await router.push({ name: "Profile" })
        }, 3000);
        return;
      }
      router.push({ name: "Profile" })
    } catch (error) {
      console.log("SUBMIT ERROR:", error);
      alert("Failed to submit survey. Check console.");
    }
    return;
  }

  // go next
  currentIndex.value++;
  const nextQ = questions.value[currentIndex.value];
  answer.value = nextQ ? (answers.value[nextQ.id] ?? null) : null;
}
</script>