import { apiFetch } from './client';

interface Role {
  id: string;
  name: string;
  permissions: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

export async function fetchRoles(): Promise<{ data: Role[] }> {
  return apiFetch('/api/admin/roles');
}

export async function createRole(data: Partial<Role>): Promise<Role> {
  return apiFetch('/api/admin/roles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateRole(
  id: string,
  data: Partial<Role>
): Promise<Role> {
  return apiFetch(`/api/admin/roles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteRole(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/api/admin/roles/${id}`, {
    method: 'DELETE',
  });
}
