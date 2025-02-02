#!/bin/bash

ENV=${1:-dev}
SERVICE_ACCOUNT_FILE="./service-account.${ENV}.json"

if [ ! -f "$SERVICE_ACCOUNT_FILE" ]; then
    echo "Error: ${SERVICE_ACCOUNT_FILE} not found!"
    exit 1
fi

# Extract values from service account JSON
PROJECT_ID=$(cat $SERVICE_ACCOUNT_FILE | jq -r '.project_id')
PRIVATE_KEY=$(cat $SERVICE_ACCOUNT_FILE | jq -r '.private_key')
CLIENT_EMAIL=$(cat $SERVICE_ACCOUNT_FILE | jq -r '.client_email')

# Create environment-specific .env file
cat > .env.${ENV} << EOF
FIREBASE_PROJECT_ID=$PROJECT_ID
FIREBASE_PRIVATE_KEY="$PRIVATE_KEY"
FIREBASE_CLIENT_EMAIL=$CLIENT_EMAIL
FIREBASE_STORAGE_BUCKET="${PROJECT_ID}.appspot.com"
PORT=5000
NODE_ENV=${ENV}
FRONTEND_URL=http://localhost:3000
EOF

echo ".env.${ENV} file created successfully!"