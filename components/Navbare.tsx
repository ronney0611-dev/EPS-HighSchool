'use client'

import { images } from '@/src/config/documents'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { House, CircleUserRound, BookText, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Banner from './Banner'

const Navbare = () => {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const { data: session, status } = useSession();

    const isPaid = session?.user.isPaid;

    const navItems = [
        { href: '/', label: 'الواجهة', Icon: House },
        { href: '/profile', label: 'الحساب', Icon: CircleUserRound },
        { href: '/documents', label: 'الوثائق', Icon: BookText },
    ]

    const handleLogout = () => signOut({ callbackUrl: "/login" });

    return (
        <>
            {
                isPaid ? (
                    <></>
                ) : (
                    <Banner className="text-white bg-linear-to-r from-[#de5454] via-[#500303] to-black my-6" />
                )
            }

            <nav className="print:hidden w-full fixed z-100 bg-zinc-950/80 backdrop-blur-md text-white top-0 h-20 flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-zinc-800/80 shadow-lg shadow-black/40 transition-all">

                <Link href="/" className="transition-transform hover:scale-105">
                    <Image src={images.logo} priority width="157" height="40" className='lg:w-50 lg:h-30 object-contain mt-1' alt='EpsLogo' />
                </Link>

                {/* Desktop Menu */}
                <div className="hidden sm:flex items-center gap-8">
                    {navItems.map(({ href, label, Icon }) => {
                        const isActive = pathname === href
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`group relative flex flex-col items-center gap-1 transition-all duration-200 py-1 px-3 rounded-lg ${isActive
                                    ? 'text-red-500 font-bold scale-100'
                                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50 scale-95'
                                    }`}
                            >
                                <Icon className={`w-6 h-6 transition-transform duration-200 ${isActive ? 'stroke-[2.5px] drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'group-hover:scale-110'}`} />
                                <span className="">{label}</span>
                                {isActive && (
                                    <span className="absolute -bottom-2.5 w-8 h-0.5 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]" />
                                )}
                            </Link>
                        )
                    })}

                    {/* Dynamic Authentication UI Check */}
                    {status === 'loading' ? (
                        <div className="w-24 h-9 bg-zinc-800/80 animate-pulse rounded-full" />
                    ) : session ? (
                        /* Red Glow for Authenticated (Logout) */
                        <button
                            onClick={handleLogout}
                            className="cursor-pointer flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 transition-all duration-200 rounded-xl text-xs font-semibold shadow-lg shadow-red-500/10 backdrop-blur-md active:scale-95"
                        >
                            <LogOut size={15} />
                            تسجيل الخروج
                        </button>
                    ) : (
                        /* Blue Glow for Unauthenticated (Login) */
                        <Link href="/login">
                            <button
                                className="w-full sm:w-auto bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-500/50 font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl inline-block text-center transition-all duration-200 active:scale-95 shadow-lg shadow-blue-500/10 backdrop-blur-md"
                            >
                                سجل الدخول ←
                            </button>
                        </Link>
                    )}
                </div>

                {/* Mobile Menu */}
                <div className={`${open ? 'hidden' : 'flex flex-row pt-3 justify-between items-center'} absolute h-20 top-0 left-0 w-full bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 text-white z-10 shadow-xl px-6 text-sm md:hidden`} >
                    {navItems.map(({ href, Icon, label }) => {
                        const isActive = pathname === href
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`transition-all flex flex-col items-center gap-0.5 duration-150 ${isActive ? 'text-red-500 font-bold scale-105' : 'text-zinc-400 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-[11px]">{label}</span>
                            </Link>
                        )
                    })}

                    {status !== 'loading' && (
                        session ? (
                            /* Red Glow Mobile Logout */
                            <button
                                onClick={handleLogout}
                                className="cursor-pointer px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition rounded-xl flex items-center gap-1 font-medium text-xs shadow-lg shadow-red-500/10 backdrop-blur-md"
                            >
                                <LogOut size={13} />
                                خروج
                            </button>
                        ) : (
                            /* Blue Glow Mobile Login */
                            <Link href="/login">
                                <button
                                    className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold text-xs px-4 py-2 rounded-xl inline-block text-center transition-all duration-200 active:scale-95 shadow-lg shadow-blue-500/10 backdrop-blur-md"
                                >
                                    سجل الدخول ←
                                </button>
                            </Link>
                        )
                    )}
                </div>

            </nav>

        </>
    )
}

export default Navbare