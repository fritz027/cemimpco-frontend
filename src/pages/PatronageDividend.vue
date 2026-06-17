<template>
  <div class="min-h-screen bg-gray-100 p-4 md:p-8">
    <div class="max-w-5xl mx-auto">
      
      <div class="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-t-xl shadow-sm border-b">
        
        <div class="flex items-center gap-4">
          <button 
            @click="goBack" 
            class="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          
          <div>
            <h1 class="text-2xl font-bold text-gray-800">2025 Patronage Refund</h1>
            <p class="text-sm text-gray-500">Official Computation of Interest on Share Capital & Patronage</p>
          </div>
        </div>

        <div class="mt-4 md:mt-0 flex gap-3 ml-10 md:ml-0">
          <button 
            @click="fetchPdf" 
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2 shadow-md w-full md:w-auto justify-center"
            :disabled="loading"
          >
            <span v-if="loading" class="animate-spin text-lg">⏳</span>
            {{ loading ? 'Generating...' : 'Refresh PDF' }}
          </button>
        </div>
      </div>

      <div class="bg-white rounded-b-xl shadow-lg overflow-hidden h-[500px] md:h-[800px] relative">
        <div v-if="loading" class="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
          <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p class="mt-4 text-gray-600 font-medium">Preparing your computation...</p>
        </div>

        <div v-if="error" class="p-12 text-center absolute inset-0 z-10 bg-white">
          <div class="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 class="text-lg font-semibold text-gray-800">Unable to load PDF</h3>
          <p class="text-gray-500">{{ error }}</p>
        </div>

        <VuePdfApp
          v-if="pdfUrl && !loading && !error"
          :pdf="pdfUrl"
          theme="light"
          class="w-full h-full"
        ></VuePdfApp>

        <div v-if="!pdfUrl && !loading && !error" class="p-20 text-center text-gray-400 absolute inset-0 bg-white">
          Click "Refresh PDF" to view your 2025 computation.
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router'; // <-- Import the router
import { useAuthStore } from '@/stores/auth';
import { patronageDividend } from '@/services/member.service';

import VuePdfApp from 'vue3-pdf-app';
import 'vue3-pdf-app/dist/icons/main.css';

const pdfUrl = ref<string | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const authStore = useAuthStore();
const router = useRouter(); // <-- Initialize the router

// --- Navigation Function ---
const goBack = () => {
  // Option 1: Go back in history
  router.back(); 
  
  // Option 2: If you want to force them to a specific dashboard route instead:
  // router.push('/dashboard');
};

const fetchPdf = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await patronageDividend(authStore.accessToken);

    if (pdfUrl.value) {
      window.URL.revokeObjectURL(pdfUrl.value);
    }

    const blob = new Blob([response.data], { type: 'application/pdf' });
    pdfUrl.value = window.URL.createObjectURL(blob);
  } catch (err) {
    console.error('PDF Fetch Error:', err);
    error.value = 'The system encountered an error retrieving your dividend data. Please try again later.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchPdf();
});

onUnmounted(() => {
  if (pdfUrl.value) {
    window.URL.revokeObjectURL(pdfUrl.value);
  }
});
</script>