import api from './api';
import type { User } from '@/types/auth';

interface UpdateProfilePayload {
  firstName: string;
  lastName?: string;
  email: string;
}

export const userService = {
  updateProfile: (payload: UpdateProfilePayload) =>
    api.put<{ status: string; data: User }>('/users/edit-profile', payload),

  updateProfileWithImage: (formData: FormData) =>
    api.put<{ status: string; data: User }>('/users/edit-profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
