<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { fetchCandidates } from '@/services/election.sevice';
import { useAuthStore } from '@/stores/auth';
import { useRoute, useRouter } from 'vue-router';
import { HomeIcon, ChevronRightIcon } from '@heroicons/vue/24/outline';

interface Candidate {
  member_no: string;
  member_name: string;
  position_desc: string;
  position_id: number;
  vision: string;
  photo_url: string;
}

interface GroupedCategory {
  position_id: number;
  position_desc: string;
  candidates: Candidate[];
}

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const activeTab = ref<number | null>(null);
const candidateList = ref<Candidate[]>([]);
const groupedData = ref<GroupedCategory[]>([]);
const loading = ref(true);

const shuffle = <T>(array: T[]): T[] => [...array].sort(() => Math.random() - 0.5);

onMounted(async () => {
  try {
    const res = await fetchCandidates(Number(route.params.year), authStore.accessToken);
    if (res.data.success) {
      candidateList.value = res.data.candidates;
      initializeGroups();
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
});

const initializeGroups = () => {
  const groups: Record<number, GroupedCategory> = {};
  candidateList.value.forEach((c) => {
    if (!groups[c.position_id]) {
      groups[c.position_id] = { position_id: c.position_id, position_desc: c.position_desc, candidates: [] };
    }
    groups[c.position_id]?.candidates.push(c);
  });

  groupedData.value = Object.values(groups).map(g => ({
    ...g,
    candidates: shuffle(g.candidates)
  })).sort((a, b) => a.position_id - b.position_id);

  if (groupedData.value.length > 0) {
    activeTab.value = groupedData.value[0]?.position_id ?? null;
  }
};

const handleTabClick = (positionId: number) => {
  activeTab.value = positionId;
  const group = groupedData.value.find(g => g.position_id === positionId);
  if (group) {
    group.candidates = shuffle(group.candidates);
  }
};

const currentGroup = computed(() => 
  groupedData.value.find(g => g.position_id === activeTab.value) || null
);
</script>

<template>
  <div class="min-h-screen bg-white text-[#1e3a8a] antialiased">
    
    <button 
      @click="router.push('/profile')"
      class="fixed top-3 left-3 z-[100] p-3 bg-[#3FA3E8] text-white shadow-lg rounded-xl active:scale-95 transition-transform md:top-6 md:left-6 md:p-4 md:rounded-2xl"
    >
      <HomeIcon class="w-5 h-5 md:w-6 md:h-6" />
    </button>

    <nav class="bg-white border-b border-slate-100 shadow-sm shrink-0">
      <div class="relative max-w-7xl mx-auto flex items-center">
        
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-3 md:py-4 pl-16 pr-10 md:px-6 w-full md:justify-center scroll-smooth">
          <button
            v-for="group in groupedData"
            :key="group.position_id"
            @click="handleTabClick(group.position_id)"
            :class="[
              'px-4 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border shrink-0',
              activeTab === group.position_id 
                ? 'bg-[#3FA3E8] text-white border-[#3FA3E8] shadow-md' 
                : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'
            ]"
          >
            {{ group.position_desc }}
          </button>
        </div>

        <div class="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none md:hidden flex items-center justify-end pr-2">
           <ChevronRightIcon class="w-4 h-4 text-[#3FA3E8] animate-pulse" />
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto p-4 md:p-12">
      <transition-group 
        name="list" 
        tag="div" 
        class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12"
      >
        <div 
          v-for="candidate in currentGroup?.candidates" 
          :key="candidate.member_no"
          class="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm flex flex-col group overflow-hidden"
        >
          <div class="w-full h-[320px] md:h-[450px] overflow-hidden bg-white">
            <img 
              :src="candidate.photo_url" 
              class="w-full h-full object-contain object-top transition-transform duration-1000 group-hover:scale-105"
            />
          </div>

          <div class="p-6 md:p-10">
            <div class="flex items-center gap-2 mb-4">
              <div class="h-1 w-4 bg-[#3FA3E8] rounded-full"></div>
              <span class="text-[9px] font-black uppercase tracking-widest text-[#3FA3E8]">
                {{ candidate.position_desc }}
              </span>
            </div>

            <h3 class="text-xl md:text-3xl font-black text-[#1e3a8a] uppercase leading-tight mb-2">
              {{ candidate.member_name }}
            </h3>
            <p class="text-[9px] font-mono font-bold text-slate-300 tracking-[0.2em] mb-6">
              ID: {{ candidate.member_no }}
            </p>

            <div class="bg-blue-50/50 border border-blue-100/50 p-5 md:p-8 rounded-[1.5rem]">
               <p class="text-slate-700 text-sm md:text-xl leading-relaxed font-medium italic">
                  "{{ candidate.vision }}"
               </p>
            </div>
          </div>
        </div>
      </transition-group>
    </main>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.list-enter-active, .list-leave-active {
  transition: all 0.5s ease-out;
}
.list-enter-from { opacity: 0; transform: translateY(20px); }
.list-leave-to { opacity: 0; position: absolute; }
.list-move { transition: transform 0.5s ease; }
</style>