<template>
  <div class="min-h-screen">
    <div class="mx-auto max-w-7xl px-4 py-10">
      <div class="grid gap-6 lg:grid-cols-[380px_1fr]">
        <LoginForm
          v-if="!isRegisterForm && !isForgotPassword"
          :error-message="errorMessage"
          :is-loading="isLoading"
          :resend-message="resendMessage"
          :is-resend-confirmation="isResendConfirmation"
          @resend-confirmation="onResendConfirmation"
          @toggle-passwordForm="toggleForgotPasswordForm"
          @toggle-form="toggleForm"
          @clear-error="errorMessage = null"
          @submit="onSubmit" 
        />
        <RegisterPage
          v-if="isRegisterForm"
          :error-message="errorMessage"
          :success-message="registerSuccessMessage"
          :is-loading="isLoading"
          :is-resend-confirmation="isResendConfirmation"
          @toggle-form="toggleForm"
          @submit-register="onSubmitRegister"
          @resend-confirmation="onResendConfirmation"
        />

        <ForgotPassword 
          v-if="isForgotPassword"
          :error-message="errorMessage"
          :success-message="forgotPasswordSuccess"
          :is-loading="isLoading"
          @toggle-passwordForm="toggleForgotPasswordForm"
          @submit="forgotPassword"
        />

        <ElectionCandidates
          v-if="isElection"
          :tabs="tabs"
          :candidates="candidates"
          badge-text="2026 ELECTION"
          :per-page="4"
        />

        <TutorialVideo 
          v-else
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoginForm from "@/pages/component/LoginPage/LoginForm.vue";
import ElectionCandidates from "@/pages/component/LoginPage/ElectionCandidate.vue";
import TutorialVideo from "./component/LoginPage/TutorialVideo.vue";
import RegisterPage from "./component/LoginPage/RegisterPage.vue";
import ForgotPassword from "./component/LoginPage/ForgotPassword.vue";
import { ref, onMounted, computed } from 'vue';
import { useRouter } from "vue-router";
import { login,electionConfig,allowedElecom,register,resendConfirmationEmail } from '@/services/auth.services';
import { useAuthStore } from "@/stores/auth";
import { useElectionStore } from "@/stores/election";
import type { LoginResponse } from "@/types/auth";
import axios from "axios";

const router = useRouter();
const authStore = useAuthStore();
const electionStore = useElectionStore();
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);
const loginResult = ref<LoginResponse | null>(null);
const isRegisterForm = ref(false);
const registerSuccessMessage = ref<string | null>(null);
const isResendConfirmation = ref(false);
const resendMessage = ref<string | null>(null);
const isForgotPassword = ref(false);
const forgotPasswordSuccess = ref<string | null>(null);

onMounted(async () => {
  try {
    const res = await electionConfig();

    if (res.data.config) {
      const electionRaw = res.data.config.uvalue;
      const election = typeof electionRaw === "string"
        ? JSON.parse(electionRaw)
        : electionRaw;

      electionStore.$patch({
        year: Number(election.year),
        from: election.from,
        to: election.to,
        start: Number(election.start) === 1,
      });
    }

    const elecom = await allowedElecom();
    if (elecom.data.users) {
      const usersRaw = elecom.data.users.uvalue;
      const users = typeof usersRaw === "string"
        ? JSON.parse(usersRaw)
        : usersRaw;

      electionStore.$patch({
        elecom: users,
      });
    }

  } catch (error) {
    console.log(error);
  }
});

const isElection = computed(() => {
  const today = new Date();
  const from = new Date(electionStore.from);
  const to = new Date(electionStore.to);

  return (
    electionStore.start
  );
});

const tabs = [{}];
const candidates = [{}];

const toggleForm = () => {
  // clear messages when switching forms
  errorMessage.value = null;
  registerSuccessMessage.value = null;
  isRegisterForm.value = !isRegisterForm.value;
};

const toggleForgotPasswordForm = () => {
  errorMessage.value = null;
  forgotPasswordSuccess.value = null;
  isForgotPassword.value = !isForgotPassword.value;
}

async function onSubmit(payload: { memberNo: string; password: string; remember: boolean }) {
  // ✅ prevent double submit (very common cause of hitting 429)
  if (isLoading.value) return;

  errorMessage.value = null;
  isLoading.value = true;
  isRegisterForm.value = false;

  try {
    const response = await login({
      memberNo: payload.memberNo,
      password: payload.password,
    });

    if (response.data.success) {
      loginResult.value = response.data;
      console.log(loginResult.value);
      authStore.applyLoginResult(response.data);
      await router.push({ name: "Profile" });
      return;
    }

    // non-2xx responses won't reach here (axios throws),
    // but your API might still send success=false with 200 OK
    if (response.data.verified === 0) {
      isResendConfirmation.value = true;
      return;
    }

    errorMessage.value = response.data.message || "Login Failed";
  } catch (err: unknown) {
    console.log(err);
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const data = err.response?.data as any;

      errorMessage.value =
        data?.message ||
        (status ? `Request failed with status ${status}` : "Login failed. Please try again.");

    } else if (err instanceof Error) {
      errorMessage.value = err.message;
    } else {
      errorMessage.value = "Login failed. Please try again.";
    }
  } finally {
    isLoading.value = false;
  }
}

async function onSubmitRegister(payload: {
  memberNo: string;
  memberFirstName: string;
  memberLastName: string;
  dateOfBirth: string | Date;
  email: string;
  tin: string;
  password: string;
  confirmPassword: string;
}) {
  errorMessage.value = null;
  registerSuccessMessage.value = null;
  isLoading.value = true;

  const memberName = `${payload.memberLastName.toUpperCase().trim()}, ${payload.memberFirstName.toUpperCase().trim()}`;

  try {
    const response = await register({
      memberNo: payload.memberNo,
      memberName: memberName,
      email: payload.email,
      password: payload.password,
    });

    if (response.data.success) {
      registerSuccessMessage.value =
        "Registration successful. Please check your email for confirmation.";

      // OPTION A: stay on register page and show message
      // do nothing

      // OPTION B: go back to login automatically after success
      isRegisterForm.value = false;
   
    } else {
      errorMessage.value = response.data.message || "Registration failed.";
    }
  } catch (error: any) {
    errorMessage.value =
      error?.response?.data?.message || error?.message || "Registration failed. Please try again.";
  } finally {
    isLoading.value = false;
  }
}

async function onResendConfirmation(no: string) {
  isLoading.value = true;
  resendMessage.value = null;
  errorMessage.value = null;

  try {
    const response = await resendConfirmationEmail(no); // your API

    if (response.data.success) {
      
        isResendConfirmation.value = false
        resendMessage.value =
        "Confirmation email has been sent again. Please check your inbox.";
        setTimeout(() => {
          resendMessage.value = ""
        }, 3000);
    } else {
      errorMessage.value = response.data.message;
    }
  } catch (error: any) {
    errorMessage.value =
      error?.response?.data?.message || "Failed to resend confirmation.";
  } finally {
    isLoading.value = false;
  }
}

async function forgotPassword() {
  console.log('test')
}

</script>
