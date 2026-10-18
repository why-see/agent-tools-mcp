import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

const env = { MCP_RATE_LIMITER: { limit: async () => ({ success: true }) } };
const ctx = { waitUntil() {}, passThroughOnException() {} };
let id = 1;
async function call(method, params, endpoint = '/mcp') {
  const request = new Request('https://agent-tools-mcp.yvan11.workers.dev' + endpoint, {
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
    const messages = body.split(String.fromCharCode(10)).filter(line => line.startsWith('data:'))
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
  assert.equal(tools.result?.tools?.length, 32, JSON.stringify(tools));
  const result = await call('tools/call', { name: 'is-url-safe', arguments: { url: 'https://example.com' } });
  assert.equal(result.result?.content?.[0]?.type, 'text', JSON.stringify(result));
  assert.equal(JSON.parse(result.result.content[0].text), true);
});


test('31 upstream modules: 32 individually invocable MCP tools', async () => {
  const cases = [
    ['is-card-safe', {number:'4111111111111111'}],
    ['is-email-safe', {email:'founder@example.com'}],
    ['is-iban-safe', {iban:'GB82 WEST 1234 5698 7654 32'}],
    ['is-iso-date-safe', {date:'2024-02-29'}],
    ['is-ip-safe', {ip:'1.1.1.1'}],
    ['is-json-safe', {json:'{"hello":true}'}],
    ['is-password-safe', {password:'Dummy_123_Test!'}],
    ['is-phone-e164', {phone:'+66812345678'}],
    ['is-uuid-safe', {uuid:'550e8400-e29b-41d4-a716-446655440000'}],
    ['is-url-safe', {url:'https://example.com'}],
    ['is-us-tin-safe', {tin:'12-3456789'}],
    ['is-vat-safe', {vat:'DE123456789'}],
    ['is-dataset-minify', {input:'[{"id":1},{"id":2}]',format:'json'}],
    ['is-google-tag', {html:'<script src="https://www.googletagmanager.com/gtag/js?id=G-ABC123"></script>'}],
    ['is-html-minify', {html:'<div> Hello </div>'}],
    ['is-minify-js', {code:'const a = 1;'}],
    ['is-minify-css', {code:'body { color: red; }'}],
    ['is-prompt-minify', {text:'Please   summarize this report.'}],
    ['is-strip-ansi', {text:'\u001b[31mred\u001b[0m'}],
    ['generate-avatar', {text:'AC',size:64,seed:'fixture'}],
    ['generate-card-number', {brand:'visa',seed:'fixture'}],
    ['generate-color', {base:'#3366ff',count:3,seed:'fixture'}],
    ['generate-dataset', {count:2,seed:'fixture'}],
    ['generate-fake-data', {kind:'rows',count:2,seed:'fixture'}],
    ['generate-hash', {text:'hello',algo:'sha-256'}],
    ['generate-lorem', {units:'words',count:4,seed:'fixture'}],
    ['generate-password', {length:12,seed:'fixture'}],
    ['generate-phone-number', {count:2,state:'CA',seed:'fixture'}],
    ['generate-prompt', {type:'text',template:'Hello {name}',vars:{name:'world'}}],
    ['generate-slug', {text:'Café startups!'}],
    ['generate-ssn', {count:1,seed:'fixture'}],
    ['generate-token', {type:'hex',length:16,seed:'fixture'}],
  ];
  assert.equal(cases.length,32);
  const list = await call('tools/list',{});
  // Glama TDQS: every tool has meaningful descriptions, a distinct title,
  // and a semantic description for every exposed input parameter.
  for (const tool of list.result.tools) {
    assert.ok(tool.title && tool.title !== tool.name, tool.name + ': missing human-readable title');
    assert.ok(tool.description?.includes('Use '), tool.name + ': missing usage guidance');
    assert.ok(tool.description?.length > 90, tool.name + ': incomplete behavior description');
    for (const [param, property] of Object.entries(tool.inputSchema?.properties || {})) {
      assert.ok(property.description?.length > 15, tool.name + '.' + param + ': missing parameter semantics');
    }
  }

  for(const [name,args] of cases){
    assert.ok(list.result.tools.some(tool=>tool.name===name),'missing '+name);
    const answer = await call('tools/call',{name,arguments:args});
    assert.equal(answer.result?.isError === true,false,name+': '+JSON.stringify(answer.result));
    assert.ok(answer.result?.content?.[0]?.text?.length>0,name+': empty response');
  }
});

test('Specialized MCP endpoints expose exactly their category without altering the combined endpoint', async () => {
  const categories = [
    { route:'/mcp/validators',prefix:'is-',expected:12,invoke:'is-email-safe',args:{email:'agent@example.com'},exclude:['generate-token','is-strip-ansi'] },
    { route:'/mcp/optimizers',prefix:'is-',expected:7,invoke:'is-strip-ansi',args:{text:'plain'},exclude:['is-email-safe','generate-token'] },
    { route:'/mcp/generators',prefix:'generate-',expected:13,invoke:'generate-slug',args:{text:'Sample Title'},exclude:['is-email-safe','is-strip-ansi'] },
  ];
  const seen = new Set();
  for(const category of categories) {
    const init = await call('initialize', {protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'specialized-test',version:'1.0'}}, category.route);
    assert.equal(init.result.serverInfo.name,'agent-tools-'+category.route.split('/').at(-1)+'-mcp',category.route);
    const result = await call('tools/list', {}, category.route);
    assert.equal(result.result.tools.length,category.expected,category.route);
    for(const tool of result.result.tools) {
      assert.ok(tool.description?.length>90,tool.name);
      assert.ok(!seen.has(tool.name),'duplicate across categories: '+tool.name);
      seen.add(tool.name);
    }
    for(const excluded of category.exclude)assert.ok(!result.result.tools.some(tool=>tool.name===excluded),category.route+' leaked '+excluded);
    const answer=await call('tools/call',{name:category.invoke,arguments:category.args},category.route);
    assert.equal(answer.result?.isError===true,false,category.route);
    assert.ok(answer.result?.content?.[0]?.text?.length>0,category.route);
  }
  assert.equal(seen.size,32);
  const original=await call('tools/list',{});
  assert.equal(original.result.tools.length,32,'combined endpoint backwards-compatible');
  for(const tool of original.result.tools)assert.ok(seen.has(tool.name),'missing category assignment for '+tool.name);
});
