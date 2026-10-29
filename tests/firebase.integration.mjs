import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const require=createRequire(import.meta.url);
const wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=wranglerRequire('miniflare');
const {build}=wranglerRequire('esbuild');
await mkdir('.sites-runtime',{recursive:true});
await build({stdin:{contents:`export {GET as catalogGet} from './app/api/catalog/route';export {GET as adminGet,PUT as adminPut,PATCH as adminPatch} from './app/api/admin/route';export {POST as orderPost} from './app/api/orders/route';export {POST as uploadPost} from './app/api/uploads/route';export {GET as mediaGet} from './app/api/media/[key]/route';`,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:'.sites-runtime/test-api.mjs',plugins:[{name:'test-env',setup(b){b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'env',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export const env = globalThis.TEST_ENV;'}))}}]});
const mf=new Miniflare({modules:true,script:'export default {fetch(){return new Response("test")}}',d1Databases:['DB'],r2Buckets:['BUCKET']});
try{
 const DB=await mf.getD1Database('DB'),BUCKET=await mf.getR2Bucket('BUCKET');
 const migration=await readFile('drizzle/0000_yellow_devos.sql','utf8');
 for(const statement of migration.split('--> statement-breakpoint'))await DB.prepare(statement.trim()).run();
 globalThis.TEST_ENV={DB,BUCKET};
 const documents=new Map();let tick=0;
 const nativeFetch=globalThis.fetch;
 globalThis.fetch=async(input,options={})=>{
  const url=String(input);
  if(url.startsWith('https://identitytoolkit.googleapis.com/')){
   const token=JSON.parse(options.body).idToken;
   return token==='owner-token'?Response.json({users:[{localId:'zjTXYYxb0rgW4AUPjL9NkuF0gD03'}]}):token==='other-token'?Response.json({users:[{localId:'other-user'}]}):Response.json({error:{}},{status:400});
  }
  if(!url.startsWith('https://firestore.googleapis.com/'))return nativeFetch(input,options);
  const path=new URL(url).pathname;
  if(path.endsWith(':runQuery'))return Response.json([...documents.entries()].filter(([key])=>key.includes('/orders/')).map(([,document])=>({document})));
  if(path.endsWith(':commit')){
   const writes=JSON.parse(options.body).writes;
   for(const w of writes){const old=documents.get(w.update.name);if(w.currentDocument?.exists===false&&old)return Response.json({error:{status:'ALREADY_EXISTS'}},{status:409});if(w.currentDocument?.updateTime&&old?.updateTime!==w.currentDocument.updateTime)return Response.json({error:{status:'FAILED_PRECONDITION'}},{status:409})}
   for(const w of writes){const old=documents.get(w.update.name),stamp=new Date(Date.now()+(++tick)*10).toISOString();const f=w.updateMask?{...old.fields,...w.update.fields}:w.update.fields;for(const t of w.updateTransforms||[])f[t.fieldPath]={timestampValue:stamp};documents.set(w.update.name,{name:w.update.name,fields:f,updateTime:stamp})}
   return Response.json({writeResults:[]});
  }
  const key=path.replace(/^\/v1\//,'');const doc=documents.get(key);return doc?Response.json(doc):Response.json({error:{status:'NOT_FOUND'}},{status:404});
 };
 globalThis.RESTORE_FETCH=()=>{globalThis.fetch=nativeFetch};
 const api=await import(pathToFileURL(process.cwd()+'/.sites-runtime/test-api.mjs'));
 const auth={Authorization:'Bearer owner-token'};
 function req(path,method='GET',data,headers={}){return new Request('https://test.local'+path,{method,headers:{Origin:'https://test.local',...(data?{'Content-Type':'application/json'}:{}),...headers},body:data?JSON.stringify(data):undefined})}
 assert.equal((await api.adminGet(req('/api/admin'))).status,401);
 assert.equal((await api.adminGet(req('/api/admin','GET',null,{Authorization:'Bearer other-token'}))).status,403);
 let state=await (await api.adminGet(req('/api/admin','GET',null,auth))).json();
 state.catalog.whatsapp='19999999999';state.catalog.name='BESTCAR TEST';state.catalog.products[0].price=45.55;state.catalog.products[1].active=false;
 let res=await api.adminPut(req('/api/admin','PUT',state,auth));assert.equal(res.status,200);
 assert.equal((await api.adminPut(req('/api/admin','PUT',state,auth))).status,409);
 assert.equal((await api.adminPut(req('/api/admin','PUT',{...state,catalog:{...state.catalog,whatsapp:'abc'}},auth))).status,400);
 const pub=await (await api.catalogGet()).json();assert.equal(pub.name,'BESTCAR TEST');assert(!pub.products.some(p=>p.id==='brake'));
 const payload={id:crypto.randomUUID(),name:'Test customer',phone:'+19999999999',vehicle:'Test vehicle 2026',details:'Integration test only',language:'ar',items:[{id:'oil',quantity:2,price:.01}]};
 assert.equal((await api.orderPost(req('/api/orders','POST',{...payload,items:[{id:'brake',quantity:1}]}))).status,409);
 assert.equal((await api.orderPost(req('/api/orders','POST',{...payload,items:[{id:'oil',quantity:-1}]}))).status,400);
 assert.equal((await api.orderPost(req('/api/orders','POST',payload,{Origin:'https://other.local'}))).status,403);
 res=await api.orderPost(req('/api/orders','POST',payload));assert.equal(res.status,201);const order=await res.json();assert.equal(order.total,91.1);assert(order.whatsappUrl.startsWith('https://wa.me/19999999999?text='));assert(decodeURIComponent(order.whatsappUrl).includes(order.reference));
 const repeated=await api.orderPost(req('/api/orders','POST',payload));assert.equal(repeated.status,200);
 state=await (await api.adminGet(req('/api/admin','GET',null,auth))).json();assert.equal(state.orders.length,1);assert.equal(state.orders[0].items[0].price,45.55);
 const saved=state.orders[0];res=await api.adminPatch(req('/api/admin','PATCH',{id:saved.id,status:'completed',notes:'Test fulfilled',updated:saved.updated,version:saved.version},auth));assert.equal(res.status,200);
 assert.equal((await api.adminPatch(req('/api/admin','PATCH',{id:saved.id,status:'completed',notes:'Stale',updated:saved.updated,version:saved.version},auth))).status,409);
 assert.equal((await api.adminPatch(req('/api/admin','PATCH',{id:saved.id,status:'paid',notes:'',updated:saved.updated,version:saved.version},auth))).status,400);
 state=await (await api.adminGet(req('/api/admin','GET',null,auth))).json();assert.equal(state.orders[0].status,'completed');
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=','base64');
 res=await api.uploadPost(new Request('https://test.local/api/uploads',{method:'POST',headers:{...auth,Origin:'https://test.local','Content-Type':'image/png'},body:png}));assert.equal(res.status,200);const img=await res.json();
 const imageResponse=await api.mediaGet(req(img.url),{params:Promise.resolve({key:img.url.split('/').pop()})});assert.equal(imageResponse.status,200);assert.equal(imageResponse.headers.get('content-type'),'image/png');
 assert.equal((await api.uploadPost(new Request('https://test.local/api/uploads',{method:'POST',headers:{...auth,Origin:'https://test.local','Content-Type':'image/svg+xml'},body:'<svg/>'}))).status,400);
 assert.equal((await api.uploadPost(new Request('https://test.local/api/uploads',{method:'POST',headers:{Origin:'https://test.local','Content-Type':'image/png'},body:png}))).status,401);
 console.log('PASS: Firebase token owner checks, validation, catalog adapter, hidden products, revision conflicts, server pricing, order idempotency, WhatsApp, completion and R2 image access. Firebase network responses are mocked; deployed Firestore rules still need a live verification.');
}finally{globalThis.RESTORE_FETCH?.();await mf.dispose();delete globalThis.TEST_ENV;delete globalThis.RESTORE_FETCH}
