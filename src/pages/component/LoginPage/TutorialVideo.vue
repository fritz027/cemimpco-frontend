<template>
  <section class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="inline-flex items-center gap-3">
        <div class="rounded-xl bg-blue-600 px-5 py-3 text-lg font-semibold text-white shadow-sm">
          Web App Tutorial
        </div>
      </div>
    </div>

    <!-- Video -->
    <div class="mt-6">
      <video
        class="w-full rounded-xl shadow-md"
        controls
        autoplay
        muted
        playsinline
      >
        <source :src="tutorialVideo" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  </section>
</template>


<script setup lang="ts">
import tutorialVideo from "@/assets/CEMIMPCO WEB tut.mp4";
</script>
<style lang="css" scoped></style>