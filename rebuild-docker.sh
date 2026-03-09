#!/bin/bash

# Docker Rebuild Script for PDF Viewer

echo "🐳 Rebuilding Docker container with PDF viewer..."

# Stop containers
docker-compose down

# Rebuild with no cache
docker-compose build --no-cache

# Start containers
docker-compose up -d

echo "✅ Done! PDF viewer is now available."
echo "📝 Access your app and try uploading a PDF!"
