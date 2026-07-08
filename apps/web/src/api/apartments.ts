import { apiFetch } from './client';

// Raw interface matching the API response with prefixed field names
interface RawApartment {
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

// Component-facing interface with unprefixed field names
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

function mapApartment(raw: RawApartment): Apartment {
  return {
    id: raw.apartments_id,
    branchId: raw.apartments_branchId,
    name: raw.apartments_name,
    type: raw.apartments_type,
    description: raw.apartments_description,
    imageUrl: raw.apartments_imageUrl,
    capacity: raw.apartments_capacity,
    pricePerNight: raw.apartments_pricePerNight,
    amenities: raw.apartments_amenities,
    status: raw.apartments_status,
    createdAt: raw.apartments_createdAt,
    updatedAt: raw.apartments_updatedAt,
  };
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
  const result = await apiFetch<{ data: RawApartment[]; total: number; page: number; limit: number }>(
    `/api/apartments${query ? `?${query}` : ''}`
  );
  return {
    ...result,
    data: result.data.map(mapApartment),
  };
}

export async function fetchApartment(id: string): Promise<Apartment> {
  const raw = await apiFetch<RawApartment>(`/api/apartments/${id}`);
  return mapApartment(raw);
}
