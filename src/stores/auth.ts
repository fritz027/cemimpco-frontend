import { defineStore } from "pinia";
import type { AuthState, LoginResponse, User, Survey } from "@/types/auth";
import router from '@/router';
import { BoldIcon } from "@heroicons/vue/24/solid";

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    accessToken: "",
    member: null,
    success: false,
    message: "",
    surveyUser: false,
    elecomUser: false,
    isSurvey: false,
    survey: null,
  }),
  persist: true,
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    getMember: (state) => state.member,
    isSuccess: (state) => state.success,
    getMessage: (state) => state.message,
    isSurveyUser: (state) => state.surveyUser,
    isElecomUser: (state) => state.elecomUser,
    isActivateSurvey: (state) => state.isSurvey,
    getSurvey: (state) => state.survey,
  },

  actions: {
    applyLoginResult(result: LoginResponse) {
      this.success = Boolean((result as any)?.success)
      this.message = (result as any)?.message ?? ''

      this.surveyUser = Boolean((result as any)?.isSurveyUser)
      this.elecomUser = Boolean((result as any)?.isElecomUser)
      this.isSurvey = Boolean((result as any)?.isSurvey)

      if (this.success && (result as any)?.accessToken) {
        this.accessToken = (result as any).accessToken
        localStorage.setItem("accessToken", this.accessToken)
      }

      this.member = (result as any)?.member ?? null
      this.survey = (result as any)?.activeSurveys[0] ?? null
    },

    setAccessToken(token: string) {
      this.accessToken = token;
      localStorage.setItem("accessToken", token);
    },

    setMember(member: User | null) {
      this.member = member;
    },

    setSurvey(survey: Survey | null) {
      this.survey = survey;
    },


    logout() {
      this.accessToken = "";
      this.member = null;
      this.success = false;
      this.message = "";
      this.surveyUser = false;
      this.elecomUser = false;
      this.isSurvey = false;
      localStorage.removeItem("accessToken");
      router.push('/login');
    },
  },
});