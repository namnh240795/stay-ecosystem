import { apiFetch } from './client';

// Raw interfaces matching the API response with prefixed field names
interface RawTour {
  tours_id: string;
  tours_name: string;
  tours_description?: string;
  tours_branchId?: string;
  tours_imageUrl?: string;
  tours_price: number;
  tours_duration: string;
  tours_maxParticipants: number;
  tours_availableDates?: string[];
  tours_status: string;
  tours_createdAt: string;
  tours_updatedAt: string;
}

interface RawTourBooking {
  tourBookings_id: string;
  tourBookings_tourId: string;
  tourBookings_tourName: string;
  tourBookings_customerName: string;
  tourBookings_customerEmail: string;
  tourBookings_customerPhone?: string;
  tourBookings_date: string;
  tourBookings_participants: number;
  tourBookings_totalPrice: number;
  tourBookings_status: string;
  tourBookings_createdAt: string;
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
    branchId: raw.tours_branchId,
    imageUrl: raw.tours_imageUrl,
    price: raw.tours_price,
    duration: raw.tours_duration,
    maxParticipants: raw.tours_maxParticipants,
    availableDates: raw.tours_availableDates,
    status: raw.tours_status,
    createdAt: raw.tours_createdAt,
    updatedAt: raw.tours_updatedAt,
  };
}

function mapTourBooking(raw: RawTourBooking): TourBooking {
  return {
    id: raw.tourBookings_id,
    tourId: raw.tourBookings_tourId,
    tourName: raw.tourBookings_tourName,
    customerName: raw.tourBookings_customerName,
    customerEmail: raw.tourBookings_customerEmail,
    customerPhone: raw.tourBookings_customerPhone,
    date: raw.tourBookings_date,
    participants: raw.tourBookings_participants,
    totalPrice: raw.tourBookings_totalPrice,
    status: raw.tourBookings_status,
    createdAt: raw.tourBookings_createdAt,
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
