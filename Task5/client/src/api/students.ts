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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  error?: string;
}

async function handleResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const text = await res.text();
  try {
    const json = JSON.parse(text) as ApiResponse<T>;
    if (!res.ok) {
      throw new Error(json.error || `Request failed with status ${res.status}`);
    }
    return json;
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw new Error(`Server returned invalid JSON (status ${res.status}): ${text.slice(0, 200)}`);
    }
    throw e;
  }
}

export const studentApi = {
  getAll: async (params?: { course?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.course) query.append('course', params.course);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    const url = query.toString() ? `${API_BASE}?${query}` : API_BASE;
    const res = await fetch(url);
    return handleResponse<Student[]>(res);
  },

  getById: async (id: number) => {
    const res = await fetch(`${API_BASE}/${id}`);
    return handleResponse<Student>(res);
  },

  create: async (data: { first_name: string; last_name: string; email: string; phone?: string; date_of_birth?: string; course: string; year: number; sgpa?: number; status: string }) => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Student>(res);
  },

  update: async (id: number, data: Partial<Student>) => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Student>(res);
  },

  delete: async (id: number) => {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    return handleResponse<null>(res);
  },

  getStats: async () => {
    const res = await fetch(`${API_BASE}/stats`);
    return handleResponse<Stats>(res);
  },
};
