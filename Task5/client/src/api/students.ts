const API_BASE = '/api/students';

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
  gpa?: number;
  status: 'active' | 'inactive' | 'graduated';
  created_at: string;
  updated_at: string;
}

export interface Stats {
  total: number;
  active: number;
  graduated: number;
  averageGpa: string;
  byCourse: { course: string; count: string }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  error?: string;
}

export const studentApi = {
  getAll: async (params?: { course?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.course) query.append('course', params.course);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    const url = query.toString() ? `${API_BASE}?${query}` : API_BASE;
    const res = await fetch(url);
    return res.json() as Promise<ApiResponse<Student[]>>;
  },

  getById: async (id: number) => {
    const res = await fetch(`${API_BASE}/${id}`);
    return res.json() as Promise<ApiResponse<Student>>;
  },

  create: async (data: Omit<Student, 'id' | 'enrollment_date' | 'created_at' | 'updated_at'>) => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json() as Promise<ApiResponse<Student>>;
  },

  update: async (id: number, data: Partial<Student>) => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json() as Promise<ApiResponse<Student>>;
  },

  delete: async (id: number) => {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    return res.json() as Promise<ApiResponse<null>>;
  },

  getStats: async () => {
    const res = await fetch(`${API_BASE}/stats`);
    return res.json() as Promise<ApiResponse<Stats>>;
  },
};
