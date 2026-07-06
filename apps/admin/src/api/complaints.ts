import { apiFetch } from './client';

interface PaginationParams {
  page?: number;
  limit?: number;
  status?: string;
  severity?: string;
  apartmentId?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface Complaint {
  id: string;
  apartmentId: string;
  guestId: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  resolution: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function fetchComplaints(
  params: PaginationParams = {}
): Promise<PaginatedResponse<Complaint>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.status) searchParams.set('status', params.status);
  if (params.severity) searchParams.set('severity', params.severity);
  if (params.apartmentId) searchParams.set('apartmentId', params.apartmentId);
  const query = searchParams.toString();
  return apiFetch(`/api/admin/complaints${query ? `?${query}` : ''}`);
}

export async function createComplaint(
  data: Partial<Complaint>
): Promise<Complaint> {
  return apiFetch('/api/admin/complaints', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateComplaintStatus(
  id: string,
  data: { status: string; resolution?: string }
): Promise<Complaint> {
  return apiFetch(`/api/admin/complaints/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
