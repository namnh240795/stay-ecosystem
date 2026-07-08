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

// Raw interface matching the API response with prefixed field names
interface RawReservation {
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

// Component-facing interface with unprefixed field names
export interface Reservation {
  id: string;
  apartmentId: string;
  guestId: string;
  checkIn: string;
  checkOut: string;
  status: string;
  totalPrice: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

function mapReservation(raw: RawReservation): Reservation {
  return {
    id: raw.reservations_id,
    apartmentId: raw.reservations_apartmentId,
    guestId: raw.reservations_guestId,
    checkIn: raw.reservations_checkIn,
    checkOut: raw.reservations_checkOut,
    status: raw.reservations_status,
    totalPrice: raw.reservations_totalPrice,
    notes: raw.reservations_notes,
    createdAt: raw.reservations_createdAt,
    updatedAt: raw.reservations_updatedAt,
  };
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
  const result = await apiFetch<{ data: RawReservation[]; total: number; page: number; limit: number }>(
    `/api/admin/reservations${query ? `?${query}` : ''}`
  );
  return {
    ...result,
    data: result.data.map(mapReservation),
  };
}

export async function fetchReservation(id: string): Promise<Reservation> {
  const raw = await apiFetch<RawReservation>(`/api/admin/reservations/${id}`);
  return mapReservation(raw);
}

export async function createReservation(
  data: Partial<Reservation>
): Promise<Reservation> {
  const raw = await apiFetch<RawReservation>('/api/admin/reservations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return mapReservation(raw);
}

export async function updateReservationStatus(
  id: string,
  data: { status: string; notes?: string }
): Promise<Reservation> {
  const raw = await apiFetch<RawReservation>(`/api/admin/reservations/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return mapReservation(raw);
}
