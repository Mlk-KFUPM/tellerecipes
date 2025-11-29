import { apiClient } from './client.js';

export const fetchProfile = (token) => apiClient.get('/user/profile', { token });

export const updateProfile = (token, data) => apiClient.patch('/user/profile', data, { token });

export const changePassword = (token, data) => apiClient.patch('/user/password', data, { token });

export const listRecipes = (params) => apiClient.get('/user/recipes', { params });

export const getRecipe = (id) => apiClient.get(`/user/recipes/${id}`);

export const toggleSaveRecipe = (token, id, body) =>
  apiClient.post(`/user/recipes/${id}/save`, body, { token });

export const listCollections = (token) => apiClient.get('/user/collections', { token });

export const createCollection = (token, data) => apiClient.post('/user/collections', data, { token });

export const updateCollection = (token, id, data) => apiClient.patch(`/user/collections/${id}`, data, { token });

export const deleteCollection = (token, id) => apiClient.del(`/user/collections/${id}`, { token });

export const getShoppingList = (token) => apiClient.get('/user/shopping-list', { token });

export const updateShoppingList = (token, recipeIds) =>
  apiClient.post(
    '/user/shopping-list',
    { recipeIds },
    { token },
  );

export const clearShoppingList = (token) => apiClient.del('/user/shopping-list', { token });

export const removeFromShoppingList = (token, id) =>
  apiClient.del(`/user/shopping-list/recipes/${id}`, { token });

export const listReviews = (id) => apiClient.get(`/user/recipes/${id}/reviews`);

export const addReview = (token, id, data) => apiClient.post(`/user/recipes/${id}/reviews`, data, { token });
