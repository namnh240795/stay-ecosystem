import { apiFetch } from './client';

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
