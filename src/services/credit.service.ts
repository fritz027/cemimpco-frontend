import api from "./api";
type creditPayload = {
  memberNo: string;
  amount: number;
}

export const getStores = () =>  {
  return api.get('/credit/stores');
}

export const getMembers = () => {
  return api.get('/credit/members');
}

export const findMemberMemberNo = (memberNo: string) => {
  return api.get(`/credit/search/member/${memberNo}`);
}

export const newCredit = (payload: creditPayload) => {
  return api.post('/credit/new', {payload});
}