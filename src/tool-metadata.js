// Tool descriptions and Zod parameter documentation, reviewed for MCP client discoverability.
// All descriptions describe existing behavior; no tool runtime logic is changed.
export const toolDocs = {
  "is-card-safe": {
    "title": "Check card number structure",
    "usage": "Use with synthetic card fixtures when testing payment fields.",
    "result": "Returns structural validity, not authorization or fraud detection.",
    "params": {
      "number": "Synthetic payment-card number string to examine; do not provide real card details."
    }
  },
  "is-email-safe": {
    "title": "Validate email address syntax",
    "usage": "Use to reject malformed email strings in forms and test fixtures.",
    "result": "Does not establish mailbox existence or deliverability.",
    "params": {
      "email": "Email address string to check, such as founder@example.com; ASCII format only."
    }
  },
  "is-iban-safe": {
    "title": "Check IBAN syntax and checksum",
    "usage": "Use to screen fabricated or public IBANs in test data.",
    "result": "Does not verify account ownership or transferability.",
    "params": {
      "iban": "IBAN string, optionally with spaces; do not submit real private bank account details."
    }
  },
  "is-iso-date-safe": {
    "title": "Validate an ISO calendar date",
    "usage": "Use to validate date-only fields, including leap days.",
    "result": "Does not parse timestamps or timezone offsets.",
    "params": {
      "date": "Candidate date formatted YYYY-MM-DD, such as 2024-02-29."
    }
  },
  "is-ip-safe": {
    "title": "Validate IPv4 or IPv6 address syntax",
    "usage": "Use to screen candidate IP strings before processing.",
    "result": "Does not test reachability or geolocation.",
    "params": {
      "ip": "IPv4 or IPv6 literal address such as 192.0.2.1 or 2001:db8::1."
    }
  },
  "is-json-safe": {
    "title": "Parse JSON under safety limits",
    "usage": "Use to screen JSON documents before processing; use optimize-dataset for JSONL or CSV cleanup.",
    "result": "Checks syntax without executing the input.",
    "params": {
      "json": "JSON document as a string, up to 4096 characters; depth and key counts are limited."
    }
  },
  "is-password-safe": {
    "title": "Assess password strength heuristically",
    "usage": "Use only with dummy passwords when testing password policies.",
    "result": "Does not check breach databases or guarantee security.",
    "params": {
      "password": "Fictitious test password; never supply an actual password or secret."
    }
  },
  "is-phone-e164": {
    "title": "Normalize an international phone number",
    "usage": "Use to standardize internationally formatted test phone numbers.",
    "result": "Does not verify subscriber ownership or send SMS.",
    "params": {
      "phone": "Candidate internationally formatted telephone number, for example +66812345678."
    }
  },
  "is-uuid-safe": {
    "title": "Validate canonical UUID syntax",
    "usage": "Use to validate identifiers; use generate-token to create UUIDs.",
    "result": "Does not check uniqueness or resource existence.",
    "params": {
      "uuid": "UUID string in canonical hyphenated format.",
      "version": "Optional UUID version number from 1 to 8; omit to accept any supported version."
    }
  },
  "is-url-safe": {
    "title": "Validate HTTP or HTTPS URL syntax",
    "usage": "Use to screen links before storing or displaying them.",
    "result": "Does not visit the site or assess its safety.",
    "params": {
      "url": "Absolute HTTP(S) URL string; other schemes such as javascript: are not supported."
    }
  },
  "is-us-tin-safe": {
    "title": "Check US tax ID format",
    "usage": "Use to test taxpayer-ID input fields.",
    "result": "Does not verify IRS issuance or anyone's identity.",
    "params": {
      "tin": "Synthetic US taxpayer identifier string; do not submit actual personal identifiers."
    }
  },
  "is-vat-safe": {
    "title": "Validate European VAT number format",
    "usage": "Use to screen VAT fixtures before form submission.",
    "result": "Does not query VIES or confirm active registration.",
    "params": {
      "vat": "Country-prefixed VAT number string such as DE123456789."
    }
  },
  "optimize-dataset": {
    "title": "Minify small structured datasets",
    "usage": "Use to reduce formatting overhead; use is-json-safe for syntax-only checks.",
    "result": "May normalize formatting; inspect transformed text before reuse.",
    "params": {
      "input": "Source dataset text (maximum 4096 characters).",
      "format": "Parsing format: auto detects, or explicitly select json, jsonl or csv."
    }
  },
  "optimize-google-tag": {
    "title": "Optimize an existing Google tag snippet",
    "usage": "Use to optimize existing tracking markup, not configure GA4.",
    "result": "Review consent handling and tracking behavior before deployment.",
    "params": {
      "html": "Existing HTML snippet containing the Google Analytics tag to optimize."
    }
  },
  "minify-html": {
    "title": "Minify an HTML fragment",
    "usage": "Use for controlled snippets rather than full document compilation.",
    "result": "Heuristic output may require browser regression testing.",
    "params": {
      "html": "Original HTML source as text, up to 4096 characters."
    }
  },
  "minify-js": {
    "title": "Compact JavaScript source",
    "usage": "Use for basic code cleanup rather than production bundling.",
    "result": "Not AST-aware; regression-test the output.",
    "params": {
      "code": "JavaScript source code string, limited to 4096 characters."
    }
  },
  "minify-css": {
    "title": "Compact CSS source",
    "usage": "Use for basic stylesheet cleanup rather than production minification.",
    "result": "Not a full CSS parser; visually test the result.",
    "params": {
      "code": "CSS source code string, limited to 4096 characters."
    }
  },
  "minify-prompt": {
    "title": "Reduce prompt verbosity and whitespace",
    "usage": "Use before sending text to a model when token budget matters.",
    "result": "May alter meaning; compare results on representative prompts.",
    "params": {
      "text": "Prompt text to compact, up to 4096 characters."
    }
  },
  "strip-ansi": {
    "title": "Remove terminal ANSI escape codes",
    "usage": "Use to make colorized logs readable for indexing or display.",
    "result": "Returns plain text without interpreting log entries.",
    "params": {
      "text": "Terminal output string containing optional ANSI escape sequences."
    }
  },
  "generate-avatar": {
    "title": "Generate an SVG placeholder avatar",
    "usage": "Use for synthetic avatars in demos and UI prototypes.",
    "result": "Returns SVG markup, not a photorealistic likeness.",
    "params": {
      "text": "Optional initials or label used to customize the placeholder.",
      "pattern": "Avatar layout: initials, blocks, circles or random.",
      "size": "SVG width and height in pixels, from 32 to 256.",
      "seed": "Optional deterministic seed for repeatable test fixtures; do not use as a secret."
    }
  },
  "generate-card-number": {
    "title": "Generate a synthetic card test number",
    "usage": "Use for payment-form fixtures and UI testing.",
    "result": "Not an issued or usable payment credential.",
    "params": {
      "brand": "Synthetic card brand: visa, mastercard, amex or discover.",
      "seed": "Optional deterministic seed for reproducible fake card fixtures."
    }
  },
  "generate-color": {
    "title": "Generate an illustrative color palette",
    "usage": "Use to explore color combinations in design prototypes.",
    "result": "Returns selected color notation; does not evaluate WCAG contrast.",
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
    "usage": "Use for data import/export tests; use generate-fake-data for preset people or company fixtures.",
    "result": "Returns at most eight records without accessing a database.",
    "params": {
      "count": "Number of records to generate, 1–8, default 3.",
      "format": "Output format: json, jsonl or csv.",
      "seed": "Optional deterministic seed for reproducible test rows.",
      "schema": "Optional map of field names to upstream synthetic field specifications; no real records."
    }
  },
  "generate-fake-data": {
    "title": "Generate fictional people and company records",
    "usage": "Use to seed demos with preset records; use generate-dataset for custom fields.",
    "result": "Synthetic values are not verified identities.",
    "params": {
      "kind": "Fixture category: user, company, address or rows.",
      "count": "Requested number of synthetic records, up to eight.",
      "seed": "Optional deterministic seed to reproduce the same fake records."
    }
  },
  "generate-hash": {
    "title": "Compute a text digest",
    "usage": "Use to fingerprint non-secret fixture data.",
    "result": "Not suitable for password storage or key derivation.",
    "params": {
      "text": "Public or synthetic text to digest; never send secrets for hashing.",
      "algo": "Digest algorithm: sha-256 (default) or legacy md5."
    }
  },
  "generate-lorem": {
    "title": "Create filler copy for layouts",
    "usage": "Use for mock layouts needing filler words, sentences or paragraphs.",
    "result": "Returns synthetic copy, not sourced editorial content.",
    "params": {
      "units": "Output unit: words, sentences or paragraphs.",
      "count": "Number of units, from 1 to 8; default 3.",
      "seed": "Optional deterministic seed for reproducible placeholder text."
    }
  },
  "generate-password": {
    "title": "Generate a random test password",
    "usage": "Use to populate synthetic account fixtures.",
    "result": "Seeded output is predictable, and all output is visible to the MCP client.",
    "params": {
      "length": "Desired password length, 8–256 characters.",
      "symbols": "Whether punctuation/symbol characters are included.",
      "seed": "Optional deterministic seed for testing only; seeded output is predictable."
    }
  },
  "generate-phone-number": {
    "title": "Generate fictional US phone fixtures",
    "usage": "Use to populate phone fields in American demo records.",
    "result": "Does not supply verified callable subscriber numbers.",
    "params": {
      "state": "Optional US state abbreviation: CA, NY, TX or FL.",
      "city": "Optional supported US city for choosing the mock number pattern.",
      "count": "Number of fabricated numbers, up to eight.",
      "seed": "Optional deterministic seed for repeatable test numbers."
    }
  },
  "generate-prompt": {
    "title": "Fill a prompt template with variables",
    "usage": "Use to assemble text, code or image prompts without invoking a model.",
    "result": "Returns constructed text; inspect unresolved placeholders.",
    "params": {
      "type": "Prompt template category: text, code or image; default text.",
      "template": "Template string with variable placeholders, limited to 4096 characters.",
      "vars": "Map of placeholder names to replacement values.",
      "seed": "Optional deterministic seed supported by the upstream template generator."
    }
  },
  "generate-slug": {
    "title": "Turn a title into a URL slug",
    "usage": "Use when forming new path segments from headings.",
    "result": "Inspect output before publishing permanent URLs.",
    "params": {
      "text": "Source title to normalize, such as Café startups!.",
      "maxLength": "Maximum slug length, 1–160 characters; omit for the upstream default."
    }
  },
  "generate-ssn": {
    "title": "Generate fictional US SSN-style identifiers",
    "usage": "Use for field validation and UI fixtures only.",
    "result": "Structural validity does not imply actual issuance.",
    "params": {
      "count": "Number of synthetic SSN-style fixtures, 1–8.",
      "formatted": "Whether to add standard dashes to the generated identifier.",
      "valid": "Whether fixtures should pass the generator's structural validity rules, not actual issuance checks.",
      "seed": "Optional deterministic seed for repeatable fake identifiers."
    }
  },
  "generate-token": {
    "title": "Generate random tokens or UUIDs",
    "usage": "Use for synthetic fixtures or temporary development identifiers.",
    "result": "Seeded output is predictable and must not be used as credentials.",
    "params": {
      "type": "Token format: uuid, hex, base64 or numeric.",
      "length": "Output length parameter, 1–256, where applicable to the selected token type.",
      "seed": "Optional deterministic seed, intended for reproducible test output only."
    }
  }
};
