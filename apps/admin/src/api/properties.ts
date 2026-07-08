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

// Raw interface matching the API response with prefixed field names
interface RawProperty {
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
  properties_created_at: string;
  properties_updated_at: string;
}

// Component-facing interface with unprefixed field names
export interface Property {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  images: string[];
  amenities: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

function mapProperty(raw: RawProperty): Property {
  return {
    id: raw.properties_id,
    name: raw.properties_name,
    slug: raw.properties_slug,
    description: raw.properties_description,
    address: raw.properties_address,
    city: raw.properties_city,
    country: raw.properties_country,
    latitude: raw.properties_latitude,
    longitude: raw.properties_longitude,
    images: raw.properties_images,
    amenities: raw.properties_amenities,
    status: raw.properties_status,
    createdAt: raw.properties_created_at,
    updatedAt: raw.properties_updated_at,
  };
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
  const result = await apiFetch<{ data: RawProperty[]; total: number; page: number; limit: number }>(
    `/api/admin/properties${query ? `?${query}` : ''}`
  );
  return {
    ...result,
    data: result.data.map(mapProperty),
  };
}

export async function fetchProperty(id: string): Promise<Property> {
  const raw = await apiFetch<RawProperty>(`/api/admin/properties/${id}`);
  return mapProperty(raw);
}

export async function createProperty(data: Partial<Property>): Promise<Property> {
  const raw = await apiFetch<RawProperty>('/api/admin/properties', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return mapProperty(raw);
}

export async function updateProperty(
  id: string,
  data: Partial<Property>
): Promise<Property> {
  const raw = await apiFetch<RawProperty>(`/api/admin/properties/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return mapProperty(raw);
}

export async function deleteProperty(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/api/admin/properties/${id}`, {
    method: 'DELETE',
  });
}
