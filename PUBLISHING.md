# Publish Agent Tools MCP to directories

## Current metadata

- Official registry namespace: `io.github.why-see/agent-tools-mcp`.
- MCP Streamable HTTP URL: `https://agent-tools-mcp.yvan11.workers.dev/mcp`.
- GitHub source: `https://github.com/why-see/agent-tools-mcp`.
- Registry descriptor: [`server.json`](server.json), containing only `remotes`, with no npm publication required.
- Glama listing metadata: [`glama.json`](glama.json).

**A file committed on GitHub does not constitute official registry publication.** A separate publisher authentication and submission is required.

## Official MCP Registry: browser-based GitHub Codespaces

The official registry currently publishes through the [`mcp-publisher` CLI](https://github.com/modelcontextprotocol/registry/blob/main/docs/reference/cli/commands.md). Browser-based GitHub Codespaces can run the CLI without cloning any repository to your Mac. **Codespaces uses a separate usage allowance and can incur charges; review the GitHub usage page and delete the Codespace when finished. It does not use GitHub Actions.**

1. Signed in to the **why-see** account, open the repository on GitHub.
2. Choose **Code → Codespaces → Create codespace on main**. This opens a browser IDE with the repository already checked out.
3. In the Codespaces terminal, install the official prebuilt publisher binary:

```bash
curl -fL -o /tmp/mcp-publisher.tar.gz "https://github.com/modelcontextprotocol/registry/releases/latest/download/mcp-publisher_linux_amd64.tar.gz"
tar -xzf /tmp/mcp-publisher.tar.gz mcp-publisher
chmod +x mcp-publisher
```

4. Validate the existing registry metadata, then authenticate:

```bash
./mcp-publisher validate server.json
./mcp-publisher login github
```

5. The CLI displays a short-lived GitHub device code. Visit https://github.com/login/device in another browser tab, sign in as **why-see**, enter the displayed code and approve the registry's requested permissions. Do not share the device code or access tokens.
6. Once the CLI confirms successful authentication, publish:

```bash
./mcp-publisher publish server.json
```

7. Check the official listing:

```bash
curl -fsSL 'https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.why-see%2Fagent-tools-mcp'
```

Confirm the JSON response actually includes `io.github.why-see/agent-tools-mcp` and version `1.1.0`. If the name or version already exists, inspect the existing listing before retrying.
8. Delete the temporary Codespace under https://github.com/codespaces when complete, to prevent unnecessary usage.

**Do not run `mcp-publisher init`.** It would generate and potentially replace the already prepared `server.json`. The service uses a remote URL; no `npm publish` is required.

## Glama: repository and remote connector

1. Open https://glama.ai/mcp/servers, select **Add Server**, sign in with GitHub as **why-see**, and supply this repository URL:

   `https://github.com/why-see/agent-tools-mcp`

2. Use the name **Agent Tools MCP** and this description: **Free remote MCP server with 32 developer utilities for validation, optimization and synthetic test-data generation. No API key required.**
3. Open https://glama.ai/mcp/connectors, select **Add Connector** (or Add MCP Server → Connector if the interface shows that option). Use the same name and the existing remote endpoint:

   `https://agent-tools-mcp.yvan11.workers.dev/mcp`

4. If Glama automatically imports the connector from the official MCP Registry, **claim the imported listing rather than submitting a duplicate**.
5. For a GitHub-namespace connector (`io.github.why-see`), Glama supports **Claim with GitHub**. Use the connected **why-see** GitHub account. The root-level `glama.json` also declares this maintainer for the GitHub-source listing.
6. Inspect the result: 32 tools, health, ownership, remote URL, public/no-auth connection, MIT licence, and correct safety warnings.

Reference: https://glama.ai/mcp/faq

## Three specialized Glama connectors

Use **Add MCP Server → Connector** at https://glama.ai/mcp/connectors for each distinct remote URL. These connectors share the existing verified Cloudflare origin, so use the same Glama account and do not duplicate the GitHub repo or deploy additional Workers.

| Listing name | Description | Endpoint |
| --- | --- | --- |
| Validators MCP | 12 local input format validators for email, URLs, dates, IDs and structured data; no lookups or real credential checks. | `https://agent-tools-mcp.yvan11.workers.dev/mcp/validators` |
| Optimizers MCP | 7 local text, HTML, CSS, JS, prompt and dataset optimization tools; review output before production. | `https://agent-tools-mcp.yvan11.workers.dev/mcp/optimizers` |
| Generators MCP | 13 synthetic development fixture, placeholder, hash, slug and token generators; do not treat test identifiers as real credentials. | `https://agent-tools-mcp.yvan11.workers.dev/mcp/generators` |

Set transport to Streamable HTTP and authentication to None. Test each listing and confirm tool counts 12, 7, and 13 respectively. Add each as a **remote connector**; the original `/mcp` URL and registry entry remain unchanged. The source repos `Yvancg/validators`, `Yvancg/optimizers` and `Yvancg/generators` are libraries, not independently hosted MCP servers; do not submit them as MCP connector endpoints.

## Future releases

An existing registry version may not be overwritten freely. For a new MCP release: update code and tests; bump both the MCP server version in `src/index.js` and the version in `server.json` and `package.json`; verify Cloudflare deployment; publish the new `server.json` with publisher authentication. No recurring GitHub Actions workflows are necessary.

## Verification and limits

- The Worker should return health JSON at `https://agent-tools-mcp.yvan11.workers.dev/health`.
- Browser GET on `/mcp` can report `Method not allowed`; test it with a Streamable HTTP MCP client.
- Never submit real passwords, payment-card numbers, personal IDs, or secrets to this public endpoint.
- Save the actual published registry and Glama listing URLs after successful submissions. Do not claim publication until a listing is verifiable.
