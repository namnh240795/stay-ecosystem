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

// Raw interface matching the API response with prefixed field names
interface RawStaff {
  staff_id: string;
  staff_user_id: string;
  staff_name: string;
  staff_email: string;
  staff_phone: string;
  staff_role: string;
  staff_status: string;
  staff_property_ids: string[];
  staff_created_at: string;
  staff_updated_at: string;
}

// Component-facing interface with unprefixed field names
export interface Staff {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  propertyIds: string[];
  createdAt: string;
  updatedAt: string;
}

function mapStaff(raw: RawStaff): Staff {
  return {
    id: raw.staff_id,
    userId: raw.staff_user_id,
    name: raw.staff_name,
    email: raw.staff_email,
    phone: raw.staff_phone,
    role: raw.staff_role,
    status: raw.staff_status,
    propertyIds: raw.staff_property_ids,
    createdAt: raw.staff_created_at,
    updatedAt: raw.staff_updated_at,
  };
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
  const result = await apiFetch<{ data: RawStaff[]; total: number; page: number; limit: number }>(
    `/api/admin/staff${query ? `?${query}` : ''}`
  );
  return {
    ...result,
    data: result.data.map(mapStaff),
  };
}

export async function fetchStaffMember(id: string): Promise<Staff> {
  const raw = await apiFetch<RawStaff>(`/api/admin/staff/${id}`);
  return mapStaff(raw);
}

export async function createStaff(data: Partial<Staff>): Promise<Staff> {
  const raw = await apiFetch<RawStaff>('/api/admin/staff', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return mapStaff(raw);
}

export async function updateStaff(
  id: string,
  data: Partial<Staff>
): Promise<Staff> {
  const raw = await apiFetch<RawStaff>(`/api/admin/staff/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return mapStaff(raw);
}

export async function updateStaffStatus(
  id: string,
  data: { status: string }
): Promise<Staff> {
  const raw = await apiFetch<RawStaff>(`/api/admin/staff/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return mapStaff(raw);
}

export async function deleteStaff(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/api/admin/staff/${id}`, {
    method: 'DELETE',
  });
}
