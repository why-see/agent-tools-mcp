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
    ['optimize-dataset', {input:'[{"id":1},{"id":2}]',format:'json'}],
    ['optimize-google-tag', {html:'<script src="https://www.googletagmanager.com/gtag/js?id=G-ABC123"></script>'}],
    ['minify-html', {html:'<div> Hello </div>'}],
    ['minify-js', {code:'const a = 1;'}],
    ['minify-css', {code:'body { color: red; }'}],
    ['minify-prompt', {text:'Please   summarize this report.'}],
    ['strip-ansi', {text:'\u001b[31mred\u001b[0m'}],
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
    assert.ok(tool.description?.length <= 260, tool.name + ': verbose description');
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
    { route:'/mcp/validators',prefix:'is-',expected:12,invoke:'is-email-safe',args:{email:'agent@example.com'},exclude:['generate-token','strip-ansi'] },
    { route:'/mcp/optimizers',prefix:'is-',expected:7,invoke:'strip-ansi',args:{text:'plain'},exclude:['is-email-safe','generate-token'] },
    { route:'/mcp/generators',prefix:'generate-',expected:13,invoke:'generate-slug',args:{text:'Sample Title'},exclude:['is-email-safe','strip-ansi'] },
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

// Keep public connector inventory stable after renaming optimizer operations.
test('same four endpoints, action-oriented optimizer names, no aliases or v2 routes', async () => {
  const optimizers = ['optimize-dataset','optimize-google-tag','minify-html','minify-js','minify-css','minify-prompt','strip-ansi'];
  const retired = ['is-dataset-minify','is-google-tag','is-html-minify','is-minify-js','is-minify-css','is-prompt-minify','is-strip-ansi'];
  for(const [route,count] of [['/mcp',32],['/mcp/optimizers',7]]) {
    const names=(await call('tools/list',{},route)).result.tools.map(x=>x.name);
    assert.equal(names.length,count);
    assert.equal(new Set(names).size,count);
    for(const n of optimizers)assert.ok(names.includes(n),route+' missing '+n);
    for(const n of retired)assert.ok(!names.includes(n),route+' retained '+n);
  }
  for(const route of ['/mcp/v2','/mcp/optimizers/v2']) {
    const response=await worker.fetch(new Request('https://agent-tools-mcp.yvan11.workers.dev'+route,{method:'GET'}),env,ctx);
    assert.equal(response.status,404,'unnecessary v2 endpoint retained: '+route);
  }
});

test('Generator output guidance and supported city mappings match MCP behavior', async () => {
  const available=(await call('tools/list',{},'/mcp/generators')).result.tools;
  assert.equal(available.length,13);
  const byName=Object.fromEntries(available.map(t=>[t.name,t]));

  const fixture=await call('tools/call',{name:'generate-card-number',arguments:{brand:'visa',seed:'demo'}},'/mcp/generators');
  assert.equal(fixture.result.isError,undefined);
  const card=JSON.parse(fixture.result.content[0].text);
  assert.deepEqual(Object.keys(card).sort(),['brand','cvc','expiry','number']);
  assert.match(card.number,/^4\d{15}$/);
  assert.match(card.expiry,/^\d{2}\/\d{2}$/);
  assert.match(card.cvc,/^\d{3}$/);

  const paletteResult=await call('tools/call',{name:'generate-color',arguments:{seed:'test-palette'}},'/mcp/generators');
  const palette=JSON.parse(paletteResult.result.content[0].text);
  assert.deepEqual(Object.keys(palette).sort(),['base','colors','scheme','textOnBase']);
  assert.equal(palette.scheme,'triadic');
  assert.equal(palette.colors.length,5);
  assert.ok(palette.colors.every(c=>/^#[0-9a-f]{6}$/.test(c)));

  const promptResult=await call('tools/call',{name:'generate-prompt',arguments:{template:'Hello {name}, meet {missing}',vars:{name:'Ada'}}},'/mcp/generators');
  assert.equal(JSON.parse(promptResult.result.content[0].text),'Hello Ada, meet');

  const ssn1=await call('tools/call',{name:'generate-ssn',arguments:{count:1,seed:'fixture'}},'/mcp/generators');
  const ssn2=await call('tools/call',{name:'generate-ssn',arguments:{count:2,seed:'fixture'}},'/mcp/generators');
  assert.equal(typeof JSON.parse(ssn1.result.content[0].text),'string');
  assert.equal(JSON.parse(ssn2.result.content[0].text).length,2);

  const cities=[
    {city:'Los Angeles',state:'CA',codes:[213,310,323,424,747,818]},
    {city:'San Francisco',state:'CA',codes:[415]},
    {city:'New York',state:'NY',codes:[212,332,646,718,917]},
    {city:'Houston',state:'TX',codes:[281,346,713,832]},
    {city:'Miami',state:'FL',codes:[305,786]}
  ];
  assert.deepEqual(new Set(byName['generate-phone-number'].inputSchema.properties.city.enum),new Set(cities.map(x=>x.city)));
  for(const item of cities){
    const args={city:item.city,state:item.state,count:3,seed:'fixture-city'};
    const answer=await call('tools/call',{name:'generate-phone-number',arguments:args},'/mcp/generators');
    assert.equal(answer.result.isError,undefined,item.city+': '+JSON.stringify(answer.result));
    const phones=JSON.parse(answer.result.content[0].text);
    assert.equal(phones.length,3);
    for(const number of phones){
      assert.match(number,/^\(\d{3}\) 555-01\d{2}$/,item.city+': '+number);
      assert.ok(item.codes.includes(Number(number.slice(1,4))),item.city+' unexpected area code');
    }
    const repeat=await call('tools/call',{name:'generate-phone-number',arguments:args},'/mcp/generators');
    assert.deepEqual(JSON.parse(repeat.result.content[0].text),phones,item.city+' non-reproducible');
    const cityOnly=await call('tools/call',{name:'generate-phone-number',arguments:{city:item.city,seed:'fixture-city'}},'/mcp/generators');
    assert.equal(cityOnly.result.isError,undefined,item.city+' without state fails');
  }
  const invalid=await call('tools/call',{name:'generate-phone-number',arguments:{city:'San Francisco',state:'NY'}},'/mcp/generators');
  assert.equal(invalid.result.isError,true,'mismatched city/state unexpectedly accepted');
  assert.match(invalid.result.content[0].text,/city does not match state/);
  assert.match(byName['generate-card-number'].description,/expiry, cvc/);
  assert.match(byName['generate-prompt'].description,/missing variables/);
  assert.match(byName['generate-ssn'].description,/count=1/);
  assert.match(byName['generate-color'].description,/triadic scheme/);
});


test('Optimizer documentation matches actual transformations and return formats', async () => {
  const tools=(await call('tools/list',{},'/mcp/optimizers')).result.tools;
  assert.equal(tools.length,7);
  const byName=Object.fromEntries(tools.map(t=>[t.name,t]));
  assert.match(byName['optimize-dataset'].description,/deduplicates rows and may drop mostly empty columns/);
  assert.match(byName['optimize-google-tag'].description,/original input if no G- ID exists/);
  assert.match(byName['minify-html'].description,/Returns an HTML string/);
  assert.match(byName['minify-js'].description,/Returns JavaScript text/);
  assert.match(byName['minify-prompt'].description,/filler phrases are not removed/);

  const run=async(name,args)=>{
    const response=await call('tools/call',{name,arguments:args},'/mcp/optimizers');
    assert.equal(response.result.isError,undefined,name+' unexpectedly failed');
    return JSON.parse(response.result.content[0].text);
  };

  const data=await run('optimize-dataset',{input:JSON.stringify([
    {id:1,name:'  Alice   Smith  ',empty:''},
    {id:1,name:'  Alice   Smith  ',empty:''}
  ]),format:'json'});
  assert.equal(typeof data,'string');
  const rows=JSON.parse(data);
  assert.equal(rows.length,1,'duplicate row not removed');
  assert.equal(rows[0].name,'Alice Smith');
  assert.equal(Object.hasOwn(rows[0],'empty'),false,'empty column not removed');

  const supplied='<script src="https://www.googletagmanager.com/gtag/js?id=G-ABC123"></script>';
  const tag=await run('optimize-google-tag',{html:supplied});
  assert.equal(typeof tag,'string');
  assert.match(tag,/script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-ABC123"/);
  assert.match(tag,/gtag\('config', 'G-ABC123'/);
  const untouched='<script src="https://example.test/analytics.js"></script>';
  assert.equal(await run('optimize-google-tag',{html:untouched}),untouched);

  const html=await run('minify-html',{html:'<div>   Hello   world  </div><!-- comment -->'});
  assert.equal(typeof html,'string');
  assert.match(html,/<div>/);
  assert.doesNotMatch(html,/<!-- comment -->/);
  const js=await run('minify-js',{code:'const answer = 42;'});
  assert.equal(typeof js,'string');
  assert.match(js,/const answer/);

  const prompt=await run('minify-prompt',{text:'  Please    summarize   this. \n\n\nAnd  this.   '});
  assert.equal(prompt,'Please summarize this. \n\nAnd this.');
  assert.match(prompt,/Please/,'filler unexpectedly removed');
});


test('Validator output contracts match both existing MCP endpoints', async () => {
  const booleans = [
    ['is-email-safe',{email:'founder@example.com'},{email:'invalid-email'}],
    ['is-iso-date-safe',{date:'2024-02-29'},{date:'2023-02-29'}],
    ['is-phone-e164',{phone:'00 66 81 234 5678'},{phone:'invalid-number'}],
    ['is-uuid-safe',{uuid:'550e8400-e29b-41d4-a716-446655440000',version:4},{uuid:'550e8400-e29b-41d4-a716-446655440000',version:1}],
    ['is-url-safe',{url:'https://example.com'},{url:'ftp://example.com'}]
  ];
  const structures = [
    ['is-card-safe',{number:'4111111111111111'},['ok','issues','brand','last4']],
    ['is-iban-safe',{iban:'GB82 WEST 1234 5698 7654 32'},['ok','issues']],
    ['is-ip-safe',{ip:'192.0.2.1'},['ok','version','issues']],
    ['is-json-safe',{json:'{"hello":true}'},['ok','issues','bytes','depth','keys','value']],
    ['is-password-safe',{password:'Dummy_123_Test!'},['ok','score','entropyBits','length','sets','reasons','suggestions']],
    ['is-us-tin-safe',{tin:'12-3456789'},['ok','type','issues']],
    ['is-vat-safe',{vat:'DE123456789'},['ok','country','issues']]
  ];
  const invoke = async (route,name,args) => {
    const response=await call('tools/call',{name,arguments:args},route);
    assert.equal(response.result.isError,undefined,name+' unexpected error: '+JSON.stringify(response.result));
    return JSON.parse(response.result.content[0].text);
  };
  for (const route of ['/mcp/validators','/mcp']) {
    const tools=(await call('tools/list',{},route)).result.tools;
    assert.equal(tools.length,route==='/mcp'?32:12);
    const docs=Object.fromEntries(tools.map(t=>[t.name,t]));
    for (const [name,accepted,rejected] of booleans) {
      assert.equal(await invoke(route,name,accepted),true,name+' valid case');
      assert.equal(await invoke(route,name,rejected),false,name+' invalid case');
      assert.match(docs[name].description,/Returns true/,name+' missing result explanation');
    }
    for (const [name,args,fields] of structures) {
      const result=await invoke(route,name,args);
      assert.equal(typeof result,'object',name);
      assert.ok(result!==null&&!Array.isArray(result),name);
      assert.equal(typeof result.ok,'boolean',name);
      assert.ok(Array.isArray(result.issues),name);
      for (const field of fields)assert.ok(Object.hasOwn(result,field),name+' missing '+field);
      assert.match(docs[name].description,/Returns \{ok,/,name+' missing object result explanation');
    }
    assert.equal(docs['is-phone-e164'].title,'Validate E.164 phone number syntax');
    assert.match(docs['is-phone-e164'].description,/not the normalized number/);
    assert.equal(await invoke(route,'is-phone-e164',{phone:'(668) 123-45678'}),true);
    const unknown=await invoke(route,'is-ip-safe',{ip:'unrecognized'});
    assert.equal(unknown.ok,false);
    assert.equal(unknown.version,null);
    assert.ok(Array.isArray(unknown.issues));
  }
});
