import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats, fetchDashboardRevenue } from '../api/dashboard';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
  });
}

export function useDashboardRevenue(period: string = 'weekly') {
  return useQuery({
    queryKey: ['dashboard', 'revenue', period],
    queryFn: () => fetchDashboardRevenue(period),
  });
}
