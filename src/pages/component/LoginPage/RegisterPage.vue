<template>
  <section class="relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
    <!-- Loading overlay -->
    <div
      v-if="props.isLoading"
      class="absolute inset-0 z-10 grid place-items-center rounded-2xl bg-white/80"
    >
      <div class="flex items-center gap-3">
        <div class="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"></div>
        <p class="text-sm font-semibold text-slate-700">Registering...</p>
      </div>
    </div>
    <h4 class="text-2xl font-extrabold text-slate-900">Member registration</h4>
    <p class="mt-1 text-sm text-slate-500">
      Please input your details.
    </p>
    <form class="w-full max-w-md space-y-4" @submit.prevent="handleRegister">
      <!-- Top errors -->
      <div
        v-if="props.errorMessage"
        class="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm"
      >
        {{ props.errorMessage }}
      </div>

      <div
        v-if="formError"
        class="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm"
      >
        {{ formError }}
      </div>
      <!-- Success message -->
      <div
        v-if="props.successMessage"
        class="rounded-lg bg-green-50 border border-green-200 text-green-700 px-4 py-2 text-sm mt-3"
      >
        {{ props.successMessage }}
      </div>

      <!-- Member No -->
      <div>
        <label class="text-xs font-semibold text-slate-600">Member No</label>
        <input
          v-model.trim="memberNo"
          type="text"
          inputmode="numeric"
          placeholder="Member No"
          class="mt-1 w-full rounded-xl border bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none
                focus:ring-4"
          :class="memberNoError
            ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
            : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'"
          @input="onMemberNoInput"
        />
        <p v-if="memberNoError" class="mt-1 text-xs text-red-600">{{ memberNoError }}</p>
      </div>

      <!-- First/Last name -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="text-xs font-semibold text-slate-600">First Name</label>
          <input
            v-model.trim="firstName"
            type="text"
            placeholder="First Name"
            class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none
                  focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div>
          <label class="text-xs font-semibold text-slate-600">Last Name</label>
          <input
            v-model.trim="lastName"
            type="text"
            placeholder="Last Name"
            class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none
                  focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>
      </div>

      <!-- Birthdate -->
      <div>
        <label class="text-xs font-semibold text-slate-600">Birthday date</label>
        <input
          v-model="birthDate"
          type="date"
          class="mt-1 w-full rounded-xl border bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none focus:ring-4"
          :class="dobError
            ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
            : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'"
          @change="onDOBInput"
        />
        <p v-if="dobError" class="mt-1 text-xs text-red-600">{{ dobError }}</p>
      </div>

      <!-- Email -->
      <div>
        <label class="text-xs font-semibold text-slate-600">E-mail</label>
        <input
          v-model.trim="emailAddress"
          type="email"
          placeholder="Email"
          class="mt-1 w-full rounded-xl border bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none
                focus:ring-4"
          :class="emailError
            ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
            : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'"
          @input="onEmailInput"
        />
        <p v-if="emailError" class="mt-1 text-xs text-red-600">{{ emailError }}</p>
      </div>

      <!-- Confirm Email -->
      <div>
        <label class="text-xs font-semibold text-slate-600">Confirm E-mail</label>
        <input
          v-model.trim="confirmEmailAddress"
          type="email"
          placeholder="Confirm Email"
          class="mt-1 w-full rounded-xl border bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none
                focus:ring-4"
          :class="confirmEmailError
            ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
            : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'"
        />
        <p v-if="confirmEmailError" class="mt-1 text-xs text-red-600">{{ confirmEmailError }}</p>
      </div>

      <!-- TIN -->
      <div>
        <label class="text-xs font-semibold text-slate-600">TIN</label>
        <input
          :value="tin"
          @input="onTinInput"
          type="text"
          inputmode="numeric"
          maxlength="11"
          placeholder="000-000-000"
          class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none
                focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
        <p v-if="tinError" class="mt-1 text-xs text-red-600">{{ tinError }}</p>
      </div>

      <!-- Password -->
      <div>
        <label class="text-xs font-semibold text-slate-600">Password</label>
        <div class="relative mt-1">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Password"
            class="w-full rounded-xl border bg-white px-4 py-2.5 pr-11 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none
                  focus:ring-4"
            :class="passwordError
              ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
              : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'"
          />
          <button
            type="button"
            class="absolute inset-y-0 right-2 my-auto grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-50"
            @click="showPassword = !showPassword"
            aria-label="Toggle password"
          >
            <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 3l18 18" />
              <path d="M10.6 10.6a3 3 0 104.24 4.24" />
              <path d="M9.88 5.1A10.94 10.94 0 0112 5c7 0 10 7 10 7a18.5 18.5 0 01-3.2 4.5" />
              <path d="M6.1 6.1A18.5 18.5 0 002 12s3 7 10 7c1.1 0 2.1-.2 3.1-.5" />
            </svg>
          </button>
        </div>
        <p v-if="passwordError" class="mt-1 text-xs text-red-600">{{ passwordError }}</p>
      </div>

      <!-- Confirm Password -->
      <div>
        <label class="text-xs font-semibold text-slate-600">Confirm Password</label>
        <div class="relative mt-1">
          <input
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="Confirm Password"
            class="w-full rounded-xl border bg-white px-4 py-2.5 pr-11 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none
                  focus:ring-4"
            :class="confirmPasswordError
              ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
              : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'"
          />
          <button
            type="button"
            class="absolute inset-y-0 right-2 my-auto grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-50"
            @click="showConfirmPassword = !showConfirmPassword"
            aria-label="Toggle confirm password"
          >
            <svg v-if="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 3l18 18" />
              <path d="M10.6 10.6a3 3 0 104.24 4.24" />
              <path d="M9.88 5.1A10.94 10.94 0 0112 5c7 0 10 7 10 7a18.5 18.5 0 01-3.2 4.5" />
              <path d="M6.1 6.1A18.5 18.5 0 002 12s3 7 10 7c1.1 0 2.1-.2 3.1-.5" />
            </svg>
          </button>
        </div>
        <p v-if="confirmPasswordError" class="mt-1 text-xs text-red-600">{{ confirmPasswordError }}</p>
      </div>

      <!-- Separator + Actions -->
      <div class="mt-6 border-t border-slate-200 pt-5">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">

          <button
            type="button"
            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm
                  hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
            @click="emit('toggle-form')"
          >
            Back
          </button>
          <button
            type="submit"
            :disabled="props.isLoading || !canSubmit"
            class="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm
                  hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200
                  disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span v-if="props.isLoading">REGISTERING...</span>
            <span v-else>REGISTER</span>
          </button>
        </div>
      </div>
    </form>
  </section>
</template>
<script setup lang="ts">
import debounce from "lodash.debounce";
import { ref, computed, watch, onMounted,nextTick } from "vue";
import { verifyEmail, verifyMemberNo, verifyTIN, verifyDOB } from '@/services/auth.services';

const props = defineProps<{
  errorMessage: string | null;
  successMessage?: string | null;
  isLoading: boolean;
}>();

const emit = defineEmits<{
  (e: "toggle-form"): void;
  (e: "clear-error"): void;
  (e: "submit-register", payload: {
    memberNo: string;
    memberFirstName: string;
    memberLastName: string;
    dateOfBirth: string;
    email: string;
    tin: string;
    password: string;
    confirmPassword: string;
  }): void;
}>();

// form fields
const memberNo = ref("");
const firstName = ref("");
const lastName = ref("");
const emailAddress = ref("");
const confirmEmailAddress = ref("");
const birthDate = ref(""); // YYYY-MM-DD
const tin = ref("");
const password = ref("");
const confirmPassword = ref("");

const showPassword = ref(false);
const showConfirmPassword = ref(false);

// errors
const memberNoError = ref("");
const dobError = ref("");
const emailError = ref("");
const tinError = ref("");
const formError = ref("");

// clear server errors on open
onMounted(() => emit("clear-error"));



// clear server errors while typing
watch(
  [memberNo, firstName, lastName, emailAddress, confirmEmailAddress, birthDate, tin, password, confirmPassword],
  () => {
    if (props.errorMessage) emit("clear-error");
    formError.value = "";
  }
);

// ---------- API wrappers (keep these if you want naming consistency) ----------
const api = {
  memberNo: (no: string) => verifyMemberNo(no),
  dob: (no: string, dob: string) => verifyDOB(no, dob),
  email: (no: string, email: string) => verifyEmail(no, email),
  tin: (no: string, tin: string) => verifyTIN(no, tin)
};

// ---------- helpers ----------
const getErrorMessage = (err: any, fallback = "Server error") =>
  err?.response?.data?.message || err?.message || fallback;

type DebouncedValidatorOptions<T> = {
  delay?: number;
  shouldRun?: (value: T) => boolean;          // if false -> clears error (optional)
  validate?: (value: T) => string | null;     // return error msg (sync) OR null
  run: (value: T) => Promise<any>;            // must return axios-like response
  onErrorRef: { value: string };              // ref for error string
  okMessageFallback?: string;
  failMessageFallback?: string;
};

function createDebouncedValidator<T>({
  delay = 500,
  shouldRun = () => true,
  validate,
  run,
  onErrorRef,
  failMessageFallback = "Invalid value"
}: DebouncedValidatorOptions<T>) {
  const exec = debounce(async (value: T) => {
    // sync validation first
    if (validate) {
      const msg = validate(value);
      if (msg) {
        onErrorRef.value = msg;
        return;
      }
    }

    // if we shouldn't run -> clear error
    if (!shouldRun(value)) {
      onErrorRef.value = "";
      return;
    }

    try {
      const res = await run(value);
      onErrorRef.value = res?.data?.success
        ? ""
        : (res?.data?.message || failMessageFallback);
    } catch (err: any) {
      onErrorRef.value = getErrorMessage(err);
    }
  }, delay);

  return exec;
}

// ---------- Member No ----------
const validateMemberNo = createDebouncedValidator<string>({
  run: (no) => api.memberNo(no),
  shouldRun: (no) => !!no && no.length >= 8,
  onErrorRef: memberNoError,
  failMessageFallback: "Member not found"
});

function onMemberNoInput() {
  validateMemberNo(memberNo.value);
}

// ---------- DOB ----------
const validateDOB = createDebouncedValidator<string>({
  run: (dob) => api.dob(memberNo.value.trim(), dob),
  validate: (dob) => (!memberNo.value ? "Member No is required" : null),
  shouldRun: (dob) => !!dob,
  onErrorRef: dobError,
  failMessageFallback: "Birth date did not match"
});

function onDOBInput() {
  validateDOB(birthDate.value);
}

// ---------- Email ----------
const validateEmail = createDebouncedValidator<string>({
  run: (email) => api.email(memberNo.value.trim(), email),
  validate: (email) => {
    if (!email) return null; // let shouldRun clear it
    if (!memberNo.value) return "Member No is required";
    return null;
  },
  shouldRun: (email) => !!email && email.length >= 6,
  onErrorRef: emailError,
  failMessageFallback: "Email not found"
});

function onEmailInput() {
  validateEmail(emailAddress.value);
}

// ---------- TIN masking + validation ----------
const formatTin = (digits: string) => {
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
};

const countDigitsBeforeCaret = (text: string, caret: number) =>
  (text.slice(0, caret).match(/\d/g) || []).length;

const caretFromDigitIndex = (formatted: string, digitCount: number) => {
  if (digitCount <= 0) return 0;

  let seen = 0;

  for (let i = 0; i < formatted.length; i++) {
    const char = formatted[i];
    if (!char) continue;

    if (/\d/.test(char)) seen++;
    if (seen === digitCount) return i + 1;
  }

  return formatted.length;
};
const validateTin = createDebouncedValidator<string>({
  run: (rawDigits) => api.tin(memberNo.value.trim(), rawDigits),
  validate: () => (!memberNo.value ? "Member No is required" : null),
  shouldRun: (rawDigits) => rawDigits.length === 9,
  onErrorRef: tinError,
  failMessageFallback: "Invalid TIN"
});

const onTinInput = (event: Event) => {
  const input = event.target as HTMLInputElement;

  const prevText = input.value; // what user sees at the moment of input
  const prevCaret = input.selectionStart ?? prevText.length;

  // how many digits were "to the left" of the caret
  const digitsLeft = countDigitsBeforeCaret(prevText, prevCaret);

  // raw digits, max 9
  const raw = prevText.replace(/\D/g, "").slice(0, 9);

  // new formatted
  const formatted = formatTin(raw);

  // update model
  tin.value = formatted;

  // validate ONLY when raw is complete (9 digits)
  if (raw.length === 9) {
    validateTin(raw); // send raw digits to API
  } else {
    tinError.value = "";
  }

  // set caret to the equivalent digit position in the NEW formatted string
  nextTick(() => {
    const newPos = caretFromDigitIndex(formatted, digitsLeft);
    input.setSelectionRange(newPos, newPos);
  });
};

// local validation
function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const confirmEmailError = computed(() => {
  if (!confirmEmailAddress.value) return "";
  if (emailAddress.value !== confirmEmailAddress.value) return "Emails do not match.";
  return "";
});

const passwordError = computed(() => {
  if (!password.value) return "";
  if (password.value.length < 6) return "Password must be at least 6 characters.";
  return "";
});

const confirmPasswordError = computed(() => {
  if (!confirmPassword.value) return "";
  if (password.value !== confirmPassword.value) return "Passwords do not match.";
  return "";
});

const canSubmit = computed(() => {
  if (!memberNo.value || !firstName.value || !lastName.value) return false;
  if (!birthDate.value || !emailAddress.value || !confirmEmailAddress.value) return false;
  if (!tin.value || !password.value || !confirmPassword.value) return false;

  if (!isValidEmail(emailAddress.value)) return false;
  if (confirmEmailError.value) return false;
  if (passwordError.value) return false;
  if (confirmPasswordError.value) return false;

  if (memberNoError.value || dobError.value || emailError.value) return false;

  return true;
});

function handleRegister() {
  emit("clear-error");
  formError.value = "";

  if (!canSubmit.value) {
    formError.value = "Please fix the errors before submitting.";
    return;
  }

  emit("submit-register", {
    memberNo: memberNo.value.trim(),
    memberFirstName: firstName.value.trim(),
    memberLastName: lastName.value.trim(),
    dateOfBirth: birthDate.value,
    email: emailAddress.value.trim(),
    tin: tin.value.trim(),
    password: password.value,
    confirmPassword: confirmPassword.value,
  });
}
</script>
