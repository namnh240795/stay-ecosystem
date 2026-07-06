import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchStaff,
  fetchStaffMember,
  createStaff,
  updateStaff,
  updateStaffStatus,
  deleteStaff,
} from '../api/staff';

export function useStaff(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['staff', params],
    queryFn: () => fetchStaff(params),
  });
}

export function useStaffMember(id: string) {
  return useQuery({
    queryKey: ['staff', id],
    queryFn: () => fetchStaffMember(id),
    enabled: !!id,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStaff,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['staff'] }),
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStaff,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['staff'] }),
  });
}

export function useUpdateStaffStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStaffStatus,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['staff'] }),
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStaff,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['staff'] }),
  });
}
