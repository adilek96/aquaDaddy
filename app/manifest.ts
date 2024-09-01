import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AquaDaddy',
    short_name: 'AquaDaddy',
    description: 'All about aquariumistics',
    start_url: '/',
    display: 'fullscreen',
    background_color: '#00ebff',
    theme_color: '#00ebff',
    icons: [
      {
        src: "/icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png"
      },
      {
        src: "/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png"
      },
      {
        src: "/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png"
      },
      {
        src: "/icons/icon-152x152.png",
        sizes: "152x152",
        type: "image/png"
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icons/icon-310x310.png",
        sizes: "310x310",
        type: "image/png"
      },
   
    ],
  }
}