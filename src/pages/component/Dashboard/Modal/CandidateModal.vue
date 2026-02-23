<template>
  <!-- Backdrop -->
  <div
    v-if="open"
    class="fixed inset-0 z-[80] bg-black/30"
    @click="handleCancel"
  />

  <!-- Modal -->
  <div v-if="open" class="fixed inset-0 z-[90] grid place-items-center p-4">
    <div
      class="w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4">
        <h2 class="text-lg font-bold text-slate-900">
          {{ mode === "edit" ? "Edit Candidate" : "Add New Candidate" }}
        </h2>

        <button class="text-slate-500 hover:text-slate-700" @click="handleCancel">
          ✕
        </button>
      </div>

      <div class="border-t border-slate-200" />

      <!-- Body -->
      <div class="grid gap-8 px-6 py-6 md:grid-cols-[200px_1fr]">
        <!-- Left: Avatar -->
        <div class="flex flex-col items-center gap-4">
          <div
            class="grid h-32 w-32 place-items-center overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-slate-50"
          >
            <img v-if="previewUrl" :src="previewUrl" class="h-full w-full object-cover" />
            <span v-else class="text-slate-400">Photo</span>
          </div>

          <input
            ref="fileInput"
            type="file"
            accept="image/png,image/jpeg"
            class="hidden"
            @change="onFileChange"
          />

          <button
            type="button"
            class="rounded-xl border px-4 py-2 text-xs font-semibold hover:bg-slate-50"
            @click="fileInput?.click()"
          >
            Change Photo
          </button>

          <p class="text-[11px] text-slate-400">JPG OR PNG, MAX 5MB</p>
          <p v-if="errors.photo" class="mt-1 text-xs text-red-600">
           {{ errors.photo }}
          </p>
        </div>

        <!-- Right: Form -->
        <div class="space-y-5">
          <!-- ✅ MEMBER SEARCH (new) -->
          <div class="relative">
            <label class="text-xs font-bold text-slate-500">SEARCH MEMBER (NO OR NAME)</label>

            <input
              v-model="searchText"
              :readonly="isEdit"
              class="mt-2 w-full rounded-xl border px-4 py-3 text-sm"
              placeholder="Type member no or name (e.g. 8821 or Juan)..."
              @focus="!isEdit && (showResults = members.length > 0)"
              @keydown.esc="showResults = false"
            />

            <p v-if="searching" class="mt-1 text-xs text-slate-400">Searching...</p>
            <p v-if="errors.memberNo" class="mt-1 text-xs text-red-600">
              {{ errors.memberNo }}
            </p>
            <!-- dropdown results -->
            <div
             v-if="showResults && !isEdit"
              class="absolute z-[120] mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
            >
              <button
                v-for="m in members"
                :key="m.member_no"
                type="button"
                class="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-slate-50"
                @click="selectMember(m)"
              >
                <div class="min-w-[90px] text-sm font-semibold text-slate-900">
                  {{ m.member_no }}
                </div>
                <div class="text-sm text-slate-700">
                  {{ m.member_name }}
                </div>
              </button>

              <div v-if="!searching && members.length === 0" class="px-4 py-3 text-sm text-slate-500">
                No results
              </div>
            </div>
          </div>

          <!-- FULL NAME (auto-filled or manual) -->
          <div>
            <label class="text-xs font-bold text-slate-500">FULL NAME</label>
            <input
              v-model="form.fullName"
              class="[
                'mt-2 w-full rounded-xl border px-4 py-3 text-sm',
                errors.fullName ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''
              ]"
              placeholder="e.g. Juan A. Dela Cruz"
            />
            <p v-if="errors.fullName" class="mt-1 text-xs text-red-600">
              {{ errors.fullName }}
            </p>
          </div>

          <div>
            <label class="text-xs font-bold text-slate-500">POSITION</label>
            <select
              v-model="form.position_id"
              class="mt-2 w-full rounded-xl border px-4 py-3 text-sm"
            >
              <option disabled value="">Select position</option>
              <option v-for="c in positions" :key="c.position_id" :value="c.position_id">
                {{ c.position_desc }} - {{ c.position }}
              </option>
            </select>
            <p v-if="errors.position_id" class="mt-1 text-xs text-red-600">
              {{ errors.position_id }}
            </p>
          </div>

          <div>
            <label class="text-xs font-bold text-slate-500">VISION STATEMENT</label>
            <textarea
              v-model="form.vision"
              rows="4"
              class="mt-2 w-full rounded-xl border px-4 py-3 text-sm"
              placeholder="Briefly describe your goals..."
            />
            <p v-if="errors.vision" class="mt-1 text-xs text-red-600">
              {{ errors.vision }}
            </p>
          </div>
        </div>
      </div>

      <div class="border-t border-slate-200" />

      <!-- Footer -->
      <div class="flex justify-end gap-3 px-6 py-4">
        <button class="rounded-xl border px-5 py-2 text-sm" @click="handleCancel">
          Cancel
        </button>

        <button
          class="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          @click="submit"
        >
          {{ mode === "edit" ? "Save Changes" : "Save Candidate" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, onBeforeUnmount, onMounted, computed } from "vue";
import { searchMember } from "@/services/member.service";
import { fetchPositions } from "@/services/election.sevice";
import { useAuthStore } from "@/stores/auth";

// ✅ adjust these types if your API uses different keys
type MemberRow = {
  member_no: string;
  member_name: string;
};

const authStore = useAuthStore();

export type Candidate = {
  id: string;
  fullName: string;
  memberNo: string;
  position_id: string;
  vision: string;
  position_desc: string;
  elect_order: number;
  photoUrl?: string;
};

export type Positions = {
  position_id: string;
  position_desc: string;
  position: number;
}
const props = defineProps<{
  open: boolean;
  mode: "add" | "edit";
  committees: string[];
  initial?: Candidate | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", payload: { candidate: Candidate; file?: File }): void;
}>();

const form = reactive<Candidate>({
  id: "",
  fullName: "",
  memberNo: "",
  position_id: "",
  position_desc: "",
  elect_order: 0,
  vision: "",
});

const fileInput = ref<HTMLInputElement | null>(null);
const previewUrl = ref<string>("");
const positions = ref<Positions[]>([]);
const isEdit = computed(() => props.mode === "edit");
type FormErrors = Partial<
  Record<"memberNo" | "fullName" | "position_id" | "vision" | "photo", string>
>;

const errors = ref<FormErrors>({});
// ✅ search state
const searchText = ref("");
const members = ref<MemberRow[]>([]);
const searching = ref(false);
const showResults = ref(false);
const selectedMember = ref<MemberRow | null>(null);
const token = authStore.accessToken;
const selectedFile = ref<File | undefined>();

let timer: number | null = null;

onMounted( async () => {
  try {
    const result = await fetchPositions(token);
    positions.value = result.data.positions
  } catch (error) {
    console.log(error);
  }
})

watch(
  () => [props.open, props.mode, props.initial] as const,
  ([open, mode, initial]) => {
    if (!open) return;

    // always hide dropdown when opening
    showResults.value = false;
    members.value = [];
    searching.value = false;

    if (mode === "edit" && initial) {
      // ✅ edit mode: show memberNo only, no searching
      Object.assign(form, initial);
      previewUrl.value = initial.photoUrl ?? "";

      searchText.value = initial.memberNo ?? "";
      selectedMember.value = initial.memberNo
        ? { member_no: initial.memberNo, member_name: initial.fullName ?? "" }
        : null;
    }

    if (mode === "add") {
      // ✅ add mode: reset fields (adjust if you don't want full reset)
      Object.assign(form, {
        id: "",
        fullName: "",
        memberNo: "",
        position_id: "",
        position_desc: "",
        vision: "",
      });

      previewUrl.value = "";
      searchText.value = "";
      selectedMember.value = null;
    }
  },
  { immediate: true }
);

watch(
  () => form.memberNo,
  () => clearError("memberNo")
);
watch(
  () => form.fullName,
  () => clearError("fullName")
);
watch(
  () => form.position_id,
  () => clearError("position_id")
);
watch(
  () => form.vision,
  () => clearError("vision")
);

// ✅ call API when typing (debounced)
watch(searchText, (q) => {

   if (isEdit.value) {
    showResults.value = false;
    members.value = [];
    return;
  }

  const value = (q ?? "").trim();

  // ✅ if this matches the selected display text, don't re-search
  if (
    selectedMember.value &&
    value === `${selectedMember.value.member_no}`
  ) {
    showResults.value = false;
    return;
  }

  if (value.length < 2) {
    members.value = [];
    showResults.value = false;
    selectedMember.value = null;
    return;
  }

  if (timer) window.clearTimeout(timer);

  timer = window.setTimeout(async () => {
    try {
      searching.value = true;
      const token = authStore.accessToken;

      const res = await searchMember(value, token);
      members.value = (res.data?.members ?? []) as MemberRow[];

      // ✅ only show if there are results
      showResults.value = members.value.length > 0;
    } catch (e) {
      members.value = [];
      showResults.value = false;
    } finally {
      searching.value = false;
    }
  }, 300);
});

function selectMember(m: MemberRow) {
  selectedMember.value = m; // ✅ lock selection

  form.memberNo = m.member_no;
  form.fullName = m.member_name;

  searchText.value = `${m.member_no}`;

  showResults.value = false;
  members.value = [];
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const okTypes = ["image/jpeg", "image/png"];

  // ❌ Invalid type
  if (!okTypes.includes(file.type)) {
    errors.value = {
      ...errors.value,
      photo: "Only JPG or PNG files are allowed.",
    };
    return;
  }

  // ❌ Too large (20MB)
  if (file.size > 5 * 1024 * 1024) {
    errors.value = {
      ...errors.value,
      photo: "Image must not exceed 5MB.",
    };
    return;
  }

  // ✅ Clear photo error if valid
  const next = { ...errors.value };
  delete next.photo;
  errors.value = next;

  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
}

function setError(key: keyof FormErrors, message: string) {
  errors.value = { ...errors.value, [key]: message };
}

function clearError(key: keyof FormErrors) {
  const next = { ...errors.value };
  delete next[key];
  errors.value = next;
}

function resetFormState() {
  errors.value = {};        // ✅ remove all validation errors
  selectedFile.value = undefined;
  members.value = [];
  showResults.value = false;
  searching.value = false;
}

function validateForm(): boolean {
  const e: FormErrors = {};

  // memberNo required (especially in add mode)
  if (!form.memberNo?.trim()) e.memberNo = "Please select a member.";

  // full name required
  const name = (form.fullName ?? "").trim();
  if (!name) e.fullName = "Full name is required.";
  else if (name.length < 3) e.fullName = "Full name must be at least 3 characters.";

  // position required
  if (!form.position_id?.trim()) e.position_id = "Please select a position.";

  // vision required (example constraints — adjust as you like)
  const vision = (form.vision ?? "").trim();
  if (!vision) e.vision = "Vision statement is required.";
  else if (vision.length < 10) e.vision = "Vision statement must be at least 10 characters.";
  else if (vision.length > 500) e.vision = "Vision statement must be 500 characters max.";

  errors.value = e;

  // focus first invalid field (optional)
  return Object.keys(e).length === 0;
}

function submit() {
  if (!validateForm()) return;
  emit("save", {
    candidate: { ...form },
    file: selectedFile.value,
  });
}
function handleCancel() {
  resetFormState();
  emit("close");
}

onBeforeUnmount(() => {
  if (timer) window.clearTimeout(timer);
});
</script>