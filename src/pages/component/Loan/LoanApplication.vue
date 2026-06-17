<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getLoanTypes, getLoanApplicationType, getShareCapitalLoanLimit, sendOTPMessage, SaveLoanApplicationWithAttachements } from '@/services/loan.services'
import { useAuthStore } from '@/stores/auth'
import OTPView from './LoanOTP.vue'

// ---- Types ---------------------------------------------------------------

interface LoanType {
  loan_type: string
  loan_desc: string
}

interface LoanApplicationType {
  loan_purpose: string
  online_loan_limit: number
  term: string | number
  insType: string
  int_rate: number
}

// ---- Setup ---------------------------------------------------------------

const props = defineProps<{
  memberNo: string
}>()

const router = useRouter()
const authStore = useAuthStore()

const memberno = props.memberNo

// Loan detail fields
const loantype = ref<LoanType[]>([])
const selectedloantype = ref<string | null>(null)
const loanpurpose = ref('')
const loanamount = ref<string | number>('')
const selectedloanterm = ref<string | number | null>(null)
const installmentType = ref('')
const intRate = ref<number>(0)
const loanLimit = ref(0)
const loanitems = ref('')
const isOwnMoney = ref(false)

// Employment / spouse fields
const homeOwnership = ['Owned', 'Living w/ relatives', 'Company owned', 'Rented']
const homeType = ref('')
const homeAddress = ref('')
const position = ref('')
const yearsAtCompany = ref<string | number>(0)
const supervisor = ref('')
const companyTelNo = ref('')
const homTelNo = ref('')
const spouseName = ref('')
const spouseAddress = ref('')
const spouseEmployer = ref('')
const spouseTelNo = ref('')

// File uploads
const companyID = ref<File | null>(null)
const payslip = ref<File | null>(null)
const imageIDPreview = ref('')
const imagePayslipPreview = ref('')

// UI state
const loading = ref(false)
const afterloading = ref(true)
const errorbox = ref(false)
const errormessage = ref('')
const viewOTP = ref(false)
const memberMobileNo = ref('')
const expiredDate = ref<number | undefined>(undefined)

// Validation messages keyed by field
const fieldErrors = reactive<Record<string, string>>({})

// Shared input styling
const baseInput =
  'w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400'
const readonlyInput = `${baseInput} bg-gray-50 text-gray-600`

// ---- Validation ----------------------------------------------------------

function jpegOnlyRule(file: File | null): true | string {
  if (!file) return true
  return file.type === 'image/jpeg' ? true : 'Only JPG/JPEG files are allowed'
}

function validate(): boolean {
  Object.keys(fieldErrors).forEach((k) => delete fieldErrors[k])

  const required = (v: unknown) => v !== null && v !== undefined && v !== ''

  if (!required(selectedloantype.value)) fieldErrors.loanType = 'Required.'
  if (!required(loanpurpose.value)) fieldErrors.loanPurpose = 'Required.'
  if (!required(loanamount.value)) fieldErrors.loanAmount = 'Required.'
  if (!required(intRate.value)) fieldErrors.intRate = 'Required.'
  if (!required(selectedloanterm.value)) fieldErrors.term = 'Required.'
  if (!required(installmentType.value)) fieldErrors.installmentType = 'Required.'

  if (!companyID.value) {
    fieldErrors.companyID = 'Required.'
  } else {
    const r = jpegOnlyRule(companyID.value)
    if (r !== true) fieldErrors.companyID = r
  }

  if (!payslip.value) {
    fieldErrors.payslip = 'Required.'
  } else {
    const r = jpegOnlyRule(payslip.value)
    if (r !== true) fieldErrors.payslip = r
  }

  return Object.keys(fieldErrors).length === 0
}

// ---- Data loading --------------------------------------------------------

async function LoanTypes() {
  const result = await getLoanTypes(authStore.accessToken)
  console.log(result.data)
  if (result.status === 200 && result.data?.loanTypes) {
    console.log(result.data.loanTypes)
    loantype.value = result.data.loanTypes
  }
}

async function setLoan(loanType: string): Promise<LoanApplicationType | ''> {
  try {
    const response = await getLoanApplicationType(loanType, authStore.accessToken)
    if (response.data.success) {
      console.log(response.data.application)
      return response.data.application
    }
    alert(response.data.message)
    return ''
  } catch (error) {
    console.error(error)
    return ''
  }
}

async function ownMoneyLoanLimit(): Promise<number> {
  try {
    const result = await getShareCapitalLoanLimit(authStore.accessToken)
    if (result.data.success) {
      return result.data.loanLimit
    }
    errorbox.value = true
    errormessage.value = result.data.message
    return 0
  } catch (error) {
    console.error(error)
    return 0
  }
}

async function checkValidLoan() {
  if (!selectedloantype.value) return
  const loanApp = await setLoan(selectedloantype.value)
  if (!loanApp) return

  loanpurpose.value = loanApp.loan_purpose
  loanamount.value = loanApp.online_loan_limit
  selectedloanterm.value = loanApp.term
  installmentType.value = loanApp.insType
  intRate.value = loanApp.int_rate

  if (selectedloantype.value === '159-005') {
    isOwnMoney.value = true
    loanLimit.value = await ownMoneyLoanLimit()
  } else {
    isOwnMoney.value = false
    loanLimit.value = loanApp.online_loan_limit
  }
}

// ---- File handling -------------------------------------------------------

function readData(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(file)
  })
}

async function onIdChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0] ?? null
  companyID.value = file
  if (!file) {
    imageIDPreview.value = ''
    return
  }
  imageIDPreview.value = await readData(file)
}

async function onPayslipChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0] ?? null
  payslip.value = file
  if (!file) {
    imagePayslipPreview.value = ''
    return
  }
  imagePayslipPreview.value = await readData(file)
}

function renameFile(filename: string, name: string): string {
  const ext = filename.split('.').pop()
  return `${name}.${ext}`
}

// ---- Submission ----------------------------------------------------------

async function backToLoans() {
  await router.push({
      name: "LoanApplication"
  })
}

function closeOtpView(value: boolean) {
  viewOTP.value = value
}

async function loanApply() {
  try {
    if (!validate()) return

    memberMobileNo.value = authStore.member?.mobileNo || ''

    if (Number(loanamount.value) > loanLimit.value) {
      errorbox.value = true
      errormessage.value = 'Loan amount must not be greater than loan limit'
      return
    }
    if (Number(loanamount.value) < 1) {
      errorbox.value = true
      errormessage.value = 'Invalid loan amount!'
      return
    }

    // const checkOtp = await checkExpiredOTP(memberMobileNo.value, authStore.accessToken)


    // if (checkOtp.data.response.success) {
    //   expiredDate.value = Number(checkOtp.data.response.data)
    //   viewOTP.value = true
    // }
    const response = await sendOTPMessage(memberMobileNo.value, authStore.accessToken)
    if (response.data.success) {
      expiredDate.value = 300
      viewOTP.value = true
    } else {
      alert(response.data.message)
    }

  } catch (error) {
    console.error(error)
  }
}

async function loanApplyAfterOtp() {
  try {
    loading.value = true

    if (selectedloantype.value === null) {
      loading.value = false
      errorbox.value = true
      errormessage.value = 'Please select loan type'
      return
    }

    // Loan-type specific term/amount rules
    if (selectedloantype.value === '11711.4') {
      if (loanamount.value === '5000') {
        selectedloanterm.value = 10
        loanitems.value = 'N/A'
      } else if (loanamount.value === '8000' || loanamount.value === '10000') {
        selectedloanterm.value = 12
        loanitems.value = 'N/A'
      } else {
        selectedloanterm.value = null
      }
    } else if (selectedloantype.value === '11711.12') {
      selectedloanterm.value = 10
    } else if (selectedloantype.value === '11711.5') {
      if (parseFloat(String(loanamount.value)) < 500) {
        loading.value = false
        errorbox.value = true
        errormessage.value = 'Loan Amount must be 500 or more'
        return
      } else if (parseFloat(String(loanamount.value)) > 50000) {
        loading.value = false
        errorbox.value = true
        errormessage.value = 'Loan Amount must not be more than 50,000'
        return
      }
    }

    if (Number(loanamount.value) > loanLimit.value) {
      loading.value = false
      errorbox.value = true
      errormessage.value = `Loan Amount Limit is ${loanLimit.value}`
      return
    }

    if (loanamount.value === null || Number(loanamount.value) <= 0) {
      loading.value = false
      errorbox.value = true
      errormessage.value = 'Please select or enter loan amount!!'
      return
    }

    if (selectedloanterm.value === null) {
      loading.value = false
      errorbox.value = true
      errormessage.value = 'Please select loan term'
      return
    }

    const formData = new FormData()
    const data = {
      memberno,
      loan_type: selectedloantype.value,
      loanamount: loanamount.value,
      purpose: loanpurpose.value,
      term: selectedloanterm.value,
      intRate: intRate.value,
      loanitems: loanitems.value,
      homTelNo: homTelNo.value,
      companyTelNo: companyTelNo.value,
      yearsAtCompany: yearsAtCompany.value,
      supervisor: supervisor.value,
      position: position.value,
      spouseName: spouseName.value,
      spouseEmployer: spouseEmployer.value,
      spouseTelNo: spouseTelNo.value,
      spouseAddress: spouseAddress.value,
      homeType: homeType.value,
      homeAddress: homeAddress.value
    }

    formData.append('data', JSON.stringify(data))
    if (companyID.value) {
      formData.append(
        'documents',
        companyID.value,
        renameFile(companyID.value.name, `${memberno}-companyID`)
      )
    }
    if (payslip.value) {
      formData.append(
        'documents',
        payslip.value,
        renameFile(payslip.value.name, `${memberno}-payslip`)
      )
    }

    const response = await SaveLoanApplicationWithAttachements(formData, authStore.accessToken)
    if (response.data.success) {
      afterloading.value = false
      setTimeout(async () => {
        await router.push({
          name: "LoanApplication"
      })
      }, 3000)
    } else {
      loading.value = false
      console.log(response.data)
    }
  } catch (error) {
    console.error(error)
  }
}

onMounted(LoanTypes)
</script>

<template>
  <div class="mx-4 mt-8 grid grid-cols-12 gap-4">
    <div class="col-span-12 md:col-span-10 md:col-start-2">
      <!-- Application form -->
      <div v-if="!viewOTP" class="overflow-hidden rounded-lg bg-white shadow-md">
        <!-- Header -->
        <div class="mb-10 flex items-center justify-between bg-blue-400 px-6 py-4 text-white">
          <span class="text-xl font-bold md:text-2xl">Loan Application Form</span>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded border border-white/70 px-3 py-1.5 font-bold transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            @click="backToLoans"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            Back
          </button>
        </div>

        <div class="px-6 pb-8 md:px-12">
          <!-- Section intro -->
          <h2 class="text-xl font-bold text-gray-800">Loan Details</h2>
          <p class="text-sm" style="color: #7cb3ed">
            All fields marked with an asterisk (*) are required to be filled in.
          </p>

          <div
            v-if="errorbox"
            class="mt-5 rounded border-l-4 border-red-500 bg-red-50 px-4 py-3 text-red-700"
            role="alert"
          >
            {{ errormessage }}
          </div>

          <!-- Form -->
          <form class="mt-8 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2" @submit.prevent="loanApply">
            <!-- Loan Type -->
            <div>
              <label class="mb-2 block font-bold text-gray-700">
                Select Loan Type:<span class="ml-0.5 text-lg text-red-500">*</span>
              </label>
              <select :class="baseInput" v-model="selectedloantype" @change="checkValidLoan">
                <option :value="null" disabled>Select Loan Type</option>
                <option v-for="t in loantype" :key="t.loan_type" :value="t.loan_type">
                  {{ t.loan_desc }}
                </option>
              </select>
              <p v-if="fieldErrors.loanType" class="mt-1 text-xs text-red-500">{{ fieldErrors.loanType }}</p>
            </div>

            <!-- Loan Purpose -->
            <div>
              <label class="mb-2 block font-bold text-gray-700">
                Loan Purpose:<span class="ml-0.5 text-lg text-red-500">*</span>
              </label>
              <input :class="baseInput" v-model="loanpurpose" type="text" placeholder="Loan Purpose" />
              <p v-if="fieldErrors.loanPurpose" class="mt-1 text-xs text-red-500">{{ fieldErrors.loanPurpose }}</p>
            </div>

            <!-- Loan Amount -->
            <div>
              <label class="mb-2 block font-bold text-gray-700">
                Loan Amount:<span class="ml-0.5 text-lg text-red-500">*</span>
              </label>
              <input :class="baseInput" v-model="loanamount" type="number" placeholder="Loan Amount" />
              <p v-if="fieldErrors.loanAmount" class="mt-1 text-xs text-red-500">{{ fieldErrors.loanAmount }}</p>
            </div>

            <!-- Interest Rate (readonly) -->
            <div>
              <label class="mb-2 block font-bold text-gray-700">
                Interest Rate:<span class="ml-0.5 text-lg text-red-500">*</span>
              </label>
              <input :class="readonlyInput" v-model="intRate" type="text" readonly placeholder="Interest Rate" />
              <p v-if="fieldErrors.intRate" class="mt-1 text-xs text-red-500">{{ fieldErrors.intRate }}</p>
            </div>

            <!-- Term (readonly) -->
            <div>
              <label class="mb-2 block font-bold text-gray-700">
                Term:<span class="ml-0.5 text-lg text-red-500">*</span>
              </label>
              <input :class="readonlyInput" v-model="selectedloanterm" type="text" readonly placeholder="Loan Term" />
              <p v-if="fieldErrors.term" class="mt-1 text-xs text-red-500">{{ fieldErrors.term }}</p>
            </div>

            <!-- Installment Type (readonly) -->
            <div>
              <label class="mb-2 block font-bold text-gray-700">Installment Type:</label>
              <input
                :class="readonlyInput"
                v-model="installmentType"
                type="text"
                readonly
                placeholder="Installment Type"
              />
              <p v-if="fieldErrors.installmentType" class="mt-1 text-xs text-red-500">
                {{ fieldErrors.installmentType }}
              </p>
            </div>

            <!-- Home Ownership -->
            <div>
              <label class="mb-2 block font-bold text-gray-700">Home Ownership:</label>
              <select :class="baseInput" v-model="homeType">
                <option value="" disabled>Select Home Ownership</option>
                <option v-for="h in homeOwnership" :key="h" :value="h">{{ h }}</option>
              </select>
            </div>

            <!-- Home Address -->
            <div>
              <label class="mb-2 block font-bold text-gray-700">Home Address:</label>
              <textarea :class="baseInput" v-model="homeAddress" rows="1" placeholder="Home Address" />
            </div>

            <!-- Position -->
            <div>
              <label class="mb-2 block font-bold text-gray-700">Position/Rank in the company:</label>
              <input :class="baseInput" v-model="position" type="text" placeholder="Position/Rank" />
            </div>

            <!-- Years at company -->
            <div>
              <label class="mb-2 block font-bold text-gray-700"># of years in the company:</label>
              <input :class="baseInput" v-model="yearsAtCompany" type="text" placeholder="Years in the company" />
            </div>

            <!-- Supervisor -->
            <div>
              <label class="mb-2 block font-bold text-gray-700">Line Leader/Supervisor</label>
              <input :class="baseInput" v-model="supervisor" type="text" placeholder="Line Leader/Supervisor" />
            </div>

            <!-- Company Tel No -->
            <div>
              <label class="mb-2 block font-bold text-gray-700">Company Tel. No. (Local)</label>
              <input :class="baseInput" v-model="companyTelNo" type="text" placeholder="Company Tel. No." />
            </div>

            <!-- Spouse section -->
            <div class="md:col-span-2">
              <p class="text-center font-bold tracking-wide text-gray-700">SPOUSE</p>
            </div>

            <div>
              <label class="mb-2 block font-bold text-gray-700">Spouse:</label>
              <input :class="baseInput" v-model="spouseName" type="text" placeholder="Spouse Name" />
            </div>

            <div>
              <label class="mb-2 block font-bold text-gray-700">Spouse Address:</label>
              <textarea :class="baseInput" v-model="spouseAddress" rows="1" placeholder="Spouse Address" />
            </div>

            <div>
              <label class="mb-2 block font-bold text-gray-700">Employer's Name:</label>
              <input :class="baseInput" v-model="spouseEmployer" type="text" placeholder="Employer's Name" />
            </div>

            <div>
              <label class="mb-2 block font-bold text-gray-700">Tel No.:</label>
              <input :class="baseInput" v-model="spouseTelNo" type="text" placeholder="Tel No." />
            </div>

            <!-- Company ID upload -->
            <div>
              <label class="mb-2 block font-bold text-gray-700">
                Company ID picture<span class="ml-0.5 text-lg text-red-500">*</span>
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg"
                class="block w-full text-sm text-gray-600 file:mr-3 file:rounded file:border-0 file:bg-blue-400 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-blue-500"
                @change="onIdChange"
              />
              <p v-if="fieldErrors.companyID" class="mt-1 text-xs text-red-500">{{ fieldErrors.companyID }}</p>
              <img
                v-if="imageIDPreview"
                :src="imageIDPreview"
                alt="Company ID preview"
                class="mt-3 max-h-[450px] rounded border border-gray-200 object-contain"
              />
            </div>

            <!-- Payslip upload -->
            <div>
              <label class="mb-2 block font-bold text-gray-700">
                Payslip picture<span class="ml-0.5 text-lg text-red-500">*</span>
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg"
                class="block w-full text-sm text-gray-600 file:mr-3 file:rounded file:border-0 file:bg-blue-400 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-blue-500"
                @change="onPayslipChange"
              />
              <p v-if="fieldErrors.payslip" class="mt-1 text-xs text-red-500">{{ fieldErrors.payslip }}</p>
              <img
                v-if="imagePayslipPreview"
                :src="imagePayslipPreview"
                alt="Payslip preview"
                class="mt-3 max-h-[450px] rounded border border-gray-200 object-contain"
              />
            </div>

            <!-- Submit -->
            <div class="md:col-span-2 md:flex md:justify-end">
              <button
                type="submit"
                :disabled="loading"
                class="w-full rounded bg-blue-400 px-6 py-3 text-lg font-bold text-white shadow transition hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60 md:w-1/3"
              >
                Apply
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- OTP view -->
      <div v-else class="my-3 rounded-lg bg-white p-6 shadow-lg">
        <OTPView
          :mobile-no="memberMobileNo"
          :expired-date="expiredDate"
          :member-no="memberno"
          @close-view="closeOtpView"
          @success-otp="loanApplyAfterOtp"
        />
      </div>
    </div>

    <!-- Loading / success overlay -->
    <div
      v-if="loading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
    >
      <div v-if="afterloading" class="w-full max-w-lg rounded-lg bg-blue-400 px-6 py-8 text-white">
        <h3 class="mb-8 pt-2 text-center text-xl font-semibold">Saving...</h3>
        <div class="flex justify-center">
          <span
            class="inline-block h-20 w-20 animate-spin rounded-full border-8 border-white/40 border-t-white"
            aria-label="Loading"
          ></span>
        </div>
      </div>
      <div v-else class="w-full max-w-lg rounded-lg bg-green-400 px-6 py-10 text-white">
        <h2 class="pt-2 text-center text-2xl font-semibold">
          Thank you for applying, have a nice day!
        </h2>
      </div>
    </div>
  </div>
</template>
