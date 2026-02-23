import api from "./api";

export const memberLoan = (loanId: string, token: string) => {
  return api.get(`/loan?loanId=${loanId}`, { headers: { Authorization: `Bearer ${token}` } });
}