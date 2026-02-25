<!-- BallotPage.vue (dynamic: positions table controls limits) -->
<template>
  <div class="min-h-screen bg-slate-50">
    <div class="bg-blue-700">
      <div class="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <p class="text-sm text-blue-50">
          Cast your vote for the future leadership of CEMIMPCO. Select your preferred candidates for each category below.
          Your vote is secure, confidential, and final once submitted.
        </p>
      </div>
    </div>

    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="grid gap-6 lg:grid-cols-[1fr_360px]">
        <!-- LEFT -->
        <div class="space-y-6">
          <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Loading...
          </div>

          <div v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
            {{ error }}
          </div>

          <template v-else>
            <CommitteeSection
              v-for="pos in positions"
              :key="pos.position_id"
              :title="pos.position_desc"
              :subtitle="`Choose up to ${pos.position} candidates.`"
              :limit="pos.position"
              :candidates="getCandidates(pos.position_id)"
              :selected="getPicked(pos.position_id)"
              @update:selected="setPicked(pos.position_id, $event)"
              :emptyText="`No candidates available for ${pos.position_desc}.`"
            />
          </template>
        </div>

        <!-- RIGHT -->
        <aside class="lg:sticky lg:top-6 h-max">
          <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div class="flex items-center gap-3 bg-blue-600 px-5 py-4 text-white">
              <div class="grid h-9 w-9 place-items-center rounded-xl bg-white/15">
                <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                </svg>
              </div>
              <div>
                <div class="text-sm font-semibold">Your Digital Ballot</div>
                <div class="text-xs text-blue-100">Review your selections before casting.</div>
              </div>
            </div>

            <div class="p-5 space-y-4">
              <BallotGroup
                v-for="pos in positions"
                :key="pos.position_id"
                :title="pos.position_desc"
                :picked="getPicked(pos.position_id)"
                :limit="pos.position"
                emptyText="No selections yet."
                @remove="removePicked(pos.position_id, $event)"
              />

              <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <label class="flex items-start gap-3 text-sm text-slate-700">
                  <input
                    v-model="confirmed"
                    type="checkbox"
                    class="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>I confirm that these selections represent my final vote. I understand this action cannot be undone.</span>
                </label>

                <button
                  @click="castVote"
                  :disabled="submitting || !canSubmit"
                  class="w-full max-w-md h-12 rounded-xl bg-[#3FA3E8] text-white font-semibold tracking-wide shadow-md
                        hover:bg-[#2f8fd2] active:scale-[0.99] transition
                        disabled:opacity-60 disabled:cursor-not-allowed
                        flex items-center justify-center gap-2"
                >
                  <!-- Spinner -->
                  <svg
                    v-if="submitting"
                    class="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>

                  <!-- Text -->
                  <span>
                    {{ submitting ? "Submitting..." : "Submit Vote" }}
                  </span>
                </button>

                <p v-if="submitError" class="mt-3 text-xs text-red-600">{{ submitError }}</p>
                <p v-if="submitSuccess" class="mt-3 text-xs text-emerald-700">{{ submitSuccess }}</p>
              </div>

              <div class="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                <div class="text-xs text-blue-800/80">
                  Your connection is encrypted. Your selections remain private.
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
    <div
      v-if="submitting"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-2xl px-8 py-6 shadow-xl text-center">
        <svg
          class="animate-spin h-8 w-8 text-blue-600 mx-auto"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>

        <p class="mt-4 font-semibold text-slate-800">
          Processing your vote...
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useElectionStore } from "@/stores/election";
import { useRouter } from "vue-router";

import CommitteeSection, { type Candidate as UiCandidate } from "@/pages/component/Vote/CommitteeSection.vue";
import BallotGroup from "@/pages/component/Vote/BallotGroup.vue";

import { fetchCandidates, fetchPositions, submitVote } from "@/services/election.sevice";
// import { submitVote } from "@/services/vote.service";

type PositionRow = {
  position_id: string;    // "BOD"
  position_desc: string;  // "BOARD OF DIRECTOR"
  position: number;       // ✅ LIMIT (max picks)
};

const authStore = useAuthStore();
const electionStore = useElectionStore();
const router = useRouter();

const loading = ref(false);
const error = ref<string | null>(null);

const submitting = ref(false);
const submitError = ref<string | null>(null);
const submitSuccess = ref<string | null>(null);

const positions = ref<PositionRow[]>([]);

const candidatesByPosition = reactive<Record<string, UiCandidate[]>>({});
const selectedByPosition = reactive<Record<string, UiCandidate[]>>({});

export type VoteResponse = {
  success: boolean;
  ballot_no: number;      // ✅ this is what you need
  total_votes: number;
  message?: string;
};


// ✅ safe getters / setters (fix “possibly undefined”)
function getPicked(positionId: string): UiCandidate[] {
  return selectedByPosition[positionId] ?? [];
}
function getCandidates(positionId: string): UiCandidate[] {
  return candidatesByPosition[positionId] ?? [];
}
function setPicked(positionId: string, value: UiCandidate[]) {
  selectedByPosition[positionId] = value;
}
function removePicked(positionId: string, candidateId: string) {
  selectedByPosition[positionId] = getPicked(positionId).filter((c) => c.id !== candidateId);
}

const canSubmit = computed(() => {
  const anyPicked = Object.values(selectedByPosition).some((arr) => (arr?.length || 0) > 0);
  return confirmed.value && anyPicked && !loading.value;
});

const confirmed = ref(false);

function mapApiCandidate(row: any): UiCandidate {
  const photoUrl =
      row.photo_url ??
      row.photoUrl ??
      row.photo ??
      row.photo_path ??
      null;

  const name =
    String(row.member_name ?? row.full_name ?? row.candidate_name ?? row.name ?? "").trim() ||
    `Member #${row.member_no ?? ""}`.trim();

  

  const meta = [
    row.member_no ? `Member No. ${row.member_no}` : null,
    row.elect_year ? `Election ${row.elect_year}` : null,
  ].filter(Boolean).join(" • ") || "—";

  const role = String(row.vision ?? row.platform ?? row.role ?? row.statement ?? "—");

  return {
    id: String(row.candidate_id),
    name,
    meta,
    role,
    photoUrl: photoUrl ? String(photoUrl) : null,
    avatarType: row.photo_url || row.photo ? "photo" : "illustration",
  };
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = a[i]!;
    a[i] = a[j]!;
    a[j] = temp;
  }
  return a;
}

onMounted(async () => {
  loading.value = true;
  error.value = null;

  try {
    const year = electionStore.year || new Date().getFullYear();

    // 1) load positions (LIMIT = position)
    const posRes = await fetchPositions(authStore.accessToken);
    const posList: PositionRow[] = (posRes as any)?.positions ? [] : (posRes as any)?.data?.positions;

    // optional: sort by limit or by desc; if you have separate sort field, use it.
    positions.value = posList;

    // init buckets
    for (const p of positions.value) {
      candidatesByPosition[p.position_id] = [];
      selectedByPosition[p.position_id] = [];
    }

    // 2) load candidates
    const candRes = await fetchCandidates(year, authStore.accessToken);
    const candList = (candRes as any)?.candidates ? [] : (candRes as any)?.data?.candidates;

    for (const row of candList) {
      const pid = String(row.position_id ?? "").toUpperCase();
      if (!pid) continue;

      if (!positions.value.some((p) => p.position_id === pid)) continue;

      candidatesByPosition[pid]?.push(mapApiCandidate(row));
    }

// ✅ RANDOMIZE each position group
for (const p of positions.value) {
  candidatesByPosition[p.position_id] =
    shuffleArray(candidatesByPosition[p.position_id] ?? []);
}

    confirmed.value = false;
  } catch (e: any) {
    error.value = e?.message || "Failed to load ballot data.";
  } finally {
    loading.value = false;
  }
});

async function castVote() {
  submitError.value = null;
  submitSuccess.value = null;

  if (!canSubmit.value) return;

  try {
    submitting.value = true;

    const year = electionStore.year || new Date().getFullYear();

    // build dynamic payload
    const votes = positions.value.map((p) => ({
      position_id: p.position_id,
      candidate_ids: getPicked(p.position_id).map((c) => c.id),
    })).filter(v => v.candidate_ids.length > 0);

    const response: VoteResponse = await submitVote({
      year,
      votes,
    }, authStore.accessToken);

    submitSuccess.value = `Vote submitted successfully. Ballot No: ${response.ballot_no}`;

    // Clear selections after success
    for (const p of positions.value) {
      selectedByPosition[p.position_id] = [];
    }

    confirmed.value = false;

    setTimeout( async () => {
      submitting.value=false;
      await router.push({
        name: "VoteConfirmation"
      })
    }, 1000);

  } catch (err: any) {
    submitError.value =
      err.response?.data?.message ||
      err.message ||
      "Failed to submit vote.";
  } finally {
    submitting.value = false;

  }
}
</script>