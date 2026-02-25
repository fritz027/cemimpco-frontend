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

export const checkEmail = (email: string) => {
  return api.get(`/auth/web-users/check-email?email=${email}`);
}

export const verifyEmail = (memberNo: string, email: string) => {
  return api.get(`/auth/web-users/verify-email?memberNo=${memberNo}&email=${email}`);
}

export const verifyMemberNo = (memberNo: string) => {
  return api.get(`/auth/web-users/verify-member?memberNo=${memberNo}`);
}

export const verifyTIN = (memberNo: string, tin: string) => {
  return api.get(`/auth/web-users/verify-tin?memberNo=${memberNo}&tin=${tin}`);
}

export const verifyDOB = (memberNo: string, dob: string) => {
  return api.get(`/auth/web-users/verify-dob?memberNo=${memberNo}&dob=${dob}`);
}

export const resendConfirmationEmail = (memberNo: string) => {
  return api.post(`/auth/email/resend-confirmation`, { memberNo });
}

export const activateLogin = (token: string) => {
  return api.post(`/auth/activate?token=${token}`);
}

export const forgotPassword = (memberNo: string, email: string) => {
  return api.post('/auth/forgot-password',{ memberNo, email });
}

export const resetPassword = (token: string, password: string) => {
  return api.post('/auth/reset-password', {token, password});
}