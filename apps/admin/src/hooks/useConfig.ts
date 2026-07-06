import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchConfig,
  updateConfig,
} from '../api/config';

export function useConfig(section: string) {
  return useQuery({
    queryKey: ['config', section],
    queryFn: () => fetchConfig(section),
    enabled: !!section,
  });
}

export function useUpdateConfig(section: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => updateConfig(section, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['config', section] }),
  });
}
