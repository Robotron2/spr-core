# SPR Core

[![npm version](https://img.shields.io/npm/v/spr-core.svg)](https://www.npmjs.com/package/spr-core)
[![CI](https://github.com/StellarPaymentRouter/spr-core/actions/workflows/ci.yml/badge.svg)](https://github.com/StellarPaymentRouter/spr-core/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Node.js backend service for Stellar Payment Router**

SPR Core is a robust Express.js backend that provides route discovery, pool aggregation, transaction building, and Soroban contract integration for the Stellar Payment Router ecosystem.

---

## The Problem

Developers building payment applications on Stellar need:

- **Route Discovery** — Finding optimal paths between assets programmatically
- **Pool Aggregation** — Discovering and analyzing liquidity across all Soroban DEXes
- **Data Normalization** — Consistent API for heterogeneous pool implementations
- **Error Recovery** — Handling transaction failures and retries gracefully
- **Real-time Updates** — Live liquidity and rate information
- **Scalability** — Support for growing transaction volumes

## The Solution

**SPR Core** provides:

- **RESTful API** — Clean REST endpoints for all routing operations
- **Pool Discovery** — Automatic discovery of Soroban liquidity pools
- **Smart Routing** — Multi-hop route finding with optimization
- **Caching Layer** — Redis-backed caching for performance
- **Transaction Builder** — Construct and sign transactions easily
- **Stellar Integration** — Direct Horizon API and Soroban RPC integration
- **Error Handling** — Comprehensive error codes and recovery strategies
- **Monitoring** — Built-in logging and health checks

---

## Architecture

```
┌─────────────────────────────────────────┐
│    Client Applications                  │
│    (Web, Mobile, CLI)                   │
└────────────────────┬────────────────────┘
                     ↓
┌─────────────────────────────────────────┐
│    Express.js API Server                │
│    :4000                                │
├─────────────────────────────────────────┤
│  Routes         Controllers             │
│  - /api/routes  - Route Finder          │
│  - /api/account - Account Mgmt          │
│  - /api/tx      - Transactions          │
│  - /api/soroban - Contract Calls        │
├─────────────────────────────────────────┤
│  Services Layer                         │
│  - RouteService                         │
│  - StellarService                       │
│  - SorobanService                       │
│  - AggregatorService                    │
├─────────────────────────────────────────┤
│  Middleware & Utils                     │
│  - Error Handling                       │
│  - Rate Limiting                        │
│  - Logging                              │
│  - Validation                           │
├─────────────────────────────────────────┤
│  Data Layer                             │
├─────────────────────────────────────────┤
│  External Services                      │
│  - Stellar Horizon API                  │
│  - Soroban RPC                          │
│  - Redis Cache                          │
└─────────────────────────────────────────┘
```

### Technology Stack

| Component     | Technology           | Purpose                |
| ------------- | -------------------- | ---------------------- |
| **Framework** | Express.js 4         | Web framework          |
| **Language**  | Node.js 18+          | Runtime                |
| **SDK**       | @stellar/stellar-sdk | Stellar integration    |
| **Cache**     | Redis 4              | Performance caching    |
| **Logging**   | Winston 3            | Structured logging     |
| **Testing**   | Jest 29              | Unit/integration tests |
| **Linting**   | ESLint 8             | Code quality           |

---

## Features

### Route Discovery

- Find optimal routes between any two assets
- Multi-hop pathfinding with efficiency scoring
- Automatic liquidity pool discovery
- Slippage tolerance configuration
- Rate caching for performance

### Account Management

- Retrieve account details from Horizon
- Get account balance and sequence number
- Track transaction history
- Manage trustlines

### Transaction Building

- Build payment transactions
- Support for custom assets and native XLM
- Automatic fee calculation
- Transaction signing support
- Transaction status tracking

### Soroban Integration

- Invoke smart contracts
- Read contract state
- Parse contract responses
- Event monitoring

### Liquidity Aggregation

- Discover all Soroban DEX pools
- Aggregate liquidity data
- Real-time rate updates
- Pool statistics and analytics

### ⚡ Performance

- Sub-second route resolution
- Redis-backed caching
- Connection pooling
- Request batching

### 🛡️ Reliability

- Comprehensive error handling
- Retry mechanisms
- Rate limiting
- Health checks
- Structured logging

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Redis 6+ (for caching)
- Stellar testnet account (for testing)

### Installation

```bash
# Clone repository
git clone https://github.com/StellarPaymentRouter/spr-core.git
cd spr-core

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your configuration
# PORT=4000
# NODE_ENV=development
# STELLAR_NETWORK=testnet
# STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
```

### Development

```bash
# Start development server with auto-reload
npm run dev

# Server runs on http://localhost:4000
```

### Production

```bash
# Start production server
npm start

# Or with PM2
pm2 start src/index.js --name "spr-core"
```

---

## Project Structure

```
spr-core/
├── src/
│   ├── index.js                   # Entry point
│   ├── app.js                     # Express app setup
│   ├── routes/
│   │   ├── index.js               # Route aggregator
│   │   ├── account.routes.js      # Account endpoints
│   │   ├── transaction.routes.js  # Transaction endpoints
│   │   └── soroban.routes.js      # Soroban endpoints
│   ├── controllers/
│   │   ├── account.controller.js  # Account logic
│   │   ├── transaction.controller.js
│   │   └── soroban.controller.js
│   ├── services/
│   │   ├── stellar.service.js     # Stellar SDK wrapper
│   │   ├── soroban.service.js     # Soroban contracts
│   │   ├── route.service.js       # Route finding
│   │   └── aggregator.service.js  # Pool aggregation
│   ├── middlewares/
│   │   ├── error.middleware.js    # Error handling
│   │   ├── auth.middleware.js     # API key validation
│   │   └── rateLimit.middleware.js
│   ├── config/
│   │   ├── env.js                 # Environment config
│   │   ├── stellar.js             # Stellar SDK config
│   │   └── redis.js               # Redis config
│   ├── utils/
│   │   ├── logger.js              # Logging setup
│   │   ├── validators.js          # Input validation
│   │   └── helpers.js             # Utility functions
│   └── __tests__/
│       ├── account.test.js
│       └── routes.test.js
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── SETUP.md
├── package.json
├── jest.config.js
├── .env.example
└── README.md
```

---

## API Reference

### Routes API

#### Find Route

```http
GET /api/routes?sourceAsset=native&destinationAsset=USDC:...&amount=100&maxSlippage=0.5
```

**Query Parameters:**

- `sourceAsset` (string) — Source asset (e.g., 'native' or 'CODE:ISSUER')
- `destinationAsset` (string) — Destination asset
- `amount` (string) — Amount to route
- `maxSlippage` (number) — Maximum acceptable slippage (0-100)

**Response:**

```json
{
	"sourceAsset": "native",
	"destinationAsset": "USDC:GBUQWP3BOUZX34ULNQG23RQ6F4BFSRJ5UL3QC6MFQEPJDD7W2QC5X4XY",
	"amount": "100",
	"path": [
		{
			"sourceAsset": "native",
			"destinationAsset": "EURC:...",
			"rate": "1.2",
			"fee": "0.1"
		}
	],
	"totalFee": "0.15",
	"minReceived": "99.85"
}
```

### Account API

#### Get Account Details

```http
GET /api/account/:id
```

**Response:**

```json
{
	"id": "GBUQWP3BOUZX34ULNQG23RQ6F4BFSRJ5UL3QC6MFQEPJDD7W2QC5X4XY",
	"balances": [
		{
			"asset_type": "native",
			"balance": "1000.5"
		}
	],
	"sequence": "12884901889"
}
```

### Transaction API

#### Create Transaction

```http
POST /api/transaction
Content-Type: application/json

{
  "sourceAccount": "GBUQWP3BOUZX34ULNQG23RQ6F4BFSRJ5UL3QC6MFQEPJDD7W2QC5X4XY",
  "destinationAccount": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "amount": "100",
  "asset": "native"
}
```

**Response:**

```json
{
	"transactionEnvelope": "AAAAAgAAAABIQVZINzI0NzU0MZCM...",
	"hash": "abcd1234..."
}
```

#### Submit Transaction

```http
POST /api/transaction/submit
Content-Type: application/json

{
  "transactionEnvelope": "AAAAAgAAAABIQVZINzI0NzU0MZCM..."
}
```

### Soroban API

#### Invoke Contract

```http
POST /api/soroban/invoke
Content-Type: application/json

{
  "contractId": "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4",
  "method": "transfer",
  "params": ["from", "to", "100"]
}
```

---

## Configuration

### Environment Variables

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

### Redis Configuration

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

---

## Development Workflow

### Code Quality

```bash
# Format code
npm run lint

# Run linter
npm run lint

# Fix issues
npm run lint -- --fix
```

### Testing

```bash
# Run all tests
npm test

# Run specific test
npm test -- account.test.js

# Generate coverage
npm run test:coverage

# Watch mode
npm test -- --watch
```

### Building

```bash
# No build step needed (Node.js runs JS directly)
# Just ensure dependencies are installed
npm install
```

---

## Deployment

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src ./src

EXPOSE 4000

CMD ["node", "src/index.js"]
```

```bash
docker build -t spr-core:latest .
docker run -p 4000:4000 \
  -e STELLAR_NETWORK=testnet \
  -e REDIS_URL=redis://redis:6379 \
  spr-core:latest
```

### Docker Compose

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

### Production Checklist

- [ ] Environment variables configured
- [ ] Redis deployed and accessible
- [ ] SSL/TLS enabled
- [ ] Rate limiting configured
- [ ] Error monitoring (Sentry/Rollbar)
- [ ] Structured logging enabled
- [ ] Health check endpoint verified
- [ ] Database backups configured
- [ ] Auto-scaling rules set
- [ ] CDN configured (optional)

---

## Performance Optimization

### Caching Strategy

```javascript
// Cache routes for 60 seconds
const cachedRoute = await cache.get(cacheKey)
if (cachedRoute) return cachedRoute

const route = await findRoute(source, dest, amount)
await cache.set(cacheKey, route, 60)
return route
```

### Connection Pooling

```javascript
// Reuse Horizon Server instance
const horizonServer = new StellarSdk.Horizon.Server(horizonUrl)
// Don't create new instances per request
```

### Request Batching

```javascript
// Batch multiple account lookups
const accounts = await Promise.all(accountIds.map((id) => horizonServer.loadAccount(id)))
```

---

## Monitoring & Logging

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

Response:

```json
{
	"status": "ok",
	"timestamp": "2026-04-27T10:00:00Z",
	"uptime": 3600,
	"redis": "connected",
	"stellar": "connected"
}
```

---

## Error Handling

### Common Errors

| Code | Message             | Resolution                    |
| ---- | ------------------- | ----------------------------- |
| 400  | Invalid parameters  | Check parameter format        |
| 404  | Route not found     | Check asset validity          |
| 429  | Too many requests   | Implement exponential backoff |
| 503  | Service unavailable | Check Stellar network status  |

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/spr-core.git
cd spr-core
npm install
npm run dev
```

---

## Testing

### Unit Tests

```bash
npm test -- --testPathPattern="services"
```

### Integration Tests

```bash
npm test -- --testPathPattern="integration"
```

### Coverage

```bash
npm run test:coverage
```

---

## License

MIT License © 2026 Stellar Payment Router Contributors

See [LICENSE](LICENSE) for details.

---

## Support

- [API Documentation](./docs/API.md)
- [Architecture Guide](./docs/ARCHITECTURE.md)
- [GitHub Discussions](https://github.com/StellarPaymentRouter/spr-core/discussions)
- [Report Issues](https://github.com/StellarPaymentRouter/spr-core/issues)

---

## Roadmap

- [ ] GraphQL API
- [ ] WebSocket support for real-time updates
- [ ] Advanced analytics
- [ ] Multi-signature support
- [ ] Batch transaction processing
- [ ] Machine learning route optimization

---
