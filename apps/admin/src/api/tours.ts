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
  tours_property_id: string;
  tours_title: string;
  tours_description: string;
  tours_date: string;
  tours_start_time: string;
  tours_end_time: string;
  tours_max_participants: number;
  tours_status: string;
  tours_guide_id: string | null;
  tours_created_at: string;
  tours_updated_at: string;
}

interface RawTourBooking {
  tour_bookings_id: string;
  tour_bookings_tour_id: string;
  tour_bookings_guest_name: string;
  tour_bookings_guest_email: string;
  tour_bookings_guest_phone: string;
  tour_bookings_participants: number;
  tour_bookings_status: string;
  tour_bookings_notes: string;
  tour_bookings_created_at: string;
  tour_bookings_updated_at: string;
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
    propertyId: raw.tours_property_id,
    title: raw.tours_title,
    description: raw.tours_description,
    date: raw.tours_date,
    startTime: raw.tours_start_time,
    endTime: raw.tours_end_time,
    maxParticipants: raw.tours_max_participants,
    status: raw.tours_status,
    guideId: raw.tours_guide_id,
    createdAt: raw.tours_created_at,
    updatedAt: raw.tours_updated_at,
  };
}

function mapTourBooking(raw: RawTourBooking): TourBooking {
  return {
    id: raw.tour_bookings_id,
    tourId: raw.tour_bookings_tour_id,
    guestName: raw.tour_bookings_guest_name,
    guestEmail: raw.tour_bookings_guest_email,
    guestPhone: raw.tour_bookings_guest_phone,
    participants: raw.tour_bookings_participants,
    status: raw.tour_bookings_status,
    notes: raw.tour_bookings_notes,
    createdAt: raw.tour_bookings_created_at,
    updatedAt: raw.tour_bookings_updated_at,
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
