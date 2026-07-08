import { apiFetch } from './client';

export interface DashboardStats {
  dashboard_totalRevenue: number;
  dashboard_hotelRevenue: number;
  dashboard_aptRevenue: number;
  dashboard_totalBookings: number;
  dashboard_activeBookings: number;
  dashboard_totalProperties: number;
  dashboard_activeProperties: number;
  dashboard_occupancyRate: number;
  dashboard_pendingContracts: number;
  dashboard_totalUsers: number;
  dashboard_sepayTotalCount: number;
  dashboard_sepayTotalAmount: number;
  dashboard_stripeTotalCount: number;
  dashboard_stripeTotalAmount: number;
}

export interface RevenueData {
  dashboard_label: string;
  dashboard_hotel: number;
  dashboard_apt: number;
  dashboard_total: number;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return apiFetch('/api/admin/dashboard/stats');
}

export async function fetchDashboardRevenue(period: string = 'weekly'): Promise<RevenueData[]> {
  return apiFetch(`/api/admin/dashboard/revenue?period=${period}`);
}
