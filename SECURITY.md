# Security policy

The official public endpoint is `https://agent-tools-mcp.yvan11.workers.dev/mcp`. It has no user authentication or credential storage.

## Reporting
If enabled, use GitHub's **Report a vulnerability** private advisory feature. Otherwise open a public issue with a brief non-exploitable summary requesting a private reporting channel. Do not include secrets or exploit payloads.

## Constraints
- Do not send real passwords, credit-card numbers, bank details, tax/SSN identifiers, API secrets or other sensitive inputs to public validators.
- Synthetic financial and government identifiers are software test fixtures, not proof of real-world validity.
- Seeded passwords and tokens are deterministic and must never be used as real credentials.
- Inputs and outputs are bounded. Cloudflare rate limiting is per IP per data center, not globally enforced.
- Heuristic minifiers must be regression tested before using their output in production.
- A future private deployment may use a `MCP_API_TOKEN` runtime secret; this is not equivalent to OAuth.
- Reviewed, versioned original MIT modules are included locally; no remote code is fetched or executed at runtime. See `UPSTREAM.md`.

No GitHub Actions workflows are present. Never place API secrets in this public repository.
