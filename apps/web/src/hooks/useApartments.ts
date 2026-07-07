import { useQuery } from '@tanstack/react-query';
import { fetchApartments, fetchApartment } from '../api/apartments';

export function useApartments(params: {
  branchId?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
  available?: boolean;
  search?: string;
} = {}) {
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
