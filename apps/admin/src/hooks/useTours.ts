import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchTours,
  fetchTour,
  createTour,
  updateTour,
  deleteTour,
  fetchTourBookings,
  updateTourBookingStatus,
} from '../api/tours';

export function useTours(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
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

export function useCreateTour() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTour,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['tours'] }),
  });
}

export function useUpdateTour() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTour,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['tours'] }),
  });
}

export function useDeleteTour() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTour,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['tours'] }),
  });
}

export function useTourBookings(params: {
  tourId?: string;
  page?: number;
  limit?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: ['tourBookings', params],
    queryFn: () => fetchTourBookings(params),
  });
}

export function useUpdateTourBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTourBookingStatus,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['tourBookings'] }),
  });
}
