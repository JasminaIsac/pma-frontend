import apiClient from './client';
import { Category, ID, CreateCategoryDTO, UpdateCategoryDTO } from 'schemas';

export const getCategories = async () => {
  return await apiClient.get<Category[]>('/categories');
};

export const addCategory = async(
  category: CreateCategoryDTO
) => {
  const res = await apiClient.post<Category>('/categories', category);
  return res;
};

export const updateCategory = async(
  id: ID,
  categoryData: UpdateCategoryDTO
) => {
  return await apiClient.patch<Category>(`/categories/${id}`, categoryData);
};

export const deleteCategory = async(id: ID) => {
  return await apiClient.delete<void>(`/categories/${id}`);
};
