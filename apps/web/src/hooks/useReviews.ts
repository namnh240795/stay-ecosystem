import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchReviews, createReview } from '../api/reviews';

export function useReviews(params: {
  page?: number;
  limit?: number;
  apartmentId?: string;
  tourId?: string;
} = {}) {
  return useQuery({
    queryKey: ['reviews', params],
    queryFn: () => fetchReviews(params),
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}
