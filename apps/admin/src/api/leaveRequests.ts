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
  leave_requests_id: string;
  leave_requests_staff_id: string;
  leave_requests_type: string;
  leave_requests_start_date: string;
  leave_requests_end_date: string;
  leave_requests_reason: string;
  leave_requests_status: string;
  leave_requests_approved_by: string | null;
  leave_requests_created_at: string;
  leave_requests_updated_at: string;
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
    id: raw.leave_requests_id,
    staffId: raw.leave_requests_staff_id,
    type: raw.leave_requests_type,
    startDate: raw.leave_requests_start_date,
    endDate: raw.leave_requests_end_date,
    reason: raw.leave_requests_reason,
    status: raw.leave_requests_status,
    approvedBy: raw.leave_requests_approved_by,
    createdAt: raw.leave_requests_created_at,
    updatedAt: raw.leave_requests_updated_at,
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
