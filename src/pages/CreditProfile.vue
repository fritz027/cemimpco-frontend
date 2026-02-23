<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";
import { memberStoreCredit, memberProfile } from "@/services/member.service"; 
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const memberNo = authStore.getMember?.memberNo as string;
const memberName = authStore.getMember?.name as string;

type Credits = {
  amount: number;
  amount_paid: number;
  auth_refno: string;
  credit_limit: number;
  date_availed: string;
  running_balance: number;
  store_id: string;
};

type Member = {
  memberNo: string;
  memberName: string;
  email: string;
  contactNo: string;
  credit_limit: number;
  credit_availed: number;
};

const member = ref<Member>({
  memberNo: "",
  memberName: "",
  email: "",
  contactNo: "",
  credit_limit: 0,
  credit_availed: 0,
});


const rows = ref<Credits[]>([]);

onMounted( async () => {
  try {
    await fetchMemberStoreCredit();
    await fetchMemberProfile();
  } catch (error) {
    console.log(error)
  }
})

async function fetchMemberStoreCredit() {

  try {
    const response = await memberStoreCredit(memberNo, authStore.accessToken);
    if (!response.data.success){
      console.log(response.data.message);
      return;
    }

    rows.value = response.data.data;
    

  } catch (error) {
    console.log(error);
  }

}

async function fetchMemberProfile() {
  try {
    const response = await memberProfile(authStore.accessToken);
    if (!response.data.success) {
      console.log(response.data.message);
      return;
    }
    const mem = response.data.member;
    member.value.credit_availed = mem.credit_availed;
    member.value.credit_limit = mem.credit_limit

  } catch (error) {
    console.log(error);
  }
}

function money(n: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);
}

  function formatDate(s: string) {
  const cleaned = s?.replace(" ", "T");
  const d = new Date(cleaned);
  if (Number.isNaN(d.getTime())) return s;

  return d.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}
// const hasFines = computed(() =>
//   rows.value.some(r => (r.fines_payment ?? 0) !== 0)
// );

</script>

<template>
  <div class="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 py-6 space-y-6">
    <!-- Page Card -->
    <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <!-- Header Bar -->
      <div class="bg-[#3FA3E8] px-4 sm:px-6 py-4">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <h1 class="truncate text-base sm:text-lg font-bold tracking-wide text-white">
              STORE CREDIT HISTORY
            </h1>
          </div>

          <button
            type="button"
            @click="router.back()"
            class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white
                   ring-1 ring-white/25 hover:bg-white/25 transition"
            aria-label="Back"
            title="Back"
          >
            <!-- left arrow -->
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="p-4 sm:p-6 space-y-6">
        <!-- Member fields -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Member No.</label>
            <input
              :value="memberNo"
              readonly
              class="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Member Name</label>
            <input
              :value="memberName"
              readonly
              class="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4">
          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Credit Limit</div>
            <div class="mt-1 text-lg font-bold text-slate-900">{{ money(member.credit_limit) }}</div>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Credit Availed</div>
            <div class="mt-1 text-lg font-bold text-slate-900">{{ money(member.credit_availed) }}</div>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Balance</div>
            <div class="mt-1 text-lg font-bold text-slate-900">{{ money(member.credit_limit - member.credit_availed) }}</div>
          </div>
        </div>


        <!-- ✅ MOBILE: Card list -->
        <div class="md:hidden p-3 space-y-3 bg-white">
          <article
            v-for="(r, idx) in rows"
            :key="r.auth_refno + idx"
            class="rounded-2xl border border-slate-200 p-4 shadow-sm transition
                   odd:bg-white even:bg-blue-50/60 hover:bg-blue-100/60"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0"> 
                <div class="text-sm font-semibold text-slate-900 truncate">
                  {{ r.auth_refno }}
                </div>
                <div class="text-xs text-slate-600 mt-0.5">
                  {{ formatDate(r.date_availed) }}
                </div>
              </div>

              <div class="text-right">
                <div class="text-[11px] font-semibold text-slate-500">Balance</div>
                <div class="text-sm font-bold text-slate-900 tabular-nums">
                  {{ money(r.running_balance) }}
                </div>
              </div>
            </div>

            <div class="mt-4 grid grid-cols-2 gap-3">
              <div class="rounded-xl bg-slate-50 p-3">
                <div class="text-[11px] font-semibold text-slate-500">Credit</div>
                <div class="mt-1 text-sm font-bold text-slate-900 tabular-nums">
                  {{ money(r.amount) }}
                </div>
              </div>

              <div class="rounded-xl bg-slate-50 p-3">
                <div class="text-[11px] font-semibold text-slate-500">Payment</div>
                <div class="mt-1 text-sm font-bold text-slate-900 tabular-nums">
                  {{ money(r.amount_paid) }}
                </div>
              </div>

              <div class="mt-3 text-sm text-slate-700">
              <div class="font-medium text-slate-900 mb-1">Balance</div>
              <div class="text-slate-700 break-words">
                {{ r.running_balance }}
              </div>
            </div>
            </div>
          </article>
        </div>
       
        <!-- ✅ DESKTOP/TABLET: Table -->
        
        <div class="hidden md:block">
          <div class="w-full overflow-x-auto">
            <table class="min-w-[980px] w-full text-sm">
              <thead class="bg-white sticky top-0">
                <tr class="text-left text-slate-600">
                  <th class="px-4 py-3 font-semibold">Transaction Date</th>
                  <th class="px-4 py-3 font-semibold">Reference</th>
                  <th class="px-4 py-3 font-semibold text-right">Credit</th>
                  <th class="px-4 py-3 font-semibold text-right">Payment</th>
                  <th class="px-4 py-3 font-semibold text-right">Balance</th>
                </tr>
              </thead>

              <tbody class="divide-y divide-slate-200 bg-white">
                <tr v-for="(r, idx) in rows" :key="r.auth_refno + idx" class="transition odd:bg-white even:bg-blue-50 hover:bg-blue-100/70">
                  <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ formatDate(r.date_availed) }}</td>
                  <td class="px-4 py-3 whitespace-nowrap font-medium text-slate-900">{{ r.auth_refno }}</td>
                  <td class="px-4 py-3 text-right tabular-nums text-slate-700">{{ money(r.amount) }}</td>
                  <td class="px-4 py-3 text-right tabular-nums text-slate-700">{{ money(r.amount_paid) }}</td>
                  <td class="px-4 py-3 text-right tabular-nums font-semibold text-slate-900">{{ money(r.running_balance) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* line-clamp needs tailwind line-clamp plugin if not enabled.
   If you don't have it, remove line-clamp-* classes or enable @tailwindcss/line-clamp. */
</style>
