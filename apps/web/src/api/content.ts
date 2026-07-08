import { apiFetch } from './client';

export interface LongtermContent {
  longtermContent_id?: string;
  longtermContent_title: string;
  longtermContent_content: string;
  longtermContent_benefits?: string[];
  longtermContent_pricing?: Record<string, unknown>;
  longtermContent_updatedAt?: string;
}

export interface RefundPolicy {
  refundPolicies_id?: string;
  refundPolicies_title: string;
  refundPolicies_content: string;
  refundPolicies_rules?: string[];
  refundPolicies_updatedAt?: string;
}

export interface Voucher {
  vouchers_id: string;
  vouchers_code: string;
  vouchers_description?: string;
  vouchers_discountPercent?: number;
  vouchers_discountAmount?: number;
  vouchers_validFrom: string;
  vouchers_validUntil: string;
  vouchers_minBookingAmount?: number;
  vouchers_maxUses?: number;
  vouchers_usedCount: number;
  vouchers_status: string;
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
