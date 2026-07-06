import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchContracts,
  createContract,
  updateContractStatus,
} from '../api/contracts';

export function useContracts(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['contracts', params],
    queryFn: () => fetchContracts(params),
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createContract,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['contracts'] }),
  });
}

export function useUpdateContractStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateContractStatus,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['contracts'] }),
  });
}
