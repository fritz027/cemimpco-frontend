<template>
  <!-- ===== Top Cards ===== -->
  <section class="grid grid-cols-1 gap-6 md:grid-cols-3">

    <!-- Registered -->
    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex justify-between">
        <div>
          <p class="text-xs font-medium text-slate-500">
            Total Registered Voters
          </p>
          <p class="mt-2 text-2xl font-semibold text-slate-900">
            {{ stats.registered }}
          </p>
        </div>
        <span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          +12% vs last year
        </span>
      </div>
    </div>

    <!-- Votes -->
    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex justify-between">
        <div>
          <p class="text-xs font-medium text-slate-500">
            Votes Casted
          </p>
          <p class="mt-2 text-2xl font-semibold text-slate-900">
            {{ stats.votes }}
          </p>
        </div>
        <span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          Active
        </span>
      </div>
    </div>

    <!-- Remaining -->
    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex justify-between">
        <div>
          <p class="text-xs font-medium text-slate-500">
            Remaining Time
          </p>
          <p class="mt-1 text-2xl font-semibold text-slate-900">
            <span v-if="showRemaining">{{ remainingText }}</span>
            <span v-else>—</span>
          </p>
        </div>
        <span class="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
          In Progress
        </span>
      </div>
    </div>

  </section>

  <!-- ===== Content Grid ===== -->
  <section class="grid grid-cols-1 gap-8 lg:grid-cols-3">

    <!-- Left Section -->
    <div class="lg:col-span-2 space-y-8">

      <!-- Election Details -->
      <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="flex justify-between px-6 py-4">
          <h2 class="text-sm font-semibold text-slate-900">
            Current Election Details
          </h2>
          <button class="text-xs font-semibold text-blue-600 hover:text-blue-700">
            Edit Details
          </button>
        </div>
        <div class="border-t border-slate-200" />

        <div class="grid gap-6 p-6 sm:grid-cols-2">
          <div>
            <p class="text-xs font-semibold tracking-widest text-slate-400">
              ELECTION TITLE
            </p>
            <p class="mt-2 font-semibold text-slate-900">
              {{ electionTitle }}
            </p>

            <p class="mt-6 text-xs font-semibold tracking-widest text-slate-400">
              START DATE
            </p>
            <p class="mt-2 font-semibold text-slate-900">
              {{ formattedFrom }}
            </p>
          </div>

          <div>
            <p class="text-xs font-semibold tracking-widest text-slate-400">
              STATUS
            </p>
            <div class="mt-2 flex items-center gap-2">
              <div class="flex items-center gap-2">
                <span
                  class="h-2 w-2 rounded-full"
                  :class="{
                    'bg-emerald-500': electionStatus === 'Live and Secure',
                    'bg-red-500': electionStatus === 'Stopped',
                    'bg-yellow-500': electionStatus === 'Upcoming',
                    'bg-gray-500': electionStatus === 'Ended'
                  }"
                />
                <p
                  class="font-semibold"
                  :class="{
                    'text-emerald-700': electionStatus === 'Live and Secure',
                    'text-red-700': electionStatus === 'Stopped',
                    'text-yellow-700': electionStatus === 'Upcoming',
                    'text-gray-700': electionStatus === 'Ended'
                  }"
                >
                  {{ electionStatus }}
                </p>
              </div>
            </div>

            <p class="mt-6 text-xs font-semibold tracking-widest text-slate-400">
              END DATE
            </p>
            <p class="mt-2 font-semibold text-slate-900">
              {{ formattedTo }}
            </p>
          </div>
        </div>
      </div>

      <!-- Real-time Participation -->
      <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="flex justify-between px-6 py-4">
          <h2 class="text-sm font-semibold text-slate-900">
            Real-time Participation
          </h2>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Last updated: {{ stats.lastUpdated }}
          </span>
        </div>

        <div class="border-t border-slate-200" />

        <div class="p-6">
          <div class="flex justify-between">
            <p class="font-semibold text-slate-800">
              Voter Turnout
            </p>
            <p class="font-semibold text-slate-900">
              {{ stats.turnout }}%
            </p>
          </div>

          <div class="mt-3 h-2 w-full rounded-full bg-slate-100">
            <div
              class="h-2 rounded-full bg-blue-600"
              :style="{ width: stats.turnout + '%' }"
            />
          </div>

          <div class="mt-6 grid gap-4 sm:grid-cols-2">
            <div class="rounded-xl border border-slate-200 p-4">
              <p class="text-xs font-semibold text-slate-400">
                TOTAL POSITIONS
              </p>
              <p class="mt-1 text-2xl font-semibold text-slate-900">
                {{ stats.positions }}
              </p>
            </div>

            <div class="rounded-xl border border-slate-200 p-4">
              <p class="text-xs font-semibold text-slate-400">
                TOTAL CANDIDATES
              </p>
              <p class="mt-1 text-2xl font-semibold text-slate-900">
                {{ stats.candidates }}
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Right Panel -->
    <div class="rounded-2xl border border-slate-200 bg-white shadow-sm min-h-[500px]">
    </div>

  </section>
</template>
<script setup lang="ts">
import { computed,onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useElectionStore } from "@/stores/election";

const electionStore = useElectionStore();

const now = ref(Date.now());

let timer: number | undefined;

function parseEndDate(dateStr: string) {
  // If it's just YYYY-MM-DD, treat as end of that day
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(`${dateStr}T23:59:59`);
  }
  // Otherwise assume it includes time already
  return new Date(dateStr);
}

const remainingMs = computed(() => {
  const end = parseEndDate(electionStore.to).getTime();
  return Math.max(0, end - now.value);
});

const remainingText = computed(() => {
  const totalSeconds = Math.floor(remainingMs.value / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
});

const isWithinWindow = computed(() => {
  const start = new Date(electionStore.from).getTime();
  const end = parseEndDate(electionStore.to).getTime();
  const t = now.value;

  return t >= start && t <= end;
});

// Optional: only show remaining time when start=true AND within from/to
const showRemaining = computed(() => {
  const start = new Date(electionStore.from).getTime();
  const end = parseEndDate(electionStore.to).getTime();
  const t = now.value;

  return electionStore.start && t >= start && t <= end;
});


onMounted(() => {
  timer = window.setInterval(() => {
    now.value = Date.now();
  }, 1000);
});

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer);
});

// If election dates change, update immediately
watch(
  () => [electionStore.from, electionStore.to],
  () => { now.value = Date.now(); },
  { immediate: true }
);

function formatElectionDate(dateStr: string, type: "start" | "end") {
  const date = new Date(dateStr);

  if (type === "start") {
    date.setHours(0, 0, 0, 0); // 12:00 AM
  } else {
    date.setHours(23, 59, 0, 0); // 11:59 PM
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).replace(",", " •");
}

const formattedFrom = computed(() =>
  formatElectionDate(electionStore.from, "start")
);

const formattedTo = computed(() =>
  formatElectionDate(electionStore.to, "end")
);

const electionTitle = computed(() => {
  return `${electionStore.year} General Board Election`;
});

const electionStatus = computed(() => {
  const now = new Date().getTime();
  const start = new Date(electionStore.from).setHours(0, 0, 0, 0);
  const end = new Date(electionStore.to).setHours(23, 59, 59, 999);

  if (!electionStore.start) {
    return "Stopped";
  }

  if (now < start) {
    return "Upcoming";
  }

  if (now > end) {
    return "Ended";
  }

  return "Live and Secure";
});

const stats = computed(() => ({
  registered: "1,248",
  votes: "856",
  remaining: "14h 22m 10s",
  lastUpdated: "14:32:11",
  turnout: 68.5,
  positions: 12,
  candidates: 48,
}));

const election = computed(() => ({
  title: "2024 General Board Election",
  status: "Live and Secure",
  startDate: "Oct 24, 2024 • 08:00 AM",
  endDate: "Oct 25, 2024 • 05:00 PM",
}));

</script>
<style lang="css" scoped></style>