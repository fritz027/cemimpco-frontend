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
      this.success = Boolean(result.success)
      this.message = result.message ?? ''

      this.surveyUser = Boolean(result.isSurveyUser)
      this.elecomUser = Boolean(result.isElecomUser)
      this.isSurvey = Boolean(result.isSurvey)


      if (this.success && result.accessToken) {
        this.accessToken = result.accessToken
        localStorage.setItem("accessToken", this.accessToken)
      }

      this.member = result.member ?? null
      this.survey = result.activeSurveys ?? null
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
      this.survey = null;
      localStorage.removeItem("accessToken");
      router.push('/login');
    },
  },
});
