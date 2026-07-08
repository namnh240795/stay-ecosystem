import { apiFetch } from './client';

// Raw interface matching the API response with prefixed field names
interface RawGroup {
  groups_id: string;
  groups_name: string;
  groups_description?: string;
  groups_tour_id?: string;
  groups_leader_name: string;
  groups_leader_email: string;
  groups_max_members: number;
  groups_current_members: number;
  groups_status: string;
  groups_departure_date?: string;
  groups_created_at: string;
  groups_updated_at: string;
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
    tourId: raw.groups_tour_id,
    leaderName: raw.groups_leader_name,
    leaderEmail: raw.groups_leader_email,
    maxMembers: raw.groups_max_members,
    currentMembers: raw.groups_current_members,
    status: raw.groups_status,
    departureDate: raw.groups_departure_date,
    createdAt: raw.groups_created_at,
    updatedAt: raw.groups_updated_at,
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
