# SPR Core

[![npm version](https://img.shields.io/npm/v/spr-core.svg)](https://www.npmjs.com/package/spr-core)
[![CI](https://github.com/StellarPaymentRouter/spr-core/actions/workflows/ci.yml/badge.svg)](https://github.com/StellarPaymentRouter/spr-core/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

SPR Core is a Node.js and Express backend service for the Stellar Payment Router ecosystem. It provides route discovery, pool aggregation, transaction building, and Soroban contract integration for Stellar payment applications.

## Features

- REST API for routing, account, transaction, and Soroban operations
- Multi-hop route discovery between Stellar assets
- Soroban liquidity pool discovery and aggregation
- Transaction building, signing support, submission, and status tracking
- Stellar Horizon API and Soroban RPC integration
- Redis-backed caching for route and rate performance
- Structured logging, health checks, and error handling
- Rate limiting and API key based access controls

## Quick Start

```bash
git clone https://github.com/StellarPaymentRouter/spr-core.git
cd spr-core
npm install
cp .env.example .env.local
npm run dev
```

The development server runs on `http://localhost:4000`. Configure Stellar, Soroban, Redis, logging, and security settings in `.env.local`; see [Deployment](./docs/DEPLOYMENT.md) for the full setup guide.

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) - System design, components, API surface, and roadmap
- [Contributing](./docs/CONTRIBUTING.md) - Contributor setup, workflow, standards, and pull requests
- [Deployment](./docs/DEPLOYMENT.md) - Environment setup, production deployment, monitoring, and troubleshooting
- [Security](./docs/SECURITY.md) - Vulnerability reporting, supported versions, and operational security guidance

## Support

- [GitHub Discussions](https://github.com/StellarPaymentRouter/spr-core/discussions)
- [Report Issues](https://github.com/StellarPaymentRouter/spr-core/issues)
- [API details](./docs/ARCHITECTURE.md#api-surface)

## License

MIT License (c) 2026 Stellar Payment Router Contributors.
