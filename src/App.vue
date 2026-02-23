<script setup lang="ts">
  import AppHeader from './pages/AppHeader.vue';
  import bg from '@/assets/cemimpco-background.png'
</script>

<template>
  <!-- Background Layer (fixed, behind everything) -->
  <div
    class="fixed inset-0 -z-10 bg-center bg-cover bg-no-repeat"
    :style="{ backgroundImage: `url(${bg})` }"
  />

  <!-- App Layout -->
  <div class="flex min-h-dvh flex-col">

    <!-- Header (now normal flow, will scroll) -->
    <header class="z-10">
      <AppHeader />
    </header>

    <!-- Scrollable Main -->
    <main class="flex-1 overflow-y-auto">
      <router-view />
    </main>

  </div>
</template>

