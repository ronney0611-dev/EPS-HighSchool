import type { Metadata } from 'next'
import AboutUs from '@/components/AboutUs'

export const metadata: Metadata = {
    title: 'من نحن | EPS DZ - بن حمادة محمد',
    description: 'EPS DZ منصة رقمية للأساتذة أنشأها بن حمادة محمد، أستاذ التربية البدنية والرياضية ومطور Full-Stack.',
    authors: [{ name: 'بن حمادة محمد', url: 'https://epsdz.com' }],
    openGraph: {
        title: 'EPS DZ - من نحن',
        description: 'منصة رقمية بناها أستاذ تربية بدنية جزائري لخدمة زملائه.',
        url: 'https://epsdz.com/about',
        siteName: 'EPS DZ',
        locale: 'ar_DZ',
        type: 'profile',
    },
}

export default function AboutPage() {
    return <AboutUs />
}