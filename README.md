# Agent Tools MCP

**32 free remote MCP tools for validation, optimization and synthetic test data.**

[Website](https://agent-tools-mcp.yvan11.workers.dev/) · [32-tool directory](https://agent-tools-mcp.yvan11.workers.dev/tools) · [Health](https://agent-tools-mcp.yvan11.workers.dev/health) · [Registry metadata](server.json) · [MIT License](LICENSE)

## Connect an agent

**Streamable HTTP (all 32 tools):** `https://agent-tools-mcp.yvan11.workers.dev/mcp`

**Specialized connectors (same Cloudflare Worker; no extra deploys or credentials):**

| Connector | Tools | URL |
| --- | ---: | --- |
| Validators MCP | 12 | `https://agent-tools-mcp.yvan11.workers.dev/mcp/validators` |
| Optimizers MCP | 7 | `https://agent-tools-mcp.yvan11.workers.dev/mcp/optimizers` |
| Generators MCP | 13 | `https://agent-tools-mcp.yvan11.workers.dev/mcp/generators` |

Choose the smallest relevant connector. All endpoints share the same rate limits, privacy cautions, source and deployments.

**Claude Code:**

```sh
claude mcp add --transport http agent-tools https://agent-tools-mcp.yvan11.workers.dev/mcp
```

**VS Code / Copilot:** Command Palette → **MCP: Add Server** → **HTTP** → paste the endpoint URL.

**Claude Code project `.mcp.json` configuration:**

```json
{ "mcpServers": { "agent-tools": { "type": "http", "url": "https://agent-tools-mcp.yvan11.workers.dev/mcp" } } }
```

**VS Code `.vscode/mcp.json` configuration:**

```json
{ "servers": { "agent-tools": { "type": "http", "url": "https://agent-tools-mcp.yvan11.workers.dev/mcp" } } }
```

Use an MCP client rather than a browser GET request to `/mcp`, which can return `Method not allowed` by design.

## Security and publishing

**This is a public endpoint without authentication.** Never submit real passwords, payment-card data, tax identifiers, bank information, private documents, or API secrets. Synthetic generated IDs and seeded passwords are development fixtures only. Read [SECURITY.md](SECURITY.md).

The repo is public and MIT licensed, preserving the vendored source licenses. Cloudflare Workers Builds tests and deploys on commits to `main`; no GitHub Actions. The [official registry descriptor](server.json) uses `io.github.why-see/agent-tools-mcp`; [Glama metadata](glama.json) identifies the maintainer. See [PUBLISHING.md](PUBLISHING.md) for a no-local-repository submission procedure. These files do not automatically publish a registry listing.

## Tool inventory

**Validators (12):** is-card-safe, is-email-safe, is-iban-safe, is-iso-date-safe, is-ip-safe, is-json-safe, is-password-safe, is-phone-e164, is-uuid-safe, is-url-safe, is-us-tin-safe, is-vat-safe.

**Optimizers (7 tools / 6 modules):** is-dataset-minify, is-google-tag, is-html-minify, is-minify-js, is-minify-css, is-prompt-minify, is-strip-ansi.

**Generators (13):** generate-avatar, generate-card-number, generate-color, generate-dataset, generate-fake-data, generate-hash, generate-lorem, generate-password, generate-phone-number, generate-prompt, generate-slug, generate-ssn, generate-token.

Names and implementations are derived from the upstream module files. Exact upstream versions and update policy are documented in [UPSTREAM.md](./UPSTREAM.md). The upstream catalogs are not complete or consistent enough to serve as the runtime source of truth; we use explicit audited function adapters.

## Tests and deployment

On GitHub, push to `main` → **Cloudflare Workers Builds** performs `npm test`, then `npx wrangler deploy` only if tests pass. **No GitHub Actions** are present.

The test suite invokes all 32 MCP tools through the actual handler, including the `initialize`, `tools/list`, and `tools/call` protocol methods. It also verifies the three specialized MCP endpoints, their isolated inventories, and backward compatibility with `/mcp`.

The Worker has a Cloudflare native rate-limit binding (30 requests per minute per IP per data center), 8-KiB body guard and per-tool input/output bounds.

Optional `MCP_API_TOKEN` must be a Cloudflare secret, not a GitHub secret or a variable in `wrangler.toml`.

## Restrictions

This public endpoint runs pure software utilities and **cannot** access your GitHub, Cloudflare, OpenAI or payment accounts. It is not a remotely editable filesystem. Do not send real passwords, payment details or private personal data to its validators. Generated financial identifiers and SSNs are *synthetic test fixtures only*. This service does not provide OAuth, client billing, SLA, global quotas or user identity.

Current catalog size is 32 MCP tool names backed by 31 original upstream modules. An update to an upstream source repo does not automatically rebuild this MCP Worker; see the explicit update policy.

