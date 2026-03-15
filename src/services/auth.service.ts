import api from './api';
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  VerifyOtpPayload,
  RefreshPayload,
} from '@/types/auth';

export const authService = {
  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', payload),

  login: (payload: LoginPayload) =>
    api.post<AuthResponse>('/auth/login', payload),

  verifyOtp: (payload: VerifyOtpPayload) =>
    api.post<AuthResponse>('/auth/verify', payload),

  resendOtp: () =>
    api.post<{ status: string; data: { otp?: string } | null }>('/auth/resend'),

  refresh: (payload: RefreshPayload) =>
    api.post<AuthResponse>('/auth/refresh', payload),

  logout: (deviceToken?: string) =>
    api.post('/auth/logout', deviceToken ? { deviceToken } : {}),
};
