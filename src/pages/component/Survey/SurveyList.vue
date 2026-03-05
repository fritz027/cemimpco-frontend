<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Header -->
    <div class="border-b bg-white">
      <div class="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-xs text-slate-500">Dashboard <span class="mx-1">›</span> Survey Management</div>
            <h1 class="mt-1 text-2xl font-bold text-slate-900">Surveys</h1>
            <p class="mt-1 text-sm text-slate-500">Manage your surveys. Click Actions to view details and questions.</p>
          </div>

          <button
            class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            @click="openCreateModal"
          >
            <span class="text-lg leading-none">+</span>
            New Survey
          </button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="border-b px-4 py-3">
          <div class="text-sm font-semibold text-slate-900">Survey List</div>
          <div class="text-xs text-slate-500">Titles only</div>
        </div>

        <div class="overflow-hidden">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 text-xs font-semibold text-slate-500">
              <tr>
                <th class="px-4 py-3">TITLE</th>
                <th class="px-4 py-3">QUESTIONS</th>
                <th class="px-4 py-3">STATUS</th>
                <th class="px-4 py-3">SCHEDULE</th>
                <th class="px-4 py-3 text-right">ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="s in surveys"
                :key="s.id"
                class="border-t bg-white hover:bg-slate-50"
              >
                <td class="px-4 py-3">
                  <div class="font-semibold text-slate-900">{{ s.title }}</div>
                  <div class="text-xs text-slate-500">ID: {{ s.id }}</div>
                </td>

                <td class="px-4 py-3">
                  <span class="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                    {{ s.questionCount }}
                  </span>
                </td>

                <td class="px-4 py-3">
                  <!-- If stopped -->
                  <span
                    v-if="s.status === '0'"
                    class="inline-flex items-center rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700"
                  >
                    Stopped
                  </span>

                  <!-- If active -->
                  <span
                    v-else
                    class="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold"
                    :class="statusClass(s.survey_status)"
                  >
                    {{ s.survey_status }}
                  </span>
                </td>

                <td class="px-4 py-3">
                  <span
                    class="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold"
                  >
                    {{  formatDateRange(s.dateFrom, s.dateTo) }}
                  </span>
                </td>

                <td class="px-4 py-3">
                  <div class="flex justify-end gap-2">
                    <button
                      class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      @click="openEditModal(s.id)"
                    >
                      Edit
                    </button>

                    <button
                      class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      @click="goToDetails(s.id)"
                    >
                      Questions
                    </button>

                    <button
                      v-if="s.questionCount <= 0"
                      class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                      @click="removeSurvey(s.id)"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="surveys.length === 0">
                <td colspan="4" class="px-4 py-10 text-center text-sm text-slate-500">
                  No surveys yet. Click <span class="font-semibold">New Survey</span>.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between border-t px-4 py-3 text-xs text-slate-500">
          <div>Showing {{ surveys.length }} survey(s)</div>
        </div>
      </div>
    </div>
  </div>
  <EditSurveyModal
    v-model="showEdit"
    :survey-id="editingSurvey?.id ?? ''"
    :initial-title="editingSurvey?.title"
    :initial-from="editingSurvey?.from"
    :initial-to="editingSurvey?.to"
    :initial-status="editingSurvey?.status"
    :mode="isCreateMode ? 'create' : 'edit'"
    @save="handleSaveConfig"
  />
</template>

<script setup lang="ts">
import EditSurveyModal from "@/pages/component/Survey/SurveyModal.vue";
import { nextTick, ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { createSurvey, allSurvey, updateSurvey, deleteSurvey } from '@/services/survey.services'

type SurveyRow = {
  id: string
  title: string
  questionCount: number
  status: "1" | "0"
  survey_status: 'Active' | 'Upcoming' | 'Closed'
  dateFrom: string;
  dateTo: string;
}


const route = useRoute();
const showEdit = ref(false);
const editingSurvey = ref<{ id: string; title: string, from: string; to: string; status: "0" | "1" } | null>(null);
const isCreateMode = ref(false);

const editId = computed(() => {
  const q = route.query.id
  return Array.isArray(q) ? q[0] : q // string | undefined
})
const isEdit = computed(() => route.query.edit === 'true');

const router = useRouter()
const authStore = useAuthStore();
const uid = () => Math.random().toString(36).slice(2, 10)

const surveys = ref<SurveyRow[]>([])


watch(
  () => [editId.value, isEdit.value, surveys.value?.length],
  () => {
    if (isEdit.value && editId.value) {
      openEditModal(editId.value)
    }
  },
  { immediate: true }
)



function openEditModal(id: string) {
  const s = surveys.value.find(x => x.id === id);
  if (!s) return;

  

  // you currently store dateFrom/dateTo as the raw strings from API
  editingSurvey.value = {
    id: s.id,
    title: s.title,
    from: s.dateFrom,
    to: s.dateTo,
    status: s.status, // <-- if you have the "status" field in your list, use it here
  };

  showEdit.value = true;
}

function goToDetails(id: string) {
  router.push({ name: 'SurveyDetails', params: { id } })
}

async function removeSurvey(id: string) {
  try {
    const proceed = window.confirm("This Survey has no questions. Are you sure you want to delete it?");
    if (!proceed) return;

    const res = await deleteSurvey(id, authStore.accessToken);
    if (!res.data.success) {
      console.log(res.data.message);
      return;
    }
    surveys.value = surveys.value.filter(s => s.id !== id)
  } catch (error) {
    console.log(error);
  }
  
}

/** Modal state */
const showCreate = ref(false)
const newTitle = ref('')
const titleError = ref('')
const titleInput = ref<HTMLInputElement | null>(null)
const dateFrom = ref('');
const dateTo = ref('');
const formError = ref('');

onMounted( async() => {
  await loadSurveys();
});

function openCreateModal() {
  isCreateMode.value = true;

  editingSurvey.value = {
    id: `svy_${uid()}`,   // generate temporary ID
    title: '',
    from: '',
    to: '',
    status: "1",          // default active
  };

  showEdit.value = true;
}


async function loadSurveys() {
  try {
    const response = await allSurvey(authStore.accessToken);
    if (!response.data.success) {
      console.log(response.data.message);
      return ;
    }

     surveys.value = response.data.surveys.map((s: any) => ({
      id: s.survey_id,
      title: s.survey_name,
      questionCount: s.total_question ?? 0,
      status: s.status ?? '0',
      survey_status: s.survey_status ?? 'Draft',
      dateFrom: s.survey_from,
      dateTo: s.survey_to,
    }))

  } catch (error) {
    console.log(error);
  }
}

function closeCreateModal() {
  showCreate.value = false
}

function statusClass(status: string) {
  switch (status) {
    case 'Active':
      return 'bg-emerald-50 text-emerald-700'
    case 'Upcoming':
      return 'bg-blue-50 text-blue-700'
    case 'Closed':
      return 'bg-rose-50 text-rose-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

async function confirmCreate() {
  formError.value = ''

  if (!newTitle.value.trim()) {
    formError.value = 'Survey title is required.'
    return
  }

  if (!dateFrom.value) {
    formError.value = 'Please select Date From.'
    return
  }

  if (!dateTo.value) {
    formError.value = 'Please select Date To.'
    return
  }

  if (dateTo.value < dateFrom.value) {
    formError.value = 'Date To cannot be earlier than Date From.'
    return
  }

  try {
    const id = `svy_${uid()}`

  surveys.value.unshift({
    id,
    title: newTitle.value.trim(),
    questionCount: 0,
    status: 'Draft',
    dateFrom: dateFrom.value,
    dateTo: dateTo.value,
  } as any)

  const response = await createSurvey({
    survey_id: id,
    survey_name: newTitle.value.trim(),
    survey_from: dateFrom.value,
    survey_to: dateTo.value,
    survey_status: "1"
    
  },
  authStore.accessToken);

  if (response.data.success) {
    closeCreateModal()

    router.push({ name: 'SurveyDetails', params: { id } })
  }

  } catch (error) {
    console.log(error)
  }
  
}

function formatDateRange(from: string, to: string) {
  if (!from || !to) return ''

  const start = new Date(from)
  const end = new Date(to)

  const sameYear = start.getFullYear() === end.getFullYear()
  const sameMonth = start.getMonth() === end.getMonth()

  const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short' })

  const startMonth = monthFormatter.format(start)
  const endMonth = monthFormatter.format(end)

  const startDay = start.getDate()
  const endDay = end.getDate()
  const year = end.getFullYear()

  if (sameYear && sameMonth) {
    // Feb 1 to 3 2026
    return `${startMonth} ${startDay} to ${endDay} ${year}`
  }

  if (sameYear) {
    // Feb 28 to Mar 3 2026
    return `${startMonth} ${startDay} to ${endMonth} ${endDay} ${year}`
  }

  // Different years
  return `${startMonth} ${startDay} ${start.getFullYear()} to ${endMonth} ${endDay} ${end.getFullYear()}`
}


async function handleSaveConfig(payload: {
  survey_id: string;
  survey_name: string;
  survey_from: string;
  survey_to: string;
  status: "0" | "1";
}) {
  try {
    let res;

    if (isCreateMode.value) {
      // CREATE
      res = await createSurvey({
        survey_id: payload.survey_id,
        survey_name: payload.survey_name,
        survey_from: payload.survey_from,
        survey_to: payload.survey_to,
        survey_status: payload.status
      }, authStore.accessToken);
    } else {
      // UPDATE
      res = await updateSurvey({
        survey_id: payload.survey_id,
        survey_name: payload.survey_name,
        survey_from: payload.survey_from,
        survey_to: payload.survey_to,
        survey_status: payload.status
      }, authStore.accessToken);
    }

    if (!res.data.success) {
      console.log(res.data.message);
      return;
    }

    showEdit.value = false;
    isCreateMode.value = false;
    if (isEdit && editId) {
      router.push({ name: "SurveyList" });
    }
    await loadSurveys();

  } catch (e) {
    console.log(e);
  }
}
</script>