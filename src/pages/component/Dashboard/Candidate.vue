<template>
  <div class="min-h-screen w-full bg-slate-50">
    <div class="w-full p-6">
      <!-- Header -->
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-slate-900">Candidates</h1>
          <p class="mt-2 max-w-2xl text-sm text-slate-500">
            Add, edit, and manage candidates for the election.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800"
          @click="openAdd"
        >
          <span class="text-lg leading-none">＋</span>
          Add New Candidate
        </button>
      </div>

      <!-- Table -->
      <div class="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-slate-200">
                <th class="px-6 py-4 text-left text-xs font-semibold tracking-widest text-slate-500">
                  CANDIDATE
                </th>
                <th class="px-6 py-4 text-left text-xs font-semibold tracking-widest text-slate-500">
                  MEMBER NO
                </th>
                <th class="px-6 py-4 text-left text-xs font-semibold tracking-widest text-slate-500">
                  POSITION
                </th>
                <th class="px-6 py-4 text-left text-xs font-semibold tracking-widest text-slate-500">
                  VISION
                </th>
                <th class="px-6 py-4 text-right text-xs font-semibold tracking-widest text-slate-500">
                  ACTIONS
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-100">
              <tr v-for="c in candidates" :key="c.id" class="bg-white">
                <!-- Candidate -->
                <td class="px-6 py-5">
                  <div class="flex min-w-0 items-center gap-3">
                    <div class="h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                      <img
                        v-if="c.photoUrl"
                        :src="c.photoUrl"
                        class="h-full w-full object-cover"
                        alt="photo"
                      />
                      <div v-else class="grid h-full w-full place-items-center text-slate-400">
                        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M20 21a8 8 0 1 0-16 0" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                    </div>

                    <div class="min-w-0">
                      <div class="truncate font-semibold text-slate-900">{{ c.fullName }}</div>
                      <div class="truncate text-xs text-slate-500">{{ c.position_desc }}</div>
                    </div>
                  </div>
                </td>

                <!-- Member No -->
                <td class="px-6 py-5 text-sm text-slate-700">{{ c.memberNo }}</td>

                <!-- Position -->
                <td class="px-6 py-5">
                  <span
                    class="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    {{ c.position_desc }}
                  </span>
                </td>

                <!-- Vision -->
                <td class="px-6 py-5 text-sm text-slate-600">
                  <div class="max-w-md line-clamp-2">
                    {{ c.vision || "—" }}
                  </div>
                </td>

                <!-- Actions -->
                <td class="px-6 py-5">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      class="grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                      @click="openEdit(c)"
                      title="Edit"
                    >
                      <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      class="grid h-10 w-10 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      @click="removeCandidate(c.id)"
                      title="Delete"
                    >
                      <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M6 6l1 16h10l1-16" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="candidates.length === 0">
                <td colspan="5" class="px-6 py-10 text-center text-sm text-slate-500">
                  No candidates found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
          <div class="text-xs text-slate-500">
            Showing 1 to {{ candidates.length }} of {{ total }} results
          </div>
          <div class="flex items-center gap-2">
            <button
              class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              disabled
            >
              Previous
            </button>
            <button
              class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <CandidateModal
        :open="modalOpen"
        :mode="modalMode"
        :committees="committees"
        :initial="selected"
        @close="closeModal"
        @save="onSave"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import CandidateModal, { type Candidate } from "@/pages/component/Dashboard/Modal/CandidateModal.vue";
import { newCandidates, fetchCandidates, updateCandidate } from "@/services/election.sevice";
import { useElectionStore } from "@/stores/election";
import { useAuthStore } from "@/stores/auth";

const committees = ["Oversight", "Executive Committee", "Regional Council"];
const total = 12;

const electionStore = useElectionStore();
const authStore = useAuthStore();

const candidates = ref<Candidate[]>([]);
const loadingCandidates = ref(false);

const modalOpen = ref(false);
const modalMode = ref<"add" | "edit">("add");
const selected = ref<Candidate | null>(null);

function openAdd() {
  modalMode.value = "add";
  selected.value = null;
  modalOpen.value = true;
  
}

function openEdit(c: Candidate) {
  modalMode.value = "edit";
  selected.value = { ...c };
  modalOpen.value = true;
}

function closeModal() {
  modalOpen.value = false;
  selected.value = null;
}

function removeCandidate(id: string) {
  if (!confirm("Delete this candidate?")) return;
  candidates.value = candidates.value.filter((c) => c.id !== id);
}

function generateCandidateId(length = 10): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  return Array.from(array)
    .map((x) => chars[x % chars.length])
    .join("");
}

// 1–99 (no leading 0)
function generateRandomTwoDigit(): number {
  return Math.floor(Math.random() * 99) + 1;
}

// ✅ LOAD candidates from API
async function loadCandidates() {
  try {
    loadingCandidates.value = true;

    const token = authStore.accessToken;
    const year = electionStore.year;

    const res = await fetchCandidates(year, token); // adjust params if your service differs
    const rows = res.data?.candidates ?? [];

    // map backend row -> UI Candidate
    candidates.value = rows.map((r: any) => ({
      id: r.candidate_id,
      fullName: r.member_name ?? "",          // from join
      memberNo: r.member_no,
      position_id: r.position_id,             // or use r.position_desc if you prefer label
      vision: r.vision ?? "",
      position_desc: r.position_desc,
      elec_order: r.elec_order,
      photoUrl: r.photo_url,                           // if you store photo later
    }));
  } catch (error) {
    console.log(error);
    candidates.value = [];
  } finally {
    loadingCandidates.value = false;
  }
}

onMounted(() => {
  loadCandidates();
});

// ✅ optional: reload when election year changes
watch(
  () => electionStore.year,
  () => {
    loadCandidates();
  }
);

async function onSave({ candidate, file }: { candidate: Candidate; file?: File }) {
  const token = authStore.accessToken;

  if (modalMode.value === "add") {
    const id = generateCandidateId(10);
    const order = generateRandomTwoDigit();

    try {
      const result = await newCandidates(
        {
          candidate_id: id,
          position_id: candidate.position_id,
          member_no: candidate.memberNo,
          vision: candidate.vision,
          elec_order: order,
          elect_year: electionStore.year,
        },
        token,
        file
      );

      if (!result.data?.success) {
        console.log(result.data?.message ?? "Failed to save candidate");
        return;
      }

      // ✅ easiest: reload from server (guarantees correct data/order)
      await loadCandidates();

      // If you prefer instant UI without reload, keep your unshift instead.
    } catch (error) {
      console.log(error);
      return;
    }
  } else {

    try {
      const result = await updateCandidate(
        {
          candidate_id: candidate.id,
          position_id: candidate.position_id,
          elec_order: 100,
          elect_year: electionStore.year,
          member_no: candidate.memberNo,
          vision: candidate.vision
        },
        token,
        file  
      )

       if (!result.data?.success) {
        console.log(result.data?.message ?? "Failed to update candidate");
        return;
      }

      await loadCandidates();
    } catch (error) {
      console.log(error);
    }
     
   
  }

  closeModal();
}
</script>