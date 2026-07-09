import { apiFetch } from './client';

// Raw interface matching the API response (camelCase from handler)
interface RawDashboardStats {
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

interface RawRevenueData {
  label: string;
  hotel: number;
  apt: number;
  total: number;
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
    totalRevenue: raw.totalRevenue,
    hotelRevenue: raw.hotelRevenue,
    aptRevenue: raw.aptRevenue,
    totalBookings: raw.totalBookings,
    activeBookings: raw.activeBookings,
    totalProperties: raw.totalProperties,
    activeProperties: raw.activeProperties,
    occupancyRate: raw.occupancyRate,
    pendingContracts: raw.pendingContracts,
    totalUsers: raw.totalUsers,
    sepayTotalCount: raw.sepayTotalCount,
    sepayTotalAmount: raw.sepayTotalAmount,
    stripeTotalCount: raw.stripeTotalCount,
    stripeTotalAmount: raw.stripeTotalAmount,
  };
}

function mapRevenueData(raw: RawRevenueData): RevenueData {
  return {
    label: raw.label,
    hotel: raw.hotel,
    apt: raw.apt,
    total: raw.total,
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
