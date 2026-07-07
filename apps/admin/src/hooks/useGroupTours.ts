import { useQuery } from '@tanstack/react-query';
import { fetchGroupTours } from '../api/groupTours';

export function useGroupTours() {
  return useQuery({
    queryKey: ['groupTours'],
    queryFn: fetchGroupTours,
  });
}
