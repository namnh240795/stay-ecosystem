import { apiFetch } from './client';

// Raw interfaces matching the API response with prefixed field names
interface RawLongtermContent {
  longtermContent_id?: string;
  longtermContent_title: string;
  longtermContent_content: string;
  longtermContent_benefits?: string[];
  longtermContent_pricing?: Record<string, unknown>;
  longtermContent_updatedAt?: string;
}

interface RawRefundPolicy {
  refundPolicies_id?: string;
  refundPolicies_title: string;
  refundPolicies_content: string;
  refundPolicies_rules?: string[];
  refundPolicies_updatedAt?: string;
}

interface RawVoucher {
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

// Component-facing interfaces with unprefixed field names
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

function mapLongtermContent(raw: RawLongtermContent): LongtermContent {
  return {
    id: raw.longtermContent_id,
    title: raw.longtermContent_title,
    content: raw.longtermContent_content,
    benefits: raw.longtermContent_benefits,
    pricing: raw.longtermContent_pricing,
    updatedAt: raw.longtermContent_updatedAt,
  };
}

function mapRefundPolicy(raw: RawRefundPolicy): RefundPolicy {
  return {
    id: raw.refundPolicies_id,
    title: raw.refundPolicies_title,
    content: raw.refundPolicies_content,
    rules: raw.refundPolicies_rules,
    updatedAt: raw.refundPolicies_updatedAt,
  };
}

function mapVoucher(raw: RawVoucher): Voucher {
  return {
    id: raw.vouchers_id,
    code: raw.vouchers_code,
    description: raw.vouchers_description,
    discountPercent: raw.vouchers_discountPercent,
    discountAmount: raw.vouchers_discountAmount,
    validFrom: raw.vouchers_validFrom,
    validUntil: raw.vouchers_validUntil,
    minBookingAmount: raw.vouchers_minBookingAmount,
    maxUses: raw.vouchers_maxUses,
    usedCount: raw.vouchers_usedCount,
    status: raw.vouchers_status,
  };
}

export async function fetchLongtermContent(): Promise<LongtermContent> {
  const raw = await apiFetch<RawLongtermContent>('/api/content/longterm');
  return mapLongtermContent(raw);
}

export async function updateLongtermContent(
  data: Partial<LongtermContent>
): Promise<LongtermContent> {
  const raw = await apiFetch<RawLongtermContent>('/api/content/longterm', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return mapLongtermContent(raw);
}

export async function fetchRefundPolicy(): Promise<RefundPolicy> {
  const raw = await apiFetch<RawRefundPolicy>('/api/policies/refund');
  return mapRefundPolicy(raw);
}

export async function updateRefundPolicy(
  data: Partial<RefundPolicy>
): Promise<RefundPolicy> {
  const raw = await apiFetch<RawRefundPolicy>('/api/policies/refund', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return mapRefundPolicy(raw);
}

export async function fetchVouchers(): Promise<{ data: Voucher[] }> {
  const result = await apiFetch<{ data: RawVoucher[] }>('/api/vouchers');
  return {
    data: result.data.map(mapVoucher),
  };
}
