'use client'
import { documentsConfig } from '@/src/config/documents';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react'
import CurvedLoop from '../../../components/CurvedLoop';
import StarBorder from '../../../components/StarBorder'


const CategoryPage = ({ params }: { params: Promise<{ category: string }> }) => {
  const { category } = React.use(params);
  const post = documentsConfig[category as keyof typeof documentsConfig];
  return (
    <div>
      <div className='flex flex-col md:flex-row lg:flex-row justify-center items-center gap-20 m-20 ' >
        {
          Object.values(post.files).map((doc) => {
            return (
              <div key={doc.id} className='flex flex-col gap-2 justify-center items-center ' >
                {
                  doc.type === 'static' ? (
                    <div className='flex flex-col gap-2 border border-gray-200 transition-transform duration-300 hover:scale-105  p-6 rounded-2xl' >
                      <a href={doc.src} download className='rounded-2xl px-2 py-1 bg-red-500 text-white font-semibold flex justify-center mb-2 w-30 transition-transform duration-300 hover:scale-105 my-2' >تحميل</a>
                      <a href={doc.src} target='_blanc'>
                        <Image src={doc.thumbnail} width="300" height="300" alt='barmaja' className='rounded-2xl ' />
                      </a>
                      <div>
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
                  ) : Object.entries(post.files).map(([key, doc]) => (
                    <div key={doc} >
                      <div className='flex flex-col gap-2 border border-gray-200 transition-transform duration-300 hover:scale-105  p-6 rounded-2xl' >
                        <Link key={doc} href={`/documents/${category}/${key}`}>
                          <Image src={post.image} alt='' width={300} height={300} className='rounded-2xl ' />
                        </Link>
                        <div>
                          <CurvedLoop
                            marqueeText="اصنع ✦  الوثائق  ✦ الخاصة  ✦  بك  ✦  بلمسة زر واحدة  ✦"
                            speed={1.6}
                            curveAmount={400}
                            direction="right"
                            interactive
                            className="custom-text-style"
                          />

                        </div>
                        <Link className='flex justify-center cursor-pointer' href={`/documents/${category}/${key}`}>
                          <StarBorder
                            as="button"
                            className="custom-class"
                            color="magenta"
                            speed="1s"
                            thickness={3}
                          >
                            اضغط هنا
                          </StarBorder>
                        </Link>
                      </div>
                    </div>
                  ))
                }
                <h1 className='text-xl font-semibold  mt-4' >{doc.name}</h1>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

export default CategoryPage
