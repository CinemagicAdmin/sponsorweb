export interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phoneNumber: string;
  countryCode: string;
  country: string | null;
  status: number;
  isOtpVerify: number;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  status: string;
  data: User & {
    token: string;
    refreshToken: string;
    otp?: string | null;
  };
}

export interface RegisterPayload {
  countryCode: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  deviceType?: string;
}

export interface LoginPayload {
  countryCode: string;
  phoneNumber: string;
  deviceType?: string;
}

export interface VerifyOtpPayload {
  otp: string;
  latitude?: string;
  longitude?: string;
}

export interface RefreshPayload {
  refreshToken: string;
}
