<script setup lang="ts">
import { onMounted, ref, reactive, computed } from 'vue';
import { useRouter, isNavigationFailure, viewDepthKey } from "vue-router";
import { useAuthStore } from '@/stores/auth';
import { memberProfile, memberDeposits, memberLoans, memberTimeDeposits } from '@/services/member.service';
import { useElectionStore } from '@/stores/election';
import { CheckBadgeIcon, ArchiveBoxIcon } from '@heroicons/vue/24/solid'
import { memberVoted } from '@/services/election.sevice';
import { checkMemberSurvey } from '@/services/survey.services';

const authStore = useAuthStore();
const electionStore = useElectionStore();
const router = useRouter();
const isElection = ref(false);
const isSurvey = ref<boolean | null>(null);
const hasVoted = ref<boolean | null>(null);
const voteStatusLoading = ref(false); 
const surveyId = ref<string | null>(null) ;
const surveyTitle = ref('');

onMounted(async () => {
  try {
    isElection.value = electionStore.start;
    isSurvey.value = authStore.isSurvey;
    surveyId.value = authStore.getSurvey?.survey_id ?? "";
    surveyTitle.value = authStore.getSurvey?.survey_name ?? "";
    // run these in parallel (faster page load)
    await Promise.all([
      getMembersProfile(),
      getMemberTimeDeposits(),
      getMemberDeposits(),
      getMemberLoans(),
    ]);

    if (isElection.value) {
      await isMemberVoted();
    } else {
      hasVoted.value = null; // not needed if no election
    }

    setTimeout(() => {
      showCaption.value = false
    }, 10000)
  } catch (error) {
    console.log(error);
  }
});


const showSurveyModal = ref(false)

const filteredLoans = computed(() =>
  loans.value.filter(
    (loan) =>
      loan.balance > 0 && loan.loanAmount !== loan.balance
  )
);
type MemberProfile = {
  memberNo: string;
  memberName: string;
  email: string;
  contactNo: string;
  credit_limit: number;
  credit_availed: number;
};

type StoreCredit = {
  creditLimit: number;
  creditAvailed: number;
  creditBalance: number;
};

type MemberLoan = {
  loanID: string;
  description: string;
  loanDate: string;
  loanAmount: number;
  interest: number;
  payments: number;
  balance: number;
}

type Deposits = {
  description: string;
  depositType: string;
  balance: number;
};

const profile = reactive<MemberProfile>({
  memberNo: "",
  memberName: "",
  email: "",
  contactNo: "",
  credit_availed: 0,
  credit_limit: 0,
});

const storeCredit: StoreCredit = {
  creditLimit: 10000,
  creditAvailed: -115732.37,
  creditBalance: 125732.37,
};

const deposits = ref<Deposits[]>([]);

const loans = ref<MemberLoan[]>([]);
const showCaption = ref(true)

function money(n: number) {
  return new Intl.NumberFormat("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

async function openSurveyModal() {
  try {
    const id = surveyId.value
    if (!id) return;
    const res = await checkMemberSurvey(authStore.accessToken, id);

    if (!res.data.success) {
      console.log(res.data.message);
      return 
    }

    if (res.data.isDone) {
      alert("Done submmiting survey.");
      return 
    }

     await router.push({ name: 'SurveyPage',
      params: {
        memberNo: authStore.member?.memberNo,
        id: id
      },
  });
  } catch (error) {
    console.log(error);
  }
}

function closeSurveyModal() {
  showSurveyModal.value = false
}

async function isMemberVoted() {
  voteStatusLoading.value = true;
  hasVoted.value = null; // ✅ reset to unknown before request
  try {
    const result = await memberVoted(electionStore.year, authStore.accessToken);
    hasVoted.value = !!result.data.isVoted;
  } catch (error) {
    console.log(error);
    hasVoted.value = false; // or null if you prefer “hide button on error”
  } finally {
    voteStatusLoading.value = false;
  }
}

// actions
async function getMembersProfile() {
  try {
    
    const response = await memberProfile(authStore.accessToken);
    if (!response.data.success) {
      console.log(response.data.message);
      return;
    }
    const member = response.data.member;
    profile.memberNo = member.member_no;
    profile.contactNo = member.telno;
    profile.email = member.email;
    profile.memberName = member.member_name;
    profile.credit_availed = member.credit_availed;
    profile.credit_limit = member.credit_limit;


  } catch (error) {
    console.log(error);
  }
}

async function getMemberTimeDeposits () {
  try {
    const response = await memberTimeDeposits(authStore.accessToken);
    if (!response.data.status) {
      console.log(response.data.message);
      return;
    }

    // deposits.value = response.data.deposits;
  
  } catch (error) {
    console.log(error)
  }
}

async function getMemberDeposits () {
  try {
    const response = await memberDeposits(authStore.accessToken);
     if (!response.data.success) {
      console.log(response.data.message);
      return;
    }
    deposits.value = response.data.deposits;
  } catch (error) {
    console.log(error);
  }
}

async function getMemberLoans () {
  try {
    const response = await memberLoans(authStore.accessToken);
     if (!response.data.success) {
      console.log(response.data.message);
      return;
    }

    loans.value = response.data.loans as MemberLoan[];

  } catch (error) {
    console.log(error)
  }
}

function formatDate(s: string) {
  // handles "2025-12-17 16:41:00.2290" or ISO-ish strings
  const cleaned = s?.replace(" ", "T");
  const d = new Date(cleaned);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function viewDividend() {}
function loanApplication() {}
async function creditHistory () {

  try {
    await router.push({
      name: "CreditProfile"
    });

    console.log("Navigation complete");
  } catch (err) {
    if (isNavigationFailure(err)) {
      console.log("Navigation was cancelled");
    }
  }
}


async function Vote () {
   await router.push({ name: "BallotPage" });
}

async function VoteConfirmation() {
  await router.push({ name: "VoteConfirmation" });
}

async function loanLedger (loanId: string) {
  try {
    await router.push({
      name: "LoanProfile",
      params: { loanId }
    });

    console.log("Navigation complete");
  } catch (err) {
    if (isNavigationFailure(err)) {
      console.log("Navigation was cancelled");
    }
  }
}

async function viewDeposit (code: string){
  try {
    await router.push({
      name: "DepositProfile",
      params: { code }
    });

    console.log("Navigation complete");
  } catch (err) {
    if (isNavigationFailure(err)) {
      console.log("Navigation was cancelled");
    }
  }
}
</script>

<template>
  <!-- Page background (optional) -->
  <div class="min-h-screen">
    <div class="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      <div class="flex justify-center mt-8">
        <!-- ✅ While checking vote status, show placeholder (optional) -->
        <button
          v-if="isElection && (voteStatusLoading || hasVoted === null)"
          disabled
          class="w-full max-w-md h-12 rounded-xl bg-slate-200 text-slate-500 font-semibold tracking-wide shadow-md
                flex items-center justify-center gap-2 cursor-not-allowed"
        >
          Checking vote status...
        </button>

        <!-- Show VOTE only if election active AND user has NOT voted -->
        <button
          v-else-if="isElection && hasVoted === false"
          @click="Vote"
          class="w-full max-w-md h-12 rounded-xl bg-[#3FA3E8] text-white font-semibold tracking-wide shadow-md
                hover:bg-[#2f8fd2] active:scale-[0.99] transition flex items-center justify-center gap-2"
        >
          <ArchiveBoxIcon class="h-5 w-5" />
          VOTE
        </button>

        <!-- Show BALLOT if user already voted -->
        <button
          v-else-if="isElection && hasVoted === true"
          @click="VoteConfirmation"
          class="w-full max-w-md h-12 rounded-xl bg-[#3FA3E8] text-white font-semibold tracking-wide shadow-md
                hover:bg-[#2f8fd2] active:scale-[0.99] transition flex items-center justify-center gap-2"
        >
          <CheckBadgeIcon class="h-5 w-5" />
          BALLOT
        </button>
      </div>
      <!-- MEMBER PROFILE -->
      <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="bg-[#3FA3E8] px-4 sm:px-6 py-4">
          <h2 class="text-base sm:text-lg font-bold tracking-wide text-white">
            CEBU MITSUMI COOPERATIVE MEMBER PROFILE
          </h2>
        </div>

        <div class="p-4 sm:p-6 space-y-6">
          <!-- fields grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label class="block text-sm font-medium text-slate-600 mb-1">Member No.</label>
              <input
                :value="profile.memberNo"
                readonly
                class="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900
                       focus:outline-none focus:ring-2 focus:ring-[#3FA3E8]/40"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-600 mb-1">Member Name</label>
              <input
                :value="profile.memberName"
                readonly
                class="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900
                       focus:outline-none focus:ring-2 focus:ring-[#3FA3E8]/40"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-600 mb-1">Email Address</label>
              <input
                :value="profile.email"
                readonly
                class="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900
                       focus:outline-none focus:ring-2 focus:ring-[#3FA3E8]/40"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-600 mb-1">Contact No.</label>
              <input
                :value="profile.contactNo"
                readonly
                class="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900
                       focus:outline-none focus:ring-2 focus:ring-[#3FA3E8]/40"
              />
            </div>
          </div>

          <!-- buttons -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 pt-2">
            <button
              @click="viewDividend"
              class="h-12 rounded-xl bg-[#3FA3E8] text-white font-semibold tracking-wide shadow-sm
                     hover:bg-[#2f8fd2] active:scale-[0.99] transition"
            >
              VIEW DIVIDEND
            </button>

            <button
              @click="loanApplication"
              class="h-12 rounded-xl bg-[#3FA3E8] text-white font-semibold tracking-wide shadow-sm
                     hover:bg-[#2f8fd2] active:scale-[0.99] transition"
            >
              LOAN APPLICATION
            </button>
          </div>
        </div>
      </section>

      <!-- STORE CREDIT -->
      <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="bg-[#3FA3E8] px-4 sm:px-6 py-4 flex items-center justify-between">
          <h2 class="text-base sm:text-lg font-bold tracking-wide text-white">STORE CREDIT</h2>
        </div>

        <div class="p-4 sm:p-6">
          <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 items-end">
            <div>
              <label class="block text-sm font-medium text-slate-600 mb-1">Credit Limit</label>
              <input
                :value="money(profile.credit_limit)"
                readonly
                class="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-600 mb-1">Credit Availed</label>
              <input
                :value="money(profile.credit_availed)"
                readonly
                class="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-600 mb-1">Credit Balance</label>
              <input
                :value="money(profile.credit_limit - profile.credit_availed)"
                readonly
                class="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900"
              />
            </div>
            
            <button
              @click="creditHistory"
             class="h-12 w-full rounded-xl bg-[#3FA3E8] text-white font-semibold tracking-wide shadow-sm
                      hover:bg-[#2f8fd2] active:scale-[0.99] transition lg:hidden"
            >
              CREDIT HISTORY
            </button>

            <!-- On large screens, keep button aligned right -->
            <div class="hidden lg:flex justify-end">
              <button
                @click="creditHistory"
                class="h-12 rounded-xl bg-[#3FA3E8] px-6 text-white font-semibold tracking-wide shadow-sm
                       hover:bg-[#2f8fd2] active:scale-[0.99] transition"
              >
                CREDIT HISTORY
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- DEPOSITS -->
      <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="bg-[#3FA3E8] px-4 sm:px-6 py-4 flex items-center justify-between">
          <h2 class="text-base sm:text-lg font-bold tracking-wide text-white">DEPOSITS</h2>
        </div>

        
            
        <div class="p-4 sm:p-6 space-y-4">
          <article
            v-for="deposit in deposits"
            :key="deposit.depositType"
            class="group rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm
                  hover:shadow-md hover:border-slate-300 transition"
          >
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-end">
              <div class="lg:col-span-2">
                <label class="block text-sm font-medium text-slate-600 mb-1">{{deposit.description}}</label>
                <input
                  :value="money(deposit.balance)"
                  readonly
                  class="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900"
                />
              </div>

              <div class="hidden lg:flex justify-end">
                <button
                  @click="viewDeposit(deposit.depositType)"
                  class="h-12 rounded-xl bg-[#3FA3E8] px-6 text-white font-semibold tracking-wide shadow-sm
                        hover:bg-[#2f8fd2] active:scale-[0.99] transition"
                >
                  VIEW LEDGER
                </button>
              </div>

              <button
                @click="viewDeposit(deposit.depositType)"
                class="h-12 w-full rounded-xl bg-[#3FA3E8] text-white font-semibold tracking-wide shadow-sm
                      hover:bg-[#2f8fd2] active:scale-[0.99] transition lg:hidden"
              >
                VIEW LEDGER
              </button>
            </div>
        </article>
        </div>
      </section>
      <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <!-- Header -->
        <div class="flex items-center justify-between bg-[#3FA3E8] px-4 sm:px-6 py-4">
          <h2 class="text-base sm:text-lg font-bold tracking-wide text-white">
            LOANS
          </h2>

          <span class="text-xs sm:text-sm text-white/90">
            {{ loans.length }} item{{ loans.length === 1 ? "" : "s" }}
          </span>
        </div>

        <div class="p-4 sm:p-6">
          <!-- Empty state -->
          <div
            v-if="!loans.length"
            class="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-600"
          >
            No loans found.
          </div>

          <!-- List -->
          <div v-else class="space-y-4">
            <article
              v-for="loan in loans"
              :key="loan.loanID + loan.loanDate"
              class="group rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm
                    hover:shadow-md hover:border-slate-300 transition"
            >
              <!-- Top row -->
              <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <h3 class="truncate text-base sm:text-lg font-semibold text-slate-900">
                      {{ loan.description || loan.loanID }}
                    </h3>

                    <!-- Badge (optional) -->
                    <span
                      class="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
                    >
                      {{ loan.loanID }}
                    </span>
                  </div>

                  <p class="mt-1 text-sm text-slate-600">
                    {{ formatDate(loan.loanDate) }}
                  </p>
                </div>

                <!-- Right mini-summary -->
                <div class="flex gap-2 sm:justify-end">
                  <div class="rounded-xl bg-slate-50 px-3 py-2 text-right">
                    <div class="text-[11px] font-semibold text-slate-500">LOAN AMOUNT</div>
                    <div class="text-sm font-bold text-slate-900">{{ money(loan.loanAmount) }}</div>
                  </div>

                  <div class="rounded-xl bg-slate-50 px-3 py-2 text-right">
                    <div class="text-[11px] font-semibold text-slate-500">BALANCE</div>
                    <div class="text-sm font-bold text-slate-900">{{ money(loan.balance) }}</div>
                  </div>
                </div>
              </div>

              <!-- Bottom row (responsive stats) -->
              <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="rounded-xl border border-slate-200 p-3">
                  <div class="text-xs font-semibold text-slate-500">Loan Amount</div>
                  <div class="mt-1 text-lg font-bold text-slate-900">
                    {{ money(loan.loanAmount) }}
                  </div>
                </div>

                <div class="rounded-xl border border-slate-200 p-3">
                  <div class="text-xs font-semibold text-slate-500">Outstanding Balance</div>
                  <div class="mt-1 text-lg font-bold text-slate-900">
                    {{ money(loan.balance) }}
                  </div>
                </div>
              </div>

              <!-- Actions (optional) -->
              <div class="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
                <button
                  @click="loanLedger(loan.loanID)"
                  class="h-11 rounded-xl bg-[#3FA3E8] px-4 text-sm font-semibold text-white
                        hover:bg-[#2f8fd2] active:scale-[0.99] transition"
                >
                  Payment History
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  </div>
  <!-- SURVEY MODAL -->
  <div
    v-if="showSurveyModal"
    class="fixed inset-0 z-50 flex items-center justify-center"
  >
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-black/50 backdrop-blur-sm"
      @click="closeSurveyModal"
    ></div>

    <!-- Modal -->
    <div class="relative w-full max-w-xl rounded-2xl bg-white shadow-xl">
      <div class="border-b px-6 py-4 flex justify-between items-center">
        <h2 class="text-lg font-semibold text-slate-900">
          {{ surveyTitle }}
        </h2>
        <button
          @click="closeSurveyModal"
          class="text-slate-500 hover:text-slate-800 text-xl"
        >
          ✕
        </button>
      </div>

      <div class="px-6 py-5 space-y-4">
        <p class="text-sm text-slate-600">
          Start Survey
        </p>

        <button
          class="w-full h-12 rounded-xl bg-[#3FA3E8] text-white font-semibold
                hover:bg-[#2f8fd2] transition"
        >
          Start Survey
        </button>
      </div>
    </div>
  </div>
  <!-- FLOATING SURVEY BUTTON -->
  <div
    v-if="isSurvey"
    class="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2"
  >
    <!-- Caption (auto hide on mobile after few seconds) -->
    <div
      v-if="showCaption"
      class="bg-white shadow-lg rounded-xl px-4 py-2 text-sm font-semibold text-slate-700
            animate-fade-in max-w-[200px] text-right"
    >
      Take the Survey 👇
    </div>

    <!-- Button -->
    <button
      @click="openSurveyModal"
      class="relative h-14 w-14 rounded-full bg-[#3FA3E8] text-white shadow-xl
            hover:bg-[#2f8fd2] active:scale-95 transition
            flex items-center justify-center"
    >
      <span class="text-2xl animate-wave">👋</span>
    </button>
  </div>
</template>
<style scoped>
@keyframes wave {
  0% { transform: rotate(0deg); }
  15% { transform: rotate(15deg); }
  30% { transform: rotate(-10deg); }
  45% { transform: rotate(15deg); }
  60% { transform: rotate(-5deg); }
  75% { transform: rotate(10deg); }
  100% { transform: rotate(0deg); }
}

.animate-wave {
  display: inline-block;
  animation: wave 1.8s infinite;
  transform-origin: 70% 70%;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeInUp 0.6s ease-out;
}
</style>
