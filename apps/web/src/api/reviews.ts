import { apiFetch } from './client';

// Raw interface matching the API response with prefixed field names
interface RawReview {
  reviews_id: string;
  reviews_apartment_id?: string;
  reviews_tour_id?: string;
  reviews_customer_name: string;
  reviews_rating: number;
  reviews_comment?: string;
  reviews_created_at: string;
}

// Component-facing interface with unprefixed field names
export interface Review {
  id: string;
  apartmentId?: string;
  tourId?: string;
  customerName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

function mapReview(raw: RawReview): Review {
  return {
    id: raw.reviews_id,
    apartmentId: raw.reviews_apartment_id,
    tourId: raw.reviews_tour_id,
    customerName: raw.reviews_customer_name,
    rating: raw.reviews_rating,
    comment: raw.reviews_comment,
    createdAt: raw.reviews_created_at,
  };
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
  const result = await apiFetch<{ data: RawReview[]; total: number; page: number; limit: number }>(
    `/api/reviews${query ? `?${query}` : ''}`
  );
  return {
    ...result,
    data: result.data.map(mapReview),
  };
}

export async function createReview(data: {
  apartmentId?: string;
  tourId?: string;
  customerName: string;
  rating: number;
  comment?: string;
}): Promise<Review> {
  const raw = await apiFetch<RawReview>('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return mapReview(raw);
}
