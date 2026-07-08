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
  dailyLogs_id: string;
  dailyLogs_apartmentId: string;
  dailyLogs_staffId: string;
  dailyLogs_date: string;
  dailyLogs_notes: string;
  dailyLogs_tasksCompleted: string[];
  dailyLogs_issuesFound: string[];
  dailyLogs_photos: string[];
  dailyLogs_createdAt: string;
  dailyLogs_updatedAt: string;
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
    id: raw.dailyLogs_id,
    apartmentId: raw.dailyLogs_apartmentId,
    staffId: raw.dailyLogs_staffId,
    date: raw.dailyLogs_date,
    notes: raw.dailyLogs_notes,
    tasksCompleted: raw.dailyLogs_tasksCompleted,
    issuesFound: raw.dailyLogs_issuesFound,
    photos: raw.dailyLogs_photos,
    createdAt: raw.dailyLogs_createdAt,
    updatedAt: raw.dailyLogs_updatedAt,
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
