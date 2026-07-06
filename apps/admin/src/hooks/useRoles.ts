import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
} from '../api/roles';

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => fetchRoles(),
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRole,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['roles'] }),
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRole,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['roles'] }),
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRole,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['roles'] }),
  });
}
