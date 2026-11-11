import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Navbare from "@/components/Navbare";
import Providers from "@/components/Providers";
import PwaInstall from "@/components/PwaInstall";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.epsdz.com"),
  title: "EPS DZ | منصة وثائق التربية البدنية (Algeria)",
  description:
    "توليد جميع الوثائق البيداغوجية والخطط السنوية، استيراد قوائم التلاميذ من إكسل (Excel)، حساب معدلات الفروض والاختبارات تلقائياً، وتسيير شامل ومبسط لجميع الأطوار التعليمية في ثوانٍ وبنقرة واحدة.",
  keywords: [
    "eps",
    "epsdz",
    "eps dz",
    "eps algeria",
    "eps algérie",
    "التربية البدنية والرياضية",
    "وثائق بيداغوجية eps",
    "مذكرات التربية البدنية",
    "وثائق التربية البدنية",
    "وثائق التربية البدنية والرياضية",
    "وثائق التربية البدنية الجزائر",
    "مذكرات التربية البدنية الجزائر",
    "fich techniques",
    "fiches techniques algeria",
    "مقاطع تعلمية",
  ],
  verification: {
    google: "Ql1sCrqcMXtkK4_qKKg2trguLPb-_HrpYw2vDo2dABs",
  },
  alternates: {
    canonical: "https://www.epsdz.com",
  },
  openGraph: {
    title: "EPSDZ - برنامج وثائق التربية البدنية",
    description: " جميع الوثائق البيداغوجية جاهزة للطباعة وبنقرة واحدة.",
    images: ["/images/preview.png"],
    locale: "ar_DZ",
    type: "website",
    url: "https://www.epsdz.com",
  },
  // app (PWA): name and icon on the phone, full screen on iPhone
  applicationName: "EPS DZ",
  appleWebApp: {
    capable: true,
    title: "EPS DZ",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "EPS DZ",
    alternateName: ["EPS Algérie", "EPS", "epsdz"],
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    url: "https://www.epsdz.com",
    description:
      "منصة EPS DZ لتوليد جميع الوثائق البيداغوجية لأساتذة التربية البدنية والرياضية لجميع الاطوار التعليمية في الجزائر.",
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "teacher",
    },
  };

  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col mt-20 bg-black text-white">
        <Providers>
          <Navbare />
          {children}
          <Footer />
          <PwaInstall />
        </Providers>
      </body>
    </html>
  );
}
