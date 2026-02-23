<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/services/auth.services';
import { useAuthStore } from '@/stores/auth';
import type { LoginResponse } from '@/types/auth';


type LoginForm = {
  memberNo: string
  password: string
  remember: boolean
}

const router = useRouter()

const form = ref<LoginForm>({
  memberNo: '',
  password: '',
  remember: true,
})

const authStore = useAuthStore()
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const loginResult = ref<LoginResponse | null>(null);

const onSubmit = async () => {
  errorMessage.value = null
  isLoading.value = true

  try {
    
    const response = await login({memberNo: form.value.memberNo, password: form.value.password})
    loginResult.value = response.data
    authStore.applyLoginResult(response.data)
    
    if (response.data.success) {
      await router.push({ name: 'Home' }) // change to your route name
    } else {
      errorMessage.value = response.data.message || "Login Failed"
    }
    
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Login failed. Please try again.'
    errorMessage.value = message
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <section class="bg-white">
    <div class="lg:grid lg:min-h-screen lg:grid-cols-12">
      <!-- Left (form) -->
      <main
        class="flex items-center justify-center px-8 py-12 sm:px-12 lg:col-span-7 lg:px-16 lg:py-24 xl:col-span-6"
      >
        <div class="max-w-xl lg:max-w-3xl w-full">
          <div class="flex items-center gap-3">
            <div
              class="h-10 w-10 rounded-xl bg-gray-900 text-white grid place-items-center font-bold"
              aria-hidden="true"
            >
              DM
            </div>
            <div>
              <p class="text-sm text-gray-600">Welcome back</p>
              <h1 class="text-2xl font-bold text-gray-900 sm:text-3xl">Sign in to your account</h1>
            </div>
          </div>

          <p class="mt-4 text-gray-600">
            Login to continue. If you don’t have an account, you can register in a minute.
          </p>

          <div v-if="errorMessage" class="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p class="text-sm text-red-700">{{ errorMessage }}</p>
          </div>

          <form @submit.prevent="onSubmit" class="mt-8 grid grid-cols-6 gap-6">
            <div class="col-span-6">
              <label for="email" class="block text-sm font-medium text-gray-700"> Member No </label>

              <input
                id="memberNo"
                v-model.trim="form.memberNo"
                required
                placeholder="Member No"
                class="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
              />
            </div>

            <div class="col-span-6">
              <label for="password" class="block text-sm font-medium text-gray-700"> Password </label>

              <input
                id="password"
                v-model="form.password"
                type="password"
                autocomplete="current-password"
                required
                placeholder="••••••••"
                class="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
              />

              <div class="mt-2 flex items-center justify-between">
                <label class="inline-flex items-center gap-2 text-sm text-gray-600">
                  <input
                    v-model="form.remember"
                    type="checkbox"
                    class="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  Remember me
                </label>

                <RouterLink
                  to="/forgot-password"
                  class="text-sm font-medium text-gray-900 hover:underline"
                >
                  Forgot password?
                </RouterLink>
              </div>
            </div>

            <div class="col-span-6 flex items-center gap-4">
              <button
                type="submit"
                :disabled="isLoading"
                class="inline-flex items-center justify-center rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg
                  v-if="isLoading"
                  class="mr-2 h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                {{ isLoading ? 'Signing in…' : 'Sign in' }}
              </button>

              <p class="text-sm text-gray-600">
                No account?
                <RouterLink to="/register" class="font-medium text-gray-900 hover:underline">
                  Create one
                </RouterLink>
              </p>
            </div>

            <!-- Divider -->
            <div class="col-span-6">
              <div class="relative my-2">
                <span class="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gray-200"></span>
                <span class="relative bg-white pr-3 text-sm text-gray-500">Or continue with</span>
              </div>
            </div>

            <!-- Social buttons -->
            <div class="col-span-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                class="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <!-- simple icon -->
                <svg class="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M21.35 11.1H12v2.9h5.35c-.5 2.9-3 4.15-5.35 4.15A6 6 0 1 1 12 6c1.65 0 3.15.65 4.25 1.7l2-2A8.7 8.7 0 0 0 12 3.3 8.7 8.7 0 1 0 12 20.7c5.05 0 8.4-3.55 8.4-8.55 0-.6-.05-1.05-.15-1.05Z"
                  />
                </svg>
                Google
              </button>

              <button
                type="button"
                class="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <svg class="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M16.365 1.43c0 1.14-.46 2.29-1.24 3.18-.78.9-2.08 1.59-3.16 1.5-.14-1.1.39-2.27 1.16-3.1.77-.9 2.12-1.6 3.24-1.58ZM20.29 17.04c-.51 1.17-.75 1.7-1.4 2.74-.91 1.44-2.2 3.23-3.79 3.25-1.41.01-1.78-.92-3.7-.9-1.92.01-2.33.92-3.74.9-1.59-.02-2.81-1.63-3.72-3.07C1.4 18.34.3 15.36 1.62 13.18c.93-1.56 2.4-2.47 4-2.47 1.49 0 2.43.92 3.69.92 1.23 0 1.98-.93 3.68-.93 1.43 0 2.95.78 3.87 2.13-3.38 1.85-2.83 6.79 1.43 7.2Z"
                  />
                </svg>
                Apple
              </button>
            </div>
          </form>
        </div>
      </main>

      <!-- Right (image panel) -->
      <aside class="relative hidden lg:col-span-5 lg:block xl:col-span-6">
        <div class="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-700"></div>
        <div class="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,white,transparent_50%)]"></div>

        <div class="relative h-full p-12 flex items-end">
          <div class="max-w-md rounded-2xl bg-white/10 p-6 backdrop-blur">
            <h2 class="text-xl font-semibold text-white">Deliver faster. Manage smarter.</h2>
            <p class="mt-2 text-sm text-white/80">
              A clean Vue 3 + Tailwind + Pinia + Router starter. Hook your API and you’re ready.
            </p>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>
