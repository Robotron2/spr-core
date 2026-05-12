# SPR Core Deployment Guide

This guide covers local setup, environment configuration, production deployment, monitoring, scaling, backup, recovery, and troubleshooting for SPR Core.

## Prerequisites

- Node.js 18+
- npm or yarn
- Redis 6+ for caching
- Stellar testnet account for testing
- Stellar Horizon endpoint
- Soroban RPC endpoint

## Local Installation

```bash
git clone https://github.com/StellarPaymentRouter/spr-core.git
cd spr-core
npm install
cp .env.example .env.local
```

Edit `.env.local` with your local configuration.

## Environment Configuration

```bash
# Server
PORT=4000
NODE_ENV=development

# Stellar
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org

# Soroban
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org

# Redis
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=info

# Security
API_KEY=your-secret-api-key
```

## Run the Service

### Development

```bash
npm run dev
```

The server runs on `http://localhost:4000`.

### Production

```bash
npm start
```

Or run with PM2:

```bash
pm2 start src/index.js --name "spr-core"
```

## Redis Setup

Example Redis client configuration from the original README:

```javascript
// config/redis.js
const redis = require("redis")

const client = redis.createClient({
	url: process.env.REDIS_URL,
	socket: {
		reconnectStrategy: (retries) => Math.min(retries * 50, 500),
	},
})

client.connect()
module.exports = client
```

For production, run Redis on a private network, restrict direct public access, and monitor memory usage.

## Docker Deployment

Example `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src ./src

EXPOSE 4000

CMD ["node", "src/index.js"]
```

Build and run:

```bash
docker build -t spr-core:latest .
docker run -p 4000:4000 \
  -e STELLAR_NETWORK=testnet \
  -e REDIS_URL=redis://redis:6379 \
  spr-core:latest
```

## Docker Compose

```yaml
version: "3.9"

services:
    api:
        build: .
        ports:
            - "4000:4000"
        environment:
            STELLAR_NETWORK: testnet
            REDIS_URL: redis://redis:6379
        depends_on:
            - redis

    redis:
        image: redis:7-alpine
        ports:
            - "6379:6379"
```

## Production Checklist

- [ ] Environment variables configured
- [ ] Redis deployed and accessible
- [ ] SSL/TLS enabled
- [ ] Rate limiting configured
- [ ] Error monitoring configured, such as Sentry or Rollbar
- [ ] Structured logging enabled
- [ ] Health check endpoint verified
- [ ] Database or cache backups configured where applicable
- [ ] Auto-scaling rules set
- [ ] CDN configured, if needed

## Monitoring and Logging

### Structured Logging

```javascript
logger.info("Route found", {
	source: sourceAsset,
	destination: destAsset,
	amount,
	hops: route.path.length,
	duration: endTime - startTime,
})
```

### Health Check

```bash
curl http://localhost:4000/api/health
```

Expected response:

```json
{
	"status": "ok",
	"timestamp": "2026-04-27T10:00:00Z",
	"uptime": 3600,
	"redis": "connected",
	"stellar": "connected"
}
```

## Scaling Considerations

- Reuse Stellar Horizon and Soroban RPC clients instead of creating new instances per request.
- Cache route and rate results for short periods to reduce duplicate work.
- Batch account lookups when possible.
- Use Redis connection retry behavior to recover from transient failures.
- Run multiple API instances behind a load balancer for higher traffic environments.
- Configure rate limits to protect upstream Stellar infrastructure.

## Backup and Recovery

SPR Core primarily depends on external Stellar services and Redis caching. The original README does not document a persistent database.

- Back up deployment configuration and environment variable definitions through your platform's secret management process.
- If Redis is used only as a cache, recovery can usually rebuild cache state from Horizon and Soroban RPC.
- If Redis is extended to store durable data, enable Redis persistence and define a restore procedure.

## Troubleshooting

### Common Errors

| Code | Message             | Resolution                    |
| ---- | ------------------- | ----------------------------- |
| 400  | Invalid parameters  | Check parameter format        |
| 404  | Route not found     | Check asset validity          |
| 429  | Too many requests   | Implement exponential backoff |
| 503  | Service unavailable | Check Stellar network status  |

### Service Will Not Start

- Confirm Node.js is version 18 or newer.
- Run `npm install` to install dependencies.
- Confirm `.env.local` exists and includes required settings.
- Verify Redis is reachable at `REDIS_URL`.

### Routes or Accounts Fail

- Confirm `STELLAR_HORIZON_URL` points to the expected network.
- Confirm `STELLAR_NETWORK` matches the assets and accounts being used.
- Check upstream Horizon and Soroban RPC availability.

### High Latency

- Confirm Redis is connected.
- Review cache hit rates if available.
- Batch repeated account lookups.
- Check upstream Stellar service latency.
