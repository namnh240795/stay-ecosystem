import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createBooking, fetchBookings, fetchBooking, cancelBooking, modifyBooking } from '../api/bookings';

export function useBookings(params: {
  page?: number;
  limit?: number;
  status?: string;
  branchId?: string;
  apartmentId?: string;
} = {}) {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => fetchBookings(params),
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: () => fetchBooking(id),
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useModifyBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { checkIn?: string; checkOut?: string; guests?: number; notes?: string } }) =>
      modifyBooking(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
