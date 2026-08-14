import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Finance Manager',
    short_name: 'FinMgr',
    description: 'Manage your finances efficiently.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000', // Black, White, Dark Blue are requirements, we'll use black as theme
    icons: [
      {
        src: '/icon.svg',
        sizes: '192x192 512x512 any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      }
    ],
  };
}
