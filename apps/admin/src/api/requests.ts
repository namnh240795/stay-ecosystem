import { apiFetch } from './client';

interface PaginationParams {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  apartmentId?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface ServiceRequest {
  requests_id: string;
  requests_apartmentId: string;
  requests_guestId: string;
  requests_type: string;
  requests_title: string;
  requests_description: string;
  requests_priority: string;
  requests_status: string;
  requests_assignedTo: string | null;
  requests_createdAt: string;
  requests_updatedAt: string;
}

export async function fetchRequests(
  params: PaginationParams = {}
): Promise<PaginatedResponse<ServiceRequest>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.status) searchParams.set('status', params.status);
  if (params.type) searchParams.set('type', params.type);
  if (params.apartmentId) searchParams.set('apartmentId', params.apartmentId);
  const query = searchParams.toString();
  return apiFetch(`/api/admin/requests${query ? `?${query}` : ''}`);
}

export async function createRequest(
  data: Partial<ServiceRequest>
): Promise<ServiceRequest> {
  return apiFetch('/api/admin/requests', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateRequestStatus(
  id: string,
  data: { status: string; assignedTo?: string; notes?: string }
): Promise<ServiceRequest> {
  return apiFetch(`/api/admin/requests/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
