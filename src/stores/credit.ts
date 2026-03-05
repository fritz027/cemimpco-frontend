import { defineStore } from "pinia";
import type { AuthCreditState } from "@/types/auth";
import router from '@/router';

export const useCreditStore = defineStore("creditAuth", {
  state: (): AuthCreditState => ({
    store: "",
    loggedIn: false,
  }),
  persist: true,
  getters: {
    getStore: (state) => state.store,
    isLoggedIn: (state) => state.loggedIn,
  },

  actions: {
    setCreditLogin(payload: AuthCreditState) {
      this.store = payload.store;
      this.loggedIn = payload.loggedIn;
    },
    logout() {
      this.store = "";
      this.loggedIn = false;
      router.push('/creditlimit');
    },
  },
});