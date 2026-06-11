import api from './api';

export const authService = {
  async register(name: string, email: string, password: string) {
    const { data } = await api.post('/auth/register', { name, email, password });
    return data.data;
  },

  async login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    return data.data;
  },

  async refresh(refreshToken: string) {
    const { data } = await api.post('/auth/refresh', { refreshToken });
    return data.data;
  },

  async logout() {
    const { data } = await api.post('/auth/logout');
    return data.data;
  },

  async getMe() {
    const { data } = await api.get('/auth/me');
    return data.data;
  },

  async forgotPassword(email: string) {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },

  async resetPassword(token: string, password: string) {
    const { data } = await api.post('/auth/reset-password', { token, password });
    return data;
  },
};
