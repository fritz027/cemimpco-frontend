import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/LoginOld.vue';
import Login from '../pages/LoginPage.vue';
import Profile from '../pages/Profile.vue';
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
import { useAuthStore } from "@/stores/auth";
import { useElectionStore } from '@/stores/election';



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
      path: '/ballot',
      name: "BallotPage",
      component: BallotPage,
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
        }
      ]
    }
  ],
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  const electionStore = useElectionStore();

  const isAuth = authStore.isAuthenticated;

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
    const memberNo = authStore.member?.memberNo;

    // If your elecom list is loaded via API and might still be empty,
    // you can optionally fetch it here (only if you have an action):
    // if (!electionStore.elecom?.length) await electionStore.loadElecom();

    const allowed = !!memberNo && Array.isArray(electionStore.elecom)
      && electionStore.elecom.includes(memberNo);

    if (!allowed) {
      return { name: "Profile" }; // or { name: "NotAuthorized" } / { path: "/" }
    }
  }

  return true;
});

export default router;

