import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchUsers,
  fetchUser,
  updateUserRole,
} from '../api/users';

export function useUsers(params: {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => fetchUsers(params),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => fetchUser(id),
    enabled: !!id,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUserRole,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}
