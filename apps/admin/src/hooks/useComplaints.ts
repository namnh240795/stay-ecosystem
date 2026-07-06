import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchComplaints,
  createComplaint,
  updateComplaintStatus,
} from '../api/complaints';

export function useComplaints(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['complaints', params],
    queryFn: () => fetchComplaints(params),
  });
}

export function useCreateComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createComplaint,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['complaints'] }),
  });
}

export function useUpdateComplaintStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateComplaintStatus,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['complaints'] }),
  });
}
