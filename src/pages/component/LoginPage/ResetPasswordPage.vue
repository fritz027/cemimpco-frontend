<!-- src/pages/ResetPasswordPage.vue -->
<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto max-w-md px-4 py-14">
      <section class="relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <!-- Loading overlay -->
        <div
          v-if="status === 'loading'"
          class="absolute inset-0 z-10 grid place-items-center rounded-2xl bg-white/80"
        >
          <div class="flex items-center gap-3">
            <div class="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"></div>
            <p class="text-sm font-semibold text-slate-700">Updating password…</p>
          </div>
        </div>

        <!-- Header -->
        <div class="text-center">
          <h1 class="text-2xl font-extrabold text-slate-900">Reset Password</h1>
          <p class="mt-2 text-sm text-slate-500">
            Enter a new password for your account.
          </p>
        </div>

        <!-- Missing token -->
        <div
          v-if="!token"
          class="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
        >
          <p class="text-sm font-semibold">Invalid reset link</p>
          <p class="mt-1 text-sm">
            The reset token is missing. Please request a new password reset link.
          </p>
          <button
            type="button"
            class="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm
                   hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
            @click="goForgot"
          >
            Go to Forgot Password
          </button>
        </div>

        <!-- Success -->
        <div
          v-else-if="status === 'success'"
          class="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800"
        >
          <p class="text-sm font-semibold">Password updated!</p>
          <p class="mt-1 text-sm">You can now log in with your new password.</p>

          <button
            type="button"
            class="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm
                   hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
            @click="goLogin"
          >
            Continue to Login
          </button>

          <p v-if="redirectIn !== null" class="mt-3 text-center text-xs text-slate-500">
            Redirecting to login in {{ redirectIn }}s…
          </p>
        </div>

        <!-- Form -->
        <form v-else class="mt-6 space-y-4" @submit.prevent="handleSubmit">
          <!-- Error -->
          <div
            v-if="status === 'error'"
            class="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
          >
            <p class="text-sm font-semibold">{{ errorMessage }}</p>
          </div>

          <!-- Password -->
          <div>
            <label class="text-xs font-semibold text-slate-600">New Password</label>
            <div class="relative mt-1">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="New password"
                class="w-full rounded-xl border bg-white px-4 py-2.5 pr-11 text-slate-900 shadow-sm outline-none focus:ring-4"
                :class="passwordError
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'"
                :disabled="status === 'loading'"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-2 my-auto grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-50"
                @click="showPassword = !showPassword"
                aria-label="Toggle password"
              >
                <svg
                  v-if="!showPassword"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
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
            <label class="text-xs font-semibold text-slate-600">Confirm New Password</label>
            <div class="relative mt-1">
              <input
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Confirm new password"
                class="w-full rounded-xl border bg-white px-4 py-2.5 pr-11 text-slate-900 shadow-sm outline-none focus:ring-4"
                :class="confirmPasswordError
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'"
                :disabled="status === 'loading'"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-2 my-auto grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-50"
                @click="showConfirmPassword = !showConfirmPassword"
                aria-label="Toggle confirm password"
              >
                <svg
                  v-if="!showConfirmPassword"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M3 3l18 18" />
                  <path d="M10.6 10.6a3 3 0 104.24 4.24" />
                  <path d="M9.88 5.1A10.94 10.94 0 0112 5c7 0 10 7 10 7a18.5 18.5 0 01-3.2 4.5" />
                  <path d="M6.1 6.1A18.5 18.5 0 002 12s3 7 10 7c1.1 0 2.1-.2 3.1-.5" />
                </svg>
              </button>
            </div>
            <p v-if="confirmPasswordError" class="mt-1 text-xs text-red-600">
              {{ confirmPasswordError }}
            </p>
          </div>

          <!-- Actions -->
          <div class="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm
                     hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
              @click="goLogin"
              :disabled="status === 'loading'"
            >
              Back to login
            </button>

            <button
              type="submit"
              class="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm
                     hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200
                     disabled:opacity-60 disabled:cursor-not-allowed"
              :disabled="!canSubmit || status === 'loading'"
            >
              Reset Password
            </button>
          </div>

          <p class="pt-2 text-center text-xs text-slate-400">
            Tip: Use at least 8 characters and avoid common passwords.
          </p>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { resetPassword } from "@/services/auth.services"; // <-- make sure you have this

type Status = "idle" | "loading" | "success" | "error";

const route = useRoute();
const router = useRouter();

// token from URL: /reset-password?token=xxxx
const token = computed(() => (typeof route.query.token === "string" ? route.query.token : ""));

const status = ref<Status>("idle");
const errorMessage = ref("");

const password = ref("");
const confirmPassword = ref("");

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const redirectIn = ref<number | null>(null);
let redirectTimer: number | null = null;
let countdownTimer: number | null = null;

const passwordError = computed(() => {
  if (!password.value) return "";
  if (password.value.length < 8) return "Password must be at least 8 characters.";
  return "";
});

const confirmPasswordError = computed(() => {
  if (!confirmPassword.value) return "";
  if (password.value !== confirmPassword.value) return "Passwords do not match.";
  return "";
});

const canSubmit = computed(() => {
  if (!token.value) return false;
  if (!password.value || !confirmPassword.value) return false;
  if (passwordError.value) return false;
  if (confirmPasswordError.value) return false;
  return true;
});

async function handleSubmit() {
  if (!canSubmit.value) return;

  status.value = "loading";
  errorMessage.value = "";

  try {
    const res = await resetPassword(
      token.value,
      password.value,
    );

    if (res?.data?.success) {
      status.value = "success";

      // auto redirect
      redirectIn.value = 5;
      countdownTimer = window.setInterval(() => {
        if (redirectIn.value === null) return;
        redirectIn.value = Math.max(0, redirectIn.value - 1);
      }, 1000);

      redirectTimer = window.setTimeout(() => {
        goLogin();
      }, 5000);
    } else {
      status.value = "error";
      errorMessage.value = res?.data?.message || "Invalid or expired reset link.";
    }
  } catch (err: any) {
    status.value = "error";
    errorMessage.value =
      err?.response?.data?.message || err?.message || "Invalid or expired reset link.";
  }
}

function clearTimers() {
  if (redirectTimer) window.clearTimeout(redirectTimer);
  if (countdownTimer) window.clearInterval(countdownTimer);
  redirectTimer = null;
  countdownTimer = null;
  redirectIn.value = null;
}

function goLogin() {
  clearTimers();
  router.push({ name: "Login" });
}

function goForgot() {
  clearTimers();
  router.push({ name: "ForgotPassword" });
}

onBeforeUnmount(() => {
  clearTimers();
});
</script>