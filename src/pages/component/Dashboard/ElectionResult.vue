<template>
  <div class="min-h-screen bg-[#f8fafc] pb-12">
    <header class="top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 class="text-2xl font-black tracking-tight text-slate-900">{{ electionTitle }}</h1>
            <div class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
              <p class="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {{ dateRangeLabel }}
              </p>
              <span class="hidden md:block h-1 w-1 rounded-full bg-slate-300"></span>
              <p class="flex items-center gap-1.5 text-[11px] font-bold text-blue-500 uppercase tracking-widest">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Generated: {{ nowStamp }}
              </p>
            </div>
          </div>
          <button @click="printResults" class="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
            Print Official Report
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      <section class="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <div v-for="stat in summaryStats" :key="stat.label" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm overflow-hidden relative">
          <dt class="text-[10px] font-black uppercase tracking-widest text-slate-400">{{ stat.label }}</dt>
          <dd class="mt-2 flex items-baseline gap-1">
            <span class="text-2xl font-black text-slate-900">{{ stat.value }}</span>
            <span v-if="stat.suffix" class="text-xs font-bold text-blue-600">{{ stat.suffix }}</span>
          </dd>
        </div>
      </section>

      <div class="space-y-12">
        <div v-for="group in positionGroups" :key="group.position_id" class="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-sm">
          
          <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-10 py-6">
            <div>
              <h3 class="text-xl font-black text-slate-800 tracking-tight">{{ group.position }}</h3>
              <div class="flex items-center gap-2 mt-1">
                <span class="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                <p class="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                  Available Seats: {{ group.seats }} {{ group.seats > 1 ? 'Winners' : 'Winner' }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total Votes</p>
              <p class="text-lg font-black text-slate-900">{{ group.totalVotes.toLocaleString() }}</p>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-white text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th class="px-10 py-4">Rank</th>
                  <th class="px-10 py-4">Candidate Profile</th>
                  <th class="px-10 py-4 text-right">Votes</th>
                  <th class="px-10 py-4 w-80">Live Standing</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="(c, idx) in group.candidates" :key="c.candidate_id" 
                  :class="[
                    'group transition-colors',
                    idx < group.seats ? 'bg-emerald-50/40' : 'hover:bg-slate-50/30'
                  ]"
                >
                  <td class="px-10 py-8">
                    <div :class="[
                      'flex h-12 w-12 items-center justify-center rounded-2xl font-black text-lg border shadow-sm transition-all',
                      idx < group.seats 
                        ? 'bg-emerald-600 border-emerald-500 text-white scale-110 shadow-emerald-100' 
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    ]">
                      {{ idx + 1 }}
                    </div>
                  </td>

                  <td class="px-10 py-8">
                    <div class="flex items-center gap-5">
                      <div class="relative">
                        <img :src="photoSrc(c.photo_url)" class="h-16 w-16 rounded-[2rem] object-cover ring-4 ring-white shadow-md group-hover:scale-105 transition-transform" @error="onImgError" />
                        <div v-if="idx < group.seats" class="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg ring-2 ring-white">
                          <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        </div>
                      </div>
                      <div>
                        <p class="text-base font-black text-slate-900 leading-none">{{ c.member_name }}</p>
                        <p class="mt-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {{ c.member_no }}</p>
                      </div>
                    </div>
                  </td>

                  <td class="px-10 py-8 text-right">
                    <div class="flex flex-col items-end">
                      <span class="text-2xl font-black text-slate-900 tracking-tight">{{ c.votes.toLocaleString() }}</span>
                      <span v-if="idx >= group.seats" class="text-[10px] font-bold text-red-500 uppercase mt-1">
                        - {{ getVoteDelta(c.votes, group.candidates[group.seats - 1]?.votes) }} to win
                      </span>
                      <span v-else class="text-[9px] font-black text-emerald-600 uppercase mt-1">Winning Circle</span>
                    </div>
                  </td>

                  <td class="px-10 py-8">
                    <div class="space-y-3 w-64 ml-auto">
                      <div class="flex items-end justify-between">
                        <span class="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Popularity</span>
                        <span class="text-sm font-black text-blue-600">{{ percent(c.votes, group.totalVotes) }}%</span>
                      </div>
                      <div class="h-3.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200/50 shadow-inner">
                        <div class="h-full rounded-full bg-gradient-to-r from-blue-700 to-blue-500 transition-all duration-1000 shadow-sm" :style="{ width: percent(c.votes, group.totalVotes) + '%' }"></div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { useElectionStore } from "@/stores/election";
import { useAuthStore } from "@/stores/auth";
import { getElectionResult, fetchPositions } from "@/services/election.sevice";
import placeholder from "@/assets/avatar-placeholder.svg";

type Candidate = {
  candidate_id: string;
  elect_year: number;
  member_no: string;
  member_name: string;
  position_id: string;
  position_desc: string;
  votes: number;
  photo_url: string;
};

const electionStore = useElectionStore();
const authStore = useAuthStore();
const now = ref(new Date());

// State
const candidates = ref<Candidate[]>([]);
const totalRegisteredVoters = ref<number>(0);
const totalWebUsers = ref<number>(0);
const totalCastedVotes = ref<number>(0);
const organizationName = "Cebu Mitsumi Multi-Purpose Cooperative";
const PHOTO_BASE = ""; 
const positionConfigs = ref<any[]>([]);

onMounted(async () => {
  await setResults();
});

// Computed Logic
const electionTitle = computed(() => `${electionStore.year} Cooperative Election Results`);

const turnoutPercent = computed(() => {
  if (!totalRegisteredVoters.value) return 0;
  return Number(((totalCastedVotes.value / totalRegisteredVoters.value) * 100).toFixed(2));
});

const electionStart = computed(() => electionStore.from);
const electionEnd = computed(() => electionStore.to);

// This ensures the header has the dates ready to display
const dateRangeLabel = computed(() => {
  if (!electionStart.value || !electionEnd.value) return "Dates Pending";
  return formatDateRange(electionStart.value, electionEnd.value);
});

const summaryStats = computed(() => [
  { label: 'Registered Voters', value: totalRegisteredVoters.value.toLocaleString() },
  { label: 'Total Web Users', value: totalWebUsers.value.toLocaleString() },
  { label: 'Votes Casted', value: totalCastedVotes.value.toLocaleString() },
  { label: 'Turnout Rate', value: turnoutPercent.value, suffix: '%' },
  { label: 'Total Positions', value: positionGroups.value.length }
]);

// Grouping and Sorting Logic
// Updated Grouping Logic
const positionGroups = computed(() => {
  const map = new Map<string, { 
    position: string; 
    position_id: string; 
    seats: number; 
    candidates: Candidate[] 
  }>();

  for (const c of candidates.value) {
    const key = c.position_id || "UNSPECIFIED";
    
    if (!map.has(key)) {
      // Find the seat count from fetchPositions data
      const config = positionConfigs.value.find(p => String(p.position_id) === String(key));
      // Logic: Use 'position' column from your API as seat count, fallback to 1
      const availableSeats = config ? Number(config.position) : 1;

      map.set(key, { 
        position: c.position_desc || "Unspecified", 
        position_id: key,
        seats: availableSeats,
        candidates: [] 
      });
    }
    map.get(key)!.candidates.push(c);
  }

  return Array.from(map.values())
    .map((g) => {
      // Sort candidates by votes high to low
      const sorted = [...g.candidates].sort((a, b) => (b.votes || 0) - (a.votes || 0));
      const total = sorted.reduce((s, x) => s + (x.votes || 0), 0);
      return { ...g, candidates: sorted, totalVotes: total };
    })
    .sort((a, b) => a.position_id.localeCompare(b.position_id));
});

// Utilities
async function setResults() {
  try {
    const [resultsRes, positionsRes] = await Promise.all([
      getElectionResult(electionStore.year, authStore.accessToken),
      fetchPositions(authStore.accessToken)
    ]);

    // Ensure positionConfigs is assigned as an array
    if (positionsRes.data) {
      // If the API returns an object with a property (e.g., positionsRes.data.results), 
      // target that, otherwise fallback to an empty array.
      positionConfigs.value = Array.isArray(positionsRes.data) 
        ? positionsRes.data 
        : (positionsRes.data.positions || []); 
    }

    if (resultsRes.data.success) {
      candidates.value = resultsRes.data.results || [];
      totalCastedVotes.value = resultsRes.data.totalCastedVote || 0;
      totalRegisteredVoters.value = resultsRes.data.totalRegisterVoter || 0;
      totalWebUsers.value = resultsRes.data.totalWebUsers || 0;
    }
  } catch (error) {
    console.error("API Error:", error);
  }
}



function getVoteDelta(votes: number, leaderVotes: number | undefined): string {
  const leader = leaderVotes ?? 0;
  if (leader === 0 || votes >= leader) return "0";
  return (leader - votes).toLocaleString();
}

function percent(votes: number, total: number) {
  if (!total) return "0.00";
  return ((votes / total) * 100).toFixed(2);
}

function photoSrc(url: string) {
  if (!url) return placeholder;
  if (/^https?:\/\//i.test(url)) return url;
  return PHOTO_BASE ? `${PHOTO_BASE}${url.startsWith("/") ? "" : "/"}${url}` : url;
}

function onImgError(e: Event) {
  (e.target as HTMLImageElement).src = placeholder;
}

function formatDateRange(a: string, b: string) {
  if (!a || !b) return "Date Pending";
  return `${new Date(a).toLocaleDateString()} - ${new Date(b).toLocaleDateString()}`;
}

// Update the clock every second for the 'nowStamp'
onMounted(() => {
  const timer = setInterval(() => {
    now.value = new Date();
  }, 1000);
  
  onBeforeUnmount(() => clearInterval(timer));
});

const nowStamp = computed(() => {
  return now.value.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
});

/* Escape HTML for safety */
function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* TABLE-ONLY PRINT */
function printResults() {
  const rowsHtml = positionGroups.value
    .map((group) => {
      const pos = escapeHtml(group.position);
      const seats = group.seats;
      const total = group.totalVotes;

      return group.candidates
        .map((c, idx) => {
          const name = escapeHtml(c.member_name);
          const votes = c.votes.toLocaleString();
          const pct = total ? ((c.votes / total) * 100).toFixed(2) : "0.00";
          const isWinner = idx < seats;

          const positionCell =
            idx === 0
              ? `<td rowspan="${group.candidates.length}" class="pos-cell">${pos}<br><small>(${seats} seat${seats > 1 ? 's' : ''})</small></td>`
              : "";

          return `
            <tr class="${isWinner ? 'winner-row' : ''}">
              ${positionCell}
              <td style="text-align:center;">${idx + 1}</td>
              <td>
                <strong>${name}</strong> 
                ${isWinner ? '<span class="winner-tag">Winner</span>' : ''}
              </td>
              <td style="text-align:right; font-family: monospace;">${votes}</td>
              <td style="text-align:right;">${pct}%</td>
            </tr>
          `;
        })
        .join("");
    })
    .join("");

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;

  win.document.open();
  win.document.write(`
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Official Election Results</title>
<style>
  @page { size: A4 portrait; margin: 15mm; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; line-height: 1.5; margin: 0; }
  
  .header { text-align: center; border-bottom: 2px solid #334155; padding-bottom: 20px; margin-bottom: 20px; }
  .org-name { font-size: 18px; font-weight: 800; text-transform: uppercase; color: #0f172a; margin: 0; }
  .report-title { font-size: 14px; font-weight: 700; color: #475569; margin: 5px 0; }
  .date-range { font-size: 11px; color: #64748b; font-weight: 600; }

  .summary-grid { display: flex; justify-content: space-between; margin-bottom: 25px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
  .stat-box { text-align: center; flex: 1; }
  .stat-label { font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; display: block; }
  .stat-value { font-size: 14px; font-weight: 700; color: #1e293b; }

  table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
  th { background: #f1f5f9; color: #475569; text-transform: uppercase; font-size: 9px; letter-spacing: 0.05em; padding: 10px 8px; border: 1px solid #e2e8f0; }
  td { padding: 8px; border: 1px solid #e2e8f0; }
  
  .pos-cell { font-weight: 800; color: #0f172a; background: #f8fafc; width: 25%; }
  .winner-row { background-color: #f0fdf4; }
  .winner-tag { font-size: 8px; font-weight: 800; color: #166534; background: #dcfce7; padding: 2px 5px; border-radius: 4px; margin-left: 5px; text-transform: uppercase; }
  
  .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 9px; color: #94a3b8; display: flex; justify-content: space-between; }
</style>
</head>
<body>

<div class="header">
  <div class="org-name">${escapeHtml(organizationName)}</div>
  <div class="report-title">${escapeHtml(electionTitle.value)}</div>
  <div class="date-range">${escapeHtml(dateRangeLabel.value)}</div>
</div>

<div class="summary-grid">
  <div class="stat-box">
    <span class="stat-label">Registered Voters</span>
    <span class="stat-value">${totalRegisteredVoters.value.toLocaleString()}</span>
  </div>
  <div class="stat-box">
    <span class="stat-label">Votes Casted</span>
    <span class="stat-value">${totalCastedVotes.value.toLocaleString()}</span>
  </div>
  <div class="stat-box">
    <span class="stat-label">Turnout Rate</span>
    <span class="stat-value">${turnoutPercent.value}%</span>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th>Position</th>
      <th style="width:50px">Rank</th>
      <th>Candidate</th>
      <th style="width:100px">Votes</th>
      <th style="width:70px">Share (%)</th>
    </tr>
  </thead>
  <tbody>
    ${rowsHtml}
  </tbody>
</table>

<div class="footer">
  <div>Total Valid Votes Processed: ${totalCastedVotes.value.toLocaleString()}</div>
  <div>System Generated Report • ${escapeHtml(nowStamp.value)}</div>
</div>

<script>
  window.onload = function() {
    window.print();
    setTimeout(() => window.close(), 500);
  }
<\/script>

</body>
</html>
  `);
  win.document.close();
}
</script>