import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

const env = { MCP_RATE_LIMITER: { limit: async () => ({ success: true }) } };
const ctx = { waitUntil() {}, passThroughOnException() {} };
let id = 1;
async function call(method, params) {
  const request = new Request('https://agent-tools-mcp.yvan11.workers.dev/mcp', {
    method: 'POST',
    headers: {
      'host': 'agent-tools-mcp.yvan11.workers.dev',
      'content-type': 'application/json',
      'accept': 'application/json, text/event-stream',
      'MCP-Protocol-Version': '2025-06-18'
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: id++, method, params })
  });
  const response = await worker.fetch(request, env, ctx);
  const body = await response.text();
  assert.equal(response.status, 200, method + ' HTTP ' + response.status + ': ' + body.slice(0, 500));
  if (response.headers.get('content-type')?.includes('text/event-stream') || body.startsWith('event:')) {
    const messages = body.split(/\\r?\\n/).filter(line => line.startsWith('data:'))
      .map(line => JSON.parse(line.slice(5).trim()));
    assert.ok(messages.length, method + ' yielded no SSE message');
    return messages.find(message => message.jsonrpc === '2.0' && 'id' in message) || messages[0];
  }
  return JSON.parse(body);
}

test('MCP Streamable HTTP initialize, tools/list, tools/call', async () => {
  const init = await call('initialize', {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'smoke', version: '1.0' }
  });
  assert.equal(init.jsonrpc, '2.0');
  assert.ok(init.result?.serverInfo?.name, JSON.stringify(init));
  const tools = await call('tools/list', {});
  assert.equal(tools.result?.tools?.length, 10, JSON.stringify(tools));
  const result = await call('tools/call', { name: 'is-url-safe', arguments: { url: 'https://example.com' } });
  assert.equal(result.result?.content?.[0]?.type, 'text', JSON.stringify(result));
  assert.equal(JSON.parse(result.result.content[0].text).valid, true);
});
