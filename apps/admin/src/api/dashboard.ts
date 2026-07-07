import { apiFetch } from './client';

export interface DashboardStats {
  totalRevenue: number;
  hotelRevenue: number;
  aptRevenue: number;
  totalBookings: number;
  activeBookings: number;
  totalProperties: number;
  activeProperties: number;
  occupancyRate: number;
  pendingContracts: number;
  totalUsers: number;
  sepayTotalCount: number;
  sepayTotalAmount: number;
  stripeTotalCount: number;
  stripeTotalAmount: number;
}

export interface RevenueData {
  label: string;
  hotel: number;
  apt: number;
  total: number;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return apiFetch('/api/admin/dashboard/stats');
}

export async function fetchDashboardRevenue(period: string = 'weekly'): Promise<RevenueData[]> {
  return apiFetch(`/api/admin/dashboard/revenue?period=${period}`);
}
