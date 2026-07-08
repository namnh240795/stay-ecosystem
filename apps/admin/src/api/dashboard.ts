import { apiFetch } from './client';

// Raw interface matching the API response with prefixed field names
interface RawDashboardStats {
  dashboard_total_revenue: number;
  dashboard_hotel_revenue: number;
  dashboard_apt_revenue: number;
  dashboard_total_bookings: number;
  dashboard_active_bookings: number;
  dashboard_total_properties: number;
  dashboard_active_properties: number;
  dashboard_occupancy_rate: number;
  dashboard_pending_contracts: number;
  dashboard_total_users: number;
  dashboard_sepay_total_count: number;
  dashboard_sepay_total_amount: number;
  dashboard_stripe_total_count: number;
  dashboard_stripe_total_amount: number;
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
    totalRevenue: raw.dashboard_total_revenue,
    hotelRevenue: raw.dashboard_hotel_revenue,
    aptRevenue: raw.dashboard_apt_revenue,
    totalBookings: raw.dashboard_total_bookings,
    activeBookings: raw.dashboard_active_bookings,
    totalProperties: raw.dashboard_total_properties,
    activeProperties: raw.dashboard_active_properties,
    occupancyRate: raw.dashboard_occupancy_rate,
    pendingContracts: raw.dashboard_pending_contracts,
    totalUsers: raw.dashboard_total_users,
    sepayTotalCount: raw.dashboard_sepay_total_count,
    sepayTotalAmount: raw.dashboard_sepay_total_amount,
    stripeTotalCount: raw.dashboard_stripe_total_count,
    stripeTotalAmount: raw.dashboard_stripe_total_amount,
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
