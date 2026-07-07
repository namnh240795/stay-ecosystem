import { apiFetch } from './client';

export interface Review {
  id: string;
  apartmentId?: string;
  tourId?: string;
  customerName: string;
  rating: number;
  comment?: string;
  createdAt: string;
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
