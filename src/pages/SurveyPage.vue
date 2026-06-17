<template>
  <div class="min-h-screen bg-slate-50 pb-12"> <div class="mx-auto max-w-2xl px-4 py-6 sm:py-10"> <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-slate-500">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-4"></div>
        Loading survey questions...
      </div>

      <div v-else-if="current" class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">

        <div class="px-6 py-4 bg-white border-b sticky top-0 z-10">
          <div class="flex items-center justify-between">
            <div class="flex-1 pr-4">
              <p class="text-[10px] font-extrabold tracking-widest text-blue-600 uppercase">
                {{ surveyTitle }}
              </p>
              <p class="mt-0.5 text-xs text-slate-500 font-medium">
                Question {{ currentIndex + 1 }} of {{ questions.length }}
              </p>
            </div>
            <div class="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
              {{ progressPct }}%
            </div>
          </div>
          <div class="mt-3 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div class="h-full bg-blue-600 transition-all duration-500"
                 :style="{ width: progressPct + '%' }"></div>
          </div>
        </div>

        <div class="px-6 py-8">
          <h2 
            class="text-left text-slate-900 leading-relaxed break-words transition-all duration-300"
            :class="[
              current.question.length > 500 ? 'text-base font-medium' : 
              current.question.length > 200 ? 'text-lg font-semibold' : 
              'text-xl font-extrabold'
            ]"
          >
            {{ current.question }}
          </h2>

          <div v-if="current.context" class="mt-6 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
            <div class="px-4 py-2 border-b border-slate-200 bg-slate-100/50 text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">
              Reference Context
            </div>
            <div 
              class="max-h-60 overflow-y-auto p-4 text-sm leading-relaxed text-slate-600 scrollbar-thin"
              v-html="current.context"
            >
              </div>
          </div>

          <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              @click="answer = 'yes'"
              class="group relative flex items-center gap-4 rounded-xl border-2 p-4 transition-all duration-200"
              :class="answer === 'yes'
                ? 'border-blue-600 bg-blue-50 ring-4 ring-blue-50'
                : 'border-slate-100 bg-white hover:border-slate-200'"
            >
              <div class="h-10 w-10 flex shrink-0 items-center justify-center rounded-full transition-colors"
                   :class="answer === 'yes' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'">
                ✓
              </div>
              <div class="text-base font-bold text-slate-800">Yes, I agree</div>
            </button>

            <button
              @click="answer = 'no'"
              class="group relative flex items-center gap-4 rounded-xl border-2 p-4 transition-all duration-200"
              :class="answer === 'no'
                ? 'border-blue-600 bg-blue-50 ring-4 ring-blue-50'
                : 'border-slate-100 bg-white hover:border-slate-200'"
            >
              <div class="h-10 w-10 flex shrink-0 items-center justify-center rounded-full transition-colors"
                   :class="answer === 'no' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'">
                ✕
              </div>
              <div class="text-base font-bold text-slate-800">No, I disagree</div>
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between border-t bg-slate-50/50 px-6 py-4">
          <button
            @click="prev"
            :disabled="currentIndex === 0"
            class="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 disabled:opacity-30 transition-colors"
          >
            ← Previous
          </button>

          <button
            @click="next"
            :disabled="!answer"
            class="rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 
                   hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
          >
            {{ currentIndex === questions.length - 1 ? "Complete Survey" : "Next Question →" }}
          </button>
        </div>
      </div>

      <div v-else class="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center text-slate-500">
        <p class="font-bold text-slate-400">No questions available for this survey.</p>
      </div>

      <p class="mt-6 text-center text-[10px] text-slate-400 font-medium">
        🔒 Responses are secure and anonymous
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

const isPreview = computed(() => route.name === 'SurveyPagePreview' || !route.params.memberNo);

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
    if (isPreview.value){
      alert("This is a preview. No data will be submitted.");
      router.push({ name: "SurveyList" }); // Or back to list
      return;
    }
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