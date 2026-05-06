'use client'

import { images } from '@/src/config/documents'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { House, CircleUserRound, BookText } from 'lucide-react';

const Navbare = () => {
    const [open, setOpen] = useState(false)
    return (
        <nav className=" print:hidden w-full fixed z-100 bg-black text-white top-0  h-20 flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300  transition-all">

            <Link href="/">
                <Image src={images.logo} width="157" height="40" className='  lg:w-50 lg:h-30 object-contain mt-4' alt='EpsLogo' />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden sm:flex items-center gap-8">
                <Link className='flex flex-col items-center' href={"/"} >
                    <House className='my-1' />
                    <p>Home</p>
                </Link>
                <Link className='flex flex-col items-center' href="/profile">
                    <CircleUserRound className='my-1' />
                    <p>Profile</p>
                </Link>
                <Link className='flex flex-col items-center' href="/documents">
                    <BookText className='my-1' />
                    <p>Documents</p>
                </Link>

                <button className="cursor-pointer px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full">
                    Login
                </button>
            </div>
            {/*<button onClick={() => open ? setOpen(false) : setOpen(true)} aria-label="Menu" className="sm:hidden">
               
                <svg width="21" height="15" viewBox="0 0 21 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="21" height="1.5" rx=".75" fill="#426287" />
                    <rect x="8" y="6" width="13" height="1.5" rx=".75" fill="#426287" />
                    <rect x="6" y="13" width="15" height="1.5" rx=".75" fill="#426287" />
                </svg>
            </button>  */}


            {/* Mobile Menu */}
            <div className={`${open ? 'hidden' : 'flex flex-row pt-5 justify-between align-middle'} absolute h-20 top-0 left-0 w-full bg-black text-white z-10 shadow-md py-4 flex-col items-start gap-2 px-8 text-sm md:hidden`} >

                <Link href={"/"} ><House className='my-1' /></Link>
                <Link href="/profile"><CircleUserRound className='my-1' /></Link>
                <Link href="/documents"><BookText className='my-1' /></Link>

                <button className="cursor-pointer my-0.5 px-6 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full text-sm">
                    Login
                </button>
            </div>

        </nav>
    )
}

export default Navbare
