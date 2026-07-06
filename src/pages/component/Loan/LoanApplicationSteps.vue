<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount  } from 'vue'
import { useRouter } from 'vue-router'
import {
  getLoanTypes,
  getLoanApplicationType,
  getShareCapitalLoanLimit,
  sendOTPMessage,
  SaveLoanApplicationWithAttachements,
  getMemberCompanyId
} from '@/services/loan.services'

import { useAuthStore } from '@/stores/auth'
import OTPView from './LoanOTP.vue'
import { useSnackbar } from '../Snackbar/useSnackbar.ts'

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
interface LoanDetails {
  loanType: string
  loanPurpose: string
  loanAmount: number | null
  interestRate: number | null
  term: number | null            // in months
  installmentType: string
  items: string
}

interface FinancialInfo {
  sssPagibig: number | null
  healthInsurance: number | null
  cashAdvance: number | null
  netPay: number | null
  highestAvailment: number | null
  delinquencyHistory: string     // 'none' | 'minor' | 'major'
  overtime: number | null
  cemimpcoDeduction: number | null
  rank: string
  basicSalary: number | null
}

interface PersonalInfo {
  employeeName: string
  homeOwnership: string
  homeAddress: string
  position: string
  yearsInCompany: number | null
  lineLeader: string
  companyTelephone: string
  spouse: string
  spouseAddress: string
  telephoneNumber: string
}

interface LoanType {
  loan_type: string
  loan_desc: string
}

interface LoanApplicationType {
  loan_purpose: string
  online_loan_limit: number
  term: number | null
  insType: string
  int_rate: number
}

/* ------------------------------------------------------------------ */
/* Setup                                                               */
/* ------------------------------------------------------------------ */
const props = defineProps<{
  memberNo: string
}>()


/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */
const authStore = useAuthStore()
const router = useRouter()
const step = ref<number>(1)
const totalSteps = 3
const submitted = ref<boolean>(false)
const loanLimit = ref<number>(0)
const isOwnMoney = ref<boolean>(false)
const snackbar = useSnackbar()
const loanAmountError = ref<string>('')
const existingImage = ref('')
const hasExistingImage = computed(() => !!existingImage.value)
const idInputRef = ref<HTMLInputElement | null>(null)
const viewOTP = ref<boolean>(false)
const memberMobileNo = ref<string>('')
const expiredDate = ref<number | undefined>(undefined)
const memberNo = props.memberNo
const loading = ref<boolean>(false)
const afterLoading = ref<boolean>(true)
// const companyId = ref<File | null>(null)
// const imageIDPreview = ref('')


const loan = reactive<LoanDetails>({
  loanType: '',
  loanPurpose: '',
  loanAmount: null,
  interestRate: 1.5,
  term: null,
  installmentType: '',
  items: '',
})

const finance = reactive<FinancialInfo>({
  sssPagibig: null,
  healthInsurance: null,
  cashAdvance: null,
  netPay: null,
  highestAvailment: null,
  delinquencyHistory: '',
  overtime: null,
  cemimpcoDeduction: null,
  rank: '',
  basicSalary: null,
})

const personal = reactive<PersonalInfo>({
  employeeName: '',
  homeOwnership: '',
  homeAddress: '',
  position: '',
  yearsInCompany: null,
  lineLeader: '',
  companyTelephone: '',
  spouse: '',
  spouseAddress: '',
  telephoneNumber: '',
})

/* ID upload */
const idPreview = ref<string | null>(null)
const idFileName = ref<string>('')
const idError = ref<string>('')
const idFile = ref<File | null>(null)

function onIdSelected(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  idError.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) {
    idError.value = 'Please choose an image file (JPG or PNG).'
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    idError.value = 'File is too large. Keep it under 5 MB.'
    return
  }
  idFile.value = file
  idFileName.value = file.name
  const reader = new FileReader()
  reader.onload = () => { idPreview.value = reader.result as string }
  reader.readAsDataURL(file)
  target.value = ''
}

function removeId() {
  idPreview.value = null
  idFileName.value = ''
  idError.value = ''
  existingImage.value = ''
  idFile.value = null
}

/* ------------------------------------------------------------------ */
/* Options                                                             */
/* ------------------------------------------------------------------ */
const loanTypes = ref<LoanType[]>([])
const selectedLoanType = ref<string | null>(null);
const purposes = ['Home Improvement', 'Medical', 'Education', 'Business Capital', 'Debt Consolidation', 'Personal', 'Others']
const ranks = ['Rank & File', 'Senior Staff', 'Team Leader', 'Supervisor', 'Manager']
const delinquencyOptions = [
  { value: 'none', label: 'No history' },
  { value: 'minor', label: 'Minor (resolved)' },
  { value: 'major', label: 'Major' },
]
const ownershipOptions = ['Owned', 'Rented', 'Mortgaged', 'Living with relatives', 'Company-provided']

/* ------------------------------------------------------------------ */
/* Live amortization estimate (the signature element)                  */
/* ------------------------------------------------------------------ */
const peso = (n: number) =>
  '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const monthlyPayment = computed<number>(() => {
  const P = loan.loanAmount ?? 0
  const n = loan.term ?? 0
  const r = (loan.interestRate ?? 0) / 100
  if (P <= 0 || n <= 0) return 0
  if (r <= 0) return P / n
  // standard amortization: M = P r(1+r)^n / ((1+r)^n - 1)
  const factor = Math.pow(1 + r, n)
  return (P * r * factor) / (factor - 1)
})

const totalPayable = computed<number>(() => monthlyPayment.value * (loan.term ?? 0))
const totalInterest = computed<number>(() => totalPayable.value - (loan.loanAmount ?? 0))

const installmentLabel = computed<string>(() => {
  switch (loan.installmentType) {
    case 'Weekly': return 'per week (est.)'
    case 'Semi-monthly': return 'per cut-off (est.)'
    default: return 'per month (est.)'
  }
})

const displayInstallment = computed<number>(() => {
  const m = monthlyPayment.value
  if (loan.installmentType === 'Weekly') return m / 4.33
  if (loan.installmentType === 'Semi-monthly') return m / 2
  return m
})

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */
const errors = reactive<Record<string, boolean>>({})
const showErrors = ref<boolean>(false)

function validateStep(s: number): boolean {
  showErrors.value = true
  Object.keys(errors).forEach(k => delete errors[k])

  const required: Record<number, [string, unknown][]> = {
    1: [
      ['loanType', loan.loanType],
      ['loanPurpose', loan.loanPurpose],
      ['loanAmount', loan.loanAmount],
      ['interestRate', loan.interestRate],
      ['term', loan.term],
      ['installmentType', loan.installmentType],
    ],
    2: [
      ['netPay', finance.netPay],
      ['basicSalary', finance.basicSalary],
      ['rank', finance.rank],
      ['delinquencyHistory', finance.delinquencyHistory],
    ],
    3: [
      ['employeeName', personal.employeeName],
      ['homeOwnership', personal.homeOwnership],
      ['homeAddress', personal.homeAddress],
      ['position', personal.position],
      ['yearsInCompany', personal.yearsInCompany],
      ['telephoneNumber', personal.telephoneNumber],
    ],
  }

  let ok = true
  for (const [key, val] of required[s] ?? []) {
    const empty = val === '' || val === null || val === undefined
    if (empty) { errors[key] = true; ok = false }
  }

  // ID is satisfied by a new upload OR a previously saved ID
  if (s === 3 && !idPreview.value && !hasExistingImage.value) {
    errors['idPicture'] = true
    ok = false
  }
  return ok
}

function next() {
  if (validateStep(step.value)) {
    showErrors.value = false
    step.value = Math.min(step.value + 1, totalSteps)
    scrollTop()
  }
}
function back() {
  showErrors.value = false
  step.value = Math.max(step.value - 1, 1)
  scrollTop()
}
function goTo(s: number) {
  if (s < step.value) { step.value = s; scrollTop() }
}
function scrollTop() {
  window?.scrollTo({ top: 0, behavior: 'smooth' })
}

const submit = async () => {
  if (!validateStep(3)) return
  submitted.value = true
  try {
    memberMobileNo.value = authStore.member?.mobileNo || ''

    const Otp = await sendOTPMessage(memberMobileNo.value, authStore.accessToken)

    if (Otp.data.success) {
      expiredDate.value = 300
      viewOTP.value = true
      scrollTop()
    } else {
      snackbar.error(Otp.data.message,  { duration: 1500 })
    }
  } catch (error) {
    console.log(error)
  }
  // scrollTop()
  // payload ready for your API:
  // { ...loan, ...finance, ...personal, idPicture: idPreview.value }
}


const saveLoanApplication =  async () => {
  try {
    loading.value = true
    // Loan-type specific term/amount rules
    if (loan.loanAmount === null) {
      loading.value = false
      snackbar.info("Please check loan amount.")
      return
    }
    if (selectedLoanType.value === '11711.4') {
      if (loan.loanAmount === 5000) {
        loan.term = 10
        loan.items = 'N/A'
      } else if (loan.loanAmount >= 8000 && loan.loanAmount <= 10000)  {
        loan.term = 12
        loan.items = 'N/A'
      }
    } else if (selectedLoanType.value === '11711.12') {
      loan.term = 10
    } else if (selectedLoanType.value === '11711.5') {
      if (loan.loanAmount < 500) {
        loading.value = false
        snackbar.info('Minimum loan amount is ₱500.00')
        return
      } else if (loan.loanAmount > 50000) {
        loading.value = false
        snackbar.info('Maximum loan amount is ₱50,000')
      }
    }


    const formData = new FormData()
    formData.append('data', JSON.stringify({
      memberNo,
      loan,
      finance,
      personal
    }))
    if (idFile.value) {
      formData.append(
        'image',
        idFile.value
      )
    }
    const response = await SaveLoanApplicationWithAttachements(formData, authStore.accessToken)
    if (response.data.success) {
      afterLoading.value = false
      setTimeout(async() => {
        viewOTP.value = false
        loading.value = false
        resetForm()
        await closeApplication()
      }, 2500)
    } else {
      loading.value = false
      snackbar.error(response.data.message, { duration: 1500 })
    }
  } catch (error) {
    loading.value = false
    console.log(error)
    snackbar.error('Something went wrong while saving.', { duration: 1500 })
  }
}


function resetForm() {
  submitted.value = false
  step.value = 1
  removeId()
  scrollTop()
}

const stepLabels = ['Loan Details', 'Financial Info', 'Personal & Employment']
const fieldClass = (key: string) =>
  [
    'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm transition',
    'placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500',
    showErrors.value && errors[key] ? 'border-rose-400 ring-2 ring-rose-200' : 'border-slate-300',
  ].join(' ')


const triggerFilePicker = () => {
  idInputRef.value?.click()
}

//Fetch Loan application setup.

const LoanTypeSetup = async (loanType: string): Promise<LoanApplicationType | null> => {
  try {
    const response = await getLoanApplicationType(loanType, authStore.accessToken)
    if (response.data.success) {
      return response.data.application
    }
    alert(response.data.message)
    return null
  } catch (error) {
    console.log(error)
    return null
  }
}

//Check Share Capital for loan Limit
const ownMoneyLimit = async (): Promise<number> => {
  try {
    const response = await getShareCapitalLoanLimit(authStore.accessToken)
    if (response.data.success) {
      return response.data.loanLimit
    }
    snackbar.error(response.data.message,  { duration: 1500 })
    return 0
  } catch (error) {
    console.log(error);
    return 0
  }
}

const CheckSelectedLoanType = async () => {
  if (!selectedLoanType.value) return
  const loanType = await LoanTypeSetup(selectedLoanType.value)
  if (!loanType) return

  loan.term = loanType.term
  loan.installmentType = loanType.insType
  loan.interestRate = loanType.int_rate
  loan.loanType = selectedLoanType.value

  if (selectedLoanType.value === '159-005') {
    isOwnMoney.value = true
    loanLimit.value = await ownMoneyLimit()
  } else {
    isOwnMoney.value = false
    loanLimit.value = loanType.online_loan_limit
  }
}

const closeApplication = async () => {
  await router.push({
      name: "LoanApplication"
  })
}

const closeOtpView = (value: boolean) => {
  viewOTP.value = value
}

//check or validate loan limit
const checkLoanLimit = () => {
  const amount = loan.loanAmount ?? 0
    loanAmountError.value =
       amount > loanLimit.value
      ? `Amount exceeds your loan limit of ${peso(loanLimit.value)}.`
      : ''
}

const loadLoanType = async () => {
  try {
    const response = await getLoanTypes(authStore.accessToken)
    if (response.status === 200 && response.data?.loanTypes) {
      loanTypes.value = response.data.loanTypes
    }
  } catch (error) {
    console.error('Error loading loan types:', error)
  }
}

const loadExistingID = async () => {
  try {
    const response = await getMemberCompanyId(authStore.accessToken)
    existingImage.value = URL.createObjectURL(response.data)
  } catch (error) {
    console.log(error)
    existingImage.value = ''
  }
}


onMounted(() => {
  loadLoanType()
  loadExistingID()
})

onBeforeUnmount(() => {
  if (existingImage.value.startsWith('blob:')) {
    URL.revokeObjectURL(existingImage.value)
  }
})
</script>

<template>
  <div class="min-h-screen  font-sans text-slate-800">
    <div v-if="!viewOTP" class="m-5 mx-auto max-w-3xl px-8 py-8 sm:py-10 bg-slate-100">

      <!-- Header -->
        <header class="mb-6 flex items-center gap-3">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" class="h-6 w-6" stroke="currentColor" stroke-width="2">
              <path d="M7 4v16M7 4h5a3.5 3.5 0 0 1 0 7H7M4 8.5h8M4 11.5h8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 class="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">Loan Application</h1>
            <p class="text-xs text-slate-500 sm:text-sm">Complete all three steps to submit your request.</p>
          </div>

          <!-- Close button -->
          <button
            type="button"
            @click="closeApplication"
            aria-label="Close"
            class="ml-auto inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </header>

      <!-- Success screen -->
      <div v-if="submitted" class="rounded-2xl border border-blue-200 bg-white p-8 text-center shadow-sm">
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
          <svg viewBox="0 0 24 24" fill="none" class="h-7 w-7 text-blue-600" stroke="currentColor" stroke-width="2.5">
            <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2 class="text-xl font-bold text-slate-900">Application submitted</h2>
        <p class="mx-auto mt-2 max-w-md text-sm text-slate-500">
          Thanks, {{ personal.employeeName || 'applicant' }}. Your {{ loan.loanType || 'loan' }} request for
          <span class="font-semibold text-slate-700">{{ peso(loan.loanAmount ?? 0) }}</span>
          has been received and is now pending review.
        </p>
        <button
          @click="resetForm"
          class="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
          Start another application
        </button>
      </div>

      <template v-else>
        <!-- Stepper -->
        <nav class="mb-6">
          <ol class="flex items-center">
            <li v-for="(label, i) in stepLabels" :key="i" class="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                @click="goTo(i + 1)"
                :disabled="i + 1 >= step"
                class="flex items-center gap-2.5 text-left focus:outline-none disabled:cursor-default"
                :class="i + 1 < step ? 'cursor-pointer' : ''">
                <span
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition"
                  :class="[
                    step > i + 1 ? 'bg-blue-600 text-white' :
                    step === i + 1 ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                    'bg-white text-slate-400 ring-1 ring-slate-300'
                  ]">
                  <svg v-if="step > i + 1" viewBox="0 0 24 24" fill="none" c
                    lass="h-4 w-4" stroke="currentColor" stroke-width="3">
                    <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span v-else>{{ i + 1 }}</span>
                </span>
                <span class="hidden text-sm font-medium sm:block"
                  :class="step >= i + 1 ? 'text-slate-900' : 'text-slate-400'">{{ label }}</span>
              </button>
              <span v-if="i < stepLabels.length - 1"
                class="mx-2 h-0.5 flex-1 rounded transition sm:mx-3"
                :class="step > i + 1 ? 'bg-blue-500' : 'bg-slate-200'"></span>
            </li>
          </ol>
          <p class="mt-2 text-sm font-medium text-slate-500 sm:hidden">
            Step {{ step }} of {{ totalSteps }} — {{ stepLabels[step - 1] }}
          </p>
        </nav>

        <!-- Card -->
        <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="p-5 sm:p-7">

            <!-- ====================== STEP 1 ====================== -->
            <section v-show="step === 1">
              <h2 class="text-base font-bold text-slate-900">Loan details</h2>
              <p class="mb-5 text-sm text-slate-500">Tell us about the loan you'd like to apply for.</p>

              <div class="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Loan type <span class="text-rose-500">*</span></label>
                  <select v-model="selectedLoanType" :class="fieldClass('loanType')" @change="CheckSelectedLoanType" placeholder="Select loan type">
                    <option value="null" disabled>Select loan type</option>
                    <option v-for="t in loanTypes" :key="t.loan_type" :value="t.loan_type">{{ t.loan_desc }}</option>
                  </select>
                </div>

                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Loan purpose <span class="text-rose-500">*</span></label>
                  <select v-model="loan.loanPurpose" :class="fieldClass('loanPurpose')">
                    <option value="" disabled>Select purpose</option>
                    <option v-for="p in purposes" :key="p" :value="p">{{ p }}</option>
                  </select>
                </div>

                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Loan amount <span class="text-rose-500">*</span></label>
                  <div class="relative">
                    <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">₱</span>
                    <input
                      v-model.number="loan.loanAmount"
                      @input="checkLoanLimit"
                      type="number"
                      min="0"
                      :max="loanLimit"
                      placeholder="0.00"
                      :class="[fieldClass('loanAmount'), loanAmountError ? '!border-rose-400 !ring-2 !ring-rose-200' : '']"
                      class="!pl-7" />
                  </div>
                  <p v-if="loanAmountError" class="mt-1.5 text-xs text-rose-500">{{ loanAmountError }}</p>
                  <p v-else class="mt-1.5 text-xs text-slate-400">Loan limit: {{ peso(loanLimit) }}</p>
                </div>

                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Interest rate (% / mo) <span class="text-rose-500">*</span></label>
                  <input v-model.number="loan.interestRate" readonly type="number" step="0.01" min="0" placeholder="1.50"
                    :class="fieldClass('interestRate')" />
                </div>

                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Term <span class="text-rose-500">*</span></label>
                  <input v-model.number="loan.term" :class="fieldClass('term')" placeholder="Term" readonly/>
                </div>

                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Installment type <span class="text-rose-500">*</span></label>
                  <input v-model="loan.installmentType" :class="fieldClass('installmentType')" placeholder="Installment Type" readonly/>
                </div>
              </div>

              <!-- Live amortization estimate -->
              <div class="mt-6 overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50/70">
                <div class="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p class="text-xs font-medium uppercase tracking-wide text-emerald-700">Estimated installment</p>
                    <p class="text-2xl font-bold text-emerald-800">{{ peso(displayInstallment) }}</p>
                    <p class="text-xs text-emerald-600">{{ installmentLabel }}</p>
                  </div>

                  <div class="grid grid-cols-2 gap-4 text-right sm:gap-6">
                    <div>

                      <p class="text-xs text-slate-500">Total interest</p>
                      <p class="text-sm font-semibold text-slate-700">{{ peso(totalInterest > 0 ? totalInterest : 0) }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-slate-500">Total payable</p>
                      <p class="text-sm font-semibold text-slate-700">{{ peso(totalPayable) }}</p>
                    </div>
                  </div>
                </div>
                <p class="border-t border-emerald-200/70 bg-white/50 px-4 py-2 text-[11px] text-emerald-700">
                  Estimate only. Final terms are confirmed on approval.
                </p>
              </div>
            </section>

            <!-- ====================== STEP 2 ====================== -->
            <section v-show="step === 2">
              <h2 class="text-base font-bold text-slate-900">Financial information</h2>
              <p class="mb-5 text-sm text-slate-500">Payroll and deduction details used to assess your application.</p>

              <div class="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Basic salary <span class="text-rose-500">*</span></label>
                  <input v-model.number="finance.basicSalary" type="number" min="0" placeholder="0.00" :class="fieldClass('basicSalary')" />
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Net pay <span class="text-rose-500">*</span></label>
                  <input v-model.number="finance.netPay" type="number" min="0" placeholder="0.00" :class="fieldClass('netPay')" />
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">SSS / Pag-IBIG</label>
                  <input v-model.number="finance.sssPagibig" type="number" min="0" placeholder="0.00" :class="fieldClass('sssPagibig')" />
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Health insurance (PhilHealth)</label>
                  <input v-model.number="finance.healthInsurance" type="number" min="0" placeholder="0.00" :class="fieldClass('healthInsurance')" />
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Cash advance (CA)</label>
                  <input v-model.number="finance.cashAdvance" type="number" min="0" placeholder="0.00" :class="fieldClass('cashAdvance')" />
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Cemimpco deduction</label>
                  <input v-model.number="finance.cemimpcoDeduction" type="number" min="0" placeholder="0.00" :class="fieldClass('cemimpcoDeduction')" />
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Overtime</label>
                  <input v-model.number="finance.overtime" type="number" min="0" placeholder="0.00" :class="fieldClass('overtime')" />
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Highest availment</label>
                  <input v-model.number="finance.highestAvailment" type="number" min="0" placeholder="0.00" :class="fieldClass('highestAvailment')" />
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Rank <span class="text-rose-500">*</span></label>
                  <select v-model="finance.rank" :class="fieldClass('rank')">
                    <option value="" disabled>Select rank</option>
                    <option v-for="r in ranks" :key="r" :value="r">{{ r }}</option>
                  </select>
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">History of delinquency <span class="text-rose-500">*</span></label>
                  <select v-model="finance.delinquencyHistory" :class="fieldClass('delinquencyHistory')">
                    <option value="" disabled>Select</option>
                    <option v-for="d in delinquencyOptions" :key="d.value" :value="d.value">{{ d.label }}</option>
                  </select>
                </div>
              </div>
            </section>

            <!-- ====================== STEP 3 ====================== -->
            <section v-show="step === 3">
              <h2 class="text-base font-bold text-slate-900">Personal &amp; employment</h2>
              <p class="mb-5 text-sm text-slate-500">Your contact, household, and employment details.</p>

              <div class="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                <div class="sm:col-span-2">
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Employee's name <span class="text-rose-500">*</span></label>
                  <input v-model="personal.employeeName" type="text" placeholder="Full name" :class="fieldClass('employeeName')" />
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Home ownership <span class="text-rose-500">*</span></label>
                  <select v-model="personal.homeOwnership" :class="fieldClass('homeOwnership')">
                    <option value="" disabled>Select</option>
                    <option v-for="o in ownershipOptions" :key="o" :value="o">{{ o }}</option>
                  </select>
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Position / Rank <span class="text-rose-500">*</span></label>
                  <input v-model="personal.position" type="text" placeholder="e.g. Machine Operator" :class="fieldClass('position')" />
                </div>
                <div class="sm:col-span-2">
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Home address <span class="text-rose-500">*</span></label>
                  <input v-model="personal.homeAddress" type="text" placeholder="House no., street, barangay, city" :class="fieldClass('homeAddress')" />
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700"># Years in the company <span class="text-rose-500">*</span></label>
                  <input v-model.number="personal.yearsInCompany" type="number" min="0" placeholder="0" :class="fieldClass('yearsInCompany')" />
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Line leader / Supervisor</label>
                  <input v-model="personal.lineLeader" type="text" placeholder="Name" :class="fieldClass('lineLeader')" />
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Telephone number <span class="text-rose-500">*</span></label>
                  <input v-model="personal.telephoneNumber" type="tel" placeholder="09xx xxx xxxx" :class="fieldClass('telephoneNumber')" />
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Company telephone no.</label>
                  <input v-model="personal.companyTelephone" type="tel" placeholder="(032) xxx xxxx" :class="fieldClass('companyTelephone')" />
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Spouse</label>
                  <input v-model="personal.spouse" type="text" placeholder="Spouse's full name" :class="fieldClass('spouse')" />
                </div>
                <div class="sm:col-span-2">
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Spouse address</label>
                  <input v-model="personal.spouseAddress" type="text" placeholder="If different from home address" :class="fieldClass('spouseAddress')" />
                </div>
              </div>

              <!-- ID upload -->
              <div class="mt-6">
                <label class="mb-1.5 block text-sm font-medium text-slate-700">ID picture <span class="text-rose-500">*</span></label>

                <!-- Always-present hidden input, usable from either branch -->
                <input ref="idInputRef" type="file" accept="image/*" class="hidden" @change="onIdSelected" />

                <div v-if="!idPreview && !hasExistingImage"
                  class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition"
                  :class="showErrors && errors['idPicture'] ? 'border-rose-300 bg-rose-50/40' : 'border-slate-300 bg-slate-50'">
                  <svg viewBox="0 0 24 24" fill="none" class="mb-2 h-8 w-8 text-slate-400" stroke="currentColor" stroke-width="1.8">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" stroke-linecap="round"/>
                  </svg>
                  <p class="text-sm font-medium text-slate-600">Upload a valid ID</p>
                  <p class="mb-3 text-xs text-slate-400">JPG or PNG, up to 2 MB</p>
                  <button type="button" @click="triggerFilePicker"
                    class="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
                    Choose file
                  </button>
                </div>

                <div v-else class="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3">
                  <img :src="idPreview || existingImage" alt="ID preview" class="h-20 w-28 shrink-0 rounded-lg object-cover ring-1 ring-slate-200" />
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium text-slate-700">{{ idFileName || 'ID from your last application' }}</p>
                    <p class="text-xs text-blue-600">{{ idPreview ? 'Uploaded' : 'Using previous ID' }}</p>
                  </div>
                  <button @click="triggerFilePicker" type="button"
                    class="rounded-lg px-3 py-1.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50">
                    {{ idPreview ? 'Replace' : 'Replace' }}
                  </button>
                </div>

                <p v-if="idError" class="mt-1.5 text-xs text-rose-500">{{ idError }}</p>
              </div>
            </section>

            <!-- Global error hint -->
            <p v-if="showErrors && Object.keys(errors).length"
              class="mt-5 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
              Please complete the highlighted required fields.
            </p>
          </div>

          <!-- Footer / nav -->
          <div class="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-7">
            <button v-if="step > 1" @click="back" type="button"
              class="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300">
              Back
            </button>
            <span v-else></span>

            <button v-if="step < totalSteps" @click="next" type="button"
              class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
              Continue
            </button>
            <button v-else @click="submit" type="button"
              class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
              Submit application
            </button>
          </div>
        </div>

        <p class="mt-4 text-center text-xs text-slate-400">
          Your information is used only to process this loan application.
        </p>
      </template>
    </div>
    <!-- OTP view -->
    <div v-else class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <OTPView
        :mobile-no="memberMobileNo"
        :expired-date="expiredDate"
        :member-no="memberNo"
        @close-view="closeOtpView"
        @success-otp="saveLoanApplication"
      />
    </div>

    <!-- Loading / success overlay -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-200 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="loading"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
      >
        <!-- Saving state -->
        <div
          v-if="afterLoading"
          class="w-full max-w-sm rounded-2xl bg-white px-8 py-10 text-center shadow-2xl ring-1 ring-slate-100"
        >
          <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center">
            <span
              class="inline-block h-16 w-16 animate-spin rounded-full border-[6px] border-blue-100 border-t-blue-500"
              aria-label="Saving"
            ></span>
          </div>
          <h3 class="text-lg font-semibold text-slate-800">Saving your application</h3>
          <p class="mt-1.5 text-sm text-slate-500">Please wait a moment…</p>
        </div>

        <!-- Success state -->
        <div
          v-else
          class="w-full max-w-sm rounded-2xl bg-white px-8 py-10 text-center shadow-2xl ring-1 ring-slate-100"
        >
          <!-- Animated check badge -->
          <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500">
              <svg
                class="h-8 w-8 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
              >
                <path
                  class="check-path"
                  d="M20 6 9 17l-5-5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
          <h2 class="text-xl font-bold text-slate-800">Application submitted!</h2>
          <p class="mt-2 text-sm leading-relaxed text-slate-500">
            Thank you for applying. We'll be in touch soon — have a great day!
          </p>
        </div>
      </div>
    </transition>
  </div>
</template>
