import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AquaDaddy Application',
    short_name: 'AquaDaddy App',
    description: 'All about aquariumistics',
    start_url: '/',
    display: 'standalone',
    background_color: '#00ebff',
    theme_color: '#00ebff ',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}