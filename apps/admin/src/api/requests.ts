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

// Raw interface matching the API response with prefixed field names
interface RawServiceRequest {
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

// Component-facing interface with unprefixed field names
export interface ServiceRequest {
  id: string;
  apartmentId: string;
  guestId: string;
  type: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

function mapServiceRequest(raw: RawServiceRequest): ServiceRequest {
  return {
    id: raw.requests_id,
    apartmentId: raw.requests_apartmentId,
    guestId: raw.requests_guestId,
    type: raw.requests_type,
    title: raw.requests_title,
    description: raw.requests_description,
    priority: raw.requests_priority,
    status: raw.requests_status,
    assignedTo: raw.requests_assignedTo,
    createdAt: raw.requests_createdAt,
    updatedAt: raw.requests_updatedAt,
  };
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
  const result = await apiFetch<{ data: RawServiceRequest[]; total: number; page: number; limit: number }>(
    `/api/admin/requests${query ? `?${query}` : ''}`
  );
  return {
    ...result,
    data: result.data.map(mapServiceRequest),
  };
}

export async function createRequest(
  data: Partial<ServiceRequest>
): Promise<ServiceRequest> {
  const raw = await apiFetch<RawServiceRequest>('/api/admin/requests', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return mapServiceRequest(raw);
}

export async function updateRequestStatus(
  id: string,
  data: { status: string; assignedTo?: string; notes?: string }
): Promise<ServiceRequest> {
  const raw = await apiFetch<RawServiceRequest>(`/api/admin/requests/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return mapServiceRequest(raw);
}
