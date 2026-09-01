# 🌐 QIVROPAY Payments: Production Deployment Guide

This guide details how to host **QIVROPAY Payments (India's Merchant of Record)** on the live internet using your custom domain (e.g. `https://qivropaypayments.in` or `https://app.qivropay.io`).

---

## 🚀 Method 1: Instant Docker Compose (Recommended for Any VPS)

### Prerequisites:
- Any Linux Cloud VPS (DigitalOcean, AWS EC2, Hetzner, Linode) with Docker installed.

### 1-Step Deploy:
```bash
# 1. Clone repository on your VPS
git clone <your-repo-url> qivropay-payments
cd qivropay-payments

# 2. Start container in background
docker-compose up -d --build

# 3. Check logs
docker-compose logs -f
```
Your app is now running with automatic restart and health monitoring on port `4000`!

---

## ⚡ Method 2: Standard Linux VPS (Ubuntu / Debian + Nginx + SSL)

### Step 1: Run the 1-Click Deployment Script
```bash
cd qivropay-payments
./deploy.sh
```

### Step 2: Configure Nginx & SSL Certificate
```bash
# Copy Nginx configuration
sudo cp nginx/qivropay.conf /etc/nginx/sites-available/qivropay.conf

# Replace 'yourdomain.com' with your real domain
sudo sed -i 's/yourdomain.com/app.yourdomain.in/g' /etc/nginx/sites-available/qivropay.conf

# Enable site
sudo ln -s /etc/nginx/sites-available/qivropay.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Install free SSL certificate with Let's Encrypt Certbot
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d app.yourdomain.in
```

Your platform is now secured with **HTTPS/SSL** and live worldwide!

---

## ☁️ Method 3: Cloud PaaS (Render / Railway / Fly.io)

1. Connect your GitHub repository to **Render** or **Railway**.
2. Set Build Command: `npm install && npm run build`
3. Set Start Command: `node server/index.js`
4. Set Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `4000`
   - `CASHFREE_APP_ID`: `<your_cashfree_app_id>`
   - `CASHFREE_SECRET_KEY`: `<your_cashfree_secret_key>`
5. Click **Deploy**!

---

## 🔒 Post-Deployment Checklist:
- [x] Configure DNS `A` record pointing `app.yourdomain.in` to your VPS IP.
- [x] Test live Cashfree connection in Dashboard (`/dashboard` → Settings).
- [x] Set Cashfree Webhook URL in Cashfree Dev Studio: `https://app.yourdomain.in/api/v1/webhooks/cashfree`.
