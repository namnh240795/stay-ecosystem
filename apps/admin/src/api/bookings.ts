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

interface Booking {
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

export async function fetchBookings(
  params: PaginationParams = {}
): Promise<PaginatedResponse<Booking>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.status) searchParams.set('status', params.status);
  if (params.propertyId) searchParams.set('propertyId', params.propertyId);
  const query = searchParams.toString();
  return apiFetch(`/api/admin/bookings${query ? `?${query}` : ''}`);
}

export async function fetchBooking(id: string): Promise<Booking> {
  return apiFetch(`/api/admin/bookings/${id}`);
}

export async function updateBookingStatus(
  id: string,
  data: { status: string; cancellationReason?: string }
): Promise<Booking> {
  return apiFetch(`/api/admin/bookings/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
