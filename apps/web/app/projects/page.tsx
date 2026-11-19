import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Projects — ClipStudio', description: 'Explore your ClipStudio project workspace.', openGraph: { title: 'Projects — ClipStudio', description: 'Explore your ClipStudio project workspace.' }, twitter: { card: 'summary', title: 'Projects — ClipStudio', description: 'Explore your ClipStudio project workspace.' } };
import Shell from '../../components/Shell'; import OtherPage from '../../components/OtherPage';
export default function Page(){return <Shell><OtherPage kind="projects"/></Shell>}
