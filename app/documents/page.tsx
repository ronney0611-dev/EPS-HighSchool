import { documentsConfig } from '@/src/config/documents';
import Image from 'next/image';
import Link from 'next/link';

const DocumentsPage = () => {
  
  return (
    <div dir="rtl" className='my-8 mx-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' >
      {
        //Object.values(documentsConfig) == when we have an object not an array.    
        Object.entries(documentsConfig).map(([key, doc]) => {
          return (
            <div key={doc.name} className=' p-4 flex flex-col justify-center items-center border border-gray-500 rounded-2xl transition-transform duration-300 hover:scale-105' >
              <Link href={`/documents/${key}`} className='flex flex-col justify-center items-center'>
                <Image src={doc.image} alt={doc.name} width={200} height={200} className='w-60 h-60 my-2 object-fill rounded-2xl' />
                <h1 className='text-white text-xl my-2 font-medium' >{doc.name}</h1>
              </Link>
              <p className='my-2 text-center text-gray-400' >{doc.description}</p>
            </div>
          )
        })
      }
    </div>
  )
}

export default DocumentsPage
