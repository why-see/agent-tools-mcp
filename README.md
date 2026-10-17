# Agent Tools MCP

**One Cloudflare Worker providing 32 MCP tools from 31 original Yvancg utility modules.**

This service implements [Streamable HTTP MCP](https://developers.cloudflare.com/agents/model-context-protocol/apis/handler-api/) at `/mcp` using the Cloudflare Agents SDK stateless handler and MCP SDK v2. The endpoint is not a conventional web page: opening `/mcp` using a browser GET can legitimately return `Method not allowed`.

## Endpoints

- Health: `https://agent-tools-mcp.yvan11.workers.dev/health` (GET)
- MCP client: `https://agent-tools-mcp.yvan11.workers.dev/mcp` (POST Streamable HTTP)
- Open source: [validators](https://github.com/Yvancg/validators) | [optimizers](https://github.com/Yvancg/optimizers) | [generators](https://github.com/Yvancg/generators)

## Tool inventory

**Validators (12):** is-card-safe, is-email-safe, is-iban-safe, is-iso-date-safe, is-ip-safe, is-json-safe, is-password-safe, is-phone-e164, is-uuid-safe, is-url-safe, is-us-tin-safe, is-vat-safe.

**Optimizers (7 tools / 6 modules):** is-dataset-minify, is-google-tag, is-html-minify, is-minify-js, is-minify-css, is-prompt-minify, is-strip-ansi.

**Generators (13):** generate-avatar, generate-card-number, generate-color, generate-dataset, generate-fake-data, generate-hash, generate-lorem, generate-password, generate-phone-number, generate-prompt, generate-slug, generate-ssn, generate-token.

Names and implementations are derived from the upstream module files. Exact upstream versions and update policy are documented in [UPSTREAM.md](./UPSTREAM.md). The upstream catalogs are not complete or consistent enough to serve as the runtime source of truth; we use explicit audited function adapters.

## Tests and deployment

On GitHub, push to `main` → **Cloudflare Workers Builds** performs `npm test`, then `npx wrangler deploy` only if tests pass. **No GitHub Actions** are present.

The test suite invokes all 32 MCP tools through the actual handler, including the `initialize`, `tools/list`, and `tools/call` protocol methods.

The Worker has a Cloudflare native rate-limit binding (30 requests per minute per IP per data center), 8-KiB body guard and per-tool input/output bounds.

Optional `MCP_API_TOKEN` must be a Cloudflare secret, not a GitHub secret or a variable in `wrangler.toml`.

## Restrictions

This public endpoint runs pure software utilities and **cannot** access your GitHub, Cloudflare, OpenAI or payment accounts. It is not a remotely editable filesystem. Do not send real passwords, payment details or private personal data to its validators. Generated financial identifiers and SSNs are *synthetic test fixtures only*. This service does not provide OAuth, client billing, SLA, global quotas or user identity.

Current catalog size is 32 MCP tool names backed by 31 original upstream modules. An update to an upstream source repo does not automatically rebuild this MCP Worker; see the explicit update policy.
