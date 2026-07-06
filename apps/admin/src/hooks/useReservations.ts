import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchReservations,
  fetchReservation,
  createReservation,
  updateReservationStatus,
} from '../api/reservations';

export function useReservations(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['reservations', params],
    queryFn: () => fetchReservations(params),
  });
}

export function useReservation(id: string) {
  return useQuery({
    queryKey: ['reservations', id],
    queryFn: () => fetchReservation(id),
    enabled: !!id,
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createReservation,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['reservations'] }),
  });
}

export function useUpdateReservationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateReservationStatus,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['reservations'] }),
  });
}
