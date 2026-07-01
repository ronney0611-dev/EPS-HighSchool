'use client'

import { documentsConfig } from '@/src/config/documents';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import CurvedLoop from '../../../components/CurvedLoop';
import StarBorder from '../../../components/StarBorder';
import { useSession } from 'next-auth/react';

interface FileConfig {
  id: string;
  name: string;
  type: 'static' | 'interactive';
  description?: string;
  src?: string;
  thumbnail?: string;
  component: string | Record<string, string>;
}

const CategoryPage = ({ params }: { params: Promise<{ category: string }> }) => {
  const { category } = React.use(params);
  const { data: session, status } = useSession();

  const allCategories = { ...documentsConfig.teacherclass, ...documentsConfig.teacherNote };
  const post = allCategories[category as keyof typeof allCategories];

  if (status === "loading") {
    return <div className="text-center text-white my-20 font-medium">جاري تحميل الملفات...</div>;
  }

  // 🛑 1. Fallback if the category name doesn't exist at all
  if (!post) {
    return <div className="text-center text-red-500 my-20">الفئة المطلوبة غير موجودة</div>;
  }

  const teacherLevel = session?.user?.level || 'lycee';

  // 🛑 2. SECURITY GUARD: If the teacher's current level is NOT included 
  // in the config's allowed levels array, deny access immediately!
  if (!post.levels.includes(teacherLevel)) {
    return <div className="text-center text-red-500 my-20 font-medium">عذرًا، هذه الوثائق غير مخصصة لمستوى التعليم الابتدائي.</div>;
  }

  const fileEntries = Object.entries(post.files) as [string, FileConfig][];

  return (
    <div className=' bg-black text-white' >
      <div className='flex flex-col md:flex-row lg:flex-row justify-center items-center gap-20 m-4 lg:m-20' >
        {
          fileEntries.map(([key, doc]) => {
            return (
              <div key={key} className='flex flex-col gap-2 justify-center items-center' >
                {
                  doc.type === 'static' ? (
                    /* 📄 STATIC DOWNLOAD FILE CARDS */
                    <div className='flex flex-col gap-2 border border-gray-200 transition-transform duration-300 hover:scale-105 p-6 rounded-2xl' >
                      <a href={doc.src} download className='rounded-2xl px-2 py-1 bg-red-500 text-white font-semibold flex justify-center mb-2 w-30 transition-transform duration-300 hover:scale-105 my-2' >
                        تحميل
                      </a>
                      <a href={doc.src} target='_blank' rel="noreferrer">
                        <Image src={doc.thumbnail || post.image} width={300} height={300} alt={doc.name} className='rounded-2xl object-fill w-[300px] h-[300px]' />
                      </a>
                      <h2 className="text-white text-center text-lg mt-2 font-medium">{doc.name}</h2>
                      <div className="w-[300px]">
                        <CurvedLoop
                          marqueeText="حمل ✦  الوثائق  ✦ الخاصة  ✦  بك  ✦  بلمسة زر واحدة  ✦"
                          speed={1.6}
                          curveAmount={400}
                          direction="right"
                          interactive
                          className="custom-text-style"
                        />
                      </div>
                    </div>
                  ) : (
                    /* ⚡ INTERACTIVE DOCUMENT FORM CARDS */
                    <div className='flex flex-col gap-2 border border-gray-200 transition-transform duration-300 hover:scale-105 p-6 rounded-2xl' >
                      <Link href={`/documents/${category}/${key}`}>
                        <Image src={post.image} alt={doc.name} width={300} height={300} className='rounded-2xl object-fill w-[300px] h-[300px]' />
                      </Link>
                      <h2 className="text-white text-center text-lg mt-2 font-medium">{doc.name}</h2>
                      <div className="w-[300px]">
                        <CurvedLoop
                          marqueeText=" Education ✦  physique   ✦  et  ✦  sportive  ✦ EPS ✦"
                          speed={1.6}
                          curveAmount={400}
                          direction="left"
                          interactive
                          className="custom-text-style"
                        />
                      </div>
                      <Link className='flex justify-center cursor-pointer mt-2' href={`/documents/${category}/${key}`}>
                        <StarBorder
                          as="button"
                          className="custom-class cursor-pointer"
                          color="magenta"
                          speed="1s"
                          thickness={3}
                        >
                          اضغط هنا
                        </StarBorder>
                      </Link>
                    </div>
                  )
                }
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

export default CategoryPage;