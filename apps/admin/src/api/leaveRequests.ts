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

// Raw interface matching the API response with prefixed field names
interface RawLeaveRequest {
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

// Component-facing interface with unprefixed field names
export interface LeaveRequest {
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

function mapLeaveRequest(raw: RawLeaveRequest): LeaveRequest {
  return {
    id: raw.leaveRequests_id,
    staffId: raw.leaveRequests_staffId,
    type: raw.leaveRequests_type,
    startDate: raw.leaveRequests_startDate,
    endDate: raw.leaveRequests_endDate,
    reason: raw.leaveRequests_reason,
    status: raw.leaveRequests_status,
    approvedBy: raw.leaveRequests_approvedBy,
    createdAt: raw.leaveRequests_createdAt,
    updatedAt: raw.leaveRequests_updatedAt,
  };
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
  const result = await apiFetch<{ data: RawLeaveRequest[]; total: number; page: number; limit: number }>(
    `/api/admin/leave-requests${query ? `?${query}` : ''}`
  );
  return {
    ...result,
    data: result.data.map(mapLeaveRequest),
  };
}

export async function createLeaveRequest(
  data: Partial<LeaveRequest>
): Promise<LeaveRequest> {
  const raw = await apiFetch<RawLeaveRequest>('/api/admin/leave-requests', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return mapLeaveRequest(raw);
}

export async function updateLeaveRequestStatus(
  id: string,
  data: { status: string; notes?: string }
): Promise<LeaveRequest> {
  const raw = await apiFetch<RawLeaveRequest>(`/api/admin/leave-requests/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return mapLeaveRequest(raw);
}
