#!/bin/bash
# Tag Cloudflare resources after deployment
# Usage: ./scripts/tag-resources.sh <environment>
# Example: ./scripts/tag-resources.sh sit

set -euo pipefail

ENV="${1:?Usage: $0 <environment>}"
CF_API_TOKEN="${CLOUDFLARE_API_TOKEN:?CLOUDFLARE_API_TOKEN is required}"
CF_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:?CLOUDFLARE_ACCOUNT_ID is required}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[TAG]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Service names and their worker names per environment
declare -A SERVICES=(
  ["auth"]="auth-service"
  ["users"]="users-service"
  ["properties"]="properties-service"
  ["bookings"]="bookings-service"
  ["payments"]="payments-service"
  ["reviews"]="reviews-service"
  ["gateway"]="gateway"
)

# D1 database names per service
declare -A D1_SERVICES=(
  ["users"]="users-db"
  ["properties"]="properties-db"
  ["bookings"]="bookings-db"
  ["payments"]="payments-db"
  ["reviews"]="reviews-db"
)

# Common tags for all resources
COMMON_TAGS="env:${ENV},project:stay-ecosystem,managed-by:ci-cd"

# Function to tag a Worker script
tag_worker() {
  local script_name="$1"
  local tags="$2"

  log "Tagging worker: ${script_name}"

  # Get current tags
  local current_tags
  current_tags=$(curl -s -X GET \
    "https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/workers/scripts/${script_name}" \
    -H "Authorization: Bearer ${CF_API_TOKEN}" \
    -H "Content-Type: application/json" | jq -r '.result.metadata.tags // []' 2>/dev/null || echo "[]")

  # Merge tags (avoid duplicates)
  local all_tags
  all_tags=$(echo "${current_tags}" "${tags}" | tr ',' '\n' | sort -u | tr '\n' ',' | sed 's/,$//')

  # Update worker tags
  local response
  response=$(curl -s -X PUT \
    "https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/workers/scripts/${script_name}" \
    -H "Authorization: Bearer ${CF_API_TOKEN}" \
    -H "Content-Type: application/javascript" \
    --data-binary @/dev/null \
    -G --data-urlencode "tags=${all_tags}" 2>/dev/null)

  if echo "${response}" | jq -e '.success' > /dev/null 2>&1; then
    log "  ✓ Tagged ${script_name} with: ${tags}"
  else
    warn "  ✗ Failed to tag ${script_name}: $(echo "${response}" | jq -r '.errors[0].message // "unknown error"')"
  fi
}

# Function to tag a D1 database
tag_d1() {
  local db_name="$1"
  local tags="$2"

  log "Tagging D1 database: ${db_name}"

  # List databases to find the one matching our name
  local databases
  databases=$(curl -s -X GET \
    "https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database" \
    -H "Authorization: Bearer ${CF_API_TOKEN}" \
    -H "Content-Type: application/json" 2>/dev/null)

  local db_id
  db_id=$(echo "${databases}" | jq -r ".result[] | select(.name == \"${db_name}\") | .uuid" 2>/dev/null | head -1)

  if [ -z "${db_id}" ]; then
    warn "  ✗ Database ${db_name} not found, skipping"
    return
  fi

  # Tag the database
  local response
  response=$(curl -s -X PATCH \
    "https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${db_id}" \
    -H "Authorization: Bearer ${CF_API_TOKEN}" \
    -H "Content-Type: application/json" \
    --data "{\"tags\": \"${tags}\"}" 2>/dev/null)

  if echo "${response}" | jq -e '.success' > /dev/null 2>&1; then
    log "  ✓ Tagged ${db_name} (${db_id}) with: ${tags}"
  else
    warn "  ✗ Failed to tag ${db_name}: $(echo "${response}" | jq -r '.errors[0].message // "unknown error"')"
  fi
}

# Function to tag Cloudflare Pages project
tag_pages() {
  local project_name="$1"
  local tags="$2"

  log "Tagging Pages project: ${project_name}"

  local response
  response=$(curl -s -X PATCH \
    "https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/pages/projects/${project_name}" \
    -H "Authorization: Bearer ${CF_API_TOKEN}" \
    -H "Content-Type: application/json" \
    --data "{\"tags\": \"${tags}\"}" 2>/dev/null)

  if echo "${response}" | jq -e '.success' > /dev/null 2>&1; then
    log "  ✓ Tagged Pages project ${project_name} with: ${tags}"
  else
    warn "  ✗ Failed to tag Pages project ${project_name}: $(echo "${response}" | jq -r '.errors[0].message // "unknown error"')"
  fi
}

# Main execution
log "Tagging Cloudflare resources for environment: ${ENV}"
echo ""

# Tag Workers
log "=== Tagging Workers ==="
for service in "${!SERVICES[@]}"; do
  worker_name="${SERVICES[$service]}-${ENV}"
  service_tags="service:${service},${COMMON_TAGS}"
  tag_worker "${worker_name}" "${service_tags}"
done
echo ""

# Tag D1 Databases
log "=== Tagging D1 Databases ==="
for service in "${!D1_SERVICES[@]}"; do
  db_name="${D1_SERVICES[$service]}-${ENV}"
  service_tags="service:${service},${COMMON_TAGS}"
  tag_d1 "${db_name}" "${service_tags}"
done
echo ""

# Tag Pages Projects
log "=== Tagging Pages Projects ==="
PAGES_PROJECTS=("stay-${ENV}" "partner-${ENV}" "admin-${ENV}" "login-${ENV}")
for project in "${PAGES_PROJECTS[@]}"; do
  tag_pages "${project}" "${COMMON_TAGS}"
done
echo ""

log "Resource tagging complete for environment: ${ENV}"
