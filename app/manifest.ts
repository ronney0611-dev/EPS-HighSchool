// app/manifest.ts — makes epsdz.com installable as an app (Next.js serves it at /manifest.webmanifest)
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "EPS DZ — وثائق التربية البدنية",
    short_name: "EPS DZ",
    description: "جميع الوثائق البيداغوجية لأساتذة التربية البدنية والرياضية، جاهزة للطباعة وبنقرة واحدة.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    dir: "rtl",
    lang: "ar",
    background_color: "#000000",
    theme_color: "#000000",
    categories: ["education", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
