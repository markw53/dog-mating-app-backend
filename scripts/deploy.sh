#!/bin/bash

# Build the project
echo "Building project..."
npm run build

# Deploy Firebase Rules
echo "Deploying Firebase Rules..."
firebase deploy --only firestore:rules

# Seed the database (optional)
if [ "$1" = "--seed" ]; then
  echo "Seeding database..."
  npm run seed:prod
fi

echo "Deployment completed!"