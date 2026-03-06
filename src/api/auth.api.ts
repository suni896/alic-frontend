import apiClient from '../lib/apiClient';

// Types
export interface LoginRequest {
  userEmail: string;
  password: string;
}

export interface LoginResponse {
  code: number;
  message: string;
  data: {
    'Bearer Token': string;
  };
}

export interface RegisterRequest {
  userEmail: string;
  userName: string;
  password: string;
}

export interface SendMailRequest {
  userEmail: string;
  userName?: string;
  password?: string;
  type: '1' | '3'; // '1' for register, '3' for reset
}

export interface SendMailResponse {
  code: number;
  message: string;
  data?: unknown;
}

export interface VerifyCodeRequest {
  email: string;
  verifiCode: string;
  type: '1' | '3'; // '1' for register, '3' for reset
}

export interface VerifyCodeResponse {
  code: number;
  message: string;
  data: {
    token: string;
  };
}

export interface ResetPasswordRequest {
  newPassword: string;
  token: string;
  type: '3';
  userEmail: string;
}

export interface ResetPasswordResponse {
  code: number;
  message: string;
  data?: unknown;
}

// API functions
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/auth/login', data);
  return response.data;
};

export const sendVerificationEmail = async (data: SendMailRequest): Promise<SendMailResponse> => {
  const response = await apiClient.post<SendMailResponse>('/auth/sendmail', data);
  return response.data;
};

export const verifyCode = async (data: VerifyCodeRequest): Promise<VerifyCodeResponse> => {
  const response = await apiClient.post<VerifyCodeResponse>('/auth/verify_code', data);
  return response.data;
};

export const resetPassword = async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
  const response = await apiClient.post<ResetPasswordResponse>('/auth/reset', data);
  return response.data;
};
