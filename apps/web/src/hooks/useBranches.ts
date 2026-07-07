import { useQuery } from '@tanstack/react-query';
import { fetchBranches, fetchBranch } from '../api/branches';

export function useBranches(params: { city?: string; search?: string } = {}) {
  return useQuery({
    queryKey: ['branches', params],
    queryFn: () => fetchBranches(params),
  });
}

export function useBranch(id: string) {
  return useQuery({
    queryKey: ['branches', id],
    queryFn: () => fetchBranch(id),
    enabled: !!id,
  });
}
