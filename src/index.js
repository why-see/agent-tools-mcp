import { McpServer } from '@modelcontextprotocol/server';
import { createMcpHandler } from 'agents/mcp/server';
import { z } from 'zod';
import {
  validateEmail, validateUrl, validatePhoneE164, validateUuid,
  validateIsoDate, validateIban, validateJson, slugify,
  stripAnsi, normalizeWhitespace,
} from './tools.js';

const textInput = z.string().max(4096).describe('Text to process, maximum 4096 characters');
const result = (data) => ({ content: [{ type: 'text', text: JSON.stringify(data) }] });

function createServer() {
  const server = new McpServer({ name: 'agent-tools-mcp', version: '1.0.0' });
  const register = (name, description, parameter, fn) => {
    server.registerTool(name, {
      title: name,
      description,
      inputSchema: { [parameter]: textInput },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    }, (args) => result(fn(args[parameter])));
  };
  register('is-email-safe', 'Check email address syntax without mailbox existence checks.', 'email', validateEmail);
  register('is-url-safe', 'Check whether a string is a syntactically valid HTTP(S) URL, not reachability or reputation.', 'url', validateUrl);
  register('is-phone-e164', 'Check E.164 phone number syntax.', 'phone', validatePhoneE164);
  register('is-uuid-safe', 'Check UUID format and variant.', 'uuid', validateUuid);
  register('is-iso-date-safe', 'Check Gregorian YYYY-MM-DD calendar validity.', 'date', validateIsoDate);
  register('is-iban-safe', 'Check IBAN syntax and MOD-97 checksum, without verifying the account.', 'iban', validateIban);
  register('is-json-safe', 'Check JSON syntax without executing code.', 'json', validateJson);
  register('generate-slug', 'Generate lowercase ASCII URL slug.', 'text', (s) => ({ slug: slugify(s) }));
  register('is-strip-ansi', 'Remove ANSI terminal sequences from text.', 'text', (s) => ({ text: stripAnsi(s) }));
  register('normalize-whitespace', 'Trim and normalize whitespace.', 'text', (s) => ({ text: normalizeWhitespace(s) }));
  return server;
}

const handler = createMcpHandler(createServer, {
  route: '/mcp',
  responseMode: 'json',
  legacy: 'stateless',
  corsOptions: false,
});

function bearerMatches(actual, expected) {
  const header = 'Bearer ' + expected;
  if (actual.length !== header.length) return false;
  let diff = 0;
  for (let i = 0; i < header.length; i++) diff |= actual.charCodeAt(i) ^ header.charCodeAt(i);
  return diff === 0;
}

export default {
  async fetch(request, env, ctx) {
    const path = new URL(request.url).pathname;
    if (path === '/health' && request.method === 'GET') {
      return Response.json({ status: 'ok', service: 'agent-tools-mcp', transport: 'mcp-streamable-http' },
        { headers: { 'Cache-Control': 'no-store' } });
    }
    if (path !== '/mcp') return new Response('Not found', { status: 404 });
    if (Number(request.headers.get('content-length') || 0) > 8192) return new Response('Request too large', { status: 413 });
    if (request.method === 'POST') {
      const body = await request.clone().text();
      if (body.length > 8192) return new Response('Request too large', { status: 413 });
    }
    if (env.MCP_API_TOKEN && !bearerMatches(request.headers.get('Authorization') || '', env.MCP_API_TOKEN)) {
      return new Response('Unauthorized', { status: 401, headers: { 'WWW-Authenticate': 'Bearer' } });
    }
    const key = request.headers.get('CF-Connecting-IP') || 'unidentified';
    if (!env.MCP_RATE_LIMITER) return new Response('Rate limit is not configured', { status: 503 });
    const decision = await env.MCP_RATE_LIMITER.limit({ key });
    if (!decision.success) return new Response('Too many requests', { status: 429, headers: { 'Retry-After': '60' } });
    return handler(request, env, ctx);
  },
};
