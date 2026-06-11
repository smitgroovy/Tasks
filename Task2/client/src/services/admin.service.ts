import api from './api';

export const adminService = {
  async getUsers(params?: { page?: number; limit?: number; search?: string; role?: string; isActive?: string }) {
    const { data } = await api.get('/admin/users', { params });
    return data.data;
  },

  async getUserById(id: string) {
    const { data } = await api.get(`/admin/users/${id}`);
    return data.data;
  },

  async updateUserRole(id: string, role: string) {
    const { data } = await api.patch(`/admin/users/${id}/role`, { role });
    return data.data;
  },

  async toggleUserStatus(id: string) {
    const { data } = await api.patch(`/admin/users/${id}/toggle-status`);
    return data.data;
  },

  async updateUser(id: string, userData: { name?: string; email?: string }) {
    const { data } = await api.patch(`/admin/users/${id}`, userData);
    return data.data;
  },

  async deleteUser(id: string) {
    const { data } = await api.delete(`/admin/users/${id}`);
    return data.data;
  },

  async getStats() {
    const { data } = await api.get('/admin/stats');
    return data.data;
  },

  async getAuditLogs(params?: { page?: number; limit?: number }) {
    const { data } = await api.get('/admin/audit-logs', { params });
    return data.data;
  },
};
