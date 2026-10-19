import { servePublic } from './public.js';
import { toolDocs } from './tool-metadata.js';
import { McpServer } from '@modelcontextprotocol/server';
import { createMcpHandler } from 'agents/mcp/server';
import { z } from 'zod';

// Vendored, MIT-licensed source modules from Yvancg/validators,
// Yvancg/optimizers and Yvancg/generators. See UPSTREAM.md.
import { validateCard } from './upstream/validators/is-card-safe/card.js';
import { isEmailSafe } from './upstream/validators/is-email-safe/email.js';
import { isIbanSafe } from './upstream/validators/is-iban-safe/iban.js';
import { isIsoDateSafe } from './upstream/validators/is-iso-date-safe/date.js';
import { isIpSafe } from './upstream/validators/is-ip-safe/ip.js';
import { isJsonSafe } from './upstream/validators/is-json-safe/json.js';
import { validatePassword } from './upstream/validators/is-password-safe/password.js';
import { isPhoneE164 } from './upstream/validators/is-phone-e164/phone.js';
import { isUuidSafe } from './upstream/validators/is-uuid-safe/uuid.js';
import { isUrlSafe } from './upstream/validators/is-url-safe/url.js';
import { validateTIN } from './upstream/validators/is-us-tin-safe/tin.js';
import { isVatSafe } from './upstream/validators/is-vat-safe/vat.js';
import { optimizeDataset } from './upstream/optimizers/is-dataset-minify/dataset.js';
import { optimizeGoogleTag } from './upstream/optimizers/is-google-tag/gtag.js';
import { minifyHTML } from './upstream/optimizers/is-html-minify/html.js';
import { minifyJS, minifyCSS } from './upstream/optimizers/is-minify/minify.js';
import { promptMinify } from './upstream/optimizers/is-prompt-minify/prompt.js';
import { stripAnsi } from './upstream/optimizers/is-strip-ansi/strip.js';
import { generateAvatar } from './upstream/generators/generate-avatar/avatar.js';
import { generateCard } from './upstream/generators/generate-card-number/card.js';
import { generatePalette } from './upstream/generators/generate-color/color.js';
import { generateDataset } from './upstream/generators/generate-dataset/dataset.js';
import { rng, rows as fakeRows, user as fakeUser, company as fakeCompany, address as fakeAddress } from './upstream/generators/generate-fake-data/fake.js';
import { generateHash } from './upstream/generators/generate-hash/hash.js';
import { generateLorem } from './upstream/generators/generate-lorem/lorem.js';
import { generatePassword } from './upstream/generators/generate-password/password.js';
import { generatePhoneNumbers } from './upstream/generators/generate-phone-number/phone.js';
import { generatePrompt } from './upstream/generators/generate-prompt/prompt.js';
import { generateSlug } from './upstream/generators/generate-slug/slug.js';
import { generateSSN } from './upstream/generators/generate-ssn/ssn.js';
import { generateToken } from './upstream/generators/generate-token/token.js';

const text = z.string().max(4096);
const short = z.string().max(256);
const seed = z.string().max(128).optional();
const count = z.number().int().min(1).max(16).optional();
const tinyCount = z.number().int().min(1).max(8).optional();
const object = z.record(z.string().max(64), z.unknown()).optional();
const optional = (x) => x.optional();

function toolResult(value) {
  const output = JSON.stringify(value === undefined ? null : value);
  if (output.length > 32_768) {
    return { isError: true, content: [{ type: 'text', text: 'Output limit exceeded (32 KiB). Reduce count or input size.' }] };
  }
  return { content: [{ type: 'text', text: output }] };
}
function createServer(category = 'all') {
  const mcp = new McpServer({ name: category === 'all' ? 'agent-tools-mcp' : 'agent-tools-' + category + '-mcp', version: '1.1.0' });
  function register(name, group, description, inputSchema, execute) {
    if (category !== 'all' && category !== group) return;
    const doc = toolDocs[name];
    if (!doc) throw new Error('Missing tool documentation: ' + name);
    // Put parameter meanings into the Zod schemas so clients see them in tools/list.
    // Preserve required/optional status and validation behavior.
    const documentedInputs = Object.fromEntries(
      Object.entries(inputSchema).map(([key, schema]) => {
        if (!doc.params[key]) throw new Error('Missing parameter documentation: ' + name + '.' + key);
        return [key, schema.describe(doc.params[key])];
      })
    );
    mcp.registerTool(name, {
      title: doc.title,
      description: description + ' ' + doc.usage + ' ' + doc.result,
      inputSchema: documentedInputs,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    }, async (args) => {
      try { return toolResult(await execute(args)); }
      catch (error) {
        return { isError: true, content: [{ type: 'text', text: error instanceof Error ? error.message.slice(0, 300) : 'Tool execution failed' }] };
      }
    });
  }
  const v = (name, description, schema, fn) => register(name, 'validators', description, schema, fn);
  const o = (name, description, schema, fn) => register(name, 'optimizers', description, schema, fn);
  const g = (name, description, schema, fn) => register(name, 'generators', description, schema, fn);

  // 12 validators: no third-party verification or external calls.
  v('is-card-safe','Luhn/brand format only. Do not submit real payment card details.',{number:short},a=>validateCard(a.number));
  v('is-email-safe','ASCII email format, without mailbox verification.',{email:short},a=>isEmailSafe(a.email));
  v('is-iban-safe','IBAN format, country length and checksum against the bundled registry.',{iban:short},a=>isIbanSafe(a.iban));
  v('is-iso-date-safe','Canonical Gregorian date YYYY-MM-DD.',{date:short},a=>isIsoDateSafe(a.date));
  v('is-ip-safe','Validate IPv4 or IPv6 without lookup.',{ip:short},a=>isIpSafe(a.ip));
  v('is-json-safe','Parse JSON using upstream safety limits.',{json:text},a=>isJsonSafe(a.json,{maxBytes:8192,maxDepth:32,maxKeys:500}));
  v('is-password-safe','Evaluate strength; do not submit real passwords to an external MCP endpoint.',{password:short},a=>validatePassword(a.password));
  v('is-phone-e164','International phone format with normalization.',{phone:short},a=>isPhoneE164(a.phone));
  v('is-uuid-safe','Canonical UUID, optionally filter by version.',{uuid:short,version:optional(z.number().int().min(1).max(8))},a=>isUuidSafe(a.uuid,{version:a.version}));
  v('is-url-safe','Conservative HTTP(S) URL syntax, no HTTP request.',{url:text},a=>isUrlSafe(a.url));
  v('is-us-tin-safe','US EIN/SSN/ITIN format only; do not submit real identifiers.',{tin:short},a=>validateTIN(a.tin));
  v('is-vat-safe','EU VAT country-specific format only.',{vat:short},a=>isVatSafe(a.vat));

  // Six original optimizer modules, with separate JS and CSS operations.
  o('optimize-dataset','Clean or minify JSON/JSONL/CSV data, max 4096 input characters.',{input:text,format:optional(z.enum(['auto','json','jsonl','csv']))},a=>optimizeDataset(a.input,{format:a.format||'auto'}));
  o('optimize-google-tag','Rewrite existing Google Analytics tag snippet; review output before production.',{html:text},a=>optimizeGoogleTag(a.html));
  o('minify-html','Conservative HTML minification, review results before production.',{html:text},a=>minifyHTML(a.html));
  o('minify-js','Conservative JS minification. Not a parser. Regression-test minified code.',{code:text},a=>minifyJS(a.code));
  o('minify-css','Conservative CSS minification, review results before production.',{code:text},a=>minifyCSS(a.code));
  o('minify-prompt','Compress prompt whitespace and filler; semantic equivalence not guaranteed.',{text:text},a=>promptMinify(a.text));
  o('strip-ansi','Strip ANSI escape sequences.',{text:text},a=>stripAnsi(a.text));

  // 13 generators, all local deterministic/synthetic transforms or WebCrypto.
  g('generate-avatar','Generate SVG placeholder avatar, max 256px.',{text:optional(short),pattern:optional(z.enum(['initials','blocks','circles','random'])),size:optional(z.number().int().min(32).max(256)),seed},a=>generateAvatar(a));
  g('generate-card-number','Generate Luhn-valid synthetic TEST card data. Never use as real payment credentials.',{brand:optional(z.enum(['visa','mastercard','amex','discover'])),seed},a=>generateCard(a));
  g('generate-color','Generate color palette.',{base:optional(short),scheme:optional(z.enum(['complementary','triadic','tetradic','analogous','monochrome','random'])),count:optional(z.number().int().min(1).max(12)),format:optional(z.enum(['hex','rgb','hsl'])),seed},a=>generatePalette(a));
  g('generate-dataset','Generate up to 8 rows of synthetic JSON/JSONL/CSV.',{count:tinyCount,format:optional(z.enum(['json','jsonl','csv'])),seed,schema:object},a=>generateDataset({...a,count:a.count??3}));
  g('generate-fake-data','Generate up to 8 synthetic users, companies or addresses.',{kind:z.enum(['user','company','address','rows']),count:tinyCount,seed},a=>{
    const R=rng(a.seed||'sample');
    if(a.kind==='rows')return fakeRows(a.count||3,a.seed||'sample');
    const f={user:fakeUser,company:fakeCompany,address:fakeAddress}[a.kind];
    return Array.from({length:a.count||1},()=>f(R));
  });
  g('generate-hash','Compute SHA-256 or legacy MD5 hash; do not hash passwords here.',{text:text,algo:optional(z.enum(['sha-256','md5']))},a=>generateHash(a.text,a.algo||'sha-256'));
  g('generate-lorem','Generate bounded lorem ipsum text.',{units:optional(z.enum(['words','sentences','paragraphs'])),count:tinyCount,seed},a=>generateLorem({...a,count:a.count??3}));
  g('generate-password','Generate a random password with WebCrypto. Never use seeded outputs as secrets.',{length:optional(z.number().int().min(8).max(256)),symbols:optional(z.boolean()),seed},a=>generatePassword(a));
  g('generate-phone-number','Generate up to 8 fictional US-format phone numbers.',{state:optional(z.enum(['CA','NY','TX','FL'])),city:optional(z.enum(['Los Angeles','San Francisco','New York','Houston','Miami'])),count:tinyCount,seed},a=>generatePhoneNumbers({...a,count:a.count??1}));
  g('generate-prompt','Fill a prompt template with provided variables.',{type:optional(z.enum(['text','code','image'])),template:text,vars:object,seed},a=>generatePrompt(a.type||'text',a.template,a.vars||{},{seed:a.seed}));
  g('generate-slug','Produce Unicode-aware slug from a title.',{text:text,maxLength:optional(z.number().int().min(1).max(160))},a=>generateSlug(a.text,{maxLength:a.maxLength??null}));
  g('generate-ssn','Generate synthetic US SSN-style fixtures only, up to 8.',{count:tinyCount,formatted:optional(z.boolean()),valid:optional(z.boolean()),seed},a=>generateSSN({...a,count:a.count??1}));
  g('generate-token','Generate tokens/UUIDs with WebCrypto; never use deterministic seed for real secrets.',{type:z.enum(['uuid','hex','base64','numeric']),length:optional(z.number().int().min(1).max(256)),seed},a=>generateToken(a));
  return mcp;
}
// Category-scoped public endpoints reuse the same audited tool implementations.
// Preserve the four published MCP endpoint URLs and their tool counts.
const endpointGroups = [
  ['/mcp', 'all'],
  ['/mcp/validators', 'validators'],
  ['/mcp/optimizers', 'optimizers'],
  ['/mcp/generators', 'generators'],
];
const handlers = Object.fromEntries(
  endpointGroups.map(([route, group]) =>
    [route, createMcpHandler(() => createServer(group), { route, legacy: 'stateless' })])
);
function matchesBearer(actual, token) {
  const target='Bearer '+token;
  if(actual.length!==target.length)return false;
  let diff=0;for(let i=0;i<actual.length;i++)diff|=actual.charCodeAt(i)^target.charCodeAt(i);
  return diff===0;
}
export default {
  async fetch(request, env, ctx) {
    const docs=servePublic(request);
    if(docs)return docs;
    const path=new URL(request.url).pathname;
    if(path==='/health'&&request.method==='GET')return Response.json({status:'ok',service:'agent-tools-mcp',tools:32,transport:'streamable-http'},{headers:{'Cache-Control':'no-store'}});
    if(!Object.hasOwn(handlers,path))return new Response('Not found',{status:404});
    if(env.MCP_API_TOKEN&&!matchesBearer(request.headers.get('Authorization')||'',env.MCP_API_TOKEN))
      return new Response('Unauthorized',{status:401,headers:{'WWW-Authenticate':'Bearer'}});
    if(Number(request.headers.get('content-length')||0)>8192)return new Response('Request too large',{status:413});
    if(request.method==='POST'){
      const body=await request.clone().text();
      if(body.length>8192)return new Response('Request too large',{status:413});
    }
    if(!env.MCP_RATE_LIMITER)return new Response('Rate limit is not configured',{status:503});
    const allowed=await env.MCP_RATE_LIMITER.limit({key:request.headers.get('CF-Connecting-IP')||'unidentified'});
    if(!allowed.success)return new Response('Too many requests',{status:429,headers:{'Retry-After':'60'}});
    return handlers[path](request,env,ctx);
  }
};
