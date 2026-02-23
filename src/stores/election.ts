import { defineStore } from "pinia";
import type { Election } from "@/types/election";
import router from '@/router';


export const useElectionStore = defineStore("election", {
  state: (): Election => ({
    year: 2000,
    from: '2025-01-10',
    to: '2025-01-10',
    start: false,
    elecom: "",
  }),
  persist: true,
  getters: {
    getYear: (state) => state.year,
    getDateFrom: (state) => state.from,
    getDateTo: (state) => state.to,
    getStartElection: (state) => state.start,
    getElecoms: (state) => state.elecom,
  },

  actions: {
    setYear(year: number) {
      this.year = year
    },
    setDateFrom(from: string) {
      this.from = from;
    },
    setDateTo(to: string) {
      this.to = to;
    },
    setStartElection(start: boolean){
      this.start = start;
    },
    setElecoms(elecoms: string){
      this.elecom = elecoms
    }
  },
});