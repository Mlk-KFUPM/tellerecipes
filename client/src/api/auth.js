import { apiClient } from './client.js';

export const login = async (credentials) =>
  apiClient.post('/auth/login', credentials).then((res) => ({
    user: res.user,
    accessToken: res.accessToken,
  }));

export const register = async (data) =>
  apiClient.post('/auth/register', data).then((res) => ({
    user: res.user,
    accessToken: res.accessToken,
  }));

export const logout = async (token) => apiClient.post('/auth/logout', {}, { token });
