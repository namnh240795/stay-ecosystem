import { apiFetch } from './client';

export interface Room {
  id: string;
  name: string;
  branchId: string;
  branchName: string;
  status: string;
  occupancy: string;
  housekeeper: string;
}

export interface RoomListResponse {
  data: Room[];
  total: number;
}

export async function fetchRooms(params: {
  branchId?: string;
  status?: string;
  search?: string;
} = {}): Promise<RoomListResponse> {
  const searchParams = new URLSearchParams();
  if (params.branchId) searchParams.set('branchId', params.branchId);
  if (params.status) searchParams.set('status', params.status);
  if (params.search) searchParams.set('search', params.search);
  const query = searchParams.toString();
  return apiFetch(`/api/admin/rooms${query ? `?${query}` : ''}`);
}
