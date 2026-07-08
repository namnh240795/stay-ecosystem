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

// Raw interface matching the API response with prefixed field names
interface RawTour {
  tours_id: string;
  tours_propertyId: string;
  tours_title: string;
  tours_description: string;
  tours_date: string;
  tours_startTime: string;
  tours_endTime: string;
  tours_maxParticipants: number;
  tours_status: string;
  tours_guideId: string | null;
  tours_createdAt: string;
  tours_updatedAt: string;
}

interface RawTourBooking {
  tourBookings_id: string;
  tourBookings_tourId: string;
  tourBookings_guestName: string;
  tourBookings_guestEmail: string;
  tourBookings_guestPhone: string;
  tourBookings_participants: number;
  tourBookings_status: string;
  tourBookings_notes: string;
  tourBookings_createdAt: string;
  tourBookings_updatedAt: string;
}

// Component-facing interfaces with unprefixed field names
export interface Tour {
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

export interface TourBooking {
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

function mapTour(raw: RawTour): Tour {
  return {
    id: raw.tours_id,
    propertyId: raw.tours_propertyId,
    title: raw.tours_title,
    description: raw.tours_description,
    date: raw.tours_date,
    startTime: raw.tours_startTime,
    endTime: raw.tours_endTime,
    maxParticipants: raw.tours_maxParticipants,
    status: raw.tours_status,
    guideId: raw.tours_guideId,
    createdAt: raw.tours_createdAt,
    updatedAt: raw.tours_updatedAt,
  };
}

function mapTourBooking(raw: RawTourBooking): TourBooking {
  return {
    id: raw.tourBookings_id,
    tourId: raw.tourBookings_tourId,
    guestName: raw.tourBookings_guestName,
    guestEmail: raw.tourBookings_guestEmail,
    guestPhone: raw.tourBookings_guestPhone,
    participants: raw.tourBookings_participants,
    status: raw.tourBookings_status,
    notes: raw.tourBookings_notes,
    createdAt: raw.tourBookings_createdAt,
    updatedAt: raw.tourBookings_updatedAt,
  };
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
  const result = await apiFetch<{ data: RawTour[]; total: number; page: number; limit: number }>(
    `/api/admin/tours${query ? `?${query}` : ''}`
  );
  return {
    ...result,
    data: result.data.map(mapTour),
  };
}

export async function fetchTour(id: string): Promise<Tour> {
  const raw = await apiFetch<RawTour>(`/api/admin/tours/${id}`);
  return mapTour(raw);
}

export async function createTour(data: Partial<Tour>): Promise<Tour> {
  const raw = await apiFetch<RawTour>('/api/admin/tours', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return mapTour(raw);
}

export async function updateTour(
  id: string,
  data: Partial<Tour>
): Promise<Tour> {
  const raw = await apiFetch<RawTour>(`/api/admin/tours/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return mapTour(raw);
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
  const result = await apiFetch<{ data: RawTourBooking[]; total: number; page: number; limit: number }>(
    `/api/admin/tour-bookings${query ? `?${query}` : ''}`
  );
  return {
    ...result,
    data: result.data.map(mapTourBooking),
  };
}

export async function updateTourBookingStatus(
  id: string,
  data: { status: string; notes?: string }
): Promise<TourBooking> {
  const raw = await apiFetch<RawTourBooking>(`/api/admin/tour-bookings/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return mapTourBooking(raw);
}
