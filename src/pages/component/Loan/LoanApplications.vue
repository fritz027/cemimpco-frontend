<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getLoanApplications , getMemberMobileNo} from '@/services/loan.services'
import { useAuthStore } from '@/stores/auth';

// ---- Types ---------------------------------------------------------------

interface Loan {
  loan_id: string | number
  apply_date: string | null
  loan_type: string
  applied_loan_amt: number
  loan_purpose: string
  term: string | number
  int_rate: number
  apprvd_loan_amt?: number
  appvd_date?: string | null
  reason_for_disapprove?: string
}

interface TableHeader {
  text: string
  value: keyof Loan
  align?: 'left' | 'center' | 'right'
  formatter?: (value: unknown) => string | null
}

interface ApiResponse<T> {
  status: number
  data: T
}

interface LoanListResponse {
  loans: never[];
  result?: Loan[]
}

type LoanStatus = 'Pending' | 'Approved' | 'Released' | 'Declined' | 'Cancelled'

// ---- Setup ---------------------------------------------------------------

const authStore = useAuthStore()
const router = useRouter()

const statuses: LoanStatus[] = ['Pending', 'Approved', 'Released', 'Declined', 'Cancelled']

const activeTab = ref<LoanStatus>('Pending')
const loans = ref<Loan[]>([])
const hasData = ref(false)
const dateDesc = ref('')

// Sorting + pagination state
const sortKey = ref<keyof Loan | null>(null)
const sortAsc = ref(true)
const page = ref(1)
const itemsPerPage = ref(10)
const perPageOptions = [10, 25, 50, 100]

// ---- Formatters ----------------------------------------------------------

const amountFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

const interestFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 7,
  maximumFractionDigits: 7
})

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: '2-digit',
  day: '2-digit',
  year: 'numeric'
})

const formatAmount = (value: unknown): string =>
  amountFormatter.format(Number(value) || 0)

const formatInterest = (value: unknown): string =>
  interestFormatter.format(Number(value) || 0)

const formatDate = (value: unknown): string | null => {
  if (!value) return null
  const date = new Date(value as string)
  return Number.isNaN(date.getTime()) ? null : dateFormatter.format(date)
}
// ---- Header definitions --------------------------------------------------

const baseColumns: TableHeader[] = [
  { text: 'Loan Id', value: 'loan_id', align: 'left' },
  { text: 'Application Date', value: 'apply_date', formatter: formatDate },
  { text: 'Loan Type', value: 'loan_type' },
  { text: 'Loan Amount', value: 'applied_loan_amt', align: 'right', formatter: formatAmount },
  { text: 'Loan Purpose', value: 'loan_purpose' },
  { text: 'Term', value: 'term' },
  { text: 'Interest Rate', value: 'int_rate', align: 'right', formatter: formatInterest }
]

const headers = computed<TableHeader[]>(() => {
  switch (activeTab.value) {
    case 'Pending':
      return baseColumns
    case 'Declined':
      return [
        ...baseColumns,
        { text: 'Reason for disapprove', value: 'reason_for_disapprove' }
      ]
    // Approved / Released / Cancelled
    default:
      return [
        ...baseColumns,
        { text: 'Approved Amount', value: 'apprvd_loan_amt', align: 'right', formatter: formatAmount },
        { text: dateDesc.value, value: 'appvd_date', formatter: formatDate }
      ]
  }
})

const emptyMessage = computed(
  () => `No ${activeTab.value.toLowerCase()} loan found.`
)

// ---- Data loading --------------------------------------------------------

const loaders: Record<LoanStatus, { fetch: () => Promise<ApiResponse<LoanListResponse>>; dateDesc: string }> = {
  Pending: { fetch: () => getLoanApplications('P', authStore.accessToken), dateDesc: '' },
  Approved: { fetch: () => getLoanApplications('A', authStore.accessToken), dateDesc: 'Approve Date' },
  Released: { fetch: () => getLoanApplications('R', authStore.accessToken), dateDesc: 'Approve Date' },
  Declined: { fetch: () => getLoanApplications('D', authStore.accessToken), dateDesc: 'Declined Date' },
  Cancelled: { fetch: () => getLoanApplications('C', authStore.accessToken), dateDesc: 'Cancelled Date' }
}

async function loadLoan(status: LoanStatus) {
  activeTab.value = status
  const loader = loaders[status]
  try {
    const response = await loader.fetch()
    console.log(response.data)
    if (response.status === 200) {
      const result: Loan[] = response.data.loans ?? []
      if (result.length > 0) {
        hasData.value = true
        dateDesc.value = loader.dateDesc
        loans.value = result
      } else {
        hasData.value = false
        loans.value = []
      }
    }
  } catch (error) {
    console.error(error)
    hasData.value = false
    loans.value = []
  }
}

// ---- Actions -------------------------------------------------------------

async function applyLoan() {
  try {
    const response = await getMemberMobileNo(authStore.accessToken)
    console.log(response.data)
    if (response.data.success) {
      router.push({ name: 'LoanApplicationForm', params: { memberNo: authStore.member?.memberNo } })
    } else {
      alert(response.data.message)
    }
  } catch (error) {
    alert('Please contact CEMIMPCO office to update your mobile no / Contact No. to proceed online loan application')
    console.error(error)
  }
}

function backToHome() {
  router.push({ name: 'Profile' })
}

// Helper for rendering a cell with its formatter
function cellValue(header: TableHeader, item: Loan) {
  const raw = item[header.value]
  return header.formatter ? header.formatter(raw) : raw
}

// ---- Sorting + pagination ------------------------------------------------

const sortedLoans = computed<Loan[]>(() => {
  if (!sortKey.value) return loans.value
  const key = sortKey.value
  const dir = sortAsc.value ? 1 : -1
  return [...loans.value].sort((a, b) => {
    const av = a[key]
    const bv = b[key]
    if (av == null) return 1
    if (bv == null) return -1
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
    return String(av).localeCompare(String(bv)) * dir
  })
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(sortedLoans.value.length / itemsPerPage.value))
)

const pagedLoans = computed<Loan[]>(() => {
  const start = (page.value - 1) * itemsPerPage.value
  return sortedLoans.value.slice(start, start + itemsPerPage.value)
})

const rangeStart = computed(() =>
  sortedLoans.value.length === 0 ? 0 : (page.value - 1) * itemsPerPage.value + 1
)
const rangeEnd = computed(() =>
  Math.min(page.value * itemsPerPage.value, sortedLoans.value.length)
)

function toggleSort(header: TableHeader) {
  if (sortKey.value === header.value) {
    sortAsc.value = !sortAsc.value
  } else {
    sortKey.value = header.value
    sortAsc.value = true
  }
  page.value = 1
}

function goToPage(p: number) {
  page.value = Math.min(Math.max(1, p), totalPages.value)
}

onMounted(() => loadLoan('Pending'))
</script>

<template>
  <div class="mx-4 mt-8">
    <!-- Action bar -->
    <div class="mb-5 flex items-center justify-between">
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded bg-blue-400 px-4 py-2.5 font-bold text-white shadow transition hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        @click="backToHome"
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Back
      </button>

      <button
        type="button"
        class="inline-flex items-center gap-2 rounded bg-blue-400 px-4 py-2.5 font-bold text-white shadow transition hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        @click="applyLoan"
      >
        Apply Loan
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 13h6M9 17h6M9 9h1M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            stroke-linecap="round" stroke-linejoin="round" />
          <path d="M14 2v6h6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200 bg-white">
      <nav class="-mb-px flex gap-2 overflow-x-auto" aria-label="Loan status">
        <button
          v-for="status in statuses"
          :key="status"
          type="button"
          class="whitespace-nowrap border-b-2 px-4 py-3 text-base font-bold uppercase tracking-wide transition focus:outline-none"
          :class="activeTab === status
            ? 'border-blue-400 text-blue-500'
            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'"
          @click="loadLoan(status)"
        >
          {{ status }}
        </button>
      </nav>
    </div>

    <!-- Content -->
    <div class=" bg-white p-4 shadow rounded">
      <!-- Empty state -->
      <div
        v-if="!hasData"
        class="flex flex-col items-center justify-center py-16 text-center text-gray-400"
      >
        <svg class="mb-3 h-16 w-16 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            stroke-linecap="round" stroke-linejoin="round" />
          <path d="M14 2v6h6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <p class="text-2xl font-light">{{ emptyMessage }}</p>
      </div>

      <!-- Data table -->
      <div v-else>
        <div class="overflow-x-auto rounded-t border border-gray-200 shadow-sm">
          <table class="min-w-full divide-y divide-gray-200 text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th
                  v-for="header in headers"
                  :key="header.value"
                  scope="col"
                  class="cursor-pointer select-none px-4 py-2 font-semibold text-gray-700 hover:bg-gray-100"
                  :class="header.align === 'right' ? 'text-right' : 'text-left'"
                  @click="toggleSort(header)"
                >
                  <span class="inline-flex items-center gap-1" :class="header.align === 'right' ? 'flex-row-reverse' : ''">
                    {{ header.text }}
                    <svg
                      class="h-3 w-3 transition"
                      :class="[
                        sortKey === header.value ? 'text-blue-500' : 'text-gray-300',
                        sortKey === header.value && !sortAsc ? 'rotate-180' : ''
                      ]"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
                    >
                      <path d="M18 15l-6-6-6 6" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr
                v-for="(item, index) in pagedLoans"
                :key="item.loan_id ?? index"
                class="hover:bg-blue-50/50"
              >
                <td
                  v-for="header in headers"
                  :key="header.value"
                  class="px-4 py-2 text-gray-700"
                  :class="header.align === 'right' ? 'text-right tabular-nums' : 'text-left'"
                >
                  {{ cellValue(header, item) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination footer -->
        <div
          class="flex flex-col items-center justify-between gap-3 rounded-b border border-t-0 border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 sm:flex-row"
        >
          <div class="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              v-model.number="itemsPerPage"
              class="rounded border border-gray-300 px-2 py-1 focus:border-blue-400 focus:outline-none"
              @change="page = 1"
            >
              <option v-for="opt in perPageOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>

          <div class="flex items-center gap-4">
            <span>{{ rangeStart }}–{{ rangeEnd }} of {{ sortedLoans.length }}</span>
            <div class="flex items-center gap-1">
              <button
                type="button"
                class="rounded p-1.5 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
                :disabled="page <= 1"
                aria-label="Previous page"
                @click="goToPage(page - 1)"
              >
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
              <span class="px-2">Page {{ page }} of {{ totalPages }}</span>
              <button
                type="button"
                class="rounded p-1.5 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
                :disabled="page >= totalPages"
                aria-label="Next page"
                @click="goToPage(page + 1)"
              >
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
