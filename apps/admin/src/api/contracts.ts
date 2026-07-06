import { apiFetch } from './client';

interface PaginationParams {
  page?: number;
  limit?: number;
  status?: string;
  apartmentId?: string;
  tenantId?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface Contract {
  id: string;
  apartmentId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  status: string;
  terms: string;
  createdAt: string;
  updatedAt: string;
}

export async function fetchContracts(
  params: PaginationParams = {}
): Promise<PaginatedResponse<Contract>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.status) searchParams.set('status', params.status);
  if (params.apartmentId) searchParams.set('apartmentId', params.apartmentId);
  if (params.tenantId) searchParams.set('tenantId', params.tenantId);
  const query = searchParams.toString();
  return apiFetch(`/api/admin/contracts${query ? `?${query}` : ''}`);
}

export async function createContract(data: Partial<Contract>): Promise<Contract> {
  return apiFetch('/api/admin/contracts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateContractStatus(
  id: string,
  data: { status: string }
): Promise<Contract> {
  return apiFetch(`/api/admin/contracts/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
