<template>
  <div class="min-h-screen w-full bg-slate-50">
    <div class="w-full p-6">
      <!-- Header -->
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-slate-900">ELECOM COMMITTEE</h1>
          <p class="mt-2 max-w-2xl text-sm text-slate-500">
            User access for online election.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800"
          @click="onAdd"
        >
          <span class="text-lg leading-none">＋</span>
          Add New
        </button>
      </div>

      <!-- Table Card -->
      <div class="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-white">
              <tr class="border-b border-slate-200">
                <th class="px-6 py-4 text-left text-xs font-semibold tracking-widest text-slate-500">
                  MEMBER NO
                </th>
                <th class="px-6 py-4 text-left text-xs font-semibold tracking-widest text-slate-500">
                  MEMBER NAME
                </th>
                <th class="px-6 py-4 text-right text-xs font-semibold tracking-widest text-slate-500">
                  ACTIONS
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="row in rows"
                :key="row.member_no"
                :class="row.member_no === selectedId ? 'bg-blue-50/60' : 'bg-white'"
              >
                <td class="px-6 py-5">
                  <div
                    class="font-semibold"
                    :class="row.member_no === selectedId ? 'text-blue-700' : 'text-slate-900'"
                  >
                    {{ row.member_no }}
                  </div>
                </td>

                <td class="px-6 py-5">
                  <div class="flex items-center gap-3 text-sm text-slate-700">
                    <span class="font-medium">{{ row.member_name }}</span>
                  </div>
                </td>

                <td class="px-6 py-5">
                  <div class="flex items-center justify-end gap-2">
                    <!-- Delete -->
                    <button
                      type="button"
                      :disabled="deletingId === row.member_no"
                      class="grid h-10 w-10 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
                      @click="onDelete(row.member_no)"
                      aria-label="Remove"
                      title="Remove"
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

              <tr v-if="rows.length === 0">
                <td colspan="3" class="px-6 py-10 text-center text-sm text-slate-500">
                  No ELECOM users found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
          <div class="text-xs text-slate-500">
            Showing 1 to {{ rows.length }} of {{ total }} results
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
              disabled
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Overlay -->
    <Transition name="fade">
      <div
        v-if="drawerOpen"
        class="fixed inset-0 z-[60] bg-black/30"
        @click="closeDrawer"
      />
    </Transition>

    <!-- Drawer -->
    <Transition name="slide">
      <aside
        v-if="drawerOpen && editModel"
        class="fixed right-6 top-6 z-[70] w-full max-w-sm overflow-visible rounded-2xl border border-slate-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        @click.stop
      >
        <!-- Header -->
        <div class="px-6 pt-6">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="text-lg font-bold text-slate-900">Add ELECOM User</h2>
              <p class="mt-1 text-xs font-semibold tracking-widest text-slate-400 uppercase">
                NEW RECORD
              </p>
            </div>

            <button
              type="button"
              class="grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              @click="closeDrawer"
              aria-label="Close"
              title="Close"
            >
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="mt-6 border-t border-slate-200" />

        <!-- Body -->
        <div class="px-6 py-6 space-y-6">
          <!-- Autocomplete -->
          <div class="relative">
            <label class="block text-sm font-semibold text-slate-700">
              Search Member (No / Name)
            </label>

            <input
              v-model="editModel.query"
              type="text"
              placeholder="Type member no or name..."
              class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              @input="onQueryInput(editModel.query)"
              @focus="editModel.query.trim().length >= 2 && (showSug = true)"
              @blur="closeSuggestions"
            />

            <div v-if="searching" class="mt-2 text-xs text-slate-500">
              Searching...
            </div>

            <!-- Dropdown -->
            <div
              v-if="showSug && suggestions.length"
              class="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
            >
              <button
                v-for="m in suggestions"
                :key="m.member_no"
                type="button"
                class="w-full px-4 py-3 text-left hover:bg-slate-50"
                @mousedown.prevent="pickSuggestion(m)"
              >
                <div class="flex items-center justify-between">
                  <div class="font-semibold text-slate-900">{{ m.member_no }}</div>
                  <div class="text-xs text-slate-500">Select</div>
                </div>
                <div class="text-sm text-slate-600">{{ m.member_name }}</div>
              </button>
            </div>

            <!-- Empty results -->
            <div
              v-if="showSug && !searching && editModel.query.trim().length >= 2 && suggestions.length === 0"
              class="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-500 shadow-lg"
            >
              No members found.
            </div>

            <!-- Selected -->
            <div v-if="editModel.selected" class="mt-3">
              <span class="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                Selected: {{ editModel.selected.member_no }} — {{ editModel.selected.member_name }}
              </span>
            </div>
          </div>

          <div class="space-y-3 pt-2">
            <button
              type="button"
              class="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800"
              @click="saveChanges"
            >
              Save
            </button>

            <button
              type="button"
              class="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              @click="closeDrawer"
            >
              Cancel
            </button>
          </div>

          <div class="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <div class="flex gap-3">
              <div class="mt-0.5 grid h-8 w-8 place-items-center rounded-full bg-white text-blue-600 ring-1 ring-blue-200">
                <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                  <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-semibold text-blue-800">Information</p>
                <p class="mt-1 text-xs text-blue-700">
                  This updates the ELECOM user list used for online election access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import {
  fetchElecomUsers,
  addElecomUser,
  removeElecomUser
} from "@/services/election.sevice";
import { searchMember } from "@/services/member.service";

type ElecomUserRow = {
  member_no: string;
  member_name: string;
};

type MemberSuggestion = {
  member_no: string;
  member_name: string;
};

type AddModel = {
  query: string;
  selected: MemberSuggestion | null;
};

function createBlank(): AddModel {
  return { query: "", selected: null };
}

const authStore = useAuthStore();

const rows = ref<ElecomUserRow[]>([]);
const selectedId = ref<string | null>(null);

const drawerOpen = ref(false);
const editModel = ref<AddModel | null>(null);

const total = ref<number>(0);
const deletingId = ref<string | null>(null);

// autocomplete state
const suggestions = ref<MemberSuggestion[]>([]);
const showSug = ref(false);
const searching = ref(false);
let debounceTimer: number | null = null;

async function loadUsers() {
  try {
    const res = await fetchElecomUsers(authStore.accessToken);
    if (!res.data.success) {
      console.log(res.data.message);
      return;
    }
    rows.value = (res.data.members ?? []) as ElecomUserRow[];
    total.value = rows.value.length;
  } catch (err) {
    console.log(err);
  }
}

function onAdd() {
  editModel.value = createBlank();
  suggestions.value = [];
  showSug.value = false;
  drawerOpen.value = true;
}

function closeDrawer() {
  drawerOpen.value = false;
  editModel.value = null;
  showSug.value = false;
  suggestions.value = [];
}

function onQueryInput(val: string) {
  if (!editModel.value) return;

  // typing clears previous selection
  editModel.value.selected = null;

  if (debounceTimer) window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => runSearch(val), 250);
}

async function runSearch(q: string) {
  const term = q.trim();
  if (term.length < 2) {
    suggestions.value = [];
    showSug.value = false;
    return;
  }

  try {
    searching.value = true;
    const res = await searchMember(term, authStore.accessToken);
    if (!res.data.success) {
      suggestions.value = [];
      showSug.value = false;
      return;
    }

    suggestions.value = (res.data.members ?? []) as MemberSuggestion[];
    showSug.value = true;
  } catch (e) {
    console.log(e);
    suggestions.value = [];
    showSug.value = false;
  } finally {
    searching.value = false;
  }
}

function pickSuggestion(m: MemberSuggestion) {
  if (!editModel.value) return;
  editModel.value.selected = m;
  editModel.value.query = `${m.member_no} - ${m.member_name}`;
  showSug.value = false;
}

function closeSuggestions() {
  // allow click to register first
  window.setTimeout(() => (showSug.value = false), 120);
}

async function saveChanges() {
  if (!editModel.value) return;

  const memberNo = editModel.value.selected?.member_no;
  if (!memberNo) return console.log("Please select a member from the list.");

  const exists = rows.value.some(r => r.member_no === memberNo);
  if (exists) return console.log("Member already exists.");

  try {
    const res = await addElecomUser(memberNo, authStore.accessToken);
    if (!res.data.success) {
      console.log(res.data.message);
      return;
    }

    await loadUsers();
    closeDrawer();
  } catch (err) {
    console.log(err);
  }
}

async function onDelete(memberNo: string) {
  try {
    const ok = confirm("Remove this user from ELECOM access?");
    if (!ok) return;

    deletingId.value = memberNo;

    const res = await removeElecomUser(memberNo, authStore.accessToken);
    if (!res.data.success) {
      console.log(res.data.message);
      return;
    }

    rows.value = rows.value.filter(r => r.member_no !== memberNo);
    total.value = rows.value.length;
  } catch (err) {
    console.log(err);
  } finally {
    if (deletingId.value === memberNo) deletingId.value = null;
  }
}

// ESC to close
function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") closeDrawer();
}

onMounted(() => {
  loadUsers();
  window.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  if (debounceTimer) window.clearTimeout(debounceTimer);
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active, .slide-leave-active { transition: transform .22s ease, opacity .22s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(24px); opacity: 0; }
</style>