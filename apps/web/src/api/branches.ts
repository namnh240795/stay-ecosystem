import { apiFetch } from './client';

// Raw interface matching the API response with prefixed field names
interface RawBranch {
  branches_id: string;
  branches_name: string;
  branches_address: string;
  branches_city: string;
  branches_phone?: string;
  branches_description?: string;
  branches_imageUrl?: string;
  branches_latitude?: number;
  branches_longitude?: number;
  branches_createdAt: string;
  branches_updatedAt: string;
}

// Component-facing interface with unprefixed field names
export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  description?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

function mapBranch(raw: RawBranch): Branch {
  return {
    id: raw.branches_id,
    name: raw.branches_name,
    address: raw.branches_address,
    city: raw.branches_city,
    phone: raw.branches_phone,
    description: raw.branches_description,
    imageUrl: raw.branches_imageUrl,
    latitude: raw.branches_latitude,
    longitude: raw.branches_longitude,
    createdAt: raw.branches_createdAt,
    updatedAt: raw.branches_updatedAt,
  };
}

interface BranchListParams {
  city?: string;
  search?: string;
}

export async function fetchBranches(params: BranchListParams = {}): Promise<{ data: Branch[] }> {
  const searchParams = new URLSearchParams();
  if (params.city) searchParams.set('city', params.city);
  if (params.search) searchParams.set('search', params.search);
  const query = searchParams.toString();
  const result = await apiFetch<{ data: RawBranch[] }>(`/api/branches${query ? `?${query}` : ''}`);
  return {
    data: result.data.map(mapBranch),
  };
}

export async function fetchBranch(id: string): Promise<Branch> {
  const raw = await apiFetch<RawBranch>(`/api/branches/${id}`);
  return mapBranch(raw);
}
