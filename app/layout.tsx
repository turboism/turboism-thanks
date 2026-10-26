import type { Metadata } from 'next';
import { brandFontVariables } from '@/brand/fonts';
import './globals.css';
import '@/brand/brand.css';
import '@/brand/typography.css';
import { AnnouncementBanner } from '@/components/announcement-banner';
export const metadata:Metadata={metadataBase:new URL('https://turboism.dev'),title:'Turboism Thanks',description:'A public record of gratitude to the people who have shaped Turboism.',alternates:{canonical:'/thanks'},openGraph:{title:'Turboism Thanks',description:'A public record of gratitude to the people who have shaped Turboism.',url:'https://turboism.dev/thanks',siteName:'Turboism Thanks',type:'website'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en" className={`${brandFontVariables}`}><body><AnnouncementBanner/>{children}</body></html>;}
