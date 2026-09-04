// Phase 10 audit note: `instances: 'max'` runs one Node process per CPU core
// under PM2 cluster mode. server/index.js's login/signup/checkout-order rate
// limiters are in-process memory (no Redis/shared store) by design (see the
// comment above createRateLimiter() in server/index.js) — each PM2 worker
// enforces the configured limit independently, so the effective per-IP limit
// under this config is (configured max * number of CPU cores), not the
// configured max. Acceptable for first-merchant launch; revisit with a
// shared rate-limit store only if abuse is actually observed in production.
module.exports = {
  apps: [
    {
      name: 'qivropay-payments',
      script: 'server/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      max_memory_restart: '1G',
      restart_delay: 3000,
      exp_backoff_restart_delay: 100,
      watch: false
    }
  ]
};
