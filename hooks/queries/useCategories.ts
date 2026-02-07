import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, addCategory, updateCategory, deleteCategory } from '@api/categories';
import { Category, ID, CreateCategoryDTO, UpdateCategoryDTO } from 'schemas';

// --- Fetch all categories ---
export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await getCategories();
      return res as unknown as Category[];
    },
    staleTime: 1000 * 60,
    retry: 1,
  });
};

// --- Add category ---
export const useAddCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async(data: CreateCategoryDTO) => {
      const res = await addCategory(data);
      return res as unknown as Category;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

// --- Update category ---
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async({ id, data }: { id: ID; data: UpdateCategoryDTO }) => {
      return await updateCategory(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

// --- Delete category ---
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: ID) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
