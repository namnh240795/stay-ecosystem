import { apiFetch } from './client';

// Raw interface matching the API response with prefixed field names
interface RawGroup {
  groups_id: string;
  groups_name: string;
  groups_description?: string;
  groups_tourId?: string;
  groups_leaderName: string;
  groups_leaderEmail: string;
  groups_maxMembers: number;
  groups_currentMembers: number;
  groups_status: string;
  groups_departureDate?: string;
  groups_createdAt: string;
  groups_updatedAt: string;
}

// Component-facing interface with unprefixed field names
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

function mapGroup(raw: RawGroup): Group {
  return {
    id: raw.groups_id,
    name: raw.groups_name,
    description: raw.groups_description,
    tourId: raw.groups_tourId,
    leaderName: raw.groups_leaderName,
    leaderEmail: raw.groups_leaderEmail,
    maxMembers: raw.groups_maxMembers,
    currentMembers: raw.groups_currentMembers,
    status: raw.groups_status,
    departureDate: raw.groups_departureDate,
    createdAt: raw.groups_createdAt,
    updatedAt: raw.groups_updatedAt,
  };
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
  const result = await apiFetch<{ data: RawGroup[]; total: number; page: number; limit: number }>(
    `/api/groups${query ? `?${query}` : ''}`
  );
  return {
    ...result,
    data: result.data.map(mapGroup),
  };
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
  const raw = await apiFetch<RawGroup>('/api/groups', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return mapGroup(raw);
}

export async function joinGroup(
  id: string,
  data: {
    memberName: string;
    memberEmail: string;
    memberPhone?: string;
  }
): Promise<Group> {
  const raw = await apiFetch<RawGroup>(`/api/groups/${id}/join`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return mapGroup(raw);
}
