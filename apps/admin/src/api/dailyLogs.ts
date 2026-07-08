import { apiFetch } from './client';

interface PaginationParams {
  page?: number;
  limit?: number;
  apartmentId?: string;
  staffId?: string;
  date?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Raw interface matching the API response with prefixed field names
interface RawDailyLog {
  daily_logs_id: string;
  daily_logs_apartment_id: string;
  daily_logs_staff_id: string;
  daily_logs_date: string;
  daily_logs_notes: string;
  daily_logs_tasks_completed: string[];
  daily_logs_issues_found: string[];
  daily_logs_photos: string[];
  daily_logs_created_at: string;
  daily_logs_updated_at: string;
}

// Component-facing interface with unprefixed field names
export interface DailyLog {
  id: string;
  apartmentId: string;
  staffId: string;
  date: string;
  notes: string;
  tasksCompleted: string[];
  issuesFound: string[];
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

function mapDailyLog(raw: RawDailyLog): DailyLog {
  return {
    id: raw.daily_logs_id,
    apartmentId: raw.daily_logs_apartment_id,
    staffId: raw.daily_logs_staff_id,
    date: raw.daily_logs_date,
    notes: raw.daily_logs_notes,
    tasksCompleted: raw.daily_logs_tasks_completed,
    issuesFound: raw.daily_logs_issues_found,
    photos: raw.daily_logs_photos,
    createdAt: raw.daily_logs_created_at,
    updatedAt: raw.daily_logs_updated_at,
  };
}

export async function fetchDailyLogs(
  params: PaginationParams = {}
): Promise<PaginatedResponse<DailyLog>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.apartmentId) searchParams.set('apartmentId', params.apartmentId);
  if (params.staffId) searchParams.set('staffId', params.staffId);
  if (params.date) searchParams.set('date', params.date);
  const query = searchParams.toString();
  const result = await apiFetch<{ data: RawDailyLog[]; total: number; page: number; limit: number }>(
    `/api/admin/daily-logs${query ? `?${query}` : ''}`
  );
  return {
    ...result,
    data: result.data.map(mapDailyLog),
  };
}

export async function createDailyLog(data: Partial<DailyLog>): Promise<DailyLog> {
  const raw = await apiFetch<RawDailyLog>('/api/admin/daily-logs', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return mapDailyLog(raw);
}
