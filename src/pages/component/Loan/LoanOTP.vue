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

// ---- Lifecycle -----------------------------------------------------------

onMounted(() => startCountdown(props.expiredDate))

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  if (snackbarTimer) clearTimeout(snackbarTimer)
})
</script>

<template>
  <div class="relative">
    <!-- Close button -->
    <button
      type="button"
      class="absolute right-0 top-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white shadow transition hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
      aria-label="Close"
      @click="closeOTPView"
    >
      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <!-- Title -->
    <div class="my-2 text-center text-2xl font-bold text-gray-800">Enter OTP</div>

    <!-- OTP input + loading overlay -->
    <div class="relative mx-auto mt-5" style="max-width: 300px">
      <div class="flex justify-center gap-2">
        <input
          v-for="(digit, index) in digits"
          :key="index"
          :ref="(el) => setInputRef(el as Element | null, index)"
          :value="digit"
          type="text"
          inputmode="numeric"
          maxlength="1"
          :disabled="loading"
          class="h-12 w-10 rounded border border-gray-300 text-center text-xl font-semibold text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-100"
          @input="onInput(index, $event)"
          @keydown="onKeydown(index, $event)"
          @paste="onPaste"
        />
      </div>

      <div
        v-if="loading"
        class="absolute inset-0 flex items-center justify-center rounded bg-white/70"
      >
        <span
          class="inline-block h-9 w-9 animate-spin rounded-full border-4 border-blue-200 border-t-blue-400"
          aria-label="Verifying"
        ></span>
      </div>
    </div>

    <!-- Resend area -->
    <div class="mt-4 text-center">
      <p v-if="reSendCountDown > 0" class="text-gray-600">
        Please wait to resend OTP:
        <strong class="text-red-500">{{ formatCountDown }}</strong>
      </p>
      <button
        v-else
        type="button"
        class="mb-5 mt-3 rounded bg-blue-400 px-5 py-2.5 font-bold text-white shadow transition hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        @click="reSendOtp"
      >
        Re Send OTP
      </button>
    </div>

    <!-- Snackbar / toast -->
    <transition
      enter-active-class="transition duration-200"
      enter-from-class="translate-y-2 opacity-0"
      leave-active-class="transition duration-200"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div
        v-if="snackbar"
        class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded px-4 py-3 text-sm text-white shadow-lg"
        :class="snackbarColor === 'success' ? 'bg-blue-500' : 'bg-red-500'"
        role="status"
      >
        {{ message }}
      </div>
    </transition>
  </div>
</template>
