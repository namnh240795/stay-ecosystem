import { apiFetch } from './client';

export interface GroupTour {
  id: string;
  tour_id: string;
  tour_name: string;
  creator_name: string;
  creator_email: string;
  current_members: number;
  required_members: number;
  status: string;
  members: string;
  date: string;
}

export async function fetchGroupTours(): Promise<{ data: GroupTour[] }> {
  return apiFetch('/api/admin/group-tours');
}
