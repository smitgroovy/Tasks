import { apiRequest } from './client';

export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  enrollment_date: string;
  course: string;
  year: number;
  sgpa?: number;
  status: 'active' | 'inactive' | 'graduated';
  created_at: string;
  updated_at: string;
}

export interface Stats {
  total: number;
  active: number;
  graduated: number;
  averageSgpa: string;
  byCourse: { course: string; count: string }[];
}

const BASE = '/api/students';

export const studentApi = {
  getAll: (params?: { course?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.course) query.append('course', params.course);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    const url = query.toString() ? `${BASE}?${query}` : BASE;
    return apiRequest<Student[]>(url);
  },

  getById: (id: number) =>
    apiRequest<Student>(`${BASE}/${id}`),

  create: (data: any) =>
    apiRequest<Student>(BASE, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: any) =>
    apiRequest<Student>(`${BASE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiRequest<null>(`${BASE}/${id}`, { method: 'DELETE' }),

  getStats: () =>
    apiRequest<Stats>(`${BASE}/stats`),
};
