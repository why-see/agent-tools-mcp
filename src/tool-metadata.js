// Tool descriptions and Zod parameter documentation, reviewed for MCP client discoverability.
// All descriptions describe existing behavior; no tool runtime logic is changed.
export const toolDocs = {
  "is-card-safe": {
    "title": "Check card number structure",
    "usage": "Use to screen synthetic card fixtures for plausible network/length and Luhn checksum. Do not use for real payment-card authorization or fraud detection.",
    "result": "Returns a local structural assessment; never contacts a bank.",
    "params": {
      "number": "Synthetic payment-card number string to examine; do not provide real card details."
    }
  },
  "is-email-safe": {
    "title": "Validate email address syntax",
    "usage": "Use to reject malformed email strings before a form or fixture is processed. For mailbox existence or deliverability, use a separate verification service.",
    "result": "Returns a syntax-only result without sending email or making DNS requests.",
    "params": {
      "email": "Email address string to check, such as founder@example.com; ASCII format only."
    }
  },
  "is-iban-safe": {
    "title": "Check IBAN syntax and checksum",
    "usage": "Use to check a fabricated or public IBAN's country length and check digits. Do not use to confirm account ownership, bank existence or actual transferability.",
    "result": "Uses a bundled country registry, with no bank or network lookup.",
    "params": {
      "iban": "IBAN string, optionally with spaces; do not submit real private bank account details."
    }
  },
  "is-iso-date-safe": {
    "title": "Validate an ISO calendar date",
    "usage": "Use before accepting YYYY-MM-DD dates, including leap-day validity. For timestamps, offsets or date/time conversion, use a time-aware parser instead.",
    "result": "Checks only the Gregorian calendar date; no timezone lookup.",
    "params": {
      "date": "Candidate date formatted YYYY-MM-DD, such as 2024-02-29."
    }
  },
  "is-ip-safe": {
    "title": "Validate IPv4 or IPv6 address syntax",
    "usage": "Use to check whether a supplied string is structurally an IP address. Do not use it to geolocate a host or test network reachability.",
    "result": "Local syntax validation only; performs no DNS or network request.",
    "params": {
      "ip": "IPv4 or IPv6 literal address such as 192.0.2.1 or 2001:db8::1."
    }
  },
  "is-json-safe": {
    "title": "Parse JSON under safety limits",
    "usage": "Use to test whether text is valid JSON within depth/key constraints. For CSV/JSONL cleanup, use is-dataset-minify instead.",
    "result": "Checks JSON syntax with bounded depth and key counts; does not execute or persist input.",
    "params": {
      "json": "JSON document as a string, up to 4096 characters; depth and key counts are limited."
    }
  },
  "is-password-safe": {
    "title": "Assess password strength heuristically",
    "usage": "Use only with dummy passwords to evaluate upstream password rules. Never send real user credentials to a public third-party endpoint.",
    "result": "Returns a heuristic assessment, not a breached-password check; no external lookup.",
    "params": {
      "password": "Fictitious test password; never supply an actual password or secret."
    }
  },
  "is-phone-e164": {
    "title": "Normalize an international phone number",
    "usage": "Use to check a candidate international number in E.164 style before storing a test record. It does not verify whether a subscriber owns the number.",
    "result": "Performs format checking and normalization locally; sends no SMS.",
    "params": {
      "phone": "Candidate internationally formatted telephone number, for example +66812345678."
    }
  },
  "is-uuid-safe": {
    "title": "Validate canonical UUID syntax",
    "usage": "Use to verify a UUID string, optionally limiting acceptance to a specific version. To create new UUIDs, use generate-token.",
    "result": "Does not check UUID uniqueness or resolve any referenced resource.",
    "params": {
      "uuid": "UUID string in canonical hyphenated format.",
      "version": "Optional UUID version number from 1 to 8; omit to accept any supported version."
    }
  },
  "is-url-safe": {
    "title": "Validate HTTP or HTTPS URL syntax",
    "usage": "Use to check a candidate web link before displaying or saving it. Do not use this to establish that a site is safe, accessible or trustworthy.",
    "result": "Local syntax check only: never fetches, crawls or resolves the URL.",
    "params": {
      "url": "Absolute HTTP(S) URL string; other schemes such as javascript: are not supported."
    }
  },
  "is-us-tin-safe": {
    "title": "Check US tax ID format",
    "usage": "Use only with synthetic EIN, SSN or ITIN fixtures to examine formatting. Do not use to confirm an individual's identity or IRS registration.",
    "result": "Performs format-only checks with no government lookup.",
    "params": {
      "tin": "Synthetic US taxpayer identifier string; do not submit actual personal identifiers."
    }
  },
  "is-vat-safe": {
    "title": "Validate European VAT number format",
    "usage": "Use to screen a test VAT ID for country-specific syntax. To confirm tax registration or active status, query an official VAT register separately.",
    "result": "Local format validation only; no VIES or tax-agency call.",
    "params": {
      "vat": "Country-prefixed VAT number string such as DE123456789."
    }
  },
  "is-dataset-minify": {
    "title": "Minify small structured datasets",
    "usage": "Use to compact small JSON, JSONL or CSV samples without discarding meaningful fields. For ordinary JSON validity checks, use is-json-safe.",
    "result": "Returns an optimized representation; may normalize formatting, so inspect output before production use.",
    "params": {
      "input": "Source dataset text (maximum 4096 characters).",
      "format": "Parsing format: auto detects, or explicitly select json, jsonl or csv."
    }
  },
  "is-google-tag": {
    "title": "Optimize an existing Google tag snippet",
    "usage": "Use when transforming an already supplied Google Analytics tag snippet. It does not configure GA4 accounts, install tracking or verify consent.",
    "result": "Returns rewritten snippet text; check consent behavior and analytics tracking before deployment.",
    "params": {
      "html": "Existing HTML snippet containing the Google Analytics tag to optimize."
    }
  },
  "is-html-minify": {
    "title": "Minify an HTML fragment",
    "usage": "Use to reduce whitespace in a controlled HTML fragment before delivery. For CSS or JavaScript, use is-minify-css or is-minify-js.",
    "result": "Heuristic transformation only, not a standards-compliant HTML parser; regression-test the output.",
    "params": {
      "html": "Original HTML source as text, up to 4096 characters."
    }
  },
  "is-minify-js": {
    "title": "Compact JavaScript source",
    "usage": "Use for small JavaScript snippets where basic whitespace cleanup suffices. For CSS use is-minify-css; for safe production bundling use a real JavaScript parser/minifier.",
    "result": "Heuristic, not AST-aware: output may require a behavior check before deployment.",
    "params": {
      "code": "JavaScript source code string, limited to 4096 characters."
    }
  },
  "is-minify-css": {
    "title": "Compact CSS source",
    "usage": "Use for small CSS snippets where basic whitespace cleanup suffices. For JavaScript use is-minify-js; for complex stylesheets use a CSS-aware build tool.",
    "result": "Heuristic, not a full CSS parser: visually regression-test the output.",
    "params": {
      "code": "CSS source code string, limited to 4096 characters."
    }
  },
  "is-prompt-minify": {
    "title": "Reduce prompt verbosity and whitespace",
    "usage": "Use to shorten prompt text before passing it to a model when token budget matters. Do not assume the rewritten prompt preserves all nuances.",
    "result": "May change phrasing and semantics; compare results on representative tasks.",
    "params": {
      "text": "Prompt text to compact, up to 4096 characters."
    }
  },
  "is-strip-ansi": {
    "title": "Remove terminal ANSI escape codes",
    "usage": "Use when turning colorized terminal logs into clean text for indexing or display. For structured datasets, use is-dataset-minify instead.",
    "result": "Strips ANSI formatting locally; does not parse log entries or alter their meaning.",
    "params": {
      "text": "Terminal output string containing optional ANSI escape sequences."
    }
  },
  "generate-avatar": {
    "title": "Generate an SVG placeholder avatar",
    "usage": "Use to create a deterministic or synthetic profile icon for prototypes. Not suitable for matching a real person's photograph.",
    "result": "Returns SVG placeholder content; does not use image models, uploaded photos or external assets.",
    "params": {
      "text": "Optional initials or label used to customize the placeholder.",
      "pattern": "Avatar layout: initials, blocks, circles or random.",
      "size": "SVG width and height in pixels, from 32 to 256.",
      "seed": "Optional deterministic seed for repeatable test fixtures; do not use as a secret."
    }
  },
  "generate-card-number": {
    "title": "Generate a synthetic card test number",
    "usage": "Use for payment-form UI tests that need checksum-valid dummy data. Never use to impersonate a payment credential or test real purchases.",
    "result": "Generates synthetic format/checksum-valid fixtures only; no issued account or bank access.",
    "params": {
      "brand": "Synthetic card brand: visa, mastercard, amex or discover.",
      "seed": "Optional deterministic seed for reproducible fake card fixtures."
    }
  },
  "generate-color": {
    "title": "Generate an illustrative color palette",
    "usage": "Use when a design prototype needs related colors from a base hue. Not an accessibility or WCAG contrast audit.",
    "result": "Returns palette values in the selected format; generated colors are not automatically accessible.",
    "params": {
      "base": "Optional base color such as #3366ff.",
      "scheme": "Palette harmony algorithm: complementary, triadic, tetradic, analogous, monochrome or random.",
      "count": "Number of colors, from 1 to 12.",
      "format": "Output color notation: hex, rgb or hsl.",
      "seed": "Optional deterministic seed for repeatable palette generation."
    }
  },
  "generate-dataset": {
    "title": "Generate a small synthetic dataset",
    "usage": "Use for testing CSV, JSON or JSONL import/export flows with fabricated data. For specific user/company/address fixtures, use generate-fake-data.",
    "result": "Outputs at most eight synthetic rows; never accesses a production database.",
    "params": {
      "count": "Number of records to generate, 1–8, default 3.",
      "format": "Output format: json, jsonl or csv.",
      "seed": "Optional deterministic seed for reproducible test rows.",
      "schema": "Optional map of field names to upstream synthetic field specifications; no real records."
    }
  },
  "generate-fake-data": {
    "title": "Generate fictional people and company records",
    "usage": "Use to seed demos with made-up users, companies or addresses. For a custom schema and CSV output, use generate-dataset.",
    "result": "Creates local synthetic fixtures, not actual identities or verified business records.",
    "params": {
      "kind": "Fixture category: user, company, address or rows.",
      "count": "Requested number of synthetic records, up to eight.",
      "seed": "Optional deterministic seed to reproduce the same fake records."
    }
  },
  "generate-hash": {
    "title": "Compute a text digest",
    "usage": "Use SHA-256 for non-secret fixture digests or to compare public text content. Do not use the legacy MD5 choice for security or either algorithm directly for password storage.",
    "result": "Returns a digest; it is not a password-hashing or key-derivation service.",
    "params": {
      "text": "Public or synthetic text to digest; never send secrets for hashing.",
      "algo": "Digest algorithm: sha-256 (default) or legacy md5."
    }
  },
  "generate-lorem": {
    "title": "Create filler copy for layouts",
    "usage": "Use to generate placeholder words, sentences or paragraphs for visual mocks. For real editorial text, use a writing model instead.",
    "result": "Produces nonsensical sample content without fetching articles or documents.",
    "params": {
      "units": "Output unit: words, sentences or paragraphs.",
      "count": "Number of units, from 1 to 8; default 3.",
      "seed": "Optional deterministic seed for reproducible placeholder text."
    }
  },
  "generate-password": {
    "title": "Generate a random test password",
    "usage": "Use to populate synthetic account fixtures; unseeded generation uses cryptographic randomness. Never use seeded passwords as actual production credentials.",
    "result": "Returns a password as MCP text, visible to the client; keep real secrets out of public integrations.",
    "params": {
      "length": "Desired password length, 8–256 characters.",
      "symbols": "Whether punctuation/symbol characters are included.",
      "seed": "Optional deterministic seed for testing only; seeded output is predictable."
    }
  },
  "generate-phone-number": {
    "title": "Generate fictional US phone fixtures",
    "usage": "Use for mock phone-number fields in US-based test data. To validate a supplied number, use is-phone-e164.",
    "result": "Generates fictional strings, not callable phone numbers or subscriber lookups.",
    "params": {
      "state": "Optional US state abbreviation: CA, NY, TX or FL.",
      "city": "Optional supported US city for choosing the mock number pattern.",
      "count": "Number of fabricated numbers, up to eight.",
      "seed": "Optional deterministic seed for repeatable test numbers."
    }
  },
  "generate-prompt": {
    "title": "Fill a prompt template with variables",
    "usage": "Use to assemble a prompt string from a caller-supplied template and variable map. It does not invoke or pay for any AI model.",
    "result": "Returns constructed prompt text; inspect template placeholders before use.",
    "params": {
      "type": "Prompt template category: text, code or image; default text.",
      "template": "Template string with variable placeholders, limited to 4096 characters.",
      "vars": "Map of placeholder names to replacement values.",
      "seed": "Optional deterministic seed supported by the upstream template generator."
    }
  },
  "generate-slug": {
    "title": "Turn a title into a URL slug",
    "usage": "Use when creating an SEO-friendly path segment from a title. To check an existing full URL, use is-url-safe instead.",
    "result": "Transliterates/normalizes text locally; verify preferred slugs before publishing permanent URLs.",
    "params": {
      "text": "Source title to normalize, such as Café startups!.",
      "maxLength": "Maximum slug length, 1–160 characters; omit for the upstream default."
    }
  },
  "generate-ssn": {
    "title": "Generate fictional US SSN-style identifiers",
    "usage": "Use only to test formatting and field validation in demos. Never use a generated value as anyone's actual Social Security number.",
    "result": "Returns synthetic identifiers and does not query Social Security records.",
    "params": {
      "count": "Number of synthetic SSN-style fixtures, 1–8.",
      "formatted": "Whether to add standard dashes to the generated identifier.",
      "valid": "Whether fixtures should pass the generator's structural validity rules, not actual issuance checks.",
      "seed": "Optional deterministic seed for repeatable fake identifiers."
    }
  },
  "generate-token": {
    "title": "Generate random tokens or UUIDs",
    "usage": "Use for temporary development fixtures or unseeded random UUIDs. Do not use seeded output as authentication credentials; for file digests use generate-hash.",
    "result": "Returns a generated value visible to the MCP client; no token is registered with any service.",
    "params": {
      "type": "Token format: uuid, hex, base64 or numeric.",
      "length": "Output length parameter, 1–256, where applicable to the selected token type.",
      "seed": "Optional deterministic seed, intended for reproducible test output only."
    }
  }
};
