# Security Policy

SPR Core handles payment routing, Stellar account data, transaction envelopes, Soroban contract calls, and access to external Stellar infrastructure. Treat deployments as security-sensitive services, especially in production environments.

## Supported Versions

| Version | Security Updates |
| ------- | ---------------- |
| `0.1.x` | Supported        |

Security updates are currently provided for the active `0.1.x` line.

## Reporting Vulnerabilities

Do not disclose suspected vulnerabilities publicly until maintainers have had time to investigate and release a fix.

To report a vulnerability:

1. Open a private security advisory in the GitHub repository, if available.
2. If private advisories are not available, open a minimal GitHub issue that requests maintainer contact without including exploit details.
3. Include affected versions, reproduction steps, impact, and any recommended remediation in the private report.

Maintainers should acknowledge the report, investigate impact, prepare a fix, and publish remediation guidance before public disclosure.

## Security Considerations

### Authentication and Authorization

The documented configuration includes an `API_KEY` setting. Production deployments should require API key validation for protected endpoints and keep API keys out of source control, logs, and client-side applications.

### Rate Limiting

SPR Core is expected to use rate limiting to protect routing, account, transaction, and Soroban endpoints from abuse and accidental traffic spikes. Verify rate limiting before exposing the service publicly.

### Data Handling

- Treat Stellar account identifiers, transaction envelopes, and route requests as sensitive operational data.
- Do not log secrets, API keys, private keys, seed phrases, or signed transaction material.
- Prefer structured logs that include request context without exposing credentials.
- Validate all request input before using it in Stellar SDK, Horizon, Redis, or Soroban RPC calls.

### Transaction Safety

SPR Core documents transaction building and submission workflows. Users are responsible for reviewing transaction envelopes, destination accounts, assets, amounts, fees, and slippage before signing or submitting transactions.

### Dependencies

- Keep npm dependencies patched.
- Run `npm audit` or an equivalent dependency scanner in CI.
- Review dependency updates that touch Stellar SDK, Express, Redis, logging, or request-handling behavior.

### External Services

SPR Core depends on Stellar Horizon, Soroban RPC, and Redis. Use trusted service endpoints, configure TLS where applicable, and monitor upstream availability.

## User Best Practices

- Use separate API keys per environment.
- Rotate API keys regularly and after suspected exposure.
- Run production deployments behind TLS.
- Restrict Redis to private networks.
- Set `NODE_ENV=production` in production.
- Monitor logs for repeated `400`, `429`, and `503` responses.
- Use conservative slippage settings for payment routes.

## Incident Response

If a vulnerability or credential exposure is confirmed:

1. Rotate affected credentials.
2. Disable or patch affected endpoints.
3. Review logs for abuse.
4. Release a patched version.
5. Publish upgrade and mitigation instructions.
