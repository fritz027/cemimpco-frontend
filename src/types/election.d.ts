export interface Election {
  year: number;
  from: string;
  to: string;
  start: boolean;
  elecom?: string;
}

export interface ElectionSettingPayload {
  year: number;
  from: string;
  to: string;
  start: boolean;
}

export interface PositionPayload {
  position_id: string;
  position_desc: string;
  position: number;
}

export interface CandidatePayload {
  candidate_id: string;
  elect_year: number;
  position_id: string;
  member_no: string;
  elec_order: number;
  vision: string;
}

export interface VotePayload {
  year: number;
  votes: {
    position_id: string;
    candidate_ids: string[];
  }[];
}

export type VoteResponse = {
  success: boolean;
  ballot_no: number;      // ✅ this is what you need
  total_votes: number;
  message?: string;
}