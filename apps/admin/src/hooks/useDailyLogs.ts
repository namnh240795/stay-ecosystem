import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchDailyLogs,
  createDailyLog,
} from '../api/dailyLogs';

export function useDailyLogs(params: {
  page?: number;
  limit?: number;
  date?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['dailyLogs', params],
    queryFn: () => fetchDailyLogs(params),
  });
}

export function useCreateDailyLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDailyLog,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['dailyLogs'] }),
  });
}
