import type { MetadataRoute } from 'next';
export default function sitemap(): MetadataRoute.Sitemap { return ['', '/studio', '/projects', '/templates', '/brand-kit', '/settings', '/support'].map(path => ({url: `https://clipstudio-hey.vercel.app${path}`})); }
