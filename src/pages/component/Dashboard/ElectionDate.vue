<script setup lang="ts">
import { computed, reactive, watch, ref} from "vue";
import { useElectionStore } from "@/stores/election";
import { useAuthStore } from "@/stores/auth";
import { updateElectionSetting } from "@/services/election.sevice";

const authStore = useAuthStore();
const electionStore = useElectionStore();

const isSaving = ref(false);
const showSuccess = ref(false);
const showError = ref(false);
const message = ref('');

type ElectionForm = {
  year: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  isActive: boolean;
};

// ✅ Declare form FIRST
const form = reactive<ElectionForm>({
  year: new Date().getFullYear().toString(),
  startDate: "2024-11-20",
  startTime: "08:00",
  endDate: "2024-11-22",
  endTime: "17:00",
  isActive: true,
});

// ✅ helper (keeps your code clean)
function splitDateTime(value: string) {
  const d = new Date(value);
  return {
    date: d.toISOString().slice(0, 10),
    time: d.toTimeString().slice(0, 5),
  };
}

// ✅ Use ONLY watch (covers initial load + updates)
watch(
  () => [electionStore.from, electionStore.to, electionStore.year, electionStore.start],
  () => {
    if (electionStore.from) {
      const { date, time } = splitDateTime(electionStore.from);
      form.startDate = date;
      form.startTime = time;
    }

    if (electionStore.to) {
      const { date, time } = splitDateTime(electionStore.to);
      form.endDate = date;
      form.endTime = time;
    }

    form.year = electionStore.year?.toString() || new Date().getFullYear().toString();
    form.isActive = !!electionStore.start;
  },
  { immediate: true }
);

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 6 }, (_, i) => (currentYear - 2 + i).toString());

const statusText = computed(() => (form.isActive ? "ACTIVE" : "INACTIVE"));

async function saveSetting() {
  try {

    isSaving.value = true;
    showSuccess.value = false;
    showError.value = false;

    const payload = {
      year: Number(form.year),
      from: `${form.startDate}T${form.startTime}`,
      to: `${form.endDate}T${form.endTime}`,
      start: !!form.isActive,
    };

    const response = await updateElectionSetting(payload, authStore.accessToken);

    if (!response.data.success) {
      showError.value = true;
      message.value = response.data.message || "Something went wrong.";
      return;
    }

    // ✅ Call actions
    electionStore.setYear(payload.year);
    electionStore.setDateFrom(payload.from);
    electionStore.setDateTo(payload.to);
    electionStore.setStartElection(payload.start);

    showSuccess.value = true;
    message.value = "Setting successfully saved.";
    
    setTimeout(() => {
      showSuccess.value = false;
    }, 3000);

  } catch (error) {
    showError.value = true;
    message.value = "Failed to save settings.";
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <!-- Make page fill available area and scroll inside -->
  <div class="h-[calc(100dvh-0px)] min-h-0 bg-slate-50/60">
    <!-- Scroll container -->
    <div class="h-full overflow-y-auto">
      <div class="mx-auto max-w-6xl px-3 py-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-6">
          <h1 class="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Election Date &amp; Time Configuration
          </h1>
          <p class="mt-1 text-sm text-slate-500">
            Set the exact window for the upcoming cooperative election voting process.
          </p>
        </div>

        <!-- Card -->
        <section class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <!-- Card Header -->
          <div class="flex items-center gap-3 border-b border-slate-200 px-4 py-4 sm:px-6">
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
              <svg class="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path
                  d="M12 6v6l4 2"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            <h2 class="text-base font-semibold text-slate-900">Scheduling Window</h2>
          </div>
          <!-- Success Toast -->
          <div
            v-if="showSuccess"
            class="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            ✅ {{ message }}
          </div>

          <!-- Error Toast -->
          <div
            v-if="showError"
            class="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            ❌ {{ message }}
          </div>
          <!-- Card Body -->
          <div class="px-4 py-5 sm:px-6">
            <!-- Year Selection -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-slate-700">Election Year</label>

              <!-- Full width on mobile, fixed on desktop -->
              <div class="relative mt-2 w-full sm:max-w-xs">
                <select
                  v-model="form.year"
                  class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option v-for="year in yearOptions" :key="year" :value="year">
                    {{ year }}
                  </option>
                </select>

                <svg
                  class="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>

            <!-- Start / End Grid (stacks on mobile) -->
            <div class="grid gap-4 md:gap-6 lg:grid-cols-2">
              <!-- Start -->
              <div class="rounded-xl border border-slate-200 p-4 sm:p-5">
                <div class="mb-4 flex items-center gap-2">
                  <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <p class="text-sm font-semibold tracking-wide text-slate-700">
                    ELECTION START
                  </p>
                </div>

                <div class="space-y-4">
                  <div>
                    <label class="text-sm font-medium text-slate-700">Start Date</label>
                    <input
                      v-model="form.startDate"
                      type="date"
                      class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label class="text-sm font-medium text-slate-700">Start Time</label>
                    <input
                      v-model="form.startTime"
                      type="time"
                      class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                    <p class="mt-1 text-xs text-slate-500">Uses 24-hour format.</p>
                  </div>
                </div>
              </div>

              <!-- End -->
              <div class="rounded-xl border border-slate-200 p-4 sm:p-5">
                <div class="mb-4 flex items-center gap-2">
                  <span class="h-2 w-2 rounded-full bg-rose-500"></span>
                  <p class="text-sm font-semibold tracking-wide text-slate-700">
                    ELECTION END
                  </p>
                </div>

                <div class="space-y-4">
                  <div>
                    <label class="text-sm font-medium text-slate-700">End Date</label>
                    <input
                      v-model="form.endDate"
                      type="date"
                      class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label class="text-sm font-medium text-slate-700">End Time</label>
                    <input
                      v-model="form.endTime"
                      type="time"
                      class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                    <p class="mt-1 text-xs text-slate-500">Uses 24-hour format.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Divider -->
            <div class="my-6 border-t border-slate-200"></div>

            <!-- Status -->
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex items-center gap-3">
                <span class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  🔄
                </span>

                <div>
                  <p class="text-sm font-semibold text-slate-900">Election Status</p>
                  <p class="text-xs text-slate-500">(The system will auto-open voting on start date)</p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <button
                  type="button"
                  @click="form.isActive = !form.isActive"
                  :class="[
                    'relative inline-flex h-8 w-14 items-center rounded-full transition',
                    form.isActive ? 'bg-blue-600' : 'bg-slate-300'
                  ]"
                >
                  <span
                    :class="[
                      'inline-block h-6 w-6 transform rounded-full bg-white shadow transition',
                      form.isActive ? 'translate-x-7' : 'translate-x-1'
                    ]"
                  />
                </button>

                <span
                  :class="[
                    'text-sm font-bold',
                    form.isActive ? 'text-blue-600' : 'text-slate-600'
                  ]"
                >
                  {{ statusText }}
                </span>
              </div>
            </div>
          </div>

          <!-- Sticky footer actions (always visible) -->
          <div class="sticky bottom-0 border-t border-slate-200 bg-white/90 backdrop-blur px-4 py-4 sm:px-6">
            <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                class="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                @click="saveSetting()"
                :disabled="isSaving"
                type="button"
                class="w-full sm:w-auto rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white
                hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
              >
                <!-- Spinner -->
                <svg
                  v-if="isSaving"
                  class="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>

                <span>
                  {{ isSaving ? "Saving..." : "Save Configuration" }}
                </span>
              </button>
            </div>
          </div>
        </section>
        
        <!-- extra bottom spacing so last content isn't hidden behind sticky footer -->
        <div class="h-6"></div>
      </div>
    </div>
  </div>
</template>


