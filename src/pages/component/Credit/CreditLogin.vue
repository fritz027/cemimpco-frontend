<!-- LoginPage.vue -->
<template>
  <div class="min-h-screen">
    <div class="mx-auto flex min-h-screen max-w-md flex-col px-4 py-5">
      <!-- Card -->
      <div class="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <!-- Title -->
        <div class="text-center">
          <h3 class="text-lg font-extrabold tracking-wide text-slate-800">
            CEMIMPCO CREDIT LIMIT SYSTEM
          </h3>

          <h4 class="text-2xl font-extrabold text-slate-800 mt-1">
            LOGIN
          </h4>
        </div>

        <!-- Server Error Banner -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="serverError"
            class="mt-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
          >
            <svg class="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <p class="text-xs font-medium text-red-700 leading-snug">{{ serverError }}</p>
          </div>
        </Transition>

        <form class="mt-6 space-y-5" novalidate @submit.prevent="onSubmit">

          <!-- Store Branch -->
          <div>
            <label class="mb-2 block text-sm font-semibold text-slate-700">
              Store Branch
            </label>

            <div class="relative">
              <select
                v-model="form.branch"
                :class="[
                  'w-full appearance-none rounded-lg border bg-white px-4 py-3 pr-10 text-sm text-slate-700 outline-none transition',
                  errors.branch
                    ? 'border-red-400 focus:border-red-400 focus:ring-4 focus:ring-red-100'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                ]"
                @change="clearError('branch')"
              >
                <option value="" disabled>Select Store Branch</option>
                <option v-for="b in stores" :key="b.store_id" :value="b.store_id">
                  {{ b.store_name }}
                </option>
              </select>

              <!-- Caret -->
              <svg
                class="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>

            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
            >
              <p v-if="errors.branch" class="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                <svg class="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {{ errors.branch }}
              </p>
            </Transition>
          </div>

          <!-- Username -->
          <div>
            <label class="mb-2 block text-sm font-semibold text-slate-700">
              User Name
            </label>

            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20 21a8 8 0 10-16 0" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 11a4 4 0 100-8 4 4 0 000 8z" />
                </svg>
              </span>

              <input
                v-model.trim="form.username"
                type="text"
                placeholder="Enter your username"
                :class="[
                  'w-full rounded-lg border bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition',
                  errors.username
                    ? 'border-red-400 focus:border-red-400 focus:ring-4 focus:ring-red-100'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                ]"
                @input="clearError('username')"
              />
            </div>

            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
            >
              <p v-if="errors.username" class="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                <svg class="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {{ errors.username }}
              </p>
            </Transition>
          </div>

          <!-- Password -->
          <div>
            <label class="mb-2 block text-sm font-semibold text-slate-700">
              Password
            </label>

            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V8a4 4 0 00-8 0v3" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 11h12v10H6z" />
                </svg>
              </span>

              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
                :class="[
                  'w-full rounded-lg border bg-white py-3 pl-11 pr-11 text-sm text-slate-700 outline-none transition',
                  errors.password
                    ? 'border-red-400 focus:border-red-400 focus:ring-4 focus:ring-red-100'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                ]"
                @input="clearError('password')"
              />

              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                @click="showPassword = !showPassword"
                aria-label="Toggle password visibility"
              >
                <svg v-if="!showPassword" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
                </svg>
                <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.6 10.6a3 3 0 004.24 4.24"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.88 5.1A10.94 10.94 0 0112 5c6.5 0 10 7 10 7a18.3 18.3 0 01-3.02 4.05"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.23 6.23C3.6 8.19 2 12 2 12s3.5 7 10 7c1.3 0 2.5-.24 3.6-.67"/>
                </svg>
              </button>
            </div>

            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
            >
              <p v-if="errors.password" class="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                <svg class="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {{ errors.password }}
              </p>
            </Transition>
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="mt-2 w-full rounded-lg bg-blue-600 py-3 text-sm font-extrabold tracking-wide text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            <span v-if="isLoading" class="flex items-center justify-center gap-2">
              <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Signing in...
            </span>
            <span v-else>LOGIN</span>
          </button>
        </form>

        <!-- Footer -->
        <div class="mt-8 bg-slate-50 py-3">
          <p class="text-center text-xs text-slate-400">
            © {{ year }} CEMIMPCO. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { getStores } from "@/services/credit.service";
import { creditLogin } from "@/services/auth.services";
import { useRouter } from "vue-router";
import { useCreditStore } from "@/stores/credit";


// ── Types ─────────────────────────────────────────────────────────────
type Store = {
  store_id: string;
  store_name: string;
  store_address: string;
};

type FormFields = keyof typeof form;

// ── State ─────────────────────────────────────────────────────────────
const showPassword = ref(false);
const isLoading = ref(false);
const serverError = ref("");
const year = ref(new Date().getFullYear());
const stores = ref<Store[]>([]);
const router = useRouter();
const creditStore = useCreditStore();

const form = reactive({
  branch: "",
  username: "",
  password: "",
});

const errors = reactive({
  branch: "",
  username: "",
  password: "",
});



// ── Validation ────────────────────────────────────────────────────────
function validate(): boolean {
  errors.branch   = form.branch   ? "" : "Please select a store branch.";
  errors.username = form.username ? "" : "Username is required.";
  errors.password = form.password ? "" : "Password is required.";

  if (form.username && form.username.length < 3) {
    errors.username = "Username must be at least 3 characters.";
  }

  if (form.password && form.password.length < 4) {
    errors.password = "Password must be at least 4 characters.";
  }

  return !errors.branch && !errors.username && !errors.password;
}

function clearError(field: FormFields) {
  errors[field] = "";
  serverError.value = "";
}

// ── Data fetching ─────────────────────────────────────────────────────
onMounted(async () => {
  await setStores();
});

async function setStores() {
  try {
    const res = await getStores();
    if (!res.data.success) {
      console.log(res.data.message);
      return;
    }
    stores.value = res.data.stores.map((s: Store) => ({
      store_id: s.store_id,
      store_name: s.store_name,
      store_address: s.store_address,
    }));
  } catch (error) {
    console.log(error);
  }
}

// ── Submit ────────────────────────────────────────────────────────────
async function onSubmit() {
  serverError.value = "";
  if (!validate()) return;

  isLoading.value = true;
  try {
    const res = await creditLogin({
      username: form.username,
      password: form.password,
      store: form.branch,
    });

    if (!res.data.success) {
      serverError.value = res.data.message || "Login failed. Please try again.";
      return;
    }

    creditStore.setCreditLogin({
      store: form.branch,
      loggedIn: res.data.success
    });

    await router.push({ name: 'CreditPage' });

  } catch {
    // console.log(error);
    serverError.value = "Invalid credentials"
      // error?.response?.data?.message ??
      // "Unable to connect. Please check your network and try again.";
  } finally {
    isLoading.value = false;
  }
}
</script>
