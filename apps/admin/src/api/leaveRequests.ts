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
  leaveRequests_id: string;
  leaveRequests_staffId: string;
  leaveRequests_type: string;
  leaveRequests_startDate: string;
  leaveRequests_endDate: string;
  leaveRequests_reason: string;
  leaveRequests_status: string;
  leaveRequests_approvedBy: string | null;
  leaveRequests_createdAt: string;
  leaveRequests_updatedAt: string;
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
