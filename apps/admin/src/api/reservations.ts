import { apiFetch } from './client';

interface PaginationParams {
  page?: number;
  limit?: number;
  status?: string;
  apartmentId?: string;
  guestId?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface Reservation {
  reservations_id: string;
  reservations_apartmentId: string;
  reservations_guestId: string;
  reservations_checkIn: string;
  reservations_checkOut: string;
  reservations_status: string;
  reservations_totalPrice: number;
  reservations_notes: string;
  reservations_createdAt: string;
  reservations_updatedAt: string;
}

export async function fetchReservations(
  params: PaginationParams = {}
): Promise<PaginatedResponse<Reservation>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.status) searchParams.set('status', params.status);
  if (params.apartmentId) searchParams.set('apartmentId', params.apartmentId);
  if (params.guestId) searchParams.set('guestId', params.guestId);
  const query = searchParams.toString();
  return apiFetch(`/api/admin/reservations${query ? `?${query}` : ''}`);
}

export async function fetchReservation(id: string): Promise<Reservation> {
  return apiFetch(`/api/admin/reservations/${id}`);
}

export async function createReservation(
  data: Partial<Reservation>
): Promise<Reservation> {
  return apiFetch('/api/admin/reservations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateReservationStatus(
  id: string,
  data: { status: string; notes?: string }
): Promise<Reservation> {
  return apiFetch(`/api/admin/reservations/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
