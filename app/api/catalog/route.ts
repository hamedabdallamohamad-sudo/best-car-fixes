import { api,json,loadCatalog } from '../../server';
export const dynamic='force-dynamic';
export function GET(){return api(async()=>{const {catalog}=await loadCatalog();return json({...catalog,banners:catalog.banners.filter(b=>b.active),products:catalog.products.filter(p=>p.active),services:catalog.services.filter(s=>s.active)})})}
