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
      <div className='flex gap-20 ' >
        {
          Object.values(post.files).map((doc) => {
            return (
              <div key={doc.id} className='' >
                {
                    doc.type === 'static' ? (
                      <div>
                        <a href={doc.src} download>Download</a>
                        <a href={doc.src} target='_blanc'>
                          <Image src={doc.thumbnail} width="300" height="300" alt='barmaja' />
                        </a>
                      </div>

                    ) : (
                      <Link href={`/documents/${category}/${doc.id}`} >
                        hello world
                      </Link>
                    )
                  }
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
