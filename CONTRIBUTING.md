# Contributing to SPR Core

Thank you for your interest in contributing to the Stellar Payment Router backend. We welcome contributions of all kinds — new features, bug fixes, tests, and documentation.

## Table of Contents

- [Ways to contribute](#ways-to-contribute)
- [Development setup](#development-setup)
- [Development workflow](#development-workflow)
- [Submitting a pull request](#submitting-a-pull-request)
- [Code standards](#code-standards)

## Ways to Contribute

We welcome:

- **New features** — Route finding, contract integration, API endpoints
- **Bug fixes** — Issues and edge cases
- **Tests** — Unit tests, integration tests
- **Documentation** — API docs, setup guides
- **Performance improvements** — Optimization and caching

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Redis (for caching)

### Fork and Clone

```bash
git clone https://github.com/YOUR_USERNAME/spr-core.git
cd spr-core
git remote add upstream https://github.com/StellarPaymentRouter/spr-core.git
```

## Install Dependencies

```bash
npm install
```

## Environment Setup

```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

## Development Workflow

### Start Development Server

```bash
npm run dev
```

Server runs on http://localhost:4000

## Running Tests

```bash
npm test
npm run test:coverage
```

## Code Quality

```bash
npm run lint
```

## Submitting a Pull Request

1. Create a branch: git checkout -b feat/add-route-optimization
2. Make changes with clear commits
3. Run tests and linting:

```bash
npm test
npm run lint
```

4. Push to your fork
5. Open PR against main branch

## Code Standards

### JavaScript/Node.js

Use const/let (no var)
Arrow functions preferred
Proper error handling with try/catch
Async/await for async operations

### Services

Single responsibility principle
Consistent error logging
Proper input validation

### Routes & Controllers

Clear route naming
Input validation
Consistent response format
Error handling middleware

### Testing

Unit tests for services
Integration tests for routes
Minimum 90% coverage

MIT License

Copyright (c) 2026 Stellar Payment Router Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
