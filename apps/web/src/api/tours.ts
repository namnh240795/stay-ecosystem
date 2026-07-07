import { apiFetch } from './client';

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
  return apiFetch(`/api/tours${query ? `?${query}` : ''}`);
}

export async function fetchTour(id: string): Promise<Tour> {
  return apiFetch(`/api/tours/${id}`);
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
  return apiFetch(`/api/tours/${id}/book`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
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
  return apiFetch(`/api/tours/bookings${query ? `?${query}` : ''}`);
}

export async function cancelTourBooking(id: string): Promise<TourBooking> {
  return apiFetch(`/api/tours/bookings/${id}/cancel`, {
    method: 'PUT',
  });
}
