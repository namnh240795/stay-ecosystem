import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchLeaveRequests,
  createLeaveRequest,
  updateLeaveRequestStatus,
} from '../api/leaveRequests';

export function useLeaveRequests(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['leaveRequests', params],
    queryFn: () => fetchLeaveRequests(params),
  });
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLeaveRequest,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] }),
  });
}

export function useUpdateLeaveRequestStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateLeaveRequestStatus,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] }),
  });
}
