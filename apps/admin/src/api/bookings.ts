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
  bookings_property_id: string;
  bookings_guest_name: string;
  bookings_guest_email: string;
  bookings_check_in: string;
  bookings_check_out: string;
  bookings_status: string;
  bookings_total_price: number;
  bookings_created_at: string;
  bookings_updated_at: string;
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
    propertyId: raw.bookings_property_id,
    guestName: raw.bookings_guest_name,
    guestEmail: raw.bookings_guest_email,
    checkIn: raw.bookings_check_in,
    checkOut: raw.bookings_check_out,
    status: raw.bookings_status,
    totalPrice: raw.bookings_total_price,
    createdAt: raw.bookings_created_at,
    updatedAt: raw.bookings_updated_at,
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
