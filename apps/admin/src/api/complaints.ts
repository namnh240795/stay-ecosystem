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

// Raw interface matching the API response with prefixed field names
interface RawComplaint {
  complaints_id: string;
  complaints_apartment_id: string;
  complaints_guest_id: string;
  complaints_title: string;
  complaints_description: string;
  complaints_severity: string;
  complaints_status: string;
  complaints_resolution: string | null;
  complaints_created_at: string;
  complaints_updated_at: string;
}

// Component-facing interface with unprefixed field names
export interface Complaint {
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

function mapComplaint(raw: RawComplaint): Complaint {
  return {
    id: raw.complaints_id,
    apartmentId: raw.complaints_apartment_id,
    guestId: raw.complaints_guest_id,
    title: raw.complaints_title,
    description: raw.complaints_description,
    severity: raw.complaints_severity,
    status: raw.complaints_status,
    resolution: raw.complaints_resolution,
    createdAt: raw.complaints_created_at,
    updatedAt: raw.complaints_updated_at,
  };
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
  const result = await apiFetch<{ data: RawComplaint[]; total: number; page: number; limit: number }>(
    `/api/admin/complaints${query ? `?${query}` : ''}`
  );
  return {
    ...result,
    data: result.data.map(mapComplaint),
  };
}

export async function createComplaint(
  data: Partial<Complaint>
): Promise<Complaint> {
  const raw = await apiFetch<RawComplaint>('/api/admin/complaints', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return mapComplaint(raw);
}

export async function updateComplaintStatus(
  id: string,
  data: { status: string; resolution?: string }
): Promise<Complaint> {
  const raw = await apiFetch<RawComplaint>(`/api/admin/complaints/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return mapComplaint(raw);
}
