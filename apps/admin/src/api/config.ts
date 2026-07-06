import { apiFetch } from './client';

type ConfigSection = 'footer' | 'banners' | 'policies' | 'about';

interface Config {
  section: ConfigSection;
  data: Record<string, unknown>;
  updatedAt: string;
}

export async function fetchConfig(section: ConfigSection): Promise<Config> {
  return apiFetch(`/api/admin/config/${section}`);
}

export async function updateConfig(
  section: ConfigSection,
  data: Record<string, unknown>
): Promise<{ success: boolean }> {
  return apiFetch(`/api/admin/config/${section}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
