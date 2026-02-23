import { defineStore } from "pinia";
import type { AuthState, LoginResponse, User } from "@/types/auth";
import router from '@/router';

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    accessToken: "",
    member: null,
    success: false,
    message: "",
  }),
  persist: true,
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    getMember: (state) => state.member,
    isSuccess: (state) => state.success,
    getMessage: (state) => state.message,
  },

  actions: {
    applyLoginResult(result: LoginResponse) {
      this.success = result.success;
      this.message = result.message;

      if (result.success && result.accessToken) {
        this.accessToken = result.accessToken;
        localStorage.setItem("accessToken", result.accessToken);
      }

      this.member = result.member ?? null;
    },

    setAccessToken(token: string) {
      this.accessToken = token;
      localStorage.setItem("accessToken", token);
    },

    setMember(member: User | null) {
      this.member = member;
    },

    logout() {
      this.accessToken = "";
      this.member = null;
      this.success = false;
      this.message = "";
      localStorage.removeItem("accessToken");
      router.push('/login');
    },
  },
});