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

interface User {
  users_id: string;
  users_email: string;
  users_name: string;
  users_role: string;
  users_auth0Id: string;
  users_createdAt: string;
  users_updatedAt: string;
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
  return apiFetch(`/api/admin/users${query ? `?${query}` : ''}`);
}

export async function fetchUser(id: string): Promise<User> {
  return apiFetch(`/api/admin/users/${id}`);
}

export async function updateUserRole(
  id: string,
  data: { role: string }
): Promise<User> {
  return apiFetch(`/api/admin/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
