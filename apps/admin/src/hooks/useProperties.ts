import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchProperties,
  fetchProperty,
  createProperty,
  updateProperty,
  deleteProperty,
} from '../api/properties';

export function useProperties(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['properties', params],
    queryFn: () => fetchProperties(params),
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ['properties', id],
    queryFn: () => fetchProperty(id),
    enabled: !!id,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProperty,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['properties'] }),
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProperty,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['properties'] }),
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProperty,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['properties'] }),
  });
}
