import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Сборка в standalone: Next кладёт в .next/standalone только те
  // модули, которые реально нужны в рантайме. Без этого в образ
  // пришлось бы тащить весь node_modules.
  output: "standalone",

  images: {
    // images.domains объявлен устаревшим в Next 15 — remotePatterns точнее,
    // потому что ограничивает ещё и протокол с путём
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "flagcdn.com" },
      // MinIO: отдаёт фотографии аквариумов по подписанным ссылкам.
      // Новый сервер — s3.169-58-147-171.sslip.io (за Traefik, только https).
      // Старый хост оставлен: в базе лежат ссылки, выданные им.
      { protocol: "https", hostname: "s3.169-58-147-171.sslip.io" },
      { protocol: "http", hostname: "194.163.151.112" },
      { protocol: "https", hostname: "194.163.151.112" },
    ],
    // AVIF/WebP вместо исходных JPEG/PNG — обычно в 2–4 раза меньше вес
    formats: ["image/avif", "image/webp"],
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24,
  },

  // Баррельные импорты (react-icons, lucide-react, date-fns) тянут в бандл
  // весь пакет ради пары иконок. Здесь Next переписывает их на точечные.
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "react-icons",
      "date-fns",
      "recharts",
      "motion",
      "zustand",
    ],
  },

  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
};

export default withNextIntl(nextConfig);
