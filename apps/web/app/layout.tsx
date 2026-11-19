import type { Metadata } from 'next';
import './style.css';
export const metadata: Metadata = { title: 'ClipStudio — Make every moment count', description: 'A free workspace for turning long videos into short stories.', metadataBase: new URL('https://clipstudio-hey.vercel.app'), openGraph: { title: 'ClipStudio — Make every moment count', description: 'A free workspace for turning long videos into short stories.', type: 'website' }, twitter: { card: 'summary', title: 'ClipStudio — Make every moment count', description: 'A free workspace for turning long videos into short stories.' } };
export const viewport = { themeColor: '#090b0f' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html> }
