import { apiFetch } from './client';

interface PaginationParams {
  page?: number;
  limit?: number;
  status?: string;
  city?: string;
  search?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface Property {
  properties_id: string;
  properties_name: string;
  properties_slug: string;
  properties_description: string;
  properties_address: string;
  properties_city: string;
  properties_country: string;
  properties_latitude: number;
  properties_longitude: number;
  properties_images: string[];
  properties_amenities: string[];
  properties_status: string;
  properties_createdAt: string;
  properties_updatedAt: string;
}

export async function fetchProperties(
  params: PaginationParams = {}
): Promise<PaginatedResponse<Property>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.status) searchParams.set('status', params.status);
  if (params.city) searchParams.set('city', params.city);
  if (params.search) searchParams.set('search', params.search);
  const query = searchParams.toString();
  return apiFetch(`/api/admin/properties${query ? `?${query}` : ''}`);
}

export async function fetchProperty(id: string): Promise<Property> {
  return apiFetch(`/api/admin/properties/${id}`);
}

export async function createProperty(data: Partial<Property>): Promise<Property> {
  return apiFetch('/api/admin/properties', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProperty(
  id: string,
  data: Partial<Property>
): Promise<Property> {
  return apiFetch(`/api/admin/properties/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteProperty(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/api/admin/properties/${id}`, {
    method: 'DELETE',
  });
}
