<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto max-w-md px-4 py-16">
      <section class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <!-- Header -->
        <div class="text-center">
          <h1 class="text-2xl font-extrabold text-slate-900">Forgot Password</h1>
          <p class="mt-2 text-sm text-slate-500">
            Enter your Member No and Email. We’ll send a password reset link if the details match.
          </p>
        </div>

        <!-- Success -->
        <div
          v-if="status === 'success'"
          class="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800"
        >
          <p class="text-sm font-semibold">
            If the details are correct, we sent a reset link to your email.
          </p>
          <p class="mt-1 text-xs">Please check your inbox and spam folder.</p>

          <button
            type="button"
            class="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm
                   hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
            @click="backToLogin"
          >
            Back to login
          </button>
        </div>

        <!-- Error -->
        <div
          v-else-if="status === 'error'"
          class="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
        >
          <p class="text-sm font-semibold">{{ errorMessage }}</p>
        </div>

        <!-- Form -->
        <form v-if="status !== 'success'" class="mt-6 space-y-4" @submit.prevent="handleSubmit">
          <!-- Member No -->
          <div>
            <label class="text-xs font-semibold text-slate-600">Member No</label>
            <input
              v-model.trim="memberNo"
              type="text"
              inputmode="numeric"
              placeholder="Enter your member number"
              class="mt-1 w-full rounded-xl border bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none focus:ring-4"
              :class="memberNoError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'"
            />
            <p v-if="memberNoError" class="mt-1 text-xs text-red-600">{{ memberNoError }}</p>
          </div>

          <!-- Email -->
          <div>
            <label class="text-xs font-semibold text-slate-600">Email Address</label>
            <input
              v-model.trim="email"
              type="email"
              placeholder="Enter your email"
              class="mt-1 w-full rounded-xl border bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none focus:ring-4"
              :class="emailError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'"
            />
            <p v-if="emailError" class="mt-1 text-xs text-red-600">{{ emailError }}</p>
          </div>

          <!-- Actions -->
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2">
            <button
              type="button"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm
                     hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
              @click="backToLogin"
              :disabled="isLoading"
            >
              Back
            </button>

            <button
              type="submit"
              :disabled="isLoading || !canSubmit"
              class="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm
                     hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200
                     disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading">Sending...</span>
              <span v-else>Send Reset Link</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { forgotPassword } from "@/services/auth.services"; // <-- adjust to your API

type Status = "idle" | "loading" | "success" | "error";

const router = useRouter();

const memberNo = ref("");
const email = ref("");

const status = ref<Status>("idle");
const isLoading = ref(false);
const errorMessage = ref("");

const props = defineProps<{
  errorMessage: string | null;
  successMessage: string | null;
  isLoading: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", memberNo: string, email: string): void;
  (e: "clear-error"): void;
  (e: "toggle-passwordForm"): void;
}>();

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const memberNoError = computed(() => {
  if (!memberNo.value) return "";
  if (!/^\d{6,}$/.test(memberNo.value)) return "Member No must be numeric (at least 6 digits).";
  return "";
});

const emailError = computed(() => {
  if (!email.value) return "";
  if (!isValidEmail(email.value)) return "Please enter a valid email address.";
  return "";
});

const canSubmit = computed(() => {
  if (!memberNo.value || !email.value) return false;
  if (memberNoError.value || emailError.value) return false;
  return true;
});

async function handleSubmit() {
  if (!canSubmit.value) return;

  status.value = "loading";
  isLoading.value = true;
  errorMessage.value = "";

  try {
    await forgotPassword(memberNo.value.trim(),email.value.trim());

    // Security: show generic success regardless of match
    status.value = "success";
  } catch (err: any) {
    status.value = "error";
    errorMessage.value =
      err?.response?.data?.message ||
      err?.message ||
      "Something went wrong. Please try again.";
  } finally {
    isLoading.value = false;
  }
}

function goLogin() {
  router.push({ name: "Login" });
}

function backToLogin() {
  emit("clear-error");
  emit("toggle-passwordForm");
}
</script>