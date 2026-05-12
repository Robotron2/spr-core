# SPR Core Architecture

SPR Core is a Node.js and Express backend for the Stellar Payment Router ecosystem. It provides REST endpoints for route discovery, account management, transaction building, and Soroban contract interaction.

## Problem Space

Developers building payment applications on Stellar need:

- **Route discovery**: finding optimal paths between assets programmatically
- **Pool aggregation**: discovering and analyzing liquidity across Soroban DEXes
- **Data normalization**: using one API for heterogeneous pool implementations
- **Error recovery**: handling transaction failures and retries gracefully
- **Real-time updates**: accessing live liquidity and rate information
- **Scalability**: supporting growing transaction volumes

## Solution Overview

SPR Core provides:

- **RESTful API** for routing operations
- **Pool discovery** for Soroban liquidity pools
- **Smart routing** with multi-hop route optimization
- **Caching layer** backed by Redis
- **Transaction builder** for constructing and signing transactions
- **Stellar integration** through Horizon and Soroban RPC
- **Error handling** with common error codes and recovery guidance
- **Monitoring** through structured logging and health checks

## System Diagram

```text
+-----------------------------------------+
| Client Applications                      |
| Web, Mobile, CLI                         |
+--------------------+--------------------+
                     |
                     v
+-----------------------------------------+
| Express.js API Server                    |
| :4000                                   |
+-----------------------------------------+
| Routes and Controllers                   |
| /api/routes     Route Finder (intended)  |
| /api/account    Account Management       |
| /api/transaction Transactions            |
| /api/soroban    Contract Calls           |
+-----------------------------------------+
| Services Layer                           |
| RouteService                             |
| StellarService                           |
| SorobanService                           |
| AggregatorService                        |
+-----------------------------------------+
| Middleware and Utilities                 |
| Error Handling, Rate Limiting, Logging   |
| Validation                               |
+-----------------------------------------+
| Data Layer and External Services         |
| Stellar Horizon API, Soroban RPC, Redis  |
+-----------------------------------------+
```

## Technology Stack

| Component     | Technology           | Purpose                |
| ------------- | -------------------- | ---------------------- |
| Framework     | Express.js 4         | Web framework          |
| Language      | Node.js 18+          | Runtime                |
| SDK           | @stellar/stellar-sdk | Stellar integration    |
| Cache         | Redis 4              | Performance caching    |
| Logging       | Winston 3            | Structured logging     |
| Testing       | Jest 29              | Unit/integration tests |
| Linting       | ESLint 8             | Code quality           |

## Component Responsibilities

### Routes

Routes define the public HTTP interface and forward validated requests to controllers.

- `src/routes/index.js`: route aggregator
- `src/routes/account.routes.js`: account endpoints
- `src/routes/transaction.routes.js`: transaction endpoints
- `src/routes/soroban.routes.js`: Soroban endpoints

### Controllers

Controllers translate HTTP input into service calls and shape API responses.

- `src/controllers/account.controller.js`: account logic
- `src/controllers/transaction.controller.js`: transaction logic
- `src/controllers/soroban.controller.js`: Soroban logic

### Services

Services hold integration and domain logic.

- `src/services/stellar.service.js`: Stellar SDK wrapper
- `src/services/soroban.service.js`: Soroban contract interactions
- `src/services/route.service.js`: route finding
- `src/services/aggregator.service.js`: pool aggregation, as documented in the original README

### Middleware and Utilities

- `src/middlewares/error.middleware.js`: error handling
- `src/middlewares/auth.middleware.js`: API key validation, as documented in the original README
- `src/middlewares/rateLimit.middleware.js`: rate limiting, as documented in the original README
- `src/utils/logger.js`: logging setup
- `src/utils/validators.js`: input validation
- `src/utils/helpers.js`: utility functions, as documented in the original README

## Data Flow

1. A client calls an API endpoint such as `/api/routes`.
2. The route layer maps the request to a controller.
3. The controller validates and normalizes input.
4. The service layer calls Stellar Horizon, Soroban RPC, Redis, or internal routing logic.
5. Results are cached where appropriate.
6. The controller returns a normalized response.
7. Errors are passed through centralized middleware and logged.

## API Surface

The application mounts route modules under `/api`. The current route aggregator includes:

| Method | Path                                 | Purpose                       |
| ------ | ------------------------------------ | ----------------------------- |
| `GET`  | `/api/health`                        | Service health check          |
| `GET`  | `/api/account/:id`                   | Retrieve account details      |
| `POST` | `/api/account`                       | Create account placeholder    |
| `GET`  | `/api/transaction/:id`               | Retrieve transaction details  |
| `POST` | `/api/transaction`                   | Build a transaction           |
| `POST` | `/api/transaction/submit`            | Submit a transaction envelope |
| `POST` | `/api/soroban/invoke`                | Invoke a Soroban contract     |
| `GET`  | `/api/soroban/read/:contractId/:key` | Read Soroban contract data    |

The original README also documented the following route discovery API. It represents the intended routing surface for `RouteService`.

### Routes API

Find a route:

```http
GET /api/routes?sourceAsset=native&destinationAsset=USDC:...&amount=100&maxSlippage=0.5
```

Query parameters:

| Parameter          | Type   | Description                                      |
| ------------------ | ------ | ------------------------------------------------ |
| `sourceAsset`      | string | Source asset, such as `native` or `CODE:ISSUER` |
| `destinationAsset` | string | Destination asset                                |
| `amount`           | string | Amount to route                                  |
| `maxSlippage`      | number | Maximum acceptable slippage from `0` to `100`   |

Example response:

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

Get account details:

```http
GET /api/account/:id
```

Example response:

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

Create a transaction:

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

Example response:

```json
{
	"transactionEnvelope": "AAAAAgAAAABIQVZINzI0NzU0MZCM...",
	"hash": "abcd1234..."
}
```

Submit a transaction:

```http
POST /api/transaction/submit
Content-Type: application/json

{
  "transactionEnvelope": "AAAAAgAAAABIQVZINzI0NzU0MZCM..."
}
```

### Soroban API

Invoke a contract:

```http
POST /api/soroban/invoke
Content-Type: application/json

{
  "contractId": "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4",
  "method": "transfer",
  "params": ["from", "to", "100"]
}
```

## Design Patterns

- **Layered application structure** separates routes, controllers, services, middleware, and utilities.
- **Service wrappers** isolate Stellar Horizon and Soroban RPC integration behind reusable modules.
- **Centralized error handling** keeps route and controller logic focused.
- **Redis caching** reduces repeated route, rate, and pool lookups.
- **Structured logging** makes operational events easier to search and monitor.

## Performance Patterns

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
// Do not create new instances per request
```

### Request Batching

```javascript
// Batch multiple account lookups
const accounts = await Promise.all(accountIds.map((id) => horizonServer.loadAccount(id)))
```

## Project Structure

```text
spr-core/
|-- src/
|   |-- index.js
|   |-- app.js
|   |-- routes/
|   |   |-- index.js
|   |   |-- account.routes.js
|   |   |-- transaction.routes.js
|   |   `-- soroban.routes.js
|   |-- controllers/
|   |   |-- account.controller.js
|   |   |-- transaction.controller.js
|   |   `-- soroban.controller.js
|   |-- services/
|   |   |-- stellar.service.js
|   |   |-- soroban.service.js
|   |   |-- route.service.js
|   |   `-- aggregator.service.js
|   |-- middlewares/
|   |   |-- error.middleware.js
|   |   |-- auth.middleware.js
|   |   `-- rateLimit.middleware.js
|   |-- config/
|   |   |-- env.js
|   |   |-- stellar.js
|   |   `-- redis.js
|   |-- utils/
|   |   |-- logger.js
|   |   |-- validators.js
|   |   `-- helpers.js
|   `-- __tests__/
|       |-- account.test.js
|       `-- routes.test.js
|-- docs/
|   |-- ARCHITECTURE.md
|   |-- CONTRIBUTING.md
|   |-- DEPLOYMENT.md
|   `-- SECURITY.md
|-- package.json
|-- jest.config.js
|-- .env.example
`-- README.md
```

Some files in this structure were documented in the original README as expected modules and may be added as the implementation grows.

## Future Considerations

- GraphQL API
- WebSocket support for real-time updates
- Advanced analytics
- Multi-signature support
- Batch transaction processing
- Machine learning route optimization
