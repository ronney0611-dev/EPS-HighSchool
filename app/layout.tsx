import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Navbare from "@/components/Navbare";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.epsdz.com'),
  title: "وثائق التربية البدنية | EPS DZ",
  description: 'توليد جميع الوثائق البيداغوجية والخطط السنوية، استيراد قوائم التلاميذ من إكسل (Excel)، حساب معدلات الفروض والاختبارات تلقائياً، وتسيير شامل ومبسط لجميع الأطوار التعليمية في ثوانٍ وبنقرة واحدة.',
  verification: {
    google: 'Ql1sCrqcMXtkK4_qKKg2trguLPb-_HrpYw2vDo2dABs',
  },
  openGraph: {
    title: "EPS DZ - برنامج وثائق التربية البدنية",
    description: "إنشاء جميع الوثائق البيداغوجية في ثوانٍ",
    images: ["/images/preview.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full  flex flex-col mt-20 bg-black text-white">
        <Providers>
          <Navbare />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
