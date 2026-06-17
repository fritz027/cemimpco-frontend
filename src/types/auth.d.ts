export interface LoginPayload {
  memberNo: string
  password: string;
}

export interface CreditLoginPayload {
  username: string;
  password: stirng;
  store: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  isSurveyUser: boolean;
  isElecomUser: boolean;
  isSurvey: boolean;
  activeSurveys?: Survey;
  member?: User;
  accessToken?: string;
}

export interface RegisterPayload {
  memberNo: string;
  memberName: string;
  email: string;
  password: string;
  branch?:  string;
}

export interface User {
  memberNo: string;
  email: string;
  name: string;
  verified: boolean;
  type: string;
  mobileNo?: string;
}



export interface AuthState {
  accessToken: string;
  member: User | null;
  success: boolean;
  message: string;
  surveyUser: boolean;
  elecomUser: boolean;
  isSurvey: boolean;
  survey?: Survey | null;
}

export interface AuthCreditState {
  store: string;
  loggedIn: boolean;
}

export interface Survey {
  survey_id: string;
  survey_name: string;
  total_question: number;
  status: "1" | "0";
}
