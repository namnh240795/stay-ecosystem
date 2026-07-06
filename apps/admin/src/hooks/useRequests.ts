import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchRequests,
  createRequest,
  updateRequestStatus,
} from '../api/requests';

export function useRequests(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['requests', params],
    queryFn: () => fetchRequests(params),
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRequest,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['requests'] }),
  });
}

export function useUpdateRequestStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRequestStatus,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['requests'] }),
  });
}
