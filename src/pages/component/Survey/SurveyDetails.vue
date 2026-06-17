<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Header -->
    <div class="border-b bg-white">
      <div class="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <div class="flex items-center justify-between gap-3">
          <div>
            <div class="text-xs text-slate-500">Surveys <span class="mx-1">›</span> Details</div>
            <h1 class="mt-1 text-2xl font-bold text-slate-900">Survey Details</h1>
            <p class="mt-1 text-sm text-slate-500">
              Survey ID: <span class="font-semibold">{{ id }}</span>
            </p>
          </div>

          <button
            class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            @click="goBack"
          >
            Back to list
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <!-- Top row -->
        <div class="flex items-center justify-between border-b px-5 py-4">
          <div>
            <div class="text-sm font-semibold text-slate-900">Questions</div>
            <div class="text-xs text-slate-500">Use ▲▼ to change order</div>
          </div>

          <div class="flex items-center gap-2">
            <button
              class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              @click="loadQuestions"
            >
              Reload
            </button>

            <button
              class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              @click="openAddModal"
            >
              <span class="text-lg leading-none">+</span>
              Add Question
            </button>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-hidden">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 text-xs font-semibold text-slate-500">
              <tr>
                <th class="px-5 py-3 w-20">SEQ</th>
                <th class="px-5 py-3">QUESTION ID</th>
                <th class="px-5 py-3">QUESTION</th>
                <th class="px-5 py-3">CONTEXT</th>
                <th class="px-5 py-3">ANSWERS</th>
                <th class="px-5 py-3 text-right">ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(q, idx) in orderedQuestions"
                :key="q.survey_question_id"
                class="border-t bg-white hover:bg-slate-50"
              >
                <!-- Sequence + move buttons -->
                <td class="px-5 py-3">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                      {{ q.survey_seq }}
                    </span>

                    <div class="flex flex-col gap-1">
                      <button
                        class="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                        :disabled="idx === 0 || savingSeq"
                        title="Move up"
                        @click="moveBySeq(q.survey_question_id, -1)"
                      >
                        ▲
                      </button>
                      <button
                        class="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                        :disabled="idx === orderedQuestions.length - 1 || savingSeq"
                        title="Move down"
                        @click="moveBySeq(q.survey_question_id, +1)"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </td>

                <td class="px-5 py-3">
                  <span class="font-semibold text-slate-900">{{ q.survey_question_id }}</span>
                </td>

                <td class="px-5 py-3">
                  <div class="font-semibold text-slate-900">{{ q.survey_question }}</div>
                </td>

                <td class="px-5 py-3">
                  <div class="text-slate-700">{{ q.survey_context || '-' }}</div>
                </td>

                <td class="px-5 py-3">
                  <div class="text-slate-700">{{ q.answers }}</div>
                </td>

                <td class="px-5 py-3">
                  <div class="flex justify-end gap-2">
                    <button
                      class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      @click="openEditModal(q)"
                    >
                      Edit
                    </button>

                    <button
                      v-if="q.answers === 0"
                      class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                      @click="removeQuestion(q.survey_question_id)"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="loading">
                <td colspan="5" class="px-5 py-10 text-center text-sm text-slate-500">
                  Loading questions...
                </td>
              </tr>

              <tr v-else-if="orderedQuestions.length === 0">
                <td colspan="5" class="px-5 py-10 text-center text-sm text-slate-500">
                  No questions yet. Click <span class="font-semibold text-slate-700">Add Question</span>.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between border-t px-5 py-3 text-xs text-slate-500">
          <div>Showing {{ orderedQuestions.length }} question(s)</div>
          <div v-if="savingSeq" class="font-semibold text-slate-600">Saving order…</div>
        </div>
      </div>
    </div>

    <!-- ADD / EDIT MODAL -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-slate-900/40" @click="closeModal"></div>

      <div class="relative w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div class="border-b px-5 py-4">
          <div class="text-sm font-semibold text-slate-900">
            {{ isEditing ? 'Edit Question' : 'Add Question' }}
          </div>
          <div class="mt-0.5 text-xs text-slate-500">
            
          </div>
        </div>

        <div class="px-5 py-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700">Survey Question ID</label>
            <input
              v-model.trim="form.survey_question_id"
              type="text"
              :disabled="isEditing"
              placeholder="e.g., Q001"
              class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
            />
          </div>

          <div>
            <div class="flex justify-between items-center">
              <label class="block text-sm font-medium text-slate-700">Survey Question</label>
              <span :class="['text-[10px]', form.survey_question.length >= 1000 ? 'text-red-600 font-bold' : 'text-slate-400']">
                {{ form.survey_question.length }} / 1,000
              </span>
            </div>
            <textarea
              v-model="form.survey_question"
              rows="1"
              maxlength="1000"
              placeholder="e.g., How satisfied are you with our services?"
              class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <div class="flex justify-between items-center">
              <label class="block text-sm font-medium text-slate-700">Survey Context</label>
              <span :class="['text-[10px]', form.survey_context.length >= 3000 ? 'text-red-600 font-bold' : 'text-slate-400']">
                {{ form.survey_context.length }} / 3,000
              </span>
            </div>
            <textarea
              v-model="form.survey_context"
              rows="3"
              maxlength="3000"
              placeholder="Optional: describe what this question is for..."
              class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700">Sequence</label>
            <input
              v-model.number="form.survey_seq"
              type="number"
              min="1"
              class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <p class="mt-1 text-xs text-slate-500">
              Tip: Usually set to next available sequence.
            </p>
          </div>

          <p v-if="formError" class="text-xs font-semibold text-red-600">
            {{ formError }}
          </p>

          <div class="flex gap-2 pt-1">
            <button
              class="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              :disabled="savingForm"
              @click="saveQuestion"
            >
              {{ isEditing ? 'Save' : 'Add' }}
            </button>

            <button
              class="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              :disabled="savingForm"
              @click="closeModal"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- END MODAL -->
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth';
import { getQuestions,createQuestion,deleteQuestion } from '@/services/survey.services';

// ✅ PROPS
const props = defineProps<{ id: string }>()
const { id } = props

const authStore = useAuthStore();
// ✅ TYPES
type SurveyQuestion = {
  survey_question_id: number
  survey_question: string
  survey_context: string
  survey_seq: number,
  answers?: number,
}

// ✅ ROUTER
const router = useRouter()
function goBack() {
  router.push('/survey-list') // change to '/surveys' if that's your list route
}

// ✅ STATE
const questions = ref<SurveyQuestion[]>([])
const loading = ref(false)

const orderedQuestions = computed(() =>
  [...questions.value].sort((a, b) => a.survey_seq - b.survey_seq)
)

// ✅ MODAL STATE
const showModal = ref(false)
const isEditing = ref(false)
const formError = ref('')
const savingForm = ref(false)

// ✅ SEQUENCE SAVE STATE
const savingSeq = ref(false)

// ✅ FORM
const form = reactive<SurveyQuestion>({
  survey_question_id: 1,
  survey_question: '',
  survey_context: '',
  survey_seq: 1,
  answers: 0,
})

// ======= API PLACEHOLDERS (replace with your real services) =======
// Example:
// import { getSurveyQuestions, createSurveyQuestion, updateSurveyQuestion, deleteSurveyQuestion, bulkUpdateSurveySeq } from '@/api/survey'

async function apiGetQuestions(_surveyId: string): Promise<SurveyQuestion[]> {
  try {
    const response = await getQuestions(_surveyId, authStore.accessToken)

    if (!response.data.success) {
      console.log(response.data.message)
      return []
    }

    // Map backend response → frontend type
    return response.data.questions.map((q: any) => ({
      survey_question_id: q.survey_qid,
      survey_question: q.survey_question,
      survey_context: q.survey_context,
      survey_seq: Number(q.survey_seq),
      answers: Number(q.total_answer),
    }))

  } catch (error) {
    console.log(error)
    return []
  }
}

async function apiCreateQuestion(_surveyId: string, payload: SurveyQuestion): Promise<void> {
  try {
    const res = await createQuestion(_surveyId, {
      survey_id: _surveyId,
      survey_qid: payload.survey_question_id,
      survey_seq: payload.survey_seq,
      survey_question: payload.survey_question,
      survey_context: payload.survey_context
    }, authStore.accessToken);
    
     if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to create question')
    }
  } catch (error) {
    console.log(error)
    throw error // important so caller knows it failed
  }
  console.log('CREATE', _surveyId, payload)
}

async function apiUpdateQuestion(_surveyId: string, payload: SurveyQuestion): Promise<void> {
   try {
    const res = await createQuestion(_surveyId, {
      survey_id: _surveyId,
      survey_qid: payload.survey_question_id,
      survey_seq: payload.survey_seq,
      survey_question: payload.survey_question,
      survey_context: payload.survey_context
    }, authStore.accessToken);
    
     if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to create question')
    }
  } catch (error) {
    console.log(error)
    throw error // important so caller knows it failed
  }
  console.log('UPDATE', _surveyId, payload)
}

async function apiDeleteQuestion(_surveyId: string, questionId: number): Promise<void> {
  try {
    const res = await deleteQuestion(_surveyId, questionId, authStore.accessToken)

    // if your backend returns { success: boolean, message?: string }
    if (res?.data && res.data.success === false) {
      throw new Error(res.data.message || 'Failed to delete question')
    }

  } catch (error) {
    console.log(error)
    throw error // ✅ important so caller knows delete failed
  }
}

async function apiBulkUpdateSeq(_surveyId: string, items: Array<{ survey_question_id: number; survey_seq: number }>): Promise<void> {
  // TODO: replace with your API
  console.log('BULK SEQ UPDATE', _surveyId, items)
}
// ================================================================

// ✅ LOAD
async function loadQuestions() {
  loading.value = true
  try {
    const data = await apiGetQuestions(id)
    questions.value = data
  } catch (e) {
    console.log(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadQuestions()
})

// ✅ Helpers
function nextSeq() {
  const maxSeq = questions.value.reduce((m, q) => Math.max(m, q.survey_seq ?? 0), 0)
  return maxSeq + 1
}

// ✅ MODAL OPENERS
function openAddModal() {
  isEditing.value = false
  formError.value = ''
  form.survey_question_id = nextSeq()
  form.survey_question = ''
  form.survey_context = ''
  form.survey_seq = nextSeq()
  showModal.value = true
}

function openEditModal(q: SurveyQuestion) {
  isEditing.value = true
  formError.value = ''
  form.survey_question_id = q.survey_question_id
  form.survey_question = q.survey_question
  form.survey_context = q.survey_context
  form.survey_seq = q.survey_seq
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

// ✅ SAVE (ADD/EDIT)
async function saveQuestion() {
  formError.value = ''

  if (form.survey_question_id === 0) {
    formError.value = 'Survey Question ID is required.'
    return
  }
  if (!form.survey_question.trim()) {
    formError.value = 'Survey Question is required.'
    return
  }
  if (!Number.isFinite(form.survey_seq) || form.survey_seq < 1) {
    formError.value = 'Sequence (survey_seq) must be 1 or higher.'
    return
  }

  savingForm.value = true
  try {
    const payload: SurveyQuestion = {
      survey_question_id: form.survey_question_id,
      survey_question: form.survey_question.trim(),
      survey_context: form.survey_context.trim(),
      survey_seq: Number(form.survey_seq),
    }

    if (isEditing.value) {
      // update locally
      const idx = questions.value.findIndex(q => q.survey_question_id === payload.survey_question_id)
      if (idx !== -1) questions.value[idx] = payload

      await apiUpdateQuestion(id, payload)
    } else {
      // prevent duplicate ID
      const exists = questions.value.some(q => q.survey_question_id === payload.survey_question_id)
      if (exists) {
        formError.value = 'This Question ID already exists.'
        return
      }

      questions.value.push(payload)
      await apiCreateQuestion(id, payload)
    }

    closeModal()
  } catch (e) {
    console.log(e)
    formError.value = 'Failed to save question.'
  } finally {
    savingForm.value = false
  }
}

// ✅ DELETE
async function removeQuestion(questionId: number) {
  // optimistic
  const proceed = window.confirm("This Question has no votes. Are you sure you want to delete it?");
  const prev = [...questions.value]
  
  if (!proceed) return;

  try {
    await apiDeleteQuestion(id, questionId)
    questions.value = questions.value.filter(q => q.survey_question_id !== questionId)
  } catch (e) {
    console.log(e)
    questions.value = prev
    alert('Failed to delete question.')
  }
}

// ✅ MOVE BY SEQ (swap adjacent survey_seq)
async function moveBySeq(questionId: number, direction: -1 | 1) {
  const list = orderedQuestions.value
  const idx = list.findIndex(q => q.survey_question_id === questionId)
  if (idx === -1) return

  const swapIdx = idx + direction
  if (swapIdx < 0 || swapIdx >= list.length) return

  const a = list[idx]
  const b = list[swapIdx]

  // ✅ Guard for TS (and safety)
  if (!a || !b) return

  // swap sequences locally
  const tmp = a.survey_seq
  a.survey_seq = b.survey_seq
  b.survey_seq = tmp

  // persist both
  savingSeq.value = true
  try {
    await apiBulkUpdateSeq(id, [
      { survey_question_id: a.survey_question_id, survey_seq: a.survey_seq },
      { survey_question_id: b.survey_question_id, survey_seq: b.survey_seq },
    ])
  } catch (e) {
    console.log(e)

    // revert on failure
    const tmp2 = a.survey_seq
    a.survey_seq = b.survey_seq
    b.survey_seq = tmp2

    alert('Failed to update order.')
  } finally {
    savingSeq.value = false
  }
}
</script>