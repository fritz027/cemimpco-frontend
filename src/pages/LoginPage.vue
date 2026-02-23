<template>
  <div class="min-h-screen">
    <div class="mx-auto max-w-7xl px-4 py-10">
      <div class="grid gap-6 lg:grid-cols-[380px_1fr]">
        <LoginForm
          :error-message="errorMessage"
          :is-loading="isLoading" 
          @clear-error="errorMessage = null"
          @submit="onSubmit" 
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
import { ref, onMounted, computed } from 'vue';
import { useRouter } from "vue-router";
import { login,electionConfig,allowedElecom } from '@/services/auth.services';
import { useAuthStore } from "@/stores/auth";
import { useElectionStore } from "@/stores/election";
import type { LoginResponse } from "@/types/auth";

const router = useRouter();
const authStore = useAuthStore();
const electionStore = useElectionStore();
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);
const loginResult = ref<LoginResponse | null>(null);


onMounted(async () => {
  try {
    const res = await electionConfig();

    if (res.data.config) {
      const electionRaw = res.data.config.uvalue;
      const election = typeof electionRaw === "string"
        ? JSON.parse(electionRaw)
        : electionRaw;

        console.log(election);
      electionStore.$patch({
        year: Number(election.year),
        from: election.from,
        to: election.to,
        start: Number(election.start) === 1,
      });
    }

    const elecom = await allowedElecom();
    console.log(elecom.data);
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
    electionStore.start &&
    today >= from &&
    today <= to
  );
});


const tabs = [
  { key: "all", label: "All" },
  { key: "board", label: "Board" },
  { key: "audit", label: "Audit" },
];




const candidates = [
  {
    id: 1,
    name: "Juan Dela Cruz",
    memberSince: "2015",
    quote: "Transparency and service first.",
    manifesto: "Full manifesto text here...",
    avatar: "https://i.pravatar.cc/200?img=12",
    tabKey: "board",
  },
  // add more...
];

async function onSubmit(payload: { memberNo: string; password: string; remember: boolean }) {
  errorMessage.value = null;
  isLoading.value = true;
  try {
  
    const response = await login({
      memberNo: payload.memberNo,
      password: payload.password
    });

    if (response.data.success) {
      loginResult.value = response.data
      authStore.applyLoginResult(response.data);
      await router.push({ name: 'Profile' });
    } else {
      errorMessage.value = response.data.message || "Login Failed";
    }
  } catch (error: unknown) {
    console.log(error)
    const message = error instanceof Error ? error.message : 'Login failed. Please try again';
    errorMessage.value = message
  } finally {
    isLoading.value = false;
  }
}
</script>
