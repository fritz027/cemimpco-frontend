<template>
  <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 py-4">
    <div v-for="stat in [
      { label: 'Total Regular-Active Member', value: totalRegisteredVoters },
      { label: 'Total Member Web App', value: totalWebUsers },
      { label: 'Votes Casted', value: totalCastedVotes }
    ]" :key="stat.label" class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p class="text-xs font-medium text-slate-500">{{ stat.label }}</p>
      <p class="mt-2 text-2xl font-semibold text-slate-900">{{ stat.value }}</p>
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex justify-between">
        <div>
          <p class="text-xs font-medium text-slate-500">Remaining Time</p>
          <p class="mt-2 text-xl font-semibold text-slate-900">
            <span v-if="showRemaining">{{ remainingText }}</span>
            <span v-else>—</span>
          </p>
        </div>
        <span class="h-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">In Progress</span>
      </div>
    </div>
  </section>

  <section class="grid grid-cols-1 gap-8 lg:grid-cols-4 items-start">
    
    <div class="lg:col-span-2 space-y-8">
      <div class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div class="flex justify-between px-6 py-4">
          <h2 class="text-sm font-semibold text-slate-900">Current Election Details</h2>
          <button @click="editDetails" class="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">Edit Details</button>
        </div>
        <div class="border-t border-slate-200" />
        <div class="grid gap-6 p-6 sm:grid-cols-2">
          <div v-for="field in [{l:'ELECTION TITLE', v: electionTitle}, {l:'START DATE', v: formattedFrom}]" :key="field.l">
            <p class="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{{ field.l }}</p>
            <p class="mt-1 font-semibold text-slate-900">{{ field.v }}</p>
          </div>
          <div>
            <p class="text-[10px] font-bold tracking-widest text-slate-400 uppercase">STATUS</p>
            <div class="mt-1 flex items-center gap-2">
              <span class="h-2 w-2 rounded-full" :class="{'bg-emerald-500': electionStatus === 'Live and Secure', 'bg-red-500': electionStatus === 'Stopped', 'bg-yellow-500': electionStatus === 'Upcoming'}"></span>
              <p class="font-semibold" :class="{'text-emerald-700': electionStatus === 'Live and Secure', 'text-red-700': electionStatus === 'Stopped'}">{{ electionStatus }}</p>
            </div>
          </div>
          <div>
            <p class="text-[10px] font-bold tracking-widest text-slate-400 uppercase">END DATE</p>
            <p class="mt-1 font-semibold text-slate-900">{{ formattedTo }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-sm font-semibold text-slate-900">Real-time Participation</h2>
          <span class="text-[10px] font-bold text-slate-400">TURN OUT: {{ electionTurnOut }}%</span>
        </div>
        <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full bg-blue-600 transition-all duration-1000" :style="{ width: electionTurnOut + '%' }"></div>
        </div>
        <div class="grid grid-cols-2 gap-4 mt-6">
          <div class="border rounded-xl p-4 text-center">
            <p class="text-[10px] font-bold text-slate-400 uppercase">Positions</p>
            <p class="text-xl font-bold text-slate-900">{{ totalPositions }}</p>
          </div>
          <div class="border rounded-xl p-4 text-center">
            <p class="text-[10px] font-bold text-slate-400 uppercase">Candidates</p>
            <p class="text-xl font-bold text-slate-900">{{ totalCandidates }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm min-h-[550px] overflow-hidden">
      <div class="p-6 pb-0 border-b border-slate-100 bg-slate-50/30">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-bold text-slate-800 leading-tight">Election Results</h3>
            <p class="text-[10px] font-medium text-slate-400 uppercase mt-1">Updated: {{ lastUpdated }}</p>
          </div>
          <button @click="manualRefresh" :disabled="cooldown > 0 || isRefreshing" class="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all enabled:border-blue-200 enabled:text-blue-600 disabled:opacity-50">
            <svg :class="{'animate-spin': isRefreshing}" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            {{ cooldown > 0 ? `${cooldown}s` : 'Refresh' }}
          </button>
        </div>
        <div class="flex gap-4 overflow-x-auto no-scrollbar border-b border-slate-100">
          <button v-for="(list, pos) in groupedResults" :key="pos" @click="activeTab = String(pos)" :class="['pb-3 text-[11px] font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap', activeTab === pos ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400']">{{ pos }}</button>
        </div>
      </div>

      <div class="p-6 flex-1 overflow-y-auto">
        <div v-if="activeCandidates.length > 0" class="animate-in fade-in duration-500">
          <table class="w-full text-left">
            <thead>
              <tr class="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-50">
                <th class="pb-3">Candidate</th>
                <th class="pb-3 text-center">Votes</th>
                <th class="pb-3 w-32">Progress</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="(can, idx) in activeCandidates" :key="can.candidate_id" class="group">
                <td class="py-4">
                  <div class="flex items-center gap-3">
                    <div class="relative" v-if="can.photo_url">
                      <img :src="can?.photo_url" class="h-10 w-10 rounded-full border object-cover" />
                      <div v-if="idx === 0 && (can?.votes || 0) > 0" class="absolute -top-1 -right-1 bg-amber-400 text-[8px] font-black text-white px-1 rounded shadow-sm">TOP</div>
                    </div>
                    <div v-else class="relative text-slate-400">
                      <svg viewBox="0 0 24 24" class="h-10 w-10 border rounded-full" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21a8 8 0 1 0-16 0" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <div v-if="idx === 0 && (can?.votes || 0) > 0" class="absolute -top-1 -right-1 bg-amber-400 text-[8px] font-black text-white px-1 rounded shadow-sm">TOP</div>  
                    </div>
                    <div>
                      <p class="text-sm font-bold text-slate-800 leading-tight">{{ can?.member_name }}</p>
                      <p class="text-[10px] text-slate-400">ID: {{ can?.member_no }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-4 text-center text-sm font-black text-slate-900">{{ Number(can?.votes || 0).toLocaleString() }}</td>
                <td class="py-4">
                  <div class="flex justify-between text-[10px] font-bold text-blue-600 mb-1"><span>{{ can?.percentage }}%</span></div>
                  <div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-blue-600 transition-all duration-700" :style="{ width: (can?.percentage || 0) + '%' }"></div></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center py-20 opacity-40 text-sm">No data for this position.</div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useElectionStore } from "@/stores/election";
import { useRouter } from "vue-router";
import { getElectionStatus, getElectionResult } from "@/services/election.sevice";
import { electionConfig } from "@/services/auth.services";
import { useAuthStore } from "@/stores/auth";

const electionStore = useElectionStore();
const authStore = useAuthStore();
const router = useRouter();

// State Variables
const totalRegisteredVoters = ref(0);
const totalCastedVotes = ref(0);
const totalPositions = ref(0);
const totalCandidates = ref(0);
const electionTurnOut = ref(0);
const totalWebUsers = ref(0);
const sDate = ref('');
const eDate = ref('');
const eStart = ref(false);

// Live Tally State
const results = ref<any[]>([]);
const activeTab = ref("");
const lastUpdated = ref(new Date().toLocaleTimeString());
const cooldown = ref(0);
const isRefreshing = ref(false);

// Timer State
const now = ref(Date.now());
let clockTimer: number | undefined;

// --- Logic: Data Grouping ---

const groupedResults = computed(() => {
  const data = results.value || [];
  const groups: Record<string, any[]> = {};
  
  const sortedData = [...data].sort((a, b) => (b.votes || 0) - (a.votes || 0));

  sortedData.forEach(candidate => {
    const pos = candidate.position_desc || 'Unknown';
    if (!groups[pos]) groups[pos] = [];
    
    const pct = totalCastedVotes.value > 0 
      ? (candidate.votes / totalCastedVotes.value) * 100 
      : 0;

    groups[pos].push({
      ...candidate,
      percentage: pct.toFixed(1)
    });
  });
  return groups;
});

const activeCandidates = computed(() => {
  if (!activeTab.value) return [];
  return groupedResults.value[activeTab.value] || [];
});

// --- Logic: API Calls ---

async function fetchResults() {
  try {
    const response = await getElectionResult(electionStore.year, authStore.accessToken);
    if (response.data) {
      // Logic to handle if API returns array directly or { results: [] }
      results.value = Array.isArray(response.data) ? response.data : response.data.results;
      lastUpdated.value = new Date().toLocaleTimeString();
    }
  } catch (error) {
    console.error("Failed to fetch results:", error);
  }
}

const electionTitle = computed(() => {
  return `${electionStore.year} CEMIMPCO ELECTIONS`;
});

async function manualRefresh() {
  if (cooldown.value > 0 || isRefreshing.value) return;
  
  isRefreshing.value = true;
  await Promise.all([fetchResults(), setElectionStatus()]);
  isRefreshing.value = false;

  cooldown.value = 30;
  const timer = setInterval(() => {
    cooldown.value--;
    if (cooldown.value <= 0) clearInterval(timer);
  }, 1000);
}

// --- Logic: Utilities & Lifecycle ---

function parseEndDate(dateStr: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? new Date(`${dateStr}T23:59:59`) : new Date(dateStr);
}

const remainingText = computed(() => {
  const end = parseEndDate(electionStore.to).getTime();
  const diff = Math.max(0, end - now.value);
  const totalSeconds = Math.floor(diff / 1000);
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${d}d ${h}h ${m}m ${s}s`;
});

const showRemaining = computed(() => {
  const start = new Date(electionStore.from).getTime();
  const end = parseEndDate(electionStore.to).getTime();
  return electionStore.start && now.value >= start && now.value <= end;
});

const electionStatus = computed(() => {
  if (!eStart.value) return "Stopped";
  const start = new Date(sDate.value).getTime();
  const end = parseEndDate(eDate.value).getTime();
  if (now.value < start) return "Upcoming";
  if (now.value > end) return "Ended";
  return "Live and Secure";
});

const formattedFrom = computed(() => formatElectionDate(sDate.value, "start"));
const formattedTo = computed(() => formatElectionDate(eDate.value, "end"));

function formatElectionDate(dateStr: string, type: "start" | "end") {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  type === "start" ? date.setHours(0, 0, 0, 0) : date.setHours(23, 59, 0, 0);
  return date.toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }).replace(",", " •");
}

async function setElectionStatus() {
  try {
    const response = await getElectionStatus(electionStore.year, authStore.accessToken);
    if (response.data.success) {
      const res = response.data;
      totalRegisteredVoters.value = res.totalRegisterVoter;
      totalCastedVotes.value = res.totalCastedVote;
      totalCandidates.value = res.totalCandidates;
      totalPositions.value = res.totalPosition;
      totalWebUsers.value = res.totalWebUsers;
      electionTurnOut.value = res.totalRegisterVoter > 0 ? Number(((res.totalCastedVote / res.totalRegisterVoter) * 100).toFixed(2)) : 0;
    }
  } catch (e) { console.error(e); }
}

async function setElectionDate() {
  try {
    const res = await electionConfig();
    if (res.data.config) {
      const election = typeof res.data.config.uvalue === "string" ? JSON.parse(res.data.config.uvalue) : res.data.config.uvalue;
      sDate.value = election.from;
      eDate.value = election.to;
      eStart.value = election.start;
    }
  } catch (e) { console.error(e); }
}

watch(groupedResults, (newGroups) => {
  const positions = Object.keys(newGroups);
  if (positions.length > 0 && (!activeTab.value || !newGroups[activeTab.value])) {
    activeTab.value = positions[0] ?? "";
  }
}, { immediate: true });

onMounted(async () => {
  await Promise.all([setElectionStatus(), setElectionDate(), fetchResults()]);
  clockTimer = window.setInterval(() => { now.value = Date.now(); }, 1000);
});

onBeforeUnmount(() => {
  if (clockTimer) window.clearInterval(clockTimer);
});

const editDetails = () => router.push({ name: "ElectionDate" });
</script>
