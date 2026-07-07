import { useQuery } from '@tanstack/react-query';
import { fetchRooms } from '../api/rooms';

export function useRooms(params: {
  branchId?: string;
  status?: string;
  search?: string;
} = {}) {
  return useQuery({
    queryKey: ['rooms', params],
    queryFn: () => fetchRooms(params),
  });
}
