import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTours, fetchTour, bookTour, fetchTourBookings, cancelTourBooking } from '../api/tours';

export function useTours(params: {
  page?: number;
  limit?: number;
  status?: string;
  branchId?: string;
  search?: string;
} = {}) {
  return useQuery({
    queryKey: ['tours', params],
    queryFn: () => fetchTours(params),
  });
}

export function useTour(id: string) {
  return useQuery({
    queryKey: ['tours', id],
    queryFn: () => fetchTour(id),
    enabled: !!id,
  });
}

export function useBookTour() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: {
      id: string;
      data: {
        customerName: string;
        customerEmail: string;
        customerPhone?: string;
        date: string;
        participants: number;
      };
    }) => bookTour(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      queryClient.invalidateQueries({ queryKey: ['tourBookings'] });
    },
  });
}

export function useTourBookings(params: {
  page?: number;
  limit?: number;
  tourId?: string;
  status?: string;
} = {}) {
  return useQuery({
    queryKey: ['tourBookings', params],
    queryFn: () => fetchTourBookings(params),
  });
}

export function useCancelTourBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelTourBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tourBookings'] });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
    },
  });
}
