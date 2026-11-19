import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Studio — ClipStudio', description: 'Configure your short clips in ClipStudio.', openGraph: { title: 'Studio — ClipStudio', description: 'Configure your short clips in ClipStudio.' }, twitter: { card: 'summary', title: 'Studio — ClipStudio', description: 'Configure your short clips in ClipStudio.' } };
import Shell from '../../components/Shell'; import Studio from '../../components/Studio';
export default function Page(){return <Shell><Studio/></Shell>}
