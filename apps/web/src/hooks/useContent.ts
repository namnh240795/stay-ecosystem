import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchLongtermContent,
  updateLongtermContent,
  fetchRefundPolicy,
  updateRefundPolicy,
  fetchVouchers,
} from '../api/content';

export function useLongtermContent() {
  return useQuery({
    queryKey: ['content', 'longterm'],
    queryFn: fetchLongtermContent,
  });
}

export function useUpdateLongtermContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateLongtermContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', 'longterm'] });
    },
  });
}

export function useRefundPolicy() {
  return useQuery({
    queryKey: ['policies', 'refund'],
    queryFn: fetchRefundPolicy,
  });
}

export function useUpdateRefundPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRefundPolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies', 'refund'] });
    },
  });
}

export function useVouchers() {
  return useQuery({
    queryKey: ['vouchers'],
    queryFn: fetchVouchers,
  });
}
