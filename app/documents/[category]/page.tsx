'use client'
import { documentsConfig } from '@/src/config/documents';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react'


const CategoryPage = ({ params }: { params: Promise<{ category: string }> }) => {
  const { category } = React.use(params);
  const post = documentsConfig[category as keyof typeof documentsConfig];
  return (
    <div>
      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-20 m-20 ' >
        {
          Object.values(post.files).map((doc) => {
            return (
              <div key={doc.id} className='flex flex-col gap-2 justify-center items-center' >
                {
                  doc.type === 'static' ? (
                    <div className='flex flex-col gap-2' >
                      <a href={doc.src} download className='rounded-2xl px-2 py-1 bg-red-500 text-white font-semibold flex justify-center mb-2 w-30 transition-transform duration-300 hover:scale-105' >تحميل</a>
                      <a href={doc.src} target='_blanc'>
                        <Image src={doc.thumbnail} width="300" height="300" alt='barmaja' className='rounded-2xl transition-transform duration-300 hover:scale-105 ' />
                      </a>
                    </div>

                  ) : (
                    <Link href={`/documents/${category}/${doc.id}`} >
                      hello world
                    </Link>
                  )
                }
                <h1 className='text-xl font-medium  mt-2' >{doc.name}</h1>
                <p className='flex justify-center text-center my-2 text-gray-400' >{doc.description}</p>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

export default CategoryPage
