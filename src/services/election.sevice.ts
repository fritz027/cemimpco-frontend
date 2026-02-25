import Candidate from "@/pages/component/Dashboard/Candidate.vue";
import api from "./api";
import type { 
  ElectionSettingPayload, 
  PositionPayload,
  CandidatePayload,
  VotePayload,
  VoteResponse
} from "@/types/election";


export const updateElectionSetting = (election: ElectionSettingPayload, token: string) => {
  return api.patch(`/election/update-setting`, { election } , { headers: { Authorization: `Bearer ${token}` } });
}

export const fetchPositions = (token: string) => {
  return api.get('/election/positions', { headers: { Authorization: `Bearer ${token}` } });
}

export const fetchElecomList = (token: string) => {
  return api.get('/election/elecoms', { headers: { Authorization: `Bearer ${token}`}});
}

export const newPosition = (position: PositionPayload, token: string) => {
  return api.post('/election/new/position', { position }, { headers: { Authorization: `Bearer ${token}` } });
}

export const updateElecom = (elecom: string, token: string) => {
  return api.patch('/election/set-elecom', { elecom }, { headers: { Authorization: `Bearer ${token}`} } );
}

export const updatePosition = (position: PositionPayload, token: string) => {
  return api.patch('/election/update-position', { position }, { headers: { Authorization: `Bearer ${token}` }});
}

export const deletePosition = (position: string, token: string) => {
  return api.delete(`/election/delete-position?id=${position}`, { headers: { Authorization: `Bearer ${token}`} });
} 

export const newCandidates = (candidate: CandidatePayload, token: string, file?: File ) => {
  const fd =  new FormData();
  fd.append("candidate", JSON.stringify(candidate));
  if (file) fd.append("photo", file);
;  return api.post('/election/new/candidate',  fd , {
    headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": undefined as any,
    },
  });
}

export const updateCandidate = (candidate: CandidatePayload, token: string, file?: File) => {
  const fd = new FormData();
  fd.append("candidate", JSON.stringify(candidate));
  if (file) fd.append("photo", file);
  return api.patch('/election/update-candidate', fd, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": undefined as any,
    },
  });
}

export const deleteCandidate = (id: string, mno: string, year: number, token: string) => {
  return api.delete(`/election/delete-candidate?id=${id}&mno=${mno}&year=${year}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

export const fetchCandidates = (year: number, token: string) => {
  return api.get(`/election/candidates?year=${year}`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
  });
}


export const fetchElecomUsers = (token: string) => {
  return api.get('/election/elecom-users', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
  
export const addElecomUser = (memberNo: string, token: string) => {
  return api.patch('/election/new/elecom-user', {memberNo: memberNo} , {
    headers: {
      Authorization: `Bearer ${token}`
    },
  });
}

export const removeElecomUser = (memberNo: string, token: string) => {
  return api.patch('/election/remove/elecom-user', {memberNo: memberNo}, {
    headers: {
      Authorization: `Bearer ${token}`
    },
  });
}

export const submitVote = async (
  payload: VotePayload,
  token: string
): Promise<VoteResponse> => {
  const res = await api.post<VoteResponse>(
    "/election/vote",
    payload, {
      headers: {
        Authorization: `Bearer ${token}`
      },
    }
  );

  return res.data;
};

export const memberVoted = (year: number, token: string) => {
  return api.get(`/election/is-voted?year=${year}`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
  });
} 

export const getMemberVoteCasted = (year: number, token: string) => {
  return api.get(`/election/${year}/ballot`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
  });
}

export const getElectionStatus = (year: number, token: string) => {
  return api.get(`/election/${year}/status`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
  });
}