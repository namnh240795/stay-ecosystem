import { apiFetch } from './client';

export interface Review {
  reviews_id: string;
  reviews_apartmentId?: string;
  reviews_tourId?: string;
  reviews_customerName: string;
  reviews_rating: number;
  reviews_comment?: string;
  reviews_createdAt: string;
}

interface ReviewListParams {
  page?: number;
  limit?: number;
  apartmentId?: string;
  tourId?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchReviews(
  params: ReviewListParams = {}
): Promise<PaginatedResponse<Review>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.apartmentId) searchParams.set('apartmentId', params.apartmentId);
  if (params.tourId) searchParams.set('tourId', params.tourId);
  const query = searchParams.toString();
  return apiFetch(`/api/reviews${query ? `?${query}` : ''}`);
}

export async function createReview(data: {
  apartmentId?: string;
  tourId?: string;
  customerName: string;
  rating: number;
  comment?: string;
}): Promise<Review> {
  return apiFetch('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
