# Agent Tools MCP

Single Cloudflare Worker providing a standards-based, stateless MCP Streamable HTTP server at `/mcp`.

The initial release contains ten **deterministic, read-only** tools: email format, URL format, phone E.164, UUID, Gregorian ISO date, IBAN checksum, JSON syntax, ASCII slug generation, ANSI escape stripping, and whitespace normalization.

## API

- `https://agent-tools-mcp.yvan11.workers.dev/mcp`: MCP 2026 and compatible stateless legacy clients.
- `https://agent-tools-mcp.yvan11.workers.dev/health`: Service status.

No database, remote catalog execution, AI API bills, GitHub Actions, or runner Worker.

## Deployment

Cloudflare Workers & Pages → Create application → GitHub → `why-see/agent-tools-mcp`.
Select production branch `main`, project name `agent-tools-mcp`, root `/`, deploy command `npx wrangler deploy`. Cloudflare builds must be verified before claiming production availability.

`wrangler.toml` contains Cloudflare-native rate limiting (30 requests per minute per IP per edge location). Deployment fails closed if the binding is absent. For private deployments set `MCP_API_TOKEN` as a **Cloudflare runtime secret**, never in GitHub. The default public mode exposes only pure, cost-free utilities.

## Testing

- `npm test` verifies utilities.
- `npm run check:bundle` validates Wrangler bundling.
- Use an MCP Streamable HTTP client or MCP Inspector to verify initialize, tools/list and tools/call at the deployed `/mcp` URL.

No OAuth, payments or per-client usage metering are implemented. Do not claim this is a production multi-tenant service without adding those features.

## Security

Each input is limited to 4096 characters, each MCP POST body to 8192 characters. No tools fetch arbitrary user URLs or execute remote code. Rate limit is distributed by Cloudflare location, not a global quota. HTTPS only in production. See official Cloudflare MCP handler documentation: https://developers.cloudflare.com/agents/model-context-protocol/apis/handler-api/.
