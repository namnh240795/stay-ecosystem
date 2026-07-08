import { apiFetch } from './client';

// Raw interfaces matching the API response with prefixed field names
interface RawTour {
  tours_id: string;
  tours_name: string;
  tours_description?: string;
  tours_branch_id?: string;
  tours_image_url?: string;
  tours_price: number;
  tours_duration: string;
  tours_max_participants: number;
  tours_available_dates?: string[];
  tours_status: string;
  tours_created_at: string;
  tours_updated_at: string;
}

interface RawTourBooking {
  tour_bookings_id: string;
  tour_bookings_tour_id: string;
  tour_bookings_tour_name: string;
  tour_bookings_customer_name: string;
  tour_bookings_customer_email: string;
  tour_bookings_customer_phone?: string;
  tour_bookings_date: string;
  tour_bookings_participants: number;
  tour_bookings_total_price: number;
  tour_bookings_status: string;
  tour_bookings_created_at: string;
}

// Component-facing interfaces with unprefixed field names
export interface Tour {
  id: string;
  name: string;
  description?: string;
  branchId?: string;
  imageUrl?: string;
  price: number;
  duration: string;
  maxParticipants: number;
  availableDates?: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface TourBooking {
  id: string;
  tourId: string;
  tourName: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  date: string;
  participants: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

function mapTour(raw: RawTour): Tour {
  return {
    id: raw.tours_id,
    name: raw.tours_name,
    description: raw.tours_description,
    branchId: raw.tours_branch_id,
    imageUrl: raw.tours_image_url,
    price: raw.tours_price,
    duration: raw.tours_duration,
    maxParticipants: raw.tours_max_participants,
    availableDates: raw.tours_available_dates,
    status: raw.tours_status,
    createdAt: raw.tours_created_at,
    updatedAt: raw.tours_updated_at,
  };
}

function mapTourBooking(raw: RawTourBooking): TourBooking {
  return {
    id: raw.tour_bookings_id,
    tourId: raw.tour_bookings_tour_id,
    tourName: raw.tour_bookings_tour_name,
    customerName: raw.tour_bookings_customer_name,
    customerEmail: raw.tour_bookings_customer_email,
    customerPhone: raw.tour_bookings_customer_phone,
    date: raw.tour_bookings_date,
    participants: raw.tour_bookings_participants,
    totalPrice: raw.tour_bookings_total_price,
    status: raw.tour_bookings_status,
    createdAt: raw.tour_bookings_created_at,
  };
}

interface TourListParams {
  page?: number;
  limit?: number;
  status?: string;
  branchId?: string;
  search?: string;
}

interface TourBookingListParams {
  page?: number;
  limit?: number;
  tourId?: string;
  status?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchTours(
  params: TourListParams = {}
): Promise<PaginatedResponse<Tour>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.status) searchParams.set('status', params.status);
  if (params.branchId) searchParams.set('branchId', params.branchId);
  if (params.search) searchParams.set('search', params.search);
  const query = searchParams.toString();
  const result = await apiFetch<{ data: RawTour[]; total: number; page: number; limit: number }>(
    `/api/tours${query ? `?${query}` : ''}`
  );
  return {
    ...result,
    data: result.data.map(mapTour),
  };
}

export async function fetchTour(id: string): Promise<Tour> {
  const raw = await apiFetch<RawTour>(`/api/tours/${id}`);
  return mapTour(raw);
}

export async function bookTour(
  id: string,
  data: {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    date: string;
    participants: number;
  }
): Promise<TourBooking> {
  const raw = await apiFetch<RawTourBooking>(`/api/tours/${id}/book`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return mapTourBooking(raw);
}

export async function fetchTourBookings(
  params: TourBookingListParams = {}
): Promise<PaginatedResponse<TourBooking>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.tourId) searchParams.set('tourId', params.tourId);
  if (params.status) searchParams.set('status', params.status);
  const query = searchParams.toString();
  const result = await apiFetch<{ data: RawTourBooking[]; total: number; page: number; limit: number }>(
    `/api/tours/bookings${query ? `?${query}` : ''}`
  );
  return {
    ...result,
    data: result.data.map(mapTourBooking),
  };
}

export async function cancelTourBooking(id: string): Promise<TourBooking> {
  const raw = await apiFetch<RawTourBooking>(`/api/tours/bookings/${id}/cancel`, {
    method: 'PUT',
  });
  return mapTourBooking(raw);
}
