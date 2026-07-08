import { apiFetch } from './client';

export interface Branch {
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
