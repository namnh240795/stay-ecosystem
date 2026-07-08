import { apiFetch } from './client';

export interface Apartment {
  apartments_id: string;
  apartments_branchId: string;
  apartments_name: string;
  apartments_type: string;
  apartments_description?: string;
  apartments_imageUrl?: string;
  apartments_capacity: number;
  apartments_pricePerNight: number;
  apartments_amenities?: string[];
  apartments_status: string;
  apartments_createdAt: string;
  apartments_updatedAt: string;
}

interface ApartmentListParams {
  branchId?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
  available?: boolean;
  search?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchApartments(
  params: ApartmentListParams = {}
): Promise<PaginatedResponse<Apartment>> {
  const searchParams = new URLSearchParams();
  if (params.branchId) searchParams.set('branchId', params.branchId);
  if (params.type) searchParams.set('type', params.type);
  if (params.minPrice) searchParams.set('minPrice', String(params.minPrice));
  if (params.maxPrice) searchParams.set('maxPrice', String(params.maxPrice));
  if (params.capacity) searchParams.set('capacity', String(params.capacity));
  if (params.available !== undefined) searchParams.set('available', String(params.available));
  if (params.search) searchParams.set('search', params.search);
  const query = searchParams.toString();
  return apiFetch(`/api/apartments${query ? `?${query}` : ''}`);
}

export async function fetchApartment(id: string): Promise<Apartment> {
  return apiFetch(`/api/apartments/${id}`);
}
