import { apiFetch } from './client';

interface PaginationParams {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Raw interface matching the API response with prefixed field names
interface RawUser {
  users_id: string;
  users_email: string;
  users_name: string;
  users_role: string;
  users_auth0_id: string;
  users_created_at: string;
  users_updated_at: string;
}

// Component-facing interface with unprefixed field names
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  auth0Id: string;
  createdAt: string;
  updatedAt: string;
}

function mapUser(raw: RawUser): User {
  return {
    id: raw.users_id,
    email: raw.users_email,
    name: raw.users_name,
    role: raw.users_role,
    auth0Id: raw.users_auth0_id,
    createdAt: raw.users_created_at,
    updatedAt: raw.users_updated_at,
  };
}

export async function fetchUsers(
  params: PaginationParams = {}
): Promise<PaginatedResponse<User>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.role) searchParams.set('role', params.role);
  if (params.search) searchParams.set('search', params.search);
  const query = searchParams.toString();
  const result = await apiFetch<{ data: RawUser[]; total: number; page: number; limit: number }>(
    `/api/admin/users${query ? `?${query}` : ''}`
  );
  return {
    ...result,
    data: result.data.map(mapUser),
  };
}

export async function fetchUser(id: string): Promise<User> {
  const raw = await apiFetch<RawUser>(`/api/admin/users/${id}`);
  return mapUser(raw);
}

export async function updateUserRole(
  id: string,
  data: { role: string }
): Promise<User> {
  const raw = await apiFetch<RawUser>(`/api/admin/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return mapUser(raw);
}
