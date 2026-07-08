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

interface DailyLog {
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
  return apiFetch(`/api/admin/daily-logs${query ? `?${query}` : ''}`);
}

export async function createDailyLog(data: Partial<DailyLog>): Promise<DailyLog> {
  return apiFetch('/api/admin/daily-logs', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
