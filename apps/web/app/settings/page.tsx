import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Settings — ClipStudio', description: 'Manage your local workspace and AI connection information.', openGraph: { title: 'Settings — ClipStudio', description: 'Manage your local workspace and AI connection information.' }, twitter: { card: 'summary', title: 'Settings — ClipStudio', description: 'Manage your local workspace and AI connection information.' } };
import Shell from '../../components/Shell'; import OtherPage from '../../components/OtherPage';
export default function Page(){return <Shell><OtherPage kind="settings"/></Shell>}
