// Tool descriptions and Zod parameter documentation, reviewed for MCP client discoverability.
// All descriptions describe existing behavior; no tool runtime logic is changed.
export const toolDocs = {
  "is-card-safe": {
    "title": "Check card number structure",
    "usage": "Use with synthetic card numbers in payment-form tests.",
    "result": "Returns {ok, normalized?, brand?, last4?, issues}; not a payment authorization or fraud check.",
    "params": {
      "number": "Synthetic payment-card number string to examine; do not provide real card details."
    }
  },
  "is-email-safe": {
    "title": "Validate email address syntax",
    "usage": "Use to reject malformed addresses in forms and test fixtures.",
    "result": "Returns true or false; does not check mailbox existence or deliverability.",
    "params": {
      "email": "Email address string to check, such as founder@example.com; ASCII format only."
    }
  },
  "is-iban-safe": {
    "title": "Check IBAN syntax and checksum",
    "usage": "Use to screen public or synthetic IBANs in test data.",
    "result": "Returns {ok, normalized?, issues}; does not verify account ownership or transferability.",
    "params": {
      "iban": "IBAN string, optionally with spaces; do not submit real private bank account details."
    }
  },
  "is-iso-date-safe": {
    "title": "Validate an ISO calendar date",
    "usage": "Use for date-only form fields, not timestamps or timezone offsets.",
    "result": "Returns true for a valid date, otherwise false.",
    "params": {
      "date": "Candidate date formatted YYYY-MM-DD, such as 2024-02-29."
    }
  },
  "is-ip-safe": {
    "title": "Validate IPv4 or IPv6 address syntax",
    "usage": "Use to screen candidate IP strings, not test reachability or geolocation.",
    "result": "Returns {ok, version, issues}; version is 4, 6 or null.",
    "params": {
      "ip": "IPv4 or IPv6 literal address such as 192.0.2.1 or 2001:db8::1."
    }
  },
  "is-json-safe": {
    "title": "Parse JSON under safety limits",
    "usage": "Use to screen JSON without execution; use optimize-dataset for JSONL or CSV cleanup.",
    "result": "Returns {ok, issues, bytes, depth, keys, value?}; parsed value is included only when valid.",
    "params": {
      "json": "JSON document as a string, up to 4096 characters; depth and key counts are limited."
    }
  },
  "is-password-safe": {
    "title": "Assess password strength heuristically",
    "usage": "Use only with dummy passwords when testing password policies.",
    "result": "Returns {ok, score, entropyBits, length, sets, reasons, suggestions}; no breach-database lookup.",
    "params": {
      "password": "Fictitious test password; never supply an actual password or secret."
    }
  },
  "is-phone-e164": {
    "title": "Validate E.164 phone number syntax",
    "usage": "Use to test international number formats, including spaces or 00 prefixes.",
    "result": "Returns true or false, not the normalized number; no subscriber or reachability check.",
    "params": {
      "phone": "Candidate internationally formatted telephone number, for example +66812345678."
    }
  },
  "is-uuid-safe": {
    "title": "Validate canonical UUID syntax",
    "usage": "Use to validate UUIDs; use generate-token to create them.",
    "result": "Returns true or false; does not check uniqueness or resource existence.",
    "params": {
      "uuid": "UUID string in canonical hyphenated format.",
      "version": "Optional UUID version number from 1 to 8; omit to accept any supported version."
    }
  },
  "is-url-safe": {
    "title": "Validate HTTP or HTTPS URL syntax",
    "usage": "Use to screen links before display or storage.",
    "result": "Returns true or false; does not visit or assess the site's safety.",
    "params": {
      "url": "Absolute HTTP(S) URL string; other schemes such as javascript: are not supported."
    }
  },
  "is-us-tin-safe": {
    "title": "Check US tax ID format",
    "usage": "Use with tax-ID input fixtures, never real personal identifiers.",
    "result": "Returns {ok, normalized?, type, issues}; does not verify IRS issuance or identity.",
    "params": {
      "tin": "Synthetic US taxpayer identifier string; do not submit actual personal identifiers."
    }
  },
  "is-vat-safe": {
    "title": "Validate European VAT number format",
    "usage": "Use to screen VAT fixtures before form submission.",
    "result": "Returns {ok, country?, normalized?, issues}; no VIES lookup or active-registration check.",
    "params": {
      "vat": "Country-prefixed VAT number string such as DE123456789."
    }
  },
  "optimize-dataset": {
    "title": "Minify small structured datasets",
    "usage": "Use for small datasets; use is-json-safe to check JSON syntax without changes.",
    "result": "Returns text in the selected format; trims strings, deduplicates rows and may drop mostly empty columns.",
    "params": {
      "input": "Source dataset text (maximum 4096 characters).",
      "format": "Parsing format: auto detects, or explicitly select json, jsonl or csv."
    }
  },
  "optimize-google-tag": {
    "title": "Optimize an existing Google tag snippet",
    "usage": "Use on existing GA4 snippets, not GTM containers or consent setup.",
    "result": "Returns replacement HTML with async loading and a config call, or original input if no G- ID exists. Review lost settings and consent.",
    "params": {
      "html": "Existing HTML snippet containing the Google Analytics tag to optimize."
    }
  },
  "minify-html": {
    "title": "Minify an HTML fragment",
    "usage": "Use for small, controlled HTML snippets, not full document compilation.",
    "result": "Returns an HTML string; preserves pre, textarea, script and style contents. Regression-test rendered output.",
    "params": {
      "html": "Original HTML source as text, up to 4096 characters."
    }
  },
  "minify-js": {
    "title": "Compact JavaScript source",
    "usage": "Use for basic source cleanup, not AST-aware production minification.",
    "result": "Returns JavaScript text, sometimes unchanged for complex syntax; regression-test its behavior.",
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
    "usage": "Use to compact formatting before calling a model; filler phrases are not removed.",
    "result": "Returns trimmed text with normalized spacing; review prompts where whitespace carries meaning.",
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
    "title": "Generate a synthetic payment card fixture",
    "usage": "Use for payment-form UI tests requiring a Luhn-valid card number.",
    "result": "Returns {number, brand, expiry, cvc}; values are synthetic, not issued credentials.",
    "params": {
      "brand": "Synthetic card brand: visa, mastercard, amex or discover.",
      "seed": "Optional deterministic seed for reproducible fake card fixtures."
    }
  },
  "generate-color": {
    "title": "Generate an illustrative color palette",
    "usage": "Use for design prototypes; defaults: random base, triadic scheme, five hex colors.",
    "result": "Returns {base, scheme, colors, textOnBase}; text color is heuristic, not a WCAG contrast check.",
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
    "usage": "Use for non-secret content fingerprints; generate-token creates new IDs instead.",
    "result": "Returns a hex digest; unsuitable for password storage or key derivation.",
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
    "usage": "Use for demo login fields; use generate-token for identifiers.",
    "result": "Seeded values are predictable and visible to MCP clients; not a secure credential vault.",
    "params": {
      "length": "Desired password length, 8–256 characters.",
      "symbols": "Whether punctuation/symbol characters are included.",
      "seed": "Optional deterministic seed for testing only; seeded output is predictable."
    }
  },
  "generate-phone-number": {
    "title": "Generate fictional US phone fixtures",
    "usage": "Use for US demo phone fields; when supplied, city selects a local area-code pool and must match state.",
    "result": "Returns an array of fictional (AAA) 555-01XX numbers; no subscriber lookup.",
    "params": {
      "state": "Optional US state abbreviation: CA, NY, TX or FL.",
      "city": "Optional city: Los Angeles, San Francisco, New York, Houston or Miami; must match state if given.",
      "count": "Number of fabricated numbers, up to eight.",
      "seed": "Optional deterministic seed for repeatable test numbers."
    }
  },
  "generate-prompt": {
    "title": "Fill a prompt template with variables",
    "usage": "Use {name} placeholders with matching vars.name; missing variables become empty text.",
    "result": "Returns a prompt string without invoking a model; code/image modes can add framing.",
    "params": {
      "type": "Prompt template category: text, code or image; default text.",
      "template": "Template text, e.g. Hello {name}; omitted variables are replaced with empty text.",
      "vars": "Object mapping placeholder names to values, e.g. {\"name\":\"Ada\"} for {name}.",
      "seed": "Optional deterministic seed for the {{RAND_INT:min,max}} helper, not ordinary placeholders."
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
    "usage": "Use for SSN test fields; use generate-fake-data for mixed-record fixtures.",
    "result": "Returns a string for count=1, otherwise an array; structural validity does not confirm issuance.",
    "params": {
      "count": "Number of synthetic SSN-style fixtures, 1–8.",
      "formatted": "Whether to add standard dashes to the generated identifier.",
      "valid": "Whether fixtures should pass the generator's structural validity rules, not actual issuance checks.",
      "seed": "Optional deterministic seed for repeatable fake identifiers."
    }
  },
  "generate-token": {
    "title": "Generate random tokens or UUIDs",
    "usage": "Use for test identifiers; use generate-password for password fixtures.",
    "result": "Seeded output is predictable and unsuitable for authentication credentials.",
    "params": {
      "type": "Token format: uuid, hex, base64 or numeric.",
      "length": "Output length parameter, 1–256, where applicable to the selected token type.",
      "seed": "Optional deterministic seed, intended for reproducible test output only."
    }
  }
};
