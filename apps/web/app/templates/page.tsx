import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Templates — ClipStudio', description: 'Preview caption styles in ClipStudio.', openGraph: { title: 'Templates — ClipStudio', description: 'Preview caption styles in ClipStudio.' }, twitter: { card: 'summary', title: 'Templates — ClipStudio', description: 'Preview caption styles in ClipStudio.' } };
import Shell from '../../components/Shell'; import OtherPage from '../../components/OtherPage';
export default function Page(){return <Shell><OtherPage kind="templates"/></Shell>}
