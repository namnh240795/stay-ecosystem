import { apiFetch } from './client';

export interface GroupTour {
  id: string;
  tourId: string;
  tourName: string;
  creatorName: string;
  creatorEmail: string;
  currentMembers: number;
  requiredMembers: number;
  status: string;
  members: string;
  date: string;
}

export async function fetchGroupTours(): Promise<{ data: GroupTour[] }> {
  return apiFetch('/api/admin/group-tours');
}
