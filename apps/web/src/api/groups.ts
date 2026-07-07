import { apiFetch } from './client';

export interface Group {
  id: string;
  name: string;
  description?: string;
  tourId?: string;
  leaderName: string;
  leaderEmail: string;
  maxMembers: number;
  currentMembers: number;
  status: string;
  departureDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface GroupListParams {
  page?: number;
  limit?: number;
  status?: string;
  tourId?: string;
  search?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchGroups(
  params: GroupListParams = {}
): Promise<PaginatedResponse<Group>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.status) searchParams.set('status', params.status);
  if (params.tourId) searchParams.set('tourId', params.tourId);
  if (params.search) searchParams.set('search', params.search);
  const query = searchParams.toString();
  return apiFetch(`/api/groups${query ? `?${query}` : ''}`);
}

export async function createGroup(data: {
  name: string;
  description?: string;
  tourId?: string;
  leaderName: string;
  leaderEmail: string;
  maxMembers: number;
  departureDate?: string;
}): Promise<Group> {
  return apiFetch('/api/groups', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function joinGroup(
  id: string,
  data: {
    memberName: string;
    memberEmail: string;
    memberPhone?: string;
  }
): Promise<Group> {
  return apiFetch(`/api/groups/${id}/join`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
