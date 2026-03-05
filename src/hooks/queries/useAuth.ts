import { useMutation } from '@tanstack/react-query';
import {
  login,
  sendVerificationEmail,
  verifyCode,
  resetPassword,
  type LoginRequest,
  type SendMailRequest,
  type VerifyCodeRequest,
  type ResetPasswordRequest,
} from '../../api/auth.api';

// Mutation: Login
export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
  });
}

// Mutation: Send verification email (for register)
export function useSendRegisterEmail() {
  return useMutation({
    mutationFn: (data: Omit<SendMailRequest, 'type'>) => 
      sendVerificationEmail({ ...data, type: '1' }),
  });
}

// Mutation: Send reset password email
export function useSendResetEmail() {
  return useMutation({
    mutationFn: (data: Omit<SendMailRequest, 'type'>) => 
      sendVerificationEmail({ ...data, type: '3' }),
  });
}

// Mutation: Verify OTP code
export function useVerifyCode() {
  return useMutation({
    mutationFn: (data: VerifyCodeRequest) => verifyCode(data),
  });
}

// Mutation: Resend verification code
export function useResendCode() {
  return useMutation({
    mutationFn: (data: { userEmail: string; type: '1' | '3' }) => 
      sendVerificationEmail(data),
  });
}

// Mutation: Reset password
export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => resetPassword(data),
  });
}
