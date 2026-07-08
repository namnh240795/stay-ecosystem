import { apiFetch } from './client';

interface PaginationParams {
  page?: number;
  limit?: number;
  status?: string;
  propertyId?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Raw interface matching the API response with prefixed field names
interface RawBooking {
  bookings_id: string;
  bookings_propertyId: string;
  bookings_guestName: string;
  bookings_guestEmail: string;
  bookings_checkIn: string;
  bookings_checkOut: string;
  bookings_status: string;
  bookings_totalPrice: number;
  bookings_createdAt: string;
  bookings_updatedAt: string;
}

// Component-facing interface with unprefixed field names
export interface Booking {
  id: string;
  propertyId: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

function mapBooking(raw: RawBooking): Booking {
  return {
    id: raw.bookings_id,
    propertyId: raw.bookings_propertyId,
    guestName: raw.bookings_guestName,
    guestEmail: raw.bookings_guestEmail,
    checkIn: raw.bookings_checkIn,
    checkOut: raw.bookings_checkOut,
    status: raw.bookings_status,
    totalPrice: raw.bookings_totalPrice,
    createdAt: raw.bookings_createdAt,
    updatedAt: raw.bookings_updatedAt,
  };
}

export async function fetchBookings(
  params: PaginationParams = {}
): Promise<PaginatedResponse<Booking>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.status) searchParams.set('status', params.status);
  if (params.propertyId) searchParams.set('propertyId', params.propertyId);
  const query = searchParams.toString();
  const result = await apiFetch<{ data: RawBooking[]; total: number; page: number; limit: number }>(
    `/api/admin/bookings${query ? `?${query}` : ''}`
  );
  return {
    ...result,
    data: result.data.map(mapBooking),
  };
}

export async function fetchBooking(id: string): Promise<Booking> {
  const raw = await apiFetch<RawBooking>(`/api/admin/bookings/${id}`);
  return mapBooking(raw);
}

export async function updateBookingStatus(
  id: string,
  data: { status: string; cancellationReason?: string }
): Promise<Booking> {
  const raw = await apiFetch<RawBooking>(`/api/admin/bookings/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return mapBooking(raw);
}
