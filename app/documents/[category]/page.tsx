'use client'
import { documentsConfig, pic } from '@/src/config/documents';
import Image from 'next/image';
import * as React from 'react'

const CategoryPage = ({ params }: { params: Promise<{ category: string} > }) => {
  const { category} = React.use(params);
  const post = documentsConfig[category as keyof typeof documentsConfig];
  return (
    <div>
      <div className='flex gap-20 ' >
        {
          Object.values(post.files).map((doc)=>{
            return (
              <div key={doc.id } className='' >
                <a href={doc.src} download>Download</a>
                <a href={doc.src} target='_blanc'>
                  <Image src={doc.thumbnail} width="300" height="300" alt='barmaja' />
                </a>
                <h1>{doc.name}</h1>
                <p>{doc.description}</p>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

export default CategoryPage
