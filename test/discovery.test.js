import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { servePublic } from '../src/public.js';
const host = 'https://agent-tools-mcp.yvan11.workers.dev';
test('Official registry metadata matches remote server', () => {
 const manifest=JSON.parse(readFileSync(new URL('../server.json',import.meta.url),'utf8'));
 assert.equal(manifest.name,'io.github.why-see/agent-tools-mcp');
 assert.equal(manifest.version,'1.1.0');
 assert.deepEqual(manifest.remotes,[{type:'streamable-http',url:host+'/mcp'}]);
 assert.equal(manifest.repository.source,'github');
 const glama=JSON.parse(readFileSync(new URL('../glama.json',import.meta.url),'utf8'));
 assert.deepEqual(glama.maintainers,['why-see']);
});
test('Public docs and crawler resources',async()=>{
 for(const path of ['/','/tools','/robots.txt','/llms.txt','/sitemap.xml']){
   const res=servePublic(new Request(host+path));
   assert.equal(res?.status,200,path);
   assert.equal(res.headers.get('X-Content-Type-Options'),'nosniff');
   assert.ok((await res.text()).length>20,path);
 }
 const tools=await servePublic(new Request(host+'/tools')).text();
 for(const n of ['generate-slug','is-email-safe','is-minify-css']) assert.ok(tools.includes(n));
 assert.equal(servePublic(new Request(host+'/health')),null);
 assert.equal(servePublic(new Request(host+'/tools',{method:'HEAD'})).status,200);
});
