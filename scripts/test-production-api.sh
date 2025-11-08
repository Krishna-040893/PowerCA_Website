#!/bin/bash

# Production API Test Script
# Tests contact form API endpoints on production

PRODUCTION_URL="https://www.powerca.in"
API_ENDPOINT="/api/contact"
FULL_URL="${PRODUCTION_URL}${API_ENDPOINT}"

echo "========================================="
echo "Testing Production Contact API"
echo "========================================="
echo ""
echo "Production URL: $FULL_URL"
echo "Timestamp: $(date)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: OPTIONS Request (CORS Preflight)
echo "========================================="
echo "Test 1: OPTIONS Request (CORS Preflight)"
echo "========================================="
echo ""

RESPONSE=$(curl -s -X OPTIONS "$FULL_URL" \
  -H "Origin: https://www.powerca.in" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -w "\nHTTP_STATUS:%{http_code}" \
  -o /tmp/options_response.txt)

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
RESPONSE_BODY=$(cat /tmp/options_response.txt)

echo "HTTP Status: $HTTP_STATUS"
echo ""

if [ "$HTTP_STATUS" == "200" ]; then
  echo -e "${GREEN}✓ PASS${NC} - OPTIONS request successful"
else
  echo -e "${RED}✗ FAIL${NC} - OPTIONS should return 200, got $HTTP_STATUS"
fi

# Check for CORS headers
echo ""
echo "Checking CORS headers..."
HEADERS=$(curl -s -I -X OPTIONS "$FULL_URL" \
  -H "Origin: https://www.powerca.in" \
  -H "Access-Control-Request-Method: POST")

if echo "$HEADERS" | grep -q "Access-Control-Allow-Methods.*POST"; then
  echo -e "${GREEN}✓ PASS${NC} - Access-Control-Allow-Methods includes POST"
else
  echo -e "${RED}✗ FAIL${NC} - Missing Access-Control-Allow-Methods header with POST"
fi

if echo "$HEADERS" | grep -q "Access-Control-Allow-Origin"; then
  echo -e "${GREEN}✓ PASS${NC} - Access-Control-Allow-Origin header present"
else
  echo -e "${RED}✗ FAIL${NC} - Missing Access-Control-Allow-Origin header"
fi

echo ""

# Test 2: POST Request (Form Submission)
echo "========================================="
echo "Test 2: POST Request (Form Submission)"
echo "========================================="
echo ""

POST_DATA='{
  "name": "API Test User",
  "email": "apitest@powerca.in",
  "phone": "9876543210",
  "message": "This is an automated test from the test script"
}'

RESPONSE=$(curl -s -X POST "$FULL_URL" \
  -H "Content-Type: application/json" \
  -H "Origin: https://www.powerca.in" \
  -d "$POST_DATA" \
  -w "\nHTTP_STATUS:%{http_code}" \
  -o /tmp/post_response.txt)

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
RESPONSE_BODY=$(cat /tmp/post_response.txt)

echo "HTTP Status: $HTTP_STATUS"
echo "Response Body:"
echo "$RESPONSE_BODY" | head -10
echo ""

if [ "$HTTP_STATUS" == "200" ] || [ "$HTTP_STATUS" == "201" ]; then
  echo -e "${GREEN}✓ PASS${NC} - POST request successful"
elif [ "$HTTP_STATUS" == "500" ]; then
  echo -e "${YELLOW}⚠ WARNING${NC} - Server error (500), but endpoint exists"
  echo "  (This might be due to email configuration)"
elif [ "$HTTP_STATUS" == "429" ]; then
  echo -e "${YELLOW}⚠ WARNING${NC} - Rate limited (429), but endpoint works"
  echo "  (Wait 1 minute before testing again)"
elif [ "$HTTP_STATUS" == "405" ]; then
  echo -e "${RED}✗ FAIL${NC} - Method Not Allowed (405) - POST handler missing!"
else
  echo -e "${RED}✗ FAIL${NC} - Unexpected status code: $HTTP_STATUS"
fi

echo ""

# Test 3: GET Request (Should Return 405)
echo "========================================="
echo "Test 3: GET Request (Should Return 405)"
echo "========================================="
echo ""

RESPONSE=$(curl -s -X GET "$FULL_URL" \
  -w "\nHTTP_STATUS:%{http_code}" \
  -o /tmp/get_response.txt)

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
RESPONSE_BODY=$(cat /tmp/get_response.txt)

echo "HTTP Status: $HTTP_STATUS"
echo "Response Body:"
echo "$RESPONSE_BODY"
echo ""

if [ "$HTTP_STATUS" == "405" ]; then
  echo -e "${GREEN}✓ PASS${NC} - GET correctly returns 405 Method Not Allowed"
else
  echo -e "${RED}✗ FAIL${NC} - GET should return 405, got $HTTP_STATUS"
fi

echo ""

# Test 4: Rate Limiting (3 requests in quick succession)
echo "========================================="
echo "Test 4: Rate Limiting Test"
echo "========================================="
echo ""
echo "Sending 4 POST requests quickly..."
echo ""

RATE_LIMIT_TRIGGERED=false

for i in {1..4}; do
  RESPONSE=$(curl -s -X POST "$FULL_URL" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Test $i\",\"email\":\"test$i@test.com\",\"phone\":\"123456789$i\",\"message\":\"Rate limit test $i\"}" \
    -w "\nHTTP_STATUS:%{http_code}")

  HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)

  echo "Request $i: HTTP $HTTP_STATUS"

  if [ "$HTTP_STATUS" == "429" ]; then
    RATE_LIMIT_TRIGGERED=true
  fi

  sleep 0.5
done

echo ""

if [ "$RATE_LIMIT_TRIGGERED" = true ]; then
  echo -e "${GREEN}✓ PASS${NC} - Rate limiting is working (429 returned)"
else
  echo -e "${YELLOW}⚠ INFO${NC} - Rate limit not triggered (might need faster requests)"
fi

echo ""

# Summary
echo "========================================="
echo "Test Summary"
echo "========================================="
echo ""
echo "Production contact API endpoint tested at: $FULL_URL"
echo "See results above for pass/fail status"
echo ""
echo "Next steps if tests fail:"
echo "1. Check Vercel deployment logs"
echo "2. Verify latest commit is deployed"
echo "3. Clear Vercel build cache and redeploy"
echo "4. Check environment variables in Vercel"
echo ""

# Cleanup
rm -f /tmp/options_response.txt /tmp/post_response.txt /tmp/get_response.txt
