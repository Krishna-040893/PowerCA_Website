#!/bin/bash

# Deployment Verification Script
# Compares local git commit with deployed version on production

PRODUCTION_URL="https://www.powerca.in"
VERSION_ENDPOINT="/api/version"
FULL_URL="${PRODUCTION_URL}${VERSION_ENDPOINT}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "========================================="
echo "Production Deployment Verification"
echo "========================================="
echo ""

# Get local git information
echo "Local Git Information:"
echo "----------------------"

LOCAL_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
LOCAL_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
LOCAL_COMMIT_DATE=$(git log -1 --format=%cd 2>/dev/null || echo "unknown")
LOCAL_COMMIT_MSG=$(git log -1 --pretty=%B 2>/dev/null || echo "unknown")

echo -e "${BLUE}Current Branch:${NC} $LOCAL_BRANCH"
echo -e "${BLUE}Commit Hash:${NC} $LOCAL_COMMIT"
echo -e "${BLUE}Commit Date:${NC} $LOCAL_COMMIT_DATE"
echo -e "${BLUE}Commit Message:${NC} $LOCAL_COMMIT_MSG"
echo ""

# Get main branch information
echo "Main Branch Information:"
echo "------------------------"

MAIN_COMMIT=$(git rev-parse --short origin/main 2>/dev/null || echo "unknown")
MAIN_COMMIT_DATE=$(git log origin/main -1 --format=%cd 2>/dev/null || echo "unknown")
MAIN_COMMIT_MSG=$(git log origin/main -1 --pretty=%B 2>/dev/null || echo "unknown")

echo -e "${BLUE}Commit Hash:${NC} $MAIN_COMMIT"
echo -e "${BLUE}Commit Date:${NC} $MAIN_COMMIT_DATE"
echo -e "${BLUE}Commit Message:${NC} $MAIN_COMMIT_MSG"
echo ""

# Fetch production version
echo "Production Deployment Information:"
echo "-----------------------------------"

RESPONSE=$(curl -s "$FULL_URL")

if [ $? -ne 0 ]; then
  echo -e "${RED}✗ FAIL${NC} - Could not connect to $FULL_URL"
  exit 1
fi

# Check if response is valid JSON
if ! echo "$RESPONSE" | jq . >/dev/null 2>&1; then
  echo -e "${RED}✗ FAIL${NC} - Invalid JSON response from version endpoint"
  echo "Response: $RESPONSE"
  exit 1
fi

PROD_COMMIT=$(echo "$RESPONSE" | jq -r '.commit // "unknown"')
PROD_BRANCH=$(echo "$RESPONSE" | jq -r '.branch // "unknown"')
PROD_COMMIT_DATE=$(echo "$RESPONSE" | jq -r '.commitDate // "unknown"')
PROD_DEPLOYMENT_DATE=$(echo "$RESPONSE" | jq -r '.deploymentDate // "unknown"')
PROD_COMMIT_MSG=$(echo "$RESPONSE" | jq -r '.commitMessage // "unknown"')
PROD_VERSION=$(echo "$RESPONSE" | jq -r '.version // "unknown"')

echo -e "${BLUE}Version:${NC} $PROD_VERSION"
echo -e "${BLUE}Commit Hash:${NC} $PROD_COMMIT"
echo -e "${BLUE}Branch:${NC} $PROD_BRANCH"
echo -e "${BLUE}Commit Date:${NC} $PROD_COMMIT_DATE"
echo -e "${BLUE}Deployment Date:${NC} $PROD_DEPLOYMENT_DATE"
echo -e "${BLUE}Commit Message:${NC} $PROD_COMMIT_MSG"
echo ""

# Check feature availability
echo "Feature Configuration:"
echo "----------------------"

EMAIL_ENABLED=$(echo "$RESPONSE" | jq -r '.features.emailService // false')
SUPABASE_ENABLED=$(echo "$RESPONSE" | jq -r '.features.supabase // false')
RAZORPAY_ENABLED=$(echo "$RESPONSE" | jq -r '.features.razorpay // false')
AUTH_ENABLED=$(echo "$RESPONSE" | jq -r '.features.auth // false')

echo -e "Email Service: $([ "$EMAIL_ENABLED" == "true" ] && echo -e "${GREEN}✓ Enabled${NC}" || echo -e "${RED}✗ Disabled${NC}")"
echo -e "Supabase: $([ "$SUPABASE_ENABLED" == "true" ] && echo -e "${GREEN}✓ Enabled${NC}" || echo -e "${RED}✗ Disabled${NC}")"
echo -e "Razorpay: $([ "$RAZORPAY_ENABLED" == "true" ] && echo -e "${GREEN}✓ Enabled${NC}" || echo -e "${RED}✗ Disabled${NC}")"
echo -e "Auth: $([ "$AUTH_ENABLED" == "true" ] && echo -e "${GREEN}✓ Enabled${NC}" || echo -e "${RED}✗ Disabled${NC}")"
echo ""

# Comparison
echo "========================================="
echo "Deployment Status"
echo "========================================="
echo ""

if [ "$PROD_COMMIT" == "$MAIN_COMMIT" ]; then
  echo -e "${GREEN}✓ SYNCED${NC} - Production is running the latest main branch commit"
  echo ""
  exit 0
elif [ "$PROD_COMMIT" == "unknown" ]; then
  echo -e "${YELLOW}⚠ WARNING${NC} - Could not determine production commit hash"
  echo "  This might be a git configuration issue in the deployment environment"
  echo ""
  exit 1
else
  echo -e "${RED}✗ OUT OF SYNC${NC} - Production is NOT running the latest code!"
  echo ""
  echo "Production Commit: $PROD_COMMIT"
  echo "Main Branch Commit: $MAIN_COMMIT"
  echo ""
  echo "Commits missing from production:"
  echo "---------------------------------"

  # Show commits between production and main
  git log --oneline --no-merges "$PROD_COMMIT..$MAIN_COMMIT" 2>/dev/null || echo "Could not compare commits"

  echo ""
  echo "Actions required:"
  echo "1. Check Vercel deployment logs for errors"
  echo "2. Trigger manual deployment from Vercel dashboard"
  echo "3. Clear Vercel build cache if needed"
  echo ""
  exit 1
fi
