#!/bin/bash
# Production Database Seeding Script

echo "🚀 Starting Production Database Seeding..."
echo ""
echo "⚠️  WARNING: This will seed the PRODUCTION database!"
echo "Make sure you want to continue."
echo ""

# Run the seed script against production database
NODE_ENV=production tsx server/seed.ts

echo ""
echo "✅ Production database seeding complete!"
echo ""
echo "🧪 Test the login at your production URL with:"
echo "   Username: Test"
echo "   Password: password2025"
