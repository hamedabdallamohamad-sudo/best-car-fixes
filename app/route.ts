import { storefront } from './storefront';
export function GET(){return new Response(storefront,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
