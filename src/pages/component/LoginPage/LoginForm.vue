<template>
  <section class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
    <h2 class="text-2xl font-extrabold text-slate-900">Member Access</h2>
    <p class="mt-1 text-sm text-slate-500">
      Please enter your credentials to access your cooperative account.
    </p>

    <form class="mt-6 space-y-4" @submit.prevent="submit">
      <div v-if="props.resendMessage"
        class="rounded-lg bg-blue-50 border border-yellow-200 text-blue-700 px-4 py-3 text-sm"
      >
        {{ props.resendMessage }}
      </div>
      <div
        v-if="props.isResendConfirmation"
        class="rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 text-sm"
      >
        Please confirm your email.
        To re-send confirmation email please
        <button
          type="button"
          class="font-semibold underline hover:text-yellow-900 ml-1"
          @click="resend"
          :disabled="props.isLoading"
        >
          click here
        </button>
      </div>
      <div v-if="props.errorMessage"
       class="rounded-lg bg-red-100 border border-red-300 text-red-700 px-4 py-2 text-sm">
        {{ props.errorMessage }}
      </div>
      <div>
        <label class="text-sm font-medium text-slate-700">Member No</label>
        <input
          v-model="form.memberNo"
          type="text"
          placeholder="e.g. CP-123456"
          class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      <div>
        <label class="text-sm font-medium text-slate-700">Password</label>
        <div class="relative mt-1">
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Your password"
            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
          <button
            type="button"
            class="absolute inset-y-0 right-2 my-auto grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
            @click="showPassword = !showPassword"
            aria-label="Toggle password visibility"
          >
            <!-- eye -->
            <svg
              v-if="!showPassword"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="h-5 w-5"
            >
              <path
                d="M12 5c-7.633 0-10 7-10 7s2.367 7 10 7 10-7 10-7-2.367-7-10-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"
              />
              <path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
            </svg>
            <!-- eye-off -->
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="h-5 w-5"
            >
              <path
                d="M3.53 2.47 2.47 3.53l3.02 3.02C2.93 8.72 2 12 2 12s2.367 7 10 7c2.1 0 3.83-.53 5.24-1.31l3.23 3.23 1.06-1.06L3.53 2.47ZM12 17c-5.3 0-7.47-4.32-7.9-5 .12-.2.73-1.19 1.9-2.21l2.02 2.02A5 5 0 0 0 12 17Zm0-10a5 5 0 0 1 5 5c0 .93-.25 1.8-.67 2.55l-1.5-1.5c.11-.33.17-.68.17-1.05a3 3 0 0 0-3-3c-.37 0-.72.06-1.05.17l-1.5-1.5A4.96 4.96 0 0 1 12 7Zm8.9 5c-.2.34-1.17 1.92-2.98 3.08l-1.54-1.54A5 5 0 0 0 12 7c-.17 0-.34 0-.5.02L9.99 5.51C10.64 5.34 11.31 5 12 5c7.633 0 10 7 10 7s-.43 1.27-1.1 2.63Z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between">
        <label class="inline-flex items-center gap-2 text-sm text-slate-600">
          <input
            v-model="form.remember"
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-200"
          />
          Remember me
        </label>

        <a href="#" @click="forgotPasword" class="text-sm font-medium text-blue-600 hover:text-blue-700">
          Forgot Password?
        </a>
      </div>

      <button
        type="submit"
        class="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
        :disabled="props.isLoading"
      >
        {{ props.isLoading ? "Signing in..." : "Login" }} <span aria-hidden="true">→</span>
      </button>

      <p class="pt-2 text-center text-sm text-slate-600">
        Don't have an account?
        <a href="#" class="font-semibold text-blue-600 hover:text-blue-700" @click="registerForm">Register Now</a>
      </p>
    </form>

    <div class="mt-6 h-24 rounded-2xl bg-slate-50 ring-1 ring-slate-200"></div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";


const props = defineProps<{
  errorMessage: string | null;
  resendMessage: string | null;
  isLoading: boolean;
  isResendConfirmation: boolean;
}>();

type LoginPayload = {
  memberNo: string;
  password: string;
  remember: boolean;
};

const emit = defineEmits<{
  (e: "submit", payload: LoginPayload): void;
  (e: "clear-error"): void;
  (e: "toggle-form"): void;
  (e: "toggle-passwordForm"): void;
  (e: "resend-confirmation", memberNo: string): void;
}>();

const form = reactive<LoginPayload>({
  memberNo: "",
  password: "",
  remember: false,
});

watch(
  () => [form.memberNo, form.password],
  () => emit("clear-error")
);

const showPassword = ref(false);

function submit() {
  emit("submit", { ...form });
}

function resend () {
  emit('resend-confirmation', form.memberNo);
}

function registerForm() {
  emit("clear-error");
  emit('toggle-form');

}

function forgotPasword() {
  emit("clear-error");
  emit("toggle-passwordForm");
}
</script>
