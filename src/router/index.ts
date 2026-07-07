import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/LoginOld.vue';
import Login from '../pages/LoginPage.vue';
import Profile from '../pages/ProfilePage.vue';
import LoanProfile from '../pages/LoanProfile.vue';
import DepositProfile from '../pages/DepositProfile.vue';
import CreditProfile from '../pages/CreditProfile.vue';
import DashboardElecom from '../pages/ElecomDashboard.vue';
import DashboarOverview from '@/pages/component/Dashboard/DashboarOverview.vue';
import ElectionDate from '@/pages/component/Dashboard/ElectionDate.vue';
import Position from '@/pages/component/Dashboard/Position.vue';
import Candidate from '@/pages/component/Dashboard/Candidate.vue';
import Access from '@/pages/component/Dashboard/Access.vue';
import BallotPage from '@/pages/BallotPage.vue';
import VoteConfirmation from '@/pages/component/Dashboard/VoteConfirmation.vue';
import ConfirmPage from '@/pages/confirmPage.vue';
import ResetPassword from '@/pages/component/LoginPage/ResetPasswordPage.vue';
import ElectionResult from '@/pages/component/Dashboard/ElectionResult.vue';
import DashboardSuvery from '@/pages/SurveyDashboard.vue';
import SurveyList from '@/pages/component/Survey/SurveyList.vue';
import SurveyDetails from '@/pages/component/Survey/SurveyDetails.vue';
import SurveyOverview from '@/pages/component/Survey/SurveyOverview.vue';
import SurveyPage from '@/pages/SurveyPage.vue';
import SurveyListResult from '@/pages/component/Survey/SurveyListResult.vue';
import SurveyQuestionResult from '@/pages/component/Survey/SurveyQuestionResult.vue';
import CreditLogin from '@/pages/component/Credit/CreditLogin.vue';
import CreditPage from '@/pages/component/Credit/CreditPage.vue';
import SurveyAccess from '@/pages/component/Survey/SurveyAccess.vue';
import ViewCandidates from '@/pages/ViewCandidates.vue';
import PatronageDividend from '@/pages/PatronageDividend.vue';
import LoanApplications from '@/pages/component/Loan/LoanApplications.vue';
import LoanApplication from '@/pages/component/Loan/LoanApplication.vue';
import LoanApplicationSteps from '@/pages/component/Loan/LoanApplicationSteps.vue';
import { useAuthStore } from "@/stores/auth";
import { useElectionStore } from '@/stores/election';
import { useCreditStore } from '@/stores/credit';




const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", redirect: "/login" },
    {
      path: "/login",
      name: "Login",
      component: Login,
      meta: { guestOnly: true }, // ✅ only for not-logged-in users
    },

    {
      path: "/profile",
      name: "Profile",
      component: Profile,
      meta: { requiresAuth: true },
    },
    {
      path: "/loan/:loanId",
      name: "LoanProfile",
      component: LoanProfile,
      meta: { requiresAuth: true },
    },
    {
      path: "/deposit/:code",
      name: "DepositProfile",
      component: DepositProfile,
      meta: { requiresAuth: true },
    },
    {
      path: "/credit-history",
      name: "CreditProfile",
      component: CreditProfile,
      meta: { requiresAuth: true },
    },
    {
      path: '/patronage-dividend',
      name: 'PatronageDividend',
      component: PatronageDividend,
      meta: { requiresAuth: true, isMemberRegular: true },
    },
    {
      path: '/ballot',
      name: "BallotPage",
      component: BallotPage,
      meta: { requiresAuth: true, isElection: true, electionDate: true, isMemberRegular: true },
    },
    {
      path: '/vote-confirmation',
      name: "VoteConfirmation",
      component: VoteConfirmation,
      meta: { requiresAuth: true, isMemberRegular: true  },
    },
    {
      path: '/confirm',
      name: 'ConfirmEmail',
      component: ConfirmPage,
      meta: { guestOnly: true }
    },
    {
      path: '/survey/:memberNo/:id',
      name: 'SurveyPage',
      component: SurveyPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/reset/password',
      name: 'ResetPassword',
      component: ResetPassword,
      meta: { guestOnly: true }
    },
    {
      path: '/view-candidates/:year',
      name: 'ViewCandidates',
      component: ViewCandidates,
      meta: { requiresAuth: true, isElection: true, isMemberRegular: true  },
    },
    {
      path: '/loan-application',
      name: 'LoanApplication',
      component: LoanApplications,
      meta: { requiresAuth: true, isMemberRegular: true, isUnderConstruction: true  },
    },
    {
      path: '/loan-application/:memberNo',
      name: 'LoanApplicationForm',
      component: LoanApplication,
      meta: { requiresAuth: true, isMemberRegular: true, isUnderConstruction: true  },
      props: true,
    },
    {
      path: '/loan-application-steps/:memberNo',
      name: 'LoanApplicationSteps',
      component: LoanApplicationSteps,
      meta: { requiresAuth: true, isMemberRegular: true, isUnderConstruction: true  },
      props: true,
    },
    {
      path: "/dashboard-elecom",
      name: "DashboardElecom",
      component: DashboardElecom,
      meta: { requiresAuth: true, requiresElecom: true },
      children: [
        {
          path: '/overview',
          name: 'DashboarOverview',
          component: DashboarOverview
        },
        {
          path: '/election-date',
          name: 'ElectionDate',
          component: ElectionDate,
        },
        {
          path: '/positions',
          name: 'Position',
          component: Position
        },
        {
          path: '/candidates',
          name: 'Candidate',
          component: Candidate,
        },
        {
          path: '/access',
          name: "Access",
          component: Access,
        },
        {
          path: '/election-result',
          name: "ElectionResult",
          component: ElectionResult,
        }
      ]
    },
    {
      path: "/dashboard-survey",
      name: "DashboardSuvery",
      component: DashboardSuvery,
      meta: { requiresAuth: true, requiresSurvey: true },
      children: [
        {
          path: "/survey-overview",
          name: "SurveyOverview",
          component: SurveyOverview,
        },
        {
          path: "/survey-list",
          name: "SurveyList",
          component: SurveyList,
        },
        {
          path: '/survey-preview/:id',
          name: 'SurveyPagePreview',
          component: SurveyPage,
          meta: { requiresAuth: true },
        },
        {
          path: '/survey-list/:id/details',
          name: "SurveyDetails",
          component: SurveyDetails,
          props: true,
        },
        {
          path: '/survey-result',
          name: 'SurveyListResult',
          component: SurveyListResult
        },
        {
          path: '/survey-result/:id',
          name: 'SurveyQuestionResult',
          component: SurveyQuestionResult
        },
        {
          path: '/survey-access',
          name: 'SurveyAccess',
          component: SurveyAccess,
        }

      ]
    },
    {
      path: '/creditlimit',
      name: 'CreditLogin',
      component: CreditLogin,
      meta: { guestOnly: true },
    },
    {
      path: '/credit',
      name: 'CreditPage',
      component: CreditPage,
      meta: { requiresCreditAuth: true }
    },
  ],

});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  const electionStore = useElectionStore();
  const creditStore = useCreditStore();

  const isAuth = authStore.isAuthenticated;
  const isElecom = authStore.isElecomUser;
  const isSurvey = authStore.isSurveyUser;
  const isCreditLogged = creditStore.isLoggedIn;
  const isElection = electionStore.start;
  const meberType = authStore.member?.type;


  // ✅ auth
  if (to.meta.requiresAuth && !isAuth) {
    return { name: "Login" };
  }

  // ✅ guest-only
  if (to.meta.guestOnly && isAuth) {
    return { name: "Profile" };
  }

  // ✅ elecom-only
  if (to.meta.requiresElecom) {
    if (!isElecom) {
      return { name: "Profile" }; // or { name: "NotAuthorized" } / { path: "/" }
    }
  }

  if (to.meta.isUnderConstruction) {
    const laSettings = authStore.getLaSettings;

    const canProceed = !laSettings?.laUnderConstruction || !!laSettings?.laUsers;
    if (!canProceed) {
      return { name: "Profile" };
    }
  }

  if (to.meta.isElection) {
    if (!isElection) {
      return { name: "Profile" };
    }
  }

  if (to.meta.requiresSurvey) {
    if (!isSurvey) {
      return { name: "Profile" };
    }
  }

  if (to.meta.requiresCreditAuth) {
    if (!isCreditLogged) {
      return { name: "CreditLogin" };
    }
  }

  if (to.meta.electionDate) {
    const now = Date.now();
    const startDate = new Date(electionStore.from).getTime();
    const endDate = new Date(electionStore.to).getTime();

    // Check if current time is outside the election window
    if (now < startDate || now > endDate) {
      console.warn("Election is not currently active.");
      return { name: "Profile" };
    }
  }

  if (to.meta.isMemberRegular) {
    if (meberType !== 'R') {
      return { name: "Profile" };
    }
  }

  return true;
});

export default router;

