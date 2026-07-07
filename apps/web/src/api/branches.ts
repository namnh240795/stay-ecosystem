import { apiFetch } from './client';

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

interface BranchListParams {
  city?: string;
  search?: string;
}

export async function fetchBranches(params: BranchListParams = {}): Promise<{ data: Branch[] }> {
  const searchParams = new URLSearchParams();
  if (params.city) searchParams.set('city', params.city);
  if (params.search) searchParams.set('search', params.search);
  const query = searchParams.toString();
  return apiFetch(`/api/branches${query ? `?${query}` : ''}`);
}

export async function fetchBranch(id: string): Promise<Branch> {
  return apiFetch(`/api/branches/${id}`);
}
