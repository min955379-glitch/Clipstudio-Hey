import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Support — ClipStudio', description: 'Find answers and support for ClipStudio.', openGraph: { title: 'Support — ClipStudio', description: 'Find answers and support for ClipStudio.' }, twitter: { card: 'summary', title: 'Support — ClipStudio', description: 'Find answers and support for ClipStudio.' } };
import Shell from '../../components/Shell'; import OtherPage from '../../components/OtherPage';
export default function Page(){return <Shell><OtherPage kind="support"/></Shell>}
