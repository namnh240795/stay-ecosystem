import { apiFetch } from './client';

interface PaginationParams {
  page?: number;
  limit?: number;
  status?: string;
  staffId?: string;
  type?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface LeaveRequest {
  id: string;
  staffId: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  approvedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function fetchLeaveRequests(
  params: PaginationParams = {}
): Promise<PaginatedResponse<LeaveRequest>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.status) searchParams.set('status', params.status);
  if (params.staffId) searchParams.set('staffId', params.staffId);
  if (params.type) searchParams.set('type', params.type);
  const query = searchParams.toString();
  return apiFetch(`/api/admin/leave-requests${query ? `?${query}` : ''}`);
}

export async function createLeaveRequest(
  data: Partial<LeaveRequest>
): Promise<LeaveRequest> {
  return apiFetch('/api/admin/leave-requests', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateLeaveRequestStatus(
  id: string,
  data: { status: string; notes?: string }
): Promise<LeaveRequest> {
  return apiFetch(`/api/admin/leave-requests/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
