import { apiClient } from './client.js';

export const fetchDashboard = (token) => apiClient.get('/admin/dashboard', { token });
export const listUsers = (token, params) => apiClient.get('/admin/users', { token, params });
export const updateUserStatus = (token, id, status) =>
  apiClient.patch(`/admin/users/${id}/status`, { status }, { token });
export const updateUserRole = (token, id, role) =>
  apiClient.patch(`/admin/users/${id}/role`, { role }, { token });
export const deleteUser = (token, id) => apiClient.del(`/admin/users/${id}`, { token });

export const listCategories = (token, params) => apiClient.get('/admin/categories', { token, params });
export const createCategory = (token, data) => apiClient.post('/admin/categories', data, { token });
export const updateCategory = (token, id, data) => apiClient.patch(`/admin/categories/${id}`, data, { token });
export const deleteCategory = (token, id, force = false) =>
  apiClient.del(`/admin/categories/${id}?force=${force}`, { token });

export const listPendingRecipes = (token) => apiClient.get('/admin/recipes', { token });
export const moderateRecipe = (token, id, data) => apiClient.patch(`/admin/recipes/${id}`, data, { token });

export const listFlags = (token) => apiClient.get('/admin/flags', { token });
export const resolveFlag = (token, id, data) => apiClient.patch(`/admin/flags/${id}`, data, { token });
