import { apiFetch } from './client';

interface PaginationParams {
  page?: number;
  limit?: number;
  status?: string;
  propertyId?: string;
  search?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface Apartment {
  apartments_id: string;
  apartments_propertyId: string;
  apartments_name: string;
  apartments_unitNumber: string;
  apartments_floor: number;
  apartments_bedrooms: number;
  apartments_bathrooms: number;
  apartments_area: number;
  apartments_status: string;
  apartments_monthlyRent: number;
  apartments_createdAt: string;
  apartments_updatedAt: string;
}

export async function fetchApartments(
  params: PaginationParams = {}
): Promise<PaginatedResponse<Apartment>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.status) searchParams.set('status', params.status);
  if (params.propertyId) searchParams.set('propertyId', params.propertyId);
  if (params.search) searchParams.set('search', params.search);
  const query = searchParams.toString();
  return apiFetch(`/api/admin/apartments${query ? `?${query}` : ''}`);
}

export async function fetchApartment(id: string): Promise<Apartment> {
  return apiFetch(`/api/admin/apartments/${id}`);
}

export async function createApartment(data: Partial<Apartment>): Promise<Apartment> {
  return apiFetch('/api/admin/apartments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateApartment(
  id: string,
  data: Partial<Apartment>
): Promise<Apartment> {
  return apiFetch(`/api/admin/apartments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteApartment(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/api/admin/apartments/${id}`, {
    method: 'DELETE',
  });
}
