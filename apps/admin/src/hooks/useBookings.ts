import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchBookings,
  fetchBooking,
  updateBookingStatus,
} from '../api/bookings';

export function useBookings(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
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

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBookingStatus,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  });
}
