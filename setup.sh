#!/bin/bash
set -e

echo "🚀 Retrace setup"
echo ""

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🗄️ Setting up database..."
npm run db:generate
npm run db:push
npm run db:seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Fill in your API keys in .env.local"
echo "  2. Set up Clerk webhook (see README.md)"
echo "  3. Make yourself an admin in the DB"
echo "  4. Run: npm run dev"
