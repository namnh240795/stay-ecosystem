import { apiFetch } from './client';

interface PaginationParams {
  page?: number;
  limit?: number;
  status?: string;
  propertyId?: string;
  date?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface Tour {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  status: string;
  guideId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TourBooking {
  id: string;
  tourId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  participants: number;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export async function fetchTours(
  params: PaginationParams = {}
): Promise<PaginatedResponse<Tour>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.status) searchParams.set('status', params.status);
  if (params.propertyId) searchParams.set('propertyId', params.propertyId);
  if (params.date) searchParams.set('date', params.date);
  const query = searchParams.toString();
  return apiFetch(`/api/admin/tours${query ? `?${query}` : ''}`);
}

export async function fetchTour(id: string): Promise<Tour> {
  return apiFetch(`/api/admin/tours/${id}`);
}

export async function createTour(data: Partial<Tour>): Promise<Tour> {
  return apiFetch('/api/admin/tours', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTour(
  id: string,
  data: Partial<Tour>
): Promise<Tour> {
  return apiFetch(`/api/admin/tours/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteTour(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/api/admin/tours/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchTourBookings(
  params: PaginationParams & { tourId?: string } = {}
): Promise<PaginatedResponse<TourBooking>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.status) searchParams.set('status', params.status);
  if (params.tourId) searchParams.set('tourId', params.tourId);
  const query = searchParams.toString();
  return apiFetch(`/api/admin/tour-bookings${query ? `?${query}` : ''}`);
}

export async function updateTourBookingStatus(
  id: string,
  data: { status: string; notes?: string }
): Promise<TourBooking> {
  return apiFetch(`/api/admin/tour-bookings/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
