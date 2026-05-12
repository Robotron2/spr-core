# Contributing to SPR Core

Thank you for your interest in contributing to the Stellar Payment Router backend. We welcome contributions of all kinds, including new features, bug fixes, tests, documentation, and performance improvements.

## Ways to Contribute

- **New features**: route finding, contract integration, and API endpoints
- **Bug fixes**: defects, edge cases, and reliability issues
- **Tests**: unit tests and integration tests
- **Documentation**: API docs, setup guides, and architecture notes
- **Performance improvements**: optimization, caching, and batching

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Redis for caching
- Stellar testnet account for testing Stellar flows

### Fork and Clone

```bash
git clone https://github.com/YOUR_USERNAME/spr-core.git
cd spr-core
git remote add upstream https://github.com/StellarPaymentRouter/spr-core.git
```

### Install Dependencies

```bash
npm install
```

### Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local` with the configuration for your local Stellar, Soroban, Redis, logging, and API key settings. See [Deployment](./DEPLOYMENT.md#environment-configuration) for the available variables.

## Development Workflow

Start the development server with auto-reload:

```bash
npm run dev
```

The server runs on `http://localhost:4000`.

No build step is required because Node.js runs the JavaScript source directly. Make sure dependencies are installed before running or testing the service.

## Code Quality

```bash
npm run lint
npm run lint -- --fix
```

The project uses ESLint for code quality. The current `lint` script runs ESLint against `src/` with automatic fixes enabled.

## Testing

```bash
npm test
npm run test:coverage
npm test -- account.test.js
npm test -- --watch
```

Additional focused test commands documented in the original README:

```bash
npm test -- --testPathPattern="services"
npm test -- --testPathPattern="integration"
```

## Code Standards

### JavaScript and Node.js

- Use `const` and `let`; do not use `var`.
- Prefer arrow functions where they improve readability.
- Use `async` and `await` for asynchronous operations.
- Handle errors with `try`/`catch` where local recovery or context is useful.

### Services

- Keep services focused on a single responsibility.
- Use consistent error logging.
- Validate inputs before calling external services.

### Routes and Controllers

- Use clear route names.
- Validate request input.
- Return consistent response formats.
- Pass failures through the error handling middleware.

### Testing Standards

- Add unit tests for services.
- Add integration tests for routes.
- Target at least 90% coverage for changed areas.

## Pull Request Process

1. Create a branch:

   ```bash
   git checkout -b feat/add-route-optimization
   ```

2. Make changes with clear commits.
3. Run tests and linting:

   ```bash
   npm test
   npm run lint
   ```

4. Push to your fork.
5. Open a pull request against the `main` branch.

## Contributor License

SPR Core is released under the MIT License.

MIT License

Copyright (c) 2026 Stellar Payment Router Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
