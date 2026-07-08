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

// Raw interface matching the API response with prefixed field names
interface RawApartment {
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

// Component-facing interface with unprefixed field names
export interface Apartment {
  id: string;
  propertyId: string;
  name: string;
  unitNumber: string;
  floor: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  status: string;
  monthlyRent: number;
  createdAt: string;
  updatedAt: string;
}

function mapApartment(raw: RawApartment): Apartment {
  return {
    id: raw.apartments_id,
    propertyId: raw.apartments_propertyId,
    name: raw.apartments_name,
    unitNumber: raw.apartments_unitNumber,
    floor: raw.apartments_floor,
    bedrooms: raw.apartments_bedrooms,
    bathrooms: raw.apartments_bathrooms,
    area: raw.apartments_area,
    status: raw.apartments_status,
    monthlyRent: raw.apartments_monthlyRent,
    createdAt: raw.apartments_createdAt,
    updatedAt: raw.apartments_updatedAt,
  };
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
  const result = await apiFetch<{ data: RawApartment[]; total: number; page: number; limit: number }>(
    `/api/admin/apartments${query ? `?${query}` : ''}`
  );
  return {
    ...result,
    data: result.data.map(mapApartment),
  };
}

export async function fetchApartment(id: string): Promise<Apartment> {
  const raw = await apiFetch<RawApartment>(`/api/admin/apartments/${id}`);
  return mapApartment(raw);
}

export async function createApartment(data: Partial<Apartment>): Promise<Apartment> {
  const raw = await apiFetch<RawApartment>('/api/admin/apartments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return mapApartment(raw);
}

export async function updateApartment(
  id: string,
  data: Partial<Apartment>
): Promise<Apartment> {
  const raw = await apiFetch<RawApartment>(`/api/admin/apartments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return mapApartment(raw);
}

export async function deleteApartment(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/api/admin/apartments/${id}`, {
    method: 'DELETE',
  });
}
