import { apiFetch } from './client';

// Raw interface matching the API response with prefixed field names
interface RawBooking {
  bookings_id: string;
  bookings_apartment_id: string;
  bookings_branch_id: string;
  bookings_customer_name: string;
  bookings_customer_email: string;
  bookings_customer_phone?: string;
  bookings_check_in: string;
  bookings_check_out: string;
  bookings_guests: number;
  bookings_total_price: number;
  bookings_status: string;
  bookings_notes?: string;
  bookings_created_at: string;
  bookings_updated_at: string;
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
    apartmentId: raw.bookings_apartment_id,
    branchId: raw.bookings_branch_id,
    customerName: raw.bookings_customer_name,
    customerEmail: raw.bookings_customer_email,
    customerPhone: raw.bookings_customer_phone,
    checkIn: raw.bookings_check_in,
    checkOut: raw.bookings_check_out,
    guests: raw.bookings_guests,
    totalPrice: raw.bookings_total_price,
    status: raw.bookings_status,
    notes: raw.bookings_notes,
    createdAt: raw.bookings_created_at,
    updatedAt: raw.bookings_updated_at,
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
