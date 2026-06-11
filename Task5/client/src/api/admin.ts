import { apiRequest } from './client';
import { User } from './auth';

export interface AdminApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  error?: string;
}

export const adminApi = {
  getUsers: () =>
    apiRequest<User[]>('/api/admin/users'),

  getUserById: (id: number) =>
    apiRequest<User>(`/api/admin/users/${id}`),

  createUser: (data: { email: string; password: string; first_name: string; last_name: string; role?: string }) =>
    apiRequest<User>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateUser: (id: number, data: { first_name?: string; last_name?: string; role?: string; is_active?: boolean }) =>
    apiRequest<User>(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteUser: (id: number) =>
    apiRequest<null>(`/api/admin/users/${id}`, {
      method: 'DELETE',
    }),
};
