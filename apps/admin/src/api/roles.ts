import { apiFetch } from './client';

// Raw interface matching the API response with prefixed field names
interface RawRole {
  roles_id: string;
  roles_name: string;
  roles_permissions: string[];
  roles_description: string;
  roles_created_at: string;
  roles_updated_at: string;
}

// Component-facing interface with unprefixed field names
export interface Role {
  id: string;
  name: string;
  permissions: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

function mapRole(raw: RawRole): Role {
  return {
    id: raw.roles_id,
    name: raw.roles_name,
    permissions: raw.roles_permissions,
    description: raw.roles_description,
    createdAt: raw.roles_created_at,
    updatedAt: raw.roles_updated_at,
  };
}

export async function fetchRoles(): Promise<{ data: Role[] }> {
  const result = await apiFetch<{ data: RawRole[] }>('/api/admin/roles');
  return {
    data: result.data.map(mapRole),
  };
}

export async function createRole(data: Partial<Role>): Promise<Role> {
  const raw = await apiFetch<RawRole>('/api/admin/roles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return mapRole(raw);
}

export async function updateRole(
  id: string,
  data: Partial<Role>
): Promise<Role> {
  const raw = await apiFetch<RawRole>(`/api/admin/roles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return mapRole(raw);
}

export async function deleteRole(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/api/admin/roles/${id}`, {
    method: 'DELETE',
  });
}
