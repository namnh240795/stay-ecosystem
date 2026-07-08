import { apiFetch } from './client';

interface PaginationParams {
  page?: number;
  limit?: number;
  status?: string;
  role?: string;
  search?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface Staff {
  staff_id: string;
  staff_userId: string;
  staff_name: string;
  staff_email: string;
  staff_phone: string;
  staff_role: string;
  staff_status: string;
  staff_propertyIds: string[];
  staff_createdAt: string;
  staff_updatedAt: string;
}

export async function fetchStaff(
  params: PaginationParams = {}
): Promise<PaginatedResponse<Staff>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.status) searchParams.set('status', params.status);
  if (params.role) searchParams.set('role', params.role);
  if (params.search) searchParams.set('search', params.search);
  const query = searchParams.toString();
  return apiFetch(`/api/admin/staff${query ? `?${query}` : ''}`);
}

export async function fetchStaffMember(id: string): Promise<Staff> {
  return apiFetch(`/api/admin/staff/${id}`);
}

export async function createStaff(data: Partial<Staff>): Promise<Staff> {
  return apiFetch('/api/admin/staff', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateStaff(
  id: string,
  data: Partial<Staff>
): Promise<Staff> {
  return apiFetch(`/api/admin/staff/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function updateStaffStatus(
  id: string,
  data: { status: string }
): Promise<Staff> {
  return apiFetch(`/api/admin/staff/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteStaff(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/api/admin/staff/${id}`, {
    method: 'DELETE',
  });
}
