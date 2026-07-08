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
  contracts_id: string;
  contracts_apartmentId: string;
  contracts_tenantId: string;
  contracts_startDate: string;
  contracts_endDate: string;
  contracts_monthlyRent: number;
  contracts_deposit: number;
  contracts_status: string;
  contracts_terms: string;
  contracts_createdAt: string;
  contracts_updatedAt: string;
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
