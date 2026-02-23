<template>
  <div class="min-h-screen w-full bg-slate-50">
    <div class="w-full p-6">
      <!-- Header -->
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-slate-900">Positions</h1>
          <p class="mt-2 max-w-2xl text-sm text-slate-500">
            Configure and manage roles available for the upcoming cooperative election cycle.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800"
          @click="onAdd"
        >
          <span class="text-lg leading-none">＋</span>
          Add New Position
        </button>
      </div>

      <!-- Table Card (full width now) -->
      <div class="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-white">
              <tr class="border-b border-slate-200">
                <th class="px-6 py-4 text-left text-xs font-semibold tracking-widest text-slate-500">
                  POSITION ID
                </th>
                <th class="px-6 py-4 text-left text-xs font-semibold tracking-widest text-slate-500">
                  POSITION NAME
                </th>
                <th class="px-6 py-4 text-left text-xs font-semibold tracking-widest text-slate-500">
                  MAX WINNERS
                </th>
                <th v-if="hide" class="px-6 py-4 text-left text-xs font-semibold tracking-widest text-slate-500">
                  COMMITTEE GROUP
                </th>
                <th class="px-6 py-4 text-right text-xs font-semibold tracking-widest text-slate-500">
                  ACTIONS
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="row in rows"
                :key="row.position_id"
                :class="row.position_id === selectedId ? 'bg-blue-50/60' : 'bg-white'"
              >
                <td class="px-6 py-5">
                  <div class="font-semibold" :class="row.position_id === selectedId ? 'text-blue-700' : 'text-slate-900'">
                    {{ row.position_id }}
                  </div>
                  <div v-if="row.position_id === selectedId" class="mt-1 text-[11px] font-semibold tracking-widest text-blue-600">
                    CURRENTLY EDITING
                  </div>
                </td>

                <td class="px-6 py-5">
                  <div class="flex items-center gap-3 text-sm text-slate-700">
                    <span class="font-medium">{{ row.position_desc }}</span>
                    <span
                      v-if="row.badge"
                      class="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700"
                    >
                      {{ row.badge }}
                    </span>
                  </div>
                </td>

                <td class="px-6 py-5">
                  <div class="flex items-center gap-3 text-sm text-slate-700">
                    <span class="font-medium">{{ row.position }}</span>
                    <span
                      v-if="row.badge"
                      class="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700"
                    >
                      {{ row.badge }}
                    </span>
                  </div>
                </td>

                <td v-if="hide" class="px-6 py-5">
                  <span class="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {{ row.group }}
                  </span>
                </td>

                <td class="px-6 py-5">
                  <div class="flex items-center justify-end gap-2">
                    <!-- Edit -->
                    <button
                      type="button"
                      class="grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                      :class="row.position_id === selectedId ? 'bg-blue-200/60 text-blue-700 hover:bg-blue-200' : ''"
                      @click="openEdit(row)"
                      aria-label="Edit"
                      title="Edit"
                    >
                      <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                      </svg>
                    </button>

                    <!-- Delete -->
                    <button
                      type="button"
                      :disabled="deletingId === row.position_id"
                      class="grid h-10 w-10 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      @click="onDelete(row.position_id)"
                      aria-label="Delete"
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

              <tr v-if="rows.length === 0">
                <td colspan="4" class="px-6 py-10 text-center text-sm text-slate-500">
                  No positions found.
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
            <button class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50" disabled>
              Previous
            </button>
            <button class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= Floating Drawer ================= -->
    <Transition name="fade">
      <div
        v-if="drawerOpen"
        class="fixed inset-0 z-[60] bg-black/30"
        @click="closeDrawer"
      />
    </Transition>

    <Transition name="slide">
      <aside
        v-if="drawerOpen && editModel"
        class="fixed right-6 top-6 z-[70] w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        @click.stop
      >
        <!-- Header -->
        <div class="px-6 pt-6">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="text-lg font-bold text-slate-900">{{ isNew ? "Add New Position" : "Edit Position" }}</h2>
              <p class="mt-1 text-xs font-semibold tracking-widest text-slate-400 uppercase">
                {{ isNew ? "NEW RECORD" : editModel.position_desc }}
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
          <div>
            <label class="block text-sm font-semibold text-slate-700">
              Position ID
            </label>

            <input
              v-model="editModel.position_id"
              type="text"
              maxlength="10"
              placeholder="Enter ID (max 10 chars)"
              class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              :disabled="!isNew"
            />

            <p class="mt-1 text-xs text-slate-500">
              Unique identifier (maximum 10 characters).
            </p>
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700">Position Name</label>
            <input
              v-model="editModel.position_desc"
              type="text"
              class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div v-if="hide">
            <label class="block text-sm font-semibold text-slate-700">Committee Group</label>
            <div class="relative mt-2">
              <select
                v-model="editModel.group"
                class="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="Executive Committee">Executive Committee</option>
                <option value="Oversight">Oversight</option>
                <option value="Regional Council">Regional Council</option>
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

          <div>
            <div class="flex items-center justify-between">
              <label class="block text-sm font-semibold text-slate-700">Number of Winners</label>
              <span class="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                MAX SEATS
              </span>
            </div>

            <div class="mt-2 grid grid-cols-[48px_1fr_48px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <button
                type="button"
                class="grid place-items-center text-slate-500 hover:bg-slate-50 active:bg-slate-100"
                @click="editModel.position = Math.max(1, editModel.position - 1)"
              >
                <span class="text-xl leading-none">−</span>
              </button>

              <div class="grid place-items-center border-x border-slate-200 text-sm font-semibold text-slate-900">
                {{ editModel.position }}
              </div>

              <button
                type="button"
                class="grid place-items-center text-slate-500 hover:bg-slate-50 active:bg-slate-100"
                @click="editModel.position = Math.min(99, editModel.position + 1)"
              >
                <span class="text-xl leading-none">+</span>
              </button>
            </div>

            <p class="mt-2 text-xs text-slate-500 italic">
              Determines how many candidates will be elected for this specific role.
            </p>
          </div>

          <div class="space-y-3 pt-2">
            <button
              type="button"
              class="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800"
              @click="saveChanges"
            >
              Save Changes
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
                  Changes made to active roles will be updated across all ongoing election ballots immediately.
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
import { fetchPositions,newPosition,updatePosition, deletePosition } from "@/services/election.sevice";

type PositionRow = {
  position_id: string;
  position_desc: string;
  position: number;
  badge?: string;
  group?: string;
};

function createBlankPosition(): PositionRow {
  return {
    position_id: "",          // empty means "new"
    position_desc: "",
    position: 1,
  };
}

const authStore = useAuthStore();

const rows = ref<PositionRow[]>([]);
const selectedId = ref<string | null>(null);
const drawerOpen = ref(false);
const editModel = ref<PositionRow | null>(null);
const total = ref<number>(0);
const isNew = ref(false);
const deletingId = ref<string | null>(null);
const hide = ref(false);
const originalId = ref<string | null>(null);

async function loadPositions() {
  try {
    const response = await fetchPositions(authStore.accessToken);
    if (!response.data.success) {
      console.log(response.data.message);
      return;
    }

    // ✅ set ref correctly
    rows.value = response.data.positions as PositionRow[];
    total.value = rows.value.length;
  } catch (error) {
    console.log(error);
  }
}

function openEdit(row: PositionRow) {
  isNew.value = false;
  originalId.value = row.position_id;   // ✅ keep original
  selectedId.value = row.position_id;
  editModel.value = { ...row };
  drawerOpen.value = true;
}

function closeDrawer() {
  drawerOpen.value = false;
  selectedId.value = null;
  editModel.value = null;
  isNew.value = false;
  originalId.value = null;
}

async function saveChanges() {
  if (!editModel.value) return;

  const pid = editModel.value.position_id.trim();
  const desc = editModel.value.position_desc.trim();

  if (!pid) return console.log("Position ID is required");
  if (pid.length > 10) return console.log("Position ID must be max 10 characters");
  if (!desc) return console.log("Position Name is required");

  if (isNew.value) {
    const exists = rows.value.some(r => r.position_id === pid);
    if (exists) return console.log("Position ID already exists");

    const response = await newPosition(
      { position_id: pid, position_desc: desc, position: editModel.value.position },
      authStore.accessToken
    );

    if (!response.data.success) {
      console.log(response.data.message);
      return;
    }

    const created: PositionRow =
      response.data.position ?? response.data.data ?? { ...editModel.value, position_id: pid, position_desc: desc };

    rows.value = [created, ...rows.value];
  } else {
    const response = await updatePosition(
      {
        position_id: editModel.value.position_id, // ✅ same ID
        position_desc: desc,
        position: editModel.value.position,
      },
      authStore.accessToken
    );

    if (!response.data.success) {
      console.log(response.data.message);
      return;
    }

    rows.value = rows.value.map(r =>
      r.position_id === editModel.value!.position_id
        ? { ...editModel.value!, position_desc: desc }
        : r
    );
  }

  total.value = rows.value.length;
  closeDrawer();
}

async function onDelete(position_id: string) {
  try {
    const ok = confirm("Delete this position? This cannot be undone.");
    if (!ok) return;

    deletingId.value = position_id;

    const response = await deletePosition(position_id, authStore.accessToken);

    if (!response.data.success) {
      console.log(response.data.message);
      return;
    }

    // update local list
    rows.value = rows.value.filter((r) => r.position_id !== position_id);
    total.value = rows.value.length;

    // close drawer if it was open for this item
    if (selectedId.value === position_id) closeDrawer();
  } catch (error) {
    console.log(error);
  } finally {
    if (deletingId.value === position_id) deletingId.value = null;
  }
}

function onAdd() {
  isNew.value = true;
  selectedId.value = null;
  editModel.value = createBlankPosition();
  drawerOpen.value = true;
}

// ESC to close
function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") closeDrawer();
}

onMounted(() => {
  loadPositions();
  window.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active, .slide-leave-active { transition: transform .22s ease, opacity .22s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(24px); opacity: 0; }
</style>
