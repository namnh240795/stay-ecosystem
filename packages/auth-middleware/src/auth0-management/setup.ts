/**
 * Auth0 M2M Setup Script
 *
 * Run this script to configure Auth0 with roles and permissions:
 *   npx tsx src/auth0-management/setup.ts
 *
 * Environment variables required:
 *   AUTH0_M2M_DOMAIN
 *   AUTH0_M2M_CLIENT_ID
 *   AUTH0_M2M_CLIENT_SECRET
 */

import { Auth0ManagementClient } from './client';

// ==================== CONFIGURATION ====================

const RESOURCE_SERVER_IDENTIFIER = 'https://booking.com';

const PERMISSIONS = [
  { value: 'read:properties', description: 'View properties and listings' },
  { value: 'create:properties', description: 'Create new properties' },
  { value: 'update:properties', description: 'Update property details' },
  { value: 'delete:properties', description: 'Delete properties' },
  { value: 'read:bookings', description: 'View bookings' },
  { value: 'create:bookings', description: 'Create new bookings' },
  { value: 'update:bookings', description: 'Update booking status' },
  { value: 'cancel:bookings', description: 'Cancel bookings' },
  { value: 'read:users', description: 'View user profiles' },
  { value: 'manage:users', description: 'Manage user accounts' },
  { value: 'read:reports', description: 'View analytics reports' },
  { value: 'manage:payments', description: 'Process and manage payments' },
  { value: 'manage:reviews', description: 'Moderate reviews' },
  { value: 'admin:full', description: 'Full administrative access' },
];

const ROLES = [
  {
    name: 'guest',
    description: 'Default customer role with basic booking permissions',
    permissions: ['read:properties', 'create:bookings', 'read:bookings'],
  },
  {
    name: 'partner',
    description: 'Property partner with listing management permissions',
    permissions: [
      'read:properties',
      'create:properties',
      'update:properties',
      'read:bookings',
      'update:bookings',
      'read:reports',
      'manage:reviews',
    ],
  },
  {
    name: 'admin',
    description: 'System administrator with full access',
    permissions: PERMISSIONS.map((p) => p.value),
  },
  {
    name: 'super-admin',
    description: 'Super administrator with unrestricted access',
    permissions: PERMISSIONS.map((p) => p.value),
  },
];

// ==================== MAIN ====================

async function main() {
  const domain = process.env.AUTH0_M2M_DOMAIN;
  const clientId = process.env.AUTH0_M2M_CLIENT_ID;
  const clientSecret = process.env.AUTH0_M2M_CLIENT_SECRET;

  if (!domain || !clientId || !clientSecret) {
    console.error('❌ Missing required environment variables:');
    console.error('   AUTH0_M2M_DOMAIN');
    console.error('   AUTH0_M2M_CLIENT_ID');
    console.error('   AUTH0_M2M_CLIENT_SECRET');
    console.error('');
    console.error('Please set them in your .env file or export them.');
    process.exit(1);
  }

  console.log('🔧 Auth0 M2M Setup');
  console.log('==================\n');
  console.log(`Domain: ${domain}`);
  console.log('');

  const client = new Auth0ManagementClient({ domain, clientId, clientSecret });

  try {
    // Step 1: Create or get Resource Server (API)
    console.log('📡 Step 1: Setting up Resource Server (API)...');
    let resourceServer;
    try {
      resourceServer = await client.getResourceServer(RESOURCE_SERVER_IDENTIFIER);
      console.log(`   ✅ Resource server already exists: ${resourceServer.name}`);
    } catch {
      resourceServer = await client.createResourceServer({
        identifier: RESOURCE_SERVER_IDENTIFIER,
        name: 'Booking System API',
        scopes: PERMISSIONS,
      });
      console.log(`   ✅ Created resource server: ${resourceServer.name}`);
    }
    console.log(`   Identifier: ${resourceServer.identifier}`);
    console.log(`   Scopes: ${resourceServer.scopes?.length || 0}`);
    console.log('');

    // Step 2: Create Roles
    console.log('👥 Step 2: Creating roles...');
    const existingRoles = await client.getRoles();
    const roleMap: Record<string, string> = {};

    for (const existingRole of existingRoles) {
      roleMap[existingRole.name] = existingRole.id;
    }

    for (const roleDef of ROLES) {
      if (roleMap[roleDef.name]) {
        console.log(`   ⏭️  Role "${roleDef.name}" already exists (ID: ${roleMap[roleDef.name]})`);
      } else {
        const role = await client.createRole({
          name: roleDef.name,
          description: roleDef.description,
        });
        roleMap[roleDef.name] = role.id;
        console.log(`   ✅ Created role: ${roleDef.name} (ID: ${role.id})`);
      }
    }
    console.log('');

    // Step 3: Assign Permissions to Roles
    console.log('🔐 Step 3: Assigning permissions to roles...');
    for (const roleDef of ROLES) {
      const roleId = roleMap[roleDef.name];
      if (!roleId) continue;

      // Get current permissions
      const currentPerms = await client.getRolePermissions(roleId);
      const currentPermNames = new Set(currentPerms.map((p) => p.permission_name));

      // Find missing permissions
      const missingPerms = roleDef.permissions
        .filter((p) => !currentPermNames.has(p))
        .map((p) => ({
          permission_name: p,
          resource_server_identifier: RESOURCE_SERVER_IDENTIFIER,
        }));

      if (missingPerms.length === 0) {
        console.log(`   ⏭️  Role "${roleDef.name}" already has all permissions`);
      } else {
        await client.addPermissionsToRole(roleId, missingPerms);
        console.log(
          `   ✅ Added ${missingPerms.length} permissions to role "${roleDef.name}"`
        );
      }
    }
    console.log('');

    // Step 4: Summary
    console.log('📊 Summary');
    console.log('==========');
    const allRoles = await client.getRoles();
    for (const role of allRoles) {
      const perms = await client.getRolePermissions(role.id);
      console.log(`   ${role.name}: ${perms.length} permissions`);
    }

    console.log('');
    console.log('✅ Auth0 M2M setup complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Add AUTH0_M2M_* env vars to your .env file');
    console.log('2. Configure the Login Action to include roles in JWT');
    console.log('3. Test with: GET /api/auth/me (with Bearer token)');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

main();
