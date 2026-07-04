'use client'

import { images } from '@/src/config/documents'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { House, CircleUserRound, BookText, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'

const Navbare = () => {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const { data: session, status } = useSession();

    const navItems = [
        { href: '/', label: 'الواجهة', Icon: House },
        { href: '/profile', label: 'الحساب', Icon: CircleUserRound },
        { href: '/documents', label: 'الوثائق', Icon: BookText },
    ]

    const handleLogout = () => signOut({ callbackUrl: "/login" });

    return (
        <nav className=" print:hidden w-full fixed z-100 bg-black text-white top-0  h-20 flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300  transition-all">

            <Link href="/">
                <Image src={images.logo} priority width="157" height="40" className='  lg:w-50 lg:h-30 object-contain mt-4' alt='EpsLogo' />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden sm:flex items-center gap-8">
                {navItems.map(({ href, label, Icon }) => {
                    const isActive = pathname === href
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex flex-col items-center transition-all duration-150 ${isActive
                                ? 'scale-90 opacity-70'
                                : 'scale-100 opacity-100'
                                }`}
                        >
                            <Icon className='my-1' />
                            <p>{label}</p>
                        </Link>
                    )
                })}

                {/* 👈 Dynamic Authentication UI Check */}
                {status === 'loading' ? (
                    <div className="w-24 h-9 bg-gray-800 animate-pulse rounded-full" />
                ) : session ? (
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="cursor-pointer flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 transition text-white rounded-full text-sm"
                    >
                        <LogOut size={16} />
                        تسجيل الخروج
                    </button>
                ) : (
                    <Link href="/login">
                        <button className="cursor-pointer px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full">
                            تسجيل الدخول
                        </button>
                    </Link>
                )}
            </div>

            {/* Mobile Menu */}
            <div className={`${open ? 'hidden' : 'flex flex-row pt-5 justify-between align-middle'} absolute h-20 top-0 left-0 w-full bg-black text-white z-10 shadow-md py-4 flex-col items-start gap-2 px-8 text-sm md:hidden`} >
                {navItems.map(({ href, Icon }) => {
                    const isActive = pathname === href
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`transition-all duration-150 ${isActive ? 'scale-90 opacity-70' : 'scale-100 opacity-100'
                                }`}
                        >
                            <Icon className='my-1' />
                        </Link>
                    )
                })}

                {/* 👈 Dynamic Mobile Authentication UI Check */}
                {status !== 'loading' && (
                    session ? (
                        <button
                            onClick={handleLogout}
                            className="cursor-pointer my-0.5 px-4 py-2 bg-red-600 hover:bg-red-700 transition text-white rounded-full text-xs flex items-center gap-1"
                        >
                            <LogOut size={14} />
                            خروج
                        </button>
                    ) : (
                        <Link href="/login">
                            <button className="cursor-pointer my-0.5 px-6 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full text-sm">
                                دخول
                            </button>
                        </Link>
                    )
                )}
            </div>

        </nav>
    )
}

export default Navbare