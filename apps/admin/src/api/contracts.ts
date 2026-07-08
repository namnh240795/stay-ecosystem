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

// Raw interface matching the API response with prefixed field names
interface RawContract {
  contracts_id: string;
  contracts_apartment_id: string;
  contracts_tenant_id: string;
  contracts_start_date: string;
  contracts_end_date: string;
  contracts_monthly_rent: number;
  contracts_deposit: number;
  contracts_status: string;
  contracts_terms: string;
  contracts_created_at: string;
  contracts_updated_at: string;
}

// Component-facing interface with unprefixed field names
export interface Contract {
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

function mapContract(raw: RawContract): Contract {
  return {
    id: raw.contracts_id,
    apartmentId: raw.contracts_apartment_id,
    tenantId: raw.contracts_tenant_id,
    startDate: raw.contracts_start_date,
    endDate: raw.contracts_end_date,
    monthlyRent: raw.contracts_monthly_rent,
    deposit: raw.contracts_deposit,
    status: raw.contracts_status,
    terms: raw.contracts_terms,
    createdAt: raw.contracts_created_at,
    updatedAt: raw.contracts_updated_at,
  };
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
  const result = await apiFetch<{ data: RawContract[]; total: number; page: number; limit: number }>(
    `/api/admin/contracts${query ? `?${query}` : ''}`
  );
  return {
    ...result,
    data: result.data.map(mapContract),
  };
}

export async function createContract(data: Partial<Contract>): Promise<Contract> {
  const raw = await apiFetch<RawContract>('/api/admin/contracts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return mapContract(raw);
}

export async function updateContractStatus(
  id: string,
  data: { status: string }
): Promise<Contract> {
  const raw = await apiFetch<RawContract>(`/api/admin/contracts/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return mapContract(raw);
}
