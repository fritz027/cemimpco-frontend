<template>
  <!-- Lock app to viewport and prevent body double-scroll -->
  <div class="h-dvh w-full bg-slate-50/60 overflow-hidden">
    <div class="flex h-full w-full min-h-0">

      <!-- ================= Mobile Overlay ================= -->
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-40 bg-black/40 lg:hidden"
        @click="sidebarOpen = false"
      />

      <!-- ================= Sidebar ================= -->
      <aside
        class="fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white
               transform transition-transform duration-300
               lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0 lg:z-auto"
        :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
      >
        <!-- ✅ Sidebar children scroll here -->
        <div class="h-full min-h-0 overflow-y-auto p-6">
          <!-- Mobile Close -->
          <div class="mb-4 flex items-center justify-between lg:hidden">
            <div class="text-sm font-semibold text-slate-900">Menu</div>
            <button
              class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              @click="sidebarOpen = false"
              type="button"
            >
              Close
            </button>
          </div>

          <div class="mb-6 text-xs font-semibold tracking-widest text-slate-400">
            MENU
          </div>

          <nav class="space-y-1">
            <RouterLink
              v-for="item in menu"
              :key="item.label"
              :to="item.to"
              class="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              :class="isActive(item.to) ? 'bg-blue-50 text-slate-900' : ''"
              @click="sidebarOpen = false"
            >
              <span
                class="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500"
                :class="isActive(item.to) ? 'border-blue-200 bg-blue-50 text-blue-600' : ''"
              >
                <component
                  :is="item.icon"
                  class="h-4 w-4 text-[#3FA3E8]"
                />
              </span>

              <span>{{ item.label }}</span>

              <span
                v-if="isActive(item.to)"
                class="ml-auto h-6 w-1 rounded-full bg-blue-600"
              />
            </RouterLink>
          </nav>
          
          <div class="my-6 border-t border-slate-200" />

          <div class="mb-6 text-xs font-semibold tracking-widest text-slate-400">
            ADMIN
          </div>

          <nav class="space-y-1">
            <RouterLink
              v-for="item in adminMenu"
              :key="item.label"
              :to="item.to"
              class="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              :class="isActive(item.to) ? 'bg-blue-50 text-slate-900' : ''"
              @click="sidebarOpen = false"
            >
              <span
                class="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500"
                :class="isActive(item.to) ? 'border-blue-200 bg-blue-50 text-blue-600' : ''"
              >
                <component
                  :is="item.icon"
                  class="h-4 w-4 text-[#3FA3E8]"
                />
              </span>

              <span>{{ item.label }}</span>

              <span
                v-if="isActive(item.to)"
                class="ml-auto h-6 w-1 rounded-full bg-blue-600"
              />
            </RouterLink>
          </nav>
        </div>
      </aside>

      <!-- ================= Main Content ================= -->
      <!-- ✅ Add min-h-0 to allow scrolling -->
      <div class="flex min-w-0 flex-1 flex-col h-full">
  
        <header class="border-b border-slate-200 bg-white lg:hidden shrink-0">
          <div class="flex items-center justify-between px-4 py-3">
            <button
              class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              type="button"
              @click="sidebarOpen = true"
            >
              ☰ Menu
            </button>
            <div class="text-sm font-semibold text-slate-900">SURVEY</div>
          </div>
        </header>

        <main class="flex-1 overflow-y-auto p-3 lg:p-6 bg-slate-50/60">
          <router-view />
        </main>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
import {
  BookmarkSlashIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  UserGroupIcon
 } from "@heroicons/vue/24/solid";


type MenuItem = { label: string; to: string; icon: any };

const route = useRoute();
const sidebarOpen = ref(false);

const menu: MenuItem[] = [
  { label: "Survey Overview", to: "/survey-overview" , icon: BookmarkSlashIcon },
  { label: "Survey Questions", to: "/survey-list" , icon: ClipboardDocumentListIcon },
  { label: "Result", to: "/survey-result", icon: ChartBarIcon },
];

const adminMenu: MenuItem[] = [
  { label: "Access", to: "/survey-access", icon:  UserGroupIcon},
];

const isActive = (to: string) => route.path === to;
</script>
