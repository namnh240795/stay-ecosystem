/**
 * Auth0 Management API Client
 *
 * Provides methods to manage users, roles, and permissions
 * using the Auth0 Management API with M2M (Machine-to-Machine) credentials.
 */

export interface Auth0ManagementConfig {
  domain: string;
  clientId: string;
  clientSecret: string;
}

export interface Auth0Role {
  id: string;
  name: string;
  description: string;
}

export interface Auth0Permission {
  permission_name: string;
  resource_server_identifier: string;
}

export interface Auth0UserRole {
  id: string;
  name: string;
  description: string;
}

export interface Auth0User {
  user_id: string;
  email: string;
  name?: string;
  picture?: string;
  created_at: string;
  last_login?: string;
  logins_count: number;
}

export class Auth0ManagementClient {
  private domain: string;
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config: Auth0ManagementConfig) {
    this.domain = config.domain;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
  }

  /**
   * Get M2M access token using client credentials
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const response = await fetch(`https://${this.domain}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        audience: `https://${this.domain}/api/v2/`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return this.accessToken!;
  }

  /**
   * Make authenticated request to Management API
   */
  private async request<T>(method: string, path: string, body?: any): Promise<T> {
    const token = await this.getAccessToken();
    const response = await fetch(`https://${this.domain}/api/v2${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Auth0 API error: ${response.status} ${response.statusText} - ${JSON.stringify(error)}`
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // ==================== ROLES ====================

  /**
   * Get all roles
   */
  async getRoles(): Promise<Auth0Role[]> {
    return this.request<Auth0Role[]>('GET', '/roles');
  }

  /**
   * Get a single role by ID
   */
  async getRole(roleId: string): Promise<Auth0Role> {
    return this.request<Auth0Role>('GET', `/roles/${roleId}`);
  }

  /**
   * Create a new role
   */
  async createRole(data: { name: string; description: string }): Promise<Auth0Role> {
    return this.request<Auth0Role>('POST', '/roles', data);
  }

  /**
   * Delete a role
   */
  async deleteRole(roleId: string): Promise<void> {
    return this.request<void>('DELETE', `/roles/${roleId}`);
  }

  // ==================== ROLE PERMISSIONS ====================

  /**
   * Get permissions for a role
   */
  async getRolePermissions(roleId: string): Promise<Auth0Permission[]> {
    return this.request<Auth0Permission[]>('GET', `/roles/${roleId}/permissions`);
  }

  /**
   * Add permissions to a role
   */
  async addPermissionsToRole(
    roleId: string,
    permissions: { permission_name: string; resource_server_identifier: string }[]
  ): Promise<void> {
    return this.request<void>('POST', `/roles/${roleId}/permissions`, { permissions });
  }

  /**
   * Remove permissions from a role
   */
  async removePermissionsFromRole(
    roleId: string,
    permissions: { permission_name: string; resource_server_identifier: string }[]
  ): Promise<void> {
    return this.request<void>('DELETE', `/roles/${roleId}/permissions`, { permissions });
  }

  // ==================== USER ROLES ====================

  /**
   * Get roles assigned to a user
   */
  async getUserRoles(userId: string): Promise<Auth0UserRole[]> {
    return this.request<Auth0UserRole[]>('GET', `/users/${userId}/roles`);
  }

  /**
   * Assign roles to a user
   */
  async assignRolesToUser(
    userId: string,
    roleIds: { roles: string[] }
  ): Promise<void> {
    return this.request<void>('POST', `/users/${userId}/roles`, roleIds);
  }

  /**
   * Remove roles from a user
   */
  async removeRolesFromUser(
    userId: string,
    roleIds: { roles: string[] }
  ): Promise<void> {
    return this.request<void>('DELETE', `/users/${userId}/roles`, roleIds);
  }

  // ==================== USERS ====================

  /**
   * Get a user by ID
   */
  async getUser(userId: string): Promise<Auth0User> {
    return this.request<Auth0User>('GET', `/users/${userId}`);
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<Auth0User[]> {
    return this.request<Auth0User[]>('GET', `/users?q=email:${encodeURIComponent(email)}&search_engine=v3`);
  }

  /**
   * List users with pagination
   */
  async listUsers(params?: {
    page?: number;
    per_page?: number;
    sort?: string;
    connection?: string;
    include_totals?: boolean;
  }): Promise<{ users: Auth0User[]; total?: number }> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.per_page) query.set('per_page', String(params.per_page));
    if (params?.sort) query.set('sort', params.sort);
    if (params?.connection) query.set('connection', params.connection);
    if (params?.include_totals) query.set('include_totals', 'true');

    return this.request<{ users: Auth0User[]; total?: number }>(
      'GET',
      `/users?${query.toString()}&search_engine=v3`
    );
  }

  // ==================== RESOURCE SERVERS (APIs) ====================

  /**
   * Get all resource servers (APIs)
   */
  async getResourceServers(): Promise<any[]> {
    return this.request<any[]>('GET', '/resource-servers');
  }

  /**
   * Create a resource server (API)
   */
  async createResourceServer(data: {
    identifier: string;
    name: string;
    scopes?: { value: string; description: string }[];
  }): Promise<any> {
    return this.request<any>('POST', '/resource-servers', data);
  }

  /**
   * Get a resource server by ID
   */
  async getResourceServer(identifier: string): Promise<any> {
    return this.request<any>('GET', `/resource-servers/${encodeURIComponent(identifier)}`);
  }

  // ==================== PERMISSIONS (Resource Server Scopes) ====================

  /**
   * Get all permissions/scopes for a resource server
   */
  async getResourceServerScopes(identifier: string): Promise<any> {
    return this.request<any>('GET', `/resource-servers/${encodeURIComponent(identifier)}`);
  }
}
