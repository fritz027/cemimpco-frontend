import api from "./api";

import type { LoginPayload, RegisterPayload } from '@/types/auth';

export const electionConfig = () => {
  return api.get('/auth/election-setting');
}

export const allowedElecom = () => {
  return api.get('/auth/elecom');
}

export const login = (payLoad: LoginPayload) => {
  return api.post('/auth/login', payLoad);
}

export const register = (payLoad: RegisterPayload) => {
  return api.post('/auth/register', payLoad);
}

export const candidates = (year: number) => {
  return api.get(`/auth/election/candidates?year=${year}`);
}


