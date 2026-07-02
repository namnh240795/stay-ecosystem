#!/bin/bash
# Setup Workers Builds for all services
# Run this after authenticating with `wrangler login`

set -euo pipefail

echo "=========================================="
echo "  Workers Builds Setup - Stay Ecosystem"
echo "=========================================="
echo ""

# Check if wrangler is authenticated
if ! wrangler whoami > /dev/null 2>&1; then
  echo "❌ Not authenticated with Cloudflare"
  echo "   Run: wrangler login"
  exit 1
fi

echo "✅ Authenticated with Cloudflare"
echo ""

# Get account ID
ACCOUNT_ID="5df5f9ca01d687682ab73f8a47e9586a"
if [ -z "$ACCOUNT_ID" ]; then
  echo "❌ Could not determine Account ID"
  echo "   Run: wrangler whoami"
  exit 1
fi

echo "📋 Account ID: $ACCOUNT_ID"
echo ""

# Function to create a D1 database
create_d1() {
  local name=$1
  echo "  Creating D1 database: $name"
  result=$(wrangler d1 create "$name" 2>&1 || true)
  db_id=$(echo "$result" | grep 'database_id' | sed 's/.*"\([a-f0-9-]*\)".*/\1/' || echo "")
  if [ -n "$db_id" ]; then
    echo "  ✅ Created: $name (ID: $db_id)"
    echo "  $name=$db_id" >> /tmp/d1-databases.txt
  else
    echo "  ⚠️  Database $name may already exist or failed to create"
  fi
}

# Create D1 databases for all services
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Creating D1 Databases"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

> /tmp/d1-databases.txt

for env in sit uat prod; do
  echo "🌍 Environment: $env"
  for service in users properties bookings payments reviews; do
    create_d1 "${service}-db-${env}"
  done
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Database IDs Saved"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Database IDs have been saved to /tmp/d1-databases.txt"
echo "Use these to update wrangler.toml files."
echo ""

# Display summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Next Steps"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Update wrangler.toml files with the database IDs from /tmp/d1-databases.txt"
echo ""
echo "2. Go to Cloudflare Dashboard and set up Workers Builds:"
echo "   https://dash.cloudflare.com/?to=/:account/workers-and-pages"
echo ""
echo "3. For each service, click 'Create Application' → 'Connect a Git repository'"
echo "   Repository: namnh240795/stay-ecosystem"
echo ""
echo "4. Configure build/deploy commands (see docs/workers-builds-setup.md)"
echo ""
echo "5. Add environment variables in the dashboard:"
echo "   - Auth0 config for auth service"
echo "   - Service URLs for gateway"
echo "   - VITE_AUTH0_* for frontend apps"
echo ""
echo "Done! Workers Builds will auto-deploy on push to sit/uat/prod branches."
