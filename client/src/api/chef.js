import { apiClient } from './client.js';

export const fetchProfile = (token) => apiClient.get('/chef/profile', { token });
export const applyChef = (token, data) => apiClient.post('/chef/apply', data, { token });
export const updateProfile = (token, data) => apiClient.patch('/chef/profile', data, { token });

export const listRecipes = (token, params) => apiClient.get('/chef/recipes', { token, params });
export const createRecipe = (token, data) => apiClient.post('/chef/recipes', data, { token });
export const updateRecipe = (token, id, data) => apiClient.patch(`/chef/recipes/${id}`, data, { token });
export const deleteRecipe = (token, id) => apiClient.del(`/chef/recipes/${id}`, { token });

export const listAnalytics = (token) => apiClient.get('/chef/analytics', { token });
export const replyToReview = (token, recipeId, data) =>
  apiClient.post(`/chef/recipes/${recipeId}/replies`, data, { token });
