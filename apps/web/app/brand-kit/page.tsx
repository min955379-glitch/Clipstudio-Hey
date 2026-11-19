import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Preferences — ClipStudio', description: 'Set your ClipStudio caption and language preferences.', openGraph: { title: 'Preferences — ClipStudio', description: 'Set your ClipStudio caption and language preferences.' }, twitter: { card: 'summary', title: 'Preferences — ClipStudio', description: 'Set your ClipStudio caption and language preferences.' } };
import Shell from '../../components/Shell'; import OtherPage from '../../components/OtherPage';
export default function Page(){return <Shell><OtherPage kind="brand-kit"/></Shell>}
