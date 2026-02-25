<!-- src/pages/ConfirmEmailPage.vue -->
<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto max-w-lg px-4 py-14">
      <section class="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <!-- Header -->
        <div class="flex items-start gap-4">
          <div class="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
            <!-- icon -->
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <path d="M22 12l-3-3m3 3l-3 3m3-3H9" />
              <path d="M5 19a2 2 0 0 0 2 2h3" />
              <path d="M5 5a2 2 0 0 1 2-2h3" />
            </svg>
          </div>

          <div class="min-w-0">
            <h1 class="text-xl font-extrabold text-slate-900">Email confirmation</h1>
            <p class="mt-1 text-sm text-slate-500">
              We’re verifying your email address. Please don’t close this page.
            </p>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="status === 'loading'" class="mt-6">
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div class="flex items-center gap-3">
              <div class="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"></div>
              <p class="text-sm font-semibold text-slate-700">Confirming your email…</p>
            </div>
            <p class="mt-2 text-xs text-slate-500">
              This usually takes a few seconds.
            </p>
          </div>

          <div class="mt-6 space-y-2">
            <div class="h-2 w-full rounded bg-slate-100"></div>
            <div class="h-2 w-10/12 rounded bg-slate-100"></div>
            <div class="h-2 w-8/12 rounded bg-slate-100"></div>
          </div>
        </div>

        <!-- Success -->
        <div v-else-if="status === 'success'" class="mt-6">
          <div class="rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
            <div class="flex items-start gap-3">
              <div class="mt-0.5 grid h-9 w-9 place-items-center rounded-lg bg-white/60 ring-1 ring-green-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>

              <div class="min-w-0">
                <p class="text-sm font-semibold">Email confirmed!</p>
                <p class="mt-1 text-sm">
                  You can now log in to your account.
                </p>
              </div>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm
                     hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
              @click="goHome"
            >
              Go home
            </button>

            <button
              type="button"
              class="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm
                     hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
              @click="goLogin"
            >
              Continue to login
            </button>
          </div>

          <p v-if="redirectIn !== null" class="mt-4 text-center text-xs text-slate-500">
            Redirecting to login in {{ redirectIn }}s…
          </p>
        </div>

        <!-- Error -->
        <div v-else class="mt-6">
          <div class="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            <div class="flex items-start gap-3">
              <div class="mt-0.5 grid h-9 w-9 place-items-center rounded-lg bg-white/60 ring-1 ring-red-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2">
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                  <path d="M10.3 3.6 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0z" />
                </svg>
              </div>

              <div class="min-w-0">
                <p class="text-sm font-semibold">Confirmation failed</p>
                <p class="mt-1 text-sm">{{ errorText }}</p>
              </div>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm
                     hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
              @click="retry"
              :disabled="(status as 'loading' | 'success' | 'error') === 'loading'"
            >
              Retry
            </button>

            <button
              type="button"
              class="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm
                     hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
              @click="goLogin"
            >
              Back to login
            </button>
          </div>

          <div class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-semibold text-slate-600">Common reasons:</p>
            <ul class="mt-2 list-disc pl-5 text-xs text-slate-600 space-y-1">
              <li>The confirmation link already expired</li>
              <li>The link was already used</li>
              <li>The token is invalid or incomplete</li>
            </ul>
          </div>
        </div>

        <!-- footer -->
        <p class="mt-8 text-center text-xs text-slate-400">
          If you keep having issues, request a new confirmation email from the login page.
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";

// TODO: update this import to your real service method.
// Example expected signature: confirmEmail(token: string) -> axios response { data: { success: boolean, message?: string } }
import { activateLogin } from "@/services/auth.services";

type Status = "loading" | "success" | "error";

const route = useRoute();
const router = useRouter();



const status = ref<Status>("loading");
const errorText = ref("Something went wrong. Please try again.");



const redirectIn = ref<number | null>(null);
let redirectTimer: number | null = null;
let countdownTimer: number | null = null;

function getToken(): string {
  const token = route.query.token;
  return typeof token === "string" ? token : "";
}

async function runConfirmation() {
  const token = getToken();

  if (!token) {
    status.value = "error";
    errorText.value = "Missing token. Please open the latest confirmation link from your email.";
    return;
  }

  status.value = "loading";
  errorText.value = "Something went wrong. Please try again.";

  try {
    const res = await activateLogin(token);

    if (res?.data?.success) {
      status.value = "success";

      // optional auto-redirect
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
      errorText.value = res?.data?.message || "Invalid or expired confirmation link.";
    }
  } catch (err: any) {
    status.value = "error";
    errorText.value =
      err?.response?.data?.message || err?.message || "Invalid or expired confirmation link.";
  }
}

function retry() {
  // clear timers if any
  clearTimers();
  runConfirmation();
}

function goLogin() {
  clearTimers();
  router.push({ name: "Login" }); // change to your actual route name
}

function goHome() {
  clearTimers();
  router.push({ name: "Home" }); // change to your actual route name
}

function clearTimers() {
  if (redirectTimer) window.clearTimeout(redirectTimer);
  if (countdownTimer) window.clearInterval(countdownTimer);
  redirectTimer = null;
  countdownTimer = null;
  redirectIn.value = null;
}

onMounted(() => {
  runConfirmation();
});

onBeforeUnmount(() => {
  clearTimers();
});
</script>