# Source provenance and update policy

The `src/upstream` directory contains pinned copies of MIT-licensed public modules from Yvancg, with one documented local correction in the phone generator. The original licenses are stored alongside their copies.

| Category | GitHub source | Revision copied | Modules | MCP tools |
|---|---|---|---:|---:|
| Validators | https://github.com/Yvancg/validators | `60cd6cb0d53b3bcd8449de883287003990379998` | 12 | 12 |
| Optimizers | https://github.com/Yvancg/optimizers | `4d2a3b195b553cd871cb4d5e28da0139e28dd070` | 6 | 7 (JS and CSS split) |
| Generators | https://github.com/Yvancg/generators | `17b34c9d60eb538e83f06cd4fe8a6fed0709544d` | 13 | 13 |

**Local phone-generator correction (October 2026):** The pinned `generate-phone-number/phone.js` module adds area-code mappings for San Francisco, New York, Houston and Miami, matching the five city options already accepted by the MCP input schema. Only city-filtered number generation changes. The `Yvancg/generators` repository is left unchanged to avoid triggering its existing GitHub Actions workflows. Reconcile this patch explicitly during any future upstream refresh.

**Updates are not automatic.** To update the MCP Worker, compare upstream module changes, copy changed files, run unit and protocol tests, review output, then merge the update to `main`. The Cloudflare Git integration deploys `main` automatically. This explicit copy-and-test policy prevents a compromised upstream source file from immediately becoming remote-executable MCP functionality.

The validators and optimizers repos have `catalog.json` files, but the optimizers catalog omits the dataset module and defines JS/CSS tools from one module. The generators repository puts a tool descriptor in `package.json` instead of a standard `catalog.json`. **The executable source files, not these metadata catalogs, are authoritative.**

## Security limitations

- Public, read-only utility service; no OAuth, account access, persistence or payments.
- Optional `MCP_API_TOKEN` Cloudflare Worker runtime secret enables simple bearer-token authentication. This is not a standards-compliant OAuth flow for public multi-user MCP registration.
- Request body limit: 8192 UTF-16 code units; most strings limited to 4096 chars; output capped at 32768 chars.
- Per-IP Cloudflare rate-limiter is per edge data center, not a global account-wide quota.
- Do not send **real passwords, payment card details, social security numbers, tax IDs or sensitive documents** to a public third-party MCP service.
- Synthetic card numbers and SSNs are only for software testing; generated seeds produce predictable fixtures and must not be used for actual credentials.
- Minifiers use source-specific heuristics; always verify transformations before using the output in production.
- Validate the full tool list with an MCP client, not a browser GET request to `/mcp`.

No GitHub Actions configured.
