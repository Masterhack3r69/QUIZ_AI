import api from '@/lib/api';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface VerifyOTPData {
  email: string;
  code: string;
}

export const authService = {
  async register(data: RegisterData) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async verifyOTP(data: VerifyOTPData) {
    const response = await api.post('/auth/verify-otp', data);
    return response.data;
  },

  async resendOTP(email: string) {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  }
};
