import { apiFetch } from './client';

// Raw interface matching the API response with prefixed field names
interface RawDashboardStats {
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

interface RawRevenueData {
  dashboard_label: string;
  dashboard_hotel: number;
  dashboard_apt: number;
  dashboard_total: number;
}

// Component-facing interfaces with unprefixed field names
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

function mapDashboardStats(raw: RawDashboardStats): DashboardStats {
  return {
    totalRevenue: raw.dashboard_totalRevenue,
    hotelRevenue: raw.dashboard_hotelRevenue,
    aptRevenue: raw.dashboard_aptRevenue,
    totalBookings: raw.dashboard_totalBookings,
    activeBookings: raw.dashboard_activeBookings,
    totalProperties: raw.dashboard_totalProperties,
    activeProperties: raw.dashboard_activeProperties,
    occupancyRate: raw.dashboard_occupancyRate,
    pendingContracts: raw.dashboard_pendingContracts,
    totalUsers: raw.dashboard_totalUsers,
    sepayTotalCount: raw.dashboard_sepayTotalCount,
    sepayTotalAmount: raw.dashboard_sepayTotalAmount,
    stripeTotalCount: raw.dashboard_stripeTotalCount,
    stripeTotalAmount: raw.dashboard_stripeTotalAmount,
  };
}

function mapRevenueData(raw: RawRevenueData): RevenueData {
  return {
    label: raw.dashboard_label,
    hotel: raw.dashboard_hotel,
    apt: raw.dashboard_apt,
    total: raw.dashboard_total,
  };
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const raw = await apiFetch<RawDashboardStats>('/api/admin/dashboard/stats');
  return mapDashboardStats(raw);
}

export async function fetchDashboardRevenue(period: string = 'weekly'): Promise<RevenueData[]> {
  const raw = await apiFetch<RawRevenueData[]>(`/api/admin/dashboard/revenue?period=${period}`);
  return raw.map(mapRevenueData);
}
