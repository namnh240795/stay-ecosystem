import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchApartments,
  fetchApartment,
  createApartment,
  updateApartment,
  deleteApartment,
} from '../api/apartments';

export function useApartments(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['apartments', params],
    queryFn: () => fetchApartments(params),
  });
}

export function useApartment(id: string) {
  return useQuery({
    queryKey: ['apartments', id],
    queryFn: () => fetchApartment(id),
    enabled: !!id,
  });
}

export function useCreateApartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createApartment,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['apartments'] }),
  });
}

export function useUpdateApartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateApartment,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['apartments'] }),
  });
}

export function useDeleteApartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteApartment,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['apartments'] }),
  });
}
