import { apiFetch } from './client';

// Raw interface matching the API response with prefixed field names
interface RawBooking {
  bookings_id: string;
  bookings_apartmentId: string;
  bookings_branchId: string;
  bookings_customerName: string;
  bookings_customerEmail: string;
  bookings_customerPhone?: string;
  bookings_checkIn: string;
  bookings_checkOut: string;
  bookings_guests: number;
  bookings_totalPrice: number;
  bookings_status: string;
  bookings_notes?: string;
  bookings_createdAt: string;
  bookings_updatedAt: string;
}

// Component-facing interface with unprefixed field names
export interface Booking {
  id: string;
  apartmentId: string;
  branchId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

function mapBooking(raw: RawBooking): Booking {
  return {
    id: raw.bookings_id,
    apartmentId: raw.bookings_apartmentId,
    branchId: raw.bookings_branchId,
    customerName: raw.bookings_customerName,
    customerEmail: raw.bookings_customerEmail,
    customerPhone: raw.bookings_customerPhone,
    checkIn: raw.bookings_checkIn,
    checkOut: raw.bookings_checkOut,
    guests: raw.bookings_guests,
    totalPrice: raw.bookings_totalPrice,
    status: raw.bookings_status,
    notes: raw.bookings_notes,
    createdAt: raw.bookings_createdAt,
    updatedAt: raw.bookings_updatedAt,
  };
}

interface BookingListParams {
  page?: number;
  limit?: number;
  status?: string;
  branchId?: string;
  apartmentId?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export async function createBooking(data: {
  apartmentId: string;
  branchId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  notes?: string;
}): Promise<Booking> {
  const raw = await apiFetch<RawBooking>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return mapBooking(raw);
}

export async function fetchBookings(
  params: BookingListParams = {}
): Promise<PaginatedResponse<Booking>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.status) searchParams.set('status', params.status);
  if (params.branchId) searchParams.set('branchId', params.branchId);
  if (params.apartmentId) searchParams.set('apartmentId', params.apartmentId);
  const query = searchParams.toString();
  const result = await apiFetch<{ data: RawBooking[]; total: number; page: number; limit: number }>(
    `/api/bookings${query ? `?${query}` : ''}`
  );
  return {
    ...result,
    data: result.data.map(mapBooking),
  };
}

export async function fetchBooking(id: string): Promise<Booking> {
  const raw = await apiFetch<RawBooking>(`/api/bookings/${id}`);
  return mapBooking(raw);
}

export async function cancelBooking(id: string): Promise<Booking> {
  const raw = await apiFetch<RawBooking>(`/api/bookings/${id}/cancel`, {
    method: 'PUT',
  });
  return mapBooking(raw);
}

export async function modifyBooking(
  id: string,
  data: {
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    notes?: string;
  }
): Promise<Booking> {
  const raw = await apiFetch<RawBooking>(`/api/bookings/${id}/modify`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return mapBooking(raw);
}
