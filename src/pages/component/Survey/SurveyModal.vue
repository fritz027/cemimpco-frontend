<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-slate-900/40" @click="onCancel"></div>

    <!-- Modal -->
    <div class="relative w-full max-w-5xl rounded-3xl bg-white shadow-2xl overflow-hidden">
      <!-- Header -->
      <div class="border-b px-8 py-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="text-lg font-bold text-slate-900">
              {{ props.mode === 'create' ? 'Create Survey' : 'Edit Survey Configuration' }}
            </h3>
            <p class="text-sm text-slate-500">
              Survey ID: <span class="font-mono text-slate-700">{{ surveyId }}</span>
            </p>
          </div>

          <button
            class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            @click="onCancel"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="px-8 py-6 space-y-6">
        <!-- TITLE (FULL WIDTH ABOVE BOTH CARDS) -->
        <div>
          <label class="block text-sm font-semibold text-slate-700">
            Survey Title
          </label>

          <input
            v-model.trim="title"
            type="text"
            placeholder="Enter survey title"
            class="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <!-- START CARD -->
          <div class="rounded-2xl border border-slate-200 p-6">
            <div class="flex items-center gap-3">
              <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              <span class="text-sm font-extrabold tracking-wider text-slate-700 bg-slate-200/70 px-3 py-1 rounded">
                SURVEY START
              </span>
            </div>

            <div class="mt-6 space-y-5">
              <div>
                <label class="block text-sm font-semibold text-slate-700 bg-slate-200/70 w-fit px-2 py-0.5 rounded">
                  Start Date
                </label>

                <div class="mt-2 relative">
                  <input
                    v-model="startDate"
                    type="date"
                    class="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <!-- icon -->
                  <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    📅
                  </span>
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 bg-slate-200/70 w-fit px-2 py-0.5 rounded">
                  Start Time
                </label>

                <div class="mt-2 relative">
                  <input
                    v-model="startTime"
                    type="time"
                    class="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    🕒
                  </span>
                </div>

                <p class="mt-2 text-xs text-slate-500 bg-slate-200/70 w-fit px-2 py-0.5 rounded">
                  Uses 24-hour format.
                </p>
              </div>
            </div>
          </div>

          <!-- END CARD -->
          <div class="rounded-2xl border border-slate-200 p-6">
            <div class="flex items-center gap-3">
              <span class="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
              <span class="text-sm font-extrabold tracking-wider text-slate-700 bg-slate-200/70 px-3 py-1 rounded">
                SURVEY END
              </span>
            </div>

            <div class="mt-6 space-y-5">
              <div>
                <label class="block text-sm font-semibold text-slate-700 bg-slate-200/70 w-fit px-2 py-0.5 rounded">
                  End Date
                </label>

                <div class="mt-2 relative">
                  <input
                    v-model="endDate"
                    type="date"
                    :min="startDate || undefined"
                    class="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    📅
                  </span>
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 bg-slate-200/70 w-fit px-2 py-0.5 rounded">
                  End Time
                </label>

                <div class="mt-2 relative">
                  <input
                    v-model="endTime"
                    type="time"
                    class="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    🕒
                  </span>
                </div>

                <p class="mt-2 text-xs text-slate-500 bg-slate-200/70 w-fit px-2 py-0.5 rounded">
                  Uses 24-hour format.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="my-6 border-t"></div>

        <!-- Status row -->
        <div class="flex items-center justify-between">
          <div class="flex items-start gap-3">
            <div class="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">🔁</div>
            <div>
              <div class="font-bold text-slate-900">Survey Status</div>
              <div class="text-sm text-slate-500">(The system will auto-open survey on start date)</div>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <!-- Toggle -->
            <button
              type="button"
              @click="enabled = !enabled"
              class="relative h-9 w-16 rounded-full transition"
              :class="enabled ? 'bg-blue-600' : 'bg-slate-300'"
            >
              <span
                class="absolute top-1 left-1 h-7 w-7 rounded-full bg-white shadow transition"
                :class="enabled ? 'translate-x-7' : 'translate-x-0'"
              />
            </button>

            <span class="text-sm font-extrabold tracking-wider" :class="enabled ? 'text-blue-600' : 'text-slate-500'">
              {{ enabled ? "ACTIVE" : "INACTIVE" }}
            </span>
          </div>
        </div>

        <!-- Error -->
        <p v-if="formError" class="mt-4 text-sm font-semibold text-rose-600">
          {{ formError }}
        </p>
      </div>

      <!-- Footer -->
      <div class="border-t px-8 py-6 flex items-center justify-end gap-3">
        <button
          class="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          @click="onCancel"
        >
          Cancel
        </button>

        <button
          class="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          :disabled="saving"
          @click="onSave"
        >
          {{ saving ? "Saving..." : "Save Configuration" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

type Payload = {
  survey_id: string;
  survey_name: string;
  survey_from: string; // "YYYY-MM-DD HH:mm:ss.0000" (or "YYYY-MM-DD")
  survey_to: string;
  status: "0" | "1";   // 0 stopped, 1 active
};

const props = defineProps<{
  modelValue: boolean;
  surveyId: string;
  initialTitle?: string;
  initialFrom?: string; // e.g. "2026-02-01 00:00:00.0000"
  initialTo?: string;   // e.g. "2026-02-28 00:00:00.0000"
  initialStatus?: "0" | "1";
  mode?: 'create' | 'edit'
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "save", payload: Payload): void;
}>();

const title = ref("");
const startDate = ref("");
const startTime = ref("00:00");
const endDate = ref("");
const endTime = ref("00:00");
const enabled = ref(true);

const saving = ref(false);
const formError = ref("");

function splitDateTime(input?: string) {
  if (!input) return { d: "", t: "00:00" };

  // handles "YYYY-MM-DD HH:mm:ss.0000" or "YYYY-MM-DD"
  const noFrac = input.includes(".") ? input.substring(0, input.indexOf(".")) : input;
  const [datePart, timePart] = noFrac.split(" ");
  const time = timePart ? timePart.slice(0, 5) : "00:00";
  return { d: datePart ?? "", t: time };
}

function combine(date: string, time: string) {
  // return in your backend format "YYYY-MM-DD HH:mm:ss.0000"
  if (!date) return "";
  const t = time && time.length >= 5 ? time : "00:00";
  return `${date} ${t}:00.0000`;
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;

    // hydrate when modal opens
    const s = splitDateTime(props.initialFrom);
    const e = splitDateTime(props.initialTo);

    startDate.value = s.d;
    startTime.value = s.t;
    endDate.value = e.d;
    endTime.value = e.t;
    title.value = props.initialTitle ?? "";

    enabled.value = (props.initialStatus ?? "1") === "1";
    formError.value = "";
    saving.value = false;
  },
  { immediate: true }
);

function onCancel() {
  emit("update:modelValue", false);
}

async function onSave() {
  formError.value = "";

  if (!startDate.value) return (formError.value = "Start Date is required.");
  if (!endDate.value) return (formError.value = "End Date is required.");

  // basic validation: end must be >= start
  const startMs = new Date(`${startDate.value}T${startTime.value}:00`).getTime();
  const endMs = new Date(`${endDate.value}T${endTime.value}:00`).getTime();

  if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
    return (formError.value = "Invalid date/time.");
  }
  if (endMs < startMs) {
    return (formError.value = "End date/time cannot be earlier than Start date/time.");
  }

  saving.value = true;

  emit("save", {
    survey_id: props.surveyId,
    survey_name: title.value,
    survey_from: combine(startDate.value, startTime.value),
    survey_to: combine(endDate.value, endTime.value),
    status: enabled.value ? "1" : "0",
  });

  // parent will close after successful API call
  saving.value = false;
}
</script>