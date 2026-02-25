export interface LoginPayload {
  memberNo: string
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
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
}



export interface AuthState {
  accessToken: string;
  member: User | null;
  success: boolean;
  message: string;
}