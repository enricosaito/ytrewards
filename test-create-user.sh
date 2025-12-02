#!/bin/bash

# ============================================
# Test Script for /api/create-user endpoint
# ============================================
# Usage: ./test-create-user.sh test@example.com "Test User"

# Configuration
API_URL="https://ytrewards-sigma.vercel.app/api/create-user"
# Or for local testing: API_URL="http://localhost:8080/api/create-user"

WEBHOOK_SECRET="your_webhook_secret_here"  # Set this to your actual secret

# Get email and name from arguments
EMAIL="${1:-test@example.com}"
NAME="${2:-Test User}"

echo "🧪 Testing User Creation Endpoint"
echo "=================================="
echo "Email: $EMAIL"
echo "Name: $NAME"
echo "URL: $API_URL"
echo ""

# Make the request
echo "📤 Sending request..."
echo ""

response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $WEBHOOK_SECRET" \
  -d "{
    \"email\": \"$EMAIL\",
    \"name\": \"$NAME\"
  }")

# Extract HTTP status and body
http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_STATUS:/d')

echo "📨 Response (Status: $http_status):"
echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
echo ""

# Check status
if [ "$http_status" = "201" ]; then
  echo "✅ SUCCESS! User created and email sent."
  echo ""
  echo "Next steps:"
  echo "1. Check the email inbox for $EMAIL"
  echo "2. Use the temporary password to log in"
  echo "3. The app will prompt for a password change"
elif [ "$http_status" = "409" ]; then
  echo "⚠️  User already exists. Try a different email."
elif [ "$http_status" = "401" ]; then
  echo "❌ Unauthorized. Check your WEBHOOK_SECRET."
else
  echo "❌ Error occurred. Check the response above."
fi

