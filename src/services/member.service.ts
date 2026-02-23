import api from "./api";
import type { MemberSearchPayload } from "@/types/member";

export const memberProfile = (token: string) => {
  return api.get('/member/', { headers: { Authorization: `Bearer ${token}` } });
}

export const memberDeposits = (token: string) => {
  return api.get('/member/deposits' ,{ headers: { Authorization: `Bearer ${token}` } });
}

export const memberLoans = (token: string) => {
  return api.get('/member/loans', { headers: { Authorization: `Bearer ${token}` } });
}

export const memberTimeDeposits = (token: string) => {
  return api.get('/member/time-deposits', { headers: { Authorization: `Bearer ${token}` } });
}

export const memberStoreCredit = (memberNo: string, token: string) => {
  return api.get(`/member/credit/history?memberNo=${memberNo}`, { headers: { Authorization: `Bearer ${token}` } });
}

export const memberDeposit = (depositType: string, token: string) => {
  return api.get(`/deposit?code=${depositType}`, { headers: { Authorization: `Bearer ${token}`}})  
}

export const searchMember = (keyword: string, token: string) => {
  return api.get(`/member/search?q=${keyword}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};