#!/bin/bash
# ==============================================================================
# KODO Payments — 1-Click Production Deployment Script for Ubuntu / Debian VPS
# ==============================================================================

set -e

echo "🚀 [1/5] Starting KODO Payments Production Deployment..."

# 1. Update system and check Node.js
if ! command -v node &> /dev/null; then
    echo "📦 Node.js not found. Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ NPM version: $(npm -v)"

# 2. Install production dependencies
echo "📦 [2/5] Installing dependencies..."
npm install

# 3. Build optimized frontend production bundle
echo "🔨 [3/5] Compiling production build with Vite..."
npm run build

# 4. Install and configure PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 globally..."
    sudo npm install -g pm2
fi

# 5. Start or restart PM2 cluster
echo "🚀 [4/5] Starting application cluster with PM2..."
pm2 delete kodo-payments 2> /dev/null || true
pm2 start ecosystem.config.js
pm2 save

echo "🎉 [5/5] KODO Payments is now LIVE on port 4000!"
echo "--------------------------------------------------------"
echo "🌐 Local Health Check: http://localhost:4000"
echo "📊 PM2 Status: pm2 status"
echo "📜 View Logs: pm2 logs kodo-payments"
echo "--------------------------------------------------------"
