import { apiFetch } from './client';

export interface Booking {
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
  return apiFetch('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
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
  return apiFetch(`/api/bookings${query ? `?${query}` : ''}`);
}

export async function fetchBooking(id: string): Promise<Booking> {
  return apiFetch(`/api/bookings/${id}`);
}

export async function cancelBooking(id: string): Promise<Booking> {
  return apiFetch(`/api/bookings/${id}/cancel`, {
    method: 'PUT',
  });
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
  return apiFetch(`/api/bookings/${id}/modify`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
