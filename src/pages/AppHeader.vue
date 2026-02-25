<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useElectionStore } from "@/stores/election";
import bg from "@/assets/cemimpco-logo.jpg";



type MenuItem = { label: string; to?: string; href?: string };

const authStore = useAuthStore();
const electionStore = useElectionStore();

const open = ref(false);
const showChangePasswordModal = ref(false);


const urlLogo = bg;

const menu: MenuItem[] = [
  { label: "Elecom", to: "/overview" },
];

const memberName = computed(() => authStore.member?.name || "");

function toggle() {
  open.value = !open.value;
}
function close() {
  open.value = false;
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") close();
}

onMounted(() => window.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));

// close menu when logged out
watch(
  () => authStore.isAuthenticated,
  (isAuth) => {
    if (!isAuth) open.value = false;
  }
);

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

const isElecomMember = computed(() => {
  const memberNo = authStore.member?.memberNo;
  if (!memberNo) return false;

  return electionStore.elecom?.includes(memberNo);
});


// actions
function handleChangePassword() {
  close();
  showChangePasswordModal.value = true;
}

async function handleLogout() {
  close();
  electionStore.logout();
  authStore.logout(); // <-- adjust if your store uses different name
}
</script>

<template>
  <header class="sticky top-0 z-50 w-full border-b border-blue-700 bg-[#0A35C6]/90 backdrop-blur text-white shadow-sm">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-28 items-center justify-between">
        <!-- Left: Logo + Name -->
        <RouterLink to="/" class="flex items-center gap-3 min-w-0">
          <img
            :src="urlLogo"
            alt="CEMIMPCO Logo"
            class="h-16 w-16 rounded-full bg-white object-cover ring-1 ring-slate-200"
          />

          <div class="min-w-0 leading-tight">
            <div class="truncate text-xl lg:text-2xl font-bold text-white">
              Cebu Mitsumi Multi-Purpose Cooperative
            </div>
            <div class="truncate text-xs text-white/80">CEMIMPCO</div>
          </div>
        </RouterLink>

        <!-- Right: Dropdown (desktop) -->
        <div class="relative hidden sm:block" v-if="authStore.isAuthenticated">
          <button
            type="button"
            @click="toggle"
            class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-haspopup="menu"
            :aria-expanded="open"
          >
            {{ memberName || "Account"  }}
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fill-rule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          <!-- Dropdown panel -->
          <div
            v-if="open"
            class="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg z-50"
            role="menu"
          >
            <!-- Header -->
            <div class="px-4 pt-3 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Quick actions
            </div>

            <!-- one loop only -->
            <div class="py-1">
              <template v-if="isElecomMember" v-for="item in menu" :key="item.label + (item.to || item.href)">
                <RouterLink
                  v-if="item.to"
                  :to="item.to"
                  @click="close"
                  class="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  role="menuitem"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-[#3FA3E8]"></span>
                  {{ item.label }}
                </RouterLink>

                <a
                  v-else-if="item.href"
                  :href="item.href"
                  @click="close"
                  class="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  role="menuitem"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-[#3FA3E8]"></span>
                  {{ item.label }}
                </a>
              </template>
            </div>

            <!-- Change password button -->
            <div class="border-t border-slate-200 py-1">
              <button
                type="button"
                @click="handleChangePassword"
                class="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                role="menuitem"
              >
                <svg class="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 21H5a2 2 0 01-2-2v-1a4 4 0 014-4h10a4 4 0 014 4v1a2 2 0 01-2 2z" />
                </svg>
                Change Password
              </button>
            </div>

            <!-- Logout button -->
            <div class="border-t border-slate-200 p-2">
              <button
                type="button"
                @click="handleLogout"
                class="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
              >
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 17l5-5-5-5" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 12H9" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 19a9 9 0 110-14" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>

        <!-- Right: Burger (mobile) -->
        <div class="relative sm:hidden" v-if="authStore.isAuthenticated">
          <button
            type="button"
            @click="toggle"
            class="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/10 p-2 text-white shadow-sm hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40"
            aria-label="Open menu"
            :aria-expanded="open"
          >
            <svg v-if="!open" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            v-if="open"
            class="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg z-50"
          >
            <div class="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Menu
            </div>

            <div class="py-1">
              <template v-for="item in menu" :key="item.label + '-m' + (item.to || item.href)">
                <RouterLink
                  v-if="item.to"
                  :to="item.to"
                  @click="close"
                  class="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-[#3FA3E8]"></span>
                  {{ item.label }}
                </RouterLink>
              </template>
            </div>

            <div class="border-t border-slate-200 py-1">
              <button
                type="button"
                @click="handleChangePassword"
                class="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              >
                Change Password
              </button>
            </div>

            <div class="border-t border-slate-200 p-2">
              <button
                type="button"
                @click="handleLogout"
                class="w-full rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Click-away overlay (closes menu) -->
    <div v-if="open" class="fixed inset-0 z-40" @click="close"></div>
  </header>

  <!-- Change Password Modal -->
  <div
    v-if="showChangePasswordModal"
    class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4"
    @click.self="showChangePasswordModal = false"
  >
    <div class="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden">
      <div class="bg-[#3FA3E8] px-5 py-4">
        <h3 class="text-base font-bold text-white">Change Password</h3>
        <p class="text-xs text-white/90 mt-1">Update your account password.</p>
      </div>

      <div class="p-5 space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
          <input
            type="password"
            class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3FA3E8]/40"
            placeholder="Enter current password"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">New Password</label>
          <input
            type="password"
            class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3FA3E8]/40"
            placeholder="Enter new password"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
          <input
            type="password"
            class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3FA3E8]/40"
            placeholder="Confirm new password"
          />
        </div>

        <div class="flex gap-2 justify-end pt-2">
          <button
            type="button"
            class="h-11 rounded-xl px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            @click="showChangePasswordModal = false"
          >
            Cancel
          </button>

          <button
            type="button"
            class="h-11 rounded-xl bg-[#0A35C6] px-4 text-sm font-semibold text-white hover:bg-[#082ea9] transition"
            @click="showChangePasswordModal = false"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
/* Vue doesn't have a built-in @click.outside directive unless you installed one.
   The overlay above already handles click-away; so ignore @click.outside if you want.
*/
</style>
