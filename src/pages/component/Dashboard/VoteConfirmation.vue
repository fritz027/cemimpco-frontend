<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
    <div class="mx-auto max-w-3xl px-4 py-10 sm:px-6">

      <!-- Screen-only title -->
      <div class="mt-6 text-center print:hidden">
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Your Vote Has Been Cast Successfully!
        </h1>
        <p class="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
          Thank you for participating in the {{ electionYear }} General Election.
        </p>
      </div>

      <!-- ================= PRINTABLE SECTION ================= -->
      <section
        id="printable-ballot"
        class="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >

        <!-- Print-only logo -->
        <div class="hidden print:block text-center px-6 pt-6 pb-3">
          <img
            :src="logo"
            alt="Cooperative Logo"
            class="mx-auto h-20 object-contain"
          />
          <h2 class="mt-3 text-lg font-extrabold text-slate-900">
            Cebu Mitsumi Multi-Purpose Cooperative
          </h2>
          <p class="text-xs text-slate-500 tracking-wide">
            Official Election Ballot Receipt
          </p>
        </div>

        <!-- Header -->
        <div class="flex items-start gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div class="mt-0.5 grid h-9 w-9 place-items-center rounded-xl bg-blue-50">
            <DocumentTextIcon class="h-5 w-5 text-blue-600" />
          </div>

          <div class="flex-1">
            <div class="flex justify-between items-center">
              <h2 class="text-sm font-extrabold text-slate-900">
                Official Ballot Summary
              </h2>

              <span class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                FINAL
              </span>
            </div>

            <p class="mt-1 text-[11px] tracking-wide text-slate-500">
              TRANSACTION ID:
              <span class="font-semibold text-slate-700">
                {{ transactionId }}
              </span>
            </p>

            <p class="mt-1 text-[11px] tracking-wide text-slate-500">
              Ballot Timestamp:
              <span class="font-semibold text-slate-700">
                {{ ballotTimestamp }}
              </span>
            </p>
          </div>
        </div>

        <!-- Body -->
        <div class="px-5 py-5 sm:px-6 space-y-6">

          <div v-for="group in groups" :key="group.title">
            <p class="text-[10px] font-extrabold tracking-[0.22em] text-slate-400">
              {{ group.title.toUpperCase() }}
            </p>

            <div class="mt-3 grid gap-3 sm:grid-cols-2">
              <div
                v-for="candidate in group.items"
                :key="candidate.name"
                class="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100"
              >
                <div class="h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-slate-200 ring-1 ring-slate-200">
                  <img
                    v-if="candidate.photo"
                    :src="candidate.photo"
                    class="h-full w-full object-cover"
                  />
                  <div v-else class="grid h-full w-full place-items-center">
                    <UserIcon class="h-5 w-5 text-slate-500" />
                  </div>
                </div>

                <p class="truncate text-sm font-semibold text-slate-900">
                  {{ candidate.name }}
                </p>
              </div>
            </div>
          </div>

          <!-- Screen-only buttons -->
          <div class="mt-6 flex justify-between border-t border-slate-200 pt-5 print:hidden">
            <button
              class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700"
              @click="downloadPdf"
            >
              <ArrowDownTrayIcon class="h-5 w-5" />
              Download Receipt (PDF)
            </button>

            <button
              class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              @click="printConfirmation"
            >
              <PrinterIcon class="h-5 w-5" />
              Print Confirmation
            </button>
          </div>

        </div>
      </section>
      <!-- ===================================================== -->
      <!-- Return home -->
      <div class="mt-6 flex flex-col items-center gap-3">
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 active:scale-[0.99] transition"
          @click="returnHome"
        >
          <HomeIcon class="h-5 w-5 text-slate-600" />
          Return to Home
        </button>

        <p class="text-xs text-slate-500">
          <span class="inline-flex items-center gap-1.5">
            <ClockIcon class="h-4 w-4 text-slate-400" />
            Ballot timestamp: <span class="font-medium text-slate-700">{{ ballotTimestamp }}</span>
          </span>
        </p>
      </div>

      <!-- Blockchain verified -->
      <section class="mt-8 rounded-2xl border border-blue-200/70 bg-blue-50/60 p-5 shadow-sm">
        <div class="flex items-start gap-3">
          <div class="grid h-10 w-10 place-items-center rounded-xl bg-blue-100">
            <ShieldCheckIcon class="h-5 w-5 text-blue-700" />
          </div>
          <div>
            <h3 class="text-sm font-extrabold text-slate-900">Blockchain Verified</h3>
            <p class="mt-1 text-sm leading-6 text-slate-600">
              Your vote has been hashed and submitted to the cooperative’s secure immutable ledger. This record ensures
              your choice cannot be tampered with or altered after submission.
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  CheckIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  HomeIcon,
  ClockIcon,
  ShieldCheckIcon,
  UserIcon,
} from "@heroicons/vue/24/solid";

import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useElectionStore } from "@/stores/election";
import { getMemberVoteCasted } from "@/services/election.sevice";
import Logo from "@/assets/cemimpco-logo.jpg";
import { useRouter } from "vue-router";


const authStore = useAuthStore();
const electionStore = useElectionStore();
const logo = Logo;
const router = useRouter();

type Candidate = { name: string; photo?: string | null };
type Group = { title: string; items: Candidate[] };

// values from API
const electionYear = ref<number | string>("");
const transactionId = ref<string>("");
const ballotTimestamp = ref<string>("");

// ballot groups
const groups = ref<Group[]>([]);

// status
const loading = ref(false);
const errorMsg = ref("");

// adjust these fields to match your API response keys
type VoteRow = {
  position_desc?: string | null;
  candidate_name?: string | null; // candidate name
  photo_url?: string | null;
};

function buildGroupsFromVotes(votes: VoteRow[]): Group[] {
  const map = new Map<string, Candidate[]>();

  for (const v of votes) {
    const title = (v.position_desc || "Other").trim();
    const name = (v.candidate_name || "Unknown Candidate").trim();

    const item: Candidate = {
      name,
      photo: v.photo_url ?? null,
    };

    if (!map.has(title)) map.set(title, []);
    map.get(title)!.push(item);
  }

  return Array.from(map.entries()).map(([title, items]) => ({ title, items }));
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return "";

  // SQL Anywhere string -> ISO-like string
  const isoString = dateStr.replace(" ", "T");
  const date = new Date(isoString);

  const datePart = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });

  const timePart = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return `${datePart} at ${timePart}`;
}

async function setVoteCasted() {
  loading.value = true;
  errorMsg.value = "";

  try {
    const res = await getMemberVoteCasted(electionStore.year, authStore.accessToken);

    // backend should return { success, ballot, votes }
    if (!res.data?.success) {
      errorMsg.value = res.data?.message || "Failed to load ballot.";
      return;
    }

    const ballot = res.data.ballot;
    const votes: VoteRow[] = res.data.votes || [];

    electionYear.value = ballot.elect_year;
    transactionId.value = String(ballot.ballot_no);
    ballotTimestamp.value = formatDateTime(ballot.vote_date);

    groups.value = buildGroupsFromVotes(votes);
  } catch (err: any) {
    errorMsg.value = err?.message || "Something went wrong.";
    console.log(err);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await setVoteCasted();
});

function downloadPdf() {
  console.log("download pdf");
}

async function returnHome(){
  await router.push({ name: "Profile" });
}

function printConfirmation() {
  window.print();
}
</script>

<!-- IMPORTANT: NOT SCOPED -->
<style>
@media print {

  /* Hide entire app */
  body * {
    visibility: hidden !important;
  }

  /* Show only ballot */
  #printable-ballot,
  #printable-ballot * {
    visibility: visible !important;
  }

  #printable-ballot {
    position: fixed !important;
    inset: 0 !important;
    width: 100% !important;
    margin: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    background: #fff !important;
  }

  html, body {
    background: #fff !important;
  }

  @page {
    size: A4;
    margin: 20mm;
  }
}
</style>