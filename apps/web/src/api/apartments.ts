import { apiFetch } from './client';

export interface Apartment {
  id: string;
  branchId: string;
  name: string;
  type: string;
  description?: string;
  imageUrl?: string;
  capacity: number;
  pricePerNight: number;
  amenities?: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
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
