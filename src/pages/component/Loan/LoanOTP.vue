<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { verifyOTP, sendOTPMessage } from '@/services/loan.services'
import { useAuthStore } from '@/stores/auth'

// ---- Props / emits -------------------------------------------------------

const props = withDefaults(
  defineProps<{
    expiredDate?: number
    length?: number
  }>(),
  {
    expiredDate: 0,
    length: 6
  }
)

const emit = defineEmits<{
  (e: 'closeView', value: boolean): void
  (e: 'successOtp'): void
}>()

// ---- State ---------------------------------------------------------------

const authStore = useAuthStore()
const digits = ref<string[]>(Array(props.length).fill(''))
const inputs = ref<HTMLInputElement[]>([])

const loading = ref(false)
const snackbar = ref(false)
const snackbarColor = ref<'success' | 'error'>('success')
const message = ref('')
const reSendCountDown = ref(0)

let timer: ReturnType<typeof setInterval> | null = null
let snackbarTimer: ReturnType<typeof setTimeout> | null = null

const otp = computed(() => digits.value.join(''))

const formatCountDown = computed(() => {
  const m = Math.floor(reSendCountDown.value / 60)
  const s = reSendCountDown.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

// ---- Countdown -----------------------------------------------------------

function startCountdown(seconds: number) {
  if (timer) clearInterval(timer)
  reSendCountDown.value = seconds
  timer = setInterval(() => {
    reSendCountDown.value -= 1
    if (reSendCountDown.value <= 0 && timer) {
      clearInterval(timer)
      timer = null
    }
  }, 1000)
}

// ---- Snackbar ------------------------------------------------------------

function showSnackbar(color: 'success' | 'error', msg: string) {
  snackbarColor.value = color
  message.value = msg
  snackbar.value = true
  if (snackbarTimer) clearTimeout(snackbarTimer)
  snackbarTimer = setTimeout(() => (snackbar.value = false), 2000)
}

// ---- OTP input handling --------------------------------------------------

function setInputRef(el: Element | null, i: number) {
  if (el) inputs.value[i] = el as HTMLInputElement
}

function focusInput(i: number) {
  inputs.value[i]?.focus()
}

function onInput(i: number, e: Event) {
  const target = e.target as HTMLInputElement
  const val = target.value.replace(/\D/g, '')
  digits.value[i] = val.slice(-1)
  target.value = digits.value[i]
  if (digits.value[i] && i < props.length - 1) focusInput(i + 1)
  checkComplete()
}

function onKeydown(i: number, e: KeyboardEvent) {
  if (e.key === 'Backspace' && !digits.value[i] && i > 0) {
    focusInput(i - 1)
  }
}

function onPaste(e: ClipboardEvent) {
  e.preventDefault()
  const text = (e.clipboardData?.getData('text') ?? '')
    .replace(/\D/g, '')
    .slice(0, props.length)
  for (let i = 0; i < props.length; i++) digits.value[i] = text[i] ?? ''
  focusInput(Math.min(text.length, props.length - 1))
  checkComplete()
}

function checkComplete() {
  if (digits.value.every((d) => d !== '')) onFinish(otp.value)
}

// ---- Actions -------------------------------------------------------------

async function onFinish(rsp: string) {
  loading.value = true
  try {
    const response = await verifyOTP( authStore.member?.mobileNo ?? '', rsp, authStore.accessToken)

    if (response.data.success) {
      showSnackbar('success', response.data.message)
      setTimeout(() => {
        loading.value = false
        emit('successOtp')
      }, 1500)
    } else {
      loading.value = false
      showSnackbar('error', response.data.message)
    }
  } catch (error) {
    console.error(error)
    loading.value = false
  }
}

function closeOTPView() {
  emit('closeView', false)
}

async function reSendOtp() {
  try {
    const response = await sendOTPMessage(authStore.member?.mobileNo ?? '', authStore.accessToken)
    if (response.data.success) {
      startCountdown(300)
    } else {
      alert(response.data.message)
    }
  } catch (error) {
    console.error(error)
  }
}

const maskedMobile = computed(() => {
  const m = authStore.member?.mobileNo ?? ''
  if (m.length < 4) return 'your phone'
  return `${m.slice(0, 3)}••••${m.slice(-2)}`
})

// ---- Lifecycle -----------------------------------------------------------

onMounted(() => startCountdown(props.expiredDate))

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  if (snackbarTimer) clearTimeout(snackbarTimer)
})
</script>

<template>
  <div class="relative mx-auto w-full max-w-sm rounded-2xl bg-white p-6 sm:p-8 shadow-xl ring-1 ring-slate-100">
    <!-- Close button -->
    <button
      type="button"
      class="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
      aria-label="Close"
      @click="closeOTPView"
    >
      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <!-- Icon badge -->
    <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
      <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>

    <!-- Title + subtitle -->
    <div class="text-center">
      <h2 class="text-xl font-bold text-slate-800">Verify your number</h2>
      <p class="mt-1.5 text-sm text-slate-500">
        Enter the {{ length }}-digit code we sent to
        <span class="font-medium text-slate-700">
          {{ maskedMobile }}
        </span>
      </p>
    </div>

    <!-- OTP input + loading overlay -->
    <div class="relative mx-auto mt-7 w-full">
      <div class="flex justify-center gap-2 sm:gap-2.5">
        <input
          v-for="(digit, index) in digits"
          :key="index"
          :ref="(el) => setInputRef(el as Element | null, index)"
          :value="digit"
          type="text"
          inputmode="numeric"
          maxlength="1"
          :disabled="loading"
          class="h-14 w-11 sm:w-12 rounded-xl border-2 bg-slate-50 text-center text-2xl font-semibold text-slate-800 transition-all duration-150 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
          :class="digit ? 'border-blue-400 bg-white' : 'border-slate-200'"
          @input="onInput(index, $event)"
          @keydown="onKeydown(index, $event)"
          @paste="onPaste"
        />
      </div>

      <div
        v-if="loading"
        class="absolute inset-0 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm"
      >
        <span
          class="inline-block h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-500"
          aria-label="Verifying"
        ></span>
      </div>
    </div>

    <!-- Resend area -->
    <div class="mt-7 text-center text-sm">
      <p v-if="reSendCountDown > 0" class="text-slate-500">
        Didn't get the code? Resend in
        <strong class="font-semibold text-blue-600">{{ formatCountDown }}</strong>
      </p>
      <button
        v-else
        type="button"
        class="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 rounded"
        @click="reSendOtp"
      >
        Resend OTP
      </button>
    </div>

    <!-- Snackbar / toast -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      leave-active-class="transition duration-200 ease-in"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div
        v-if="snackbar"
        class="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg"
        :class="snackbarColor === 'success' ? 'bg-emerald-500' : 'bg-rose-500'"
        role="status"
      >
        <svg v-if="snackbarColor === 'success'" class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <svg v-else class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 8v4m0 4h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        {{ message }}
      </div>
    </transition>
  </div>
</template>
