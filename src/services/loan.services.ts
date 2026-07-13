import api from "./api";

export const memberLoan = (loanId: string, token: string) => {
  return api.get(`/loan?loanId=${loanId}`, { headers: { Authorization: `Bearer ${token}` } });
}

export const getLoanApplications = (status: string, token: string) => {
  return api.get(`/loan/loan-applications?status=${status}`, { headers: { Authorization: `Bearer ${token}` } });
}

export const getMemberMobileNo = (token: string) => {
  return api.get(`/loan/member-mobile`, { headers: { Authorization: `Bearer ${token}` } });
}

export const getLoanTypes = (token: string) => {
  return api.get(`/loan/loan-types`, { headers: { Authorization: `Bearer ${token}` } });
}

export const getLoanApplicationType = (loanType: string, token: string) => {
  return api.get(`/loan/loan-application-type?type=${loanType}`, { headers: {Authorization: `Bearer ${token}` } });
}

export const getShareCapitalLoanLimit = (token: string) => {
  return api.get(`/loan/share-capital`, { headers: { Authorization: `Bearer ${token}` } });
}

export const sendOTPMessage = (number: string, token: string) => {
  return api.post(`/loan/send-otp`, { number }, { headers: { Authorization: `Bearer ${token}` } });
}

export const checkExpiredOTP = (number: string, token: string) => {
  return api.post(`/loan/check-expired-otp`, { number }, { headers: { Authorization: `Bearer ${token}` } });
}

export const verifyOTP = (number: string, otp: string, token: string) => {
  return api.post(`/loan/verify-otp`, { number, otp }, { headers: { Authorization: `Bearer ${token}` } });
}

export const SaveLoanApplicationWithAttachements = (data: FormData, token: string) => {
  return api.post(`/loan/save-loan-application`, data, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
}

export const getMemberCompanyId = (token: string) => {
  return api.get(`/loan/member-id-picture`, { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' });
}

export const getMemberPersonalInformation = (token: string) => {
  return api.get(`/loan/member-personal-information`, { headers: { Authorization: `Bearer ${token}` } });
}
