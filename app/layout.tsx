import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'BESTCAR FIXES | لوحة التحكم',description:'إدارة موقع وخدمات ومنتجات وطلبات BESTCAR FIXES'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ar" dir="rtl"><body>{children}</body></html>}
