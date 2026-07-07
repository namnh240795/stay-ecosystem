import { apiFetch } from './client';

export interface LongtermContent {
  id?: string;
  title: string;
  content: string;
  benefits?: string[];
  pricing?: Record<string, unknown>;
  updatedAt?: string;
}

export interface RefundPolicy {
  id?: string;
  title: string;
  content: string;
  rules?: string[];
  updatedAt?: string;
}

export interface Voucher {
  id: string;
  code: string;
  description?: string;
  discountPercent?: number;
  discountAmount?: number;
  validFrom: string;
  validUntil: string;
  minBookingAmount?: number;
  maxUses?: number;
  usedCount: number;
  status: string;
}

export async function fetchLongtermContent(): Promise<LongtermContent> {
  return apiFetch('/api/content/longterm');
}

export async function updateLongtermContent(
  data: Partial<LongtermContent>
): Promise<LongtermContent> {
  return apiFetch('/api/content/longterm', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function fetchRefundPolicy(): Promise<RefundPolicy> {
  return apiFetch('/api/policies/refund');
}

export async function updateRefundPolicy(
  data: Partial<RefundPolicy>
): Promise<RefundPolicy> {
  return apiFetch('/api/policies/refund', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function fetchVouchers(): Promise<{ data: Voucher[] }> {
  return apiFetch('/api/vouchers');
}
