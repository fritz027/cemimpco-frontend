<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Top bar -->
    <header class="border-b bg-white/80 backdrop-blur">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <div>
          <h1 class="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
            CEMIMPCO Credit Limit System
          </h1>
          <p class="mt-0.5 text-sm text-slate-500">Search a member and process credit availment.</p>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 active:scale-[0.99]"
          @click="logout"
          title="Logout"
        >
          <span class="i">⎋</span>
          Logout
        </button>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <!-- Card -->
      <div class="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div class="border-b border-slate-100 px-5 py-4 sm:px-6">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 class="text-base font-semibold text-slate-900">Member Lookup</h2>
              <p class="mt-1 text-sm text-slate-500">
                Enter a member number to load their credit details.
              </p>
            </div>

            <div class="w-full sm:max-w-xl">
              <div class="flex gap-2">
                <div class="relative w-full">
                  <label class="sr-only" for="memberNo">Search Member No.</label>
                  <input
                    ref="memberInput"
                    id="memberNo"
                    v-model.trim="memberNo"
                    type="text"
                    placeholder="Search Member No."
                    class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    @keyup.enter="searchMember"
                    :disabled="transactionDone"
                  />
                </div>

                <button
                  type="button"
                  class="inline-flex shrink-0 items-center justify-center rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="loading || !memberNo || transactionDone"
                  @click="searchMember"
                >
                  <span v-if="!loading">Search</span>
                  <span v-else>Searching…</span>
                </button>
              </div>

              <p class="mt-2 text-xs text-slate-500">
                Tip: press <span class="font-medium text-slate-700">Enter</span> to search.
              </p>
            </div>
          </div>
        </div>

        <!-- Alert -->
        <div v-if="alert.message" class="px-5 pt-5 sm:px-6">
          <div
            class="flex items-start gap-3 rounded-xl border p-4 text-sm"
            :class="
              alert.type === 'error'
                ? 'border-rose-200 bg-rose-50 text-rose-800'
                : 'border-emerald-200 bg-emerald-50 text-emerald-800'
            "
          >
            <div class="mt-0.5 text-base">
              <span v-if="alert.type === 'error'">⚠️</span>
              <span v-else>✅</span>
            </div>
            <div class="flex-1">
              <p class="font-semibold">
                {{ alert.type === "error" ? "Action needed" : "Success" }}
              </p>
              <p class="mt-0.5">{{ alert.message }}</p>
            </div>
            <button
              type="button"
              class="rounded-lg px-2 py-1 text-xs font-semibold hover:bg-black/5"
              @click="alert.message = ''"
            >
              Close
            </button>
          </div>
        </div>

        <!-- Result Panel (after successful submit) -->
        <div v-if="transactionDone" class="px-5 pt-5 sm:px-6">
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
            <p class="text-xs font-semibold text-slate-500">Transaction Saved</p>
            <div class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <p class="text-xs text-slate-500">Reference No.</p>
                <p class="text-base font-bold text-slate-900">{{ result.referenceNo }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-500">Total Availed</p>
                <p class="text-base font-bold text-slate-900">₱ {{ formatMoney(result.totalAvailed) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Form -->
        <form class="px-5 pb-6 pt-5 sm:px-6" @submit.prevent="submit">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <!-- Member Name -->
            <Field label="Member Name" :value="form.memberName" placeholder="—" readonly />

            <!-- Mobile No -->
            <Field label="Mobile No." :value="form.mobileNo" placeholder="—" readonly />

            <!-- Available Credit Limit -->
            <Field
              label="Available Credit Limit"
              :value="formatMoney(form.availableCreditLimit)"
              readonly
            />

            <!-- Credit Availed -->
            <Field label="Credit Availed" :value="formatMoney(form.creditAvailed)" readonly />

            <!-- Balance -->
            <Field label="Balance" :value="formatMoney(form.balance)" readonly />

            <!-- Amount to avail -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700">
                Amount to avail <span class="text-rose-600">*</span>
              </label>

              <div class="relative">
                <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                  ₱
                </span>
                <input
                  ref="amountToAvailInput"
                  v-model.number="form.amountToAvail"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  class="w-full rounded-xl border bg-white pl-9 pr-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:ring-4 disabled:bg-slate-50"
                  :class="
                    amountError
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                      : 'border-slate-200 focus:border-sky-500 focus:ring-sky-100'
                  "
                  :disabled="transactionDone"
                />
              </div>

              <p v-if="amountError && !transactionDone" class="mt-1.5 text-xs font-medium text-rose-600">
                {{ amountError }}
              </p>
              <p v-else-if="!transactionDone" class="mt-1.5 text-xs text-slate-500">
                Must not exceed available credit limit.
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <!-- When done: only show New Transaction -->
            <button
              v-if="transactionDone"
              type="button"
              class="inline-flex items-center justify-center rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-200"
              @click="newTransaction"
            >
              New Transaction
            </button>

            <!-- Normal mode: show Cancel + Save -->
            <template v-else>
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                @click="reset"
              >
                Cancel
              </button>

              <button
                type="submit"
                class="inline-flex items-center justify-center rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="submitting || !canSubmit"
              >
                <span v-if="!submitting">Save</span>
                <span v-else>Saving…</span>
              </button>
            </template>
          </div>
        </form>
      </div>

      <!-- Footer note -->
      <p class="mt-6 text-center text-xs text-slate-500">
        © {{ new Date().getFullYear() }} CEMIMPCO • Credit Limit System
      </p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted, defineComponent, h } from "vue";
import { getMembers, findMemberMemberNo, newCredit } from "@/services/credit.service";
import { creditLogout } from "@/services/auth.services";
import { useCreditStore } from "@/stores/credit";
import { useRouter } from "vue-router";

type Member = {
  member_no: string;
  member_name: string;
};

// ✅ Field component without runtime template compiler (uses render function)
const Field = defineComponent({
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Field",
  props: {
    label: { type: String, required: true },
    value: { type: [String, Number], default: "" },
    placeholder: { type: String, default: "—" },
    readonly: { type: Boolean, default: false },
  },
  setup(props) {
    return () =>
      h("div", [
        h("label", { class: "mb-1.5 block text-sm font-medium text-slate-700" }, props.label),
        h("input", {
          value: props.value ?? "",
          placeholder: props.placeholder,
          readOnly: props.readonly, // camelCase in render function
          class:
            "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400",
        }),
      ]);
  },
});

const router = useRouter();
const creditStore = useCreditStore();
const memberNo = ref("");
const loading = ref(false);
const submitting = ref(false);
const members = ref<Member[]>([]);
const memberInput = ref<HTMLInputElement | null>(null);
const amountToAvailInput = ref<HTMLInputElement | null>(null);

const transactionDone = ref(false);
const result = reactive({
  referenceNo: "",
  totalAvailed: 0,
});

onMounted(async () => {
  // If you want to load members on mount, uncomment:
  // await setMembers();
});

async function setMembers() {
  try {
    const res = await getMembers();
    if (!res.data.success) {
      console.log(res.data.message);
      return;
    }

    members.value = res.data.members.map((s: any) => ({
      member_no: s.member_no,
      member_name: s.member_name,
    }));
  } catch (error) {
    console.log(error);
  }
}

const alert = reactive<{ type: "error" | "success"; message: string }>({
  type: "error",
  message: "",
});

const form = reactive({
  memberName: "",
  mobileNo: "",
  availableCreditLimit: 0,
  creditAvailed: 0,
  balance: 0,
  amountToAvail: 0,
});

const amountError = computed(() => {
  if (transactionDone.value) return "";

  const amt = Number(form.amountToAvail || 0);
  if (!amt || amt <= 0) return "Please enter availed amount.";
  if (amt > Number(form.availableCreditLimit || 0)) return "Amount exceeds available credit limit.";
  return "";
});

const canSubmit = computed(() => {
  return !transactionDone.value && !!memberNo.value && !amountError.value && form.memberName.length > 0;
});

function formatMoney(v: number) {
  const n = Number(v || 0);
  return n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function searchMember() {
  if (transactionDone.value) return;

  alert.message = "";
  if (!memberNo.value) return;

  loading.value = true;
  try {
    const res = await findMemberMemberNo(memberNo.value);

    if (!res.data.success) {
      alert.type = "error";
      alert.message = res.data.message;
      return;
    }

    const member = res.data.member;

    form.memberName = member.member_name ?? "";
    form.mobileNo = member.sms_cpno ?? member.telno ?? "";

    form.availableCreditLimit = Number(member.credit_limit || 0);
    form.creditAvailed = Number(member.credit_availed || 0);
    form.balance = form.availableCreditLimit - form.creditAvailed;

    form.amountToAvail = 0;

    alert.type = "success";
    alert.message = "Member loaded successfully.";
    amountToAvailInput.value?.focus();
    setTimeout(() => {
      alert.message = "";
    }, 3000);
  } catch {
    alert.type = "error";
    alert.message = "Failed to load member details. Please try again.";
    setTimeout(() => {
      alert.message = "";
    }, 3000);
  } finally {
    loading.value = false;
  }
}

async function submit() {
  alert.message = "";
  if (transactionDone.value) return;

  if (!canSubmit.value) {
    alert.type = "error";
    alert.message = amountError.value || "Please complete required fields.";
    return;
  }

  submitting.value = true;
  try {
    // ✅ Likely correct: use searched memberNo, not mobile no
    const res = await newCredit({
      memberNo: memberNo.value,
      amount: form.amountToAvail,
    });

    if (!res.data.success) {
      alert.type = "error";
      alert.message = res.data.message;
      return;
    }

    result.referenceNo = res.data.referenceNo;
    result.totalAvailed = Number(res.data.totalAvailed || 0);

    transactionDone.value = true;

    alert.type = "success";
    alert.message = "Transaction saved successfully.";
  } catch {
    alert.type = "error";
    alert.message = "Submit failed. Please try again.";
  } finally {
    submitting.value = false;
  }
}

function reset() {
  alert.message = "";
  memberNo.value = "";
  form.memberName = "";
  form.mobileNo = "";
  form.availableCreditLimit = 0;
  form.creditAvailed = 0;
  form.balance = 0;
  form.amountToAvail = 0;

  result.referenceNo = "";
  result.totalAvailed = 0;
  transactionDone.value = false;

  memberInput.value?.focus();
}

function newTransaction() {
  alert.message = "";

  memberNo.value = "";
  form.memberName = "";
  form.mobileNo = "";
  form.availableCreditLimit = 0;
  form.creditAvailed = 0;
  form.balance = 0;
  form.amountToAvail = 0;

  result.referenceNo = "";
  result.totalAvailed = 0;

  transactionDone.value = false;

  requestAnimationFrame(() => {
    memberInput.value?.focus();
  });
}

async function logout() {
  try {
    await creditLogout();

    creditStore.logout();
  } catch (error) {
    console.log(error)
  }
}
</script>
